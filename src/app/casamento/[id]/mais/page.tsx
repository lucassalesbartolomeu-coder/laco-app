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

function MoreIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function MaisPage() {
  const params = useParams();
  const weddingId = params?.id as string;
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!session) return null;

  const base = `/casamento/${weddingId}`;

  const services = [
    {
      category: "Cerimonialista / Assessor(a)",
      items: [
        { icon: "👩‍💼", label: "Conectar Cerimonialista", desc: "Vincule seu(a) assessor(a) para que acompanhe lista, fornecedores e timeline", href: `${base}/cerimonialista`, available: true },
        { icon: "📋", label: "Questionários", desc: "Responda questionários de preferências da sua cerimonialista", href: `${base}/questionarios`, available: true },
        { icon: "💬", label: "Confirmação via WhatsApp", desc: "Serviço de confirmação 100% dos convidados via WhatsApp", href: `${base}/whatsapp-confirmacao`, available: true },
      ],
    },
    {
      category: "Conta Digital Laço",
      items: [
        { icon: "💳", label: "Conta do Casamento", desc: "Conta digital compartilhada entre os noivos para gerenciar gastos", href: `${base}/conta-casamento`, available: true },
        { icon: "📊", label: "Extrato de Gastos", desc: "Categorizado automaticamente — quanto gastou com cada fornecedor", href: `${base}/orcamento`, available: true },
        { icon: "💸", label: "Pix dos Presentes", desc: "Receba presentes em dinheiro direto na conta do casamento", href: `${base}/presentes`, available: true },
      ],
    },
    {
      category: "Serviços Premium",
      items: [
        { icon: "💳", label: "Maquininha de Casamento", desc: "Receba presentes e pagamentos com maquininha personalizada no dia", href: `${base}/maquininha`, available: true },
        { icon: "👔", label: "Gravata Premium", desc: "Identity Kit exclusivo — convite digital animado, menu, save the date", href: `${base}/identity-kit`, available: true },
      ],
    },
    {
      category: "Sua Conta",
      items: [
        { icon: "👤", label: "Perfil", desc: "Dados pessoais, notificações, preferências", href: "/perfil", available: true },
        { icon: "💍", label: "Dados do Casamento", desc: "Editar data, local, nomes, estilo", href: `${base}/conta-casamento`, available: true },
        { icon: "🤝", label: "Planejar Juntos", desc: "Convide o noivo/noiva para planejar juntos", href: "/dashboard", available: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-midnight via-midnight to-midnight/95 px-5 pt-12 pb-10 relative overflow-hidden">
        {/* Decorative gold blur accent */}
        <div className="absolute top-8 right-0 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <MoreIcon className="w-5 h-5 text-gold" />
            <span className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-gold">Configurações e Serviços</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-white mb-1">Mais</h1>
          <p className="font-body text-sm text-white/70">Serviços, cerimonialista, conta e configurações</p>
        </div>
      </div>

      {/* Sections */}
      <div className="px-4 -mt-5 relative z-10 space-y-6 pb-4">
        {services.map((section) => (
          <div key={section.category}>
            <h2 className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-3 px-1">
              {section.category}
            </h2>
            <div className="bg-white rounded-2xl border border-midnight/8 shadow-card overflow-hidden divide-y divide-midnight/5">
              {section.items.map((item) => {
                const inner = (
                  <div className="flex items-center gap-4 px-4 py-3.5">
                    <span className={`text-xl flex-shrink-0 ${!item.available ? "grayscale opacity-50" : ""}`}>{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-body text-sm font-semibold leading-tight ${item.available ? "text-midnight" : "text-stone/50"}`}>
                        {item.label}
                      </p>
                      <p className={`font-body text-xs leading-snug ${item.available ? "text-stone" : "text-stone/40"}`}>{item.desc}</p>
                    </div>
                    {item.available ? (
                      <ArrowIcon className="w-5 h-5 text-midnight/15 flex-shrink-0" />
                    ) : (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <LockIcon className="w-4 h-4 text-stone/30" />
                        <span className="font-body text-[10px] text-stone/40">Breve</span>
                      </div>
                    )}
                  </div>
                );

                return item.available ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block hover:bg-midnight/2 transition-colors duration-150 active:bg-midnight/5"
                  >
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

        {/* Logout button */}
        <div className="pt-4">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full py-3 border border-red-200/50 text-red-500 rounded-2xl font-body text-sm font-semibold hover:bg-red-50/50 transition-all duration-150 active:scale-[0.98]"
          >
            Sair da conta
          </button>
        </div>
      </div>

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
