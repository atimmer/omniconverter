import type {
  ConversionModule,
  ConversionPayload,
  Detection,
  OutputRow,
} from "./types";
import { formatFixedTrimmed } from "./formatNumber";

type TimeUnit = "second" | "minute" | "hour" | "day" | "week" | "month";

type NormalizedDuration = {
  kind: "duration";
  seconds: number;
  sourceUnit: TimeUnit;
};

type NormalizedClock = {
  kind: "clock";
  hour24: number;
  minute: number;
};

type NormalizedTime = NormalizedDuration | NormalizedClock;

// Examples: "90m", "1.5 h", "3600 seconds", "2 weeks", "1 month"
const TIME_REGEX =
  /^(?<value>-?\d+(?:\.\d+)?)\s*(?<unit>sec\.?(?:ond)?s?|secs\.?|s|mins?\.?|min\.?(?:ute)?s?|m|hrs?\.?|hr\.?|h|hours?\.?|days?\.?|d|wks?\.?|wk\.?|weeks?\.?|w|mos?\.?|mo\.?|months?\.?|month)\s*$/i;
const CLOCK_24H_REGEX = /^(?<hour>(?:[01]?\d|2[0-3])):(?<minute>[0-5]\d)$/;
const CLOCK_12H_REGEX =
  /^(?<hour>1[0-2]|0?[1-9])(?::(?<minute>[0-5]\d))?\s*(?<period>a\.?m\.?|p\.?m\.?)$/i;

// Exact units (by definition)
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;
const SECONDS_PER_WEEK = 7 * SECONDS_PER_DAY;

// Approximate month based on 52/12 weeks per month.
// This intentionally makes "month <-> week" match the requested ratio.
const WEEKS_PER_MONTH_APPROX = 52 / 12;
const SECONDS_PER_MONTH_APPROX = SECONDS_PER_WEEK * WEEKS_PER_MONTH_APPROX;

const normalizeUnit = (rawUnit: string): TimeUnit | null => {
  const unit = rawUnit.toLowerCase().replace(/[\s._-]+/g, "");

  if (unit === "s" || unit.startsWith("sec")) return "second";
  if (unit === "m" || unit.startsWith("min")) return "minute";
  if (unit === "h" || unit.startsWith("hr") || unit.startsWith("hour"))
    return "hour";
  if (unit === "d" || unit.startsWith("day")) return "day";
  if (unit === "w" || unit.startsWith("wk") || unit.startsWith("week"))
    return "week";
  if (unit === "mo" || unit.startsWith("mos") || unit.startsWith("month"))
    return "month";

  return null;
};

const secondsPerUnit = (unit: TimeUnit): number => {
  switch (unit) {
    case "second":
      return 1;
    case "minute":
      return SECONDS_PER_MINUTE;
    case "hour":
      return SECONDS_PER_HOUR;
    case "day":
      return SECONDS_PER_DAY;
    case "week":
      return SECONDS_PER_WEEK;
    case "month":
      return SECONDS_PER_MONTH_APPROX;
  }
};

const parseClockTime = (raw: string): NormalizedClock | null => {
  const trimmed = raw.trim();

  const match24 = trimmed.match(CLOCK_24H_REGEX);
  if (match24?.groups) {
    return {
      kind: "clock",
      hour24: Number.parseInt(match24.groups.hour, 10),
      minute: Number.parseInt(match24.groups.minute, 10),
    };
  }

  const match12 = trimmed.match(CLOCK_12H_REGEX);
  if (!match12?.groups) return null;

  const hour = Number.parseInt(match12.groups.hour, 10);
  const minute = match12.groups.minute
    ? Number.parseInt(match12.groups.minute, 10)
    : 0;
  const period = match12.groups.period.toLowerCase().replace(/\./g, "");

  const hour24 =
    period === "am" ? (hour === 12 ? 0 : hour) : hour === 12 ? 12 : hour + 12;

  return {
    kind: "clock",
    hour24,
    minute,
  };
};

const detect = (raw: string): Detection | null => {
  const clock = parseClockTime(raw);
  if (clock) {
    return {
      score: 0.84,
      normalizedInput: clock,
    };
  }

  const match = raw.trim().match(TIME_REGEX);
  if (!match?.groups) return null;

  const value = parseFloat(match.groups.value);
  if (!Number.isFinite(value)) return null;

  const unit = normalizeUnit(match.groups.unit);
  if (!unit) return null;

  const seconds = value * secondsPerUnit(unit);

  return {
    score: 0.8,
    normalizedInput: {
      kind: "duration",
      seconds,
      sourceUnit: unit,
    } satisfies NormalizedDuration,
  };
};

const format = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1000000) return formatFixedTrimmed(value, 0);
  if (abs >= 10000) return formatFixedTrimmed(value, 1);
  if (abs >= 1000) return formatFixedTrimmed(value, 2);
  if (abs >= 10) return formatFixedTrimmed(value, 3);
  if (abs >= 1) return formatFixedTrimmed(value, 4);
  return formatFixedTrimmed(value, 6);
};

const formatPretty = (seconds: number) => {
  if (!Number.isFinite(seconds)) return seconds.toString();
  if (seconds === 0) return "0s";

  const sign = seconds < 0 ? "-" : "";
  let remaining = Math.abs(seconds);

  // Treat values extremely close to an integer as an integer.
  if (Math.abs(remaining - Math.round(remaining)) < 1e-9) {
    remaining = Math.round(remaining);
  }

  const days = Math.floor(remaining / SECONDS_PER_DAY);
  remaining -= days * SECONDS_PER_DAY;

  const hours = Math.floor(remaining / SECONDS_PER_HOUR);
  remaining -= hours * SECONDS_PER_HOUR;

  const minutes = Math.floor(remaining / SECONDS_PER_MINUTE);
  remaining -= minutes * SECONDS_PER_MINUTE;

  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);

  // Only show seconds if they are non-zero or if we have no larger units.
  const showSeconds = remaining !== 0 || parts.length === 0;
  if (showSeconds) {
    const secondsPart =
      Number.isInteger(remaining) || Math.abs(remaining) >= 1
        ? formatFixedTrimmed(remaining, 0)
        : format(remaining);
    parts.push(`${secondsPart}s`);
  }

  return `${sign}${parts.join("")}`;
};

const pad2 = (value: number) => value.toString().padStart(2, "0");

const toClockRows = ({ hour24, minute }: NormalizedClock): OutputRow[] => {
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const minutePart = pad2(minute);
  const value24h = `${pad2(hour24)}:${minutePart}`;
  const value12h = `${hour12}:${minutePart} ${period}`;
  const compact12h =
    minute === 0
      ? `${hour12}${period.toLowerCase()}`
      : `${hour12}:${minutePart}${period.toLowerCase()}`;

  return [
    {
      label: "24-hour",
      value: value24h,
      copy: value24h,
    },
    {
      label: "12-hour",
      value: value12h,
      copy: value12h,
    },
    {
      label: "12-hour (compact)",
      value: compact12h,
      copy: compact12h,
      hint: "Common shorthand like 10am or 10:30pm",
    },
  ];
};

const toDurationRows = ({
  seconds,
  sourceUnit,
}: NormalizedDuration): OutputRow[] => {
  const minutes = seconds / SECONDS_PER_MINUTE;
  const hours = seconds / SECONDS_PER_HOUR;
  const days = seconds / SECONDS_PER_DAY;
  const weeks = seconds / SECONDS_PER_WEEK;
  const months = seconds / SECONDS_PER_MONTH_APPROX;

  const weekHint =
    sourceUnit === "month"
      ? "Approximate (month ↔ week uses 52/12)."
      : undefined;
  const monthHint =
    sourceUnit === "week"
      ? "Approximate (week ↔ month uses 12/52)."
      : undefined;

  return [
    {
      label: "Pretty",
      value: formatPretty(seconds),
      copy: formatPretty(seconds),
      hint: "Compact d/h/m/s formatting",
    },
    {
      label: "Seconds",
      value: `${format(seconds)} s`,
      copy: seconds.toString(),
      hint: "SI base time",
    },
    {
      label: "Minutes",
      value: `${format(minutes)} min`,
      copy: minutes.toString(),
    },
    {
      label: "Hours",
      value: `${format(hours)} h`,
      copy: hours.toString(),
    },
    {
      label: "Days",
      value: `${format(days)} d`,
      copy: days.toString(),
    },
    {
      label: "Weeks",
      value: `${format(weeks)} w`,
      copy: weeks.toString(),
      hint: weekHint,
    },
    {
      label: "Months",
      value: `${format(months)} mo`,
      copy: months.toString(),
      hint: monthHint,
    },
  ];
};

const toRows = (normalized: NormalizedTime): OutputRow[] => {
  if (normalized.kind === "clock") return toClockRows(normalized);
  return toDurationRows(normalized);
};

const convert = (
  detection: Detection,
  raw: string,
): ConversionPayload | null => {
  if (!raw) return null;
  const normalized = detection.normalizedInput as NormalizedTime | undefined;
  if (!normalized) return null;
  return { rows: toRows(normalized) };
};

const timeModule: ConversionModule = {
  id: "time",
  label: "Time",
  detect,
  convert,
};

export default timeModule;
