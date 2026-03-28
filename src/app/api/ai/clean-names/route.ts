export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const { contacts } = await req.json() as {
      contacts: { name: string; phone: string }[];
    };

    if (!contacts?.length) {
      return NextResponse.json({ cleaned: [] });
    }

    const list = contacts
      .map((c, i) => `${i + 1}. "${c.name}"`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `Você é um assistente que limpa e normaliza nomes de contatos de celular para uma lista de convidados de casamento.

Regras:
- Se o nome contiver o nome de uma empresa ou cargo, remova e deixe apenas o nome pessoal
- Se for um apelido óbvio (ex: "Duda", "Ju"), mantenha como está pois pode ser o nome preferido
- Formate corretamente (Primeira Letra Maiúscula em cada nome)
- Remova caracteres estranhos, emojis, dígitos, parênteses
- Se tiver "Dr.", "Sr.", "Prof." como prefixo, remova
- Se não for possível identificar um nome pessoal, retorne a string vazia ""
- Retorne APENAS um JSON válido: {"cleaned": ["nome limpo 1", "nome limpo 2", ...]}, na mesma ordem da entrada`,
        },
        {
          role: "user",
          content: `Limpe estes nomes de contatos:\n${list}`,
        },
      ],
    });

    const raw = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(raw) as { cleaned: string[] };

    return NextResponse.json({ cleaned: parsed.cleaned ?? [] });
  } catch (err) {
    console.error("[clean-names]", err);
    return errorResponse("Erro ao processar nomes");
  }
}
