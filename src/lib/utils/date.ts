/**
 * Converts a JavaScript Date to Bolna-compliant ISO 8601 string
 * with a numeric offset (e.g., "2026-08-28T11:35:00+05:30").
 * Bolna rejects the "Z" suffix with a 500 error.
 */
export function toBolnaISO(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
  const offsetMinutes = pad(Math.abs(offset) % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMinutes}`;
}

/**
 * Converts a Date to "YYYY-MM-DDTHH:mm" for <input type="datetime-local" />
 * in the user's local timezone.
 */
export function toDateTimeLocalString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
