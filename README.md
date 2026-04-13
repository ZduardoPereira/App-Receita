# FitPlan — App de Dieta e Treino

Aplicativo mobile completo para geração de planos alimentares personalizados, rastreamento de peso e gerenciamento de treinos, desenvolvido com React Native (Expo) + Node.js + PostgreSQL.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Como Iniciar](#como-iniciar)
  - [Banco de Dados](#1-banco-de-dados)
  - [Backend](#2-backend)
  - [Frontend](#3-frontend)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Endpoints da API](#endpoints-da-api)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Backlog do Produto](#backlog-do-produto)
- [Sprints](#sprints)
  - [Sprint 1 — Base e Autenticação](#sprint-1--base-e-autenticação)
  - [Sprint 2 — Plano Alimentar e Rastreamento](#sprint-2--plano-alimentar-e-rastreamento)
  - [Sprint 3 — Treinos e Perfil](#sprint-3--treinos-e-perfil)

---

## Visão Geral

O FitPlan calcula automaticamente as necessidades calóricas e de macronutrientes do usuário com base na fórmula de **Mifflin-St Jeor**, gerando um plano alimentar com sugestão de refeições (café da manhã, almoço e jantar) usando alimentos do dia a dia. Além disso, oferece um sistema completo de treinos com templates pré-definidos (Hipertrofia A/B e Força A/B), rastreamento de peso com gráfico histórico e perfil personalizado com foto e nome.

---

## Tecnologias

| Camada     | Tecnologia                              | Versão      |
|------------|-----------------------------------------|-------------|
| Mobile     | React Native + Expo                     | 0.81.5 / ~54|
| Linguagem  | TypeScript                              | ~5.9         |
| Navegação  | React Navigation (Stack)                | 7.x         |
| HTTP       | Axios                                   | ^1.13        |
| Gráficos   | react-native-chart-kit + react-native-svg | ^6.12 / 15.12 |
| Galeria    | expo-image-picker                       | ~17.0        |
| Backend    | Node.js + Express                       | 5.2.1       |
| Banco      | PostgreSQL + pg (node-postgres)         | ^8.17        |
| Segurança  | bcrypt                                  | ^6.0         |
| Dev Server | ts-node-dev                             | ^2.0         |

---

## Pré-requisitos

- **Node.js** >= 18
- **npm** >= 9
- **PostgreSQL** >= 14 (rodando localmente ou em servidor)
- **Expo Go** instalado no celular (ou emulador Android/iOS)
- **pgAdmin** (opcional, para gerenciar o banco)

---

## Como Iniciar

### 1. Banco de Dados

Abra o **pgAdmin** (ou qualquer cliente PostgreSQL) e execute os scripts na ordem:

```sql
-- Criar banco (se ainda não existir)
CREATE DATABASE fitplan;
```

Em seguida, execute cada arquivo de migração em ordem no banco `fitplan`:

| Arquivo               | O que faz                                                   |
|-----------------------|-------------------------------------------------------------|
| `migration.sql`       | Tabelas `weight_logs`, `workout_logs`; coluna `created_at` em `plans` |
| `migration_v2.sql`    | Coluna `set_number` em `workout_logs`                       |
| `migration_v3.sql`    | Colunas de perfil em `users`; tabelas `workout_templates` e `workout_sessions`; FK `session_id` |

> Os arquivos estão na pasta `backend/`.

---

### 2. Backend

```bash
cd backend

# Instalar dependências
npm install

# Criar arquivo de variáveis de ambiente
cp .env.example .env
# (edite o .env com suas credenciais do PostgreSQL — veja a seção abaixo)

# Iniciar em modo desenvolvimento
npm run dev
```

A API estará disponível em `http://localhost:3000`.

Verifique com:
```bash
curl http://localhost:3000/health
# resposta esperada: {"ok":true}
```

---

### 3. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar o Expo
npm start
```

Após iniciar, **escaneie o QR code** com o app **Expo Go** no celular.

> Certifique-se de que o celular e o computador estão na **mesma rede Wi-Fi**.

Antes de rodar, configure o IP do backend em `frontend/src/services/api.ts` (ou onde a baseURL do Axios está definida):

```ts
// Troque pelo IP local da sua máquina
baseURL: "http://SEU_IP_LOCAL:3000"
```

Para encontrar seu IP local:
- **Windows:** `ipconfig` → "Endereço IPv4"
- **Mac/Linux:** `ifconfig` → `inet`

---

## Variáveis de Ambiente

Crie o arquivo `backend/.env` com o seguinte conteúdo:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=fitplan
```

> O arquivo `backend/src/db.ts` lê essas variáveis para configurar o pool de conexões.

---

## Endpoints da API

| Método | Rota                          | Descrição                              |
|--------|-------------------------------|----------------------------------------|
| POST   | `/auth/register`              | Cadastro de usuário                    |
| POST   | `/auth/login`                 | Login com e-mail e senha               |
| POST   | `/plans`                      | Gerar/salvar plano alimentar           |
| GET    | `/plans/:userId/latest`       | Buscar último plano do usuário         |
| POST   | `/weight-logs`                | Registrar peso                         |
| GET    | `/weight-logs/:userId`        | Histórico de peso                      |
| POST   | `/workout-logs`               | Registrar série de exercício           |
| GET    | `/workout-logs/:userId`       | Histórico de treinos                   |
| GET    | `/profile/:userId`            | Buscar perfil do usuário               |
| PUT    | `/profile/:userId`            | Atualizar nome/foto do perfil          |
| GET    | `/workout-templates/:userId`  | Buscar templates salvos                |
| POST   | `/workout-templates`          | Salvar novo template                   |
| DELETE | `/workout-templates/:id`      | Deletar template                       |
| POST   | `/workout-sessions`           | Criar sessão de treino                 |
| GET    | `/workout-sessions/:userId`   | Histórico de sessões                   |

---

## Estrutura de Pastas

```
App-Receita/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── plan.routes.ts
│   │   │   ├── weight.routes.ts
│   │   │   ├── workout.routes.ts
│   │   │   ├── workout-templates.routes.ts
│   │   │   ├── workout-sessions.routes.ts
│   │   │   └── profile.routes.ts
│   │   ├── db.ts
│   │   └── server.ts
│   ├── migration.sql
│   ├── migration_v2.sql
│   ├── migration_v3.sql
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── auth/
│       │   ├── AuthContext.tsx
│       │   └── auth.api.ts
│       ├── components/
│       │   └── TextField.tsx
│       ├── navigation/
│       │   ├── AppStack.tsx
│       │   └── AuthStack.tsx
│       ├── plan/
│       │   └── plan.api.ts
│       ├── screens/
│       │   ├── login.tsx
│       │   ├── RegisterScreen.tsx
│       │   ├── home.tsx
│       │   ├── profile.tsx
│       │   ├── GeneratePlanScreen.tsx
│       │   ├── DietSuggestionScreen.tsx
│       │   ├── WeightTrackerScreen.tsx
│       │   └── WorkoutScreen.tsx
│       ├── services/
│       │   ├── profile.api.ts
│       │   ├── weight.api.ts
│       │   ├── workout.api.ts
│       │   ├── workout-templates.api.ts
│       │   └── workout-sessions.api.ts
│       └── theme.ts
│
├── slides.html
└── README.md
```

---

## Backlog do Produto

### Requisitos Funcionais (RF)

| ID   | Descrição                                                                                        | Prioridade |
|------|--------------------------------------------------------------------------------------------------|------------|
| RF01 | O sistema deve permitir cadastro de usuário com e-mail e senha                                   | Alta       |
| RF02 | O sistema deve permitir login com e-mail e senha                                                 | Alta       |
| RF03 | O sistema deve calcular calorias diárias usando a fórmula de Mifflin-St Jeor                    | Alta       |
| RF04 | O sistema deve calcular macronutrientes (proteína, carboidrato, gordura) com base no objetivo    | Alta       |
| RF05 | O sistema deve calcular a ingestão diária de água recomendada                                    | Média      |
| RF06 | O sistema deve exibir uma sugestão de dieta com 3 refeições (café, almoço, jantar)              | Média      |
| RF07 | O sistema deve permitir o registro manual de peso pelo usuário                                   | Média      |
| RF08 | O sistema deve salvar o peso automaticamente ao gerar um plano alimentar                         | Média      |
| RF09 | O sistema deve exibir um gráfico histórico de peso                                               | Média      |
| RF10 | O sistema deve exibir estatísticas de peso (atual, mínimo, máximo, variação)                    | Baixa      |
| RF11 | O sistema deve oferecer 4 templates de treino pré-definidos (Hipertrofia A/B, Força A/B)        | Alta       |
| RF12 | O sistema deve permitir criar e salvar templates de treino personalizados                        | Alta       |
| RF13 | O sistema deve permitir iniciar uma sessão de treino nomeada                                     | Alta       |
| RF14 | O sistema deve registrar séries por exercício com peso e repetições                              | Alta       |
| RF15 | O sistema deve comparar a série atual com a última sessão do mesmo exercício                     | Média      |
| RF16 | O sistema deve exibir indicadores de evolução (↑ melhorou, ↓ regrediu) por série               | Média      |
| RF17 | O sistema deve permitir adicionar foto de perfil via galeria do dispositivo                      | Baixa      |
| RF18 | O sistema deve permitir editar o nome de exibição do perfil                                      | Baixa      |
| RF19 | O sistema deve exibir no perfil o último plano alimentar gerado                                  | Média      |
| RF20 | O sistema deve persistir a sessão do usuário entre aberturas do app                             | Alta       |

### Requisitos Não Funcionais (RNF)

| ID    | Descrição                                                                                         | Categoria     |
|-------|---------------------------------------------------------------------------------------------------|---------------|
| RNF01 | Senhas devem ser armazenadas com hash bcrypt (salt rounds = 10)                                  | Segurança     |
| RNF02 | A API deve responder em menos de 500ms para operações de leitura simples                         | Desempenho    |
| RNF03 | O app deve funcionar nos sistemas Android e iOS                                                   | Portabilidade |
| RNF04 | O código deve ser escrito inteiramente em TypeScript (frontend e backend)                        | Manutenção    |
| RNF05 | O banco de dados deve usar constraints de integridade referencial (FOREIGN KEY + ON DELETE CASCADE) | Confiabilidade |
| RNF06 | A interface deve seguir um sistema de design centralizado (tokens de cor e sombra)               | Usabilidade   |
| RNF07 | O app deve ser responsivo e funcionar em telas de diferentes tamanhos                            | Usabilidade   |
| RNF08 | A API deve aceitar requisições de qualquer origem (CORS liberado para desenvolvimento)           | Compatibilidade |
| RNF09 | O backend deve ser stateless — nenhuma sessão armazenada em memória                             | Escalabilidade |
| RNF10 | As migrações de banco devem ser executáveis de forma incremental e idempotente (IF NOT EXISTS)  | Manutenção    |

---

## Sprints

### Sprint 1 — Base e Autenticação

**Objetivo:** Estruturar o projeto, configurar a comunicação entre frontend e backend, e implementar o fluxo completo de autenticação.

**Duração sugerida:** 1 semana

#### Requisitos Funcionais

| ID   | Tarefa                                                              | Status |
|------|---------------------------------------------------------------------|--------|
| RF01 | Criar tela de cadastro com e-mail e senha                           | ✅ Feito |
| RF02 | Criar tela de login com e-mail e senha                              | ✅ Feito |
| RF20 | Manter sessão do usuário via Context API (isLoggedIn, userId, token)| ✅ Feito |
| —    | Criar navegação condicional (AuthStack / AppStack)                  | ✅ Feito |
| —    | Configurar banco de dados PostgreSQL com tabela `users` e `plans`   | ✅ Feito |
| —    | Criar rota `POST /auth/register` com hash bcrypt                    | ✅ Feito |
| —    | Criar rota `POST /auth/login` com verificação de hash              | ✅ Feito |
| —    | Criar tela Home com menu de navegação                               | ✅ Feito |

#### Requisitos Não Funcionais

| ID    | Critério de aceitação                                                |
|-------|----------------------------------------------------------------------|
| RNF01 | Senhas salvas apenas como hash bcrypt — nunca em texto puro         |
| RNF04 | Todo o projeto configurado em TypeScript com `tsconfig.json`        |
| RNF08 | CORS habilitado no Express para comunicação com o app               |
| RNF09 | Backend sem estado de sessão — autenticação via token no contexto React |

---

### Sprint 2 — Plano Alimentar e Rastreamento de Peso

**Objetivo:** Implementar o motor de cálculo nutricional, a sugestão de dieta e o rastreamento visual de peso.

**Duração sugerida:** 1 semana

#### Requisitos Funcionais

| ID   | Tarefa                                                                     | Status |
|------|----------------------------------------------------------------------------|--------|
| RF03 | Implementar cálculo de TMB com fórmula de Mifflin-St Jeor no backend      | ✅ Feito |
| RF04 | Calcular macros (proteína, carbo, gordura) por objetivo e intensidade      | ✅ Feito |
| RF05 | Calcular água diária recomendada (peso × 35 ml)                            | ✅ Feito |
| RF06 | Criar tela de sugestão de dieta com 3 refeições                            | ✅ Feito |
| RF07 | Criar tela de rastreamento de peso com input manual                        | ✅ Feito |
| RF08 | Salvar peso automaticamente ao gerar plano (variável independente da dieta)| ✅ Feito |
| RF09 | Exibir gráfico de linha com histórico de até 10 pesos                      | ✅ Feito |
| RF10 | Exibir estatísticas: peso atual, mínimo, máximo e variação total           | ✅ Feito |
| RF19 | Exibir último plano gerado na tela de perfil                               | ✅ Feito |
| —    | Criar rota `POST /plans` com persistência no banco                         | ✅ Feito |
| —    | Criar rota `GET /plans/:userId/latest`                                     | ✅ Feito |
| —    | Criar rotas `POST /weight-logs` e `GET /weight-logs/:userId`               | ✅ Feito |

#### Requisitos Não Funcionais

| ID    | Critério de aceitação                                                         |
|-------|-------------------------------------------------------------------------------|
| RNF02 | Endpoint `/plans` deve calcular e persistir em menos de 500ms                |
| RNF05 | `weight_logs` com FK para `users` e ON DELETE CASCADE                        |
| RNF06 | Tela de plano e sugestão usando tokens de cor do `theme.ts`                  |
| RNF10 | Migrations executadas com `IF NOT EXISTS` para segurança                     |

---

### Sprint 3 — Treinos e Perfil

**Objetivo:** Implementar o sistema completo de treinos (templates, sessões, séries) e o perfil personalizado do usuário.

**Duração sugerida:** 1–2 semanas

#### Requisitos Funcionais

| ID   | Tarefa                                                                          | Status |
|------|---------------------------------------------------------------------------------|--------|
| RF11 | Criar 4 templates pré-definidos no frontend (Hipertrofia A/B, Força A/B)       | ✅ Feito |
| RF12 | Permitir criar e salvar template personalizado com seleção de exercícios        | ✅ Feito |
| RF13 | Criar sessão de treino nomeada com `POST /workout-sessions`                    | ✅ Feito |
| RF14 | Registrar séries por exercício (peso, reps, set_number) vinculadas à sessão    | ✅ Feito |
| RF15 | Buscar e exibir os dados da última sessão do mesmo exercício para comparação   | ✅ Feito |
| RF16 | Mostrar indicadores visuais ↑ / ↓ por série comparando com sessão anterior     | ✅ Feito |
| RF17 | Permitir trocar foto de perfil via `expo-image-picker`                         | ✅ Feito |
| RF18 | Permitir editar e salvar nome de exibição na tela de perfil                    | ✅ Feito |
| —    | Criar rotas CRUD para `workout-templates`                                       | ✅ Feito |
| —    | Criar rotas para `workout-sessions` com contagem de exercícios e séries        | ✅ Feito |
| —    | Criar rotas `GET/PUT /profile/:userId`                                          | ✅ Feito |
| —    | Adicionar colunas `display_name` e `avatar_uri` na tabela `users`              | ✅ Feito |

#### Requisitos Não Funcionais

| ID    | Critério de aceitação                                                              |
|-------|------------------------------------------------------------------------------------|
| RNF03 | App testado e funcional tanto em Android quanto iOS via Expo Go                   |
| RNF05 | `workout_logs.session_id` com FK para `workout_sessions` e integridade garantida  |
| RNF06 | Tela de treino com design consistente usando o sistema de cores do `theme.ts`     |
| RNF07 | Cards de macro e template responsivos usando `width: '47%'` e flexWrap            |

---

## Cálculo do Plano Alimentar

O backend utiliza a **fórmula de Mifflin-St Jeor** para calcular o metabolismo basal (TMB):

```
Homem:  TMB = (10 × peso) + (6.25 × altura) − (5 × idade) + 5
Mulher: TMB = (10 × peso) + (6.25 × altura) − (5 × idade) − 161
```

O TDEE (gasto calórico total) é calculado multiplicando a TMB pelo fator de atividade:

| Intensidade | Fator |
|-------------|-------|
| Leve        | 1.4   |
| Moderada    | 1.6   |
| Intensa     | 1.8   |

O objetivo de peso ajusta as calorias finais:

| Objetivo       | Ajuste   |
|----------------|----------|
| Ganhar peso    | +400 kcal |
| Manter peso    | ±0 kcal  |
| Perder peso    | −400 kcal |

---

## Licença

Projeto acadêmico — uso educacional.
