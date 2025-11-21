import base64Encode from "./base64Encode";
import type {
  AlwaysPossibleModule,
  AlwaysPossibleResolution,
  AlwaysPossibleResolverOptions,
} from "./types";

/* Keep this list in alphabetical order */
export const alwaysPossibleModules: AlwaysPossibleModule[] = [base64Encode];

export function resolveAlwaysPossible(
  raw: string,
  available: AlwaysPossibleModule[] = alwaysPossibleModules,
  options: AlwaysPossibleResolverOptions = {},
): AlwaysPossibleResolution[] {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return [];

  const resolutions = available
    .map((module) => {
      const payload = module.convert(raw);
      if (!payload) return null;

      // Scoring:
      // - module.heuristicScore: module-specific ranking (e.g., prefers multi-line text for base64 encode)
      // - preferredBoost: hard promotion when the converter is named in the URL
      // - textPresenceBoost: small bump for non-empty input so short strings still show
      const heuristicScore = module.heuristicScore?.(raw) ?? 0;
      const preferredBoost = options.preferredModuleId === module.id ? 5 : 0;
      const textPresenceBoost = Math.min(trimmed.length / 48, 1);

      const score = heuristicScore + preferredBoost + textPresenceBoost;

      return {
        module,
        payload,
        score,
      };
    })
    .filter(Boolean) as AlwaysPossibleResolution[];

  return resolutions.sort((left, right) => {
    if (left.score === right.score) {
      return left.module.label.localeCompare(right.module.label);
    }
    return right.score - left.score;
  });
}
