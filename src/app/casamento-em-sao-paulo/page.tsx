import CityLandingTemplate from "@/components/city-landing-template";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Casamento em São Paulo | Laço — Plataforma de Casamentos",
  description:
    "Planeje seu casamento em São Paulo com o Laço. Site personalizado, RSVP digital, lista de presentes com Pix e gestão completa de convidados.",
  openGraph: {
    title: "Casamento em São Paulo — Laço",
    description:
      "A plataforma completa para planejar seu casamento em São Paulo. Gratuito para começar.",
  },
};

export default function CasamentoEmSaoPauloPage() {
  return (
    <CityLandingTemplate
      city="São Paulo"
      state="SP"
      slug="casamento-em-sao-paulo"
      description="São Paulo é o maior mercado de casamentos do Brasil. Com milhares de espaços, fornecedores premiados e uma cena nupcial vibrante, a capital paulista oferece infinitas possibilidades para o dia mais especial da sua vida."
      highlights={[
        "Maior variedade de espaços de eventos do Brasil — de rooftops modernos a fazendas centenárias",
        "Fotógrafos, buffets e cerimonialistas premiados internacionalmente",
        "Facilidade logística: aeroportos, hotéis e fornecedores para convidados de todo o país",
        "Tendência forte de casamentos intimistas e micro-weddings em SP",
        "Bairros como Moema, Pinheiros e Vila Madalena concentram fornecedores de alto padrão",
        "Casamentos na Serra da Cantareira e arredores para quem quer natureza perto da capital",
      ]}
      avgCost="R$ 80.000 – R$ 150.000"
    />
  );
}
