// src/lib/utils/formatDate.ts

import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatDate(
  date: string | Date | undefined | null,
  fmt = "MMM d, yyyy",
): string {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, fmt);
  } catch {
    return "—";
  }
}

export function formatDateOnly(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTimeOnly(date: string | Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateTime(date: string | Date | undefined | null): string {
  return formatDate(date, "MMM d, yyyy h:mm a");
}

export function formatRelative(date: string | Date | undefined | null): string {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "—";
  }
}

export function formatTranscriptDuration(seconds?: number | null): string {
  if (seconds == null) return "—";

  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
