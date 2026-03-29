"use client";

import { createContext, useContext, useState, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface ToastContextValue {
  toasts: Toast[];
  /** Adiciona um toast. Mantém no máximo 3 simultâneos (remove o mais antigo). */
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  // Atalhos de conveniência compatíveis com código existente
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

// ── Context ────────────────────────────────────────────────────────────────────

export const ToastContext = createContext<ToastContextValue | null>(null);

// ── Hook principal ─────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast deve ser usado dentro de <ToastProvider>");
  }
  return ctx;
}

// ── State factory (usado internamente pelo ToastProvider) ──────────────────────

const MAX_TOASTS = 3;
const DEFAULT_DURATION = 4000;

export function useToastState(): ToastContextValue {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType, duration = DEFAULT_DURATION) => {
      const id = Math.random().toString(36).slice(2, 9);
      setToasts((prev) => {
        const next = [...prev, { id, message, type, duration }];
        return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
      });
    },
    [],
  );

  const success = useCallback(
    (message: string, duration?: number) => addToast(message, "success", duration),
    [addToast],
  );

  const error = useCallback(
    (message: string, duration?: number) => addToast(message, "error", duration),
    [addToast],
  );

  const warning = useCallback(
    (message: string, duration?: number) => addToast(message, "warning", duration),
    [addToast],
  );

  const info = useCallback(
    (message: string, duration?: number) => addToast(message, "info", duration),
    [addToast],
  );

  return { toasts, addToast, removeToast, success, error, warning, info };
}
