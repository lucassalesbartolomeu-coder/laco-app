"use client";

import Link from "next/link";

type SuggestionVariant = "urgency" | "info";

interface Suggestion {
  id: string;
  icon: React.ReactNode;
  text: string;
  actionLabel: string;
  href: string;
  variant: SuggestionVariant;
}

interface SmartSuggestionsProps {
  weddingId: string;
  daysRemaining: number | null;
  totalGuests: number;
  pendingGuests: number;
  hasIdentityKit: boolean;
  estimatedBudget: number | null;
}

function buildSuggestions(props: SmartSuggestionsProps): Suggestion[] {
  const { weddingId, daysRemaining, totalGuests, pendingGuests, hasIdentityKit, estimatedBudget } =
    props;

  const suggestions: Suggestion[] = [];

  // Days-based urgency
  if (daysRemaining !== null && daysRemaining > 0) {
    if (daysRemaining <= 30) {
      suggestions.push({
        id: "urgent_days",
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
        text: `Faltam apenas ${daysRemaining} dias — confira os detalhes finais com seus fornecedores.`,
        actionLabel: "Ver fornecedores",
        href: `/casamento/${weddingId}/fornecedores`,
        variant: "urgency",
      });
    } else if (daysRemaining <= 90) {
      suggestions.push({
        id: "days_90",
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
        text: `Faltam ${daysRemaining} dias — hora de fechar contratos com buffet e fotógrafo.`,
        actionLabel: "Fornecedores",
        href: `/casamento/${weddingId}/fornecedores`,
        variant: "urgency",
      });
    } else if (daysRemaining <= 180) {
      suggestions.push({
        id: "days_180",
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
        text: `Faltam ${daysRemaining} dias — use o simulador para planejar seu orçamento.`,
        actionLabel: "Simular",
        href: `/casamento/${weddingId}/simulador`,
        variant: "info",
      });
    }
  }

  // RSVP pending
  if (totalGuests > 0 && pendingGuests > 0) {
    const pendingPct = Math.round((pendingGuests / totalGuests) * 100);
    if (pendingPct >= 30) {
      suggestions.push({
        id: "rsvp_pending",
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
        text: `${pendingPct}% dos convidados ainda não confirmaram — enviar um lembrete?`,
        actionLabel: "Ver confirmações",
        href: `/casamento/${weddingId}/confirmacoes`,
        variant: "urgency",
      });
    } else if (pendingGuests > 0) {
      suggestions.push({
        id: "rsvp_few",
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
        text: `${pendingGuests} convidado${pendingGuests > 1 ? "s" : ""} ainda sem resposta — acompanhe as confirmações.`,
        actionLabel: "Acompanhar",
        href: `/casamento/${weddingId}/confirmacoes`,
        variant: "info",
      });
    }
  }

  // Identity kit not generated
  if (!hasIdentityKit) {
    suggestions.push({
      id: "identity_kit",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      text: "Seu Identity Kit ainda não foi gerado — crie a identidade visual do seu casamento.",
      actionLabel: "Gerar agora",
      href: `/casamento/${weddingId}/identity-kit`,
      variant: "info",
    });
  }

  // Budget not filled
  if (!estimatedBudget) {
    suggestions.push({
      id: "budget",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: "Defina seu orçamento estimado para receber dicas personalizadas de custo.",
      actionLabel: "Simular orçamento",
      href: `/casamento/${weddingId}/simulador`,
      variant: "info",
    });
  }

  // Return at most 4 suggestions, prioritising urgency
  const urgency = suggestions.filter((s) => s.variant === "urgency");
  const info = suggestions.filter((s) => s.variant === "info");
  return [...urgency, ...info].slice(0, 4);
}

const variantStyles: Record<SuggestionVariant, { border: string; iconBg: string; iconColor: string; btn: string }> = {
  urgency: {
    border: "border-l-copper",
    iconBg: "bg-copper/10",
    iconColor: "text-copper",
    btn: "bg-copper text-white hover:bg-copper/90",
  },
  info: {
    border: "border-l-teal",
    iconBg: "bg-teal/10",
    iconColor: "text-teal",
    btn: "bg-teal text-white hover:bg-teal/90",
  },
};

export default function SmartSuggestions(props: SmartSuggestionsProps) {
  const suggestions = buildSuggestions(props);

  if (suggestions.length === 0) return null;

  return (
    <div>
      <p className="font-body text-xs font-medium text-verde-noite/40 uppercase tracking-wider mb-3">
        Sugestões
      </p>
      <div className="space-y-2.5">
        {suggestions.map((s) => {
          const style = variantStyles[s.variant];
          return (
            <div
              key={s.id}
              className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${style.border} shadow-sm p-4 flex items-start gap-3`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${style.iconBg} ${style.iconColor}`}>
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-verde-noite leading-snug">{s.text}</p>
              </div>
              <Link
                href={s.href}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-body font-medium transition active:scale-[0.97] ${style.btn}`}
              >
                {s.actionLabel}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
