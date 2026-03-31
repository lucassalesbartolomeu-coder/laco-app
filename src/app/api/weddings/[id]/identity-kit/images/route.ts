export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import OpenAI from "openai";
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

type Params = { params: Promise<{ id: string }> };

function buildInvitePrompts(
  style: string,
  mood: string,
  primaryColor: string,
  secondaryColor: string,
  accentColor: string,
  inviteDescription: string,
  tagline: string,
  name1: string,
  name2: string
) {
  const styleMap: Record<string, string> = {
    clássico: "classic elegant timeless",
    rústico: "rustic natural earthy warm",
    moderno: "modern contemporary minimalist clean",
    romântico: "romantic soft floral dreamy",
    minimalista: "minimalist simple white-space refined",
    boho: "bohemian eclectic whimsical free-spirited",
  };
  const styleEn = styleMap[style] ?? style;

  const baseDesc = `${styleEn} wedding stationery, color palette with ${primaryColor} as primary, ${secondaryColor} as secondary and ${accentColor} as accent. Mood: ${mood}. ${inviteDescription}`;

  return [
    // 1 — capa do convite
    `Flat lay photography of a ${styleEn} wedding invitation card for ${name1} & ${name2}, ${baseDesc}, elegant typography placeholder areas, premium paper texture, soft studio lighting, top-down view, no text`,

    // 2 — suite de papelaria
    `Wedding stationery suite flat lay for ${name1} & ${name2}: invitation envelope, RSVP card, menu card and place card, ${styleEn} design, ${baseDesc}, white marble background, soft shadows, editorial photography`,

    // 3 — detalhe decorativo / ornamento
    `Close-up detail of a ${styleEn} wedding invitation ornament or botanical illustration, ${baseDesc}, intricate decorative border or floral motif, gold foil or letterpress texture, macro photography, no people`,

    // 4 — cena ambiente (convite estilizado)
    `Styled scene with a ${styleEn} wedding invitation, ${baseDesc}, complemented by ${mood} decorative elements such as flowers, ribbons or candles, warm natural light, lifestyle photography, no text`,
  ];
}

function buildLogoPrompt(
  style: string,
  primaryColor: string,
  accentColor: string,
  name1: string,
  name2: string
) {
  const initial1 = name1.trim().charAt(0).toUpperCase();
  const initial2 = name2.trim().charAt(0).toUpperCase();
  const styleMap: Record<string, string> = {
    clássico: "classic elegant serif",
    rústico: "rustic botanical hand-drawn",
    moderno: "modern geometric sans-serif",
    romântico: "romantic script floral",
    minimalista: "minimalist linear",
    boho: "bohemian organic hand-lettered",
  };
  const styleEn = styleMap[style] ?? style;

  return `Wedding monogram crest logo design for initials ${initial1} & ${initial2} (${name1} and ${name2}), ${styleEn} style, ${primaryColor} and ${accentColor} color scheme, clean white background, vector illustration style, symmetrical composition, ornate decorative elements, no realistic photography`;
}

// POST /api/weddings/[id]/identity-kit/images — gera imagens DALL-E para o kit
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error, wedding } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const body = await request.json();
    const { kitId } = body;
    if (!kitId) return validationError("kitId é obrigatório");

    const kit = await prisma.identityKit.findFirst({
      where: { id: kitId, weddingId: id },
    });
    if (!kit) return notFoundResponse("Identity Kit");

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const ai = kit.aiResponse as Record<string, unknown> | null;
    if (!ai) return validationError("Este kit ainda não tem resposta AI gerada");

    const palette = ai.palette as Record<string, { hex: string }> | undefined;
    const invite = ai.invite as { description?: string; tagline?: string } | undefined;

    const primary = palette?.primary?.hex ?? "#1A1F3A";
    const secondary = palette?.secondary?.hex ?? "#C9A96E";
    const accent = palette?.accent?.hex ?? "#C9A96E";

    const name1 = wedding!.partnerName1;
    const name2 = wedding!.partnerName2;

    const invitePrompts = buildInvitePrompts(
      kit.style,
      kit.mood,
      primary,
      secondary,
      accent,
      invite?.description ?? "",
      invite?.tagline ?? "",
      name1,
      name2
    );

    const logoPrompt = buildLogoPrompt(kit.style, primary, accent, name1, name2);

    // Gera 5 imagens em paralelo (4 convites + 1 logo)
    const allPrompts = [...invitePrompts, logoPrompt];

    const results = await Promise.allSettled(
      allPrompts.map((prompt) =>
        client.images.generate({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          response_format: "url",
        })
      )
    );

    const imageUrls = results.map((r) =>
      r.status === "fulfilled" ? (r.value.data?.[0]?.url ?? null) : null
    );

    // Persiste as URLs no kit
    const updated = await prisma.identityKit.update({
      where: { id: kitId },
      data: { generatedImages: imageUrls.filter(Boolean) as string[] },
    });

    return NextResponse.json({ images: updated.generatedImages });
  } catch (err) {
    console.error("POST /api/weddings/[id]/identity-kit/images error:", err);
    return errorResponse();
  }
}
