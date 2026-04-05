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
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const tasks = await prisma.weddingTask.findMany({
      where: {
        status: { not: "DONE" },
        dueDate: { gte: startOfDay, lte: endOfDay },
        notifiedAt: null,
      },
      include: {
        wedding: {
          select: {
            userId: true,
            partnerUserId: true,
            plannerAssignments: {
              select: { planner: { select: { user: { select: { id: true } } } } },
            },
          },
        },
      },
    });

    let notified = 0;

    for (const task of tasks) {
      const userIds = new Set<string>();
      if (task.wedding.userId) userIds.add(task.wedding.userId);
      if (task.wedding.partnerUserId) userIds.add(task.wedding.partnerUserId);
      task.wedding.plannerAssignments?.forEach((a) => {
        const uid = a.planner?.user?.id;
        if (uid) userIds.add(uid);
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
