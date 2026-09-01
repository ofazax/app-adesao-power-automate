import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const dataDir = path.join(process.cwd(), 'data');
const usersFile = path.join(dataDir, 'users.json');
const submissionsFile = path.join(dataDir, 'submissions.json');

// Initialize users.json and submissions.json
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([
    { username: 'admin', password: '123', name: 'Desenvolvedor', role: 'dev' }
  ], null, 2));
}
if (!fs.existsSync(submissionsFile)) {
  fs.writeFileSync(submissionsFile, JSON.stringify([], null, 2));
}

const getUsers = () => {
  try {
    return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  } catch {
    return [];
  }
};

const saveUsers = (users: any) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

const getSubmissions = () => {
  try {
    return JSON.parse(fs.readFileSync(submissionsFile, 'utf8'));
  } catch {
    return [];
  }
};

const saveSubmissions = (submissions: any) => {
  fs.writeFileSync(submissionsFile, JSON.stringify(submissions, null, 2));
};
async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload size limit for base64 images
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Routes
  
  // Login
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find((u: any) => u.username === username && u.password === password);
    if (user) {
      res.json({ success: true, name: user.name, role: user.role });
    } else {
      res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
    }
  });

  // Get users
  app.get("/api/users", (req, res) => {
    const users = getUsers().map((u: any) => ({ username: u.username, name: u.name, role: u.role }));
    res.json({ success: true, users });
  });

  // Create user
  app.post("/api/users", (req, res) => {
    const { username, password, name, role } = req.body;
    const users = getUsers();
    if (users.find((u: any) => u.username === username)) {
      return res.status(400).json({ success: false, message: 'Nome de usuário já existe' });
    }
    users.push({ username, password, name, role: role || 'colaborador' });
    saveUsers(users);
    res.json({ success: true, message: 'Usuário criado com sucesso' });
  });

  // Delete user
  app.delete("/api/users/:username", (req, res) => {
    const { username } = req.params;
    let users = getUsers();
    const userToDelete = users.find((u: any) => u.username === username);
    
    if (userToDelete && userToDelete.role === 'dev') {
      return res.status(400).json({ success: false, message: 'Não é possível excluir o Desenvolvedor' });
    }
    
    users = users.filter((u: any) => u.username !== username);
    saveUsers(users);
    res.json({ success: true, message: 'Usuário removido com sucesso' });
  });

  // Get submissions for a specific user
  app.get("/api/submissions/:username", (req, res) => {
    const { username } = req.params;
    const users = getUsers();
    const user = users.find((u: any) => u.username === username);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    const submissions = getSubmissions();
    const userSubmissions = submissions.filter((s: any) => s["AGENTE"] === user.name);
    
    res.json({ success: true, submissions: userSubmissions });
  });
  app.post("/api/submit", async (req, res) => {
    try {
      const data = req.body;

      let webhookUrl = process.env.POWER_AUTOMATE_WEBHOOK_URL;

      // Fallback: If the environment variable lacks the 'sig=' parameter (e.g. truncated in Secrets UI),
      // try to read it directly from .env.example where the user might have pasted the full URL.
      if (!webhookUrl || !webhookUrl.includes('sig=')) {
        try {
          const fs = await import('fs');
          const dotenv = await import('dotenv');
          if (fs.existsSync('.env.example')) {
            const exampleEnv = dotenv.parse(fs.readFileSync('.env.example'));
            if (exampleEnv.POWER_AUTOMATE_WEBHOOK_URL && exampleEnv.POWER_AUTOMATE_WEBHOOK_URL.includes('sig=')) {
              webhookUrl = exampleEnv.POWER_AUTOMATE_WEBHOOK_URL;
              console.log("Using full Webhook URL from .env.example (contains sig parameter).");
            }
          }
        } catch (e) {
          console.warn("Failed to read from .env.example", e);
        }
      }

      if (!webhookUrl) {
        console.warn("No POWER_AUTOMATE_WEBHOOK_URL configured. Data not sent to Microsoft Lists.");
        // We still return success so the UI can proceed in dev/test mode.
        return res.json({ success: true, message: "Simulated submission successful (Webhook URL not configured)" });
      }

      webhookUrl = webhookUrl.replace(/^["']|["']$/g, '').trim();

      // Mapeamento para os nomes internos exatos da lista SharePoint original
      const mappedPayload = {
        "Data": data.data || "",
        "MATR_x00cd_CULA": data.matricula || "",
        "IDENTIFICADOR": data.identificador || "",
        "N_x00da_MERODOHIDR_x00d4_METRO": data.numeroHidrometro || "",
        "N_x00da_MERODEECONOMIAS": data.numeroEconomias || "",
        "ENTREN_x00da_MEROS": data.entreNumeros || "",
        "TIPODELOGRADOURO": data.tipoLogradouro || "",
        "LOGRADOURO": data.logradouro || "",
        "N_x00da_MERO": data.numero || "",
        "TIPODECOMPLEMENTO": data.tipoComplemento || "",
        "COMPLEMENTO": data.complemento || "",
        "ZEIS": data.zeis === "Outras" && data.outrasZeis ? data.outrasZeis : (data.zeis || ""),
        "BAIRRO": data.bairro || "",
        "CIDADE": data.cidade || "",
        "NOMECOMPLETO": data.nomeCompleto || "",
        "RG": data.rg || "",
        "CPF": data.cpf || "",
        "DATADENASCIMENTO": data.dataNascimento || "",
        "TELEFONE": data.telefone || "",
        "EMAIL": data.email || "",
        "TIPODEADES_x00c3_O": data.tipoAdesao || "",
        "PAVIMENTOINTERNO": data.pavimentoInterno || "",
        "PAVIMENTOEXTERNO": data.pavimentoExterno || "",
        "SITUA_x00c7__x00c3_ODEESGOTAMENT": data.situacaoEsgotamento || "",
        "TIPODELIGA_x00c7__x00c3_O": data.tipoLigacao || "",
        "AGENTE": data.agente || "",
        "FOTOCADUNICO": data.fotoCadunico || null,
        "AGENDAMENTODAOBRA": data.agendamentoObra || "",
        "OBSERVA_x00c7__x00d5_ES": data.observacoes || "",
        "FOTODAFRENTEDODOCUMENTO0": data.frenteDocumento || null,
        "FOTODOVERSODODOCUMENTO": data.versoDocumento || null,
        "FACHADA": data.fachada || null,
        "FOLHADEADES_x00c3_O": data.folhaAdesao || null,
        "OUTRAS": data.outras0 || null,
        "OUTRAS0": data.outras1 || null,
        "OUTRAS1": data.outras2 || null,
        "TEMCAD_x00da_NICO_x003f_": data.temCadunico || "",
        "STATUSDAVISITA": data.statusVisita || "",
        "Latitude0": data.latitude || "",
        "Longitude0": data.longitude || ""
      };

      // Send to Power Automate / Logic Apps Webhook
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mappedPayload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Webhook failed with status ${response.status}: ${text}`);
      }

      // Salva localmente
      const submissions = getSubmissions();
      submissions.push({
        ...mappedPayload,
        _id: Date.now().toString(),
        _timestamp: new Date().toISOString()
      });
      saveSubmissions(submissions);

      res.json({ success: true, message: "Data successfully sent to Microsoft Lists and saved locally." });
    } catch (error: any) {
      console.error("Submission Error:", error);
      res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
