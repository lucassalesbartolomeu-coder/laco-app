/**
 * Input — campo de texto Laço.
 * Estilo DM Sans, borda midnight/10, focus gold.
 */

import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-body font-medium text-midnight/80"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full px-4 py-3 rounded-xl bg-white border font-body text-sm text-midnight",
              "placeholder-stone/60",
              "transition-all duration-150",
              "focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold",
              error
                ? "border-error/40 focus:ring-error/20 focus:border-error"
                : "border-midnight/10 hover:border-midnight/20",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              props.disabled && "opacity-50 cursor-not-allowed bg-fog",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs font-body text-error mt-1">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs font-body text-stone mt-1">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
