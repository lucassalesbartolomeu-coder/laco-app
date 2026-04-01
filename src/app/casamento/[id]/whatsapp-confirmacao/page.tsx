"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { MessageCircle, Send, CheckCircle2, AlertCircle } from "lucide-react";
import BottomNav from "@/components/bottom-nav";

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
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
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
    <div className="min-h-screen bg-ivory pb-24">
      <div className="bg-midnight px-5 pt-12 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-5 h-5 text-white/60" />
          <span className="font-body text-xs text-white/50 uppercase tracking-wider">RSVP</span>
        </div>
        <h1 className="font-heading text-3xl text-white mb-1">WhatsApp</h1>
        <p className="font-body text-sm text-white/60">Envie convites e colete confirmações via WhatsApp</p>
      </div>

      <div className="px-4 py-6 space-y-4">
        {config && (
          <div className="bg-white rounded-2xl shadow-card border border-midnight/[0.06] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-body text-sm font-medium text-midnight">Mensagens enviadas</p>
                <p className="font-body text-xs text-stone">{config.sentCount} convidados notificados</p>
              </div>
            </div>
            {config.message && (
              <div className="bg-fog rounded-xl p-3">
                <p className="font-body text-xs text-stone mb-1">Mensagem padrão</p>
                <p className="font-body text-sm text-midnight">{config.message}</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-gold/10 rounded-2xl border border-gold/20 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <div>
            <p className="font-body text-sm font-medium text-midnight">Feature Pro</p>
            <p className="font-body text-xs text-stone mt-0.5">
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
            className="w-full flex items-center justify-center gap-2 bg-midnight text-ivory font-body font-medium text-sm py-3.5 rounded-2xl hover:bg-midnight/90 transition-all active:scale-[0.98] disabled:opacity-50"
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
