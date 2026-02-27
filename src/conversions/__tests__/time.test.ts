import { describe, expect, it } from "bun:test";
import timeModule from "../time";

describe("time module", () => {
  it("detects 24-hour clock inputs", () => {
    const detection = timeModule.detect("11:24");
    if (!detection) throw new Error("Detection failed");
    const normalized = detection.normalizedInput as
      | { kind: string; hour24: number; minute: number }
      | undefined;

    expect(normalized?.kind).toBe("clock");
    expect(normalized?.hour24).toBe(11);
    expect(normalized?.minute).toBe(24);
  });

  it("detects am/pm clock inputs", () => {
    const tenAm = timeModule.detect("10am")?.normalizedInput as
      | { kind: string; hour24: number; minute: number }
      | undefined;
    expect(tenAm?.kind).toBe("clock");
    expect(tenAm?.hour24).toBe(10);
    expect(tenAm?.minute).toBe(0);

    const tenThirtyAm = timeModule.detect("10:30 am")?.normalizedInput as
      | { kind: string; hour24: number; minute: number }
      | undefined;
    expect(tenThirtyAm?.kind).toBe("clock");
    expect(tenThirtyAm?.hour24).toBe(10);
    expect(tenThirtyAm?.minute).toBe(30);

    const tenPm = timeModule.detect("10PM")?.normalizedInput as
      | { kind: string; hour24: number; minute: number }
      | undefined;
    expect(tenPm?.kind).toBe("clock");
    expect(tenPm?.hour24).toBe(22);
    expect(tenPm?.minute).toBe(0);
  });

  it("converts 24-hour to 12-hour values", () => {
    const detection = timeModule.detect("23:00");
    if (!detection) throw new Error("Detection failed");
    const payload = timeModule.convert(detection, "23:00");
    if (!payload) throw new Error("Convert failed");

    const value24h = payload.rows.find((r) => r.label === "24-hour");
    const value12h = payload.rows.find((r) => r.label === "12-hour");
    const compact12h = payload.rows.find(
      (r) => r.label === "12-hour (compact)",
    );

    expect(value24h?.value).toBe("23:00");
    expect(value12h?.value).toBe("11:00 PM");
    expect(compact12h?.value).toBe("11pm");
  });

  it("converts am/pm to 24-hour values", () => {
    const detection = timeModule.detect("10PM");
    if (!detection) throw new Error("Detection failed");
    const payload = timeModule.convert(detection, "10PM");
    if (!payload) throw new Error("Convert failed");

    const value24h = payload.rows.find((r) => r.label === "24-hour");
    const value12h = payload.rows.find((r) => r.label === "12-hour");

    expect(value24h?.value).toBe("22:00");
    expect(value12h?.value).toBe("10:00 PM");
  });

  it("handles midnight and noon in am/pm inputs", () => {
    const midnightDetection = timeModule.detect("12am");
    if (!midnightDetection) throw new Error("Detection failed");
    const midnightPayload = timeModule.convert(midnightDetection, "12am");
    if (!midnightPayload) throw new Error("Convert failed");
    const midnight24h = midnightPayload.rows.find((r) => r.label === "24-hour");
    expect(midnight24h?.value).toBe("00:00");

    const noonDetection = timeModule.detect("12PM");
    if (!noonDetection) throw new Error("Detection failed");
    const noonPayload = timeModule.convert(noonDetection, "12PM");
    if (!noonPayload) throw new Error("Convert failed");
    const noon24h = noonPayload.rows.find((r) => r.label === "24-hour");
    expect(noon24h?.value).toBe("12:00");
  });

  it("keeps leading-zero 24-hour input and converts to am/pm", () => {
    const detection = timeModule.detect("05:32");
    if (!detection) throw new Error("Detection failed");
    const payload = timeModule.convert(detection, "05:32");
    if (!payload) throw new Error("Convert failed");

    const value24h = payload.rows.find((r) => r.label === "24-hour");
    const value12h = payload.rows.find((r) => r.label === "12-hour");

    expect(value24h?.value).toBe("05:32");
    expect(value12h?.value).toBe("5:32 AM");
  });

  it("detects minutes and normalizes to seconds", () => {
    const detection = timeModule.detect("90m");
    if (!detection) throw new Error("Detection failed");
    const normalized = detection.normalizedInput as {
      kind: string;
      seconds: number;
      sourceUnit: string;
    };
    expect(normalized.kind).toBe("duration");
    expect(normalized.seconds).toBe(90 * 60);
    expect(normalized.sourceUnit).toBe("minute");
  });

  it("detects dotted abbreviations", () => {
    const seconds = timeModule.detect("10 sec.")?.normalizedInput as
      | { kind: string; seconds: number; sourceUnit: string }
      | undefined;
    expect(seconds?.kind).toBe("duration");
    expect(seconds?.seconds).toBe(10);
    expect(seconds?.sourceUnit).toBe("second");

    const minutes = timeModule.detect("10 mins.")?.normalizedInput as
      | { kind: string; seconds: number; sourceUnit: string }
      | undefined;
    expect(minutes?.kind).toBe("duration");
    expect(minutes?.seconds).toBe(600);
    expect(minutes?.sourceUnit).toBe("minute");

    const hours = timeModule.detect("10 hrs.")?.normalizedInput as
      | { kind: string; seconds: number; sourceUnit: string }
      | undefined;
    expect(hours?.kind).toBe("duration");
    expect(hours?.seconds).toBe(36000);
    expect(hours?.sourceUnit).toBe("hour");

    const months = timeModule.detect("10 mos.")?.normalizedInput as
      | { kind: string; seconds: number; sourceUnit: string }
      | undefined;
    expect(months?.kind).toBe("duration");
    expect(months?.seconds).toBeCloseTo(10 * 60 * 60 * 24 * 7 * (52 / 12), 6);
    expect(months?.sourceUnit).toBe("month");
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
