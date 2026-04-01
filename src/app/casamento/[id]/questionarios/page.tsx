"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ClipboardList, CheckCircle2, Clock } from "lucide-react";
import BottomNav from "@/components/bottom-nav";

interface Questionnaire {
  id: string;
  title: string;
  answeredAt: string | null;
  createdAt: string;
  planner: { companyName: string };
}

export default function QuestionariosPage() {
  const params = useParams();
  const weddingId = params?.id as string;
  const { data: session, status } = useSession();
  const [items, setItems] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/weddings/${weddingId}/questionnaires`)
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status, weddingId]);

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
      {/* Hero */}
      <div className="bg-midnight px-5 pt-12 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardList className="w-5 h-5 text-white/60" />
          <span className="font-body text-xs text-white/50 uppercase tracking-wider">Do seu cerimonialista</span>
        </div>
        <h1 className="font-heading text-3xl text-white mb-1">Questionários</h1>
        <p className="font-body text-sm text-white/60">Responda as perguntas do seu cerimonialista</p>
      </div>

      <div className="px-4 py-6">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="w-12 h-12 text-stone/30 mx-auto mb-4" />
            <p className="font-body text-sm text-stone">Nenhum questionário recebido ainda.</p>
            <p className="font-body text-xs text-stone/60 mt-1">Seu cerimonialista enviará questionários aqui.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((q) => (
              <Link
                key={q.id}
                href={`/questionario/${q.id}`}
                className="flex items-center gap-4 bg-white rounded-2xl shadow-card border border-midnight/[0.06] p-4 hover:shadow-card-hover transition-all active:scale-[0.98]"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${q.answeredAt ? "bg-green-50" : "bg-gold/10"}`}>
                  {q.answeredAt
                    ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                    : <Clock className="w-5 h-5 text-gold" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium text-midnight truncate">{q.title}</p>
                  <p className="font-body text-xs text-stone">{q.planner?.companyName}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-body font-medium ${q.answeredAt ? "bg-green-100 text-green-700" : "bg-gold/10 text-gold"}`}>
                    {q.answeredAt ? "Respondido" : "Pendente"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone/40" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
