import type { Metadata } from "next";
import { Raleway, Cormorant_Garamond, DM_Sans } from "next/font/google";
import AuthSessionProvider from "@/components/providers/session-provider";
import ToastProvider from "@/components/providers/toast-provider";
import "./globals.css";

// ── Google Fonts via next/font — BRAND.md v2 typography ──
const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-raleway",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://laco.com.vc";

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
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Laço",
    title: "Laço — Planeje seu casamento",
    description:
      "Organize cada detalhe do seu casamento com inteligência e elegância.",
    url: BASE_URL,
    images: [
      {
        url: "/api/og?names=Laço&date=&style=classico",
        width: 1200,
        height: 630,
        alt: "Laço — Planeje seu casamento",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Laço — Planeje seu casamento",
    description:
      "Organize cada detalhe do seu casamento com inteligência e elegância.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Laço",
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
      className={`${raleway.variable} ${cormorant.variable} ${dmSans.variable}`}
    >
      <head>
        <meta name="theme-color" content="#FAF6EF" />
        <link rel="apple-touch-icon" href="/brand/app-icon-192.png" />
      </head>
      <body className="font-body antialiased bg-ivory text-midnight">
        <AuthSessionProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
