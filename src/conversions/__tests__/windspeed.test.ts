import { describe, expect, it } from "bun:test";
import windspeedModule from "../windspeed";

describe("windspeed module (Beaufort)", () => {
  it("detects Beaufort shorthand like 1Bft", () => {
    const detection = windspeedModule.detect("1Bft");
    expect(detection).not.toBeNull();
    expect(detection?.normalizedInput).toEqual({ beaufort: 1 });
  });

  it("rejects out-of-range Beaufort values", () => {
    expect(windspeedModule.detect("13Bft")).toBeNull();
    expect(windspeedModule.detect("-1Bft")).toBeNull();
  });

  it("converts Beaufort to m/s and km/h ranges", () => {
    const detection = windspeedModule.detect("1Bft");
    if (!detection) throw new Error("Detection failed");

    const payload = windspeedModule.convert(detection, "1Bft");
    expect(payload?.rows).toHaveLength(2);
    expect(payload?.rows[0]).toMatchObject({
      label: "Meters per second",
      value: "0.3–1.5 m/s",
    });
    expect(payload?.rows[1]).toMatchObject({
      label: "Kilometers per hour",
      value: "1–5 km/h",
    });
  });
});
