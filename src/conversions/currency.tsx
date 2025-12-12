import type { ConversionModule, ConversionPayload, Detection } from "./types";
import CurrencyConversionResult from "../components/CurrencyConversionResult";

const CURRENCY_SYMBOLS: Record<string, string> = {
  $: "USD",
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY",
  "₩": "KRW",
  "₹": "INR",
  "₱": "PHP",
  "₽": "RUB",
  "₣": "CHF",
  "₫": "VND",
  "₺": "TRY",
};

const KNOWN_CODES = new Set([
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CHF",
  "CAD",
  "AUD",
  "NZD",
  "SEK",
  "NOK",
  "DKK",
  "CNY",
  "HKD",
  "SGD",
  "KRW",
  "INR",
  "BRL",
  "MXN",
  "ZAR",
  "PLN",
  "TRY",
  "RUB",
  "ILS",
  "AED",
  "SAR",
  "THB",
  "TWD",
  "HUF",
  "CZK",
  "CLP",
  "COP",
  "ARS",
  "VND",
  "PHP",
]);

type NormalizedCurrency = {
  amount: number;
  code: string;
};

// Matches forms like "$100", "100$", "100 EUR", "EUR 100", "€100", "100€", "usd 5"
const CURRENCY_REGEX =
  /^\s*(?<prefix>[$€£¥₩₹₱₽₣₫₺]|[A-Za-z]{3})?\s*(?<amount>-?\d+(?:[.,]\d+)?)\s*(?<suffix>[$€£¥₩₹₱₽₣₫₺]|[A-Za-z]{3})?\s*$/i;

const normalizeCode = (raw?: string): string | null => {
  if (!raw) return null;
  const trimmed = raw.trim();
  const symbolCode = CURRENCY_SYMBOLS[trimmed];
  if (symbolCode) return symbolCode;

  if (trimmed.length === 3) {
    const upper = trimmed.toUpperCase();
    if (KNOWN_CODES.has(upper)) return upper;
  }
  return null;
};

const detect = (raw: string): Detection | null => {
  const match = raw.match(CURRENCY_REGEX);
  if (!match?.groups) return null;

  const amountString = match.groups.amount.replace(",", ".");
  const amount = Number.parseFloat(amountString);
  if (!Number.isFinite(amount)) return null;

  const prefixCode = normalizeCode(match.groups.prefix);
  const suffixCode = normalizeCode(match.groups.suffix);
  const code = prefixCode ?? suffixCode;
  if (!code) return null;

  return {
    score: 0.86,
    normalizedInput: { amount, code } satisfies NormalizedCurrency,
  };
};

const convert = (detection: Detection): ConversionPayload | null => {
  const normalized = detection.normalizedInput as
    | NormalizedCurrency
    | undefined;
  if (!normalized) return null;

  return {
    rows: [],
    highlight: (
      <CurrencyConversionResult
        amount={normalized.amount}
        currencyCode={normalized.code}
      />
    ),
  };
};

const currencyModule: ConversionModule = {
  id: "currency",
  label: "Currency",
  detect,
  convert,
};

export default currencyModule;
