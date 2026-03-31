/**
 * PageHeader — hero section escura no topo de cada tela do casamento.
 * Gradiente midnight com partículas decorativas opcionais.
 * Recebe título, subtítulo, children opcionais (stats, actions).
 */

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Stat badges, counters, action buttons below title */
  children?: ReactNode;
  /** Optional label above the title (e.g. "ORÇAMENTO") */
  label?: string;
  /** Compact header for inner pages */
  compact?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  children,
  label,
  compact = false,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-midnight via-midnight to-midnight/95",
        compact ? "px-5 pt-10 pb-6" : "px-5 pt-12 pb-8",
        className
      )}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gold/[0.04] rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-champagne/[0.03] rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />

      <div className="relative max-w-lg mx-auto">
        {label && (
          <span className="inline-block text-[10px] font-body font-medium tracking-[0.2em] uppercase text-gold/80 mb-2">
            {label}
          </span>
        )}

        <h1
          className={cn(
            "font-body font-light text-ivory leading-tight",
            compact ? "text-xl" : "text-2xl"
          )}
        >
          {title}
        </h1>

        {subtitle && (
          <p className="font-body text-sm text-ivory/50 mt-1.5 leading-relaxed">
            {subtitle}
          </p>
        )}

        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

/** Stat badge to use inside PageHeader */
export function HeaderStat({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="font-body text-xl font-light text-ivory">{value}</span>
      <span className="font-body text-[10px] text-ivory/40 tracking-wide uppercase">{label}</span>
    </div>
  );
}
