"use client";

import { Bell, BellOff } from "lucide-react";
import { usePushSubscribe } from "@/hooks/use-push-subscribe";

interface PushSubscribeButtonProps {
  weddingId: string;
}

export default function PushSubscribeButton({ weddingId }: PushSubscribeButtonProps) {
  const { supported, permission, subscribed, loading, subscribe, unsubscribe } =
    usePushSubscribe(weddingId);

  if (!supported || permission === "denied") return null;

  if (subscribed) {
    return (
      <button
        onClick={unsubscribe}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-body text-white/60 hover:text-white/80 hover:bg-white/10 transition-all disabled:opacity-50"
        title="Desativar notificações"
      >
        <BellOff className="w-4 h-4" />
        <span className="hidden sm:inline">Notificações ativas</span>
      </button>
    );
  }

  return (
    <button
      onClick={subscribe}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-body font-medium text-white bg-white/20 hover:bg-white/30 transition-all disabled:opacity-50"
      title="Ativar notificações de RSVP"
    >
      <Bell className="w-4 h-4" />
      <span>{loading ? "Ativando…" : "Notificações"}</span>
    </button>
  );
}
