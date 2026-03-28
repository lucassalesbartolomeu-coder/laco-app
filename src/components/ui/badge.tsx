/**
 * Badge — componente de badge/chip Laço.
 * Variantes semânticas para status de convidados, fornecedores, pagamentos, etc.
 */

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "teal"
  | "copper"
  | "gold";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-verde-noite/10 text-verde-noite",
  success: "bg-success/10 text-success",
  warning: "bg-warning/20 text-amber-700",
  error: "bg-error/10 text-error",
  info: "bg-info/10 text-info",
  neutral: "bg-verde-noite/5 text-verde-noite/60",
  teal: "bg-teal/10 text-teal",
  copper: "bg-copper/10 text-copper",
  gold: "bg-gold/20 text-amber-700",
};

const dotStyles: Record<BadgeVariant, string> = {
  default: "bg-verde-noite",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info",
  neutral: "bg-verde-noite/40",
  teal: "bg-teal",
  copper: "bg-copper",
  gold: "bg-gold",
};

const sizeStyles = {
  sm: "text-[10px] px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
};

export function Badge({
  variant = "default",
  size = "md",
  dot = false,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-heading font-semibold rounded-full",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "inline-block rounded-full flex-shrink-0",
            size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
            dotStyles[variant]
          )}
        />
      )}
      {children}
    </span>
  );
}

// ── Helpers para status comuns ──────────────────────────────────

export function RsvpBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    confirmado: { variant: "success", label: "Confirmado" },
    recusado: { variant: "error", label: "Recusou" },
    pendente: { variant: "neutral", label: "Pendente" },
    talvez: { variant: "warning", label: "Talvez" },
  };
  const config = map[status] ?? { variant: "neutral" as BadgeVariant, label: status };
  return (
    <Badge variant={config.variant} dot size="sm">
      {config.label}
    </Badge>
  );
}

export function VendorStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    contratado: { variant: "success", label: "Contratado" },
    cotado: { variant: "warning", label: "Em cotação" },
    descartado: { variant: "neutral", label: "Descartado" },
  };
  const config = map[status] ?? { variant: "neutral" as BadgeVariant, label: status };
  return (
    <Badge variant={config.variant} dot size="sm">
      {config.label}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    completed: { variant: "success", label: "Pago" },
    pending: { variant: "warning", label: "Aguardando" },
    failed: { variant: "error", label: "Falhou" },
  };
  const config = map[status] ?? { variant: "neutral" as BadgeVariant, label: status };
  return (
    <Badge variant={config.variant} dot size="sm">
      {config.label}
    </Badge>
  );
}
