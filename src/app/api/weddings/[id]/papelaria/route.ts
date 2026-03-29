/**
 * GET  /api/weddings/[id]/papelaria  — lista itens de papelaria disponíveis
 * POST /api/weddings/[id]/papelaria  — gera PDF de um item usando o Identity Kit
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
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
import {
  SaveTheDateDocument,
  MenuDocument,
  TagLencinhoDocument,
  ConviteDocument,
  type IdentityKitData,
  type KitPalette,
  type KitTypography,
  type MenuData,
  type SaveTheDateData,
  type TagLencinhoData,
  type ConviteData,
} from "@/lib/papelaria-pdf";

// ─── Types ────────────────────────────────────────────────────────────────────

type PapelariaType = "save-the-date" | "menu" | "tag-lencinho" | "convite";

const ITEMS: Array<{
  type: PapelariaType;
  label: string;
  desc: string;
  available: boolean;
}> = [
  {
    type: "save-the-date",
    label: "Save the Date",
    desc: "PDF elegante com nomes, data e local",
    available: true,
  },
  {
    type: "menu",
    label: "Menu de Casamento",
    desc: "Cardápio personalizado nas cores do kit",
    available: true,
  },
  {
    type: "tag-lencinho",
    label: "Tag Lencinho",
    desc: "Tag 8×8cm para lágrimas de alegria",
    available: true,
  },
  {
    type: "convite",
    label: "Convite Digital",
    desc: "Convite formal para WhatsApp e e-mail",
    available: true,
  },
];

type Params = { params: Promise<{ id: string }> };

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    // Verifica se o casal tem Identity Kit gerado
    const kit = await prisma.identityKit.findFirst({
      where: { weddingId: id },
      orderBy: { createdAt: "desc" },
      select: { id: true, appliedAt: true },
    });

    return NextResponse.json({
      items: ITEMS,
      hasKit: !!kit,
      kitApplied: !!kit?.appliedAt,
    });
  } catch (err) {
    console.error("GET /api/weddings/[id]/papelaria error:", err);
    return errorResponse();
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error, wedding } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const body = await req.json() as {
      type?: PapelariaType;
      customData?: MenuData & SaveTheDateData & TagLencinhoData & ConviteData;
    };
    const { type, customData } = body;

    const validTypes: PapelariaType[] = ["save-the-date", "menu", "tag-lencinho", "convite"];
    if (!type || !validTypes.includes(type)) {
      return validationError(
        `type deve ser um de: ${validTypes.join(", ")}`
      );
    }

    // Busca o Identity Kit mais recente
    const kitRecord = await prisma.identityKit.findFirst({
      where: { weddingId: id },
      orderBy: { createdAt: "desc" },
    });

    if (!kitRecord) {
      return NextResponse.json(
        {
          error: "Identity Kit não encontrado. Gere seu Identity Kit primeiro em Identidade Visual.",
          code: "NO_KIT",
        },
        { status: 422 }
      );
    }

    // Extrai palette e typography do aiResponse
    const ai = kitRecord.aiResponse as Record<string, unknown> | null;

    const aiPalette = ai?.palette as Record<string, { hex: string; name: string }> | undefined;
    const aiTypo = ai?.typography as { heading: { family: string; style: string }; body: { family: string; style: string } } | undefined;
    const aiInvite = ai?.invite as { tagline?: string; description?: string } | undefined;
    const aiMenu = ai?.menu as { entrada?: string; principal?: string; sobremesa?: string } | undefined;

    const palette: KitPalette = {
      primary: aiPalette?.primary?.hex ?? "#1A3A33",
      secondary: aiPalette?.secondary?.hex ?? "#C4734F",
      accent: aiPalette?.accent?.hex ?? "#D4AF6A",
      background: aiPalette?.background?.hex ?? "#FAF8F4",
      text: aiPalette?.text?.hex ?? "#1A1A1A",
      muted: aiPalette?.muted?.hex ?? "#6B7280",
    };

    const typography: KitTypography = {
      heading: aiTypo?.heading ?? { family: "Helvetica-Bold", style: "elegante" },
      body: aiTypo?.body ?? { family: "Helvetica", style: "clean" },
    };

    const kitData: IdentityKitData = {
      palette,
      typography,
      style: kitRecord.style,
      invite: aiInvite,
    };

    const weddingInfo = {
      partnerName1: wedding!.partnerName1,
      partnerName2: wedding!.partnerName2,
      weddingDate: wedding!.weddingDate,
      venue: wedding!.venue,
      city: wedding!.city,
    };

    // Monta o menu: mescla sugestões do kit com personalização do casal
    const menuData: MenuData = {
      boasVindas: customData?.boasVindas ?? undefined,
      entrada: customData?.entrada ?? aiMenu?.entrada ?? undefined,
      principal: customData?.principal ?? aiMenu?.principal ?? undefined,
      sobremesa: customData?.sobremesa ?? aiMenu?.sobremesa ?? undefined,
      bebidas: customData?.bebidas ?? undefined,
    };

    // Gera o PDF
    let element: ReactElement;
    let filename: string;
    const coupleSafe = `${weddingInfo.partnerName1}_${weddingInfo.partnerName2}`.replace(/\s/g, "-");

    switch (type) {
      case "save-the-date":
        element = createElement(SaveTheDateDocument, {
          kit: kitData,
          wedding: weddingInfo,
          custom: customData,
        }) as unknown as ReactElement;
        filename = `save-the-date-${coupleSafe}.pdf`;
        break;

      case "menu":
        element = createElement(MenuDocument, {
          kit: kitData,
          wedding: weddingInfo,
          menu: menuData,
        }) as unknown as ReactElement;
        filename = `menu-${coupleSafe}.pdf`;
        break;

      case "tag-lencinho":
        element = createElement(TagLencinhoDocument, {
          kit: kitData,
          wedding: weddingInfo,
          custom: customData,
        }) as unknown as ReactElement;
        filename = `tag-lencinho-${coupleSafe}.pdf`;
        break;

      case "convite":
        element = createElement(ConviteDocument, {
          kit: kitData,
          wedding: weddingInfo,
          custom: customData,
        }) as unknown as ReactElement;
        filename = `convite-${coupleSafe}.pdf`;
        break;
    }

    const pdfBuffer = await renderToBuffer(element!);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("POST /api/weddings/[id]/papelaria error:", err);
    return errorResponse("Erro ao gerar PDF");
  }
}
