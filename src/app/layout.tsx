import type { Metadata } from "next";
import AuthSessionProvider from "@/components/providers/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Laco — Planeje seu casamento",
  description:
    "Organize cada detalhe do seu casamento com inteligencia e elegancia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-body antialiased bg-off-white text-verde-noite">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
