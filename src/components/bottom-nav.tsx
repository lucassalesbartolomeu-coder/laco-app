"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LAST_WEDDING_KEY = "laco_last_wedding_id";

interface BottomNavProps {
  weddingId?: string;
}

/* ─── Icons ─────────────────────────────────────────────────────────── */

const InicioIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const PlanejarIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const MeuSiteIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const ExecucaoIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const MaisIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
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
      label: "Inicio",
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
      label: "Meu Site",
      href: weddingBase ? `${weddingBase}/meu-site` : null,
      icon: <MeuSiteIcon />,
      active:
        isActive("/meu-site") ||
        isActive("/identity-kit"),
      disabled: !weddingBase,
    },
    {
      label: "Execucao",
      href: weddingBase ? `${weddingBase}/execucao` : null,
      icon: <ExecucaoIcon />,
      active:
        isActive("/execucao") ||
        isActive("/convidados") ||
        isActive("/confirmacoes") ||
        isActive("/importar") ||
        isActive("/orcamento") ||
        isActive("/presentes"),
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-pb">
      <div className="max-w-lg mx-auto flex items-stretch">
        {tabs.map((tab) => {
          const content = (
            <span
              className={`flex flex-col items-center gap-1 py-2.5 px-1 text-[10px] font-body transition-colors ${
                tab.active
                  ? "text-teal"
                  : tab.disabled
                  ? "text-gray-300"
                  : "text-verde-noite/40 hover:text-verde-noite/70"
              }`}
            >
              {tab.icon}
              {tab.label}
            </span>
          );

          return (
            <div key={tab.label} className="flex-1 flex items-center justify-center">
              {tab.disabled || !tab.href ? (
                <button disabled className="w-full flex justify-center cursor-not-allowed">
                  {content}
                </button>
              ) : (
                <Link href={tab.href} className="w-full flex justify-center">
                  {content}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
