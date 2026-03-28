import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const names = searchParams.get("names") ?? "Noivos";
  const date = searchParams.get("date") ?? "";
  const style = searchParams.get("style") ?? "classico";

  // Subtle accent variant based on style
  const accentColor =
    style === "moderno"
      ? "#8B9E6E"
      : style === "rustico"
      ? "#B07D5A"
      : "#C4734F"; // classico / default → copper

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
          backgroundColor: "#1A3A33",
          position: "relative",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Subtle radial glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(196,115,79,0.12) 0%, transparent 70%)",
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
            color: "#F5F3EF",
            opacity: 0.5,
            fontFamily: "Georgia, serif",
            letterSpacing: "0.05em",
          }}
        >
          Laço
        </div>

        {/* Laço watermark — bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            right: "80px",
            fontSize: "14px",
            color: "#F5F3EF",
            opacity: 0.3,
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
          }}
        >
          {/* Couple names */}
          <div
            style={{
              fontSize: "88px",
              fontFamily: "Georgia, serif",
              color: "#F5F3EF",
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              fontWeight: 400,
            }}
          >
            {names}
          </div>

          {/* Ampersand divider */}
          <div
            style={{
              fontSize: "36px",
              color: accentColor,
              marginTop: "8px",
              marginBottom: "8px",
              opacity: 0.9,
            }}
          >
            ✦
          </div>

          {/* Date */}
          {date && (
            <div
              style={{
                fontSize: "26px",
                color: "#F5F3EF",
                opacity: 0.7,
                fontFamily: "Georgia, serif",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginTop: "4px",
              }}
            >
              {date}
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
