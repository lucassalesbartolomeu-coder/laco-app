import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(100),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres").max(100),
  role: z.enum(["COUPLE", "PLANNER"]).optional().default("COUPLE"),
});

export const weddingSchema = z.object({
  partnerName1: z.string().min(2).max(100),
  partnerName2: z.string().min(2).max(100),
  weddingDate: z.string().datetime({ offset: true }).optional().nullable(),
  venue: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(2).optional().nullable(),
  style: z.string().max(50).optional().nullable(),
  estimatedGuests: z.number().int().min(1).max(2000).optional().nullable(),
  estimatedBudget: z.number().min(0).optional().nullable(),
});

export const guestSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  rsvpStatus: z.enum(["pendente", "confirmado", "recusado"]).optional().default("pendente"),
  plusOne: z.boolean().optional().default(false),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(2).optional().nullable(),
});

export const guestBulkSchema = z.object({
  guests: z.array(guestSchema).min(1).max(1000),
});

export const plannerInviteSchema = z.object({
  action: z.enum(["invite", "approve", "reject", "accept"]),
  plannerEmail: z.string().email().optional(),
  role: z.string().optional(),
});
