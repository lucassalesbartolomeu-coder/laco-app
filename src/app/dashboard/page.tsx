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
    // Partner view — just show a badge
    return (
      <div className="flex items-center gap-1.5 text-xs font-body text-teal bg-teal/10 px-2.5 py-1 rounded-full">
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
            <span className="font-body text-xs text-verde-noite/60">Parceiro vinculado</span>
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
          Convidar parceiro(a)
        </button>
      )}
    </div>
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

  // Poll for changes every 30s (sync between partners)
  useEffect(() => {
    if (status !== "authenticated") return;
    const interval = setInterval(loadWeddings, 30000);
    return () => clearInterval(interval);
  }, [status, loadWeddings]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="animate-pulse font-heading text-2xl text-verde-noite/50">
          Carregando...
        </div>
      </div>
    );
  }

  const formatDate = (d: string | null) => {
    if (!d) return "A definir";
    return new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (v: number | null) => {
    if (!v) return "A definir";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(v);
  };

  return (
    <div className="min-h-screen bg-off-white pb-20">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-heading text-3xl font-semibold text-verde-noite">Laco</h1>
          <span className="text-sm text-verde-noite/60">{session?.user?.email}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading text-3xl font-semibold text-verde-noite">
            Meus Casamentos
          </h2>
          <Link
            href="/casamento/novo"
            className="px-6 py-3 bg-copper text-white rounded-xl font-medium hover:bg-copper/90 transition"
          >
            + Novo Casamento
          </Link>
        </div>

        {weddings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">&#128141;</div>
            <h3 className="font-heading text-2xl font-semibold text-verde-noite mb-2">
              Nenhum casamento ainda
            </h3>
            <p className="text-verde-noite/60 mb-6">
              Comece criando seu primeiro casamento e organize tudo em um só lugar.
            </p>
            <Link
              href="/casamento/novo"
              className="inline-block px-8 py-3 bg-copper text-white rounded-xl font-medium hover:bg-copper/90 transition"
            >
              Criar meu casamento
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {weddings.map((w) => (
              <div
                key={w.id}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-heading text-2xl font-semibold text-verde-noite">
                        {w.partnerName1} &amp; {w.partnerName2}
                      </h3>
                      {w.userId !== userId && (
                        <span className="text-xs font-body text-teal bg-teal/10 px-2 py-0.5 rounded-full">
                          parceiro(a)
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-verde-noite/60">
                      {w.weddingDate && <span>&#128197; {formatDate(w.weddingDate)}</span>}
                      {w.city && (
                        <span>
                          &#128205; {w.city}{w.state ? `, ${w.state}` : ""}
                        </span>
                      )}
                      {w.style && <span>&#10024; {w.style}</span>}
                      {w.estimatedGuests && (
                        <span>&#128101; {w.estimatedGuests} convidados</span>
                      )}
                      {w.estimatedBudget && (
                        <span>&#128176; {formatCurrency(w.estimatedBudget)}</span>
                      )}
                    </div>

                    {/* Partner invite panel */}
                    <PartnerInvitePanel
                      wedding={w}
                      currentUserId={userId}
                      onUpdate={loadWeddings}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <Link
                      href={`/casamento/${w.id}/convidados`}
                      className="px-4 py-2 text-sm border border-teal text-teal rounded-xl hover:bg-teal/5 transition"
                    >
                      Convidados
                    </Link>
                    <Link
                      href={`/casamento/${w.id}/importar`}
                      className="px-4 py-2 text-sm border border-teal text-teal rounded-xl hover:bg-teal/5 transition"
                    >
                      Importar
                    </Link>
                    <Link
                      href={`/casamento/${w.id}/identity-kit`}
                      className="px-4 py-2 text-sm border border-copper text-copper rounded-xl hover:bg-copper/5 transition"
                    >
                      ✨ Identity Kit
                    </Link>
                    <Link
                      href={`/casamento/${w.id}/simulador`}
                      className="px-4 py-2 text-sm bg-copper text-white rounded-xl hover:bg-copper/90 transition"
                    >
                      Simulador
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
