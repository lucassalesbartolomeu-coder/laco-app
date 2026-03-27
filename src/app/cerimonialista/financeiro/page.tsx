"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

interface BudgetEntry {
  id: string;
  category: string;
  description: string;
  estimatedCost: number;
  actualCost: number | null;
  paidAmount: number;
  status: string;
  dueDate: string | null;
  weddingName: string;
}

interface CommissionEntry {
  weddingName: string;
  amount: number | null;
  paid: boolean;
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function FinanceiroPage() {
  const { status: authStatus } = useSession();
  const [budgets, setBudgets] = useState<BudgetEntry[]>([]);
  const [commissions, setCommissions] = useState<CommissionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/planner/weddings");
    if (!res.ok) return;
    const assignments = await res.json();

    const allBudgets: BudgetEntry[] = [];
    const allCommissions: CommissionEntry[] = [];

    for (const a of assignments) {
      const wName = `${a.wedding.partnerName1} & ${a.wedding.partnerName2}`;

      allCommissions.push({
        weddingName: wName,
        amount: a.commissionAmount,
        paid: a.commissionPaid,
      });

      const bRes = await fetch(`/api/weddings/${a.wedding.id}/budget`);
      if (bRes.ok) {
        const items = await bRes.json();
        for (const b of items) {
          allBudgets.push({ ...b, weddingName: wName });
        }
      }
    }

    setBudgets(allBudgets);
    setCommissions(allCommissions);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated") fetchData();
  }, [authStatus, fetchData]);

  const totalContracted = budgets.reduce((s, b) => s + b.estimatedCost, 0);
  const totalPaid = budgets.reduce((s, b) => s + b.paidAmount, 0);
  const totalPending = totalContracted - totalPaid;

  const totalCommissions = commissions.reduce((s, c) => s + (c.amount || 0), 0);
  const pendingCommissions = commissions.filter((c) => !c.paid).reduce((s, c) => s + (c.amount || 0), 0);

  // Group budget by category
  const byCategory: Record<string, number> = {};
  for (const b of budgets) {
    byCategory[b.category] = (byCategory[b.category] || 0) + b.estimatedCost;
  }

  // Upcoming payments (sorted by due date)
  const upcoming = budgets
    .filter((b) => b.dueDate && b.status !== "pago")
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 86_400_000);

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <h1 className="font-heading text-3xl text-verde-noite mb-8">Financeiro</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="font-body text-sm text-verde-noite/50 mb-1">Total Contratado</p>
          <p className="font-heading text-2xl text-verde-noite">{formatCurrency(totalContracted)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="font-body text-sm text-verde-noite/50 mb-1">Total Pago</p>
          <p className="font-heading text-2xl text-green-600">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="font-body text-sm text-verde-noite/50 mb-1">Pendente</p>
          <p className="font-heading text-2xl text-copper">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="font-body text-sm text-verde-noite/50 mb-1">Comissoes</p>
          <p className="font-heading text-2xl text-verde-noite">{formatCurrency(totalCommissions)}</p>
          {pendingCommissions > 0 && (
            <p className="font-body text-xs text-copper">{formatCurrency(pendingCommissions)} pendente</p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Budget by category */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-heading text-xl text-verde-noite mb-4">Por Categoria</h2>
          {Object.keys(byCategory).length === 0 ? (
            <p className="font-body text-verde-noite/40 text-sm">Sem dados</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(byCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, val]) => {
                  const pct = totalContracted > 0 ? (val / totalContracted) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between font-body text-sm mb-1">
                        <span className="text-verde-noite capitalize">{cat}</span>
                        <span className="text-verde-noite/60">{formatCurrency(val)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Upcoming payments */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-heading text-xl text-verde-noite mb-4">Proximos Vencimentos</h2>
          {upcoming.length === 0 ? (
            <p className="font-body text-verde-noite/40 text-sm">Nenhum vencimento proximo</p>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 10).map((b) => {
                const due = new Date(b.dueDate!);
                const isOverdue = due < now;
                const isSoon = due < sevenDaysFromNow && !isOverdue;
                return (
                  <div key={b.id} className={`flex items-center justify-between p-3 rounded-lg ${
                    isOverdue ? "bg-red-50" : isSoon ? "bg-copper/5" : "bg-gray-50"
                  }`}>
                    <div>
                      <p className="font-body text-sm text-verde-noite font-medium">{b.description}</p>
                      <p className="font-body text-xs text-verde-noite/50">{b.weddingName} — {b.category}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-body text-sm font-semibold ${
                        isOverdue ? "text-red-600" : isSoon ? "text-copper" : "text-verde-noite"
                      }`}>{formatCurrency(b.estimatedCost - b.paidAmount)}</p>
                      <p className="font-body text-xs text-verde-noite/40">
                        {due.toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
