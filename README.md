# Converter Unlimited

A small Next.js (App Router) tool that auto-detects inputs and converts them inline. Today it handles:
- CSS colors (hex, rgb/rgba, hsl/hsla, named keywords) → RGB, RGBA, Hex with a live swatch.
- Mass (kg ↔ lb).
- Speed (km/h ↔ m/s ↔ mph).
- Power (watts ↔ kilowatts ↔ horsepower ↔ megawatts).
- Data size (bytes, KB, MB, GB, TB).
- JWT decode (header + payload + signature, decode only).
- Base64 decode (standard + base64url into UTF-8, with optional JSON pretty-print).

SEO-friendly landing pages (e.g., `/rgb-to-hsl`, `/kg-to-lb`, `/jwt-decode`) are statically generated and reuse the omni-converter with a bias toward the named conversion plus intro copy.

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
