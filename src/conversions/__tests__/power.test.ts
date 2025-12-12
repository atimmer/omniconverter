import { describe, expect, it } from "bun:test";
import powerModule from "../power";

describe("power module", () => {
  it("detects kilowatts and normalizes to watts", () => {
    const detection = powerModule.detect("2.5 kW");
    const normalized = detection?.normalizedInput as
      | { watts: number }
      | undefined;
    expect(normalized?.watts).toBeCloseTo(2500, 3);
  });

  it("detects horsepower and converts to watts", () => {
    const detection = powerModule.detect("1 hp");
    const normalized = detection?.normalizedInput as
      | { watts: number }
      | undefined;
    expect(normalized?.watts).toBeCloseTo(745.699872, 6);
  });

  it("detects compact uppercase input with no space", () => {
    const detection = powerModule.detect("100W");
    expect(detection?.normalizedInput).toEqual({ watts: 100 });
  });

  it("detects inputs with non-breaking spaces", () => {
    const detection = powerModule.detect("150\u00a0kW");
    const normalized = detection?.normalizedInput as
      | { watts: number }
      | undefined;
    expect(normalized?.watts).toBeCloseTo(150_000, 3);
  });

  it("returns rows for watts, kilowatts, horsepower, and megawatts", () => {
    const detection = powerModule.detect("1000 W");
    if (!detection) throw new Error("Detection failed");

    const payload = powerModule.convert(detection, "1000 W");
    const rows = payload?.rows ?? [];

    const labels = rows.map((row) => row.label);
    expect(labels).toEqual(["Watts", "Kilowatts", "Horsepower", "Megawatts"]);

    const horsepower = parseFloat(rows[2]?.copy ?? "");
    expect(horsepower).toBeCloseTo(1.341022, 6);
  });
});
