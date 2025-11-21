import { describe, expect, it } from "bun:test";
import { modules, resolveConversion } from "../index";

describe("resolver", () => {
  it("picks color for rgb input", () => {
    const result = resolveConversion("rgb(10, 20, 30)", modules);
    expect(result?.module.id).toBe("color");
  });

  it("biases toward configured module when scores tie", () => {
    const result = resolveConversion("70 kg", modules, { biasModuleId: "mass" });
    expect(result?.module.id).toBe("mass");
  });

  it("returns null for empty input", () => {
    expect(resolveConversion("   ", modules)).toBeNull();
  });
});
