# Laço — Claude Code Context

## O que é o projeto
**Laço** é uma plataforma SaaS de planejamento de casamentos com dois públicos:
- **Casais (noivos):** convidados, orçamento, fornecedores, presentes, timeline, identidade visual
- **Cerimonialistas:** múltiplos casamentos, pipeline de leads, contratos, comissões, equipe

**Produção:** https://laco-app.vercel.app
**Banco:** Supabase PostgreSQL — gerenciado com `prisma db push` (sem histórico limpo de migrations)

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Banco | PostgreSQL via Supabase + Prisma ORM |
| Auth | NextAuth v4 (JWT strategy, sem sessions no DB) |
| Estilo | Tailwind CSS + `cn()` via `clsx` + `tailwind-merge` |
| Animações | Framer Motion (route transitions em `/casamento/[id]/layout.tsx`) |
| Forms | React Hook Form + Zod |
| Estado global | Zustand |
| Email | Resend |
| IA | OpenAI (GPT-4o — sugestões, identity kit, limpeza de nomes; DALL-E — imagens) |
| PDF | @react-pdf/renderer |
| OCR | pdf-parse |
| Monitoring | Sentry (todas as API routes) |
| PWA | next-pwa v5 + custom service worker em `worker/index.js` |
| Push Notifications | web-push (VAPID) via `src/lib/webpush.ts` |
| Realtime | Supabase Realtime (`@supabase/supabase-js`) |
| Pagamentos | Pagar.me (Pix, Boleto, Cartão) |
| Deploy | Vercel |

---

## Identidade Visual

> **Fonte da verdade completa:** `../BRAND.md` (um nível acima do app)
> Consulte antes de criar qualquer tela, componente ou asset visual.

### Paleta de Cores (Tailwind tokens)
```
midnight:  #1A1F3A  → fundo escuro, headers, botões primários, texto principal
gold:      #C9A96E  → acento, CTAs, labels, loop direito do símbolo
champagne: #E8D5B0  → secundária, destaques suaves, gradiente de progress
ivory:     #FAF7F2  → background claro, texto sobre escuro, loop esquerdo do símbolo
fog:       #F0EDE7  → background alternativo, seções secundárias
stone:     #8A8FA8  → texto muted, placeholders, inactive nav
```

### Tipografia
```
font-display  → Raleway 500           (logo, labels caps, seções em uppercase)
font-heading  → Cormorant Garamond 300 italic  (H1, H2, heroes, quotes)
font-body     → DM Sans 300/400/500   (interface, parágrafos, botões, campos)
```

### Logo / Símbolo
O símbolo é uma lemniscata (∞) em outline com dois loops — nunca preenchido:
- Loop esquerdo: stroke `#FAF7F2` (fundo escuro) ou `#1A1F3A` (fundo claro)
- Loop direito: stroke `#C9A96E` (gold, sempre)
- SVG viewBox: `0 0 60 60`, stroke-width: 2, fill: none
- Ponto central: `<ellipse>` fill `#C9A96E` opacity `0.85`, rx=3 ry=4
- Os loops são **amêndoas verticais** (mais altos que largos), não ∞ horizontal clássico

### Assets de Logo (`/public/brand/`)
```
logo-dark.svg / logo-dark-2x.png    → horizontal, fundo escuro
logo-light.svg / logo-light-2x.png  → horizontal, fundo claro
symbol-dark.svg / symbol-dark-2x.png → só o símbolo ∞, fundo escuro
symbol-light.svg / symbol-light-2x.png → só o símbolo ∞, fundo claro
app-icon-1024.png                   → app icon 1024×1024, fundo midnight
favicon-32.png                      → favicon 32×32
og-default.png                      → OG image 1200×630
```

---

## Páginas

### Públicas (sem autenticação)

| Rota | Função |
|------|--------|
| `/` | Redirect: autenticado → `/dashboard`, anônimo → `/home` |
| `/home` | Homepage de marketing |
| `/login` | Login/cadastro com Google OAuth e email |
| `/planos` | Página de preços |
| `/onboarding` | Onboarding guiado de 6 passos para casais novos |
| `/registro` | Formulário de cadastro (redireciona para login) |
| `/registro/cerimonialista` | Cadastro completo de cerimonialista (CNPJ, região) |
| `/[slug]` | Site público do casal (visto pelos convidados) |
| `/[slug]/presentes` | Lista de presentes pública |
| `/blog` | Listagem do blog (ISR 1h) |
| `/blog/[slug]` | Post individual do blog (ISR 1h) |
| `/casamento-em-sao-paulo` | Landing page SEO — São Paulo (ISR 24h) |
| `/casamento-em-bh` | Landing page SEO — Belo Horizonte (ISR 24h) |
| `/casamento-no-rio` | Landing page SEO — Rio de Janeiro (ISR 24h) |
| `/r/[code]` | Redirect de link de referral |

### Casal (autenticado)

| Rota | Função |
|------|--------|
| `/dashboard` | Lista de casamentos do usuário |
| `/perfil` | Perfil, código de referral, gerenciamento de conta |
| `/casamento/novo` | Criar novo casamento |
| `/casamento/[id]/planejar` | Hub de planejamento — navegação principal com simuladores |
| `/casamento/[id]/execucao` | Acompanhamento — convidados ao vivo, orçamento real, fornecedores |
| `/casamento/[id]/convidados` | Lista A/B/C, RSVP, mesas, grupos |
| `/casamento/[id]/confirmacoes` | Visão geral de confirmações e RSVPs |
| `/casamento/[id]/importar` | Importar convidados (agenda, CSV, manual) |
| `/casamento/[id]/whatsapp-confirmacao` | Configurar RSVP via WhatsApp |
| `/casamento/[id]/orcamento` | Orçamento planejado vs. gastos reais |
| `/casamento/[id]/orcamento-inteligente` | Sugestões de orçamento por IA |
| `/casamento/[id]/simulador` | Simulador de orçamento |
| `/casamento/[id]/simulador-convidados` | Simulador de número de convidados por região |
| `/casamento/[id]/presentes` | Gestão da lista de presentes, reservas, pagamentos |
| `/casamento/[id]/presentes-ia` | Sugestões de presentes por IA |
| `/casamento/[id]/maquininha` | Integração Pagar.me para receber pelos presentes |
| `/casamento/[id]/fornecedores` | Diretório de fornecedores com status e orçamento |
| `/casamento/[id]/cotacoes` | Comparação de orçamentos de fornecedores (+ OCR) |
| `/casamento/[id]/contratos` | Contratos digitais com assinatura dupla |
| `/casamento/[id]/timeline` | Cronograma completo do dia |
| `/casamento/[id]/identity-kit` | Identity kit visual gerado por IA (paleta, tipografia, DALL-E) |
| `/casamento/[id]/meu-site` | Construtor do site público do casal |
| `/casamento/[id]/papelaria` | Papelaria (convite, save the date, menu) |
| `/casamento/[id]/lua-de-mel` | Planejamento da lua de mel |
| `/casamento/[id]/questionarios` | Responder questionários do cerimonialista |
| `/casamento/[id]/cerimonialista` | Vincular/gerenciar cerimonialista |
| `/casamento/[id]/conta-casamento` | Configurações e dados do casamento |
| `/casamento/[id]/mais` | Menu de funcionalidades adicionais |

### Cerimonialista (autenticado)

| Rota | Função |
|------|--------|
| `/cerimonialista/dashboard` | Painel com métricas chave e casamentos próximos |
| `/cerimonialista/casamentos` | Lista de casamentos sob gestão |
| `/cerimonialista/casamento/[id]` | Visão detalhada de um casamento atribuído |
| `/cerimonialista/pipeline` | Pipeline de leads / funil de vendas |
| `/cerimonialista/comissoes` | Controle de comissões e pagamentos |
| `/cerimonialista/fornecedores` | Diretório próprio de fornecedores |
| `/cerimonialista/contratos` | Templates e gestão de contratos |
| `/cerimonialista/equipe` | Gerenciar membros da equipe |
| `/cerimonialista/financeiro` | Dashboard financeiro consolidado |
| `/cerimonialista/questionarios` | Criar e gerenciar questionários para casais |
| `/cerimonialista/portfolio` | Gerenciar portfólio público |
| `/cerimonialista/[slug]/portfolio` | Página pública do portfólio |
| `/cerimonialista/comunidade` | Fórum/comunidade entre cerimonialistas |
| `/cerimonialista/agenda` | Calendário de eventos e compromissos |
| `/cerimonialista/importar-orcamento` | Importar orçamento via OCR |
| `/cerimonialista/comparar-orcamentos` | Comparar orçamentos de fornecedores |

### Token/Código (acesso especial)

| Rota | Função |
|------|--------|
| `/questionario/[token]` | Formulário público de resposta a questionário |
| `/parceiro/[token]` | Onboarding do parceiro (noivo/a co-organizador) |
| `/conectar/[code]` | Cerimonialista aceita convite para casamento |
| `/contratos/[id]` | Assinar contrato digitalmente |

---

## API Endpoints

### Auth & Usuário
| Endpoint | Métodos | Função |
|----------|---------|--------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth (login, logout, callback OAuth) |
| `/api/auth/register` | POST | Cadastrar novo usuário |
| `/api/profile` | GET | Dados do usuário autenticado |
| `/api/user/onboarding` | GET, PATCH | Progresso de onboarding |
| `/api/user/onboarding-status` | GET | Status atual do onboarding |
| `/api/user/link-planner` | POST | Vincular cerimonialista a um casamento |
| `/api/user/referral` | GET | Código de referral e estatísticas |
| `/api/health` | GET | Health check |

### IA e OCR
| Endpoint | Métodos | Função |
|----------|---------|--------|
| `/api/ai/clean-names` | POST | Normalizar nomes de convidados via GPT-4o |
| `/api/ocr/quote` | POST | Processar PDF de orçamento via OCR |

### Pagamentos
| Endpoint | Métodos | Função |
|----------|---------|--------|
| `/api/payments/orders` | POST | Criar ordem (Pix/Boleto/Cartão) para presentes |
| `/api/payments/webhook` | POST | Webhook Pagar.me (confirmar pagamento) |

### Push Notifications
| Endpoint | Métodos | Função |
|----------|---------|--------|
| `/api/push/subscribe` | POST, DELETE | Salvar/remover subscription de push (VAPID) |

### Casamento — Gestão do Casal
| Endpoint | Métodos | Função |
|----------|---------|--------|
| `/api/weddings` | GET, POST | Listar casamentos / criar novo |
| `/api/weddings/[id]` | GET, PUT, DELETE | Detalhes / atualizar / deletar casamento |
| `/api/weddings/[id]/activity` | GET | Feed de atividades do casamento |
| `/api/weddings/[id]/events` | GET, POST | Eventos do casamento (civil, festa, etc.) |
| `/api/weddings/[id]/events/[eventId]` | DELETE | Deletar evento |
| `/api/weddings/[id]/guests` | GET, POST | Listar / adicionar convidados |
| `/api/weddings/[id]/guests/bulk` | POST | Importação em lote de convidados |
| `/api/weddings/[id]/guests/stats` | GET | Estatísticas (total, confirmados, pendentes, recusados) |
| `/api/weddings/[id]/guests/[guestId]` | GET, PATCH, PUT, DELETE | CRUD individual de convidado |
| `/api/weddings/[id]/budget` | GET, POST | Itens de orçamento |
| `/api/weddings/[id]/budget/[budgetId]` | GET, PUT, DELETE | CRUD item de orçamento |
| `/api/weddings/[id]/budget/summary` | GET | Totais e resumo do orçamento |
| `/api/weddings/[id]/budget-expenses` | GET, POST | Gastos reais registrados |
| `/api/weddings/[id]/gifts` | GET, POST | Lista de presentes |
| `/api/weddings/[id]/gifts/[giftId]` | GET, PUT, DELETE | CRUD item de presente |
| `/api/weddings/[id]/vendors` | GET, POST | Fornecedores |
| `/api/weddings/[id]/vendors/[vendorId]` | GET, PUT, DELETE | CRUD fornecedor |
| `/api/weddings/[id]/quotes` | GET, POST | Cotações de fornecedores |
| `/api/weddings/[id]/quotes/[quoteId]` | GET, PUT, DELETE | CRUD cotação |
| `/api/weddings/[id]/photos` | GET, POST, PATCH, DELETE | Fotos do casamento |
| `/api/weddings/[id]/timeline` | GET, POST | Cronograma do dia |
| `/api/weddings/[id]/timeline/[eventId]` | PATCH, DELETE | Atualizar/deletar evento do cronograma |
| `/api/weddings/[id]/contracts` | GET | Contratos do casamento |
| `/api/weddings/[id]/questionnaires` | GET | Questionários recebidos |
| `/api/weddings/[id]/identity-kit` | GET, POST, PATCH | Identity kit visual |
| `/api/weddings/[id]/identity-kit/images` | POST | Gerar imagens DALL-E |
| `/api/weddings/[id]/rsvp` | POST | Submeter RSVP (interno) |
| `/api/weddings/[id]/invite-code` | GET, POST | Código de convite para parceiro |
| `/api/weddings/[id]/planner` | POST | Atribuir cerimonialista |
| `/api/weddings/[id]/partner` | POST, DELETE | Adicionar/remover parceiro |
| `/api/weddings/[id]/maquininha` | POST | Configurar integração Pagar.me |
| `/api/weddings/[id]/papelaria` | GET, POST | Papelaria do casamento |
| `/api/weddings/[id]/whatsapp` | GET, POST | Configuração WhatsApp RSVP |
| `/api/weddings/[id]/suggestions` | GET | Sugestões da IA para o casamento |
| `/api/weddings/invite/[token]` | GET, POST | Aceitar convite de parceiro |

### Cerimonialista
| Endpoint | Métodos | Função |
|----------|---------|--------|
| `/api/planner/dashboard` | GET | Métricas do painel do cerimonialista |
| `/api/planner/weddings` | GET | Casamentos atribuídos |
| `/api/planner/weddings/[id]` | GET | Detalhes de casamento atribuído |
| `/api/planner/weddings/[id]/assign-member` | PATCH | Atribuir membro da equipe |
| `/api/planner/team` | GET, POST | Gerenciar equipe |
| `/api/planner/team/[memberId]` | PATCH, DELETE | Editar/remover membro |
| `/api/planner/contracts` | GET, POST | Templates de contrato |
| `/api/planner/contracts/[id]` | PATCH, DELETE | Editar/deletar contrato |
| `/api/planner/contracts/[id]/pdf` | GET | Gerar PDF do contrato |
| `/api/planner/questionnaires` | GET, POST | Templates de questionários |
| `/api/planner/questionnaires/[id]` | GET, DELETE | Obter/deletar questionário |
| `/api/planner/opportunities` | GET, POST | Pipeline de leads |
| `/api/planner/opportunities/[id]` | PUT, DELETE | Atualizar/deletar oportunidade |
| `/api/planner/tasks` | GET, POST | Tarefas do cerimonialista |
| `/api/planner/tasks/[id]` | PATCH, DELETE | Atualizar/deletar tarefa |
| `/api/planner/commissions` | GET | Lista de comissões |
| `/api/planner/commissions/[assignmentId]` | PATCH | Atualizar comissão/vínculo |
| `/api/planner/commissions/export` | GET | Exportar comissões (CSV/PDF) |
| `/api/planner/notifications` | GET, PATCH | Notificações do cerimonialista |
| `/api/planner/report` | POST | Gerar relatório em PDF |
| `/api/planner/community` | GET, POST | Posts da comunidade |
| `/api/planner/community/[id]` | DELETE | Deletar post |
| `/api/planner/community/[id]/like` | POST | Curtir post |
| `/api/planner/community/[id]/comments` | POST | Comentar em post |
| `/api/planner/google-calendar/connect` | GET | Iniciar OAuth Google Calendar |
| `/api/planner/google-calendar/callback` | GET | Callback OAuth Google Calendar |
| `/api/planner/google-calendar/disconnect` | POST | Desconectar Google Calendar |
| `/api/planner/google-calendar/status` | GET | Status da conexão |
| `/api/planner/google-calendar/sync` | POST | Sincronizar eventos |
| `/api/cerimonialista/aceitar-convite` | POST | Aceitar convite para casamento |

### Públicas (sem autenticação)
| Endpoint | Métodos | Função |
|----------|---------|--------|
| `/api/public/wedding/[slug]` | GET | Dados do site público do casal |
| `/api/public/wedding/[slug]/gifts` | GET | Lista de presentes pública |
| `/api/public/wedding/[slug]/rsvp` | POST | RSVP público (+ push notification ao casal) |
| `/api/public/wedding/[slug]/reserve` | POST | Reservar presente |
| `/api/public/contracts/[id]` | GET | Ver contrato para assinar |
| `/api/public/contracts/[id]/sign` | POST | Assinar contrato (token-based) |
| `/api/public/questionnaires/[token]` | GET, POST | Responder questionário (token-based) |
| `/api/public/planner/[slug]/portfolio` | GET | Portfólio público do cerimonialista |
| `/api/public/planner/[slug]/contact` | POST | Formulário de contato com cerimonialista |
| `/api/public/referral/[code]` | GET | Validar código de referral |
| `/api/invite/[code]` | GET | Validar código de convite |
| `/api/webhooks/whatsapp` | POST | Webhook de confirmações via WhatsApp |

---

## Modelos Prisma

| Modelo | Função |
|--------|--------|
| `User` | Autenticação, role (`COUPLE \| PLANNER \| ADMIN`), referrals, pushSubscriptions |
| `Wedding` | Casamento principal — slug, dados financeiros, partnerUserId |
| `WeddingEvent` | Eventos múltiplos (civil, festa, etc.) com horário e local |
| `Guest` | Convidado: lista A/B/C, RSVP, plusOne, mesa, WhatsApp |
| `Gift` | Presente: valor, reserva, pago, agradecimento |
| `Payment` | Pagamento de presente via Pagar.me — CPF cifrado |
| `Withdrawal` | Saque do saldo arrecadado com presentes |
| `BudgetItem` | Item de orçamento planejado |
| `BudgetExpense` | Gasto real registrado |
| `Photo` | Fotos do casamento |
| `Vendor` | Fornecedor com status, categoria, orçamento |
| `Quote` | Cotação de fornecedor (com dados de OCR) |
| `TimelineEvent` | Evento do cronograma do grande dia |
| `IdentityKit` | Identity kit visual (paleta, tipografia, imagens DALL-E) |
| `WeddingPlanner` | Perfil do cerimonialista (slug, CNPJ, região, comissão) |
| `WeddingPlannerAssignment` | Vínculo cerimonialista ↔ casamento |
| `PlannerTeamMember` | Membro da equipe do cerimonialista |
| `PlannerInviteCode` | Código de convite para cerimonialista entrar em um casamento |
| `Contract` | Contrato digital com assinatura dupla |
| `Questionnaire` | Questionário de preferências (cerimonialista → casal) |
| `Opportunity` | Lead no pipeline de vendas do cerimonialista |
| `PlannerTask` | Tarefa do cerimonialista |
| `PlannerNotification` | Notificação interna do cerimonialista |
| `CommunityPost` | Post na comunidade de cerimonialistas |
| `CommunityLike` | Curtida em post |
| `CommunityComment` | Comentário em post |
| `PushSubscription` | Endpoint Web Push por usuário (VAPID) |
| `AuditLog` | Log de ações sensíveis |
| `RateLimit` | Controle de rate limit via DB |

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── [slug]/                   # Site público do casal
│   ├── api/                      # ~95 endpoints
│   ├── casamento/[id]/
│   │   ├── layout.tsx            # Usa AnimatedWrapper (Framer Motion)
│   │   └── animated-wrapper.tsx  # Route transitions
│   ├── cerimonialista/
│   ├── dashboard/
│   ├── login/
│   ├── onboarding/
│   └── ...
├── components/
│   ├── ui/                       # Button, Card, Skeleton, Toast, Badge
│   ├── providers/                # SessionProvider, ToastProvider
│   ├── activation-checklist.tsx  # Onboarding com confetti
│   ├── bottom-nav.tsx            # Nav inferior das páginas do casal
│   └── push-subscribe-button.tsx # Opt-in de notificações push
├── hooks/
│   ├── use-realtime-guests.ts    # Supabase Realtime para stats ao vivo
│   ├── use-push-subscribe.ts     # Gerencia permissão + subscription push
│   └── use-toast.ts
├── lib/
│   ├── prisma.ts                 # Singleton PrismaClient
│   ├── auth.ts                   # Config NextAuth
│   ├── api-helpers.ts            # getAuthenticatedUser, errorResponse
│   ├── webpush.ts                # sendPushToUser(userId, payload)
│   ├── supabase-client.ts        # getSupabaseClient() para Realtime
│   ├── feature-flags.ts          # hasFeatureAccess(), <FeatureGate>
│   ├── crypto.ts                 # AES-256-GCM para CPF e dados bancários
│   ├── rateLimit.ts              # Rate limiting via DB
│   ├── emails.ts                 # Templates Resend
│   ├── whatsapp.ts               # Integração WhatsApp
│   ├── pagarme.ts                # Integração Pagar.me
│   └── utils.ts                  # cn(), formatters
├── types/
│   └── index.ts                  # Types globais incl. GuestStats
└── worker/
    └── index.js                  # Custom SW: push events, notificationclick
```

---

## Padrões de Código

### API Routes
```ts
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();
    // ...
  } catch (error) {
    Sentry.captureException(error);
    return errorResponse();
  }
}
```

### Componentes de Página
- `"use client"` em páginas com hooks
- Loading state: spinner `<div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />` ou `<PageSkeleton />`
- Bottom nav: `<BottomNav weddingId={weddingId} />` em todas as páginas do casal
- Toast: `useToast()` de `@/hooks/use-toast`
- Ícones: `lucide-react` — não criar SVGs inline
- Confirmações: nunca usar `window.confirm()` — usar estado inline ou modal

### Tailwind
- Mobile-first
- `font-heading` títulos, `font-body` tudo mais
- iOS safe-area: `pb-[env(safe-area-inset-bottom)]` em modais fixos

### Push (não-bloqueante)
```ts
sendPushToUser(userId, { title, body, icon }).catch(() => {});
```

---

## Feature Flags (planos)

Definidas em `src/lib/feature-flags.ts`. Atualmente `hasFeatureAccess()` retorna `true` para todos (Stripe pendente). Usar `<FeatureGate feature="nome">` para features premium.

| Flag | Plano | Função |
|------|-------|--------|
| `unlimited_guests` | Pro | Convidados ilimitados |
| `identity_kit` | Pro | Identity Kit com IA |
| `whatsapp_rsvp` | Pro | RSVP via WhatsApp |
| `analytics` | Pro | Analytics avançado |
| `ocr_quotes` | Cerimonialista | OCR de orçamentos |

Planos: **Gratuito** (50 convidados) · **Pro R$99/mês** · **Cerimonialista R$199/mês**

---

## Variáveis de Ambiente

| Variável | Uso |
|----------|-----|
| `DATABASE_URL` | Supabase pooler (PgBouncer) |
| `DIRECT_URL` | Supabase direto (prisma db push) |
| `NEXTAUTH_SECRET` | JWT signing |
| `NEXT_PUBLIC_APP_URL` | URL base para OG tags e links públicos (ex: `https://laco.com.vc`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `OPENAI_API_KEY` | GPT-4o + DALL-E |
| `RESEND_API_KEY` | Email transacional |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (Realtime) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (operações server-side) |
| `VAPID_PUBLIC_KEY` | Web Push VAPID (server) |
| `VAPID_PRIVATE_KEY` | Web Push VAPID (server) |
| `VAPID_EMAIL` | Web Push VAPID contact |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push VAPID (client) |
| `SENTRY_DSN` / `SENTRY_ORG` / `SENTRY_PROJECT` | Sentry |

---

## Comandos

```bash
npm run dev                  # Desenvolvimento
npm run build                # Build (inclui prisma generate)
npx prisma generate          # Gerar Prisma Client
npx prisma db push           # Aplicar schema ao banco (sem migration)
vercel --prod                # Deploy em produção
```

---

## Observações Críticas

1. **Nunca usar `prisma migrate dev/deploy`** — banco tem drift. Sempre `prisma db push`
2. **URL pública** — usar `NEXT_PUBLIC_APP_URL ?? "https://laco.com.vc"` (nunca `NEXTAUTH_URL`)
3. **Sentry** — sem `authToken`, warnings de source map são esperados e não bloqueiam o build
4. **Google OAuth** — está ativo no login. Requer `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` no Vercel
5. **CPF e dados bancários** — cifrados em AES-256-GCM via `src/lib/crypto.ts`; nunca logar em plain text
6. **PWA custom worker** — `worker/index.js` detectado automaticamente pelo next-pwa; não usar `customWorkerSrc` (opção inválida)
7. **Pagamentos** — Pagar.me configurado mas não em produção real; leads da Maquininha vão para console
8. **WhatsApp** — integração via API própria com rate limiting; não usar webhooks de terceiros sem validar
