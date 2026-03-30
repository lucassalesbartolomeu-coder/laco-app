"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

/* ─── Types ─────────────────────────────────────────────────────────── */

interface QuestionOption {
  id: string;
  question: string;
  type: "text" | "choice" | "scale";
  options?: string[];
}

interface QuestionnaireWedding {
  id: string;
  partnerName1: string;
  partnerName2: string;
  weddingDate: string | null;
}

interface Questionnaire {
  id: string;
  title: string;
  token: string;
  questions: QuestionOption[];
  answers: { questionId: string; answer: string }[] | null;
  answeredAt: string | null;
  createdAt: string;
  wedding: QuestionnaireWedding;
}

interface WeddingAssignment {
  assignmentId: string;
  wedding: { id: string; partnerName1: string; partnerName2: string };
}

/* ─── Default questions ──────────────────────────────────────────────── */

const DEFAULT_QUESTIONS: QuestionOption[] = [
  {
    id: "q1",
    question: "Qual o estilo que vocês imaginam para o casamento?",
    type: "scale",
    options: ["Muito rústico", "Rústico", "Neutro", "Moderno", "Muito moderno"],
  },
  {
    id: "q2",
    question: "Vocês têm preferências de fornecedores?",
    type: "text",
  },
  {
    id: "q3",
    question: "Qual o orçamento aproximado total?",
    type: "choice",
    options: ["Até R$ 50 mil", "R$ 50 mil – R$ 100 mil", "R$ 100 mil – R$ 200 mil", "Acima de R$ 200 mil"],
  },
  {
    id: "q4",
    question: "Há alguma tradição familiar importante para incluir?",
    type: "text",
  },
  {
    id: "q5",
    question: "Preferem buffet sentado ou coquetel?",
    type: "choice",
    options: ["Buffet sentado", "Coquetel", "Misto (buffet + coquetel)", "Ainda não decidimos"],
  },
];

/* ─── Icons ─────────────────────────────────────────────────────────── */

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────────── */

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function getPublicLink(token: string) {
  return `${window.location.origin}/questionario/${token}`;
}

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function QuestionariosPage() {
  const { status: authStatus } = useSession();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [weddings, setWeddings] = useState<WeddingAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Create modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newWeddingId, setNewWeddingId] = useState("");
  const [newTitle, setNewTitle] = useState("Questionário de Preferências");
  const [questions, setQuestions] = useState<QuestionOption[]>(DEFAULT_QUESTIONS);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // View answers modal
  const [viewQ, setViewQ] = useState<Questionnaire | null>(null);

  async function load() {
    const [qr, wr] = await Promise.all([
      fetch("/api/planner/questionnaires"),
      fetch("/api/planner/dashboard"),
    ]);
    if (qr.ok) setQuestionnaires(await qr.json());
    if (wr.ok) {
      const d = await wr.json();
      setWeddings(d.weddings ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (authStatus === "authenticated") load();
  }, [authStatus]);

  function handleCopyLink(token: string) {
    navigator.clipboard.writeText(getPublicLink(token));
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este questionário?")) return;
    await fetch(`/api/planner/questionnaires/${id}`, { method: "DELETE" });
    await load();
  }

  function openModal() {
    setNewWeddingId("");
    setNewTitle("Questionário de Preferências");
    setQuestions(DEFAULT_QUESTIONS);
    setCreateError("");
    setModalOpen(true);
  }

  function addQuestion() {
    const id = `q${Date.now()}`;
    setQuestions((prev) => [...prev, { id, question: "", type: "text" }]);
  }

  function updateQuestion(idx: number, field: keyof QuestionOption, value: string) {
    setQuestions((prev) => {
      const updated = [...prev];
      if (field === "type") {
        updated[idx] = { ...updated[idx], type: value as QuestionOption["type"] };
      } else if (field === "question") {
        updated[idx] = { ...updated[idx], question: value };
      } else if (field === "options") {
        updated[idx] = { ...updated[idx], options: value.split("\n").filter(Boolean) };
      }
      return updated;
    });
  }

  function removeQuestion(idx: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleCreate() {
    if (!newWeddingId || questions.length === 0) return;
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/planner/questionnaires", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weddingId: newWeddingId, title: newTitle, questions }),
      });
      if (!res.ok) {
        const d = await res.json();
        setCreateError(d.error ?? "Erro ao criar questionário");
      } else {
        setModalOpen(false);
        await load();
      }
    } catch {
      setCreateError("Erro de conexão");
    } finally {
      setCreating(false);
    }
  }

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-midnight">Questionários</h1>
          <p className="font-body text-sm text-midnight/50 mt-1">
            Envie questionários de preferências para os casais
          </p>
        </div>
        <button
          onClick={openModal}
          className="px-5 py-2.5 bg-gold text-white rounded-xl font-body text-sm font-medium hover:bg-gold/90 transition"
        >
          Novo Questionário
        </button>
      </div>

      {/* List */}
      {questionnaires.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <p className="font-heading text-xl text-midnight/40 mb-2">Nenhum questionário ainda</p>
          <p className="font-body text-sm text-midnight/30">
            Crie o primeiro e compartilhe com um casal
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questionnaires.map((q) => (
            <div key={q.id} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-heading text-lg text-midnight">
                      {q.wedding.partnerName1} & {q.wedding.partnerName2}
                    </h3>
                    {q.answeredAt ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Respondido
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        Aguardando resposta
                      </span>
                    )}
                  </div>
                  <p className="font-body text-sm text-midnight/50">
                    {q.title} · Criado em {formatDate(q.createdAt)}
                    {q.answeredAt && ` · Respondido em ${formatDate(q.answeredAt)}`}
                  </p>
                  <p className="font-body text-xs text-midnight/30 mt-1 break-all">
                    {typeof window !== "undefined" ? getPublicLink(q.token) : `…/questionario/${q.token}`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCopyLink(q.token)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-midnight text-midnight rounded-lg font-body text-xs font-medium hover:bg-midnight/5 transition"
                  >
                    <CopyIcon />
                    {copiedToken === q.token ? "Copiado!" : "Copiar link"}
                  </button>

                  {q.answeredAt && (
                    <button
                      onClick={() => setViewQ(q)}
                      className="px-3 py-1.5 bg-midnight text-white rounded-lg font-body text-xs font-medium hover:bg-midnight/90 transition"
                    >
                      Ver respostas
                    </button>
                  )}

                  {!q.answeredAt && (
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-500 rounded-lg font-body text-xs hover:bg-red-50 transition"
                    >
                      <TrashIcon />
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-xl text-midnight">Novo Questionário</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400"
              >
                <XIcon />
              </button>
            </div>

            <div className="space-y-5">
              {/* Casamento */}
              <div>
                <label className="block font-body text-sm mb-1.5 text-midnight/70">
                  Casamento *
                </label>
                <select
                  value={newWeddingId}
                  onChange={(e) => setNewWeddingId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl font-body text-sm text-midnight bg-white focus:border-gold outline-none"
                >
                  <option value="">Selecione um casamento</option>
                  {weddings.map((w) => (
                    <option key={w.assignmentId} value={w.wedding.id}>
                      {w.wedding.partnerName1} & {w.wedding.partnerName2}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block font-body text-sm mb-1.5 text-midnight/70">
                  Título
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl font-body text-sm text-midnight bg-white focus:border-gold outline-none"
                />
              </div>

              {/* Questions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-body text-sm text-midnight/70">Perguntas</label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-midnight/10 text-midnight rounded-lg font-body text-xs font-medium hover:bg-midnight/20 transition"
                  >
                    <PlusIcon />
                    Adicionar pergunta
                  </button>
                </div>

                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="border border-gray-100 rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => updateQuestion(idx, "question", e.target.value)}
                            placeholder="Texto da pergunta"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg font-body text-sm text-midnight bg-white focus:border-gold outline-none"
                          />
                        </div>
                        <button
                          onClick={() => removeQuestion(idx)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition flex-shrink-0"
                        >
                          <TrashIcon />
                        </button>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {(["text", "choice", "scale"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => updateQuestion(idx, "type", t)}
                            className={`px-3 py-1 rounded-lg font-body text-xs transition ${
                              q.type === t
                                ? "bg-midnight text-white"
                                : "bg-gray-100 text-midnight/60 hover:bg-gray-200"
                            }`}
                          >
                            {t === "text" ? "Texto livre" : t === "choice" ? "Múltipla escolha" : "Escala"}
                          </button>
                        ))}
                      </div>

                      {(q.type === "choice" || q.type === "scale") && (
                        <div>
                          <label className="block font-body text-xs text-midnight/50 mb-1">
                            Opções (uma por linha)
                          </label>
                          <textarea
                            rows={3}
                            value={(q.options ?? []).join("\n")}
                            onChange={(e) => updateQuestion(idx, "options", e.target.value)}
                            placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg font-body text-xs text-midnight bg-white focus:border-gold outline-none resize-none"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {createError && (
                <p className="font-body text-sm text-red-500">{createError}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-midnight/60 rounded-xl font-body text-sm hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !newWeddingId || questions.length === 0}
                  className="flex-1 py-2.5 bg-gold text-white rounded-xl font-body text-sm font-medium hover:bg-gold/90 transition disabled:opacity-50"
                >
                  {creating ? "Criando..." : "Criar e compartilhar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Answers Modal */}
      {viewQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-heading text-xl text-midnight">{viewQ.title}</h2>
                <p className="font-body text-sm text-midnight/50">
                  {viewQ.wedding.partnerName1} & {viewQ.wedding.partnerName2}
                </p>
              </div>
              <button
                onClick={() => setViewQ(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400"
              >
                <XIcon />
              </button>
            </div>

            <div className="space-y-4">
              {viewQ.questions.map((q) => {
                const answer = viewQ.answers?.find((a) => a.questionId === q.id);
                return (
                  <div key={q.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <p className="font-body text-sm font-medium text-midnight mb-1">{q.question}</p>
                    <p className="font-body text-sm text-midnight/60">
                      {answer?.answer || <span className="italic text-gray-300">Sem resposta</span>}
                    </p>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setViewQ(null)}
              className="mt-5 w-full py-2.5 border border-gray-200 text-midnight/60 rounded-xl font-body text-sm hover:bg-gray-50 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
