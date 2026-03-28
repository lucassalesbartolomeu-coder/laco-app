import Link from "next/link";

interface CityLandingProps {
  city: string;
  state: string;
  slug: string;
  description: string;
  highlights: string[];
  avgCost: string;
}

export default function CityLandingTemplate({
  city,
  state,
  slug,
  description,
  highlights,
  avgCost,
}: CityLandingProps) {
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `Laço — Casamentos em ${city}`,
    description,
    url: `https://laco.app/${slug}`,
    areaServed: { "@type": "City", name: city, addressRegion: state },
  };

  return (
    <div className="min-h-screen bg-cream font-body text-verde-noite">
      {/* Header */}
      <header className="bg-verde-noite text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-heading text-2xl text-white">Laço</Link>
          <Link
            href="/registro"
            className="px-4 py-2 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper/90 transition"
          >
            Criar conta grátis
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-verde-noite text-white pb-16 pt-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-body text-copper text-sm uppercase tracking-widest mb-3">
            Plataforma de Casamentos
          </p>
          <h1 className="font-heading text-5xl md:text-6xl mb-6">
            Casamento em {city}
          </h1>
          <p className="font-body text-white/70 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/registro"
              className="px-8 py-3 bg-copper text-white rounded-xl font-body font-semibold hover:bg-copper/90 transition"
            >
              Criar meu site de casamento
            </Link>
            <Link
              href="/blog"
              className="px-8 py-3 border border-white/30 text-white rounded-xl font-body hover:bg-white/5 transition"
            >
              Ver dicas e guias
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl text-center mb-10">
            Tudo para o seu casamento em {city}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🌐",
                title: "Site personalizado",
                text: "Crie um site lindo com sua história, data, local e muito mais — em minutos.",
              },
              {
                icon: "✉️",
                title: "RSVP digital",
                text: "Seus convidados confirmam presença pelo celular. Você acompanha em tempo real.",
              },
              {
                icon: "🎁",
                title: "Lista de presentes",
                text: "Lista com Pix integrado. Convidados presenteiam direto pelo site.",
              },
              {
                icon: "👰",
                title: "Gestão de convidados",
                text: "Organize todos os dados, restrições alimentares e categorias de convidados.",
              },
              {
                icon: "💰",
                title: "Controle de orçamento",
                text: "Acompanhe gastos por categoria e saiba o que já foi pago.",
              },
              {
                icon: "🤝",
                title: "Cerimonialistas parceiros",
                text: "Conecte-se com cerimonialistas verificados da sua região.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-3xl mb-3">{f.icon}</p>
                <h3 className="font-heading text-lg mb-1">{f.title}</h3>
                <p className="font-body text-sm text-verde-noite/60 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* City highlights */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl mb-6">
            Casamentos em {city}: o que saber
          </h2>
          <ul className="space-y-3">
            {highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 bg-teal/20 text-teal rounded-full flex items-center justify-center text-xs mt-0.5 shrink-0">✓</span>
                <p className="font-body text-verde-noite/70">{h}</p>
              </li>
            ))}
          </ul>

          <div className="mt-8 bg-cream rounded-2xl p-6">
            <p className="font-body text-sm text-verde-noite/50 mb-1">Custo médio de casamento</p>
            <p className="font-heading text-2xl text-verde-noite">{avgCost}</p>
            <p className="font-body text-xs text-verde-noite/40 mt-1">
              Para uma festa com 80-150 convidados
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-verde-noite text-white text-center">
        <h2 className="font-heading text-3xl mb-4">
          Comece a planejar o seu casamento em {city}
        </h2>
        <p className="font-body text-white/60 mb-8">
          Gratuito para começar. Sem cartão de crédito.
        </p>
        <Link
          href="/registro"
          className="inline-block bg-copper text-white font-body font-semibold px-10 py-4 rounded-xl hover:bg-copper/90 transition text-lg"
        >
          Criar conta gratuita
        </Link>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
    </div>
  );
}
