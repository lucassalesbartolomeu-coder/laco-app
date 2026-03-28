import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  verifyWeddingOwnership,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  errorResponse,
} from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/weddings/[id]/guests/stats
 *
 * Returns guest counts grouped by rsvpStatus using a single DB aggregation.
 * Much more efficient than fetching all guests just to count them.
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const grouped = await prisma.guest.groupBy({
      by: ["rsvpStatus"],
      where: { weddingId: id },
      _count: { _all: true },
    });

    const total = grouped.reduce((sum, g) => sum + g._count._all, 0);
    const confirmed = grouped.find((g) => g.rsvpStatus === "confirmado")?._count._all ?? 0;
    const declined = grouped.find((g) => g.rsvpStatus === "recusado")?._count._all ?? 0;
    const maybe = grouped.find((g) => g.rsvpStatus === "talvez")?._count._all ?? 0;
    const pending = total - confirmed - declined - maybe;

    return NextResponse.json({ total, confirmed, declined, maybe, pending });
  } catch (error) {
    console.error("GET /api/weddings/[id]/guests/stats error:", error);
    return errorResponse();
  }
}
