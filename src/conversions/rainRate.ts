import type {
  ConversionModule,
  ConversionPayload,
  Detection,
  OutputRow,
} from "./types";

type NormalizedRainRate = {
  millimetersPerHour: number;
  dbz: number;
};

// Meteorological radar reflectivity (dBZ) can be related to rain rate (mm/h)
// via a Z–R relationship:
//   Z = a · R^b
// A common default is the Marshall–Palmer relationship for stratiform rain.
const MARSHALL_PALMER_ZR_A = 200;
const MARSHALL_PALMER_ZR_B = 1.6;

const RAIN_RATE_REGEX =
  /^(?<value>-?\d+(?:[.,]\d+)?)\s*(?<unit>d\s*b\s*z|dbz|mm\s*\/\s*h|mm\s*\/\s*hr|mmh|mmph|mm\s*per\s*hour|millimeters?\s*per\s*hour)\s*$/i;

const normalizeSpacing = (raw: string) => raw.replace(/[\u00a0\u202f]/g, " ");

const dbzToMillimetersPerHour = (dbz: number): number => {
  const z = 10 ** (dbz / 10);
  return (z / MARSHALL_PALMER_ZR_A) ** (1 / MARSHALL_PALMER_ZR_B);
};

const millimetersPerHourToDbz = (millimetersPerHour: number): number => {
  const z = MARSHALL_PALMER_ZR_A * millimetersPerHour ** MARSHALL_PALMER_ZR_B;
  return 10 * Math.log10(z);
};

const format = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 10_000) return value.toFixed(0);
  if (abs >= 1_000) return value.toFixed(1);
  if (abs >= 100) return value.toFixed(2);
  if (abs >= 10) return value.toFixed(3);
  if (abs >= 1) return value.toFixed(4);
  return value.toFixed(6);
};

const detect = (raw: string): Detection | null => {
  const match = normalizeSpacing(raw).trim().match(RAIN_RATE_REGEX);
  if (!match?.groups) return null;

  const value = Number.parseFloat(match.groups.value.replace(/,/g, "."));
  if (!Number.isFinite(value)) return null;

  const unitRaw = match.groups.unit.toLowerCase();
  const unit = unitRaw.replace(/\s+/g, "");

  let millimetersPerHour: number;
  let dbz: number;

  if (unit.includes("dbz")) {
    dbz = value;
    millimetersPerHour = dbzToMillimetersPerHour(dbz);
  } else if (
    unit === "mm/h" ||
    unit === "mm/hr" ||
    unit === "mmh" ||
    unit === "mmph" ||
    unit === "mmperhour" ||
    unit === "millimeterperhour" ||
    unit === "millimetersperhour"
  ) {
    if (value < 0) return null;
    millimetersPerHour = value;
    dbz = millimetersPerHourToDbz(millimetersPerHour);
  } else {
    return null;
  }

  if (!Number.isFinite(millimetersPerHour) || !Number.isFinite(dbz))
    return null;

  return {
    score: 0.84,
    normalizedInput: { millimetersPerHour, dbz } satisfies NormalizedRainRate,
  };
};

const toRows = ({
  millimetersPerHour,
  dbz,
}: NormalizedRainRate): OutputRow[] => {
  const zrHint = "Assumes Marshall–Palmer Z–R: Z = 200·R^1.6 (R in mm/h).";

  return [
    {
      label: "Rain rate",
      value: `${format(millimetersPerHour)} mm/h`,
      copy: millimetersPerHour.toString(),
      hint: "Liquid-equivalent precipitation rate",
    },
    {
      label: "Radar reflectivity",
      value: `${format(dbz)} dBZ`,
      copy: dbz.toString(),
      hint: zrHint,
    },
  ];
};

const convert = (detection: Detection): ConversionPayload | null => {
  const normalized = detection.normalizedInput as
    | NormalizedRainRate
    | undefined;
  if (!normalized) return null;

  return { rows: toRows(normalized) };
};

const rainRateModule: ConversionModule = {
  id: "rain-rate",
  label: "Rain rate",
  detect,
  convert,
};

export default rainRateModule;
