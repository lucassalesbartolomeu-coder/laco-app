import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

// GET — last 20 notifications
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return NextResponse.json({ notifications: [], unreadCount: 0 });

    const notifications = await prisma.plannerNotification.findMany({
      where: { plannerId: planner.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = notifications.filter((n) => !n.read).length;
    return NextResponse.json({ notifications, unreadCount });
  } catch {
    return errorResponse();
  }
}

// PATCH — mark all as read
export async function PATCH() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return NextResponse.json({ ok: true });

    await prisma.plannerNotification.updateMany({
      where: { plannerId: planner.id, read: false },
      data: { read: true },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return errorResponse();
  }
}
