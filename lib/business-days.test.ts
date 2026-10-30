import { strict as assert } from "node:assert";
import { test } from "node:test";
import { addBusinessDays, businessDaysBetween } from "./business-days.ts";
import { calendarDateToUtc } from "./date-arithmetic.ts";

const standardWeekend = [0, 6];

test("week jumps match daily counting for every weekend selection and start weekday", () => {
  for (let mask = 0; mask < 127; mask++) {
    const weekends = Array.from({ length: 7 }, (_, day) => day)
      .filter((day) => mask & (1 << day));
    for (let day = 5; day <= 11; day++) {
      const start = { year: 2026, month: 10, day };
      for (let amount = -15; amount <= 15; amount++) {
        const cursor = calendarDateToUtc(start);
        let remaining = Math.abs(amount);
        let calendarDaysMoved = 0;
        let skippedDays = 0;
        while (remaining > 0) {
          cursor.setUTCDate(cursor.getUTCDate() + Math.sign(amount));
          calendarDaysMoved++;
          if (weekends.includes(cursor.getUTCDay())) skippedDays++;
          else remaining--;
        }
        assert.deepEqual(addBusinessDays(start, amount, weekends), {
          date: {
            year: cursor.getUTCFullYear(),
            month: cursor.getUTCMonth() + 1,
            day: cursor.getUTCDate(),
          },
          calendarDaysMoved,
          skippedDays,
        }, `weekends=${mask}, start=${day}, amount=${amount}`);
      }
    }
  }
});

test("large working-day moves retain destination and skipped-day totals", () => {
  const start = { year: 2026, month: 10, day: 30 };
  const end = { year: 5859, month: 11, day: 25 };
  assert.deepEqual(addBusinessDays(start, 1_000_000, standardWeekend), {
    date: end, calendarDaysMoved: 1_400_000, skippedDays: 400_000,
  });
  assert.deepEqual(addBusinessDays(end, -1_000_000, standardWeekend), {
    date: start, calendarDaysMoved: 1_400_000, skippedDays: 400_000,
  });
});

test("week jumps respect calendar boundaries and reject huge signed moves", () => {
  const first = { year: 1, month: 1, day: 1 };
  const last = { year: 9999, month: 12, day: 31 };
  const distance = (calendarDateToUtc(last).getTime() - calendarDateToUtc(first).getTime()) / 86_400_000;
  assert.equal(addBusinessDays(first, distance, [])!.date.year, 9999);
  assert.deepEqual(addBusinessDays(last, -distance, [])!.date, first);
  assert.equal(addBusinessDays(first, distance + 1, []), null);
  assert.equal(addBusinessDays(last, -distance - 1, []), null);
  for (const amount of [Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER]) {
    assert.equal(addBusinessDays(first, amount, standardWeekend), null);
  }
});

test("counts dates after the start and optionally includes the end", () => {
  const start = { year: 2026, month: 9, day: 14 };
  const end = { year: 2026, month: 9, day: 18 };

  assert.deepEqual(businessDaysBetween(start, end, standardWeekend, false), {
    businessDays: 3,
    nonBusinessDays: 0,
    totalDays: 3,
  });
  assert.deepEqual(businessDaysBetween(start, end, standardWeekend, true), {
    businessDays: 4,
    nonBusinessDays: 0,
    totalDays: 4,
  });
});

test("counts weekends inside a date range", () => {
  assert.deepEqual(
    businessDaysBetween(
      { year: 2026, month: 9, day: 11 },
      { year: 2026, month: 9, day: 14 },
      standardWeekend,
      true,
    ),
    { businessDays: 1, nonBusinessDays: 2, totalDays: 3 },
  );
});

test("supports custom and empty weekend selections", () => {
  const start = { year: 2026, month: 9, day: 10 };
  const end = { year: 2026, month: 9, day: 13 };
  assert.equal(businessDaysBetween(start, end, [5, 6], true)!.businessDays, 1);
  assert.equal(businessDaysBetween(start, end, [], true)!.businessDays, 3);
});

test("rejects reversed ranges and a seven-day weekend", () => {
  const earlier = { year: 2026, month: 9, day: 14 };
  const later = { year: 2026, month: 9, day: 15 };
  assert.equal(businessDaysBetween(later, earlier, standardWeekend, true), null);
  assert.equal(businessDaysBetween(earlier, later, [0, 1, 2, 3, 4, 5, 6], true), null);
});

test("moves forward and backward while skipping weekends", () => {
  assert.deepEqual(
    addBusinessDays({ year: 2026, month: 9, day: 11 }, 1, standardWeekend),
    {
      date: { year: 2026, month: 9, day: 14 },
      calendarDaysMoved: 3,
      skippedDays: 2,
    },
  );
  assert.deepEqual(
    addBusinessDays({ year: 2026, month: 9, day: 14 }, -1, standardWeekend),
    {
      date: { year: 2026, month: 9, day: 11 },
      calendarDaysMoved: 3,
      skippedDays: 2,
    },
  );
});

test("business-date movement supports custom weekends and zero", () => {
  assert.deepEqual(
    addBusinessDays({ year: 2026, month: 9, day: 10 }, 1, [5, 6]),
    {
      date: { year: 2026, month: 9, day: 13 },
      calendarDaysMoved: 3,
      skippedDays: 2,
    },
  );
  assert.deepEqual(
    addBusinessDays({ year: 2026, month: 9, day: 10 }, 0, standardWeekend),
    {
      date: { year: 2026, month: 9, day: 10 },
      calendarDaysMoved: 0,
      skippedDays: 0,
    },
  );
});

test("business-date movement rejects invalid settings and date overflow", () => {
  assert.equal(
    addBusinessDays(
      { year: 2026, month: 9, day: 10 },
      1,
      [0, 1, 2, 3, 4, 5, 6],
    ),
    null,
  );
  assert.equal(
    addBusinessDays({ year: 9999, month: 12, day: 31 }, 1, standardWeekend),
    null,
  );
});
