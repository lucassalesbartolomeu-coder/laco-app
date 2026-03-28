import CityLandingTemplate from "@/components/city-landing-template";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Casamento no Rio de Janeiro | Laço — Plataforma de Casamentos",
  description:
    "Planeje seu casamento no Rio de Janeiro com o Laço. Site personalizado, RSVP digital, lista de presentes com Pix e gestão completa.",
  alternates: {
    canonical: "/casamento-no-rio",
  },
  openGraph: {
    title: "Casamento no Rio de Janeiro — Laço",
    description:
      "A plataforma completa para planejar seu casamento no Rio. Gratuito para começar.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Laço — Plataforma de Casamentos no Rio de Janeiro",
  description:
    "Planeje seu casamento no Rio de Janeiro com o Laço. Site personalizado, RSVP digital, lista de presentes com Pix e gestão completa.",
  url: "https://laco.app/casamento-no-rio",
  areaServed: {
    "@type": "City",
    name: "Rio de Janeiro",
    "@id": "https://www.wikidata.org/wiki/Q8678",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Rio de Janeiro",
    addressRegion: "RJ",
    addressCountry: "BR",
  },
  priceRange: "Gratuito para começar",
};

export default function CasamentoNoRioPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CityLandingTemplate
        city="Rio de Janeiro"
        state="RJ"
        slug="casamento-no-rio"
        description="O Rio de Janeiro é cenário único para casamentos: praias paradisíacas, montanhas imponentes, palácios históricos e a energia vibrante de uma das cidades mais belas do mundo. Cada casamento carioca tem alma."
        highlights={[
          "Cenários únicos: Urca, Santa Teresa, Petrópolis e as praias da Zona Sul",
          "Haciendas e casarões históricos na Região Serrana",
          "Fotografia com a natureza carioca como pano de fundo — Cristo, Pão de Açúcar",
          "Gastronomia carioca premiada com frutos do mar e sabores únicos",
          "Casamentos na praia são cada vez mais populares — Búzios, Angra e Paraty",
          "Fornecedores com experiência em casamentos internacionais",
        ]}
        avgCost="R$ 75.000 – R$ 130.000"
      />
    </>
  );
}
