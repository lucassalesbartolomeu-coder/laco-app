"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { MessageCircle, Send, CheckCircle2, AlertCircle } from "lucide-react";
import BottomNav from "@/components/bottom-nav";

const GOLD  = "#A98950";
const BROWN = "#3D322A";
const CREME = "#FAF6EF";

interface WhatsAppConfig {
  enabled: boolean;
  message: string;
  sentCount: number;
}

export default function WhatsAppConfirmacaoPage() {
  const params = useParams();
  const weddingId = params?.id as string;
  const { data: session, status } = useSession();
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/weddings/${weddingId}/whatsapp`)
      .then((r) => r.json())
      .then((d) => setConfig(d))
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

  const handleSend = async () => {
    setSending(true);
    try {
      await fetch(`/api/weddings/${weddingId}/whatsapp`, { method: "POST" });
      setSent(true);
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>

      {/* Light header */}
      <div className="px-5 pt-10 pb-6">
        <p className="text-[9px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "rgba(61,50,42,0.36)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
          Confirmações
        </p>
        <h1 className="text-[30px] font-light leading-tight mb-1"
          style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif" }}>
          WhatsApp
        </h1>
        <p className="text-[12px] leading-relaxed" style={{ color: "rgba(61,50,42,0.58)" }}>
          Configure o envio de convites e confirmações via WhatsApp.
        </p>
      </div>

      {/* Ornamental divider */}
      <div className="flex items-center gap-2.5 mx-5 mb-5">
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
        <div className="w-[5px] h-[5px] rotate-45 opacity-55 flex-shrink-0" style={{ background: GOLD }} />
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
      </div>

      <div className="px-4 pb-6 space-y-4">
        {config && (
          <div className="bg-white rounded-2xl p-5" style={{ border: "1.5px solid rgba(169,137,80,0.16)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-body text-sm font-medium" style={{ color: BROWN }}>Mensagens enviadas</p>
                <p className="font-body text-xs" style={{ color: "rgba(61,50,42,0.50)" }}>{config.sentCount} convidados notificados</p>
              </div>
            </div>
            {config.message && (
              <div className="rounded-xl p-3" style={{ background: "rgba(169,137,80,0.07)" }}>
                <p className="font-body text-xs mb-1" style={{ color: "rgba(61,50,42,0.50)" }}>Mensagem padrão</p>
                <p className="font-body text-sm" style={{ color: BROWN }}>{config.message}</p>
              </div>
            )}
          </div>
        )}

        <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: `${GOLD}1A`, border: `1.5px solid rgba(169,137,80,0.20)` }}>
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: GOLD }} />
          <div>
            <p className="font-body text-sm font-medium" style={{ color: BROWN }}>Feature Pro</p>
            <p className="font-body text-xs mt-0.5" style={{ color: "rgba(61,50,42,0.58)" }}>
              O envio em massa via WhatsApp está disponível no plano Pro. Os convidados recebem um link personalizado de RSVP.
            </p>
          </div>
        </div>

        {sent ? (
          <div className="flex items-center justify-center gap-2 py-4">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="font-body text-sm text-green-700">Mensagens enviadas com sucesso!</span>
          </div>
        ) : (
          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 font-body font-medium text-sm py-3.5 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ background: BROWN, color: CREME }}
          >
            <Send className="w-4 h-4" />
            {sending ? "Enviando..." : "Enviar convites via WhatsApp"}
          </button>
        )}
      </div>

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
