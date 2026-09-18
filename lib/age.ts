import {
  addToCalendarDate,
  calendarDateToUtc,
  daysInMonth,
  type CalendarDate,
} from "./date-arithmetic.ts";

const DAY_MS = 86_400_000;

export type AgeResult = {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  nextBirthday: CalendarDate | null;
  daysUntilBirthday: number | null;
  birthdayToday: boolean;
};

function anniversary(birth: CalendarDate, year: number): CalendarDate {
  return { year, month: birth.month, day: Math.min(birth.day, daysInMonth(year, birth.month)) };
}

function compare(a: CalendarDate, b: CalendarDate): number {
  return calendarDateToUtc(a).getTime() - calendarDateToUtc(b).getTime();
}

export function calculateAge(birth: CalendarDate, asOf: CalendarDate): AgeResult | null {
  if (compare(birth, asOf) > 0) return null;

  let years = asOf.year - birth.year;
  if (compare(anniversary(birth, asOf.year), asOf) > 0) years--;
  const lastBirthday = anniversary(birth, birth.year + years);

  let months = 0;
  while (months < 11) {
    const candidate = addToCalendarDate(lastBirthday, months + 1, "months");
    if (!candidate || compare(candidate.date, asOf) > 0) break;
    months++;
  }
  const monthAnchor = addToCalendarDate(lastBirthday, months, "months")!.date;
  const days = compare(asOf, monthAnchor) / DAY_MS;
  const totalDays = compare(asOf, birth) / DAY_MS;
  const birthdayToday = compare(anniversary(birth, asOf.year), asOf) === 0;

  let nextBirthday: CalendarDate | null = null;
  let daysUntilBirthday: number | null = null;
  const nextYear = birthdayToday || compare(anniversary(birth, asOf.year), asOf) < 0
    ? asOf.year + 1
    : asOf.year;
  if (nextYear <= 9999) {
    nextBirthday = anniversary(birth, nextYear);
    daysUntilBirthday = compare(nextBirthday, asOf) / DAY_MS;
  }

  return { years, months, days, totalDays, nextBirthday, daysUntilBirthday, birthdayToday };
}
