"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface ContractWedding {
  id: string;
  partnerName1: string;
  partnerName2: string;
  weddingDate: string | null;
}

interface Contract {
  id: string;
  weddingId: string;
  terms: string;
  value: number | null;
  signedByPlanner: boolean;
  signedByCouple: boolean;
  plannerName: string | null;
  coupleName: string | null;
  plannerSignedAt: string | null;
  coupleSignedAt: string | null;
  createdAt: string;
  wedding: ContractWedding;
}

interface Assignment {
  assignmentId: string;
  wedding: { id: string; partnerName1: string; partnerName2: string };
}

const CONTRACT_TEMPLATES = [
  {
    label: "Cerimonial Completo",
    text: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CERIMONIAL

Por meio deste instrumento, as partes acima qualificadas ajustam a prestação de serviços de cerimonial para o casamento previsto para a data indicada, nas seguintes condições:

1. OBJETO
O contratado prestará serviços de coordenação e cerimonial do casamento, incluindo planejamento, acompanhamento de fornecedores, ensaio e execução do evento.

2. SERVIÇOS INCLUSOS
- Reuniões de planejamento (ilimitadas)
- Cronograma detalhado do dia
- Ensaio com noivos e padrinhos
- Coordenação no dia do evento (até 12 horas)
- Equipe de apoio

3. PAGAMENTO
O valor total do contrato será pago conforme acordado entre as partes. Sinal de 40% na assinatura do contrato, saldo 30 dias antes do evento.

4. CANCELAMENTO
Em caso de cancelamento com mais de 90 dias de antecedência, o sinal será reembolsado integralmente. Com menos de 90 dias, o sinal não será reembolsado.

5. EXCLUSIVIDADE
O contratado se compromete a não aceitar outros eventos na mesma data.

6. FORO
Fica eleito o foro da comarca do contratado para dirimir eventuais dúvidas.`,
  },
  {
    label: "Consultoria / Day-of",
    text: `CONTRATO DE CONSULTORIA DE CASAMENTO (DAY-OF)

As partes convencionam a prestação de serviços de consultoria e coordenação no dia do evento, conforme abaixo:

1. OBJETO
Serviços de consultoria e coordenação no dia do casamento (Day-of Coordination).

2. SERVIÇOS INCLUSOS
- 2 reuniões de alinhamento pré-evento
- Contato com fornecedores nas últimas 2 semanas
- Presença e coordenação no dia do evento (até 10 horas)
- Montagem do cronograma final

3. PAGAMENTO
50% na assinatura. 50% no dia anterior ao evento.

4. RESPONSABILIDADES
O contratado não se responsabiliza por serviços contratados diretamente pelo casal antes do período de consultoria.

5. FORO
Fica eleito o foro da comarca do contratado.`,
  },
];

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusBadge({ contract }: { contract: Contract }) {
  if (contract.signedByPlanner && contract.signedByCouple) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        Assinado por ambos
      </span>
    );
  }
  if (contract.signedByPlanner) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        Aguardando casal
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
      Não assinado
    </span>
  );
}

export default function ContratosPage() {
  const { status: authStatus } = useSession();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [weddings, setWeddings] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [newWeddingId, setNewWeddingId] = useState("");
  const [newTerms, setNewTerms] = useState("");
  const [newValue, setNewValue] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Sign modal
  const [signModalContract, setSignModalContract] = useState<Contract | null>(null);
  const [signerName, setSignerName] = useState("");
  const [signing, setSigning] = useState(false);

  async function load() {
    const [cr, wr] = await Promise.all([
      fetch("/api/planner/contracts"),
      fetch("/api/planner/dashboard"),
    ]);
    if (cr.ok) setContracts(await cr.json());
    if (wr.ok) {
      const d = await wr.json();
      setWeddings(d.weddings ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (authStatus === "authenticated") load();
  }, [authStatus]);

  async function handleCreate() {
    if (!newWeddingId || !newTerms.trim()) return;
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/planner/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weddingId: newWeddingId, terms: newTerms, value: newValue || null }),
      });
      if (!res.ok) {
        const d = await res.json();
        setCreateError(d.error ?? "Erro ao criar");
      } else {
        setModalOpen(false);
        setNewWeddingId("");
        setNewTerms("");
        setNewValue("");
        await load();
      }
    } catch {
      setCreateError("Erro de conexão");
    } finally {
      setCreating(false);
    }
  }

  async function handleSignPlanner(contract: Contract) {
    setSignModalContract(contract);
    setSignerName("");
  }

  async function submitSign() {
    if (!signModalContract || !signerName.trim()) return;
    setSigning(true);
    try {
      const res = await fetch(`/api/planner/contracts/${signModalContract.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sign-planner", name: signerName }),
      });
      if (res.ok) {
        setSignModalContract(null);
        await load();
      }
    } finally {
      setSigning(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este contrato?")) return;
    await fetch(`/api/planner/contracts/${id}`, { method: "DELETE" });
    await load();
  }

  function downloadPdf(id: string) {
    window.open(`/api/planner/contracts/${id}/pdf`, "_blank");
  }

  function getCoupleLink(id: string) {
    return `${window.location.origin}/contratos/${id}`;
  }

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-verde-noite">Contratos</h1>
          <p className="font-body text-sm text-verde-noite/50 mt-1">
            Crie, envie e gerencie contratos eletrônicos com os casais
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 bg-copper text-white rounded-xl font-body text-sm font-medium hover:bg-copper/90 transition"
        >
          Novo contrato
        </button>
      </div>

      {contracts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <p className="font-heading text-xl text-verde-noite/40 mb-2">Nenhum contrato ainda</p>
          <p className="font-body text-sm text-verde-noite/30">
            Clique em &quot;Novo contrato&quot; para criar o primeiro
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-heading text-lg text-verde-noite">
                      {c.wedding.partnerName1} &amp; {c.wedding.partnerName2}
                    </h3>
                    <StatusBadge contract={c} />
                  </div>
                  <p className="font-body text-sm text-verde-noite/50">
                    Data: {formatDate(c.wedding.weddingDate)} · Criado em {formatDate(c.createdAt)}
                    {c.value != null && ` · ${formatCurrency(c.value)}`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!c.signedByPlanner && (
                    <button
                      onClick={() => handleSignPlanner(c)}
                      className="px-3 py-1.5 bg-teal text-white rounded-lg font-body text-xs font-medium hover:bg-teal/90 transition"
                    >
                      Assinar
                    </button>
                  )}
                  {c.signedByPlanner && !c.signedByCouple && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getCoupleLink(c.id));
                        alert("Link copiado!");
                      }}
                      className="px-3 py-1.5 border border-teal text-teal rounded-lg font-body text-xs font-medium hover:bg-teal/5 transition"
                    >
                      Copiar link do casal
                    </button>
                  )}
                  <button
                    onClick={() => downloadPdf(c.id)}
                    className="px-3 py-1.5 border border-gray-300 text-verde-noite/70 rounded-lg font-body text-xs hover:bg-gray-50 transition"
                  >
                    PDF
                  </button>
                  {!c.signedByCouple && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg font-body text-xs hover:bg-red-50 transition"
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </div>

              {/* Signature info */}
              {(c.signedByPlanner || c.signedByCouple) && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4">
                  {c.signedByPlanner && (
                    <p className="font-body text-xs text-verde-noite/50">
                      Cerimonialista: <strong>{c.plannerName}</strong> em {formatDate(c.plannerSignedAt)}
                    </p>
                  )}
                  {c.signedByCouple && (
                    <p className="font-body text-xs text-verde-noite/50">
                      Casal: <strong>{c.coupleName}</strong> em {formatDate(c.coupleSignedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Contract Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-xl text-verde-noite mb-4">Novo Contrato</h2>

            <div className="space-y-4">
              <div>
                <label className="block font-body text-sm mb-1 text-verde-noite/70">Casamento *</label>
                <select
                  value={newWeddingId}
                  onChange={(e) => setNewWeddingId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-verde-noite bg-white focus:border-teal outline-none"
                >
                  <option value="">Selecione um casamento</option>
                  {weddings.map((w) => (
                    <option key={w.assignmentId} value={w.wedding.id}>
                      {w.wedding.partnerName1} {'&'} {w.wedding.partnerName2}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-body text-sm mb-1 text-verde-noite/70">Valor (opcional)</label>
                <input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Ex: 5000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-verde-noite bg-white focus:border-teal outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-body text-sm text-verde-noite/70">Termos do Contrato *</label>
                  <div className="flex gap-2">
                    {CONTRACT_TEMPLATES.map((t) => (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => setNewTerms(t.text)}
                        className="px-2 py-1 text-xs font-body text-teal border border-teal/40 rounded-lg hover:bg-teal/5 transition"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={newTerms}
                  onChange={(e) => setNewTerms(e.target.value)}
                  rows={12}
                  placeholder="Cole ou edite os termos do contrato..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl font-body text-sm text-verde-noite bg-white focus:border-teal outline-none resize-none"
                />
              </div>

              {createError && (
                <p className="font-body text-sm text-red-600">{createError}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setModalOpen(false); setCreateError(""); }}
                  className="flex-1 py-2.5 border border-gray-300 text-verde-noite/70 rounded-xl font-body text-sm hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !newWeddingId || !newTerms.trim()}
                  className="flex-1 py-2.5 bg-copper text-white rounded-xl font-body text-sm font-medium hover:bg-copper/90 transition disabled:opacity-50"
                >
                  {creating ? "Criando..." : "Criar Contrato"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign Modal */}
      {signModalContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-heading text-xl text-verde-noite mb-2">Assinar Contrato</h2>
            <p className="font-body text-sm text-verde-noite/60 mb-5">
              Digite seu nome completo para assinar digitalmente.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-verde-noite bg-white focus:border-teal outline-none"
              />

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" required className="mt-1 accent-teal w-4 h-4" />
                <span className="font-body text-sm text-verde-noite/70">
                  Declaro que li, entendi e aceito os termos deste contrato
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSignModalContract(null)}
                  className="flex-1 py-2.5 border border-gray-300 text-verde-noite/70 rounded-xl font-body text-sm hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={submitSign}
                  disabled={signing || !signerName.trim()}
                  className="flex-1 py-2.5 bg-teal text-white rounded-xl font-body text-sm font-medium hover:bg-teal/90 transition disabled:opacity-50"
                >
                  {signing ? "Assinando..." : "Confirmar Assinatura"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
