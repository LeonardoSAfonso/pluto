# Pluto — GEX Finance Portal

> Portal de solicitações financeiras fullstack com controle de aprovação, auditoria imutável e dashboard por perfil.

---

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/) instalados
- Portas `3000`, `3001` e `5432` livres na máquina

---

## Como rodar o projeto

### 1. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

O arquivo `.env` já vem com valores funcionais para desenvolvimento local. Nenhuma alteração é obrigatória para subir o projeto.

> **`APP_TODAY=2026-09-18`** já está configurado — isso reproduz exatamente os valores do gabarito no dashboard.

### 2. Suba o projeto

```bash
docker compose up --build
```

Esse único comando:
1. Constrói as imagens do backend e do frontend
2. Aguarda o PostgreSQL ficar saudável (`pg_isready`)
3. Executa as migrations (`prisma migrate deploy`)
4. Popula o banco com os dados de seed (idempotente — seguro re-executar)
5. Inicia a API e aguarda o healthcheck em `/health`
6. Inicia o frontend

**Tempo estimado: ≈ 40–60 s na primeira execução** (inclui download das imagens e build).

### 3. Acesse

| Serviço    | URL                          |
|------------|------------------------------|
| Frontend   | http://localhost:3000         |
| API (REST) | http://localhost:3001         |
| Healthcheck| http://localhost:3001/health  |

> Para parar: `Ctrl+C` e depois `docker compose down`.
> Para recriar o banco do zero: `docker compose down -v && docker compose up --build`.

---

## Usuários de Seed

Faça login com qualquer um dos usuários abaixo diretamente na tela de login:

| Nome                | E-mail                       | Senha               | Perfil      |
|---------------------|------------------------------|---------------------|-------------|
| Ana Solicitante     | `solicitante@gex.test`       | `GexRequester123!`  | `REQUESTER` |
| Bruno Solicitante   | `outro.solicitante@gex.test` | `GexRequester456!`  | `REQUESTER` |
| Fernanda Financeiro | `financeiro@gex.test`        | `GexFinance123!`    | `FINANCE`   |

**Dica:** Faça login com `financeiro@gex.test` para ver o dashboard completo com todas as solicitações e ter acesso às ações de aprovação, rejeição e pagamento.

---

## Gabarito do Dashboard (`APP_TODAY=2026-09-18`)

Ao logar como **Fernanda Financeiro**, o dashboard deve exibir exatamente:

| Indicador             | Valor esperado   |
|-----------------------|-----------------|
| Total Pendente        | **R$ 8.750,49** |
| Total Aprovado        | **R$ 6.585,99** |
| Pago no Mês           | **R$ 8.415,49** |
| Solicitações Vencidas | **4**           |

---

## Executando os Testes

### Backend — Testes unitários

Rodam com mocks, sem precisar de banco de dados.

```bash
cd backend

# Instalar dependências (se rodar fora do Docker)
npm install

# Executar todos os testes unitários
npm test

# Com cobertura de código
npm run test:cov
```

### Backend — Testes de integração

Usam um PostgreSQL real. Suba o banco antes de rodar:

```bash
# Na raiz do projeto — sobe apenas o PostgreSQL
docker compose up postgres -d

# Em outro terminal
cd backend
npm run test:integration
```

> Os testes de integração criam e limpam o próprio schema — não interferem com os dados do seed.

### Frontend — Testes de componentes

```bash
cd frontend

# Instalar dependências (se rodar fora do Docker)
npm install

npm test
```

### O que está coberto

**Backend — Unitários (17 suítes):**
- Conversão de valor BRL para centavos (todos os exemplos do gabarito)
- Validação de CNPJ com/sem máscara e dígitos verificadores
- Cálculo de datas e timezone `America/Sao_Paulo`
- Máquina de estados completa (todas as transições válidas e inválidas)
- Isolamento de perfil: `REQUESTER` tentando aprovar/rejeitar → `403`
- Login com credenciais válidas e inválidas (`401`)
- Métricas do dashboard com escopo `FINANCE` e `REQUESTER`
- AppError, filtro de exceções e interceptor de logging com sanitização

**Backend — Integração (5 suítes, PostgreSQL real):**
- Criação de solicitação, sanitização de CNPJ e registro de auditoria inicial
- Bloqueio de nota duplicada (`409`) inclusive com `Promise.all` (race condition)
- Fluxo completo: aprovação → pagamento
- Rejeição sem motivo (`422`) e com motivo (`200`)
- Isolamento `REQUESTER` vs `FINANCE` na listagem
- Paginação e filtros aplicados no banco (OFFSET/LIMIT + ILIKE)
- Gabarito completo do dashboard com `APP_TODAY=2026-09-18`

**Frontend:**
- `StatusBadge` — label e cor corretas por status
- `SummaryCards` — valores formatados em BRL
- `CreateRequestForm` — validações e máscara de valor
- `useAuth` — login, logout e persistência em `localStorage`
- `auth.service` e `requests.service` — params e endpoints corretos

---

## Desenvolvimento Local (sem Docker)

Caso prefira rodar backend e frontend diretamente na máquina:

### Backend

```bash
cd backend
npm install

# Crie backend/.env com DATABASE_URL apontando para seu PostgreSQL local:
# DATABASE_URL=postgresql://gex:gex_local_password@localhost:5432/gex_finance_test
# Copie as demais variáveis de .env.example

npm run db:generate        # Gera o Prisma Client
npm run db:migrate:dev     # Executa as migrations
npm run db:seed            # Popula o banco com os dados de seed
npm run start:dev          # Inicia em modo watch (hot reload)
```

### Frontend

```bash
cd frontend
npm install

# Crie frontend/.env.local:
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

npm run dev                # Inicia em modo desenvolvimento
```

---

## API — Endpoints

| Método | Rota                      | Perfil      | Descrição                        |
|--------|---------------------------|-------------|----------------------------------|
| POST   | `/auth/login`             | Público     | Autenticação JWT                 |
| GET    | `/auth/me`                | Autenticado | Perfil do usuário autenticado    |
| GET    | `/requests`               | Autenticado | Lista paginada + filtros         |
| POST   | `/requests`               | Autenticado | Criar solicitação                |
| GET    | `/requests/:id`           | Autenticado | Detalhe + histórico de auditoria |
| POST   | `/requests/:id/decision`  | `FINANCE`   | Aprovar ou rejeitar (`PENDING`)  |
| POST   | `/requests/:id/mark-paid` | `FINANCE`   | Marcar como pago (`APPROVED`)    |
| GET    | `/dashboard/summary`      | Autenticado | Métricas por perfil              |
| GET    | `/health`                 | Público     | Healthcheck + status do banco    |

### Exemplos rápidos com curl

```bash
# 1. Login — guarde o token retornado
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"financeiro@gex.test","password":"GexFinance123!"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# 2. Dashboard
curl -s http://localhost:3001/dashboard/summary \
  -H "Authorization: Bearer $TOKEN" | jq .

# 3. Listar solicitações (página 1, 10 por página)
curl -s "http://localhost:3001/requests?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq .

# 4. Criar solicitação
curl -s -X POST http://localhost:3001/requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "supplier_name": "Acme Ltda",
    "supplier_cnpj": "11.222.333/0001-81",
    "invoice_number": "NF-2026-001",
    "amount_cents": 155313,
    "competence": "2026-09",
    "due_date": "2026-10-15",
    "category": "SERVICES"
  }' | jq .
```

---

## Variáveis de Ambiente

Todas as variáveis estão documentadas em `.env.example`:

| Variável              | Padrão                     | Descrição                                         |
|-----------------------|----------------------------|---------------------------------------------------|
| `POSTGRES_DB`         | `gex_finance_test`         | Nome do banco de dados                            |
| `POSTGRES_USER`       | `gex`                      | Usuário do PostgreSQL                             |
| `POSTGRES_PASSWORD`   | `gex_local_password`       | Senha do PostgreSQL                               |
| `JWT_SECRET`          | `challenge_only_change_me` | Chave de assinatura JWT (troque em produção)      |
| `JWT_EXPIRES_IN`      | `7d`                       | Expiração do token                                |
| `APP_TODAY`           | *(vazio = data real)*      | Data de referência simulada (`YYYY-MM-DD`)        |
| `APP_TIMEZONE`        | `America/Sao_Paulo`        | Timezone para cálculos de data                    |
| `API_PORT`            | `3001`                     | Porta da API                                      |
| `WEB_PORT`            | `3000`                     | Porta do frontend                                 |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001`    | URL da API acessada pelo browser                  |
| `WEB_URL`             | `http://localhost:3000`    | URL do frontend (usada para CORS no backend)      |

---

## Arquitetura

```
gex/
├── backend/                  # NestJS 12 + Prisma 6 + PostgreSQL 16
│   ├── src/
│   │   ├── auth/             # JWT, guards de autenticação e perfil
│   │   ├── requests/         # Módulo principal: CRUD + máquina de estados
│   │   ├── dashboard/        # Agregações financeiras por perfil
│   │   ├── health/           # Healthcheck da API e do banco
│   │   ├── users/            # Repositório de usuários (sem CRUD público)
│   │   ├── shared/           # AppError, filtros, interceptors, utils
│   │   └── orm/              # PrismaService (singleton global)
│   ├── prisma/
│   │   ├── schema.prisma     # Modelos, constraints e índices
│   │   ├── migrations/       # Migrations versionadas
│   │   └── seed.ts           # Seed idempotente com IDs fixos
│   ├── test/                 # Espelha src/ — unit + integration
│   ├── Dockerfile            # Multi-stage (builder -> production)
│   └── entrypoint.sh         # migrate -> seed -> start
│
├── frontend/                 # Next.js 16 + React 19 + Tailwind CSS v4
│   └── src/
│       ├── app/              # App Router (auth, dashboard, requests)
│       ├── components/       # Layout, features, ui (máxima componentização)
│       ├── hooks/            # useAuth, useRequests, useDashboard
│       ├── services/         # BaseService (Axios) + AuthService + RequestsService
│       ├── types/            # Contratos de API tipados
│       └── utils/            # RouteGuard, formatMoney, formatCnpj
│
├── data/                     # Dados fornecidos (não alterar)
│   ├── seed_users.json
│   ├── seed_requests.json
│   ├── seed_audit_events.json
│   └── expected_results.json
│
├── docker-compose.yml        # postgres -> api (healthy) -> web (healthy)
└── .env.example              # Template de configuração
```

---

## Stack Completa

### Backend
| Tecnologia             | Versão | Uso                                          |
|------------------------|--------|----------------------------------------------|
| NestJS                 | 12     | Framework modular com DI e decorators        |
| Prisma                 | 6      | ORM type-safe com migrations e seed          |
| PostgreSQL             | 16     | Banco relacional com constraints e índices   |
| passport-jwt           | 4      | Autenticação stateless por JWT               |
| bcrypt                 | 6      | Hash de senhas                               |
| class-validator        | 0.15   | Validação e whitelist de DTOs                |
| cpf-cnpj-validator     | 2      | Validação de dígitos verificadores           |
| date-fns + date-fns-tz | 4/3    | Manipulação de datas com timezone            |
| Helmet                 | 8      | Cabeçalhos HTTP seguros                      |
| Jest + Supertest       | 30/7   | Testes unitários e de integração             |

### Frontend
| Tecnologia     | Versão | Uso                                              |
|----------------|--------|--------------------------------------------------|
| Next.js        | 16     | App Router com SSR/CSR e React 19                |
| TypeScript     | 5      | Tipagem estática end-to-end                      |
| Tailwind CSS   | v4     | Utilitários de estilo com design system CSS vars |
| Axios          | 1      | Cliente HTTP com interceptors                    |
| React Toastify | 11     | Notificações de feedback ao usuário              |
| MUI            | v9     | Componentes e ícones complementares              |
| Jest + RTL     | 30/16  | Testes de componentes e hooks                    |

---

## Estrutura dos Testes (backend)

```
backend/test/                        # Espelha src/
├── auth/
│   ├── auth.controller.spec.ts          # unit
│   ├── auth.controller.integration.spec.ts
│   ├── guards/roles.guard.spec.ts       # unit
│   └── services/login.spec.ts           # unit
├── dashboard/
│   ├── dashboard.controller.spec.ts     # unit
│   ├── dashboard.controller.integration.spec.ts
│   └── services/getSummary.spec.ts      # unit
├── health/
│   ├── health.controller.spec.ts        # unit
│   └── health.controller.integration.spec.ts
├── requests/
│   ├── requests.controller.spec.ts      # unit
│   ├── requests.controller.integration.spec.ts
│   └── services/
│       ├── create.spec.ts               # unit
│       ├── find.spec.ts                 # unit
│       ├── findOne.spec.ts              # unit
│       └── status-transition.spec.ts    # unit
└── shared/
    ├── AppError.spec.ts
    ├── filters/http-exception.filter.spec.ts
    ├── interceptors/logging.interceptor.spec.ts
    └── utils/
        ├── money.utils.spec.ts
        ├── cnpj.utils.spec.ts
        ├── date.utils.spec.ts
        └── date-timezone.integration.spec.ts
```

---

## Telas e Funcionalidades

### Login
- Glassmorphism + gradiente escuro com branding lateral
- Validação de credenciais com mensagem de erro clara
- Proteção contra envio múltiplo (botão desabilitado durante loading)
- Redirect automático para `/dashboard` após autenticação

### Dashboard
- Cards animados com contagem progressiva de valores
- Skeleton loader durante carregamento
- Escopo por perfil: `REQUESTER` vê apenas as próprias solicitações
- Data de referência exibida no rodapé (respeita `APP_TODAY`)

### Lista de Solicitações
- Tabela paginada com filtros **server-side** (aplicados via SQL no banco)
- Busca por fornecedor com debounce de 300 ms
- Filtro por status (`PENDING`, `APPROVED`, `REJECTED`, `PAID`)
- Filtro por período de vencimento
- `StatusBadge` com cores semânticas e badge **VENCIDA** sobreposto
- `REQUESTER` não vê coluna "Solicitante" (isolamento de perfil)
- Empty state com ícone quando não há resultados

### Nova Solicitação
- Máscara de CNPJ em tempo real (`XX.XXX.XXX/XXXX-XX`)
- Máscara de valor no formato BRL (`1.553,13`)
- Validação de dígitos verificadores do CNPJ no frontend
- Proteção contra duplicidade: erro `409` com mensagem específica
- Spinner durante o POST e redirect para o detalhe após sucesso

### Detalhe da Solicitação
- Todos os dados em grid responsivo
- Linha do tempo de auditoria (somente leitura, ordenada por `created_at ASC`)
- `ActionPanel` condicional por perfil + status:
  - `FINANCE` + `PENDING` → botões Aprovar / Rejeitar
  - `FINANCE` + `APPROVED` → botão Marcar como Pago
  - Outros casos → sem ações
- `DecisionModal` com campo de motivo obrigatório para rejeição
- `MarkPaidModal` com data de pagamento e referência (ambos obrigatórios)

---

*Projeto desenvolvido como teste técnico Fullstack Sênior — GEX.*
