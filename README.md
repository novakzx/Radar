# CodeVision Radar

Radar de prospecção comercial **100% determinístico** para a equipe da CodeVision: pesquisa
empresas de uma região, identifica quais têm **website não encontrado na fonte pública
consultada** e prioriza os leads mais promissores com um **Lead Score transparente e auditável**
— tudo isso num CRM interno em kanban.

> Regra de linguagem inegociável em toda a aplicação: nunca se afirma que uma empresa **"não tem
> site"**. A frase correta é sempre **"Website não encontrado na fonte consultada"**, porque a
> ausência do dado numa fonte pública não prova a ausência real do site.

## Índice

- [Features](#features)
- [Stack](#stack)
- [Arquitetura](#arquitetura)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Instalação e desenvolvimento local](#instalação-e-desenvolvimento-local)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Configuração das APIs externas](#configuração-das-apis-externas)
- [Banco de dados (Prisma)](#banco-de-dados-prisma)
- [Redis / Rate limiting](#redis--rate-limiting)
- [Testes](#testes)
- [Build e deploy na Vercel](#build-e-deploy-na-vercel)
- [Segurança](#segurança)
- [Licença](#licença)

## Features

- **Radar de busca**: localização + raio + categoria/palavra-chave, processado como job
  assíncrono com progresso real (nunca simulado), acompanhado por polling no client.
- **Descoberta determinística**: consulta a OpenStreetMap (Overpass API, fonte primária, sem
  custo) e, opcionalmente, Google Places (chave própria do usuário).
- **Deduplicação**: por `(fonte, id-na-fonte)` e, na ausência de match, por nome normalizado +
  proximidade geográfica (raio configurável, padrão 50 m).
- **Verificação de website com níveis de confiança** (🟢 alta / 🟡 média / 🔴 baixa), sempre com
  fonte consultada e data/hora da verificação.
- **Lead Score 0–100** com breakdown visível de cada critério, sempre reproduzível
  (`services/LeadScoringService.ts`, coberto por testes unitários).
- **Mapa e lista sincronizados** (Mapbox GL, clustering, hover/seleção espelhados) com filtros e
  ordenação reais.
- **CRM em kanban** (Novo → Contactar → Contactado → Reunião → Proposta → Cliente / Não
  interessado) com drag-and-drop persistido, notas, tags, valor potencial e exportação em
  CSV/Excel.
- **Dashboard de métricas** — todos os números vêm de agregações reais no banco (sem valores
  estáticos): empresas encontradas, sem website, leads salvos, clientes, por categoria, por
  estágio, taxa de conversão, regiões com mais oportunidades.
- **Landing page** com hero animado, scroll storytelling (GSAP + ScrollTrigger + Lenis) e
  microinterações (Framer Motion), respeitando `prefers-reduced-motion`.
- **Zero IA/ML/LLM** em qualquer parte do produto — toda lógica de negócio é código
  determinístico e testável.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 (App Router) + React 19 + TypeScript `strict` |
| UI | Tailwind CSS v4 + shadcn/ui (Base UI) + Lucide Icons |
| Animação | Framer Motion (UI/microinterações) + GSAP/ScrollTrigger (só o scroll storytelling da landing) + Lenis (smooth scroll) |
| Mapa | Mapbox GL JS |
| Data fetching (client) | TanStack Query |
| Backend | Server Actions (mutações) + Route Handlers (polling/exportação) — sem serviço separado |
| Banco | PostgreSQL (Neon / Vercel Postgres) + Prisma ORM |
| Cache / rate limit | Upstash Redis (REST API) |
| Validação | Zod |
| Autenticação | Auth.js (NextAuth v5) — Credentials + bcrypt (custo 12) + JWT em cookie `httpOnly` |
| Exportação | `exceljs` (.xlsx) + CSV nativo |
| Testes | Vitest |

## Arquitetura

Um único projeto Next.js cobre frontend e backend — sem infraestrutura própria, pronto para
deploy serverless na Vercel:

- **Server Components** para tudo que não precisa de interatividade (páginas, layouts, busca de
  dados). **Client Components** isolados nos pontos que realmente precisam de estado/animação
  (formulários, mapa, kanban, scroll storytelling).
- **Regra de negócio vive em `services/`** — nenhuma lógica de domínio dentro de componentes
  React. `services/LeadScoringService.ts` e `services/WebsiteVerificationService.ts` são funções
  puras, testadas isoladamente.
- **Buscas rodam em background** via [`after()`](https://nextjs.org/docs/app/api-reference/functions/after)
  do Next.js: a Server Action responde imediatamente com o ID da busca, o pipeline
  (`services/SearchService.ts`) roda depois de a resposta ser enviada, e o client faz polling em
  `/api/searches/:id/status` até `status` virar `done`/`error` — nunca há espera artificial.
- **Auth.js em duas configurações**: `auth.config.ts` (edge-safe, sem Prisma — usada pelo
  `proxy.ts` para checagem otimista de sessão) e `auth.ts` (Node.js, com o Credentials Provider
  completo).

> Nota de versão: este projeto usa **Next.js 16**, que renomeou `middleware.ts` para
> **`proxy.ts`** (mesma função) e mudou parte da configuração do Prisma 7+. Fixamos o Prisma em
> `6.19.3` deliberadamente — a série 7/8 exige `prisma.config.ts` + driver adapters, o que não é
> necessário aqui.

## Estrutura de pastas

```
app/                    Rotas (App Router) — páginas e Route Handlers
  (auth)/               Login e registro
  (dashboard)/          Área logada: dashboard, radar, crm
  (legal)/              Privacidade e Termos
  api/                  Route Handlers (status de busca, exportação, NextAuth)
components/
  ui/                   Componentes shadcn/ui (gerados, não editar à mão)
  shared/               Componentes de aplicação (forms, cards, kanban, mapa...)
  landing/              Componentes exclusivos da landing page
services/               Regras de negócio (a "camada de domínio")
lib/                    Utilitários, validação (Zod), Prisma client, rate limiting
hooks/                  Hooks React reutilizáveis (ex.: polling de busca)
types/                  Tipos de domínio compartilhados
prisma/                 schema.prisma + migrations
tests/unit/             Testes unitários (Vitest)
auth.ts / auth.config.ts / proxy.ts   Autenticação e proteção de rotas
```

## Instalação e desenvolvimento local

Pré-requisitos: Node.js 20+, uma instância PostgreSQL (local via Docker, ou uma gratuita no
[Neon](https://neon.tech) / [Supabase](https://supabase.com)).

```bash
npm install
cp .env.example .env.local   # preencha as variáveis (ver seção abaixo)
npm run db:migrate           # aplica as migrations no banco configurado
npm run dev
```

Acesse `http://localhost:3000`.

## Variáveis de ambiente

Veja `.env.example` para a lista completa. Resumo:

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | Connection string pooled do Postgres |
| `DIRECT_URL` | Sim | Connection string direta (usada pelo Prisma Migrate) |
| `AUTH_SECRET` | Sim | Chave de assinatura da sessão (`npx auth secret`) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Recomendado | Rate limiting; sem elas, o rate limit é apenas desabilitado (nunca bloqueia por falta de infra) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Para o mapa | Pública por natureza — proteja restringindo por domínio no painel da Mapbox |
| `GOOGLE_PLACES_API_KEY` | Opcional | Fonte complementar de busca; sem ela, o Radar usa só OpenStreetMap |
| `NEXT_PUBLIC_APP_URL` | Para SEO | URL pública em produção (sitemap.xml, robots.txt) |

**Nunca** commite `.env` / `.env.local` — já estão no `.gitignore`.

## Configuração das APIs externas

- **OpenStreetMap (Overpass API + Nominatim)**: sem chave, gratuito. Respeite o uso moderado
  recomendado pelas próprias APIs (a aplicação já identifica as requisições com um `User-Agent`
  descritivo).
- **Google Places** (opcional): crie uma chave no
  [Google Cloud Console](https://console.cloud.google.com/) com a *Places API* habilitada, defina
  `GOOGLE_PLACES_API_KEY`. **Antes de usar em produção**, revise os Termos de Uso vigentes do
  Google Maps Platform sobre retenção de dados — o Place ID pode ser retido indefinidamente, mas
  os demais campos têm TTL limitado (`services/GooglePlacesService.ts` já documenta e aplica essa
  regra).
- **Mapbox**: crie uma conta gratuita em [mapbox.com](https://mapbox.com), copie o token público
  padrão (ou crie um novo) e defina `NEXT_PUBLIC_MAPBOX_TOKEN`. Restrinja o token por domínio no
  painel da Mapbox antes de ir para produção.

## Banco de dados (Prisma)

```bash
npm run db:migrate          # cria/aplica migrations em dev (usa .env.local)
npm run db:migrate:deploy   # aplica migrations em produção (CI/CD)
npm run db:studio           # abre o Prisma Studio
npm run db:generate         # regenera o Prisma Client
```

O schema (`prisma/schema.prisma`) inclui todos os índices exigidos pelo produto
(`businesses(city)`, `businesses(category)`, `businesses(lat, lng)`, `businesses(website)`,
`leads(status)`, `searches(created_at)`) e a chave única composta
`business_sources(source, source_id)` que impede duplicação na origem.

## Redis / Rate limiting

Rate limiting via Upstash Redis (REST API, sem servidor próprio): login (5/15min por IP **e** por
conta), criação de busca (10/hora por usuário) e exportação (5/hora). Sem as variáveis
`UPSTASH_REDIS_REST_URL`/`TOKEN` configuradas, o rate limit fica **desabilitado** (nunca bloqueia
o usuário por falta de infraestrutura opcional) — configure-as antes de produção.

## Testes

```bash
npm run test         # roda a suíte uma vez
npm run test:watch   # modo watch
```

A suíte cobre, com testes determinísticos (mesma entrada → mesma saída, sempre):
`LeadScoringService`, `WebsiteVerificationService`, deduplicação (normalização de nome +
distância geográfica) e os filtros/ordenação da lista de resultados.

## Build e deploy na Vercel

```bash
npm run typecheck
npm run lint
npm run build
```

1. Crie um banco Postgres serverless (Neon ou Vercel Postgres) e rode
   `npm run db:migrate:deploy` apontando para ele.
2. Crie um banco Upstash Redis (opcional, mas recomendado).
3. No painel da Vercel, importe o repositório e configure todas as variáveis de
   `.env.example` nas *Environment Variables* do projeto.
4. Deploy. Não há processos persistentes nem escrita em filesystem fora do runtime — o projeto é
   compatível com o modelo serverless da Vercel nativamente.

## Segurança

- Senhas com bcrypt (custo 12); sessão via JWT assinado em cookie `httpOnly`,
  `secure` em produção, `sameSite=lax`.
- RBAC simples (`admin` / `member`) na tabela `users`.
- Todo input validado com Zod antes de tocar o banco; todas as queries via Prisma (sem SQL cru).
- CSP e demais security headers configurados em `next.config.ts`.
- Logs de auditoria (`audit_logs`) para login, criação/edição de lead, mudança de estágio no
  kanban e exportações.
- Erros técnicos nunca chegam ao usuário final — mensagens amigáveis na UI, stack trace só no
  log do servidor.
- Chaves server-only (`GOOGLE_PLACES_API_KEY`) nunca referenciadas em componentes client; grep no
  repositório por SDKs de IA retorna vazio (restrição inegociável do produto).

## Licença

Uso interno — CodeVision.
