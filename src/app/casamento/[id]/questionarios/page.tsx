"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ClipboardList, CheckCircle2, Clock } from "lucide-react";
import BottomNav from "@/components/bottom-nav";

const GOLD  = "#A98950";
const BROWN = "#3D322A";
const CREME = "#FAF6EF";

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREME }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: BROWN, borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>

      {/* Light header */}
      <div className="px-5 pt-10 pb-6">
        <p className="text-[9px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "rgba(61,50,42,0.36)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
          Cerimonialista
        </p>
        <h1 className="text-[30px] font-light leading-tight mb-1"
          style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif" }}>
          Questionários
        </h1>
        <p className="text-[12px] leading-relaxed" style={{ color: "rgba(61,50,42,0.58)" }}>
          Responda os questionários enviados pela sua cerimonialista.
        </p>
      </div>

      {/* Ornamental divider */}
      <div className="flex items-center gap-2.5 mx-5 mb-5">
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
        <div className="w-[5px] h-[5px] rotate-45 opacity-55 flex-shrink-0" style={{ background: GOLD }} />
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
      </div>

      <div className="px-4 pb-6">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="w-12 h-12 mx-auto mb-4" style={{ color: "rgba(61,50,42,0.20)" }} />
            <p className="font-body text-sm" style={{ color: BROWN }}>Nenhum questionário recebido ainda.</p>
            <p className="font-body text-xs mt-1" style={{ color: "rgba(61,50,42,0.50)" }}>Seu cerimonialista enviará questionários aqui.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((q) => (
              <Link
                key={q.id}
                href={`/questionario/${q.id}`}
                className="flex items-center gap-4 bg-white rounded-2xl p-4 hover:shadow-sm transition-all active:scale-[0.98]"
                style={{ border: "1.5px solid rgba(169,137,80,0.16)" }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${q.answeredAt ? "bg-green-50" : ""}`}
                  style={!q.answeredAt ? { background: `${GOLD}1A` } : {}}>
                  {q.answeredAt
                    ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                    : <Clock className="w-5 h-5" style={{ color: GOLD }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium truncate" style={{ color: BROWN }}>{q.title}</p>
                  <p className="font-body text-xs" style={{ color: "rgba(61,50,42,0.50)" }}>{q.planner?.companyName}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-body font-medium ${q.answeredAt ? "bg-green-100 text-green-700" : ""}`}
                    style={!q.answeredAt ? { background: `${GOLD}1A`, color: GOLD } : {}}>
                    {q.answeredAt ? "Respondido" : "Pendente"}
                  </span>
                  <ChevronRight className="w-4 h-4" style={{ color: "rgba(61,50,42,0.30)" }} />
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
