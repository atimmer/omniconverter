import { describe, expect, it } from "bun:test";
import lengthModule from "../length";

describe("length module", () => {
  it("detects common feet spellings and symbols", () => {
    const samples = ["10 feet", "10 foot", "10 ft", "10 ft.", "10'"];
    for (const sample of samples) {
      const detection = lengthModule.detect(sample);
      expect(detection).not.toBeNull();
    }
  });

  it("normalizes feet to meters", () => {
    const detection = lengthModule.detect("10 feet");
    const normalized = detection?.normalizedInput as { meters: number };
    expect(normalized.meters).toBeCloseTo(3.048, 6);
  });

  it("returns rows for common length units", () => {
    const detection = lengthModule.detect("5 ft");
    if (!detection) throw new Error("Detection failed");
    const payload = lengthModule.convert(detection, "5 ft");
    const labels = payload?.rows.map((row) => row.label);
    expect(labels).toEqual([
      "Feet",
      "Meters",
      "Centimeters",
      "Inches",
      "Yards",
      "Miles",
    ]);
  });
});
