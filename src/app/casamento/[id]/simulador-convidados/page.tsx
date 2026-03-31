"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { MapPin, TrendingUp, AlertCircle, ArrowRight, Printer, Globe } from "lucide-react";
import BottomNav from "@/components/bottom-nav";
import { useToast } from "@/hooks/use-toast";
import { dddMap } from "@/lib/ddd-map";
import { DDD_COORDS, haversineKm, dddToWeddingKm, weddingLocationCoords } from "@/lib/ddd-coords";
import type { Guest, WeddingWithRelations } from "@/types";
import { simulateAttendance } from "@/lib/attendance-simulator";
import type { GuestInput } from "@/lib/attendance-simulator";

// ─── Types ──────────────────────────────────────────────────────

interface RegionalAttendance {
  label: string;
  count: number;
  percentage: number;
  region: string;
  isInternational?: boolean;
}

// ─── Constants ──────────────────────────────────────────────────

const REGION_COLORS: Record<string, string> = {
  Sudeste: "bg-midnight",
  Sul: "bg-blue-500",
  Nordeste: "bg-orange-500",
  Centro: "bg-yellow-600",
  Norte: "bg-green-600",
  Internacional: "bg-purple-500",
};

const STATE_REGIONS: Record<string, string> = {
  SP: "Sudeste", RJ: "Sudeste", ES: "Sudeste", MG: "Sudeste",
  PR: "Sul",     SC: "Sul",     RS: "Sul",
  BA: "Nordeste", SE: "Nordeste", AL: "Nordeste", PE: "Nordeste",
  PB: "Nordeste", RN: "Nordeste", CE: "Nordeste", PI: "Nordeste", MA: "Nordeste",
  GO: "Centro",  MT: "Centro",  MS: "Centro",   DF: "Centro",
  AC: "Norte",   AM: "Norte",   PA: "Norte",    RO: "Norte",
  RR: "Norte",   AP: "Norte",   TO: "Norte",
};

// Guest category options for the simulator
const CATEGORY_OPTIONS = [
  { value: "",              label: "Misto / Não definido", mod: "0%" },
  { value: "familia_noivo", label: "Família",              mod: "+12%" },
  { value: "amigos_noivo",  label: "Amigos",               mod: "+5%" },
  { value: "trabalho",      label: "Trabalho / Conhecidos",mod: "-10%" },
  { value: "lista_b",       label: "Lista B",              mod: "-15%" },
];

// ─── Helpers ─────────────────────────────────────────────────────

function extractDDDFromPhone(phone: string): string | null {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("55") && cleaned.length >= 12) cleaned = cleaned.slice(2);
  if (cleaned.length >= 2) return cleaned.slice(0, 2);
  return null;
}

function isInternationalPhone(phone: string): boolean {
  const stripped = phone.replace(/\s/g, "");
  // Stored as +DDI... – non-BR if DDI ≠ 55
  if (stripped.startsWith("+") && !stripped.startsWith("+55")) return true;
  // Plain digits starting with a non-55 country code (10+ digits, not starting with 55)
  const digits = stripped.replace(/\D/g, "");
  if (digits.length > 11 && !digits.startsWith("55")) return true;
  return false;
}

// ─── CountUp Component ──────────────────────────────────────────

function CountUp({
  target,
  duration = 1.5,
  prefix = "",
  suffix = "",
  className = "",
  formatFn,
}: {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatFn?: (v: number) => string;
}) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => {
    const n = Math.round(v);
    return formatFn ? formatFn(n) : n.toString();
  });
  const [display, setDisplay] = useState(formatFn ? formatFn(0) : "0");

  useEffect(() => {
    const controls = animate(motionVal, target, { duration, ease: "easeOut" });
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return () => { controls.stop(); unsubscribe(); };
  }, [target, duration, motionVal, rounded]);

  return (
    <span className={className}>
      {prefix}{display}{suffix}
    </span>
  );
}

// ─── Guest Origin Map Component ──────────────────────────────────

interface GuestOriginMapProps {
  guests: Guest[];
  weddingState: string;
}

function GuestOriginMap({ guests }: GuestOriginMapProps) {
  const [stats, setStats] = useState<RegionalAttendance[]>([]);

  useEffect(() => {
    const stateMap: Record<string, number> = {};
    let intlCount = 0;

    guests.forEach((guest) => {
      if (!guest.phone) return;
      if (isInternationalPhone(guest.phone)) {
        intlCount++;
        return;
      }
      const ddd = extractDDDFromPhone(guest.phone);
      if (ddd && dddMap[ddd]) {
        const state = dddMap[ddd].state;
        stateMap[state] = (stateMap[state] || 0) + 1;
      }
    });

    const total = guests.length;
    const result: RegionalAttendance[] = Object.entries(stateMap)
      .map(([state, count]) => ({
        label: state,
        count,
        percentage: Math.round((count / total) * 100),
        region: STATE_REGIONS[state] || "Outro",
      }))
      .sort((a, b) => b.count - a.count);

    if (intlCount > 0) {
      result.push({
        label: "Internacional",
        count: intlCount,
        percentage: Math.round((intlCount / total) * 100),
        region: "Internacional",
        isInternational: true,
      });
    }

    setStats(result);
  }, [guests]);

  if (stats.length === 0) return null;

  const maxCount = Math.max(...stats.map((s) => s.count));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-2xl shadow-md p-6 sm:p-8"
    >
      <div className="mb-6">
        <h2 className="font-heading text-2xl text-midnight mb-2 flex items-center gap-2">
          <MapPin className="w-6 h-6" />
          Origem dos Convidados
        </h2>
        <p className="font-body text-gray-600">Distribuição geográfica — estado e país</p>
      </div>

      <div className="space-y-4">
        {stats.map((stat, idx) => {
          const barColor = stat.isInternational
            ? "bg-purple-500"
            : REGION_COLORS[stat.region] || "bg-gray-400";

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + idx * 0.06 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {stat.isInternational && <Globe className="w-3.5 h-3.5 text-purple-500" />}
                  <p className="font-heading text-sm text-midnight">{stat.label}</p>
                  <p className="font-body text-xs text-gray-500">
                    {stat.isInternational ? "Fora do Brasil" : stat.region}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-sm text-midnight">{stat.count}</p>
                  <p className="font-body text-xs text-gray-500">{stat.percentage}%</p>
                </div>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${barColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(stat.count / maxCount) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.5 + idx * 0.08, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-3">
          {[...Object.entries(REGION_COLORS)].map(([region, color]) => (
            <div key={region} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
              <span className="font-body text-xs text-gray-600">{region}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Missing phone notice */}
      {(() => {
        const noPhone = guests.filter((g) => !g.phone).length;
        return noPhone > 0 ? (
          <p className="mt-3 font-body text-xs text-gray-400">
            {noPhone} convidado{noPhone > 1 ? "s" : ""} sem telefone — localização não detectada
          </p>
        ) : null;
      })()}
    </motion.div>
  );
}

// ─── Attendance Prediction Component (km-based) ──────────────────

interface AttendancePredictionProps {
  guests: Guest[];
  weddingCity: string;
  weddingState: string;
}

function AttendancePrediction({ guests, weddingCity, weddingState }: AttendancePredictionProps) {
  const [prediction, setPrediction] = useState<{
    expected: number;
    groups: { label: string; count: number; rate: string }[];
    intlCount: number;
  } | null>(null);

  useEffect(() => {
    let expected = 0;
    const groups = [
      { label: "Menos de 150 km",  min: 0,    max: 150,  rate: 89, count: 0 },
      { label: "150 – 300 km",     min: 150,  max: 300,  rate: 83, count: 0 },
      { label: "300 – 600 km",     min: 300,  max: 600,  rate: 75, count: 0 },
      { label: "Mais de 600 km",   min: 600,  max: Infinity, rate: 58, count: 0 },
    ];
    let intlCount = 0;

    guests.forEach((guest) => {
      let rate: number;
      let distanceKm: number | null = null;

      if (guest.phone && isInternationalPhone(guest.phone)) {
        intlCount++;
        rate = 28;
        expected += rate / 100;
        return;
      }

      const ddd = guest.phone ? extractDDDFromPhone(guest.phone) : null;
      if (ddd) distanceKm = dddToWeddingKm(ddd, weddingCity, weddingState);

      if (distanceKm !== null) {
        const group = groups.find((g) => distanceKm! >= g.min && distanceKm! < g.max);
        if (group) group.count++;
        rate = groups.find((g) => distanceKm! >= g.min && distanceKm! < g.max)?.rate ?? 70;
      } else {
        // No phone or unrecognised DDD → same state fallback
        groups[0].count++;
        rate = 85;
      }

      expected += rate / 100;
    });

    setPrediction({
      expected: Math.round(expected),
      groups: groups.map((g) => ({ label: g.label, count: g.count, rate: `~${g.rate}%` })),
      intlCount,
    });
  }, [guests, weddingCity, weddingState]);

  if (!prediction) return null;

  const percentage = guests.length > 0 ? Math.round((prediction.expected / guests.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-gradient-to-br from-midnight/5 to-midnight/2 rounded-2xl shadow-md p-6 sm:p-8 border border-midnight/20"
    >
      <div className="mb-5">
        <h2 className="font-heading text-2xl text-midnight mb-1 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Previsão de Presença
        </h2>
        <p className="font-body text-gray-600 text-sm">Por grupo de distância</p>
      </div>

      {/* Distance groups */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {prediction.groups.map((g) => (
          <div key={g.label} className="p-3 bg-white rounded-xl border border-midnight/10">
            <p className="font-body text-xs text-gray-500 mb-0.5">{g.label}</p>
            <p className="font-heading text-xl text-midnight">{g.count}</p>
            <p className="font-body text-xs text-midnight">{g.rate} presença</p>
          </div>
        ))}
        {prediction.intlCount > 0 && (
          <div className="p-3 bg-white rounded-xl border border-purple-200">
            <p className="font-body text-xs text-gray-500 mb-0.5 flex items-center gap-1">
              <Globe className="w-3 h-3 text-purple-500" /> Internacional
            </p>
            <p className="font-heading text-xl text-midnight">{prediction.intlCount}</p>
            <p className="font-body text-xs text-purple-600">~35% presença</p>
          </div>
        )}
      </div>

      {/* Main estimate */}
      <div className="bg-white rounded-xl p-5 border border-midnight/20">
        <p className="font-body text-sm text-gray-600 mb-1">Estimativa total</p>
        <div className="flex items-baseline gap-2 mb-3">
          <CountUp
            target={prediction.expected}
            duration={1.2}
            className="font-heading text-4xl text-midnight"
          />
          <span className="font-heading text-xl text-gray-400">de {guests.length}</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-midnight to-gold rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-body text-xs text-gray-400">0%</span>
          <span className="font-heading text-sm text-midnight">{percentage}%</span>
          <span className="font-body text-xs text-gray-400">100%</span>
        </div>
      </div>

    </motion.div>
  );
}

// ─── Category helpers ─────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  família_noivo: "Família do noivo",
  família_noiva: "Família da noiva",
  familia_noivo: "Família do noivo",
  familia_noiva: "Família da noiva",
  amigos_noivo:  "Amigos do noivo",
  amigos_noiva:  "Amigos da noiva",
  trabalho:      "Trabalho",
  lista_b:       "Lista B",
  sem_categoria: "Sem categoria",
  internacional: "Internacional",
};

function categoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat;
}

function normaliseCat(cat: string | null | undefined): string | undefined {
  if (!cat) return undefined;
  return cat
    .replace("família_noivo", "familia_noivo")
    .replace("família_noiva", "familia_noiva");
}

// ─── Guest Attendance Chart ────────────────────────────────────────

interface GuestAttendanceChartProps {
  guests: Guest[];
  weddingCity: string;
  weddingState: string;
}

function GuestAttendanceChart({ guests, weddingCity, weddingState }: GuestAttendanceChartProps) {
  const [result, setResult] = useState<ReturnType<typeof simulateAttendance> | null>(null);

  useEffect(() => {
    if (guests.length === 0) return;

    const guestInputs = guests.map((g) => {
      // International detection
      if (g.phone && isInternationalPhone(g.phone)) {
        return { isInternational: true, category: normaliseCat(g.category) };
      }

      // State from stored field or DDD
      let state = g.state ?? undefined;
      if (!state && g.phone) {
        const ddd = extractDDDFromPhone(g.phone);
        if (ddd && dddMap[ddd]) state = dddMap[ddd].state;
      }
      if (!state) state = weddingState; // no phone → assume local

      // km distance
      let distanceKm: number | undefined;
      if (g.phone) {
        const ddd = extractDDDFromPhone(g.phone);
        if (ddd) {
          const km = dddToWeddingKm(ddd, weddingCity, weddingState);
          if (km !== null) distanceKm = km;
        }
      }

      return {
        city:       g.city  ?? undefined,
        state,
        category:   normaliseCat(g.category),
        distanceKm,
        isInternational: false,
      };
    });

    setResult(
      simulateAttendance(guestInputs, {
        city:        weddingCity,
        state:       weddingState,
        weddingDate: new Date().toISOString(),
      }),
    );
  }, [guests, weddingCity, weddingState]);

  if (!result) return null;

  const VIEW_W = 480;
  const BAR_H = 14;
  const BAR_GAP = 5;
  const GROUP_GAP = 16;
  const LABEL_W = 132;
  const CHART_W = VIEW_W - LABEL_W - 44;

  const categories = Object.entries(result.byCategory).sort((a, b) => b[1].invited - a[1].invited);
  const maxInvited = Math.max(...categories.map(([, s]) => s.invited), 1);
  const GROUP_H = BAR_H * 3 + BAR_GAP * 2 + GROUP_GAP;
  const VIEW_H = Math.max(80, categories.length * GROUP_H + 20);
  const percentage = Math.round(result.attendanceRate * 100);
  const hasLowCategory = categories.some(([, s]) => s.invited > 0 && s.expected / s.invited < 0.7);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          header, nav, footer { display: none !important; }
          body, .min-h-screen { background: white !important; }
          #attendance-chart { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
        }
      `}</style>

      <motion.div
        id="attendance-chart"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.75 }}
        className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-midnight/10"
      >
        <div className="flex items-start justify-between mb-5 gap-4">
          <div>
            <h2 className="font-heading text-2xl text-midnight mb-1 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 no-print" />
              Visualização por Categoria
            </h2>
            <p className="font-body text-sm text-gray-600">
              Família, amigos e demais grupos — total, estimativa e mínimo
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="no-print flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-midnight text-midnight font-body text-sm font-medium hover:bg-midnight/5 transition-all"
            title="Exportar como PDF"
          >
            <Printer className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-5 no-print">
          {[
            { color: "#e5e7eb", label: "Total convidados" },
            { color: "#1A1F3A", label: "Estimativa de presença" },
            { color: "#C9A96E", label: "Mínimo esperado" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <svg width="16" height="10"><rect width="16" height="10" rx="3" fill={color} /></svg>
              <span className="font-body text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>

        {categories.length > 0 ? (
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" aria-label="Gráfico de presença por categoria" role="img">
            {categories.map(([cat, stats], idx) => {
              const y = idx * GROUP_H + 10;
              const lowAttendance = stats.invited > 0 && stats.expected / stats.invited < 0.7;
              const totalW = Math.max(2, Math.round((stats.invited / maxInvited) * CHART_W));
              const expectedW = Math.max(2, Math.round((stats.expected / maxInvited) * CHART_W));
              const minExpected = Math.round(stats.expected * 0.9);
              const minW = Math.max(2, Math.round((minExpected / maxInvited) * CHART_W));
              const barX = LABEL_W;

              return (
                <g key={cat}>
                  <text x={LABEL_W - 8} y={y + BAR_H + BAR_GAP + BAR_H / 2} textAnchor="end"
                    dominantBaseline="middle" fontSize="11" fontFamily="inherit" fill="#1A1F3A">
                    {categoryLabel(cat).length > 18 ? categoryLabel(cat).slice(0, 16) + "…" : categoryLabel(cat)}
                  </text>
                  {lowAttendance && (
                    <text x={LABEL_W - 8} y={y} fontSize="10" textAnchor="end" dominantBaseline="hanging">⚠️</text>
                  )}
                  <rect x={barX} y={y} width={totalW} height={BAR_H} rx="3" fill="#e5e7eb"
                    stroke={lowAttendance ? "#C9A96E" : "none"} strokeWidth={lowAttendance ? "1.5" : "0"} />
                  <text x={barX + totalW + 5} y={y + BAR_H / 2} dominantBaseline="middle"
                    fontSize="10" fill="#6b7280" fontFamily="inherit">{stats.invited}</text>

                  <rect x={barX} y={y + BAR_H + BAR_GAP} width={expectedW} height={BAR_H} rx="3" fill="#1A1F3A" />
                  <text x={barX + expectedW + 5} y={y + BAR_H + BAR_GAP + BAR_H / 2} dominantBaseline="middle"
                    fontSize="10" fill="#1A1F3A" fontFamily="inherit" fontWeight="600">{stats.expected}</text>

                  <rect x={barX} y={y + (BAR_H + BAR_GAP) * 2} width={minW} height={BAR_H} rx="3" fill="#C9A96E" />
                  <text x={barX + minW + 5} y={y + (BAR_H + BAR_GAP) * 2 + BAR_H / 2} dominantBaseline="middle"
                    fontSize="10" fill="#C9A96E" fontFamily="inherit">{minExpected}</text>
                </g>
              );
            })}
          </svg>
        ) : (
          <p className="font-body text-sm text-gray-500 text-center py-8">Nenhuma categoria encontrada.</p>
        )}

        <div className="mt-5 pt-5 border-t border-gray-100 space-y-1.5">
          <p className="font-body text-base text-midnight">
            <strong>Estimativa:</strong>{" "}
            {result.confidenceRange.min}–{result.confidenceRange.max} de {result.totalInvited} convidados
          </p>
          <p className="font-body text-sm text-gray-600">
            <strong>Taxa de presença:</strong> {percentage}% ({result.totalExpected} pessoas esperadas)
          </p>
          {hasLowCategory && (
            <p className="font-body text-sm text-gold flex items-center gap-1 pt-1">
              ⚠️ Categorias marcadas têm estimativa abaixo de 70% do total
            </p>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ─── Empty State / DDD Simulator ──────────────────────────────────

interface DddGroup {
  id: string;
  ddd: string;
  count: number;
  city: string;
  state: string;
  category: string;
  isInternational: false;
}

interface IntlGroup {
  id: string;
  count: number;
  label: string;
  isInternational: true;
}

type AnyGroup = DddGroup | IntlGroup;

interface EmptyStateProps {
  id: string;
  weddingCity: string;
  weddingState: string;
}

function EmptyState({ id, weddingCity, weddingState }: EmptyStateProps) {
  const [groups, setGroups] = useState<AnyGroup[]>([]);
  const [dddInput, setDddInput] = useState("");
  const [countInput, setCountInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [intlCount, setIntlCount] = useState("");
  const [inputError, setInputError] = useState("");
  const [simResult, setSimResult] = useState<ReturnType<typeof simulateAttendance> | null>(null);

  const dddInfo = dddInput.length === 2 ? dddMap[dddInput] : null;
  const totalGuests = groups.reduce((s, g) => s + g.count, 0);

  function addGroup() {
    const count = parseInt(countInput, 10);
    if (!dddInfo) { setInputError("DDD inválido (ex: 11, 21, 31)"); return; }
    if (!count || count < 1) { setInputError("Número de pessoas inválido"); return; }
    setInputError("");
    setSimResult(null);
    setGroups((prev) => [
      ...prev,
      {
        id: `${dddInput}-${Date.now()}`,
        ddd: dddInput,
        count,
        city: dddInfo.city,
        state: dddInfo.state,
        category: categoryInput,
        isInternational: false,
      } as DddGroup,
    ]);
    setDddInput("");
    setCountInput("");
    setCategoryInput("");
  }

  function addIntlGroup() {
    const count = parseInt(intlCount, 10);
    if (!count || count < 1) return;
    setSimResult(null);
    setGroups((prev) => [
      ...prev,
      {
        id: `intl-${Date.now()}`,
        count,
        label: "Internacional",
        isInternational: true,
      } as IntlGroup,
    ]);
    setIntlCount("");
  }

  function removeGroup(groupId: string) {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    setSimResult(null);
  }

  function simulate() {
    if (groups.length === 0) return;

    const wCoords = weddingLocationCoords(weddingCity, weddingState);

    const guestInputs: GuestInput[] = groups.flatMap((grp): GuestInput[] => {
      if (grp.isInternational) {
        return Array.from({ length: grp.count }, () => ({
          isInternational: true,
          category: undefined,
        }));
      }
      const dg = grp as DddGroup;
      const gCoords = DDD_COORDS[dg.ddd];
      let distanceKm: number | undefined;
      if (gCoords && wCoords) {
        distanceKm = haversineKm(gCoords[0], gCoords[1], wCoords[0], wCoords[1]);
      }
      return Array.from({ length: dg.count }, () => ({
        state: dg.state,
        city: dg.city,
        category: dg.category || undefined,
        distanceKm,
        isInternational: false,
      }));
    });

    setSimResult(
      simulateAttendance(guestInputs, {
        city:        weddingCity,
        state:       weddingState,
        weddingDate: new Date().toISOString(),
      })
    );
  }

  const byRegion = groups.reduce<Record<string, number>>((acc, g) => {
    if (g.isInternational) {
      acc["Internacional"] = (acc["Internacional"] || 0) + g.count;
    } else {
      const dg = g as DddGroup;
      const region = STATE_REGIONS[dg.state] || "Outro";
      acc[region] = (acc[region] || 0) + dg.count;
    }
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-4"
    >
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gold/15">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-gold" />
          <h2 className="font-heading text-xl text-midnight">Simule sem importar</h2>
        </div>
        <p className="font-body text-sm text-gray-600 mb-5">
          Adicione grupos por DDD, categoria e origem. Veja a previsão de comparecimento antes de ter a lista real.
        </p>

        {/* DDD + Count + Category input */}
        <div className="space-y-3 mb-2">
          <div className="flex gap-2">
            <div className="flex-shrink-0 w-24">
              <label className="font-body text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">DDD</label>
              <input
                type="text"
                placeholder="11"
                value={dddInput}
                onChange={(e) => { setDddInput(e.target.value.replace(/\D/g, "").slice(0, 2)); setInputError(""); }}
                onKeyDown={(e) => e.key === "Enter" && addGroup()}
                maxLength={2}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl font-mono text-center text-midnight focus:outline-none focus:border-midnight transition"
              />
            </div>
            <div className="w-24 flex-shrink-0">
              <label className="font-body text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Pessoas</label>
              <input
                type="number"
                placeholder="50"
                min={1}
                value={countInput}
                onChange={(e) => { setCountInput(e.target.value); setInputError(""); }}
                onKeyDown={(e) => e.key === "Enter" && addGroup()}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl font-body text-midnight focus:outline-none focus:border-midnight transition"
              />
            </div>
            <div className="flex-1">
              <label className="font-body text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Categoria</label>
              <select
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                className="w-full px-2 py-2.5 border-2 border-gray-200 rounded-xl font-body text-sm text-midnight focus:outline-none focus:border-midnight transition bg-white"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({opt.mod})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-shrink-0 self-end">
              <button
                onClick={addGroup}
                className="h-[42px] px-4 bg-midnight text-white rounded-xl font-body text-sm font-medium hover:bg-midnight/85 transition flex items-center gap-1"
              >
                <span className="text-lg leading-none">+</span>
              </button>
            </div>
          </div>

          {/* DDD preview */}
          <AnimatePresence>
            {dddInfo && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-xs font-body text-midnight/60"
              >
                <MapPin className="w-3.5 h-3.5 text-gold" />
                <span>{dddInfo.city}, {dddInfo.state} — {STATE_REGIONS[dddInfo.state] || "Outro"}</span>
                {(() => {
                  const wCoords = weddingLocationCoords(weddingCity, weddingState);
                  const gCoords = DDD_COORDS[dddInput];
                  if (gCoords && wCoords) {
                    const km = Math.round(haversineKm(gCoords[0], gCoords[1], wCoords[0], wCoords[1]));
                    return <span className="ml-1 text-midnight/40">· ~{km} km do local</span>;
                  }
                  return null;
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {inputError && <p className="mb-3 text-xs font-body text-red-500">{inputError}</p>}

        {/* International section */}
        <div className="mt-4 mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-purple-500" />
            <span className="font-body text-xs font-semibold text-purple-700">Convidados Internacionais</span>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Ex: 5"
              min={1}
              value={intlCount}
              onChange={(e) => setIntlCount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addIntlGroup()}
              className="flex-1 px-3 py-2 border-2 border-purple-200 rounded-lg font-body text-sm text-midnight focus:outline-none focus:border-purple-400 transition bg-white"
            />
            <button
              onClick={addIntlGroup}
              disabled={!intlCount || parseInt(intlCount) < 1}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg font-body text-sm hover:bg-purple-600 transition disabled:opacity-40"
            >
              + Adicionar
            </button>
          </div>
          <p className="font-body text-[10px] text-purple-500 mt-1">
            Taxa base: ~35% de presença
          </p>
        </div>

        {/* Groups list */}
        <AnimatePresence>
          {groups.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 space-y-1.5">
              {groups.map((g) => {
                if (g.isInternational) {
                  return (
                    <div key={g.id} className="flex items-center gap-3 bg-purple-50 rounded-xl px-3 py-2">
                      <Globe className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-body text-xs font-semibold text-purple-700">Internacional</span>
                      </div>
                      <span className="font-body text-xs font-semibold text-midnight">{g.count} pessoas</span>
                      <button onClick={() => removeGroup(g.id)} className="text-gray-400 hover:text-red-400 transition">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                }
                const dg = g as DddGroup;
                const region = STATE_REGIONS[dg.state] || "Outro";
                const barColor = REGION_COLORS[region] || "bg-gray-400";
                const wCoords = weddingLocationCoords(weddingCity, weddingState);
                const gCoords = DDD_COORDS[dg.ddd];
                const km = gCoords && wCoords ? Math.round(haversineKm(gCoords[0], gCoords[1], wCoords[0], wCoords[1])) : null;
                const catLabel = CATEGORY_OPTIONS.find((o) => o.value === dg.category)?.label ?? "Misto";

                return (
                  <div key={dg.id} className="flex items-center gap-3 bg-fog rounded-xl px-3 py-2">
                    <div className={`w-2 h-6 rounded-full flex-shrink-0 ${barColor}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-midnight">{dg.ddd}</span>
                        <span className="font-body text-xs text-midnight/60">{dg.city}, {dg.state}</span>
                        {km !== null && <span className="font-body text-[10px] text-midnight/40">{km} km</span>}
                      </div>
                      <span className="font-body text-[10px] text-stone">{catLabel}</span>
                    </div>
                    <span className="font-body text-xs font-semibold text-midnight">{dg.count} p.</span>
                    <button onClick={() => removeGroup(dg.id)} className="text-gray-400 hover:text-red-400 transition">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}

              <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200">
                <span className="font-body text-xs text-gray-500">Total</span>
                <span className="font-body text-sm font-bold text-midnight">{totalGuests} convidados</span>
              </div>

              {Object.keys(byRegion).length > 1 && (
                <div className="flex flex-wrap gap-1.5 px-1">
                  {Object.entries(byRegion).map(([region, cnt]) => (
                    <span key={region} className="text-[10px] font-body px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                      {region}: {cnt}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {groups.length > 0 && (
          <button
            onClick={simulate}
            className="w-full py-3 bg-gradient-to-r from-midnight to-midnight/90 text-white rounded-xl font-body text-sm font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Simular presença
          </button>
        )}

        {/* Simulation result */}
        <AnimatePresence>
          {simResult && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-4 p-4 bg-gradient-to-br from-midnight/5 to-midnight/2 rounded-xl border border-midnight/15"
            >
              <p className="font-body text-[10px] uppercase tracking-wider text-gold mb-3">Resultado da simulação</p>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center">
                  <p className="font-heading text-2xl text-midnight">{simResult.totalExpected}</p>
                  <p className="font-body text-[10px] text-gray-500">Esperados</p>
                </div>
                <div className="text-center">
                  <p className="font-heading text-xl text-midnight">{simResult.confidenceRange.min}–{simResult.confidenceRange.max}</p>
                  <p className="font-body text-[10px] text-gray-500">Intervalo</p>
                </div>
                <div className="text-center">
                  <p className="font-heading text-2xl text-midnight">{Math.round(simResult.attendanceRate * 100)}%</p>
                  <p className="font-body text-[10px] text-gray-500">Taxa</p>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-midnight to-gold rounded-full transition-all duration-700"
                  style={{ width: `${Math.round(simResult.attendanceRate * 100)}%` }}
                />
              </div>

              {/* Category breakdown */}
              {Object.entries(simResult.byCategory).length > 0 && (
                <div className="mt-3 space-y-1">
                  {Object.entries(simResult.byCategory)
                    .sort((a, b) => b[1].invited - a[1].invited)
                    .map(([cat, stats]) => (
                      <div key={cat} className="flex items-center justify-between text-xs font-body">
                        <span className="text-midnight/70">{categoryLabel(cat)}</span>
                        <span className="text-midnight font-medium">
                          {stats.expected}/{stats.invited} ({Math.round(stats.rate * 100)}%)
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Import CTA */}
      <div className="bg-fog rounded-2xl border border-gold/15 p-5 text-center">
        <AlertCircle className="w-6 h-6 text-gold mx-auto mb-2" />
        <p className="font-body text-sm text-midnight mb-3">
          Importe a lista real para uma análise completa e precisa
        </p>
        <Link
          href={`/casamento/${id}/importar`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-midnight text-white rounded-xl font-body text-sm font-medium hover:bg-midnight/90 transition"
        >
          Importar lista de convidados
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────

export default function SimuladorConvidadosPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const toast = useToast();

  const [wedding, setWedding] = useState<WeddingWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchData() {
      try {
        const res = await fetch(`/api/weddings/${id}`);
        if (!res.ok) throw new Error("Erro ao carregar casamento");
        const data: WeddingWithRelations = await res.json();
        setWedding(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, status, toast]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated" || !session) return null;

  if (error) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
          <p className="font-body text-red-500 mb-4">{error}</p>
          <Link href={`/casamento/${id}`} className="font-body text-midnight underline">Voltar</Link>
        </div>
      </div>
    );
  }

  if (!wedding) return null;

  const hasGuests = wedding.guests && wedding.guests.length > 0;
  const allGuests = wedding.guests ?? [];

  return (
    <div className="min-h-screen bg-ivory py-10 px-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="font-heading text-4xl sm:text-5xl text-midnight mb-2">
            Simulador de Convidados
          </h1>
          <p className="font-body text-gray-600">
            Descubra de onde vêm seus convidados e quantos vão comparecer
          </p>
          <p className="font-body text-sm text-gray-500 mt-1">
            {wedding.partnerName1} & {wedding.partnerName2}
          </p>
        </motion.div>

        {hasGuests ? (
          <>
            <GuestOriginMap guests={allGuests} weddingState={wedding.state ?? ""} />
            <AttendancePrediction
              guests={allGuests}
              weddingCity={wedding.city ?? ""}
              weddingState={wedding.state ?? ""}
            />
            <GuestAttendanceChart
              guests={allGuests}
              weddingCity={wedding.city ?? ""}
              weddingState={wedding.state ?? ""}
            />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-fog rounded-2xl shadow-md p-6 border border-gold/10"
            >
              <p className="font-body text-sm text-midnight leading-relaxed">
                <strong>Como funciona?</strong> O Laço detecta o DDD de cada convidado pelo telefone e
                calcula a distância real em km até o local do casamento. A previsão considera categoria
                (família, amigos, trabalho), distância, dia da semana e feriados próximos.
              </p>
            </motion.div>
          </>
        ) : (
          <EmptyState
            id={id}
            weddingCity={wedding.city ?? ""}
            weddingState={wedding.state ?? ""}
          />
        )}

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
        >
          <Link
            href={`/casamento/${id}/convidados`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-midnight text-midnight rounded-xl font-body font-medium hover:bg-midnight/5 transition"
          >
            Gerenciar Convidados
          </Link>
        </motion.div>
      </div>

      <BottomNav weddingId={id} />
    </div>
  );
}
