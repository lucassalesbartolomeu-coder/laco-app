import type { Metadata } from "next";
import Link from "next/link";
import BillingToggle from "./billing-toggle";

export const metadata: Metadata = {
  title: "Planos",
  description:
    "Escolha o plano ideal para o seu casamento. Gratuito para começar, Pro para casais que querem o melhor, Cerimonialista para profissionais.",
};

export default function PlanosPage() {
  return (
    <main className="font-body text-verde-noite antialiased">
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-verde-noite/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/home" className="font-logo text-2xl text-white tracking-tight">
            Laço
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/planos"
              className="font-body text-sm text-white font-medium hidden sm:block"
            >
              Planos
            </Link>
            <Link
              href="/login"
              className="font-body text-sm text-white/70 hover:text-white transition px-3 py-1.5"
            >
              Entrar
            </Link>
            <Link
              href="/registro"
              className="font-body text-sm bg-copper text-white px-4 py-2 rounded-lg hover:bg-copper/90 transition font-medium"
            >
              Criar conta grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative bg-verde-noite overflow-hidden pt-14">
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        {/* Gradient orbs */}
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-teal/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-copper/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-5 py-20 text-center">
          <p className="font-body text-xs text-copper uppercase tracking-widest mb-4">
            Planos &amp; Preços
          </p>
          <h1 className="font-heading text-5xl md:text-6xl text-white leading-tight mb-4">
            Escolha o plano do
            <br />
            <span className="text-gold">seu casamento</span>
          </h1>
          <p className="font-body text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
            Comece grátis e faça upgrade quando precisar. Sem surpresas, sem letras miúdas.
          </p>
        </div>
      </section>

      {/* ─── PLANS + TOGGLE + TABLE + FAQ (client island) ─── */}
      <section className="bg-cream py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <BillingToggle />
        </div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <section className="bg-white border-y border-verde-noite/8 py-10 px-5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: "2.400+", label: "casamentos criados" },
            { n: "98%", label: "satisfação dos casais" },
            { n: "14 dias", label: "trial gratuito" },
            { n: "0", label: "taxa de cancelamento" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-heading text-3xl text-verde-noite">{stat.n}</p>
              <p className="font-body text-xs text-verde-noite/50 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="bg-verde-noite py-20 px-5 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-4xl text-white mb-4">
            Ainda tem dúvidas?
          </h2>
          <p className="font-body text-white/55 mb-8 text-base leading-relaxed">
            Comece com o plano Gratuito agora mesmo — sem cartão, sem compromisso.
            Você pode fazer upgrade a qualquer momento.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/registro?plano=pro"
              className="inline-flex items-center justify-center gap-2 bg-copper text-white font-body font-semibold text-base px-8 py-4 rounded-xl hover:bg-copper/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Começar trial Pro grátis
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/registro"
              className="inline-flex items-center justify-center gap-2 border border-white/25 text-white font-body text-base px-8 py-4 rounded-xl hover:bg-white/5 transition-all"
            >
              Plano gratuito
            </Link>
          </div>
          <p className="font-body text-xs text-white/25 mt-4">
            Sem cartão de crédito · Cancele quando quiser
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-verde-noite border-t border-white/10 py-10 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <Link href="/home" className="font-logo text-2xl text-white">
                Laço
              </Link>
              <p className="font-body text-xs text-white/30 mt-1">
                Planejamento de casamentos — Brasil
              </p>
            </div>
            <div className="flex flex-wrap gap-6">
              {[
                { label: "Planos", href: "/planos" },
                { label: "Blog", href: "/blog" },
                { label: "Casamentos em SP", href: "/casamento-em-sao-paulo" },
                { label: "Casamentos no Rio", href: "/casamento-no-rio" },
                { label: "Casamentos em BH", href: "/casamento-em-bh" },
                { label: "Para Cerimonialistas", href: "/registro/cerimonialista" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="font-body text-xs text-white/40 hover:text-white/70 transition"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-white/25 text-xs font-body">
            <span>© 2026 Laço. Todos os direitos reservados.</span>
            <span>Feito com amor em São Paulo 🌿</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
