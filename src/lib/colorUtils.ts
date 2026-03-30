/**
 * Utilitários de cor para o Laço.
 * Gera paletas dinâmicas baseadas nos estilos de casamento.
 *
 * Estilos suportados: clássico, rústico, moderno, romântico, minimalista, boho
 */

export type WeddingStyle =
  | "clássico"
  | "classico"
  | "rústico"
  | "rustico"
  | "moderno"
  | "romântico"
  | "romantico"
  | "minimalista"
  | "boho"
  | string;

export interface WeddingPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
}

// Paletas por estilo de casamento
const STYLE_PALETTES: Record<string, WeddingPalette> = {
  classico: {
    primary: "#1A1F3A",
    secondary: "#C9A96E",
    accent: "#C9A96E",
    background: "#FAF8F4",
    text: "#1A1A1A",
    muted: "#6B7280",
  },
  rustico: {
    primary: "#5C3D2E",
    secondary: "#A67C5B",
    accent: "#C4A882",
    background: "#FDF6ED",
    text: "#2D1B0E",
    muted: "#7D6A5A",
  },
  moderno: {
    primary: "#111827",
    secondary: "#374151",
    accent: "#6B7280",
    background: "#F9FAFB",
    text: "#111827",
    muted: "#6B7280",
  },
  romantico: {
    primary: "#9D4E6E",
    secondary: "#C9A96E",
    accent: "#E8A0B4",
    background: "#FDF4F7",
    text: "#2D1320",
    muted: "#9D7A86",
  },
  minimalista: {
    primary: "#1C1C1C",
    secondary: "#404040",
    accent: "#A0A0A0",
    background: "#FFFFFF",
    text: "#1C1C1C",
    muted: "#9CA3AF",
  },
  boho: {
    primary: "#7C5C3E",
    secondary: "#BF8D6B",
    accent: "#C9A96E",
    background: "#FBF6EE",
    text: "#3D2B1F",
    muted: "#9C8472",
  },
};

// Paleta padrão Laço
const DEFAULT_PALETTE: WeddingPalette = STYLE_PALETTES.classico;

/**
 * Normaliza o nome do estilo para lookup.
 */
function normalizeStyle(style: string): string {
  return style
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Retorna a paleta de cores para um estilo de casamento.
 */
export function getPalette(style?: WeddingStyle | null): WeddingPalette {
  if (!style) return DEFAULT_PALETTE;
  const normalized = normalizeStyle(style);
  return STYLE_PALETTES[normalized] ?? DEFAULT_PALETTE;
}

/**
 * Retorna variáveis CSS como objeto para uso em style={{ ... }}.
 */
export function getPaletteCSSVars(style?: WeddingStyle | null): Record<string, string> {
  const p = getPalette(style);
  return {
    "--color-primary": p.primary,
    "--color-secondary": p.secondary,
    "--color-accent": p.accent,
    "--color-background": p.background,
    "--color-text": p.text,
    "--color-muted": p.muted,
  };
}

/**
 * Retorna classe Tailwind de gradiente para o estilo.
 * Usado em headers e banners do site público.
 */
export function getGradientClass(style?: WeddingStyle | null): string {
  const normalized = normalizeStyle(style ?? "");
  const gradients: Record<string, string> = {
    classico: "from-[#1A1F3A] to-[#C9A96E]",
    rustico: "from-[#5C3D2E] to-[#A67C5B]",
    moderno: "from-[#111827] to-[#374151]",
    romantico: "from-[#9D4E6E] to-[#E8A0B4]",
    minimalista: "from-[#1C1C1C] to-[#A0A0A0]",
    boho: "from-[#7C5C3E] to-[#C9A96E]",
  };
  return gradients[normalized] ?? gradients.classico;
}

/**
 * Lista todos os estilos disponíveis.
 */
export function getAvailableStyles(): { value: string; label: string }[] {
  return [
    { value: "clássico", label: "Clássico" },
    { value: "rústico", label: "Rústico" },
    { value: "moderno", label: "Moderno" },
    { value: "romântico", label: "Romântico" },
    { value: "minimalista", label: "Minimalista" },
    { value: "boho", label: "Boho" },
  ];
}

/**
 * Valida se um estilo é suportado.
 */
export function isValidStyle(style: string): boolean {
  return Object.keys(STYLE_PALETTES).includes(normalizeStyle(style));
}
