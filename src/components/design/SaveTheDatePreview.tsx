"use client";
// ─── Preview: Save the Date ───────────────────────────────────────────────────
import { motion } from 'framer-motion';
import { BrasaoSVG } from './BrasaoSVG';
import type { DesignToolkit } from '@/types/design';

interface SaveTheDatePreviewProps {
  toolkit: DesignToolkit;
  onBack: () => void;
}

export function SaveTheDatePreview({ toolkit, onBack }: SaveTheDatePreviewProps) {
  const { accent, bg } = toolkit;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col pb-6"
    >
      {/* ── Paper card preview ── */}
      <div
        className="relative mx-5 mt-4 overflow-hidden rounded-2xl px-6 pb-10 pt-8 text-center"
        style={{ background: bg }}
      >
        {/* Inner border frame */}
        <div
          className="pointer-events-none absolute inset-2.5 rounded-xl border"
          style={{ borderColor: `${accent}30` }}
        />
        {/* Paper noise */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div className="relative">
          <div className="flex justify-center">
            <BrasaoSVG accent={accent} size={84} />
          </div>

          <p
            className="mt-3.5 font-['Josefin_Sans'] text-[9px] font-light tracking-[0.35em] uppercase"
            style={{ color: 'rgba(61,50,42,0.38)' }}
          >
            Save the Date
          </p>

          <h2
            className="mt-3.5 font-['Cormorant_Garamond'] text-[30px] font-light italic leading-snug"
            style={{ color: '#3D322A' }}
          >
            Antônia{' '}
            <span style={{ color: accent, fontSize: '22px' }}>&amp;</span>{' '}
            Bruno
          </h2>

          <div className="mx-auto my-3.5 h-px w-7" style={{ background: accent }} />

          <p
            className="font-['Josefin_Sans'] text-[15px] font-light tracking-[0.15em]"
            style={{ color: '#3D322A' }}
          >
            08 . 08 . 2026
          </p>

          <p
            className="mt-2.5 text-[11px] leading-relaxed tracking-[0.1em]"
            style={{ color: 'rgba(61,50,42,0.55)' }}
          >
            VALE DOS DESEJOS<br />AREAL — RJ
          </p>

          <p
            className="mt-4 text-[9.5px] tracking-[0.15em]"
            style={{ color: 'rgba(61,50,42,0.3)' }}
          >
            antoniaebruno.com
          </p>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="mt-4 flex gap-2 px-5">
        <button
          className="flex-1 rounded-xl py-3 font-['Josefin_Sans'] text-[11px] font-light tracking-[0.18em] uppercase text-white transition-opacity hover:opacity-90"
          style={{ background: accent }}
          onClick={() => alert('Enviar via WhatsApp')}
        >
          Enviar
        </button>
        <button
          className="flex-1 rounded-xl border-[1.5px] py-3 font-['Josefin_Sans'] text-[11px] font-light tracking-[0.18em] uppercase transition-colors hover:opacity-80"
          style={{ borderColor: `${accent}55`, color: accent }}
          onClick={() => alert('Abrir editor')}
        >
          Editar
        </button>
      </div>
      <button
        onClick={onBack}
        className="mx-5 mt-2 rounded-xl border-[1.5px] py-3 font-['Josefin_Sans'] text-[11px] font-light tracking-[0.18em] uppercase transition-colors hover:opacity-80"
        style={{ borderColor: `${accent}55`, color: accent }}
      >
        ← Voltar
      </button>
    </motion.div>
  );
}
