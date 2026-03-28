export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

const SYSTEM_PROMPT = `Você é um assistente especializado em extrair dados estruturados de orçamentos de fornecedores para casamentos.
Analise a imagem ou texto do orçamento e retorne APENAS um JSON válido com a seguinte estrutura:
{
  "vendor": "nome do fornecedor",
  "category": "categoria (buffet/foto/video/som/DJ/decoracao/convites/doces/bolo/maquiagem/celebrante/carro/outros)",
  "items": [
    { "description": "descrição do item", "qty": 1, "unitPrice": 0.00, "total": 0.00 }
  ],
  "paymentTerms": "condições de pagamento",
  "validUntil": "data de validade ISO ou null",
  "totalValue": 0.00,
  "notes": "observações adicionais"
}
Se um campo não estiver disponível, use null. Valores monetários em reais (BRL) como número float.`;

export async function POST(request: Request) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rawText = formData.get("text") as string | null;

    if (!file && !rawText) {
      return NextResponse.json({ error: "Envie um arquivo ou texto" }, { status: 400 });
    }

    let extractedData: Record<string, unknown>;

    if (rawText) {
      // Text-based extraction
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Extraia os dados deste orçamento:\n\n${rawText}` },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });
      extractedData = JSON.parse(response.choices[0].message.content || "{}");
    } else {
      const fileType = file!.type;

      if (fileType === "application/pdf") {
        return NextResponse.json(
          { error: "PDFs ainda não suportados. Envie uma foto (JPG/PNG) do orçamento." },
          { status: 422 }
        );
      }

      // Image (JPG/PNG/WebP) → base64 → Vision
      const arrayBuffer = await file!.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");
      const mimeType = fileType || "image/jpeg";

      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Extraia os dados estruturados deste orçamento:" },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64}`, detail: "high" },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });
      extractedData = JSON.parse(response.choices[0].message.content || "{}");
    }

    return NextResponse.json({
      ...extractedData,
      rawOcrText: rawText || `[arquivo: ${file?.name}]`,
    });
  } catch (error) {
    console.error("POST /api/ocr/quote error:", error);
    return errorResponse();
  }
}
