import { describe, expect, it } from "bun:test";
import { resolveAlwaysPossible } from "..";
import base64EncodeModule from "../base64Encode";
import type { AlwaysPossibleModule } from "../types";

const stubModule = (
  id: string,
  heuristic: number,
): AlwaysPossibleModule => ({
  id,
  label: id,
  convert: (raw) => ({ rows: [{ label: "echo", value: raw }] }),
  heuristicScore: () => heuristic,
});

describe("always possible resolver", () => {
  it("returns nothing when there is no input", () => {
    const results = resolveAlwaysPossible("   ", [base64EncodeModule]);
    expect(results).toHaveLength(0);
  });

  it("orders converters by heuristic score", () => {
    const fast = stubModule("fast", 1.5);
    const slow = stubModule("slow", 0.2);

    const [first] = resolveAlwaysPossible("abc", [slow, fast]);
    expect(first.module.id).toBe("fast");
  });

  it("promotes the preferred converter id from the URL", () => {
    const preferred = stubModule("preferred", 0.1);
    const defaultTop = stubModule("default-top", 1.2);

    const [first] = resolveAlwaysPossible("payload", [defaultTop, preferred], {
      preferredModuleId: "preferred",
    });

    expect(first.module.id).toBe("preferred");
  });
});
