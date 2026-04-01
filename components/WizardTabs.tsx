// ─── Wizard Progress Tabs ─────────────────────────────────────────────────────
import { motion } from 'framer-motion';
import type { WizardStep } from '@/types/design';

const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'estilo', label: 'Estilo' },
  { key: 'foto', label: 'Foto' },
  { key: 'site', label: 'Site' },
  { key: 'papelaria', label: 'Papelaria' },
];

interface WizardTabsProps {
  activeStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
  accent: string;
}

export function WizardTabs({ activeStep, onStepClick, accent }: WizardTabsProps) {
  const activeIndex = STEPS.findIndex((s) => s.key === activeStep);

  return (
    <div className="flex border-b border-black/5">
      {STEPS.map((step, idx) => {
        const isDone = idx < activeIndex;
        const isActive = step.key === activeStep;

        return (
          <button
            key={step.key}
            onClick={() => onStepClick(step.key)}
            className="relative flex-1 pb-2.5 pt-3.5 text-center focus:outline-none"
          >
            <span
              className="block font-['Josefin_Sans'] text-[8.5px] font-light tracking-[0.18em] uppercase transition-colors duration-200"
              style={{
                color: isActive
                  ? accent
                  : isDone
                  ? `${accent}88`
                  : 'rgba(61,50,42,0.35)',
              }}
            >
              {step.label}
            </span>
            {/* Underline bar */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
              style={{
                background: isActive ? accent : isDone ? `${accent}55` : 'rgba(0,0,0,0.06)',
              }}
              layout
            />
          </button>
        );
      })}
    </div>
  );
}
