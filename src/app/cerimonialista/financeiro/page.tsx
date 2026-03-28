"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { CommissionsChart, MonthlyBar } from "@/components/commissions-chart";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Assignment {
  id: string;
  commissionAmount: number | null;
  commissionPaid: boolean;
  assignedAt: string;
  wedding: {
    partnerName1: string;
    partnerName2: string;
    weddingDate: string | null;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const MONTH_ABBR = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

type Period = "month" | "quarter" | "year";
type SortField = "couple" | "date" | "value" | "status";
type SortDir = "asc" | "desc";

// ─── Component ───────────────────────────────────────────────────────────────

export default function FinanceiroPage() {
  const { status: authStatus } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & sort
  const [period, setPeriod] = useState<Period>("month");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // ── Fetch all commissions (no server-side filtering — we filter client-side)
  const fetchData = useCallback(async () => {
    const res = await fetch("/api/planner/commissions");
    if (!res.ok) return;
    const data = await res.json();
    setAssignments(data.assignments ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated") fetchData();
  }, [authStatus, fetchData]);

  // ── Period filter bounds
  const periodBounds = useMemo<[Date, Date]>(() => {
    const now = new Date();
    if (period === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return [start, end];
    }
    if (period === "quarter") {
      const q = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), q * 3, 1);
      const end = new Date(now.getFullYear(), q * 3 + 3, 0, 23, 59, 59);
      return [start, end];
    }
    // year
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    return [start, end];
  }, [period]);

  // ── Filtered assignments for the table/KPIs
  const filtered = useMemo(() => {
    const [start, end] = periodBounds;
    return assignments.filter((a) => {
      // Use weddingDate if available, else assignedAt
      const raw = a.wedding.weddingDate ?? a.assignedAt;
      const d = new Date(raw);
      return d >= start && d <= end;
    });
  }, [assignments, periodBounds]);

  // ── KPIs
  const totalAccumulated = useMemo(
    () => filtered.reduce((s, a) => s + (a.commissionAmount ?? 0), 0),
    [filtered]
  );
  const totalPending = useMemo(
    () =>
      filtered.filter((a) => !a.commissionPaid).reduce((s, a) => s + (a.commissionAmount ?? 0), 0),
    [filtered]
  );
  const now = new Date();
  const receivedThisMonth = useMemo(() => {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return assignments
      .filter((a) => {
        if (!a.commissionPaid) return false;
        const raw = a.wedding.weddingDate ?? a.assignedAt;
        const d = new Date(raw);
        return d >= start && d <= end;
      })
      .reduce((s, a) => s + (a.commissionAmount ?? 0), 0);
  }, [assignments, now]);

  // ── Chart: last 6 months
  const chartBars = useMemo<MonthlyBar[]>(() => {
    const result: MonthlyBar[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yr = d.getFullYear();
      const mo = d.getMonth();
      const inMonth = assignments.filter((a) => {
        const raw = a.wedding.weddingDate ?? a.assignedAt;
        const ad = new Date(raw);
        return ad.getFullYear() === yr && ad.getMonth() === mo;
      });
      const received = inMonth
        .filter((a) => a.commissionPaid)
        .reduce((s, a) => s + (a.commissionAmount ?? 0), 0);
      const pending = inMonth
        .filter((a) => !a.commissionPaid)
        .reduce((s, a) => s + (a.commissionAmount ?? 0), 0);
      result.push({ label: MONTH_ABBR[mo], year: yr, month: mo, received, pending });
    }
    return result;
  }, [assignments, now]);

  // ── Table sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortField === "couple") {
        const nameA = `${a.wedding.partnerName1} ${a.wedding.partnerName2}`;
        const nameB = `${b.wedding.partnerName1} ${b.wedding.partnerName2}`;
        cmp = nameA.localeCompare(nameB, "pt-BR");
      } else if (sortField === "date") {
        const da = a.wedding.weddingDate ? new Date(a.wedding.weddingDate).getTime() : 0;
        const db = b.wedding.weddingDate ? new Date(b.wedding.weddingDate).getTime() : 0;
        cmp = da - db;
      } else if (sortField === "value") {
        cmp = (a.commissionAmount ?? 0) - (b.commissionAmount ?? 0);
      } else if (sortField === "status") {
        cmp = Number(a.commissionPaid) - Number(b.commissionPaid);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field)
      return (
        <svg className="w-3.5 h-3.5 inline ml-1 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
        </svg>
      );
    return sortDir === "asc" ? (
      <svg className="w-3.5 h-3.5 inline ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-3.5 h-3.5 inline ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 5v14M5 12l7 7 7-7" />
      </svg>
    );
  }

  // ── CSV Export (client-side, uses filtered data for current period)
  function exportCsv() {
    const header = "Casal,Data Casamento,Valor Comissão,Status";
    const rows = sorted.map((a) => {
      const couple = `${a.wedding.partnerName1} & ${a.wedding.partnerName2}`;
      const date = a.wedding.weddingDate
        ? new Date(a.wedding.weddingDate).toLocaleDateString("pt-BR")
        : "";
      const value = a.commissionAmount != null ? `R$ ${a.commissionAmount.toFixed(2)}` : "";
      const status = a.commissionPaid ? "Pago" : "Pendente";
      return [couple, date, value, status].map((v) => `"${v}"`).join(",");
    });

    const csv = "\uFEFF" + [header, ...rows].join("\n"); // BOM for Excel
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comissoes-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Loading state
  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const PERIOD_OPTIONS: { value: Period; label: string }[] = [
    { value: "month", label: "Mês atual" },
    { value: "quarter", label: "Trimestre" },
    { value: "year", label: "Ano" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl text-verde-noite">Financeiro</h1>
          <p className="font-body text-sm text-verde-noite/50 mt-1">
            Comissões e desempenho financeiro
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Period filter */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-4 py-2 font-body text-sm transition ${
                  period === opt.value
                    ? "bg-verde-noite text-white"
                    : "text-verde-noite/60 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 border border-teal text-teal rounded-xl font-body text-sm font-medium hover:bg-teal/5 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="font-body text-sm text-verde-noite/50 mb-1">Total acumulado</p>
          <p className="font-heading text-2xl text-verde-noite">{formatCurrency(totalAccumulated)}</p>
          <p className="font-body text-xs text-verde-noite/40 mt-1">
            {filtered.length} comissão{filtered.length !== 1 ? "ões" : ""}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="font-body text-sm text-verde-noite/50 mb-1">Pendente de receber</p>
          <p className="font-heading text-2xl text-copper">{formatCurrency(totalPending)}</p>
          <p className="font-body text-xs text-verde-noite/40 mt-1">
            {filtered.filter((a) => !a.commissionPaid).length} pendente
            {filtered.filter((a) => !a.commissionPaid).length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="font-body text-sm text-verde-noite/50 mb-1">Recebido este mês</p>
          <p className="font-heading text-2xl text-teal">{formatCurrency(receivedThisMonth)}</p>
          <p className="font-body text-xs text-verde-noite/40 mt-1">
            {MONTH_ABBR[now.getMonth()]} {now.getFullYear()}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <h2 className="font-heading text-lg text-verde-noite mb-5">
          Comissões — últimos 6 meses
        </h2>
        <CommissionsChart bars={chartBars} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-heading text-lg text-verde-noite">Comissões</h2>
        </div>

        {sorted.length === 0 ? (
          <div className="p-16 text-center">
            <p className="font-body text-verde-noite/40 text-sm">
              Nenhuma comissão no período selecionado
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th
                    className="text-left px-6 py-3 font-body text-xs text-verde-noite/50 font-medium uppercase tracking-wide cursor-pointer hover:text-verde-noite transition select-none"
                    onClick={() => toggleSort("couple")}
                  >
                    Casal <SortIcon field="couple" />
                  </th>
                  <th
                    className="text-left px-6 py-3 font-body text-xs text-verde-noite/50 font-medium uppercase tracking-wide cursor-pointer hover:text-verde-noite transition select-none hidden md:table-cell"
                    onClick={() => toggleSort("date")}
                  >
                    Data Casamento <SortIcon field="date" />
                  </th>
                  <th
                    className="text-left px-6 py-3 font-body text-xs text-verde-noite/50 font-medium uppercase tracking-wide cursor-pointer hover:text-verde-noite transition select-none"
                    onClick={() => toggleSort("value")}
                  >
                    Valor <SortIcon field="value" />
                  </th>
                  <th
                    className="text-left px-6 py-3 font-body text-xs text-verde-noite/50 font-medium uppercase tracking-wide cursor-pointer hover:text-verde-noite transition select-none"
                    onClick={() => toggleSort("status")}
                  >
                    Status <SortIcon field="status" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-body text-sm text-verde-noite font-medium">
                      {a.wedding.partnerName1} &amp; {a.wedding.partnerName2}
                    </td>
                    <td className="px-6 py-4 font-body text-sm text-verde-noite/60 hidden md:table-cell">
                      {formatDate(a.wedding.weddingDate)}
                    </td>
                    <td className="px-6 py-4 font-body text-sm text-verde-noite">
                      {a.commissionAmount != null
                        ? formatCurrency(a.commissionAmount)
                        : <span className="text-verde-noite/30">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          a.commissionPaid
                            ? "bg-teal/10 text-teal"
                            : "bg-copper/10 text-copper"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            a.commissionPaid ? "bg-teal" : "bg-copper"
                          }`}
                        />
                        {a.commissionPaid ? "Pago" : "Pendente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
