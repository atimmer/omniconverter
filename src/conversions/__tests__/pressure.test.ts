import { describe, expect, it } from "bun:test";
import pressureModule from "../pressure";

describe("pressure module", () => {
  it("detects hPa input and normalizes to pascals", () => {
    const detection = pressureModule.detect("1013.25 hPa");
    const normalized = detection?.normalizedInput as { pascals: number } | undefined;
    expect(normalized?.pascals).toBeCloseTo(101_325, 6);
  });

  it("treats mbar as equivalent to hPa", () => {
    const detection = pressureModule.detect("1013.25 mbar");
    const normalized = detection?.normalizedInput as { pascals: number } | undefined;
    expect(normalized?.pascals).toBeCloseTo(101_325, 6);
  });

  it("detects mmHg input and normalizes using 1 atm = 760 mmHg", () => {
    const detection = pressureModule.detect("760 mmHg");
    const normalized = detection?.normalizedInput as { pascals: number } | undefined;
    expect(normalized?.pascals).toBeCloseTo(101_325, 6);
  });

  it("converts 1 atm into the expected equivalents", () => {
    const detection = pressureModule.detect("1 atm");
    if (!detection) throw new Error("Detection failed");
    const payload = pressureModule.convert(detection, "1 atm");
    const rows = payload?.rows ?? [];

    const atmRow = rows.find((row) => row.label === "Atmospheres");
    const hpaRow = rows.find((row) => row.label === "Hectopascals");
    const mbarRow = rows.find((row) => row.label === "Millibars");
    const mmhgRow = rows.find((row) => row.label === "Millimeters of mercury");

    expect(atmRow?.copy).toBe("1");
    expect(parseFloat(hpaRow?.copy ?? "")).toBeCloseTo(1013.25, 6);
    expect(parseFloat(mbarRow?.copy ?? "")).toBeCloseTo(1013.25, 6);
    expect(parseFloat(mmhgRow?.copy ?? "")).toBeCloseTo(760, 6);
  });
});

