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
        background: "var(--background)",
        foreground: "var(--foreground)",
        "verde-noite": "#1A3A33",
        teal: "#2C6B5E",
        copper: "#C4734F",
        "off-white": "#F7F7F7",
        cream: "#F5F3EF",
      },
      fontFamily: {
        heading: ["Cormorant Garamond", "serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
