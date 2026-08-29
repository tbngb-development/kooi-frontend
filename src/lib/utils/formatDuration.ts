// src/lib/utils/formatDuration.ts

export function formatDuration(seconds: number | undefined | null): string {
  if (seconds == null) return '0.0';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return `${h}h ${rem}m`;
}