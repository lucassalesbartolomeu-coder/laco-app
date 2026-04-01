// ─── Wizard Aba 2: Foto ───────────────────────────────────────────────────────
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload } from 'lucide-react';
import type { PhotoOption } from '@/types/design';

interface WizardFotoProps {
  selected: PhotoOption;
  onSelect: (opt: PhotoOption) => void;
  onContinue: () => void;
  onBack: () => void;
  accent: string;
}

interface PhotoOptProps {
  id: PhotoOption;
  icon: string;
  title: string;
  desc: string;
  isSelected: boolean;
  accent: string;
  onClick: () => void;
}

function PhotoOpt({ icon, title, desc, isSelected, accent, onClick }: PhotoOptProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-3.5 rounded-2xl border-[1.5px] bg-white px-4 py-4 text-left transition-all"
      style={{
        borderColor: isSelected ? accent : 'rgba(169,137,80,0.18)',
        background: isSelected ? `${accent}05` : 'white',
        boxShadow: isSelected ? `0 2px 12px ${accent}15` : 'none',
      }}
    >
      <div
        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[11px] text-lg"
        style={{ background: isSelected ? `${accent}18` : '#F0E8DA' }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="mb-0.5 font-['Josefin_Sans'] text-[12.5px] font-normal tracking-[0.04em]"
          style={{ color: '#3D322A' }}
        >
          {title}
        </p>
        <p className="text-[11px] leading-snug" style={{ color: 'rgba(61,50,42,0.42)' }}>
          {desc}
        </p>
      </div>
    </button>
  );
}

function UploadZone({ label, accent }: { label: string; accent: string }) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="overflow-hidden"
    >
      <div
        className="mx-0 mt-3 cursor-pointer rounded-2xl border-[1.5px] border-dashed py-6 text-center transition-colors"
        style={{
          borderColor: isDragging ? accent : 'rgba(169,137,80,0.25)',
        }}
        onMouseEnter={() => setIsDragging(true)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <Upload
          size={26}
          strokeWidth={1.3}
          className="mx-auto mb-2"
          style={{ color: accent }}
        />
        <p className="text-[11.5px] leading-relaxed" style={{ color: 'rgba(61,50,42,0.55)' }}>
          {label}
        </p>
        <p className="mt-1 text-[10px]" style={{ color: 'rgba(61,50,42,0.3)' }}>
          JPG, PNG ou HEIC · até 10MB
        </p>
      </div>
    </motion.div>
  );
}

export function WizardFoto({ selected, onSelect, onContinue, onBack, accent }: WizardFotoProps) {
  return (
    <div className="flex flex-col pb-6">
      <div className="px-5 pt-5">
        <p
          className="mb-1 font-['Josefin_Sans'] text-[9.5px] font-light tracking-[0.3em] uppercase"
          style={{ color: 'rgba(61,50,42,0.38)' }}
        >
          Imagem do casamento
        </p>
        <h2
          className="font-['Cormorant_Garamond'] text-[26px] font-light leading-tight"
          style={{ color: '#3D322A' }}
        >
          Adicionar foto
        </h2>
        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: 'rgba(61,50,42,0.55)' }}>
          A imagem será usada no site, convite e papelaria.
        </p>
      </div>

      {/* ── Options ── */}
      <div className="mt-4 flex flex-col gap-2.5 px-5">

        {/* Opção 1: Foto do casal */}
        <PhotoOpt
          id="couple"
          icon="📸"
          title="Adicionar foto"
          desc="Envie uma foto do casal ou de vocês dois"
          isSelected={selected === 'couple'}
          accent={accent}
          onClick={() => onSelect('couple')}
        />
        <AnimatePresence>
          {selected === 'couple' && (
            <UploadZone label="Toque para enviar a foto do casal" accent={accent} />
          )}
        </AnimatePresence>

        {/* Opção 2: Foto do local → IA */}
        <PhotoOpt
          id="venue-ai"
          icon="🏛️"
          title="Adicionar foto para gerar com IA"
          desc="Envie uma foto do local — a IA cria uma ilustração em aquarela ou line art"
          isSelected={selected === 'venue-ai'}
          accent={accent}
          onClick={() => onSelect('venue-ai')}
        />
        <AnimatePresence>
          {selected === 'venue-ai' && (
            <UploadZone label="Foto do local do casamento" accent={accent} />
          )}
        </AnimatePresence>

        {/* Opção 3: Sem foto */}
        <PhotoOpt
          id="none"
          icon="⊘"
          title="Não adicionar"
          desc="Usar apenas brasão e elementos do toolkit selecionado"
          isSelected={selected === 'none'}
          accent={accent}
          onClick={() => onSelect('none')}
        />

      </div>

      {/* ── CTAs ── */}
      <div className="mt-6 flex flex-col gap-2 px-5">
        <button
          onClick={onContinue}
          className="w-full rounded-xl py-3.5 font-['Josefin_Sans'] text-[11.5px] font-light tracking-[0.22em] uppercase text-white transition-opacity hover:opacity-90 active:opacity-80"
          style={{ background: accent }}
        >
          Continuar →
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
