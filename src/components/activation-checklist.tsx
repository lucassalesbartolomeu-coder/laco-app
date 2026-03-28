"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "laco_onboarding";

interface ChecklistStep {
  id: string;
  label: string;
  description: string;
  href: string | null;
  actionLabel: string;
  icon: React.ReactNode;
}

interface StepState {
  [id: string]: boolean;
}

function buildSteps(weddingId: string | null): ChecklistStep[] {
  return [
    {
      id: "criar_casamento",
      label: "Criar casamento",
      description: "Configure os detalhes do seu casamento",
      href: weddingId ? null : "/casamento/novo",
      actionLabel: weddingId ? "Concluído" : "Criar agora",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      id: "adicionar_convidados",
      label: "Adicionar convidados",
      description: "Insira a lista de convidados do seu casamento",
      href: weddingId ? `/casamento/${weddingId}/convidados` : "/casamento/novo",
      actionLabel: "Adicionar",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: "gerar_identity_kit",
      label: "Gerar Identity Kit",
      description: "Crie a identidade visual do seu casamento",
      href: weddingId ? `/casamento/${weddingId}/identity-kit` : "/casamento/novo",
      actionLabel: "Gerar",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
    {
      id: "compartilhar_link",
      label: "Compartilhar link de confirmação",
      description: "Envie o link de RSVP para seus convidados",
      href: weddingId ? `/casamento/${weddingId}/confirmacoes` : "/casamento/novo",
      actionLabel: "Ver link",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
    },
    {
      id: "convidar_parceiro",
      label: "Convidar parceiro(a)",
      description: "Dê acesso ao painel para seu parceiro(a)",
      href: null,
      actionLabel: "Convidar",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
  ];
}

interface ActivationChecklistProps {
  weddingId: string | null;
  hasGuests: boolean;
  hasIdentityKit: boolean;
  hasPartner: boolean;
}

export default function ActivationChecklist({
  weddingId,
  hasGuests,
  hasIdentityKit,
  hasPartner,
}: ActivationChecklistProps) {
  const [stepState, setStepState] = useState<StepState>({});
  const [dismissed, setDismissed] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { steps?: StepState; dismissed?: boolean };
        if (parsed.steps) setStepState(parsed.steps);
        if (parsed.dismissed) setDismissed(parsed.dismissed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync real state into the step state
  useEffect(() => {
    setStepState((prev) => {
      const next: StepState = {
        ...prev,
        criar_casamento: !!weddingId,
        adicionar_convidados: hasGuests,
        gerar_identity_kit: hasIdentityKit,
        convidar_parceiro: hasPartner,
      };
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const existing = raw ? (JSON.parse(raw) as { steps?: StepState; dismissed?: boolean }) : {};
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, steps: next }));
      } catch {
        // ignore
      }
      return next;
    });
  }, [weddingId, hasGuests, hasIdentityKit, hasPartner]);

  function markStep(id: string) {
    setStepState((prev) => {
      const next = { ...prev, [id]: true };
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const existing = raw ? (JSON.parse(raw) as { steps?: StepState; dismissed?: boolean }) : {};
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, steps: next }));
      } catch {
        // ignore
      }
      return next;
    });
  }

  function dismiss() {
    setDismissed(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing = raw ? (JSON.parse(raw) as { steps?: StepState; dismissed?: boolean }) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, dismissed: true }));
    } catch {
      // ignore
    }
  }

  const steps = buildSteps(weddingId);
  const completedCount = steps.filter((s) => !!stepState[s.id]).length;
  const pct = Math.round((completedCount / steps.length) * 100);

  // Hide once fully complete or dismissed
  if (dismissed || pct === 100) return null;

  const nextStepIndex = steps.findIndex((s) => !stepState[s.id]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* top accent */}
      <div className="h-1 bg-gradient-to-r from-teal via-copper to-teal/40" />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-heading text-sm font-semibold text-verde-noite">
              Configure seu casamento
            </h3>
            <p className="font-body text-xs text-verde-noite/50 mt-0.5">
              {completedCount} de {steps.length} etapas concluídas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-heading text-lg font-bold text-teal">{pct}%</span>
            <button
              onClick={dismiss}
              className="w-6 h-6 flex items-center justify-center rounded-full text-verde-noite/30 hover:text-verde-noite/60 hover:bg-gray-100 transition"
              title="Dispensar"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal to-copper rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {steps.map((step, idx) => {
            const done = !!stepState[step.id];
            const isNext = idx === nextStepIndex;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                  done
                    ? "bg-gray-50 opacity-60"
                    : isNext
                    ? "bg-teal/5 border border-teal/20"
                    : "bg-transparent"
                }`}
              >
                {/* Status icon */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    done
                      ? "bg-teal text-white"
                      : isNext
                      ? "bg-copper/10 text-copper"
                      : "bg-gray-100 text-verde-noite/30"
                  }`}
                >
                  {done ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-body text-xs font-medium leading-tight ${
                      done ? "text-verde-noite/40 line-through" : "text-verde-noite"
                    }`}
                  >
                    {step.label}
                  </p>
                  {!done && (
                    <p className="font-body text-[10px] text-verde-noite/40 mt-0.5 leading-tight">
                      {step.description}
                    </p>
                  )}
                </div>

                {/* Action */}
                {!done && (
                  <div className="flex-shrink-0">
                    {step.href ? (
                      <Link
                        href={step.href}
                        onClick={() => markStep(step.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-body font-medium transition ${
                          isNext
                            ? "bg-copper text-white hover:bg-copper/90"
                            : "text-verde-noite/40 hover:text-teal"
                        }`}
                      >
                        {isNext ? step.actionLabel : "→"}
                      </Link>
                    ) : (
                      <button
                        onClick={() => markStep(step.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-body font-medium transition ${
                          isNext
                            ? "bg-copper text-white hover:bg-copper/90"
                            : "text-verde-noite/40 hover:text-teal"
                        }`}
                      >
                        {isNext ? step.actionLabel : "→"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
