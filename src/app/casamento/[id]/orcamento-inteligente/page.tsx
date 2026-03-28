"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  VENDOR_CATEGORIES,
  REGIONS,
  TIER_LABELS,
  CLASSIFICATION_LABELS,
  calculateBudget,
  getClassificationGroups,
  type BudgetTier,
  type Region,
  type VendorCategory,
  type VendorClassification,
} from "@/lib/wedding-budget-data";

// ─── Types ───────────────────────────────────────────────────

interface WizardState {
  currentStep: number; // 0 = welcome, 1-N = quiz, N+1 = results
  guests: number;
  region: Region | "";
  selections: Record<string, BudgetTier>;
  budget: { minTotal: number; maxTotal: number } | null;
}

interface CategoryWithIndex extends VendorCategory {
  stepIndex: number;
}

// ─── Progress Bar ────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const percent = (current / total) * 100;
  return (
    <div className="h-1 bg-off-white overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-teal to-verde-noite"
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}

// ─── Welcome Step (Step 0) ───────────────────────────────────

function WelcomeStep({ onNext }: { onNext: (guests: number, region: Region) => void }) {
  const [guests, setGuests] = useState(100);
  const [region, setRegion] = useState<Region>("sp");
  const isValid = guests > 0 && guests <= 500 && region;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-verde-noite to-teal/20 flex flex-col items-center justify-center px-4 py-8"
    >
      <div className="max-w-md w-full space-y-8">
        {/* Hero illustration */}
        <div className="text-center space-y-4">
          <div className="text-6xl">💍</div>
          <h1 className="font-heading text-4xl text-cream font-bold">
            Vamos montar o orçamento do seu casamento
          </h1>
          <p className="font-body text-cream/70 text-base">
            Um guia inteligente para planejar cada detalhe dentro da sua realidade financeira.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-6 space-y-6">
          {/* Guest count */}
          <div>
            <label className="font-heading text-lg text-verde-noite mb-2 block">
              Quantos convidados?
              <span className="font-body text-teal ml-2">{guests}</span>
            </label>
            <input
              type="range"
              min="10"
              max="500"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal"
            />
            <div className="flex justify-between font-body text-xs text-verde-noite/40 mt-2">
              <span>10</span>
              <span>500</span>
            </div>
            <input
              type="number"
              min="10"
              max="500"
              value={guests}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (!isNaN(val) && val >= 10 && val <= 500) setGuests(val);
              }}
              className="mt-3 w-full border border-gray-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
          </div>

          {/* Region select */}
          <div>
            <label className="font-heading text-lg text-verde-noite mb-3 block">
              Região do casamento
            </label>
            <div className="grid grid-cols-2 gap-3">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRegion(r.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition ${
                    region === r.id
                      ? "border-copper bg-copper/5"
                      : "border-gray-200 bg-gray-50 hover:border-copper/30"
                  }`}
                >
                  <span className="text-3xl">{r.emoji}</span>
                  <span className="font-body text-xs text-verde-noite text-center">{r.name}</span>
                </button>
              ))}
            </div>
            <p className="font-body text-xs text-verde-noite/40 mt-3">
              📍 Sabendo de onde vêm seus convidados, calculamos custos de transporte e logística
              com precisão regional.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => onNext(guests, region)}
            disabled={!isValid}
            className="w-full bg-copper text-cream font-heading font-bold py-3 px-4 rounded-xl hover:bg-copper/90 transition disabled:opacity-40"
          >
            Começar
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Quiz Step (Steps 1-N) ──────────────────────────────────

function QuizStep({
  category,
  stepIndex,
  totalSteps,
  selectedTier,
  guests,
  region,
  onSelect,
  onNext,
  onBack,
}: {
  category: CategoryWithIndex;
  stepIndex: number;
  totalSteps: number;
  selectedTier: BudgetTier | undefined;
  guests: number;
  region: Region;
  onSelect: (tier: BudgetTier) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [expandedTips, setExpandedTips] = useState(false);
  const cat = category;

  const getRange = (tier: BudgetTier) => {
    const tierData = cat.tiers[tier];
    let min = tierData.min;
    let max = tierData.max;

    min = min * cat.regionalMultiplier[region];
    max = max * cat.regionalMultiplier[region];

    if (tierData.perPerson) {
      min = min * guests;
      max = max * guests;
    }

    return { min, max };
  };

  const selectedRange = selectedTier ? getRange(selectedTier) : null;

  const classifColor = {
    essencial: "bg-red-50 border-red-200",
    muito_recomendado: "bg-orange-50 border-orange-200",
    legal_ter: "bg-yellow-50 border-yellow-200",
    adicional: "bg-green-50 border-green-200",
  };

  return (
    <motion.div
      key={`step-${stepIndex}`}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-off-white pb-32"
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-verde-noite/50 hover:text-verde-noite transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="text-center">
            <p className="font-body text-xs text-verde-noite/50">
              Passo {stepIndex} de {totalSteps}
            </p>
          </div>
          <div className="w-5" />
        </div>
        <ProgressBar current={stepIndex} total={totalSteps} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Category header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{cat.icon}</span>
            <div className="flex-1">
              <h2 className="font-heading text-2xl text-verde-noite font-bold">{cat.name}</h2>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-body font-semibold border ${classifColor[cat.classification]}`}
            >
              {CLASSIFICATION_LABELS[cat.classification].emoji}{" "}
              {CLASSIFICATION_LABELS[cat.classification].name}
            </div>
          </div>
          <p className="font-body text-sm text-verde-noite/70">{cat.description}</p>
        </div>

        {/* Quiz question */}
        <div>
          <p className="font-heading text-lg text-verde-noite mb-4">{cat.quizQuestion}</p>

          {/* Option cards */}
          <div className="space-y-3">
            {cat.quizOptions.map((option) => (
              <motion.button
                key={option.tier}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(option.tier)}
                className={`w-full p-4 rounded-2xl text-left transition ${
                  selectedTier === option.tier
                    ? "border-2 border-copper bg-copper/5 shadow-md"
                    : "border-2 border-gray-200 bg-white hover:border-copper/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-medium text-verde-noite">{option.label}</p>
                    <p className="font-body text-xs text-verde-noite/50">
                      {TIER_LABELS[option.tier].emoji} {TIER_LABELS[option.tier].name}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Price range (shows after selection) */}
        {selectedRange && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-teal/5 border border-teal/15 rounded-2xl p-4 space-y-2"
          >
            <p className="font-body text-sm text-verde-noite">
              Faixa de preço estimada para sua região e grupo:
            </p>
            <p className="font-heading text-2xl text-teal font-bold">
              R$ {selectedRange.min.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} —{" "}
              {selectedRange.max.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            </p>
            <p className="font-body text-xs text-verde-noite/60">
              Isso representa ~{Math.round(cat.budgetPercentage)}% do orçamento médio de casamentos na sua região.
            </p>
          </motion.div>
        )}

        {/* Pro tips (collapsible) */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => setExpandedTips(!expandedTips)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <span className="font-heading text-sm text-verde-noite font-semibold">
              💡 Dicas Profissionais
            </span>
            <svg
              className={`w-4 h-4 text-verde-noite/50 transition ${expandedTips ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          {expandedTips && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-4 border-t border-gray-200 bg-gray-50/50 space-y-2"
            >
              {cat.proTips.map((tip, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-teal flex-shrink-0 font-bold">•</span>
                  <p className="font-body text-sm text-verde-noite/70">{tip}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 border border-gray-200 text-verde-noite font-body font-medium py-2.5 px-4 rounded-xl hover:bg-gray-50 transition"
          >
            Voltar
          </button>
          <button
            onClick={onNext}
            disabled={!selectedTier}
            className="flex-1 bg-copper text-cream font-body font-medium py-2.5 px-4 rounded-xl hover:bg-copper/90 transition disabled:opacity-40"
          >
            Próximo
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Results Step (Final) ────────────────────────────────────

function ResultsStep({
  selections,
  guests,
  region,
  budget,
  onReset,
  onSave,
  isSaving,
}: {
  selections: Record<string, BudgetTier>;
  guests: number;
  region: Region;
  budget: { minTotal: number; maxTotal: number } | null;
  onReset: () => void;
  onSave: () => void;
  isSaving: boolean;
}) {
  const groups = Object.entries(getClassificationGroups()).map(([classification, cats]) => ({
    classification: classification as VendorClassification,
    categories: cats.map((c) => c.id),
  }));
  const shareUrl = budget
    ? `R$${(budget.minTotal / 1000).toFixed(0)}k-${(budget.maxTotal / 1000).toFixed(0)}k`
    : "Orçamento";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-off-white pb-32"
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="font-heading text-2xl text-verde-noite font-bold">Seu Orçamento</h1>
          </div>
        </div>
        <ProgressBar current={100} total={100} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Total budget display */}
        {budget && (
          <div className="bg-gradient-to-br from-verde-noite to-teal rounded-2xl text-cream p-6 text-center space-y-2">
            <p className="font-body text-sm opacity-90">Orçamento Estimado</p>
            <p className="font-heading text-4xl font-bold">
              R$ {(budget.minTotal / 1000).toFixed(1)}k
              <span className="text-xl mx-1 opacity-50">—</span>
              {(budget.maxTotal / 1000).toFixed(1)}k
            </p>
            <p className="font-body text-xs opacity-75">Para {guests} convidados na região</p>
          </div>
        )}

        {/* Budget breakdown chart */}
        {budget && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-heading text-lg text-verde-noite font-bold">Distribuição por Categoria</h2>

            <svg viewBox="0 0 100 20" className="w-full h-auto" preserveAspectRatio="none">
              {(() => {
                let offset = 0;
                const total = budget.maxTotal;
                return VENDOR_CATEGORIES.map((cat) => {
                  const tier = selections[cat.id];
                  if (!tier) return null;

                  const tierData = cat.tiers[tier];
                  let val = (tierData.min + tierData.max) / 2 * cat.regionalMultiplier[region];
                  if (tierData.perPerson) val = val * guests;

                  const width = (val / total) * 100;
                  const colorMap: Record<string, string> = {
                    essencial: "#EF4444",
                    muito_recomendado: "#F97316",
                    legal_ter: "#FBBF24",
                    adicional: "#22C55E",
                  };
                  const color = colorMap[cat.classification] || "#2C6B5E";

                  const element = (
                    <rect
                      key={cat.id}
                      x={offset}
                      y="0"
                      width={width}
                      height="20"
                      fill={color}
                      opacity="0.9"
                    />
                  );
                  offset += width;
                  return element;
                });
              })()}
            </svg>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {groups.map((group) => {
                const groupTotal = group.categories.reduce((sum, catId) => {
                  const cat = VENDOR_CATEGORIES.find((c) => c.id === catId);
                  if (!cat) return sum;
                  const tier = selections[cat.id];
                  if (!tier) return sum;

                  const tierData = cat.tiers[tier];
                  let val = (tierData.min + tierData.max) / 2 * cat.regionalMultiplier[region];
                  if (tierData.perPerson) val = val * guests;
                  return sum + val;
                }, 0);

                const colorMap: Record<string, string> = {
                  essencial: "bg-red-100 text-red-700",
                  muito_recomendado: "bg-orange-100 text-orange-700",
                  legal_ter: "bg-yellow-100 text-yellow-700",
                  adicional: "bg-green-100 text-green-700",
                };

                return (
                  <div
                    key={group.classification}
                    className={`p-2 rounded-lg ${colorMap[group.classification]} text-center`}
                  >
                    <p className="font-bold">{CLASSIFICATION_LABELS[group.classification].emoji}</p>
                    <p className="font-body text-xs font-semibold mt-1">
                      R$ {(groupTotal / 1000).toFixed(1)}k
                    </p>
                    <p className="font-body text-[10px] opacity-70 mt-0.5">
                      {CLASSIFICATION_LABELS[group.classification].name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
          <div className="px-6 py-4 bg-gray-50">
            <h3 className="font-heading text-sm text-verde-noite font-bold">Detalhamento Completo</h3>
          </div>

          {groups.map((group) => (
            <div key={group.classification} className="divide-y divide-gray-100">
              {/* Group header */}
              <div className={`px-6 py-3 text-sm font-semibold ${
                {
                  essencial: "bg-red-50 text-red-700",
                  muito_recomendado: "bg-orange-50 text-orange-700",
                  legal_ter: "bg-yellow-50 text-yellow-700",
                  adicional: "bg-green-50 text-green-700",
                }[group.classification]
              }`}>
                {CLASSIFICATION_LABELS[group.classification].emoji}{" "}
                {CLASSIFICATION_LABELS[group.classification].name}
              </div>

              {/* Category rows */}
              {group.categories.map((catId) => {
                const cat = VENDOR_CATEGORIES.find((c) => c.id === catId);
                if (!cat) return null;

                const tier = selections[cat.id];
                if (!tier) return null;

                const tierData = cat.tiers[tier];
                let min = tierData.min * cat.regionalMultiplier[region];
                let max = tierData.max * cat.regionalMultiplier[region];
                if (tierData.perPerson) {
                  min = min * guests;
                  max = max * guests;
                }

                return (
                  <div key={cat.id} className="px-6 py-3 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-body font-medium text-verde-noite">{cat.icon} {cat.name}</p>
                      <p className="font-body text-xs text-verde-noite/50 mt-0.5">
                        {TIER_LABELS[tier].emoji} {TIER_LABELS[tier].name}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-body font-semibold text-verde-noite">
                        R$ {min.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                      </p>
                      <p className="font-body text-xs text-verde-noite/50">
                        a {max.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Share chip */}
        <div className="bg-copper/10 border border-copper/20 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-body text-sm text-verde-noite font-medium truncate">
              Seu casamento estimado: {shareUrl}
            </p>
            <p className="font-body text-xs text-verde-noite/50">Feito no Laço</p>
          </div>
          <button
            onClick={() => {
              const text = `Seu casamento estimado: ${shareUrl} — Feito no Laço`;
              navigator.clipboard.writeText(text);
            }}
            className="flex-shrink-0 ml-2 p-2 hover:bg-copper/20 rounded-lg transition"
            title="Copiar para clipboard"
          >
            <svg className="w-4 h-4 text-copper" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        {/* Comparison with market */}
        <div className="bg-teal/5 border border-teal/15 rounded-2xl p-4">
          <p className="font-body text-sm text-verde-noite mb-3">
            <strong>Insights do Mercado:</strong>
          </p>
          <ul className="space-y-2 font-body text-xs text-verde-noite/70">
            <li className="flex gap-2">
              <span className="text-teal flex-shrink-0">✓</span>
              <span>Sua faixa de preço está alinhada com o mercado brasileiro 2024-2026</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal flex-shrink-0">✓</span>
              <span>Lembre-se: preços podem variar até 30% conforme sazonalidade e demanda</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal flex-shrink-0">✓</span>
              <span>Reserve uma margem de contingência de 10-15% no seu orçamento</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Action buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            onClick={onReset}
            className="flex-1 border border-gray-200 text-verde-noite font-body font-medium py-2.5 px-4 rounded-xl hover:bg-gray-50 transition"
          >
            Refazer Simulação
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 bg-copper text-cream font-body font-medium py-2.5 px-4 rounded-xl hover:bg-copper/90 transition disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-cream border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V3" />
                </svg>
                Salvar no meu orçamento
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page Component ─────────────────────────────────────

export default function OrcamentoInteligentePage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const weddingId = params.id as string;
  const toast = useToast();

  const [state, setState] = useState<WizardState>({
    currentStep: 0,
    guests: 0,
    region: "",
    selections: {},
    budget: null,
  });
  const [saving, setSaving] = useState(false);

  // Check auth
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Prepare category list with step indices
  const categoriesWithIndex: CategoryWithIndex[] = VENDOR_CATEGORIES.map((cat, idx) => ({
    ...cat,
    stepIndex: idx + 1, // Steps 1-N (step 0 is welcome)
  }));

  const totalSteps = categoriesWithIndex.length + 1; // welcome + quiz steps

  // Handle welcome completion
  const handleWelcomeComplete = (guests: number, region: Region) => {
    setState((prev) => ({
      ...prev,
      currentStep: 1,
      guests,
      region,
    }));
  };

  // Handle tier selection in quiz
  const handleTierSelect = (tier: BudgetTier) => {
    const currentCat = categoriesWithIndex[state.currentStep - 1];
    setState((prev) => ({
      ...prev,
      selections: {
        ...prev.selections,
        [currentCat.id]: tier,
      },
    }));
  };

  // Navigate to next step
  const handleNext = () => {
    if (state.currentStep < totalSteps) {
      setState((prev) => ({
        ...prev,
        currentStep: prev.currentStep + 1,
      }));
    } else {
      // Calculate budget on final step
      const result = calculateBudget(state.selections, Number(state.guests), state.region as Region);
      const budget = {
        minTotal: result.breakdown.reduce((sum, b) => sum + b.min, 0),
        maxTotal: result.breakdown.reduce((sum, b) => sum + b.max, 0),
      };
      setState((prev) => ({
        ...prev,
        budget,
      }));
    }
  };

  // Navigate to previous step
  const handleBack = () => {
    if (state.currentStep > 0) {
      setState((prev) => ({
        ...prev,
        currentStep: prev.currentStep - 1,
      }));
    }
  };

  // Reset wizard
  const handleReset = () => {
    setState({
      currentStep: 0,
      guests: 0,
      region: "",
      selections: {},
      budget: null,
    });
  };

  // Save budget to database
  const handleSaveBudget = async () => {
    if (!state.budget || state.currentStep !== totalSteps) return;

    setSaving(true);
    try {
      const budgetItems = VENDOR_CATEGORIES.map((cat) => {
        const tier = state.selections[cat.id];
        if (!tier) return null;

        const tierData = cat.tiers[tier];
        let estimatedCost = (tierData.min + tierData.max) / 2;
        estimatedCost = estimatedCost * (state.region ? cat.regionalMultiplier[state.region as Region] : 1);
        if (tierData.perPerson) {
          estimatedCost = estimatedCost * Number(state.guests);
        }

        return {
          category: cat.name,
          description: `${cat.name} — ${TIER_LABELS[tier].name}`,
          estimatedCost: Math.round(estimatedCost),
          notes: tierData.notes,
        };
      }).filter(Boolean);

      const res = await fetch(`/api/weddings/${weddingId}/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: budgetItems }),
      });

      if (res.ok) {
        toast({
          title: "Orçamento salvo!",
          description: "Seu orçamento foi salvo com sucesso. Você pode acessá-lo a qualquer momento.",
        });
        // Navigate to budget page after 1 second
        setTimeout(() => {
          router.push(`/casamento/${weddingId}/orcamento`);
        }, 1000);
      } else {
        toast({
          title: "Erro ao salvar",
          description: "Tente novamente",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving budget:", error);
      toast({
        title: "Erro",
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Render steps
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {state.currentStep === 0 && (
        <WelcomeStep key="welcome" onNext={handleWelcomeComplete} />
      )}

      {state.currentStep > 0 && state.currentStep <= categoriesWithIndex.length && (
        <QuizStep
          key={`quiz-${state.currentStep}`}
          category={categoriesWithIndex[state.currentStep - 1]}
          stepIndex={state.currentStep}
          totalSteps={categoriesWithIndex.length}
          selectedTier={state.selections[categoriesWithIndex[state.currentStep - 1].id]}
          guests={state.guests}
          region={state.region as Region}
          onSelect={handleTierSelect}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {state.currentStep === totalSteps && (
        <ResultsStep
          key="results"
          selections={state.selections}
          guests={state.guests}
          region={state.region as Region}
          budget={state.budget}
          onReset={handleReset}
          onSave={handleSaveBudget}
          isSaving={saving}
        />
      )}
    </AnimatePresence>
  );
}
