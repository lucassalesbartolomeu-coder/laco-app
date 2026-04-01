// ─── Preview: Site do Casamento ───────────────────────────────────────────────
import { motion } from 'framer-motion';
import { BrasaoSVG } from './BrasaoSVG';
import type { DesignToolkit } from '@/types/design';

interface SitePreviewProps {
  toolkit: DesignToolkit;
  onBack: () => void;
}

export function SitePreview({ toolkit, onBack }: SitePreviewProps) {
  const { accent, bg, bgDark } = toolkit;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col pb-6"
    >
      {/* ── Mini site frame ── */}
      <div
        className="mx-5 mt-4 overflow-hidden rounded-2xl border"
        style={{ borderColor: 'rgba(169,137,80,0.14)' }}
      >
        {/* Mini nav */}
        <div
          className="flex items-center justify-between border-b px-3.5 py-2.5"
          style={{ background: 'white', borderColor: 'rgba(169,137,80,0.1)' }}
        >
          <span
            className="font-['Josefin_Sans'] text-[13px] font-light tracking-[0.25em]"
            style={{ color: accent }}
          >
            A + B
          </span>
          <div className="flex gap-2.5">
            {['Home', 'Dress Code', 'RSVP', 'Presentes'].map((l) => (
              <span
                key={l}
                className="font-['Josefin_Sans'] text-[7px] font-light tracking-[0.12em] uppercase"
                style={{ color: 'rgba(61,50,42,0.38)' }}
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Hero */}
        <div className="px-4 py-7 text-center" style={{ background: bg }}>
          <div className="flex items-center justify-center gap-4">
            <span
              className="font-['Josefin_Sans'] text-[60px] font-light leading-none"
              style={{ color: accent }}
            >
              A
            </span>
            <BrasaoSVG accent={accent} size={68} />
            <span
              className="font-['Josefin_Sans'] text-[60px] font-light leading-none"
              style={{ color: accent }}
            >
              B
            </span>
          </div>
          <p
            className="mt-3.5 font-['Josefin_Sans'] text-[8.5px] font-light tracking-[0.3em] uppercase"
            style={{ color: 'rgba(61,50,42,0.38)' }}
          >
            08 de Agosto de 2026 · Vale dos Desejos, Areal — RJ
          </p>
        </div>

        {/* Event details */}
        <div className="px-4 py-5 text-center" style={{ background: bgDark }}>
          <p
            className="font-['Cormorant_Garamond'] text-[20px] font-light"
            style={{ color: accent }}
          >
            Antônia e Bruno
          </p>
          <div className="mx-auto my-1.5 h-px w-5" style={{ background: accent }} />
          <div
            className="mt-2 text-[9.5px] leading-loose tracking-[0.12em] uppercase"
            style={{ color: 'rgba(61,50,42,0.55)' }}
          >
            📅 08 de Agosto de 2026<br />
            🕐 Às 15 horas<br />
            📍 Vale dos Desejos, Areal — RJ
          </div>
          <div
            className="mt-3 inline-block border px-4 py-1.5 font-['Josefin_Sans'] text-[8px] tracking-[0.25em] uppercase"
            style={{ borderColor: accent, color: accent }}
          >
            Confirmar Presença
          </div>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="mt-4 flex gap-2 px-5">
        <button
          className="flex-1 rounded-xl py-3 font-['Josefin_Sans'] text-[11px] font-light tracking-[0.18em] uppercase text-white transition-opacity hover:opacity-90"
          style={{ background: accent }}
          onClick={() => alert('Abrir editor do site')}
        >
          Editar
        </button>
        <button
          className="flex-1 rounded-xl border-[1.5px] py-3 font-['Josefin_Sans'] text-[11px] font-light tracking-[0.18em] uppercase transition-colors hover:opacity-80"
          style={{ borderColor: `${accent}55`, color: accent }}
          onClick={() => alert('Publicar site')}
        >
          Publicar
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
