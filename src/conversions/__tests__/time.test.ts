import { describe, expect, it } from "bun:test";
import timeModule from "../time";

describe("time module", () => {
  it("detects minutes and normalizes to seconds", () => {
    const detection = timeModule.detect("90m");
    if (!detection) throw new Error("Detection failed");
    const normalized = detection.normalizedInput as {
      seconds: number;
      sourceUnit: string;
    };
    expect(normalized.seconds).toBe(90 * 60);
    expect(normalized.sourceUnit).toBe("minute");
  });

  it("renders 90m as 1h30m and 5400 seconds", () => {
    const detection = timeModule.detect("90m");
    if (!detection) throw new Error("Detection failed");
    const payload = timeModule.convert(detection, "90m");
    if (!payload) throw new Error("Convert failed");

    const pretty = payload.rows.find((r) => r.label === "Pretty");
    const seconds = payload.rows.find((r) => r.label === "Seconds");

    expect(pretty?.value).toBe("1h30m");
    expect(seconds?.value).toBe("5400 s");
    expect(seconds?.copy).toBe("5400");
  });

  it("marks month -> week as approximate", () => {
    const detection = timeModule.detect("1 month");
    if (!detection) throw new Error("Detection failed");
    const payload = timeModule.convert(detection, "1 month");
    if (!payload) throw new Error("Convert failed");

    const weeks = payload.rows.find((r) => r.label === "Weeks");
    expect(weeks?.hint ?? "").toContain("Approximate");
  });

  it("marks week -> month as approximate", () => {
    const detection = timeModule.detect("1 week");
    if (!detection) throw new Error("Detection failed");
    const payload = timeModule.convert(detection, "1 week");
    if (!payload) throw new Error("Convert failed");

    const months = payload.rows.find((r) => r.label === "Months");
    expect(months?.hint ?? "").toContain("Approximate");
  });
});
