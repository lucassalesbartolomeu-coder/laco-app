"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

interface QuoteItem {
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

interface Quote {
  id: string;
  vendorId: string;
  weddingId: string;
  totalValue: number;
  items: QuoteItem[];
  status: string;
  paymentTerms: string | null;
  notes: string | null;
  vendor: { id: string; name: string; category: string };
}

interface WeddingInfo {
  id: string;
  couple: string;
}

const CATEGORIES = [
  "todos","buffet","foto","video","som","DJ","decoracao",
  "convites","doces","bolo","maquiagem","celebrante","carro","outros",
];

const HIGHLIGHT_COLORS = ["#1A1F3A", "#C9A96E", "#6B5B95"];

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function getAllDescriptions(quotes: Quote[]): string[] {
  const set = new Set<string>();
  for (const q of quotes) {
    for (const item of (q.items as QuoteItem[] || [])) {
      set.add(item.description?.toLowerCase().trim());
    }
  }
  return Array.from(set).filter(Boolean);
}

function findItem(quote: Quote, desc: string): QuoteItem | undefined {
  return (quote.items as QuoteItem[] || []).find(
    (i) => i.description?.toLowerCase().trim() === desc
  );
}

export default function CompararOrcamentosPage() {
  const { status: authStatus } = useSession();
  const [weddings, setWeddings] = useState<WeddingInfo[]>([]);
  const [selectedWeddingId, setSelectedWeddingId] = useState("");
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [filterCategory, setFilterCategory] = useState("todos");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingVendor, setUpdatingVendor] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    fetch("/api/planner/weddings")
      .then((r) => r.json())
      .then((data) => {
        const list: WeddingInfo[] = (Array.isArray(data) ? data : []).map(
          (a: { wedding: { id: string; partnerName1: string; partnerName2: string } }) => ({
            id: a.wedding.id,
            couple: `${a.wedding.partnerName1} & ${a.wedding.partnerName2}`,
          })
        );
        setWeddings(list);
        if (list.length > 0) setSelectedWeddingId(list[0].id);
      })
      .catch(console.error);
  }, [authStatus]);

  const loadQuotes = useCallback(async () => {
    if (!selectedWeddingId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/weddings/${selectedWeddingId}/quotes`);
      const data = await res.json();
      setAllQuotes(Array.isArray(data) ? data : []);
      setSelectedIds([]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedWeddingId]);

  useEffect(() => { loadQuotes(); }, [loadQuotes]);

  const filteredQuotes = filterCategory === "todos"
    ? allQuotes
    : allQuotes.filter((q) => q.vendor.category === filterCategory);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, id];
    });
  }

  const comparing = allQuotes.filter((q) => selectedIds.includes(q.id));
  const allDescriptions = getAllDescriptions(comparing);

  // Find min/max total among selected
  const totals = comparing.map((q) => q.totalValue);
  const minTotal = Math.min(...totals);
  const maxTotal = Math.max(...totals);

  async function handleSelectVendor(quote: Quote) {
    setUpdatingVendor(quote.vendorId);
    try {
      await fetch(`/api/weddings/${selectedWeddingId}/vendors/${quote.vendorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "contratado" }),
      });
      // Mark other vendors in same category as discarded
      const sameCategory = allQuotes.filter(
        (q) => q.vendor.category === quote.vendor.category && q.vendorId !== quote.vendorId
      );
      await Promise.all(
        sameCategory.map((q) =>
          fetch(`/api/weddings/${selectedWeddingId}/vendors/${q.vendorId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "descartado" }),
          })
        )
      );
      loadQuotes();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingVendor(null);
    }
  }

  if (authStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <motion.div {...fadeUp} className="mb-8">
        <h1 className="font-heading text-3xl text-midnight">Comparar Orçamentos</h1>
        <p className="font-body text-sm text-midnight/50 mt-1">
          Selecione até 3 orçamentos da mesma categoria para comparar lado a lado
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div {...fadeUp} transition={{ delay: 0.05 }} className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap gap-3">
        <div>
          <label className="block font-body text-xs text-midnight/40 mb-1">Casamento</label>
          <select
            value={selectedWeddingId}
            onChange={(e) => setSelectedWeddingId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 font-body text-sm focus:ring-2 focus:ring-midnight/30 focus:border-midnight outline-none transition"
          >
            {weddings.map((w) => (
              <option key={w.id} value={w.id}>{w.couple}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-body text-xs text-midnight/40 mb-1">Categoria</label>
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setSelectedIds([]); }}
            className="px-3 py-2 rounded-lg border border-gray-200 font-body text-sm focus:ring-2 focus:ring-midnight/30 focus:border-midnight outline-none transition"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c === "todos" ? "Todas as categorias" : c}</option>
            ))}
          </select>
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={() => setSelectedIds([])}
            className="self-end px-3 py-2 text-sm font-body text-midnight/50 hover:text-midnight transition border border-gray-200 rounded-lg"
          >
            Limpar seleção
          </button>
        )}
      </motion.div>

      {/* Quote cards list */}
      <motion.div {...fadeUp} transition={{ delay: 0.08 }} className="mb-6">
        <h2 className="font-heading text-lg text-midnight mb-3">
          Orçamentos disponíveis
          <span className="ml-2 font-body text-sm text-midnight/40">
            ({filteredQuotes.length}) — selecione até 3
          </span>
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="font-body text-midnight/40">
              Nenhum orçamento encontrado.{" "}
              <a href="/cerimonialista/importar-orcamento" className="text-midnight hover:underline">
                Importar orçamento
              </a>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredQuotes.map((quote) => {
              const isSelected = selectedIds.includes(quote.id);
              const selIndex = selectedIds.indexOf(quote.id);
              const color = isSelected ? HIGHLIGHT_COLORS[selIndex] : undefined;
              return (
                <motion.button
                  key={quote.id}
                  onClick={() => toggleSelect(quote.id)}
                  whileHover={{ y: -2 }}
                  className={`p-4 rounded-xl border-2 text-left transition ${
                    isSelected
                      ? "shadow-md"
                      : "border-gray-100 bg-white hover:border-midnight/30"
                  }`}
                  style={isSelected ? { borderColor: color, backgroundColor: `${color}08` } : {}}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5"
                      style={{ backgroundColor: color || "#D1D5DB" }}
                    />
                    {isSelected && (
                      <span
                        className="text-xs font-body text-white px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: color }}
                      >
                        #{selIndex + 1}
                      </span>
                    )}
                  </div>
                  <p className="font-body font-semibold text-midnight text-sm truncate">
                    {quote.vendor.name}
                  </p>
                  <p className="font-body text-xs text-midnight/50 capitalize mt-0.5">
                    {quote.vendor.category}
                  </p>
                  <p className="font-heading text-lg text-midnight mt-2">
                    {formatCurrency(quote.totalValue)}
                  </p>
                  {quote.paymentTerms && (
                    <p className="font-body text-xs text-midnight/40 mt-1 truncate">
                      {quote.paymentTerms}
                    </p>
                  )}
                  <div className="mt-2">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-body rounded-full ${
                        quote.status === "contratado"
                          ? "bg-green-100 text-green-700"
                          : quote.status === "descartado"
                          ? "bg-gray-100 text-gray-500"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {quote.status}
                    </span>
                  </div>
                  {/* Item count */}
                  <p className="font-body text-xs text-midnight/30 mt-1">
                    {(quote.items as QuoteItem[])?.length || 0} itens
                  </p>
                </motion.button>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Comparison table */}
      <AnimatePresence>
        {comparing.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-heading text-xl text-midnight">Comparação lado a lado</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="p-4 text-left font-body text-xs text-midnight/40 uppercase tracking-wide w-40">
                      Item
                    </th>
                    {comparing.map((q, i) => (
                      <th key={q.id} className="p-4 text-center">
                        <div
                          className="inline-block px-3 py-1 rounded-full text-white text-xs font-body mb-1"
                          style={{ backgroundColor: HIGHLIGHT_COLORS[i] }}
                        >
                          #{i + 1}
                        </div>
                        <p className="font-body font-semibold text-midnight text-sm">
                          {q.vendor.name}
                        </p>
                        <p className="font-body text-xs text-midnight/40">{q.vendor.category}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {/* Item rows */}
                  {allDescriptions.map((desc) => {
                    const rowItems = comparing.map((q) => findItem(q, desc));
                    const rowTotals = rowItems.map((item) => item?.total ?? null).filter((v) => v !== null) as number[];
                    const rowMin = rowTotals.length > 0 ? Math.min(...rowTotals) : null;
                    const rowMax = rowTotals.length > 0 ? Math.max(...rowTotals) : null;

                    return (
                      <tr key={desc} className="hover:bg-gray-50 transition">
                        <td className="p-4 font-body text-sm text-midnight/70 capitalize">{desc}</td>
                        {comparing.map((q) => {
                          const item = findItem(q, desc);
                          if (!item) {
                            return (
                              <td key={q.id} className="p-4 text-center">
                                <span className="font-body text-sm text-midnight/20">—</span>
                              </td>
                            );
                          }
                          const isMin = rowMin !== null && item.total === rowMin && rowMin !== rowMax;
                          const isMax = rowMax !== null && item.total === rowMax && rowMin !== rowMax;
                          return (
                            <td key={q.id} className="p-4 text-center">
                              <div
                                className={`inline-block px-2 py-1 rounded-lg font-body text-sm font-medium ${
                                  isMin
                                    ? "bg-green-50 text-green-700"
                                    : isMax
                                    ? "bg-red-50 text-red-600"
                                    : "text-midnight"
                                }`}
                              >
                                {formatCurrency(item.total)}
                              </div>
                              {item.qty !== 1 && (
                                <p className="font-body text-xs text-midnight/30 mt-0.5">
                                  {item.qty}x {formatCurrency(item.unitPrice)}
                                </p>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Condições de pagamento */}
                  <tr className="bg-gray-50/50">
                    <td className="p-4 font-body text-sm text-midnight/40 font-medium">Condições</td>
                    {comparing.map((q) => (
                      <td key={q.id} className="p-4 text-center font-body text-sm text-midnight/60">
                        {q.paymentTerms || "—"}
                      </td>
                    ))}
                  </tr>

                  {/* Total row */}
                  <tr className="border-t-2 border-gray-200">
                    <td className="p-4 font-body font-semibold text-midnight">Total</td>
                    {comparing.map((q) => {
                      const isMin = q.totalValue === minTotal && minTotal !== maxTotal;
                      const isMax = q.totalValue === maxTotal && minTotal !== maxTotal;
                      return (
                        <td key={q.id} className="p-4 text-center">
                          <div
                            className={`inline-block px-3 py-1.5 rounded-xl font-heading text-xl ${
                              isMin
                                ? "bg-green-50 text-green-700"
                                : isMax
                                ? "bg-red-50 text-red-600"
                                : "text-midnight"
                            }`}
                          >
                            {formatCurrency(q.totalValue)}
                          </div>
                          {isMin && (
                            <p className="font-body text-xs text-green-600 mt-1 font-medium">
                              Mais barato
                            </p>
                          )}
                          {isMax && (
                            <p className="font-body text-xs text-red-500 mt-1 font-medium">
                              Mais caro (+{formatCurrency(q.totalValue - minTotal)})
                            </p>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Select vendor action */}
                  <tr>
                    <td className="p-4" />
                    {comparing.map((q) => (
                      <td key={q.id} className="p-4 text-center">
                        <button
                          onClick={() => handleSelectVendor(q)}
                          disabled={updatingVendor === q.vendorId || q.status === "contratado"}
                          className={`px-4 py-2 rounded-xl font-body text-sm transition ${
                            q.status === "contratado"
                              ? "bg-green-100 text-green-700 cursor-default"
                              : "bg-midnight text-white hover:bg-midnight/90 disabled:opacity-50"
                          }`}
                        >
                          {updatingVendor === q.vendorId
                            ? "Salvando…"
                            : q.status === "contratado"
                            ? "✓ Contratado"
                            : "Selecionar"}
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary */}
            {comparing.length >= 2 && minTotal !== maxTotal && (
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <p className="font-body text-sm text-midnight/60 text-center">
                  Diferença entre menor e maior orçamento:{" "}
                  <strong className="text-midnight">{formatCurrency(maxTotal - minTotal)}</strong>
                  {" "}({(((maxTotal - minTotal) / minTotal) * 100).toFixed(1)}% de variação)
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {comparing.length === 1 && (
        <div className="mt-4 p-4 bg-midnight/5 border border-midnight/20 rounded-xl text-center">
          <p className="font-body text-sm text-midnight">
            Selecione mais 1 orçamento para comparar (máximo 3)
          </p>
        </div>
      )}
    </div>
  );
}
