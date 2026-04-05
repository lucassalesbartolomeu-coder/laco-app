import { NextResponse } from "next/server";
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
import { supabaseAdmin } from "@/lib/supabase-admin";
import * as Sentry from "@sentry/nextjs";

type Params = { params: Promise<{ id: string; vendorId: string }> };

const BUCKET = "vendor-documents";
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// GET /api/weddings/[id]/vendors/[vendorId]/documents
export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, vendorId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const vendor = await prisma.vendor.findFirst({ where: { id: vendorId, weddingId: id } });
    if (!vendor) return notFoundResponse("Fornecedor");

    const documents = await prisma.vendorDocument.findMany({
      where: { vendorId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    Sentry.captureException(error);
    return errorResponse();
  }
}

// POST /api/weddings/[id]/vendors/[vendorId]/documents
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, vendorId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const vendor = await prisma.vendor.findFirst({ where: { id: vendorId, weddingId: id } });
    if (!vendor) return notFoundResponse("Fornecedor");

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return validationError("Arquivo obrigatório");
    }
    if (file.size > MAX_SIZE) {
      return validationError("Arquivo muito grande (máx 10 MB)");
    }
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      return validationError("Apenas arquivos PDF são aceitos");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${id}/${vendorId}/${timestamp}-${safeName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType: file.type || "application/pdf", upsert: false });

    if (uploadError) {
      Sentry.captureException(uploadError);
      return NextResponse.json({ error: "Falha no upload" }, { status: 500 });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath);

    let doc;
    try {
      doc = await prisma.vendorDocument.create({
        data: {
          vendorId,
          name: file.name,
          url: publicUrl,
          storagePath,
          size: file.size,
        },
      });
    } catch (dbError) {
      // Compensate: remove the uploaded file so Storage doesn't accumulate orphans
      await supabaseAdmin.storage.from(BUCKET).remove([storagePath]).catch(() => {});
      throw dbError;
    }

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    Sentry.captureException(error);
    return errorResponse();
  }
}
