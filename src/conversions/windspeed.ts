import type {
  ConversionModule,
  ConversionPayload,
  Detection,
  OutputRow,
} from "./types";

type BeaufortNormalized = {
  beaufort: number;
};

type BeaufortRange = {
  bft: number;
  metersPerSecondMin: number;
  metersPerSecondMax: number | null;
  kilometersPerHourMin: number;
  kilometersPerHourMax: number | null;
};

// WMO Beaufort scale (0–12): ranges are nominal.
const BEAUFORT_RANGES: BeaufortRange[] = [
  {
    bft: 0,
    metersPerSecondMin: 0.0,
    metersPerSecondMax: 0.2,
    kilometersPerHourMin: 0,
    kilometersPerHourMax: 1,
  },
  {
    bft: 1,
    metersPerSecondMin: 0.3,
    metersPerSecondMax: 1.5,
    kilometersPerHourMin: 1,
    kilometersPerHourMax: 5,
  },
  {
    bft: 2,
    metersPerSecondMin: 1.6,
    metersPerSecondMax: 3.3,
    kilometersPerHourMin: 6,
    kilometersPerHourMax: 11,
  },
  {
    bft: 3,
    metersPerSecondMin: 3.4,
    metersPerSecondMax: 5.4,
    kilometersPerHourMin: 12,
    kilometersPerHourMax: 19,
  },
  {
    bft: 4,
    metersPerSecondMin: 5.5,
    metersPerSecondMax: 7.9,
    kilometersPerHourMin: 20,
    kilometersPerHourMax: 28,
  },
  {
    bft: 5,
    metersPerSecondMin: 8.0,
    metersPerSecondMax: 10.7,
    kilometersPerHourMin: 29,
    kilometersPerHourMax: 38,
  },
  {
    bft: 6,
    metersPerSecondMin: 10.8,
    metersPerSecondMax: 13.8,
    kilometersPerHourMin: 39,
    kilometersPerHourMax: 49,
  },
  {
    bft: 7,
    metersPerSecondMin: 13.9,
    metersPerSecondMax: 17.1,
    kilometersPerHourMin: 50,
    kilometersPerHourMax: 61,
  },
  {
    bft: 8,
    metersPerSecondMin: 17.2,
    metersPerSecondMax: 20.7,
    kilometersPerHourMin: 62,
    kilometersPerHourMax: 74,
  },
  {
    bft: 9,
    metersPerSecondMin: 20.8,
    metersPerSecondMax: 24.4,
    kilometersPerHourMin: 75,
    kilometersPerHourMax: 88,
  },
  {
    bft: 10,
    metersPerSecondMin: 24.5,
    metersPerSecondMax: 28.4,
    kilometersPerHourMin: 89,
    kilometersPerHourMax: 102,
  },
  {
    bft: 11,
    metersPerSecondMin: 28.5,
    metersPerSecondMax: 32.6,
    kilometersPerHourMin: 103,
    kilometersPerHourMax: 117,
  },
  {
    bft: 12,
    metersPerSecondMin: 32.7,
    metersPerSecondMax: null,
    kilometersPerHourMin: 118,
    kilometersPerHourMax: null,
  },
];

const WINDSPEED_REGEX = /^(?<value>\d{1,2})\s*(?<unit>bft|beaufort)\s*$/i;

const formatFixed1 = (value: number) => value.toFixed(1);
const formatInt = (value: number) => value.toFixed(0);

const formatRange = (
  min: number,
  max: number | null,
  unit: string,
  format: (n: number) => string,
) => {
  if (max === null) return `≥ ${format(min)} ${unit}`;
  return `${format(min)}–${format(max)} ${unit}`;
};

const detect = (raw: string): Detection | null => {
  const match = raw.trim().match(WINDSPEED_REGEX);
  if (!match?.groups) return null;

  const value = parseInt(match.groups.value, 10);
  if (!Number.isFinite(value)) return null;

  const range = BEAUFORT_RANGES[value];
  if (!range || range.bft !== value) return null;

  return {
    score: 0.86,
    normalizedInput: { beaufort: value } satisfies BeaufortNormalized,
  };
};

const toRows = (normalized: BeaufortNormalized): OutputRow[] => {
  const range = BEAUFORT_RANGES[normalized.beaufort];
  if (!range) return [];

  const metersPerSecond = formatRange(
    range.metersPerSecondMin,
    range.metersPerSecondMax,
    "m/s",
    formatFixed1,
  );

  const kilometersPerHour = formatRange(
    range.kilometersPerHourMin,
    range.kilometersPerHourMax,
    "km/h",
    formatInt,
  );

  const copyRange = (min: number, max: number | null) =>
    max === null ? `${min}+` : `${min}-${max}`;

  return [
    {
      label: "Meters per second",
      value: metersPerSecond,
      copy: copyRange(range.metersPerSecondMin, range.metersPerSecondMax),
      hint: `Beaufort ${range.bft} (range)`,
    },
    {
      label: "Kilometers per hour",
      value: kilometersPerHour,
      copy: copyRange(range.kilometersPerHourMin, range.kilometersPerHourMax),
      hint: `Beaufort ${range.bft} (range)`,
    },
  ];
};

const convert = (detection: Detection): ConversionPayload | null => {
  const normalized = detection.normalizedInput as
    | BeaufortNormalized
    | undefined;
  if (!normalized) return null;
  return { rows: toRows(normalized) };
};

const windspeedModule: ConversionModule = {
  id: "windspeed",
  label: "Windspeed",
  detect,
  convert,
};

export default windspeedModule;
