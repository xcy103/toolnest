export type BmiCategory = "underweight" | "healthy" | "overweight" | "obesity";

export function percentageOf(percent: number, value: number): number {
  return (percent / 100) * value;
}

export function percentageRatio(part: number, whole: number): number {
  return whole === 0 ? Number.NaN : (part / whole) * 100;
}

export function percentageChange(from: number, to: number): number {
  return from === 0 ? Number.NaN : ((to - from) / Math.abs(from)) * 100;
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
