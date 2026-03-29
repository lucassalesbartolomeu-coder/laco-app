import CityLandingTemplate from "@/components/city-landing-template";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Casamento em São Paulo | Laço — Plataforma de Casamentos",
  description:
    "Planeje seu casamento em São Paulo com o Laço. Site personalizado, RSVP digital, lista de presentes com Pix e gestão completa de convidados.",
  alternates: {
    canonical: "/casamento-em-sao-paulo",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Laço",
    url: "https://laco.app/casamento-em-sao-paulo",
    title: "Casamento em São Paulo — Laço",
    description:
      "A plataforma completa para planejar seu casamento em São Paulo. Site personalizado, RSVP digital e lista de presentes com Pix. Gratuito para começar.",
    images: [
      {
        url: "https://laco.app/api/og?names=Casamento+em+S%C3%A3o+Paulo&style=classico",
        width: 1200,
        height: 630,
        alt: "Casamento em São Paulo — Laço",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Casamento em São Paulo — Laço",
    description:
      "A plataforma completa para planejar seu casamento em São Paulo. Gratuito para começar.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Laço — Plataforma de Casamentos em São Paulo",
  description:
    "Planeje seu casamento em São Paulo com o Laço. Site personalizado, RSVP digital, lista de presentes com Pix e gestão completa de convidados.",
  url: "https://laco.app/casamento-em-sao-paulo",
  areaServed: {
    "@type": "City",
    name: "São Paulo",
    "@id": "https://www.wikidata.org/wiki/Q174",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "São Paulo",
    addressRegion: "SP",
    addressCountry: "BR",
  },
  priceRange: "Gratuito para começar",
};

export default function CasamentoEmSaoPauloPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
    </>
  );
}
