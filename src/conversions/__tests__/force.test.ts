import { describe, expect, it } from "bun:test";
import forceModule from "../force";

describe("force module", () => {
  it("detects newtons input", () => {
    const detection = forceModule.detect("10 N");
    expect(detection?.normalizedInput).toEqual({ newtons: 10 });
  });

  it("detects kilonewtons and normalizes to newtons", () => {
    const detection = forceModule.detect("2.5 kN");
    const normalized = detection?.normalizedInput as
      | { newtons: number }
      | undefined;
    expect(normalized?.newtons).toBeCloseTo(2500, 6);
  });

  it("detects pound-force and normalizes to newtons", () => {
    const detection = forceModule.detect("1 lbf");
    const normalized = detection?.normalizedInput as
      | { newtons: number }
      | undefined;
    expect(normalized?.newtons).toBeCloseTo(4.4482216152605, 10);
  });

  it("detects lb-f variants and normalizes to newtons", () => {
    const detection = forceModule.detect("5 lb-f");
    const normalized = detection?.normalizedInput as
      | { newtons: number }
      | undefined;
    expect(normalized?.newtons).toBeCloseTo(22.2411080763025, 10);
  });

  it("detects non-breaking spaces", () => {
    const detection = forceModule.detect("100\u00a0kgf");
    const normalized = detection?.normalizedInput as
      | { newtons: number }
      | undefined;
    expect(normalized?.newtons).toBeCloseTo(980.665, 6);
  });

  it("returns rows for N, kN, lbf, and kgf", () => {
    const detection = forceModule.detect("1000 N");
    if (!detection) throw new Error("Detection failed");

    const payload = forceModule.convert(detection, "1000 N");
    const labels = (payload?.rows ?? []).map((row) => row.label);
    expect(labels).toEqual([
      "Newtons",
      "Kilonewtons",
      "Pound-force",
      "Kilogram-force",
    ]);
  });
});
