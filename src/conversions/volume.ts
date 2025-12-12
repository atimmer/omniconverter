import type {
  ConversionModule,
  ConversionPayload,
  Detection,
  OutputRow,
} from "./types";

type NormalizedVolume = {
  liters: number;
};

// Note: We intentionally avoid plain "oz" to prevent confusion with weight (ounces).
const VOLUME_REGEX =
  /^(?<value>-?\d+(?:\.\d+)?)\s*(?<unit>l|liters?|litres?|ml|milliliters?|millilitres?|m(?:\^?3|³)|cubic\s+meters?|cubic\s+metres?|cm(?:\^?3|³)|cc|cubic\s+centimeters?|cubic\s+centimetres?|gal|gallons?|qt|quarts?|pt|pints?|cups?|fl\s*oz|floz|fluid\s+ounces?|tbsp|tablespoons?|tsp|teaspoons?)\s*$/i;

const LITERS_PER_ML = 0.001;
const LITERS_PER_M3 = 1000;
const LITERS_PER_US_GALLON = 3.785411784;
const LITERS_PER_US_QUART = LITERS_PER_US_GALLON / 4;
const LITERS_PER_US_PINT = LITERS_PER_US_QUART / 2;
const LITERS_PER_US_CUP = LITERS_PER_US_PINT / 2;
const LITERS_PER_US_FL_OZ = LITERS_PER_US_CUP / 8;
const LITERS_PER_US_TBSP = LITERS_PER_US_FL_OZ / 2;
const LITERS_PER_US_TSP = LITERS_PER_US_TBSP / 3;

const normalizeSpacing = (raw: string) => raw.replace(/[\u00a0\u202f]/g, " ");

const normalizeUnit = (unit: string) =>
  unit.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();

const detect = (raw: string): Detection | null => {
  const match = normalizeSpacing(raw).trim().match(VOLUME_REGEX);
  if (!match?.groups) return null;

  const value = parseFloat(match.groups.value);
  if (!Number.isFinite(value)) return null;

  const unit = normalizeUnit(match.groups.unit);

  let liters: number;
  if (unit === "l" || unit.startsWith("liter") || unit.startsWith("litre")) {
    liters = value;
  } else if (
    unit === "ml" ||
    unit.startsWith("milliliter") ||
    unit.startsWith("millilitre")
  ) {
    liters = value * LITERS_PER_ML;
  } else if (
    unit === "m3" ||
    unit === "m^3" ||
    unit === "m³" ||
    unit.startsWith("cubic metre") ||
    unit.startsWith("cubic meter")
  ) {
    liters = value * LITERS_PER_M3;
  } else if (
    unit === "cm3" ||
    unit === "cm^3" ||
    unit === "cm³" ||
    unit === "cc" ||
    unit.startsWith("cubic centimetre") ||
    unit.startsWith("cubic centimeter")
  ) {
    liters = value * LITERS_PER_ML;
  } else if (unit === "gal" || unit.startsWith("gallon")) {
    liters = value * LITERS_PER_US_GALLON;
  } else if (unit === "qt" || unit.startsWith("quart")) {
    liters = value * LITERS_PER_US_QUART;
  } else if (unit === "pt" || unit.startsWith("pint")) {
    liters = value * LITERS_PER_US_PINT;
  } else if (unit === "cup" || unit === "cups") {
    liters = value * LITERS_PER_US_CUP;
  } else if (
    unit === "floz" ||
    unit.startsWith("fl oz") ||
    unit.startsWith("fluid ounce")
  ) {
    liters = value * LITERS_PER_US_FL_OZ;
  } else if (unit === "tbsp" || unit.startsWith("tablespoon")) {
    liters = value * LITERS_PER_US_TBSP;
  } else if (unit === "tsp" || unit.startsWith("teaspoon")) {
    liters = value * LITERS_PER_US_TSP;
  } else {
    return null;
  }

  return {
    score: 0.81,
    normalizedInput: { liters } satisfies NormalizedVolume,
  };
};

const format = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return value.toFixed(0);
  if (abs >= 10_000) return value.toFixed(1);
  if (abs >= 100) return value.toFixed(3);
  if (abs >= 1) return value.toFixed(4);
  if (abs >= 0.01) return value.toFixed(6);
  return value.toFixed(8);
};

const toRows = ({ liters }: NormalizedVolume): OutputRow[] => {
  const milliliters = liters / LITERS_PER_ML;
  const cubicMeters = liters / LITERS_PER_M3;
  const usGallons = liters / LITERS_PER_US_GALLON;
  const usQuarts = liters / LITERS_PER_US_QUART;
  const usPints = liters / LITERS_PER_US_PINT;
  const usCups = liters / LITERS_PER_US_CUP;
  const usFluidOunces = liters / LITERS_PER_US_FL_OZ;
  const usTablespoons = liters / LITERS_PER_US_TBSP;
  const usTeaspoons = liters / LITERS_PER_US_TSP;

  return [
    {
      label: "Liters",
      value: `${format(liters)} L`,
      copy: liters.toString(),
      hint: "Metric",
    },
    {
      label: "Milliliters",
      value: `${format(milliliters)} mL`,
      copy: milliliters.toString(),
      hint: "Metric",
    },
    {
      label: "Cubic meters",
      value: `${format(cubicMeters)} m³`,
      copy: cubicMeters.toString(),
      hint: "SI volume (1 m³ = 1000 L)",
    },
    {
      label: "US gallons",
      value: `${format(usGallons)} gal`,
      copy: usGallons.toString(),
      hint: "US customary",
    },
    {
      label: "US quarts",
      value: `${format(usQuarts)} qt`,
      copy: usQuarts.toString(),
      hint: "US customary",
    },
    {
      label: "US pints",
      value: `${format(usPints)} pt`,
      copy: usPints.toString(),
      hint: "US customary",
    },
    {
      label: "US cups",
      value: `${format(usCups)} cup`,
      copy: usCups.toString(),
      hint: "US customary",
    },
    {
      label: "US fluid ounces",
      value: `${format(usFluidOunces)} fl oz`,
      copy: usFluidOunces.toString(),
      hint: "US customary",
    },
    {
      label: "US tablespoons",
      value: `${format(usTablespoons)} tbsp`,
      copy: usTablespoons.toString(),
      hint: "US customary",
    },
    {
      label: "US teaspoons",
      value: `${format(usTeaspoons)} tsp`,
      copy: usTeaspoons.toString(),
      hint: "US customary",
    },
  ];
};

const convert = (detection: Detection): ConversionPayload | null => {
  const normalized = detection.normalizedInput as NormalizedVolume | undefined;
  if (!normalized) return null;

  return { rows: toRows(normalized) };
};

const volumeModule: ConversionModule = {
  id: "volume",
  label: "Volume",
  detect,
  convert,
};

export default volumeModule;
