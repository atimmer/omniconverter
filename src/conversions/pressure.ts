import type {
  ConversionModule,
  ConversionPayload,
  Detection,
  OutputRow,
} from "./types";

type NormalizedPressure = {
  pascals: number;
};

const PRESSURE_REGEX =
  /^(?<value>-?\d+(?:\.\d+)?)\s*(?<unit>atm|atmosphere(?:s)?|mm\s*hg|mmhg|mbar|millibar(?:s)?|hpa|hectopascal(?:s)?)\s*$/i;

// Exact by definition for "standard atmosphere"
const PA_PER_ATM = 101_325;
const PA_PER_HPA = 100;
const PA_PER_MBAR = 100; // 1 mbar = 1 hPa = 100 Pa
const PA_PER_MMHG = PA_PER_ATM / 760; // 1 atm = 760 mmHg (exact), so 1 mmHg = 101325/760 Pa

const format = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return value.toFixed(0);
  if (abs >= 100_000) return value.toFixed(1);
  if (abs >= 10_000) return value.toFixed(2);
  if (abs >= 1_000) return value.toFixed(3);
  if (abs >= 100) return value.toFixed(4);
  if (abs >= 10) return value.toFixed(5);
  if (abs >= 1) return value.toFixed(6);
  return value.toFixed(8);
};

const detect = (raw: string): Detection | null => {
  const match = raw.trim().match(PRESSURE_REGEX);
  if (!match?.groups) return null;

  const value = parseFloat(match.groups.value);
  if (!Number.isFinite(value)) return null;

  const unitKey = match.groups.unit.toLowerCase().replace(/\s+/g, "");

  let pascals: number;
  if (unitKey === "atm" || unitKey.startsWith("atmosphere")) {
    pascals = value * PA_PER_ATM;
  } else if (unitKey === "hpa" || unitKey.startsWith("hectopascal")) {
    pascals = value * PA_PER_HPA;
  } else if (unitKey === "mbar" || unitKey.startsWith("millibar")) {
    pascals = value * PA_PER_MBAR;
  } else if (unitKey === "mmhg") {
    pascals = value * PA_PER_MMHG;
  } else {
    return null;
  }

  const normalized: NormalizedPressure = { pascals };

  return {
    score: 0.82,
    normalizedInput: normalized,
  };
};

const toRows = ({ pascals }: NormalizedPressure): OutputRow[] => {
  const atm = pascals / PA_PER_ATM;
  const hPa = pascals / PA_PER_HPA;
  const mbar = pascals / PA_PER_MBAR;
  const mmHg = pascals / PA_PER_MMHG;

  return [
    {
      label: "Atmospheres",
      value: `${format(atm)} atm`,
      copy: atm.toString(),
      hint: "Standard atmosphere",
    },
    {
      label: "Hectopascals",
      value: `${format(hPa)} hPa`,
      copy: hPa.toString(),
      hint: "Weather & aviation",
    },
    {
      label: "Millibars",
      value: `${format(mbar)} mbar`,
      copy: mbar.toString(),
      hint: "Equivalent to hPa",
    },
    {
      label: "Millimeters of mercury",
      value: `${format(mmHg)} mmHg`,
      copy: mmHg.toString(),
      hint: "Common in medicine",
    },
  ];
};

const convert = (
  detection: Detection,
  raw: string,
): ConversionPayload | null => {
  if (!raw) return null;
  const normalized = detection.normalizedInput as
    | NormalizedPressure
    | undefined;
  if (!normalized) return null;
  if (!Number.isFinite(normalized.pascals)) return null;

  return { rows: toRows(normalized) };
};

const pressureModule: ConversionModule = {
  id: "pressure",
  label: "Pressure",
  detect,
  convert,
};

export default pressureModule;
