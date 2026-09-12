import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  addToCalendarDate,
  daysInMonth,
  formatCalendarDate,
  isLeapYear,
  parseCalendarDate,
} from "./date-arithmetic.ts";

test("validates Gregorian calendar dates", () => {
  assert.equal(isLeapYear(2000), true);
  assert.equal(isLeapYear(1900), false);
  assert.equal(daysInMonth(2024, 2), 29);
  assert.deepEqual(parseCalendarDate("2026-09-11"), {
    year: 2026,
    month: 9,
    day: 11,
  });
  assert.equal(parseCalendarDate("2025-02-29"), null);
  assert.equal(parseCalendarDate("2026-13-01"), null);
});

test("adds days and weeks without local timezone arithmetic", () => {
  assert.equal(
    formatCalendarDate(addToCalendarDate({ year: 2026, month: 3, day: 7 }, 2, "days")!.date),
    "2026-03-09",
  );
  assert.equal(
    formatCalendarDate(addToCalendarDate({ year: 2026, month: 12, day: 28 }, 1, "weeks")!.date),
    "2027-01-04",
  );
  assert.equal(
    formatCalendarDate(addToCalendarDate({ year: 2026, month: 1, day: 1 }, -1, "days")!.date),
    "2025-12-31",
  );
});

test("clamps month arithmetic to the last valid day", () => {
  const forward = addToCalendarDate({ year: 2024, month: 1, day: 31 }, 1, "months");
  assert.deepEqual(forward, {
    date: { year: 2024, month: 2, day: 29 },
    clamped: true,
  });

  const backward = addToCalendarDate({ year: 2025, month: 3, day: 31 }, -1, "months");
  assert.deepEqual(backward, {
    date: { year: 2025, month: 2, day: 28 },
    clamped: true,
  });
});

test("clamps leap-day year arithmetic", () => {
  assert.deepEqual(
    addToCalendarDate({ year: 2024, month: 2, day: 29 }, 1, "years"),
    { date: { year: 2025, month: 2, day: 28 }, clamped: true },
  );
  assert.deepEqual(
    addToCalendarDate({ year: 2024, month: 2, day: 29 }, 4, "years"),
    { date: { year: 2028, month: 2, day: 29 }, clamped: false },
  );
});

test("rejects unsafe amounts and results outside four-digit years", () => {
  assert.equal(addToCalendarDate({ year: 9999, month: 12, day: 31 }, 1, "days"), null);
  assert.equal(addToCalendarDate({ year: 1, month: 1, day: 1 }, -1, "years"), null);
  assert.equal(addToCalendarDate({ year: 2026, month: 1, day: 1 }, 0.5, "days"), null);
});
