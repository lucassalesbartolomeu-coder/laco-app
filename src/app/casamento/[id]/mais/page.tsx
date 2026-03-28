"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import BottomNav from "@/components/bottom-nav";

/* ─── Icons ─────────────────────────────────────────────────────────── */

function ArrowIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function LockIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function MaisPage() {
  const params = useParams();
  const weddingId = params.id as string;
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!session) return null;

  const services = [
    {
      category: "Sua Cerimonialista",
      items: [
        { icon: "👩‍💼", label: "Painel da Cerimonialista", desc: "Conecte sua cerimonialista ao casamento — ela acompanha lista, fornecedores e timeline", href: "/cerimonialista/dashboard", available: true },
        { icon: "📋", label: "Questionarios", desc: "Cerimonialista envia questionarios de preferencias pro casal", href: "#", available: false },
        { icon: "💬", label: "Confirmacao via WhatsApp", desc: "Servico de confirmacao 100% dos convidados via WhatsApp + cerimonialista", href: "#", available: false },
      ],
    },
    {
      category: "Conta Digital Laco",
      items: [
        { icon: "💳", label: "Conta do Casamento", desc: "Conta digital compartilhada entre os noivos para gerenciar gastos do casamento", href: "#", available: false },
        { icon: "📊", label: "Extrato de Gastos", desc: "Categorizado automaticamente — quanto gastou com cada fornecedor", href: "#", available: false },
        { icon: "💸", label: "Pix dos Presentes", desc: "Receba presentes em dinheiro direto na conta do casamento", href: "#", available: false },
      ],
    },
    {
      category: "Servicos Premium",
      items: [
        { icon: "💳", label: "Maquininha de Casamento", desc: "Maquininha Stone personalizada para receber presentes e pagamentos no dia", href: "#", available: false },
        { icon: "👔", label: "Gravata Premium", desc: "Gravata exclusiva para o noivo — selecao curada por estilistas", href: "#", available: false },
        { icon: "📷", label: "Album Digital IA", desc: "Album organizado automaticamente com IA a partir das fotos dos convidados", href: "#", available: false },
        { icon: "🎵", label: "Playlist Personalizada", desc: "IA gera playlist baseada no estilo do casal para a festa", href: "#", available: false },
      ],
    },
    {
      category: "Sua Conta",
      items: [
        { icon: "👤", label: "Perfil", desc: "Dados pessoais, notificacoes, preferencias", href: "/perfil", available: true },
        { icon: "💍", label: "Dados do Casamento", desc: "Editar data, local, nomes, estilo", href: `/casamento/${weddingId}/simulador`, available: true },
        { icon: "🤝", label: "Convidar Parceiro(a)", desc: "Conecte o noivo/noiva para planejar juntos", href: "/dashboard", available: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-off-white pb-24">
      {/* Header */}
      <div className="bg-verde-noite px-5 pt-12 pb-8">
        <h1 className="font-heading text-3xl text-white mb-1">Mais</h1>
        <p className="font-body text-sm text-white/60">Servicos, cerimonialista, conta e configuracoes</p>
      </div>

      {/* Sections */}
      <div className="px-4 -mt-3 relative z-10 space-y-6">
        {services.map((section) => (
          <div key={section.category}>
            <h2 className="font-heading text-sm text-verde-noite/60 uppercase tracking-wider mb-2 px-1">
              {section.category}
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {section.items.map((item) => {
                const inner = (
                  <div className="flex items-center gap-3.5 px-4 py-3.5">
                    <span className={`text-xl flex-shrink-0 ${!item.available ? "grayscale opacity-50" : ""}`}>{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-body text-sm font-medium ${item.available ? "text-verde-noite" : "text-gray-400"}`}>
                        {item.label}
                      </p>
                      <p className="font-body text-[11px] text-gray-400 leading-snug">{item.desc}</p>
                    </div>
                    {item.available ? (
                      <ArrowIcon className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    ) : (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <LockIcon className="w-3 h-3 text-gray-300" />
                        <span className="font-body text-[9px] text-gray-300">Breve</span>
                      </div>
                    )}
                  </div>
                );

                return item.available ? (
                  <Link key={item.label} href={item.href} className="block hover:bg-gray-50/50 transition-colors active:bg-gray-100">
                    {inner}
                  </Link>
                ) : (
                  <div key={item.label} className="cursor-default">
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        <div className="pt-2 pb-4">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full py-3 border-2 border-red-200 text-red-400 rounded-2xl font-body text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Sair da conta
          </button>
        </div>
      </div>

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
