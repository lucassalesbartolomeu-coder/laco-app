"use client";
// ─── AppHeader ────────────────────────────────────────────────────────────────
// Header sticky com back button e título — padrão de todas as abas.

import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
  accent?: string;
}

export function AppHeader({
  title,
  onBack,
  right,
  accent = "#A98950",
}: AppHeaderProps) {
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
      <div className="w-[30px] flex justify-end">{right}</div>
    </div>
  );
}
