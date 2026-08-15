/** Unit-conversion data for the unit converter. Symbols are language-neutral. */

export type Category = {
  key: string;
  /** Linear units: [symbol, factor-to-base]. Absent for temperature. */
  units?: [string, number][];
  /** Temperature is affine, not linear, so it gets explicit symbols + formulas. */
  temperature?: boolean;
  tempUnits?: string[];
};

export const CATEGORIES: Category[] = [
  {
    key: "length",
    units: [
      ["m", 1],
      ["km", 1000],
      ["cm", 0.01],
      ["mm", 0.001],
      ["mi", 1609.344],
      ["yd", 0.9144],
      ["ft", 0.3048],
      ["in", 0.0254],
    ],
  },
  {
    key: "mass",
    units: [
      ["kg", 1000],
      ["g", 1],
      ["mg", 0.001],
      ["t", 1_000_000],
      ["lb", 453.59237],
      ["oz", 28.349523125],
    ],
  },
  { key: "temperature", temperature: true, tempUnits: ["°C", "°F", "K"] },
  {
    key: "area",
    units: [
      ["m²", 1],
      ["km²", 1_000_000],
      ["cm²", 0.0001],
      ["ft²", 0.09290304],
      ["ac", 4046.8564224],
      ["ha", 10000],
    ],
  },
  {
    key: "volume",
    units: [
      ["L", 1],
      ["mL", 0.001],
      ["m³", 1000],
      ["gal", 3.785411784],
      ["qt", 0.946352946],
      ["cup", 0.2365882365],
      ["fl oz", 0.0295735295625],
    ],
  },
  {
    key: "speed",
    units: [
      ["m/s", 1],
      ["km/h", 0.2777777777777778],
      ["mph", 0.44704],
      ["kn", 0.5144444444444445],
      ["ft/s", 0.3048],
    ],
  },
  {
    key: "data",
    units: [
      ["B", 1],
      ["KB", 1e3],
      ["MB", 1e6],
      ["GB", 1e9],
      ["TB", 1e12],
      ["KiB", 1024],
      ["MiB", 1048576],
      ["GiB", 1073741824],
    ],
  },
];

const toCelsius = (v: number, u: string) =>
  u === "°F" ? ((v - 32) * 5) / 9 : u === "K" ? v - 273.15 : v;
const fromCelsius = (c: number, u: string) =>
  u === "°F" ? (c * 9) / 5 + 32 : u === "K" ? c + 273.15 : c;

/** Convert `value` from unit `from` to unit `to` within a category. */
export function convert(cat: Category, value: number, from: string, to: string): number {
  if (cat.temperature) {
    return fromCelsius(toCelsius(value, from), to);
  }
  const map = new Map(cat.units!);
  const fromF = map.get(from);
  const toF = map.get(to);
  if (fromF === undefined || toF === undefined) return NaN;
  return (value * fromF) / toF;
}

/** The list of unit symbols for a category. */
export function unitSymbols(cat: Category): string[] {
  return cat.temperature ? cat.tempUnits! : cat.units!.map(([s]) => s);
}

/** Format a result: trim floating-point noise to a readable string. */
export function formatResult(n: number): string {
  if (!Number.isFinite(n)) return "";
  if (n === 0) return "0";
  return String(Number(n.toPrecision(10)));
}
