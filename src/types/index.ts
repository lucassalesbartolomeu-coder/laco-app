// ─── Enums / Union Types ─────────────────────────────────

export type WeddingStyle =
  | "rústico"
  | "clássico"
  | "moderno"
  | "praiano"
  | "boho"
  | "minimalista"
  | "industrial"
  | "tropical";

export type GuestCategory =
  | "família_noivo"
  | "família_noiva"
  | "amigos_noivo"
  | "amigos_noiva"
  | "trabalho"
  | "lista_b";

export type RsvpStatus = "pendente" | "confirmado" | "recusado";

export type VendorCategory =
  | "buffet"
  | "foto"
  | "som"
  | "decoração"
  | "convite"
  | "doces"
  | "bolo"
  | "DJ"
  | "carro"
  | "maquiagem"
  | "video"
  | "celebrante"
  | "outros";

export type VendorStatus = "cotado" | "contratado" | "descartado";

export type BudgetItemStatus = "pendente" | "pago" | "parcial";

export type GiftStatus = "available" | "reserved" | "purchased";

// ─── Model Types ─────────────────────────────────────────

export interface Wedding {
  id: string;
  userId: string;
  partnerName1: string;
  partnerName2: string;
  weddingDate: Date | null;
  venue: string | null;
  city: string | null;
  state: string | null;
  style: WeddingStyle | null;
  estimatedGuests: number | null;
  estimatedBudget: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Guest {
  id: string;
  weddingId: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  ddd: string | null;
  category: GuestCategory | null;
  rsvpStatus: RsvpStatus;
  plusOne: boolean;
  dietaryRestriction: string | null;
  accommodation: boolean;
  needsTransport: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vendor {
  id: string;
  weddingId: string;
  name: string;
  category: VendorCategory;
  phone: string | null;
  email: string | null;
  website: string | null;
  budget: number | null;
  status: VendorStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetItem {
  id: string;
  weddingId: string;
  category: string;
  description: string;
  estimatedCost: number;
  actualCost: number | null;
  paidAmount: number;
  paidBy: string | null;
  dueDate: Date | null;
  status: BudgetItemStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Gift {
  id: string;
  weddingId: string;
  name: string;
  description: string | null;
  price: number | null;
  url: string | null;
  store: string | null;
  status: GiftStatus;
  reservedBy: string | null;
  reservedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── With Relations ──────────────────────────────────────

export interface WeddingWithRelations extends Wedding {
  guests: Guest[];
  vendors: Vendor[];
  budgetItems: BudgetItem[];
  gifts: Gift[];
}
