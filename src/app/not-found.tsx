import Link from "next/link";
import type { Metadata } from "next";
import { Illustration404 } from "@/components/illustrations";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <span className="font-display text-3xl text-midnight mb-8 tracking-wide">
        Laço
      </span>

      {/* Content */}
      <div className="text-center max-w-xs">
        <Illustration404 className="mx-auto mb-4" />
        <p className="font-heading text-6xl font-bold text-midnight/10 mb-2">
          404
        </p>
        <h1 className="font-heading text-xl font-semibold text-midnight mb-3">
          Página não encontrada
        </h1>
        <p className="font-body text-sm text-midnight/60 mb-8">
          O link que você acessou não existe ou foi removido.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full bg-midnight text-white font-heading font-semibold text-sm py-3.5 rounded-xl text-center block"
          >
            Ir para o início
          </Link>
          <Link
            href="/login"
            className="w-full text-midnight/70 font-body text-sm py-3 rounded-xl border border-midnight/20 text-center block"
          >
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
}
