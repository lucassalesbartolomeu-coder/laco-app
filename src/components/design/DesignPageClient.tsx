"use client";
// ─── Design Page Client — Orquestrador da Aba Design ─────────────────────────
//
// Fluxo:
//   home → wizard (estilo → foto → site → papelaria)
//        → preview-site
//        → preview-std

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { TOOLKITS } from "@/types/design";
import type { DesignToolkit, PhotoOption, WizardStep, DesignScreen } from "@/types/design";

import { DesignHome } from "./DesignHome";
import { WizardTabs } from "./WizardTabs";
import { WizardEstilo } from "./WizardEstilo";
import { WizardFoto } from "./WizardFoto";
import { WizardSite } from "./WizardSite";
import { WizardPapelaria } from "./WizardPapelaria";
import { SitePreview } from "./SitePreview";
import { SaveTheDatePreview } from "./SaveTheDatePreview";

// ── Bottom Nav (decorativo — tabs do app) ────────────────────────────────────
function BottomNav({ accent }: { accent: string }) {
  const tabs = [
    { icon: "🏠", label: "Início", active: false },
    { icon: "📋", label: "Planejar", active: false },
    { icon: "🎨", label: "Design", active: true },
    { icon: "⚡", label: "Execução", active: false },
    { icon: "···", label: "Mais", active: false },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-around border-t border-black/5 bg-white pb-6 pt-2">
      {tabs.map((tab) => (
        <div
          key={tab.label}
          className="flex flex-col items-center gap-0.5 transition-opacity"
          style={{ opacity: tab.active ? 1 : 0.32 }}
        >
          <span className="text-[19px] leading-none">{tab.icon}</span>
          <span
            className="text-[8.5px] font-light tracking-[0.13em] uppercase"
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              color: tab.active ? accent : "#3D322A",
            }}
          >
            {tab.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Header ───────────────────────────────────────────────────────────────────
function Header({
  title,
  onBack,
  accent,
}: {
  title: string;
  onBack?: () => void;
  accent: string;
}) {
  return (
    <div
      className="sticky top-0 z-[5] flex items-center gap-2 border-b border-black/5 px-5 py-2.5 backdrop-blur-sm"
      style={{ background: "rgba(250,246,239,0.95)" }}
    >
      <div className="w-[30px]">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-full transition-colors hover:bg-black/5"
          >
            <ArrowLeft size={18} strokeWidth={1.5} style={{ color: accent }} />
          </button>
        )}
      </div>
      <p
        className="flex-1 text-center text-[12px] font-light tracking-[0.28em] uppercase"
        style={{ fontFamily: "'Josefin Sans', sans-serif", color: "#3D322A" }}
      >
        {title}
      </p>
      <div className="w-[30px]" />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DesignPageClient() {
  const [screen, setScreen] = useState<DesignScreen>("home");
  const [wizardStep, setWizardStep] = useState<WizardStep>("estilo");
  const [selectedToolkitId, setSelectedToolkitId] = useState("dourado");
  const [photoOption, setPhotoOption] = useState<PhotoOption>("couple");

  const toolkit: DesignToolkit =
    TOOLKITS.find((t) => t.id === selectedToolkitId) ?? TOOLKITS[0];

  const goTo = useCallback((s: DesignScreen) => setScreen(s), []);

  const openWizard = useCallback(
    (step: WizardStep = "estilo") => {
      setWizardStep(step);
      goTo("wizard");
    },
    [goTo]
  );

  const stepOrder: WizardStep[] = ["estilo", "foto", "site", "papelaria"];

  const nextStep = () => {
    const idx = stepOrder.indexOf(wizardStep);
    if (idx < stepOrder.length - 1) setWizardStep(stepOrder[idx + 1]);
  };

  const prevStep = () => {
    const idx = stepOrder.indexOf(wizardStep);
    if (idx > 0) setWizardStep(stepOrder[idx - 1]);
    else goTo("home");
  };

  const headerTitle =
    screen === "home"
      ? "Meu Design"
      : screen === "preview-site"
      ? "Preview do Site"
      : screen === "preview-std"
      ? "Save the Date"
      : "Meu Design";

  const handleBack =
    screen === "home"
      ? undefined
      : screen === "wizard"
      ? prevStep
      : screen === "preview-site"
      ? () => openWizard("site")
      : screen === "preview-std"
      ? () => openWizard("papelaria")
      : () => goTo("home");

  return (
    // Fundo cinza-quente como no protótipo
    <div className="flex min-h-screen items-start justify-center bg-[#E8E0D4] px-4 py-10">
      {/* Phone shell */}
      <div
        className="relative overflow-hidden rounded-[44px] border-[8px] border-[#1e1a16]"
        style={{
          width: 390,
          minHeight: 844,
          background: "#FAF6EF",
          boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
        }}
      >
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-10 h-[30px] w-[126px] -translate-x-1/2 rounded-b-[22px] bg-[#1e1a16]" />

        {/* Status bar */}
        <div
          className="flex items-center justify-between px-7 pb-1 pt-[14px] text-[11px] font-medium"
          style={{ color: "#3D322A" }}
        >
          <span>9:41</span>
          <span className="text-[10px]">●●● 🔋</span>
        </div>

        {/* Header */}
        <Header title={headerTitle} onBack={handleBack} accent={toolkit.accent} />

        {/* Wizard tabs */}
        <AnimatePresence>
          {screen === "wizard" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <WizardTabs
                activeStep={wizardStep}
                onStepClick={setWizardStep}
                accent={toolkit.accent}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable content area */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(844px - 44px - 80px)" }}
        >
          <AnimatePresence mode="wait">
            {screen === "home" && (
              <motion.div
                key="home"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22 }}
              >
                <DesignHome
                  toolkit={toolkit}
                  onOpenWizard={() => openWizard("estilo")}
                  onGoToSite={() => openWizard("site")}
                  onGoToPapelaria={() => openWizard("papelaria")}
                />
              </motion.div>
            )}

            {screen === "wizard" && wizardStep === "estilo" && (
              <motion.div
                key="estilo"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22 }}
              >
                <WizardEstilo
                  selectedId={selectedToolkitId}
                  onSelect={(tk) => setSelectedToolkitId(tk.id)}
                  onContinue={nextStep}
                  accent={toolkit.accent}
                />
              </motion.div>
            )}

            {screen === "wizard" && wizardStep === "foto" && (
              <motion.div
                key="foto"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22 }}
              >
                <WizardFoto
                  selected={photoOption}
                  onSelect={setPhotoOption}
                  onContinue={nextStep}
                  onBack={prevStep}
                  accent={toolkit.accent}
                />
              </motion.div>
            )}

            {screen === "wizard" && wizardStep === "site" && (
              <motion.div
                key="site"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22 }}
              >
                <WizardSite
                  toolkit={toolkit}
                  onPreviewSite={() => goTo("preview-site")}
                  onContinue={nextStep}
                  onBack={prevStep}
                />
              </motion.div>
            )}

            {screen === "wizard" && wizardStep === "papelaria" && (
              <motion.div
                key="papelaria"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22 }}
              >
                <WizardPapelaria
                  toolkit={toolkit}
                  onPreviewSTD={() => goTo("preview-std")}
                  onPublish={() => alert("Publicar site + gerar PDFs da papelaria")}
                  onBack={prevStep}
                />
              </motion.div>
            )}

            {screen === "preview-site" && (
              <motion.div
                key="preview-site"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22 }}
              >
                <SitePreview toolkit={toolkit} onBack={() => openWizard("site")} />
              </motion.div>
            )}

            {screen === "preview-std" && (
              <motion.div
                key="preview-std"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22 }}
              >
                <SaveTheDatePreview
                  toolkit={toolkit}
                  onBack={() => openWizard("papelaria")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Nav */}
        <BottomNav accent={toolkit.accent} />
      </div>
    </div>
  );
}
