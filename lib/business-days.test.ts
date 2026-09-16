import { strict as assert } from "node:assert";
import { test } from "node:test";
import { addBusinessDays, businessDaysBetween } from "./business-days.ts";

const standardWeekend = [0, 6];

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
