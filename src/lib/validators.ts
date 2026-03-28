/**
 * Validators e schemas Zod para o Laço.
 * Baseado no Colo — mantidos schemas genéricos, criados schemas de casamento.
 */
import { z } from "zod";

// ─── Helpers ───────────────────────────────────────────────

export function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return false;
  if (/^(\d)\1+$/.test(clean)) return false; // todos dígitos iguais

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(clean[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  return rest === parseInt(clean[10]);
}

const DISPOSABLE_DOMAINS = [
  "mailinator.com", "guerrillamail.com", "tempmail.com",
  "10minutemail.com", "throwaway.email", "yopmail.com",
  "sharklasers.com", "guerrillamailblock.com", "grr.la",
  "spam4.me", "trashmail.me", "dispostable.com",
];

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.some((d) => domain?.endsWith(d));
}

// ─── Auth Schemas ──────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(100),
  email: z
    .string()
    .email("Email inválido")
    .refine((e) => !isDisposableEmail(e), "Use um email real"),
  password: z
    .string()
    .min(8, "Senha deve ter ao menos 8 caracteres")
    .regex(/[A-Z]/, "Senha deve ter ao menos uma letra maiúscula")
    .regex(/[0-9]/, "Senha deve ter ao menos um número"),
  role: z.enum(["COUPLE", "PLANNER"]).default("COUPLE"),
});

// ─── Wedding Schemas ───────────────────────────────────────

export const weddingSchema = z.object({
  partnerName1: z.string().min(2, "Nome obrigatório").max(100),
  partnerName2: z.string().min(2, "Nome obrigatório").max(100),
  weddingDate: z.string().optional().nullable(),
  venue: z.string().max(200).optional().nullable(),
  venueAddress: z.string().max(300).optional().nullable(),
  ceremonyVenue: z.string().max(200).optional().nullable(),
  ceremonyAddress: z.string().max(300).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(2).optional().nullable(),
  style: z.string().max(50).optional().nullable(), // clássico, rústico, moderno, romântico, minimalista, boho
  storyText: z.string().max(2000).optional().nullable(),
  estimatedGuests: z.number().int().min(0).max(5000).optional().nullable(),
  estimatedBudget: z.number().min(0).optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  message: z.string().max(500).optional().nullable(),
});

export const weddingBankSchema = z.object({
  bankCode: z.string().length(3, "Código do banco deve ter 3 dígitos"),
  bankAgency: z.string().min(1).max(10),
  bankAccount: z.string().min(1).max(20),
  bankAccountType: z.enum(["corrente", "poupanca"]),
  bankCpf: z
    .string()
    .refine((c) => isValidCPF(c), "CPF inválido"),
  hostFullName: z.string().min(3).max(100),
});

// ─── Guest Schemas ─────────────────────────────────────────

export const guestSchema = z.object({
  name: z.string().min(2, "Nome obrigatório").max(100),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(2).optional().nullable(),
  ddd: z.string().max(3).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  plusOne: z.boolean().default(false),
  dietaryRestriction: z.string().max(200).optional().nullable(),
  accommodation: z.boolean().default(false),
  needsTransport: z.boolean().default(false),
  notes: z.string().max(500).optional().nullable(),
});

export const rsvpSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional().nullable(),
  confirmed: z.boolean(),
  message: z.string().max(500).optional().nullable(),
  plusOne: z.boolean().default(false),
  dietaryRestriction: z.string().max(200).optional().nullable(),
});

// ─── Gift Schemas ──────────────────────────────────────────

export const giftSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(500).optional().nullable(),
  amount: z.number().int().min(100).optional().nullable(), // mínimo R$1,00
  image: z.string().url().optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  url: z.string().url().optional().nullable(),
  store: z.string().max(100).optional().nullable(),
  sortOrder: z.number().int().default(0),
});

// ─── Payment Schemas ───────────────────────────────────────

export const paymentSchema = z.object({
  giftId: z.string().cuid("ID de presente inválido"),
  weddingId: z.string().cuid("ID de casamento inválido"),
  guestName: z.string().min(2).max(100),
  guestEmail: z.string().email().optional().nullable(),
  guestPhone: z.string().max(20).optional().nullable(),
  guestCpf: z
    .string()
    .optional()
    .nullable()
    .refine((c) => !c || isValidCPF(c), "CPF inválido"),
  message: z.string().max(300).optional().nullable(),
  paymentMethod: z.enum(["pix", "boleto", "credit_card"]).default("pix"),
});

// ─── Vendor Schemas ────────────────────────────────────────

export const vendorSchema = z.object({
  name: z.string().min(2).max(200),
  category: z.string().min(1).max(50),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
  website: z.string().url().optional().nullable(),
  budget: z.number().min(0).optional().nullable(),
  status: z.enum(["cotado", "contratado", "descartado"]).default("cotado"),
  notes: z.string().max(500).optional().nullable(),
});

// ─── Bank Account / Withdrawal Schemas ────────────────────

export const bankAccountSchema = z.object({
  bankCode: z.string().length(3),
  bankAgency: z.string().min(1).max(10),
  bankAccount: z.string().min(1).max(20),
  bankAccountType: z.enum(["corrente", "poupanca"]),
  bankCpf: z.string().refine((c) => isValidCPF(c), "CPF inválido"),
});

export const pixWithdrawalSchema = z.object({
  amount: z.number().int().min(100, "Valor mínimo R$1,00"),
  weddingId: z.string().cuid(),
});
