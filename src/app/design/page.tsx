// ─── Aba Design — /design ──────────────────────────────────────────────────
// Next.js App Router page — client component wrapper
import { Metadata } from "next";
import DesignPageClient from "@/components/design/DesignPageClient";

export const metadata: Metadata = {
  title: "Meu Design | Laço",
  description: "Crie a identidade visual do seu casamento — escolha toolkit, foto, site e papelaria.",
};

export default function DesignPage() {
  return <DesignPageClient />;
}
