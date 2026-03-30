"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LAST_WEDDING_KEY = "laco_last_wedding_id";

interface BottomNavProps {
  weddingId?: string;
}

/* ─── Icons (stroke 1.6, w-5 h-5 for refinement) ───────────────────── */

const InicioIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const PlanejarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const DesignIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
  </svg>
);

const ExecucaoIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const MaisIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
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

  const isActive = (pattern: string) => pathname.includes(pattern);
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
      label: "Planejar",
      href: weddingBase ? `${weddingBase}/planejar` : null,
      icon: <PlanejarIcon />,
      active:
        isActive("/planejar") ||
        isActive("/orcamento-inteligente") ||
        isActive("/simulador-convidados") ||
        isActive("/simulador") ||
        isActive("/fornecedores"),
      disabled: !weddingBase,
    },
    {
      label: "Design",
      href: weddingBase ? `${weddingBase}/meu-site` : null,
      icon: <DesignIcon />,
      active:
        isActive("/meu-site") ||
        isActive("/identity-kit"),
      disabled: !weddingBase,
    },
    {
      label: "Organizar",
      href: weddingBase ? `${weddingBase}/execucao` : null,
      icon: <ExecucaoIcon />,
      active:
        isActive("/execucao") ||
        isActive("/convidados") ||
        isActive("/confirmacoes") ||
        isActive("/importar") ||
        isActive("/orcamento") ||
        isActive("/presentes") ||
        isActive("/contratos") ||
        isActive("/timeline"),
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
      {/* Spacer — reserves exact height so page content never hides behind nav */}
      <div className="h-[72px]" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} />

      {/* Fixed nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-midnight/[0.06] safe-area-pb">
        <div className="max-w-lg mx-auto flex items-stretch">
          {tabs.map((tab) => {
            const content = (
              <span
                className={`flex flex-col items-center gap-0.5 py-2.5 px-1 text-[10px] font-display tracking-wide transition-colors duration-150 ${
                  tab.active
                    ? "text-midnight"
                    : tab.disabled
                    ? "text-stone/40"
                    : "text-stone hover:text-midnight/70"
                }`}
              >
                <span className="relative">
                  {tab.icon}
                  {/* Active indicator dot */}
                  {tab.active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold" />
                  )}
                </span>
                <span className="mt-1">{tab.label}</span>
              </span>
            );

            return (
              <div key={tab.label} className="flex-1 flex items-center justify-center">
                {tab.disabled || !tab.href ? (
                  <span className="cursor-not-allowed w-full flex justify-center">{content}</span>
                ) : (
                  <Link href={tab.href} className="w-full flex justify-center active:scale-95 transition-transform duration-100">
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
