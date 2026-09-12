/**
 * Convert SCREAMING_SNAKE_CASE enum values to "Title Case" for display.
 * e.g. "INTERESTED_SEND_DETAILS" → "Interested Send Details"
 */
export function humanizeEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
