"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { TEMPLATES } from "@/lib/identity-kit-templates";
import type { TemplateConfig } from "@/lib/identity-kit-templates";

// ─── Types ───────────────────────────────────────────────────

interface IdentityKit {
  id: string;
  style: string;
  paletteChoice: string;
  aiResponse: Record<string, unknown> | null;
  generatedImages: string[];
  appliedAt: string | null;
  createdAt: string;
}

// ─── Art Styles ──────────────────────────────────────────────

const ART_STYLES = [
  { id: "aquarela",      label: "Aquarela",          desc: "Pinceladas suaves e cores fluidas",    emoji: "🎨" },
  { id: "lapis",         label: "Esboço a Lápis",    desc: "Traços delicados e artesanais",        emoji: "✏️" },
  { id: "preto-branco",  label: "Preto e Branco",    desc: "Elegância monocromática e clássica",   emoji: "🖤" },
  { id: "traco-fino",    label: "Traço Fino",        desc: "Linhas etéreas de luxo moderno",       emoji: "🖊️" },
  { id: "pontilhismo",   label: "Pontilhismo",       desc: "Arte em pontos com textura e poesia",  emoji: "◉" },
  { id: "floral",        label: "Aquarela Floral",   desc: "Flores vibrantes em aquarela suave",   emoji: "🌸" },
];

// ─── Helpers ─────────────────────────────────────────────────

async function resizeImage(file: File, maxPx = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("canvas")); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ─── Main Page ───────────────────────────────────────────────

export default function IdentityKitPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const weddingId = params?.id as string;

  const [screen, setScreen] = useState<"templates" | "loading" | "result">("templates");
  const [selectedPreset, setSelectedPreset] = useState<TemplateConfig | null>(null);
  const [kit, setKit] = useState<IdentityKit | null>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("Aplicando identidade visual...");

  // Photo stylization
  const [photoBase64, setPhotoBase64] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [artStyle, setArtStyle] = useState("");
  const [stylizedImage, setStylizedImage] = useState<string | null>(null);
  const [generatingStylized, setGeneratingStylized] = useState(false);
  const [stylizeError, setStylizeError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const loadKit = useCallback(async () => {
    try {
      const res = await fetch(`/api/weddings/${weddingId}/identity-kit`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.kit) {
        setKit(data.kit);
        setScreen("result");
        if (data.kit.appliedAt) setApplied(true);
      }
    } catch { /* silent */ }
  }, [weddingId]);

  useEffect(() => {
    if (status === "authenticated") loadKit();
  }, [status, loadKit]);

  // ── Apply preset ──
  async function applyPreset(template: TemplateConfig) {
    setScreen("loading");
    setError("");
    setLoadingMsg("Aplicando identidade visual...");
    try {
      const res = await fetch(`/api/weddings/${weddingId}/identity-kit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset: true, presetId: template.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao aplicar tema");
        setScreen("templates");
        return;
      }
      const data = await res.json();
      setKit(data.kit);
      setApplied(false);
      setStylizedImage(null);
      setScreen("result");
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setScreen("templates");
    }
  }

  // ── Apply to site ──
  async function applyToSite() {
    if (!kit) return;
    setApplying(true);
    try {
      const res = await fetch(`/api/weddings/${weddingId}/identity-kit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kitId: kit.id }),
      });
      if (res.ok) setApplied(true);
    } catch { /* silent */ }
    finally { setApplying(false); }
  }

  // ── Generate stylized image ──
  async function generateStylizedImage() {
    if (!photoBase64 || !artStyle) return;
    setGeneratingStylized(true);
    setStylizeError("");
    try {
      const res = await fetch(`/api/weddings/${weddingId}/identity-kit/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photo: photoBase64,
          artStyle,
          kitId: kit?.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setStylizedImage(data.imageUrl);
      } else {
        setStylizeError(data.error ?? "Erro ao gerar imagem");
      }
    } catch {
      setStylizeError("Erro de conexão. Tente novamente.");
    } finally {
      setGeneratingStylized(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="animate-spin w-8 h-8 border-4 border-midnight border-t-transparent rounded-full" />
      </div>
    );
  }

  // ─── Loading ──────────────────────────────────────────────
  if (screen === "loading") {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center gap-8 px-4">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-gold/20" />
          <div className="absolute inset-0 rounded-full border-4 border-gold border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">✨</div>
        </div>
        <div className="text-center">
          <h2 className="font-heading text-2xl text-midnight mb-2">Criando sua Identidade Visual</h2>
          <p className="font-body text-midnight/60 text-sm animate-pulse">{loadingMsg}</p>
        </div>
      </div>
    );
  }

  const GOLD = "#A98950";
  const BROWN = "#3D322A";
  const CREME = "#FAF6EF";

  // ─── Templates Screen ────────────────────────────────────
  if (screen === "templates") {
    const presets = Object.values(TEMPLATES);
    return (
      <div className="min-h-screen pb-10" style={{ background: CREME }}>
        {/* Light header */}
        <div style={{ background: CREME }} className="px-5 pt-10 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href={`/casamento/${weddingId}/meu-site`} className="text-midnight/50 hover:text-midnight transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
          <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "10px", letterSpacing: "0.15em", color: GOLD, textTransform: "uppercase" as const, fontWeight: 500 }}>
            Identidade Visual
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "28px", color: BROWN, lineHeight: 1.2, marginTop: "4px" }}>
            Identity Kit
          </h1>
          <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "12px", color: "rgba(61,50,42,0.5)", marginTop: "6px", letterSpacing: "0.02em" }}>
            Paleta, tipografia e imagens do seu casamento
          </p>
        </div>

        {/* Ornamental divider */}
        <div className="flex items-center gap-2.5 px-5 py-2">
          <div style={{ flex: 1, height: "1px", background: "rgba(169,137,80,0.25)" }} />
          <div style={{ width: "5px", height: "5px", background: GOLD, transform: "rotate(45deg)", opacity: 0.7 }} />
          <div style={{ flex: 1, height: "1px", background: "rgba(169,137,80,0.25)" }} />
        </div>

        <div className="max-w-lg mx-auto px-4 pt-6">
          <div className="mb-5">
            <p className="font-body text-xs text-gold uppercase tracking-[0.15em] font-medium mb-1">Escolha seu tema</p>
            <h2 className="font-heading text-2xl text-midnight">Qual estilo combina com o seu casamento?</h2>
            <p className="font-body text-xs text-stone mt-1">Toque em um tema para selecioná-lo</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="font-body text-xs text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            {presets.map((template) => {
              const isSelected = selectedPreset?.id === template.id;
              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedPreset(isSelected ? null : template)}
                  className={`w-full text-left rounded-2xl border-2 overflow-hidden transition-all active:scale-[0.98] ${
                    isSelected ? "border-gold shadow-md" : "border-midnight/8 bg-white hover:border-midnight/20"
                  }`}
                >
                  {/* Color swatches */}
                  <div className="flex h-10">
                    {[template.colors.hero, template.colors.secondary, template.colors.accent, template.colors.background].map((c, i) => (
                      <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="p-4 bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-body font-semibold text-midnight text-sm">{template.name}</p>
                        <p className="font-body text-xs text-stone leading-snug mt-0.5">{template.description}</p>
                        <p className="font-body text-[10px] text-midnight/40 mt-1">
                          {template.fonts.heading} · {template.fonts.body || template.fonts.heading}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center flex-shrink-0 ml-3">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedPreset && (
            <div className="sticky bottom-6 pt-5">
              <button
                onClick={() => applyPreset(selectedPreset)}
                className="w-full py-4 bg-gold text-white rounded-2xl font-body font-semibold text-sm shadow-lg hover:bg-gold/90 transition active:scale-[0.98]"
              >
                Usar tema {selectedPreset.name}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Result Screen ────────────────────────────────────────
  if (screen === "result" && kit) {
    const template = TEMPLATES[kit.paletteChoice] ?? Object.values(TEMPLATES)[0];
    const swatchColors = template
      ? [template.colors.hero, template.colors.secondary, template.colors.accent, template.colors.background]
      : [];

    return (
      <div className="min-h-screen pb-10" style={{ background: CREME }}>
        {/* Light header */}
        <div style={{ background: CREME }} className="px-5 pt-10 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href={`/casamento/${weddingId}/meu-site`} className="text-midnight/50 hover:text-midnight transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <button
              onClick={() => { setScreen("templates"); setSelectedPreset(null); }}
              className="ml-auto font-body text-xs hover:opacity-70 transition"
              style={{ color: GOLD }}
            >
              Trocar tema
            </button>
          </div>
          <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "10px", letterSpacing: "0.15em", color: GOLD, textTransform: "uppercase" as const, fontWeight: 500 }}>
            Identidade Visual
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "28px", color: BROWN, lineHeight: 1.2, marginTop: "4px" }}>
            Identity Kit
          </h1>
          <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "12px", color: "rgba(61,50,42,0.5)", marginTop: "6px", letterSpacing: "0.02em" }}>
            Paleta, tipografia e imagens do seu casamento
          </p>
        </div>

        {/* Ornamental divider */}
        <div className="flex items-center gap-2.5 px-5 py-2">
          <div style={{ flex: 1, height: "1px", background: "rgba(169,137,80,0.25)" }} />
          <div style={{ width: "5px", height: "5px", background: GOLD, transform: "rotate(45deg)", opacity: 0.7 }} />
          <div style={{ flex: 1, height: "1px", background: "rgba(169,137,80,0.25)" }} />
        </div>

        <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">

          {/* Applied banner */}
          {applied && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-midnight/8 border border-midnight/15 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <svg className="w-4 h-4 text-midnight flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-body text-xs text-midnight">
                Tema aplicado ao seu site!{" "}
                <Link href={`/casamento/${weddingId}/meu-site`} className="underline font-medium">
                  Ver site
                </Link>
              </p>
            </motion.div>
          )}

          {/* Selected theme card */}
          <div className="bg-white rounded-2xl border border-midnight/8 shadow-card overflow-hidden">
            {/* Color strip */}
            <div className="flex h-12">
              {swatchColors.map((c, i) => (
                <div key={i} className="flex-1" style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-body text-[10px] text-gold uppercase tracking-[0.15em] font-medium mb-0.5">Tema selecionado</p>
                  <p className="font-body font-semibold text-midnight">{template?.name ?? kit.style}</p>
                  <p className="font-body text-xs text-stone mt-0.5">{template?.description}</p>
                </div>
                <span className="px-2.5 py-1 bg-gold/10 text-gold rounded-lg font-body text-[10px] font-semibold uppercase tracking-wider">
                  Ativo
                </span>
              </div>

              {/* Palette preview */}
              {template && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: "Principal", hex: template.colors.primary },
                    { label: "Destaque", hex: template.colors.accent },
                    { label: "Fundo", hex: template.colors.background },
                  ].map(({ label, hex }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex-shrink-0 shadow-sm border border-black/5" style={{ backgroundColor: hex }} />
                      <div>
                        <p className="font-body text-[9px] text-stone">{label}</p>
                        <p className="font-body text-[10px] text-midnight font-mono">{hex}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Fonts */}
              {template && (
                <p className="font-body text-xs text-stone mb-4">
                  Tipografia: <span className="text-midnight font-medium">{template.fonts.heading}</span> + <span className="text-midnight font-medium">{template.fonts.body || template.fonts.heading}</span>
                </p>
              )}

              <button
                onClick={applyToSite}
                disabled={applying || applied}
                className="w-full py-3 bg-gold text-white rounded-xl font-body font-semibold text-sm hover:bg-gold/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {applying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Aplicando...
                  </>
                ) : applied ? (
                  <>&#10003; Aplicado ao site</>
                ) : (
                  "Aplicar ao meu site"
                )}
              </button>
            </div>
          </div>

          {/* Photo stylization section */}
          <div className="bg-white rounded-2xl border border-midnight/8 shadow-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🎨</span>
              <div>
                <p className="font-body font-semibold text-midnight text-sm">Imagem Artística com IA</p>
                <p className="font-body text-xs text-stone">Suba uma foto e transforme em arte</p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {/* Photo upload */}
              {photoBase64 ? (
                <div className="relative rounded-xl overflow-hidden border border-midnight/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoBase64} alt="Foto enviada" className="w-full max-h-48 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                    <span className="font-body text-xs text-white/90 truncate">{photoName}</span>
                    <button
                      onClick={() => { setPhotoBase64(""); setPhotoName(""); setStylizedImage(null); }}
                      className="flex-shrink-0 bg-white/20 hover:bg-white/30 text-white rounded-lg px-2.5 py-1 text-xs font-body transition"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-midnight/15 hover:border-gold/40 rounded-xl p-6 cursor-pointer transition bg-fog hover:bg-gold/5 group">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition">
                    <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-body text-sm text-midnight font-medium">Enviar uma foto</p>
                    <p className="font-body text-xs text-stone mt-0.5">Local, casal, flores — qualquer coisa que inspire</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const b64 = await resizeImage(file);
                        setPhotoBase64(b64);
                        setPhotoName(file.name);
                        setStylizedImage(null);
                        setArtStyle("");
                      } catch { /* ignore */ }
                    }}
                  />
                </label>
              )}

              {/* Art style picker */}
              {photoBase64 && (
                <div>
                  <p className="font-body text-xs text-midnight/60 mb-2.5">Escolha o estilo artístico:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ART_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setArtStyle(style.id)}
                        className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left transition active:scale-[0.97] ${
                          artStyle === style.id
                            ? "border-gold bg-gold/5"
                            : "border-midnight/8 bg-fog hover:border-midnight/20"
                        }`}
                      >
                        <span className="text-lg flex-shrink-0">{style.emoji}</span>
                        <div>
                          <p className="font-body text-xs font-semibold text-midnight leading-tight">{style.label}</p>
                          <p className="font-body text-[10px] text-stone leading-tight">{style.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate button */}
              {photoBase64 && artStyle && (
                <button
                  onClick={generateStylizedImage}
                  disabled={generatingStylized}
                  className="w-full py-3 bg-midnight text-white rounded-xl font-body font-semibold text-sm hover:bg-midnight/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generatingStylized ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Gerando imagem...
                    </>
                  ) : (
                    <>&#10024; Gerar imagem artística</>
                  )}
                </button>
              )}

              {generatingStylized && (
                <p className="font-body text-xs text-stone text-center">Isso pode levar até 30 segundos...</p>
              )}

              {stylizeError && (
                <p className="font-body text-xs text-red-500 text-center">{stylizeError}</p>
              )}

              {/* Generated stylized image */}
              {stylizedImage && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="font-body text-xs text-midnight/50 mb-2 text-center uppercase tracking-wider">Resultado</p>
                  <a href={stylizedImage} target="_blank" rel="noopener noreferrer" className="block group">
                    <div className="rounded-xl overflow-hidden shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={stylizedImage}
                        alt="Imagem artística gerada"
                        className="w-full object-cover group-hover:scale-[1.02] transition duration-300"
                      />
                    </div>
                    <p className="font-body text-[10px] text-stone text-center mt-2">Toque para abrir em tamanho completo</p>
                  </a>
                  <button
                    onClick={() => { setStylizedImage(null); setArtStyle(""); setPhotoBase64(""); setPhotoName(""); }}
                    className="w-full mt-3 py-2.5 border border-midnight/15 text-midnight/60 rounded-xl font-body text-xs hover:bg-midnight/5 transition"
                  >
                    Gerar outra imagem
                  </button>
                </motion.div>
              )}

              {!photoBase64 && !stylizedImage && (
                <p className="font-body text-[10px] text-stone text-center">
                  Exemplos: foto do local da festa, buquê, convite, ou o próprio casal
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
