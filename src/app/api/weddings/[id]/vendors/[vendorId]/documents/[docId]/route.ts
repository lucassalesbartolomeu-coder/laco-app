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

    // Extract relative path from public Supabase Storage URL
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
