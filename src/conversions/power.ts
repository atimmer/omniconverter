import type {
  ConversionModule,
  ConversionPayload,
  Detection,
  OutputRow,
} from "./types";
import { formatFixedTrimmed } from "./formatNumber";

type NormalizedPower = {
  watts: number;
};

const POWER_REGEX =
  /^(?<value>-?\d+(?:\.\d+)?)\s*(?<unit>w|watt|watts|kw|kilowatt|kilowatts|mw|megawatt|megawatts|hp|horsepower)\s*$/i;

const WATTS_PER_KILOWATT = 1000;
const WATTS_PER_MEGAWATT = 1_000_000;
const WATTS_PER_HP = 745.699872; // mechanical horsepower

const normalizeSpacing = (raw: string) => raw.replace(/[\u00a0\u202f]/g, " ");

const detect = (raw: string): Detection | null => {
  const match = normalizeSpacing(raw).trim().match(POWER_REGEX);
  if (!match?.groups) return null;

  const value = parseFloat(match.groups.value);
  if (!Number.isFinite(value)) return null;

  const unit = match.groups.unit.toLowerCase();
  let watts: number;

  if (unit === "w" || unit.startsWith("watt")) {
    watts = value;
  } else if (unit.startsWith("kw") || unit.startsWith("kilowatt")) {
    watts = value * WATTS_PER_KILOWATT;
  } else if (unit.startsWith("mw") || unit.startsWith("megawatt")) {
    watts = value * WATTS_PER_MEGAWATT;
  } else if (unit === "hp" || unit.startsWith("horsepower")) {
    watts = value * WATTS_PER_HP;
  } else {
    return null;
  }

  return {
    score: 0.83,
    normalizedInput: { watts },
  };
};

const format = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return formatFixedTrimmed(value, 0);
  if (abs >= 100_000) return formatFixedTrimmed(value, 1);
  if (abs >= 10_000) return formatFixedTrimmed(value, 2);
  if (abs >= 1_000) return formatFixedTrimmed(value, 3);
  if (abs >= 1) return formatFixedTrimmed(value, 4);
  return formatFixedTrimmed(value, 6);
};

const toRows = ({ watts }: NormalizedPower): OutputRow[] => {
  const kilowatts = watts / WATTS_PER_KILOWATT;
  const megawatts = watts / WATTS_PER_MEGAWATT;
  const horsepower = watts / WATTS_PER_HP;

  return [
    {
      label: "Watts",
      value: `${format(watts)} W`,
      copy: watts.toString(),
      hint: "SI base unit",
    },
    {
      label: "Kilowatts",
      value: `${format(kilowatts)} kW`,
      copy: kilowatts.toString(),
      hint: "Common electrical power",
    },
    {
      label: "Horsepower",
      value: `${format(horsepower)} hp`,
      copy: horsepower.toString(),
      hint: "Mechanical (imperial) horsepower",
    },
    {
      label: "Megawatts",
      value: `${format(megawatts)} MW`,
      copy: megawatts.toString(),
      hint: "Large generation capacity",
    },
  ];
};

const convert = (detection: Detection): ConversionPayload | null => {
  const normalized = detection.normalizedInput as NormalizedPower | undefined;
  if (!normalized) return null;

  return { rows: toRows(normalized) };
};

const powerModule: ConversionModule = {
  id: "power",
  label: "Power",
  detect,
  convert,
};

export default powerModule;
