"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import BottomNav from "@/components/bottom-nav";


interface Vendor {
  id: string;
  name: string;
  category: string;
  status: string;
  price: number | null;
  contactName: string | null;
  phone: string | null;
  notes: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  buffet: "Buffet",
  fotografo: "Fotógrafo",
  videografo: "Videógrafo",
  banda: "Banda / DJ",
  decoracao: "Decoração",
  flores: "Flores",
  bolo: "Bolo",
  doces: "Doces",
  convite: "Convites",
  cerimonialista: "Assessor(a)",
  vestido: "Vestido",
  traje: "Traje Noivo",
  cerimonial: "Espaço / Cerimonial",
  transporte: "Transporte",
  maquiagem: "Maquiagem / Cabelo",
  outro: "Outro",
};

const GOLD = "#A98950";
const BROWN = "#3D322A";
const CREME = "#FAF6EF";

export default function CotacoesPage() {
  const params = useParams();
  const weddingId = params?.id as string;
  const { data: session, status } = useSession();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = useCallback(async () => {
    try {
      const res = await fetch(`/api/weddings/${weddingId}/vendors`);
      if (res.ok) setVendors(await res.json());
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [weddingId]);

  useEffect(() => {
    if (status === "authenticated") fetchVendors();
  }, [status, fetchVendors]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREME }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: GOLD, borderTopColor: "transparent" }} />
      </div>
    );
  }
  if (!session) return null;

  // Group by category
  const byCategory = vendors.reduce<Record<string, Vendor[]>>((acc, v) => {
    const cat = v.category || "outro";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(v);
    return acc;
  }, {});

  // Categories with multiple vendors (potential quotes to compare)
  const comparableCategories = Object.entries(byCategory).filter(([, vs]) => vs.length >= 2);
  const singleCategories = Object.entries(byCategory).filter(([, vs]) => vs.length === 1);

  function formatCurrency(v: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>
      {/* Light header */}
      <div style={{ background: CREME }} className="px-5 pt-10 pb-6">
        <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "10px", letterSpacing: "0.15em", color: GOLD, textTransform: "uppercase" as const, fontWeight: 500 }}>
          Fornecedores
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "28px", color: BROWN, lineHeight: 1.2, marginTop: "4px" }}>
          Cotações
        </h1>
        <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "12px", color: "rgba(61,50,42,0.5)", marginTop: "6px", letterSpacing: "0.02em" }}>
          Compare orçamentos e escolha os melhores
        </p>
      </div>

      {/* Ornamental divider */}
      <div className="flex items-center gap-2.5 px-5 py-2">
        <div style={{ flex: 1, height: "1px", background: "rgba(169,137,80,0.25)" }} />
        <div style={{ width: "5px", height: "5px", background: GOLD, transform: "rotate(45deg)", opacity: 0.7 }} />
        <div style={{ flex: 1, height: "1px", background: "rgba(169,137,80,0.25)" }} />
      </div>

      <div className="px-4 mt-4 space-y-5">

        {vendors.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center" style={{ border: "1.5px solid rgba(169,137,80,0.35)" }}>
            <p className="text-4xl mb-3">📊</p>
            <p className="font-heading text-lg text-midnight mb-1">Nenhum fornecedor ainda</p>
            <p className="font-body text-sm text-gray-400 mb-5">Adicione fornecedores para poder comparar cotações.</p>
            <Link
              href={`/casamento/${weddingId}/fornecedores`}
              className="inline-flex px-5 py-2.5 bg-midnight text-white rounded-xl font-body text-sm font-medium"
            >
              Ir para Fornecedores
            </Link>
          </div>
        ) : (
          <>
            {/* Categories with multiple quotes */}
            {comparableCategories.length > 0 && (
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-midnight/40 px-1 mb-3">
                  Comparações disponíveis
                </p>
                <div className="space-y-4">
                  {comparableCategories.map(([cat, vs]) => {
                    const withPrice = vs.filter(v => v.price != null);
                    const lowest = withPrice.length > 0 ? Math.min(...withPrice.map(v => v.price!)) : null;
                    return (
                      <div key={cat} className="bg-white rounded-2xl overflow-hidden" style={{ border: "1.5px solid rgba(169,137,80,0.35)" }}>
                        <div className="px-4 py-3 bg-midnight/5 border-b border-midnight/10 flex items-center justify-between">
                          <span className="font-body text-sm font-semibold text-midnight">
                            {CATEGORY_LABELS[cat] ?? cat}
                          </span>
                          <span className="font-body text-xs text-midnight">{vs.length} cotações</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {vs
                            .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
                            .map((v, i) => (
                              <div key={v.id} className="px-4 py-3 flex items-center gap-3">
                                {v.price != null && v.price === lowest && (
                                  <span className="text-xs bg-midnight/10 text-midnight px-2 py-0.5 rounded-full font-body font-medium flex-shrink-0">Menor</span>
                                )}
                                {i === 0 && v.price != null && v.price !== lowest && (
                                  <span className="w-[46px] flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-body text-sm font-medium text-midnight truncate">{v.name}</p>
                                  {v.status && (
                                    <p className="font-body text-xs text-gray-400">{v.status}</p>
                                  )}
                                </div>
                                <p className="font-body text-sm font-semibold text-midnight flex-shrink-0">
                                  {v.price != null ? formatCurrency(v.price) : <span className="text-gray-300">—</span>}
                                </p>
                              </div>
                            ))}
                        </div>
                        {withPrice.length >= 2 && lowest != null && (
                          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                            <p className="font-body text-xs text-gray-400">
                              Economia potencial:{" "}
                              <span className="font-semibold text-midnight">
                                {formatCurrency(Math.max(...withPrice.map(v => v.price!)) - lowest)}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Single quotes */}
            {singleCategories.length > 0 && (
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-midnight/40 px-1 mb-3">
                  Cotação única (adicione mais para comparar)
                </p>
                <div className="space-y-2">
                  {singleCategories.map(([cat, vs]) => (
                    <div key={cat} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3" style={{ border: "1.5px solid rgba(169,137,80,0.35)" }}>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-xs text-gray-400">{CATEGORY_LABELS[cat] ?? cat}</p>
                        <p className="font-body text-sm font-medium text-midnight truncate">{vs[0].name}</p>
                      </div>
                      <p className="font-body text-sm font-semibold text-midnight flex-shrink-0">
                        {vs[0].price != null ? formatCurrency(vs[0].price) : <span className="text-gray-300">—</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link
              href={`/casamento/${weddingId}/fornecedores`}
              className="flex items-center justify-center gap-2 py-3 border border-midnight/30 rounded-2xl font-body text-sm text-midnight hover:bg-midnight/5 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Adicionar fornecedor
            </Link>
          </>
        )}
      </div>

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
