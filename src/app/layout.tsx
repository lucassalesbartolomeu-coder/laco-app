import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import AuthSessionProvider from "@/components/providers/session-provider";
import "./globals.css";

// ── Google Fonts via next/font — zero CLS, otimizado automaticamente ──
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Laço — Planeje seu casamento",
    template: "%s | Laço",
  },
  description:
    "Organize cada detalhe do seu casamento com inteligência e elegância. Lista de presentes, RSVP, orçamento e muito mais.",
  keywords: [
    "planejamento de casamento",
    "lista de casamento",
    "RSVP casamento",
    "organizar casamento",
    "lista de presentes casamento",
  ],
  authors: [{ name: "Laço" }],
  creator: "Laço",
  metadataBase: new URL(
    process.env.NEXTAUTH_URL ?? "https://laco.app"
  ),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Laço",
    title: "Laço — Planeje seu casamento",
    description:
      "Organize cada detalhe do seu casamento com inteligência e elegância.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${cormorant.variable} ${plusJakarta.variable}`}
    >
      <body className="font-body antialiased bg-off-white text-verde-noite">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
