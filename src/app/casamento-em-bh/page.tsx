import CityLandingTemplate from "@/components/city-landing-template";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Casamento em Belo Horizonte | Laço — Plataforma de Casamentos",
  description:
    "Planeje seu casamento em Belo Horizonte com o Laço. Site personalizado, RSVP digital, lista de presentes e muito mais.",
  alternates: {
    canonical: "/casamento-em-bh",
  },
  openGraph: {
    title: "Casamento em Belo Horizonte — Laço",
    description:
      "A plataforma completa para planejar seu casamento em BH. Gratuito para começar.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Laço — Plataforma de Casamentos em Belo Horizonte",
  description:
    "Planeje seu casamento em Belo Horizonte com o Laço. Site personalizado, RSVP digital, lista de presentes e muito mais.",
  url: "https://laco.app/casamento-em-bh",
  areaServed: {
    "@type": "City",
    name: "Belo Horizonte",
    "@id": "https://www.wikidata.org/wiki/Q39109",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Belo Horizonte",
    addressRegion: "MG",
    addressCountry: "BR",
  },
  priceRange: "Gratuito para começar",
};

export default function CasamentoEmBhPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CityLandingTemplate
        city="Belo Horizonte"
        state="MG"
        slug="casamento-em-bh"
        description="Belo Horizonte combina a hospitalidade mineira com uma cena nupcial sofisticada. A cidade e seus arredores — como Nova Lima, Brumadinho e a Serra do Cipó — oferecem opções para todos os estilos de casamento."
        highlights={[
          "Forte tradição em casamentos rústicos e ao ar livre em fazendas históricas",
          "Custo menor que São Paulo e Rio com qualidade equivalente",
          "Gastronomia mineira premiada — quitandas, doces e culinária regional únicas",
          "Acesso fácil a espaços na Serra do Espinhaço e Vale do Rio Doce",
          "Mercado de fotógrafos e cerimonialistas em crescimento acelerado",
          "Casamentos em Ouro Preto e Tiradentes cada vez mais procurados",
        ]}
        avgCost="R$ 45.000 – R$ 90.000"
      />
    </>
  );
}
