"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import BottomNav from "@/components/bottom-nav";

const EXAMPLES = [
  { gift: "Cafeteira expresso automática", scene: "Dois tomando café da manhã juntos no domingo", emoji: "☕" },
  { gift: "Kit de viagem premium", scene: "Curtindo a lua de mel com as malas ao fundo", emoji: "✈️" },
  { gift: "Jogo de cama 600 fios", scene: "Acordando sorridentes em um domingo relaxado", emoji: "🛏️" },
  { gift: "Robô aspirador", scene: "Dançando enquanto o robô cuida da casa", emoji: "🏠" },
  { gift: "Smart TV 55\" 4K", scene: "Noite de filme no sofá com pipoca", emoji: "🎬" },
  { gift: "Batedeira planetária", scene: "Fazendo bolo juntos na cozinha nova", emoji: "🎂" },
];

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    items: 10,
    desc: "Perfeito para uma lista enxuta",
    highlight: false,
  },
  {
    id: "completa",
    name: "Lista Completa",
    price: 99,
    items: 30,
    desc: "A mais escolhida pelos casais",
    highlight: true,
  },
  {
    id: "unlimited",
    name: "Ilimitada",
    price: 149,
    items: 999,
    desc: "Todos os presentes com fotos",
    highlight: false,
  },
];

export default function PresentesIAPage() {
  const params = useParams();
  const weddingId = params.id as string;
  const { data: session, status } = useSession();
  const [selectedPlan, setSelectedPlan] = useState("completa");
  const [uploading, setUploading] = useState(false);

  if (status === "loading") {
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
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1A1F3A 0%, #2D7D6F 50%, #B87333 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="relative z-10 px-5 pt-12 pb-10">
          <Link
            href={`/casamento/${weddingId}/presentes`}
            className="inline-flex items-center gap-1 font-body text-xs text-white/50 hover:text-white/80 transition mb-4"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Lista de Presentes
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full mb-4">
            <span className="text-sm">✨</span>
            <span className="font-body text-xs font-medium text-white/90">Powered by IA</span>
          </div>
          <h1 className="font-heading text-3xl text-white mb-2 leading-tight">
            Lista de Presentes<br />com Fotos suas
          </h1>
          <p className="font-body text-sm text-white/70 max-w-xs leading-relaxed">
            A IA cria fotos reais de vocês dois aproveitando cada presente — os convidados compram 25% mais quando se imaginam dando algo que o casal vai usar.
          </p>
        </div>
      </div>

      {/* Social proof stat */}
      <div className="px-4 -mt-5 relative z-10 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-heading text-2xl text-gold">+25%</p>
              <p className="font-body text-[10px] text-midnight/40">compras</p>
            </div>
            <div>
              <p className="font-heading text-2xl text-midnight">2min</p>
              <p className="font-body text-[10px] text-midnight/40">para gerar</p>
            </div>
            <div>
              <p className="font-heading text-2xl text-midnight">100%</p>
              <p className="font-body text-[10px] text-midnight/40">personalizado</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="px-4 mb-6">
        <h2 className="font-heading text-lg text-midnight mb-3">Como funciona</h2>
        <div className="space-y-3">
          {[
            { step: "1", title: "Envie uma foto de vocês", desc: "Um selfie ou foto juntos — a IA usa como base para gerar as imagens" },
            { step: "2", title: "A IA cria as cenas", desc: "Para cada presente da sua lista, geramos uma foto realista de vocês dois usando o item" },
            { step: "3", title: "Aprove e publique", desc: "Você revisa e escolhe as melhores. Os convidados veem tudo na página pública" },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-4 bg-white rounded-2xl border border-gray-100 p-4">
              <div className="w-8 h-8 rounded-full bg-midnight flex-shrink-0 flex items-center justify-center">
                <span className="font-heading text-sm text-white font-bold">{s.step}</span>
              </div>
              <div>
                <p className="font-body text-sm font-medium text-midnight">{s.title}</p>
                <p className="font-body text-xs text-midnight/50 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Example cards */}
      <div className="mb-6">
        <h2 className="font-heading text-lg text-midnight mb-3 px-4">Exemplos de cenas</h2>
        <div className="flex gap-3 overflow-x-auto px-4 pb-1" style={{ scrollbarWidth: "none" }}>
          {EXAMPLES.map((ex) => (
            <div key={ex.gift} className="flex-shrink-0 w-52 bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Placeholder visual */}
              <div className="h-32 flex items-center justify-center text-5xl" style={{ background: "linear-gradient(135deg, #F5F0E8, #E8EDE8)" }}>
                {ex.emoji}
              </div>
              <div className="p-3">
                <p className="font-body text-xs font-medium text-midnight leading-snug mb-1">{ex.gift}</p>
                <p className="font-body text-[10px] text-midnight/40 italic leading-snug">&ldquo;{ex.scene}&rdquo;</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="px-4 mb-6">
        <h2 className="font-heading text-lg text-midnight mb-3">Escolha seu plano</h2>
        <div className="space-y-3">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                selectedPlan === plan.id
                  ? plan.highlight
                    ? "border-gold bg-gold/5"
                    : "border-midnight bg-midnight/5"
                  : "border-gray-100 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedPlan === plan.id
                      ? plan.highlight ? "border-gold" : "border-midnight"
                      : "border-gray-300"
                  }`}>
                    {selectedPlan === plan.id && (
                      <div className={`w-2.5 h-2.5 rounded-full ${plan.highlight ? "bg-gold" : "bg-midnight"}`} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-body text-sm font-medium text-midnight">{plan.name}</p>
                      {plan.highlight && (
                        <span className="px-1.5 py-0.5 bg-gold/10 rounded-full font-body text-[9px] font-bold text-gold uppercase">Popular</span>
                      )}
                    </div>
                    <p className="font-body text-[11px] text-midnight/50">
                      {plan.items < 999 ? `Até ${plan.items} presentes com foto` : "Presentes ilimitados com foto"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-heading text-xl text-midnight">R${plan.price}</p>
                  <p className="font-body text-[10px] text-midnight/40">único</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Upload CTA */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="font-body text-sm font-medium text-midnight mb-1">Envie uma foto de vocês</p>
          <p className="font-body text-xs text-midnight/50 mb-4">A IA usa para gerar as cenas personalizadas</p>
          <button
            onClick={() => setUploading(true)}
            disabled={uploading}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl font-body text-sm text-midnight/50 hover:border-midnight/40 hover:text-midnight transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {uploading ? "Processando..." : "Selecionar foto"}
          </button>
        </div>
      </div>

      {/* Buy button */}
      <div className="px-4">
        <button
          className="w-full py-4 rounded-2xl font-body text-base font-semibold text-white transition-all active:scale-[0.99]"
          style={{ background: "linear-gradient(135deg, #B87333, #2D7D6F)" }}
        >
          Ativar Lista com IA — R${PLANS.find((p) => p.id === selectedPlan)?.price}
        </button>
        <p className="font-body text-xs text-midnight/40 text-center mt-3">
          Pagamento único · Geração em até 2 minutos · Revisão antes de publicar
        </p>
      </div>

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
