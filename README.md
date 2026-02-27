# Converter Unlimited

A small Next.js (App Router) tool that auto-detects inputs and converts them inline. Today it handles:

- CSS colors (hex, rgb/rgba, hsl/hsla, named keywords) → RGB, RGBA, Hex with a live swatch.
- Mass (kg ↔ lb).
- Length (feet ↔ meters, centimeters, inches, yards, miles).
- Speed (km/h ↔ m/s ↔ mph).
- Time durations (seconds ↔ minutes ↔ hours ↔ days ↔ weeks ↔ months).
- Clock time (12-hour am/pm ↔ 24-hour HH:mm).
- Power (watts ↔ kilowatts ↔ horsepower ↔ megawatts).
- Data size (bytes, KB, MB, GB, TB).
- JWT decode (header + payload + signature, decode only).
- Base64 encode (any text to standard + URL-safe base64).
- Base64 decode (standard + base64url into UTF-8, with optional JSON pretty-print).
- Currency exchange rates (any pair via USD-based daily rates from currencyapi.com).

## Currency Converter

- Detects inputs like `$100`, `100 EUR`, `€25.50`, or `usd 5`.
- Uses `/api/exchange-rate?from=EUR&to=USD` (ISO 4217 codes) which:
  - Caches the `latest` USD-based rates for 24h (upstream updates daily).
  - Caches the currencies list for 14 days.
  - Returns `{ base, quote, rate, inverseRate?, asOf }` or a structured `{ error: { code, message } }`.
- Client rendering uses React Query to fetch common targets and shows formatted amounts with consistent precision.

SEO-friendly landing pages (e.g., `/rgb-to-hsl`, `/kg-to-lb`, `/jwt-decode`) are statically generated and reuse the omni-converter with a bias toward the named conversion plus intro copy.

An “always-on” section sits below the main results to surface converters that work on any input (starting with Base64 encode) without changing the primary “no results” state.

## Stack

- Next.js 16
- React 19 + TypeScript
- Tailwind CSS

## Commands

- `pnpm dev` – run the dev server at http://localhost:3000.
- `pnpm build` – production build.
- `pnpm start` – serve the production build.
- `pnpm lint` – run `next lint` (Flat config with Next + TS rules).
- `pnpm docs:list` – list project docs (via shared guardrail helper).

## Development

1. Install deps: `./runner pnpm install`.
2. Start dev: `./runner pnpm dev` and open the app.
3. Paste a supported value (color, mass, JWT) and see instant conversions. SEO routes bias detection toward the page’s conversion.

## Notes

- Tailwind classes are defined in `src/app/globals.css`.
- Omni converter UI lives in `src/components/OmniConverter.tsx`; route configs for SEO pages live in `src/conversion-pages/config.ts`.
- Conversion modules reside under `src/conversions/` with a small resolver; docs in `docs/ARCHITECTURE.MD`.
