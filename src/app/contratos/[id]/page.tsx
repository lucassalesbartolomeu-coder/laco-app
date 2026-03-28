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
  wedding: {
    partnerName1: string;
    partnerName2: string;
    weddingDate: string | null;
  };
  planner: {
    companyName: string;
    phone: string;
  };
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
    fetch(`/api/public/contracts/${id}/sign`)
      .then(async (res) => {
        if (res.status === 404) { setNotFound(true); return; }
        // GET not defined — fetch contract via a different approach
        // Use the sign endpoint just to get the contract data
      })
      .catch(() => setNotFound(true));

    // Actually fetch contract data
    fetch(`/api/public/contracts/${id}`)
      .then(async (res) => {
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
      } else {
        const d = await res.json();
        setError(d.error ?? "Erro ao assinar");
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setSigning(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !contract) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-4">
        <h1 className="font-heading text-3xl text-verde-noite">Contrato não encontrado</h1>
        <p className="font-body text-verde-noite/60">O link pode estar incorreto ou expirado.</p>
      </div>
    );
  }

  const couple = `${contract.wedding.partnerName1} & ${contract.wedding.partnerName2}`;

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <a href="/" className="font-heading text-3xl text-verde-noite">Laço</a>
          <p className="font-body text-sm text-verde-noite/50 mt-1">Contrato de Prestação de Serviços</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          {/* Parties */}
          <div className="border-b border-gray-100 pb-6 mb-6">
            <h1 className="font-heading text-2xl text-verde-noite mb-4">Contrato — {couple}</h1>
            <div className="grid sm:grid-cols-2 gap-4 text-sm font-body">
              <div>
                <p className="text-verde-noite/50 mb-0.5">Contratado</p>
                <p className="font-medium text-verde-noite">{contract.planner?.companyName}</p>
              </div>
              <div>
                <p className="text-verde-noite/50 mb-0.5">Data do Casamento</p>
                <p className="font-medium text-verde-noite">{formatDate(contract.wedding.weddingDate)}</p>
              </div>
              {contract.value != null && (
                <div>
                  <p className="text-verde-noite/50 mb-0.5">Valor</p>
                  <p className="font-medium text-verde-noite">{formatCurrency(contract.value)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Terms */}
          <h2 className="font-heading text-lg text-verde-noite mb-3">Termos e Condições</h2>
          <div className="bg-gray-50 rounded-xl p-5 mb-6 max-h-96 overflow-y-auto">
            <pre className="font-body text-sm text-verde-noite/80 whitespace-pre-wrap leading-relaxed">
              {contract.terms}
            </pre>
          </div>

          {/* Signatures status */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="border border-gray-100 rounded-xl p-4">
              <p className="font-body text-xs text-verde-noite/40 uppercase tracking-wider mb-2">Cerimonialista</p>
              {contract.signedByPlanner ? (
                <div>
                  <p className="font-body text-sm font-medium text-verde-noite">{contract.plannerName}</p>
                  <p className="font-body text-xs text-green-600 mt-1">
                    Assinado em {formatDate(contract.plannerSignedAt)}
                  </p>
                </div>
              ) : (
                <p className="font-body text-sm text-verde-noite/40 italic">Pendente</p>
              )}
            </div>
            <div className="border border-gray-100 rounded-xl p-4">
              <p className="font-body text-xs text-verde-noite/40 uppercase tracking-wider mb-2">Casal</p>
              {contract.signedByCouple ? (
                <div>
                  <p className="font-body text-sm font-medium text-verde-noite">{contract.coupleName}</p>
                  <p className="font-body text-xs text-green-600 mt-1">
                    Assinado em {formatDate(contract.coupleSignedAt)}
                  </p>
                </div>
              ) : (
                <p className="font-body text-sm text-verde-noite/40 italic">Pendente</p>
              )}
            </div>
          </div>

          {/* Sign form or success */}
          {contract.signedByCouple ? (
            <div className="text-center bg-green-50 rounded-xl p-6">
              <svg className="w-10 h-10 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-heading text-xl text-verde-noite">Contrato assinado!</p>
              <p className="font-body text-sm text-verde-noite/60 mt-1">
                Assinado por {contract.coupleName} em {formatDate(contract.coupleSignedAt)}
              </p>
            </div>
          ) : signed ? (
            <div className="text-center bg-green-50 rounded-xl p-6">
              <svg className="w-10 h-10 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-heading text-xl text-verde-noite">Assinado com sucesso!</p>
              <p className="font-body text-sm text-verde-noite/60 mt-1">
                Sua assinatura foi registrada. O cerimonialista receberá uma confirmação.
              </p>
            </div>
          ) : (
            <div>
              <h3 className="font-heading text-lg text-verde-noite mb-4">Assinar Contrato</h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-body text-sm mb-1 text-verde-noite/70">Seu nome completo *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome como aparecerá na assinatura"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-verde-noite bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none"
                  />
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 accent-teal w-4 h-4 shrink-0"
                  />
                  <span className="font-body text-sm text-verde-noite/70 leading-relaxed">
                    Li e concordo com todos os termos e condições deste contrato. Entendo que esta assinatura digital tem validade jurídica.
                  </span>
                </label>

                {error && <p className="font-body text-sm text-red-600">{error}</p>}

                <button
                  onClick={handleSign}
                  disabled={signing || !name.trim() || !agreed}
                  className="w-full py-3 bg-copper text-white rounded-xl font-body font-semibold hover:bg-copper/90 transition disabled:opacity-50"
                >
                  {signing ? "Assinando..." : "Assinar Contrato"}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center font-body text-xs text-verde-noite/30">
          Plataforma Laço · laco.app
        </p>
      </div>
    </div>
  );
}
