"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import BottomNav from "@/components/bottom-nav";
import { TEMPLATES } from "@/lib/identity-kit-templates";

// ── Design tokens ─────────────────────────────────────────────────
const GOLD  = "#A98950";
const BROWN = "#3D322A";
const CREME = "#FAF6EF";

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREME }}>
        <div className="w-7 h-7 border-[1.5px] border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${GOLD} transparent ${GOLD} ${GOLD}` }} />
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
    <div className="min-h-screen pb-24" style={{ background: CREME }}>

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden px-5 pt-12 pb-10"
        style={{ background: `linear-gradient(135deg, ${BROWN} 0%, #2A2019 100%)` }}>
        <div className="absolute top-4 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(169,137,80,0.18)" }} />
        <div className="absolute -bottom-4 left-0 w-32 h-32 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(169,137,80,0.10)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: GOLD }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
            </svg>
            <span className="text-[9px] tracking-[0.26em] uppercase"
              style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              Site + Identidade
            </span>
          </div>
          <h1 className="text-4xl font-light text-white mb-2 leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Meu Design
          </h1>
          <p className="text-sm leading-relaxed max-w-md"
            style={{ color: "rgba(255,255,255,0.62)" }}>
            Crie a identidade visual do casal com IA ou escolha uma arte pronta — tudo integrado ao site.
          </p>
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-10 space-y-5 pb-6">

        {/* ── 1. Identidade Visual com IA ── */}
        <div>
          <p className="text-[9.5px] tracking-[0.28em] uppercase mb-3 px-1"
            style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
            Identidade Visual
          </p>
          <Link href={`${base}/identity-kit`}
            className="block rounded-2xl overflow-hidden transition-all active:scale-[0.98]"
            style={{ background: "white", border: `1px solid rgba(169,137,80,0.22)`, boxShadow: "0 2px 12px rgba(61,50,42,0.07)" }}>
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: GOLD }}>
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-sm font-medium" style={{ color: BROWN }}>Criar com IA</h2>
                    <span className="px-2 py-0.5 rounded-full text-[9px] tracking-[0.1em] uppercase"
                      style={{ background: "rgba(169,137,80,0.10)", color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                      IA
                    </span>
                    {hasKit && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-green-100 text-green-700">
                        Criada
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(61,50,42,0.52)" }}>
                    Quiz de 5 passos — gere paleta, tipografia e identidade completa personalizada.
                  </p>
                </div>
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  style={{ color: GOLD }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="px-5 py-2.5 flex items-center gap-2.5"
              style={{ background: "rgba(169,137,80,0.05)", borderTop: "1px solid rgba(169,137,80,0.10)" }}>
              <span className="text-[9px]" style={{ color: "rgba(61,50,42,0.38)" }}>Alimenta →</span>
              {["Convite digital", "Site", "Papelaria"].map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full text-[9px]"
                  style={{ background: "white", border: "1px solid rgba(169,137,80,0.18)", color: BROWN }}>
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        </div>

        {/* ── 2. Arte Pronta ── */}
        <div>
          <p className="text-[9.5px] tracking-[0.28em] uppercase mb-3 px-1"
            style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
            Arte Pronta
          </p>
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "white", border: "1px solid rgba(169,137,80,0.14)", boxShadow: "0 1px 6px rgba(61,50,42,0.05)" }}>
            <div className="p-4" style={{ borderBottom: "1px solid rgba(169,137,80,0.10)" }}>
              <p className="text-sm font-medium" style={{ color: BROWN }}>Escolha um tema pronto</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(61,50,42,0.48)" }}>Toque para aplicar instantaneamente — sem quiz</p>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2.5">
              {templateList.map((t) => {
                const isApplied = appliedPreset === t.id;
                const isApplying = applyingPreset === t.id;
                return (
                  <button key={t.id}
                    onClick={() => !isApplying && !appliedPreset && applyPreset(t.id)}
                    disabled={!!applyingPreset || !!appliedPreset}
                    className="relative text-left rounded-xl overflow-hidden transition-all active:scale-[0.97]"
                    style={{ border: isApplied ? "2px solid #4A956C" : "2px solid transparent" }}>
                    <div className="h-10 flex">
                      <div className="flex-1" style={{ backgroundColor: t.colors.primary }} />
                      <div className="flex-1" style={{ backgroundColor: t.colors.secondary }} />
                      <div className="flex-1" style={{ backgroundColor: t.colors.accent }} />
                      <div className="flex-1" style={{ backgroundColor: t.colors.background }} />
                    </div>
                    <div className="p-2.5" style={{ backgroundColor: t.colors.background }}>
                      <p className="text-xs font-medium" style={{ color: t.colors.text }}>{t.name}</p>
                      <p className="text-[10px] leading-snug mt-0.5" style={{ color: t.colors.muted }}>{t.description}</p>
                    </div>
                    {(isApplying || isApplied) && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl"
                        style={{ background: "rgba(250,246,239,0.85)" }}>
                        {isApplying ? (
                          <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                            style={{ borderColor: `${GOLD} transparent ${GOLD} ${GOLD}` }} />
                        ) : (
                          <div className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: "#4A956C" }}>
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
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

        {/* ── 3. Site do Casamento (em breve) ── */}
        <div>
          <p className="text-[9.5px] tracking-[0.28em] uppercase mb-3 px-1"
            style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
            Passo 2
          </p>
          <div className="rounded-2xl overflow-hidden opacity-60"
            style={{ background: "white", border: "1px solid rgba(169,137,80,0.10)" }}>
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(61,50,42,0.07)" }}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                    style={{ color: "rgba(61,50,42,0.38)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-sm font-medium" style={{ color: BROWN }}>Site do Casamento</h2>
                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-amber-100 text-amber-700">Em breve</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(61,50,42,0.45)" }}>
                    Monte o site dos noivos com fotos, informações e RSVP integrado — sem código.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-5 py-2.5 flex items-center gap-2.5"
              style={{ background: "rgba(61,50,42,0.03)", borderTop: "1px solid rgba(61,50,42,0.06)" }}>
              <span className="text-[9px]" style={{ color: "rgba(61,50,42,0.30)" }}>Inclui →</span>
              {["Home", "Dress Code", "Concierge", "RSVP", "Presentes"].map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full text-[9px]"
                  style={{ background: "white", border: "1px solid rgba(61,50,42,0.08)", color: "rgba(61,50,42,0.40)" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── 4. Papelaria ── */}
        <div>
          <p className="text-[9.5px] tracking-[0.28em] uppercase mb-3 px-1"
            style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
            Papelaria
          </p>
          <div className="space-y-2">
            {papelaria.map((item) =>
              item.available ? (
                <Link key={item.label} href={`${base}/identity-kit`}
                  className="flex items-center gap-4 rounded-2xl p-4 transition-all active:scale-[0.98]"
                  style={{ background: "white", border: "1px solid rgba(169,137,80,0.14)", boxShadow: "0 1px 6px rgba(61,50,42,0.05)" }}>
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: BROWN }}>{item.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(61,50,42,0.48)" }}>{item.desc}</p>
                  </div>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    style={{ color: "rgba(169,137,80,0.35)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <div key={item.label}
                  className="flex items-center gap-4 rounded-2xl p-4 opacity-55"
                  style={{ background: "rgba(250,246,239,0.7)", border: "1px solid rgba(169,137,80,0.08)" }}>
                  <span className="text-2xl flex-shrink-0 grayscale">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: BROWN }}>{item.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(61,50,42,0.45)" }}>{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      style={{ color: "rgba(61,50,42,0.22)" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-[10px]" style={{ color: "rgba(61,50,42,0.28)" }}>Em breve</span>
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
