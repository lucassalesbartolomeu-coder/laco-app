"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface KPIs {
  activeWeddings: number;
  weddingsSoon: number;
  nextEvent: { date: string; couple: string } | null;
  totalCommissions: number;
  pendingCommissions: number;
  pipelineCount: number;
  pipelineValue: number;
}

interface WeddingAssignment {
  assignmentId: string;
  role: string;
  status: string;
  commissionAmount: number | null;
  wedding: {
    id: string;
    partnerName1: string;
    partnerName2: string;
    weddingDate: string | null;
    venue: string | null;
    city: string | null;
    state: string | null;
    estimatedBudget: number | null;
  };
}

interface ReferralData {
  referralCode: string;
  referralCount: number;
}

interface DashboardData {
  planner: { id: string; companyName: string; slug: string };
  kpis: KPIs;
  weddings: WeddingAssignment[];
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function CerimonialDashboard() {
  const { data: session, status: authStatus } = useSession();
  const toast = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [referral, setReferral] = useState<ReferralData | null>(null);

  const [sendingReport, setSendingReport] = useState(false);

  // Link wedding modal
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [codePreview, setCodePreview] = useState<{ partnerName1: string; partnerName2: string } | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);

  useEffect(() => {
    if (authStatus === "loading") return;
    if (authStatus !== "authenticated") {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch("/api/planner/dashboard").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/user/referral").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([dashData, refData]) => {
        setData(dashData);
        setReferral(refData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authStatus]);

  async function validateCode(code: string) {
    if (code.length !== 6) { setCodePreview(null); return; }
    setValidatingCode(true);
    try {
      const res = await fetch(`/api/invite/${code}`);
      if (res.ok) {
        const d = await res.json();
        setCodePreview(d.wedding ?? d);
        setLinkError("");
      } else {
        setCodePreview(null);
        setLinkError("Código inválido ou expirado");
      }
    } catch {
      setCodePreview(null);
    } finally {
      setValidatingCode(false);
    }
  }

  async function handleLinkWedding() {
    if (inviteCode.length !== 6 || !codePreview) return;
    setLinking(true);
    setLinkError("");
    try {
      const res = await fetch("/api/cerimonialista/aceitar-convite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode }),
      });
      if (!res.ok) {
        const d = await res.json();
        setLinkError(d.error || "Erro ao vincular");
      } else {
        setLinkModalOpen(false);
        setInviteCode("");
        setCodePreview(null);
        const r = await fetch("/api/planner/dashboard");
        setData(await r.json());
      }
    } catch {
      setLinkError("Erro de conexao");
    } finally {
      setLinking(false);
    }
  }

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF6EF" }}>
        <div className="w-7 h-7 border-[1.5px] border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#A98950 transparent #A98950 #A98950" }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p className="font-body text-midnight/60">Perfil de cerimonialista nao encontrado.</p>
      </div>
    );
  }

  const { kpis, weddings } = data;

  const filtered = weddings.filter((w) => {
    const matchSearch =
      `${w.wedding.partnerName1} ${w.wedding.partnerName2}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "todos" || w.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="pb-6 lg:pb-8 px-5 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="px-5 pt-10 pb-4">
        <p className="text-[9px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "rgba(61,50,42,0.36)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
          Painel
        </p>
        <h1 className="text-[30px] font-light leading-tight mb-1"
          style={{ color: "#3D322A", fontFamily: "'Cormorant Garamond', serif" }}>
          Olá, {session?.user?.name || "Cerimonialista"}
        </h1>
        <p className="text-[12px] leading-relaxed" style={{ color: "rgba(61,50,42,0.58)" }}>
          {data.planner.companyName}
        </p>
      </div>
      <div className="flex items-center gap-2.5 mx-5 mb-6">
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
        <div className="w-[5px] h-[5px] rotate-45 opacity-55 flex-shrink-0" style={{ background: "#A98950" }} />
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="font-body text-sm text-midnight/50 mb-1">Casamentos Ativos</p>
          <div className="flex items-end gap-2">
            <p className="font-heading text-3xl text-midnight">{kpis.activeWeddings}</p>
            {kpis.weddingsSoon > 0 && (
              <span className="mb-1 inline-flex items-center px-2 py-0.5 bg-gold/10 text-gold text-xs font-body font-medium rounded-full">
                {kpis.weddingsSoon} em 30d
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="font-body text-sm text-midnight/50 mb-1">Proximo Evento</p>
          {kpis.nextEvent ? (
            <>
              <p className="font-heading text-lg text-midnight">{formatDate(kpis.nextEvent.date)}</p>
              <p className="font-body text-xs text-midnight/50 truncate">{kpis.nextEvent.couple}</p>
            </>
          ) : (
            <p className="font-body text-sm text-midnight/40 italic">Nenhum agendado</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="font-body text-sm text-midnight/50 mb-1">Comissoes</p>
          <p className="font-heading text-2xl text-midnight">{formatCurrency(kpis.totalCommissions)}</p>
          {kpis.pendingCommissions > 0 && (
            <p className="font-body text-xs text-gold">{formatCurrency(kpis.pendingCommissions)} pendente</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="font-body text-sm text-midnight/50 mb-1">Pipeline</p>
          <p className="font-heading text-3xl text-midnight">{kpis.pipelineCount}</p>
          {kpis.pipelineValue > 0 && (
            <p className="font-body text-xs text-midnight/50 mt-0.5">{formatCurrency(kpis.pipelineValue)}</p>
          )}
        </div>
      </div>

      {/* Pending commission alert */}
      {kpis.pendingCommissions > 0 && (
        <div className="mb-6 flex items-center justify-between bg-gold/10 border border-gold/20 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="font-body text-sm text-gold font-medium">
              Você tem {formatCurrency(kpis.pendingCommissions)} em comissões pendentes
            </p>
          </div>
          <Link
            href="/cerimonialista/comissoes"
            className="font-body text-xs text-gold border border-gold/40 rounded-lg px-3 py-1.5 hover:bg-gold/5 transition shrink-0"
          >
            Ver comissões
          </Link>
        </div>
      )}

      {/* Weddings Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="font-heading text-2xl text-midnight">Meus Casamentos</h2>
          <button
            onClick={async () => {
              setSendingReport(true);
              try {
                const res = await fetch("/api/planner/report", { method: "POST" });
                if (res.ok) {
                  const d = await res.json();
                  toast.success(`Relatório enviado para ${d.sentTo}`);
                } else {
                  toast.error("Erro ao enviar relatório");
                }
              } catch {
                toast.error("Erro ao enviar relatório");
              } finally {
                setSendingReport(false);
              }
            }}
            disabled={sendingReport}
            className="hidden sm:flex items-center gap-1.5 font-body text-xs text-midnight/50 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition disabled:opacity-40"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {sendingReport ? "Enviando..." : "Relatório mensal"}
          </button>
        </div>
        <button
          onClick={() => setLinkModalOpen(true)}
          className="px-5 py-2.5 bg-gold text-white rounded-xl font-body text-sm font-medium hover:bg-gold/90 transition"
        >
          Vincular a casamento
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar por nome do casal..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl font-body text-midnight bg-white focus:border-midnight focus:ring-1 focus:ring-midnight outline-none transition"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl font-body text-midnight bg-white focus:border-midnight focus:ring-1 focus:ring-midnight outline-none transition appearance-none"
        >
          <option value="todos">Todos</option>
          <option value="ativo">Ativo</option>
          <option value="concluído">Concluido</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Wedding Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm px-6">
          <div className="w-16 h-16 bg-midnight/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-midnight/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          {search || filterStatus !== "todos" ? (
            <p className="font-body text-midnight/40">Nenhum casamento encontrado com esses filtros</p>
          ) : (
            <>
              <p className="font-heading text-lg text-midnight mb-1">Nenhum casamento ainda</p>
              <p className="font-body text-sm text-midnight/40 mb-4">Vincule-se ao primeiro casamento e comece a organizar tudo em um lugar só.</p>
              <button
                onClick={() => setLinkModalOpen(true)}
                className="inline-flex px-5 py-2.5 bg-gold text-white rounded-xl font-body text-sm font-medium hover:bg-gold/90 transition"
              >
                Vincular primeiro casamento
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <Link
              key={item.assignmentId}
              href={`/cerimonialista/casamento/${item.wedding.id}`}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 p-5 block"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-heading text-lg text-midnight">
                  {item.wedding.partnerName1} & {item.wedding.partnerName2}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-body font-medium ${
                    item.status === "ativo"
                      ? "bg-green-100 text-green-700"
                      : item.status === "concluído"
                        ? "bg-gray-100 text-gray-500"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              {item.wedding.weddingDate && (
                <p className="font-body text-sm text-midnight/70 mb-1">
                  {formatDate(item.wedding.weddingDate)}
                </p>
              )}

              {(item.wedding.venue || item.wedding.city) && (
                <p className="font-body text-sm text-midnight/50 mb-3">
                  {item.wedding.venue || ""} {item.wedding.city ? `— ${item.wedding.city}/${item.wedding.state}` : ""}
                </p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="font-body text-xs text-midnight bg-midnight/10 px-2 py-1 rounded-full">
                  {item.role}
                </span>
                {item.wedding.estimatedBudget && (
                  <span className="font-body text-sm text-midnight/60">
                    {formatCurrency(item.wedding.estimatedBudget)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Portfolio Card */}
      {data.planner.slug && (
        <div className="mt-8 bg-white rounded-2xl shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading text-lg text-midnight mb-1">Seu portfólio público</h3>
            <p className="font-body text-sm text-midnight/50">
              Compartilhe seu portfólio com casais para receber mais leads.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                const url = `${window.location.origin}/cerimonialista/${data.planner.slug}/portfolio`;
                navigator.clipboard.writeText(url);
                toast.success("Link copiado!");
              }}
              className="px-4 py-2 border border-gray-200 text-midnight rounded-xl font-body text-sm hover:bg-fog transition"
            >
              Copiar link
            </button>
            <Link
              href="/cerimonialista/portfolio"
              className="px-4 py-2 bg-midnight text-white rounded-xl font-body text-sm font-medium hover:bg-midnight/90 transition"
            >
              Gerenciar
            </Link>
          </div>
        </div>
      )}

      {/* Referral Banner */}
      {referral && (
        <div className="mt-10 bg-midnight rounded-2xl p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-heading text-xl mb-1">Indique e Ganhe</h3>
              <p className="font-body text-sm text-white/60">
                Compartilhe seu codigo e ganhe beneficios quando novos casais se cadastrarem.
                {referral.referralCount > 0 && (
                  <span className="ml-1 text-gold font-medium">
                    {referral.referralCount} indicacao{referral.referralCount !== 1 ? "s" : ""} feita{referral.referralCount !== 1 ? "s" : ""}!
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <code className="bg-white/10 px-3 py-1.5 rounded-lg font-body text-sm tracking-widest font-bold">
                {referral.referralCode}
              </code>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/registro?ref=${referral.referralCode}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Link copiado!");
                }}
                className="px-4 py-2 bg-gold text-white rounded-lg font-body text-sm font-medium hover:bg-gold/90 transition"
              >
                Copiar link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Wedding Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-heading text-xl text-midnight mb-2">Vincular a casamento</h2>
            <p className="font-body text-sm text-midnight/60 mb-5">
              Insira o código de 6 caracteres que o casal gerou no app.
            </p>

            <div className="relative mb-3">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
                  setInviteCode(val);
                  setLinkError("");
                  setCodePreview(null);
                  if (val.length === 6) validateCode(val);
                }}
                placeholder="ABC123"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl font-display text-2xl tracking-[0.3em] text-midnight bg-white focus:border-midnight focus:ring-1 focus:ring-midnight outline-none transition uppercase text-center"
                onKeyDown={(e) => e.key === "Enter" && handleLinkWedding()}
              />
              {validatingCode && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {codePreview && (
              <div className="flex items-center gap-2 mb-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className="font-body text-sm text-green-700 font-medium">
                  {codePreview.partnerName1} & {codePreview.partnerName2}
                </p>
              </div>
            )}

            {linkError && <p className="font-body text-sm text-red-600 mb-3">{linkError}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => { setLinkModalOpen(false); setLinkError(""); setInviteCode(""); setCodePreview(null); }}
                className="flex-1 py-2.5 border border-gray-300 text-midnight/70 rounded-xl font-body text-sm hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleLinkWedding}
                disabled={linking || !codePreview}
                className="flex-1 py-2.5 bg-gold text-white rounded-xl font-body text-sm font-medium hover:bg-gold/90 transition disabled:opacity-50"
              >
                {linking ? "Vinculando..." : "Vincular"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
