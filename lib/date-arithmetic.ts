export type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

export type DateUnit = "days" | "weeks" | "months" | "years";

export type DateCalculationResult = {
  date: CalendarDate;
  clamped: boolean;
};

const MIN_YEAR = 1;
const MAX_YEAR = 9999;

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function parseCalendarDate(value: string): CalendarDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const date = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
  if (
    date.year < MIN_YEAR ||
    date.year > MAX_YEAR ||
    date.month < 1 ||
    date.month > 12 ||
    date.day < 1 ||
    date.day > daysInMonth(date.year, date.month)
  ) {
    return null;
  }
  return date;
}

export function formatCalendarDate(date: CalendarDate): string {
  return `${String(date.year).padStart(4, "0")}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

export function calendarDateToUtc(date: CalendarDate): Date {
  const result = new Date(0);
  result.setUTCHours(0, 0, 0, 0);
  result.setUTCFullYear(date.year, date.month - 1, date.day);
  return result;
}

function fromUtcDate(date: Date): CalendarDate | null {
  const result = {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
  return result.year >= MIN_YEAR && result.year <= MAX_YEAR ? result : null;
}

export function addToCalendarDate(
  date: CalendarDate,
  amount: number,
  unit: DateUnit,
): DateCalculationResult | null {
  if (!Number.isSafeInteger(amount)) return null;

  if (unit === "days" || unit === "weeks") {
    const value = calendarDateToUtc(date);
    value.setUTCDate(value.getUTCDate() + amount * (unit === "weeks" ? 7 : 1));
    const result = fromUtcDate(value);
    return result ? { date: result, clamped: false } : null;
  }

  if (unit === "years") {
    const year = date.year + amount;
    if (year < MIN_YEAR || year > MAX_YEAR) return null;
    const day = Math.min(date.day, daysInMonth(year, date.month));
    return {
      date: { year, month: date.month, day },
      clamped: day !== date.day,
    };
  }

  const monthIndex = date.year * 12 + (date.month - 1) + amount;
  const year = Math.floor(monthIndex / 12);
  const month = ((monthIndex % 12) + 12) % 12 + 1;
  if (year < MIN_YEAR || year > MAX_YEAR) return null;
  const day = Math.min(date.day, daysInMonth(year, month));
  return {
    date: { year, month, day },
    clamped: day !== date.day,
  };
}
