"use client";

import { useState, useRef, useEffect } from "react";

export interface MonthlyBar {
  label: string;   // e.g. "Jan"
  year: number;
  month: number;   // 0-indexed
  received: number;
  pending: number;
}

interface Tooltip {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  received: number;
  pending: number;
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

/** Pure-SVG bar chart for last 6 months commission data. No external libraries. */
export function CommissionsChart({ bars }: { bars: MonthlyBar[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<Tooltip>({
    visible: false,
    x: 0,
    y: 0,
    label: "",
    received: 0,
    pending: 0,
  });

  // Responsive width
  const [svgWidth, setSvgWidth] = useState(560);

  useEffect(() => {
    if (!svgRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setSvgWidth(w);
    });
    obs.observe(svgRef.current.parentElement!);
    return () => obs.disconnect();
  }, []);

  const PADDING = { top: 20, right: 16, bottom: 36, left: 56 };
  const HEIGHT = 200;
  const chartW = svgWidth - PADDING.left - PADDING.right;
  const chartH = HEIGHT - PADDING.top - PADDING.bottom;

  const maxVal = Math.max(...bars.map((b) => b.received + b.pending), 1);

  // round up to nice number
  const yMax = Math.ceil(maxVal / 1000) * 1000 || 1000;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => yMax * t);

  const groupW = chartW / bars.length;
  const BAR_GAP = 3;
  const barW = (groupW - BAR_GAP * 3) / 2;

  function yPos(val: number) {
    return chartH - (val / yMax) * chartH;
  }

  function showTooltip(e: React.MouseEvent, bar: MonthlyBar) {
    const svgRect = svgRef.current!.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: e.clientX - svgRect.left,
      y: e.clientY - svgRect.top - 12,
      label: `${bar.label} ${bar.year}`,
      received: bar.received,
      pending: bar.pending,
    });
  }

  function hideTooltip() {
    setTooltip((t) => ({ ...t, visible: false }));
  }

  if (bars.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="font-body text-midnight/40 text-sm">Sem dados de comissões</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        width={svgWidth}
        height={HEIGHT}
        className="overflow-visible"
        style={{ display: "block" }}
      >
        <g transform={`translate(${PADDING.left},${PADDING.top})`}>
          {/* Y gridlines + labels */}
          {yTicks.map((tick, i) => {
            const y = yPos(tick);
            return (
              <g key={i}>
                <line
                  x1={0}
                  y1={y}
                  x2={chartW}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth={1}
                  strokeDasharray={tick === 0 ? "none" : "4 3"}
                />
                <text
                  x={-8}
                  y={y}
                  dominantBaseline="middle"
                  textAnchor="end"
                  fontSize={10}
                  fill="#6B7280"
                >
                  {tick === 0
                    ? "0"
                    : tick >= 1000
                    ? `${(tick / 1000).toFixed(tick % 1000 === 0 ? 0 : 1)}k`
                    : tick.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {bars.map((bar, i) => {
            const gx = i * groupW + BAR_GAP;
            const receivedH = (bar.received / yMax) * chartH;
            const pendingH = (bar.pending / yMax) * chartH;

            return (
              <g
                key={i}
                onMouseMove={(e) => showTooltip(e, bar)}
                onMouseLeave={hideTooltip}
                style={{ cursor: "pointer" }}
              >
                {/* Hover target */}
                <rect
                  x={gx}
                  y={0}
                  width={groupW - BAR_GAP}
                  height={chartH}
                  fill="transparent"
                />

                {/* Received bar (teal) */}
                <rect
                  x={gx + BAR_GAP}
                  y={yPos(bar.received)}
                  width={barW}
                  height={receivedH}
                  rx={3}
                  fill="#1A1F3A"
                  opacity={0.85}
                />

                {/* Pending bar (gold) */}
                <rect
                  x={gx + BAR_GAP + barW + BAR_GAP}
                  y={yPos(bar.pending)}
                  width={barW}
                  height={pendingH}
                  rx={3}
                  fill="#C9A96E"
                  opacity={0.8}
                />

                {/* X label */}
                <text
                  x={gx + (groupW - BAR_GAP) / 2}
                  y={chartH + 16}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#6B7280"
                >
                  {bar.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute z-10 bg-midnight text-white rounded-xl shadow-float px-3 py-2.5 pointer-events-none text-xs"
          style={{ left: tooltip.x + 12, top: tooltip.y - 60, minWidth: 160 }}
        >
          <p className="font-body font-semibold mb-1">{tooltip.label}</p>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-midnight inline-block" />
            <span className="font-body">Recebido: {formatCurrency(tooltip.received)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gold inline-block" />
            <span className="font-body">Pendente: {formatCurrency(tooltip.pending)}</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-midnight inline-block" />
          <span className="font-body text-xs text-midnight/60">Recebido</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-gold inline-block" />
          <span className="font-body text-xs text-midnight/60">Pendente</span>
        </div>
      </div>
    </div>
  );
}
