"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface KPIs {
  activeWeddings: number;
  nextEvent: { date: string; couple: string } | null;
  totalCommissions: number;
  pendingCommissions: number;
  pipelineCount: number;
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

interface DashboardData {
  planner: { id: string; companyName: string };
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
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");

  // Link wedding modal
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkWeddingId, setLinkWeddingId] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState("");

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    fetch("/api/planner/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authStatus]);

  async function handleLinkWedding() {
    if (!linkWeddingId.trim()) return;
    setLinking(true);
    setLinkError("");
    try {
      const res = await fetch(`/api/weddings/${linkWeddingId.trim()}/planner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept", role: "principal" }),
      });
      if (!res.ok) {
        const d = await res.json();
        setLinkError(d.error || "Erro ao vincular");
      } else {
        setLinkModalOpen(false);
        setLinkWeddingId("");
        // Refresh
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p className="font-body text-verde-noite/60">Perfil de cerimonialista nao encontrado.</p>
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
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-verde-noite">
          Ola, {session?.user?.name || "Cerimonialista"}
        </h1>
        <p className="font-body text-verde-noite/50 mt-1">{data.planner.companyName}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="font-body text-sm text-verde-noite/50 mb-1">Casamentos Ativos</p>
          <p className="font-heading text-3xl text-verde-noite">{kpis.activeWeddings}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="font-body text-sm text-verde-noite/50 mb-1">Proximo Evento</p>
          {kpis.nextEvent ? (
            <>
              <p className="font-heading text-lg text-verde-noite">{formatDate(kpis.nextEvent.date)}</p>
              <p className="font-body text-xs text-verde-noite/50 truncate">{kpis.nextEvent.couple}</p>
            </>
          ) : (
            <p className="font-body text-sm text-verde-noite/40 italic">Nenhum agendado</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="font-body text-sm text-verde-noite/50 mb-1">Comissoes</p>
          <p className="font-heading text-2xl text-verde-noite">{formatCurrency(kpis.totalCommissions)}</p>
          {kpis.pendingCommissions > 0 && (
            <p className="font-body text-xs text-copper">{formatCurrency(kpis.pendingCommissions)} pendente</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="font-body text-sm text-verde-noite/50 mb-1">Pipeline</p>
          <p className="font-heading text-3xl text-verde-noite">{kpis.pipelineCount}</p>
          {kpis.pipelineCount > 5 && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-copper/10 text-copper text-xs font-body font-medium rounded-full">
              Atencao
            </span>
          )}
        </div>
      </div>

      {/* Weddings Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="font-heading text-2xl text-verde-noite">Meus Casamentos</h2>
        <button
          onClick={() => setLinkModalOpen(true)}
          className="px-5 py-2.5 bg-copper text-white rounded-xl font-body text-sm font-medium hover:bg-copper/90 transition"
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
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl font-body text-verde-noite bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl font-body text-verde-noite bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition appearance-none"
        >
          <option value="todos">Todos</option>
          <option value="ativo">Ativo</option>
          <option value="concluído">Concluido</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Wedding Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <p className="font-body text-verde-noite/40">Nenhum casamento vinculado ainda</p>
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
                <h3 className="font-heading text-lg text-verde-noite">
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
                <p className="font-body text-sm text-verde-noite/70 mb-1">
                  {formatDate(item.wedding.weddingDate)}
                </p>
              )}

              {(item.wedding.venue || item.wedding.city) && (
                <p className="font-body text-sm text-verde-noite/50 mb-3">
                  {item.wedding.venue || ""} {item.wedding.city ? `— ${item.wedding.city}/${item.wedding.state}` : ""}
                </p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="font-body text-xs text-teal bg-teal/10 px-2 py-1 rounded-full">
                  {item.role}
                </span>
                {item.wedding.estimatedBudget && (
                  <span className="font-body text-sm text-verde-noite/60">
                    {formatCurrency(item.wedding.estimatedBudget)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Link Wedding Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-heading text-xl text-verde-noite mb-2">Vincular a casamento</h2>
            <p className="font-body text-sm text-verde-noite/60 mb-5">
              Insira o ID ou codigo do casamento para se vincular.
            </p>

            <input
              type="text"
              value={linkWeddingId}
              onChange={(e) => setLinkWeddingId(e.target.value)}
              placeholder="ID do casamento"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-verde-noite bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition mb-3"
              onKeyDown={(e) => e.key === "Enter" && handleLinkWedding()}
            />

            {linkError && <p className="font-body text-sm text-red-600 mb-3">{linkError}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => { setLinkModalOpen(false); setLinkError(""); }}
                className="flex-1 py-2.5 border border-gray-300 text-verde-noite/70 rounded-xl font-body text-sm hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleLinkWedding}
                disabled={linking}
                className="flex-1 py-2.5 bg-copper text-white rounded-xl font-body text-sm font-medium hover:bg-copper/90 transition disabled:opacity-50"
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
