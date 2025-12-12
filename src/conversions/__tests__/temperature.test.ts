import { describe, expect, it } from "bun:test";
import temperatureModule from "../temperature";

describe("temperature module", () => {
  it("detects celsius input and normalizes to kelvin", () => {
    const detection = temperatureModule.detect("100 C");
    const normalized = detection?.normalizedInput as
      | { kelvin: number }
      | undefined;
    expect(normalized?.kelvin).toBeCloseTo(373.15, 6);
  });

  it("detects degree symbol input", () => {
    const detection = temperatureModule.detect("0°C");
    const normalized = detection?.normalizedInput as
      | { kelvin: number }
      | undefined;
    expect(normalized?.kelvin).toBeCloseTo(273.15, 6);
  });

  it("detects fahrenheit input and normalizes to kelvin", () => {
    const detection = temperatureModule.detect("32 F");
    const normalized = detection?.normalizedInput as
      | { kelvin: number }
      | undefined;
    expect(normalized?.kelvin).toBeCloseTo(273.15, 6);
  });

  it("detects kelvin input", () => {
    const detection = temperatureModule.detect("273.15 K");
    const normalized = detection?.normalizedInput as
      | { kelvin: number }
      | undefined;
    expect(normalized?.kelvin).toBeCloseTo(273.15, 6);
  });

  it("converts normalized temperature to rows", () => {
    const detection = temperatureModule.detect("100 C");
    if (!detection) throw new Error("Detection failed");
    const payload = temperatureModule.convert(detection, "100 C");

    const labels = (payload?.rows ?? []).map((row) => row.label);
    expect(labels).toEqual(["Celsius", "Fahrenheit", "Kelvin"]);
  });
});
