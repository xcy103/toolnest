export const MAX_DRAW_COUNT = 100;

export function parsePickerEntries(text: string, removeDuplicates: boolean) {
  const entries = text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return {
    inputCount: entries.length,
    pool: removeDuplicates ? [...new Set(entries)] : entries,
  };
}

function secureRandomIndex(max: number): number {
  const range = 0x100000000;
  const limit = Math.floor(range / max) * max;
  const value = new Uint32Array(1);
  do {
    crypto.getRandomValues(value);
  } while (value[0] >= limit);
  return value[0] % max;
}

export function drawPickerEntries(
  pool: string[],
  count: number,
  withoutReplacement: boolean,
  randomIndex: (max: number) => number = secureRandomIndex,
): string[] {
  if (!Number.isInteger(count) || count < 1 || count > MAX_DRAW_COUNT || pool.length === 0 ||
      (withoutReplacement && count > pool.length)) {
    throw new RangeError("Invalid draw count or empty candidate pool");
  }

  if (!withoutReplacement) {
    return Array.from({ length: count }, () => pool[randomIndex(pool.length)]);
  }

  const remaining = [...pool];
  const result: string[] = [];
  for (let index = 0; index < count; index++) {
    const chosen = index + randomIndex(remaining.length - index);
    [remaining[index], remaining[chosen]] = [remaining[chosen], remaining[index]];
    result.push(remaining[index]);
  }
  return result;
}
