# Tarefas Compartilhadas com Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar um sistema de tarefas compartilhadas entre cerimonialista e casal, com templates reutilizáveis por fase do casamento que geram tarefas automaticamente com prazos calculados.

**Architecture:** Três novos modelos Prisma (`TaskTemplate`, `TaskTemplateItem`, `WeddingTask`) com suas enums. A API expõe rotas para CRUD de templates, aplicação de templates a casamentos, e CRUD de tarefas. A interface do cerimonialista ganha uma tela de templates e uma aba de tarefas na visão do casamento. O casal acessa via nova rota `/casamento/[id]/tarefas`. Um cron job Vercel dispara push notifications D-2 antes do vencimento.

**Tech Stack:** Next.js 14 App Router, Prisma 6, PostgreSQL via Supabase, web-push (VAPID), Vercel Cron Jobs, TypeScript, Tailwind CSS + inline style tokens.

---

## File Map

**New files:**
- `prisma/schema.prisma` — 3 new models + 3 new enums (modify existing)
- `src/app/api/planner/task-templates/route.ts` — GET + POST templates
- `src/app/api/planner/task-templates/[id]/route.ts` — PUT + DELETE template
- `src/app/api/planner/task-templates/[id]/apply/route.ts` — POST apply template to wedding
- `src/app/api/weddings/[id]/tasks/route.ts` — GET + POST tasks
- `src/app/api/weddings/[id]/tasks/[taskId]/route.ts` — PUT + DELETE task
- `src/app/api/cron/task-reminders/route.ts` — POST cron push notifications
- `src/app/cerimonialista/templates/page.tsx` — Templates management page
- `src/app/casamento/[id]/tarefas/page.tsx` — Couple tasks page
- `vercel.json` — Cron job schedule

**Modified files:**
- `src/app/cerimonialista/casamento/[id]/page.tsx` — Add "Tarefas" section

---

## Task 1: Prisma Schema — Enums e Modelos

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add enums and models to schema**

Open `prisma/schema.prisma` and add the following at the end of the file (after the last existing model):

```prisma
// ─── Sprint Tasks — Tarefas Compartilhadas ──────────────────

enum TaskPhase {
  TWELVE_MONTHS
  SIX_MONTHS
  THREE_MONTHS
  ONE_MONTH
  ONE_WEEK
  DAY_OF
}

enum TaskPriority {
  HIGH
  MEDIUM
  LOW
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  DONE
}

model TaskTemplate {
  id          String             @id @default(cuid())
  plannerId   String
  name        String
  description String?
  phase       TaskPhase
  items       TaskTemplateItem[]
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  planner WeddingPlanner @relation(fields: [plannerId], references: [id], onDelete: Cascade)

  @@index([plannerId])
}

model TaskTemplateItem {
  id                String       @id @default(cuid())
  templateId        String
  title             String
  description       String?
  priority          TaskPriority
  daysBeforeWedding Int

  template TaskTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)

  @@index([templateId])
}

model WeddingTask {
  id             String       @id @default(cuid())
  weddingId      String
  createdById    String
  title          String
  description    String?
  priority       TaskPriority
  dueDate        DateTime?
  status         TaskStatus   @default(PENDING)
  templateItemId String?
  notifiedAt     DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  wedding     Wedding @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  createdBy   User    @relation(fields: [createdById], references: [id])

  @@index([weddingId])
  @@index([dueDate])
}
```

Also add the back-relations in the existing `WeddingPlanner` model (find the model and add inside it):
```prisma
  taskTemplates TaskTemplate[]
```

And in the existing `Wedding` model:
```prisma
  tasks WeddingTask[]
```

And in the existing `User` model:
```prisma
  createdTasks WeddingTask[]
```

- [ ] **Step 2: Push schema to database**

```bash
npx prisma db push
```

Expected: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 3: Regenerate Prisma client**

```bash
npx prisma generate
```

Expected: `✔ Generated Prisma Client`

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add TaskTemplate, TaskTemplateItem, WeddingTask models"
```

---

## Task 2: API — CRUD de Templates do Cerimonialista

**Files:**
- Create: `src/app/api/planner/task-templates/route.ts`

- [ ] **Step 1: Create the route file**

```typescript
// src/app/api/planner/task-templates/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  errorResponse,
  notFoundResponse,
  validationError,
} from "@/lib/api-helpers";

// GET /api/planner/task-templates
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const planner = await prisma.weddingPlanner.findFirst({
      where: { userId: user.id },
    });
    if (!planner) return notFoundResponse("Perfil de cerimonialista");

    const templates = await prisma.taskTemplate.findMany({
      where: { plannerId: planner.id },
      include: { items: { orderBy: { daysBeforeWedding: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("GET /api/planner/task-templates error:", error);
    return errorResponse();
  }
}

// POST /api/planner/task-templates
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const planner = await prisma.weddingPlanner.findFirst({
      where: { userId: user.id },
    });
    if (!planner) return notFoundResponse("Perfil de cerimonialista");

    const body = await request.json();

    if (!body.name) return validationError("name é obrigatório");
    if (!body.phase) return validationError("phase é obrigatório");
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return validationError("items deve ser um array não vazio");
    }

    const template = await prisma.taskTemplate.create({
      data: {
        plannerId: planner.id,
        name: body.name,
        description: body.description ?? null,
        phase: body.phase,
        items: {
          create: body.items.map((item: {
            title: string;
            description?: string;
            priority: string;
            daysBeforeWedding: number;
          }) => ({
            title: item.title,
            description: item.description ?? null,
            priority: item.priority,
            daysBeforeWedding: item.daysBeforeWedding,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("POST /api/planner/task-templates error:", error);
    return errorResponse();
  }
}
```

- [ ] **Step 2: Test GET (should return empty array for new planner)**

Open browser or use curl/Postman: `GET /api/planner/task-templates`
Expected: `[]` (empty array, status 200)

- [ ] **Step 3: Commit**

```bash
git add src/app/api/planner/task-templates/route.ts
git commit -m "feat: GET and POST /api/planner/task-templates"
```

---

## Task 3: API — PUT e DELETE de Template por ID

**Files:**
- Create: `src/app/api/planner/task-templates/[id]/route.ts`

- [ ] **Step 1: Create the route file**

```typescript
// src/app/api/planner/task-templates/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  errorResponse,
  validationError,
} from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

// PUT /api/planner/task-templates/[id]
export async function PUT(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const planner = await prisma.weddingPlanner.findFirst({
      where: { userId: user.id },
    });
    if (!planner) return notFoundResponse("Perfil de cerimonialista");

    const template = await prisma.taskTemplate.findUnique({ where: { id } });
    if (!template) return notFoundResponse("Template");
    if (template.plannerId !== planner.id) return forbiddenResponse();

    const body = await request.json();
    if (!body.name) return validationError("name é obrigatório");

    // Replace all items: delete old, insert new
    await prisma.taskTemplateItem.deleteMany({ where: { templateId: id } });

    const updated = await prisma.taskTemplate.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description ?? null,
        phase: body.phase ?? template.phase,
        items: {
          create: (body.items ?? []).map((item: {
            title: string;
            description?: string;
            priority: string;
            daysBeforeWedding: number;
          }) => ({
            title: item.title,
            description: item.description ?? null,
            priority: item.priority,
            daysBeforeWedding: item.daysBeforeWedding,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/planner/task-templates/[id] error:", error);
    return errorResponse();
  }
}

// DELETE /api/planner/task-templates/[id]
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const planner = await prisma.weddingPlanner.findFirst({
      where: { userId: user.id },
    });
    if (!planner) return notFoundResponse("Perfil de cerimonialista");

    const template = await prisma.taskTemplate.findUnique({ where: { id } });
    if (!template) return notFoundResponse("Template");
    if (template.plannerId !== planner.id) return forbiddenResponse();

    await prisma.taskTemplate.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/planner/task-templates/[id] error:", error);
    return errorResponse();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/planner/task-templates/[id]/route.ts
git commit -m "feat: PUT and DELETE /api/planner/task-templates/[id]"
```

---

## Task 4: API — Aplicar Template a um Casamento

**Files:**
- Create: `src/app/api/planner/task-templates/[id]/apply/route.ts`

- [ ] **Step 1: Create the route file**

```typescript
// src/app/api/planner/task-templates/[id]/apply/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  errorResponse,
  validationError,
} from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

// POST /api/planner/task-templates/[id]/apply
// Body: { weddingId: string, weddingDate: string (ISO) }
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();

    if (!body.weddingId) return validationError("weddingId é obrigatório");
    if (!body.weddingDate) return validationError("weddingDate é obrigatório");

    const planner = await prisma.weddingPlanner.findFirst({
      where: { userId: user.id },
    });
    if (!planner) return notFoundResponse("Perfil de cerimonialista");

    // Verify template belongs to planner
    const template = await prisma.taskTemplate.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!template) return notFoundResponse("Template");
    if (template.plannerId !== planner.id) return forbiddenResponse();

    // Verify planner has access to the wedding
    const assignment = await prisma.weddingPlannerAssignment.findFirst({
      where: { weddingId: body.weddingId, plannerId: planner.id },
    });
    if (!assignment) return forbiddenResponse();

    const weddingDate = new Date(body.weddingDate);

    // Create one WeddingTask per template item
    const tasks = await Promise.all(
      template.items.map((item) => {
        const dueDate = new Date(weddingDate);
        dueDate.setDate(dueDate.getDate() + item.daysBeforeWedding);

        return prisma.weddingTask.create({
          data: {
            weddingId: body.weddingId,
            createdById: user.id,
            title: item.title,
            description: item.description ?? null,
            priority: item.priority,
            dueDate,
            templateItemId: item.id,
            status: "PENDING",
          },
        });
      })
    );

    return NextResponse.json({ created: tasks.length, tasks }, { status: 201 });
  } catch (error) {
    console.error("POST /api/planner/task-templates/[id]/apply error:", error);
    return errorResponse();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/planner/task-templates/[id]/apply/route.ts
git commit -m "feat: POST /api/planner/task-templates/[id]/apply"
```

---

## Task 5: API — CRUD de Tarefas por Casamento

**Files:**
- Create: `src/app/api/weddings/[id]/tasks/route.ts`
- Create: `src/app/api/weddings/[id]/tasks/[taskId]/route.ts`

- [ ] **Step 1: Create tasks collection route**

```typescript
// src/app/api/weddings/[id]/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  verifyWeddingOwnership,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  errorResponse,
  validationError,
} from "@/lib/api-helpers";
import { sendPushToUser } from "@/lib/webpush";

type Params = { params: Promise<{ id: string }> };

// GET /api/weddings/[id]/tasks
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const where: Record<string, unknown> = { weddingId: id };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const tasks = await prisma.weddingTask.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET /api/weddings/[id]/tasks error:", error);
    return errorResponse();
  }
}

// POST /api/weddings/[id]/tasks
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error, wedding } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const body = await request.json();
    if (!body.title) return validationError("title é obrigatório");
    if (!body.priority) return validationError("priority é obrigatório");

    const task = await prisma.weddingTask.create({
      data: {
        weddingId: id,
        createdById: user.id,
        title: body.title,
        description: body.description ?? null,
        priority: body.priority,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        status: "PENDING",
      },
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
      },
    });

    // Notify the "other side": if creator is a planner, notify the couple owners
    // and vice-versa. Non-blocking.
    if (wedding) {
      const coupleUserIds = await prisma.user.findMany({
        where: {
          weddings: { some: { id } },
          id: { not: user.id },
        },
        select: { id: true },
      });
      coupleUserIds.forEach(({ id: recipientId }) => {
        sendPushToUser(recipientId, {
          title: "Nova tarefa criada",
          body: task.title,
        }).catch(() => {});
      });
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST /api/weddings/[id]/tasks error:", error);
    return errorResponse();
  }
}
```

- [ ] **Step 2: Create individual task route**

```typescript
// src/app/api/weddings/[id]/tasks/[taskId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  verifyWeddingOwnership,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  errorResponse,
} from "@/lib/api-helpers";
import { sendPushToUser } from "@/lib/webpush";

type Params = { params: Promise<{ id: string; taskId: string }> };

// PUT /api/weddings/[id]/tasks/[taskId]
export async function PUT(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, taskId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const task = await prisma.weddingTask.findUnique({ where: { id: taskId } });
    if (!task || task.weddingId !== id) return notFoundResponse("Tarefa");

    const body = await request.json();

    const updated = await prisma.weddingTask.update({
      where: { id: taskId },
      data: {
        title: body.title ?? task.title,
        description: body.description !== undefined ? body.description : task.description,
        priority: body.priority ?? task.priority,
        dueDate: body.dueDate !== undefined ? (body.dueDate ? new Date(body.dueDate) : null) : task.dueDate,
        status: body.status ?? task.status,
      },
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
      },
    });

    // If task just got marked DONE, notify the creator (if different from current user)
    if (body.status === "DONE" && task.status !== "DONE" && task.createdById !== user.id) {
      sendPushToUser(task.createdById, {
        title: "Tarefa concluída",
        body: updated.title,
      }).catch(() => {});
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/weddings/[id]/tasks/[taskId] error:", error);
    return errorResponse();
  }
}

// DELETE /api/weddings/[id]/tasks/[taskId]
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, taskId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const task = await prisma.weddingTask.findUnique({ where: { id: taskId } });
    if (!task || task.weddingId !== id) return notFoundResponse("Tarefa");

    await prisma.weddingTask.delete({ where: { id: taskId } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/weddings/[id]/tasks/[taskId] error:", error);
    return errorResponse();
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/weddings/[id]/tasks/route.ts src/app/api/weddings/[id]/tasks/[taskId]/route.ts
git commit -m "feat: GET/POST /api/weddings/[id]/tasks and PUT/DELETE /[taskId]"
```

---

## Task 6: API — Cron de Notificações D-2 + vercel.json

**Files:**
- Create: `src/app/api/cron/task-reminders/route.ts`
- Create: `vercel.json`

- [ ] **Step 1: Create cron route**

```typescript
// src/app/api/cron/task-reminders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/webpush";

// POST /api/cron/task-reminders
// Called daily at 9h by Vercel Cron. Sends push D-2 before due date.
export async function POST(request: Request) {
  // Vercel injects Authorization: Bearer <CRON_SECRET> automatically
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + 2);

    // Start and end of the target day (UTC)
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const tasks = await prisma.weddingTask.findMany({
      where: {
        status: { not: "DONE" },
        dueDate: { gte: startOfDay, lte: endOfDay },
        notifiedAt: null,
      },
      include: {
        wedding: {
          include: {
            user: { select: { id: true } },
            plannerAssignments: {
              include: { planner: { include: { user: { select: { id: true } } } } },
            },
          },
        },
      },
    });

    let notified = 0;

    for (const task of tasks) {
      // Collect all user IDs for this wedding: couple owner + assigned planners
      const userIds = new Set<string>();
      if (task.wedding.userId) userIds.add(task.wedding.userId);
      task.wedding.plannerAssignments?.forEach((a) => {
        if (a.planner?.user?.id) userIds.add(a.planner.user.id);
      });

      await Promise.allSettled(
        [...userIds].map((uid) =>
          sendPushToUser(uid, {
            title: "Tarefa vence em 2 dias",
            body: task.title,
          })
        )
      );

      await prisma.weddingTask.update({
        where: { id: task.id },
        data: { notifiedAt: now },
      });

      notified++;
    }

    return NextResponse.json({ ok: true, notified });
  } catch (error) {
    console.error("POST /api/cron/task-reminders error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create vercel.json**

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

- [ ] **Step 3: Add CRON_SECRET to environment**

In the Vercel dashboard → Settings → Environment Variables, add:
- `CRON_SECRET` — any long random string (e.g., `openssl rand -hex 32`)

Also add to local `.env`:
```
CRON_SECRET=your_secret_here
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/cron/task-reminders/route.ts vercel.json
git commit -m "feat: cron job for D-2 task push notifications"
```

---

## Task 7: UI — Página de Templates do Cerimonialista

**Files:**
- Create: `src/app/cerimonialista/templates/page.tsx`

- [ ] **Step 1: Create the templates page**

```typescript
// src/app/cerimonialista/templates/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Check } from "lucide-react";

const PHASE_LABELS: Record<string, string> = {
  TWELVE_MONTHS: "12 meses antes",
  SIX_MONTHS: "6 meses antes",
  THREE_MONTHS: "3 meses antes",
  ONE_MONTH: "1 mês antes",
  ONE_WEEK: "1 semana antes",
  DAY_OF: "Dia do casamento",
};

const PRIORITY_LABELS: Record<string, string> = {
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "#EF4444",
  MEDIUM: "#A98950",
  LOW: "rgba(61,50,42,0.42)",
};

interface TemplateItem {
  id?: string;
  title: string;
  description: string;
  priority: string;
  daysBeforeWedding: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  phase: string;
  items: TemplateItem[];
}

const emptyItem = (): TemplateItem => ({
  title: "",
  description: "",
  priority: "MEDIUM",
  daysBeforeWedding: -30,
});

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    phase: "ONE_MONTH",
    items: [emptyItem()],
  });

  async function loadTemplates() {
    const res = await fetch("/api/planner/task-templates");
    if (res.ok) setTemplates(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadTemplates(); }, []);

  function addItem() {
    setForm((f) => ({ ...f, items: [...f.items, emptyItem()] }));
  }

  function removeItem(index: number) {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }));
  }

  function updateItem(index: number, field: keyof TemplateItem, value: string | number) {
    setForm((f) => {
      const items = [...f.items];
      items[index] = { ...items[index], [field]: value };
      return { ...f, items };
    });
  }

  async function handleSave() {
    if (!form.name.trim() || form.items.some((i) => !i.title.trim())) return;
    setSaving(true);
    const res = await fetch("/api/planner/task-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ name: "", description: "", phase: "ONE_MONTH", items: [emptyItem()] });
      loadTemplates();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este template?")) return;
    const res = await fetch(`/api/planner/task-templates/${id}`, { method: "DELETE" });
    if (res.ok) setTemplates((t) => t.filter((x) => x.id !== id));
  }

  return (
    <div className="min-h-screen bg-[#FAF6EF] pb-24">
      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <p className="text-[9px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "rgba(61,50,42,0.36)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
          Cerimonialista
        </p>
        <h1 className="text-[30px] font-light leading-tight"
          style={{ color: "#3D322A", fontFamily: "'Cormorant Garamond', serif" }}>
          Templates de Tarefas
        </h1>
      </div>

      <div className="px-5 space-y-3">
        {/* New template button */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-sm transition active:scale-[0.98]"
          style={{ background: "#A98950", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, letterSpacing: "0.08em" }}>
          <Plus className="w-4 h-4" />
          Novo Template
        </button>

        {/* Template list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-[1.5px] border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "#A98950 transparent #A98950 #A98950" }} />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: "rgba(61,50,42,0.42)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              Nenhum template criado ainda
            </p>
          </div>
        ) : (
          templates.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm overflow-hidden"
              style={{ border: "1.5px solid rgba(169,137,80,0.16)" }}>
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] truncate"
                    style={{ color: "#3D322A", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                    {t.name}
                  </p>
                  <p className="text-[11px]" style={{ color: "rgba(61,50,42,0.42)" }}>
                    {PHASE_LABELS[t.phase]} · {t.items.length} itens
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-red-50 transition">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                  <button onClick={() => setExpandedId(expandedId === t.id ? null : t.id)} className="p-2 rounded-lg hover:bg-gray-50 transition">
                    {expandedId === t.id ? <ChevronUp className="w-4 h-4" style={{ color: "#A98950" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "rgba(61,50,42,0.42)" }} />}
                  </button>
                </div>
              </div>
              {expandedId === t.id && (
                <div className="border-t px-5 pb-4 pt-3 space-y-2" style={{ borderColor: "rgba(169,137,80,0.10)" }}>
                  {t.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 py-2">
                      <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ background: PRIORITY_COLORS[item.priority] }} />
                      <div>
                        <p className="text-[12px]" style={{ color: "#3D322A", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                          {item.title}
                        </p>
                        <p className="text-[10px]" style={{ color: "rgba(61,50,42,0.42)" }}>
                          {PRIORITY_LABELS[item.priority]} · {Math.abs(item.daysBeforeWedding)} dias antes
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-y-auto p-6 pb-10">
            <h2 className="text-[22px] font-light mb-5" style={{ color: "#3D322A", fontFamily: "'Cormorant Garamond', serif" }}>
              Novo Template
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] block mb-1.5"
                  style={{ color: "rgba(61,50,42,0.42)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                  Nome do template
                </label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Checklist 6 meses"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: "1.5px solid rgba(169,137,80,0.3)", color: "#3D322A", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }} />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] block mb-1.5"
                  style={{ color: "rgba(61,50,42,0.42)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                  Fase
                </label>
                <select value={form.phase} onChange={(e) => setForm((f) => ({ ...f, phase: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: "1.5px solid rgba(169,137,80,0.3)", color: "#3D322A", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                  {Object.entries(PHASE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: "rgba(61,50,42,0.42)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                    Itens
                  </label>
                  <button onClick={addItem} className="text-[11px] flex items-center gap-1" style={{ color: "#A98950" }}>
                    <Plus className="w-3 h-3" /> Adicionar
                  </button>
                </div>
                <div className="space-y-3">
                  {form.items.map((item, i) => (
                    <div key={i} className="rounded-xl p-3 space-y-2" style={{ background: "#FAF6EF" }}>
                      <input value={item.title} onChange={(e) => updateItem(i, "title", e.target.value)}
                        placeholder="Título da tarefa"
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none bg-white"
                        style={{ border: "1px solid rgba(169,137,80,0.2)", color: "#3D322A", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }} />
                      <div className="flex gap-2">
                        <select value={item.priority} onChange={(e) => updateItem(i, "priority", e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg text-xs outline-none bg-white"
                          style={{ border: "1px solid rgba(169,137,80,0.2)", color: "#3D322A" }}>
                          <option value="HIGH">Alta</option>
                          <option value="MEDIUM">Média</option>
                          <option value="LOW">Baixa</option>
                        </select>
                        <input type="number" value={Math.abs(item.daysBeforeWedding)}
                          onChange={(e) => updateItem(i, "daysBeforeWedding", -Math.abs(Number(e.target.value)))}
                          placeholder="dias antes"
                          className="w-28 px-3 py-2 rounded-lg text-xs outline-none bg-white"
                          style={{ border: "1px solid rgba(169,137,80,0.2)", color: "#3D322A" }} />
                        {form.items.length > 1 && (
                          <button onClick={() => removeItem(i)} className="p-2 rounded-lg hover:bg-red-50">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl text-sm"
                style={{ border: "1.5px solid rgba(169,137,80,0.3)", color: "#A98950", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 rounded-xl text-white text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
                style={{ background: "#A98950", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                {saving ? <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Test in browser**

Navigate to `/cerimonialista/templates` (logged in as a planner).
- Page loads with "Nenhum template" state
- "Novo Template" button opens modal
- Create a template with 2 items → saves and appears in list
- Expand template to see items
- Delete template → removed from list

- [ ] **Step 3: Commit**

```bash
git add src/app/cerimonialista/templates/page.tsx
git commit -m "feat: cerimonialista templates management page"
```

---

## Task 8: UI — Aba de Tarefas na Visão do Casamento (Cerimonialista)

**Files:**
- Modify: `src/app/cerimonialista/casamento/[id]/page.tsx`

- [ ] **Step 1: Add TasksTab component and integrate into page**

Open `src/app/cerimonialista/casamento/[id]/page.tsx`. The file uses collapsible sections with `openSections` state. Add a new "tarefas" section.

First, extend the `Tab` type (find the line `type Tab = "convidados" | "fornecedores" | "orcamento";`):
```typescript
type Tab = "convidados" | "fornecedores" | "orcamento" | "tarefas";
```

Add the tasks state variables (after the existing `useState` declarations):
```typescript
const [tasks, setTasks] = useState<WeddingTask[]>([]);
const [tasksLoading, setTasksLoading] = useState(false);
const [templates, setTemplates] = useState<Template[]>([]);
const [showApplyModal, setShowApplyModal] = useState(false);
const [showNewTaskModal, setShowNewTaskModal] = useState(false);
const [applyingTemplate, setApplyingTemplate] = useState(false);
const [newTask, setNewTask] = useState({ title: "", priority: "MEDIUM", dueDate: "" });
```

Add these interfaces near the top of the file:
```typescript
interface WeddingTask {
  id: string;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  dueDate: string | null;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  createdBy: { id: string; name: string | null };
}

interface Template {
  id: string;
  name: string;
  phase: string;
  items: { id: string }[];
}
```

Add a helper to load tasks (place after the existing `useEffect`):
```typescript
async function loadTasks() {
  if (!id) return;
  setTasksLoading(true);
  const res = await fetch(`/api/weddings/${id}/tasks`);
  if (res.ok) setTasks(await res.json());
  setTasksLoading(false);
}

async function loadTemplates() {
  const res = await fetch("/api/planner/task-templates");
  if (res.ok) setTemplates(await res.json());
}
```

Call them in the existing `useEffect` (add to the end of the `then` chain):
```typescript
// Inside the useEffect, after setWedding(data):
loadTasks();
loadTemplates();
```

Add `applyTemplate` and `createTask` handlers:
```typescript
async function applyTemplate(templateId: string) {
  if (!wedding?.weddingDate) return;
  setApplyingTemplate(true);
  await fetch(`/api/planner/task-templates/${templateId}/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weddingId: id, weddingDate: wedding.weddingDate }),
  });
  await loadTasks();
  setShowApplyModal(false);
  setApplyingTemplate(false);
}

async function handleCreateTask() {
  if (!newTask.title.trim()) return;
  await fetch(`/api/weddings/${id}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTask),
  });
  setNewTask({ title: "", priority: "MEDIUM", dueDate: "" });
  setShowNewTaskModal(false);
  loadTasks();
}

async function toggleTaskStatus(task: WeddingTask) {
  const next = task.status === "DONE" ? "PENDING" : "DONE";
  await fetch(`/api/weddings/${id}/tasks/${task.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: next }),
  });
  loadTasks();
}
```

Add "tarefas" to the `SECTIONS` array:
```typescript
{ key: "tarefas", label: "Tarefas", count: tasks.filter((t) => t.status !== "DONE").length },
```

Add the tarefas section content inside the collapsible (after the `orcamento` section content block):
```typescript
{s.key === "tarefas" && (
  <div className="pt-4 space-y-3">
    {/* Progress bar */}
    {tasks.length > 0 && (
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1" style={{ color: "rgba(61,50,42,0.42)" }}>
          <span>{tasks.filter((t) => t.status === "DONE").length} de {tasks.length} concluídas</span>
          <span>{Math.round((tasks.filter((t) => t.status === "DONE").length / tasks.length) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-gray-100">
          <div className="h-1.5 rounded-full transition-all" style={{
            width: `${(tasks.filter((t) => t.status === "DONE").length / tasks.length) * 100}%`,
            background: "#A98950"
          }} />
        </div>
      </div>
    )}

    {/* Action buttons */}
    <div className="flex gap-2">
      <button onClick={() => setShowApplyModal(true)}
        className="flex-1 py-2 text-xs rounded-xl"
        style={{ border: "1.5px solid rgba(169,137,80,0.3)", color: "#A98950", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
        Aplicar Template
      </button>
      <button onClick={() => setShowNewTaskModal(true)}
        className="flex-1 py-2 text-xs rounded-xl text-white"
        style={{ background: "#A98950", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
        Nova Tarefa
      </button>
    </div>

    {/* Task list */}
    {tasksLoading ? (
      <div className="flex justify-center py-6">
        <div className="w-5 h-5 border border-t-transparent rounded-full animate-spin" style={{ borderColor: "#A98950 transparent" }} />
      </div>
    ) : tasks.length === 0 ? (
      <p className="text-center py-6 text-xs" style={{ color: "rgba(61,50,42,0.42)" }}>
        Nenhuma tarefa. Aplique um template para começar.
      </p>
    ) : (
      tasks.map((task) => (
        <div key={task.id} className="flex items-start gap-3 py-2.5 border-b last:border-0" style={{ borderColor: "rgba(169,137,80,0.08)" }}>
          <button onClick={() => toggleTaskStatus(task)}
            className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition"
            style={{ borderColor: task.status === "DONE" ? "#A98950" : "rgba(169,137,80,0.3)", background: task.status === "DONE" ? "#A98950" : "transparent" }}>
            {task.status === "DONE" && <Check className="w-3 h-3 text-white" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[12px]" style={{
              color: task.status === "DONE" ? "rgba(61,50,42,0.35)" : "#3D322A",
              textDecoration: task.status === "DONE" ? "line-through" : "none",
              fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300
            }}>
              {task.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px]" style={{
                color: task.priority === "HIGH" ? "#EF4444" : task.priority === "MEDIUM" ? "#A98950" : "rgba(61,50,42,0.42)"
              }}>
                {task.priority === "HIGH" ? "Alta" : task.priority === "MEDIUM" ? "Média" : "Baixa"}
              </span>
              {task.dueDate && (
                <span className="text-[10px]" style={{ color: "rgba(61,50,42,0.42)" }}>
                  · {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>
          </div>
        </div>
      ))
    )}
  </div>
)}
```

Add modals at the bottom of the return, before the closing `</div>` of the component:

```typescript
{/* Apply Template Modal */}
{showApplyModal && (
  <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
    <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 pb-10">
      <h2 className="text-[20px] font-light mb-4" style={{ color: "#3D322A", fontFamily: "'Cormorant Garamond', serif" }}>
        Aplicar Template
      </h2>
      {templates.length === 0 ? (
        <p className="text-sm text-center py-6" style={{ color: "rgba(61,50,42,0.42)" }}>
          Nenhum template criado. Vá em Templates para criar.
        </p>
      ) : (
        <div className="space-y-2 mb-4">
          {templates.map((t) => (
            <button key={t.id} onClick={() => applyTemplate(t.id)} disabled={applyingTemplate}
              className="w-full text-left px-4 py-3 rounded-xl transition hover:bg-amber-50 disabled:opacity-50"
              style={{ border: "1.5px solid rgba(169,137,80,0.2)" }}>
              <p className="text-sm" style={{ color: "#3D322A", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                {t.name}
              </p>
              <p className="text-xs" style={{ color: "rgba(61,50,42,0.42)" }}>{t.items.length} itens</p>
            </button>
          ))}
        </div>
      )}
      <button onClick={() => setShowApplyModal(false)} className="w-full py-3 rounded-xl text-sm"
        style={{ border: "1.5px solid rgba(169,137,80,0.3)", color: "#A98950" }}>
        Fechar
      </button>
    </div>
  </div>
)}

{/* New Task Modal */}
{showNewTaskModal && (
  <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
    <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 pb-10">
      <h2 className="text-[20px] font-light mb-4" style={{ color: "#3D322A", fontFamily: "'Cormorant Garamond', serif" }}>
        Nova Tarefa
      </h2>
      <div className="space-y-3">
        <input value={newTask.title} onChange={(e) => setNewTask((n) => ({ ...n, title: e.target.value }))}
          placeholder="Título da tarefa"
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{ border: "1.5px solid rgba(169,137,80,0.3)", color: "#3D322A", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }} />
        <select value={newTask.priority} onChange={(e) => setNewTask((n) => ({ ...n, priority: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{ border: "1.5px solid rgba(169,137,80,0.3)", color: "#3D322A", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
          <option value="HIGH">Prioridade Alta</option>
          <option value="MEDIUM">Prioridade Média</option>
          <option value="LOW">Prioridade Baixa</option>
        </select>
        <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask((n) => ({ ...n, dueDate: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{ border: "1.5px solid rgba(169,137,80,0.3)", color: "#3D322A", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }} />
      </div>
      <div className="flex gap-3 mt-4">
        <button onClick={() => setShowNewTaskModal(false)} className="flex-1 py-3 rounded-xl text-sm"
          style={{ border: "1.5px solid rgba(169,137,80,0.3)", color: "#A98950" }}>
          Cancelar
        </button>
        <button onClick={handleCreateTask} className="flex-1 py-3 rounded-xl text-white text-sm"
          style={{ background: "#A98950" }}>
          Criar
        </button>
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 2: Test in browser**

Navigate to `/cerimonialista/casamento/[id]` for an assigned wedding.
- "Tarefas" section appears and expands
- "Aplicar Template" opens modal with template list
- Applying a template creates tasks with correct dates
- "Nova Tarefa" creates a manual task
- Clicking circle toggles task DONE/PENDING
- Progress bar updates accordingly

- [ ] **Step 3: Commit**

```bash
git add src/app/cerimonialista/casamento/[id]/page.tsx
git commit -m "feat: tasks tab in cerimonialista wedding detail"
```

---

## Task 9: UI — Página de Tarefas do Casal

**Files:**
- Create: `src/app/casamento/[id]/tarefas/page.tsx`

- [ ] **Step 1: Create the couple tasks page**

```typescript
// src/app/casamento/[id]/tarefas/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, Check } from "lucide-react";
import BottomNav from "@/components/bottom-nav";

const GOLD = "#A98950";
const BROWN = "#3D322A";
const CREME = "#FAF6EF";

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: "#EF4444",
  MEDIUM: "#A98950",
  LOW: "rgba(61,50,42,0.42)",
};

const PRIORITY_LABEL: Record<string, string> = {
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
};

interface WeddingTask {
  id: string;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  dueDate: string | null;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  createdBy: { id: string; name: string | null };
}

type FilterStatus = "all" | "PENDING" | "DONE";

export default function TarefasPage() {
  const params = useParams();
  const weddingId = params?.id as string;
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<WeddingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [showModal, setShowModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "MEDIUM", dueDate: "" });

  async function loadTasks() {
    const res = await fetch(`/api/weddings/${weddingId}/tasks`);
    if (res.ok) {
      const data: WeddingTask[] = await res.json();
      setTasks(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (status === "authenticated") loadTasks();
  }, [status, weddingId]);

  async function toggleStatus(task: WeddingTask) {
    const next = task.status === "DONE" ? "PENDING" : "DONE";
    const res = await fetch(`/api/weddings/${weddingId}/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      const updated = tasks.map((t) => t.id === task.id ? { ...t, status: next as WeddingTask["status"] } : t);
      setTasks(updated);
      // Trigger confetti when all tasks are done
      if (next === "DONE" && updated.every((t) => t.status === "DONE") && updated.length > 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  }

  async function handleCreate() {
    if (!newTask.title.trim()) return;
    const res = await fetch(`/api/weddings/${weddingId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    if (res.ok) {
      setShowModal(false);
      setNewTask({ title: "", priority: "MEDIUM", dueDate: "" });
      loadTasks();
    }
  }

  const filtered = tasks.filter((t) => filter === "all" ? true : t.status === filter);
  const doneCount = tasks.filter((t) => t.status === "DONE").length;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREME }}>
        <div className="w-7 h-7 border-[1.5px] border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${GOLD} transparent ${GOLD} ${GOLD}` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>
      {/* Confetti */}
      {showConfetti && <ConfettiOverlay />}

      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <p className="text-[9px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "rgba(61,50,42,0.36)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
          Planejamento
        </p>
        <h1 className="text-[30px] font-light leading-tight"
          style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif" }}>
          Tarefas
        </h1>
      </div>

      <div className="px-5 space-y-4">
        {/* Progress bar */}
        {tasks.length > 0 && (
          <div>
            <div className="flex justify-between text-xs mb-1.5" style={{ color: "rgba(61,50,42,0.42)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              <span>{doneCount} de {tasks.length} concluídas</span>
              <span>{Math.round((doneCount / tasks.length) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white" style={{ border: "1px solid rgba(169,137,80,0.15)" }}>
              <div className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(doneCount / tasks.length) * 100}%`, background: GOLD }} />
            </div>
          </div>
        )}

        {/* Filters + New Task button */}
        <div className="flex items-center gap-2">
          {(["all", "PENDING", "DONE"] as FilterStatus[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-[10px] transition"
              style={{
                fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, letterSpacing: "0.08em",
                background: filter === f ? GOLD : "white",
                color: filter === f ? "white" : "rgba(61,50,42,0.42)",
                border: `1px solid ${filter === f ? GOLD : "rgba(169,137,80,0.2)"}`,
              }}>
              {f === "all" ? "Todas" : f === "PENDING" ? "Pendentes" : "Concluídas"}
            </button>
          ))}
          <button onClick={() => setShowModal(true)}
            className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
            style={{ background: GOLD }}>
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Task list */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: "rgba(61,50,42,0.42)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              {filter === "all" ? "Nenhuma tarefa ainda" : "Nenhuma tarefa neste filtro"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((task) => (
              <div key={task.id} className="bg-white rounded-2xl px-4 py-3.5 flex items-start gap-3"
                style={{ border: "1.5px solid rgba(169,137,80,0.12)", boxShadow: "0 1px 6px rgba(61,50,42,0.04)" }}>
                <button onClick={() => toggleStatus(task)}
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                  style={{
                    borderColor: task.status === "DONE" ? GOLD : "rgba(169,137,80,0.3)",
                    background: task.status === "DONE" ? GOLD : "transparent",
                  }}>
                  {task.status === "DONE" && <Check className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px]" style={{
                    color: task.status === "DONE" ? "rgba(61,50,42,0.35)" : BROWN,
                    textDecoration: task.status === "DONE" ? "line-through" : "none",
                    fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300,
                  }}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px]" style={{ color: PRIORITY_COLOR[task.priority] }}>
                      {PRIORITY_LABEL[task.priority]}
                    </span>
                    {task.dueDate && (
                      <span className="text-[10px]" style={{ color: "rgba(61,50,42,0.42)" }}>
                        · {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 pb-10">
            <h2 className="text-[22px] font-light mb-5" style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif" }}>
              Nova Tarefa
            </h2>
            <div className="space-y-3">
              <input value={newTask.title} onChange={(e) => setNewTask((n) => ({ ...n, title: e.target.value }))}
                placeholder="O que precisa ser feito?"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ border: "1.5px solid rgba(169,137,80,0.3)", color: BROWN, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }} />
              <select value={newTask.priority} onChange={(e) => setNewTask((n) => ({ ...n, priority: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ border: "1.5px solid rgba(169,137,80,0.3)", color: BROWN, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                <option value="HIGH">Alta prioridade</option>
                <option value="MEDIUM">Média prioridade</option>
                <option value="LOW">Baixa prioridade</option>
              </select>
              <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask((n) => ({ ...n, dueDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ border: "1.5px solid rgba(169,137,80,0.3)", color: BROWN, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }} />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl text-sm"
                style={{ border: "1.5px solid rgba(169,137,80,0.3)", color: GOLD }}>
                Cancelar
              </button>
              <button onClick={handleCreate} className="flex-1 py-3 rounded-xl text-white text-sm"
                style={{ background: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav weddingId={weddingId} />
    </div>
  );
}

// Confetti overlay — reuses the pattern from /src/app/onboarding/page.tsx
function ConfettiOverlay() {
  const pieces = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.4,
    color: ["#3D322A", "#A98950", "#FAF6EF"][Math.floor(Math.random() * 3)],
  }));

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          to { transform: translateY(100vh) rotateZ(360deg); opacity: 0; }
        }
      `}</style>
      {pieces.map((p) => (
        <div key={p.id} className="fixed pointer-events-none w-2 h-2 rounded-full"
          style={{
            left: `${p.left}%`,
            top: "-10px",
            backgroundColor: p.color,
            animation: `confetti-fall 2.5s ease-in forwards`,
            animationDelay: `${p.delay}s`,
            zIndex: 9999,
          }} />
      ))}
    </>
  );
}
```

- [ ] **Step 2: Add link to planejar page**

Open `src/app/casamento/[id]/planejar/page.tsx`. Find the `tools` array and add:

```typescript
{
  href: `${base}/tarefas`,
  icon: <CheckIcon />,   // add CheckIcon SVG near the other icon components
  title: "Tarefas",
  desc: "Acompanhe tarefas criadas pelo seu cerimonialista e adicione as suas",
  tag: "Novo",
},
```

Add the `CheckIcon` component (near the other icon definitions in the file):
```typescript
function CheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
```

- [ ] **Step 3: Test in browser**

Navigate to `/casamento/[id]/tarefas` (logged in as a couple).
- Page loads with task list (if planner applied a template, tasks appear)
- Filters work (Todas / Pendentes / Concluídas)
- "+" button opens modal, creates task
- Circle toggles DONE/PENDING
- Marking all tasks DONE triggers confetti
- Link visible in `/casamento/[id]/planejar`

- [ ] **Step 4: Commit**

```bash
git add src/app/casamento/[id]/tarefas/page.tsx src/app/casamento/[id]/planejar/page.tsx
git commit -m "feat: couple tasks page with confetti on completion"
```

---

## Self-Review

### Spec Coverage Check

| Spec Requirement | Task |
|-----------------|------|
| `TaskTemplate` model | Task 1 |
| `TaskTemplateItem` model | Task 1 |
| `WeddingTask` model | Task 1 |
| `TaskPhase`, `TaskPriority`, `TaskStatus` enums | Task 1 |
| GET/POST `/api/planner/task-templates` | Task 2 |
| PUT/DELETE `/api/planner/task-templates/[id]` | Task 3 |
| POST `/api/planner/task-templates/[id]/apply` with date calculation | Task 4 |
| GET/POST `/api/weddings/[id]/tasks` | Task 5 |
| PUT/DELETE `/api/weddings/[id]/tasks/[taskId]` | Task 5 |
| Cron D-2 push notifications | Task 6 |
| `vercel.json` cron schedule | Task 6 |
| Cerimonialista templates page | Task 7 |
| Tarefas section in cerimonialista wedding detail | Task 8 |
| Apply template modal in cerimonialista | Task 8 |
| Couple tasks page | Task 9 |
| Progress bar | Tasks 8 & 9 |
| Confetti at 100% | Task 9 |
| Priority colors | Tasks 7, 8 & 9 |
| Push on task creation (notify other side) | Task 5 |
| Push on task completion (notify creator) | Task 5 |
| Link in planejar page | Task 9 |

All spec requirements covered. No gaps found.
