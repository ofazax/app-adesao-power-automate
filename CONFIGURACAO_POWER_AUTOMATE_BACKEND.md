# Configuração do Power Automate como Backend (API)

Este documento descreve o passo a passo para criar as listas no SharePoint e os fluxos no Power Automate que servirão de banco de dados e API para o aplicativo de Adesão.

---

## 1. Criar a Lista de Usuários no SharePoint (Microsoft Lists)

Primeiro, você precisa de um local para armazenar os usuários que terão acesso ao aplicativo.

1. Acesse o **SharePoint** ou **Microsoft Lists**.
2. Crie uma **Nova Lista em Branco** chamada `UsuariosAppAdesao` (ou o nome que preferir).
3. A lista terá uma coluna padrão chamada **Title** (Título). Use essa coluna para salvar o **Nome Completo** do usuário.
4. Adicione as seguintes colunas:
   - **Username** (Linha única de texto) -> Para o login (ex: `joao.silva`).
   - **Password** (Linha única de texto) -> Para a senha.
   - **Role** (Opção / Choice) -> Com as opções exatas: `colaborador`, `admin`, `chefe`.

Adicione um usuário manualmente para testar o primeiro login (ex: Título: `Brunno`, Username: `admin`, Password: `123`, Role: `admin`).

---

## 2. Criar os Fluxos no Power Automate

Você precisará criar **2 fluxos** separados. O primeiro é dedicado e isolado para o **Login** (garantindo segurança e que possa ser reutilizado por outros apps futuramente). O segundo é a **API Unificada**, que concentrará todas as operações administrativas do app (listar/criar/deletar usuários e buscar os cadastros preenchidos).

O gatilho (Trigger) de ambos será: **Quando uma solicitação HTTP é recebida** (When an HTTP request is received).

### Fluxo 1: Login Seguro (`VITE_PA_LOGIN_WEBHOOK_URL`)

1. **Gatilho**: Quando uma solicitação HTTP é recebida.
   - **Método**: POST
   - **Esquema JSON**:
     ```json
     {
       "type": "object",
       "properties": {
         "username": { "type": "string" },
         "password": { "type": "string" }
       }
     }
     ```
2. **Ação**: Obter itens (Get items) do SharePoint (aponte para a lista `UsuariosAppAdesao`).
   - **Consulta de Filtro (OData Filter Query)**: 
     `Username eq '@{triggerBody()?['username']}' and Password eq '@{triggerBody()?['password']}'`
3. **Ação**: Condição (Condition).
   - Verifique se a função `length(outputs('Get_items')?['body/value'])` é *maior que* `0`.
   - **Se SIM (Verdadeiro)**:
     - Adicione a ação **Resposta (Response)**. Código: `200`.
     - Corpo (Body):
       ```json
       {
         "name": "@{outputs('Get_items')?['body/value'][0]['Title']}",
         "role": "@{outputs('Get_items')?['body/value'][0]['Role/Value']}"
       }
       ```
   - **Se NÃO (Falso)**:
     - Adicione a ação **Resposta (Response)**. Código: `401`.
     - Corpo (Body): `{ "error": "Credenciais inválidas" }`

4. **Salve**, copie a **URL HTTP POST** gerada no gatilho e cole na variável `VITE_PA_LOGIN_WEBHOOK_URL` do seu `.env`.

---

### Fluxo 2: API Unificada - Adesão (`VITE_PA_API_WEBHOOK_URL`)

Este fluxo concentra as requisições para gerenciar usuários e visualizar cadastros, roteando a execução através da variável `action` enviada no corpo da requisição.

1. **Gatilho**: Quando uma solicitação HTTP é recebida.
   - **Método**: POST
   - **Esquema JSON**:
     ```json
     {
       "type": "object",
       "properties": {
         "action": { "type": "string" },
         "username": { "type": "string" },
         "password": { "type": "string" },
         "name": { "type": "string" },
         "role": { "type": "string" },
         "agent": { "type": "string" }
       }
     }
     ```

2. **Ação**: Controle de Opção (Switch).
   - **Chave (On)**: Vá na aba *Expressão* e insira `triggerBody()?['action']` (ou apenas selecione a variável `action` da lista dinâmica).

Adicione os seguintes Casos (Cases) dentro do Switch:

#### Caso `LIST_USERS`
1. **Ação**: Obter itens (Get items) da lista `UsuariosAppAdesao`.
   - *Consulta de Filtro*: (Deixe em branco, pois queremos puxar todos os usuários).
2. **Ação**: Selecionar (Select) - (Categoria: Operações de Dados).
   - **De (From)**: Vá na aba *Expressão* e digite `outputs('Obter_itens')?['body/value']` (Atenção: substitua 'Obter_itens' pelo nome exato da sua ação anterior, trocando os espaços por sublinhados `_`).
   - **Mapeamento (Map)**:
     - `name` : (Escolha `Title` na lista dinâmica)
     - `username` : (Escolha `Username` na lista dinâmica)
     - `role` : (Escolha `Role Value` na lista dinâmica)
3. **Ação**: Resposta (Response).
   - **Código**: `200`
   - **Corpo (Body)**: Coloque a Saída (Output) gerada pela ação de Selecionar.

#### Caso `CREATE_USER`
1. **Ação**: Obter itens (Get items) da lista `UsuariosAppAdesao`.
   - *Consulta de Filtro*: `Username eq '@{triggerBody()?['username']}'` (Isto busca se já existe alguém com o mesmo login).
2. **Ação**: Condição (Condition).
   - **Lado Esquerdo**: Vá na aba *Expressão* e cole `length(outputs('Obter_itens')?['body/value'])` (novamente, ajuste o nome da ação se estiver em inglês).
   - **Meio**: `é igual a` (is equal to).
   - **Lado Direito**: `0`
   - **Se Sim (Verdadeiro)**:
     - Adicione a ação **Criar item (Create item)** na lista `UsuariosAppAdesao`, preenchendo os campos com as variáveis do gatilho (`name` vai em Title, `username` em Username, etc).
     - Adicione a ação **Resposta**, Código `200`.
   - **Se Não (Falso)**:
     - Adicione a ação **Resposta**, Código `400`.
     - Corpo: `{"message": "Usuário já existe"}`

#### Caso `DELETE_USER`
1. **Ação**: Obter itens (Get items) da lista `UsuariosAppAdesao`.
   - *Consulta de Filtro*: `Username eq '@{triggerBody()?['username']}'`
2. **Ação**: Excluir item (Delete item).
   - Ao selecionar o `ID` retornado pelo "Obter itens", o Power Automate automaticamente envolverá essa ação num loop **Aplicar a cada (Apply to each)**.
3. **Ação**: Resposta (Response).
   - Coloque esta ação **fora e embaixo** do loop (Aplicar a cada).
   - **Código**: `200`

#### Caso `GET_SUBMISSIONS`
1. **Ação**: Obter itens (Get items).
   - **Atenção:** Aponte para a sua **Lista de Adesões original** (a que armazena os cadastros do app), e *não* para a lista de usuários!
   - *Consulta de Filtro*: `AGENTE eq '@{triggerBody()?['agent']}'` (Verifique se o nome interno da sua coluna na lista do SharePoint é realmente `AGENTE`. Se for diferente, ajuste na fórmula).
2. **Ação**: Resposta (Response).
   - **Código**: `200`
   - **Corpo (Body)**: Vá na aba *Expressão* e coloque `outputs('Obter_itens')?['body/value']`.

---

3. **Salve o Fluxo**.
4. Copie a URL gerada no Gatilho inicial e cole em `VITE_PA_API_WEBHOOK_URL`.

---

### Passo Final no App

Após colar as 2 novas URLs (`VITE_PA_LOGIN_WEBHOOK_URL` e `VITE_PA_API_WEBHOOK_URL`) no seu arquivo `.env`, você pode:
1. Rodar a aplicação (`npm run dev`) ou fazer a build de produção.
2. Fazer o Login com o usuário que você inseriu manualmente no Passo 1 para verificar se tudo funcionou!
