import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const names = searchParams.get("names") ?? "Noivos";
  const date = searchParams.get("date") ?? "";
  const venue = searchParams.get("venue") ?? "";
  const style = searchParams.get("style") ?? "classico";

  // Subtle accent variant based on style
  const accentColor =
    style === "moderno"
      ? "#8B9E6E"
      : style === "rustico"
        ? "#B07D5A"
        : "#C9A96E"; // classico / default → gold

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1A1F3A",
          position: "relative",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Gradient fundo verde-noite → midnight */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, #1A1F3A 0%, #1A1F3A 45%, #1A1F3A 100%)",
          }}
        />

        {/* Subtle radial glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(201,169,110,0.10) 0%, transparent 70%)",
          }}
        />

        {/* Top decorative line */}
        <div
          style={{
            position: "absolute",
            top: "48px",
            left: "80px",
            right: "80px",
            height: "1px",
            backgroundColor: accentColor,
            opacity: 0.4,
          }}
        />

        {/* Bottom decorative line */}
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            left: "80px",
            right: "80px",
            height: "1px",
            backgroundColor: accentColor,
            opacity: 0.4,
          }}
        />

        {/* Laço watermark — top left */}
        <div
          style={{
            position: "absolute",
            top: "28px",
            left: "80px",
            fontSize: "22px",
            color: "#F0EDE7",
            opacity: 0.5,
            fontFamily: "Georgia, serif",
            letterSpacing: "0.05em",
          }}
        >
          Laço
        </div>

        {/* Laço watermark — bottom right (cream, discreto) */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            right: "80px",
            fontSize: "14px",
            color: "#FFF8F0",
            opacity: 0.28,
            fontFamily: "Georgia, serif",
            letterSpacing: "0.08em",
          }}
        >
          laco.app
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0px",
            padding: "0 80px",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Couple names */}
          <div
            style={{
              fontSize: names.length > 20 ? "68px" : "88px",
              fontFamily: "Georgia, serif",
              color: "#F0EDE7",
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              fontWeight: 700,
            }}
          >
            {names}
          </div>

          {/* Linha divisória decorativa central */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginTop: "16px",
              marginBottom: "16px",
              width: "320px",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                backgroundColor: accentColor,
                opacity: 0.6,
              }}
            />
            <div
              style={{
                fontSize: "24px",
                color: accentColor,
                opacity: 0.9,
                lineHeight: 1,
              }}
            >
              ✦
            </div>
            <div
              style={{
                flex: 1,
                height: "1px",
                backgroundColor: accentColor,
                opacity: 0.6,
              }}
            />
          </div>

          {/* Date */}
          {date && (
            <div
              style={{
                fontSize: "24px",
                color: accentColor,
                fontFamily: "Georgia, serif",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: venue ? "8px" : "0px",
              }}
            >
              {date}
            </div>
          )}

          {/* Venue */}
          {venue && (
            <div
              style={{
                fontSize: "20px",
                color: "#F0EDE7",
                opacity: 0.6,
                fontFamily: "Georgia, serif",
                letterSpacing: "0.08em",
                marginTop: "4px",
              }}
            >
              {venue}
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=604800",
      },
    },
  );
}
