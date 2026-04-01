"use client";
// ─── Mais ─────────────────────────────────────────────────────────────────────
// Aba de configurações, serviços e conta — mesmo phone-shell.
// Visual: avatar + nome do casal, seções agrupadas, logout no rodapé.

import { motion } from "framer-motion";
import { PhoneShell } from "./PhoneShell";
import { AppHeader } from "./AppHeader";
import { AppBottomNav } from "./AppBottomNav";

const ACCENT = "#8B7BA5"; // Lavanda Romântico — identidade da aba Mais

// ── Profile header ────────────────────────────────────────────────────────────
function ProfileCard({
  name1, name2, plan,
}: { name1: string; name2: string; plan: string }) {
  return (
    <div
      className="mx-5 mb-4 mt-4 flex items-center gap-4 rounded-2xl border p-4"
      style={{ borderColor: `${ACCENT}25`, background: `${ACCENT}08` }}
    >
      {/* Avatar monogram */}
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[20px] font-light"
        style={{
          background: `linear-gradient(135deg, ${ACCENT}30, ${ACCENT}60)`,
          fontFamily: "'Cormorant Garamond', serif",
          color: ACCENT,
          border: `1.5px solid ${ACCENT}40`,
        }}
      >
        {name1[0]}{name2[0]}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="text-[16px] font-light italic leading-tight"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "#3D322A" }}
        >
          {name1} &amp; {name2}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <span
            className="rounded-full px-2 py-0.5 text-[8px] font-light tracking-[0.12em] uppercase"
            style={{ background: `${ACCENT}18`, color: ACCENT, fontFamily: "'Josefin Sans', sans-serif" }}
          >
            {plan}
          </span>
        </div>
      </div>

      <button
        className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5"
        style={{ color: ACCENT }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
    </div>
  );
}

// ── Menu item ────────────────────────────────────────────────────────────────
interface MenuItem {
  icon: string;
  label: string;
  desc?: string;
  href: string;
  badge?: string;
  locked?: boolean;
  danger?: boolean;
}

function MenuGroup({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <div className="mb-5">
      <p
        className="mb-2 px-5 text-[9.5px] font-light tracking-[0.28em] uppercase"
        style={{ fontFamily: "'Josefin Sans', sans-serif", color: "rgba(61,50,42,0.38)" }}
      >
        {title}
      </p>
      <div
        className="mx-5 overflow-hidden rounded-2xl border bg-white"
        style={{ borderColor: "rgba(0,0,0,0.06)" }}
      >
        {items.map((item, idx) => (
          <motion.a
            key={item.label}
            href={item.href}
            whileTap={{ scale: 0.99 }}
            className="flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-black/[0.02]"
            style={{
              textDecoration: "none",
              borderTop: idx > 0 ? "1px solid rgba(0,0,0,0.05)" : "none",
            }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-base"
              style={{
                background: item.danger ? "rgba(220,38,38,0.08)" : `${ACCENT}12`,
              }}
            >
              {item.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-[12px] font-light tracking-[0.02em]"
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  color: item.danger ? "#dc2626" : "#3D322A",
                }}
              >
                {item.label}
              </p>
              {item.desc && (
                <p className="text-[10.5px]" style={{ color: "rgba(61,50,42,0.42)" }}>
                  {item.desc}
                </p>
              )}
            </div>

            {item.locked && (
              <span style={{ color: "rgba(61,50,42,0.25)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
            )}

            {item.badge && !item.locked && (
              <span
                className="rounded-full px-2 py-0.5 text-[8px] font-light tracking-[0.1em] uppercase"
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  background: `${ACCENT}18`,
                  color: ACCENT,
                }}
              >
                {item.badge}
              </span>
            )}

            {!item.locked && !item.badge && !item.danger && (
              <span style={{ color: ACCENT, fontSize: 18, opacity: 0.4 }}>›</span>
            )}
          </motion.a>
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
interface MaisClientProps {
  weddingId?: string;
  partnerName1?: string;
  partnerName2?: string;
  plan?: string;
}

export default function MaisClient({
  weddingId = "demo",
  partnerName1 = "Antônia",
  partnerName2 = "Bruno",
  plan = "Premium",
}: MaisClientProps) {
  const base = `/casamento/${weddingId}`;

  const groups = [
    {
      title: "Cerimonialista",
      items: [
        { icon: "👩‍💼", label: "Conectar Cerimonialista", desc: "Vincule seu(a) assessor(a)", href: `${base}/cerimonialista` },
        { icon: "📋", label: "Questionários",            desc: "Responda preferências da assessoria", href: `${base}/questionarios` },
        { icon: "💬", label: "WhatsApp Confirmação",     desc: "Confirmação 100% dos convidados", href: `${base}/whatsapp-confirmacao` },
      ],
    },
    {
      title: "Minha Conta",
      items: [
        { icon: "👤", label: "Perfil",           desc: "Nome, e-mail e foto", href: "/perfil" },
        { icon: "🔔", label: "Notificações",     desc: "Alertas e lembretes", href: "#", badge: "3" },
        { icon: "💳", label: "Meu Plano",        desc: `${plan} — gerenciar assinatura`, href: "/planos" },
        { icon: "🔐", label: "Segurança",        desc: "Senha e autenticação",  href: "#" },
      ],
    },
    {
      title: "Suporte",
      items: [
        { icon: "❓", label: "Central de Ajuda", desc: "Tutoriais e perguntas frequentes", href: "#" },
        { icon: "💬", label: "Fale Conosco",     desc: "Chat com a equipe Laço", href: "#" },
        { icon: "⭐", label: "Avaliar o App",    desc: "Deixe sua opinião", href: "#" },
      ],
    },
    {
      title: "Conta",
      items: [
        { icon: "🚪", label: "Sair", href: "/api/auth/signout", danger: true },
      ],
    },
  ];

  return (
    <PhoneShell>
      <AppHeader title="Mais" accent={ACCENT} />

      <div className="overflow-y-auto" style={{ maxHeight: "calc(844px - 44px - 80px)" }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="pb-6"
        >
          {/* Profile */}
          <ProfileCard name1={partnerName1} name2={partnerName2} plan={plan} />

          {/* Menu groups */}
          {groups.map((g) => (
            <MenuGroup key={g.title} title={g.title} items={g.items} />
          ))}

          {/* Version footer */}
          <p
            className="mt-2 text-center text-[9px]"
            style={{ color: "rgba(61,50,42,0.25)", fontFamily: "'Josefin Sans', sans-serif" }}
          >
            Laço v2.0 · feito com amor 💛
          </p>
        </motion.div>
      </div>

      <AppBottomNav active="mais" accent={ACCENT} weddingId={weddingId} />
    </PhoneShell>
  );
}
