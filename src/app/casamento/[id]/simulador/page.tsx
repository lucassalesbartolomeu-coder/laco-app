"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import type { Guest, GuestCategory, WeddingWithRelations } from "@/types";

// ─── Attendance Rates by Category ──────────────────────────

const CATEGORY_RATES: Record<GuestCategory, { rate: number; label: string }> = {
  família_noivo: { rate: 0.92, label: "Familia do Noivo" },
  família_noiva: { rate: 0.92, label: "Familia da Noiva" },
  amigos_noivo: { rate: 0.78, label: "Amigos do Noivo" },
  amigos_noiva: { rate: 0.78, label: "Amigos da Noiva" },
  trabalho: { rate: 0.6, label: "Trabalho" },
  lista_b: { rate: 0.45, label: "Lista B" },
};

const COST_BREAKDOWN = [
  { label: "Buffet", pct: 0.45 },
  { label: "Decoracao", pct: 0.15 },
  { label: "Foto & Video", pct: 0.12 },
  { label: "Musica & DJ", pct: 0.08 },
  { label: "Doces & Bolo", pct: 0.07 },
  { label: "Convites", pct: 0.03 },
  { label: "Outros", pct: 0.1 },
];

// ─── Simulation Helpers ────────────────────────────────────

interface CategoryBreakdown {
  category: GuestCategory;
  label: string;
  invited: number;
  expected: number;
  rate: number;
}

interface SimulationResult {
  totalInvited: number;
  expectedTotal: number;
  confidenceLow: number;
  confidenceHigh: number;
  overallRate: number;
  categories: CategoryBreakdown[];
}

function simulateAttendance(guests: Guest[]): SimulationResult {
  const grouped = new Map<GuestCategory, Guest[]>();

  for (const g of guests) {
    const cat = g.category ?? "amigos_noivo";
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(g);
  }

  const categories: CategoryBreakdown[] = [];
  let expectedTotal = 0;

  for (const [cat, list] of grouped) {
    const info = CATEGORY_RATES[cat];
    const invited = list.length;

    // Already-confirmed guests count as 100%, recusado as 0%
    let expected = 0;
    for (const g of list) {
      if (g.rsvpStatus === "confirmado") expected += 1;
      else if (g.rsvpStatus === "recusado") expected += 0;
      else expected += info.rate;
    }

    expected = Math.round(expected);
    expectedTotal += expected;

    categories.push({
      category: cat,
      label: info.label,
      invited,
      expected,
      rate: invited > 0 ? expected / invited : 0,
    });
  }

  // Sort by invited count descending
  categories.sort((a, b) => b.invited - a.invited);

  const totalInvited = guests.length;
  const overallRate = totalInvited > 0 ? expectedTotal / totalInvited : 0;

  // Confidence range: +/- 8%
  const confidenceLow = Math.max(0, Math.round(expectedTotal * 0.92));
  const confidenceHigh = Math.round(expectedTotal * 1.08);

  return {
    totalInvited,
    expectedTotal,
    confidenceLow,
    confidenceHigh,
    overallRate,
    categories,
  };
}

interface CostEstimate {
  expectedCost: number;
  costLow: number;
  costHigh: number;
  costPerGuest: number;
}

function estimateCost(
  expectedGuests: number,
  estimatedBudget: number | null
): CostEstimate {
  // If user provided a budget, use it as anchor; otherwise estimate R$450/guest
  const costPerGuest = estimatedBudget && expectedGuests > 0
    ? estimatedBudget / expectedGuests
    : 450;

  const expectedCost = Math.round(expectedGuests * costPerGuest);
  const costLow = Math.round(expectedCost * 0.85);
  const costHigh = Math.round(expectedCost * 1.2);

  return { expectedCost, costLow, costHigh, costPerGuest };
}

// ─── CountUp Component ─────────────────────────────────────

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
    const controls = animate(motionVal, target, {
      duration,
      ease: "easeOut",
    });

    const unsubscribe = rounded.on("change", (v) => setDisplay(v));

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [target, duration, motionVal, rounded]);

  return (
    <span className={className}>
      {prefix}{display}{suffix}
    </span>
  );
}

// ─── Currency Formatter ────────────────────────────────────

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

// ─── Main Page ─────────────────────────────────────────────

export default function SimuladorPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();

  const [wedding, setWedding] = useState<WeddingWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [cost, setCost] = useState<CostEstimate | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchData() {
      try {
        const res = await fetch(`/api/weddings/${id}`);
        if (!res.ok) throw new Error("Erro ao carregar casamento");
        const data: WeddingWithRelations = await res.json();
        setWedding(data);

        const sim = simulateAttendance(data.guests);
        setSimulation(sim);

        const costEst = estimateCost(sim.expectedTotal, data.estimatedBudget);
        setCost(costEst);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, status]);

  // ─── Auth guard ────────────────────────────────────────

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
          <p className="font-body text-red-500 mb-4">{error}</p>
          <Link
            href={`/casamento/${id}`}
            className="font-body text-midnight underline"
          >
            Voltar ao casamento
          </Link>
        </div>
      </div>
    );
  }

  if (!wedding || !simulation || !cost) return null;

  const ratePercent = Math.round(simulation.overallRate * 100);

  return (
    <div className="min-h-screen bg-ivory py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-heading text-3xl sm:text-4xl text-midnight mb-1">
            Simulador Inteligente
          </h1>
          <p className="font-body text-gray-500">
            {wedding.partnerName1} & {wedding.partnerName2}
          </p>
        </div>

        {/* ─── 1. Main Attendance Card ──────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-md p-8 sm:p-10 text-center"
        >
          <p className="font-body text-gray-500 mb-2">Estimamos</p>

          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="font-heading text-midnight text-lg">~</span>
            <CountUp
              target={simulation.expectedTotal}
              duration={1.5}
              className="font-heading text-5xl sm:text-6xl text-midnight"
            />
          </div>

          <p className="font-heading text-xl text-midnight mb-4">
            convidados presentes
          </p>

          <p className="font-body text-gray-500 mb-1">
            de {simulation.totalInvited} convidados ({ratePercent}% de presença
            estimada)
          </p>

          <p className="font-body text-sm text-gray-400">
            entre{" "}
            <span className="font-semibold text-midnight">
              {simulation.confidenceLow}
            </span>{" "}
            e{" "}
            <span className="font-semibold text-midnight">
              {simulation.confidenceHigh}
            </span>{" "}
            convidados
          </p>
        </motion.div>

        {/* ─── 2. Category Breakdown ───────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-white rounded-2xl shadow-md p-8 sm:p-10"
        >
          <h2 className="font-heading text-2xl text-midnight mb-6">
            Presenca por Categoria
          </h2>

          <div className="space-y-5">
            {simulation.categories.map((cat, i) => {
              const pct = Math.round(cat.rate * 100);
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-body text-sm text-midnight">
                      {cat.label}
                    </span>
                    <span className="font-body text-sm text-gray-500">
                      {cat.expected} de {cat.invited} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-midnight"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        duration: 1,
                        delay: 0.3 + i * 0.1,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ─── 3. Cost Estimation Card ─────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-md p-8 sm:p-10"
        >
          <h2 className="font-heading text-2xl text-midnight mb-2">
            Estimativa de Custo
          </h2>

          <p className="font-body text-gray-500 mb-6">
            Seu casamento deve custar entre{" "}
            <span className="font-semibold text-midnight">
              {formatBRL(cost.costLow)}
            </span>{" "}
            e{" "}
            <span className="font-semibold text-midnight">
              {formatBRL(cost.costHigh)}
            </span>
          </p>

          <div className="text-center mb-8">
            <CountUp
              target={cost.expectedCost}
              duration={1.5}
              formatFn={formatBRL}
              className="font-heading text-4xl sm:text-5xl text-gold"
            />
            <p className="font-body text-sm text-gray-400 mt-2">
              custo esperado ({formatBRL(cost.costPerGuest)} por convidado)
            </p>
          </div>

          <div className="space-y-4">
            {COST_BREAKDOWN.map((item, i) => {
              const pctDisplay = Math.round(item.pct * 100);
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-body text-sm text-midnight">
                      {item.label}
                    </span>
                    <span className="font-body text-sm text-gray-500">
                      {formatBRL(Math.round(cost.expectedCost * item.pct))} (
                      {pctDisplay}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gold"
                      initial={{ width: 0 }}
                      animate={{ width: `${pctDisplay}%` }}
                      transition={{
                        duration: 1,
                        delay: 0.5 + i * 0.08,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ─── 4. Bottom Link ──────────────────────────── */}
        <div className="text-center pb-6">
          <Link
            href={`/casamento/${id}/convidados`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-midnight text-white rounded-xl font-body font-medium hover:bg-midnight/90 transition-all duration-200"
          >
            Ver lista de convidados
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
