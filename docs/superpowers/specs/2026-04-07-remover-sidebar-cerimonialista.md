# Spec: Remover Sidebar Cerimonialista — Unificar no Bottom Nav

**Data:** 2026-04-07  
**Status:** Aprovado

---

## Problema

No mobile, a área do cerimonialista tem dois sistemas de navegação paralelos:
- **Bottom nav** (5 tabs) — acessível sempre
- **Header hamburguer + drawer overlay** — necessário para acessar 8+ itens não expostos nas tabs

O objetivo é eliminar completamente a sidebar/drawer e tornar todos os itens acessíveis exclusivamente pelo bottom nav, via páginas hub.

---

## Solução: Opção B — Hub pages por tab

Cada tab com sub-itens passa a apontar para uma **página hub** que lista os destinos como grid de cards. Sem overlays, sem estados de UI adicionais.

---

## Bottom Nav — Destinos atualizados

| Tab | Ícone | Destino | Tipo |
|-----|-------|---------|------|
| Início | home | `/cerimonialista/dashboard` | link direto |
| Casamentos | heart | `/cerimonialista/casamentos` | link direto |
| Gestão | layers | `/cerimonialista/gestao` *(novo)* | hub page |
| Financeiro | dollar | `/cerimonialista/financeiro` | link direto |
| Mais | dots | `/cerimonialista/mais` *(novo)* | hub page |

O `match()` de cada tab no `planner-bottom-nav.tsx` permanece igual — já cobre todas as rotas filhas corretamente.

---

## Páginas Hub Novas

### `/cerimonialista/gestao`

Grid de cards com 8 itens (2 colunas):

| Item | Rota |
|------|------|
| Pipeline / CRM | `/cerimonialista/pipeline` |
| Agenda | `/cerimonialista/agenda` |
| Contratos | `/cerimonialista/contratos` |
| Equipe | `/cerimonialista/equipe` |
| Fornecedores | `/cerimonialista/fornecedores` |
| Questionários | `/cerimonialista/questionarios` |
| Comparar Orçamentos | `/cerimonialista/comparar-orcamentos` |
| Importar Orçamento | `/cerimonialista/importar-orcamento` |

### `/cerimonialista/mais`

Grid de cards com 3 itens:

| Item | Rota / Ação |
|------|-------------|
| Portfólio Público | `/cerimonialista/portfolio` |
| Comunidade | `/cerimonialista/comunidade` |
| Notificações | abre `PlannerNotificationBell` (realocado aqui) |

---

## Financeiro

A tab Financeiro continua apontando diretamente para `/cerimonialista/financeiro`. A rota `/cerimonialista/comissoes` já é acessível via link/card dentro da própria página de Financeiro (já existe hoje). Nenhuma hub page necessária.

---

## Mudanças no Layout (`src/app/cerimonialista/layout.tsx`)

**Remove:**
- `<aside>` desktop sidebar (classes `hidden lg:flex`)
- Header mobile (hamburguer + logo + `PlannerNotificationBell`)
- Overlay drawer mobile (`sidebarOpen && ...`)
- Estado `sidebarOpen`
- Hook `useScrollHide` e seu uso
- Constantes `NAV_GROUPS` e componente `NavIcon`

**Ajusta:**
- `<main>`: remove `lg:ml-60` (sem offset de sidebar) e remove `pt-14 lg:pt-0` (sem header mobile) → fica `overflow-auto min-h-screen` apenas
- `<PlannerBottomNav />`: remove wrapper `<div className="lg:hidden">` → aparece em todas as telas

**Mantém:**
- `usePwaManifest`
- `useSession` (ainda usado se necessário em algum ponto)

---

## Mudanças no Bottom Nav (`src/components/planner-bottom-nav.tsx`)

- Tab **Gestão**: `href` muda de `/cerimonialista/pipeline` para `/cerimonialista/gestao`
- Tab **Mais**: `href` muda de `/cerimonialista/portfolio` para `/cerimonialista/mais`
- Restante sem alteração

---

## Arquivos Afetados

| Arquivo | Ação |
|---------|------|
| `src/app/cerimonialista/layout.tsx` | Modificar — remover sidebar e header |
| `src/components/planner-bottom-nav.tsx` | Modificar — atualizar 2 hrefs |
| `src/app/cerimonialista/gestao/page.tsx` | Criar — hub page Gestão |
| `src/app/cerimonialista/mais/page.tsx` | Criar — hub page Mais |

---

## Visual das Hub Pages

Seguir a identidade visual do app:
- `GOLD = "#A98950"`, `BROWN = "#3D322A"`, `CREME = "#FAF6EF"`, `BG_DARK = "#F0E8DA"`
- Cards com fundo `BG_DARK`, borda sutil gold, ícone + label
- Título da página em Cormorant Garamond 300i (header emocional)
- Grid 2 colunas no mobile, mantendo `pb-bottom-nav`
- `PlannerBottomNav` já renderizado pelo layout — não incluir nas páginas hub

---

## Fora de Escopo

- Refatoração das páginas destino
- Mudanças no desktop (sem sidebar, o layout fica full-width — comportamento natural)
- Novas features nas páginas hub além dos cards de navegação
