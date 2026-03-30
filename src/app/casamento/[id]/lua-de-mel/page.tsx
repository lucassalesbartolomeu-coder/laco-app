"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import BottomNav from "@/components/bottom-nav";

/* ─── Dados de destinos ─────────────────────────────────────────────── */

const DESTINOS = [
  {
    categoria: "🌴 Praias Brasileiras",
    items: [
      {
        nome: "Fernando de Noronha",
        pais: "Brasil · PE",
        desc: "Mar cristalino, fauna única e paisagens impossíveis. O destino mais romântico do país.",
        preco: "A partir de R$3.500/pessoa",
        img: "🏝️",
        cor: "#2D7D6F",
        links: [
          { label: "Booking.com", url: "https://www.booking.com/searchresults.pt-br.html?ss=Fernando+de+Noronha&aid=304142" },
          { label: "Decolar", url: "https://www.decolar.com/pacotes/brasil/pernambuco/fernando-de-noronha/" },
        ],
      },
      {
        nome: "Maragogi & Costa dos Corais",
        pais: "Brasil · AL",
        desc: "Piscinas naturais, águas turquesa e resorts paradisíacos no litoral alagoano.",
        preco: "A partir de R$1.800/pessoa",
        img: "🌊",
        cor: "#1A5276",
        links: [
          { label: "Booking.com", url: "https://www.booking.com/searchresults.pt-br.html?ss=Maragogi&aid=304142" },
          { label: "CVC", url: "https://www.cvc.com.br/pacotes/nacionais/nordeste/alagoas/maragogi" },
        ],
      },
      {
        nome: "Trancoso & Porto Seguro",
        pais: "Brasil · BA",
        desc: "Quadrado histórico, pousadas de charme e praias selvagens na Bahia boho-chic.",
        preco: "A partir de R$2.200/pessoa",
        img: "🌺",
        cor: "#B7950B",
        links: [
          { label: "Booking.com", url: "https://www.booking.com/searchresults.pt-br.html?ss=Trancoso&aid=304142" },
          { label: "Hurb", url: "https://www.hurb.com/pacotes/brasil/bahia/trancoso" },
        ],
      },
    ],
  },
  {
    categoria: "🌍 Internacional — Top Românticos",
    items: [
      {
        nome: "Maldivas",
        pais: "Maldivas · Oceano Índico",
        desc: "Bangalôs sobre a água, coral e pôr do sol que para o tempo. O clássico absoluto.",
        preco: "A partir de R$12.000/pessoa",
        img: "🏖️",
        cor: "#0E86D4",
        links: [
          { label: "Booking.com", url: "https://www.booking.com/searchresults.pt-br.html?ss=Maldivas&aid=304142" },
          { label: "Decolar", url: "https://www.decolar.com/pacotes/maldivas/" },
          { label: "CVC", url: "https://www.cvc.com.br/pacotes/internacionais/asia/maldivas" },
        ],
      },
      {
        nome: "Bali",
        pais: "Indonésia · Ásia",
        desc: "Templos, arrozais, spas e praias. Perfeito para casais que querem espiritualidade e aventura.",
        preco: "A partir de R$7.500/pessoa",
        img: "🌸",
        cor: "#7D6608",
        links: [
          { label: "Booking.com", url: "https://www.booking.com/searchresults.pt-br.html?ss=Bali&aid=304142" },
          { label: "Decolar", url: "https://www.decolar.com/pacotes/indonesia/bali/" },
          { label: "Hurb", url: "https://www.hurb.com/pacotes/indonesia/bali" },
        ],
      },
      {
        nome: "Lisboa & Algarve",
        pais: "Portugal · Europa",
        desc: "Sem fuso de choque, mesma língua, gastronomia incrível e Algarve dourado.",
        preco: "A partir de R$5.500/pessoa",
        img: "🏰",
        cor: "#922B21",
        links: [
          { label: "Booking.com", url: "https://www.booking.com/searchresults.pt-br.html?ss=Lisboa&aid=304142" },
          { label: "Decolar", url: "https://www.decolar.com/pacotes/portugal/lisboa/" },
          { label: "CVC", url: "https://www.cvc.com.br/pacotes/internacionais/europa/portugal" },
        ],
      },
      {
        nome: "Cancún & Riviera Maya",
        pais: "México · América Central",
        desc: "All-inclusive de luxo, cenotes, ruínas maias e Caribe perfeito. Clássico com razão.",
        preco: "A partir de R$5.000/pessoa",
        img: "🌴",
        cor: "#117A65",
        links: [
          { label: "Booking.com", url: "https://www.booking.com/searchresults.pt-br.html?ss=Cancun&aid=304142" },
          { label: "Decolar", url: "https://www.decolar.com/pacotes/mexico/cancun/" },
          { label: "Hurb", url: "https://www.hurb.com/pacotes/mexico/cancun" },
        ],
      },
    ],
  },
  {
    categoria: "🏔️ Experiências & Aventura",
    items: [
      {
        nome: "Gramado & Canela",
        pais: "Brasil · RS",
        desc: "Clima europeu, gastronomia premiada e romanticismo puro nas serras gaúchas.",
        preco: "A partir de R$1.200/pessoa",
        img: "🍫",
        cor: "#5D4037",
        links: [
          { label: "Booking.com", url: "https://www.booking.com/searchresults.pt-br.html?ss=Gramado&aid=304142" },
          { label: "Decolar", url: "https://www.decolar.com/pacotes/brasil/rio-grande-do-sul/gramado/" },
          { label: "CVC", url: "https://www.cvc.com.br/pacotes/nacionais/sul/rio-grande-do-sul/gramado" },
        ],
      },
      {
        nome: "Patagônia Argentina",
        pais: "Argentina · América do Sul",
        desc: "Glaciares, montanhas nevadas e paisagens de outro planeta. Para casais aventureiros.",
        preco: "A partir de R$4.500/pessoa",
        img: "🏔️",
        cor: "#1B4F72",
        links: [
          { label: "Booking.com", url: "https://www.booking.com/searchresults.pt-br.html?ss=Bariloche&aid=304142" },
          { label: "Decolar", url: "https://www.decolar.com/pacotes/argentina/bariloche/" },
        ],
      },
    ],
  },
];

/* ─── Component ─────────────────────────────────────────────────────── */

export default function LuaDeMelPage() {
  const params = useParams();
  const weddingId = params.id as string;
  const { data: session, status } = useSession();

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
      {/* Header */}
      <div className="bg-gradient-to-br from-midnight via-midnight/90 to-[#0E4D4D] px-5 pt-12 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-midnight/15 rounded-full blur-2xl" />
        <div className="relative z-10">
          <p className="font-body text-xs text-white/50 uppercase tracking-wider mb-2">Pós-Casamento</p>
          <h1 className="font-heading text-4xl text-white mb-2">Lua de Mel</h1>
          <p className="font-body text-sm text-white/70 max-w-sm">
            Destinos românticos selecionados para o próximo grande capítulo. Parceiros com os melhores preços.
          </p>
        </div>
      </div>

      {/* Aviso de afiliado */}
      <div className="mx-4 mt-4 bg-gold/8 border border-gold/15 rounded-xl px-4 py-3">
        <p className="font-body text-xs text-gold/80">
          💡 Os links abaixo são de parceiros — ao reservar, você apoia o Laço sem pagar nada a mais.
        </p>
      </div>

      {/* Destinos */}
      <div className="px-4 mt-5 space-y-8">
        {DESTINOS.map((categoria) => (
          <div key={categoria.categoria}>
            <h2 className="font-heading text-lg text-midnight mb-3">{categoria.categoria}</h2>
            <div className="space-y-3">
              {categoria.items.map((dest) => (
                <div key={dest.nome} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Color bar */}
                  <div className="h-1.5 w-full" style={{ backgroundColor: dest.cor }} />

                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl flex-shrink-0">{dest.img}</span>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-heading text-base text-midnight leading-tight">{dest.nome}</p>
                            <p className="font-body text-xs text-gray-400">{dest.pais}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="font-body text-sm text-gray-600 mb-2 leading-relaxed">{dest.desc}</p>
                    <p className="font-body text-xs text-gold font-semibold mb-3">{dest.preco}</p>

                    {/* Links de parceiros */}
                    <div className="flex flex-wrap gap-2">
                      {dest.links.map((link) => (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-midnight/8 text-midnight rounded-lg font-body text-xs font-medium hover:bg-midnight/15 transition-colors"
                        >
                          {link.label} →
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* CTA customizado */}
        <div className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 rounded-2xl p-5 text-center">
          <p className="text-2xl mb-2">✈️</p>
          <p className="font-heading text-lg text-midnight mb-1">Quer um roteiro personalizado?</p>
          <p className="font-body text-sm text-gray-500 mb-4">
            Conte seu estilo e orçamento — nossa equipe monta um pacote exclusivo para vocês.
          </p>
          <a
            href={`https://wa.me/5511999999999?text=${encodeURIComponent("Olá! Estou planejando minha lua de mel pelo app Laço e gostaria de um roteiro personalizado.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-midnight text-white rounded-xl font-body text-sm font-semibold hover:bg-midnight/90 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Falar com especialista
          </a>
        </div>
      </div>

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
