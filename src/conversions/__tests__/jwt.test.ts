import { describe, expect, it } from "bun:test";
import jwtModule from "../jwt";

const sampleJwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";

describe("jwt module", () => {
  it("detects and decodes a valid JWT", () => {
    const detection = jwtModule.detect(sampleJwt);
    expect(detection?.score).toBeGreaterThan(0.5);
    const normalized = detection?.normalizedInput as any;
    expect(normalized?.header.alg).toBe("HS256");
    expect(normalized?.payload.sub).toBe("1234567890");
  });

  it("converts decoded data into rows", () => {
    const detection = jwtModule.detect(sampleJwt)!;
    const payload = jwtModule.convert(detection, sampleJwt);
    expect(payload?.rows.map((r) => r.label)).toEqual([
      "Header (JSON)",
      "Payload (JSON)",
      "Signature",
    ]);
  });
});
