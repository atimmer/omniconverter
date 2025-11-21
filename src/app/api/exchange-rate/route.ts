import { NextRequest } from "next/server";

import {
  cacheDurations,
  computeCrossRate,
  getAvailableCurrencies,
  getLatestUsdRates,
} from "../../../lib/currencyApi";
import { parseCurrencyPair } from "../../../utils/currencyPair";

export const revalidate = cacheDurations.dailySeconds;

type ErrorBody = { error: { code: string; message: string } };

const badRequest = (code: string, message: string) =>
  Response.json({ error: { code, message } } satisfies ErrorBody, { status: 400 });

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");

  if (!from || !to) {
    return badRequest("MISSING_PARAMS", "Missing query params. Use ?from=USD&to=EUR");
  }

  const pair = parseCurrencyPair(`${from}/${to}`);
  if (!pair) {
    return badRequest(
      "INVALID_PAIR",
      "Invalid currency pair. Use three-letter ISO codes, e.g. ?from=USD&to=EUR.",
    );
  }

  try {
    const [{ currencies }, { rates, asOf }] = await Promise.all([
      getAvailableCurrencies(),
      getLatestUsdRates(),
    ]);

    const unknown = [pair.base, pair.quote].filter((code) => !currencies[code]);
    if (unknown.length > 0) {
      return badRequest(
        "UNKNOWN_CODE",
        `Unknown currency code(s): ${unknown.join(", ")}. Use ISO 4217 codes.`,
      );
    }

    const rate = computeCrossRate(pair.base, pair.quote, rates);
    const inverseRate = rate === 0 ? null : 1 / rate;

    return Response.json(
      {
        base: pair.base,
        quote: pair.quote,
        rate,
        inverseRate,
        asOf,
        cachedSeconds: cacheDurations.dailySeconds,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
        },
      },
    );
  } catch (error) {
    console.error("exchange-rate route error", { error });
    return Response.json(
      {
        error: {
          code: "UPSTREAM_ERROR",
          message: error instanceof Error ? error.message : "Unexpected error",
        },
      } satisfies ErrorBody,
      { status: 502 },
    );
  }
}
