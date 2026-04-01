"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ─── Icons ─────────────────────────────────────────────────────────── */

const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const GestaoIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const FinanceiroIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CasamentosIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const MaisIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
  </svg>
);

/* ─── Tab config ─────────────────────────────────────────────────────── */

const TABS = [
  {
    label: "Início",
    href: "/cerimonialista/dashboard",
    icon: <HomeIcon />,
    match: (p: string) => p === "/cerimonialista/dashboard",
  },
  {
    label: "Gestão",
    href: "/cerimonialista/pipeline",
    icon: <GestaoIcon />,
    match: (p: string) =>
      p.startsWith("/cerimonialista/pipeline") ||
      p.startsWith("/cerimonialista/agenda") ||
      p.startsWith("/cerimonialista/contratos") ||
      p.startsWith("/cerimonialista/equipe") ||
      p.startsWith("/cerimonialista/fornecedores") ||
      p.startsWith("/cerimonialista/questionarios") ||
      p.startsWith("/cerimonialista/comparar") ||
      p.startsWith("/cerimonialista/importar"),
  },
  {
    label: "Casamentos",
    href: "/cerimonialista/casamentos",
    icon: <CasamentosIcon />,
    match: (p: string) =>
      p.startsWith("/cerimonialista/casamentos") ||
      p.startsWith("/cerimonialista/casamento/"),
  },
  {
    label: "Financeiro",
    href: "/cerimonialista/financeiro",
    icon: <FinanceiroIcon />,
    match: (p: string) =>
      p.startsWith("/cerimonialista/financeiro") ||
      p.startsWith("/cerimonialista/comissoes"),
  },
  {
    label: "Mais",
    href: "/cerimonialista/portfolio",
    icon: <MaisIcon />,
    match: (p: string) =>
      p.startsWith("/cerimonialista/portfolio") ||
      p.startsWith("/cerimonialista/comunidade"),
  },
];

/* ─── Component ─────────────────────────────────────────────────────── */

export default function PlannerBottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Spacer — reserves exact height so page content never hides behind nav */}
      <div className="h-[72px]" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} />

      {/* Fixed nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-midnight/[0.06] safe-area-pb">
        <div className="max-w-lg mx-auto flex items-stretch">
          {TABS.map((tab) => {
            const active = tab.match(pathname ?? "");

            return (
              <div key={tab.label} className="flex-1 flex items-center justify-center">
                <Link
                  href={tab.href}
                  className="w-full flex justify-center active:scale-95 transition-transform duration-100"
                >
                  <span
                    className={`flex flex-col items-center gap-0.5 py-2.5 px-1 text-[10px] font-display tracking-wide transition-colors duration-150 ${
                      active
                        ? "text-midnight"
                        : "text-stone hover:text-midnight/70"
                    }`}
                  >
                    <span className="relative">
                      {tab.icon}
                      {active && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold" />
                      )}
                    </span>
                    <span className="mt-1">{tab.label}</span>
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );
}
