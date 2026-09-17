import { calendarDateToUtc, type CalendarDate } from "./date-arithmetic.ts";

const DAY_MS = 86_400_000;

function fromUtc(date: Date): CalendarDate | null {
  const year = date.getUTCFullYear();
  if (year < 1 || year > 9999) return null;
  return { year, month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

export function weekdayOf(date: CalendarDate): number {
  return calendarDateToUtc(date).getUTCDay();
}

export function nextWeekday(date: CalendarDate, weekday: number): CalendarDate | null {
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return null;
  const offset = (weekday - weekdayOf(date) + 6) % 7 + 1;
  return fromUtc(new Date(calendarDateToUtc(date).getTime() + offset * DAY_MS));
}

export type IsoWeek = {
  week: number;
  weekYear: number;
  monday: CalendarDate;
  sunday: CalendarDate;
};

export function isoWeekOf(date: CalendarDate): IsoWeek | null {
  const selected = calendarDateToUtc(date);
  const mondayOffset = (selected.getUTCDay() + 6) % 7;
  const mondayMs = selected.getTime() - mondayOffset * DAY_MS;
  const thursday = new Date(mondayMs + 3 * DAY_MS);
  const weekYear = thursday.getUTCFullYear();

  // ISO week 1 contains January 4. Its Monday anchors the week count.
  const januaryFourth = calendarDateToUtc({ year: weekYear, month: 1, day: 4 });
  const weekOneMondayMs =
    januaryFourth.getTime() - ((januaryFourth.getUTCDay() + 6) % 7) * DAY_MS;
  const monday = fromUtc(new Date(mondayMs));
  const sunday = fromUtc(new Date(mondayMs + 6 * DAY_MS));
  if (!monday || !sunday || weekYear < 1 || weekYear > 9999) return null;

  return {
    week: Math.floor((mondayMs - weekOneMondayMs) / (7 * DAY_MS)) + 1,
    weekYear,
    monday,
    sunday,
  };
}
