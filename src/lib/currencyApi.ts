import "server-only";

import { env } from "../env";

const BASE_URL = "https://api.currencyapi.com/v3";
const DAILY_CACHE_SECONDS = 60 * 60 * 24;
const LONG_CACHE_SECONDS = DAILY_CACHE_SECONDS * 14;

type CurrencyApiResponse<T> = {
  data: T;
  meta?: {
    last_updated_at?: string;
  };
};

export type CurrencyDefinition = {
  code: string;
  name: string;
  symbol?: string | null;
};

export type CurrencyMap = Record<string, CurrencyDefinition>;

export type LatestRate = {
  code: string;
  value: number;
};

export type LatestRatesMap = Record<string, LatestRate>;

const withKey = (path: string) =>
  `${BASE_URL}${path}${path.includes("?") ? "&" : "?"}apikey=${env.CURRENCY_API_API_KEY}`;

async function fetchCurrencyApi<T>(
  path: string,
  revalidate: number,
): Promise<CurrencyApiResponse<T>> {
  const response = await fetch(withKey(path), {
    headers: { accept: "application/json" },
    next: { revalidate },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    const message = body?.message ?? response.statusText;
    throw new Error(`currencyapi ${response.status}: ${message}`);
  }

  const json = (await response.json()) as unknown;
  return json as CurrencyApiResponse<T>;
}

export async function getAvailableCurrencies(): Promise<{
  currencies: CurrencyMap;
}> {
  const response = await fetchCurrencyApi<CurrencyMap>(
    "/currencies",
    LONG_CACHE_SECONDS,
  );
  return { currencies: response.data };
}

export async function getLatestUsdRates(): Promise<{
  rates: LatestRatesMap;
  asOf?: string;
}> {
  const response = await fetchCurrencyApi<LatestRatesMap>(
    "/latest?base_currency=USD",
    DAILY_CACHE_SECONDS,
  );

  return {
    rates: response.data,
    asOf: response.meta?.last_updated_at,
  };
}

export function computeCrossRate(
  base: string,
  quote: string,
  usdRates: LatestRatesMap,
): number {
  const uppercaseBase = base.toUpperCase();
  const uppercaseQuote = quote.toUpperCase();

  const baseValue =
    uppercaseBase === "USD" ? 1 : usdRates[uppercaseBase]?.value;
  const quoteValue =
    uppercaseQuote === "USD" ? 1 : usdRates[uppercaseQuote]?.value;

  if (typeof baseValue !== "number" || typeof quoteValue !== "number") {
    throw new Error(`Missing rate for ${uppercaseBase} or ${uppercaseQuote}`);
  }

  return quoteValue / baseValue;
}

export const cacheDurations = {
  dailySeconds: DAILY_CACHE_SECONDS,
  longSeconds: LONG_CACHE_SECONDS,
} as const;
