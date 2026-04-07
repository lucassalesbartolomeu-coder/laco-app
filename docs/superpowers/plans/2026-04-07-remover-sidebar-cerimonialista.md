# Remover Sidebar Cerimonialista — Unificar no Bottom Nav

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar a sidebar (desktop e mobile/hamburguer) da área cerimonialista e tornar todos os itens acessíveis exclusivamente pelo bottom nav de 5 tabs, com hub pages para os grupos "Gestão" e "Mais".

**Architecture:** O layout atual tem sidebar desktop + header mobile com drawer overlay + bottom nav (só mobile). Simplificamos para: sem sidebar, sem header mobile, bottom nav em todas as telas. Tabs com sub-itens (Gestão, Mais) apontam para páginas hub que listam os destinos em grid de cards.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS, lucide-react, design tokens do projeto (GOLD/BROWN/CREME/BG_DARK).

---

## Mapa de arquivos

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `src/app/cerimonialista/layout.tsx` | Modificar | Remover sidebar, header mobile, overlay; expor bottom nav em todas as telas |
| `src/components/planner-bottom-nav.tsx` | Modificar | Atualizar hrefs de Gestão e Mais |
| `src/app/cerimonialista/gestao/page.tsx` | Criar | Hub page — grid de 8 itens da seção Gestão |
| `src/app/cerimonialista/mais/page.tsx` | Criar | Hub page — Portfólio, Comunidade e Notificações |

---

## Task 1: Simplificar layout.tsx

Remove toda a infraestrutura de sidebar (desktop + mobile). O layout passa a ser apenas: wrapper > main > bottom nav.

**Files:**
- Modify: `src/app/cerimonialista/layout.tsx`

- [ ] **Step 1: Substituir o conteúdo completo do layout.tsx**

Abrir `src/app/cerimonialista/layout.tsx` e substituir por:

```tsx
"use client";

import { useEffect } from "react";
import PlannerBottomNav from "@/components/planner-bottom-nav";

function usePwaManifest() {
  useEffect(() => {
    const link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    const prev = link?.getAttribute("href");
    if (link) link.setAttribute("href", "/manifest-pro.json");
    return () => {
      if (link && prev) link.setAttribute("href", prev);
    };
  }, []);
}

export default function CerimonialistaLayout({ children }: { children: React.ReactNode }) {
  usePwaManifest();

  return (
    <div className="min-h-screen" style={{ background: "#FAF6EF" }}>
      <main className="overflow-auto min-h-screen">
        {children}
      </main>
      <PlannerBottomNav />
    </div>
  );
}
```

- [ ] **Step 2: Verificar que não há erros de TypeScript**

```bash
cd laco-app && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros relacionados ao layout.tsx.

- [ ] **Step 3: Commit**

```bash
git add src/app/cerimonialista/layout.tsx
git commit -m "refactor: remover sidebar e header mobile do layout cerimonialista"
```

---

## Task 2: Atualizar hrefs no bottom nav

Duas tabs precisam apontar para as novas hub pages em vez das rotas antigas.

**Files:**
- Modify: `src/components/planner-bottom-nav.tsx`

- [ ] **Step 1: Atualizar href da tab Gestão**

Em `src/components/planner-bottom-nav.tsx`, localizar o objeto da tab Gestão (linha ~49) e alterar `href`:

```tsx
// ANTES
{
  label: "Gestão",
  href: "/cerimonialista/pipeline",
  icon: <GestaoIcon />,
  match: (p: string) =>
    p.startsWith("/cerimonialista/pipeline") ||
    p.startsWith("/cerimonialista/agenda") ||
    p.startsWith("/cerimonialista/contratos") ||
    p.startsWith("/cerimonialista/equipe") ||
    p.startsWith("/cerimonialista/fornecedores") ||
    p.startsWith("/cerimonialista/questionarios") ||
    p.startsWith("/cerimonialista/comparar") ||
    p.startsWith("/cerimonialista/importar"),
},

// DEPOIS
{
  label: "Gestão",
  href: "/cerimonialista/gestao",
  icon: <GestaoIcon />,
  match: (p: string) =>
    p.startsWith("/cerimonialista/gestao") ||
    p.startsWith("/cerimonialista/pipeline") ||
    p.startsWith("/cerimonialista/agenda") ||
    p.startsWith("/cerimonialista/contratos") ||
    p.startsWith("/cerimonialista/equipe") ||
    p.startsWith("/cerimonialista/fornecedores") ||
    p.startsWith("/cerimonialista/questionarios") ||
    p.startsWith("/cerimonialista/comparar") ||
    p.startsWith("/cerimonialista/importar"),
},
```

- [ ] **Step 2: Atualizar href da tab Mais**

Localizar o objeto da tab Mais (linha ~79) e alterar `href`:

```tsx
// ANTES
{
  label: "Mais",
  href: "/cerimonialista/portfolio",
  icon: <MaisIcon />,
  match: (p: string) =>
    p.startsWith("/cerimonialista/portfolio") ||
    p.startsWith("/cerimonialista/comunidade"),
},

// DEPOIS
{
  label: "Mais",
  href: "/cerimonialista/mais",
  icon: <MaisIcon />,
  match: (p: string) =>
    p.startsWith("/cerimonialista/mais") ||
    p.startsWith("/cerimonialista/portfolio") ||
    p.startsWith("/cerimonialista/comunidade"),
},
```

- [ ] **Step 3: Commit**

```bash
git add src/components/planner-bottom-nav.tsx
git commit -m "feat: atualizar hrefs do bottom nav para hub pages gestao e mais"
```

---

## Task 3: Criar hub page Gestão

Página em `/cerimonialista/gestao` com grid 2 colunas listando os 8 itens de gestão.

**Files:**
- Create: `src/app/cerimonialista/gestao/page.tsx`

- [ ] **Step 1: Criar o arquivo**

Criar `src/app/cerimonialista/gestao/page.tsx` com o conteúdo:

```tsx
"use client";

import Link from "next/link";
import {
  Filter,
  Calendar,
  FileText,
  Users,
  Store,
  ClipboardList,
  BarChart2,
  Upload,
} from "lucide-react";

const GOLD  = "#A98950";
const BROWN = "#3D322A";
const CREME = "#FAF6EF";
const BG_DARK = "#F0E8DA";

const ITEMS = [
  {
    href: "/cerimonialista/pipeline",
    label: "Pipeline / CRM",
    desc: "Funil de leads e oportunidades",
    Icon: Filter,
  },
  {
    href: "/cerimonialista/agenda",
    label: "Agenda",
    desc: "Calendário de eventos",
    Icon: Calendar,
  },
  {
    href: "/cerimonialista/contratos",
    label: "Contratos",
    desc: "Templates e gestão de contratos",
    Icon: FileText,
  },
  {
    href: "/cerimonialista/equipe",
    label: "Equipe",
    desc: "Membros da sua equipe",
    Icon: Users,
  },
  {
    href: "/cerimonialista/fornecedores",
    label: "Fornecedores",
    desc: "Diretório de fornecedores",
    Icon: Store,
  },
  {
    href: "/cerimonialista/questionarios",
    label: "Questionários",
    desc: "Criar e gerenciar questionários",
    Icon: ClipboardList,
  },
  {
    href: "/cerimonialista/comparar-orcamentos",
    label: "Comparar Orçamentos",
    desc: "Compare orçamentos de fornecedores",
    Icon: BarChart2,
  },
  {
    href: "/cerimonialista/importar-orcamento",
    label: "Importar Orçamento",
    desc: "Importar via OCR em PDF",
    Icon: Upload,
  },
];

export default function GestaoHub() {
  return (
    <div className="min-h-screen pb-24 px-4 pt-8" style={{ background: CREME }}>
      {/* Header */}
      <div className="mb-8">
        <p
          className="text-xs tracking-[0.25em] uppercase mb-1"
          style={{ color: `rgba(61,50,42,0.40)`, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}
        >
          Cerimonialista
        </p>
        <h1
          className="text-3xl"
          style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontStyle: "italic" }}
        >
          Gestão
        </h1>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {ITEMS.map(({ href, label, desc, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-3 p-4 rounded-2xl transition-all active:scale-95"
            style={{
              background: BG_DARK,
              border: `1px solid rgba(169,137,80,0.18)`,
            }}
          >
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `rgba(169,137,80,0.12)` }}
            >
              <Icon size={18} style={{ color: GOLD }} strokeWidth={1.6} />
            </span>
            <span>
              <span
                className="block text-sm font-medium leading-snug"
                style={{ color: BROWN }}
              >
                {label}
              </span>
              <span
                className="block text-xs mt-0.5 leading-snug"
                style={{ color: `rgba(61,50,42,0.45)` }}
              >
                {desc}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar sem erros de TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sem erros no novo arquivo.

- [ ] **Step 3: Commit**

```bash
git add src/app/cerimonialista/gestao/page.tsx
git commit -m "feat: hub page /cerimonialista/gestao com 8 itens de gestao"
```

---

## Task 4: Criar hub page Mais

Página em `/cerimonialista/mais` com Portfólio, Comunidade e o componente de Notificações.

**Files:**
- Create: `src/app/cerimonialista/mais/page.tsx`

- [ ] **Step 1: Criar o arquivo**

Criar `src/app/cerimonialista/mais/page.tsx`:

```tsx
"use client";

import Link from "next/link";
import { Camera, MessageSquare } from "lucide-react";
import { PlannerNotificationBell } from "@/components/planner-notifications";

const GOLD    = "#A98950";
const BROWN   = "#3D322A";
const CREME   = "#FAF6EF";
const BG_DARK = "#F0E8DA";

const ITEMS = [
  {
    href: "/cerimonialista/portfolio",
    label: "Portfólio Público",
    desc: "Gerencie seu portfólio",
    Icon: Camera,
  },
  {
    href: "/cerimonialista/comunidade",
    label: "Comunidade",
    desc: "Fórum de cerimonialistas",
    Icon: MessageSquare,
  },
];

export default function MaisHub() {
  return (
    <div className="min-h-screen pb-24 px-4 pt-8" style={{ background: CREME }}>
      {/* Header */}
      <div className="mb-8">
        <p
          className="text-xs tracking-[0.25em] uppercase mb-1"
          style={{ color: `rgba(61,50,42,0.40)`, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}
        >
          Cerimonialista
        </p>
        <h1
          className="text-3xl"
          style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontStyle: "italic" }}
        >
          Mais
        </h1>
      </div>

      {/* Notificações */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-2xl mb-6"
        style={{ background: BG_DARK, border: `1px solid rgba(169,137,80,0.18)` }}
      >
        <span className="text-sm font-medium" style={{ color: BROWN }}>
          Notificações
        </span>
        <PlannerNotificationBell />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {ITEMS.map(({ href, label, desc, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-3 p-4 rounded-2xl transition-all active:scale-95"
            style={{
              background: BG_DARK,
              border: `1px solid rgba(169,137,80,0.18)`,
            }}
          >
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `rgba(169,137,80,0.12)` }}
            >
              <Icon size={18} style={{ color: GOLD }} strokeWidth={1.6} />
            </span>
            <span>
              <span
                className="block text-sm font-medium leading-snug"
                style={{ color: BROWN }}
              >
                {label}
              </span>
              <span
                className="block text-xs mt-0.5 leading-snug"
                style={{ color: `rgba(61,50,42,0.45)` }}
              >
                {desc}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar sem erros de TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sem erros.

- [ ] **Step 3: Commit e push**

```bash
git add src/app/cerimonialista/mais/page.tsx
git commit -m "feat: hub page /cerimonialista/mais com portfolio, comunidade e notificacoes"
git push origin main
```

---

## Task 5: Deploy e verificação manual

- [ ] **Step 1: Deploy em produção**

```bash
vercel --prod
```

- [ ] **Step 2: Verificar no browser mobile (ou DevTools → modo mobile)**

Checar os seguintes fluxos:

| Fluxo | Esperado |
|-------|---------|
| Abrir qualquer página `/cerimonialista/*` | Sem header hamburguer, sem sidebar |
| Tocar tab "Gestão" | Navega para `/cerimonialista/gestao` com grid de 8 cards |
| Tocar qualquer card em Gestão | Navega para a rota correta |
| Tocar tab "Mais" | Navega para `/cerimonialista/mais` com notificações + 2 cards |
| Tocar tab "Início" | Navega para `/cerimonialista/dashboard` |
| Tocar tab "Casamentos" | Navega para `/cerimonialista/casamentos` |
| Tocar tab "Financeiro" | Navega para `/cerimonialista/financeiro` |
| Tab ativa destacada em gold | Sim em todas as tabs |
| Visitar `/cerimonialista/pipeline` diretamente | Tab "Gestão" fica ativa (match cobre a rota) |
| Visitar `/cerimonialista/comunidade` diretamente | Tab "Mais" fica ativa (match cobre a rota) |
