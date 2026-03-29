"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────

export type IdentityPreviewProps = {
  style?: string; // ex: "clássico", "moderno", "romântico"
  palette?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  nome1?: string;
  nome2?: string;
};

// ─── Helpers ─────────────────────────────────────────────────

/** Retorna a luminância relativa de uma cor hex (0 = preto, 1 = branco). */
function luminance(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Retorna cor legível (escura ou clara) sobre um fundo. */
function readableOn(bg: string): string {
  return luminance(bg) > 0.35 ? "#1A3A33" : "#FFFFFF";
}

/** Gera as iniciais do casal (ex: "A" + "B" = "AB"). */
function initials(nome1?: string, nome2?: string): string {
  const a = nome1?.trim()?.[0]?.toUpperCase() ?? "";
  const b = nome2?.trim()?.[0]?.toUpperCase() ?? "";
  if (a && b) return `${a}${b}`;
  if (a) return a;
  if (b) return b;
  return "♥";
}

/** Fonte do heading conforme estilo. */
function headingFont(style?: string): string {
  const s = (style ?? "").toLowerCase();
  if (s === "moderno" || s === "minimalista") return "font-body";
  return "font-heading"; // Cormorant Garamond para clássico, romântico, rústico, boho
}

/** Descrição resumida do estilo. */
function styleDescription(style?: string): string {
  const map: Record<string, string> = {
    "clássico":    "Elegante e atemporal",
    "rústico":     "Natural e acolhedor",
    "moderno":     "Contemporâneo e clean",
    "romântico":   "Delicado e apaixonado",
    "minimalista": "Simples e poderoso",
    "boho":        "Livre e artístico",
  };
  return map[(style ?? "").toLowerCase()] ?? "Seu estilo único";
}

// ─── Defaults ─────────────────────────────────────────────────

const DEFAULT_PALETTE = {
  primary: "#1A3A33",
  secondary: "#2C6B5E",
  accent: "#C4734F",
  background: "#FFF8F0",
};

// ─── Component ────────────────────────────────────────────────

export function IdentityPreviewCard({
  style,
  palette,
  nome1,
  nome2,
}: IdentityPreviewProps) {
  const pal = palette ?? DEFAULT_PALETTE;
  const bg        = pal.background || DEFAULT_PALETTE.background;
  const primary   = pal.primary    || DEFAULT_PALETTE.primary;
  const secondary = pal.secondary  || DEFAULT_PALETTE.secondary;
  const accent    = pal.accent     || DEFAULT_PALETTE.accent;

  const textOnBg      = readableOn(bg);
  const textOnPrimary = readableOn(primary);

  const headingClass  = headingFont(style);
  const monogram      = initials(nome1, nome2);
  const coupleLabel   =
    nome1 && nome2
      ? `${nome1} & ${nome2}`
      : nome1 || nome2 || "Ana & Bruno";

  // Badge "Atualizando..." ao mudar palette ou style
  const [updating, setUpdating] = useState(false);
  const prevKey = useRef<string>("");

  useEffect(() => {
    const key = JSON.stringify({ style, palette });
    if (prevKey.current && prevKey.current !== key) {
      setUpdating(true);
      const t = setTimeout(() => setUpdating(false), 1500);
      return () => clearTimeout(t);
    }
    prevKey.current = key;
  }, [style, palette]);

  return (
    <div className="relative">

      {/* Badge animado — "Atualizando..." */}
      <AnimatePresence>
        {updating && (
          <motion.div
            key="updating"
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.22 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap pointer-events-none"
          >
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-medium shadow-md"
              style={{ backgroundColor: accent, color: readableOn(accent) }}
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ display: "inline-block" }}
              >
                ✨
              </motion.span>
              Atualizando...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card principal */}
      <AnimatePresence mode="wait">
        <motion.div
          key={bg + primary}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="rounded-2xl overflow-hidden border shadow-lg"
          style={{
            backgroundColor: bg,
            borderColor: `${primary}22`,
            boxShadow: `0 4px 24px ${primary}18, 0 1px 4px ${primary}10`,
          }}
        >

          {/* Cabeçalho com swatches de cores */}
          <div className="px-5 pt-5 pb-4" style={{ backgroundColor: primary }}>

            {/* Três círculos de cor */}
            <div className="flex items-center gap-2 mb-4">
              {[primary, secondary, accent].map((c, i) => (
                <motion.div
                  key={c + i}
                  layout
                  className="rounded-full border-2 shadow-sm flex-shrink-0"
                  style={{
                    backgroundColor: c,
                    borderColor: `${textOnPrimary}30`,
                    width:  i === 0 ? 34 : 26,
                    height: i === 0 ? 34 : 26,
                  }}
                />
              ))}
              {style && (
                <span
                  className="ml-1 font-body text-xs opacity-70 truncate"
                  style={{ color: textOnPrimary }}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </span>
              )}
            </div>

            {/* Nome do casal na tipografia do estilo */}
            <p
              className={`${headingClass} leading-tight`}
              style={{
                color: textOnPrimary,
                fontSize: "1.4rem",
                letterSpacing: headingClass === "font-heading" ? "0.01em" : "0",
              }}
            >
              {coupleLabel}
            </p>
            <p
              className="font-body text-xs mt-0.5 tracking-widest uppercase opacity-60"
              style={{ color: textOnPrimary }}
            >
              {styleDescription(style)}
            </p>
          </div>

          {/* Faixa de acento gradiente */}
          <div
            className="h-1"
            style={{
              background: `linear-gradient(to right, ${secondary}, ${accent})`,
            }}
          />

          {/* Corpo: monograma + mensagem */}
          <div
            className="px-5 py-4 flex items-center gap-4"
            style={{ backgroundColor: bg }}
          >

            {/* Mini monograma em círculo com borda */}
            <motion.div
              layout
              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-sm"
              style={{
                borderColor: primary,
                backgroundColor: bg,
              }}
            >
              <span
                className={`${headingClass} font-semibold`}
                style={{
                  color: primary,
                  fontSize:
                    monogram.length > 2
                      ? "0.9rem"
                      : monogram === "♥"
                      ? "1.2rem"
                      : "1.1rem",
                  lineHeight: 1,
                }}
              >
                {monogram}
              </span>
            </motion.div>

            {/* Mensagem dinâmica */}
            <div className="flex-1 min-w-0">
              <p
                className="font-body text-xs font-medium leading-snug"
                style={{ color: textOnBg, opacity: 0.85 }}
              >
                Seu estilo está ficando assim ✨
              </p>
              {style && (
                <p
                  className="font-body text-xs mt-0.5 opacity-50 truncate"
                  style={{ color: textOnBg }}
                >
                  {styleDescription(style)}
                </p>
              )}
            </div>
          </div>

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
