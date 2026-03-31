"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { PRESET_PALETTES, TEMPLATES } from "@/lib/identity-kit-templates";
import type { TemplateConfig } from "@/lib/identity-kit-templates";

// ─── Types ───────────────────────────────────────────────────

interface AiPaletteColor {
  hex: string;
  name: string;
}

interface AiResponse {
  palette: Record<string, AiPaletteColor>;
  typography: {
    heading: { family: string; style: string };
    body: { family: string; style: string };
  };
  invite: {
    description: string;
    layout: string;
    tagline: string;
  };
  siteTheme: {
    templateId: string;
    reason: string;
  };
  menu: {
    entrada: string;
    principal: string;
    sobremesa: string;
  };
  decoration: string[];
  venueIllustration?: {
    description: string;
    prompt: string;
  };
}

interface IdentityKit {
  id: string;
  style: string;
  paletteChoice: string;
  mood: string;
  tone: string;
  referenceUrls: string[];
  aiResponse: AiResponse | null;
  generatedImages: string[];
  appliedAt: string | null;
  createdAt: string;
}

interface QuizAnswers {
  style: string;
  paletteChoice: string;
  mood: string;
  referenceUrls: string[];
  tone: string;
}

// ─── Constants ───────────────────────────────────────────────

const STYLES = [
  {
    value: "clássico",
    label: "Clássico",
    desc: "Elegante e atemporal",
    colors: ["#1A1F3A", "#C9A96E", "#C9A96E"],
  },
  {
    value: "rústico",
    label: "Rústico",
    desc: "Natural e acolhedor",
    colors: ["#5C3D2E", "#A67C5B", "#C4A882"],
  },
  {
    value: "moderno",
    label: "Moderno",
    desc: "Contemporâneo e clean",
    colors: ["#111827", "#374151", "#6B7280"],
  },
  {
    value: "romântico",
    label: "Romântico",
    desc: "Delicado e apaixonado",
    colors: ["#9D4E6E", "#C9A96E", "#E8A0B4"],
  },
  {
    value: "minimalista",
    label: "Minimalista",
    desc: "Simples e poderoso",
    colors: ["#1C1C1C", "#404040", "#A0A0A0"],
  },
  {
    value: "boho",
    label: "Boho",
    desc: "Livre e artístico",
    colors: ["#7C5C3E", "#BF8D6B", "#C9A96E"],
  },
];

const MOODS = [
  { value: "formal", label: "Formal", desc: "Protocolo e elegância" },
  { value: "descontraído", label: "Descontraído", desc: "Leve e espontâneo" },
  { value: "íntimo", label: "Íntimo", desc: "Pequeno e especial" },
  { value: "grande festa", label: "Grande Festa", desc: "Euforia e celebração" },
  { value: "luxo", label: "Luxo", desc: "Exclusivo e sofisticado" },
  { value: "DIY", label: "DIY", desc: "Artesanal e personalizado" },
];

const TONES = [
  {
    value: "poético",
    label: "Poético",
    desc: "Palavras que encantam",
    example: '"Dois corações, um só destino..."',
  },
  {
    value: "divertido",
    label: "Divertido",
    desc: "Leve com humor",
    example: '"Vamos festejar o amor (e a open bar)!"',
  },
  {
    value: "tradicional",
    label: "Tradicional",
    desc: "Clássico e formal",
    example: '"Têm a honra de convidar V.Sa..."',
  },
  {
    value: "contemporâneo",
    label: "Contemporâneo",
    desc: "Atual e direto",
    example: '"Ei! Você é especial pra gente."',
  },
];

const TOTAL_STEPS = 5;
const FREE_LIMIT = 3;

// ─── Helpers ─────────────────────────────────────────────────

function StepDot({ step, current }: { step: number; current: number }) {
  const done = step < current;
  const active = step === current;
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
        done
          ? "bg-midnight text-white"
          : active
          ? "bg-gold text-white ring-4 ring-gold/20"
          : "bg-gray-100 text-gray-400"
      }`}
    >
      {done ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        step
      )}
    </div>
  );
}

function SelectCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full text-left rounded-xl border-2 p-4 transition-all cursor-pointer ${
        selected
          ? "border-gold bg-gold/5 shadow-md"
          : "border-gray-200 hover:border-gray-300 bg-white"
      }`}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-gold rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      {children}
    </button>
  );
}

// Redimensiona imagem client-side antes de enviar (evita payload grande)
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

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

// ─── Main Page ───────────────────────────────────────────────

export default function IdentityKitPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const weddingId = params.id as string;

  const [screen, setScreen] = useState<"mode-select" | "quiz" | "preset" | "loading" | "result">("mode-select");
  const [selectedPreset, setSelectedPreset] = useState<TemplateConfig | null>(null);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<QuizAnswers>({
    style: "",
    paletteChoice: "",
    mood: "",
    referenceUrls: [],
    tone: "",
  });
  const [refUrlInput, setRefUrlInput] = useState("");
  const [venuePhotoBase64, setVenuePhotoBase64] = useState<string>("");
  const [venuePhotoName, setVenuePhotoName] = useState<string>("");

  const [kit, setKit] = useState<IdentityKit | null>(null);
  const [generationCount, setGenerationCount] = useState(0);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("Analisando suas preferências...");
  const [generatingImages, setGeneratingImages] = useState(false);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Load existing kit on mount
  const loadKit = useCallback(async () => {
    try {
      const res = await fetch(`/api/weddings/${weddingId}/identity-kit`);
      if (!res.ok) return;
      const data = await res.json();
      setGenerationCount(data.generationCount ?? 0);
      if (data.kit) {
        setKit(data.kit);
        setScreen("result");
        if (data.kit.appliedAt) setApplied(true);
      }
    } catch {
      // silent
    }
  }, [weddingId]);

  useEffect(() => {
    if (status === "authenticated") loadKit();
  }, [status, loadKit]);

  // ── Navigation ──
  function goNext() {
    setDirection(1);
    setStep((s) => s + 1);
  }

  function goPrev() {
    setDirection(-1);
    setStep((s) => s - 1);
  }

  function canProceed() {
    if (step === 1) return !!answers.style;
    if (step === 2) return !!answers.paletteChoice;
    if (step === 3) return !!answers.mood;
    if (step === 4) return true; // optional
    if (step === 5) return !!answers.tone;
    return false;
  }

  // ── Generation ──
  async function generate() {
    setScreen("loading");
    setError("");

    const messages = [
      "Analisando suas preferências...",
      "Harmonizando a paleta de cores...",
      "Escolhendo a tipografia ideal...",
      "Criando sugestões de decoração...",
      "Finalizando sua identidade visual...",
    ];
    let i = 0;
    const msgInterval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadingMsg(messages[i]);
    }, 1800);

    try {
      const res = await fetch(`/api/weddings/${weddingId}/identity-kit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...answers, venuePhotoBase64: venuePhotoBase64 || undefined }),
      });

      clearInterval(msgInterval);

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao gerar identidade");
        setScreen("quiz");
        return;
      }

      const data = await res.json();
      setKit(data.kit);
      setGenerationCount(data.generationCount);
      setApplied(false);
      setScreen("result");
    } catch {
      clearInterval(msgInterval);
      setError("Erro de conexão. Tente novamente.");
      setScreen("quiz");
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
    } catch {
      // silent
    } finally {
      setApplying(false);
    }
  }

  // ── Generate images ──
  async function generateImages() {
    if (!kit) return;
    setGeneratingImages(true);
    setImageError("");
    try {
      const res = await fetch(`/api/weddings/${weddingId}/identity-kit/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kitId: kit.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setKit((prev) => prev ? { ...prev, generatedImages: data.images } : prev);
      } else {
        setImageError(data.error ?? "Erro ao gerar imagens");
      }
    } catch {
      setImageError("Erro de conexão. Tente novamente.");
    } finally {
      setGeneratingImages(false);
    }
  }

  // ── Apply preset (arte pronta) ──
  async function applyPreset(template: TemplateConfig) {
    setScreen("loading");
    setError("");
    try {
      const res = await fetch(`/api/weddings/${weddingId}/identity-kit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset: true, presetId: template.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao aplicar arte");
        setScreen("preset");
        return;
      }
      const data = await res.json();
      setKit(data.kit);
      setGenerationCount(data.generationCount);
      setApplied(false);
      setScreen("result");
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setScreen("preset");
    }
  }

  function editAnswers() {
    setScreen("quiz");
    setStep(1);
    if (kit) {
      setAnswers({
        style: kit.style,
        paletteChoice: kit.paletteChoice,
        mood: kit.mood,
        referenceUrls: kit.referenceUrls,
        tone: kit.tone,
      });
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="animate-spin w-8 h-8 border-4 border-midnight border-t-transparent rounded-full" />
      </div>
    );
  }

  const ai = kit?.aiResponse;

  // ─── Mode Select Screen ───────────────────────────────────────
  if (screen === "mode-select") {
    return (
      <div className="min-h-screen bg-ivory pb-10">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/dashboard" className="text-midnight/50 hover:text-midnight transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="font-heading text-xl text-midnight">Identidade Visual</h1>
          </div>
        </header>
        <div className="max-w-lg mx-auto px-4 pt-8 space-y-4">
          <p className="font-body text-sm text-midnight/60 text-center mb-6">
            Como você quer criar sua identidade visual?
          </p>

          {/* IA Option */}
          <button
            onClick={() => { setScreen("quiz"); setStep(1); }}
            className="w-full text-left bg-white rounded-2xl border-2 border-midnight/10 p-5 hover:border-gold/50 hover:shadow-md transition-all active:scale-[0.98] group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-midnight flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-body font-semibold text-midnight">Criar com IA</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-body font-medium bg-gold/10 text-gold">Recomendado</span>
                </div>
                <p className="font-body text-xs text-midnight/50 leading-relaxed">
                  Responda 5 perguntas e a IA gera uma identidade visual única: paleta, tipografia, convite e site.
                </p>
              </div>
              <svg className="w-5 h-5 text-midnight/20 group-hover:text-gold transition-colors flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Preset Option */}
          <button
            onClick={() => setScreen("preset")}
            className="w-full text-left bg-white rounded-2xl border-2 border-midnight/10 p-5 hover:border-gold/50 hover:shadow-md transition-all active:scale-[0.98] group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-body font-semibold text-midnight mb-1">Arte pronta</p>
                <p className="font-body text-xs text-midnight/50 leading-relaxed">
                  Escolha um dos 6 temas pré-criados e aplique com 1 clique — sem quiz.
                </p>
              </div>
              <svg className="w-5 h-5 text-midnight/20 group-hover:text-gold transition-colors flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ─── Preset Browser Screen ────────────────────────────────
  if (screen === "preset") {
    const presets = Object.values(TEMPLATES);
    return (
      <div className="min-h-screen bg-ivory pb-10">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => setScreen("mode-select")} className="text-midnight/50 hover:text-midnight transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="font-heading text-xl text-midnight">Escolher Arte Pronta</h1>
          </div>
        </header>

        <div className="max-w-lg mx-auto px-4 pt-6 space-y-3">
          <p className="font-body text-xs text-midnight/50 text-center mb-4">
            Toque em um tema para pré-visualizar e aplicar
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="font-body text-xs text-red-600">{error}</p>
            </div>
          )}

          {presets.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedPreset(selectedPreset?.id === template.id ? null : template)}
              className={`w-full text-left rounded-2xl border-2 overflow-hidden transition-all active:scale-[0.98] ${
                selectedPreset?.id === template.id
                  ? "border-gold shadow-md"
                  : "border-midnight/8 bg-white hover:border-midnight/20"
              }`}
            >
              {/* Color swatches */}
              <div className="flex h-8">
                {[template.colors.hero, template.colors.secondary, template.colors.accent, template.colors.background].map((c, i) => (
                  <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                ))}
              </div>
              {/* Info */}
              <div className="p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body font-semibold text-midnight text-sm">{template.name}</p>
                    <p className="font-body text-xs text-midnight/50 mt-0.5">{template.fonts.heading} · {template.fonts.body || template.fonts.heading}</p>
                    <p className="font-body text-xs text-midnight/40 mt-0.5 leading-snug">{template.description}</p>
                  </div>
                  {selectedPreset?.id === template.id && (
                    <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center flex-shrink-0 ml-3">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}

          {selectedPreset && (
            <div className="sticky bottom-6 pt-4">
              <button
                onClick={() => applyPreset(selectedPreset)}
                className="w-full py-4 bg-gold text-white rounded-2xl font-body font-semibold text-sm shadow-lg hover:bg-gold/90 transition active:scale-[0.98]"
              >
                {`Aplicar "${selectedPreset.name}" como identidade visual`}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Loading Screen ───────────────────────────────────────
  if (screen === "loading") {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center gap-8 px-4">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-gold/20" />
          <div className="absolute inset-0 rounded-full border-4 border-gold border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">✨</div>
        </div>
        <div className="text-center">
          <h2 className="font-heading text-2xl text-midnight mb-2">
            Criando sua Identidade Visual
          </h2>
          <p className="font-body text-midnight/60 text-sm animate-pulse">{loadingMsg}</p>
        </div>
        <p className="font-body text-xs text-midnight/40">Isso leva cerca de 10 segundos...</p>
      </div>
    );
  }

  // ─── Result Screen ────────────────────────────────────────
  if (screen === "result" && kit && ai) {
    const paletteEntries = Object.entries(ai.palette ?? {});

    return (
      <div className="min-h-screen bg-ivory">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-midnight/50 hover:text-midnight transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="font-heading text-xl text-midnight">Identity Kit</h1>
            </div>
            <span className={`text-xs font-body px-2 py-0.5 rounded-full ${
              generationCount >= FREE_LIMIT
                ? "bg-red-50 text-red-500 font-semibold"
                : generationCount === FREE_LIMIT - 1
                ? "bg-amber-50 text-amber-600 font-semibold"
                : "text-midnight/40"
            }`}>
              {generationCount >= FREE_LIMIT
                ? "Limite atingido"
                : `${FREE_LIMIT - generationCount} ${FREE_LIMIT - generationCount === 1 ? "geração restante" : "gerações restantes"}`
              }
            </span>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">

          {/* Applied banner */}
          {applied && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-midnight/10 border border-midnight/20 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-midnight flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-body text-sm text-midnight">
                Identidade visual aplicada ao seu site! Acesse{" "}
                <Link href="/dashboard" className="underline">
                  o dashboard
                </Link>{" "}
                para visualizar.
              </p>
            </motion.div>
          )}

          {/* Style badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-midnight/5 text-midnight font-body text-sm px-3 py-1.5 rounded-full">
              ✨ Estilo: <strong>{kit.style}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-midnight/5 text-midnight font-body text-sm px-3 py-1.5 rounded-full">
              {kit.mood}
            </span>
          </div>

          {/* Palette */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-heading text-2xl text-midnight mb-4">Sua Paleta de Cores</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {paletteEntries.map(([key, color]) => (
                <div key={key} className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex-shrink-0 shadow-sm border border-black/5"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <p className="font-body text-xs text-midnight/50 capitalize">{key}</p>
                    <p className="font-body text-sm text-midnight font-medium leading-tight">
                      {color.name}
                    </p>
                    <p className="font-body text-xs text-midnight/40 font-mono">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Typography */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-heading text-2xl text-midnight mb-4">Tipografia</h2>
            <div className="space-y-4">
              <div>
                <p className="font-body text-xs text-midnight/50 uppercase tracking-wider mb-1">
                  Títulos — {ai.typography.heading.family}
                </p>
                <p
                  className="text-2xl text-midnight"
                  style={{ fontFamily: `"${ai.typography.heading.family}", serif` }}
                >
                  Um amor para toda a vida
                </p>
                <p className="font-body text-xs text-midnight/40 mt-1">{ai.typography.heading.style}</p>
              </div>
              <div>
                <p className="font-body text-xs text-midnight/50 uppercase tracking-wider mb-1">
                  Corpo de texto — {ai.typography.body.family}
                </p>
                <p
                  className="text-base text-midnight/80"
                  style={{ fontFamily: `"${ai.typography.body.family}", sans-serif` }}
                >
                  Porque algumas histórias merecem ser contadas para sempre, com cada detalhe cuidado
                  com amor.
                </p>
                <p className="font-body text-xs text-midnight/40 mt-1">{ai.typography.body.style}</p>
              </div>
            </div>
          </section>

          {/* Invite */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-heading text-2xl text-midnight mb-4">Convite Digital</h2>
            <blockquote className="border-l-4 border-gold pl-4 mb-4">
              <p className="font-heading text-lg text-midnight italic">&quot;{ai.invite.tagline}&quot;</p>
            </blockquote>
            <p className="font-body text-midnight/70 leading-relaxed">{ai.invite.description}</p>
            <p className="font-body text-xs text-midnight/40 mt-3">
              Layout sugerido: <span className="font-mono">{ai.invite.layout}</span>
            </p>
          </section>

          {/* AI Images */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-2xl text-midnight">Imagens do Convite</h2>
              {kit.generatedImages?.length > 0 && (
                <button
                  onClick={generateImages}
                  disabled={generatingImages}
                  className="text-xs font-body text-midnight/40 hover:text-midnight transition disabled:opacity-50"
                >
                  Regenerar
                </button>
              )}
            </div>

            {kit.generatedImages?.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {kit.generatedImages.slice(0, 4).map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={i === 3 ? "Convite — cena" : `Convite — variação ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <p className="font-body text-xs text-midnight/40 mt-1.5 text-center">
                        {i === 0 ? "Capa do convite" : i === 1 ? "Suite de papelaria" : i === 2 ? "Ornamento" : "Cena estilizada"}
                      </p>
                    </a>
                  ))}
                </div>
                {kit.generatedImages[4] && (
                  <div>
                    <p className="font-body text-xs text-midnight/50 uppercase tracking-wider mb-2">Logo / Monograma</p>
                    <a href={kit.generatedImages[4]} target="_blank" rel="noopener noreferrer" className="block group max-w-xs mx-auto">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={kit.generatedImages[4]}
                          alt="Logo do casamento"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                    </a>
                  </div>
                )}
                <p className="font-body text-xs text-midnight/30 text-center">
                  Clique nas imagens para abrir em tamanho completo
                </p>
              </div>
            ) : generatingImages ? (
              <div className="flex flex-col items-center gap-4 py-10">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-gold/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-gold border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-xl">🎨</div>
                </div>
                <div className="text-center">
                  <p className="font-body text-sm text-midnight/70">Gerando 4 convites + logo com DALL-E 3...</p>
                  <p className="font-body text-xs text-midnight/40 mt-1">Isso pode levar até 60 segundos</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="text-4xl">🖼️</div>
                <div className="text-center">
                  <p className="font-body text-sm text-midnight/70 mb-1">
                    Gere 4 variações de convite e o logo do casamento com IA
                  </p>
                  <p className="font-body text-xs text-midnight/40">
                    Usa DALL-E 3 • Cerca de 60 segundos • Baseado na sua identidade visual
                  </p>
                </div>
                {imageError && (
                  <p className="font-body text-xs text-red-500">{imageError}</p>
                )}
                <button
                  onClick={generateImages}
                  disabled={generatingImages}
                  className="flex items-center gap-2 bg-midnight text-white font-body font-medium px-6 py-3 rounded-xl hover:bg-midnight/90 transition disabled:opacity-50"
                >
                  <span>✨</span> Gerar imagens com IA
                </button>
              </div>
            )}
          </section>

          {/* Site Theme */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-heading text-2xl text-midnight mb-2">Template do Site</h2>
            <div className="flex items-start gap-3">
              <span className="inline-block bg-gold/10 text-gold font-body text-sm font-semibold px-3 py-1.5 rounded-lg capitalize">
                {ai.siteTheme.templateId}
              </span>
              <p className="font-body text-midnight/70 text-sm leading-relaxed pt-1">
                {ai.siteTheme.reason}
              </p>
            </div>
          </section>

          {/* Menu */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-heading text-2xl text-midnight mb-4">Cardápio Sugerido</h2>
            <div className="space-y-3">
              {[
                { label: "Entrada", value: ai.menu.entrada },
                { label: "Prato Principal", value: ai.menu.principal },
                { label: "Sobremesa", value: ai.menu.sobremesa },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="font-body text-xs text-midnight/50 uppercase tracking-wider mb-1">
                    {label}
                  </p>
                  <p className="font-body text-midnight/80 text-sm">{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Venue Illustration */}
          {ai.venueIllustration && (
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gold/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🎨</span>
                <h2 className="font-heading text-2xl text-midnight">Aquarela do Local</h2>
              </div>
              <p className="font-body text-midnight/70 leading-relaxed mb-4">
                {ai.venueIllustration.description}
              </p>
              <div className="bg-gold/5 border border-gold/15 rounded-xl p-4">
                <p className="font-body text-xs text-gold uppercase tracking-wider mb-1.5">
                  Prompt para geração de imagem (Midjourney, DALL-E, etc.)
                </p>
                <p className="font-body text-sm text-midnight/80 leading-relaxed font-mono">
                  {ai.venueIllustration.prompt}
                </p>
                <button
                  onClick={() => navigator.clipboard.writeText(ai.venueIllustration!.prompt)}
                  className="mt-3 text-xs font-body text-gold hover:text-gold/80 underline transition"
                >
                  Copiar prompt
                </button>
              </div>
            </section>
          )}

          {/* Decoration */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-heading text-2xl text-midnight mb-4">Decoração</h2>
            <ul className="space-y-2">
              {(ai.decoration ?? []).map((item, i) => (
                <li key={i} className="flex items-start gap-2 font-body text-sm text-midnight/80">
                  <span className="text-gold mt-0.5 flex-shrink-0">◆</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pb-8">
            <button
              onClick={applyToSite}
              disabled={applying || applied}
              className="flex-1 bg-gold text-white font-body font-semibold py-3 px-6 rounded-xl hover:bg-gold/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {applying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Aplicando...
                </>
              ) : applied ? (
                <>✓ Aplicado ao site</>
              ) : (
                <>Aplicar ao meu site</>
              )}
            </button>

            {generationCount < FREE_LIMIT && (
              <button
                onClick={() => {
                  setScreen("quiz");
                  setStep(1);
                }}
                className="flex-1 border border-midnight/20 text-midnight font-body py-3 px-6 rounded-xl hover:bg-midnight/5 transition text-sm"
              >
                Gerar novamente ({FREE_LIMIT - generationCount} restantes)
              </button>
            )}

            <button
              onClick={editAnswers}
              className="border border-gray-200 text-midnight/60 font-body py-3 px-6 rounded-xl hover:bg-gray-50 transition text-sm"
            >
              ← Editar respostas
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ─── Quiz Screen ──────────────────────────────────────────
  const stepLabels = ["Estilo", "Paleta", "Clima", "Referências", "Tom de voz"];

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-midnight/50 hover:text-midnight transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="font-heading text-xl text-midnight">Identity Kit</h1>
          </div>
          <span className="font-body text-xs text-midnight/40">
            Passo {step} de {TOTAL_STEPS}
          </span>
        </div>

        {/* Step dots */}
        <div className="max-w-2xl mx-auto px-4 pb-3 flex items-center justify-center gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <StepDot step={s} current={step} />
              {s < TOTAL_STEPS && (
                <div className={`w-8 h-0.5 rounded ${s < step ? "bg-midnight" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm font-body rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* ── STEP 1: Estilo ── */}
            {step === 1 && (
              <div>
                <p className="font-body text-xs text-gold uppercase tracking-widest mb-1">
                  {stepLabels[0]}
                </p>
                <h2 className="font-heading text-3xl text-midnight mb-6">
                  Qual é o estilo do casamento?
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {STYLES.map((s) => (
                    <SelectCard
                      key={s.value}
                      selected={answers.style === s.value}
                      onClick={() => setAnswers((a) => ({ ...a, style: s.value }))}
                    >
                      <div className="flex gap-1.5 mb-3">
                        {s.colors.map((c) => (
                          <div
                            key={c}
                            className="w-5 h-5 rounded-full border border-black/10"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <p className="font-heading text-lg text-midnight">{s.label}</p>
                      <p className="font-body text-xs text-midnight/50 mt-0.5">{s.desc}</p>
                    </SelectCard>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 2: Paleta ── */}
            {step === 2 && (
              <div>
                <p className="font-body text-xs text-gold uppercase tracking-widest mb-1">
                  {stepLabels[1]}
                </p>
                <h2 className="font-heading text-3xl text-midnight mb-6">
                  Escolha sua paleta de cores
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {PRESET_PALETTES.map((p) => (
                    <SelectCard
                      key={p.id}
                      selected={answers.paletteChoice === p.id}
                      onClick={() => setAnswers((a) => ({ ...a, paletteChoice: p.id }))}
                    >
                      <div className="flex gap-1 mb-3">
                        {p.colors.map((c, i) => (
                          <div
                            key={i}
                            className="flex-1 h-8 rounded border border-black/5"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <p className="font-heading text-base text-midnight">{p.name}</p>
                      <p className="font-body text-xs text-midnight/50">{p.description}</p>
                    </SelectCard>
                  ))}
                  {/* AI palette option */}
                  <SelectCard
                    selected={answers.paletteChoice === "ai"}
                    onClick={() => setAnswers((a) => ({ ...a, paletteChoice: "ai" }))}
                  >
                    <div className="flex gap-1 mb-3">
                      {["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#C77DFF"].map((c, i) => (
                        <div
                          key={i}
                          className="flex-1 h-8 rounded border border-black/5 opacity-60"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <p className="font-heading text-base text-midnight flex items-center gap-1.5">
                      ✨ Gerar com IA
                    </p>
                    <p className="font-body text-xs text-midnight/50">
                      Paleta exclusiva para o seu estilo
                    </p>
                  </SelectCard>
                </div>
              </div>
            )}

            {/* ── STEP 3: Mood ── */}
            {step === 3 && (
              <div>
                <p className="font-body text-xs text-gold uppercase tracking-widest mb-1">
                  {stepLabels[2]}
                </p>
                <h2 className="font-heading text-3xl text-midnight mb-6">
                  Qual o clima da festa?
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {MOODS.map((m) => (
                    <SelectCard
                      key={m.value}
                      selected={answers.mood === m.value}
                      onClick={() => setAnswers((a) => ({ ...a, mood: m.value }))}
                    >
                      <p className="font-heading text-lg text-midnight">{m.label}</p>
                      <p className="font-body text-xs text-midnight/50 mt-0.5">{m.desc}</p>
                    </SelectCard>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 4: Foto do local + Referências ── */}
            {step === 4 && (
              <div className="space-y-8">
                {/* Foto do local */}
                <div>
                  <p className="font-body text-xs text-gold uppercase tracking-widest mb-1">
                    {stepLabels[3]}
                  </p>
                  <h2 className="font-heading text-3xl text-midnight mb-2">
                    Foto do local da festa
                  </h2>
                  <p className="font-body text-sm text-midnight/60 mb-4">
                    A IA analisa a foto e cria uma sugestão de aquarela do espaço para usar no convite e na decoração. Opcional.
                  </p>

                  {venuePhotoBase64 ? (
                    <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={venuePhotoBase64} alt="Local da festa" className="w-full max-h-56 object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="font-body text-xs text-white/90 truncate">{venuePhotoName}</span>
                        <button
                          onClick={() => { setVenuePhotoBase64(""); setVenuePhotoName(""); }}
                          className="flex-shrink-0 bg-white/20 hover:bg-white/30 text-white rounded-lg px-2.5 py-1 text-xs font-body transition"
                        >
                          Remover
                        </button>
                      </div>
                      <div className="absolute top-3 right-3 bg-midnight text-white text-xs font-body px-2 py-0.5 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Foto adicionada
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 hover:border-gold/40 rounded-2xl p-8 cursor-pointer transition bg-white hover:bg-gold/5 group">
                      <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition">
                        <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="font-body text-sm text-midnight font-medium">Clique para enviar uma foto</p>
                        <p className="font-body text-xs text-midnight/40 mt-0.5">JPG, PNG ou WEBP — a IA vai sugerir uma aquarela do espaço</p>
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
                            setVenuePhotoBase64(b64);
                            setVenuePhotoName(file.name);
                          } catch { /* ignore */ }
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Divisor */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="font-body text-xs text-midnight/30 uppercase tracking-wider">Referências visuais</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* URLs de referência */}
                <div>
                  <p className="font-body text-sm text-midnight/60 mb-4">
                    Cole links de inspiração (Pinterest, Instagram...). Opcional.
                  </p>
                  <div className="space-y-3 mb-4">
                    {answers.referenceUrls.map((url, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 font-body text-sm text-midnight/70 truncate">
                          {url}
                        </div>
                        <button
                          onClick={() =>
                            setAnswers((a) => ({
                              ...a,
                              referenceUrls: a.referenceUrls.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="text-red-400 hover:text-red-600 transition p-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  {answers.referenceUrls.length < 5 && (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={refUrlInput}
                        onChange={(e) => setRefUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && refUrlInput.trim()) {
                            setAnswers((a) => ({
                              ...a,
                              referenceUrls: [...a.referenceUrls, refUrlInput.trim()],
                            }));
                            setRefUrlInput("");
                          }
                        }}
                        placeholder="https://pin.it/... ou cole qualquer URL"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-midnight/40"
                      />
                      <button
                        onClick={() => {
                          if (refUrlInput.trim()) {
                            setAnswers((a) => ({
                              ...a,
                              referenceUrls: [...a.referenceUrls, refUrlInput.trim()],
                            }));
                            setRefUrlInput("");
                          }
                        }}
                        className="bg-midnight text-white px-4 rounded-lg font-body text-sm hover:bg-midnight/90 transition"
                      >
                        Adicionar
                      </button>
                    </div>
                  )}
                  <p className="font-body text-xs text-midnight/40 mt-3">
                    {answers.referenceUrls.length}/5 referências adicionadas
                  </p>
                </div>
              </div>
            )}

            {/* ── STEP 5: Tom de voz ── */}
            {step === 5 && (
              <div>
                <p className="font-body text-xs text-gold uppercase tracking-widest mb-1">
                  {stepLabels[4]}
                </p>
                <h2 className="font-heading text-3xl text-midnight mb-6">
                  Qual o tom de voz do casal?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TONES.map((t) => (
                    <SelectCard
                      key={t.value}
                      selected={answers.tone === t.value}
                      onClick={() => setAnswers((a) => ({ ...a, tone: t.value }))}
                    >
                      <p className="font-heading text-xl text-midnight mb-1">{t.label}</p>
                      <p className="font-body text-xs text-midnight/50 mb-2">{t.desc}</p>
                      <p className="font-body text-xs text-gold italic">{t.example}</p>
                    </SelectCard>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={goPrev}
              className="flex items-center gap-1.5 font-body text-sm text-midnight/60 hover:text-midnight transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
          ) : (
            <div />
          )}

          {step < TOTAL_STEPS ? (
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className="flex items-center gap-1.5 bg-gold text-white font-body font-semibold px-6 py-2.5 rounded-xl hover:bg-gold/90 transition disabled:opacity-40"
            >
              Próximo
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={generate}
              disabled={!canProceed() || generationCount >= FREE_LIMIT}
              className="flex items-center gap-2 bg-midnight text-white font-body font-semibold px-8 py-2.5 rounded-xl hover:bg-midnight/90 transition disabled:opacity-40"
            >
              ✨ Gerar minha identidade
            </button>
          )}
        </div>

        {step === TOTAL_STEPS && generationCount >= FREE_LIMIT && (
          <div className="mt-4 mx-auto max-w-sm">
            <div className="bg-gradient-to-br from-midnight to-midnight rounded-2xl p-5 text-center text-white shadow-lg">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">✨</span>
              </div>
              <p className="font-heading text-base font-semibold mb-1">Você usou suas 3 gerações gratuitas</p>
              <p className="font-body text-xs text-white/70 mb-4 leading-relaxed">
                Noivos no plano Pro geram identidades ilimitadas, exportam em alta resolução e salvam múltiplas versões.
              </p>
              <div className="space-y-2 text-left mb-4">
                {["Gerações ilimitadas de Identity Kit", "Export em PNG e PDF alta resolução", "Salvar até 10 versões favoritas", "Suporte prioritário"].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-midnight flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-body text-xs text-white/90">{f}</span>
                  </div>
                ))}
              </div>
              <button
                className="w-full py-2.5 bg-white text-midnight font-heading font-semibold text-sm rounded-xl hover:bg-white/90 transition"
                onClick={() => window.location.href = "/planos"}
              >
                Desbloquear Pro →
              </button>
              <p className="font-body text-[10px] text-white/40 mt-2">Cancele quando quiser. Sem fidelidade.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
