import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Brand palette (BRAND.md v2) ─────────────────────────── */
        midnight:  "#1A1F3A",
        gold:      "#C9A96E",
        champagne: "#E8D5B0",
        ivory:     "#FAF7F2",
        fog:       "#F0EDE7",
        stone:     "#8A8FA8",

        /* ── Legacy aliases (backward compat) ────────────────────── */
        "verde-noite": "#1A1F3A",   // → midnight
        teal:          "#1A1F3A",   // → midnight
        copper:        "#C9A96E",   // → gold
        "off-white":   "#FAF7F2",   // → ivory
        cream:         "#F0EDE7",   // → fog

        /* ── CSS variable bridge ─────────────────────────────────── */
        background: "var(--background)",
        foreground: "var(--foreground)",

        /* ── Semantic colors ─────────────────────────────────────── */
        success: "#34C77B",
        warning: "#F5A623",
        error:   "#E54D4D",
        info:    "#4A90D9",
      },
      fontFamily: {
        display: ["var(--font-raleway)", "Raleway", "sans-serif"],
        heading: ["var(--font-dm-sans)", "DM Sans", "system-ui", "sans-serif"],
        body:    ["var(--font-dm-sans)", "DM Sans", "system-ui", "sans-serif"],
        /* Editorial — uso raro, quotes e splash */
        editorial: ["var(--font-cormorant)", "Cormorant Garamond", "Georgia", "serif"],
        /* Legacy alias */
        logo:    ["var(--font-raleway)", "Raleway", "sans-serif"],
      },
      borderRadius: {
        card:  "10px",
        modal: "16px",
        phone: "28px",
        pill:  "999px",
      },
      boxShadow: {
        card:  "0 2px 12px rgba(0,0,0,0.08)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.12)",
        modal: "0 24px 64px rgba(0,0,0,0.20)",
        float: "0 8px 32px rgba(0,0,0,0.14)",
      },
      animation: {
        "fade-in":   "fadeIn 0.3s ease-out",
        "slide-up":  "slideUp 0.3s ease-out",
        "scale-in":  "scaleIn 0.2s ease-out",
        shimmer:     "shimmer 1.6s ease-in-out infinite",
        "pulse-soft":"pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
