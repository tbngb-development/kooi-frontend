"use client";

import { useState, useEffect } from "react";
import type { RetryConfig } from "@/types/batch";

interface RetryConfigEditorProps {
  value?: RetryConfig | null;
  onChange: (config: RetryConfig | undefined) => void;
}

const INTERVAL_OPTIONS = [
  { label: "1 hr", minutes: 60 },
  { label: "4 hr", minutes: 240 },
  { label: "24 hr", minutes: 1440 },
];

export function RetryConfigEditor({ value, onChange }: RetryConfigEditorProps) {
  const [enabled, setEnabled] = useState(value?.enabled ?? false);
  const [retryNoAnswer, setRetryNoAnswer] = useState(
    value?.retry_on_statuses
      ? value.retry_on_statuses.includes("no-answer")
      : true,
  );
  const [retryFailed, setRetryFailed] = useState(
    value?.retry_on_statuses
      ? value.retry_on_statuses.includes("failed")
      : true,
  );
  const [retryBusy, setRetryBusy] = useState(
    value?.retry_on_statuses?.includes("busy") ?? true,
  );
  const [selectedIntervals, setSelectedIntervals] = useState<number[]>(
    value?.retry_intervals_minutes ?? [60, 240],
  );

  useEffect(() => {
    if (!enabled) {
      onChange(undefined);
      return;
    }

    const statuses: Array<"no-answer" | "busy" | "failed" | "error"> = [];
    if (retryNoAnswer) statuses.push("no-answer");
    if (retryFailed) statuses.push("failed");
    if (retryBusy) statuses.push("busy");

    // Dynamic max_retries based on number of intervals selected
    const sortedIntervals = [...selectedIntervals].sort((a, b) => a - b);
    const maxRetries = Math.max(1, sortedIntervals.length);

    onChange({
      enabled: true,
      max_retries: maxRetries,
      retry_on_statuses: statuses,
      retry_intervals_minutes:
        sortedIntervals.length > 0 ? sortedIntervals : [60],
    });
  }, [enabled, retryNoAnswer, retryFailed, retryBusy, selectedIntervals]);

  const toggleInterval = (minutes: number) => {
    if (selectedIntervals.includes(minutes)) {
      if (selectedIntervals.length === 1) return; // Must keep at least 1
      setSelectedIntervals(selectedIntervals.filter((m) => m !== minutes));
    } else {
      setSelectedIntervals([...selectedIntervals, minutes]);
    }
  };

  return (
    <div className="rounded-lg border border-surface-border p-4 bg-surface space-y-3">
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 rounded border-surface-border text-brand-600 focus:ring-brand-500"
        />
        <span className="text-base font-semibold text-text-primary">
          Enable Auto-Retry for Unconnected Calls
        </span>
      </label>

      {enabled && (
        <div className="pl-6 space-y-4 pt-1">
          {/* Triggers */}
          <div>
            <label className="text-base font-medium text-text-muted block mb-2">
              Retry on conditions:
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-base font-medium border border-surface-border cursor-pointer hover:bg-surface-hover">
                <input
                  type="checkbox"
                  checked={retryNoAnswer}
                  onChange={(e) => setRetryNoAnswer(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                No Answer
              </label>

              <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-base font-medium border border-surface-border cursor-pointer hover:bg-surface-hover">
                <input
                  type="checkbox"
                  checked={retryFailed}
                  onChange={(e) => setRetryFailed(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                Failed
              </label>

              <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-base font-medium border border-surface-border cursor-pointer hover:bg-surface-hover">
                <input
                  type="checkbox"
                  checked={retryBusy}
                  onChange={(e) => setRetryBusy(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                Busy
              </label>
            </div>
          </div>

          {/* Interval Pills */}
          <div>
            <label className="text-base font-medium text-text-muted block mb-2">
              When to retry:
            </label>
            <div className="flex items-center gap-2">
              {INTERVAL_OPTIONS.map((opt) => {
                const isSelected = selectedIntervals.includes(opt.minutes);
                return (
                  <button
                    key={opt.minutes}
                    type="button"
                    onClick={() => toggleInterval(opt.minutes)}
                    className={`px-3 py-1.5 rounded-lg text-base font-medium border transition-colors ${
                      isSelected
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-surface text-text-secondary border-surface-border hover:bg-surface-hover"
                    }`}
                  >
                    After {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-base text-text-muted">
            Will make up to{" "}
            <span className="font-bold text-text-primary">
              {selectedIntervals.length}
            </span>{" "}
            retry attempt{selectedIntervals.length > 1 ? "s" : ""}.
          </p>
        </div>
      )}
    </div>
  );
}
