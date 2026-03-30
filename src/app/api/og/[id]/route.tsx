import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const revalidate = 3600;

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  let partnerName1 = "Casal";
  let partnerName2 = "";
  let weddingDate: string | null = null;
  let venue: string | null = null;
  let city: string | null = null;

  try {
    const wedding = await prisma.wedding.findUnique({
      where: { id },
      select: { partnerName1: true, partnerName2: true, weddingDate: true, venue: true, city: true },
    });
    if (wedding) {
      partnerName1 = wedding.partnerName1;
      partnerName2 = wedding.partnerName2;
      weddingDate = wedding.weddingDate?.toISOString() ?? null;
      venue = wedding.venue;
      city = wedding.city;
    }
  } catch {
    // fall through to defaults
  }

  const dateLabel = weddingDate
    ? new Date(weddingDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  const locationLabel = [venue, city].filter(Boolean).join(" — ");

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1A1F3A 0%, #1A1F3A 70%, #2a2f4a 100%)",
          position: "relative",
          fontFamily: "serif",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Gold accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "#C9A96E",
          }}
        />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 48 }}>
          <span style={{ fontSize: 24, color: "rgba(255,255,255,0.4)", letterSpacing: 6, textTransform: "uppercase", fontFamily: "sans-serif" }}>
            Laço
          </span>
        </div>

        {/* Names */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
          <span style={{ fontSize: 72, color: "#FAF7F2", fontWeight: 300 }}>{partnerName1}</span>
          <span style={{ fontSize: 48, color: "#C9A96E" }}>&</span>
          <span style={{ fontSize: 72, color: "#FAF7F2", fontWeight: 300 }}>{partnerName2}</span>
        </div>

        {/* Date */}
        {dateLabel && (
          <div style={{ display: "flex", marginBottom: 16 }}>
            <span style={{ fontSize: 28, color: "rgba(255,255,255,0.6)", fontFamily: "sans-serif" }}>
              {dateLabel}
            </span>
          </div>
        )}

        {/* Location */}
        {locationLabel && (
          <div style={{ display: "flex" }}>
            <span style={{ fontSize: 22, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif" }}>
              {locationLabel}
            </span>
          </div>
        )}

        {/* Bottom gold line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "#C9A96E",
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
