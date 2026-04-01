"use client";
// ─── AppBottomNav ─────────────────────────────────────────────────────────────
// Bottom nav compartilhado por todas as abas — mesma estética da Aba Design.

type TabKey = "inicio" | "planejar" | "design" | "organizar" | "mais";

interface AppBottomNavProps {
  active: TabKey;
  accent?: string;
  weddingId?: string;
}

const TABS: { key: TabKey; label: string; icon: string; href: (id?: string) => string }[] = [
  { key: "inicio",    label: "Início",    icon: "🏠", href: () => "/dashboard" },
  { key: "planejar",  label: "Planejar",  icon: "📋", href: (id) => id ? `/casamento/${id}/planejar`  : "#" },
  { key: "design",    label: "Design",    icon: "🎨", href: (id) => id ? `/casamento/${id}/meu-site`  : "#" },
  { key: "organizar", label: "Organizar", icon: "⚡", href: (id) => id ? `/casamento/${id}/execucao`  : "#" },
  { key: "mais",      label: "Mais",      icon: "···", href: (id) => id ? `/casamento/${id}/mais`     : "/perfil" },
];

export function AppBottomNav({
  active,
  accent = "#A98950",
  weddingId,
}: AppBottomNavProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-around border-t border-black/5 bg-white pb-6 pt-2">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <a
            key={tab.key}
            href={tab.href(weddingId)}
            className="flex flex-col items-center gap-0.5 transition-opacity"
            style={{ opacity: isActive ? 1 : 0.32, textDecoration: "none" }}
          >
            <span className="text-[19px] leading-none">{tab.icon}</span>
            <span
              className="text-[8.5px] font-light tracking-[0.13em] uppercase"
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                color: isActive ? accent : "#3D322A",
              }}
            >
              {tab.label}
            </span>
          </a>
        );
      })}
    </div>
  );
}
