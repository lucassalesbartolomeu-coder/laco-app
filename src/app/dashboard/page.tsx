"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import BottomNav from "@/components/bottom-nav";

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

// ── Helper: days until wedding ──────────────────────────────────
function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = Math.ceil(
    (new Date(dateStr).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000
  );
  return diff;
}

// ── Countdown ring ───────────────────────────────────────────────
function CountdownRing({ days }: { days: number }) {
  const max = 365;
  const pct = Math.max(0, Math.min(1, days / max));
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg viewBox="0 0 88 88" className="w-24 h-24 -rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-white/20" />
        <circle
          cx="44" cy="44" r={r} fill="none"
          stroke="currentColor" strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          className="text-white"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-2xl font-bold text-white leading-none">{days}</span>
        <span className="font-body text-[10px] text-white/70 leading-none mt-0.5">dias</span>
      </div>
    </div>
  );
}

// ── Stat tile ────────────────────────────────────────────────────
function StatTile({
  label,
  value,
  sub,
  color = "teal",
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: "teal" | "copper" | "green";
  icon: React.ReactNode;
}) {
  const colors = {
    teal: "bg-teal/10 text-teal",
    copper: "bg-copper/10 text-copper",
    green: "bg-green-50 text-green-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="font-heading text-2xl font-semibold text-verde-noite leading-none">{value}</p>
        {sub && <p className="font-body text-[10px] text-verde-noite/40 mt-0.5">{sub}</p>}
        <p className="font-body text-xs text-verde-noite/50 mt-1">{label}</p>
      </div>
    </div>
  );
}

// ── Quick action tile ────────────────────────────────────────────
function ActionTile({
  href,
  icon,
  label,
  badge,
  highlight,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number | null;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border py-5 transition-all active:scale-[0.97] ${
        highlight
          ? "bg-copper text-white border-transparent shadow-sm hover:bg-copper/90"
          : "bg-white border-gray-100 shadow-sm hover:border-teal/40 hover:shadow-md"
      }`}
    >
      <div className={highlight ? "text-white" : "text-teal"}>{icon}</div>
      <span className={`font-body text-xs font-medium text-center leading-tight ${highlight ? "text-white" : "text-verde-noite/70"}`}>
        {label}
      </span>
      {badge != null && badge > 0 && (
        <span className="absolute top-2.5 right-2.5 bg-red-400 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

// ── PartnerInvitePanel ───────────────────────────────────────────
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

  const isOwner = wedding.userId === currentUserId;
  const hasPartner = !!wedding.partnerUserId;

  async function generateInvite() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/weddings/${wedding.id}/partner`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setInviteLink(`${window.location.origin}/parceiro/${data.token}`);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  }

  async function unlinkPartner() {
    if (!confirm("Desvincular o parceiro? Ele perderá acesso ao casamento.")) return;
    setUnlinking(true);
    try {
      await fetch(`/api/weddings/${wedding.id}/partner`, { method: "DELETE" });
      onUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setUnlinking(false);
    }
  }

  function copyLink() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!isOwner) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-body text-teal bg-teal/10 px-2.5 py-1 rounded-full w-fit">
        Casamento compartilhado
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      {hasPartner ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="font-body text-xs text-verde-noite/60">Parceiro(a) vinculado(a)</span>
          </div>
          <button
            onClick={unlinkPartner}
            disabled={unlinking}
            className="text-xs font-body text-red-400 hover:text-red-600 transition"
          >
            {unlinking ? "Desvinculando…" : "Desvincular"}
          </button>
        </div>
      ) : inviteLink ? (
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={inviteLink}
            className="flex-1 text-xs font-body bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-verde-noite/70 min-w-0"
          />
          <button
            onClick={copyLink}
            className={`px-3 py-1.5 rounded-lg text-xs font-body transition flex-shrink-0 ${
              copied ? "bg-green-100 text-green-700" : "bg-teal text-white hover:bg-teal/90"
            }`}
          >
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
      ) : (
        <button
          onClick={generateInvite}
          disabled={generating}
          className="flex items-center gap-1.5 text-xs font-body text-verde-noite/50 hover:text-teal transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          {generating ? "Gerando link…" : "Convidar parceiro(a)"}
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
        // Fetch guest stats for first wedding
        if (list.length > 0) fetchGuestStats(list[0].id);
      })
      .catch(() => setLoading(false));
  }, [status]);

  async function fetchGuestStats(weddingId: string) {
    try {
      const res = await fetch(`/api/weddings/${weddingId}/guests/stats`);
      if (!res.ok) return;
      const stats = await res.json();
      setGuestStats({
        total: stats.total,
        confirmed: stats.confirmed,
        declined: stats.declined,
        pending: stats.pending,
      });
    } catch {
      // silently fail
    }
  }

  async function deleteWedding(id: string) {
    if (!confirm("Tem certeza que quer apagar este casamento? Esta ação não pode ser desfeita.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/weddings/${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = weddings.filter((ww) => ww.id !== id);
        setWeddings(updated);
        if (updated.length === 0) router.push("/casamento/novo");
        else if (updated.length > 0 && id === weddings[0].id) fetchGuestStats(updated[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => { loadWeddings(); }, [loadWeddings]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const interval = setInterval(loadWeddings, 30000);
    return () => clearInterval(interval);
  }, [status, loadWeddings]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-sm text-verde-noite/40">Carregando…</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (v: number | null) => {
    if (!v) return null;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(v);
  };

  const firstName = session?.user?.name?.split(" ")[0] ?? session?.user?.email?.split("@")[0] ?? "";
  const w = weddings[0] ?? null;
  const days = w ? daysUntil(w.weddingDate) : null;

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-logo text-2xl font-semibold text-verde-noite tracking-wide">
            Laço
          </Link>
          <Link href="/perfil" className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center text-teal hover:bg-teal/20 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* ── Greeting ── */}
        <div>
          <h2 className="font-heading text-2xl font-semibold text-verde-noite">
            {firstName ? `Olá, ${firstName}` : "Bem-vindo"}
          </h2>
          <p className="font-body text-sm text-verde-noite/50 mt-0.5">
            {w ? "Seu painel de casamento" : "Comece organizando seu casamento"}
          </p>
        </div>

        {!w ? (
          /* ── Empty state ── */
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-teal via-copper to-teal/40" />
            <div className="px-8 py-14 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-copper/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-copper" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-heading text-2xl font-semibold text-verde-noite mb-2">
                Seu casamento começa aqui
              </h3>
              <p className="font-body text-verde-noite/55 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
                Crie seu casamento e comece a organizar convidados, fornecedores e muito mais — tudo num só lugar.
              </p>
              <Link
                href="/casamento/novo"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-copper text-white rounded-xl font-body font-medium hover:bg-copper/90 transition-all active:scale-[0.98]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Criar meu casamento
              </Link>
              <p className="font-body text-xs text-verde-noite/35 mt-8">
                Mais de 2.400 casais já usam o Laço
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Hero countdown ── */}
            <div className="bg-gradient-to-br from-teal to-teal/80 rounded-3xl p-6 shadow-sm overflow-hidden relative">
              {/* decorative circle */}
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
              <div className="absolute -bottom-12 -left-6 w-32 h-32 bg-white/5 rounded-full" />

              <div className="relative flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-body text-xs text-white/60 uppercase tracking-widest">
                      {days != null && days >= 0 ? "Contagem regressiva" : "Casamento realizado"}
                    </p>
                    {w.userId === userId && (
                      <button
                        onClick={() => deleteWedding(w.id)}
                        disabled={deletingId === w.id}
                        className="ml-auto flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-400/40 text-white/50 hover:text-white transition"
                        title="Apagar casamento"
                      >
                        {deletingId === w.id ? (
                          <div className="w-3.5 h-3.5 border border-white/50 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-white truncate">
                    {w.partnerName1} &amp; {w.partnerName2}
                  </h3>
                  {w.weddingDate && (
                    <p className="font-body text-sm text-white/70 mt-1">
                      {new Date(w.weddingDate).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  {w.city && (
                    <p className="font-body text-xs text-white/50 mt-0.5">
                      {w.city}{w.state ? `, ${w.state}` : ""}
                    </p>
                  )}

                  {/* Completion badges */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {w.estimatedGuests && (
                      <div className="flex items-center gap-1 bg-white/15 rounded-full px-2.5 py-1">
                        <svg className="w-3 h-3 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-body text-xs text-white/80">{w.estimatedGuests} convidados</span>
                      </div>
                    )}
                    {formatCurrency(w.estimatedBudget) && (
                      <div className="flex items-center gap-1 bg-white/15 rounded-full px-2.5 py-1">
                        <svg className="w-3 h-3 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-body text-xs text-white/80">{formatCurrency(w.estimatedBudget)}</span>
                      </div>
                    )}
                    {w.style && (
                      <div className="flex items-center gap-1 bg-white/15 rounded-full px-2.5 py-1">
                        <span className="font-body text-xs text-white/80">{w.style}</span>
                      </div>
                    )}
                  </div>
                </div>

                {days != null && days >= 0 && <CountdownRing days={days} />}
              </div>
            </div>

            {/* ── Stats row ── */}
            {guestStats && guestStats.total > 0 && (
              <div className="grid grid-cols-3 gap-3">
                <StatTile
                  label="Confirmados"
                  value={guestStats.confirmed}
                  sub={`de ${guestStats.total}`}
                  color="green"
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <StatTile
                  label="Pendentes"
                  value={guestStats.pending}
                  color="copper"
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <StatTile
                  label="Recusados"
                  value={guestStats.declined}
                  color="teal"
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
              </div>
            )}

            {/* ── Quick actions ── */}
            <div>
              <p className="font-body text-xs font-medium text-verde-noite/40 uppercase tracking-wider mb-3">
                Acesso rápido
              </p>
              <div className="grid grid-cols-3 gap-3">
                <ActionTile
                  href={`/casamento/${w.id}/convidados`}
                  label="Convidados"
                  badge={guestStats?.total ?? null}
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                />
                <ActionTile
                  href={`/casamento/${w.id}/confirmacoes`}
                  label="Confirmações"
                  badge={guestStats?.pending ?? null}
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <ActionTile
                  href={`/casamento/${w.id}/importar`}
                  label="Importar"
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  }
                />
                <ActionTile
                  href={`/casamento/${w.id}/identity-kit`}
                  label="Identity Kit"
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  }
                />
                <ActionTile
                  href={`/casamento/${w.id}/fornecedores`}
                  label="Fornecedores"
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                />
                <ActionTile
                  href={`/casamento/${w.id}/simulador`}
                  label="Simulador"
                  highlight
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  }
                />
              </div>
            </div>

            {/* ── Partner section ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="font-body text-xs font-medium text-verde-noite/40 uppercase tracking-wider mb-3">
                Parceiro(a)
              </p>
              <PartnerInvitePanel
                wedding={w}
                currentUserId={userId}
                onUpdate={loadWeddings}
              />
            </div>

            {/* ── Multiple weddings ── */}
            {weddings.length > 1 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-body text-xs font-medium text-verde-noite/40 uppercase tracking-wider">
                    Outros casamentos
                  </p>
                  <Link
                    href="/casamento/novo"
                    className="flex items-center gap-1 font-body text-xs text-copper hover:text-copper/80 transition"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Novo
                  </Link>
                </div>
                <div className="space-y-2">
                  {weddings.slice(1).map((ww) => (
                    <div key={ww.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-heading text-sm font-semibold text-verde-noite">
                          {ww.partnerName1} &amp; {ww.partnerName2}
                        </p>
                        {ww.weddingDate && (
                          <p className="font-body text-xs text-verde-noite/50 mt-0.5">
                            {new Date(ww.weddingDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                          href={`/casamento/${ww.id}/convidados`}
                          className="px-3 py-1.5 text-xs font-body text-teal border border-teal/30 rounded-xl hover:bg-teal/5 transition"
                        >
                          Abrir
                        </Link>
                        {ww.userId === userId && (
                          <button
                            onClick={() => deleteWedding(ww.id)}
                            disabled={deletingId === ww.id}
                            className="w-8 h-8 flex items-center justify-center rounded-xl border border-red-100 text-red-300 hover:bg-red-50 hover:text-red-500 transition"
                            title="Apagar casamento"
                          >
                            {deletingId === ww.id ? (
                              <div className="w-3.5 h-3.5 border border-red-300 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Add new wedding (single) ── */}
            {weddings.length === 1 && (
              <div className="flex justify-center">
                <Link
                  href="/casamento/novo"
                  className="flex items-center gap-1.5 font-body text-xs text-verde-noite/40 hover:text-verde-noite/60 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Adicionar outro casamento
                </Link>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav weddingId={weddings[0]?.id} />
    </div>
  );
}
