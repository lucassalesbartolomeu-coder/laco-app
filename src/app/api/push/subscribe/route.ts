import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import * as Sentry from "@sentry/nextjs";

// POST /api/push/subscribe — salva a push subscription do usuário
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = await req.json();
    const { subscription, weddingId } = body as {
      subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
      weddingId?: string;
    };

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: "subscription inválida" }, { status: 400 });
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth, weddingId: weddingId ?? null },
      create: {
        userId: user.id,
        weddingId: weddingId ?? null,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    Sentry.captureException(error);
    return errorResponse();
  }
}

// DELETE /api/push/subscribe — remove a push subscription
export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { endpoint } = await req.json();
    if (endpoint) {
      await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: user.id } });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    Sentry.captureException(error);
    return errorResponse();
  }
}
