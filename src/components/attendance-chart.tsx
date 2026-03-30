"use client";

import { useEffect, useRef, useState } from "react";

// ─── Types ─────────────────────────────────────────────────

export interface ChartCategory {
  label: string;
  invited: number;
  expected: number;
}

interface AttendanceChartProps {
  categories: ChartCategory[];
  totalInvited: number;
  expectedTotal: number;
  confidenceLow: number;
}

// ─── Helpers ───────────────────────────────────────────────

function barColor(rate: number): string {
  if (rate >= 0.7) return "#1A1F3A"; // teal
  if (rate >= 0.4) return "#C9A96E"; // gold
  return "#E57373";                   // light red
}

// ─── Attendance Chart ──────────────────────────────────────

export default function AttendanceChart({
  categories,
  totalInvited,
  expectedTotal,
  confidenceLow,
}: AttendanceChartProps) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const overallRate = totalInvited > 0 ? expectedTotal / totalInvited : 0;
  const overallPct = Math.round(overallRate * 100);

  // Bar track width in px — derived from container; fallback to 400
  const BAR_LABEL_WIDTH = 160;
  const BAR_PCT_WIDTH = 56;
  const BAR_COUNT_WIDTH = 56;

  return (
    <section
      id="attendance-chart"
      ref={containerRef}
      className="bg-white rounded-2xl shadow-md p-8 sm:p-10 print:shadow-none print:rounded-none print:p-0"
      aria-label="Gráfico de presença estimada"
    >
      {/* ── Title ── */}
      <div className="mb-8">
        <h2 className="font-heading text-2xl text-midnight">
          Gráfico de Presença
        </h2>
        <p className="font-body text-sm text-gray-500 mt-1">
          Estimativa visual por grupo de convidados
        </p>
      </div>

      {/* ── Summary stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {/* Total convidados */}
        <div
          className="rounded-xl p-5 flex flex-col gap-1"
          style={{ backgroundColor: "#F0EDE7" }}
        >
          <span
            className="font-body text-xs uppercase tracking-widest"
            style={{ color: "#1A1F3A66" }}
          >
            Total convidados
          </span>
          <span
            className="font-heading text-3xl"
            style={{ color: "#1A1F3A" }}
          >
            {totalInvited}
          </span>
          <span className="font-body text-xs" style={{ color: "#1A1F3A80" }}>
            na lista
          </span>
        </div>

        {/* Estimativa de presença */}
        <div
          className="rounded-xl p-5 flex flex-col gap-1"
          style={{ backgroundColor: "#1A1F3A15" }}
        >
          <span
            className="font-body text-xs uppercase tracking-widest"
            style={{ color: "#1A1F3A99" }}
          >
            Estimativa de presença
          </span>
          <span
            className="font-heading text-3xl"
            style={{ color: "#1A1F3A" }}
          >
            {expectedTotal}
          </span>
          <span className="font-body text-xs" style={{ color: "#1A1F3A99" }}>
            {overallPct}% dos convidados
          </span>
        </div>

        {/* Mínimo esperado */}
        <div
          className="rounded-xl p-5 flex flex-col gap-1"
          style={{ backgroundColor: "#C9A96E12" }}
        >
          <span
            className="font-body text-xs uppercase tracking-widest"
            style={{ color: "#C9A96E99" }}
          >
            Mínimo esperado
          </span>
          <span
            className="font-heading text-3xl"
            style={{ color: "#C9A96E" }}
          >
            {confidenceLow}
          </span>
          <span className="font-body text-xs" style={{ color: "#C9A96E99" }}>
            limite inferior (−8%)
          </span>
        </div>
      </div>

      {/* ── Bar chart ── */}
      <div className="space-y-5" role="list" aria-label="Barras por categoria">
        {categories.map((cat, i) => {
          const rate = cat.invited > 0 ? cat.expected / cat.invited : 0;
          const pct = Math.round(rate * 100);
          const color = barColor(rate);
          const delay = mounted ? `${0.1 + i * 0.12}s` : "0s";

          return (
            <div
              key={cat.label}
              role="listitem"
              className="flex items-center gap-3"
            >
              {/* Category label */}
              <span
                className="font-body text-sm shrink-0 text-right"
                style={{
                  width: BAR_LABEL_WIDTH,
                  color: "#1A1F3A",
                  minWidth: BAR_LABEL_WIDTH,
                }}
              >
                {cat.label}
              </span>

              {/* Bar track */}
              <div
                className="relative flex-1 rounded-full overflow-hidden"
                style={{ height: 20, backgroundColor: "#F0EDE7" }}
                aria-label={`${cat.label}: ${pct}%`}
              >
                {/* Animated fill */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: mounted ? `${pct}%` : "0%",
                    backgroundColor: color,
                    borderRadius: "inherit",
                    transition: mounted
                      ? `width 0.9s cubic-bezier(0.4,0,0.2,1) ${delay}`
                      : "none",
                  }}
                />
                {/* Percentage label inside bar (if wide enough) */}
                {pct >= 18 && (
                  <span
                    className="font-body text-xs font-semibold absolute inset-y-0 flex items-center"
                    style={{
                      left: 10,
                      color: "#fff",
                      mixBlendMode: "normal",
                      pointerEvents: "none",
                      zIndex: 1,
                    }}
                  >
                    {pct}%
                  </span>
                )}
              </div>

              {/* Percentage (outside, for narrow bars) */}
              <span
                className="font-body text-sm shrink-0 font-semibold"
                style={{
                  width: BAR_PCT_WIDTH,
                  color,
                  minWidth: BAR_PCT_WIDTH,
                }}
              >
                {pct}%
              </span>

              {/* Count */}
              <span
                className="font-body text-sm shrink-0 text-right"
                style={{
                  width: BAR_COUNT_WIDTH,
                  color: "#1A1F3A80",
                  minWidth: BAR_COUNT_WIDTH,
                }}
              >
                {cat.expected}/{cat.invited}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-5 mt-8 pt-6 border-t border-gray-100">
        {[
          { color: "#1A1F3A", label: "Alta presença (≥70%)" },
          { color: "#C9A96E", label: "Média presença (≥40%)" },
          { color: "#E57373", label: "Baixa presença (<40%)" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="inline-block rounded-full shrink-0"
              style={{ width: 12, height: 12, backgroundColor: item.color }}
            />
            <span className="font-body text-xs" style={{ color: "#1A1F3A80" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
