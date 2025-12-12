import type {
  ConversionModule,
  ConversionPayload,
  Detection,
  OutputRow,
} from "./types";
import { formatFixedTrimmed } from "./formatNumber";

type NormalizedDataSize = {
  bytes: number;
};

const UNIT_FACTORS: Record<string, number> = {
  b: 1,
  byte: 1,
  bytes: 1,
  kb: 1024,
  kilobyte: 1024,
  kilobytes: 1024,
  mb: 1024 ** 2,
  megabyte: 1024 ** 2,
  megabytes: 1024 ** 2,
  gb: 1024 ** 3,
  gigabyte: 1024 ** 3,
  gigabytes: 1024 ** 3,
  tb: 1024 ** 4,
  terabyte: 1024 ** 4,
  terabytes: 1024 ** 4,
};

const DATA_SIZE_REGEX =
  /^(?<value>-?\d+(?:\.\d+)?)\s*(?<unit>b|bytes?|kb|kilobytes?|mb|megabytes?|gb|gigabytes?|tb|terabytes?)\s*$/i;

const format = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1e12) return formatFixedTrimmed(value, 0);
  if (abs >= 1e6) return formatFixedTrimmed(value, 2);
  if (abs >= 1e3) return formatFixedTrimmed(value, 3);
  if (abs >= 1) return formatFixedTrimmed(value, 4);
  return formatFixedTrimmed(value, 6);
};

const detect = (raw: string): Detection | null => {
  const match = raw.trim().match(DATA_SIZE_REGEX);
  if (!match?.groups) return null;

  const value = parseFloat(match.groups.value);
  if (!Number.isFinite(value)) return null;

  const unit = match.groups.unit.toLowerCase();
  const factor = UNIT_FACTORS[unit];
  if (!factor) return null;

  const normalized: NormalizedDataSize = {
    bytes: value * factor,
  };

  return {
    score: 0.82,
    normalizedInput: normalized,
  };
};

const toRows = ({ bytes }: NormalizedDataSize): OutputRow[] => {
  const kb = bytes / 1024;
  const mb = kb / 1024;
  const gb = mb / 1024;
  const tb = gb / 1024;

  return [
    {
      label: "Bytes",
      value: `${format(bytes)} B`,
      copy: bytes.toString(),
      hint: "Using 1024-based binary units (KiB-style).",
    },
    {
      label: "Kilobytes",
      value: `${format(kb)} KB`,
      copy: kb.toString(),
      hint: "Binary (1024) conversion",
    },
    {
      label: "Megabytes",
      value: `${format(mb)} MB`,
      copy: mb.toString(),
      hint: "Binary (1024) conversion",
    },
    {
      label: "Gigabytes",
      value: `${format(gb)} GB`,
      copy: gb.toString(),
      hint: "Binary (1024) conversion",
    },
    {
      label: "Terabytes",
      value: `${format(tb)} TB`,
      copy: tb.toString(),
      hint: "Binary (1024) conversion",
    },
  ];
};

const convert = (detection: Detection): ConversionPayload | null => {
  const normalized = detection.normalizedInput as
    | NormalizedDataSize
    | undefined;
  if (!normalized) return null;

  return { rows: toRows(normalized) };
};

const dataSizeModule: ConversionModule = {
  id: "data-size",
  label: "Data Size",
  detect,
  convert,
};

export default dataSizeModule;
