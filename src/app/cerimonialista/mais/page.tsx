"use client";

import Link from "next/link";
import { Camera, MessageSquare } from "lucide-react";
import { PlannerNotificationBell } from "@/components/planner-notifications";

const GOLD    = "#A98950";
const BROWN   = "#3D322A";
const CREME   = "#FAF6EF";
const BG_DARK = "#F0E8DA";

const ITEMS = [
  {
    href: "/cerimonialista/portfolio",
    label: "Portfólio Público",
    desc: "Gerencie seu portfólio",
    Icon: Camera,
  },
  {
    href: "/cerimonialista/comunidade",
    label: "Comunidade",
    desc: "Fórum de cerimonialistas",
    Icon: MessageSquare,
  },
];

export default function MaisHub() {
  return (
    <div className="min-h-screen pb-24 px-4 pt-8" style={{ background: CREME }}>
      {/* Header */}
      <div className="mb-8">
        <p
          className="text-xs tracking-[0.25em] uppercase mb-1"
          style={{ color: `rgba(61,50,42,0.40)`, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}
        >
          Cerimonialista
        </p>
        <h1
          className="text-3xl"
          style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontStyle: "italic" }}
        >
          Mais
        </h1>
      </div>

      {/* Notificações */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-2xl mb-6"
        style={{ background: BG_DARK, border: `1px solid rgba(169,137,80,0.18)` }}
      >
        <span className="text-sm font-medium" style={{ color: BROWN }}>
          Notificações
        </span>
        <PlannerNotificationBell />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {ITEMS.map(({ href, label, desc, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-3 p-4 rounded-2xl transition-all active:scale-95"
            style={{
              background: BG_DARK,
              border: `1px solid rgba(169,137,80,0.18)`,
            }}
          >
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `rgba(169,137,80,0.12)` }}
            >
              <Icon size={18} style={{ color: GOLD }} strokeWidth={1.6} />
            </span>
            <span>
              <span
                className="block text-sm font-medium leading-snug"
                style={{ color: BROWN }}
              >
                {label}
              </span>
              <span
                className="block text-xs mt-0.5 leading-snug"
                style={{ color: `rgba(61,50,42,0.45)` }}
              >
                {desc}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
