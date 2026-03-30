"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ContractData {
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
  wedding: { partnerName1: string; partnerName2: string; weddingDate: string | null };
  planner: { companyName: string; phone: string };
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function PublicContractPage() {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/public/contracts/${id}`)
      .then(async res => {
        if (!res.ok) { setNotFound(true); setLoading(false); return; }
        setContract(await res.json());
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  async function handleSign() {
    if (!name.trim() || !agreed) return;
    setSigning(true);
    setError("");
    try {
      const res = await fetch(`/api/public/contracts/${id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setSigned(true);
        setContract(c => c ? { ...c, signedByCouple: true, coupleName: name, coupleSignedAt: new Date().toISOString() } : c);
      } else {
        const d = await res.json();
        setError(d.error ?? "Erro ao assinar");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setSigning(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-fog">
      <div className="w-8 h-8 border-4 border-midnight border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound || !contract) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-fog gap-4 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
        <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="font-heading text-2xl text-midnight">Contrato não encontrado</h1>
      <p className="font-body text-midnight/60 max-w-sm">O link pode estar incorreto ou o contrato não está disponível para assinatura.</p>
      <a href="/" className="font-body text-sm text-gold hover:underline">Voltar ao início</a>
    </div>
  );

  const couple = `${contract.wedding.partnerName1} & ${contract.wedding.partnerName2}`;
  const alreadySigned = contract.signedByCouple;

  return (
    <div className="min-h-screen bg-fog">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="font-display text-2xl font-semibold text-midnight tracking-wide">Laço</a>
          <span className="font-body text-xs text-midnight/40">Contrato de Prestação de Serviços</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Header card */}
        <div className="bg-midnight rounded-3xl p-6 text-white">
          <p className="font-body text-sm text-white/60 mb-1">Contrato para</p>
          <h1 className="font-heading text-2xl font-semibold mb-3">{couple}</h1>
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <p className="text-white/50 text-xs">Cerimonialista</p>
              <p className="font-body font-medium">{contract.planner.companyName}</p>
            </div>
            {contract.wedding.weddingDate && (
              <div>
                <p className="text-white/50 text-xs">Data do casamento</p>
                <p className="font-body font-medium">{formatDate(contract.wedding.weddingDate)}</p>
              </div>
            )}
            {contract.value && (
              <div>
                <p className="text-white/50 text-xs">Valor</p>
                <p className="font-body font-medium font-bold text-gold">{formatCurrency(contract.value)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Signature status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="font-body text-xs font-semibold text-midnight/40 uppercase tracking-wider mb-3">Assinaturas</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${contract.signedByPlanner ? "bg-green-400" : "bg-gray-200"}`}>
                {contract.signedByPlanner && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-body text-sm font-medium text-midnight">{contract.plannerName ?? contract.planner.companyName}</p>
                <p className="font-body text-xs text-midnight/40">
                  {contract.signedByPlanner ? `Assinado em ${formatDate(contract.plannerSignedAt)}` : "Aguardando"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${contract.signedByCouple ? "bg-green-400" : "bg-gray-200"}`}>
                {contract.signedByCouple && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-body text-sm font-medium text-midnight">{contract.coupleName ?? couple}</p>
                <p className="font-body text-xs text-midnight/40">
                  {contract.signedByCouple ? `Assinado em ${formatDate(contract.coupleSignedAt)}` : "Aguardando"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="font-body text-xs font-semibold text-midnight/40 uppercase tracking-wider mb-4">Termos do Contrato</p>
          <div className="font-body text-sm text-midnight/80 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto pr-2">
            {contract.terms}
          </div>
        </div>

        {/* Sign section */}
        {alreadySigned || signed ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-heading text-xl text-midnight mb-1">Contrato assinado!</h2>
            <p className="font-body text-sm text-midnight/60">
              Assinado por <strong>{contract.coupleName || name}</strong> em {formatDate(contract.coupleSignedAt ?? new Date().toISOString())}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-heading text-lg font-semibold text-midnight">Assinar contrato</h2>
            <p className="font-body text-sm text-midnight/60">
              Ao assinar, você confirma que leu e concorda com todos os termos acima.
            </p>

            <div>
              <label className="block font-body text-xs text-midnight/60 mb-1.5">Seu nome completo *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nome conforme documento"
                className="w-full px-3 py-2.5 text-sm font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="accent-midnight mt-0.5 w-4 h-4 flex-shrink-0"
              />
              <span className="font-body text-sm text-midnight/70">
                Li e concordo com todos os termos e condições deste contrato.
              </span>
            </label>

            {error && <p className="font-body text-sm text-red-500">{error}</p>}

            <button
              onClick={handleSign}
              disabled={signing || !name.trim() || !agreed}
              className="w-full py-3 bg-midnight text-white font-body font-semibold rounded-xl hover:bg-midnight/90 disabled:opacity-40 transition"
            >
              {signing ? "Assinando..." : "Assinar contrato"}
            </button>
          </div>
        )}

        <p className="text-center font-body text-xs text-midnight/30 pb-4">
          Contrato gerado em {formatDate(contract.createdAt)} · Laço
        </p>
      </div>
    </div>
  );
}
