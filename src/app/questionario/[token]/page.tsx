"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

/* ─── Types ─────────────────────────────────────────────────────────── */

interface Question {
  id: string;
  question: string;
  type: "text" | "choice" | "scale";
  options?: string[];
}

interface QuestionnaireData {
  id: string;
  title: string;
  questions: Question[];
  answers: { questionId: string; answer: string }[] | null;
  answeredAt: string | null;
  wedding: {
    partnerName1: string;
    partnerName2: string;
    weddingDate: string | null;
  };
}

/* ─── Icons ─────────────────────────────────────────────────────────── */

function CheckCircleIcon() {
  return (
    <svg className="w-16 h-16 text-midnight mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/* ─── Question Components ─────────────────────────────────────────── */

function TextQuestion({
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      rows={3}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Sua resposta..."
      className="w-full px-4 py-3 border border-gray-200 rounded-xl font-body text-sm text-midnight bg-white focus:border-midnight outline-none resize-none transition"
    />
  );
}

function ChoiceQuestion({
  question: q,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      {(q.options ?? []).map((opt) => (
        <label
          key={opt}
          className={`flex items-center gap-3 px-4 py-3 border rounded-xl cursor-pointer transition ${
            value === opt
              ? "border-midnight bg-midnight/5"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition ${
              value === opt ? "border-midnight bg-midnight" : "border-gray-300"
            }`}
          >
            {value === opt && (
              <div className="w-full h-full rounded-full bg-white scale-50" />
            )}
          </div>
          <span className="font-body text-sm text-midnight">{opt}</span>
          <input
            type="radio"
            className="sr-only"
            checked={value === opt}
            onChange={() => onChange(opt)}
          />
        </label>
      ))}
    </div>
  );
}

function ScaleQuestion({
  question: q,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (v: string) => void;
}) {
  const options = q.options ?? [];
  return (
    <div className="space-y-2">
      {options.map((opt, idx) => (
        <label
          key={opt}
          className={`flex items-center gap-3 px-4 py-3 border rounded-xl cursor-pointer transition ${
            value === opt
              ? "border-midnight bg-midnight/5"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 transition ${
              value === opt ? "bg-midnight text-white" : "bg-gray-100 text-gray-500"
            }`}
          >
            {idx + 1}
          </div>
          <span className="font-body text-sm text-midnight">{opt}</span>
          <input
            type="radio"
            className="sr-only"
            checked={value === opt}
            onChange={() => onChange(opt)}
          />
        </label>
      ))}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function QuestionarioPublicoPage() {
  const params = useParams();
  const token = params?.token as string;

  const [data, setData] = useState<QuestionnaireData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/public/questionnaires/${token}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        setData(d);
        if (d.answeredAt) setSubmitted(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  function setAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit() {
    if (!data) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = data.questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] ?? "",
      }));
      const res = await fetch(`/api/public/questionnaires/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const d = await res.json();
        setError(d.error ?? "Erro ao enviar respostas");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── States ─────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
        <div className="text-center">
          <p className="font-heading text-2xl text-midnight/40 mb-2">Questionário não encontrado</p>
          <p className="font-body text-sm text-midnight/30">
            O link pode ter expirado ou estar incorreto.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <CheckCircleIcon />
          <h1 className="font-heading text-2xl text-midnight mt-4 mb-2">Obrigado!</h1>
          <p className="font-body text-sm text-midnight/60 leading-relaxed">
            Suas respostas foram enviadas para a cerimonialista. Em breve ela entrará em contato.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <div className="bg-midnight px-5 pt-12 pb-8">
        <p className="font-body text-xs text-white/40 uppercase tracking-wider mb-2">Laco</p>
        <h1 className="font-heading text-3xl text-white mb-1">{data.title}</h1>
        <p className="font-body text-sm text-white/60">
          {data.wedding.partnerName1} & {data.wedding.partnerName2}
          {data.wedding.weddingDate && (
            <> · {new Date(data.wedding.weddingDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</>
          )}
        </p>
      </div>

      {/* Questions */}
      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        <p className="font-body text-sm text-midnight/60 leading-relaxed">
          Sua cerimonialista gostaria de conhecer melhor as preferências de vocês. Por favor, responda com calma — não há resposta errada!
        </p>

        {data.questions.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="font-body text-sm font-medium text-midnight mb-3">
              <span className="text-midnight font-semibold mr-2">{idx + 1}.</span>
              {q.question}
            </p>

            {q.type === "text" && (
              <TextQuestion
                question={q}
                value={answers[q.id] ?? ""}
                onChange={(v) => setAnswer(q.id, v)}
              />
            )}
            {q.type === "choice" && (
              <ChoiceQuestion
                question={q}
                value={answers[q.id] ?? ""}
                onChange={(v) => setAnswer(q.id, v)}
              />
            )}
            {q.type === "scale" && (
              <ScaleQuestion
                question={q}
                value={answers[q.id] ?? ""}
                onChange={(v) => setAnswer(q.id, v)}
              />
            )}
          </div>
        ))}

        {error && (
          <p className="font-body text-sm text-red-500 text-center">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3.5 bg-midnight text-white rounded-2xl font-body text-sm font-medium hover:bg-midnight/90 transition disabled:opacity-50 shadow-sm"
        >
          {submitting ? "Enviando..." : "Enviar respostas"}
        </button>

        <p className="font-body text-xs text-center text-midnight/30 pb-4">
          Powered by Laco
        </p>
      </div>
    </div>
  );
}
