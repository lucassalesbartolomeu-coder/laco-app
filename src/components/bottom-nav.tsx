"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LAST_WEDDING_KEY = "laco_last_wedding_id";

interface BottomNavProps {
  weddingId?: string;
}

/* ─── Icons (stroke 1.4 — thin and refined) ─────────────────────────── */

const InicioIcon = () => (
  <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CasamentoIcon = () => (
  <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const DesignIcon = () => (
  <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
  </svg>
);

const MaisIcon = () => (
  <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

/* ─── Component ─────────────────────────────────────────────────────── */

export default function BottomNav({ weddingId }: BottomNavProps) {
  const pathname = usePathname();
  const [resolvedId, setResolvedId] = useState(weddingId);

  useEffect(() => {
    if (weddingId) {
      localStorage.setItem(LAST_WEDDING_KEY, weddingId);
      setResolvedId(weddingId);
    } else {
      const saved = localStorage.getItem(LAST_WEDDING_KEY);
      if (saved) setResolvedId(saved);
    }
  }, [weddingId]);

  const isActive = (pattern: string) => pathname?.includes(pattern) ?? false;
  const isHome = pathname === "/dashboard";

  const weddingBase = resolvedId ? `/casamento/${resolvedId}` : null;

  const tabs = [
    {
      label: "Início",
      href: "/dashboard",
      icon: <InicioIcon />,
      active: isHome,
      disabled: false,
    },
    {
      label: "Casamento",
      href: weddingBase ? `${weddingBase}/planejar` : null,
      icon: <CasamentoIcon />,
      active:
        isActive("/planejar") ||
        isActive("/execucao") ||
        isActive("/convidados") ||
        isActive("/confirmacoes") ||
        isActive("/importar") ||
        isActive("/orcamento-inteligente") ||
        isActive("/simulador-convidados") ||
        isActive("/simulador") ||
        isActive("/orcamento") ||
        isActive("/presentes") ||
        isActive("/fornecedores") ||
        isActive("/contratos") ||
        isActive("/timeline") ||
        isActive("/questionarios") ||
        isActive("/lua-de-mel") ||
        isActive("/tarefas") ||
        isActive("/whatsapp-confirmacao"),
      disabled: !weddingBase,
    },
    {
      label: "Design",
      href: weddingBase ? `${weddingBase}/meu-site` : null,
      icon: <DesignIcon />,
      active: isActive("/meu-site") || isActive("/identity-kit"),
      disabled: !weddingBase,
    },
    {
      label: "Mais",
      href: weddingBase ? `${weddingBase}/mais` : "/perfil",
      icon: <MaisIcon />,
      active: isActive("/mais") || isActive("/perfil"),
      disabled: false,
    },
  ];

  return (
    <>
      {/* Spacer so content never hides behind the fixed nav */}
      <div className="h-[72px]" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} />

      {/* Fixed nav bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t"
        style={{
          background: "rgba(250,246,239,0.97)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(169,137,80,0.12)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="max-w-lg mx-auto flex items-stretch">
          {tabs.map((tab) => {
            const GOLD = "#A98950";
            const MUTE = "rgba(61,50,42,0.28)";

            const content = (
              <span className="flex flex-col items-center gap-[3px] py-3 px-1 w-full">
                {/* Icon */}
                <span
                  className="relative transition-colors duration-150"
                  style={{ color: tab.active ? GOLD : tab.disabled ? MUTE : "rgba(61,50,42,0.42)" }}
                >
                  {tab.icon}
                  {/* Active underline */}
                  {tab.active && (
                    <span
                      className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 rounded-full"
                      style={{ width: 16, height: 1.5, background: GOLD }}
                    />
                  )}
                </span>

                {/* Label */}
                <span
                  className="transition-colors duration-150"
                  style={{
                    fontFamily: "'Josefin Sans', sans-serif",
                    fontSize: "8.5px",
                    fontWeight: 300,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: tab.active ? GOLD : tab.disabled ? MUTE : "rgba(61,50,42,0.42)",
                  }}
                >
                  {tab.label}
                </span>
              </span>
            );

            return (
              <div key={tab.label} className="flex-1 flex items-center justify-center">
                {tab.disabled || !tab.href ? (
                  <span className="cursor-not-allowed w-full flex justify-center">{content}</span>
                ) : (
                  <Link
                    href={tab.href}
                    className="w-full flex justify-center active:scale-95 transition-transform duration-100"
                  >
                    {content}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );
}
