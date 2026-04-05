# Design: Aba Casamento — Hub Unificado para os Noivos

**Data:** 2026-04-05
**Status:** Aprovado

---

## Contexto

A bottom nav do casal tinha 5 abas onde "Planejar" e "Organizar" cobriam conteúdo sobrepostos e fragmentados. Esta feature unifica as duas em uma única aba chamada **Casamento**, reduzindo a nav para 4 itens e organizando todo o conteúdo de planejamento em 3 grupos semânticos claros.

---

## 1. Navegação

### Bottom Nav — de 5 para 4 abas

| # | Label | Rota | Mudança |
|---|-------|------|---------|
| 1 | Início | `/dashboard` | sem alteração |
| 2 | **Casamento** | `/casamento/[id]/planejar` | **novo** — substitui Planejar + Organizar |
| 3 | Design | `/casamento/[id]/meu-site` | sem alteração |
| 4 | Mais | `/casamento/[id]/mais` | sem alteração |

**Ícone sugerido:** anel de casamento ou coração simples (strokeWidth 1.4, 22×22px, padrão do projeto).

**Active state** da aba Casamento — ativa quando pathname inclui qualquer uma destas strings:
```
/planejar, /execucao, /convidados, /confirmacoes, /importar,
/orcamento-inteligente, /simulador-convidados, /simulador,
/orcamento, /presentes, /fornecedores, /contratos,
/timeline, /questionarios, /lua-de-mel, /tarefas,
/whatsapp-confirmacao
```

### Redirect
`/casamento/[id]/execucao` → redirect para `/casamento/[id]/planejar`

Implementado como redirect no `next.config.js`:
```js
{ source: '/casamento/:id/execucao', destination: '/casamento/:id/planejar', permanent: true }
```

---

## 2. Página "Casamento" (`/casamento/[id]/planejar`)

Reescreve a página atual de Planejar. Página única scrollável com 3 grupos, visual idêntico à tela de Organizar (cards brancos, borda gold, ícone emoji em quadrado champagne, seta `›`).

### Header
```
[label uppercase] Meu Casamento
[título]          Casamento
[subtítulo]       Convidados, orçamento, fornecedores, tarefas e o grande dia.
```

### Grupo 1 — Convidados & RSVP

| Ícone | Label | Descrição | Rota |
|-------|-------|-----------|------|
| 👥 | Lista de Convidados | Lista A/B/C, categorias, status RSVP e confirmações | `/convidados` |
| 💌 | Enviar Convite / Save the Date | Disparo com 1 clique para os grupos que você definir | `/whatsapp-confirmacao` |
| 🔢 | Simulador de Convidados | Importe contatos, detecte a cidade pelo DDD e preveja presença | `/simulador-convidados` |

### Grupo 2 — Orçamento & Contratos

| Ícone | Label | Descrição | Rota |
|-------|-------|-----------|------|
| 📊 | Simulador de Orçamento | Quiz por fornecedor — descubra quanto vai custar seu casamento | `/orcamento-inteligente` |
| 💰 | Orçamento Real | Custos reais vs estimados, parcelas, pagamentos | `/orcamento` |
| 🎁 | Lista de Presentes | Presentes recebidos, valores, agradecimentos | `/presentes` |
| 🏢 | Fornecedores & Contratos | Fornecedores com status de contrato e documentos em PDF | `/fornecedores` |

### Grupo 3 — Tarefas & Checklist

| Ícone | Label | Descrição | Rota |
|-------|-------|-----------|------|
| ✅ | Tarefas | Acompanhe tarefas do cerimonialista e adicione as suas | `/tarefas` |
| 🗓️ | Timeline do Dia | Cronograma completo do grande dia, passo a passo | `/timeline` |
| 📋 | Questionários | Responda questionários de preferências da sua cerimonialista | `/questionarios` |
| ✈️ | Lua de Mel | Destinos, pacotes e dicas para a viagem dos sonhos | `/lua-de-mel` |

---

## 3. Página Fornecedores & Contratos (`/casamento/[id]/fornecedores`)

Reescreve a página existente de fornecedores. Cada card de fornecedor exibe o status do contrato inline e uma seção de documentos PDF.

### Card de Fornecedor

```
┌─────────────────────────────────────────────┐
│ [ícone emoji]  Nome do Fornecedor           │
│                Categoria · R$ valor         │
│                ● Contrato assinado          │  ← badge
│                                             │
│  Documentos:                                │
│  📄 proposta.pdf          [×]               │
│  📄 contrato-v2.pdf       [×]               │
│  + Adicionar documento                      │
└─────────────────────────────────────────────┘
```

**Badge de status do contrato:**
- `● Contrato assinado` — cor verde suave (`#22C55E`)
- `○ Contrato pendente` — cor âmbar (`#A98950`)
- `— Sem contrato` — cor muted (`rgba(61,50,42,0.35)`)

O status é controlado por um novo campo `contractStatus` no modelo `Vendor`:
```prisma
enum VendorContractStatus {
  NONE     // sem contrato
  PENDING  // contrato pendente de assinatura
  SIGNED   // contrato assinado
}
```
Campo adicionado ao modelo `Vendor`: `contractStatus VendorContractStatus @default(NONE)`. O casal atualiza esse status manualmente via toggle no card do fornecedor.

### Upload de PDFs

- Botão "+ Adicionar documento" abre seletor de arquivo (`.pdf` only, máx 10 MB)
- Upload vai para bucket `vendor-documents` no Supabase Storage
- Caminho do arquivo: `{weddingId}/{vendorId}/{timestamp}-{filename}`
- Exibe nome do arquivo + botão de exclusão `[×]`
- Ao clicar no nome do arquivo, abre o PDF em nova aba (URL pública ou signed URL)

---

## 4. Modelo de Dados

Novo modelo adicionado ao `prisma/schema.prisma`:

```prisma
model VendorDocument {
  id        String   @id @default(cuid())
  vendorId  String
  vendor    Vendor   @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  name      String   // nome original do arquivo
  url       String   // URL do Supabase Storage
  size      Int?     // tamanho em bytes
  createdAt DateTime @default(now())

  @@index([vendorId])
}
```

Campos adicionados no modelo `Vendor`:
```prisma
contractStatus VendorContractStatus @default(NONE)
documents      VendorDocument[]
```

---

## 5. API Routes

### Status de Contrato do Fornecedor

| Método | Rota | Descrição |
|--------|------|-----------|
| `PATCH` | `/api/weddings/[id]/vendors/[vendorId]` | Já existe — adicionar suporte ao campo `contractStatus` (NONE \| PENDING \| SIGNED) |

### Documentos de Fornecedor

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/weddings/[id]/vendors/[vendorId]/documents` | Lista documentos do fornecedor |
| `POST` | `/api/weddings/[id]/vendors/[vendorId]/documents` | Upload de PDF — recebe `multipart/form-data`, salva no Supabase Storage, cria `VendorDocument` |
| `DELETE` | `/api/weddings/[id]/vendors/[vendorId]/documents/[docId]` | Remove documento do Storage e do banco |

**Supabase Storage bucket:** `vendor-documents` (público ou com signed URLs de 1h)

**Autorização:** todas as rotas verificam `verifyWeddingOwnership()` — owner, partner e planner têm acesso.

---

## 6. Fora do Escopo

- Preview inline de PDF (abre em nova aba, não renderiza no app)
- Categorização de documentos (contrato, orçamento, NF) — tudo é "documento"
- Contratos digitais com assinatura dupla (fluxo existente em `/contratos` permanece separado)
- Busca ou filtro de documentos por fornecedor

