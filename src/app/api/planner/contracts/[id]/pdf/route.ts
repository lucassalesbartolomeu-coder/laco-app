export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, notFoundResponse, errorResponse } from "@/lib/api-helpers";
import { ContractDocument } from "@/lib/contract-pdf";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return notFoundResponse("Perfil");

    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        wedding: true,
      },
    });

    if (!contract || contract.plannerId !== planner.id) return notFoundResponse("Contrato");

    const element = createElement(ContractDocument, {
      contract,
      planner: { companyName: planner.companyName, phone: planner.phone },
      wedding: {
        partnerName1: contract.wedding.partnerName1,
        partnerName2: contract.wedding.partnerName2,
        weddingDate: contract.wedding.weddingDate,
        venue: contract.wedding.venue,
        city: contract.wedding.city,
      },
    }) as unknown as ReactElement;

    const pdfBuffer = await renderToBuffer(element);

    const couple = `${contract.wedding.partnerName1}_${contract.wedding.partnerName2}`.replace(/\s/g, "-");
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="contrato-${couple}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return errorResponse("Erro ao gerar PDF");
  }
}
