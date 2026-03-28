"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { Celebration } from "@/components/illustrations";

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
    title: "Tudo em um lugar para o dia mais especial",
    subtitle: "Mais de 2.400 casais já usam o Laço — gratuito pra começar.",
    icon: "💍",
    description:
      "Site personalizado, lista de convidados com RSVP online, presente virtual, simulador de presença e orçamento inteligente. Do planejamento até o grande dia.",
    action: "Configurar meu casamento",
  },
  {
    title: "Quando é o grande dia?",
    subtitle: "Só leva 1 minuto — você edita tudo depois.",
    icon: "📅",
    description: "Com a data definida, o Laço mostra a contagem regressiva e avisa quando é hora de agir em cada etapa.",
    action: "Criar meu casamento",
    href: "/casamento/novo",
  },
  {
    title: "Sua cerimonialista já usa o Laço?",
    subtitle: "Conecte agora e ela vê tudo em tempo real.",
    icon: "🤝",
    description:
      "Informe o e-mail da cerimonialista e ela ganha acesso imediato ao seu casamento no painel dela — orçamentos, convidados e cronograma sincronizados.",
    action: "Continuar",
    tip: "Ainda escolhendo? Você conecta depois. A maioria dos casais faz isso na semana do primeiro encontro com a cerimonialista.",
  },
  {
    title: "Quem vai celebrar com vocês?",
    subtitle: "Importe a lista em segundos — confirme presença pelo WhatsApp.",
    icon: "👥",
    description:
      "Cole uma lista, importe CSV ou adicione um a um. Cada convidado ganha um link de RSVP e você vê as confirmações em tempo real.",
    action: "Importar convidados",
    href: "/casamento/novo",
    tip: "💡 Use o simulador de presença para descobrir o número real esperado — a média é 78% de comparecimento.",
  },
  {
    title: "Seu site de casamento está no ar! 🎉",
    subtitle: "Pronto para compartilhar com quem você ama.",
    icon: "🌐",
    description:
      "O Laço criou sua página personalizada com URL única. Compartilhe no grupo da família, no WhatsApp e no Instagram para colher as confirmações.",
    action: "Ver meu site agora",
  },
];

// ─── Planner steps ─────────────────────────────────────────────────────────────
const PLANNER_STEPS: OnboardingStep[] = [
  {
    title: "Menos planilha. Mais casamento.",
    subtitle: "Cerimonialistas que usam o Laço economizam 4h por evento.",
    icon: "📋",
    description:
      "Pipeline de vendas, OCR de orçamentos com IA, controle de comissões, agenda e portal do cliente — tudo integrado. Vamos configurar seu perfil em 2 minutos.",
    action: "Configurar meu perfil",
  },
  {
    title: "Seus clientes vão te encontrar aqui",
    subtitle: "Perfil público + portfólio para novos noivos.",
    icon: "🏢",
    description:
      "Noivos que usam o Laço podem buscar e contratar cerimonialistas direto pelo app. Preencha seus dados para aparecer para os casais certos.",
    action: "Criar meu perfil agora",
    href: "/cerimonialista/portfolio",
  },
  {
    title: "Adeus digitação de orçamento",
    subtitle: "Foto → itens organizados em 15 segundos.",
    icon: "🤖",
    description:
      "Tire uma foto ou envie o PDF de qualquer orçamento. A IA do Laço lê, categoriza e organiza tudo automaticamente. Nada de redigitar.",
    action: "Testar o OCR agora",
    href: "/cerimonialista/importar-orcamento",
  },
  {
    title: "Pronto para o próximo casamento! 🎊",
    subtitle: "Seu escritório digital está configurado.",
    icon: "✅",
    description:
      "Pipeline para fechar novos clientes, agenda com todos os eventos, financeiro com controle de comissões — tudo que você precisa para crescer sem virar escravo de planilha.",
    action: "Abrir meu painel",
    href: "/cerimonialista/dashboard",
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

// Index of the planner step in COUPLE_STEPS
const PLANNER_STEP_INDEX = 2;

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);

  // Planner linking state
  const [plannerEmail, setPlannerEmail] = useState("");
  const [plannerLinking, setPlannerLinking] = useState(false);
  const [plannerResult, setPlannerResult] = useState<{
    linked: boolean; reason?: string; planner?: { companyName: string };
  } | null>(null);

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

  async function linkPlanner() {
    if (!plannerEmail.trim()) return;
    setPlannerLinking(true);
    try {
      const res = await fetch("/api/user/link-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plannerEmail }),
      });
      const data = await res.json();
      if (data.linked) track("planner_linked", { plannerCompany: data.planner?.companyName });
      setPlannerResult(data);
    } catch {
      setPlannerResult({ linked: false, reason: "error" });
    } finally {
      setPlannerLinking(false);
    }
  }

  async function handleNext() {
    if (currentStep < totalSteps - 1) {
      setSaving(true);
      await saveStep(currentStep + 1);
      setSaving(false);
      setDirection(1);
      setCurrentStep((s) => s + 1);
      // Reset planner state when leaving planner step
      if (role === "COUPLE" && currentStep === PLANNER_STEP_INDEX) {
        setPlannerEmail("");
        setPlannerResult(null);
      }
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
              {isLast ? (
                <Celebration className="mb-4 -mx-2" />
              ) : (
                <div className="w-16 h-16 bg-cream rounded-2xl flex items-center justify-center text-4xl mb-6">
                  {step.icon}
                </div>
              )}

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

              {/* Social proof + features */}
              {currentStep === 0 && role === "COUPLE" && (
                <div className="mt-6 space-y-4">
                  {/* Social proof */}
                  <div className="flex items-center gap-3 p-3 bg-teal/5 rounded-xl border border-teal/10">
                    <div className="flex -space-x-2 flex-shrink-0">
                      {["A", "B", "C"].map((l) => (
                        <div key={l} className="w-7 h-7 rounded-full bg-teal/20 border-2 border-white flex items-center justify-center">
                          <span className="font-body text-[9px] font-semibold text-teal">{l}</span>
                        </div>
                      ))}
                    </div>
                    <p className="font-body text-xs text-verde-noite/70">
                      <span className="font-semibold text-verde-noite">+2.400 casais</span> planejando seu casamento aqui
                    </p>
                  </div>
                  {/* Features */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: "📋", label: "Lista de convidados", tag: "RSVP online" },
                      { icon: "🎁", label: "Lista de presentes", tag: "sem taxa" },
                      { icon: "📊", label: "Simulador de presença", tag: "novo" },
                      { icon: "🌐", label: "Site do casamento", tag: "grátis" },
                    ].map((feature) => (
                      <div key={feature.label} className="flex items-start gap-2 p-2.5 bg-cream rounded-xl">
                        <span className="text-base mt-0.5">{feature.icon}</span>
                        <div>
                          <p className="font-body text-xs font-medium text-verde-noite leading-tight">{feature.label}</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-teal/10 text-teal font-body text-[9px] font-semibold rounded-full uppercase tracking-wide">{feature.tag}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Planner linking UI */}
              {role === "COUPLE" && currentStep === PLANNER_STEP_INDEX && (
                <div className="mt-5 space-y-3">
                  {plannerResult?.linked ? (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                      <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-body text-sm font-semibold text-green-800">
                          {plannerResult.planner?.companyName} conectada!
                        </p>
                        <p className="font-body text-xs text-green-600">Ela já tem acesso ao seu casamento.</p>
                      </div>
                    </div>
                  ) : plannerResult?.reason === "not_found" ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                      <p className="font-body text-sm font-semibold text-amber-800">Cerimonialista ainda não tem conta no Laço</p>
                      <p className="font-body text-xs text-amber-700">
                        Você pode compartilhar o link abaixo com ela para que ela se cadastre. A conexão será feita automaticamente depois.
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/registro/cerimonialista`);
                        }}
                        className="flex items-center gap-1.5 text-xs font-body text-amber-700 hover:text-amber-900 transition"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copiar link de cadastro
                      </button>
                    </div>
                  ) : plannerResult?.reason === "no_wedding" ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                      <p className="font-body text-sm text-blue-700">
                        Crie seu casamento primeiro (passo anterior) para poder conectar a cerimonialista.
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={plannerEmail}
                        onChange={e => setPlannerEmail(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && linkPlanner()}
                        placeholder="email da cerimonialista"
                        className="flex-1 px-3 py-2.5 text-sm font-body border border-gray-200 rounded-xl focus:outline-none focus:border-teal"
                      />
                      <button
                        onClick={linkPlanner}
                        disabled={plannerLinking || !plannerEmail.trim()}
                        className="px-4 py-2.5 bg-teal text-white font-body text-sm rounded-xl hover:bg-teal/90 disabled:opacity-50 transition flex-shrink-0"
                      >
                        {plannerLinking ? "..." : "Conectar"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 0 && role === "PLANNER" && (
                <div className="mt-6 space-y-4">
                  {/* Social proof */}
                  <div className="flex items-center gap-3 p-3 bg-copper/5 rounded-xl border border-copper/10">
                    <span className="text-xl flex-shrink-0">⭐</span>
                    <p className="font-body text-xs text-verde-noite/70">
                      <span className="font-semibold text-verde-noite">Cerimonialistas em SP, RJ e MG</span> já usam o Laço para fechar mais casamentos
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
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-copper/10 text-copper font-body text-[9px] font-semibold rounded-full uppercase tracking-wide">{feature.tag}</span>
                        </div>
                      </div>
                    ))}
                  </div>
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
