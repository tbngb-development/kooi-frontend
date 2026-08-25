// src/components/campaigns/CampaignActions.tsx

"use client";

import { SetStateAction, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  useStartCampaign,
  usePauseCampaign,
  useCancelScheduleCampaign,
} from "@/hooks/useCampaigns";
import type { CampaignStatus } from "@/types";
import { Calendar, Clock, Play, Pause, X, Zap } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface CampaignActionsProps {
  campaignId: string;
  status: CampaignStatus;
}

// ─── Peak Time Quick-Select Presets ──────────────────────────────────────────
// Each preset returns a Date object relative to "now".
interface PeakTimePreset {
  label: string;
  description: string;
  getDate: () => Date;
}

function getNextDayOfWeek(dayOfWeek: number): Date {
  const now = new Date();
  const currentDay = now.getDay();
  let daysUntil = dayOfWeek - currentDay;
  if (daysUntil <= 0) daysUntil += 7;
  const target = new Date(now);
  target.setDate(now.getDate() + daysUntil);
  return target;
}

const PEAK_TIME_PRESETS: PeakTimePreset[] = [
  {
    label: "Tomorrow 10 AM",
    description: "Weekday morning peak",
    getDate: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(10, 0, 0, 0);
      return d;
    },
  },
  {
    label: "Tomorrow 4 PM",
    description: "Afternoon follow-up",
    getDate: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(16, 0, 0, 0);
      return d;
    },
  },
  {
    label: "Monday 9 AM",
    description: "Week start — high pickup",
    getDate: () => {
      const d = getNextDayOfWeek(1);
      d.setHours(9, 0, 0, 0);
      return d;
    },
  },
  {
    label: "Saturday 11 AM",
    description: "Weekend — relaxed leads",
    getDate: () => {
      const d = getNextDayOfWeek(6);
      d.setHours(11, 0, 0, 0);
      return d;
    },
  },
  {
    label: "Sunday 10 AM",
    description: "Weekend morning peak",
    getDate: () => {
      const d = getNextDayOfWeek(0);
      d.setHours(10, 0, 0, 0);
      return d;
    },
  },
];

export function CampaignActions({ campaignId, status }: CampaignActionsProps) {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { mutate: start, isPending: starting } = useStartCampaign(campaignId);
  const { mutate: pause, isPending: pausing } = usePauseCampaign(campaignId);
  const { mutate: cancelSchedule, isPending: canceling } =
    useCancelScheduleCampaign(campaignId);

  // ─── Run Now ──────────────────────────────────────────────────────────────
  const handleRunNow = () => {
    start(undefined);
  };

  // ─── Confirm Schedule ─────────────────────────────────────────────────────
  const handleConfirmSchedule = () => {
    if (!selectedDate) return;
    start(selectedDate.toISOString(), {
      onSuccess: () => {
        setScheduleOpen(false);
        setSelectedDate(null);
      },
    });
  };

  // ─── Quick Preset Select ──────────────────────────────────────────────────
  const handlePresetSelect = (preset: PeakTimePreset) => {
    setSelectedDate(preset.getDate());
  };

  // ─── RUNNING: Pause button only ──────────────────────────────────────────
  if (status === "RUNNING") {
    return (
      <Button
        variant="outline"
        leftIcon={<Pause size={14} />}
        onClick={() => pause()}
        loading={pausing}
      >
        Pause Campaign
      </Button>
    );
  }

  // ─── SCHEDULED: Cancel button only ───────────────────────────────────────
  if (status === "SCHEDULED") {
    return (
      <Button
        variant="outline"
        className="border-error-200 text-error-600 hover:bg-error-50"
        leftIcon={<X size={14} />}
        onClick={() => cancelSchedule()}
        loading={canceling}
      >
        Cancel Schedule
      </Button>
    );
  }

  // ─── DRAFT / PAUSED / COMPLETED: Run Now + Schedule buttons ──────────────
  if (status === "DRAFT" || status === "PAUSED" || status === "COMPLETED") {
    const runLabel =
      status === "PAUSED"
        ? "Resume Now"
        : status === "COMPLETED"
          ? "Re-run Now"
          : "Run Now";

    return (
      <>
        <div className="flex items-center gap-2">
          {/* Primary: Run Now */}
          <Button
            leftIcon={<Play size={14} />}
            onClick={handleRunNow}
            loading={starting}
          >
            {runLabel}
          </Button>

          {/* Secondary: Schedule */}
          <Button
            variant="outline"
            leftIcon={<Calendar size={14} />}
            onClick={() => setScheduleOpen(true)}
          >
            Schedule
          </Button>
        </div>

        {/* ─── Schedule Modal ──────────────────────────────────────────── */}
        <Modal
          isOpen={scheduleOpen}
          onClose={() => {
            setScheduleOpen(false);
            setSelectedDate(null);
          }}
          title="Schedule Campaign"
        >
          <div className="flex flex-col gap-5 mt-2">
           

            {/* ── Peak Time Quick Chips ──────────────────────────────── */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-secondary flex items-center gap-1.5">
                <Zap size={12} className="text-amber-500" />
                Peak Pickup Times
              </label>
              <div className="flex flex-wrap gap-2">
                {PEAK_TIME_PRESETS.map((preset) => {
                  const isActive =
                    selectedDate?.getTime() === preset.getDate().getTime();
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`inline-flex flex-col items-start px-3 py-2 rounded-lg border text-left transition-all cursor-pointer ${
                        isActive
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-surface-border bg-white hover:border-brand-300 hover:bg-brand-50/30"
                      }`}
                    >
                      <span className="text-sm font-semibold">
                        {preset.label}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {preset.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Custom Date-Time Picker ────────────────────────────── */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-secondary flex items-center gap-1.5">
                <Clock size={12} />
                Or Pick a Custom Time
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={(date: SetStateAction<Date | null>) =>
                  setSelectedDate(date)
                }
                showTimeSelect
                dateFormat="MMM d, yyyy · h:mm aa"
                minDate={new Date()}
                placeholderText="Select date & time..."
                className="w-full text-base px-3 py-2.5 rounded-lg border border-surface-border bg-white text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            {/* ── Selected Time Preview ──────────────────────────────── */}
            {selectedDate && (
              <div className="flex items-center gap-2 rounded-lg bg-brand-50 border border-brand-200 px-3 py-2.5">
                <Calendar size={14} className="text-brand-600 shrink-0" />
                <p className="text-sm text-brand-700 font-medium">
                  Campaign will launch on{" "}
                  {selectedDate.toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  at{" "}
                  {selectedDate.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}

            {/* ── Actions ────────────────────────────────────────────── */}
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <Button
                variant="outline"
                onClick={() => {
                  setScheduleOpen(false);
                  setSelectedDate(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSchedule}
                loading={starting}
                disabled={!selectedDate}
                leftIcon={<Calendar size={13} />}
              >
                Confirm Schedule
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  // ─── FAILED: No action ───────────────────────────────────────────────────
  return null;
}
