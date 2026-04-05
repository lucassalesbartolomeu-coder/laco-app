# Laço — Claude Code Context

## O que é o projeto

**Laço** é uma plataforma SaaS de planejamento de casamentos com dois públicos distintos:
- **Casais (noivos):** simulação de convidados por região, orçamento, fornecedores, presentes via Pix, timeline, site personalizado, identity kit visual com IA, papelaria
- **Cerimonialistas:** múltiplos casamentos, pipeline de leads (CRM), contratos digitais, comissões, equipe, questionários para casais, OCR de orçamentos em PDF, comunidade

**Produção:** https://laco-app.vercel.app | **Domínio:** https://laco.com.vc
**Banco:** Supabase PostgreSQL — gerenciado com `prisma db push` (sem histórico limpo de migrations, NUNCA usar `prisma migrate`)

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

> **Fonte da verdade completa:** `../brand-assets/BRAND.md` (pasta `brand-assets/` dentro de `Laco/`)
> **Brand board visual interativo:** `../brand-assets/laco-brand-board-v3.html` — abre no browser para ver o sistema completo
> Consulte antes de criar qualquer tela, componente ou asset visual.

### IMPORTANTE — Duas Paletas Coexistem

O projeto tem dois contextos visuais com paletas diferentes — não misture:

**1. App (protótipo em produção) — use isso em todas as telas:**
```ts
const GOLD    = "#A98950";   // âmbar/caramelo — active states, CTAs, labels
const BROWN   = "#3D322A";   // texto principal
const CREME   = "#FAF6EF";   // background principal
const BG_DARK = "#F0E8DA";   // background alternativo/secundário
```

**2. Marketing / Assets estáticos — para landing pages e OG images:**
```
background: #1A1F3A (midnight — APENAS cor de fundo, NUNCA texto, stroke ou fill de elemento)
gold-light: #C4A76C (versão clara do gold para usar sobre fundos escuros)
ivory:      #FAF6EF (mesmo ivory quente do app)
```

### ❌ Regras Absolutas — Azul Proibido

```
#1A1F3A  → NUNCA como: texto, stroke, fill de ícone, cor de elemento, decoração
           SÓ permitido como: cor de fundo (splash, dark marketing)

rgba(26,31,58,x) → NUNCA em nenhum contexto no app
#1A1F3A stroke   → NUNCA em SVGs de logo ou símbolo
```

Se encontrar `#1A1F3A` ou `rgba(26,31,58,x)` em qualquer stroke/fill de elemento visual → substituir por `#3D322A` (fundo claro) ou `rgba(250,246,239,x)` (fundo escuro).

### Tipografia no App

| Família | Uso |
|---------|-----|
| DM Sans 300/400/500 | Body, headings, botões, campos — tudo no app |
| Raleway 500 | Logo wordmark (`LAÇO`) — só o logotipo |
| Josefin Sans 300/500 | Labels de bottom nav, micro-labels de categoria uppercase |
| Cormorant Garamond 300i | Quotes, subtítulos emocionais — uso muito raro |

**Fontes carregadas via `next/font` no `layout.tsx`:** Raleway, DM Sans, Cormorant Garamond.
**Josefin Sans** — referenciada inline como `fontFamily: "'Josefin Sans', sans-serif"` (carregada via CDN ou link global — adicionar ao layout se ainda não estiver).

### Bottom Nav — 4 Tabs
```
Início    → /dashboard
Casamento → /casamento/[id]/planejar (hub unificado — convidados, orçamento, tarefas)
Design    → /casamento/[id]/meu-site (e rotas de design/identity-kit)
Mais      → /casamento/[id]/mais
```

Labels: Josefin Sans, 8.5px, weight 300, letter-spacing 0.14em, uppercase.
Active color: `#A98950` · Inactive: `rgba(61,50,42,0.42)`.

### Loading State Padrão
```tsx
<div className="min-h-screen flex items-center justify-center" style={{ background: CREME }}>
  <div className="w-7 h-7 border-[1.5px] border-t-transparent rounded-full animate-spin"
    style={{ borderColor: `${GOLD} transparent ${GOLD} ${GOLD}` }} />
</div>
```

### Assets de Logo (`/public/brand/`) — todos v3

Todos os SVGs principais foram atualizados para v3 (paleta quente, sem azul). Não há mais distinção legado/atual nos arquivos principais.

```
logo-light.svg        → horizontal, fundo creme #FAF6EF (APP — uso primário)
logo-dark.svg         → horizontal, fundo escuro #1A1F3A (marketing, splash)
symbol-light.svg      → símbolo isolado, fundo creme (ícone app, favicon SVG)
symbol-dark.svg       → símbolo isolado, fundo escuro (marketing)
wordmark-light.svg    → wordmark LAÇO, fundo claro — texto #3D322A
wordmark-dark.svg     → wordmark LAÇO, fundo escuro — texto #FAF6EF
logo-app-creme.svg    → alias de logo-light.svg (mantido por compatibilidade)
logo-dark-v3.svg      → alias de logo-dark.svg (mantido por compatibilidade)
symbol-app-v3.svg     → alias de symbol-light.svg (mantido por compatibilidade)
symbol-dark-v3.svg    → alias de symbol-dark.svg (mantido por compatibilidade)
app-icon-1024.png     → app icon 1024×1024
favicon-32.png        → favicon 32×32
og-default.png        → OG image 1200×630
```

**Cores do símbolo SVG por contexto:**

| Contexto | Loop esquerdo | Loop direito | Ponto central |
|----------|--------------|--------------|---------------|
| Fundo creme/branco | `rgba(61,50,42,0.40)` | `#A98950` | `#A98950` op 0.88 |
| Fundo champagne #F0E8DA | `rgba(61,50,42,0.35)` | `#A98950` | `#A98950` op 0.88 |
| Fundo escuro #1A1F3A | `rgba(250,246,239,0.65)` | `#C4A76C` | `#C4A76C` op 0.88 |
| Fundo gold #A98950 | `rgba(250,246,239,0.55)` | `#FAF6EF` | `#FAF6EF` op 0.88 |

❌ NUNCA usar `rgba(26,31,58,x)` (azul midnight) em nenhuma parte do símbolo
❌ NUNCA usar `#C9A96E` no app — use `#A98950` (gold âmbar) ou `#C4A76C` (gold-light)

**Wordmark LAÇO:**
- Fundo claro: `#3D322A` (Brown)
- Fundo escuro: `#FAF6EF` (Ivory quente)

> **Referências visuais:** `../brand-assets/logo-showcase.html` (todas as versões) e `../brand-assets/laco-brand-board-v3.html` (sistema completo)

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── [slug]/                   # Site público do casal (visto pelos convidados)
│   ├── api/                      # ~95 endpoints REST
│   ├── blog/                     # Listagem + posts (ISR 1h)
│   ├── casamento/
│   │   ├── [id]/
│   │   │   ├── layout.tsx        # AnimatedWrapper (Framer Motion)
│   │   │   ├── planejar/         # Hub de planejamento (simuladores, orçamento inteligente)
│   │   │   ├── execucao/         # Acompanhamento ao vivo
│   │   │   ├── convidados/       # Lista A/B/C, RSVP, mesas
│   │   │   ├── orcamento/        # Orçamento planejado vs real
│   │   │   ├── orcamento-inteligente/ # Sugestões de orçamento por IA
│   │   │   ├── simulador/        # Simulador de orçamento
│   │   │   ├── simulador-convidados/ # Simulador de presença por região
│   │   │   ├── presentes/        # Lista de presentes + pagamentos Pagar.me
│   │   │   ├── presentes-ia/     # Sugestões de presentes por IA
│   │   │   ├── identity-kit/     # Identity kit visual com IA + DALL-E
│   │   │   ├── meu-site/         # Construtor do site público do casal
│   │   │   ├── papelaria/        # Convite, save the date, menu
│   │   │   ├── fornecedores/     # Diretório + status + orçamento
│   │   │   ├── cotacoes/         # Comparação de cotações (+ OCR)
│   │   │   ├── contratos/        # Contratos digitais com assinatura dupla
│   │   │   ├── timeline/         # Cronograma do dia
│   │   │   ├── questionarios/    # Questionários do cerimonialista
│   │   │   ├── whatsapp-confirmacao/ # Configurar RSVP via WhatsApp
│   │   │   ├── maquininha/       # Integração Pagar.me
│   │   │   ├── conta-casamento/  # Configurações do casamento
│   │   │   └── mais/             # Menu de funcionalidades adicionais
│   │   └── novo/                 # Criar novo casamento
│   ├── cerimonialista/           # Painel completo do cerimonialista
│   ├── casamento-em-sao-paulo/   # Landing page SEO (ISR 24h)
│   ├── casamento-em-bh/          # Landing page SEO (ISR 24h)
│   ├── casamento-no-rio/         # Landing page SEO (ISR 24h)
│   ├── dashboard/                # Lista de casamentos do usuário
│   ├── design/                   # Página de design system interno
│   ├── home/                     # Homepage de marketing
│   ├── login/                    # Login/cadastro (Google OAuth + email)
│   ├── onboarding/               # Onboarding de 6 passos para casais novos
│   ├── planos/                   # Página de preços
│   ├── perfil/                   # Perfil, referral, conta
│   ├── registro/
│   │   └── cerimonialista/       # Cadastro específico de cerimonialista (CNPJ, região)
│   ├── questionario/[token]/     # RSVP de questionário via token público
│   ├── parceiro/[token]/         # Onboarding do parceiro/noivo co-organizador
│   ├── conectar/[code]/          # Cerimonialista aceita convite
│   ├── contratos/[id]/           # Assinar contrato digitalmente
│   └── r/[code]/                 # Redirect de link de referral
├── components/
│   ├── ui/                       # Button, Card, Skeleton, Toast, Badge
│   ├── design/                   # DesignHome, WizardEstilo, WizardSite, BrasaoSVG, etc.
│   ├── illustrations/            # Ilustrações SVG do app
│   ├── providers/                # SessionProvider, ToastProvider
│   ├── bottom-nav.tsx            # Nav inferior do casal (5 tabs)
│   ├── planner-bottom-nav.tsx    # Nav inferior do cerimonialista
│   ├── activation-checklist.tsx  # Onboarding com confetti
│   ├── smart-suggestions.tsx     # Sugestões da IA para o casamento
│   ├── push-subscribe-button.tsx # Opt-in de notificações push
│   ├── signature-canvas.tsx      # Canvas de assinatura para contratos
│   ├── share-whatsapp.tsx        # Compartilhar via WhatsApp
│   └── whatsapp-blast.tsx        # Envio em massa WhatsApp
├── hooks/
│   ├── use-realtime-guests.ts    # Supabase Realtime — stats ao vivo
│   ├── use-push-subscribe.ts     # Permissão + subscription push
│   └── use-toast.ts
├── lib/
│   ├── prisma.ts                 # Singleton PrismaClient
│   ├── auth.ts                   # Config NextAuth (authOptions)
│   ├── api-helpers.ts            # getAuthenticatedUser, verifyWeddingOwnership, errorResponse
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

### Design tokens em componentes de página
```ts
// Sempre declare no topo do componente — não use classes Tailwind de cor diretamente
const GOLD    = "#A98950";   // acento
const BROWN   = "#3D322A";   // texto
const CREME   = "#FAF6EF";   // background
const BG_DARK = "#F0E8DA";   // fundo alternativo
```

### API Routes
```ts
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { verifyWeddingOwnership } from "@/lib/api-helpers";
import * as Sentry from "@sentry/nextjs";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Verificar ownership de casamento (owner, partner ou planner)
    const { error, wedding, role } = await verifyWeddingOwnership(params.id, user.id);
    if (error === "not_found") return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (error === "forbidden") return NextResponse.json({ error: "forbidden" }, { status: 403 });

    // lógica aqui...
  } catch (error) {
    Sentry.captureException(error);
    return errorResponse();
  }
}
```

### Componentes de Página
- `"use client"` em páginas com hooks
- Loading state: usar o padrão de spinner creme/gold (ver seção Identidade Visual)
- Bottom nav casal: `<BottomNav weddingId={weddingId} />` em TODAS as páginas do casal
- Bottom nav cerimonialista: `<PlannerBottomNav />` em todas as páginas do cerimonialista
- Toast: `useToast()` de `@/hooks/use-toast`
- Ícones: `lucide-react` — não criar SVGs inline (exceto símbolo da marca)
- Confirmações: nunca usar `window.confirm()` — usar estado inline ou modal

### Tailwind
- Mobile-first
- `font-body` (DM Sans) para tudo; `font-display` (Raleway) só para o wordmark LAÇO
- Usar tokens Tailwind para shadows (`shadow-card`) e border-radius (`rounded-card`, `rounded-modal`)
- iOS safe-area: `pb-[env(safe-area-inset-bottom)]` em modais fixos e navs
- Usar `pb-bottom-nav` para conteúdo não ficar atrás da bottom nav

### Push Notifications (não-bloqueante)
```ts
sendPushToUser(userId, { title, body, icon }).catch(() => {});
```

---

## Autenticação e Roles

```
User.role:
  COUPLE      → casais (noivos) — acesso às rotas /casamento/* e /dashboard
  PLANNER     → cerimonialistas — acesso às rotas /cerimonialista/*
  ADMIN       → acesso total
```

### Acesso ao casamento (verifyWeddingOwnership)
- `owner`: userId === wedding.userId
- `partner`: userId === wedding.partnerUserId
- `planner`: WeddingPlannerAssignment ativo entre o user e o casamento

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

**Planos previstos:** Gratuito (50 convidados) · Pro R$99/mês · Cerimonialista R$199/mês
**Pagamentos:** Stripe não integrado ainda — Pagar.me está ativo apenas para presentes.

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

### Casal (autenticado — COUPLE ou ADMIN)

| Rota | Função |
|------|--------|
| `/dashboard` | Lista de casamentos do usuário |
| `/perfil` | Perfil, código de referral, gerenciamento de conta |
| `/casamento/novo` | Criar novo casamento |
| `/casamento/[id]/planejar` | Hub de planejamento — simuladores |
| `/casamento/[id]/execucao` | Acompanhamento — convidados ao vivo, orçamento real |
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

### Cerimonialista (autenticado — PLANNER ou ADMIN)

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

### Token/Código (acesso especial sem auth)

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

### Pagamentos (Pagar.me)
| Endpoint | Métodos | Função |
|----------|---------|--------|
| `/api/payments/orders` | POST | Criar ordem (Pix/Boleto/Cartão) para presentes |
| `/api/payments/webhook` | POST | Webhook Pagar.me (confirmar pagamento) |

### Push Notifications
| Endpoint | Métodos | Função |
|----------|---------|--------|
| `/api/push/subscribe` | POST, DELETE | Salvar/remover subscription de push (VAPID) |

### Casamento — Casal
| Endpoint | Métodos | Função |
|----------|---------|--------|
| `/api/weddings` | GET, POST | Listar casamentos / criar novo |
| `/api/weddings/[id]` | GET, PUT, DELETE | Detalhes / atualizar / deletar casamento |
| `/api/weddings/[id]/activity` | GET | Feed de atividades |
| `/api/weddings/[id]/events` | GET, POST | Eventos do casamento (civil, festa, etc.) |
| `/api/weddings/[id]/guests` | GET, POST | Listar / adicionar convidados |
| `/api/weddings/[id]/guests/bulk` | POST | Importação em lote |
| `/api/weddings/[id]/guests/stats` | GET | Stats (total, confirmados, pendentes, recusados) |
| `/api/weddings/[id]/guests/[guestId]` | GET, PATCH, PUT, DELETE | CRUD individual de convidado |
| `/api/weddings/[id]/budget` | GET, POST | Itens de orçamento |
| `/api/weddings/[id]/budget/[budgetId]` | GET, PUT, DELETE | CRUD item de orçamento |
| `/api/weddings/[id]/budget/summary` | GET | Totais e resumo |
| `/api/weddings/[id]/budget-expenses` | GET, POST | Gastos reais registrados |
| `/api/weddings/[id]/gifts` | GET, POST | Lista de presentes |
| `/api/weddings/[id]/gifts/[giftId]` | GET, PUT, DELETE | CRUD item de presente |
| `/api/weddings/[id]/vendors` | GET, POST | Fornecedores |
| `/api/weddings/[id]/vendors/[vendorId]` | GET, PUT, DELETE | CRUD fornecedor |
| `/api/weddings/[id]/quotes` | GET, POST | Cotações de fornecedores |
| `/api/weddings/[id]/quotes/[quoteId]` | GET, PUT, DELETE | CRUD cotação |
| `/api/weddings/[id]/timeline` | GET, POST | Cronograma do dia |
| `/api/weddings/[id]/timeline/[eventId]` | PATCH, DELETE | Atualizar/deletar evento |
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
| `/api/planner/dashboard` | GET | Métricas do painel |
| `/api/planner/weddings` | GET | Casamentos atribuídos |
| `/api/planner/weddings/[id]` | GET | Detalhes de casamento atribuído |
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
| `/api/planner/community/[id]/like` | POST | Curtir post |
| `/api/planner/community/[id]/comments` | POST | Comentar em post |
| `/api/planner/google-calendar/connect` | GET | Iniciar OAuth Google Calendar |
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
npm run dev                  # Desenvolvimento local
npm run build                # Build (inclui prisma generate)
npx prisma generate          # Gerar Prisma Client após alterar schema
npx prisma db push           # Aplicar schema ao banco (SEMPRE usar isso)
vercel --prod                # Deploy em produção
```

---

## Observações Críticas

1. **NUNCA usar `prisma migrate dev/deploy`** — banco tem drift. Sempre `prisma db push`
2. **URL pública** — usar `NEXT_PUBLIC_APP_URL ?? "https://laco.com.vc"` (nunca `NEXTAUTH_URL`)
3. **Paleta do app** — usar `GOLD = "#A98950"` / `BROWN = "#3D322A"` / `CREME = "#FAF6EF"`. Os tokens Tailwind `midnight/gold/ivory` são para marketing, não para as telas do app.
4. **Josefin Sans** — usada em 36+ páginas para labels da nav e micro-labels de categoria. Não está em `next/font` — precisa ser carregada via CDN ou link global se ainda não estiver.
5. **Sentry** — sem `authToken`, warnings de source map são esperados e não bloqueiam o build
6. **Google OAuth** — requer `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` no Vercel
7. **CPF e dados bancários** — cifrados em AES-256-GCM via `src/lib/crypto.ts`; nunca logar em plain text
8. **PWA custom worker** — `worker/index.js` detectado automaticamente pelo next-pwa; não usar `customWorkerSrc`
9. **Pagamentos** — Pagar.me ativo para presentes. Stripe NÃO integrado (feature flags retornam `true` para todos enquanto isso).
10. **WhatsApp** — integração via API própria com rate limiting; não usar webhooks de terceiros sem validar
11. **Ownership de casamento** — verificar sempre via `verifyWeddingOwnership()` (owner, partner e planner têm acesso)
12. **Push notifications** — sempre não-bloqueante: `.catch(() => {})`
13. **`lua-de-mel`** — rota existe mas é fora do escopo principal. O Laço é focado apenas em casamento.
