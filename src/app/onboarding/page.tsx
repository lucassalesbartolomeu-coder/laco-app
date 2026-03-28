"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface OnboardingStep {
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  action: string;
  href?: string;
  tip?: string;
}

// ─── Couple steps ─────────────────────────────────────────────────────────────
const COUPLE_STEPS: OnboardingStep[] = [
  {
    title: "Bem-vindos ao Laço!",
    subtitle: "Vamos configurar o seu casamento em poucos minutos.",
    icon: "💍",
    description:
      "O Laço cuida de tudo: site do casamento, lista de convidados, presentes, orçamentos e muito mais.",
    action: "Começar",
  },
  {
    title: "Crie seu casamento",
    subtitle: "Adicione os dados básicos do grande dia.",
    icon: "📅",
    description: "Você pode editar essas informações a qualquer momento no seu painel.",
    action: "Ir para Novo Casamento",
    href: "/casamento/novo",
  },
  {
    title: "Adicione seus convidados",
    subtitle: "Importe sua lista de convidados facilmente.",
    icon: "👥",
    description:
      "Importe por CSV, adicione manualmente ou integre com sua agenda. Depois envie convites e acompanhe as confirmações.",
    action: "Ver como importar",
    href: "/casamento/novo",
    tip: "Dica: use o simulador de presença para estimar quantos convidados vão comparecer!",
  },
  {
    title: "Seu site está pronto!",
    subtitle: "Compartilhe com seus convidados.",
    icon: "🌐",
    description:
      "O Laço gerou automaticamente uma página personalizada para o seu casamento. Compartilhe o link com seus convidados para que possam confirmar presença e enviar presentes.",
    action: "Ver meu site",
  },
];

// ─── Planner steps ─────────────────────────────────────────────────────────────
const PLANNER_STEPS: OnboardingStep[] = [
  {
    title: "Bem-vindo ao Laço Cerimonialista!",
    subtitle: "Sua central de gestão de casamentos.",
    icon: "📋",
    description:
      "Gerencie múltiplos casamentos, fornecedores, orçamentos e clientes em um único lugar. Vamos configurar seu perfil.",
    action: "Começar",
  },
  {
    title: "Configure seu escritório",
    subtitle: "Dados do seu negócio.",
    icon: "🏢",
    description:
      "Preencha os dados da sua empresa para que os noivos possam encontrar você e para personalizar seus relatórios.",
    action: "Configurar perfil",
    href: "/cerimonialista/portfolio",
  },
  {
    title: "Importe seu primeiro orçamento",
    subtitle: "Veja a mágica do OCR em ação.",
    icon: "🤖",
    description:
      "Tire uma foto ou envie o PDF de um orçamento de fornecedor. A AI do Laço extrai todos os itens automaticamente — sem digitação.",
    action: "Importar orçamento",
    href: "/cerimonialista/importar-orcamento",
  },
  {
    title: "Seu pipeline está pronto!",
    subtitle: "Gerencie todos os seus casamentos.",
    icon: "✅",
    description:
      "Use o pipeline para acompanhar o funil de vendas, a agenda para visualizar todos os eventos e o financeiro para controlar comissões.",
    action: "Ir para o dashboard",
    href: "/cerimonialista/dashboard",
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);

  const role = (session?.user as { role?: string })?.role ?? "COUPLE";
  const steps = role === "PLANNER" ? PLANNER_STEPS : COUPLE_STEPS;
  const totalSteps = steps.length;
  const step = steps[currentStep];

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    // Load saved progress
    fetch("/api/user/onboarding")
      .then((r) => r.json())
      .then((data) => {
        if (data.onboardingStep === -1) {
          // Already completed
          router.push(role === "PLANNER" ? "/cerimonialista/dashboard" : "/dashboard");
        } else if (data.onboardingStep > 0) {
          setCurrentStep(Math.min(data.onboardingStep, totalSteps - 1));
        }
      })
      .catch(console.error);
  }, [status, role, router, totalSteps]);

  async function saveStep(step: number) {
    await fetch("/api/user/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step }),
    });
  }

  async function handleNext() {
    if (currentStep < totalSteps - 1) {
      setSaving(true);
      await saveStep(currentStep + 1);
      setSaving(false);
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  }

  async function handleBack() {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }

  async function handleComplete() {
    setSaving(true);
    await saveStep(-1); // -1 = concluído
    setSaving(false);
    router.push(role === "PLANNER" ? "/cerimonialista/dashboard" : "/dashboard");
  }

  async function handleSkip() {
    setSaving(true);
    await saveStep(-1);
    setSaving(false);
    router.push(role === "PLANNER" ? "/cerimonialista/dashboard" : "/dashboard");
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isLast = currentStep === totalSteps - 1;

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
      {/* Skip */}
      <div className="w-full max-w-lg mb-4 flex justify-end">
        <button
          onClick={handleSkip}
          className="font-body text-sm text-verde-noite/40 hover:text-verde-noite transition"
        >
          Pular introdução →
        </button>
      </div>

      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i <= currentStep ? "#2C6B5E" : "#E5E7EB",
              }}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="p-8"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-cream rounded-2xl flex items-center justify-center text-4xl mb-6">
                {step.icon}
              </div>

              {/* Step badge */}
              <span className="inline-block px-2.5 py-1 bg-teal/10 text-teal font-body text-xs rounded-full mb-3">
                Passo {currentStep + 1} de {totalSteps}
              </span>

              <h1 className="font-heading text-2xl text-verde-noite mb-2">{step.title}</h1>
              <p className="font-body text-verde-noite/60 text-sm mb-4">{step.subtitle}</p>
              <p className="font-body text-verde-noite/80 leading-relaxed">{step.description}</p>

              {/* Tip callout */}
              {"tip" in step && step.tip && (
                <div className="mt-4 p-3 bg-copper/10 border border-copper/20 rounded-xl">
                  <p className="font-body text-sm text-copper">{step.tip as string}</p>
                </div>
              )}

              {/* Spotlight links */}
              {currentStep === 0 && role === "COUPLE" && (
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    { icon: "📋", label: "Lista de convidados" },
                    { icon: "🎁", label: "Lista de presentes" },
                    { icon: "📊", label: "Simulador de presença" },
                    { icon: "🌐", label: "Site do casamento" },
                  ].map((feature) => (
                    <div key={feature.label} className="flex items-center gap-2 p-2 bg-cream rounded-lg">
                      <span className="text-lg">{feature.icon}</span>
                      <span className="font-body text-xs text-verde-noite/70">{feature.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {currentStep === 0 && role === "PLANNER" && (
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    { icon: "🗂️", label: "Pipeline de vendas" },
                    { icon: "🤖", label: "OCR de orçamentos" },
                    { icon: "💰", label: "Controle financeiro" },
                    { icon: "📅", label: "Agenda integrada" },
                  ].map((feature) => (
                    <div key={feature.label} className="flex items-center gap-2 p-2 bg-cream rounded-lg">
                      <span className="text-lg">{feature.icon}</span>
                      <span className="font-body text-xs text-verde-noite/70">{feature.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="px-8 pb-8 flex items-center gap-3">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl border border-gray-200 font-body text-sm text-verde-noite/60 hover:bg-gray-50 transition"
              >
                ← Voltar
              </button>
            )}

            {isLast ? (
              <button
                onClick={handleComplete}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-copper text-white font-body font-medium hover:bg-copper/90 transition disabled:opacity-50"
              >
                {saving ? "Salvando…" : `Ir para o ${role === "PLANNER" ? "Dashboard" : "Painel"} →`}
              </button>
            ) : "href" in step && step.href ? (
              <div className="flex-1 flex gap-2">
                <Link
                  href={step.href as string}
                  className="flex-1 py-3 rounded-xl bg-teal text-white font-body text-sm text-center hover:bg-teal/90 transition"
                  onClick={() => saveStep(currentStep + 1)}
                >
                  {step.action}
                </Link>
                <button
                  onClick={handleNext}
                  disabled={saving}
                  className="px-4 py-3 rounded-xl border border-gray-200 font-body text-sm text-verde-noite/60 hover:bg-gray-50 transition"
                >
                  Próximo →
                </button>
              </div>
            ) : (
              <button
                onClick={handleNext}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-teal text-white font-body font-medium hover:bg-teal/90 transition disabled:opacity-50"
              >
                {saving ? "Salvando…" : `${step.action} →`}
              </button>
            )}
          </div>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-6">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > currentStep ? 1 : -1); setCurrentStep(i); }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentStep ? "w-6 bg-teal" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <p className="text-center font-body text-xs text-verde-noite/30 mt-4">
          Você pode completar a configuração depois no painel
        </p>
      </div>
    </div>
  );
}
