# Converter Unlimited Architecture

This doc describes the planned architecture for expanding Converter Unlimited beyond CSS colors to many input types (e.g., mass conversion, JWT decoding) while also generating many SEO-friendly static pages (e.g., `/rgb-to-hsl`, `/rgba-to-hsla`, `/kg-to-lb`).

The goals:
- One omni-converter experience that works for any supported domain.
- Pluggable modules so adding a new converter is data- and test-first, not a UI rewrite.
- Per-route SEO pages that bias toward their named conversion and add light intro copy, all statically generated at build time.
- Preserve domain-specific niceties (e.g., show a color swatch for colors) while keeping the base UI simple.

## Core Concepts

### Conversion Module Contract
Define a small interface in `src/conversions/types.ts`:

```ts
export type Detection = {
  score: number;            // 0–1 confidence; resolver picks the highest
  normalizedInput?: unknown; // parsed/cleaned value to avoid rework in convert
  reasoning?: string;       // optional debug/help message
};

export type OutputRow = {
  label: string;
  value: string;            // human-friendly display
  copy?: string;            // raw copy value (defaults to value)
  hint?: string;            // short helper/units
};

export type ConversionModule = {
  id: "color" | "mass" | "jwt" | string;
  label: string;            // badge in UI
  detect: (raw: string) => Detection | null;
  convert: (detected: Detection, raw: string) => OutputRow[];
  renderHighlight?: (rows: OutputRow[]) => ReactNode; // optional rich visual
  presets?: Preset[];       // per-module quick-fill chips (e.g., common colors)
};
```

Modules live in `src/conversions/<domain>.ts` and are registered in `src/conversions/index.ts`.

### Resolver
- Function `resolveConversion(raw: string, modules: ConversionModule[], bias?: Bias)`.
- Runs `detect` on every module; picks the one with the highest `score` above a small threshold (`>0.2`, tuneable).
- `bias` can boost certain module IDs (used by SEO pages to favor the route’s conversion).
- Returns `{ module: ConversionModule; detection: Detection; rows: OutputRow[] } | null`.

### Rendering
- The page keeps the existing textarea and helper copy; upon resolution it renders:
  - Module badge (`module.label`).
  - Optional `renderHighlight` for domain-specific visuals (e.g., current color swatch; for JWT maybe a signed/unsigned status pill).
  - A definition list built from `rows`, each with a copy button.
- Fall back to the dashed placeholder when no module matches.

### Domain-Specific Visuals
- Colors: `renderHighlight` shows the swatch box (reuse existing UI) and also pins rows for `RGB`, `RGBA`, `Hex` first.
- Mass: No visual, just rows like `Kilograms`, `Pounds` with unit hints.
- JWT: No swatch; rows labeled `Header (JSON)`, `Payload (JSON)`, `Signature (base64url)`. Optionally add a small “Not verified—decoded only” banner in `renderHighlight`.

## SEO Static Pages

We will generate many static routes under `/[conversion-slug]` (e.g., `/rgb-to-hsl`, `/rgba-to-hsla`, `/kg-to-lb`, `/jwt-decode`). All pages render the same omni-converter component but:
- Include a short intro paragraph tailored to the slug (e.g., what the conversion is and common use-cases).
- Apply a bias to the resolver so the relevant module wins ties, and optionally prefill the textarea with an example.
- Set SEO metadata (title/description/open-graph) per slug.

### Route Configuration
Create `src/conversion-pages/config.ts` exporting an array of configs:

```ts
export type ConversionPageConfig = {
  slug: string;               // "rgb-to-hsl"
  title: string;              // page h1 + metadata title
  description: string;        // metadata + intro
  biasModuleId?: string;      // boosts detect score
  exampleInput?: string;      // prefill textarea
  intro?: ReactNode;          // optional richer intro block
};

export const CONVERSION_PAGES: ConversionPageConfig[] = [
  { slug: "rgb-to-hsl", title: "RGB to HSL Converter", description: "Convert RGB colors to HSL instantly.", biasModuleId: "color", exampleInput: "rgb(255, 0, 128)" },
  { slug: "kg-to-lb", title: "Kilograms to Pounds", description: "Quickly switch between metric and imperial weights.", biasModuleId: "mass", exampleInput: "70 kg" },
  { slug: "jwt-decode", title: "Decode JWT Tokens", description: "Inspect JWT headers and payloads without validating signatures.", biasModuleId: "jwt", exampleInput: "eyJhbGciOi..." },
];
```

### Next.js App Router Wiring (static)
- `app/[slug]/page.tsx`
  - `generateStaticParams` maps `CONVERSION_PAGES` to params.
  - `generateMetadata` uses the matching config.
  - Page component imports the omni-converter, passes `biasModuleId`, `exampleInput`, and intro text.
- All pages are prerendered at build time; no server code needed.

### Omni-Converter Component Contract
- Props: `{ biasModuleId?: string; defaultValue?: string; intro?: ReactNode; }`.
- Lives in `src/components/OmniConverter.tsx`; used by both `/` and `[slug]` routes.
- Handles textarea, helper text, resolver call, and rendering of results.

## File Structure (proposed)

```
src/
  app/
    page.tsx                // home uses OmniConverter
    [slug]/page.tsx         // SEO landing pages
  components/
    OmniConverter.tsx       // shared UI
    ResultRows.tsx          // definition list + copy buttons
    ModuleHighlight.tsx     // renders module.renderHighlight
  conversions/
    types.ts
    index.ts                // registry + resolver export
    color.ts                // wraps existing color converter
    mass.ts                 // kg ↔ lb
    jwt.ts                  // JWT decode (unsigned)
  utils/
    colorConverter.ts       // existing color logic (kept, reused)
  conversion-pages/
    config.ts               // SEO route metadata
```

## Module Notes

### Color
- `detect`: parse via existing color helpers; high score if parse succeeds.
- `convert`: reuse outputs (RGB, RGBA, Hex, HSL if desired).
- `renderHighlight`: show color swatch; optionally show hex as badge.

### Mass (kg ↔ lb)
- `detect`: regex `^\s*\d+(?:\.\d+)?\s*(kg|kilograms?|lb|lbs|pounds?)\s*$`; score higher when a unit is present.
- Normalize to kg; constant: `1 kg = 2.20462262 lb`.
- `convert`: return rows `Kilograms`, `Pounds`; include unit hints.

### JWT Decode
- `detect`: pattern `^[^.]+\.[^.]+\.[^.]+$`; attempt base64url decode of header/payload; score based on success.
- `convert`: pretty-print JSON for header/payload; include signature segment as-is; add hint “Not verified—decode only”.
- Security: decoding only; no secret/verification; safe for offline use.

## Biasing and Examples
- The resolver optionally receives `biasModuleId` (from the SEO route config) and adds a small score bonus to that module during detection.
- `exampleInput` (from route config) pre-populates the textarea and runs an initial conversion so the page immediately shows the relevant output and visuals.

## Testing
- For each module, add unit tests in `src/conversions/__tests__/<module>.test.ts`:
  - Detection success/failure and score ordering.
  - Conversion outputs and rounding (mass).
  - JWT decode happy path and malformed cases.
- Add resolver tests to ensure bias impacts selection and that highest score wins.

## Adding a New Converter (playbook)
1) Create `src/conversions/<id>.ts` implementing the contract.
2) Export from `src/conversions/index.ts` registry.
3) Add SEO config entry in `conversion-pages/config.ts` with `slug`, `title`, `description`, optional `biasModuleId`, and `exampleInput`.
4) Add tests for detection + conversion + resolver selection.
5) If the domain needs visuals, supply `renderHighlight` (keep it lightweight and SSR-safe).
6) Update `README.md` with the new supported conversion(s) if visible to users.

## Future Considerations
- Analytics: track which module wins detection to tune heuristics.
- i18n: module labels/rows can be translated via a shared dictionary.
- Accessibility: ensure `renderHighlight` elements have `aria` labels (e.g., color swatch announced as “Color preview”).
- Performance: modules are small; keep detection pure and fast to preserve instant feedback.
- Styling helpers: when conditionally combining Tailwind classes, use the shared `cn` helper from `src/lib/utils` instead of template strings or manual concatenation. This keeps merges consistent with `tailwind-merge` and avoids layout bugs.
