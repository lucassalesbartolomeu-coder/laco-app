"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomNavProps {
  weddingId?: string;
}

const HomeIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const SimuladorIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const GestaoIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IDVisualIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);

const PerfilIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default function BottomNav({ weddingId }: BottomNavProps) {
  const pathname = usePathname();

  const isActive = (pattern: string) => pathname.includes(pattern);
  const isHome = pathname === "/dashboard";

  const weddingBase = weddingId ? `/casamento/${weddingId}` : null;

  const tabs = [
    {
      label: "Home",
      href: "/dashboard",
      icon: <HomeIcon />,
      active: isHome,
      disabled: false,
    },
    {
      label: "Simulador",
      href: weddingBase ? `${weddingBase}/simulador` : null,
      icon: <SimuladorIcon />,
      active: isActive("/simulador"),
      disabled: !weddingBase,
    },
    {
      label: "Gestão",
      href: weddingBase ? `${weddingBase}/convidados` : null,
      icon: <GestaoIcon />,
      active: isActive("/convidados") || isActive("/presentes"),
      disabled: !weddingBase,
    },
    {
      label: "ID Visual",
      href: weddingBase ? `${weddingBase}/identidade` : null,
      icon: <IDVisualIcon />,
      active: isActive("/identidade"),
      disabled: true, // Sprint 7 — não implementado ainda
    },
    {
      label: "Perfil",
      href: "/perfil",
      icon: <PerfilIcon />,
      active: isActive("/perfil"),
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
