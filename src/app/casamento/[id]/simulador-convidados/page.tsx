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
import { MapPin, Phone, TrendingUp, AlertCircle, ArrowRight } from "lucide-react";
import BottomNav from "@/components/bottom-nav";
import { useToast } from "@/hooks/use-toast";
import { dddMap, type DDDInfo } from "@/lib/ddd-map";
import type { Guest, WeddingWithRelations } from "@/types";

// ─── Types ──────────────────────────────────────────────────────

interface RegionalAttendance {
  state: string;
  count: number;
  percentage: number;
  region: string;
}

interface DDDSamplePhone {
  phone: string;
  ddd: string;
  city: string;
  state: string;
}

// ─── Constants ──────────────────────────────────────────────────

const SAMPLE_PHONES: DDDSamplePhone[] = [
  { phone: "(11) 98765-4321", ddd: "11", city: "São Paulo", state: "SP" },
  { phone: "(21) 99999-8888", ddd: "21", city: "Rio de Janeiro", state: "RJ" },
  { phone: "(31) 97654-3210", ddd: "31", city: "Belo Horizonte", state: "MG" },
  { phone: "(85) 98888-7777", ddd: "85", city: "Fortaleza", state: "CE" },
  { phone: "(51) 99876-5432", ddd: "51", city: "Porto Alegre", state: "RS" },
];

const REGION_COLORS: Record<string, string> = {
  Sudeste: "bg-teal",
  Sul: "bg-blue-500",
  Nordeste: "bg-orange-500",
  Centro: "bg-yellow-600",
  Norte: "bg-green-600",
};

const STATE_REGIONS: Record<string, string> = {
  SP: "Sudeste",
  RJ: "Sudeste",
  ES: "Sudeste",
  MG: "Sudeste",
  PR: "Sul",
  SC: "Sul",
  RS: "Sul",
  BA: "Nordeste",
  SE: "Nordeste",
  AL: "Nordeste",
  PE: "Nordeste",
  PB: "Nordeste",
  RN: "Nordeste",
  CE: "Nordeste",
  PI: "Nordeste",
  MA: "Nordeste",
  GO: "Centro",
  MT: "Centro",
  MS: "Centro",
  DF: "Centro",
  AC: "Norte",
  AM: "Norte",
  PA: "Norte",
  RO: "Norte",
  RR: "Norte",
  AP: "Norte",
  TO: "Norte",
};

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
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

// ─── Extract DDD from Phone ─────────────────────────────────────

function extractDDDFromPhone(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2);
  }
  return null;
}

function formatPhoneInput(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length === 0) return "";
  if (cleaned.length <= 2) return `(${cleaned}`;
  if (cleaned.length <= 7) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  }
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
}

// ─── DDDDemo Component ──────────────────────────────────────────

function DDDDemo() {
  const [inputValue, setInputValue] = useState("");
  const [detectedDDD, setDetectedDDD] = useState<DDDInfo | null>(null);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    setInputValue(formatted);

    const ddd = extractDDDFromPhone(formatted);
    if (ddd && dddMap[ddd]) {
      setDetectedDDD(dddMap[ddd]);
    } else {
      setDetectedDDD(null);
    }
  };

  useEffect(() => {
    // Animate sample phones one by one
    let timeout: NodeJS.Timeout;
    let index = 0;

    const animateSamples = () => {
      if (index < SAMPLE_PHONES.length) {
        setAnimatingIndex(index);
        index++;
        timeout = setTimeout(animateSamples, 800);
      } else {
        setAnimatingIndex(null);
      }
    };

    const initialDelay = setTimeout(animateSamples, 500);

    return () => {
      clearTimeout(timeout);
      clearTimeout(initialDelay);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-md p-6 sm:p-8"
    >
      <div className="mb-6">
        <h2 className="font-heading text-2xl text-verde-noite mb-2">
          <span className="flex items-center gap-2">
            <Phone className="w-6 h-6" />
            Detector de DDD
          </span>
        </h2>
        <p className="font-body text-gray-600">
          Digite um número e veja o Laço detectar de onde vem seu convidado
        </p>
      </div>

      {/* Phone Input Section */}
      <div className="mb-8">
        <label className="block font-body text-sm text-verde-noite mb-3">
          Teste um número de telefone
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="(XX) XXXXX-XXXX"
            value={inputValue}
            onChange={handlePhoneChange}
            maxLength={15}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal transition-colors font-body"
          />
          <Phone className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Detection Result */}
        <AnimatePresence>
          {detectedDDD && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mt-4 p-4 bg-gradient-to-r from-teal/10 to-teal/5 rounded-xl border border-teal/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal/20 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-teal" />
                </div>
                <div>
                  <p className="font-heading text-sm text-teal">DDD {inputValue.slice(1, 3)}</p>
                  <p className="font-body text-verde-noite">
                    {detectedDDD.city}, {detectedDDD.state}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sample Phones Animation */}
      <div className="space-y-3">
        <p className="font-body text-sm text-gray-500 font-semibold">
          Exemplos automáticos
        </p>
        <div className="space-y-2">
          {SAMPLE_PHONES.map((sample, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={
                animatingIndex === idx
                  ? { opacity: 1, x: 0, backgroundColor: "rgba(44, 107, 94, 0.05)" }
                  : { opacity: 0.6, x: 0, backgroundColor: "transparent" }
              }
              transition={{ duration: 0.4 }}
              className="p-3 rounded-lg border border-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-teal to-teal/70 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {sample.ddd}
                </div>
                <div>
                  <p className="font-body text-sm text-verde-noite font-medium">
                    {sample.phone}
                  </p>
                  <p className="font-body text-xs text-gray-500">
                    {sample.city}, {sample.state}
                  </p>
                </div>
              </div>
              {animatingIndex === idx && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-4 h-4 border-2 border-teal border-t-transparent rounded-full"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-8 p-4 bg-cream rounded-xl border border-copper/10">
        <p className="font-body text-sm text-verde-noite leading-relaxed">
          O Laço lê automaticamente os 2 primeiros dígitos de cada número de
          telefone para saber de qual estado e cidade vem o convidado. Isso
          ajuda a prever a taxa de presença baseada na distância.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Guest Origin Map Component ──────────────────────────────

interface GuestOriginMapProps {
  guests: Guest[];
  weddingState: string;
}

function GuestOriginMap({ guests }: GuestOriginMapProps) {
  const [stateStats, setStateStats] = useState<RegionalAttendance[]>([]);

  useEffect(() => {
    const stateMap: Record<string, number> = {};

    guests.forEach((guest) => {
      if (guest.phone) {
        const ddd = extractDDDFromPhone(guest.phone);
        if (ddd && dddMap[ddd]) {
          const state = dddMap[ddd].state;
          stateMap[state] = (stateMap[state] || 0) + 1;
        }
      }
    });

    const stats: RegionalAttendance[] = Object.entries(stateMap)
      .map(([state, count]) => ({
        state,
        count,
        percentage: Math.round((count / guests.length) * 100),
        region: STATE_REGIONS[state] || "Outro",
      }))
      .sort((a, b) => b.count - a.count);

    setStateStats(stats);
  }, [guests]);

  if (stateStats.length === 0) {
    return null;
  }

  const maxCount = Math.max(...stateStats.map((s) => s.count));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-2xl shadow-md p-6 sm:p-8"
    >
      <div className="mb-6">
        <h2 className="font-heading text-2xl text-verde-noite mb-2 flex items-center gap-2">
          <MapPin className="w-6 h-6" />
          Origem dos Convidados
        </h2>
        <p className="font-body text-gray-600">
          Distribuição geográfica pelos estados
        </p>
      </div>

      <div className="space-y-4">
        {stateStats.map((stat, idx) => {
          const barWidth = (stat.count / maxCount) * 100;
          const region = STATE_REGIONS[stat.state] || "Outro";
          const barColor = REGION_COLORS[region] || "bg-gray-400";

          return (
            <motion.div
              key={stat.state}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + idx * 0.08 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-heading text-sm text-verde-noite">
                    {stat.state}
                  </p>
                  <p className="font-body text-xs text-gray-500">{region}</p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-sm text-verde-noite">
                    {stat.count}
                  </p>
                  <p className="font-body text-xs text-gray-500">
                    {stat.percentage}%
                  </p>
                </div>
              </div>

              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${barColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{
                    duration: 0.8,
                    delay: 0.5 + idx * 0.1,
                    ease: "easeOut",
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Regional Legend */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="font-body text-xs text-gray-500 mb-3 font-semibold">
          REGIÕES
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(REGION_COLORS).map(([region, color]) => (
            <div key={region} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <span className="font-body text-xs text-gray-600">{region}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Attendance Prediction Component ─────────────────────────

interface AttendancePredictionProps {
  guests: Guest[];
  weddingState: string;
}

function AttendancePrediction({
  guests,
  weddingState,
}: AttendancePredictionProps) {
  const [prediction, setPrediction] = useState<{
    expected: number;
    samState: number;
    adjacentState: number;
    farState: number;
  } | null>(null);

  useEffect(() => {
    let expected = 0;
    let samState = 0;
    let adjacentState = 0;
    let farState = 0;

    guests.forEach((guest) => {
      if (guest.phone) {
        const ddd = extractDDDFromPhone(guest.phone);
        if (ddd && dddMap[ddd]) {
          const guestState = dddMap[ddd].state;

          if (guestState === weddingState) {
            expected += 0.88;
            samState++;
          } else {
            // Simple distance approximation: adjacent = neighboring states
            const isAdjacent = [
              "SP",
              "RJ",
              "MG",
              "PR",
              "SC",
              "RS",
              "BA",
              "ES",
            ].includes(weddingState);
            if (isAdjacent) {
              expected += 0.72;
              adjacentState++;
            } else {
              expected += 0.55;
              farState++;
            }
          }
        }
      }
    });

    setPrediction({
      expected: Math.round(expected),
      samState,
      adjacentState,
      farState,
    });
  }, [guests, weddingState]);

  if (!prediction) return null;

  const percentage = Math.round((prediction.expected / guests.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-gradient-to-br from-teal/5 to-teal/2 rounded-2xl shadow-md p-6 sm:p-8 border border-teal/20"
    >
      <div className="mb-6">
        <h2 className="font-heading text-2xl text-verde-noite mb-2 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Previsão de Presença
        </h2>
        <p className="font-body text-gray-600">
          Baseado na localização dos convidados
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {/* Same State */}
        <div className="p-4 bg-white rounded-xl border border-teal/10">
          <p className="font-body text-xs text-gray-500 mb-1">Mesmo Estado</p>
          <p className="font-heading text-2xl text-teal mb-1">
            {prediction.samState}
          </p>
          <p className="font-body text-xs text-verde-noite">~88% presença</p>
        </div>

        {/* Adjacent State */}
        <div className="p-4 bg-white rounded-xl border border-teal/10">
          <p className="font-body text-xs text-gray-500 mb-1">Estado Adjacente</p>
          <p className="font-heading text-2xl text-teal mb-1">
            {prediction.adjacentState}
          </p>
          <p className="font-body text-xs text-verde-noite">~72% presença</p>
        </div>

        {/* Far State */}
        <div className="p-4 bg-white rounded-xl border border-teal/10">
          <p className="font-body text-xs text-gray-500 mb-1">Estado Distante</p>
          <p className="font-heading text-2xl text-teal mb-1">
            {prediction.farState}
          </p>
          <p className="font-body text-xs text-verde-noite">~55% presença</p>
        </div>
      </div>

      {/* Main Prediction */}
      <div className="bg-white rounded-xl p-6 border border-teal/20">
        <p className="font-body text-sm text-gray-600 mb-2">Estimativa total</p>
        <div className="flex items-baseline gap-2 mb-2">
          <CountUp
            target={prediction.expected}
            duration={1.2}
            className="font-heading text-4xl text-verde-noite"
          />
          <span className="font-heading text-xl text-gray-400">
            de {guests.length}
          </span>
        </div>
        <div className="text-right">
          <span className="font-heading text-lg text-teal">{percentage}%</span>
        </div>
      </div>

      {/* Donut-style progress */}
      <div className="mt-6">
        <div className="flex items-center justify-center">
          <svg className="w-32 h-32" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <motion.circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#2C6B5E"
              strokeWidth="8"
              strokeDasharray="314"
              initial={{ strokeDashoffset: 314 }}
              animate={{
                strokeDashoffset: 314 - (percentage / 100) * 314,
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
            {/* Center text */}
            <text
              x="60"
              y="60"
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-heading text-2xl fill-verde-noite"
              fontSize="20"
            >
              {percentage}%
            </text>
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty State Component ──────────────────────────────────

interface EmptyStateProps {
  id: string;
}

function EmptyState({ id }: EmptyStateProps) {
  const [showManual, setShowManual] = useState(false);
  const [guestCount, setGuestCount] = useState(50);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-gradient-to-br from-cream to-cream/50 rounded-2xl shadow-md p-8 sm:p-10 border border-copper/20 text-center"
    >
      <div className="w-16 h-16 bg-copper/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-copper" />
      </div>

      <h2 className="font-heading text-2xl text-verde-noite mb-2">
        Ainda não tem convidados?
      </h2>

      <p className="font-body text-gray-600 mb-8 max-w-sm mx-auto">
        Importe sua lista de convidados para ver a análise completa de origem e
        previsão de presença.
      </p>

      <div className="space-y-3 mb-6">
        <Link
          href={`/casamento/${id}/importar`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal text-white rounded-xl font-body font-medium hover:bg-teal/90 transition-all duration-200 justify-center"
        >
          <span>Importar lista de convidados</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="border-t border-copper/10 pt-6">
        <button
          onClick={() => setShowManual(!showManual)}
          className="font-body text-sm text-copper hover:text-copper/80 transition-colors underline"
        >
          Ou simular com dados aleatórios
        </button>

        <AnimatePresence>
          {showManual && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-white rounded-xl border border-copper/20"
            >
              <label className="block font-body text-sm text-verde-noite mb-2">
                Quantos convidados?
              </label>
              <input
                type="range"
                min="10"
                max="300"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full mb-2"
              />
              <p className="font-body text-center text-lg text-teal font-semibold">
                {guestCount} convidados
              </p>
              <p className="font-body text-xs text-gray-500 mt-2">
                Simulação virá em breve
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────

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
        const message =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, status, toast]);

  // ─── Auth guard ────────────────────────────────────────

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
          <p className="font-body text-red-500 mb-4">{error}</p>
          <Link
            href={`/casamento/${id}`}
            className="font-body text-teal underline"
          >
            Voltar ao casamento
          </Link>
        </div>
      </div>
    );
  }

  if (!wedding) return null;

  const hasGuests = wedding.guests && wedding.guests.length > 0;
  const guestPhones =
    wedding.guests?.filter((g) => g.phone && extractDDDFromPhone(g.phone)) ||
    [];

  return (
    <div className="min-h-screen bg-off-white py-10 px-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="font-heading text-4xl sm:text-5xl text-verde-noite mb-3">
            Simulador de Convidados
          </h1>
          <p className="font-body text-lg text-gray-600 max-w-2xl mx-auto">
            Descubra de onde vêm seus convidados e quantos vão comparecer
          </p>
          <p className="font-body text-sm text-gray-500 mt-2">
            {wedding.partnerName1} & {wedding.partnerName2}
          </p>
        </motion.div>

        {/* DDD Demo - always show */}
        <DDDDemo />

        {/* Conditional: Guests or Empty State */}
        {hasGuests && guestPhones.length > 0 ? (
          <>
            <GuestOriginMap guests={guestPhones} weddingState={wedding.state} />
            <AttendancePrediction
              guests={guestPhones}
              weddingState={wedding.state}
            />

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-cream rounded-2xl shadow-md p-6 sm:p-8 border border-copper/10"
            >
              <p className="font-body text-sm text-verde-noite leading-relaxed">
                <strong>Como funciona?</strong> O Laço detecta o DDD (código de
                área) de cada convidado através do número de telefone. Com isso,
                sabemos em qual estado ele está e podemos estimar a probabilidade
                de presença baseado em fatores como distância e categoria.
              </p>
            </motion.div>
          </>
        ) : (
          <EmptyState id={id} />
        )}

        {/* Navigation Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
        >
          <Link
            href={`/casamento/${id}/simulador`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-verde-noite text-verde-noite rounded-xl font-body font-medium hover:bg-verde-noite/5 transition-all duration-200"
          >
            Ver Simulador Inteligente
          </Link>
          <Link
            href={`/casamento/${id}/convidados`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-teal text-teal rounded-xl font-body font-medium hover:bg-teal/5 transition-all duration-200"
          >
            Gerenciar Convidados
          </Link>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
