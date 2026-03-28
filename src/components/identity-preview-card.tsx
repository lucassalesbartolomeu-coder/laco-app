"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PRESET_PALETTES } from "@/lib/identity-kit-templates";

// ─── Types ────────────────────────────────────────────────────

interface QuizAnswers {
  style: string;
  paletteChoice: string;
  mood: string;
  referenceUrls: string[];
  tone: string;
}

interface IdentityPreviewCardProps {
  answers: QuizAnswers;
  step: number;
}

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Returns the relative luminance of a hex color (0 = black, 1 = white).
 * Based on WCAG 2.1 formula.
 */
function luminance(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Returns "white" or "#1A3A33" for readable text on the given bg color.
 */
function readableTextColor(hex: string): string {
  return luminance(hex) > 0.35 ? "#1A3A33" : "#FFFFFF";
}

/** Style → preview color swatches mapping. */
const STYLE_COLORS: Record<string, string[]> = {
  clássico: ["#1A3A33", "#C4734F", "#D4AF6A"],
  rústico: ["#5C3D2E", "#A67C5B", "#C4A882"],
  moderno: ["#111827", "#374151", "#6B7280"],
  romântico: ["#9D4E6E", "#C4734F", "#E8A0B4"],
  minimalista: ["#1C1C1C", "#404040", "#A0A0A0"],
  boho: ["#7C5C3E", "#BF8D6B", "#D4AF6A"],
};

/** Default brand palette colors when no choice is made yet. */
const DEFAULT_COLORS = ["#1A3A33", "#2C6B5E", "#C4734F"];

/**
 * Resolves the 3-color preview palette from quiz answers.
 * Priority: explicit paletteChoice > style colors > defaults.
 */
function resolvePreviewColors(answers: QuizAnswers): string[] {
  if (answers.paletteChoice && answers.paletteChoice !== "ai") {
    const preset = PRESET_PALETTES.find((p) => p.id === answers.paletteChoice);
    if (preset) return preset.colors.slice(0, 3);
  }
  if (answers.style && STYLE_COLORS[answers.style]) {
    return STYLE_COLORS[answers.style];
  }
  return DEFAULT_COLORS;
}

/** Humanised label for the chosen palette. */
function resolvePaletteName(answers: QuizAnswers): string {
  if (answers.paletteChoice === "ai") return "Paleta exclusiva IA";
  if (answers.paletteChoice) {
    const preset = PRESET_PALETTES.find((p) => p.id === answers.paletteChoice);
    if (preset) return preset.name;
  }
  if (answers.style) return answers.style.charAt(0).toUpperCase() + answers.style.slice(1);
  return "Escolha um estilo";
}

// ─── Component ────────────────────────────────────────────────

export function IdentityPreviewCard({ answers, step }: IdentityPreviewCardProps) {
  const colors = resolvePreviewColors(answers);
  const primaryColor = colors[0];
  const textColor = readableTextColor(primaryColor);
  const paletteName = resolvePaletteName(answers);

  // Track when answers change to show the "Atualizando..." badge
  const [updating, setUpdating] = useState(false);
  const prevAnswersRef = useRef<string>("");

  useEffect(() => {
    const serialized = JSON.stringify(answers);
    if (prevAnswersRef.current && prevAnswersRef.current !== serialized) {
      setUpdating(true);
      const timer = setTimeout(() => setUpdating(false), 1400);
      return () => clearTimeout(timer);
    }
    prevAnswersRef.current = serialized;
  }, [answers]);

  // Secondary color for the inner badge ring
  const secondaryColor = colors[1] ?? colors[0];
  const accentColor = colors[2] ?? colors[0];

  return (
    <div className="relative">
      {/* Animated updating badge */}
      <AnimatePresence>
        {updating && (
          <motion.div
            key="updating-badge"
            initial={{ opacity: 0, y: -8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap"
          >
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-medium shadow-float"
              style={{ backgroundColor: secondaryColor, color: readableTextColor(secondaryColor) }}
            >
              <span className="animate-spin inline-block">✨</span>
              Atualizando...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card */}
      <motion.div
        layout
        className="rounded-2xl overflow-hidden shadow-float"
        style={{ backgroundColor: primaryColor }}
      >
        {/* Card header / background preview */}
        <div className="px-5 pt-6 pb-5">
          {/* Palette swatches */}
          <div className="flex items-center gap-2 mb-4">
            {colors.map((c, i) => (
              <motion.div
                key={c + i}
                layout
                className="rounded-full border-2 shadow-sm"
                style={{
                  backgroundColor: c,
                  borderColor: `${textColor}22`,
                  width: i === 0 ? 36 : 28,
                  height: i === 0 ? 36 : 28,
                }}
              />
            ))}
            <span
              className="ml-1 font-body text-xs opacity-70 truncate max-w-[100px]"
              style={{ color: textColor }}
            >
              {paletteName}
            </span>
          </div>

          {/* Example typography */}
          <p
            className="font-logo leading-tight mb-0.5"
            style={{ color: textColor, fontSize: "1.35rem", opacity: 0.9 }}
          >
            Ana &amp; Bruno
          </p>
          <p
            className="font-body text-xs opacity-60 tracking-widest uppercase"
            style={{ color: textColor }}
          >
            {answers.mood || "O seu casamento"}
          </p>
        </div>

        {/* Accent stripe */}
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(to right, ${secondaryColor}, ${accentColor})`,
          }}
        />

        {/* Bottom info area */}
        <div className="px-5 py-4" style={{ backgroundColor: `${primaryColor}dd` }}>
          {/* Style + tone pills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {answers.style && (
              <span
                className="font-body text-xs px-2 py-0.5 rounded-full border"
                style={{
                  color: textColor,
                  borderColor: `${textColor}30`,
                  backgroundColor: `${textColor}10`,
                }}
              >
                {answers.style}
              </span>
            )}
            {answers.tone && (
              <span
                className="font-body text-xs px-2 py-0.5 rounded-full border"
                style={{
                  color: textColor,
                  borderColor: `${textColor}30`,
                  backgroundColor: `${textColor}10`,
                }}
              >
                {answers.tone}
              </span>
            )}
          </div>

          {/* Dynamic message */}
          <div className="flex items-center gap-2">
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: `${textColor}20` }}
            />
            <p
              className="font-body text-xs opacity-60 whitespace-nowrap"
              style={{ color: textColor }}
            >
              {step >= 3
                ? "Seu estilo está ficando assim ↑"
                : "Vá respondendo e veja o preview ↑"}
            </p>
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: `${textColor}20` }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
