import { strict as assert } from "node:assert";
import { test } from "node:test";
import { calculateAge } from "./age.ts";

test("birthday and next birthday are distinct", () => {
  assert.deepEqual(calculateAge(
    { year: 2000, month: 9, day: 18 },
    { year: 2026, month: 9, day: 18 },
  ), {
    years: 26, months: 0, days: 0, totalDays: 9496,
    nextBirthday: { year: 2027, month: 9, day: 18 },
    daysUntilBirthday: 365, birthdayToday: true,
  });
});

test("breaks age into calendar years months and days", () => {
  const result = calculateAge(
    { year: 2000, month: 1, day: 31 },
    { year: 2026, month: 3, day: 1 },
  );
  assert.deepEqual([result?.years, result?.months, result?.days], [26, 1, 1]);
});

test("Feb 29 anniversary is Feb 28 in non-leap years", () => {
  const result = calculateAge(
    { year: 2024, month: 2, day: 29 },
    { year: 2025, month: 2, day: 28 },
  );
  assert.deepEqual([result?.years, result?.months, result?.days, result?.birthdayToday],
    [1, 0, 0, true]);
  assert.deepEqual(result?.nextBirthday, { year: 2026, month: 2, day: 28 });
});

test("rejects a future birth date and handles year limit", () => {
  assert.equal(calculateAge(
    { year: 2026, month: 9, day: 19 },
    { year: 2026, month: 9, day: 18 },
  ), null);
  const result = calculateAge(
    { year: 9999, month: 12, day: 31 },
    { year: 9999, month: 12, day: 31 },
  );
  assert.equal(result?.nextBirthday, null);
  assert.equal(result?.daysUntilBirthday, null);
});
