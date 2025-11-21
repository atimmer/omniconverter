import type {
  ConversionModule,
  ConversionPayload,
  Detection,
  OutputRow,
} from "./types";

type NormalizedBase64 = {
  decoded: string;
  variant: "base64" | "base64url";
  parsedJson?: unknown;
};

const BASE64_REGEX = /^[A-Za-z0-9+/]+={0,2}$/;
const BASE64URL_REGEX = /^[A-Za-z0-9_-]+={0,2}$/;
const PRINTABLE_CHAR = /[\t\r\n\x20-\x7E]/;

const isMostlyPrintable = (value: string): boolean => {
  if (value.length === 0) return false;
  const printableCount = Array.from(value).filter((char) => PRINTABLE_CHAR.test(char)).length;
  return printableCount / value.length >= 0.85;
};

const tryParseJson = (value: string): unknown | undefined => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return undefined;
  }
};

const decodeSegment = (input: string): { decoded: string; variant: "base64" | "base64url" } | null => {
  const trimmed = input.trim();
  if (trimmed.length < 8) return null;
  if (!/[A-Za-z]/.test(trimmed)) return null;

  const isUrlLike = BASE64URL_REGEX.test(trimmed);
  const isStdLike = BASE64_REGEX.test(trimmed);
  if (!isUrlLike && !isStdLike) return null;

  const normalized = trimmed.replace(/-/g, "+").replace(/_/g, "/");
  if (normalized.length % 4 === 1) return null;
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);

  try {
    let decoded: string;

    if (typeof atob === "function") {
      decoded = decodeURIComponent(escape(atob(padded)));
    } else if (typeof Buffer !== "undefined") {
      decoded = Buffer.from(padded, "base64").toString("utf8");
    } else {
      return null;
    }

    if (!isMostlyPrintable(decoded)) return null;

    const usesUrlChars = /[-_]/.test(trimmed);
    const isUnpadded = !trimmed.includes("=");
    const lacksStdSymbols = !/[+/]/.test(trimmed);
    const variant: "base64" | "base64url" =
      usesUrlChars || (isUrlLike && isUnpadded && lacksStdSymbols) ? "base64url" : "base64";

    return { decoded, variant };
  } catch (error) {
    return null;
  }
};

const detect = (raw: string): Detection | null => {
  const decoded = decodeSegment(raw);
  if (!decoded) return null;

  const parsedJson = tryParseJson(decoded.decoded);
  const normalized: NormalizedBase64 = {
    decoded: decoded.decoded,
    variant: decoded.variant,
    ...(parsedJson === undefined ? {} : { parsedJson }),
  };

  return {
    score: 0.78,
    normalizedInput: normalized,
  };
};

const toRows = (normalized: NormalizedBase64): OutputRow[] => {
  const rows: OutputRow[] = [
    {
      label: "Decoded (UTF-8)",
      value: normalized.decoded,
      hint:
        normalized.variant === "base64url"
          ? "Input detected as base64url"
          : "Input detected as standard base64",
    },
  ];

  if (normalized.parsedJson !== undefined) {
    rows.push({
      label: "Decoded JSON",
      value: JSON.stringify(normalized.parsedJson, null, 2),
      hint: "Parsed from decoded text",
    });
  }

  return rows;
};

const convert = (detection: Detection): ConversionPayload | null => {
  const normalized = detection.normalizedInput as NormalizedBase64 | undefined;
  if (!normalized) return null;

  return { rows: toRows(normalized) };
};

const base64Module: ConversionModule = {
  id: "base64",
  label: "Base64",
  detect,
  convert,
};

export default base64Module;
