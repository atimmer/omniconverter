import type {
  ConversionModule,
  ConversionPayload,
  Detection,
  OutputRow,
} from "./types";
import { formatFixedTrimmed } from "./formatNumber";

const MASS_REGEX =
  /^(?<value>-?\d+(?:\.\d+)?)\s*(?<unit>kg|kilogram|kilograms|lb|lbs|pound|pounds)\s*$/i;
const KG_TO_LB = 2.20462262;

type NormalizedMass = {
  kg: number;
};

const detect = (raw: string): Detection | null => {
  const match = raw.trim().match(MASS_REGEX);
  if (!match || !match.groups) return null;

  const value = parseFloat(match.groups.value);
  if (!Number.isFinite(value)) return null;

  const unit = match.groups.unit.toLowerCase();
  const isKg = unit.startsWith("kg") || unit.startsWith("kilogram");
  const normalized: NormalizedMass = {
    kg: isKg ? value : value / KG_TO_LB,
  };

  return {
    score: 0.8,
    normalizedInput: normalized,
  };
};

const format = (value: number) => {
  if (Math.abs(value) >= 10000) return formatFixedTrimmed(value, 0);
  if (Math.abs(value) >= 1000) return formatFixedTrimmed(value, 1);
  if (Math.abs(value) >= 1) return formatFixedTrimmed(value, 2);
  return formatFixedTrimmed(value, 4);
};

const toRows = ({ kg }: NormalizedMass): OutputRow[] => {
  const lbs = kg * KG_TO_LB;
  return [
    {
      label: "Kilograms",
      value: `${format(kg)} kg`,
      copy: kg.toString(),
      hint: "Metric",
    },
    {
      label: "Pounds",
      value: `${format(lbs)} lb`,
      copy: lbs.toString(),
      hint: "Imperial",
    },
  ];
};

const convert = (detection: Detection): ConversionPayload | null => {
  const normalized = detection.normalizedInput as NormalizedMass | undefined;
  if (!normalized) return null;

  return { rows: toRows(normalized) };
};

const massModule: ConversionModule = {
  id: "mass",
  label: "Mass",
  detect,
  convert,
};

export default massModule;
