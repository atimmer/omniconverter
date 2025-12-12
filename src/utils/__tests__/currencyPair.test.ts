import { describe, expect, it } from "bun:test";

import { parseCurrencyPair } from "../currencyPair";

describe("parseCurrencyPair", () => {
  it("parses slash-delimited pairs", () => {
    expect(parseCurrencyPair("USD/EUR")).toEqual({ base: "USD", quote: "EUR" });
  });

  it("parses lowercase strings with spaces", () => {
    expect(parseCurrencyPair("gbp to jpy")).toEqual({
      base: "GBP",
      quote: "JPY",
    });
  });

  it("returns null for invalid input", () => {
    expect(parseCurrencyPair("not a pair")).toBeNull();
    expect(parseCurrencyPair("rgb(255, 0, 0)")).toBeNull();
  });
});
