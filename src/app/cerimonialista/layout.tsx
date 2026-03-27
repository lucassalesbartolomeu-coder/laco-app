"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/cerimonialista/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/cerimonialista/pipeline", label: "CRM / Pipeline", icon: "funnel" },
  { href: "/cerimonialista/agenda", label: "Agenda", icon: "calendar" },
  { href: "/cerimonialista/fornecedores", label: "Fornecedores", icon: "store" },
  { href: "/cerimonialista/financeiro", label: "Financeiro", icon: "dollar" },
  { href: "/cerimonialista/portfolio", label: "Portfolio", icon: "camera" },
];

function NavIcon({ icon, className = "w-5 h-5" }: { icon: string; className?: string }) {
  const props = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (icon) {
    case "grid": return <svg {...props}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
    case "funnel": return <svg {...props}><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>;
    case "calendar": return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case "store": return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
    case "dollar": return <svg {...props}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
    case "camera": return <svg {...props}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>;
    default: return null;
  }
}

export default function CerimonialistaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-off-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-verde-noite text-white shrink-0">
        <div className="p-6 border-b border-white/10">
          <Link href="/cerimonialista/dashboard" className="font-heading text-2xl">
            Laco
          </Link>
          <p className="font-body text-xs text-white/50 mt-1">Painel Cerimonialista</p>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-all ${
                  active
                    ? "bg-white/15 text-white font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <NavIcon icon={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <p className="font-body text-sm text-white/70 truncate">
            {session?.user?.name || session?.user?.email}
          </p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-verde-noite text-white px-4 py-3 flex items-center justify-between">
        <Link href="/cerimonialista/dashboard" className="font-heading text-xl">
          Laco
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-white/10 transition"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-verde-noite text-white p-4 space-y-1">
            <div className="mb-6 pb-4 border-b border-white/10">
              <p className="font-heading text-xl">Laco</p>
            </div>
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-all ${
                    active
                      ? "bg-white/15 text-white font-medium"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <NavIcon icon={item.icon} />
                  {item.label}
                </Link>
              );
            })}
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:pt-0 pt-14 overflow-auto">
        {children}
      </main>
    </div>
  );
}
