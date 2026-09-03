export const MAX_BILL_CENTS = 99_999_999_999;
export const MAX_PEOPLE = 100;

export type TipField = "bill" | "rate" | "people";
export type TipInput = Record<TipField, string>;
export type TipResult =
  | { ok: false; errors: TipField[] }
  | {
      ok: true;
      billCents: number;
      tipCents: number;
      totalCents: number;
      groups: { people: number; cents: number }[];
    };

function hundredths(input: string): number | null {
  const value = input.trim();
  if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(value)) return null;
  const [whole, fraction = ""] = value.split(".");
  const result = Number(whole || "0") * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(result) ? result : null;
}

export function calculateTip(input: TipInput): TipResult {
  const billCents = hundredths(input.bill);
  const rate = hundredths(input.rate);
  const people = /^\d+$/.test(input.people.trim()) ? Number(input.people) : Number.NaN;
  const errors: TipField[] = [];
  if (billCents === null || billCents > MAX_BILL_CENTS) errors.push("bill");
  if (rate === null || rate > 10_000) errors.push("rate");
  if (!Number.isInteger(people) || people < 1 || people > MAX_PEOPLE) errors.push("people");
  if (errors.length || billCents === null || rate === null) return { ok: false, errors };

  // Both operands are integers; the bill limit keeps the product safely below 2^53.
  const tipCents = Math.floor((billCents * rate + 5_000) / 10_000);
  const totalCents = billCents + tipCents;
  const share = Math.floor(totalCents / people);
  const remainder = totalCents % people;
  const groups = [{ people: people - remainder, cents: share }];
  if (remainder > 0) groups.push({ people: remainder, cents: share + 1 });
  return { ok: true, billCents, tipCents, totalCents, groups };
}
