"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const DISMISSED_KEY = "laco_suggestions_dismissed";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  urgency: "high" | "normal";
}

const urgencyEmoji: Record<"high" | "normal", string> = {
  high: "\u26A1",
  normal: "\uD83D\uDCA1",
};

function getDismissed(): string[] {
  try {
    const raw = sessionStorage.getItem(DISMISSED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveDismissed(ids: string[]) {
  try {
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export default function SmartSuggestions({ weddingId }: { weddingId: string }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDismissed(getDismissed());
  }, []);

  useEffect(() => {
    if (!weddingId) return;
    fetch(`/api/weddings/${weddingId}/suggestions`)
      .then((r) => r.json())
      .then((data: Suggestion[]) => {
        setSuggestions(Array.isArray(data) ? data : []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [weddingId]);

  if (!loaded) return null;

  const visible = suggestions.filter((s) => !dismissed.includes(s.id));
  if (visible.length === 0) return null;

  function dismiss(id: string) {
    const next = [...dismissed, id];
    setDismissed(next);
    saveDismissed(next);
  }

  return (
    <div>
      <p className="font-body text-xs font-medium text-verde-noite/40 uppercase tracking-wider mb-3">
        Sugestões
      </p>

      {/* Cards com scroll horizontal */}
      <div className="overflow-x-auto pb-1 -mx-4 px-4">
        <div className="flex gap-3 snap-x snap-mandatory" style={{ width: "max-content" }}>
          {visible.map((s) => (
            <div
              key={s.id}
              className={`snap-start flex-shrink-0 w-72 bg-white rounded-2xl border border-gray-100 border-l-4 shadow-sm p-4 flex flex-col gap-3 ${
                s.urgency === "high" ? "border-l-copper" : "border-l-teal"
              }`}
            >
              {/* Linha superior: emoji + fechar */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-xl leading-none">{urgencyEmoji[s.urgency]}</span>
                <button
                  onClick={() => dismiss(s.id)}
                  className="w-5 h-5 flex items-center justify-center rounded-full text-verde-noite/25 hover:text-verde-noite/60 hover:bg-gray-100 transition flex-shrink-0"
                  title="Dispensar sugestão"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Conteúdo */}
              <div className="flex-1">
                <p className="font-body text-sm font-semibold text-verde-noite leading-snug">
                  {s.title}
                </p>
                <p className="font-body text-xs text-verde-noite/55 mt-1 leading-relaxed">
                  {s.description}
                </p>
              </div>

              {/* CTA */}
              <Link
                href={s.ctaHref}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-body font-medium transition active:scale-[0.97] ${
                  s.urgency === "high"
                    ? "bg-copper text-white hover:bg-copper/90"
                    : "bg-teal text-white hover:bg-teal/90"
                }`}
              >
                {s.ctaLabel}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
