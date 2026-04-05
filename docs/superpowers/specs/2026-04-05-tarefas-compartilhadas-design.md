# Design: Tarefas Compartilhadas com Templates por Fase

**Data:** 2026-04-05
**Status:** Aprovado

---

## Contexto

O cerimonialista hoje gerencia toda a comunicação com os casais fora do app (WhatsApp, e-mail). Isso gera perda de histórico, falta de rastreabilidade e retrabalho. A solução priorizada é um sistema de **tarefas compartilhadas** onde o cerimonialista pode criar templates reutilizáveis por fase do casamento e aplicá-los a qualquer casal em 1 clique — gerando automaticamente tarefas com prazos calculados a partir da data do casamento.

---

## Modelo de Dados

Três novos modelos adicionados ao `prisma/schema.prisma`:

### `TaskTemplate`
Template reutilizável criado pelo cerimonialista.

```prisma
model TaskTemplate {
  id          String               @id @default(cuid())
  plannerId   String
  planner     WeddingPlanner       @relation(fields: [plannerId], references: [id])
  name        String
  description String?
  phase       TaskPhase
  items       TaskTemplateItem[]
  createdAt   DateTime             @default(now())
  updatedAt   DateTime             @updatedAt
}

enum TaskPhase {
  TWELVE_MONTHS
  SIX_MONTHS
  THREE_MONTHS
  ONE_MONTH
  ONE_WEEK
  DAY_OF
}
```

### `TaskTemplateItem`
Cada item dentro de um template.

```prisma
model TaskTemplateItem {
  id                String        @id @default(cuid())
  templateId        String
  template          TaskTemplate  @relation(fields: [templateId], references: [id], onDelete: Cascade)
  title             String
  description       String?
  priority          TaskPriority
  daysBeforeWedding Int           // negativo: ex. -365 para 12 meses antes
}

enum TaskPriority {
  HIGH
  MEDIUM
  LOW
}
```

### `WeddingTask`
Tarefa real aplicada a um casamento específico.

```prisma
model WeddingTask {
  id             String        @id @default(cuid())
  weddingId      String
  wedding        Wedding       @relation(fields: [weddingId], references: [id])
  createdById    String
  createdBy      User          @relation(fields: [createdById], references: [id])
  title          String
  description    String?
  priority       TaskPriority
  dueDate        DateTime?
  status         TaskStatus    @default(PENDING)
  templateItemId String?       // opcional — se veio de um template
  notifiedAt     DateTime?     // controla que push D-2 só dispara uma vez
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  DONE
}
```

---

## API Routes

Todas as rotas seguem o padrão existente em `src/app/api/`.

### Templates do Cerimonialista

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/planner/task-templates` | Lista templates do cerimonialista logado |
| `POST` | `/api/planner/task-templates` | Cria novo template com seus itens |
| `PUT` | `/api/planner/task-templates/[id]` | Edita template e itens |
| `DELETE` | `/api/planner/task-templates/[id]` | Remove template |
| `POST` | `/api/planner/task-templates/[id]/apply` | Aplica template a um casamento — recebe `weddingId` + `weddingDate`, cria `WeddingTask` para cada item com `dueDate = weddingDate + daysBeforeWedding` |

### Tarefas por Casamento

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/weddings/[id]/tasks` | Lista tarefas com filtros opcionais (`status`, `priority`) |
| `POST` | `/api/weddings/[id]/tasks` | Cria tarefa manual |
| `PUT` | `/api/weddings/[id]/tasks/[taskId]` | Atualiza status, prazo ou prioridade |
| `DELETE` | `/api/weddings/[id]/tasks/[taskId]` | Remove tarefa |

### Cron de Notificações

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/cron/task-reminders` | Roda diariamente às 9h via Vercel Cron. Busca tarefas com `dueDate = hoje + 2 dias` e `notifiedAt = null`, dispara push VAPID e marca `notifiedAt` |

Configuração no `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/task-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Autorização do cron:** a rota valida o header `Authorization: Bearer ${CRON_SECRET}` que a Vercel injeta automaticamente.

---

## Interface do Cerimonialista

### Nova tela: `/cerimonialista/templates`
- Lista todos os templates criados pelo cerimonialista (nome, fase, quantidade de itens)
- Botão "Novo Template" abre modal com:
  - Campo: Nome do template
  - Dropdown: Fase (`TaskPhase`)
  - Lista dinâmica de itens (título, prioridade, `daysBeforeWedding`)
  - Adicionar/remover itens inline

### Tela existente: `/cerimonialista/casamento/[id]`
- Nova aba "Tarefas" adicionada à navegação interna da tela
- Botão "Aplicar Template" → modal para selecionar template → cria tarefas automaticamente
- Lista de tarefas com filtro por status e prioridade
- Botão "Nova Tarefa" para criação manual
- Card de tarefa: título, prazo, badge de prioridade (colorido), toggle de status

---

## Interface do Casal

### Nova rota: `/casamento/[id]/tarefas`
- Visual integrado ao padrão do dashboard do casal (paleta, tipografia, bottom nav)
- Barra de progresso: *"X de Y tarefas concluídas"*
- Filtro por status (pendente / em andamento / concluída) e prioridade
- Casal pode criar tarefas manuais e marcar como concluída
- Link adicionado ao menu `/casamento/[id]/planejar` e ao checklist de onboarding

---

## Notificações e Feedback Visual

### Push Notifications (VAPID existente)
- **D-2:** *"Tarefa '[título]' vence em 2 dias"* — disparo pelo cron, controle via `notifiedAt`
- **Nova tarefa criada:** notificação para o outro lado (cerimonialista cria → casal recebe, e vice-versa)
- **Tarefa concluída:** notificação para quem criou a tarefa

### Feedback visual
- Badge com contador de tarefas pendentes no ícone do bottom nav (casal) e no card do casamento na lista do cerimonialista
- Barra de progresso no topo da lista de tarefas
- Confetti ao atingir 100% de tarefas concluídas (reutilizar utilitário existente de onboarding)

### Cores de prioridade
- Alta: vermelho suave (`#EF4444` ou similar)
- Média: âmbar/dourado (alinhado com `#A98950`)
- Baixa: cinza (`rgba(61,50,42,0.42)`)

---

## Fora do Escopo (próximas iterações)

- Comentários por tarefa (thread de comunicação)
- Histórico de edições por tarefa
- Agrupamento visual por fase na lista do casal
- Relatório de progresso exportável para o cerimonialista
