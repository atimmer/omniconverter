import type {
  ConversionModule,
  ConversionPayload,
  Detection,
  OutputRow,
} from "./types";

// Moment (torque) conversions.
// Normalized to Newton-meters (N·m).

type NormalizedMoment = {
  newtonMeters: number;
};

const normalizeSpacing = (raw: string) => raw.replace(/[\u00a0\u202f]/g, " ");

const normalizeUnitKey = (rawUnit: string) => {
  // 1) Lowercase
  // 2) Replace common separators with nothing so "N·m", "N*m", "N-m", "N m" all collapse
  // 3) Collapse repeated whitespace/underscores
  return rawUnit
    .toLowerCase()
    .replace(/[\u00a0\u202f]/g, " ")
    .replace(/[\s_]+/g, "")
    .replace(/[·⋅∙×*]/g, "")
    .replace(/[-–—]/g, "");
};

// Force constants (shared with force module values).
const NEWTONS_PER_LBF = 4.4482216152605;
const NEWTONS_PER_KGF = 9.80665;

// Length constants.
const METERS_PER_FOOT = 0.3048; // exact
const METERS_PER_INCH = 0.0254; // exact
const METERS_PER_CM = 0.01;
const METERS_PER_MM = 0.001;

const detectMomentFromUnitKey = (
  value: number,
  unitKey: string,
): NormalizedMoment | null => {
  // SI
  if (
    unitKey === "nm" ||
    unitKey === "newtonmeter" ||
    unitKey === "newtonmeters"
  ) {
    return { newtonMeters: value };
  }

  if (
    unitKey === "knm" ||
    unitKey === "kilonewtonmeter" ||
    unitKey === "kilonewtonmeters"
  ) {
    return { newtonMeters: value * 1000 };
  }

  if (
    unitKey === "ncm" ||
    unitKey === "newtoncentimeter" ||
    unitKey === "newtoncentimeters" ||
    unitKey === "newtoncentimetre" ||
    unitKey === "newtoncentimetres"
  ) {
    return { newtonMeters: value * METERS_PER_CM };
  }

  if (
    unitKey === "nmm" ||
    unitKey === "newtonmillimeter" ||
    unitKey === "newtonmillimeters" ||
    unitKey === "newtonmillimetre" ||
    unitKey === "newtonmillimetres"
  ) {
    return { newtonMeters: value * METERS_PER_MM };
  }

  // Imperial / US customary (accept "lb" as common shorthand for lbf in torque contexts)
  const isPoundForce = (s: string) =>
    s === "lbf" || s === "lb" || s === "poundforce" || s === "poundsforce";
  const isFoot = (s: string) => s === "ft" || s === "foot" || s === "feet";
  const isInch = (s: string) => s === "in" || s === "inch" || s === "inches";

  // Support "lbf·ft", "ft·lbf", "lbft", "ftlb", "poundforcefoot", etc.
  const footPoundMatch = unitKey.match(
    /^(?<a>lbf|lb|poundforce|poundsforce)(?<b>ft|foot|feet)$|^(?<c>ft|foot|feet)(?<d>lbf|lb|poundforce|poundsforce)$/,
  );
  if (footPoundMatch?.groups) {
    const a = footPoundMatch.groups.a;
    const b = footPoundMatch.groups.b;
    const c = footPoundMatch.groups.c;
    const d = footPoundMatch.groups.d;

    if (
      (a && b && isPoundForce(a) && isFoot(b)) ||
      (c && d && isFoot(c) && isPoundForce(d))
    ) {
      return { newtonMeters: value * NEWTONS_PER_LBF * METERS_PER_FOOT };
    }
  }

  const inchPoundMatch = unitKey.match(
    /^(?<a>lbf|lb|poundforce|poundsforce)(?<b>in|inch|inches)$|^(?<c>in|inch|inches)(?<d>lbf|lb|poundforce|poundsforce)$/,
  );
  if (inchPoundMatch?.groups) {
    const a = inchPoundMatch.groups.a;
    const b = inchPoundMatch.groups.b;
    const c = inchPoundMatch.groups.c;
    const d = inchPoundMatch.groups.d;

    if (
      (a && b && isPoundForce(a) && isInch(b)) ||
      (c && d && isInch(c) && isPoundForce(d))
    ) {
      return { newtonMeters: value * NEWTONS_PER_LBF * METERS_PER_INCH };
    }
  }

  // Metric gravimetric: kgf·m, kgf·cm
  const isKgf = (s: string) =>
    s === "kgf" || s === "kilogramforce" || s === "kilogramsforce";

  const kgfMeterMatch = unitKey.match(
    /^(?<a>kgf|kilogramforce|kilogramsforce)(?<b>m|meter|meters|metre|metres)$|^(?<c>m|meter|meters|metre|metres)(?<d>kgf|kilogramforce|kilogramsforce)$/,
  );
  if (kgfMeterMatch?.groups) {
    const a = kgfMeterMatch.groups.a;
    const b = kgfMeterMatch.groups.b;
    const c = kgfMeterMatch.groups.c;
    const d = kgfMeterMatch.groups.d;

    if ((a && b && isKgf(a)) || (c && d && isKgf(d))) {
      return { newtonMeters: value * NEWTONS_PER_KGF };
    }
  }

  const kgfCmMatch = unitKey.match(
    /^(?<a>kgf|kilogramforce|kilogramsforce)(?<b>cm|centimeter|centimeters|centimetre|centimetres)$|^(?<c>cm|centimeter|centimeters|centimetre|centimetres)(?<d>kgf|kilogramforce|kilogramsforce)$/,
  );
  if (kgfCmMatch?.groups) {
    const a = kgfCmMatch.groups.a;
    const b = kgfCmMatch.groups.b;
    const c = kgfCmMatch.groups.c;
    const d = kgfCmMatch.groups.d;

    if ((a && b && isKgf(a)) || (c && d && isKgf(d))) {
      return { newtonMeters: value * NEWTONS_PER_KGF * METERS_PER_CM };
    }
  }

  return null;
};

// Examples: "10 N·m", "2.5 Nm", "12 lb-ft", "100 lbf in", "3 kgf·cm"
const MOMENT_REGEX = /^(?<value>-?\d+(?:\.\d+)?)\s*(?<unit>.+?)\s*$/i;

const detect = (raw: string): Detection | null => {
  const match = normalizeSpacing(raw).trim().match(MOMENT_REGEX);
  if (!match?.groups) return null;

  const value = parseFloat(match.groups.value);
  if (!Number.isFinite(value)) return null;

  const unitKey = normalizeUnitKey(match.groups.unit);
  if (unitKey.length === 0) return null;

  const normalized = detectMomentFromUnitKey(value, unitKey);
  if (!normalized) return null;

  return {
    score: 0.82,
    normalizedInput: normalized,
  };
};

const format = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return value.toFixed(0);
  if (abs >= 1_000_000) return value.toFixed(1);
  if (abs >= 100_000) return value.toFixed(2);
  if (abs >= 10_000) return value.toFixed(3);
  if (abs >= 1) return value.toFixed(4);
  return value.toFixed(6);
};

const toRows = ({ newtonMeters }: NormalizedMoment): OutputRow[] => {
  const kilonewtonMeters = newtonMeters / 1000;
  const newtonCentimeters = newtonMeters / METERS_PER_CM;
  const newtonMillimeters = newtonMeters / METERS_PER_MM;
  const poundFeet = newtonMeters / (NEWTONS_PER_LBF * METERS_PER_FOOT);
  const poundInches = newtonMeters / (NEWTONS_PER_LBF * METERS_PER_INCH);
  const kilogramForceMeters = newtonMeters / NEWTONS_PER_KGF;
  const kilogramForceCentimeters =
    newtonMeters / (NEWTONS_PER_KGF * METERS_PER_CM);

  return [
    {
      label: "Newton-meters",
      value: `${format(newtonMeters)} N·m`,
      copy: newtonMeters.toString(),
      hint: "SI unit of torque (force × distance)",
    },
    {
      label: "Kilonewton-meters",
      value: `${format(kilonewtonMeters)} kN·m`,
      copy: kilonewtonMeters.toString(),
      hint: "Engineering scale",
    },
    {
      label: "Newton-centimeters",
      value: `${format(newtonCentimeters)} N·cm`,
      copy: newtonCentimeters.toString(),
      hint: "Common for small fasteners",
    },
    {
      label: "Newton-millimeters",
      value: `${format(newtonMillimeters)} N·mm`,
      copy: newtonMillimeters.toString(),
      hint: "Often used for precision work",
    },
    {
      label: "Pound-foot",
      value: `${format(poundFeet)} lbf·ft`,
      copy: poundFeet.toString(),
      hint: "Imperial / US customary",
    },
    {
      label: "Pound-inch",
      value: `${format(poundInches)} lbf·in`,
      copy: poundInches.toString(),
      hint: "Imperial / US customary",
    },
    {
      label: "Kilogram-force meter",
      value: `${format(kilogramForceMeters)} kgf·m`,
      copy: kilogramForceMeters.toString(),
      hint: "Based on standard gravity",
    },
    {
      label: "Kilogram-force centimeter",
      value: `${format(kilogramForceCentimeters)} kgf·cm`,
      copy: kilogramForceCentimeters.toString(),
      hint: "Based on standard gravity",
    },
  ];
};

const convert = (detection: Detection): ConversionPayload | null => {
  const normalized = detection.normalizedInput as NormalizedMoment | undefined;
  if (!normalized) return null;
  return { rows: toRows(normalized) };
};

const momentModule: ConversionModule = {
  id: "moment",
  label: "Moment",
  detect,
  convert,
};

export default momentModule;
