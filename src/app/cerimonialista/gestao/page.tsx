"use client";

import Link from "next/link";
import {
  Filter,
  Calendar,
  FileText,
  Users,
  Store,
  ClipboardList,
  BarChart2,
  Upload,
} from "lucide-react";

const GOLD  = "#A98950";
const BROWN = "#3D322A";
const CREME = "#FAF6EF";
const BG_DARK = "#F0E8DA";

const ITEMS = [
  {
    href: "/cerimonialista/pipeline",
    label: "Pipeline / CRM",
    desc: "Funil de leads e oportunidades",
    Icon: Filter,
  },
  {
    href: "/cerimonialista/agenda",
    label: "Agenda",
    desc: "Calendário de eventos",
    Icon: Calendar,
  },
  {
    href: "/cerimonialista/contratos",
    label: "Contratos",
    desc: "Templates e gestão de contratos",
    Icon: FileText,
  },
  {
    href: "/cerimonialista/equipe",
    label: "Equipe",
    desc: "Membros da sua equipe",
    Icon: Users,
  },
  {
    href: "/cerimonialista/fornecedores",
    label: "Fornecedores",
    desc: "Diretório de fornecedores",
    Icon: Store,
  },
  {
    href: "/cerimonialista/questionarios",
    label: "Questionários",
    desc: "Criar e gerenciar questionários",
    Icon: ClipboardList,
  },
  {
    href: "/cerimonialista/comparar-orcamentos",
    label: "Comparar Orçamentos",
    desc: "Compare orçamentos de fornecedores",
    Icon: BarChart2,
  },
  {
    href: "/cerimonialista/importar-orcamento",
    label: "Importar Orçamento",
    desc: "Importar via OCR em PDF",
    Icon: Upload,
  },
];

export default function GestaoHub() {
  return (
    <div className="min-h-screen pb-24 px-4 pt-8" style={{ background: CREME }}>
      {/* Header */}
      <div className="mb-8">
        <p
          className="text-xs tracking-[0.25em] uppercase mb-1"
          style={{ color: `rgba(61,50,42,0.40)`, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}
        >
          Cerimonialista
        </p>
        <h1
          className="text-3xl"
          style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontStyle: "italic" }}
        >
          Gestão
        </h1>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {ITEMS.map(({ href, label, desc, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-3 p-4 rounded-2xl transition-all active:scale-95"
            style={{
              background: BG_DARK,
              border: `1px solid rgba(169,137,80,0.18)`,
            }}
          >
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `rgba(169,137,80,0.12)` }}
            >
              <Icon size={18} style={{ color: GOLD }} strokeWidth={1.6} />
            </span>
            <span>
              <span
                className="block text-sm font-medium leading-snug"
                style={{ color: BROWN }}
              >
                {label}
              </span>
              <span
                className="block text-xs mt-0.5 leading-snug"
                style={{ color: `rgba(61,50,42,0.45)` }}
              >
                {desc}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
