# Documentação Técnica: Aplicativo de Adesão

Esta documentação detalha a arquitetura, as funcionalidades implementadas, e o funcionamento das integrações do Aplicativo de Adesão com o Power Automate e Microsoft Lists.

---

## 1. Visão Geral da Arquitetura

O sistema adota uma arquitetura em duas camadas (Frontend e Backend Intermediário), integrando-se via Webhook a uma arquitetura de nuvem Microsoft (Power Automate e SharePoint/Lists).

*   **Frontend**: Aplicação SPA (Single Page Application) desenvolvida com **React 19**, **Vite** e **TypeScript**, utilizando **Tailwind CSS** para estilização e **Framer Motion** para animações e transições entre as etapas do formulário.
*   **Backend (Proxy/BFF)**: Servidor Node.js criado com **Express**, responsável por autenticação simples, gerenciamento de usuários, persistência local de submissões em arquivos JSON (como fallback/registro local) e orquestração do envio principal (payload) para o Power Automate.
*   **Integração e Armazenamento em Nuvem**: Um fluxo do **Power Automate** recebe os dados via requisição HTTP e interage com as APIs do **Microsoft Lists** (SharePoint) para criação de itens e processamento de arquivos (imagens).

---

## 2. Tecnologias Utilizadas

*   **Linguagem**: TypeScript
*   **Frontend**: React, Vite, Tailwind CSS, Lucide React (ícones), Framer Motion.
*   **Backend**: Node.js, Express, tsx/esbuild (para execução e build do servidor).
*   **Armazenamento Local (Backend)**: Sistema de arquivos (JSON) em pasta `/data`.
*   **Nuvem**: Microsoft Power Automate, Microsoft Lists / SharePoint.

---

## 3. Funcionalidades do Frontend

O aplicativo foi construído focado na usabilidade em campo, com recursos robustos de captura e validação.

### 3.1. Controle de Acessos e Autenticação
O sistema implementa autenticação baseada em roles (papéis), onde cada perfil tem visões distintas da aplicação:
*   **`dev` (Desenvolvedor)**: Perfil com acesso total e in-excluível.
*   **`admin` (Administrador)**: Acesso ao Dashboard Administrativo, podendo cadastrar/remover novos usuários e visualizar todos os registros (submissões) feitos.
*   **`colaborador` (Técnico em Campo)**: Acesso restrito ao preenchimento do formulário de adesão, otimizado para navegação mobile.

### 3.2. Estrutura do Formulário (Steps)
O formulário é dividido em etapas (Wizard) para melhorar a conversão e experiência:
1.  **Dados Pessoais (`StepPersonal.tsx`)**: Captura Nome, RG, CPF, Data de Nascimento, E-mail, Estado Civil, Nome do Cônjuge, etc.
2.  **Dados da Visita (`StepVisit.tsx`)**: Informações operacionais (ex: Possui CadÚnico?, Presença de Cães, Dificuldade de Acesso, Tipo de Construção).
3.  **Dados Técnicos (`StepTechnical.tsx`)**: Captura do número da Matrícula.
4.  **Endereço (`StepAddress.tsx`)**: 
    *   Possui rotina inteligente de Autocomplete e Fuzzy Search (busca tolerante a erros de digitação) para preenchimento ágil.
    *   **Geolocalização Automática**: Assim que esta aba é acessada, o app tenta recuperar silenciosamente a Latitude e Longitude do dispositivo (GPS) via API do navegador.
    *   **Higienização**: Os dados digitados são automaticamente convertidos para CAIXA ALTA e sem acentos, mantendo a base de dados padronizada.
5.  **Anexos / Fotos (`StepAttachments.tsx`)**: Módulo de upload ou captura da câmera de fotos como Fachada, Frente e Verso do Documento, CadÚnico, Folha de Adesão e Fotos extras.

### 3.3. Processamento de Imagens
Utilizando o componente `ImageUpload`, o frontend permite tirar a foto pela câmera ou enviar um arquivo da galeria. 
Antes de transmitir, a foto é convertida para uma **String Base64**. Isso permite que todo o formulário (textos + imagens) viaje em uma única chamada de API (JSON Payload) para o backend, em vez de exigir uploads multipart complexos.

---

## 4. Funcionamento do Backend (`server.ts`)

O arquivo `server.ts` serve dois propósitos essenciais: gerenciamento local e formatação para a Nuvem.

1.  **Limites e Parsing**: O limite do payload JSON no Express foi configurado para `50mb` (via `express.json({ limit: "50mb" })`) para garantir que o tráfego de múltiplas imagens em Base64 não gere erros de limite excedido.
2.  **Gerenciamento Local (Data)**: Salva e lê arquivos JSON (`users.json` e `submissions.json`) simulando um banco de dados local. Os dados são lidos/gravados da pasta `./data`.
3.  **Mapeamento de Nomes Internos (Internal Names)**: 
    Quando o usuário clica em "Enviar", o backend intercepta o JSON gerado pelo React e faz um mapeamento 1:1, criando chaves com o **nome exato da coluna interna do SharePoint**.
    *Exemplo:* O campo `data.folhaAdesao` é convertido em `"FOLHADEADES_x00c3_O"`.
    Isto é crucial pois torna o Power Automate "agnóstico"; o esquema JSON que o Automate recebe já é perfeitamente compreendido pela API do SharePoint na hora de criar o item.
4.  **Envio (Proxy)**: O backend executa a chamada POST final para a URL do *Webhook* do Power Automate configurada no `.env`.

---

## 5. Integração com Power Automate e Microsoft Lists

Esta é a etapa final que consolida as informações na nuvem Microsoft. A integração precisa contornar uma limitação nativa do SharePoint: *não é possível enviar imagens para colunas do tipo "Imagem" usando a ação padrão de criar item.*

### 5.1. Fluxo de Execução no Power Automate
1.  **Gatilho (Trigger HTTP)**: Recebe o POST do backend. Como os nomes já vêm formatados, o JSON Schema é limpo e direto.
2.  **Criação do Registro (Create Item)**: 
    *   Cria-se um novo item na Lista do SharePoint apenas com os dados de Texto (Nome, Endereço, GPS, etc.).
    *   As colunas que são de Fotos são ignoradas/deixadas em branco nessa etapa inicial.
3.  **Processamento de Imagens**: 
    Para cada foto (Base64) enviada no Payload (ex: `FOTODAFRENTEDODOCUMENTO0`), o Power Automate faz o seguinte:
    *   **Verifica (Condition)**: Checa se a variável da foto contém dados (`is not equal to null`). Se for uma foto opcional e não tiver sido enviada, o fluxo pula este bloco para não gerar erro.
    *   **Decodifica e Salva (Create File)**: Utiliza a expressão lógica `dataUriToBinary(triggerBody()?['NOME_DO_CAMPO'])` para converter a string de volta para uma imagem física (.jpg) e salva numa pasta/biblioteca do SharePoint. Nomeia-se o arquivo atrelando ao ID do item recém-criado (ex: `Fachada_123.jpg`).
    *   **Vincula à Coluna (HTTP Request)**: Dispara uma requisição REST POST interna para a API do SharePoint (`ValidateUpdateListItem`), atualizando a coluna de imagem do item com as propriedades e o link relativo (ServerRelativeUrl) do arquivo recém-criado na etapa anterior.

### 5.2. Mapeamento de Colunas (De -> Para)
Lista dos principais campos e seus nomes internos exigidos na comunicação:
*   `FOTODAFRENTEDODOCUMENTO0` -> Imagem da Frente do Documento
*   `FOTODOVERSODODOCUMENTO` -> Imagem do Verso do Documento
*   `FOTOCADUNICO` -> Imagem do CadÚnico
*   `FACHADA` -> Imagem da Fachada
*   `FOLHADEADES_x00c3_O` -> Imagem da Folha de Adesão
*   `OUTRAS` (e `OUTRAS0`, `OUTRAS1`) -> Fotos adicionais (1, 2, 3)
*   `Latitude0` e `Longitude0` -> Coordenadas de GPS
*   `TEMCAD_x00da_NICO_x003f_` -> Resposta da visita "Tem CadÚnico?"

---

## 6. Considerações Finais e Manutenção

Para **adicionar um novo campo** no sistema de ponta a ponta, é imperativo seguir a cadeia completa:
1.  **React/Typescript**: Adicionar o campo na interface (`types.ts`), no estado inicial (`App.tsx`) e na UI (step correspondente).
2.  **Microsoft Lists**: Criar a nova coluna na lista e descobrir o seu *Internal Name* gerado (verificando a URL ao ir nas configurações da coluna).
3.  **Backend (`server.ts`)**: Adicionar o mapeamento apontando o dado do frontend para o Internal Name do SharePoint.
4.  **Power Automate**: Atualizar o schema do Trigger HTTP para incluir a nova chave e mapeá-la na ação de "Create Item". Se for uma nova imagem, um novo bloco de *Condition + Create File + HTTP Request* deverá ser montado.

---
