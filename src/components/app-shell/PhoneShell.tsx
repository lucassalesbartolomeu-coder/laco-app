"use client";
// ─── PhoneShell ───────────────────────────────────────────────────────────────
// Wrapper de phone frame compartilhado por todas as abas do app.
// Mantém consistência visual com a Aba Design.

import { ReactNode } from "react";

interface PhoneShellProps {
  children: ReactNode;
  /** Cor de fundo do device — default #FAF6EF (creme quente) */
  bg?: string;
}

export function PhoneShell({ children, bg = "#FAF6EF" }: PhoneShellProps) {
  return (
    <div className="flex min-h-screen items-start justify-center bg-[#E8E0D4] px-4 py-10">
      <div
        className="relative overflow-hidden rounded-[44px] border-[8px] border-[#1e1a16]"
        style={{
          width: 390,
          minHeight: 844,
          background: bg,
          boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
        }}
      >
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-10 h-[30px] w-[126px] -translate-x-1/2 rounded-b-[22px] bg-[#1e1a16]" />

        {/* Status bar */}
        <div
          className="flex items-center justify-between px-7 pb-1 pt-[14px] text-[11px] font-medium"
          style={{ color: "#3D322A", fontFamily: "'Inter', sans-serif" }}
        >
          <span>9:41</span>
          <span className="text-[10px]">●●● 🔋</span>
        </div>

        {children}
      </div>
    </div>
  );
}
