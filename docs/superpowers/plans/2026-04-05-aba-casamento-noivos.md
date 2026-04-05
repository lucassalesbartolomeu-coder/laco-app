# Aba Casamento — Hub Unificado para os Noivos

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unir as abas "Planejar" e "Organizar" em uma única aba "Casamento" na bottom nav, reorganizar o conteúdo em 3 grupos semânticos, e expandir a página de fornecedores com status de contrato inline e upload de PDFs por fornecedor.

**Architecture:** A bottom nav passa de 5 para 4 abas. A rota `/casamento/[id]/planejar` é reescrita como hub com 3 grupos (Convidados & RSVP, Orçamento & Contratos, Tarefas & Checklist). A rota `/execucao` recebe redirect permanente para `/planejar`. A página de fornecedores é expandida com campo `contractStatus` (toggle manual) e upload de PDFs para o Supabase Storage.

**Tech Stack:** Next.js 14 App Router, Prisma 6, Supabase Storage (`@supabase/supabase-js`), TypeScript, Tailwind CSS com tokens inline (GOLD/BROWN/CREME).

---

## File Structure

| Ação | Arquivo |
|------|---------|
| Modify | `prisma/schema.prisma` |
| Modify | `src/components/bottom-nav.tsx` |
| Modify | `next.config.mjs` |
| Rewrite | `src/app/casamento/[id]/planejar/page.tsx` |
| Modify | `src/app/api/weddings/[id]/vendors/route.ts` |
| Modify | `src/app/api/weddings/[id]/vendors/[vendorId]/route.ts` |
| Create | `src/app/api/weddings/[id]/vendors/[vendorId]/documents/route.ts` |
| Create | `src/app/api/weddings/[id]/vendors/[vendorId]/documents/[docId]/route.ts` |
| Rewrite | `src/app/casamento/[id]/fornecedores/page.tsx` |

---

## Task 1: Prisma Schema — VendorContractStatus + VendorDocument

**Files:**
- Modify: `prisma/schema.prisma`

### Contexto
O modelo `Vendor` atual está em `prisma/schema.prisma` por volta da linha 228 e termina em `@@index([weddingId])`. Ele não tem campo `contractStatus` nem relação com documentos. Precisamos adicionar o enum `VendorContractStatus`, o modelo `VendorDocument`, e dois novos campos no `Vendor`.

- [ ] **Step 1: Adicionar enum VendorContractStatus ao schema**

Abra `prisma/schema.prisma` e adicione o enum logo após os outros enums existentes (ex: após `TaskStatus`). Se não houver enums definidos ainda no final do arquivo, adicione antes do modelo `Vendor`:

```prisma
enum VendorContractStatus {
  NONE
  PENDING
  SIGNED
}
```

- [ ] **Step 2: Adicionar campos ao modelo Vendor**

No modelo `Vendor` (linha ~228), adicione `contractStatus` e `documents` logo antes de `createdAt`:

```prisma
model Vendor {
  id        String   @id @default(cuid())
  weddingId String
  name      String
  category  String
  phone     String?
  email     String?
  website   String?
  budget    Float?
  status    String   @default("cotado")
  notes     String?
  contractStatus VendorContractStatus @default(NONE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  wedding   Wedding          @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  quotes    Quote[]
  documents VendorDocument[]

  @@index([weddingId])
}
```

- [ ] **Step 3: Adicionar modelo VendorDocument após o modelo Vendor**

Logo após o fechamento `}` do modelo `Vendor`, adicione:

```prisma
model VendorDocument {
  id        String   @id @default(cuid())
  vendorId  String
  name      String
  url       String
  size      Int?
  createdAt DateTime @default(now())

  vendor Vendor @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@index([vendorId])
}
```

- [ ] **Step 4: Aplicar schema ao banco**

```bash
npx prisma db push
```

Saída esperada: `Your database is now in sync with your Prisma schema.`

> ⚠️ NUNCA usar `prisma migrate`. Sempre `prisma db push`.

- [ ] **Step 5: Regenerar Prisma Client**

```bash
npx prisma generate
```

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: adiciona VendorContractStatus e VendorDocument ao schema"
```

---

## Task 2: Bottom Nav 4 Abas + Redirect /execucao

**Files:**
- Modify: `src/components/bottom-nav.tsx`
- Modify: `next.config.mjs`

### Contexto
O `bottom-nav.tsx` tem 5 tabs: Início, Planejar, Design, Organizar, Mais. Precisamos remover Planejar e Organizar e adicionar uma tab "Casamento" com ícone de coração. O `next.config.mjs` usa `withSentryConfig(withPWA(nextConfig), ...)` — precisamos adicionar `redirects` ao objeto `nextConfig`.

- [ ] **Step 1: Substituir ícones e tabs no bottom-nav.tsx**

Abra `src/components/bottom-nav.tsx`. Remova `PlanejarIcon` e `OrganizarIcon`. Adicione `CasamentoIcon` após `InicioIcon`:

```tsx
const CasamentoIcon = () => (
  <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);
```

- [ ] **Step 2: Substituir o array `tabs` por 4 entradas**

Substitua o array `tabs` inteiro (dentro de `export default function BottomNav`) pelo seguinte:

```tsx
const tabs = [
  {
    label: "Início",
    href: "/dashboard",
    icon: <InicioIcon />,
    active: isHome,
    disabled: false,
  },
  {
    label: "Casamento",
    href: weddingBase ? `${weddingBase}/planejar` : null,
    icon: <CasamentoIcon />,
    active:
      isActive("/planejar") ||
      isActive("/execucao") ||
      isActive("/convidados") ||
      isActive("/confirmacoes") ||
      isActive("/importar") ||
      isActive("/orcamento-inteligente") ||
      isActive("/simulador-convidados") ||
      isActive("/simulador") ||
      isActive("/orcamento") ||
      isActive("/presentes") ||
      isActive("/fornecedores") ||
      isActive("/contratos") ||
      isActive("/timeline") ||
      isActive("/questionarios") ||
      isActive("/lua-de-mel") ||
      isActive("/tarefas") ||
      isActive("/whatsapp-confirmacao"),
    disabled: !weddingBase,
  },
  {
    label: "Design",
    href: weddingBase ? `${weddingBase}/meu-site` : null,
    icon: <DesignIcon />,
    active: isActive("/meu-site") || isActive("/identity-kit"),
    disabled: !weddingBase,
  },
  {
    label: "Mais",
    href: weddingBase ? `${weddingBase}/mais` : "/perfil",
    icon: <MaisIcon />,
    active: isActive("/mais") || isActive("/perfil"),
    disabled: false,
  },
];
```

- [ ] **Step 3: Adicionar redirect no next.config.mjs**

No objeto `nextConfig`, adicione a função `redirects` antes de `compress`:

```js
const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
  async redirects() {
    return [
      {
        source: "/casamento/:id/execucao",
        destination: "/casamento/:id/planejar",
        permanent: true,
      },
    ];
  },
  images: {
    // ... conteúdo existente sem alteração
  },
  compress: true,
};
```

> Atenção: mantenha todo o resto do arquivo (`withSentryConfig`, `withPWA`, `runtimeCaching`) exatamente igual.

- [ ] **Step 4: Verificar build**

```bash
npm run build
```

Esperado: sem erros TypeScript. Warnings de Sentry source map são normais.

- [ ] **Step 5: Commit**

```bash
git add src/components/bottom-nav.tsx next.config.mjs
git commit -m "feat: bottom nav 4 abas (Casamento substitui Planejar + Organizar) + redirect /execucao"
```

---

## Task 3: Hub Page Casamento (/casamento/[id]/planejar)

**Files:**
- Rewrite: `src/app/casamento/[id]/planejar/page.tsx`

### Contexto
O arquivo atual hospeda os simuladores (3 cards). Vamos substituir completamente por um hub com 3 grupos semânticos. O visual segue o padrão da página `/execucao` (cards brancos agrupados, sem ícone SVG — usa emoji). Usar tokens inline GOLD/BROWN/CREME/BG_DARK, nunca classes Tailwind `bg-gold` ou `text-midnight`.

- [ ] **Step 1: Reescrever src/app/casamento/[id]/planejar/page.tsx**

Substitua o conteúdo inteiro pelo seguinte:

```tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import BottomNav from "@/components/bottom-nav";

const GOLD    = "#A98950";
const BROWN   = "#3D322A";
const CREME   = "#FAF6EF";
const BG_DARK = "#F0E8DA";

export default function CasamentoHubPage() {
  const params = useParams();
  const weddingId = params?.id as string;
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREME }}>
        <div className="w-7 h-7 border-[1.5px] border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${GOLD} transparent ${GOLD} ${GOLD}` }} />
      </div>
    );
  }
  if (!session) return null;

  const base = `/casamento/${weddingId}`;

  const groups = [
    {
      label: "Convidados & RSVP",
      items: [
        { href: `${base}/convidados`, icon: "👥", title: "Lista de Convidados", desc: "Lista A/B/C, categorias, status RSVP e confirmações" },
        { href: `${base}/whatsapp-confirmacao`, icon: "💌", title: "Enviar Convite / Save the Date", desc: "Disparo com 1 clique para os grupos que você definir" },
        { href: `${base}/simulador-convidados`, icon: "🔢", title: "Simulador de Convidados", desc: "Importe contatos, detecte a cidade pelo DDD e preveja presença" },
      ],
    },
    {
      label: "Orçamento & Contratos",
      items: [
        { href: `${base}/orcamento-inteligente`, icon: "📊", title: "Simulador de Orçamento", desc: "Quiz por fornecedor — descubra quanto vai custar seu casamento" },
        { href: `${base}/orcamento`, icon: "💰", title: "Orçamento Real", desc: "Custos reais vs estimados, parcelas, pagamentos" },
        { href: `${base}/presentes`, icon: "🎁", title: "Lista de Presentes", desc: "Presentes recebidos, valores, agradecimentos" },
        { href: `${base}/fornecedores`, icon: "🏢", title: "Fornecedores & Contratos", desc: "Fornecedores com status de contrato e documentos em PDF" },
      ],
    },
    {
      label: "Tarefas & Checklist",
      items: [
        { href: `${base}/tarefas`, icon: "✅", title: "Tarefas", desc: "Acompanhe tarefas do cerimonialista e adicione as suas" },
        { href: `${base}/timeline`, icon: "🗓️", title: "Timeline do Dia", desc: "Cronograma completo do grande dia, passo a passo" },
        { href: `${base}/questionarios`, icon: "📋", title: "Questionários", desc: "Responda questionários de preferências da sua cerimonialista" },
        { href: `${base}/lua-de-mel`, icon: "✈️", title: "Lua de Mel", desc: "Destinos, pacotes e dicas para a viagem dos sonhos" },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>

      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <p className="text-[9px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "rgba(61,50,42,0.36)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
          Meu Casamento
        </p>
        <h1 className="text-[30px] font-light leading-tight mb-1"
          style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif" }}>
          Casamento
        </h1>
        <p className="text-[12px] leading-relaxed" style={{ color: "rgba(61,50,42,0.58)" }}>
          Convidados, orçamento, fornecedores, tarefas e o grande dia.
        </p>
      </div>

      {/* Ornamental divider */}
      <div className="flex items-center gap-2.5 mx-5 mb-5">
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
        <div className="w-[5px] h-[5px] rotate-45 opacity-55 flex-shrink-0" style={{ background: GOLD }} />
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
      </div>

      <div className="px-5 space-y-5 pb-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-[9.5px] tracking-[0.3em] uppercase pb-2.5"
              style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              {group.label}
            </p>
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "white", border: "1.5px solid rgba(169,137,80,0.16)", boxShadow: "0 1px 6px rgba(61,50,42,0.05)" }}>
              {group.items.map((item, idx) => (
                <div key={item.href}
                  style={idx > 0 ? { borderTop: "1px solid rgba(169,137,80,0.09)" } : undefined}>
                  <Link href={item.href}
                    className="flex items-center gap-3.5 px-4 py-3.5 transition-colors active:bg-stone-50">
                    <div className="w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-shrink-0 text-[18px]"
                      style={{ background: BG_DARK }}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium leading-tight" style={{ color: BROWN }}>
                        {item.title}
                      </p>
                      <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "rgba(61,50,42,0.36)" }}>
                        {item.desc}
                      </p>
                    </div>
                    <span className="text-[18px] flex-shrink-0" style={{ color: "rgba(169,137,80,0.40)" }}>›</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Esperado: sem erros TypeScript.

- [ ] **Step 3: Commit**

```bash
git add src/app/casamento/[id]/planejar/page.tsx
git commit -m "feat: reescreve /planejar como hub Casamento com 3 grupos semânticos"
```

---

## Task 4: APIs — GET com documentos, PATCH contractStatus, CRUD documentos

**Files:**
- Modify: `src/app/api/weddings/[id]/vendors/route.ts`
- Modify: `src/app/api/weddings/[id]/vendors/[vendorId]/route.ts`
- Create: `src/app/api/weddings/[id]/vendors/[vendorId]/documents/route.ts`
- Create: `src/app/api/weddings/[id]/vendors/[vendorId]/documents/[docId]/route.ts`

### Contexto
O GET `/api/weddings/[id]/vendors` usa `select` e não retorna `contractStatus` nem `documents`. O PUT de vendor não conhece `contractStatus`. Precisamos: (1) modificar o GET para incluir os novos campos via `include`, (2) adicionar PATCH no vendor para atualizar só `contractStatus`, (3) criar rotas de documentos.

Para o Supabase Storage no servidor, usar `SUPABASE_SERVICE_ROLE_KEY` (não a anon key). O bucket `vendor-documents` deve estar criado no Supabase Dashboard como **public** antes do deploy.

- [ ] **Step 1: Modificar GET /vendors para incluir contractStatus e documents**

Em `src/app/api/weddings/[id]/vendors/route.ts`, substitua o bloco `findMany` atual:

```ts
const vendors = await prisma.vendor.findMany({
  where,
  orderBy: { createdAt: "desc" },
  include: {
    documents: {
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, url: true, size: true, createdAt: true },
    },
  },
});
```

> Remove o `select` existente — `include` já retorna todos os campos do Vendor por padrão, incluindo `contractStatus`.

- [ ] **Step 2: Adicionar PATCH handler em vendors/[vendorId]/route.ts**

Ao final do arquivo `src/app/api/weddings/[id]/vendors/[vendorId]/route.ts`, adicione:

```ts
// PATCH /api/weddings/[id]/vendors/[vendorId] — Atualiza campos parciais (ex: contractStatus)
export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, vendorId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const existing = await prisma.vendor.findFirst({
      where: { id: vendorId, weddingId: id },
    });
    if (!existing) return notFoundResponse("Fornecedor");

    const body = await request.json();

    const VALID_CONTRACT_STATUSES = ["NONE", "PENDING", "SIGNED"];
    if (body.contractStatus !== undefined && !VALID_CONTRACT_STATUSES.includes(body.contractStatus)) {
      return validationError("contractStatus inválido");
    }

    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        ...(body.contractStatus !== undefined && { contractStatus: body.contractStatus }),
      },
    });

    return NextResponse.json(vendor);
  } catch (error) {
    console.error("PATCH /api/weddings/[id]/vendors/[vendorId] error:", error);
    return errorResponse();
  }
}
```

- [ ] **Step 3: Criar src/app/api/weddings/[id]/vendors/[vendorId]/documents/route.ts**

Crie o arquivo com o conteúdo abaixo. Este arquivo lida com GET (listar) e POST (upload):

```ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  verifyWeddingOwnership,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  errorResponse,
} from "@/lib/api-helpers";
import * as Sentry from "@sentry/nextjs";

type Params = { params: Promise<{ id: string; vendorId: string }> };

const BUCKET = "vendor-documents";
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/weddings/[id]/vendors/[vendorId]/documents
export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, vendorId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const vendor = await prisma.vendor.findFirst({ where: { id: vendorId, weddingId: id } });
    if (!vendor) return notFoundResponse("Fornecedor");

    const documents = await prisma.vendorDocument.findMany({
      where: { vendorId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    Sentry.captureException(error);
    return errorResponse();
  }
}

// POST /api/weddings/[id]/vendors/[vendorId]/documents
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, vendorId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const vendor = await prisma.vendor.findFirst({ where: { id: vendorId, weddingId: id } });
    if (!vendor) return notFoundResponse("Fornecedor");

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande (máx 10 MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${id}/${vendorId}/${timestamp}-${safeName}`;

    const supabase = getSupabaseAdmin();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType: "application/pdf", upsert: false });

    if (uploadError) {
      Sentry.captureException(uploadError);
      return NextResponse.json({ error: "Falha no upload" }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    const doc = await prisma.vendorDocument.create({
      data: {
        vendorId,
        name: file.name,
        url: publicUrl,
        size: file.size,
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    Sentry.captureException(error);
    return errorResponse();
  }
}
```

- [ ] **Step 4: Criar src/app/api/weddings/[id]/vendors/[vendorId]/documents/[docId]/route.ts**

```ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  verifyWeddingOwnership,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  errorResponse,
} from "@/lib/api-helpers";
import * as Sentry from "@sentry/nextjs";

type Params = { params: Promise<{ id: string; vendorId: string; docId: string }> };

const BUCKET = "vendor-documents";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// DELETE /api/weddings/[id]/vendors/[vendorId]/documents/[docId]
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, vendorId, docId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const doc = await prisma.vendorDocument.findFirst({
      where: { id: docId, vendorId },
      include: { vendor: { select: { weddingId: true } } },
    });

    if (!doc || doc.vendor.weddingId !== id) return notFoundResponse("Documento");

    // Extrair o path relativo da URL pública do Supabase Storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const baseUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/`;
    const storagePath = doc.url.startsWith(baseUrl)
      ? doc.url.slice(baseUrl.length)
      : null;

    if (storagePath) {
      const supabase = getSupabaseAdmin();
      await supabase.storage.from(BUCKET).remove([storagePath]);
    }

    await prisma.vendorDocument.delete({ where: { id: docId } });

    return NextResponse.json({ message: "Documento removido" });
  } catch (error) {
    Sentry.captureException(error);
    return errorResponse();
  }
}
```

- [ ] **Step 5: Verificar build**

```bash
npm run build
```

Esperado: sem erros TypeScript.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/weddings/[id]/vendors/route.ts \
        src/app/api/weddings/[id]/vendors/[vendorId]/route.ts \
        src/app/api/weddings/[id]/vendors/[vendorId]/documents/route.ts \
        src/app/api/weddings/[id]/vendors/[vendorId]/documents/[docId]/route.ts
git commit -m "feat: vendor API — contractStatus PATCH + documentos CRUD com Supabase Storage"
```

---

## Task 5: Reescrever Página de Fornecedores

**Files:**
- Rewrite: `src/app/casamento/[id]/fornecedores/page.tsx`

### Contexto
A página atual tem CRUD completo de fornecedores mas usa tokens errados (`bg-midnight`, `bg-gold` — são para marketing). Precisamos:
1. Corrigir tokens de cor para inline GOLD/BROWN/CREME
2. Adicionar badge de contractStatus com toggle (cicla NONE → PENDING → SIGNED → NONE)
3. Adicionar seção de documentos em cada card com upload e exclusão
4. Manter todo o CRUD existente (criar, editar, deletar fornecedor)

Antes de implementar, leia o arquivo atual em `src/app/casamento/[id]/fornecedores/page.tsx` para entender a estrutura existente.

- [ ] **Step 1: Reescrever src/app/casamento/[id]/fornecedores/page.tsx**

Substitua o conteúdo completo pelo seguinte:

```tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BottomNav from "@/components/bottom-nav";

const GOLD    = "#A98950";
const BROWN   = "#3D322A";
const CREME   = "#FAF6EF";
const BG_DARK = "#F0E8DA";

const CATEGORIES = [
  "Fotografia", "Cinematografia", "Buffet", "Bebidas", "Bolo / Doces",
  "Decoração", "Floricultura", "Iluminação / Som", "DJ / Música / Banda",
  "Local / Espaço", "Vestido", "Traje", "Cerimonial", "Convites / Papelaria",
  "Transporte", "Outros",
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  cotado:     { label: "Cotado",     bg: "rgba(169,137,80,0.08)",  color: GOLD },
  contratado: { label: "Contratado", bg: "rgba(34,197,94,0.10)",   color: "#16a34a" },
  cancelado:  { label: "Cancelado",  bg: "rgba(239,68,68,0.08)",   color: "#dc2626" },
};

const CONTRACT_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  NONE:    { label: "Sem contrato",       color: "rgba(61,50,42,0.35)", dot: "—" },
  PENDING: { label: "Contrato pendente",  color: GOLD,                  dot: "○" },
  SIGNED:  { label: "Contrato assinado",  color: "#16a34a",             dot: "●" },
};

const CONTRACT_CYCLE: Record<string, string> = { NONE: "PENDING", PENDING: "SIGNED", SIGNED: "NONE" };

interface VendorDocument {
  id: string;
  name: string;
  url: string;
  size: number | null;
  createdAt: string;
}

interface Vendor {
  id: string;
  name: string;
  category: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  budget: number | null;
  status: string;
  notes: string | null;
  contractStatus: "NONE" | "PENDING" | "SIGNED";
  documents: VendorDocument[];
}

interface FormState {
  name: string; category: string; phone: string; email: string;
  website: string; budget: string; status: string; notes: string;
}

const EMPTY: FormState = {
  name: "", category: CATEGORIES[0], phone: "", email: "",
  website: "", budget: "", status: "cotado", notes: "",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function FornecedoresPage() {
  const params = useParams();
  const weddingId = params?.id as string;
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingUploadVendorId, setPendingUploadVendorId] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/weddings/${weddingId}/vendors`);
    if (res.ok) setVendors(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [weddingId]);

  function openNew() { setEditing(null); setForm(EMPTY); setShowForm(true); }

  function openEdit(v: Vendor) {
    setEditing(v);
    setForm({
      name: v.name, category: v.category,
      phone: v.phone ?? "", email: v.email ?? "",
      website: v.website ?? "",
      budget: v.budget != null ? String(v.budget) : "",
      status: v.status, notes: v.notes ?? "",
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    const url = editing
      ? `/api/weddings/${weddingId}/vendors/${editing.id}`
      : `/api/weddings/${weddingId}/vendors`;
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, budget: form.budget ? Number(form.budget) : null }),
    });
    if (res.ok) { await load(); setShowForm(false); }
    setSaving(false);
  }

  async function remove(vendorId: string) {
    await fetch(`/api/weddings/${weddingId}/vendors/${vendorId}`, { method: "DELETE" });
    setVendors(v => v.filter(x => x.id !== vendorId));
    setConfirmDeleteId(null);
  }

  async function cycleContractStatus(vendor: Vendor) {
    const next = CONTRACT_CYCLE[vendor.contractStatus] as Vendor["contractStatus"];
    const res = await fetch(`/api/weddings/${weddingId}/vendors/${vendor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractStatus: next }),
    });
    if (res.ok) {
      setVendors(v => v.map(x => x.id === vendor.id ? { ...x, contractStatus: next } : x));
    }
  }

  function triggerUpload(vendorId: string) {
    setPendingUploadVendorId(vendorId);
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !pendingUploadVendorId) return;
    e.target.value = "";

    setUploadingFor(pendingUploadVendorId);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
      `/api/weddings/${weddingId}/vendors/${pendingUploadVendorId}/documents`,
      { method: "POST", body: formData }
    );

    if (res.ok) {
      const doc: VendorDocument = await res.json();
      setVendors(v => v.map(x =>
        x.id === pendingUploadVendorId
          ? { ...x, documents: [...x.documents, doc] }
          : x
      ));
    }
    setUploadingFor(null);
    setPendingUploadVendorId(null);
  }

  async function deleteDocument(vendorId: string, docId: string) {
    const res = await fetch(
      `/api/weddings/${weddingId}/vendors/${vendorId}/documents/${docId}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setVendors(v => v.map(x =>
        x.id === vendorId
          ? { ...x, documents: x.documents.filter(d => d.id !== docId) }
          : x
      ));
    }
  }

  const filtered = vendors.filter(v => {
    if (filterStatus !== "todos" && v.status !== filterStatus) return false;
    if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalContratado = vendors
    .filter(v => v.status === "contratado")
    .reduce((s, v) => s + (v.budget ?? 0), 0);
  const totalCotado = vendors
    .filter(v => v.status === "cotado")
    .reduce((s, v) => s + (v.budget ?? 0), 0);

  const groups: Record<string, Vendor[]> = {};
  for (const v of filtered) {
    if (!groups[v.category]) groups[v.category] = [];
    groups[v.category].push(v);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREME }}>
        <div className="w-7 h-7 border-[1.5px] border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${GOLD} transparent ${GOLD} ${GOLD}` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] tracking-[0.28em] uppercase mb-1"
              style={{ color: "rgba(61,50,42,0.36)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              Orçamento & Contratos
            </p>
            <h1 className="text-[30px] font-light leading-tight"
              style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif" }}>
              Fornecedores
            </h1>
          </div>
          <button onClick={openNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm mt-2 flex-shrink-0"
            style={{ background: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Novo
          </button>
        </div>
      </div>

      {/* Ornamental divider */}
      <div className="flex items-center gap-2.5 mx-5 mb-5">
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
        <div className="w-[5px] h-[5px] rotate-45 opacity-55 flex-shrink-0" style={{ background: GOLD }} />
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
      </div>

      <div className="px-5 space-y-5 pb-4">

        {/* Summary cards */}
        {vendors.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-4 text-white"
              style={{ background: BROWN }}>
              <p className="text-xs mb-1" style={{ opacity: 0.6, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>Contratado</p>
              <p className="text-xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{fmt(totalContratado)}</p>
            </div>
            <div className="rounded-2xl p-4"
              style={{ background: "white", border: "1.5px solid rgba(169,137,80,0.20)" }}>
              <p className="text-xs mb-1" style={{ color: "rgba(61,50,42,0.50)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>Em cotação</p>
              <p className="text-xl font-light" style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif" }}>{fmt(totalCotado)}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar fornecedor..."
            className="flex-1 px-3 py-2 text-sm outline-none rounded-xl"
            style={{ border: "1.5px solid rgba(169,137,80,0.20)", color: BROWN, background: "white", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm outline-none rounded-xl"
            style={{ border: "1.5px solid rgba(169,137,80,0.20)", color: BROWN, background: "white", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
            <option value="todos">Todos</option>
            <option value="cotado">Cotado</option>
            <option value="contratado">Contratado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {/* Empty state */}
        {vendors.length === 0 && (
          <div className="rounded-2xl p-12 text-center"
            style={{ background: "white", border: "1.5px solid rgba(169,137,80,0.16)" }}>
            <p className="text-sm mb-5" style={{ color: "rgba(61,50,42,0.42)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              Nenhum fornecedor ainda
            </p>
            <button onClick={openNew}
              className="px-6 py-2.5 rounded-xl text-white text-sm"
              style={{ background: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              Adicionar fornecedor
            </button>
          </div>
        )}

        {/* Grouped list */}
        {Object.entries(groups).map(([cat, items]) => (
          <div key={cat}>
            <p className="text-[9.5px] tracking-[0.3em] uppercase pb-2.5"
              style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              {cat}
            </p>
            <div className="space-y-3">
              {items.map(v => {
                const sc = STATUS_CONFIG[v.status] ?? { label: v.status, bg: BG_DARK, color: BROWN };
                const cc = CONTRACT_CONFIG[v.contractStatus];
                return (
                  <div key={v.id} className="rounded-2xl p-4"
                    style={{ background: "white", border: "1.5px solid rgba(169,137,80,0.16)", boxShadow: "0 1px 6px rgba(61,50,42,0.04)" }}>

                    {/* Vendor header row */}
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-[13px] font-medium" style={{ color: BROWN }}>{v.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: sc.bg, color: sc.color, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                            {sc.label}
                          </span>
                        </div>
                        {v.budget != null && (
                          <p className="text-[12px] font-medium mb-1" style={{ color: GOLD }}>
                            {fmt(v.budget)}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                          {v.phone && (
                            <a href={`tel:${v.phone}`} className="text-[11px]" style={{ color: "rgba(61,50,42,0.50)" }}>{v.phone}</a>
                          )}
                          {v.email && (
                            <a href={`mailto:${v.email}`} className="text-[11px] truncate max-w-[180px]" style={{ color: "rgba(61,50,42,0.50)" }}>{v.email}</a>
                          )}
                          {v.website && (
                            <a href={v.website} target="_blank" rel="noopener noreferrer"
                              className="text-[11px]" style={{ color: GOLD }}>Site ↗</a>
                          )}
                        </div>
                        {v.notes && (
                          <p className="text-[11px] mt-1.5 line-clamp-2" style={{ color: "rgba(61,50,42,0.42)" }}>{v.notes}</p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-1 flex-shrink-0 items-center">
                        {confirmDeleteId === v.id ? (
                          <>
                            <button onClick={() => remove(v.id)}
                              className="px-2 py-1 rounded-lg text-xs text-white"
                              style={{ background: "#ef4444", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                              Remover
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded-lg text-xs"
                              style={{ color: "rgba(61,50,42,0.42)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                              Não
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => openEdit(v)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: "rgba(61,50,42,0.30)" }}>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button onClick={() => setConfirmDeleteId(v.id)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: "rgba(61,50,42,0.30)" }}>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="mt-3 mb-3 h-px" style={{ background: "rgba(169,137,80,0.09)" }} />

                    {/* Contract status toggle */}
                    <button
                      onClick={() => cycleContractStatus(v)}
                      className="flex items-center gap-1.5 mb-3 transition-opacity hover:opacity-70"
                    >
                      <span className="text-[12px]" style={{ color: cc.color }}>{cc.dot}</span>
                      <span className="text-[10px]" style={{ color: cc.color, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                        {cc.label}
                      </span>
                    </button>

                    {/* Documents */}
                    {v.documents.length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        {v.documents.map(doc => (
                          <div key={doc.id} className="flex items-center gap-2">
                            <a href={doc.url} target="_blank" rel="noopener noreferrer"
                              className="flex-1 flex items-center gap-1.5 min-w-0">
                              <span className="text-[13px] flex-shrink-0">📄</span>
                              <span className="text-[11px] truncate" style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                                {doc.name}
                              </span>
                            </a>
                            <button
                              onClick={() => deleteDocument(v.id, doc.id)}
                              className="flex-shrink-0 text-[11px] transition-opacity hover:opacity-70"
                              style={{ color: "rgba(61,50,42,0.35)" }}>
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => triggerUpload(v.id)}
                      disabled={uploadingFor === v.id}
                      className="flex items-center gap-1.5 text-[10px] disabled:opacity-50"
                      style={{ color: "rgba(61,50,42,0.42)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                      {uploadingFor === v.id ? (
                        <>
                          <div className="w-3 h-3 border border-t-transparent rounded-full animate-spin flex-shrink-0"
                            style={{ borderColor: `${GOLD} transparent ${GOLD} ${GOLD}` }} />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <span>+</span>
                          Adicionar documento
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[22px] font-light" style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif" }}>
                  {editing ? "Editar fornecedor" : "Novo fornecedor"}
                </h2>
                <button onClick={() => setShowForm(false)} style={{ color: "rgba(61,50,42,0.30)" }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "rgba(61,50,42,0.50)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                    Nome *
                  </label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Ex: Studio Luz Fotografia"
                    className="w-full px-3 py-2.5 text-sm outline-none rounded-xl"
                    style={{ border: "1.5px solid rgba(169,137,80,0.25)", color: BROWN }} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "rgba(61,50,42,0.50)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>Categoria *</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm outline-none rounded-xl"
                      style={{ border: "1.5px solid rgba(169,137,80,0.25)", color: BROWN }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "rgba(61,50,42,0.50)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm outline-none rounded-xl"
                      style={{ border: "1.5px solid rgba(169,137,80,0.25)", color: BROWN }}>
                      <option value="cotado">Cotado</option>
                      <option value="contratado">Contratado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "rgba(61,50,42,0.50)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>Valor orçado (R$)</label>
                  <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2.5 text-sm outline-none rounded-xl"
                    style={{ border: "1.5px solid rgba(169,137,80,0.25)", color: BROWN }} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "rgba(61,50,42,0.50)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>Telefone</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="(11) 9..."
                      className="w-full px-3 py-2.5 text-sm outline-none rounded-xl"
                      style={{ border: "1.5px solid rgba(169,137,80,0.25)", color: BROWN }} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "rgba(61,50,42,0.50)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="email@..."
                      className="w-full px-3 py-2.5 text-sm outline-none rounded-xl"
                      style={{ border: "1.5px solid rgba(169,137,80,0.25)", color: BROWN }} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "rgba(61,50,42,0.50)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>Site / Instagram</label>
                  <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2.5 text-sm outline-none rounded-xl"
                    style={{ border: "1.5px solid rgba(169,137,80,0.25)", color: BROWN }} />
                </div>

                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "rgba(61,50,42,0.50)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>Observações</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2} placeholder="Condições, detalhes..."
                    className="w-full px-3 py-2.5 text-sm outline-none rounded-xl resize-none"
                    style={{ border: "1.5px solid rgba(169,137,80,0.25)", color: BROWN }} />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl text-sm"
                  style={{ border: "1.5px solid rgba(169,137,80,0.25)", color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                  Cancelar
                </button>
                <button onClick={save} disabled={saving || !form.name.trim()}
                  className="flex-1 py-3 rounded-xl text-sm text-white disabled:opacity-50"
                  style={{ background: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                  {saving ? "Salvando..." : editing ? "Salvar" : "Adicionar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Esperado: sem erros TypeScript.

- [ ] **Step 3: Commit**

```bash
git add src/app/casamento/[id]/fornecedores/page.tsx
git commit -m "feat: fornecedores — contractStatus toggle inline + upload de PDFs por fornecedor"
```

---

## Setup Manual (antes do deploy)

> ⚠️ O bucket do Supabase Storage **não é criado automaticamente**. Antes de fazer deploy em produção, crie o bucket manualmente:
>
> 1. Acesse o Supabase Dashboard → Storage
> 2. Clique em "New bucket"
> 3. Nome: `vendor-documents`
> 4. Marque como **Public** (para URLs públicas diretas)
> 5. Salve

---

## Self-Review Checklist

- [x] Spec coverage: nav 4 abas ✓, redirect /execucao ✓, hub 3 grupos ✓, contractStatus badge+toggle ✓, upload PDF ✓, delete PDF ✓
- [x] Sem placeholders
- [x] Tipos consistentes: `VendorContractStatus` usado como `"NONE" | "PENDING" | "SIGNED"` nas tasks 1, 4, 5
- [x] `CONTRACT_CYCLE` mapeia corretamente NONE→PENDING→SIGNED→NONE
- [x] Path de storage extraído via `slice(baseUrl.length)` na task 4 DELETE
