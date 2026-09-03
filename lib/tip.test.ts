import { strict as assert } from "node:assert";
import { test } from "node:test";
import { calculateTip, MAX_BILL_CENTS, MAX_PEOPLE } from "./tip.ts";

test("tip: computes bill, tip, total and equal shares", () => {
  assert.deepEqual(calculateTip({ bill: "100", rate: "15", people: "2" }), {
    ok: true, billCents: 10000, tipCents: 1500, totalCents: 11500,
    groups: [{ people: 2, cents: 5750 }],
  });
});

test("tip: distributes remainder cents without changing the total", () => {
  const result = calculateTip({ bill: "100", rate: "0", people: "3" });
  assert.ok(result.ok);
  assert.deepEqual(result.groups, [{ people: 2, cents: 3333 }, { people: 1, cents: 3334 }]);
});

test("tip: rounds half a cent up using decimal input, not binary money arithmetic", () => {
  for (const [bill, rate, cents] of [["0.10", "15", 2], ["1.005", "15", null], ["19.99", "18.5", 370], [".50", "1", 1]] as const) {
    const result = calculateTip({ bill, rate, people: "1" });
    if (cents === null) {
      assert.deepEqual(result, { ok: false, errors: ["bill"] });
    } else {
      assert.ok(result.ok);
      assert.equal(result.tipCents, cents);
    }
  }
});

test("tip: zero bill and zero tip are valid", () => {
  const result = calculateTip({ bill: "0", rate: "0", people: "5" });
  assert.ok(result.ok);
  assert.equal(result.totalCents, 0);
  assert.deepEqual(result.groups, [{ people: 5, cents: 0 }]);
});

test("tip: rejects malformed, negative and out-of-range amounts", () => {
  for (const bill of ["", " ", "-1", "NaN", "Infinity", "1e2", "0x10", "1,000", "1.234", "1000000000", "9007199254740992"]) {
    assert.deepEqual(calculateTip({ bill, rate: "15", people: "2" }), { ok: false, errors: ["bill"] }, bill);
  }
});

test("tip: validates percentages and the integer party size independently", () => {
  for (const rate of ["", "-1", "100.01", "15.001", "1e1"]) {
    assert.deepEqual(calculateTip({ bill: "100", rate, people: "2" }), { ok: false, errors: ["rate"] });
  }
  for (const people of ["", "0", "-1", "1.5", "101", "1e1"]) {
    assert.deepEqual(calculateTip({ bill: "100", rate: "15", people }), { ok: false, errors: ["people"] });
  }
  assert.deepEqual(calculateTip({ bill: "", rate: "", people: "" }), { ok: false, errors: ["bill", "rate", "people"] });
});

test("tip: accepts whitespace, trailing decimal point and decimal rate", () => {
  const result = calculateTip({ bill: " 10. ", rate: " 12.50 ", people: " 2 " });
  assert.ok(result.ok);
  assert.equal(result.tipCents, 125);
});

test("tip: boundary amounts and all supported party sizes preserve integer totals", () => {
  for (const bill of ["0.01", "0.02", "0.99", "10.01", "100", (MAX_BILL_CENTS / 100).toFixed(2)]) {
    for (const rate of ["0", "0.01", "18.75", "100"]) {
      for (let people = 1; people <= MAX_PEOPLE; people++) {
        const result = calculateTip({ bill, rate, people: String(people) });
        assert.ok(result.ok);
        assert.equal(result.groups.reduce((sum, group) => sum + group.people * group.cents, 0), result.totalCents);
        assert.equal(result.groups.reduce((sum, group) => sum + group.people, 0), people);
        assert.ok(result.groups.every((group) => group.people > 0 && Number.isSafeInteger(group.cents)));
        assert.equal(result.billCents + result.tipCents, result.totalCents);
        assert.ok(result.groups.at(-1)!.cents - result.groups[0].cents <= 1);
      }
    }
  }
});
