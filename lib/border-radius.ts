export type RadiusUnit = "px" | "%";
export type Corners = [number, number, number, number];

export function borderRadiusValue(corners: Corners, unit: RadiusUnit): string {
  const max = unit === "px" ? 200 : 100;
  if ((unit !== "px" && unit !== "%") || corners.some((v) => !Number.isFinite(v) || v < 0 || v > max)) {
    throw new RangeError("Invalid radius");
  }
  const [a, b, c, d] = corners;
  const values = b !== d ? corners : a !== c ? [a, b, c] : a !== b ? [a, b] : [a];
  return values.map((v) => `${v}${unit}`).join(" ");
}

export function updateCorner(corners: Corners, index: number, value: number, linked: boolean): Corners {
  return corners.map((v, i) => linked || i === index ? value : v) as Corners;
}
