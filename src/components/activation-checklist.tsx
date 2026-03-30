"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingStatus {
  hasWedding: boolean;
  guestCount: number;
  hasIdentityKit: boolean;
  hasSiteShared: boolean;
  hasPartner: boolean;
  completedSteps: number;
  weddingId: string | null;
}

interface ChecklistStep {
  id: string;
  label: string;
  description: string;
  href: string | null;
  done: boolean;
  comingSoon?: boolean;
  icon: React.ReactNode;
}

function buildSteps(status: OnboardingStatus): ChecklistStep[] {
  const id = status.weddingId;
  return [
    {
      id: "criar_casamento",
      label: "Criar casamento",
      description: "Configure as informações básicas do seu casamento.",
      href: "/casamento/novo",
      done: status.hasWedding,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      id: "adicionar_convidados",
      label: "Adicionar 10+ convidados",
      description: "Monte sua lista de convidados para começar a organização.",
      href: id ? `/casamento/${id}/convidados` : null,
      done: status.guestCount >= 10,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: "gerar_identity_kit",
      label: "Gerar Identity Kit",
      description: "Crie a identidade visual do seu casamento com IA.",
      href: id ? `/casamento/${id}/identity-kit` : null,
      done: status.hasIdentityKit,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
    {
      id: "compartilhar_site",
      label: "Compartilhar site",
      description: "Envie o link do seu site para os convidados.",
      href: id ? `/casamento/${id}/meu-site` : null,
      done: status.hasSiteShared,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
    },
    {
      id: "convidar_parceiro",
      label: "Convidar parceiro(a)",
      description: "Dê acesso ao seu parceiro(a) para gerenciar juntos.",
      href: null,
      done: status.hasPartner,
      comingSoon: true,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
  ];
}

export default function ActivationChecklist({ weddingId }: { weddingId: string | null }) {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/onboarding-status")
      .then((r) => r.json())
      .then((data: OnboardingStatus) => {
        setStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weddingId]);

  if (loading || !status) return null;
  if (status.completedSteps >= 5) return null;

  const steps = buildSteps(status);
  const progressPercent = Math.round((status.completedSteps / 5) * 100);
  const activeIndex = steps.findIndex((s) => !s.done);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {/* Accent top bar */}
        <div className="h-1 bg-gradient-to-r from-midnight via-gold to-midnight/40" />

        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-1">
            <p className="font-heading text-base font-semibold text-midnight">
              Configuração inicial
            </p>
            <span className="font-body text-xs text-midnight/40">
              {status.completedSteps}/5 concluídos
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-midnight to-gold rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            />
          </div>
        </div>

        {/* Steps */}
        <ul className="divide-y divide-gray-50 px-4 pb-4">
          {steps.map((step, idx) => {
            const isActive = idx === activeIndex;
            const isPending = !step.done && idx > activeIndex;

            return (
              <li key={step.id} className="py-2.5 first:pt-1">
                <div
                  className={`flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors ${
                    isActive ? "bg-midnight/5 border border-midnight/20" : ""
                  }`}
                >
                  {/* Status indicator */}
                  <div
                    className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${
                      step.done
                        ? "bg-midnight text-white"
                        : isActive
                        ? "bg-midnight/10 text-midnight ring-2 ring-midnight/30"
                        : "bg-gray-100 text-gray-300"
                    }`}
                  >
                    {step.done ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <motion.div
                        animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      >
                        {step.icon}
                      </motion.div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-body text-sm font-medium leading-tight ${
                        step.done
                          ? "text-midnight/40 line-through"
                          : isActive
                          ? "text-midnight"
                          : isPending
                          ? "text-midnight/50"
                          : "text-midnight"
                      }`}
                    >
                      {step.label}
                    </p>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="font-body text-xs text-midnight/50 mt-0.5 leading-snug"
                      >
                        {step.description}
                      </motion.p>
                    )}
                  </div>

                  {/* Action */}
                  {step.comingSoon && !step.done ? (
                    <span className="flex-shrink-0 text-[10px] font-body font-medium bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                      Em breve
                    </span>
                  ) : !step.done && step.href && isActive ? (
                    <Link
                      href={step.href}
                      className="flex-shrink-0 flex items-center gap-1 font-body text-xs font-medium text-midnight hover:text-midnight/80 transition-colors"
                    >
                      Ir agora
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </AnimatePresence>
  );
}
