/**
 * Definições dos 6 templates de site para o Identity Kit (Sprint 7B).
 * Cada template mapeia para um estilo de casamento e define cores + tipografia.
 */

export interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
  hero: string; // hero section background
  heroBorder: string; // hero accent color
}

export interface TemplateFonts {
  heading: string; // Google Font family name
  body: string;
  headingGoogleUrl: string;
  bodyGoogleUrl: string;
}

export interface TemplateConfig {
  id: string;
  style: string;
  name: string;
  description: string;
  colors: TemplateColors;
  fonts: TemplateFonts;
  borderRadius: string; // CSS value e.g. "1rem"
}

export const TEMPLATES: Record<string, TemplateConfig> = {
  classico: {
    id: "classico",
    style: "clássico",
    name: "Clássico",
    description: "Elegante, atemporal, linhas formais e paleta sofisticada",
    colors: {
      primary: "#1A1F3A",
      secondary: "#C9A96E",
      accent: "#C9A96E",
      background: "#FAF8F4",
      text: "#1A1A1A",
      muted: "#6B7280",
      hero: "#1A1F3A",
      heroBorder: "#C9A96E",
    },
    fonts: {
      heading: "Cormorant Garamond",
      body: "Lato",
      headingGoogleUrl:
        "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap",
      bodyGoogleUrl:
        "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap",
    },
    borderRadius: "0.5rem",
  },

  rustico: {
    id: "rustico",
    style: "rústico",
    name: "Rústico",
    description: "Earth tones, texturas naturais, tipografia com personalidade",
    colors: {
      primary: "#5C3D2E",
      secondary: "#A67C5B",
      accent: "#C4A882",
      background: "#FDF6ED",
      text: "#2D1B0E",
      muted: "#7D6A5A",
      hero: "#3D2B1F",
      heroBorder: "#C4A882",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Raleway",
      headingGoogleUrl:
        "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap",
      bodyGoogleUrl:
        "https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600&display=swap",
    },
    borderRadius: "0.75rem",
  },

  moderno: {
    id: "moderno",
    style: "moderno",
    name: "Moderno",
    description: "Sans-serif, minimalista, espaços amplos e muito branco",
    colors: {
      primary: "#111827",
      secondary: "#374151",
      accent: "#6B7280",
      background: "#F9FAFB",
      text: "#111827",
      muted: "#6B7280",
      hero: "#111827",
      heroBorder: "#6B7280",
    },
    fonts: {
      heading: "DM Sans",
      body: "DM Sans",
      headingGoogleUrl:
        "https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap",
      bodyGoogleUrl: "", // same as heading
    },
    borderRadius: "0.25rem",
  },

  romantico: {
    id: "romantico",
    style: "romântico",
    name: "Romântico",
    description: "Cursive elegante, rosa e lavanda, gradientes suaves",
    colors: {
      primary: "#9D4E6E",
      secondary: "#C9A96E",
      accent: "#E8A0B4",
      background: "#FDF4F7",
      text: "#2D1320",
      muted: "#9D7A86",
      hero: "#7A3356",
      heroBorder: "#E8A0B4",
    },
    fonts: {
      heading: "Cormorant Garamond",
      body: "Nunito",
      headingGoogleUrl:
        "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap",
      bodyGoogleUrl:
        "https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600&display=swap",
    },
    borderRadius: "1.25rem",
  },

  minimalista: {
    id: "minimalista",
    style: "minimalista",
    name: "Minimalista",
    description: "Preto e branco, tipografia bold, impacto visual forte",
    colors: {
      primary: "#1C1C1C",
      secondary: "#404040",
      accent: "#A0A0A0",
      background: "#FFFFFF",
      text: "#1C1C1C",
      muted: "#9CA3AF",
      hero: "#0A0A0A",
      heroBorder: "#A0A0A0",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      headingGoogleUrl:
        "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;800&display=swap",
      bodyGoogleUrl: "", // same as heading
    },
    borderRadius: "0rem",
  },

  boho: {
    id: "boho",
    style: "boho",
    name: "Boho",
    description: "Tons quentes, formas orgânicas, espírito livre e artístico",
    colors: {
      primary: "#7C5C3E",
      secondary: "#BF8D6B",
      accent: "#C9A96E",
      background: "#FBF6EE",
      text: "#3D2B1F",
      muted: "#9C8472",
      hero: "#5A3F2A",
      heroBorder: "#C9A96E",
    },
    fonts: {
      heading: "Josefin Sans",
      body: "Nunito",
      headingGoogleUrl:
        "https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,300;0,400;0,600;0,700;1,300&display=swap",
      bodyGoogleUrl:
        "https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600&display=swap",
    },
    borderRadius: "1rem",
  },
};

export const DEFAULT_TEMPLATE = TEMPLATES.classico;

/** Normaliza o nome do estilo para chave do template */
export function getTemplate(style?: string | null): TemplateConfig {
  if (!style) return DEFAULT_TEMPLATE;
  const key = style
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  return TEMPLATES[key] ?? DEFAULT_TEMPLATE;
}

/** Paletas pré-definidas para o passo 2 do quiz */
export interface PresetPalette {
  id: string;
  name: string;
  description: string;
  colors: string[]; // array de 5 hex para preview
}

export const PRESET_PALETTES: PresetPalette[] = [
  {
    id: "marfim-dourado",
    name: "Marfim & Dourado",
    description: "Elegante e atemporal",
    colors: ["#C9A84C", "#8B6914", "#F5E6C8", "#FDFAF4", "#2C1810"],
  },
  {
    id: "verde-cobre",
    name: "Verde & Cobre",
    description: "Natural e sofisticado",
    colors: ["#1A1F3A", "#1A1F3A", "#C9A96E", "#FAF8F4", "#C9A96E"],
  },
  {
    id: "rosa-champagne",
    name: "Rosa & Champagne",
    description: "Delicado e romântico",
    colors: ["#C4768A", "#E8C9B0", "#F2DECA", "#FDF5F7", "#3D1A25"],
  },
  {
    id: "azul-prata",
    name: "Azul & Prata",
    description: "Formal e refinado",
    colors: ["#1E3A5F", "#7BA7BC", "#B8C9D5", "#F5F7FA", "#0D1F33"],
  },
  {
    id: "vinho-nude",
    name: "Vinho & Nude",
    description: "Intenso e apaixonado",
    colors: ["#722F37", "#A05060", "#C4A882", "#FDF7F4", "#2C1010"],
  },
  {
    id: "preto-ouro",
    name: "Preto & Ouro",
    description: "Luxuoso e glamoroso",
    colors: ["#1A1A1A", "#404040", "#C9A84C", "#F5D483", "#FAFAFA"],
  },
];
