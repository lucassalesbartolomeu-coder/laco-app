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
import { supabaseAdmin } from "@/lib/supabase-admin";
import * as Sentry from "@sentry/nextjs";

type Params = { params: Promise<{ id: string; vendorId: string; docId: string }> };

const BUCKET = "vendor-documents";

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

    if (doc.storagePath) {
      const { error: storageError } = await supabaseAdmin.storage.from(BUCKET).remove([doc.storagePath]);
      if (storageError) {
        Sentry.captureException(storageError);
      }
    }

    await prisma.vendorDocument.delete({ where: { id: docId } });

    return NextResponse.json({ message: "Documento removido" });
  } catch (error) {
    Sentry.captureException(error);
    return errorResponse();
  }
}
