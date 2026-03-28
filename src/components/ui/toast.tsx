"use client";

import { useEffect, useRef, useState } from "react";
import type { Toast as ToastType, ToastVariant } from "@/hooks/use-toast";
import { useToast } from "@/hooks/use-toast";

// ── Icon components ────────────────────────────────────────────────────────────

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

const VARIANT_STYLES: Record<
  ToastVariant,
  { container: string; icon: string; progress: string; IconEl: () => JSX.Element }
> = {
  success: {
    container: "bg-white border border-green-200 text-verde-noite shadow-lg",
    icon: "text-green-600",
    progress: "bg-green-500",
    IconEl: IconSuccess,
  },
  error: {
    container: "bg-white border border-red-200 text-verde-noite shadow-lg",
    icon: "text-red-500",
    progress: "bg-red-500",
    IconEl: IconError,
  },
  warning: {
    container: "bg-white border border-amber-200 text-verde-noite shadow-lg",
    icon: "text-amber-500",
    progress: "bg-amber-400",
    IconEl: IconWarning,
  },
  info: {
    container: "bg-white border border-teal/30 text-verde-noite shadow-lg",
    icon: "text-teal",
    progress: "bg-teal",
    IconEl: IconInfo,
  },
};

// ── Single Toast item ──────────────────────────────────────────────────────────

interface ToastItemProps {
  toast: ToastType;
}

function ToastItem({ toast }: ToastItemProps) {
  const remove = useToast((s) => s.remove);
  const duration = toast.duration ?? 4000;
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);
  const startTime = useRef(Date.now());
  const rafRef = useRef<number | null>(null);

  // Slide-in on mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Progress bar + auto-dismiss
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startTime.current;
      const remaining = Math.max(0, 1 - elapsed / duration);
      setProgress(remaining * 100);
      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        handleDismiss();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  function handleDismiss() {
    setVisible(false);
    setTimeout(() => remove(toast.id), 300);
  }

  const v = VARIANT_STYLES[toast.variant];
  const Icon = v.IconEl;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        relative flex items-start gap-3 rounded-xl px-4 py-3 min-w-[280px] max-w-sm overflow-hidden
        transition-all duration-300 ease-out
        ${v.container}
        ${visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      <span className={v.icon}>
        <Icon />
      </span>
      <p className="flex-1 font-body text-sm leading-snug pt-0.5">{toast.message}</p>
      <button
        onClick={handleDismiss}
        className="shrink-0 text-verde-noite/40 hover:text-verde-noite/80 transition-colors mt-0.5"
        aria-label="Fechar"
      >
        <IconClose />
      </button>
      {/* Progress bar */}
      <span
        className={`absolute bottom-0 left-0 h-0.5 ${v.progress} transition-none`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// ── Toast stack (exported for use in provider) ─────────────────────────────────

export function ToastStack() {
  const toasts = useToast((s) => s.toasts);

  return (
    <div
      aria-label="Notificações"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
}
