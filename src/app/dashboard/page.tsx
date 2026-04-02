"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import BottomNav from "@/components/bottom-nav";
import dynamic from "next/dynamic";

const ActivityFeed = dynamic(() => import("@/components/activity-feed"), { ssr: false });
const ActivationChecklist = dynamic(() => import("@/components/activation-checklist"), { ssr: false });
const SmartSuggestions = dynamic(() => import("@/components/smart-suggestions"), { ssr: false });

// ── Design tokens ────────────────────────────────────────────────
const GOLD   = "#A98950";
const BROWN  = "#3D322A";
const CREME  = "#FAF6EF";
const BG_DARK = "#F0E8DA";

interface Wedding {
  id: string;
  userId: string;
  partnerUserId: string | null;
  partnerInviteToken: string | null;
  partnerName1: string;
  partnerName2: string;
  weddingDate: string | null;
  venue: string | null;
  city: string | null;
  state: string | null;
  style: string | null;
  estimatedGuests: number | null;
  estimatedBudget: number | null;
}

interface GuestStats {
  total: number;
  confirmed: number;
  pending: number;
  declined: number;
}

// ── Helper ───────────────────────────────────────────────────────
function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000);
}

// ── Partner Invite Panel ─────────────────────────────────────────
function PartnerInvitePanel({
  wedding,
  currentUserId,
  onUpdate,
}: {
  wedding: Wedding;
  currentUserId: string;
  onUpdate: () => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  const isOwner = wedding.userId === currentUserId;
  const hasPartner = !!wedding.partnerUserId;

  async function generateInvite() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/weddings/${wedding.id}/partner`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setInviteLink(`${window.location.origin}/parceiro/${data.token}`);
    } catch (e) { console.error(e); }
    finally { setGenerating(false); }
  }

  async function unlinkPartner() {
    setUnlinking(true);
    setConfirmUnlink(false);
    try {
      await fetch(`/api/weddings/${wedding.id}/partner`, { method: "DELETE" });
      onUpdate();
    } catch (e) { console.error(e); }
    finally { setUnlinking(false); }
  }

  function copyLink() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    if (!inviteLink) return;
    const names = `${wedding.partnerName1} & ${wedding.partnerName2}`;
    const msg = encodeURIComponent(`Olá! Você foi convidado(a) para planejar o casamento de ${names} juntos no Laço 💍\n\nAcesse pelo link: ${inviteLink}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  if (!isOwner) {
    return (
      <div className="text-[10px] tracking-[0.2em] uppercase font-light px-2.5 py-1 rounded-full w-fit"
        style={{ background: "rgba(169,137,80,0.10)", color: GOLD, fontFamily: "'Josefin Sans', sans-serif" }}>
        Casamento compartilhado
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(169,137,80,0.12)" }}>
      {hasPartner ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-xs" style={{ color: "rgba(61,50,42,0.55)" }}>Parceiro(a) vinculado(a)</span>
            </div>
            {!confirmUnlink && (
              <button onClick={() => setConfirmUnlink(true)} disabled={unlinking}
                className="text-xs transition" style={{ color: "rgba(61,50,42,0.30)" }}>
                Desvincular
              </button>
            )}
          </div>
          {confirmUnlink && (
            <div className="flex items-center gap-2 bg-red-50 rounded-xl px-3 py-2">
              <p className="text-xs text-red-700 flex-1">Remover acesso do parceiro?</p>
              <button onClick={unlinkPartner} disabled={unlinking}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-400 text-white">
                {unlinking ? "…" : "Remover"}
              </button>
              <button onClick={() => setConfirmUnlink(false)}
                className="px-2.5 py-1 rounded-lg text-xs text-red-600">
                Não
              </button>
            </div>
          )}
        </div>
      ) : inviteLink ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-xl px-3 py-2 text-center"
              style={{ background: "rgba(61,50,42,0.04)" }}>
              <p className="text-[10px] mb-0.5" style={{ color: "rgba(61,50,42,0.40)" }}>Código de convite</p>
              <p className="text-lg font-semibold tracking-widest" style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif" }}>
                {inviteLink.split("/").pop()}
              </p>
            </div>
            <button onClick={copyLink}
              className="px-3 py-2 rounded-xl text-xs flex-shrink-0 transition"
              style={copied
                ? { background: "rgba(74,149,108,0.10)", color: "#4A956C" }
                : { background: GOLD, color: "white" }}>
              {copied ? "Copiado!" : "Copiar link"}
            </button>
          </div>
          <button onClick={shareWhatsApp}
            className="flex items-center gap-1.5 text-xs text-green-600">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Enviar pelo WhatsApp
          </button>
        </div>
      ) : (
        <button onClick={generateInvite} disabled={generating}
          className="flex items-center gap-1.5 text-xs transition"
          style={{ color: "rgba(61,50,42,0.45)" }}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          {generating ? "Gerando link…" : "Planejar juntos — convidar noivo(a)"}
        </button>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestStats, setGuestStats] = useState<GuestStats | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const userId = (session?.user as { id?: string })?.id ?? "";

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const loadWeddings = useCallback(() => {
    if (status !== "authenticated") return;
    fetch("/api/weddings")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setWeddings(list);
        setLoading(false);
        if (list.length > 0) fetchGuestStats(list[0].id);
      })
      .catch(() => setLoading(false));
  }, [status]);

  async function fetchGuestStats(weddingId: string) {
    try {
      const res = await fetch(`/api/weddings/${weddingId}/guests/stats`);
      if (!res.ok) return;
      const stats = await res.json();
      setGuestStats({ total: stats.total, confirmed: stats.confirmed, declined: stats.declined, pending: stats.pending });
    } catch { /* silently fail */ }
  }

  async function deleteWedding(id: string) {
    setConfirmDeleteId(null);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/weddings/${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = weddings.filter((ww) => ww.id !== id);
        setWeddings(updated);
        if (updated.length === 0) router.push("/casamento/novo");
        else if (updated.length > 0 && id === weddings[0].id) fetchGuestStats(updated[0].id);
      }
    } catch (e) { console.error(e); }
    finally { setDeletingId(null); }
  }

  useEffect(() => { loadWeddings(); }, [loadWeddings]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREME }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-7 h-7 border-[1.5px] border-t-transparent rounded-full animate-spin"
            style={{ borderColor: `${GOLD} transparent ${GOLD} ${GOLD}` }} />
          <p className="text-[10px] uppercase tracking-[0.18em]"
            style={{ color: "rgba(61,50,42,0.35)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
            Carregando
          </p>
        </div>
      </div>
    );
  }

  const formatCurrency = (v: number | null) => {
    if (!v) return null;
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
  };

  const firstName = session?.user?.name?.split(" ")[0] ?? session?.user?.email?.split("@")[0] ?? "";
  const w = weddings[0] ?? null;
  const days = w ? daysUntil(w.weddingDate) : null;

  // Quick action items
  const quickItems = w ? [
    {
      href: `/casamento/${w.id}/convidados`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: "Convidados",
      desc: "Lista completa, RSVP e grupos",
      badge: guestStats?.total ?? null,
    },
    {
      href: `/casamento/${w.id}/importar`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
      label: "Importar Contatos",
      desc: "Agenda, CSV ou cadastro manual",
      badge: null,
    },
    {
      href: `/casamento/${w.id}/identity-kit`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      label: "Identity Kit",
      desc: "Paleta, tipografia e imagens com IA",
      badge: null,
    },
    {
      href: `/casamento/${w.id}/fornecedores`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      label: "Fornecedores",
      desc: "Contratos, orçamentos e status",
      badge: null,
    },
    {
      href: `/casamento/${w.id}/orcamento`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: "Orçamento",
      desc: "Gastos reais vs estimados",
      badge: null,
    },
    {
      href: `/casamento/${w.id}/simulador`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      label: "Simulador",
      desc: "Estime custos por região com dados reais",
      badge: null,
    },
  ] : [];

  // suppress unused warning — formatCurrency is available for future use
  void formatCurrency;

  return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>

      {/* ── Greeting header ── */}
      <div className="px-5 pt-10 pb-6 flex items-start justify-between">
        <div>
          <p className="text-[9px] tracking-[0.28em] uppercase mb-1"
            style={{ color: "rgba(61,50,42,0.36)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
            Bom dia,
          </p>
          <h1 className="text-[26px] font-light leading-tight"
            style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
            {firstName || "Olá"}
          </h1>
        </div>
        {/* Mini brasão with couple initials */}
        <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: BG_DARK, border: "1px solid rgba(169,137,80,0.16)" }}>
          <svg viewBox="0 0 80 80" width="32" height="32">
            <circle cx="40" cy="40" r="35" fill="none" stroke="#A98950" strokeWidth="1"/>
            <circle cx="40" cy="40" r="22" fill="none" stroke="#A98950" strokeWidth="0.5"/>
            <text x="40" y="44" textAnchor="middle" fill="#A98950"
              style={{ fontFamily: "'Josefin Sans'", fontSize: "10px", fontWeight: "300", letterSpacing: "0.08em" }}>
              {w ? `${w.partnerName1[0]}${w.partnerName2[0]}` : "♡"}
            </text>
          </svg>
        </div>
      </div>

      {/* ── Ornamental divider ── */}
      <div className="flex items-center gap-2.5 mx-5 mb-5">
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
        <div className="w-[5px] h-[5px] rotate-45 opacity-55 flex-shrink-0" style={{ background: GOLD }} />
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
      </div>

      <div className="px-5 space-y-5">

        {!w ? (
          /* ── Empty state ── */
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "white", border: "1.5px solid rgba(169,137,80,0.16)", boxShadow: "0 1px 6px rgba(61,50,42,0.05)" }}>
            <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${GOLD}, #D4B888)` }} />
            <div className="px-8 py-14 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                style={{ background: BG_DARK }}>
                <svg className="w-8 h-8" style={{ color: GOLD }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-light mb-2" style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif" }}>
                Seu casamento começa aqui
              </h3>
              <p className="text-sm max-w-sm mx-auto mb-8 leading-relaxed" style={{ color: "rgba(61,50,42,0.55)" }}>
                Crie seu casamento e comece a organizar convidados, fornecedores e muito mais.
              </p>
              <Link href="/casamento/novo"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white text-[11.5px] tracking-[0.22em] uppercase transition-all active:scale-[0.98]"
                style={{ background: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                Criar meu casamento
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ── Compact countdown card ── */}
            <div className="rounded-2xl px-[22px] py-5 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, #3D322A 0%, #2A2019 100%)` }}>
              <div className="absolute -top-5 -right-5 w-[90px] h-[90px] rounded-full pointer-events-none"
                style={{ background: "rgba(169,137,80,0.15)", filter: "blur(24px)" }} />
              <div className="absolute -bottom-3 left-2.5 w-[60px] h-[60px] rounded-full pointer-events-none"
                style={{ background: "rgba(169,137,80,0.08)", filter: "blur(20px)" }} />

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-[9px] tracking-[0.28em] uppercase mb-1.5"
                    style={{ color: "rgba(169,137,80,0.65)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                    {days != null && days >= 0 ? "Contagem Regressiva" : "Casamento Realizado"}
                  </p>
                  {days != null && days >= 0 ? (
                    <>
                      <p className="text-[44px] font-light text-white leading-none"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}>{days}</p>
                      <p className="text-[9px] tracking-[0.22em] uppercase mt-0.5"
                        style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                        dias
                      </p>
                    </>
                  ) : (
                    <p className="text-[20px] font-light text-white leading-none"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {w.partnerName1} &amp; {w.partnerName2}
                    </p>
                  )}
                </div>
                {/* Mini date ring */}
                {days != null && days >= 0 && w.weddingDate && (() => {
                  const r = 30; const circ = 2 * Math.PI * r;
                  const pct = Math.max(0, Math.min(1, days / 365));
                  const dash = circ * pct;
                  const d = new Date(w.weddingDate);
                  const mes = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
                  return (
                    <div className="relative w-[72px] h-[72px] flex-shrink-0">
                      <svg viewBox="0 0 72 72" width="72" height="72"
                        style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
                        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(169,137,80,0.15)" strokeWidth="3"/>
                        <circle cx="36" cy="36" r={r} fill="none" stroke="#A98950" strokeWidth="3"
                          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[11px] leading-tight"
                          style={{ color: "rgba(255,255,255,0.70)", fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.04em" }}>
                          {d.getDate()} {mes}
                        </span>
                        <span className="text-[7.5px] tracking-[0.12em] uppercase"
                          style={{ color: "rgba(169,137,80,0.55)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                          {d.getFullYear()}
                        </span>
                      </div>
                    </div>
                  );
                })()}
                {/* Delete button top-right */}
                {w.userId === userId && (
                  <div className="absolute top-0 right-0">
                    {confirmDeleteId === w.id ? (
                      <div className="flex items-center gap-1.5 p-2">
                        <button onClick={() => deleteWedding(w.id)} disabled={deletingId === w.id}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-red-500 text-white">Apagar</button>
                        <button onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-0.5 rounded-lg text-[10px] text-white/50">Não</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(w.id)} disabled={deletingId === w.id}
                        className="w-7 h-7 flex items-center justify-center rounded-full m-2 transition"
                        style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}>
                        {deletingId === w.id ? (
                          <div className="w-3 h-3 border border-white/30 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Couple names */}
              <div className="relative z-10 mt-3.5 pt-3 flex items-center justify-center gap-2"
                style={{ borderTop: "1px solid rgba(169,137,80,0.18)" }}>
                <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.62)", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
                  {w.partnerName1}
                </span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#A98950" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.62)", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
                  {w.partnerName2}
                </span>
              </div>
            </div>

            {/* ── Quick stats 3-col ── */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: guestStats?.confirmed ?? 0, lbl: "confirmados" },
                { val: guestStats != null ? `${Math.round((guestStats.confirmed / Math.max(1, guestStats.total)) * 100)}%` : "—", lbl: "presença", color: "#4A956C" },
                { val: guestStats?.pending ?? 0, lbl: "pendentes" },
              ].map(({ val, lbl, color }) => (
                <div key={lbl} className="rounded-2xl px-2.5 py-3.5 text-center"
                  style={{ background: "white", border: "1.5px solid rgba(169,137,80,0.16)", boxShadow: "0 1px 6px rgba(61,50,42,0.05)" }}>
                  <p className="text-[22px] font-light leading-none mb-1"
                    style={{ color: color ?? BROWN, fontFamily: "'Cormorant Garamond', serif" }}>
                    {guestStats != null ? val : "—"}
                  </p>
                  <p className="text-[8.5px] tracking-[0.18em] uppercase"
                    style={{ color: "rgba(61,50,42,0.36)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                    {lbl}
                  </p>
                </div>
              ))}
            </div>

            {/* ── Activation Checklist ── */}
            <div>
              <p className="text-[9.5px] tracking-[0.3em] uppercase pb-2.5"
                style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                Checklist geral
              </p>
              <ActivationChecklist weddingId={w.id} />
            </div>

            {/* ── Smart Suggestions / Próximas ações ── */}
            <div>
              <p className="text-[9.5px] tracking-[0.3em] uppercase pb-2.5"
                style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                Próximas ações
              </p>
              <SmartSuggestions weddingId={w.id} />
            </div>

            {/* ── Activity ── */}
            <div>
              <p className="text-[9.5px] tracking-[0.3em] uppercase pb-2.5"
                style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                Atividade recente
              </p>
              <ActivityFeed weddingId={w.id} />
            </div>

            {/* ── Partner ── */}
            <div>
              <p className="text-[9.5px] tracking-[0.3em] uppercase pb-2.5"
                style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                Parceiro(a)
              </p>
              <div className="rounded-2xl p-4"
                style={{ background: "white", border: "1.5px solid rgba(169,137,80,0.16)", boxShadow: "0 1px 6px rgba(61,50,42,0.05)" }}>
                <PartnerInvitePanel wedding={w} currentUserId={userId} onUpdate={loadWeddings} />
              </div>
            </div>

            {/* ── Multiple weddings ── */}
            {weddings.length > 1 && (
              <div>
                <div className="flex items-center justify-between pb-2.5">
                  <p className="text-[9.5px] tracking-[0.3em] uppercase"
                    style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                    Outros casamentos
                  </p>
                  <Link href="/casamento/novo" className="text-[11px] flex items-center gap-1" style={{ color: GOLD }}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Novo
                  </Link>
                </div>
                <div className="space-y-2">
                  {weddings.slice(1).map((ww) => (
                    <div key={ww.id} className="rounded-2xl p-4 flex items-center justify-between gap-3"
                      style={{ background: "white", border: "1.5px solid rgba(169,137,80,0.16)", boxShadow: "0 1px 6px rgba(61,50,42,0.05)" }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: BROWN }}>{ww.partnerName1} &amp; {ww.partnerName2}</p>
                        {ww.weddingDate && (
                          <p className="text-xs mt-0.5" style={{ color: "rgba(61,50,42,0.45)" }}>
                            {new Date(ww.weddingDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link href={`/casamento/${ww.id}/convidados`}
                          className="px-3 py-1.5 text-xs rounded-xl transition"
                          style={{ border: "1px solid rgba(169,137,80,0.22)", color: BROWN }}>
                          Abrir
                        </Link>
                        {ww.userId === userId && (
                          confirmDeleteId === ww.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => deleteWedding(ww.id)} disabled={deletingId === ww.id}
                                className="px-2 py-1 rounded-lg text-xs font-medium bg-red-500 text-white">Apagar</button>
                              <button onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 rounded-lg text-xs" style={{ color: "rgba(61,50,42,0.45)" }}>Não</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDeleteId(ww.id)} disabled={deletingId === ww.id}
                              className="w-8 h-8 flex items-center justify-center rounded-xl transition"
                              style={{ border: "1px solid rgba(229,100,100,0.2)", color: "rgba(229,100,100,0.5)" }}>
                              {deletingId === ww.id ? (
                                <div className="w-3.5 h-3.5 border border-red-300 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Quick access entry cards ── */}
            <div>
              <p className="text-[9.5px] tracking-[0.3em] uppercase pb-2.5"
                style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                Acesso rápido
              </p>
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "white", border: "1.5px solid rgba(169,137,80,0.16)", boxShadow: "0 1px 6px rgba(61,50,42,0.05)" }}>
                {quickItems.map((item, idx) => (
                  <div key={item.href} style={idx > 0 ? { borderTop: "1px solid rgba(169,137,80,0.09)" } : undefined}>
                    <Link href={item.href} className="flex items-center gap-3.5 px-4 py-3.5 transition-colors">
                      <div className="w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: BG_DARK, color: GOLD }}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] tracking-[0.03em]"
                          style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, color: BROWN }}>
                          {item.label}
                        </p>
                        <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "rgba(61,50,42,0.36)" }}>
                          {item.desc}
                        </p>
                      </div>
                      {item.badge != null && item.badge > 0 && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] tracking-[0.06em] flex-shrink-0"
                          style={{ background: "rgba(169,137,80,0.11)", color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                          {item.badge}
                        </span>
                      )}
                      <span className="text-[18px] flex-shrink-0" style={{ color: "rgba(169,137,80,0.40)" }}>›</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {weddings.length === 1 && (
              <div className="flex justify-center pb-2">
                <Link href={`/casamento/${weddings[0].id}/conta-casamento`}
                  className="flex items-center gap-1.5 text-xs transition"
                  style={{ color: "rgba(61,50,42,0.32)" }}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Adicionar outros eventos
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav weddingId={weddings[0]?.id} />
    </div>
  );
}
