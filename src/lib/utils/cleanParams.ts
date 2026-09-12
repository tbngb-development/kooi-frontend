type CleanableValue = string | number | boolean;

/**
 * Filters out undefined, null, and empty string keys from an object.
 * Prevents serializing empty parameters as `?campaignId=&dateFrom=`.
 */
export function cleanParams<T extends object>(
  params?: T,
): Record<string, CleanableValue> | undefined {
  if (!params) return undefined;

  const out: Record<string, CleanableValue> = {};
  const entries = Object.entries(params as Record<string, unknown>);

  for (const [key, value] of entries) {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      (typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean")
    ) {
      out[key] = value;
    }
  }

  return Object.keys(out).length > 0 ? out : undefined;
}
