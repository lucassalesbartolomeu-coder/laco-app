"use client";

import { useState } from "react";
import Link from "next/link";

type BillingCycle = "monthly" | "annual";

const PLANS = [
  {
    id: "gratuito",
    label: "Gratuito",
    priceMonthly: 0,
    priceAnnual: 0,
    priceSuffix: "para sempre",
    description: "Para quem está começando a planejar.",
    cta: "Começar grátis",
    ctaHref: "/registro",
    ctaStyle: "outline" as const,
    popular: false,
    features: [
      { text: "Até 50 convidados" },
      { text: "1 casamento ativo" },
      { text: "Site com RSVP" },
      { text: "Lista de presentes básica" },
      { text: "Controle de orçamento" },
    ],
  },
  {
    id: "pro",
    label: "Pro",
    priceMonthly: 99,
    priceAnnual: 82,
    priceSuffix: "/mês",
    description: "Para casais que querem o melhor.",
    cta: "Começar trial grátis",
    ctaHref: "/registro?plano=pro",
    ctaStyle: "copper" as const,
    popular: true,
    trialNote: "14 dias grátis, sem cartão",
    features: [
      { text: "Convidados ilimitados" },
      { text: "Identity Kit com IA" },
      { text: "RSVP via WhatsApp" },
      { text: "Lista com Pix integrado" },
      { text: "Conta digital com rendimento" },
      { text: "Simulador de presença avançado" },
      { text: "Suporte prioritário" },
    ],
  },
  {
    id: "cerimonialista",
    label: "Cerimonialista",
    priceMonthly: 199,
    priceAnnual: 165,
    priceSuffix: "/mês",
    description: "Para profissionais que gerenciam múltiplos casamentos.",
    cta: "Criar conta profissional",
    ctaHref: "/registro/cerimonialista",
    ctaStyle: "teal" as const,
    popular: false,
    trialNote: "14 dias grátis, sem cartão",
    features: [
      { text: "Tudo do plano Pro" },
      { text: "Casamentos ilimitados" },
      { text: "Pipeline CRM de leads" },
      { text: "Contratos com assinatura digital" },
      { text: "Gestão de comissões" },
      { text: "OCR de orçamentos de fornecedores" },
      { text: "Painel de equipe" },
      { text: "Relatórios e exportação CSV" },
    ],
  },
];

const COMPARISON_ROWS: {
  feature: string;
  gratuito: string | boolean;
  pro: string | boolean;
  cerimonialista: string | boolean;
}[] = [
  { feature: "Convidados", gratuito: "Até 50", pro: "Ilimitados", cerimonialista: "Ilimitados" },
  { feature: "Casamentos ativos", gratuito: "1", pro: "1", cerimonialista: "Ilimitados" },
  { feature: "Site com RSVP", gratuito: true, pro: true, cerimonialista: true },
  { feature: "Lista de presentes", gratuito: "Básica", pro: "Com Pix", cerimonialista: "Com Pix" },
  { feature: "Controle de orçamento", gratuito: true, pro: true, cerimonialista: true },
  { feature: "Identity Kit com IA", gratuito: false, pro: true, cerimonialista: true },
  { feature: "RSVP via WhatsApp", gratuito: false, pro: true, cerimonialista: true },
  { feature: "Conta digital", gratuito: false, pro: true, cerimonialista: true },
  { feature: "Simulador de presença", gratuito: "Básico", pro: "Avançado", cerimonialista: "Avançado" },
  { feature: "Pipeline CRM", gratuito: false, pro: false, cerimonialista: true },
  { feature: "Contratos digitais", gratuito: false, pro: false, cerimonialista: true },
  { feature: "Gestão de comissões", gratuito: false, pro: false, cerimonialista: true },
  { feature: "OCR de orçamentos", gratuito: false, pro: false, cerimonialista: true },
  { feature: "Painel de equipe", gratuito: false, pro: false, cerimonialista: true },
  { feature: "Suporte", gratuito: "Email", pro: "Prioritário", cerimonialista: "Dedicado" },
];

const FAQ_ITEMS = [
  {
    q: "Preciso de cartão de crédito para começar?",
    a: "Não. O plano Gratuito é para sempre sem cartão. Os trials dos planos pagos também não exigem cartão — você só informa os dados de pagamento quando decidir assinar.",
  },
  {
    q: "Posso mudar de plano depois?",
    a: "Sim, a qualquer momento. O upgrade entra em vigor imediatamente com cobrança proporcional. O downgrade acontece no próximo ciclo de cobrança, sem taxa.",
  },
  {
    q: "O que acontece com meus dados se eu cancelar?",
    a: "Seus dados ficam salvos por 90 dias após o cancelamento. Você pode exportar tudo (convidados, lista de presentes, orçamento) em CSV antes desse prazo.",
  },
  {
    q: "O plano anual tem desconto mesmo?",
    a: "Sim. No plano anual você paga por 10 meses e ganha 2 meses grátis — uma economia de ~17% em relação ao plano mensal.",
  },
  {
    q: "O plano Cerimonialista serve para agências maiores?",
    a: "Sim. O plano Cerimonialista foi pensado para profissionais e pequenas agências que gerenciam múltiplos casamentos ao mesmo tempo. Para times maiores, entre em contato para um plano Enterprise.",
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal/10">
        <CheckIcon className="w-3.5 h-3.5 text-teal" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-verde-noite/5">
        <XIcon className="w-3.5 h-3.5 text-verde-noite/25" />
      </span>
    );
  }
  return <span className="font-body text-sm text-verde-noite/70">{value}</span>;
}

export default function BillingToggle() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const isAnnual = billing === "annual";

  return (
    <>
      {/* ─── BILLING TOGGLE ─── */}
      <div className="flex items-center justify-center gap-3 mt-8">
        <span
          className={`font-body text-sm transition ${
            !isAnnual ? "text-verde-noite font-medium" : "text-verde-noite/40"
          }`}
        >
          Mensal
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isAnnual}
          onClick={() => setBilling(isAnnual ? "monthly" : "annual")}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${
            isAnnual ? "bg-teal" : "bg-verde-noite/20"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              isAnnual ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span
          className={`font-body text-sm transition ${
            isAnnual ? "text-verde-noite font-medium" : "text-verde-noite/40"
          }`}
        >
          Anual
        </span>
        {isAnnual && (
          <span className="bg-copper/10 text-copper text-xs font-body font-medium px-2.5 py-1 rounded-full">
            2 meses grátis
          </span>
        )}
      </div>

      {/* ─── PLAN CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {PLANS.map((plan) => {
          const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
          const isFree = plan.priceMonthly === 0;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl p-8 transition-shadow ${
                plan.popular
                  ? "border-2 border-copper shadow-float bg-white"
                  : "border border-verde-noite/10 bg-white hover:shadow-card-hover"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-copper text-white text-xs font-body font-semibold px-4 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                    Mais popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className="font-body text-xs text-verde-noite/40 uppercase tracking-widest mb-2">
                  {plan.label}
                </p>
                <div className="flex items-end gap-1 mb-1">
                  {isFree ? (
                    <p className="font-heading text-4xl text-verde-noite">Grátis</p>
                  ) : (
                    <>
                      <p className="font-heading text-4xl text-verde-noite">
                        R${" "}
                        <span>
                          {price.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </p>
                      <span className="font-body text-sm text-verde-noite/40 mb-1.5">
                        {plan.priceSuffix}
                      </span>
                    </>
                  )}
                </div>
                {isFree ? (
                  <p className="font-body text-xs text-verde-noite/40">Para sempre</p>
                ) : isAnnual ? (
                  <p className="font-body text-xs text-verde-noite/40">
                    Cobrado anualmente · {plan.trialNote}
                  </p>
                ) : (
                  <p className="font-body text-xs text-verde-noite/40">{plan.trialNote}</p>
                )}
                <p className="font-body text-sm text-verde-noite/60 mt-3">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat.text} className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-teal/10 text-teal flex items-center justify-center shrink-0">
                      <CheckIcon className="w-2.5 h-2.5" />
                    </span>
                    <span className="font-body text-sm text-verde-noite/70">{feat.text}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`block text-center py-3 rounded-xl font-body font-semibold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] ${
                  plan.ctaStyle === "copper"
                    ? "bg-copper text-white hover:bg-copper/90"
                    : plan.ctaStyle === "teal"
                    ? "bg-teal text-white hover:bg-teal/90"
                    : "border border-verde-noite/20 text-verde-noite hover:bg-verde-noite/5"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          );
        })}
      </div>

      {/* ─── COMPARISON TABLE ─── */}
      <div className="mt-20">
        <h2 className="font-heading text-3xl text-verde-noite text-center mb-8">
          Comparativo completo
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-verde-noite/10 bg-white">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-verde-noite/8">
                <th className="text-left py-4 px-6 font-body text-sm font-medium text-verde-noite/50 w-2/5">
                  Recurso
                </th>
                <th className="text-center py-4 px-4 font-body text-sm font-medium text-verde-noite/50">
                  Gratuito
                </th>
                <th className="text-center py-4 px-4 font-heading text-sm font-semibold text-copper relative">
                  Pro
                </th>
                <th className="text-center py-4 px-4 font-body text-sm font-medium text-verde-noite/50">
                  Cerimonialista
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`border-b border-verde-noite/5 last:border-0 ${
                    i % 2 === 0 ? "bg-white" : "bg-cream/40"
                  }`}
                >
                  <td className="py-3.5 px-6 font-body text-sm text-verde-noite/70">
                    {row.feature}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <CellValue value={row.gratuito} />
                  </td>
                  <td className="py-3.5 px-4 text-center bg-copper/[0.03]">
                    <CellValue value={row.pro} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <CellValue value={row.cerimonialista} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── FAQ ─── */}
      <div className="mt-20 max-w-2xl mx-auto">
        <h2 className="font-heading text-3xl text-verde-noite text-center mb-8">
          Perguntas frequentes
        </h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-verde-noite/10 bg-white overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-cream/50 transition"
              >
                <span className="font-body text-sm font-medium text-verde-noite">
                  {item.q}
                </span>
                <span
                  className={`shrink-0 w-5 h-5 text-verde-noite/40 transition-transform ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                >
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4">
                  <p className="font-body text-sm text-verde-noite/60 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
