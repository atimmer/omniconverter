import { describe, expect, it } from "bun:test";
import momentModule from "../moment";

describe("moment module", () => {
  it("detects N·m input", () => {
    const detection = momentModule.detect("10 N·m");
    expect(detection?.normalizedInput).toEqual({ newtonMeters: 10 });
  });

  it("detects Nm without separator", () => {
    const detection = momentModule.detect("2.5 Nm");
    const normalized = detection?.normalizedInput as
      | { newtonMeters: number }
      | undefined;
    expect(normalized?.newtonMeters).toBeCloseTo(2.5, 12);
  });

  it("detects lb-ft variants and normalizes to N·m", () => {
    const detection = momentModule.detect("1 lb-ft");
    const normalized = detection?.normalizedInput as
      | { newtonMeters: number }
      | undefined;
    // 1 lbf·ft = 4.4482216152605 N * 0.3048 m
    expect(normalized?.newtonMeters).toBeCloseTo(1.3558179483314, 10);
  });

  it("detects ft-lb order", () => {
    const detection = momentModule.detect("10 ft-lb");
    const normalized = detection?.normalizedInput as
      | { newtonMeters: number }
      | undefined;
    expect(normalized?.newtonMeters).toBeCloseTo(13.558179483314, 10);
  });

  it("detects kgf·cm and normalizes to N·m", () => {
    const detection = momentModule.detect("100 kgf·cm");
    const normalized = detection?.normalizedInput as
      | { newtonMeters: number }
      | undefined;
    // 100 kgf·cm = 100 * 9.80665 N * 0.01 m
    expect(normalized?.newtonMeters).toBeCloseTo(9.80665, 8);
  });

  it("returns rows for common torque units", () => {
    const detection = momentModule.detect("1 N m");
    if (!detection) throw new Error("Detection failed");

    const payload = momentModule.convert(detection, "1 N m");
    const labels = (payload?.rows ?? []).map((row) => row.label);
    expect(labels).toEqual([
      "Newton-meters",
      "Kilonewton-meters",
      "Newton-centimeters",
      "Newton-millimeters",
      "Pound-foot",
      "Pound-inch",
      "Kilogram-force meter",
      "Kilogram-force centimeter",
    ]);
  });
});
