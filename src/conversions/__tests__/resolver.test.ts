import { describe, expect, it } from "bun:test";
import { modules, resolveConversion } from "../index";

describe("resolver", () => {
  it("picks color for rgb input", () => {
    const result = resolveConversion("rgb(10, 20, 30)", modules);
    expect(result?.module.id).toBe("color");
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

  it("detects data-size notation", () => {
    const result = resolveConversion("1024mb", modules);
    expect(result?.module.id).toBe("data-size");
  });

  it("detects volume notation", () => {
    const result = resolveConversion("2 L", modules);
    expect(result?.module.id).toBe("volume");
  });

  it("returns null for empty input", () => {
    expect(resolveConversion("   ", modules)).toBeNull();
  });
});
