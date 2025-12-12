import { describe, expect, it } from "bun:test";
import base64Module from "../base64";
import base64EncodeModule from "../base64Encode";

describe("base64 module", () => {
  it("decodes standard base64 text", () => {
    const input = "SGVsbG8sIENvbnZlcnRlciE="; // "Hello, Converter!"
    const detection = base64Module.detect(input);
    if (!detection) throw new Error("Detection failed");

    const normalized = detection.normalizedInput as { decoded: string };
    expect(normalized.decoded).toBe("Hello, Converter!");

    const payload = base64Module.convert(detection, input);
    const decodedRow = payload?.rows.find(
      (row) => row.label === "Decoded (UTF-8)",
    );
    expect(decodedRow?.value).toBe("Hello, Converter!");
  });

  it("exposes parsed JSON when decoded text is JSON", () => {
    const input = "eyJmb28iOnRydWV9"; // {"foo":true}
    const detection = base64Module.detect(input);
    if (!detection) throw new Error("Detection failed");

    const payload = base64Module.convert(detection, input);
    const jsonRow = payload?.rows.find((row) => row.label === "Decoded JSON");
    expect(jsonRow?.value).toContain('"foo": true');
  });

  it("decodes short unpadded base64 strings", () => {
    const input = "MTAwa2c"; // "100kg"
    const detection = base64Module.detect(input);
    if (!detection) throw new Error("Detection failed");

    const payload = base64Module.convert(detection, input);
    const decodedRow = payload?.rows.find(
      (row) => row.label === "Decoded (UTF-8)",
    );
    expect(decodedRow?.value).toBe("100kg");
  });

  it("detects base64url strings", () => {
    const input = "eyJmb28iOiJiYXNlNjQtdXJsIn0"; // base64url for {"foo":"base64-url"}
    const detection = base64Module.detect(input);
    const normalized = detection?.normalizedInput as { variant?: string };
    expect(normalized?.variant).toBe("base64url");
  });

  it("ignores non-base64 input", () => {
    expect(base64Module.detect("not base64")).toBeNull();
    expect(base64Module.detect("12345678")).toBeNull();
  });

  it("encodes any text to base64 and base64url", () => {
    const input = "Encode me!";
    const payload = base64EncodeModule.convert(input);
    expect(payload).not.toBeNull();

    const rows = payload?.rows ?? [];
    const standard = rows.find((row) => row.label === "Base64 (standard)");
    const urlSafe = rows.find((row) => row.label === "Base64 (URL-safe)");

    expect(standard?.value).toBe("RW5jb2RlIG1lIQ==");
    expect(urlSafe?.value).toBe("RW5jb2RlIG1lIQ");
  });
});
