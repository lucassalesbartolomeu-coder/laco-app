"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

interface Vendor {
  id: string;
  name: string;
  category: string;
  phone: string | null;
  email: string | null;
  budget: number | null;
  status: string;
  weddingId: string;
  weddingName: string;
}

const CATEGORIES = [
  "buffet","foto","video","som","DJ","decoracao","convites",
  "doces","bolo","maquiagem","celebrante","carro","outros",
];

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function FornecedoresPage() {
  const { status: authStatus } = useSession();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [search, setSearch] = useState("");

  const fetchVendors = useCallback(async () => {
    const res = await fetch("/api/planner/weddings");
    if (!res.ok) return;
    const assignments = await res.json();
    const allVendors: Vendor[] = [];
    for (const a of assignments) {
      const vRes = await fetch(`/api/weddings/${a.wedding.id}/vendors`);
      if (vRes.ok) {
        const vs = await vRes.json();
        for (const v of vs) {
          allVendors.push({
            ...v,
            weddingId: a.wedding.id,
            weddingName: `${a.wedding.partnerName1} & ${a.wedding.partnerName2}`,
          });
        }
      }
    }
    setVendors(allVendors);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated") fetchVendors();
  }, [authStatus, fetchVendors]);

  const filtered = vendors.filter((v) => {
    const matchCategory = filterCategory === "todos" || v.category === filterCategory;
    const matchStatus = filterStatus === "todos" || v.status === filterStatus;
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchStatus && matchSearch;
  });

  // Group by category
  const grouped: Record<string, Vendor[]> = {};
  for (const v of filtered) {
    if (!grouped[v.category]) grouped[v.category] = [];
    grouped[v.category].push(v);
  }

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <h1 className="font-heading text-3xl text-verde-noite mb-8">Fornecedores</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl font-body text-verde-noite bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl font-body text-verde-noite bg-white appearance-none"
        >
          <option value="todos">Todas categorias</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl font-body text-verde-noite bg-white appearance-none"
        >
          <option value="todos">Todos status</option>
          <option value="cotado">Cotado</option>
          <option value="contratado">Contratado</option>
          <option value="descartado">Descartado</option>
        </select>
      </div>

      {/* Grouped vendors */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <p className="font-body text-verde-noite/40">Nenhum fornecedor encontrado</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([cat, vs]) => (
            <div key={cat}>
              <h2 className="font-heading text-xl text-verde-noite mb-4 capitalize">{cat}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {vs.map((v) => (
                  <div key={v.id} className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-body text-verde-noite font-semibold">{v.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-body font-medium ${
                        v.status === "contratado" ? "bg-green-100 text-green-700" :
                        v.status === "descartado" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>{v.status}</span>
                    </div>
                    {v.phone && <p className="font-body text-sm text-verde-noite/50">{v.phone}</p>}
                    {v.email && <p className="font-body text-sm text-verde-noite/50">{v.email}</p>}
                    {v.budget && (
                      <p className="font-body text-lg text-copper font-semibold mt-2">{formatCurrency(v.budget)}</p>
                    )}
                    <p className="font-body text-xs text-verde-noite/30 mt-2">{v.weddingName}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
