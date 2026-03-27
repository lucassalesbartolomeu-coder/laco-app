// ---------------------------------------------------------------------------
// cost-estimator.ts
// Estimates wedding costs based on guest count, location, and style.
// ---------------------------------------------------------------------------

interface CostRange {
  min: number;
  expected: number;
  max: number;
}

interface CostEstimate {
  min: number;
  expected: number;
  max: number;
  perPerson: CostRange;
  breakdown: {
    buffet: number;
    decoracao: number;
    fotoVideo: number;
    somDj: number;
    local: number;
    outros: number;
  };
}

// ---- Region cost per person (R$) -----------------------------------------

const nordeste = ["BA", "SE", "AL", "PE", "PB", "RN", "CE", "PI", "MA"];
const sul = ["PR", "SC", "RS"];

function getRegionRange(
  city: string,
  state: string,
): { min: number; max: number } {
  const st = state.toUpperCase();
  const cityNorm = city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  // SP capital
  if (st === "SP" && cityNorm.includes("sao paulo")) {
    return { min: 800, max: 1200 };
  }

  // SP interior
  if (st === "SP") {
    return { min: 500, max: 800 };
  }

  // RJ
  if (st === "RJ") {
    return { min: 700, max: 1100 };
  }

  // MG
  if (st === "MG") {
    return { min: 450, max: 700 };
  }

  // Sul
  if (sul.includes(st)) {
    return { min: 500, max: 850 };
  }

  // Nordeste
  if (nordeste.includes(st)) {
    return { min: 400, max: 650 };
  }

  // Others
  return { min: 400, max: 600 };
}

// ---- Style multiplier ----------------------------------------------------

const styleMultipliers: Record<string, number> = {
  rustico: 0.85,
  classico: 1.0,
  moderno: 1.15,
  praiano: 1.1,
  minimalista: 0.8,
  boho: 0.9,
};

function getStyleMultiplier(style?: string): number {
  if (!style) return 1.0;
  return styleMultipliers[style.toLowerCase()] ?? 1.0;
}

// ---- Main function -------------------------------------------------------

export function estimateCost(
  numberOfGuests: number,
  city: string,
  state: string,
  style?: string,
): CostEstimate {
  const region = getRegionRange(city, state);
  const multiplier = getStyleMultiplier(style);

  const perPersonMin = Math.round(region.min * multiplier);
  const perPersonMax = Math.round(region.max * multiplier);
  const perPersonExpected = Math.round((perPersonMin + perPersonMax) / 2);

  const totalMin = perPersonMin * numberOfGuests;
  const totalMax = perPersonMax * numberOfGuests;
  const totalExpected = perPersonExpected * numberOfGuests;

  return {
    min: totalMin,
    expected: totalExpected,
    max: totalMax,
    perPerson: {
      min: perPersonMin,
      expected: perPersonExpected,
      max: perPersonMax,
    },
    breakdown: {
      buffet: 0.45,
      decoracao: 0.15,
      fotoVideo: 0.12,
      somDj: 0.08,
      local: 0.10,
      outros: 0.10,
    },
  };
}
