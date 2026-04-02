"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import BottomNav from "@/components/bottom-nav";

const GOLD  = "#A98950";
const BROWN = "#3D322A";
const CREME = "#FAF6EF";

export default function MaquininhaPage() {
  const params = useParams();
  const weddingId = params?.id as string;
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREME }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: BROWN, borderTopColor: "transparent" }} />
      </div>
    );
  }
  if (!session) return null;

  const waText = encodeURIComponent("Olá! Quero a Maquininha de Casamento Laço para receber presentes e pagamentos no meu casamento.");

  return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>

      {/* Light header */}
      <div className="px-5 pt-10 pb-6">
        <p className="text-[9px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "rgba(61,50,42,0.36)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
          Pagamentos
        </p>
        <h1 className="text-[30px] font-light leading-tight mb-1"
          style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif" }}>
          Maquininha
        </h1>
        <p className="text-[12px] leading-relaxed" style={{ color: "rgba(61,50,42,0.58)" }}>
          Receba presentes e pagamentos com maquininha personalizada no dia.
        </p>
      </div>

      {/* Ornamental divider */}
      <div className="flex items-center gap-2.5 mx-5 mb-5">
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
        <div className="w-[5px] h-[5px] rotate-45 opacity-55 flex-shrink-0" style={{ background: GOLD }} />
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
      </div>

      <div className="px-4 space-y-5">

        {/* Stats */}
        <div className="bg-white rounded-2xl p-4" style={{ border: "1.5px solid rgba(169,137,80,0.16)" }}>
          <div className="grid grid-cols-3 divide-x" style={{ borderColor: "rgba(169,137,80,0.12)" }}>
            {[
              { value: "0%", label: "Taxa de adesão" },
              { value: "1,99%", label: "No débito" },
              { value: "2,49%", label: "No crédito" },
            ].map((s) => (
              <div key={s.label} className="text-center px-2">
                <p className="font-heading text-2xl" style={{ color: BROWN }}>{s.value}</p>
                <p className="font-body text-[10px] mt-0.5" style={{ color: "rgba(61,50,42,0.40)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Como funciona */}
        <div className="bg-white rounded-2xl p-5" style={{ border: "1.5px solid rgba(169,137,80,0.16)" }}>
          <h2 className="font-heading text-lg mb-4" style={{ color: BROWN }}>Como funciona</h2>
          <div className="space-y-4">
            {[
              { step: "1", icon: "📦", title: "Receba em casa", desc: "A maquininha chega personalizada com os nomes do casal, até 7 dias antes do casamento." },
              { step: "2", icon: "💍", title: "Use no dia", desc: "Convidados pagam presentes em dinheiro, débito ou crédito — direto na maquininha." },
              { step: "3", icon: "💰", title: "Receba na conta", desc: "O valor cai na conta Laço ou na conta que você indicar em até 1 dia útil." },
            ].map((item) => (
              <div key={item.step} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(61,50,42,0.07)" }}>
                  <span className="font-heading text-sm font-bold" style={{ color: BROWN }}>{item.step}</span>
                </div>
                <div>
                  <p className="font-body text-sm font-semibold" style={{ color: BROWN }}>{item.icon} {item.title}</p>
                  <p className="font-body text-xs mt-0.5" style={{ color: "rgba(61,50,42,0.45)" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* O que inclui */}
        <div className="bg-white rounded-2xl p-5" style={{ border: "1.5px solid rgba(169,137,80,0.16)" }}>
          <h2 className="font-heading text-lg mb-3" style={{ color: BROWN }}>O que está incluído</h2>
          <div className="space-y-2.5">
            {[
              "Maquininha Stone com nome dos noivos gravado",
              "Aceita débito, crédito, Pix e vale-presente",
              "Sem taxa de adesão ou mensalidade",
              "Suporte no dia do evento",
              "Integração com extrato de gastos no Laço",
              "Devolução após o casamento — sem custo extra",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: GOLD }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className="font-body text-sm" style={{ color: "rgba(61,50,42,0.75)" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-5" style={{ background: BROWN }}>
          <p className="font-body text-xs uppercase tracking-wider mb-1" style={{ color: "rgba(250,246,239,0.55)" }}>Locação por casamento</p>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="font-heading text-4xl" style={{ color: CREME }}>R$ 197</span>
            <span className="font-body text-sm" style={{ color: "rgba(250,246,239,0.55)" }}>por evento</span>
          </div>
          <p className="font-body text-xs mb-4" style={{ color: "rgba(250,246,239,0.55)" }}>Pagamento único. Sem mensalidade.</p>
          <a
            href={`https://wa.me/5511999999999?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-body text-sm font-semibold transition-colors active:scale-[0.98]"
            style={{ background: CREME, color: BROWN }}
          >
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Quero a maquininha
          </a>
        </div>

      </div>

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
