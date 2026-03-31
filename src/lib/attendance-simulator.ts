// ---------------------------------------------------------------------------
// attendance-simulator.ts
// Simulates guest attendance probability for a Brazilian wedding.
// ---------------------------------------------------------------------------

export interface GuestInput {
  city?: string;
  state?: string;
  category?: string;
  /** Pre-computed straight-line distance in km. Takes precedence over state comparison. */
  distanceKm?: number;
  /** Guest is coming from outside Brazil. */
  isInternational?: boolean;
}

export interface WeddingInput {
  city: string;
  state: string;
  weddingDate: string; // ISO date string
  style?: string;
  /**
   * Destination weddings draw guests who already budgeted for travel,
   * so remote attendees have a slightly higher conversion rate.
   */
  isDestinationWedding?: boolean;
}

interface CategoryStats {
  invited: number;
  expected: number;
  rate: number;
}

interface SimulationResult {
  totalExpected: number;
  totalInvited: number;
  attendanceRate: number;
  byCategory: Record<string, CategoryStats>;
  confidenceRange: { min: number; max: number };
}

// ---- Neighbor states map (Brazilian geography) ---------------------------

const neighborStates: Record<string, string[]> = {
  AC: ["AM", "RO"],
  AL: ["PE", "SE", "BA"],
  AM: ["AC", "RO", "RR", "PA", "MT"],
  AP: ["PA"],
  BA: ["SE", "AL", "PE", "PI", "MG", "GO", "TO", "MA"],
  CE: ["RN", "PB", "PE", "PI"],
  DF: ["GO", "MG"],
  ES: ["MG", "BA", "RJ"],
  GO: ["MT", "MS", "MG", "BA", "TO", "DF"],
  MA: ["PI", "TO", "PA", "BA"],
  MG: ["SP", "RJ", "ES", "BA", "GO", "DF", "MS"],
  MS: ["MT", "GO", "MG", "SP", "PR"],
  MT: ["RO", "AM", "PA", "TO", "GO", "MS"],
  PA: ["AM", "MT", "TO", "MA", "AP", "RR"],
  PB: ["RN", "CE", "PE"],
  PE: ["PB", "CE", "PI", "AL", "BA"],
  PI: ["MA", "CE", "PE", "BA", "TO"],
  PR: ["SP", "MS", "SC"],
  RJ: ["SP", "MG", "ES"],
  RN: ["CE", "PB"],
  RO: ["AC", "AM", "MT"],
  RR: ["AM", "PA"],
  RS: ["SC"],
  SC: ["PR", "RS"],
  SE: ["AL", "BA"],
  SP: ["MG", "RJ", "PR", "MS"],
  TO: ["MA", "PI", "BA", "GO", "MT", "PA"],
};

// States that typically require a flight from most other regions
const needsPlaneFrom: Record<string, string[]> = {
  AC: ["SP", "RJ", "MG", "ES", "PR", "SC", "RS", "BA", "SE", "AL", "PE", "PB", "RN", "CE", "PI", "MA"],
  AM: ["SP", "RJ", "MG", "ES", "PR", "SC", "RS", "BA", "SE", "AL", "PE", "PB", "RN", "CE", "PI", "MA"],
  RR: ["SP", "RJ", "MG", "ES", "PR", "SC", "RS", "BA", "SE", "AL", "PE", "PB", "RN", "CE"],
  AP: ["SP", "RJ", "MG", "ES", "PR", "SC", "RS", "SE", "AL", "PE", "PB", "RN", "CE"],
};

// Brazilian public holidays (month-day) that tend to generate long weekends
const feriadosFixos = [
  "01-01", "04-21", "05-01", "09-07",
  "10-12", "11-02", "11-15", "12-25",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Distance-based attendance probability using km buckets.
 * More granular and accurate than state adjacency.
 */
function getProbabilityByKm(
  distanceKm: number,
  isDestination: boolean,
): number {
  let base: number;
  if      (distanceKm < 50)   base = 92; // same metro area
  else if (distanceKm < 150)  base = 85; // day-trip distance
  else if (distanceKm < 300)  base = 76; // short road trip
  else if (distanceKm < 600)  base = 63; // long drive / cheap flight
  else if (distanceKm < 1200) base = 50; // usually requires flight
  else                        base = 40; // very far, definitely flies

  // Destination wedding: guests who already decided to travel commit more
  if (isDestination && distanceKm > 300) base += 8;

  return base;
}

/**
 * State-based fallback (used when km is unavailable).
 */
function getDistanceProbabilityByState(
  guestState: string | undefined,
  weddingState: string,
  isDestination: boolean,
): number {
  if (!guestState) return 70;

  const gs = guestState.toUpperCase();
  const ws = weddingState.toUpperCase();

  if (gs === ws) return 85;

  const neighbors = neighborStates[ws] ?? [];
  if (neighbors.includes(gs)) {
    return isDestination ? 74 : 70;
  }

  const planeOrigins = needsPlaneFrom[ws] ?? [];
  const planeOriginsGuest = needsPlaneFrom[gs] ?? [];
  if (planeOrigins.includes(gs) || planeOriginsGuest.includes(ws)) {
    return isDestination ? 50 : 45;
  }

  return isDestination ? 62 : 55;
}

/**
 * International guests have lower base attendance.
 * Destination weddings significantly improve international attendance.
 */
function getInternationalProbability(isDestination: boolean): number {
  return isDestination ? 40 : 28;
}

/**
 * Category modifier in percentage points.
 * Família = +12 (strong family commitment)
 * Amigos = +5 (friends are flexible)
 * Trabalho = -10 (less personal, easier to decline)
 * Lista B = -15 (lower priority)
 */
function getCategoryModifier(category: string | undefined): number {
  if (!category) return 0;
  const cat = category.toLowerCase();

  if (cat === "familia_noivo" || cat === "familia_noiva") return 12;
  if (cat === "família_noivo" || cat === "família_noiva") return 12;
  if (cat === "amigos_noivo"  || cat === "amigos_noiva")  return 5;
  if (cat === "trabalho")  return -10;
  if (cat === "lista_b")   return -15;

  return 0;
}

function getDayOfWeekModifier(date: Date): number {
  const day = date.getUTCDay();
  if (day === 6) return 0;
  if (day === 5) return -5;
  if (day === 0) return -8;
  return -20;
}

function isNearHoliday(date: Date): boolean {
  const msPerDay = 86_400_000;
  for (const feriado of feriadosFixos) {
    const [mm, dd] = feriado.split("-").map(Number);
    for (const yearOffset of [-1, 0, 1]) {
      const fDate = new Date(Date.UTC(date.getUTCFullYear() + yearOffset, mm - 1, dd));
      if (Math.abs(date.getTime() - fDate.getTime()) <= 4 * msPerDay) return true;
    }
  }
  return false;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

export function simulateAttendance(
  guests: GuestInput[],
  wedding: WeddingInput,
): SimulationResult {
  const weddingDate = new Date(wedding.weddingDate);
  const dayMod = getDayOfWeekModifier(weddingDate);
  const holidayBonus = isNearHoliday(weddingDate) ? 5 : 0;
  const isDestination = wedding.isDestinationWedding ?? false;

  const categoryMap: Record<string, { invited: number; expectedSum: number }> = {};
  let totalExpectedSum = 0;

  for (const guest of guests) {
    let distProb: number;

    if (guest.isInternational) {
      distProb = getInternationalProbability(isDestination);
    } else if (guest.distanceKm !== undefined) {
      distProb = getProbabilityByKm(guest.distanceKm, isDestination);
    } else {
      distProb = getDistanceProbabilityByState(guest.state, wedding.state, isDestination);
    }

    const catMod = getCategoryModifier(guest.category);
    let probability = distProb + catMod + dayMod + holidayBonus;
    probability = clamp(probability, 10, 98);

    const cat = guest.category ?? "sem_categoria";
    if (!categoryMap[cat]) categoryMap[cat] = { invited: 0, expectedSum: 0 };
    categoryMap[cat].invited += 1;
    categoryMap[cat].expectedSum += probability / 100;

    totalExpectedSum += probability / 100;
  }

  const totalInvited = guests.length;
  const totalExpected = Math.round(totalExpectedSum);
  const attendanceRate =
    totalInvited > 0
      ? Math.round((totalExpectedSum / totalInvited) * 100) / 100
      : 0;

  const byCategory: Record<string, CategoryStats> = {};
  for (const [cat, data] of Object.entries(categoryMap)) {
    byCategory[cat] = {
      invited: data.invited,
      expected: Math.round(data.expectedSum),
      rate: data.invited > 0 ? Math.round((data.expectedSum / data.invited) * 100) / 100 : 0,
    };
  }

  const marginFactor = 0.1;
  const confidenceMin = Math.max(0, Math.round(totalExpectedSum * (1 - marginFactor)));
  const confidenceMax = Math.min(totalInvited, Math.round(totalExpectedSum * (1 + marginFactor)));

  return {
    totalExpected,
    totalInvited,
    attendanceRate,
    byCategory,
    confidenceRange: { min: confidenceMin, max: confidenceMax },
  };
}
