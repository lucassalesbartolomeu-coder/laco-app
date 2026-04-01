"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import BottomNav from "@/components/bottom-nav";
import { TEMPLATES } from "@/lib/identity-kit-templates";

/* ─── Icons ─────────────────────────────────────────────────────────── */

function GlobeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  );
}

function SparkleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function ArrowIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function LockIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function PencilIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function MeuSitePage() {
  const params = useParams();
  const weddingId = params?.id as string;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasKit, setHasKit] = useState<boolean | null>(null);
  const [applyingPreset, setApplyingPreset] = useState<string | null>(null);
  const [appliedPreset, setAppliedPreset] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch(`/api/weddings/${weddingId}/identity-kit`)
        .then(r => r.ok ? r.json() : null)
        .then(d => setHasKit(!!(d?.kit?.aiResponse)))
        .catch(() => setHasKit(false));
    }
  }, [status, weddingId]);

  async function applyPreset(presetId: string) {
    setApplyingPreset(presetId);
    try {
      const res = await fetch(`/api/weddings/${weddingId}/identity-kit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset: true, presetId }),
      });
      if (res.ok) {
        setAppliedPreset(presetId);
        setTimeout(() => router.push(`/casamento/${weddingId}/identity-kit`), 800);
      }
    } finally {
      setApplyingPreset(null);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!session) return null;

  const base = `/casamento/${weddingId}`;
  const templateList = Object.values(TEMPLATES);

  const papelaria = [
    { icon: "🎨", label: "Brasão / Monograma", desc: "Iniciais do casal em selo circular", available: true },
    { icon: "🖼️", label: "Aquarela do Local", desc: "Ilustração do local da cerimônia", available: false },
    { icon: "📜", label: "Convite Digital", desc: "Convite interativo com animações", available: false },
    { icon: "🍽️", label: "Menu de Drinks", desc: "Cardápio ilustrado em aquarela", available: false },
    { icon: "💧", label: "Lágrimas de Alegria", desc: "Tag personalizada para lencinhos", available: false },
    { icon: "📖", label: "Manual dos Padrinhos", desc: "Guia completo para padrinhos e damas", available: false },
    { icon: "📱", label: "Save the Date", desc: "Digital animado para WhatsApp", available: false },
    { icon: "🏷️", label: "Papelaria do Dia", desc: "Menu, place cards, tag de agradecimento", available: false },
  ];

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* Hero */}
      <div className="bg-gradient-to-br from-midnight via-midnight/95 to-midnight/80 px-5 pt-12 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <GlobeIcon className="w-5 h-5 text-gold" />
            <span className="font-body text-xs text-white/60 uppercase tracking-wider">Site + Identidade</span>
          </div>
          <h1 className="font-heading text-3xl text-white mb-2">Design</h1>
          <p className="font-body text-sm text-white/70 max-w-md">
            Crie a identidade visual do casal com IA ou escolha uma arte pronta — tudo integrado ao site.
          </p>
        </div>
      </div>

      <div className="px-4 -mt-5 relative z-10 space-y-4 pb-6">

        {/* ── 1. Identidade Visual com IA ───────────────────────────── */}
        <div>
          <p className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-3 px-1">Identidade Visual</p>
          <Link
            href={`${base}/identity-kit`}
            className="block bg-white rounded-2xl border border-gold/25 shadow-sm hover:shadow-md hover:border-gold/50 transition-all active:scale-[0.98] overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold flex items-center justify-center flex-shrink-0">
                  <SparkleIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-body text-base font-semibold text-midnight">Criar com IA</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-body font-medium bg-gold/10 text-gold">IA</span>
                    {hasKit && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-body font-medium bg-green-100 text-green-700">Criada</span>
                    )}
                  </div>
                  <p className="font-body text-xs text-midnight/50 leading-relaxed">
                    Quiz de 5 passos — gere paleta, tipografia e identidade completa personalizada para o seu casamento.
                  </p>
                </div>
                <div className="flex-shrink-0 mt-0.5">
                  {hasKit ? (
                    <PencilIcon className="w-5 h-5 text-gold" />
                  ) : (
                    <ArrowIcon className="w-5 h-5 text-gold" />
                  )}
                </div>
              </div>
            </div>
            <div className="px-5 py-2.5 bg-gold/5 border-t border-gold/10 flex items-center gap-3">
              <span className="font-body text-[10px] text-midnight/40">Alimenta →</span>
              {["Convite digital", "Site", "Papelaria"].map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-white border border-midnight/10 text-midnight text-[10px] font-body font-medium">{tag}</span>
              ))}
            </div>
          </Link>
        </div>

        {/* ── 2. Arte Pronta ────────────────────────────────────────── */}
        <div>
          <p className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-3 px-1">Arte Pronta</p>
          <div className="bg-white rounded-2xl border border-midnight/8 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-midnight/6">
              <p className="font-body text-sm font-semibold text-midnight">Escolha um tema pronto</p>
              <p className="font-body text-xs text-stone mt-0.5">Toque para aplicar instantaneamente — sem quiz</p>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2.5">
              {templateList.map((t) => {
                const isApplied = appliedPreset === t.id;
                const isApplying = applyingPreset === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => !isApplying && !appliedPreset && applyPreset(t.id)}
                    disabled={!!applyingPreset || !!appliedPreset}
                    className={`relative text-left rounded-xl border-2 overflow-hidden transition-all active:scale-[0.97] ${
                      isApplied
                        ? "border-green-500"
                        : "border-transparent hover:border-gold/40"
                    }`}
                  >
                    {/* Color swatch strip */}
                    <div className="h-10 flex">
                      <div className="flex-1" style={{ backgroundColor: t.colors.primary }} />
                      <div className="flex-1" style={{ backgroundColor: t.colors.secondary }} />
                      <div className="flex-1" style={{ backgroundColor: t.colors.accent }} />
                      <div className="flex-1" style={{ backgroundColor: t.colors.background }} />
                    </div>
                    {/* Template info */}
                    <div className="p-2.5" style={{ backgroundColor: t.colors.background }}>
                      <p className="font-body text-xs font-semibold" style={{ color: t.colors.text }}>{t.name}</p>
                      <p className="font-body text-[10px] leading-snug mt-0.5" style={{ color: t.colors.muted }}>{t.description}</p>
                    </div>
                    {/* Loading/Applied overlay */}
                    {(isApplying || isApplied) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                        {isApplying ? (
                          <div className="w-5 h-5 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckIcon className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 3. Site do Casamento ──────────────────────────────────── */}
        <div>
          <p className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-3 px-1">Passo 2</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden opacity-70">
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-midnight flex items-center justify-center flex-shrink-0">
                  <GlobeIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-body text-base font-semibold text-midnight">Site do Casamento</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-body font-semibold bg-amber-100 text-amber-700">Em breve</span>
                  </div>
                  <p className="font-body text-xs text-midnight/50 leading-relaxed">
                    Monte o site dos noivos com suas fotos, informações e RSVP integrado — nível profissional, sem código.
                  </p>
                </div>
                <LockIcon className="w-5 h-5 text-midnight/20 flex-shrink-0 mt-0.5" />
              </div>
            </div>
            <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
              <span className="font-body text-[10px] text-midnight/40">Inclui →</span>
              {["Home", "Dress Code", "Concierge", "RSVP", "Presentes"].map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-white border border-midnight/10 text-midnight text-[10px] font-body font-medium">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── 4. Papelaria ──────────────────────────────────────────── */}
        <div>
          <p className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-3 px-1">Papelaria</p>
          <div className="space-y-2">
            {papelaria.map((item) =>
              item.available ? (
                <Link
                  key={item.label}
                  href={`${base}/identity-kit`}
                  className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-midnight/20 transition-all active:scale-[0.98]"
                >
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium text-midnight">{item.label}</p>
                    <p className="font-body text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <ArrowIcon className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </Link>
              ) : (
                <div key={item.label} className="flex items-center gap-4 bg-white/60 rounded-2xl border border-gray-100/50 p-4 opacity-60">
                  <span className="text-2xl flex-shrink-0 grayscale">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium text-midnight">{item.label}</p>
                    <p className="font-body text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <LockIcon className="w-3.5 h-3.5 text-gray-300" />
                    <span className="font-body text-[10px] text-gray-400">Em breve</span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
