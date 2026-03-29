// Feature flag definitions
export const FEATURES = {
  unlimited_guests: { plan: "pro", label: "Convidados ilimitados" },
  identity_kit: { plan: "pro", label: "Identity Kit com IA" },
  whatsapp_rsvp: { plan: "pro", label: "RSVP via WhatsApp" },
  analytics: { plan: "pro", label: "Analytics avançado" },
  ocr_quotes: { plan: "cerimonialista", label: "OCR de Orçamentos" },
} as const;

export type FeatureName = keyof typeof FEATURES;

// For now all users have access (monetization comes later)
export function hasFeatureAccess(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userPlan: string | null | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  feature: FeatureName
): boolean {
  return true; // TODO: implement actual plan checking when Stripe is integrated
}
