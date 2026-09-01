# Aplicativo de Adesão 📝

Este é um aplicativo web desenvolvido em **React**, **Vite** e **TypeScript** no frontend, com um servidor intermediário em **Node.js (Express)** no backend (`server.ts`). 
O principal objetivo da aplicação é coletar dados de formulários e fotos em campo, formatá-los e enviá-los para um fluxo do **Power Automate**, que por sua vez consolida tudo no **Microsoft Lists**.

---

## ✨ Funcionalidades Principais

* **Controle de Acessos**: O sistema possui os papéis `dev` (desenvolvedor invisível com poder total), `admin` (gestão e visualização no Dashboard) e `colaborador` (acesso exclusivo ao formulário na rua).
* **Validações e Higienização**: Endereços digitados são convertidos para caixa alta sem acentuação e bloqueiam caracteres especiais (Sanitization). Além disso, os campos possuem validação avançada (como checagem estrutural completa de E-mail).
* **Pesquisa de Endereço Inteligente (Fuzzy Search)**: Autocomplete inteligente para Logradouro e Bairro que tolera erros de digitação (typos) e sugere os endereços da base de dados fornecida.
* **Geolocalização Automática**: Captura coordenadas de GPS (Lat/Long) silenciosamente em background ao acessar a aba de Endereço, garantindo a posição da visita de forma rápida e limpa para o operador.
* **Integração Nível Banco de Dados**: O backend é arquitetado para mapear dados exatamente para os Nomes Internos nativos do SharePoint (`FACHADA`, `MATR_x00cd_CULA`), simplificando a construção de automações na nuvem.

---

## 🚀 Como rodar o projeto localmente

### 1. Pré-requisitos
*   [Node.js](https://nodejs.org/) instalado na máquina.
*   Git (opcional, para controle de versão).

### 2. Instalação
Clone ou baixe o projeto para a sua máquina. Abra o terminal na pasta raiz (`APP_Adesao`) e rode o comando para instalar as dependências:
```bash
npm install
```

### 3. Configuração de Variáveis de Ambiente
Para que o envio de dados funcione, o projeto precisa saber para qual URL do Power Automate ele deve mandar o JSON.
1. Crie um arquivo chamado `.env` na raiz do projeto (mesmo nível que o `package.json`).
2. Adicione a seguinte linha, colando a URL do seu gatilho HTTP do Power Automate:
```env
POWER_AUTOMATE_WEBHOOK_URL="https://prod-XX.brazilsouth.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?api-version=2016-06-01&sp=...&sv=1.0&sig=SEU_CODIGO_AQUI"
```

### 4. Executando em Modo de Desenvolvimento
Com as dependências instaladas e o `.env` configurado, inicie o servidor:
```bash
npm run dev
```
O aplicativo abrirá no navegador (geralmente em `http://localhost:3000`). Sempre que você salvar um arquivo `.ts` ou `.tsx`, a página será atualizada automaticamente.

---

## 🛠️ Como adicionar um novo campo no formulário

Devido à arquitetura da aplicação, sempre que você precisar adicionar uma nova pergunta ou campo de foto, precisará seguir esta "receita de bolo" em 5 etapas para que o dado viaje desde a tela até o SharePoint.

**Exemplo: Queremos adicionar o campo "Nome do Cônjuge"**

1. **Atualize as Tipagens (`src/types.ts`):**
   Adicione o campo na interface principal para que o TypeScript saiba que ele existe.
   ```typescript
   export interface FormState {
     // ... outros campos
     nomeConjuge: string;
   }
   ```

2. **Crie o Estado Inicial (`src/App.tsx`):**
   No objeto `initialState`, adicione o seu campo vazio.
   ```typescript
   const initialState: FormState = {
     // ... outros campos
     nomeConjuge: '',
   };
   ```

3. **Crie o Input Visual (ex: `src/components/steps/StepPersonal.tsx`):**
   Vá no componente da etapa desejada e adicione o campo na tela, conectando-o ao estado global usando os `value` e `onChange` que vêm nas `props`.
   ```tsx
   <input 
      value={data.nomeConjuge}
      onChange={e => onChange({ nomeConjuge: e.target.value })}
   />
   ```

4. **Mapeie no Backend (`server.ts`):**
   No objeto `mappedPayload`, relacione a variável do React com o **Nome Interno (Internal Name)** da coluna correspondente no SharePoint.
   ```typescript
   const mappedPayload = {
     // ... outros mapeamentos
     "NOMEDOCONJUGE_x003f": data.nomeConjuge || "",
   }
   ```

5. **Atualize o Microsoft Lists e o Automate:**
   Crie a coluna no Microsoft Lists e verifique qual *Nome Interno* o SharePoint gerou para ela. Utilize-o no `server.ts` (passo 4). Por fim, não se esqueça de atualizar o esquema JSON no Power Automate para prever a chegada dessa nova variável, permitindo mapeá-la na ação "Create Item".

---

## 📦 Build e Deploy para Produção

O comando `npm run dev` serve apenas para programação. Para colocar a aplicação no ar de forma otimizada (produção), você deve gerar a versão final.

1. **Gerar os arquivos estáticos:**
   ```bash
   npm run build
   ```
   Isso criará uma pasta chamada `/dist` com todo o seu frontend minificado.

2. **Rodar o servidor em produção:**
   O `server.ts` já está preparado para identificar quando **não** está em desenvolvimento. Ao rodá-lo, ele passará a servir os arquivos estáticos da pasta `/dist` na porta `3000`.

---

## 📚 Documentação Complementar

Se você precisar entender os fluxos avançados ou verificar configurações específicas (como mapeamento e envio de Fotos em Base64), consulte o documento técnico de integração:

👉 **[INTEGRACAO_POWER_AUTOMATE.md](./INTEGRACAO_POWER_AUTOMATE.md)**
