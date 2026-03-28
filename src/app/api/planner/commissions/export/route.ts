import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, notFoundResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return notFoundResponse("Perfil");

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");

    const assignments = await prisma.weddingPlannerAssignment.findMany({
      where: { plannerId: planner.id },
      include: {
        wedding: { select: { partnerName1: true, partnerName2: true, weddingDate: true, city: true } },
      },
      orderBy: { assignedAt: "desc" },
    });

    const filtered = month
      ? assignments.filter((a) => {
          if (!a.wedding.weddingDate) return false;
          const d = new Date(a.wedding.weddingDate);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === month;
        })
      : assignments;

    const header = "Casal,Data Casamento,Cidade,Valor Comissão,Status,Data Atribuição";
    const rows = filtered.map((a) => {
      const couple = `${a.wedding.partnerName1} & ${a.wedding.partnerName2}`;
      const date = a.wedding.weddingDate
        ? new Date(a.wedding.weddingDate).toLocaleDateString("pt-BR")
        : "";
      const city = a.wedding.city ?? "";
      const value = a.commissionAmount != null ? `R$ ${a.commissionAmount.toFixed(2)}` : "—";
      const status = a.commissionPaid ? "Pago" : "Pendente";
      const assigned = new Date(a.assignedAt).toLocaleDateString("pt-BR");
      return [couple, date, city, value, status, assigned].map((v) => `"${v}"`).join(",");
    });

    const csv = [header, ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="comissoes${month ? `-${month}` : ""}.csv"`,
      },
    });
  } catch {
    return errorResponse();
  }
}
