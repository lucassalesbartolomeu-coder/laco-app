/**
 * Card — componente de card Laço.
 * Variantes: default, elevated, flat, tinted.
 */

import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "flat" | "tinted" | "dark";
  padding?: "none" | "sm" | "md" | "lg";
  children: ReactNode;
}

const variantStyles: Record<NonNullable<CardProps["variant"]>, string> = {
  default: "bg-white border border-midnight/8 shadow-card",
  elevated: "bg-white shadow-card-hover",
  flat: "bg-white border border-midnight/10",
  tinted: "bg-fog border border-midnight/8",
  dark: "bg-midnight text-white",
};

const paddingStyles: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function Card({
  variant = "default",
  padding = "md",
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-2xl",
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

export function CardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "font-heading font-semibold text-base text-midnight leading-snug",
        className
      )}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("font-body text-sm text-midnight/60 mt-1", className)}>
      {children}
    </p>
  );
}

export function CardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mt-4 pt-4 border-t border-midnight/8", className)}>
      {children}
    </div>
  );
}
