import { describe, expect, it } from "bun:test";
import massModule from "../mass";

describe("mass module", () => {
  it("detects kg input", () => {
    const detection = massModule.detect("70 kg");
    expect(detection?.normalizedInput).toEqual({ kg: 70 });
  });

  it("detects pounds input and normalizes to kg", () => {
    const detection = massModule.detect("220 lb");
    const normalized = detection?.normalizedInput as { kg: number };
    expect(normalized.kg).toBeCloseTo(99.7903, 4);
  });

  it("converts normalized mass to rows", () => {
    const detection = massModule.detect("10 kg");
    if (!detection) throw new Error("Detection failed");
    const payload = massModule.convert(detection, "10 kg");
    expect(payload?.rows[0].label).toBe("Kilograms");
    expect(payload?.rows[1].label).toBe("Pounds");
  });
});
