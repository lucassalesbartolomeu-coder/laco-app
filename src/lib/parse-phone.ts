import { dddMap, type DDDInfo } from "./ddd-map";

export interface ParsedPhone {
  ddi: string;   // country code (e.g. "55")
  ddd: string;   // area code (e.g. "11")
  phone: string; // local digits without ddd
  city: string | null;
  state: string | null;
}

/**
 * Parses a raw phone string into its components.
 * Accepts: +55 11 99999-9999, 5511999999999, (11) 99999-9999, 11999999999, etc.
 *
 * @param raw    - the raw phone string
 * @param ddi    - override DDI if already known (e.g. from CSV column). Defaults to "55".
 */
export function parsePhone(raw: string, ddi = "55"): ParsedPhone {
  // Remove everything except digits
  const digits = raw.replace(/\D/g, "");

  let local = digits;

  // Strip provided DDI prefix from number string (handles +55, 55, +1, 1 etc.)
  if (local.startsWith(ddi) && local.length > ddi.length + 8) {
    local = local.slice(ddi.length);
  }
  // Fallback: strip +55 if caller didn't provide a different DDI
  if (ddi === "55" && local.startsWith("55") && local.length >= 12) {
    local = local.slice(2);
  }

  // Extract DDD (first 2 digits) and phone number for BR numbers
  if (ddi === "55" && local.length >= 10) {
    const dddCode = local.slice(0, 2);
    const phonePart = local.slice(2);
    const info: DDDInfo | undefined = dddMap[dddCode];

    return {
      ddi,
      ddd: dddCode,
      phone: phonePart,
      city: info?.city ?? null,
      state: info?.state ?? null,
    };
  }

  // Non-BR or no DDD detected — store full number in phone
  return {
    ddi,
    ddd: "",
    phone: local,
    city: null,
    state: null,
  };
}

/**
 * Formats a phone for display: +DDI (DDD) XXXXX-XXXX
 */
export function formatPhone(ddd: string, phone: string, ddi = "55"): string {
  const prefix = `+${ddi}`;
  if (!ddd) return `${prefix} ${phone}`;
  if (phone.length === 9) {
    return `${prefix} (${ddd}) ${phone.slice(0, 5)}-${phone.slice(5)}`;
  }
  if (phone.length === 8) {
    return `${prefix} (${ddd}) ${phone.slice(0, 4)}-${phone.slice(4)}`;
  }
  return `${prefix} (${ddd}) ${phone}`;
}
