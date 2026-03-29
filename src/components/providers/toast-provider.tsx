"use client";

import { ToastProvider } from "@/components/ui/toast";

/**
 * Wrapper do ToastProvider para uso no layout raiz.
 * Envolve os filhos com o contexto de toasts e renderiza a pilha de notificações.
 */
export default function ToastProviderWrapper({
  children,
}: {
  children?: React.ReactNode;
}) {
  return <ToastProvider>{children}</ToastProvider>;
}
