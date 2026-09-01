# Integração: Aplicativo de Adesão ↔ Power Automate ↔ Microsoft Lists

Este documento detalha o fluxo de dados e o funcionamento da integração entre o aplicativo React (frontend) e o Microsoft Lists, passando pelo Power Automate como orquestrador.

## 1. Arquitetura Geral

O fluxo de dados da solução ocorre em três etapas principais:

1. **Frontend (React/Vite)**: O usuário preenche o formulário e tira fotos (capturadas ou enviadas). Antes de enviar, as imagens são convertidas para o formato de string **Base64**.
2. **Backend Intermediário (server.ts)**: Um servidor local em Express (Node.js) intercepta o envio do formulário e faz o envio de todo o bloco de dados (JSON) via requisição HTTP POST para a URL (Webhook) do Power Automate. O backend foi configurado para enviar os dados utilizando **exatamente os Nomes Internos** (Internal Names) da lista do SharePoint.
3. **Power Automate**: Recebe o JSON. Os textos são gravados diretamente como colunas num novo item do SharePoint (Create item), e as fotos são decodificadas, salvas na biblioteca de arquivos e vinculadas às colunas de Imagem via requisição HTTP interna (API REST).

---

## 2. Estrutura do Backend (`server.ts`)

O arquivo `server.ts` foi projetado para:
*   Aumentar o limite do Payload (`50mb`) para suportar o tráfego de imagens grandes codificadas em Base64.
*   Formatar o objeto enviado pelo app mapeando-o 1:1 para os Nomes Internos que o Power Automate espera para o SharePoint.

Exemplo de mapeamento:
```typescript
        "FACHADA": data.fachada || "",
        "FOLHADEADES_x00c3_O": data.folhaAdesao || "",
        "OUTRAS": data.outras0 || "",
        "OUTRAS0": data.outras1 || "",
        "OUTRAS1": data.outras2 || "",
        "Latitude0": data.latitude || "",
        "Longitude0": data.longitude || ""
```
Dessa forma, a integração no Power Automate não precisa lidar com nomes visuais das colunas. As variáveis geradas pelo JSON Schema já trazem o nome exato.

---

## 3. Fluxo no Power Automate

O fluxo no Automate precisa contornar uma limitação sistêmica do SharePoint: **não é possível preencher colunas do tipo "Imagem" ou "Miniatura" diretamente utilizando a ação padrão "Criar Item".**

### A. Gatilho (Trigger)
*   **Ação:** *When a HTTP request is received* (Quando uma solicitação HTTP é recebida)
*   O JSON Schema importado gera variáveis idênticas aos Nomes Internos (ex: `triggerBody()?['FOTODAFRENTEDODOCUMENTO0']`).

### B. Criação do Item Principal
*   **Ação:** *Create item*
*   Conectado à lista de destino.
*   Apenas os dados de texto, data e números são mapeados.
*   Todas as colunas de fotos **devem ser deixadas em branco** nesta etapa.

### C. Processamento de Coluna de Imagens
Para fazer as fotos aparecerem nas colunas corretas (e não apenas como anexos genéricos), duas ações precisam rodar **para cada foto enviada**:

1.  **Criar o arquivo físico (Create file):**
    *   **Folder Path:** Caminho desejado
    *   **File Name:** Nome padronizado utilizando a variável do ID. (ex: `Fachada_@{outputs('Create_item')?['body/ID']}.jpg`).
    *   **File Content:** Usa a expressão `dataUriToBinary(triggerBody()?['NOME_DO_CAMPO_AQUI'])` para reverter o Base64. *Ex: `dataUriToBinary(triggerBody()?['FOTODAFRENTEDODOCUMENTO0'])`*.

2.  **Vincular a foto à coluna do SharePoint (Send an HTTP request to SharePoint):**
    *   Usa o método **POST**.
    *   **Uri:** `_api/web/lists/GetById('7F46C665-ACF4-44CD-A60B-EB51024D4E43')/items(@{outputs('Create_item')?['body/ID']})/ValidateUpdateListItem` *(Substitua a GUID caso mude de lista)*.
    *   **Body (Exemplo):**
        ```json
        {
          "formValues": [
            {
              "FieldName": "FOTODAFRENTEDODOCUMENTO0",
              "FieldValue": "{\"type\":\"thumbnail\",\"fileName\":\"Frente_@{outputs('Create_item')?['body/ID']}.jpg\",\"serverRelativeUrl\":\"/CAMINHO_COMPLETO_NO_SHAREPOINT/Frente_@{outputs('Create_item')?['body/ID']}.jpg\"}"
            }
          ]
        }
        ```

### D. Tratamento de Erros e Fotos Opcionais (Condição)
Se um técnico não tirar uma foto opcional, o campo em Base64 virá vazio e fará o fluxo falhar se tentar gravar a imagem.
*   **Solução:** Colocar os blocos de fotos em **Conditions**.
*   **Lógica:** Variável HTTP (ex: `FOTODOVERSODODOCUMENTO`) -> `is not equal to` -> expressão: `null`.
*   O bloco só roda se a foto realmente vier preenchida.

---

## 4. Consulta de Nomes Internos Utilizados
Abaixo alguns nomes internos vitais enviados pelo backend que mapeiam diretamente para a estrutura da Lista original.

* `FOTODAFRENTEDODOCUMENTO0` -> Frente
* `FOTODOVERSODODOCUMENTO` -> Verso
* `FOTOCADUNICO` -> CadÚnico
* `FACHADA` -> Fachada
* `FOLHADEADES_x00c3_O` -> Adesão
* `OUTRAS` -> Foto 1
* `OUTRAS0` -> Foto 2
* `OUTRAS1` -> Foto 3
* `Latitude0` e `Longitude0` -> GPS (Textos normais gravados via Create item)
* `TEMCAD_x00da_NICO_x003f_` -> Tem CadÚnico?
