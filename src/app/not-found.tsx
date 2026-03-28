import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-off-white flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <span className="font-logo text-3xl text-verde-noite mb-8 tracking-wide">
        Laço
      </span>

      {/* Content */}
      <div className="text-center max-w-xs">
        <p className="font-heading text-6xl font-bold text-verde-noite/10 mb-2">
          404
        </p>
        <h1 className="font-heading text-xl font-semibold text-verde-noite mb-3">
          Página não encontrada
        </h1>
        <p className="font-body text-sm text-verde-noite/60 mb-8">
          O link que você acessou não existe ou foi removido.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full bg-verde-noite text-white font-heading font-semibold text-sm py-3.5 rounded-xl text-center block"
          >
            Ir para o início
          </Link>
          <Link
            href="/login"
            className="w-full text-verde-noite/70 font-body text-sm py-3 rounded-xl border border-verde-noite/20 text-center block"
          >
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
}
