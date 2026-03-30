"use client";

/**
 * ErrorState — componente de estado de erro padrão Laço.
 * Usado nos error.tsx de cada rota.
 */

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHome?: boolean;
}

export function ErrorState({
  title = "Algo deu errado",
  message = "Encontramos um problema ao carregar esta página. Tente novamente.",
  onRetry,
  showHome = true,
}: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-6 pb-24">
      {/* Icon */}
      <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-gold"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>

      {/* Text */}
      <h2 className="font-heading text-xl font-semibold text-midnight mb-2 text-center">
        {title}
      </h2>
      <p className="font-body text-sm text-midnight/60 text-center mb-8 max-w-xs">
        {message}
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full bg-midnight text-white font-heading font-semibold text-sm py-3.5 rounded-xl active:scale-95 transition-transform"
          >
            Tentar novamente
          </button>
        )}
        {showHome && (
          <a
            href="/dashboard"
            className="w-full text-center text-midnight/70 font-body text-sm py-3 rounded-xl border border-midnight/20 active:bg-midnight/5 transition-colors"
          >
            Ir para o início
          </a>
        )}
      </div>
    </div>
  );
}
