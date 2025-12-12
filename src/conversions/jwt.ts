import type {
  ConversionModule,
  ConversionPayload,
  Detection,
  OutputRow,
} from "./types";

type NormalizedJwt = {
  header: unknown;
  payload: unknown;
  signature: string;
};

const base64UrlDecode = (segment: string): string | null => {
  try {
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    if (typeof atob === "function") {
      return decodeURIComponent(escape(atob(padded)));
    }

    // Node/bun fallback
    return Buffer.from(padded, "base64").toString("utf8");
  } catch {
    return null;
  }
};

const tryParseJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
};

const detect = (raw: string): Detection | null => {
  const trimmed = raw.trim();
  if (!trimmed.includes(".")) return null;

  const parts = trimmed.split(".");
  if (parts.length !== 3) return null;

  const [headerSeg, payloadSeg, signature] = parts;
  const headerJson = base64UrlDecode(headerSeg);
  const payloadJson = base64UrlDecode(payloadSeg);
  if (!headerJson || !payloadJson) return null;

  const headerObj = tryParseJson(headerJson);
  const payloadObj = tryParseJson(payloadJson);
  if (headerObj === undefined || payloadObj === undefined) return null;
  if (typeof headerObj !== "object" || headerObj === null) return null;
  if (typeof payloadObj !== "object" || payloadObj === null) return null;

  const normalized: NormalizedJwt = {
    header: headerObj,
    payload: payloadObj,
    signature,
  };

  return {
    score: 0.85,
    normalizedInput: normalized,
  };
};

const toRows = ({ header, payload, signature }: NormalizedJwt): OutputRow[] => [
  {
    label: "Header (JSON)",
    value: JSON.stringify(header, null, 2),
    hint: "Decoded; not verified",
  },
  {
    label: "Payload (JSON)",
    value: JSON.stringify(payload, null, 2),
    hint: "Decoded; not verified",
  },
  { label: "Signature", value: signature, hint: "Base64url" },
];

const convert = (detection: Detection): ConversionPayload | null => {
  const normalized = detection.normalizedInput as NormalizedJwt | undefined;
  if (!normalized) return null;

  return { rows: toRows(normalized) };
};

const jwtModule: ConversionModule = {
  id: "jwt",
  label: "JWT",
  detect,
  convert,
};

export default jwtModule;
