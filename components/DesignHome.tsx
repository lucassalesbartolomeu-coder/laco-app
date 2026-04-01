// ─── Tela de Entrada "Meu Design" ────────────────────────────────────────────
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { BrasaoSVG } from './BrasaoSVG';
import type { DesignToolkit } from '@/types/design';

interface DesignHomeProps {
  toolkit: DesignToolkit;
  onOpenWizard: () => void;
  onGoToSite: () => void;
  onGoToPapelaria: () => void;
}

import type { Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

interface EntryCardProps {
  icon: string;
  title: string;
  desc: string;
  accent: string;
  onClick: () => void;
}

function EntryCard({ icon, title, desc, accent, onClick }: EntryCardProps) {
  return (
    <motion.button
      variants={itemVariants}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex w-full items-center gap-3.5 rounded-2xl border border-black/8 bg-white px-5 py-4 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] text-xl"
        style={{ background: `${accent}18` }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="mb-0.5 font-['Josefin_Sans'] text-[12px] font-light tracking-[0.06em]"
          style={{ color: '#3D322A' }}
        >
          {title}
        </p>
        <p className="text-[11px] leading-snug" style={{ color: 'rgba(61,50,42,0.45)' }}>
          {desc}
        </p>
      </div>
      <ChevronRight className="shrink-0 opacity-30" size={18} strokeWidth={1.5} />
    </motion.button>
  );
}

export function DesignHome({ toolkit, onOpenWizard, onGoToSite, onGoToPapelaria }: DesignHomeProps) {
  return (
    <motion.div
      className="flex flex-col pb-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Hero with brasão ── */}
      <motion.div variants={itemVariants} className="flex flex-col items-center px-6 pb-6 pt-8 text-center">
        <BrasaoSVG accent={toolkit.accent} size={96} />

        <h1
          className="mt-4 font-['Cormorant_Garamond'] text-[28px] font-light italic leading-tight"
          style={{ color: toolkit.text }}
        >
          Antônia{' '}
          <span style={{ color: toolkit.accent, fontSize: '22px' }}>&amp;</span>{' '}
          Bruno
        </h1>

        <p
          className="mt-1 font-['Josefin_Sans'] text-[9px] font-light tracking-[0.3em] uppercase"
          style={{ color: 'rgba(61,50,42,0.38)' }}
        >
          Toolkit ativo: {toolkit.name}
        </p>
      </motion.div>

      {/* ── Entry cards ── */}
      <div className="flex flex-col gap-3 px-5">
        <EntryCard
          icon="🎨"
          title="Identidade Visual"
          desc="Estilo, foto e brasão do seu casamento"
          accent={toolkit.accent}
          onClick={onOpenWizard}
        />
        <EntryCard
          icon="🌐"
          title="Site do Casamento"
          desc="Home, Concierge, Presentes & RSVP"
          accent={toolkit.accent}
          onClick={onGoToSite}
        />
        <EntryCard
          icon="✉️"
          title="Papelaria"
          desc="Convite, Save the Date, Cardápio, Drinks"
          accent={toolkit.accent}
          onClick={onGoToPapelaria}
        />
      </div>

      {/* ── CTA ── */}
      <motion.div variants={itemVariants} className="mt-5 px-5">
        <button
          onClick={onOpenWizard}
          className="w-full rounded-xl py-3.5 font-['Josefin_Sans'] text-[11.5px] font-light tracking-[0.22em] uppercase text-white transition-opacity hover:opacity-90 active:opacity-80"
          style={{ background: toolkit.accent }}
        >
          Criar / Editar Design
        </button>
      </motion.div>
    </motion.div>
  );
}
