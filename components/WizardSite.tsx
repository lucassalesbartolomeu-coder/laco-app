// ─── Wizard Aba 3: Site ───────────────────────────────────────────────────────
import { motion } from 'framer-motion';
import type { DesignToolkit } from '@/types/design';

interface WizardSiteProps {
  toolkit: DesignToolkit;
  onPreviewSite: () => void;
  onContinue: () => void;
  onBack: () => void;
}

interface OutputCardProps {
  previewContent: React.ReactNode;
  name: string;
  badge: { label: string; type: 'ok' | 'edit' | 'config' };
  accent: string;
  bg: string;
  onClick?: () => void;
}

function OutputCard({ previewContent, name, badge, accent, bg, onClick }: OutputCardProps) {
  const badgeColors = {
    ok: { bg: 'rgba(107,124,94,0.12)', text: '#6B7C5E' },
    edit: { bg: `${accent}18`, text: accent },
    config: { bg: 'rgba(169,137,80,0.1)', text: '#A98950' },
  };
  const b = badgeColors[badge.type];

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full overflow-hidden rounded-2xl border-[1.5px] bg-white text-left transition-all hover:shadow-md"
      style={{ borderColor: 'rgba(169,137,80,0.14)' }}
    >
      {/* Preview area */}
      <div
        className="flex h-[110px] items-center justify-center overflow-hidden"
        style={{ background: bg }}
      >
        {previewContent}
      </div>
      {/* Info row */}
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
          style={{ background: b.bg, color: b.text }}
        >
          {badge.label}
        </span>
      </div>
    </motion.button>
  );
}

export function WizardSite({ toolkit, onPreviewSite, onContinue, onBack }: WizardSiteProps) {
  const { accent, bg, bgDark } = toolkit;

  return (
    <div className="flex flex-col pb-6">
      <div className="px-5 pt-5">
        <p
          className="mb-1 font-['Josefin_Sans'] text-[9.5px] font-light tracking-[0.3em] uppercase"
          style={{ color: 'rgba(61,50,42,0.38)' }}
        >
          Site do casamento
        </p>
        <h2
          className="font-['Cormorant_Garamond'] text-[26px] font-light leading-tight"
          style={{ color: '#3D322A' }}
        >
          Páginas geradas
        </h2>
        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: 'rgba(61,50,42,0.55)' }}>
          Toque em qualquer página para visualizar e ajustar.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2.5 px-5">

        {/* Home + Brasão */}
        <OutputCard
          accent={accent}
          bg={bg}
          name="Home + Brasão"
          badge={{ label: 'Pronto', type: 'ok' }}
          onClick={onPreviewSite}
          previewContent={
            <div className="flex items-center gap-3.5">
              <span
                className="font-['Josefin_Sans'] text-[42px] font-light leading-none"
                style={{ color: accent }}
              >
                A
              </span>
              <svg viewBox="0 0 200 200" width="52" height="52">
                <circle cx="100" cy="100" r="88" fill="none" stroke={accent} strokeWidth="1.2" />
                <circle cx="100" cy="100" r="58" fill="none" stroke={accent} strokeWidth="0.7" />
                <line x1="40" y1="100" x2="160" y2="100" stroke={accent} strokeWidth="0.5" />
              </svg>
              <span
                className="font-['Josefin_Sans'] text-[42px] font-light leading-none"
                style={{ color: accent }}
              >
                B
              </span>
            </div>
          }
        />

        {/* Concierge */}
        <OutputCard
          accent={accent}
          bg={bgDark}
          name="Concierge"
          badge={{ label: 'Pronto', type: 'ok' }}
          previewContent={
            <div className="text-center">
              <p
                className="mb-2 font-['Josefin_Sans'] text-[9px] font-light tracking-[0.25em] uppercase"
                style={{ color: 'rgba(61,50,42,0.45)' }}
              >
                Concierge
              </p>
              <div className="flex justify-center gap-3.5 text-[22px]">
                👗💄🚗🏨
              </div>
              <p
                className="mt-1.5 text-[8px] tracking-[0.1em] uppercase"
                style={{ color: 'rgba(61,50,42,0.38)' }}
              >
                Traje · Maquiagem · Transporte
              </p>
            </div>
          }
        />

        {/* Presentes + RSVP */}
        <OutputCard
          accent={accent}
          bg={bg}
          name="Presentes + RSVP"
          badge={{ label: 'Configurar', type: 'config' }}
          previewContent={
            <div className="text-center">
              <p
                className="font-['Cormorant_Garamond'] text-[17px] font-light"
                style={{ color: accent }}
              >
                Lista de Presentes
              </p>
              <div className="mx-auto my-1.5 h-px w-5" style={{ background: accent }} />
              <p
                className="text-[9px] tracking-[0.18em] uppercase"
                style={{ color: 'rgba(61,50,42,0.38)' }}
              >
                + Confirmação RSVP
              </p>
            </div>
          }
        />
      </div>

      {/* ── CTAs ── */}
      <div className="mt-5 flex flex-col gap-2 px-5">
        <button
          onClick={onContinue}
          className="w-full rounded-xl py-3.5 font-['Josefin_Sans'] text-[11.5px] font-light tracking-[0.22em] uppercase text-white transition-opacity hover:opacity-90"
          style={{ background: accent }}
        >
          Continuar → Papelaria
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
