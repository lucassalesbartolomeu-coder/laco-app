"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import BottomNav from "@/components/bottom-nav";

// ── Design tokens ──────────────────────────────────────────────────
const GOLD   = "#A98950";
const BROWN  = "#3D322A";
const CREME  = "#FAF6EF";
const CREME2 = "#F0E8DA";
const BORDER = "rgba(169,137,80,0.18)";
const BORDER_LIGHT = "rgba(169,137,80,0.10)";
const TEXT_SEC  = "rgba(61,50,42,0.60)";
const TEXT_MUTE = "rgba(61,50,42,0.38)";

// ── Types ──────────────────────────────────────────────────────────
type Screen = "s0" | "s1-estilo" | "s2-foto" | "s3-site" | "s4-pap" | "s-prev-site" | "s-prev-std";
type PhotoOpt = "foto" | "ia" | "nenhuma";

interface Toolkit {
  id: string;
  name: string;
  mood: string;
  accent: string;
  bg: string;
  dark?: boolean;
  swatches: string[];
  monogram: React.ReactNode;
}

interface Wedding {
  partnerName1: string;
  partnerName2: string;
  weddingDate: string | null;
  venue: string | null;
  city: string | null;
  state: string | null;
}

// ── Brasão SVG ─────────────────────────────────────────────────────
function Brasao({ n1, n2, accent, size = 100 }: { n1: string; n2: string; accent: string; size?: number }) {
  const uid = `brasao-${size}-${accent.replace("#", "")}`;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <circle cx="100" cy="100" r="90" fill="none" stroke={accent} strokeWidth="1" />
      <circle cx="100" cy="100" r="60" fill="none" stroke={accent} strokeWidth="0.6" />
      <line x1="38" y1="100" x2="162" y2="100" stroke={accent} strokeWidth="0.5" />
      <defs>
        <path id={`${uid}-t`} d="M 26,100 a 74,74 0 0,1 148,0" />
        <path id={`${uid}-b`} d="M 174,100 a 74,74 0 0,1 -148,0" />
      </defs>
      <text fill={accent} style={{ fontFamily: "'Josefin Sans',sans-serif", fontSize: "12px", letterSpacing: "0.28em", fontWeight: 300 }}>
        <textPath href={`#${uid}-t`} textAnchor="middle" startOffset="50%">{n1.toUpperCase()} E</textPath>
      </text>
      <text fill={accent} style={{ fontFamily: "'Josefin Sans',sans-serif", fontSize: "12px", letterSpacing: "0.28em", fontWeight: 300 }}>
        <textPath href={`#${uid}-b`} textAnchor="middle" startOffset="50%">{n2.toUpperCase()}</textPath>
      </text>
    </svg>
  );
}

// ── Toolkits ───────────────────────────────────────────────────────
const TOOLKITS: Toolkit[] = [
  {
    id: "classico", name: "Dourado Clássico", mood: "Elegante · Atemporal",
    accent: "#A98950", bg: "#FAF6EF",
    swatches: ["#A98950", "#F0E8DA", "#3D322A", "#C4A76C"],
    monogram: (
      <svg viewBox="0 0 200 200" width="44" height="44">
        <circle cx="100" cy="100" r="88" fill="none" stroke="#A98950" strokeWidth="1.2" />
        <circle cx="100" cy="100" r="58" fill="none" stroke="#A98950" strokeWidth="0.7" />
        <line x1="40" y1="100" x2="160" y2="100" stroke="#A98950" strokeWidth="0.6" />
        <text x="100" y="107" textAnchor="middle" fill="#A98950" style={{ fontFamily: "'Josefin Sans',sans-serif", fontSize: "22px", fontWeight: 300 }}>N+N</text>
      </svg>
    ),
  },
  {
    id: "botanico", name: "Verde Botânico", mood: "Natural · Jardim",
    accent: "#6B7C5E", bg: "#F5F2EC",
    swatches: ["#6B7C5E", "#E8E3D9", "#443E34", "#8FA67A"],
    monogram: (
      <svg viewBox="0 0 200 200" width="44" height="44">
        <circle cx="100" cy="100" r="88" fill="none" stroke="#6B7C5E" strokeWidth="0.5" strokeDasharray="5,9" />
        <circle cx="100" cy="100" r="68" fill="none" stroke="#6B7C5E" strokeWidth="0.8" />
        <text x="100" y="96" textAnchor="middle" fill="#6B7C5E" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "26px", fontWeight: 300 }}>N</text>
        <text x="100" y="112" textAnchor="middle" fill="#6B7C5E" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "10px" }}>&amp;</text>
        <text x="100" y="132" textAnchor="middle" fill="#6B7C5E" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "26px", fontWeight: 300 }}>N</text>
      </svg>
    ),
  },
  {
    id: "terracota", name: "Terracota Poético", mood: "Caloroso · Poesia",
    accent: "#B5704F", bg: "#FDF8F4",
    swatches: ["#B5704F", "#F0E4D8", "#5A3C28", "#D4956E"],
    monogram: (
      <svg viewBox="0 0 200 200" width="44" height="44">
        <circle cx="100" cy="100" r="88" fill="none" stroke="#B5704F" strokeWidth="0.7" />
        <text x="100" y="109" textAnchor="middle" fill="#B5704F" style={{ fontFamily: "'Playfair Display',serif", fontSize: "30px", fontWeight: 400, fontStyle: "italic" }}>NM</text>
      </svg>
    ),
  },
  {
    id: "midnight", name: "Midnight Moderno", mood: "Sofisticado · Noite",
    accent: "#C2A97E", bg: "#1C1A17", dark: true,
    swatches: ["#C2A97E", "#2A2722", "#E8DCC8", "#8B7D64"],
    monogram: (
      <svg viewBox="0 0 200 200" width="44" height="44">
        <circle cx="100" cy="100" r="88" fill="none" stroke="#C2A97E" strokeWidth="0.9" />
        <circle cx="100" cy="100" r="58" fill="none" stroke="#C2A97E" strokeWidth="0.5" />
        <line x1="38" y1="100" x2="162" y2="100" stroke="#C2A97E" strokeWidth="0.4" />
        <text x="100" y="107" textAnchor="middle" fill="#C2A97E" style={{ fontFamily: "'Josefin Sans',sans-serif", fontSize: "20px", fontWeight: 300 }}>N+N</text>
      </svg>
    ),
  },
  {
    id: "lavanda", name: "Lavanda Romântico", mood: "Delicado · Romance",
    accent: "#8B7BA5", bg: "#FAF8FC",
    swatches: ["#8B7BA5", "#EDE8F2", "#4A3D5C", "#B8A9CC"],
    monogram: (
      <svg viewBox="0 0 200 200" width="44" height="44">
        <circle cx="100" cy="100" r="88" fill="none" stroke="#8B7BA5" strokeWidth="0.6" />
        <text x="100" y="109" textAnchor="middle" fill="#8B7BA5" style={{ fontFamily: "'EB Garamond',serif", fontSize: "28px", fontWeight: 400, fontStyle: "italic" }}>N T</text>
      </svg>
    ),
  },
];

// ── Shared components ──────────────────────────────────────────────
function Hdr({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div className="flex items-center gap-2 px-5 py-[10px] sticky top-0 z-10"
      style={{ background: CREME, borderBottom: `1px solid ${BORDER_LIGHT}` }}>
      <div className="w-[30px] flex-shrink-0">
        {onBack && (
          <button onClick={onBack}
            style={{ color: GOLD, fontSize: 22, lineHeight: 1, background: "none", border: "none", cursor: "pointer" }}>‹</button>
        )}
      </div>
      <p className="flex-1 text-center"
        style={{ fontFamily: "'Josefin Sans',sans-serif", fontWeight: 300, fontSize: 12, letterSpacing: "0.28em", textTransform: "uppercase", color: BROWN }}>
        {title}
      </p>
      <div className="w-[30px] flex-shrink-0" />
    </div>
  );
}

const WIZARD_ORDER: Screen[] = ["s1-estilo", "s2-foto", "s3-site", "s4-pap"];
const WIZARD_LABELS = ["Estilo", "Foto", "Site", "Papelaria"];

function WizardTabs({ active, onGo }: { active: Screen; onGo: (s: Screen) => void }) {
  const activeIdx = WIZARD_ORDER.indexOf(active);
  return (
    <div className="flex" style={{ padding: "14px 20px 0" }}>
      {WIZARD_ORDER.map((id, i) => {
        const isActive = id === active;
        const isDone   = i < activeIdx;
        return (
          <div key={id} className="flex-1 text-center pb-[10px] relative cursor-pointer"
            onClick={() => onGo(id)}>
            <span style={{
              fontFamily: "'Josefin Sans',sans-serif", fontSize: "8.5px", fontWeight: 300,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: isActive ? GOLD : isDone ? "rgba(169,137,80,0.55)" : TEXT_MUTE,
              whiteSpace: "nowrap",
            }}>
              {WIZARD_LABELS[i]}
            </span>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-[2px]"
              style={{ background: isActive ? GOLD : isDone ? "rgba(169,137,80,0.35)" : BORDER_LIGHT }} />
          </div>
        );
      })}
    </div>
  );
}

function SecHdr({ label, title, desc }: { label: string; title: string; desc: string }) {
  return (
    <>
      <p style={{ fontFamily: "'Josefin Sans',sans-serif", fontWeight: 300, fontSize: "9.5px", letterSpacing: "0.3em", textTransform: "uppercase", color: TEXT_MUTE, padding: "20px 20px 6px" }}>{label}</p>
      <p style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "26px", color: BROWN, padding: "0 20px 4px", lineHeight: 1.2 }}>{title}</p>
      <p style={{ fontSize: "12.5px", color: TEXT_SEC, padding: "0 20px 18px", lineHeight: 1.6 }}>{desc}</p>
    </>
  );
}

function Btn({ label, ghost, onClick }: { label: string; ghost?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: "block", width: "calc(100% - 40px)", margin: "16px 20px 0",
      padding: "13px", border: ghost ? `1.5px solid rgba(169,137,80,0.4)` : "none",
      borderRadius: "12px", background: ghost ? "transparent" : GOLD, color: ghost ? GOLD : "white",
      fontFamily: "'Josefin Sans',sans-serif", fontWeight: 300, fontSize: "11.5px",
      letterSpacing: "0.22em", textTransform: "uppercase", cursor: "pointer", textAlign: "center",
    }}>
      {label}
    </button>
  );
}

function Badge({ type }: { type: "ok" | "edit" | "config" }) {
  const styles = {
    ok:     { background: "rgba(107,124,94,0.12)", color: "#6B7C5E", label: "Pronto" },
    edit:   { background: "rgba(169,137,80,0.12)", color: GOLD,      label: "Editar" },
    config: { background: "rgba(169,137,80,0.12)", color: GOLD,      label: "Configurar" },
  };
  const s = styles[type];
  return (
    <span className="px-2 py-[3px] rounded-[6px] text-[8.5px] tracking-[0.08em] uppercase"
      style={{ background: s.background, color: s.color, fontFamily: "'Josefin Sans',sans-serif" }}>
      {s.label}
    </span>
  );
}

function OutCardInfo({ name, badge }: { name: string; badge: "ok" | "edit" | "config" }) {
  return (
    <div className="flex items-center justify-between px-[14px] py-[10px]"
      style={{ borderTop: `1px solid ${BORDER_LIGHT}` }}>
      <span style={{ fontFamily: "'Josefin Sans',sans-serif", fontWeight: 300, fontSize: "10.5px", letterSpacing: "0.15em", textTransform: "uppercase", color: BROWN }}>{name}</span>
      <Badge type={badge} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════
export default function MeuSitePage() {
  const params = useParams();
  const weddingId = params?.id as string;
  const { data: session, status } = useSession();

  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [screen, setScreen]   = useState<Screen>("s0");
  const [toolkit, setToolkit] = useState("classico");
  const [photoOpt, setPhotoOpt] = useState<PhotoOpt>("foto");

  useEffect(() => {
    if (status !== "authenticated" || !weddingId) return;
    fetch(`/api/weddings/${weddingId}`)
      .then(r => r.json())
      .then(d => setWedding(d))
      .catch(() => {});
  }, [status, weddingId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREME }}>
        <div className="w-7 h-7 border-[1.5px] border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${GOLD} transparent ${GOLD} ${GOLD}` }} />
      </div>
    );
  }
  if (!session) return null;

  const n1 = wedding?.partnerName1 ?? "Noiva";
  const n2 = wedding?.partnerName2 ?? "Noivo";
  const dateStr = wedding?.weddingDate
    ? new Date(wedding.weddingDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : null;
  const venue = [wedding?.venue, wedding?.city, wedding?.state].filter(Boolean).join(", ");
  const tk = TOOLKITS.find(t => t.id === toolkit) ?? TOOLKITS[0];
  const goTo = (s: Screen) => setScreen(s);

  // ─── S0: Entry ───────────────────────────────────────────────────
  if (screen === "s0") return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>
      <Hdr title="Meu Design" />
      <div className="overflow-y-auto">
        <div className="px-6 py-8 text-center">
          <div className="mx-auto mb-5 inline-block">
            <Brasao n1={n1} n2={n2} accent={tk.accent} size={100} />
          </div>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: "italic", fontSize: "28px", color: BROWN, marginBottom: 4 }}>
            {n1} <span style={{ color: GOLD, fontSize: 22 }}>&</span> {n2}
          </p>
          <p style={{ fontFamily: "'Josefin Sans',sans-serif", fontWeight: 300, fontSize: "9px", letterSpacing: "0.3em", color: TEXT_MUTE, textTransform: "uppercase" }}>
            Toolkit ativo: {tk.name}
          </p>
        </div>

        {([
          { icon: "🎨", title: "Identidade Visual", desc: "Estilo, foto e brasão do seu casamento", onClick: () => goTo("s1-estilo") },
          { icon: "🌐", title: "Site do Casamento",  desc: "Home, Concierge, Presentes & RSVP",      onClick: () => goTo("s3-site") },
          { icon: "✉️", title: "Papelaria",          desc: "Convite, Save the Date, Cardápio, Drinks", onClick: () => goTo("s4-pap") },
        ]).map(c => (
          <button key={c.title} onClick={c.onClick}
            className="flex items-center gap-[14px] text-left transition-all active:scale-[0.98]"
            style={{ display: "flex", width: "calc(100% - 40px)", margin: "0 20px 12px", padding: "20px", borderRadius: "16px", background: "white", border: `1.5px solid ${BORDER}`, cursor: "pointer" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: CREME2 }}>{c.icon}</div>
            <div className="flex-1 min-w-0 text-left">
              <p style={{ fontFamily: "'Josefin Sans',sans-serif", fontWeight: 400, fontSize: "12px", letterSpacing: "0.04em", color: BROWN, marginBottom: 2 }}>{c.title}</p>
              <p style={{ fontSize: "11px", color: TEXT_MUTE, lineHeight: 1.4 }}>{c.desc}</p>
            </div>
            <span style={{ color: GOLD, fontSize: 18, flexShrink: 0 }}>›</span>
          </button>
        ))}

        <Btn label="Criar / Editar Design" onClick={() => goTo("s1-estilo")} />
        <div className="h-6" />
      </div>
      <BottomNav weddingId={weddingId} />
    </div>
  );

  // ─── S1: Estilo ───────────────────────────────────────────────────
  if (screen === "s1-estilo") return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>
      <Hdr title="Meu Design" onBack={() => goTo("s0")} />
      <WizardTabs active={screen} onGo={goTo} />
      <div className="overflow-y-auto">
        <SecHdr label="Toolkit de identidade visual" title="Escolha seu estilo" desc="Define cores, fontes e brasão — aplicados no site e na papelaria." />
        <div className="grid grid-cols-2 gap-[10px] px-5 pb-1">
          {TOOLKITS.map(t => {
            const sel = toolkit === t.id;
            return (
              <div key={t.id} onClick={() => setToolkit(t.id)}
                className="rounded-[14px] p-4 text-center cursor-pointer relative overflow-hidden transition-all"
                style={{ background: t.bg, border: `2px solid ${sel ? GOLD : "transparent"}`, boxShadow: sel ? "0 4px 16px rgba(169,137,80,0.12)" : undefined, transform: sel ? "translateY(-1px)" : undefined }}>
                {sel && (
                  <div className="absolute top-[7px] right-[9px] w-[18px] h-[18px] rounded-full flex items-center justify-center text-white text-[10px]"
                    style={{ background: GOLD }}>✓</div>
                )}
                <div className="flex gap-[3px] mb-[10px] h-[6px]">
                  {t.swatches.map(s => <span key={s} className="flex-1 rounded-[3px]" style={{ background: s }} />)}
                </div>
                <div className="w-11 h-11 mx-auto mb-2 flex items-center justify-center">{t.monogram}</div>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 400, fontSize: "14px", color: t.dark ? "#E8DCC8" : BROWN, marginBottom: 1 }}>{t.name}</p>
                <p style={{ fontSize: "9px", letterSpacing: "0.12em", color: t.dark ? "rgba(232,220,200,0.45)" : TEXT_MUTE, textTransform: "uppercase" }}>{t.mood}</p>
              </div>
            );
          })}
          <div className="rounded-[14px] p-4 flex flex-col items-center justify-center cursor-pointer min-h-[150px]"
            style={{ background: "white", border: `1.5px dashed ${BORDER}` }}>
            <span style={{ fontSize: 26, color: GOLD, marginBottom: 4 }}>+</span>
            <p style={{ fontSize: "9px", letterSpacing: "0.12em", color: TEXT_MUTE, textTransform: "uppercase" }}>Criar Novo</p>
          </div>
        </div>
        <Btn label="Continuar →" onClick={() => goTo("s2-foto")} />
        <div className="h-6" />
      </div>
      <BottomNav weddingId={weddingId} />
    </div>
  );

  // ─── S2: Foto ─────────────────────────────────────────────────────
  if (screen === "s2-foto") return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>
      <Hdr title="Meu Design" onBack={() => goTo("s1-estilo")} />
      <WizardTabs active={screen} onGo={goTo} />
      <div className="overflow-y-auto">
        <SecHdr label="Imagem do casamento" title="Adicionar foto" desc="A imagem será usada no site, convite e papelaria. Escolha uma das opções abaixo." />
        <div className="flex flex-col gap-[10px] px-5">
          {([
            { id: "foto",    icon: "📸", title: "Adicionar foto",                   desc: "Envie uma foto do casal ou de vocês dois" },
            { id: "ia",      icon: "🏛️", title: "Adicionar foto para gerar com IA", desc: "Envie uma foto do local — a IA cria uma ilustração em aquarela ou line art (SVG sem fundo)" },
            { id: "nenhuma", icon: "⊘",  title: "Não adicionar",                    desc: "Usar apenas brasão e elementos do toolkit selecionado" },
          ] as { id: PhotoOpt; icon: string; title: string; desc: string }[]).map(o => {
            const sel = photoOpt === o.id;
            return (
              <div key={o.id}>
                <div onClick={() => setPhotoOpt(o.id)}
                  className="flex items-start gap-[14px] p-4 rounded-[14px] cursor-pointer transition-all"
                  style={{ background: sel ? "rgba(169,137,80,0.03)" : "white", border: `1.5px solid ${sel ? GOLD : BORDER}` }}>
                  <div className="w-[42px] h-[42px] rounded-[11px] flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: CREME2 }}>{o.icon}</div>
                  <div>
                    <p style={{ fontFamily: "'Josefin Sans',sans-serif", fontWeight: 400, fontSize: "12.5px", color: BROWN, letterSpacing: "0.04em", marginBottom: 2 }}>{o.title}</p>
                    <p style={{ fontSize: "11px", color: TEXT_MUTE, lineHeight: 1.4 }}>{o.desc}</p>
                  </div>
                </div>
                {sel && o.id !== "nenhuma" && (
                  <div className="mt-[14px] rounded-[14px] p-6 text-center cursor-pointer"
                    style={{ border: `1.5px dashed ${BORDER}` }}>
                    <div style={{ fontSize: 28, color: GOLD, marginBottom: 6 }}>↑</div>
                    <p style={{ fontSize: "11.5px", color: TEXT_SEC, lineHeight: 1.5 }}>
                      Toque para enviar<br />
                      <span style={{ color: TEXT_MUTE, fontSize: "10px" }}>
                        {o.id === "foto" ? "JPG, PNG ou HEIC · até 10MB" : "Foto do local do casamento"}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <Btn label="Continuar →" onClick={() => goTo("s3-site")} />
        <Btn label="← Voltar" ghost onClick={() => goTo("s1-estilo")} />
        <div className="h-6" />
      </div>
      <BottomNav weddingId={weddingId} />
    </div>
  );

  // ─── S3: Site ─────────────────────────────────────────────────────
  if (screen === "s3-site") return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>
      <Hdr title="Meu Design" onBack={() => goTo("s2-foto")} />
      <WizardTabs active={screen} onGo={goTo} />
      <div className="overflow-y-auto">
        <SecHdr label="Site do casamento" title="Páginas geradas" desc="Toque em qualquer página para visualizar e ajustar." />
        <div className="flex flex-col gap-[10px] px-5">

          {/* Home + Brasão */}
          <div onClick={() => goTo("s-prev-site")} className="rounded-[14px] overflow-hidden cursor-pointer transition-all"
            style={{ background: "white", border: `1.5px solid ${BORDER}` }}>
            <div className="h-[110px] flex items-center justify-center" style={{ background: CREME }}>
              <div className="flex items-center gap-[14px]">
                <span style={{ fontFamily: "'Josefin Sans',sans-serif", fontWeight: 300, fontSize: 42, color: GOLD, lineHeight: 1 }}>{n1[0]}</span>
                <Brasao n1={n1} n2={n2} accent={tk.accent} size={52} />
                <span style={{ fontFamily: "'Josefin Sans',sans-serif", fontWeight: 300, fontSize: 42, color: GOLD, lineHeight: 1 }}>{n2[0]}</span>
              </div>
            </div>
            <OutCardInfo name="Home + Brasão" badge="ok" />
          </div>

          {/* Concierge */}
          <div className="rounded-[14px] overflow-hidden" style={{ background: "white", border: `1.5px solid ${BORDER}` }}>
            <div className="h-[110px] flex items-center justify-center" style={{ background: CREME2 }}>
              <div className="text-center">
                <p style={{ fontFamily: "'Josefin Sans',sans-serif", fontWeight: 300, fontSize: "9px", letterSpacing: "0.25em", color: TEXT_MUTE, textTransform: "uppercase", marginBottom: 8 }}>Concierge</p>
                <div className="flex gap-[14px] justify-center text-[22px]">👗 💄 🚗 🏨</div>
                <p style={{ fontSize: "8px", color: TEXT_MUTE, marginTop: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>Traje · Maquiagem · Transporte</p>
              </div>
            </div>
            <OutCardInfo name="Concierge" badge="ok" />
          </div>

          {/* Presentes + RSVP */}
          <div className="rounded-[14px] overflow-hidden" style={{ background: "white", border: `1.5px solid ${BORDER}` }}>
            <div className="h-[110px] flex items-center justify-center" style={{ background: CREME }}>
              <div className="text-center">
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "17px", color: GOLD, marginBottom: 4 }}>Lista de Presentes</p>
                <div style={{ width: 20, height: 1, background: GOLD, margin: "5px auto" }} />
                <p style={{ fontSize: "9px", letterSpacing: "0.18em", color: TEXT_MUTE, textTransform: "uppercase" }}>+ Confirmação RSVP</p>
              </div>
            </div>
            <OutCardInfo name="Presentes + RSVP" badge="config" />
          </div>
        </div>

        <Btn label="Continuar → Papelaria" onClick={() => goTo("s4-pap")} />
        <Btn label="← Voltar" ghost onClick={() => goTo("s2-foto")} />
        <div className="h-6" />
      </div>
      <BottomNav weddingId={weddingId} />
    </div>
  );

  // ─── S4: Papelaria ────────────────────────────────────────────────
  if (screen === "s4-pap") return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>
      <Hdr title="Meu Design" onBack={() => goTo("s3-site")} />
      <WizardTabs active={screen} onGo={goTo} />
      <div className="overflow-y-auto">
        <SecHdr label="Papelaria" title="Peças geradas" desc="Toque para visualizar, editar e compartilhar cada peça." />
        <div className="flex flex-col gap-[10px] px-5">

          {/* Save the Date */}
          <div onClick={() => goTo("s-prev-std")} className="rounded-[14px] overflow-hidden cursor-pointer"
            style={{ background: "white", border: `1.5px solid ${BORDER}` }}>
            <div className="h-[110px] flex items-center justify-center" style={{ background: CREME }}>
              <div className="text-center">
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: "italic", fontSize: "19px", color: GOLD }}>Save the Date</p>
                <p style={{ fontFamily: "'Josefin Sans',sans-serif", fontWeight: 300, fontSize: "9px", letterSpacing: "0.3em", color: TEXT_MUTE, marginTop: 4 }}>
                  {dateStr ?? "00 . 00 . 0000"}
                </p>
              </div>
            </div>
            <OutCardInfo name="Save the Date" badge="ok" />
          </div>

          {/* Convite */}
          <div className="rounded-[14px] overflow-hidden" style={{ background: "white", border: `1.5px solid ${BORDER}` }}>
            <div className="h-[110px] flex items-center justify-center" style={{ background: CREME }}>
              <div className="text-center">
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: "italic", fontSize: "17px", color: BROWN }}>
                  {n1} <span style={{ color: GOLD }}>&</span> {n2}
                </p>
                <div style={{ width: 20, height: 1, background: GOLD, margin: "5px auto" }} />
                <p style={{ fontSize: "8px", letterSpacing: "0.18em", color: TEXT_MUTE, textTransform: "uppercase" }}>Convidam para a celebração</p>
              </div>
            </div>
            <OutCardInfo name="Convite" badge="ok" />
          </div>

          {/* Cardápio */}
          <div className="rounded-[14px] overflow-hidden" style={{ background: "white", border: `1.5px solid ${BORDER}` }}>
            <div className="h-[110px] flex items-center justify-center" style={{ background: CREME2 }}>
              <div className="text-center">
                <p style={{ fontFamily: "'Josefin Sans',sans-serif", fontWeight: 300, fontSize: "9px", letterSpacing: "0.28em", color: GOLD, textTransform: "uppercase" }}>Cardápio</p>
                <div style={{ width: 16, height: 1, background: GOLD, margin: "5px auto" }} />
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "11px", color: TEXT_SEC, lineHeight: 1.8 }}>Entrada · Prato Principal<br />Sobremesa</p>
              </div>
            </div>
            <OutCardInfo name="Cardápio" badge="edit" />
          </div>

          {/* Drinks */}
          <div className="rounded-[14px] overflow-hidden" style={{ background: "white", border: `1.5px solid ${BORDER}` }}>
            <div className="h-[110px] flex items-center justify-center" style={{ background: CREME }}>
              <div className="text-center">
                <p style={{ fontFamily: "'Josefin Sans',sans-serif", fontWeight: 300, fontSize: "9px", letterSpacing: "0.28em", color: GOLD, textTransform: "uppercase" }}>Drinks</p>
                <div style={{ width: 16, height: 1, background: GOLD, margin: "5px auto" }} />
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "11px", color: TEXT_SEC, lineHeight: 1.8 }}>Espumante · Gin Tônica<br />Aperol · Whisky</p>
              </div>
            </div>
            <OutCardInfo name="Drinks" badge="edit" />
          </div>
        </div>

        <Btn label="Publicar Tudo" onClick={() => {}} />
        <Btn label="← Voltar" ghost onClick={() => goTo("s3-site")} />
        <div className="h-6" />
      </div>
      <BottomNav weddingId={weddingId} />
    </div>
  );

  // ─── Preview Site ──────────────────────────────────────────────────
  if (screen === "s-prev-site") return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>
      <Hdr title="Preview do Site" onBack={() => goTo("s3-site")} />
      <div className="overflow-y-auto px-5 pt-4">
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
          <div className="flex justify-between items-center px-[14px] py-[9px]"
            style={{ borderBottom: `1px solid ${BORDER}`, background: "white" }}>
            <span style={{ fontFamily: "'Josefin Sans',sans-serif", fontWeight: 300, fontSize: "13px", letterSpacing: "0.25em", color: GOLD }}>{n1[0]} + {n2[0]}</span>
            <div className="flex gap-[10px]">
              {["Home", "Dress Code", "RSVP", "Presentes"].map(l => (
                <span key={l} style={{ fontSize: "7px", letterSpacing: "0.12em", color: TEXT_MUTE, textTransform: "uppercase" }}>{l}</span>
              ))}
            </div>
          </div>
          <div className="py-7 px-4 text-center" style={{ background: CREME }}>
            <div className="flex items-center justify-center gap-4">
              <span style={{ fontFamily: "'Josefin Sans',sans-serif", fontWeight: 300, fontSize: 60, color: GOLD, lineHeight: 1 }}>{n1[0]}</span>
              <Brasao n1={n1} n2={n2} accent={tk.accent} size={68} />
              <span style={{ fontFamily: "'Josefin Sans',sans-serif", fontWeight: 300, fontSize: 60, color: GOLD, lineHeight: 1 }}>{n2[0]}</span>
            </div>
            {dateStr && (
              <p style={{ marginTop: 14, fontFamily: "'Josefin Sans',sans-serif", fontWeight: 300, fontSize: "8.5px", letterSpacing: "0.3em", color: TEXT_MUTE, textTransform: "uppercase" }}>
                {dateStr}{venue ? ` · ${venue}` : ""}
              </p>
            )}
          </div>
          <div className="py-5 px-4 text-center" style={{ background: CREME2 }}>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "20px", color: GOLD, marginBottom: 6 }}>{n1} e {n2}</p>
            <div style={{ width: 20, height: 1, background: GOLD, margin: "6px auto" }} />
            {(dateStr || venue) && (
              <p style={{ fontSize: "9.5px", color: TEXT_SEC, letterSpacing: "0.12em", lineHeight: 2 }}>
                {dateStr && `📅 ${dateStr}`}
                {dateStr && venue && <br />}
                {venue && `📍 ${venue}`}
              </p>
            )}
            <div style={{ marginTop: 12, padding: "7px 18px", border: `1px solid ${GOLD}`, display: "inline-block", fontFamily: "'Josefin Sans',sans-serif", fontSize: "8px", letterSpacing: "0.25em", color: GOLD, textTransform: "uppercase" }}>
              Confirmar Presença
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button className="flex-1 py-[13px] rounded-xl text-[11.5px] tracking-[0.22em] uppercase text-white"
            style={{ background: GOLD, border: "none", fontFamily: "'Josefin Sans',sans-serif", fontWeight: 300, cursor: "pointer" }}>
            Editar
          </button>
          <button className="flex-1 py-[13px] rounded-xl text-[11.5px] tracking-[0.22em] uppercase"
            style={{ background: "transparent", border: `1.5px solid rgba(169,137,80,0.4)`, color: GOLD, fontFamily: "'Josefin Sans',sans-serif", fontWeight: 300, cursor: "pointer" }}>
            Publicar
          </button>
        </div>
        <Btn label="← Voltar" ghost onClick={() => goTo("s3-site")} />
        <div className="h-6" />
      </div>
      <BottomNav weddingId={weddingId} />
    </div>
  );

  // ─── Preview Save the Date ────────────────────────────────────────
  if (screen === "s-prev-std") return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>
      <Hdr title="Save the Date" onBack={() => goTo("s4-pap")} />
      <div className="overflow-y-auto px-5 pt-4">
        <div className="rounded-xl p-7 text-center relative" style={{ background: CREME, border: `1px solid rgba(169,137,80,0.2)` }}>
          <div className="absolute inset-[10px] rounded-[6px] pointer-events-none"
            style={{ border: "1px solid rgba(169,137,80,0.2)" }} />
          <div className="flex justify-center mb-[14px]">
            <Brasao n1={n1} n2={n2} accent={tk.accent} size={84} />
          </div>
          <p style={{ fontFamily: "'Josefin Sans',sans-serif", fontWeight: 300, fontSize: "9px", letterSpacing: "0.35em", color: TEXT_MUTE, textTransform: "uppercase", marginBottom: 14 }}>
            Save the Date
          </p>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: "italic", fontSize: "30px", color: BROWN, lineHeight: 1.2 }}>
            {n1} <span style={{ color: GOLD, fontSize: 22 }}>&</span> {n2}
          </p>
          <div style={{ width: 28, height: 1, background: GOLD, margin: "14px auto" }} />
          {dateStr && (
            <p style={{ fontFamily: "'Josefin Sans',sans-serif", fontWeight: 300, fontSize: "15px", letterSpacing: "0.15em", color: BROWN }}>
              {dateStr.replace(/\//g, " . ")}
            </p>
          )}
          {venue && (
            <p style={{ marginTop: 10, fontSize: "11px", color: TEXT_SEC, letterSpacing: "0.1em", lineHeight: 1.8 }}>{venue}</p>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button className="flex-1 py-[13px] rounded-xl text-[11.5px] tracking-[0.22em] uppercase text-white"
            style={{ background: GOLD, border: "none", fontFamily: "'Josefin Sans',sans-serif", fontWeight: 300, cursor: "pointer" }}>
            Enviar
          </button>
          <button className="flex-1 py-[13px] rounded-xl text-[11.5px] tracking-[0.22em] uppercase"
            style={{ background: "transparent", border: `1.5px solid rgba(169,137,80,0.4)`, color: GOLD, fontFamily: "'Josefin Sans',sans-serif", fontWeight: 300, cursor: "pointer" }}>
            Editar
          </button>
        </div>
        <Btn label="← Voltar" ghost onClick={() => goTo("s4-pap")} />
        <div className="h-6" />
      </div>
      <BottomNav weddingId={weddingId} />
    </div>
  );

  return null;
}
