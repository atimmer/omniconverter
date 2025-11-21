# Converter Unlimited

A small Next.js (App Router) tool that converts CSS colors (hex, rgb(a), hsl(a), and named keywords) to RGB, RGBA, and Hex in one paste.

## Stack
- Next.js 15
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
3. Paste any supported CSS color (hex, rgb/rgba, hsl/hsla, named keyword) to see live conversions.

## Notes
- Tailwind classes are defined in `src/app/globals.css`.
- Core UI lives in `src/app/page.tsx`; color parsing is in `src/utils/colorConverter.ts`.
