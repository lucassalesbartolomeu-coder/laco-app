"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

const GOLD    = "#A98950";
const BROWN   = "#3D322A";
const CREME   = "#FAF6EF";
const BG_DARK = "#F0E8DA";

export default function CasamentoHubPage() {
  const params = useParams();
  const weddingId = params?.id as string;
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREME }}>
        <div className="w-7 h-7 border-[1.5px] border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${GOLD} transparent ${GOLD} ${GOLD}` }} />
      </div>
    );
  }
  if (!session) return null;

  const base = `/casamento/${weddingId}`;

  const groups = [
    {
      label: "Convidados & RSVP",
      items: [
        { href: `${base}/convidados`, icon: "👥", title: "Lista de Convidados", desc: "Lista A/B/C, categorias, status RSVP e confirmações" },
        { href: `${base}/whatsapp-confirmacao`, icon: "💌", title: "Enviar Convite / Save the Date", desc: "Disparo com 1 clique para os grupos que você definir" },
        { href: `${base}/simulador-convidados`, icon: "🔢", title: "Simulador de Convidados", desc: "Importe contatos, detecte a cidade pelo DDD e preveja presença" },
      ],
    },
    {
      label: "Orçamento & Contratos",
      items: [
        { href: `${base}/orcamento-inteligente`, icon: "📊", title: "Simulador de Orçamento", desc: "Quiz por fornecedor — descubra quanto vai custar seu casamento" },
        { href: `${base}/orcamento`, icon: "💰", title: "Orçamento Real", desc: "Custos reais vs estimados, parcelas, pagamentos" },
        { href: `${base}/presentes`, icon: "🎁", title: "Lista de Presentes", desc: "Presentes recebidos, valores, agradecimentos" },
        { href: `${base}/fornecedores`, icon: "🏢", title: "Fornecedores & Contratos", desc: "Fornecedores com status de contrato e documentos em PDF" },
      ],
    },
    {
      label: "Tarefas & Checklist",
      items: [
        { href: `${base}/tarefas`, icon: "✅", title: "Tarefas", desc: "Acompanhe tarefas do cerimonialista e adicione as suas" },
        { href: `${base}/timeline`, icon: "🗓️", title: "Timeline do Dia", desc: "Cronograma completo do grande dia, passo a passo" },
        { href: `${base}/questionarios`, icon: "📋", title: "Questionários", desc: "Responda questionários de preferências da sua cerimonialista" },
        { href: `${base}/lua-de-mel`, icon: "✈️", title: "Lua de Mel", desc: "Destinos, pacotes e dicas para a viagem dos sonhos" },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>

      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <p className="text-[9px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "rgba(61,50,42,0.36)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
          Meu Casamento
        </p>
        <h1 className="text-[30px] font-light leading-tight mb-1"
          style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif" }}>
          Casamento
        </h1>
        <p className="text-[12px] leading-relaxed" style={{ color: "rgba(61,50,42,0.58)" }}>
          Convidados, orçamento, fornecedores, tarefas e o grande dia.
        </p>
      </div>

      {/* Ornamental divider */}
      <div className="flex items-center gap-2.5 mx-5 mb-5">
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
        <div className="w-[5px] h-[5px] rotate-45 opacity-55 flex-shrink-0" style={{ background: GOLD }} />
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
      </div>

      <div className="px-5 space-y-5 pb-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-[9.5px] tracking-[0.3em] uppercase pb-2.5"
              style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              {group.label}
            </p>
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "white", border: "1.5px solid rgba(169,137,80,0.16)", boxShadow: "0 1px 6px rgba(61,50,42,0.05)" }}>
              {group.items.map((item, idx) => (
                <div key={item.href}
                  style={idx > 0 ? { borderTop: "1px solid rgba(169,137,80,0.09)" } : undefined}>
                  <Link href={item.href}
                    className="flex items-center gap-3.5 px-4 py-3.5 transition-colors active:bg-stone-50">
                    <div className="w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-shrink-0 text-[18px]"
                      style={{ background: BG_DARK }}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium leading-tight" style={{ color: BROWN }}>
                        {item.title}
                      </p>
                      <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "rgba(61,50,42,0.36)" }}>
                        {item.desc}
                      </p>
                    </div>
                    <span className="text-[18px] flex-shrink-0" style={{ color: "rgba(169,137,80,0.40)" }}>›</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
