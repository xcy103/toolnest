import {
  calendarDateToUtc,
  type CalendarDate,
} from "./date-arithmetic.ts";

export type BusinessDayCount = {
  businessDays: number;
  nonBusinessDays: number;
  totalDays: number;
};

export type BusinessDateResult = {
  date: CalendarDate;
  calendarDaysMoved: number;
  skippedDays: number;
};

function weekendSet(days: readonly number[]): Set<number> | null {
  const weekends = new Set(days);
  if (
    weekends.size === 7 ||
    [...weekends].some((day) => !Number.isInteger(day) || day < 0 || day > 6)
  ) {
    return null;
  }
  return weekends;
}

function dayNumber(date: CalendarDate): number {
  return Math.floor(calendarDateToUtc(date).getTime() / 86_400_000);
}

function calendarDateFromUtc(date: Date): CalendarDate | null {
  const result = {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
  return result.year >= 1 && result.year <= 9999 ? result : null;
}

/** Count dates after `start`, optionally including `end`. */
export function businessDaysBetween(
  start: CalendarDate,
  end: CalendarDate,
  weekendDays: readonly number[],
  includeEnd: boolean,
): BusinessDayCount | null {
  const weekends = weekendSet(weekendDays);
  if (!weekends) return null;

  const difference = dayNumber(end) - dayNumber(start);
  if (difference < 0) return null;

  const totalDays = Math.max(0, difference - (includeEnd ? 0 : 1));
  const fullWeeks = Math.floor(totalDays / 7);
  let businessDays = fullWeeks * (7 - weekends.size);
  const firstDay = (calendarDateToUtc(start).getUTCDay() + 1) % 7;

  for (let offset = 0; offset < totalDays % 7; offset++) {
    if (!weekends.has((firstDay + offset) % 7)) businessDays++;
  }

  return {
    businessDays,
    nonBusinessDays: totalDays - businessDays,
    totalDays,
  };
}

/** Move by signed working days. The starting date is never counted. */
export function addBusinessDays(
  start: CalendarDate,
  amount: number,
  weekendDays: readonly number[],
): BusinessDateResult | null {
  const weekends = weekendSet(weekendDays);
  if (!weekends || !Number.isSafeInteger(amount)) return null;
  if (amount === 0) {
    return { date: { ...start }, calendarDaysMoved: 0, skippedDays: 0 };
  }

  const direction = amount > 0 ? 1 : -1;
  const target = Math.abs(amount);
  const cursor = calendarDateToUtc(start);
  let moved = 0;
  let skippedDays = 0;
  let calendarDaysMoved = 0;

  while (moved < target) {
    cursor.setUTCDate(cursor.getUTCDate() + direction);
    calendarDaysMoved++;
    const current = calendarDateFromUtc(cursor);
    if (!current) return null;
    if (weekends.has(cursor.getUTCDay())) {
      skippedDays++;
    } else {
      moved++;
    }
  }

  const date = calendarDateFromUtc(cursor);
  return date ? { date, calendarDaysMoved, skippedDays } : null;
}
