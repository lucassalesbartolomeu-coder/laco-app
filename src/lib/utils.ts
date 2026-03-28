/**
 * Utilitários gerais do Laço.
 * Adaptado do Colo — funções genéricas mantidas, adicionadas funções de casamento.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── Tailwind ────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Formatação ──────────────────────────────────────────────

/**
 * Formata valor em centavos para BRL.
 * Ex: 15000 → "R$ 150,00"
 */
export function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Formata data ISO para pt-BR.
 * Ex: "2025-06-15" → "15 de junho de 2025"
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Formata data curta.
 * Ex: "2025-06-15" → "15/06/2025"
 */
export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR");
}

/**
 * Formata telefone brasileiro.
 * Ex: "11999998888" → "(11) 99999-8888"
 */
export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return phone;
}

/**
 * Formata CPF.
 * Ex: "12345678901" → "123.456.789-01"
 */
export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return cpf;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
}

// ─── Strings ─────────────────────────────────────────────────

/**
 * Gera slug a partir de um texto.
 * Ex: "Ana & Pedro" → "ana-pedro"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Trunca texto com reticências.
 * Ex: truncate("Ana e Pedro se casam", 12) → "Ana e Pedro..."
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Capitaliza a primeira letra de cada palavra.
 */
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Retorna as iniciais de um nome (máx 2 letras).
 * Ex: "Ana Carolina Souza" → "AS"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ─── Casamento ───────────────────────────────────────────────

/**
 * Calcula dias restantes para o casamento.
 * Retorna null se data não definida, negativo se já passou.
 */
export function daysUntilWedding(weddingDate: string | Date | null | undefined): number | null {
  if (!weddingDate) return null;
  const target = typeof weddingDate === "string" ? new Date(weddingDate) : weddingDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Formata o countdown para o casamento.
 * Ex: "45 dias" | "Hoje é o grande dia! 🎉" | "Há 3 dias"
 */
export function formatWeddingCountdown(weddingDate: string | Date | null | undefined): string {
  const days = daysUntilWedding(weddingDate);
  if (days === null) return "Data não definida";
  if (days === 0) return "Hoje é o grande dia! 🎉";
  if (days === 1) return "Amanhã!";
  if (days > 1) return `${days} dias`;
  if (days === -1) return "Há 1 dia";
  return `Há ${Math.abs(days)} dias`;
}

/**
 * Calcula percentual da meta de orçamento.
 */
export function budgetProgress(totalRaised: number, estimatedBudget: number | null): number {
  if (!estimatedBudget || estimatedBudget === 0) return 0;
  return Math.min(100, Math.round((totalRaised / estimatedBudget) * 100));
}

// ─── Arrays / Objects ────────────────────────────────────────

/**
 * Agrupa array por chave.
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const k = String(item[key]);
      if (!acc[k]) acc[k] = [];
      acc[k].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Remove duplicados de array por chave.
 */
export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set();
  return arr.filter((item) => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ─── URLs ────────────────────────────────────────────────────

/**
 * Retorna URL pública de uma lista de presentes.
 * Ex: getWeddingUrl("ana-pedro") → "https://laco.app/lista/ana-pedro"
 */
export function getWeddingUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://laco.app";
  return `${base}/lista/${slug}`;
}

/**
 * Verifica se uma URL é válida.
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ─── Misc ────────────────────────────────────────────────────

/**
 * Sleep assíncrono.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Gera um ID aleatório simples (não criptográfico).
 */
export function randomId(length = 8): string {
  return Math.random().toString(36).slice(2, 2 + length);
}
