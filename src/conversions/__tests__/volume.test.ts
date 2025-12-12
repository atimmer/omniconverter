import { describe, expect, it } from "bun:test";
import volumeModule from "../volume";

describe("volume module", () => {
  it("detects liters input", () => {
    const detection = volumeModule.detect("2 L");
    expect(detection?.normalizedInput).toEqual({ liters: 2 });
  });

  it("detects milliliters input and normalizes to liters", () => {
    const detection = volumeModule.detect("750 ml");
    const normalized = detection?.normalizedInput as { liters: number };
    expect(normalized.liters).toBeCloseTo(0.75, 8);
  });

  it("detects cubic meters input and normalizes to liters", () => {
    const detection = volumeModule.detect("1.5 m^3");
    const normalized = detection?.normalizedInput as { liters: number };
    expect(normalized.liters).toBeCloseTo(1500, 8);
  });

  it("detects US gallons input and normalizes to liters", () => {
    const detection = volumeModule.detect("1 gal");
    const normalized = detection?.normalizedInput as { liters: number };
    expect(normalized.liters).toBeCloseTo(3.785411784, 10);
  });

  it("converts normalized volume to rows", () => {
    const detection = volumeModule.detect("1 L");
    if (!detection) throw new Error("Detection failed");
    const payload = volumeModule.convert(detection, "1 L");
    expect(payload?.rows[0].label).toBe("Liters");
    expect(payload?.rows.some((r) => r.label === "US gallons")).toBe(true);
  });
});
