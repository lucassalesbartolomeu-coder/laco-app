"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface WeddingDetail {
  id: string;
  partnerName1: string;
  partnerName2: string;
  weddingDate: string | null;
  venue: string | null;
  venueAddress: string | null;
  city: string | null;
  state: string | null;
  estimatedBudget: number | null;
  estimatedGuests: number | null;
  guests: { id: string; name: string; rsvpStatus: string; category: string }[];
  vendors: { id: string; name: string; category: string; status: string; budget: number | null }[];
  budgetItems: { id: string; category: string; description: string; estimatedCost: number; actualCost: number | null; status: string }[];
}

type Tab = "convidados" | "fornecedores" | "orcamento";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function CerimonialistaWeddingDetail() {
  const { id } = useParams<{ id: string }>();
  const { status: authStatus } = useSession();
  const [wedding, setWedding] = useState<WeddingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("convidados");

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    fetch(`/api/weddings/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setWedding)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authStatus, id]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="p-8 text-center">
        <p className="font-body text-verde-noite/50">Casamento nao encontrado ou sem permissao.</p>
      </div>
    );
  }

  const confirmedGuests = wedding.guests?.filter((g) => g.rsvpStatus === "confirmado").length || 0;
  const totalGuests = wedding.guests?.length || 0;
  const totalBudget = wedding.budgetItems?.reduce((s, b) => s + b.estimatedCost, 0) || 0;
  const totalPaid = wedding.budgetItems?.reduce((s, b) => s + (b.actualCost || 0), 0) || 0;

  const TABS: { key: Tab; label: string }[] = [
    { key: "convidados", label: `Convidados (${totalGuests})` },
    { key: "fornecedores", label: `Fornecedores (${wedding.vendors?.length || 0})` },
    { key: "orcamento", label: "Orcamento" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Back */}
      <Link
        href="/cerimonialista/dashboard"
        className="inline-flex items-center gap-1 font-body text-sm text-teal hover:text-teal/80 transition mb-6"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h1 className="font-heading text-3xl text-verde-noite mb-2">
          {wedding.partnerName1} & {wedding.partnerName2}
        </h1>
        <div className="flex flex-wrap gap-4 font-body text-sm text-verde-noite/60">
          {wedding.weddingDate && <span>{formatDate(wedding.weddingDate)}</span>}
          {wedding.venue && <span>{wedding.venue}</span>}
          {wedding.city && <span>{wedding.city}/{wedding.state}</span>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <p className="font-heading text-2xl text-verde-noite">{totalGuests}</p>
            <p className="font-body text-xs text-verde-noite/50">Convidados</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl text-green-600">{confirmedGuests}</p>
            <p className="font-body text-xs text-verde-noite/50">Confirmados</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl text-verde-noite">{formatCurrency(totalBudget)}</p>
            <p className="font-body text-xs text-verde-noite/50">Orcamento</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl text-copper">{formatCurrency(totalPaid)}</p>
            <p className="font-body text-xs text-verde-noite/50">Pago</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-lg font-body text-sm font-medium transition ${
              tab === t.key ? "bg-verde-noite text-white" : "text-verde-noite/50 hover:text-verde-noite"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {tab === "convidados" && (
          <div className="space-y-2">
            {wedding.guests?.length === 0 ? (
              <p className="font-body text-verde-noite/40 text-center py-8">Nenhum convidado</p>
            ) : (
              <table className="w-full font-body text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-verde-noite/40 uppercase">
                    <th className="pb-2">Nome</th>
                    <th className="pb-2">Categoria</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {wedding.guests?.map((g) => (
                    <tr key={g.id} className="border-b border-gray-50">
                      <td className="py-2 text-verde-noite">{g.name}</td>
                      <td className="py-2 text-verde-noite/60">{g.category || "—"}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          g.rsvpStatus === "confirmado" ? "bg-green-100 text-green-700" :
                          g.rsvpStatus === "recusado" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>{g.rsvpStatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "fornecedores" && (
          <div className="space-y-2">
            {wedding.vendors?.length === 0 ? (
              <p className="font-body text-verde-noite/40 text-center py-8">Nenhum fornecedor</p>
            ) : (
              <table className="w-full font-body text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-verde-noite/40 uppercase">
                    <th className="pb-2">Nome</th>
                    <th className="pb-2">Categoria</th>
                    <th className="pb-2">Orcamento</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {wedding.vendors?.map((v) => (
                    <tr key={v.id} className="border-b border-gray-50">
                      <td className="py-2 text-verde-noite">{v.name}</td>
                      <td className="py-2 text-verde-noite/60">{v.category}</td>
                      <td className="py-2 text-verde-noite/60">{v.budget ? formatCurrency(v.budget) : "—"}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          v.status === "contratado" ? "bg-green-100 text-green-700" :
                          v.status === "descartado" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>{v.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "orcamento" && (
          <div className="space-y-2">
            {wedding.budgetItems?.length === 0 ? (
              <p className="font-body text-verde-noite/40 text-center py-8">Nenhum item no orcamento</p>
            ) : (
              <table className="w-full font-body text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-verde-noite/40 uppercase">
                    <th className="pb-2">Descricao</th>
                    <th className="pb-2">Categoria</th>
                    <th className="pb-2">Estimado</th>
                    <th className="pb-2">Real</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {wedding.budgetItems?.map((b) => (
                    <tr key={b.id} className="border-b border-gray-50">
                      <td className="py-2 text-verde-noite">{b.description}</td>
                      <td className="py-2 text-verde-noite/60">{b.category}</td>
                      <td className="py-2 text-verde-noite/60">{formatCurrency(b.estimatedCost)}</td>
                      <td className="py-2 text-verde-noite/60">{b.actualCost ? formatCurrency(b.actualCost) : "—"}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          b.status === "pago" ? "bg-green-100 text-green-700" :
                          b.status === "parcial" ? "bg-amber-100 text-amber-700" :
                          "bg-gray-100 text-gray-500"
                        }`}>{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
