export function formatFixedTrimmed(value: number, fractionDigits: number) {
  if (!Number.isFinite(value)) return value.toString();

  const fixed = value.toFixed(fractionDigits);

  // Trim trailing zeros after decimal, and remove the decimal point if needed.
  const trimmed = fixed.includes(".")
    ? fixed
        .replace(/(\.\d*?[1-9])0+$/u, "$1")
        .replace(/\.0+$/u, "")
        .replace(/\.$/u, "")
    : fixed;

  // Avoid rendering "-0" after rounding.
  return trimmed === "-0" ? "0" : trimmed;
}

