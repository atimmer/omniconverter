"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import CopyButton from "./CopyButton";

const TARGETS = ["USD", "EUR", "GBP", "JPY", "AUD"];

const SYMBOL_BY_CODE: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  CHF: "₣",
  KRW: "₩",
  INR: "₹",
  PHP: "₱",
  RUB: "₽",
  VND: "₫",
  TRY: "₺",
};

type Props = {
  amount: number;
  currencyCode: string;
};

type ApiResponse = {
  base: string;
  quote: string;
  rate: number;
  inverseRate: number | null;
  asOf?: string;
  error?: string;
};

const fetchRate = async (from: string, to: string): Promise<ApiResponse> => {
  const response = await fetch(`/api/exchange-rate?from=${from}&to=${to}`, {
    next: { revalidate: 60 * 60 * 24 },
  });
  const payload = (await response.json()) as ApiResponse;
  if (!response.ok || payload.error || typeof payload.rate !== "number") {
    throw new Error(payload.error ?? "Failed to fetch rate");
  }
  return payload;
};

const formatAmount = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 6,
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(6)} ${currency}`;
  }
};

const formatRate = (rate: number) => {
  const rounded = Number(rate.toFixed(8));
  return rounded.toString();
};

const formatAsOf = (asOf?: string | null) => {
  if (!asOf) return "Updated daily";
  const parsed = new Date(asOf);
  if (Number.isNaN(parsed.getTime())) return "Updated daily";
  return parsed.toLocaleString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};

export default function CurrencyConversionResult({
  amount,
  currencyCode,
}: Props) {
  const uppercase = currencyCode.toUpperCase();
  const targets = useMemo(
    () => TARGETS.filter((target) => target !== uppercase),
    [uppercase],
  );

  const queries = useQueries({
    queries: targets.map((target) => ({
      queryKey: ["currency-rate", uppercase, target],
      queryFn: () => fetchRate(uppercase, target),
    })),
  });

  const anyLoading = queries.some((q) => q.isLoading);
  const anyError = queries.find((q) => q.error);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Converted from
        </p>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="text-lg font-semibold text-slate-900">
            {formatAmount(amount, uppercase)}
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {uppercase}
          </span>
        </div>
      </div>

      {anyLoading ? (
        <p className="text-sm text-slate-500">Fetching daily rates…</p>
      ) : anyError ? (
        <p className="text-sm text-rose-600">
          {anyError instanceof Error
            ? anyError.message
            : "Could not load rates."}
        </p>
      ) : (
        <div className="grid gap-3">
          {queries.map((query, index) => {
            if (!query.data) return null;
            const converted = Number((amount * query.data.rate).toFixed(6));
            const formattedAmount = formatAmount(converted, query.data.quote);
            const rateLabel = formatRate(query.data.rate);
            const plainAmount = converted.toFixed(6);
            const unit = SYMBOL_BY_CODE[query.data.quote] ?? query.data.quote;
            const amountWithUnit =
              unit.length === 1 || unit.endsWith("$")
                ? `${unit}${plainAmount}`
                : `${plainAmount} ${unit}`;

            return (
              <div
                key={query.data.quote ?? targets[index]}
                className="flex flex-wrap items-start gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              >
                <div className="min-w-[180px] flex-1 space-y-1">
                  <div className="text-base font-semibold text-slate-900">
                    {formattedAmount}
                  </div>
                  <div className="text-xs text-slate-600">
                    1 {query.data.base} = {rateLabel} {query.data.quote}
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-xs text-slate-500">
                  <span className="font-mono text-slate-600">
                    {query.data.base} → {query.data.quote}
                  </span>
                  <span>{formatAsOf(query.data.asOf)}</span>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <CopyButton text={plainAmount} label="Copy" />
                  <CopyButton text={amountWithUnit} label="Copy with unit" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
