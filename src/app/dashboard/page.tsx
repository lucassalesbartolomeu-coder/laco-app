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
      if (res.ok) {
        const link = `${window.location.origin}/parceiro/${data.token}`;
        setInviteLink(link);
      }
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
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
        </svg>
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

function DaysUntil({ dateStr }: { dateStr: string }) {
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (days < 0) return null;
  if (days === 0) return <span className="text-copper font-medium">Hoje!</span>;
  return (
    <span className="text-xs font-body text-verde-noite/50">
      {days === 1 ? "amanhã" : `em ${days} dias`}
    </span>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = (session?.user as { id?: string })?.id ?? "";

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const loadWeddings = useCallback(() => {
    if (status !== "authenticated") return;
    fetch("/api/weddings")
      .then((r) => r.json())
      .then((data) => {
        setWeddings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

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

  const formatDate = (d: string | null) => {
    if (!d) return "Data a definir";
    return new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (v: number | null) => {
    if (!v) return null;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(v);
  };

  const firstName = session?.user?.name?.split(" ")[0] ?? session?.user?.email?.split("@")[0] ?? "";

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-heading text-2xl font-semibold text-verde-noite tracking-wide">
            Laço
          </Link>
          <span className="text-xs font-body text-verde-noite/40 hidden sm:block">{session?.user?.email}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="font-heading text-3xl font-semibold text-verde-noite">
            {firstName ? `Olá, ${firstName}` : "Meus casamentos"}
          </h2>
          <p className="font-body text-sm text-verde-noite/50 mt-1">
            Organize tudo em um só lugar
          </p>
        </div>

        {weddings.length === 0 ? (
          /* ── Empty state ── */
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Decorative top bar */}
            <div className="h-1.5 bg-gradient-to-r from-teal via-copper to-teal/40" />

            <div className="px-8 py-14 text-center">
              {/* Icon */}
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

              {/* Social proof */}
              <p className="font-body text-xs text-verde-noite/35 mt-8">
                Mais de 2.400 casais já usam o Laço
              </p>
            </div>
          </div>
        ) : (
          /* ── Wedding cards ── */
          <div className="space-y-5">
            {/* Add new button */}
            <div className="flex items-center justify-between">
              <p className="font-body text-sm text-verde-noite/40">
                {weddings.length} {weddings.length === 1 ? "casamento" : "casamentos"}
              </p>
              <Link
                href="/casamento/novo"
                className="flex items-center gap-1.5 px-4 py-2 bg-copper text-white rounded-xl font-body text-sm font-medium hover:bg-copper/90 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Novo
              </Link>
            </div>

            {weddings.map((w) => (
              <div key={w.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Top accent */}
                <div className="h-1 bg-gradient-to-r from-teal/60 to-copper/60" />

                <div className="p-6">
                  {/* Names row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading text-xl font-semibold text-verde-noite leading-tight">
                          {w.partnerName1} &amp; {w.partnerName2}
                        </h3>
                        {w.userId !== userId && (
                          <span className="text-xs font-body text-teal bg-teal/10 px-2 py-0.5 rounded-full">
                            parceiro(a)
                          </span>
                        )}
                      </div>

                      {/* Meta info */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        <div className="flex items-center gap-1.5 text-sm text-verde-noite/60">
                          <svg className="w-3.5 h-3.5 text-verde-noite/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-body text-xs">{formatDate(w.weddingDate)}</span>
                          {w.weddingDate && <DaysUntil dateStr={w.weddingDate} />}
                        </div>
                        {w.city && (
                          <div className="flex items-center gap-1.5 text-sm text-verde-noite/60">
                            <svg className="w-3.5 h-3.5 text-verde-noite/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-body text-xs">{w.city}{w.state ? `, ${w.state}` : ""}</span>
                          </div>
                        )}
                        {w.estimatedGuests && (
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-verde-noite/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-body text-xs text-verde-noite/60">{w.estimatedGuests} convidados</span>
                          </div>
                        )}
                        {formatCurrency(w.estimatedBudget) && (
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-verde-noite/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-body text-xs text-verde-noite/60">{formatCurrency(w.estimatedBudget)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/casamento/${w.id}/convidados`}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-body font-medium border border-gray-200 text-verde-noite/70 rounded-xl hover:border-teal hover:text-teal transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Convidados
                    </Link>
                    <Link
                      href={`/casamento/${w.id}/importar`}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-body font-medium border border-gray-200 text-verde-noite/70 rounded-xl hover:border-teal hover:text-teal transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Importar
                    </Link>
                    <Link
                      href={`/casamento/${w.id}/identity-kit`}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-body font-medium border border-copper/40 text-copper rounded-xl hover:bg-copper/5 transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      Identity Kit
                    </Link>
                    <Link
                      href={`/casamento/${w.id}/confirmacoes`}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-body font-medium border border-teal/40 text-teal rounded-xl hover:bg-teal/5 transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Confirmações
                    </Link>
                    <Link
                      href={`/casamento/${w.id}/simulador`}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-body font-medium bg-copper text-white rounded-xl hover:bg-copper/90 transition ml-auto"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Simulador
                    </Link>
                  </div>

                  {/* Partner panel */}
                  <PartnerInvitePanel
                    wedding={w}
                    currentUserId={userId}
                    onUpdate={loadWeddings}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav weddingId={weddings[0]?.id} />
    </div>
  );
}
