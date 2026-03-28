/**
 * Skeleton — componente de loading state pulsante.
 * Padrão Laço: verde-noite/cream palette.
 */

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-gradient-to-r from-verde-noite/8 via-verde-noite/4 to-verde-noite/8 bg-[length:200%_100%] animate-shimmer",
        className
      )}
      aria-hidden="true"
    />
  );
}

// ── Page-level skeletons ────────────────────────────────────────

/** Skeleton genérico para páginas com cards de conteúdo */
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-off-white pb-24">
      {/* Header bar */}
      <div className="bg-verde-noite px-4 pt-12 pb-6">
        <Skeleton className="h-4 w-24 bg-white/20 mb-2" />
        <Skeleton className="h-7 w-48 bg-white/30" />
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-4">
        {/* Hero card */}
        <Skeleton className="h-32 w-full rounded-2xl" />

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>

        {/* List items */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton para dashboard do casal */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-off-white pb-24">
      {/* Header */}
      <div className="bg-verde-noite px-4 pt-12 pb-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 bg-white/20" />
            <Skeleton className="h-6 w-40 bg-white/30" />
            <Skeleton className="h-4 w-32 bg-white/20" />
          </div>
          <Skeleton className="h-24 w-24 rounded-full bg-white/20" />
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>

        {/* Quick actions */}
        <Skeleton className="h-5 w-32 mt-2" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Skeleton para lista de itens (convidados, fornecedores, etc) */
export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="min-h-screen bg-off-white pb-24">
      {/* Header */}
      <div className="bg-verde-noite px-4 pt-12 pb-6">
        <Skeleton className="h-4 w-20 bg-white/20 mb-2" />
        <Skeleton className="h-7 w-44 bg-white/30 mb-1" />
        <Skeleton className="h-3 w-32 bg-white/20" />
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Search bar */}
        <Skeleton className="h-12 w-full rounded-xl" />

        {/* Stats chips */}
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>

        {/* List */}
        {[...Array(rows)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm"
          >
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton para páginas de orçamento/financeiro com gráficos */
export function FinanceSkeleton() {
  return (
    <div className="min-h-screen bg-off-white pb-24">
      <div className="bg-verde-noite px-4 pt-12 pb-6">
        <Skeleton className="h-4 w-20 bg-white/20 mb-2" />
        <Skeleton className="h-7 w-36 bg-white/30" />
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Summary card */}
        <Skeleton className="h-36 w-full rounded-2xl" />

        {/* Progress bars */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Spinner simples para transições rápidas */
export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
      role="status"
      aria-label="Carregando..."
    />
  );
}
