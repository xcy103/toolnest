export type BmiCategory = "underweight" | "healthy" | "overweight" | "obesity";

const MIN_NORMAL_NUMBER = 2 ** -1022;

export function percentageOf(percent: number, value: number): number {
  const factor = percent / 100;
  // Avoid losing precision in a subnormal intermediate before multiplying.
  if (percent !== 0 && Math.abs(factor) < MIN_NORMAL_NUMBER && Number.isFinite(value)) {
    return (percent * value) / 100;
  }
  return factor * value;
}

export function percentageRatio(part: number, whole: number): number {
  if (whole === 0) return Number.NaN;
  const ratio = part / whole;
  if (part !== 0 && Math.abs(ratio) < MIN_NORMAL_NUMBER && Number.isFinite(whole)) {
    return (part * 100) / whole;
  }
  return ratio * 100;
}

export function percentageChange(from: number, to: number): number {
  if (from === 0) return Number.NaN;
  const difference = to - from;
  // Divide first only when subtraction overflows. Keeping the direct difference
  // for ordinary values avoids losing small changes between nearby numbers.
  if (!Number.isFinite(difference) && Number.isFinite(from) && Number.isFinite(to)) {
    return (to / Math.abs(from) - Math.sign(from)) * 100;
  }
  return (difference / Math.abs(from)) * 100;
}

export function bmiMetric(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  if (weightKg <= 0 || heightM <= 0) return Number.NaN;
  return weightKg / heightM ** 2;
}

export function bmiImperial(weightLb: number, heightIn: number): number {
  if (weightLb <= 0 || heightIn <= 0) return Number.NaN;
  return (703 * weightLb) / heightIn ** 2;
}

export function bmiCategory(bmi: number): BmiCategory | null {
  if (!Number.isFinite(bmi) || bmi <= 0) return null;
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "healthy";
  if (bmi < 30) return "overweight";
  return "obesity";
}

export function formatCalculatorResult(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    useGrouping: false,
  }).format(value);
}

export function formatPercentageResult(value: number): string {
  const formatted = formatCalculatorResult(value);
  if (value !== 0 && (formatted === "0" || formatted === "-0")) {
    return new Intl.NumberFormat("en-US", {
      notation: "scientific",
      maximumFractionDigits: 2,
    }).format(value);
  }
  return formatted;
}
