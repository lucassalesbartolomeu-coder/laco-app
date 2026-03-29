import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  forbiddenResponse,
  validationError,
  errorResponse,
} from "@/lib/api-helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id: weddingId } = await params;

    // Verify ownership or partner access
    const wedding = await prisma.wedding.findUnique({ where: { id: weddingId } });
    if (!wedding) return NextResponse.json({ error: "Casamento não encontrado" }, { status: 404 });
    if (wedding.userId !== user.id && wedding.partnerUserId !== user.id) {
      return forbiddenResponse();
    }

    const body = await req.json();
    const { name, whatsapp, weddingDate, city } = body;

    if (!name || !whatsapp) {
      return validationError("Nome e WhatsApp são obrigatórios");
    }

    // Log the lead (simple implementation — persists as a note in console + could integrate with CRM later)
    console.log("[Maquininha Lead]", {
      weddingId,
      userId: user.id,
      name,
      whatsapp,
      weddingDate,
      city,
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: "Solicitação registrada" });
  } catch (error) {
    console.error("POST /api/weddings/[id]/maquininha error:", error);
    return errorResponse();
  }
}
