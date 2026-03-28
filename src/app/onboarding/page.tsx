"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { track } from "@/lib/analytics";

// ──────────────────────────────────────────────────────────────────────────────
// COUPLE ONBOARDING: 6 STEPS WITH WOW EXPERIENCE
// ──────────────────────────────────────────────────────────────────────────────

type OnboardingStep =
  | "welcome"
  | "about"
  | "details"
  | "budget"
  | "guests"
  | "celebrate";

interface CoupleFormData {
  partnerName1: string;
  partnerName2: string;
  weddingDate?: string;
  city?: string;
  state?: string;
  style?: string;
  estimatedGuests?: number;
  estimatedBudget?: number;
  hasPlannerEmail?: string;
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const WEDDING_STYLES = [
  { id: "rustico", label: "Rústico", emoji: "🌿" },
  { id: "classico", label: "Clássico", emoji: "✨" },
  { id: "moderno", label: "Moderno", emoji: "🖤" },
  { id: "praiano", label: "Praiano", emoji: "🌊" },
  { id: "minimalista", label: "Minimalista", emoji: "⚪" },
  { id: "boho", label: "Boho", emoji: "🌻" },
];

const BRAZILIAN_STATES = [
  "SP", "RJ", "MG", "BA", "SC", "PR", "RS", "GO", "DF", "ES",
  "PE", "CE", "PA", "MT", "MS", "PB", "AL", "RN", "SE", "PI",
  "MA", "AM", "RO", "AC", "AP", "RR", "TO"
];

// Confetti CSS animation
const confettiStyle = `
  @keyframes confetti-fall {
    to {
      transform: translateY(100vh) rotateZ(360deg);
      opacity: 0;
    }
  }
  .confetti {
    animation: confetti-fall 2.5s ease-in forwards;
    position: fixed;
    pointer-events: none;
  }
`;

function Confetti() {
  const [pieces, setPieces] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);

  useEffect(() => {
    const confettiPieces = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      color: ["#1A3A33", "#2C6B5E", "#C4734F", "#FFF8F0"][Math.floor(Math.random() * 4)],
    }));
    setPieces(confettiPieces);
  }, []);

  return (
    <>
      <style>{confettiStyle}</style>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti w-2 h-2 rounded-full"
          style={{
            left: `${piece.left}%`,
            top: "-10px",
            backgroundColor: piece.color,
            animation: `confetti-fall 2.5s ease-in forwards`,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// PLANNER ONBOARDING (unchanged from original)
// ──────────────────────────────────────────────────────────────────────────────

const PLANNER_STEPS = [
  {
    title: "Menos planilha. Mais casamento.",
    subtitle: "Cerimonialistas que usam o Laço economizam 4h por evento.",
    icon: "📋",
    description: "Pipeline de vendas, OCR de orçamentos com IA, controle de comissões, agenda e portal do cliente — tudo integrado.",
    action: "Configurar meu perfil",
  },
  {
    title: "Seus clientes vão te encontrar aqui",
    subtitle: "Perfil público + portfólio para novos noivos.",
    icon: "🏢",
    description: "Noivos que usam o Laço podem buscar e contratar cerimonialistas direto pelo app.",
    action: "Criar meu perfil agora",
    href: "/cerimonialista/portfolio",
  },
  {
    title: "Adeus digitação de orçamento",
    subtitle: "Foto → itens organizados em 15 segundos.",
    icon: "🤖",
    description: "Tire uma foto ou envie o PDF. A IA do Laço lê, categoriza e organiza tudo automaticamente.",
    action: "Testar o OCR agora",
    href: "/cerimonialista/importar-orcamento",
  },
  {
    title: "Pronto para o próximo casamento! 🎊",
    subtitle: "Seu escritório digital está configurado.",
    icon: "✅",
    description: "Pipeline para fechar novos clientes, agenda com todos os eventos, financeiro com controle de comissões.",
    action: "Abrir meu painel",
    href: "/cerimonialista/dashboard",
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Couple flow
  const [coupleStep, setCoupleStep] = useState<OnboardingStep>("welcome");
  const [formData, setFormData] = useState<CoupleFormData>({
    partnerName1: "",
    partnerName2: "",
  });
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [direction, setDirection] = useState(1);

  // Planner flow
  const [plannerStep, setPlannerStep] = useState(0);
  const [plannerSaving, setPlannerSaving] = useState(false);

  const [plannerEmail, setPlannerEmail] = useState("");

  const role = (session?.user as { role?: string })?.role ?? "COUPLE";
  const isCouple = role === "COUPLE";
  const steps = isCouple
    ? ["welcome", "about", "details", "budget", "guests", "celebrate"]
    : PLANNER_STEPS;
  const totalSteps = steps.length;

  // ──────────────────────────────────────────────────────────────────────────────
  // LOAD SAVED PROGRESS
  // ──────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/user/onboarding")
      .then((r) => r.json())
      .then((data) => {
        if (data.onboardingStep === -1) {
          // Already completed
          router.push(isCouple ? "/dashboard" : "/cerimonialista/dashboard");
        } else if (data.onboardingStep > 0 && isCouple) {
          const stepIndex = Math.min(data.onboardingStep, steps.length - 1);
          setCoupleStep(steps[stepIndex] as OnboardingStep);
        }
      })
      .catch(console.error);
  }, [status, isCouple, router]);

  // ──────────────────────────────────────────────────────────────────────────────
  // SAVE PROGRESS
  // ──────────────────────────────────────────────────────────────────────────────

  async function saveStep(stepIndex: number) {
    await fetch("/api/user/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: stepIndex }),
    });
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // CREATE WEDDING (called after step 2: details)
  // ──────────────────────────────────────────────────────────────────────────────

  async function createWedding() {
    if (!formData.partnerName1.trim() || !formData.partnerName2.trim()) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/weddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerName1: formData.partnerName1.trim(),
          partnerName2: formData.partnerName2.trim(),
          weddingDate: formData.weddingDate,
          city: formData.city,
          state: formData.state,
          style: formData.style,
          estimatedGuests: formData.estimatedGuests,
          estimatedBudget: formData.estimatedBudget,
        }),
      });

      const data = await res.json();
      if (data.id) {
        setWeddingId(data.id);
        track("wedding_created", {
          partners: `${formData.partnerName1} & ${formData.partnerName2}`,
          style: formData.style,
          guests: formData.estimatedGuests,
        });
        return data.id;
      }
    } catch (error) {
      console.error("Failed to create wedding:", error);
    } finally {
      setSaving(false);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // COUPLE STEP NAVIGATION
  // ──────────────────────────────────────────────────────────────────────────────

  function getStepIndex(step: OnboardingStep): number {
    return (steps as string[]).indexOf(step);
  }

  async function handleCoupleNext() {
    const currentIndex = getStepIndex(coupleStep);
    if (currentIndex < totalSteps - 1) {
      setSaving(true);

      // Create wedding after step 2 (details)
      if (coupleStep === "details" && !weddingId) {
        const newId = await createWedding();
        if (!newId) {
          setSaving(false);
          return;
        }
        setWeddingId(newId);
      }

      await saveStep(currentIndex + 1);
      setSaving(false);
      setDirection(1);
      setCoupleStep((steps as OnboardingStep[])[currentIndex + 1]);
    }
  }

  async function handleCoupleBack() {
    const currentIndex = getStepIndex(coupleStep);
    if (currentIndex > 0) {
      setDirection(-1);
      setCoupleStep((steps as OnboardingStep[])[currentIndex - 1]);
    }
  }

  async function handleCoupleComplete() {
    setSaving(true);
    await saveStep(-1);
    setSaving(false);
    router.push("/dashboard");
  }

  async function handleCoupleSkip() {
    setSaving(true);
    await saveStep(-1);
    setSaving(false);
    router.push("/dashboard");
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // PLANNER STEP NAVIGATION
  // ──────────────────────────────────────────────────────────────────────────────

  function handlePlannerNext() {
    if (plannerStep < totalSteps - 1) {
      setPlannerSaving(true);
      saveStep(plannerStep + 1).then(() => {
        setPlannerSaving(false);
        setPlannerStep((s) => s + 1);
      });
    }
  }

  function handlePlannerBack() {
    if (plannerStep > 0) {
      setPlannerStep((s) => s - 1);
    }
  }

  async function handlePlannerComplete() {
    setPlannerSaving(true);
    await saveStep(-1);
    setPlannerSaving(false);
    router.push("/cerimonialista/dashboard");
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // LOADING
  // ──────────────────────────────────────────────────────────────────────────────

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // RENDER COUPLE FLOW
  // ──────────────────────────────────────────────────────────────────────────────

  if (isCouple) {
    const currentIndex = getStepIndex(coupleStep);
    const isLast = currentIndex === totalSteps - 1;
    const dateNotDecided = !formData.weddingDate;

    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
        {/* Skip button */}
        <div className="w-full max-w-lg mb-4 flex justify-end">
          <button
            onClick={handleCoupleSkip}
            className="font-body text-sm text-verde-noite/40 hover:text-verde-noite transition"
          >
            Pular →
          </button>
        </div>

        <div className="w-full max-w-lg">
          {/* Progress bar */}
          <div className="flex gap-1.5 mb-8">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-1 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: i <= currentIndex ? "#2C6B5E" : "#E5E7EB",
                }}
              />
            ))}
          </div>

          {/* Card Container */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={coupleStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="p-8"
              >
                {/* STEP 0: WELCOME */}
                {coupleStep === "welcome" && (
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <div className="text-6xl mb-4">💍</div>
                      <h1 className="font-heading text-3xl text-verde-noite">Bem-vindos ao Laço</h1>
                      <p className="font-body text-verde-noite/60">Vamos preparar tudo para o casamento de vocês</p>
                    </div>

                    <div className="space-y-3 mt-8">
                      <button
                        onClick={handleCoupleNext}
                        className="w-full py-3 rounded-xl bg-teal text-white font-body font-medium hover:bg-teal/90 transition"
                      >
                        Vou planejar por conta própria
                      </button>
                      <button
                        onClick={() => {
                          setPlannerEmail("");
                          setPlannerResult(null);
                          handleCoupleNext();
                        }}
                        className="w-full py-3 rounded-xl border border-teal text-teal font-body font-medium hover:bg-teal/5 transition"
                      >
                        Já tenho cerimonialista
                      </button>
                    </div>

                    <p className="font-body text-xs text-verde-noite/50 text-center">
                      +2.400 casais planejando seu casamento no Laço
                    </p>
                  </div>
                )}

                {/* STEP 1: ABOUT YOU (Sobre vocês) */}
                {coupleStep === "about" && (
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h1 className="font-heading text-2xl text-verde-noite">Sobre vocês</h1>
                      <p className="font-body text-verde-noite/60 text-sm">Os nomes de vocês aparecem em tudo no Laço</p>
                    </div>

                    {/* Live preview */}
                    {(formData.partnerName1 || formData.partnerName2) && (
                      <div className="text-center p-4 bg-cream rounded-xl border border-teal/20">
                        <p className="font-heading text-xl text-teal">
                          {formData.partnerName1 || "Nome"} & {formData.partnerName2 || "Nome"}
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <input
                        type="text"
                        value={formData.partnerName1}
                        onChange={(e) => setFormData({ ...formData, partnerName1: e.target.value })}
                        placeholder="Nome do(a) noivo(a) 1"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:border-teal transition"
                      />
                      <input
                        type="text"
                        value={formData.partnerName2}
                        onChange={(e) => setFormData({ ...formData, partnerName2: e.target.value })}
                        placeholder="Nome do(a) noivo(a) 2"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:border-teal transition"
                      />
                    </div>

                    {/* Date picker */}
                    <div className="space-y-2">
                      <label className="font-body text-sm text-verde-noite">Data do casamento</label>
                      <input
                        type="date"
                        value={formData.weddingDate || ""}
                        onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:border-teal transition"
                      />
                      {dateNotDecided && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded" onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, weddingDate: undefined });
                            }
                          }} />
                          <span className="font-body text-xs text-verde-noite/60">Ainda não decidimos</span>
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2: DETAILS (O grande dia) */}
                {coupleStep === "details" && (
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h1 className="font-heading text-2xl text-verde-noite">O grande dia</h1>
                      <p className="font-body text-verde-noite/60 text-sm">Essas informações ajudam a encontrar fornecedores</p>
                    </div>

                    {/* Guest count slider */}
                    <div className="space-y-3">
                      <label className="font-body text-sm text-verde-noite font-medium">
                        Número de convidados: {formData.estimatedGuests || 100}
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="500"
                        value={formData.estimatedGuests || 100}
                        onChange={(e) => setFormData({ ...formData, estimatedGuests: parseInt(e.target.value) })}
                        className="w-full h-2 bg-cream rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #2C6B5E 0%, #2C6B5E ${((formData.estimatedGuests || 100 - 50) / 450) * 100}%, #E5E7EB ${((formData.estimatedGuests || 100 - 50) / 450) * 100}%, #E5E7EB 100%)`,
                        }}
                      />
                      <p className="font-body text-xs text-verde-noite/50">De 50 a 500 convidados</p>
                    </div>

                    {/* Wedding style */}
                    <div className="space-y-3">
                      <label className="font-body text-sm text-verde-noite font-medium">Estilo do casamento</label>
                      <div className="grid grid-cols-3 gap-2">
                        {WEDDING_STYLES.map((style) => (
                          <button
                            key={style.id}
                            onClick={() => setFormData({ ...formData, style: style.id })}
                            className={`p-3 rounded-xl border-2 transition font-body text-xs text-center ${
                              formData.style === style.id
                                ? "border-teal bg-teal/10"
                                : "border-gray-200 hover:border-teal/50"
                            }`}
                          >
                            <div className="text-2xl mb-1">{style.emoji}</div>
                            <div className="font-medium text-verde-noite">{style.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={formData.city || ""}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Cidade"
                        className="col-span-2 px-4 py-2.5 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:border-teal"
                      />
                      <select
                        value={formData.state || ""}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:border-teal"
                      >
                        <option value="">UF</option>
                        {BRAZILIAN_STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Destination wedding */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        onChange={() => setFormData({ ...formData, })}
                      />
                      <span className="font-body text-sm text-verde-noite">Destination wedding?</span>
                    </label>
                  </div>
                )}

                {/* STEP 3: BUDGET */}
                {coupleStep === "budget" && (
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h1 className="font-heading text-2xl text-verde-noite">Orçamento</h1>
                      <p className="font-body text-verde-noite/60 text-sm">A primeira decisão que importa</p>
                    </div>

                    <p className="font-body text-sm text-verde-noite/70 leading-relaxed">
                      Saber o orçamento estimado ajuda a filtrar fornecedores e evitar surpresas.
                    </p>

                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          if (weddingId) {
                            router.push(`/casamento/${weddingId}/orcamento-inteligente`);
                          }
                        }}
                        className="w-full p-4 rounded-xl border-2 border-teal hover:bg-teal/5 transition text-left"
                      >
                        <div className="font-body font-medium text-teal text-sm">🎯 Simulador Inteligente</div>
                        <p className="font-body text-xs text-verde-noite/60 mt-1">Deixe a IA calcular seu orçamento</p>
                      </button>

                      <div className="relative">
                        <span className="absolute left-4 top-3 font-body text-sm text-verde-noite/60">R$</span>
                        <input
                          type="number"
                          value={formData.estimatedBudget || ""}
                          onChange={(e) => setFormData({ ...formData, estimatedBudget: parseInt(e.target.value) || undefined })}
                          placeholder="Tenho um valor em mente"
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:border-teal transition"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-copper/10 border border-copper/20 rounded-xl">
                      <p className="font-body text-xs text-copper leading-relaxed">
                        💡 Casamentos no Brasil custam em média R$ 60.000 — mas cada casal é único.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 4: GUESTS */}
                {coupleStep === "guests" && (
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h1 className="font-heading text-2xl text-verde-noite">Seus convidados</h1>
                      <p className="font-body text-verde-noite/60 text-sm">O coração do casamento</p>
                    </div>

                    {/* DDD explanation with visual */}
                    <div className="p-4 bg-teal/5 border border-teal/20 rounded-xl space-y-2">
                      <p className="font-body text-sm text-verde-noite font-medium">Como o Laço ajuda com presença</p>
                      <p className="font-body text-xs text-verde-noite/70">
                        O Laço lê o DDD de cada convidado para entender de onde vêm e estimar realistically a presença.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          if (weddingId) {
                            router.push(`/casamento/${weddingId}/importar`);
                          }
                        }}
                        className="w-full p-4 rounded-xl bg-teal text-white hover:bg-teal/90 transition text-left"
                      >
                        <div className="font-body font-medium text-sm">📱 Importar da agenda</div>
                        <p className="font-body text-xs text-white/80 mt-1">Sincronize seus contatos</p>
                      </button>

                      <button
                        onClick={handleCoupleNext}
                        className="w-full p-4 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition text-left"
                      >
                        <div className="font-body font-medium text-verde-noite text-sm">✍️ Vou adicionar depois</div>
                        <p className="font-body text-xs text-verde-noite/60 mt-1">Continue para a celebração</p>
                      </button>
                    </div>

                    {formData.estimatedGuests && (
                      <p className="font-body text-xs text-verde-noite/60 text-center">
                        Com {formData.estimatedGuests} convidados, estimamos ~78% de presença
                      </p>
                    )}
                  </div>
                )}

                {/* STEP 5: CELEBRATE */}
                {coupleStep === "celebrate" && (
                  <div className="space-y-6">
                    <Confetti />

                    <div className="text-center space-y-2">
                      <div className="text-6xl mb-4">🎉</div>
                      <h1 className="font-heading text-3xl text-verde-noite">Pronto!</h1>
                      <p className="font-body text-verde-noite/60">
                        O casamento de <span className="font-medium text-verde-noite">{formData.partnerName1} & {formData.partnerName2}</span> está criado
                      </p>
                    </div>

                    {/* Three CTAs */}
                    <div className="space-y-3">
                      {weddingId && (
                        <>
                          <Link
                            href={`/casamento/${weddingId}/orcamento-inteligente`}
                            className="block p-4 rounded-xl bg-copper/10 border border-copper/20 hover:bg-copper/20 transition text-left"
                          >
                            <div className="font-body font-medium text-copper text-sm">💰 Orçamento Inteligente</div>
                            <p className="font-body text-xs text-verde-noite/60 mt-1">Calcule com precisão</p>
                          </Link>

                          <Link
                            href={`/casamento/${weddingId}/convidados`}
                            className="block p-4 rounded-xl bg-teal/10 border border-teal/20 hover:bg-teal/20 transition text-left"
                          >
                            <div className="font-body font-medium text-teal text-sm">👥 Lista de Convidados</div>
                            <p className="font-body text-xs text-verde-noite/60 mt-1">Comece a montar</p>
                          </Link>

                          <Link
                            href={`/casamento/${weddingId}/identity-kit`}
                            className="block p-4 rounded-xl bg-verde-noite/10 border border-verde-noite/20 hover:bg-verde-noite/20 transition text-left"
                          >
                            <div className="font-body font-medium text-verde-noite text-sm">✨ Identidade Visual</div>
                            <p className="font-body text-xs text-verde-noite/60 mt-1">Gerada com IA</p>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Action buttons */}
            <div className="px-8 pb-8 flex items-center gap-3">
              {currentIndex > 0 && coupleStep !== "celebrate" && (
                <button
                  onClick={handleCoupleBack}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-body text-sm text-verde-noite/60 hover:bg-gray-50 transition"
                >
                  ← Voltar
                </button>
              )}

              {isLast ? (
                <button
                  onClick={handleCoupleComplete}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-copper text-white font-body font-medium hover:bg-copper/90 transition disabled:opacity-50"
                >
                  {saving ? "Salvando…" : "Ir para o Dashboard →"}
                </button>
              ) : (
                <button
                  onClick={handleCoupleNext}
                  disabled={saving || (coupleStep === "about" && (!formData.partnerName1 || !formData.partnerName2))}
                  className="flex-1 py-3 rounded-xl bg-teal text-white font-body font-medium hover:bg-teal/90 transition disabled:opacity-50"
                >
                  {saving ? "Salvando…" : "Próximo →"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // RENDER PLANNER FLOW
  // ──────────────────────────────────────────────────────────────────────────────

  const isLastPlanner = plannerStep === totalSteps - 1;
  const plannerStepData = PLANNER_STEPS[plannerStep];

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
      {/* Skip button */}
      <div className="w-full max-w-lg mb-4 flex justify-end">
        <button
          onClick={() => {
            saveStep(-1).then(() => router.push("/cerimonialista/dashboard"));
          }}
          className="font-body text-sm text-verde-noite/40 hover:text-verde-noite transition"
        >
          Pular introdução →
        </button>
      </div>

      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {PLANNER_STEPS.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i <= plannerStep ? "#2C6B5E" : "#E5E7EB",
              }}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="p-8">
            {/* Icon */}
            <div className="w-16 h-16 bg-cream rounded-2xl flex items-center justify-center text-4xl mb-6">
              {plannerStepData.icon}
            </div>

            {/* Step badge */}
            <span className="inline-block px-2.5 py-1 bg-teal/10 text-teal font-body text-xs rounded-full mb-3">
              Passo {plannerStep + 1} de {totalSteps}
            </span>

            <h1 className="font-heading text-2xl text-verde-noite mb-2">{plannerStepData.title}</h1>
            <p className="font-body text-verde-noite/60 text-sm mb-4">{plannerStepData.subtitle}</p>
            <p className="font-body text-verde-noite/80 leading-relaxed">{plannerStepData.description}</p>

            {/* Social proof */}
            {plannerStep === 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-copper/5 rounded-xl border border-copper/10">
                  <span className="text-xl flex-shrink-0">⭐</span>
                  <p className="font-body text-xs text-verde-noite/70">
                    <span className="font-semibold text-verde-noite">Cerimonialistas em SP, RJ e MG</span> já usam o Laço
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: "🗂️", label: "Pipeline de vendas", tag: "CRM" },
                    { icon: "🤖", label: "OCR de orçamentos", tag: "IA" },
                    { icon: "💰", label: "Controle financeiro", tag: "comissões" },
                    { icon: "📅", label: "Agenda integrada", tag: "Google Cal" },
                  ].map((feature) => (
                    <div key={feature.label} className="flex items-start gap-2 p-2.5 bg-cream rounded-xl">
                      <span className="text-base mt-0.5">{feature.icon}</span>
                      <div>
                        <p className="font-body text-xs font-medium text-verde-noite leading-tight">{feature.label}</p>
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-copper/10 text-copper font-body text-[9px] font-semibold rounded-full uppercase tracking-wide">
                          {feature.tag}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-8 pb-8 flex items-center gap-3">
            {plannerStep > 0 && (
              <button
                onClick={handlePlannerBack}
                className="px-4 py-2.5 rounded-xl border border-gray-200 font-body text-sm text-verde-noite/60 hover:bg-gray-50 transition"
              >
                ← Voltar
              </button>
            )}

            {isLastPlanner ? (
              <button
                onClick={handlePlannerComplete}
                disabled={plannerSaving}
                className="flex-1 py-3 rounded-xl bg-copper text-white font-body font-medium hover:bg-copper/90 transition disabled:opacity-50"
              >
                {plannerSaving ? "Salvando…" : "Abrir meu painel →"}
              </button>
            ) : "href" in plannerStepData && plannerStepData.href ? (
              <div className="flex-1 flex gap-2">
                <Link
                  href={plannerStepData.href}
                  className="flex-1 py-3 rounded-xl bg-teal text-white font-body text-sm text-center hover:bg-teal/90 transition"
                  onClick={() => saveStep(plannerStep + 1)}
                >
                  {plannerStepData.action}
                </Link>
                <button
                  onClick={handlePlannerNext}
                  disabled={plannerSaving}
                  className="px-4 py-3 rounded-xl border border-gray-200 font-body text-sm text-verde-noite/60 hover:bg-gray-50 transition"
                >
                  Próximo →
                </button>
              </div>
            ) : (
              <button
                onClick={handlePlannerNext}
                disabled={plannerSaving}
                className="flex-1 py-3 rounded-xl bg-teal text-white font-body font-medium hover:bg-teal/90 transition disabled:opacity-50"
              >
                {plannerSaving ? "Salvando…" : "Próximo →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
