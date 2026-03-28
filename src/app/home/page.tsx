"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: "easeOut" },
  viewport: { once: true, margin: "-40px" },
};

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Gestão de Convidados",
    desc: "Importe, organize e acompanhe confirmações em tempo real.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
    title: "Lista de Presentes",
    desc: "Lista com Pix integrado. Convidados presenteiam pelo celular.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    title: "Site do Casamento",
    desc: "Página personalizada com RSVP, contagem regressiva e fotos.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Simulador de Presença",
    desc: "Estime quantos convidados vão comparecer com dados reais.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Controle de Orçamento",
    desc: "Acompanhe gastos por categoria, fornecedores e pagamentos.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: "Painel Cerimonialista",
    desc: "Gerencie múltiplos casamentos, equipe e comissões.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Crie seu casamento",
    desc: "Informe data, local e número de convidados. Leva menos de 2 minutos.",
  },
  {
    n: "02",
    title: "Adicione convidados",
    desc: "Importe pelo CSV, adicione manualmente ou compartilhe o link de RSVP.",
  },
  {
    n: "03",
    title: "Compartilhe e celebre",
    desc: "Seu site vai ao ar na hora. Convidados confirmam, presenteiam e você acompanha tudo.",
  },
];

const TESTIMONIALS = [
  {
    name: "Ana & Bruno",
    city: "São Paulo, SP",
    text: "Organizamos toda a lista de 220 convidados no Laço. O simulador foi incrível — acertou o comparecimento com menos de 5% de margem.",
    initials: "AB",
  },
  {
    name: "Camila & Rafael",
    city: "Belo Horizonte, MG",
    text: "A lista de presentes com Pix foi um sucesso. Os convidados adoraram a facilidade e nós recebemos tudo centralizado.",
    initials: "CR",
  },
  {
    name: "Juliana Morais",
    city: "Cerimonialista — Rio de Janeiro",
    text: "Uso o painel pro para todos os meus casamentos. O controle de comissões e os contratos digitais salvaram horas da minha semana.",
    initials: "JM",
  },
];

export default function HomePage() {
  return (
    <main className="font-body text-verde-noite antialiased">
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-verde-noite/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <span className="font-logo text-2xl text-white tracking-tight">Laço</span>
          <div className="flex items-center gap-3">
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
      <section className="relative min-h-screen flex items-center bg-verde-noite overflow-hidden pt-14">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-teal/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-copper/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-6xl mx-auto px-5 py-20 w-full">
          <div className="max-w-3xl">
            {/* Social proof pill */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8"
            >
              <span className="flex -space-x-1">
                {["AB", "CR", "JM"].map((i) => (
                  <span key={i} className="w-5 h-5 rounded-full bg-copper text-white text-[9px] font-bold flex items-center justify-center border border-verde-noite">
                    {i[0]}
                  </span>
                ))}
              </span>
              <span className="font-body text-xs text-white/80">
                +2.400 casamentos organizados no Laço
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading text-5xl md:text-7xl text-white leading-[1.05] mb-6"
            >
              O casamento
              <br />
              dos seus sonhos,
              <br />
              <span className="text-copper">organizado.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-body text-lg text-white/65 mb-10 max-w-xl leading-relaxed"
            >
              Convidados, presentes, site, orçamento e RSVP — tudo em um só lugar.
              Gratuito para começar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="/registro"
                className="inline-flex items-center justify-center gap-2 bg-copper text-white font-body font-semibold text-base px-8 py-4 rounded-xl hover:bg-copper/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Criar meu casamento grátis
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/cerimonialista/dashboard"
                className="inline-flex items-center justify-center gap-2 border border-white/25 text-white font-body text-base px-8 py-4 rounded-xl hover:bg-white/5 transition-all"
              >
                Sou cerimonialista
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="font-body text-xs text-white/35 mt-4"
            >
              Sem cartão de crédito · Cancele quando quiser
            </motion.p>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* ─── SOCIAL PROOF STRIP ─── */}
      <section className="bg-cream border-y border-verde-noite/8 py-8 px-5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: "2.400+", label: "casamentos criados" },
            { n: "98%", label: "satisfação dos casais" },
            { n: "180k+", label: "convidados gerenciados" },
            { n: "R$ 4M+", label: "em presentes recebidos" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-heading text-3xl text-verde-noite">{stat.n}</p>
              <p className="font-body text-xs text-verde-noite/50 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── COMO FUNCIONA ─── */}
      <section className="bg-off-white py-24 px-5">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="font-body text-xs text-copper uppercase tracking-widest mb-3">Como funciona</p>
            <h2 className="font-heading text-4xl md:text-5xl text-verde-noite">
              Pronto em 3 passos
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                {...fadeUp}
                transition={{ duration: 0.55, delay: i * 0.12, ease: "easeOut" }}
                viewport={{ once: true, margin: "-40px" }}
                className="relative"
              >
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-verde-noite/20 to-transparent -translate-x-8 z-0" />
                )}
                <div className="relative z-10">
                  <span className="font-heading text-6xl text-verde-noite/10 leading-none block mb-4">
                    {s.n}
                  </span>
                  <h3 className="font-heading text-xl text-verde-noite mb-2">{s.title}</h3>
                  <p className="font-body text-sm text-verde-noite/60 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="bg-white py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="font-body text-xs text-copper uppercase tracking-widest mb-3">Funcionalidades</p>
            <h2 className="font-heading text-4xl md:text-5xl text-verde-noite">
              Tudo que você precisa
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp}
                transition={{ duration: 0.55, delay: i * 0.07, ease: "easeOut" }}
                viewport={{ once: true, margin: "-40px" }}
                className="group bg-cream rounded-2xl p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 bg-verde-noite/8 text-verde-noite rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal group-hover:text-white transition-all">
                  {f.icon}
                </div>
                <h3 className="font-heading text-lg text-verde-noite mb-1">{f.title}</h3>
                <p className="font-body text-sm text-verde-noite/60 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PARA QUEM ─── */}
      <section className="bg-verde-noite py-24 px-5">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl text-white">Para quem é o Laço?</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div {...fadeUp} className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="w-10 h-10 bg-copper/20 text-copper rounded-xl flex items-center justify-center mb-5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-heading text-2xl text-white mb-5">Para Casais</h3>
              <ul className="space-y-3">
                {[
                  "Site de casamento com RSVP em minutos",
                  "Gestão completa de convidados e mesas",
                  "Lista de presentes com Pix integrado",
                  "Controle de orçamento sem surpresas",
                  "Identity Kit com tema visual personalizado",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-copper/30 text-copper flex items-center justify-center text-xs shrink-0">✓</span>
                    <span className="font-body text-sm text-white/70">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/registro"
                className="mt-8 inline-flex items-center gap-2 bg-copper text-white font-body text-sm font-medium px-6 py-3 rounded-xl hover:bg-copper/90 transition"
              >
                Criar conta de casal
              </Link>
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.55, delay: 0.1 }} viewport={{ once: true }} className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="w-10 h-10 bg-teal/30 text-teal rounded-xl flex items-center justify-center mb-5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-heading text-2xl text-white mb-5">Para Cerimonialistas</h3>
              <ul className="space-y-3">
                {[
                  "Pipeline CRM de oportunidades e leads",
                  "Gestão de múltiplos casamentos simultâneos",
                  "Contratos digitais com assinatura eletrônica",
                  "Controle de comissões e exportação CSV",
                  "OCR de orçamentos de fornecedores",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-teal/40 text-teal flex items-center justify-center text-xs shrink-0">✓</span>
                    <span className="font-body text-sm text-white/70">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/registro/cerimonialista"
                className="mt-8 inline-flex items-center gap-2 bg-teal text-white font-body text-sm font-medium px-6 py-3 rounded-xl hover:bg-teal/90 transition"
              >
                Criar conta profissional
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── PLANOS ─── */}
      <section className="bg-cream py-24 px-5">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="font-body text-xs text-copper uppercase tracking-widest mb-3">Planos</p>
            <h2 className="font-heading text-4xl md:text-5xl text-verde-noite">Simples e transparente</h2>
            <p className="font-body text-verde-noite/50 mt-3">Comece grátis. Upgrade quando precisar.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <motion.div {...fadeUp} className="bg-white rounded-2xl p-8 border border-verde-noite/10">
              <p className="font-body text-xs text-verde-noite/40 uppercase tracking-widest mb-2">Gratuito</p>
              <p className="font-heading text-4xl text-verde-noite mb-1">R$ 0</p>
              <p className="font-body text-sm text-verde-noite/50 mb-6">Para sempre</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Até 50 convidados",
                  "1 casamento",
                  "Site com RSVP",
                  "Lista de presentes básica",
                  "Controle de orçamento",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 font-body text-sm text-verde-noite/70">
                    <span className="text-teal">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/registro"
                className="block text-center py-3 rounded-xl border border-verde-noite/20 font-body text-sm text-verde-noite hover:bg-verde-noite/5 transition"
              >
                Começar grátis
              </Link>
            </motion.div>

            {/* Premium */}
            <motion.div {...fadeUp} transition={{ duration: 0.55, delay: 0.1 }} viewport={{ once: true }} className="bg-verde-noite rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-copper text-white text-xs font-body font-medium px-2.5 py-1 rounded-full">
                Mais popular
              </div>
              <p className="font-body text-xs text-white/40 uppercase tracking-widest mb-2">Premium</p>
              <p className="font-heading text-4xl text-white mb-1">
                R$ 99<span className="text-white/40 text-lg font-body">/mês</span>
              </p>
              <p className="font-body text-sm text-white/40 mb-6">Trial gratuito de 14 dias</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Convidados ilimitados",
                  "Identity Kit com IA",
                  "RSVP via WhatsApp",
                  "Lista com Pix integrado",
                  "Conta digital com rendimento",
                  "Suporte prioritário",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 font-body text-sm text-white/80">
                    <span className="text-copper">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/registro"
                className="block text-center py-3 rounded-xl bg-copper text-white font-body font-semibold text-sm hover:bg-copper/90 transition"
              >
                Começar trial grátis
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── DEPOIMENTOS ─── */}
      <section className="bg-white py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="font-body text-xs text-copper uppercase tracking-widest mb-3">Depoimentos</p>
            <h2 className="font-heading text-4xl md:text-5xl text-verde-noite">O que dizem nossos casais</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                {...fadeUp}
                transition={{ duration: 0.55, delay: i * 0.1, ease: "easeOut" }}
                viewport={{ once: true }}
                className="bg-cream rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-3.5 h-3.5 text-copper" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="font-body text-sm text-verde-noite/75 leading-relaxed mb-5">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-verde-noite text-white text-xs font-heading flex items-center justify-center">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-body text-sm font-medium text-verde-noite">{t.name}</p>
                    <p className="font-body text-xs text-verde-noite/40">{t.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="bg-verde-noite py-24 px-5 text-center">
        <motion.div {...fadeUp} className="max-w-2xl mx-auto">
          <h2 className="font-heading text-4xl md:text-5xl text-white mb-4">
            Comece a planejar hoje
          </h2>
          <p className="font-body text-white/50 mb-8 text-lg">
            Junte-se a mais de 2.400 casais que confiam no Laço para organizar o dia mais especial da vida.
          </p>
          <Link
            href="/registro"
            className="inline-flex items-center gap-2 bg-copper text-white font-body font-semibold text-lg px-10 py-4 rounded-xl hover:bg-copper/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Criar conta gratuita
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <p className="font-body text-xs text-white/25 mt-4">Sem cartão de crédito · Cancele quando quiser</p>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-verde-noite border-t border-white/10 py-10 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <span className="font-logo text-2xl text-white">Laço</span>
              <p className="font-body text-xs text-white/30 mt-1">
                Planejamento de casamentos — Brasil
              </p>
            </div>
            <div className="flex flex-wrap gap-6">
              {[
                { label: "Blog", href: "/blog" },
                { label: "Casamentos em SP", href: "/casamento-em-sao-paulo" },
                { label: "Casamentos no Rio", href: "/casamento-no-rio" },
                { label: "Casamentos em BH", href: "/casamento-em-bh" },
                { label: "Para Cerimonialistas", href: "/registro/cerimonialista" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="font-body text-xs text-white/40 hover:text-white/70 transition">
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
