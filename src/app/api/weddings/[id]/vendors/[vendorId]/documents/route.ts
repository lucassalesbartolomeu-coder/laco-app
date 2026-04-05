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

type Params = { params: Promise<{ id: string; vendorId: string }> };

const BUCKET = "vendor-documents";
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

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
      return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande (máx 10 MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${id}/${vendorId}/${timestamp}-${safeName}`;

    const supabase = getSupabaseAdmin();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType: "application/pdf", upsert: false });

    if (uploadError) {
      Sentry.captureException(uploadError);
      return NextResponse.json({ error: "Falha no upload" }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    const doc = await prisma.vendorDocument.create({
      data: {
        vendorId,
        name: file.name,
        url: publicUrl,
        size: file.size,
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    Sentry.captureException(error);
    return errorResponse();
  }
}
