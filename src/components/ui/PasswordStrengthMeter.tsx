"use client";

import { Check, X } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
}

interface RequirementCheck {
  label: string;
  met: boolean;
}

export function PasswordStrengthMeter({
  password,
}: PasswordStrengthMeterProps) {
  if (!password) return null;

  const checks: RequirementCheck[] = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
  ];

  const score = checks.filter((c) => c.met).length;

  const strength = (() => {
    if (score <= 1)
      return { label: "Weak", color: "text-error-600", bg: "bg-error-500" };
    if (score <= 2)
      return { label: "Fair", color: "text-warning-600", bg: "bg-warning-500" };
    if (score <= 3)
      return { label: "Good", color: "text-info-600", bg: "bg-info-500" };
    return { label: "Strong", color: "text-success-600", bg: "bg-success-500" };
  })();

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-1 flex-1 rounded-full transition-colors ${
                level <= score ? strength.bg : "bg-surface-border"
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${strength.color}`}>
          {strength.label}
        </span>
      </div>

      {/* Requirements checklist */}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
        {checks.map((check) => (
          <li key={check.label} className="flex items-center gap-1.5">
            {check.met ? (
              <Check size={12} className="text-success-600 shrink-0" />
            ) : (
              <X size={12} className="text-text-placeholder shrink-0" />
            )}
            <span
              className={`text-xs ${
                check.met ? "text-text-secondary" : "text-text-muted"
              }`}
            >
              {check.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
