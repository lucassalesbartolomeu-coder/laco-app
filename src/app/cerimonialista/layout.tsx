"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import PlannerBottomNav from "@/components/planner-bottom-nav";
import { PlannerNotificationBell } from "@/components/planner-notifications";

function usePwaManifest() {
  useEffect(() => {
    const link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    const prev = link?.getAttribute("href");
    if (link) link.setAttribute("href", "/manifest-pro.json");
    return () => {
      if (link && prev) link.setAttribute("href", prev);
    };
  }, []);
}

function useScrollHide() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY.current && y > 60);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return hidden;
}

/* ─── Nav items (sidebar desktop) ───────────────────────────────────── */

const NAV_GROUPS = [
  {
    label: "Principal",
    items: [
      { href: "/cerimonialista/dashboard",   label: "Início",      icon: "home" },
      { href: "/cerimonialista/casamentos",  label: "Casamentos",  icon: "rings" },
    ],
  },
  {
    label: "Gestão",
    items: [
      { href: "/cerimonialista/pipeline", label: "Pipeline / CRM", icon: "funnel" },
      { href: "/cerimonialista/agenda", label: "Agenda", icon: "calendar" },
      { href: "/cerimonialista/contratos", label: "Contratos", icon: "file-text" },
      { href: "/cerimonialista/equipe", label: "Equipe", icon: "users" },
      { href: "/cerimonialista/fornecedores", label: "Fornecedores", icon: "store" },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { href: "/cerimonialista/financeiro", label: "Financeiro", icon: "chart" },
      { href: "/cerimonialista/comissoes", label: "Comissões", icon: "dollar" },
    ],
  },
  {
    label: "Ferramentas",
    items: [
      { href: "/cerimonialista/questionarios",         label: "Questionários",       icon: "clipboard" },
      { href: "/cerimonialista/comparar-orcamentos",  label: "Comparar Orçamentos", icon: "compare" },
      { href: "/cerimonialista/importar-orcamento",   label: "Importar Orçamento",  icon: "upload" },
      { href: "/cerimonialista/portfolio",            label: "Portfólio Público",   icon: "camera" },
    ],
  },
  {
    label: "Comunidade",
    items: [
      { href: "/cerimonialista/comunidade", label: "Comunidade", icon: "community" },
    ],
  },
];

/* ─── Icon renderer ──────────────────────────────────────────────────── */

function NavIcon({ icon }: { icon: string }) {
  const props = {
    className: "w-[18px] h-[18px] shrink-0",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (icon) {
    case "home":    return <svg {...props}><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
    case "rings":   return <svg {...props}><circle cx="8" cy="12" r="5" /><circle cx="16" cy="12" r="5" /></svg>;
    case "funnel":  return <svg {...props}><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>;
    case "calendar":return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case "store":   return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
    case "dollar":  return <svg {...props}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
    case "camera":  return <svg {...props}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>;
    case "upload":  return <svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
    case "compare":   return <svg {...props}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
    case "clipboard": return <svg {...props}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" /></svg>;
    case "file-text": return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
    case "users":   return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "chart":   return <svg {...props}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>;
    case "community": return <svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
    default:        return null;
  }
}

/* ─── Layout ─────────────────────────────────────────────────────────── */

export default function CerimonialistaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const headerHidden = useScrollHide();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  usePwaManifest();

  const isActive = (href: string) =>
    pathname === href || (href !== "/cerimonialista/dashboard" && pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-ivory flex">

      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 bg-midnight text-white shrink-0 fixed top-0 left-0 bottom-0 z-30">

        {/* Logo */}
        <div className="px-6 pt-7 pb-5">
          <Link href="/cerimonialista/dashboard" className="block">
            <span className="font-display text-lg tracking-[0.3em] uppercase text-ivory">Laço</span>
            <p className="font-body text-[10px] text-ivory/35 mt-1 tracking-[0.2em] uppercase">Cerimonialista</p>
          </Link>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 font-display text-[9px] tracking-[0.25em] uppercase text-ivory/25">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm transition-all duration-150 ${
                        active
                          ? "bg-ivory/10 text-ivory font-medium"
                          : "text-ivory/45 hover:text-ivory/80 hover:bg-ivory/5"
                      }`}
                    >
                      <NavIcon icon={item.icon} />
                      <span>{item.label}</span>
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Notifications + User footer */}
        <div className="px-4 py-3 border-t border-ivory/8 flex items-center justify-between">
          <span className="font-body text-xs text-ivory/30">Notificações</span>
          <PlannerNotificationBell />
        </div>

        {/* User */}
        <div className="px-4 py-3 border-t border-ivory/8">
          <p className="font-body text-sm text-ivory/60 truncate">
            {session?.user?.name || session?.user?.email}
          </p>
        </div>
      </aside>

      {/* ── Mobile Header ───────────────────────────────────────────── */}
      <div
        className={`lg:hidden fixed top-0 left-0 right-0 z-40 bg-midnight text-ivory px-4 py-3 flex items-center justify-between transition-transform duration-200 ${
          headerHidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <Link href="/cerimonialista/dashboard" className="font-display text-base tracking-[0.3em] uppercase">
          Laço
        </Link>
        <div className="flex items-center gap-2">
          <PlannerNotificationBell />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-ivory/10 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile sidebar overlay ──────────────────────────────────── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-midnight/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-midnight text-ivory p-4 space-y-1 overflow-y-auto">
            <div className="mb-6 pb-4 border-b border-ivory/10">
              <p className="font-display text-lg tracking-[0.3em] uppercase">Laço</p>
              <p className="font-body text-[10px] text-ivory/35 mt-1 tracking-[0.2em] uppercase">Cerimonialista</p>
            </div>
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="mb-4">
                <p className="px-3 mb-1.5 font-display text-[9px] tracking-[0.25em] uppercase text-ivory/25">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm transition-all ${
                        active
                          ? "bg-ivory/10 text-ivory font-medium"
                          : "text-ivory/45 hover:text-ivory/80 hover:bg-ivory/5"
                      }`}
                    >
                      <NavIcon icon={item.icon} />
                      {item.label}
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </aside>
        </div>
      )}

      {/* ── Main content ────────────────────────────────────────────── */}
      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 overflow-auto min-h-screen">
        {children}
      </main>

      {/* ── Mobile Bottom Nav ───────────────────────────────────────── */}
      <div className="lg:hidden">
        <PlannerBottomNav />
      </div>
    </div>
  );
}
