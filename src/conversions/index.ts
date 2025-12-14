import base64 from "./base64";
import color from "./color";
import currency from "./currency";
import dataSize from "./dataSize";
import force from "./force";
import jwt from "./jwt";
import mass from "./mass";
import moment from "./moment";
import power from "./power";
import pressure from "./pressure";
import rainRate from "./rainRate";
import speed from "./speed";
import temperature from "./temperature";
import volume from "./volume";
import windspeed from "./windspeed";
import type {
  ConversionModule,
  ConversionResolution,
  ResolverOptions,
} from "./types";
export { alwaysPossibleModules, resolveAlwaysPossible } from "./alwaysPossible";

/* Keep this list in alphabetical order */
export const modules: ConversionModule[] = [
  base64,
  color,
  currency,
  dataSize,
  force,
  jwt,
  mass,
  moment,
  power,
  pressure,
  rainRate,
  speed,
  temperature,
  volume,
  windspeed,
];

export function resolveConversions(
  raw: string,
  available: ConversionModule[] = modules,
  options: ResolverOptions = {},
): ConversionResolution[] {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return [];

  const resolutions = available
    .map((module) => {
      const detection = module.detect(trimmed);
      if (!detection) return null;

      const biasBoost = options.biasModuleId === module.id ? 0.1 : 0;
      const effectiveScore = detection.score + biasBoost;

      const payload = module.convert(detection, trimmed);
      if (!payload) return null;

      const resolution: ConversionResolution = {
        module,
        detection: { ...detection, score: effectiveScore },
        payload,
      };

      return resolution;
    })
    .filter(Boolean) as ConversionResolution[];

  return resolutions.sort((left, right) => {
    if (left.detection.score === right.detection.score) {
      return left.module.label.localeCompare(right.module.label);
    }
    return right.detection.score - left.detection.score;
  });
}

export function resolveConversion(
  raw: string,
  available: ConversionModule[] = modules,
  options: ResolverOptions = {},
): ConversionResolution | null {
  const [best] = resolveConversions(raw, available, options);
  return best ?? null;
}
