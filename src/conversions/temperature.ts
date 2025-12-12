import type {
  ConversionModule,
  ConversionPayload,
  Detection,
  OutputRow,
} from "./types";
import { formatFixedTrimmed } from "./formatNumber";

type NormalizedTemperature = {
  kelvin: number;
};

// Examples: "100 C", "100°C", "32 F", "273.15 K", "degC", "deg F"
const TEMPERATURE_REGEX =
  /^(?<value>-?\d+(?:\.\d+)?)\s*(?<unit>(?:°|º)?\s*(?:c|f)\b|k\b|celsius|fahrenheit|kelvin|deg\s*[cf])\s*$/i;

const normalizeSpacing = (raw: string) => raw.replace(/[\u00a0\u202f]/g, " ");

const normalizeUnit = (unit: string) =>
  unit
    .toLowerCase()
    .replace(/[\s._-]+/g, "")
    .replaceAll("°", "")
    .replaceAll("º", "");

const C_TO_K_OFFSET = 273.15;

const detect = (raw: string): Detection | null => {
  const match = normalizeSpacing(raw).trim().match(TEMPERATURE_REGEX);
  if (!match?.groups) return null;

  const value = parseFloat(match.groups.value);
  if (!Number.isFinite(value)) return null;

  const unit = normalizeUnit(match.groups.unit);

  let kelvin: number;
  if (unit === "c" || unit === "celsius" || unit === "degc") {
    kelvin = value + C_TO_K_OFFSET;
  } else if (unit === "f" || unit === "fahrenheit" || unit === "degf") {
    const celsius = ((value - 32) * 5) / 9;
    kelvin = celsius + C_TO_K_OFFSET;
  } else if (unit === "k" || unit === "kelvin") {
    kelvin = value;
  } else {
    return null;
  }

  return {
    score: 0.82,
    normalizedInput: { kelvin } satisfies NormalizedTemperature,
  };
};

const format = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1000) return formatFixedTrimmed(value, 0);
  if (abs >= 100) return formatFixedTrimmed(value, 1);
  if (abs >= 1) return formatFixedTrimmed(value, 2);
  return formatFixedTrimmed(value, 4);
};

const toRows = ({ kelvin }: NormalizedTemperature): OutputRow[] => {
  const celsius = kelvin - C_TO_K_OFFSET;
  const fahrenheit = (celsius * 9) / 5 + 32;

  return [
    {
      label: "Celsius",
      value: `${format(celsius)} °C`,
      copy: celsius.toString(),
      hint: "Metric / scientific",
    },
    {
      label: "Fahrenheit",
      value: `${format(fahrenheit)} °F`,
      copy: fahrenheit.toString(),
      hint: "US customary",
    },
    {
      label: "Kelvin",
      value: `${format(kelvin)} K`,
      copy: kelvin.toString(),
      hint: "SI base temperature",
    },
  ];
};

const convert = (detection: Detection): ConversionPayload | null => {
  const normalized = detection.normalizedInput as
    | NormalizedTemperature
    | undefined;
  if (!normalized) return null;

  return { rows: toRows(normalized) };
};

const temperatureModule: ConversionModule = {
  id: "temperature",
  label: "Temperature",
  detect,
  convert,
};

export default temperatureModule;
