"use client";
// ─── Wizard Aba 1: Estilo ─────────────────────────────────────────────────────
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus } from 'lucide-react';
import { TOOLKITS } from '@/types/design';
import { ToolkitMono } from './BrasaoSVG';
import type { DesignToolkit } from '@/types/design';

interface WizardEstiloProps {
  selectedId: string;
  onSelect: (toolkit: DesignToolkit) => void;
  onContinue: () => void;
  accent: string;
}

import type { Variants } from 'framer-motion';

const gridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.22, ease: 'easeOut' as const } },
};

export function WizardEstilo({ selectedId, onSelect, onContinue, accent }: WizardEstiloProps) {
  return (
    <div className="flex flex-col pb-6">
      <div className="px-5 pt-5">
        <p
          className="mb-1 font-['Josefin_Sans'] text-[9.5px] font-light tracking-[0.3em] uppercase"
          style={{ color: 'rgba(61,50,42,0.38)' }}
        >
          Toolkit de identidade visual
        </p>
        <h2
          className="font-['Cormorant_Garamond'] text-[26px] font-light leading-tight"
          style={{ color: '#3D322A' }}
        >
          Escolha seu estilo
        </h2>
        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: 'rgba(61,50,42,0.55)' }}>
          Define cores, fontes e brasão — aplicados no site e na papelaria.
        </p>
      </div>

      {/* ── Toolkit Grid ── */}
      <motion.div
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        className="mt-4 grid grid-cols-2 gap-2.5 px-5"
      >
        {TOOLKITS.map((tk) => {
          const isSelected = tk.id === selectedId;
          const isDark = tk.id === 'midnight';

          return (
            <motion.button
              key={tk.id}
              variants={cardVariants}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(tk)}
              className="relative overflow-hidden rounded-2xl border-2 p-3 text-center transition-all"
              style={{
                background: tk.bg,
                borderColor: isSelected ? tk.accent : 'transparent',
                boxShadow: isSelected
                  ? `0 4px 16px ${tk.accent}22`
                  : '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              {/* Selected checkmark */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'backOut' }}
                    className="absolute right-2 top-2 flex h-[18px] w-[18px] items-center justify-center rounded-full"
                    style={{ background: tk.accent }}
                  >
                    <Check size={10} strokeWidth={2.5} className="text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Color swatches */}
              <div className="mb-2.5 flex h-1.5 gap-1">
                {tk.swatches.map((c, i) => (
                  <div key={i} className="flex-1 rounded-full" style={{ background: c }} />
                ))}
              </div>

              {/* Monogram */}
              <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center">
                <ToolkitMono monoStyle={tk.monoStyle} accent={tk.accent} bg={tk.bg} size={44} />
              </div>

              {/* Name & mood */}
              <p
                className="font-['Cormorant_Garamond'] text-[14px] font-normal leading-tight"
                style={{ color: isDark ? '#E8DCC8' : '#3D322A' }}
              >
                {tk.name}
              </p>
              <p
                className="mt-0.5 text-[9px] tracking-[0.1em] uppercase"
                style={{ color: isDark ? 'rgba(232,220,200,0.45)' : 'rgba(61,50,42,0.38)' }}
              >
                {tk.mood}
              </p>
            </motion.button>
          );
        })}

        {/* Criar Novo placeholder */}
        <motion.button
          variants={cardVariants}
          whileTap={{ scale: 0.97 }}
          className="flex min-h-[140px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/10 bg-white"
          onClick={() => alert('Em breve: toolkit personalizado')}
        >
          <Plus size={22} strokeWidth={1.5} style={{ color: accent, marginBottom: 4 }} />
          <span className="text-[9px] tracking-[0.12em] uppercase" style={{ color: 'rgba(61,50,42,0.38)' }}>
            Criar Novo
          </span>
        </motion.button>
      </motion.div>

      {/* ── CTA ── */}
      <div className="mt-5 px-5">
        <button
          onClick={onContinue}
          className="w-full rounded-xl py-3.5 font-['Josefin_Sans'] text-[11.5px] font-light tracking-[0.22em] uppercase text-white transition-opacity hover:opacity-90 active:opacity-80"
          style={{ background: accent }}
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
