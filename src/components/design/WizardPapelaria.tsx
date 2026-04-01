"use client";
// ─── Wizard Aba 4: Papelaria ──────────────────────────────────────────────────
import { motion } from 'framer-motion';
import type { DesignToolkit } from '@/types/design';

interface WizardPapelariaProps {
  toolkit: DesignToolkit;
  onPreviewSTD: () => void;
  onPublish: () => void;
  onBack: () => void;
}

interface PapelariaCardProps {
  previewContent: React.ReactNode;
  name: string;
  badge: { label: string; type: 'ok' | 'edit' };
  bg: string;
  accent: string;
  onClick?: () => void;
}

function PapelariaCard({ previewContent, name, badge, bg, accent, onClick }: PapelariaCardProps) {
  const badgeStyle =
    badge.type === 'ok'
      ? { bg: 'rgba(107,124,94,0.12)', text: '#6B7C5E' }
      : { bg: `${accent}18`, text: accent };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full overflow-hidden rounded-2xl border-[1.5px] bg-white text-left transition-all hover:shadow-md"
      style={{ borderColor: 'rgba(169,137,80,0.14)' }}
    >
      {/* Paper texture overlay + preview */}
      <div
        className="relative flex h-[110px] items-center justify-center overflow-hidden"
        style={{ background: bg }}
      >
        {/* Subtle paper noise */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        {previewContent}
      </div>
      <div
        className="flex items-center justify-between border-t px-3.5 py-2.5"
        style={{ borderColor: 'rgba(169,137,80,0.1)' }}
      >
        <span
          className="font-['Josefin_Sans'] text-[10.5px] font-light tracking-[0.15em] uppercase"
          style={{ color: '#3D322A' }}
        >
          {name}
        </span>
        <span
          className="rounded-md px-2 py-0.5 font-['Josefin_Sans'] text-[8.5px] tracking-[0.08em] uppercase"
          style={{ background: badgeStyle.bg, color: badgeStyle.text }}
        >
          {badge.label}
        </span>
      </div>
    </motion.button>
  );
}

export function WizardPapelaria({ toolkit, onPreviewSTD, onPublish, onBack }: WizardPapelariaProps) {
  const { accent, bg, bgDark } = toolkit;

  return (
    <div className="flex flex-col pb-6">
      <div className="px-5 pt-5">
        <p
          className="mb-1 font-['Josefin_Sans'] text-[9.5px] font-light tracking-[0.3em] uppercase"
          style={{ color: 'rgba(61,50,42,0.38)' }}
        >
          Papelaria
        </p>
        <h2
          className="font-['Cormorant_Garamond'] text-[26px] font-light leading-tight"
          style={{ color: '#3D322A' }}
        >
          Peças geradas
        </h2>
        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: 'rgba(61,50,42,0.55)' }}>
          Toque para visualizar, editar e compartilhar cada peça.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 px-5">

        {/* Save the Date */}
        <PapelariaCard
          accent={accent}
          bg={bg}
          name="Save the Date"
          badge={{ label: 'Pronto', type: 'ok' }}
          onClick={onPreviewSTD}
          previewContent={
            <div className="text-center">
              <p
                className="font-['Cormorant_Garamond'] text-[19px] font-light italic"
                style={{ color: accent }}
              >
                Save the Date
              </p>
              <p
                className="mt-1 font-['Josefin_Sans'] text-[9px] font-light tracking-[0.3em] uppercase"
                style={{ color: 'rgba(61,50,42,0.38)' }}
              >
                08 . 08 . 2026
              </p>
            </div>
          }
        />

        {/* Convite */}
        <PapelariaCard
          accent={accent}
          bg={bg}
          name="Convite"
          badge={{ label: 'Pronto', type: 'ok' }}
          previewContent={
            <div className="text-center">
              <p
                className="font-['Cormorant_Garamond'] text-[17px] font-light italic"
                style={{ color: '#3D322A' }}
              >
                Antônia <span style={{ color: accent }}>&amp;</span> Bruno
              </p>
              <div className="mx-auto my-1.5 h-px w-5" style={{ background: accent }} />
              <p className="text-[8px] tracking-[0.18em] uppercase" style={{ color: 'rgba(61,50,42,0.38)' }}>
                Convidam para a celebração
              </p>
            </div>
          }
        />

        {/* Cardápio — independente */}
        <PapelariaCard
          accent={accent}
          bg={bgDark}
          name="Cardápio"
          badge={{ label: 'Editar', type: 'edit' }}
          previewContent={
            <div className="text-center">
              <p
                className="font-['Josefin_Sans'] text-[9px] font-light tracking-[0.28em] uppercase"
                style={{ color: accent }}
              >
                Cardápio
              </p>
              <div className="mx-auto my-1.5 h-px w-4" style={{ background: accent }} />
              <p
                className="font-['Cormorant_Garamond'] text-[11px] leading-relaxed"
                style={{ color: 'rgba(61,50,42,0.55)' }}
              >
                Entrada · Prato Principal<br />Sobremesa
              </p>
            </div>
          }
        />

        {/* Drinks — independente */}
        <PapelariaCard
          accent={accent}
          bg={bg}
          name="Drinks"
          badge={{ label: 'Editar', type: 'edit' }}
          previewContent={
            <div className="text-center">
              <p
                className="font-['Josefin_Sans'] text-[9px] font-light tracking-[0.28em] uppercase"
                style={{ color: accent }}
              >
                Drinks
              </p>
              <div className="mx-auto my-1.5 h-px w-4" style={{ background: accent }} />
              <p
                className="font-['Cormorant_Garamond'] text-[11px] leading-relaxed"
                style={{ color: 'rgba(61,50,42,0.55)' }}
              >
                Espumante · Gin Tônica<br />Aperol · Whisky
              </p>
            </div>
          }
        />
      </div>

      {/* ── CTAs ── */}
      <div className="mt-5 flex flex-col gap-2 px-5">
        <button
          onClick={onPublish}
          className="w-full rounded-xl py-3.5 font-['Josefin_Sans'] text-[11.5px] font-light tracking-[0.22em] uppercase text-white transition-opacity hover:opacity-90"
          style={{ background: accent }}
        >
          Publicar Tudo
        </button>
        <button
          onClick={onBack}
          className="w-full rounded-xl border-[1.5px] py-3 font-['Josefin_Sans'] text-[11px] font-light tracking-[0.18em] uppercase transition-colors hover:opacity-80"
          style={{ borderColor: `${accent}55`, color: accent }}
        >
          ← Voltar
        </button>
      </div>
    </div>
  );
}
