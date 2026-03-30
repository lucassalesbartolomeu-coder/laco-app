"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ToastContext,
  useToast,
  useToastState,
  type Toast as ToastItem,
  type ToastType,
} from "@/hooks/use-toast";

// Re-exportar useToast para imports diretos deste módulo
export { useToast };

// ── Icons ──────────────────────────────────────────────────────────────────────

function IconSuccess() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconError() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconWarning() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}

// ── Variant config ─────────────────────────────────────────────────────────────

type VariantConfig = {
  container: string;
  icon: string;
  progress: string;
  IconEl: () => JSX.Element;
};

const VARIANT_STYLES: Record<ToastType, VariantConfig> = {
  success: {
    // midnight #1A1F3A
    container: "bg-[#1A1F3A] text-white shadow-lg",
    icon: "text-white/90",
    progress: "bg-white/50",
    IconEl: IconSuccess,
  },
  error: {
    container: "bg-red-500 text-white shadow-lg",
    icon: "text-white/90",
    progress: "bg-white/50",
    IconEl: IconError,
  },
  warning: {
    // gold #C9A96E
    container: "bg-[#C9A96E] text-white shadow-lg",
    icon: "text-white/90",
    progress: "bg-white/50",
    IconEl: IconWarning,
  },
  info: {
    // verde-noite #1A1F3A
    container: "bg-[#1A1F3A] text-white shadow-lg",
    icon: "text-white/90",
    progress: "bg-white/50",
    IconEl: IconInfo,
  },
};

// ── Single Toast card ──────────────────────────────────────────────────────────

function ToastCard({ toast }: { toast: ToastItem }) {
  const { removeToast } = useToast();
  const duration = toast.duration ?? 4000;
  const [progress, setProgress] = useState(100);
  const startTime = useRef(Date.now());
  const rafRef = useRef<number | null>(null);

  // Barra de progresso + auto-dismiss via rAF
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startTime.current;
      const remaining = Math.max(0, 1 - elapsed / duration);
      setProgress(remaining * 100);
      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        removeToast(toast.id);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, toast.id]);

  const v = VARIANT_STYLES[toast.type];
  const Icon = v.IconEl;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        "relative flex items-start gap-3 rounded-xl px-4 py-3",
        "w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden",
        v.container,
      ].join(" ")}
    >
      <span className={v.icon}>
        <Icon />
      </span>
      <p className="flex-1 font-body text-sm leading-snug pt-0.5">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 text-white/60 hover:text-white transition-colors mt-0.5"
        aria-label="Fechar notificação"
      >
        <IconClose />
      </button>
      {/* Barra de progresso */}
      <span
        className={`absolute bottom-0 left-0 h-0.5 ${v.progress} transition-none`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// ── Toast stack (portal de notificações) ──────────────────────────────────────

export function ToastStack() {
  const { toasts } = useToast();

  return (
    <div
      aria-label="Notificações"
      className={[
        "fixed z-[9999] flex flex-col gap-2 pointer-events-none",
        // Mobile: centralizado na parte inferior
        "bottom-5 left-0 right-0 items-center",
        // Desktop: canto inferior direito
        "sm:left-auto sm:right-5 sm:items-end",
      ].join(" ")}
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className="pointer-events-auto"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            layout
          >
            <ToastCard toast={t} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── ToastProvider ──────────────────────────────────────────────────────────────

interface ToastProviderProps {
  children?: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const state = useToastState();

  return (
    <ToastContext.Provider value={state}>
      {children}
      <ToastStack />
    </ToastContext.Provider>
  );
}
