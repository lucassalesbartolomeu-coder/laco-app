// ---------------------------------------------------------------------------
// attendance-simulator.ts
// Simulates guest attendance probability for a Brazilian wedding.
// ---------------------------------------------------------------------------

interface GuestInput {
  city?: string;
  state?: string;
  category?: string;
}

interface WeddingInput {
  city: string;
  state: string;
  weddingDate: string; // ISO date string
  style?: string;
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
  "01-01", // Confraternização
  "04-21", // Tiradentes
  "05-01", // Trabalho
  "09-07", // Independência
  "10-12", // N.S. Aparecida
  "11-02", // Finados
  "11-15", // Proclamação da República
  "12-25", // Natal
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDistanceProbability(
  guestState: string | undefined,
  weddingState: string,
): number {
  if (!guestState) return 70; // unknown — assume moderate

  const gs = guestState.toUpperCase();
  const ws = weddingState.toUpperCase();

  if (gs === ws) return 85;

  const neighbors = neighborStates[ws] ?? [];
  if (neighbors.includes(gs)) return 70;

  // Check if it typically requires a flight
  const planeOrigins = needsPlaneFrom[ws] ?? [];
  if (planeOrigins.includes(gs)) return 45;

  // Also check reverse direction
  const planeOriginsGuest = needsPlaneFrom[gs] ?? [];
  if (planeOriginsGuest.includes(ws)) return 45;

  return 55; // far but driveable
}

function getCategoryModifier(category: string | undefined): number {
  if (!category) return 0;
  const cat = category.toLowerCase();

  if (cat === "familia_noivo" || cat === "familia_noiva") return 10;
  if (cat === "amigos_noivo" || cat === "amigos_noiva") return 5;
  if (cat === "trabalho") return -10;
  if (cat === "lista_b") return -15;

  return 0;
}

function getDayOfWeekModifier(date: Date): number {
  const day = date.getUTCDay(); // 0=Sun … 6=Sat
  if (day === 6) return 0;   // Saturday — base
  if (day === 5) return -5;  // Friday
  if (day === 0) return -8;  // Sunday
  return -20;                // Weekday
}

function isNearHoliday(date: Date): boolean {
  const msPerDay = 86_400_000;

  for (const feriado of feriadosFixos) {
    const [mm, dd] = feriado.split("-").map(Number);

    // Check same year and previous/next year to handle Jan edge case
    for (const yearOffset of [-1, 0, 1]) {
      const fDate = new Date(
        Date.UTC(date.getUTCFullYear() + yearOffset, mm - 1, dd),
      );
      const diff = Math.abs(date.getTime() - fDate.getTime());
      if (diff <= 4 * msPerDay) return true;
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

  const categoryMap: Record<string, { invited: number; expectedSum: number }> = {};
  let totalExpectedSum = 0;

  for (const guest of guests) {
    const distProb = getDistanceProbability(guest.state, wedding.state);
    const catMod = getCategoryModifier(guest.category);

    let probability = distProb + catMod + dayMod + holidayBonus;
    probability = clamp(probability, 20, 98);

    const cat = guest.category ?? "sem_categoria";
    if (!categoryMap[cat]) {
      categoryMap[cat] = { invited: 0, expectedSum: 0 };
    }
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

  // Build byCategory
  const byCategory: Record<string, CategoryStats> = {};
  for (const [cat, data] of Object.entries(categoryMap)) {
    byCategory[cat] = {
      invited: data.invited,
      expected: Math.round(data.expectedSum),
      rate:
        data.invited > 0
          ? Math.round((data.expectedSum / data.invited) * 100) / 100
          : 0,
    };
  }

  // Confidence range: +/- 10% of expected, clamped to [0, totalInvited]
  const marginFactor = 0.1;
  const confidenceMin = Math.max(
    0,
    Math.round(totalExpectedSum * (1 - marginFactor)),
  );
  const confidenceMax = Math.min(
    totalInvited,
    Math.round(totalExpectedSum * (1 + marginFactor)),
  );

  return {
    totalExpected,
    totalInvited,
    attendanceRate,
    byCategory,
    confidenceRange: { min: confidenceMin, max: confidenceMax },
  };
}
