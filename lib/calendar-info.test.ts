import { strict as assert } from "node:assert";
import { test } from "node:test";
import { isoWeekOf, nextWeekday, weekdayOf } from "./calendar-info.ts";

test("ISO week crosses the calendar-year boundary", () => {
  assert.deepEqual(isoWeekOf({ year: 2021, month: 1, day: 1 }), {
    week: 53,
    weekYear: 2020,
    monday: { year: 2020, month: 12, day: 28 },
    sunday: { year: 2021, month: 1, day: 3 },
  });
  assert.deepEqual(isoWeekOf({ year: 2024, month: 12, day: 31 }), {
    week: 1,
    weekYear: 2025,
    monday: { year: 2024, month: 12, day: 30 },
    sunday: { year: 2025, month: 1, day: 5 },
  });
});

test("ISO weeks start Monday and include the selected date", () => {
  assert.deepEqual(isoWeekOf({ year: 2026, month: 9, day: 17 }), {
    week: 38,
    weekYear: 2026,
    monday: { year: 2026, month: 9, day: 14 },
    sunday: { year: 2026, month: 9, day: 20 },
  });
});

test("weekday lookup and next occurrence handle leap day and same weekday", () => {
  assert.equal(weekdayOf({ year: 2024, month: 2, day: 29 }), 4);
  assert.deepEqual(nextWeekday({ year: 2024, month: 2, day: 29 }, 4), {
    year: 2024, month: 3, day: 7,
  });
  assert.deepEqual(nextWeekday({ year: 2026, month: 9, day: 17 }, 1), {
    year: 2026, month: 9, day: 21,
  });
});

test("weekday lookup rejects invalid targets and year overflow", () => {
  assert.equal(nextWeekday({ year: 2026, month: 9, day: 17 }, 7), null);
  assert.equal(nextWeekday({ year: 9999, month: 12, day: 31 }, 0), null);
});
