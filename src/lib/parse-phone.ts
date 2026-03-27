import { dddMap, type DDDInfo } from "./ddd-map";

export interface ParsedPhone {
  ddd: string;
  phone: string;
  city: string | null;
  state: string | null;
}

export function parsePhone(raw: string): ParsedPhone {
  // Remove everything except digits
  const digits = raw.replace(/\D/g, "");

  let numberPart = digits;

  // Remove country code +55
  if (numberPart.startsWith("55") && numberPart.length >= 12) {
    numberPart = numberPart.slice(2);
  }

  // Extract DDD (first 2 digits) and phone number
  if (numberPart.length >= 10) {
    const ddd = numberPart.slice(0, 2);
    const phone = numberPart.slice(2);
    const info: DDDInfo | undefined = dddMap[ddd];

    return {
      ddd,
      phone,
      city: info?.city ?? null,
      state: info?.state ?? null,
    };
  }

  // No DDD detected
  return {
    ddd: "",
    phone: numberPart,
    city: null,
    state: null,
  };
}

export function formatPhone(ddd: string, phone: string): string {
  if (!ddd) return phone;
  if (phone.length === 9) {
    return `(${ddd}) ${phone.slice(0, 5)}-${phone.slice(5)}`;
  }
  if (phone.length === 8) {
    return `(${ddd}) ${phone.slice(0, 4)}-${phone.slice(4)}`;
  }
  return `(${ddd}) ${phone}`;
}
