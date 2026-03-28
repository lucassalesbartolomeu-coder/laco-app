"use client";

/**
 * Button — componente de botão Laço.
 * Variantes: primary, secondary, ghost, destructive, copper.
 * Tamanhos: sm, md, lg.
 * Estados: loading, disabled.
 */

import { cn } from "@/lib/utils";
import { Spinner } from "./skeleton";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "copper";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-verde-noite text-white hover:bg-verde-noite/90 active:bg-verde-noite/80",
  secondary:
    "bg-white text-verde-noite border border-verde-noite/20 hover:bg-verde-noite/5 active:bg-verde-noite/10",
  ghost:
    "bg-transparent text-verde-noite hover:bg-verde-noite/5 active:bg-verde-noite/10",
  destructive:
    "bg-error text-white hover:bg-error/90 active:bg-error/80",
  copper:
    "bg-copper text-white hover:bg-copper/90 active:bg-copper/80",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-4 text-xs gap-1.5 rounded-lg",
  md: "h-11 px-5 text-sm gap-2 rounded-xl",
  lg: "h-14 px-6 text-base gap-2.5 rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  children,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={cn(
        // Base
        "inline-flex items-center justify-center font-heading font-semibold",
        "transition-all duration-150 select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2",
        "active:scale-[0.98]",
        // Disabled
        isDisabled && "opacity-50 cursor-not-allowed active:scale-100",
        // Variant
        variantStyles[variant],
        // Size
        sizeStyles[size],
        className
      )}
    >
      {loading ? (
        <Spinner className="h-4 w-4" />
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!loading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
}
