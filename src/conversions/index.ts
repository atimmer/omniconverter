import color from "./color";
import jwt from "./jwt";
import mass from "./mass";
import type {
  ConversionModule,
  ConversionResolution,
  ResolverOptions,
} from "./types";

export const modules: ConversionModule[] = [color, mass, jwt];

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
