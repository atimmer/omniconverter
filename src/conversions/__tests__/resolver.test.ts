import { describe, expect, it } from "bun:test";
import { modules, resolveConversion, resolveConversions } from "../index";

describe("resolver", () => {
  it("picks color for rgb input", () => {
    const result = resolveConversion("rgb(10, 20, 30)", modules);
    expect(result?.module.id).toBe("color");
  });

  it('detects "100f" as both temperature and color (prefers temperature)', () => {
    const temperature = modules.find((module) => module.id === "temperature");
    const color = modules.find((module) => module.id === "color");
    expect(temperature).toBeTruthy();
    expect(color).toBeTruthy();

    expect(temperature?.detect("100f")).not.toBeNull();
    expect(color?.detect("100f")).not.toBeNull();

    const results = resolveConversions("100f", modules);
    expect(results.map((r) => r.module.id)).toEqual(["temperature", "color"]);

    const result = resolveConversion("100f", modules);
    expect(result?.module.id).toBe("temperature");
  });

  it("biases toward configured module when scores tie", () => {
    const result = resolveConversion("70 kg", modules, {
      biasModuleId: "mass",
    });
    expect(result?.module.id).toBe("mass");
  });

  it("detects speed notation", () => {
    const result = resolveConversion("36 km/h", modules);
    expect(result?.module.id).toBe("speed");
  });

  it("detects mph speed notation", () => {
    const result = resolveConversion("60 mph", modules);
    expect(result?.module.id).toBe("speed");
  });

  it("detects force notation", () => {
    const result = resolveConversion("10 N", modules);
    expect(result?.module.id).toBe("force");
  });

  it("detects moment (torque) notation", () => {
    const result = resolveConversion("10 N·m", modules);
    expect(result?.module.id).toBe("moment");
  });

  it("detects Beaufort windspeed notation", () => {
    const result = resolveConversion("1Bft", modules);
    expect(result?.module.id).toBe("windspeed");
  });

  it("detects pressure notation", () => {
    const result = resolveConversion("1013.25 hPa", modules);
    expect(result?.module.id).toBe("pressure");
  });

  it("detects radar reflectivity dBZ notation", () => {
    const result = resolveConversion("40 dBZ", modules);
    expect(result?.module.id).toBe("rain-rate");
  });

  it("detects data-size notation", () => {
    const result = resolveConversion("1024mb", modules);
    expect(result?.module.id).toBe("data-size");
  });

  it("detects volume notation", () => {
    const result = resolveConversion("2 L", modules);
    expect(result?.module.id).toBe("volume");
  });

  it("detects temperature notation", () => {
    const result = resolveConversion("100 C", modules);
    expect(result?.module.id).toBe("temperature");
  });

  it("returns null for empty input", () => {
    expect(resolveConversion("   ", modules)).toBeNull();
  });
});
