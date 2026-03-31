export const dynamic = "force-dynamic";

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
import { getTemplate } from "@/lib/identity-kit-templates";

const FREE_GENERATION_LIMIT = 3;

const SYSTEM_PROMPT = `Você é um especialista em identidade visual para casamentos no Brasil.
Com base nas preferências do casal, gere uma identidade visual completa, coerente e emocionalmente ressonante.
Retorne APENAS um JSON válido, sem markdown, sem texto adicional.`;

function buildUserPrompt(
  style: string,
  paletteChoice: string,
  mood: string,
  tone: string,
  hasVenuePhoto: boolean
) {
  const venuePhotoNote = hasVenuePhoto
    ? "\nFoto do local: fornecida (analise as cores, texturas, iluminação e arquitetura da imagem para inspirar toda a identidade e gerar a aquarela)."
    : "";

  const venueIllustrationField = hasVenuePhoto
    ? `,
  "venueIllustration": {
    "description": "Descrição poética da aquarela do local (2-3 frases sobre como o espaço seria representado em aquarela, com quais cores e traços)",
    "prompt": "Prompt em inglês para geração de imagem no Midjourney ou DALL-E, descrevendo a aquarela do espaço com estilo artístico, cores, técnica e atmosfera. Exemplo: 'watercolor illustration of [venue description], soft pastel colors, loose brushstrokes, romantic atmosphere, wedding venue, fine art style'"
  }`
    : "";

  return `Crie a identidade visual para um casamento com as seguintes características:

Estilo visual: ${style}
Paleta de cores base: ${paletteChoice === "ai" ? "Gere uma paleta original harmonizada com o estilo" : `Paleta pré-definida "${paletteChoice}" (adapte com criatividade)`}
Clima/Mood: ${mood}
Tom de voz: ${tone}${venuePhotoNote}

Retorne exatamente este JSON (sem campos extras):
{
  "palette": {
    "primary": { "hex": "#XXXXXX", "name": "Nome poético em português" },
    "secondary": { "hex": "#XXXXXX", "name": "Nome poético em português" },
    "accent": { "hex": "#XXXXXX", "name": "Nome poético em português" },
    "background": { "hex": "#XXXXXX", "name": "Nome poético em português" },
    "text": { "hex": "#XXXXXX", "name": "Nome poético em português" },
    "muted": { "hex": "#XXXXXX", "name": "Nome poético em português" }
  },
  "typography": {
    "heading": { "family": "Nome exato da fonte no Google Fonts", "style": "descrição do uso (ex: serifada, elegante, ideal para títulos)" },
    "body": { "family": "Nome exato da fonte no Google Fonts", "style": "descrição do uso" }
  },
  "invite": {
    "description": "Descrição poética e visual do convite (3-4 frases)",
    "layout": "vertical-centered | horizontal | classic-fold | modern-minimal",
    "tagline": "Frase de abertura do convite (1 frase poética ou divertida, no tom escolhido)"
  },
  "siteTheme": {
    "templateId": "classico | rustico | moderno | romantico | minimalista | boho",
    "reason": "1 frase explicando por que este template combina com o casal"
  },
  "menu": {
    "entrada": "2 sugestões de entrada separadas por barra, coerentes com o estilo",
    "principal": "2 sugestões de prato principal separadas por barra",
    "sobremesa": "2 sugestões de sobremesa separadas por barra"
  },
  "decoration": [
    "Sugestão 1 de decoração específica e visual",
    "Sugestão 2",
    "Sugestão 3",
    "Sugestão 4",
    "Sugestão 5"
  ]${venueIllustrationField}
}`;
}

type Params = { params: Promise<{ id: string }> };

// GET /api/weddings/[id]/identity-kit — retorna o kit mais recente + contagem
export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const [latestKit, count] = await Promise.all([
      prisma.identityKit.findFirst({
        where: { weddingId: id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.identityKit.count({ where: { weddingId: id } }),
    ]);

    return NextResponse.json({ kit: latestKit, generationCount: count });
  } catch (err) {
    console.error("GET /api/weddings/[id]/identity-kit error:", err);
    return errorResponse();
  }
}

// POST /api/weddings/[id]/identity-kit — gera um novo kit via AI
export async function POST(request: Request, { params }: Params) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error, wedding } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    // Rate limit: 3 gerações para plano free
    if (!wedding!.isPremium) {
      const count = await prisma.identityKit.count({ where: { weddingId: id } });
      if (count >= FREE_GENERATION_LIMIT) {
        return NextResponse.json(
          { error: `Limite de ${FREE_GENERATION_LIMIT} gerações atingido no plano gratuito.` },
          { status: 429 }
        );
      }
    }

    const body = await request.json();
    const { style, paletteChoice, mood, tone, referenceUrls = [], venuePhotoBase64 } = body;

    // ── Preset (arte pronta) — skip OpenAI ──
    if (body.preset && body.presetId) {
      const { TEMPLATES } = await import("@/lib/identity-kit-templates");
      const template = TEMPLATES[body.presetId as string];
      if (!template) return validationError("presetId inválido");

      const aiResponse = {
        palette: {
          primary:    { hex: template.colors.primary,    name: "Principal"   },
          secondary:  { hex: template.colors.secondary,  name: "Secundária"  },
          accent:     { hex: template.colors.accent,     name: "Destaque"    },
          background: { hex: template.colors.background, name: "Fundo"       },
          text:       { hex: template.colors.text,       name: "Texto"       },
          muted:      { hex: template.colors.muted,      name: "Suave"       },
        },
        typography: {
          heading: { family: template.fonts.heading, style: "Para títulos e destaque" },
          body:    { family: template.fonts.body || template.fonts.heading, style: "Para texto corrido" },
        },
        invite: {
          description: template.description,
          layout: "vertical-centered",
          tagline: "Com amor, celebramos esse momento especial.",
        },
        siteTheme: { templateId: template.id, reason: `Tema ${template.name} selecionado como arte pronta.` },
        menu: {
          entrada:    "Bruschetta / Carpaccio",
          principal:  "Filé ao molho / Salmão grelhado",
          sobremesa:  "Petit gâteau / Mousse de maracujá",
        },
        decoration: [
          "Flores sazonais nas mesas",
          "Velas aromáticas",
          "Tule e fitas na paleta do tema",
          "Centro de mesa floral",
          "Painel de flores na entrada",
        ],
      };

      const kit = await prisma.identityKit.create({
        data: {
          weddingId: id,
          style:        template.style,
          paletteChoice: template.id,
          mood:         template.description,
          tone:         "tradicional",
          referenceUrls: [],
          aiResponse,
        },
      });
      const totalCount = await prisma.identityKit.count({ where: { weddingId: id } });
      return NextResponse.json({ kit, generationCount: totalCount });
    }

    if (!style || !paletteChoice || !mood || !tone) {
      return validationError("style, paletteChoice, mood e tone são obrigatórios");
    }

    const hasVenuePhoto = typeof venuePhotoBase64 === "string" && venuePhotoBase64.startsWith("data:image");
    const promptText = buildUserPrompt(style, paletteChoice, mood, tone, hasVenuePhoto);

    // Monta o conteúdo do usuário: texto + imagem opcional
    type UserContent = string | Array<{ type: string; text?: string; image_url?: { url: string; detail: string } }>;
    let userContent: UserContent;

    if (hasVenuePhoto) {
      userContent = [
        { type: "text", text: promptText },
        { type: "image_url", image_url: { url: venuePhotoBase64, detail: "high" } },
      ];
    } else {
      userContent = promptText;
    }

    // Gera identidade via GPT-4o (com vision se foto fornecida)
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { role: "user", content: userContent as any },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2500,
      temperature: 0.85,
    });

    const aiResponse = JSON.parse(response.choices[0].message.content || "{}");

    // Persiste o kit gerado
    const kit = await prisma.identityKit.create({
      data: {
        weddingId: id,
        style,
        paletteChoice,
        mood,
        tone,
        referenceUrls,
        aiResponse,
      },
    });

    const totalCount = await prisma.identityKit.count({ where: { weddingId: id } });

    return NextResponse.json({ kit, generationCount: totalCount });
  } catch (err) {
    console.error("POST /api/weddings/[id]/identity-kit error:", err);
    return errorResponse();
  }
}

// PATCH /api/weddings/[id]/identity-kit — aplica o kit ao site público
export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const { kitId } = await request.json();
    if (!kitId) return validationError("kitId é obrigatório");

    const kit = await prisma.identityKit.findFirst({
      where: { id: kitId, weddingId: id },
    });
    if (!kit) return notFoundResponse("Identity Kit");

    const ai = kit.aiResponse as Record<string, unknown> | null;
    if (!ai) return validationError("Este kit ainda não tem resposta AI gerada");

    // Monta o theme para o Wedding: usa palette + typography da AI + templateId sugerido
    const aiPalette = ai.palette as Record<string, { hex: string; name: string }> | undefined;
    const aiTypo = ai.typography as { heading: { family: string }; body: { family: string } } | undefined;
    const aiSiteTheme = ai.siteTheme as { templateId: string } | undefined;

    const templateId = aiSiteTheme?.templateId ?? "classico";
    const fallback = getTemplate(kit.style);

    const theme = {
      templateId,
      kitId,
      palette: {
        primary: aiPalette?.primary?.hex ?? fallback.colors.primary,
        secondary: aiPalette?.secondary?.hex ?? fallback.colors.secondary,
        accent: aiPalette?.accent?.hex ?? fallback.colors.accent,
        background: aiPalette?.background?.hex ?? fallback.colors.background,
        text: aiPalette?.text?.hex ?? fallback.colors.text,
        muted: aiPalette?.muted?.hex ?? fallback.colors.muted,
        hero: fallback.colors.hero,
        heroBorder: aiPalette?.accent?.hex ?? fallback.colors.heroBorder,
      },
      fonts: {
        heading: aiTypo?.heading?.family ?? fallback.fonts.heading,
        body: aiTypo?.body?.family ?? fallback.fonts.body,
      },
    };

    await Promise.all([
      prisma.wedding.update({
        where: { id },
        data: { theme, style: kit.style },
      }),
      prisma.identityKit.update({
        where: { id: kitId },
        data: { appliedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ ok: true, theme });
  } catch (err) {
    console.error("PATCH /api/weddings/[id]/identity-kit error:", err);
    return errorResponse();
  }
}
