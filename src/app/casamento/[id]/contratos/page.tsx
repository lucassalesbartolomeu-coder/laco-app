"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import BottomNav from "@/components/bottom-nav";
import { useToast } from "@/components/ui/toast";

interface Contract {
  id: string;
  terms: string;
  value: number | null;
  signedByPlanner: boolean;
  signedByCouple: boolean;
  plannerName: string | null;
  coupleName: string | null;
  plannerSignedAt: string | null;
  coupleSignedAt: string | null;
  createdAt: string;
  planner: { companyName: string | null; user: { name: string | null } };
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function statusInfo(c: Contract) {
  if (c.signedByPlanner && c.signedByCouple) {
    return { label: "Assinado por ambos", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400" };
  }
  if (c.signedByPlanner && !c.signedByCouple) {
    return { label: "Aguardando sua assinatura", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" };
  }
  return { label: "Aguardando cerimonialista", bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-300" };
}

export default function ContratosPage() {
  const params = useParams();
  const weddingId = params?.id as string;
  const { data: session, status } = useSession();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState<string | null>(null);
  const [signName, setSignName] = useState("");
  const toast = useToast();

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/weddings/${weddingId}/contracts`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setContracts(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status, weddingId]);

  async function handleSign(contractId: string) {
    if (!signName.trim()) { toast.error("Digite seu nome para assinar."); return; }
    try {
      const res = await fetch(`/api/public/contracts/${contractId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: signName.trim() }),
      });
      if (res.ok) {
        toast.success("Contrato assinado!");
        setContracts((prev) =>
          prev.map((c) =>
            c.id === contractId ? { ...c, signedByCouple: true, coupleName: signName.trim(), coupleSignedAt: new Date().toISOString() } : c
          )
        );
        setSigning(null);
        setSignName("");
      } else {
        toast.error("Erro ao assinar. Tente novamente.");
      }
    } catch {
      toast.error("Erro ao assinar. Tente novamente.");
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!session) return null;

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-midnight via-midnight/95 to-midnight/70 px-5 pt-12 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <Link
            href={`/casamento/${weddingId}/execucao`}
            className="inline-flex items-center gap-1 font-body text-xs text-white/50 hover:text-white/80 transition mb-4"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Organizar
          </Link>
          <h1 className="font-heading text-3xl text-white mb-2">Contratos</h1>
          <p className="font-body text-sm text-white/70">
            Contratos enviados pelo(a) seu(a) cerimonialista para revisar e assinar.
          </p>
        </div>
      </div>

      <div className="px-4 -mt-5 relative z-10 space-y-4">
        {contracts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center mt-6">
            <p className="font-heading text-xl text-midnight mb-2">Nenhum contrato ainda</p>
            <p className="font-body text-sm text-midnight/50">
              Quando seu(a) cerimonialista enviar um contrato, ele aparecerá aqui para você revisar e assinar.
            </p>
          </div>
        ) : (
          contracts.map((contract) => {
            const s = statusInfo(contract);
            const plannerLabel = contract.planner.companyName || contract.planner.user.name || "Cerimonialista";
            const needsSign = contract.signedByPlanner && !contract.signedByCouple;

            return (
              <div key={contract.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Top accent */}
                {needsSign && <div className="h-1 bg-gradient-to-r from-amber-400 to-gold" />}

                <div className="p-5">
                  {/* Status + planner */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-body text-xs text-midnight/50 mb-1">{plannerLabel}</p>
                      {contract.value && (
                        <p className="font-heading text-xl text-midnight">{formatCurrency(contract.value)}</p>
                      )}
                    </div>
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body font-medium shrink-0 ${s.bg} ${s.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </div>

                  {/* Terms preview */}
                  <p className="font-body text-sm text-midnight/70 line-clamp-3 mb-4 leading-relaxed">
                    {contract.terms}
                  </p>

                  {/* Signatures */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className={`rounded-xl p-3 ${contract.signedByPlanner ? "bg-green-50" : "bg-gray-50"}`}>
                      <p className="font-body text-[10px] text-midnight/40 mb-0.5">Cerimonialista</p>
                      {contract.signedByPlanner ? (
                        <>
                          <p className="font-body text-xs font-medium text-green-700">{contract.plannerName}</p>
                          <p className="font-body text-[10px] text-green-600/70">{formatDate(contract.plannerSignedAt)}</p>
                        </>
                      ) : (
                        <p className="font-body text-xs text-gray-400">Pendente</p>
                      )}
                    </div>
                    <div className={`rounded-xl p-3 ${contract.signedByCouple ? "bg-green-50" : "bg-gray-50"}`}>
                      <p className="font-body text-[10px] text-midnight/40 mb-0.5">Você</p>
                      {contract.signedByCouple ? (
                        <>
                          <p className="font-body text-xs font-medium text-green-700">{contract.coupleName}</p>
                          <p className="font-body text-[10px] text-green-600/70">{formatDate(contract.coupleSignedAt)}</p>
                        </>
                      ) : (
                        <p className="font-body text-xs text-gray-400">Pendente</p>
                      )}
                    </div>
                  </div>

                  {/* View full contract */}
                  <Link
                    href={`/contratos/${contract.id}`}
                    className="block w-full text-center py-2.5 border border-gray-200 rounded-xl font-body text-sm text-midnight/70 hover:border-midnight/30 hover:text-midnight transition mb-3"
                  >
                    Ver contrato completo
                  </Link>

                  {/* Sign button */}
                  {needsSign && signing !== contract.id && (
                    <button
                      onClick={() => setSigning(contract.id)}
                      className="w-full py-2.5 bg-gold text-white rounded-xl font-body text-sm font-medium hover:bg-gold/90 transition"
                    >
                      Assinar contrato
                    </button>
                  )}

                  {/* Sign modal inline */}
                  {needsSign && signing === contract.id && (
                    <div className="space-y-3">
                      <p className="font-body text-xs text-midnight/60 text-center">
                        Digite seu nome completo para assinar digitalmente
                      </p>
                      <input
                        type="text"
                        value={signName}
                        onChange={(e) => setSignName(e.target.value)}
                        placeholder="Seu nome completo"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl font-body text-sm text-midnight focus:outline-none focus:border-gold/50"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSigning(null); setSignName(""); }}
                          className="flex-1 py-2.5 border border-gray-200 rounded-xl font-body text-sm text-midnight/60"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSign(contract.id)}
                          className="flex-1 py-2.5 bg-gold text-white rounded-xl font-body text-sm font-medium hover:bg-gold/90 transition"
                        >
                          Confirmar assinatura
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
