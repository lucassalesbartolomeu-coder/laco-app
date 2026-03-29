export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  verifyWeddingOwnership,
  unauthorizedResponse,
  forbiddenResponse,
  errorResponse,
} from "@/lib/api-helpers";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  urgency: "high" | "normal";
}

// GET /api/weddings/[id]/suggestions
// Retorna sugestões inteligentes com base no estado do casamento.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { error, wedding } = await verifyWeddingOwnership(params.id, user.id);
    if (error === "not_found" || error === "forbidden") return forbiddenResponse();
    if (!wedding) return forbiddenResponse();

    // Dados necessários para as regras
    const [guestCount, confirmedCount, vendorCount, identityKitCount] = await Promise.all([
      prisma.guest.count({ where: { weddingId: wedding.id } }),
      prisma.guest.count({ where: { weddingId: wedding.id, confirmed: true } }),
      prisma.vendor.count({ where: { weddingId: wedding.id } }),
      prisma.identityKit.count({ where: { weddingId: wedding.id } }),
    ]);

    const suggestions: Suggestion[] = [];

    // Calcular dias restantes
    let diasRestantes: number | null = null;
    if (wedding.weddingDate) {
      diasRestantes = Math.ceil(
        (new Date(wedding.weddingDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) /
          86400000
      );
    }

    // Regra 1: < 90 dias e confirmados < 50%
    if (
      diasRestantes !== null &&
      diasRestantes > 0 &&
      diasRestantes < 90 &&
      guestCount > 0 &&
      confirmedCount / guestCount < 0.5
    ) {
      suggestions.push({
        id: "reminder-rsvp",
        title: "Hora de enviar lembretes!",
        description: `Apenas ${confirmedCount} de ${guestCount} convidados confirmaram. Faltam ${diasRestantes} dias.`,
        ctaLabel: "Ver confirmações",
        ctaHref: `/casamento/${wedding.id}/confirmacoes`,
        urgency: "high",
      });
    }

    // Regra 2: < 60 dias e sem fornecedores
    if (
      diasRestantes !== null &&
      diasRestantes > 0 &&
      diasRestantes < 60 &&
      vendorCount === 0
    ) {
      suggestions.push({
        id: "add-vendor",
        title: "Feche o buffet agora",
        description: `Faltam ${diasRestantes} dias e você ainda não tem fornecedores cadastrados.`,
        ctaLabel: "Adicionar fornecedor",
        ctaHref: `/casamento/${wedding.id}/fornecedores`,
        urgency: "high",
      });
    }

    // Regra 3: sem Identity Kit
    if (identityKitCount === 0) {
      suggestions.push({
        id: "create-identity-kit",
        title: "Crie a identidade visual em 2 minutos",
        description: "Gere convites, paleta de cores e tema do site com IA.",
        ctaLabel: "Gerar agora",
        ctaHref: `/casamento/${wedding.id}/identity-kit`,
        urgency: "normal",
      });
    }

    // Regra 4: 0 convidados
    if (guestCount === 0) {
      suggestions.push({
        id: "add-guests",
        title: "Comece adicionando sua lista de convidados",
        description: "Organize quem você vai convidar e acompanhe as confirmações.",
        ctaLabel: "Adicionar convidados",
        ctaHref: `/casamento/${wedding.id}/convidados`,
        urgency: "normal",
      });
    }

    // Regra 5: tem casamento mas sem data
    if (!wedding.weddingDate) {
      suggestions.push({
        id: "set-wedding-date",
        title: "Complete as informações do casamento",
        description: "Defina a data para começar a contagem regressiva e receber sugestões personalizadas.",
        ctaLabel: "Completar",
        ctaHref: `/casamento/${wedding.id}/editar`,
        urgency: "normal",
      });
    }

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("GET /api/weddings/[id]/suggestions error:", error);
    return errorResponse();
  }
}
