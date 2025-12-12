import type {
  ConversionModule,
  ConversionPayload,
  Detection,
  OutputRow,
} from "./types";
import { formatFixedTrimmed } from "./formatNumber";

type NormalizedForce = {
  newtons: number;
};

// Accepts common force units.
// Examples: "10 N", "2.5kN", "15 lbf", "100kgf", "5 pound-force"
const FORCE_REGEX =
  /^(?<value>-?\d+(?:\.\d+)?)\s*(?<unit>n|newton|newtons|kn|kilonewton|kilonewtons|lbf|lb[-_\s]*f|pound[-\s]*force|pounds[-\s]*force|kgf|kilogram[-\s]*force|kilograms[-\s]*force)\s*$/i;

const NEWTONS_PER_KILONEWTON = 1000;
const NEWTONS_PER_LBF = 4.4482216152605; // exact enough for conversions
const NEWTONS_PER_KGF = 9.80665; // standard gravity

const normalizeSpacing = (raw: string) => raw.replace(/[\u00a0\u202f]/g, " ");

const detect = (raw: string): Detection | null => {
  const match = normalizeSpacing(raw).trim().match(FORCE_REGEX);
  if (!match?.groups) return null;

  const value = parseFloat(match.groups.value);
  if (!Number.isFinite(value)) return null;

  const unit = match.groups.unit.toLowerCase().replace(/[\s_-]+/g, "");

  let newtons: number;
  if (unit === "n" || unit.startsWith("newton")) {
    newtons = value;
  } else if (unit === "kn" || unit.startsWith("kilonewton")) {
    newtons = value * NEWTONS_PER_KILONEWTON;
  } else if (
    unit === "lbf" ||
    unit === "poundforce" ||
    unit === "poundsforce"
  ) {
    newtons = value * NEWTONS_PER_LBF;
  } else if (
    unit === "kgf" ||
    unit === "kilogramforce" ||
    unit === "kilogramsforce"
  ) {
    newtons = value * NEWTONS_PER_KGF;
  } else {
    return null;
  }

  return {
    score: 0.82,
    normalizedInput: { newtons },
  };
};

const format = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return formatFixedTrimmed(value, 0);
  if (abs >= 1_000_000) return formatFixedTrimmed(value, 1);
  if (abs >= 100_000) return formatFixedTrimmed(value, 2);
  if (abs >= 10_000) return formatFixedTrimmed(value, 3);
  if (abs >= 1) return formatFixedTrimmed(value, 4);
  return formatFixedTrimmed(value, 6);
};

const toRows = ({ newtons }: NormalizedForce): OutputRow[] => {
  const kilonewtons = newtons / NEWTONS_PER_KILONEWTON;
  const lbf = newtons / NEWTONS_PER_LBF;
  const kgf = newtons / NEWTONS_PER_KGF;

  return [
    {
      label: "Newtons",
      value: `${format(newtons)} N`,
      copy: newtons.toString(),
      hint: "SI derived unit (kg·m/s²)",
    },
    {
      label: "Kilonewtons",
      value: `${format(kilonewtons)} kN`,
      copy: kilonewtons.toString(),
      hint: "Engineering scale",
    },
    {
      label: "Pound-force",
      value: `${format(lbf)} lbf`,
      copy: lbf.toString(),
      hint: "Imperial / US customary",
    },
    {
      label: "Kilogram-force",
      value: `${format(kgf)} kgf`,
      copy: kgf.toString(),
      hint: "Force under standard gravity",
    },
  ];
};

const convert = (detection: Detection): ConversionPayload | null => {
  const normalized = detection.normalizedInput as NormalizedForce | undefined;
  if (!normalized) return null;

  return { rows: toRows(normalized) };
};

const forceModule: ConversionModule = {
  id: "force",
  label: "Force",
  detect,
  convert,
};

export default forceModule;
