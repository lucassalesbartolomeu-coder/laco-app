"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Assignment {
  id: string;
  weddingId: string;
  role: string;
  status: string;
  commissionAmount: number | null;
  commissionPaid: boolean;
  assignedAt: string;
  wedding: {
    id: string;
    partnerName1: string;
    partnerName2: string;
    weddingDate: string | null;
    city: string | null;
  };
  teamMember: { id: string; name: string } | null;
}

interface CommissionsData {
  assignments: Assignment[];
  totalPending: number;
  totalPaid: number;
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ComissoesPage() {
  const { status: authStatus } = useSession();
  const [data, setData] = useState<CommissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<{ id: string; value: string } | null>(null);

  async function load() {
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    if (statusFilter !== "all") params.set("status", statusFilter);

    const res = await fetch(`/api/planner/commissions?${params}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    if (authStatus === "authenticated") load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, month, statusFilter]);

  async function togglePaid(id: string, current: boolean) {
    await fetch(`/api/planner/commissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commissionPaid: !current }),
    });
    await load();
  }

  async function updateAmount(id: string, value: string) {
    await fetch(`/api/planner/commissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commissionAmount: value ? Number(value) : null }),
    });
    setEditing(null);
    await load();
  }

  function exportCsv() {
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    window.open(`/api/planner/commissions/export?${params}`, "_blank");
  }

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const assignments = data?.assignments ?? [];

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-midnight">Comissões</h1>
          <p className="font-body text-sm text-midnight/50 mt-1">
            Controle de comissões por casamento
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="px-5 py-2.5 border border-midnight text-midnight rounded-xl font-body text-sm font-medium hover:bg-midnight/5 transition"
        >
          Exportar CSV
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="font-body text-sm text-midnight/50 mb-1">Total Pendente</p>
          <p className="font-heading text-2xl text-gold">{formatCurrency(data?.totalPending ?? 0)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="font-body text-sm text-midnight/50 mb-1">Total Recebido</p>
          <p className="font-heading text-2xl text-midnight">{formatCurrency(data?.totalPaid ?? 0)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl font-body text-midnight bg-white focus:border-gold outline-none"
        />
        <div className="flex gap-1">
          {[
            { value: "all", label: "Todas" },
            { value: "pending", label: "Pendentes" },
            { value: "paid", label: "Pagas" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-4 py-2 rounded-xl font-body text-sm transition ${
                statusFilter === opt.value
                  ? "bg-midnight text-white"
                  : "bg-white border border-gray-300 text-midnight/70 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {assignments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <p className="font-body text-midnight/40">Nenhuma comissão encontrada</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 font-body text-sm text-midnight/50 font-medium">Casal</th>
                <th className="text-left px-6 py-4 font-body text-sm text-midnight/50 font-medium hidden md:table-cell">Data</th>
                <th className="text-left px-6 py-4 font-body text-sm text-midnight/50 font-medium">Comissão</th>
                <th className="text-left px-6 py-4 font-body text-sm text-midnight/50 font-medium">Status</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assignments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <p className="font-body font-medium text-midnight text-sm">
                      {a.wedding.partnerName1} &amp; {a.wedding.partnerName2}
                    </p>
                    {a.wedding.city && (
                      <p className="font-body text-xs text-midnight/40">{a.wedding.city}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell font-body text-sm text-midnight/60">
                    {formatDate(a.wedding.weddingDate)}
                  </td>
                  <td className="px-6 py-4">
                    {editing?.id === a.id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          value={editing.value}
                          onChange={(e) => setEditing({ id: a.id, value: e.target.value })}
                          className="w-28 px-2 py-1 border border-gray-300 rounded-lg font-body text-sm text-midnight"
                          autoFocus
                        />
                        <button
                          onClick={() => updateAmount(a.id, editing.value)}
                          className="px-2 py-1 bg-midnight text-white rounded-lg text-xs"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="px-2 py-1 text-gray-400 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          setEditing({ id: a.id, value: a.commissionAmount?.toString() ?? "" })
                        }
                        className="font-body text-sm text-midnight hover:underline"
                      >
                        {a.commissionAmount != null ? formatCurrency(a.commissionAmount) : "— definir"}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        a.commissionPaid
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {a.commissionPaid ? "Paga" : "Pendente"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => togglePaid(a.id, a.commissionPaid)}
                      className={`px-3 py-1.5 rounded-lg font-body text-xs font-medium transition ${
                        a.commissionPaid
                          ? "border border-gray-300 text-gray-500 hover:bg-gray-50"
                          : "bg-midnight text-white hover:bg-midnight/90"
                      }`}
                    >
                      {a.commissionPaid ? "Desmarcar" : "Marcar como paga"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
