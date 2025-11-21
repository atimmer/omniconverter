import type {
  AlwaysPossibleModule,
  ConversionPayload,
  OutputRow,
} from "./types";

const encodeToBase64 = (value: string): string | null => {
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(value, "utf8").toString("base64");
    }

    if (typeof btoa === "function") {
      const utf8 = encodeURIComponent(value).replace(
        /%([0-9A-F]{2})/g,
        (_, hex) => String.fromCharCode(parseInt(hex, 16)),
      );
      return btoa(utf8);
    }
  } catch (error) {
    return null;
  }

  return null;
};

const toRows = (raw: string): OutputRow[] => {
  const base64 = encodeToBase64(raw);
  if (!base64) return [];

  const base64url = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  return [
    {
      label: "Base64 (standard)",
      value: base64,
      hint: "UTF-8 text encoded with padding.",
    },
    {
      label: "Base64 (URL-safe)",
      value: base64url,
      hint: "URL-safe variant without padding.",
    },
  ];
};

const convert = (raw: string): ConversionPayload | null => {
  if (raw.length === 0) return null;

  const rows = toRows(raw);
  if (rows.length === 0) return null;

  return { rows };
};

// Heuristics favor longer, multi-line inputs (often payloads) while slightly
// penalizing leading/trailing whitespace. A base offset keeps this converter
// present even for short strings so it can compete with future always-on tools.
const heuristicScore = (raw: string): number => {
  const trimmedLength = raw.trim().length;
  if (trimmedLength === 0) return 0;

  const lengthScore = Math.min(trimmedLength / 72, 0.9);
  const multilineBonus = raw.includes("\n") ? 0.15 : 0;
  const whitespacePenalty = raw !== raw.trim() ? -0.05 : 0;

  return 0.4 + lengthScore + multilineBonus + whitespacePenalty;
};

const base64EncodeModule: AlwaysPossibleModule = {
  id: "base64-encode",
  label: "Base64 Encode",
  convert,
  heuristicScore,
};

export default base64EncodeModule;
