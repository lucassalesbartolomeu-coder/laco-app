"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
  viewport: { once: true },
};

const funcionalidades = [
  {
    icon: "📊",
    title: "Simulador Inteligente",
    desc: "Preveja quantos convidados realmente vao comparecer com base em dados reais e inteligencia artificial.",
  },
  {
    icon: "👥",
    title: "Gestao de Convidados",
    desc: "Importe contatos, acompanhe confirmacoes e organize mesas de forma simples e visual.",
  },
  {
    icon: "🎁",
    title: "Lista de Presentes",
    desc: "Crie sua lista personalizada, receba presentes em dinheiro ou de lojas parceiras.",
  },
  {
    icon: "🌐",
    title: "Site do Casamento",
    desc: "Um site elegante e responsivo para compartilhar detalhes, RSVP e fotos com seus convidados.",
  },
  {
    icon: "💰",
    title: "Controle de Orcamento",
    desc: "Acompanhe gastos, fornecedores e pagamentos em um painel completo e intuitivo.",
  },
  {
    icon: "📋",
    title: "Painel para Cerimonialistas",
    desc: "Gerencie multiplos casamentos, equipes e cronogramas em uma unica plataforma profissional.",
  },
];

export default function HomePage() {
  return (
    <main className="font-body">
      {/* ── HERO ── */}
      <motion.section
        {...fadeUp}
        className="relative min-h-screen flex items-center bg-gradient-to-br from-verde-noite via-verde-noite to-teal overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
          {/* Left – copy */}
          <div className="z-10">
            <h1 className="font-heading text-4xl md:text-6xl text-white leading-tight mb-6">
              O casamento dos seus sonhos, organizado com inteligencia.
            </h1>
            <p className="text-lg text-white/70 mb-10 max-w-lg">
              Gerencie convidados, presentes, orcamento e seu site — tudo num so
              lugar.
            </p>
            <Link
              href="/login"
              className="inline-block bg-copper text-white text-lg px-8 py-4 rounded-xl hover:opacity-90 transition-opacity"
            >
              Criar meu casamento gratis
            </Link>
          </div>

          {/* Right – decorative element */}
          <div className="hidden md:flex items-center justify-center relative">
            <div className="w-72 h-72 rounded-full bg-teal/30 absolute -top-10 -right-10" />
            <div className="w-56 h-56 rounded-full bg-copper/20 absolute bottom-4 left-4" />
            <div className="w-64 h-64 rounded-full border-2 border-white/10" />
            <div className="w-40 h-40 rounded-full border-2 border-copper/30 absolute" />
          </div>
        </div>
      </motion.section>

      {/* ── COMO FUNCIONA ── */}
      <motion.section {...fadeUp} className="bg-off-white py-20 px-6">
        <h2 className="font-heading text-3xl text-verde-noite text-center mb-12">
          Como funciona
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: "📱",
              title: "Importe seus contatos",
              desc: "Adicione sua lista de convidados rapidamente a partir do celular ou planilha.",
            },
            {
              icon: "🧠",
              title: "Nosso AI preve quem vai",
              desc: "Algoritmos inteligentes estimam a taxa de confirmacao para voce planejar com seguranca.",
            },
            {
              icon: "🎁",
              title: "Crie seu site e lista",
              desc: "Monte seu site personalizado e lista de presentes em poucos minutos.",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-md p-8 text-center"
            >
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="font-heading text-xl text-verde-noite mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-verde-noite/70">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── FUNCIONALIDADES ── */}
      <motion.section {...fadeUp} className="bg-white py-20 px-6">
        <h2 className="font-heading text-3xl text-verde-noite text-center mb-12">
          Funcionalidades
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {funcionalidades.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-off-white rounded-2xl p-6"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-heading text-lg text-verde-noite mb-1">
                {f.title}
              </h3>
              <p className="text-sm text-verde-noite/70">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── PARA QUEM ── */}
      <motion.section {...fadeUp} className="py-20">
        <h2 className="font-heading text-3xl text-verde-noite text-center mb-12">
          Para quem e o Laco?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-md">
          {/* Casais */}
          <div className="bg-cream p-12">
            <h3 className="font-heading text-2xl text-verde-noite mb-6">
              Para Casais
            </h3>
            <ul className="space-y-3 text-verde-noite/80 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-copper mt-0.5">&#10003;</span>
                Organizem tudo do casamento em um so lugar
              </li>
              <li className="flex items-start gap-2">
                <span className="text-copper mt-0.5">&#10003;</span>
                Saibam exatamente quantos convidados esperar
              </li>
              <li className="flex items-start gap-2">
                <span className="text-copper mt-0.5">&#10003;</span>
                Criem um site elegante sem precisar de designer
              </li>
              <li className="flex items-start gap-2">
                <span className="text-copper mt-0.5">&#10003;</span>
                Controlem o orcamento sem surpresas
              </li>
              <li className="flex items-start gap-2">
                <span className="text-copper mt-0.5">&#10003;</span>
                Recebam presentes de forma pratica e moderna
              </li>
            </ul>
          </div>

          {/* Cerimonialistas */}
          <div className="bg-white p-12">
            <h3 className="font-heading text-2xl text-verde-noite mb-6">
              Para Cerimonialistas
            </h3>
            <ul className="space-y-3 text-verde-noite/80 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-copper mt-0.5">&#10003;</span>
                Gerenciem multiplos casamentos simultaneamente
              </li>
              <li className="flex items-start gap-2">
                <span className="text-copper mt-0.5">&#10003;</span>
                Impressionem clientes com dados inteligentes
              </li>
              <li className="flex items-start gap-2">
                <span className="text-copper mt-0.5">&#10003;</span>
                Automatizem tarefas repetitivas
              </li>
              <li className="flex items-start gap-2">
                <span className="text-copper mt-0.5">&#10003;</span>
                Painel profissional com visao completa
              </li>
              <li className="flex items-start gap-2">
                <span className="text-copper mt-0.5">&#10003;</span>
                Colaborem com a equipe em tempo real
              </li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* ── CTA FINAL ── */}
      <motion.section
        {...fadeUp}
        className="bg-verde-noite py-20 text-center px-6"
      >
        <h2 className="font-heading text-4xl text-white mb-8">
          Pronto para comecar?
        </h2>
        <Link
          href="/login"
          className="inline-block bg-copper text-white text-lg px-8 py-4 rounded-xl hover:opacity-90 transition-opacity"
        >
          Comecar agora
        </Link>
      </motion.section>

      {/* ── FOOTER ── */}
      <footer className="bg-verde-noite border-t border-white/10 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-white/60 text-sm">
          <span className="font-heading text-xl text-white">Laco</span>
          <span>Feito com &#9829; em Sao Paulo</span>
          <span>&copy; 2026 Laco. Todos os direitos reservados.</span>
        </div>
      </footer>
    </main>
  );
}
