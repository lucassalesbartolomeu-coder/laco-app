"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CoupleEngagementScore } from "@/components/couple-engagement-score";

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
  const params = useParams();
  const id = params?.id as string;
  const { status: authStatus } = useSession();
  const [wedding, setWedding] = useState<WeddingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({ convidados: true, fornecedores: true, orcamento: true });

  function toggleSection(key: Tab) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

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
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="p-8 text-center">
        <p className="font-body text-midnight/50">Casamento nao encontrado ou sem permissao.</p>
      </div>
    );
  }

  const confirmedGuests = wedding.guests?.filter((g) => g.rsvpStatus === "confirmado").length || 0;
  const totalGuests = wedding.guests?.length || 0;
  const totalBudget = wedding.budgetItems?.reduce((s, b) => s + b.estimatedCost, 0) || 0;
  const totalPaid = wedding.budgetItems?.reduce((s, b) => s + (b.actualCost || 0), 0) || 0;

  const SECTIONS: { key: Tab; label: string; count?: number }[] = [
    { key: "convidados", label: "Convidados", count: totalGuests },
    { key: "fornecedores", label: "Fornecedores", count: wedding.vendors?.length || 0 },
    { key: "orcamento", label: "Orçamento" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Back */}
      <Link
        href="/cerimonialista/dashboard"
        className="inline-flex items-center gap-1 font-body text-sm text-midnight hover:text-midnight/80 transition mb-6"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h1 className="font-heading text-3xl text-midnight mb-2">
          {wedding.partnerName1} & {wedding.partnerName2}
        </h1>
        <div className="flex flex-wrap gap-4 font-body text-sm text-midnight/60">
          {wedding.weddingDate && <span>{formatDate(wedding.weddingDate)}</span>}
          {wedding.venue && <span>{wedding.venue}</span>}
          {wedding.city && <span>{wedding.city}/{wedding.state}</span>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <p className="font-heading text-2xl text-midnight">{totalGuests}</p>
            <p className="font-body text-xs text-midnight/50">Convidados</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl text-green-600">{confirmedGuests}</p>
            <p className="font-body text-xs text-midnight/50">Confirmados</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl text-midnight">{formatCurrency(totalBudget)}</p>
            <p className="font-body text-xs text-midnight/50">Orcamento</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl text-gold">{formatCurrency(totalPaid)}</p>
            <p className="font-body text-xs text-midnight/50">Pago</p>
          </div>
        </div>
      </div>

      {/* Engagement Score */}
      <div className="mb-6">
        <CoupleEngagementScore
          data={{
            estimatedGuests: wedding.estimatedGuests,
            guests: wedding.guests ?? [],
            vendors: wedding.vendors ?? [],
            budgetItems: wedding.budgetItems ?? [],
            weddingDate: wedding.weddingDate,
            venue: wedding.venue,
          }}
        />
      </div>

      {/* Collapsible sections */}
      <div className="space-y-4">
        {SECTIONS.map((s) => {
          const isOpen = openSections[s.key];
          return (
            <div key={s.key} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection(s.key)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <h2 className="font-heading text-lg text-midnight">{s.label}</h2>
                  {s.count !== undefined && (
                    <span className="px-2 py-0.5 bg-midnight/10 text-midnight text-xs font-body font-medium rounded-full">
                      {s.count}
                    </span>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 text-midnight/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  {s.key === "convidados" && (
                    <div className="space-y-2 pt-4">
                      {wedding.guests?.length === 0 ? (
                        <p className="font-body text-midnight/40 text-center py-8">Nenhum convidado</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full font-body text-sm">
                            <thead>
                              <tr className="border-b text-left text-xs text-midnight/40 uppercase">
                                <th className="pb-2">Nome</th>
                                <th className="pb-2">Categoria</th>
                                <th className="pb-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {wedding.guests?.map((g) => (
                                <tr key={g.id} className="border-b border-gray-50">
                                  <td className="py-2 text-midnight">{g.name}</td>
                                  <td className="py-2 text-midnight/60">{g.category || "—"}</td>
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
                        </div>
                      )}
                    </div>
                  )}

                  {s.key === "fornecedores" && (
                    <div className="space-y-2 pt-4">
                      {wedding.vendors?.length === 0 ? (
                        <p className="font-body text-midnight/40 text-center py-8">Nenhum fornecedor</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full font-body text-sm">
                            <thead>
                              <tr className="border-b text-left text-xs text-midnight/40 uppercase">
                                <th className="pb-2">Nome</th>
                                <th className="pb-2">Categoria</th>
                                <th className="pb-2">Orcamento</th>
                                <th className="pb-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {wedding.vendors?.map((v) => (
                                <tr key={v.id} className="border-b border-gray-50">
                                  <td className="py-2 text-midnight">{v.name}</td>
                                  <td className="py-2 text-midnight/60">{v.category}</td>
                                  <td className="py-2 text-midnight/60">{v.budget ? formatCurrency(v.budget) : "—"}</td>
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
                        </div>
                      )}
                    </div>
                  )}

                  {s.key === "orcamento" && (
                    <div className="space-y-2 pt-4">
                      {wedding.budgetItems?.length === 0 ? (
                        <p className="font-body text-midnight/40 text-center py-8">Nenhum item no orçamento</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full font-body text-sm">
                            <thead>
                              <tr className="border-b text-left text-xs text-midnight/40 uppercase">
                                <th className="pb-2">Descrição</th>
                                <th className="pb-2">Categoria</th>
                                <th className="pb-2">Estimado</th>
                                <th className="pb-2">Real</th>
                                <th className="pb-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {wedding.budgetItems?.map((b) => (
                                <tr key={b.id} className="border-b border-gray-50">
                                  <td className="py-2 text-midnight">{b.description}</td>
                                  <td className="py-2 text-midnight/60">{b.category}</td>
                                  <td className="py-2 text-midnight/60">{formatCurrency(b.estimatedCost)}</td>
                                  <td className="py-2 text-midnight/60">{b.actualCost ? formatCurrency(b.actualCost) : "—"}</td>
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
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
