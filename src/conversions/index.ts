import base64 from "./base64";
import color from "./color";
import currency from "./currency";
import dataSize from "./dataSize";
import jwt from "./jwt";
import mass from "./mass";
import power from "./power";
import speed from "./speed";
import volume from "./volume";
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
  jwt,
  mass,
  power,
  speed,
  volume,
];

export function resolveConversion(
  raw: string,
  available: ConversionModule[] = modules,
  options: ResolverOptions = {},
): ConversionResolution | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;

  let best: ConversionResolution | null = null;

  available.forEach((module) => {
    const detection = module.detect(trimmed);
    if (!detection) return;

    const biasBoost = options.biasModuleId === module.id ? 0.1 : 0;
    const effectiveScore = detection.score + biasBoost;

    const payload = module.convert(detection, trimmed);
    if (!payload) return;

    const resolution: ConversionResolution = {
      module,
      detection: { ...detection, score: effectiveScore },
      payload,
    };

    if (!best || resolution.detection.score > best.detection.score) {
      best = resolution;
    }
  });

  return best;
}
