"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const STYLES = [
  { id: "rustico", label: "Rústico", icon: "🌿" },
  { id: "classico", label: "Clássico", icon: "🏛️" },
  { id: "moderno", label: "Moderno", icon: "✨" },
  { id: "praiano", label: "Praiano", icon: "🏖️" },
  { id: "minimalista", label: "Minimalista", icon: "◻️" },
  { id: "boho", label: "Boho", icon: "🌸" },
];

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {[1, 2, 3].map((step, i) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-body font-semibold transition-all duration-300 ${
              step < currentStep
                ? "bg-copper text-white"
                : step === currentStep
                ? "bg-teal text-white"
                : "border-2 border-gray-300 text-gray-400"
            }`}
          >
            {step < currentStep ? "✓" : step}
          </div>
          {i < 2 && (
            <div
              className={`w-12 sm:w-20 h-0.5 transition-all duration-300 ${
                step < currentStep ? "bg-copper" : "bg-gray-300"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function FloatingInput({
  id,
  label,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="relative w-full">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer w-full px-4 pt-6 pb-2 border border-gray-300 rounded-xl font-body text-verde-noite bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all duration-200"
      />
      <label
        htmlFor={id}
        className="absolute left-4 top-4 text-gray-400 font-body text-sm transition-all duration-200 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-teal peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs"
      >
        {label}
      </label>
    </div>
  );
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function NovoCasamentoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1
  const [partnerName1, setPartnerName1] = useState("");
  const [partnerName2, setPartnerName2] = useState("");

  // Step 2
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [style, setStyle] = useState("");

  // Step 3
  const [weddingDate, setWeddingDate] = useState("");
  const [estimatedGuests, setEstimatedGuests] = useState(150);
  const [estimatedBudget, setEstimatedBudget] = useState(100000);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  function goNext() {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/weddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerName1,
          partnerName2,
          venue,
          city,
          state,
          style,
          weddingDate,
          estimatedGuests,
          estimatedBudget,
        }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        console.error("Erro ao criar casamento");
        setSubmitting(false);
      }
    } catch {
      console.error("Erro de rede");
      setSubmitting(false);
    }
  }

  const isStep1Valid = partnerName1.trim() !== "" && partnerName2.trim() !== "";
  const isStep2Valid = city.trim() !== "" && state !== "" && style !== "";
  const isStep3Valid = weddingDate !== "";

  return (
    <div className="min-h-screen bg-off-white py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-heading text-3xl sm:text-4xl text-verde-noite text-center mb-2">
          Novo Casamento
        </h1>
        <p className="font-body text-gray-500 text-center mb-8">
          {step === 1
            ? "Conte-nos sobre o casal"
            : step === 2
            ? "Detalhes da celebração"
            : "Quase lá! Últimos detalhes"}
        </p>

        <StepIndicator currentStep={step} />

        <div className="bg-white shadow-md rounded-2xl p-6 sm:p-10 overflow-hidden relative min-h-[360px]">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <h2 className="font-heading text-2xl text-verde-noite mb-6">
                  O Casal
                </h2>
                <div className="space-y-5">
                  <FloatingInput
                    id="partnerName1"
                    label="Nome do(a) primeiro(a) parceiro(a)"
                    value={partnerName1}
                    onChange={setPartnerName1}
                  />
                  <FloatingInput
                    id="partnerName2"
                    label="Nome do(a) segundo(a) parceiro(a)"
                    value={partnerName2}
                    onChange={setPartnerName2}
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <h2 className="font-heading text-2xl text-verde-noite mb-6">
                  O Casamento
                </h2>
                <div className="space-y-5">
                  <FloatingInput
                    id="venue"
                    label="Local / Espaço (opcional)"
                    value={venue}
                    onChange={setVenue}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatingInput
                      id="city"
                      label="Cidade"
                      value={city}
                      onChange={setCity}
                    />
                    <div className="relative w-full">
                      <select
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className={`w-full px-4 pt-6 pb-2 border border-gray-300 rounded-xl font-body bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all duration-200 appearance-none ${
                          state ? "text-verde-noite" : "text-transparent"
                        }`}
                      >
                        <option value="" disabled />
                        {BRAZILIAN_STATES.map((uf) => (
                          <option key={uf} value={uf} className="text-verde-noite">
                            {uf}
                          </option>
                        ))}
                      </select>
                      <label
                        htmlFor="state"
                        className={`absolute left-4 pointer-events-none font-body transition-all duration-200 ${
                          state
                            ? "top-1.5 text-xs text-teal"
                            : "top-4 text-base text-gray-400"
                        }`}
                      >
                        Estado
                      </label>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        ▾
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-body text-sm text-gray-500 mb-3">
                      Estilo do casamento
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {STYLES.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setStyle(s.id)}
                          className={`flex flex-col items-center justify-center gap-1 p-4 rounded-xl border-2 transition-all duration-200 font-body text-sm ${
                            style === s.id
                              ? "border-teal bg-teal/5 text-verde-noite"
                              : "border-gray-200 text-gray-500 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-2xl">{s.icon}</span>
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <h2 className="font-heading text-2xl text-verde-noite mb-6">
                  Detalhes
                </h2>
                <div className="space-y-6">
                  <div className="relative w-full">
                    <input
                      id="weddingDate"
                      type="date"
                      value={weddingDate}
                      onChange={(e) => setWeddingDate(e.target.value)}
                      className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-xl font-body text-verde-noite bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all duration-200"
                    />
                    <label
                      htmlFor="weddingDate"
                      className="absolute left-4 top-1.5 text-xs text-teal font-body pointer-events-none"
                    >
                      Data do casamento
                    </label>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-body text-sm text-gray-500">
                        Estimativa de convidados
                      </label>
                      <span className="font-body text-lg font-semibold text-verde-noite">
                        {estimatedGuests}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={500}
                      step={10}
                      value={estimatedGuests}
                      onChange={(e) =>
                        setEstimatedGuests(Number(e.target.value))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal"
                    />
                    <div className="flex justify-between font-body text-xs text-gray-400 mt-1">
                      <span>50</span>
                      <span>500</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-body text-sm text-gray-500">
                        Orçamento estimado
                      </label>
                      <span className="font-body text-lg font-semibold text-verde-noite">
                        {formatCurrency(estimatedBudget)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={30000}
                      max={500000}
                      step={5000}
                      value={estimatedBudget}
                      onChange={(e) =>
                        setEstimatedBudget(Number(e.target.value))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal"
                    />
                    <div className="flex justify-between font-body text-xs text-gray-400 mt-1">
                      <span>R$ 30.000</span>
                      <span>R$ 500.000</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="px-6 py-3 border-2 border-copper text-copper rounded-xl font-body font-medium hover:bg-copper/5 transition-all duration-200"
            >
              Voltar
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={
                (step === 1 && !isStep1Valid) ||
                (step === 2 && !isStep2Valid)
              }
              className="px-6 py-3 bg-copper text-white rounded-xl font-body font-medium hover:bg-copper/90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isStep3Valid || submitting}
              className="px-6 py-3 bg-copper text-white rounded-xl font-body font-medium hover:bg-copper/90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Criando..." : "Criar meu casamento"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
