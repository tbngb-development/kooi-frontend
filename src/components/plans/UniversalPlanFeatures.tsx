"use client";

import { Check } from "lucide-react";

export function UniversalPlanFeatures() {
  const features = [
    { label: "Billing", value: "30-sec minimum, then 15-sec increments" },
    { label: "Campaigns", value: "Unlimited" },
    { label: "Lead uploads", value: "Unlimited*" },
    { label: "Recordings included", value: "Yes" },
    { label: "Transcripts included", value: "Yes" },
  ];

  return (
    <div className="mt-12 bg-white border border-surface-border hover:border-surface-hover shadow-sm rounded-3xl p-8 sm:p-10 text-center">
      <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-8">
        Every plan includes{" "}
        <span className="text-brand-600">everything you need</span> and more
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-8 max-w-4xl mx-auto text-left">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <Check size={12} strokeWidth={3} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary leading-tight">
                {feature.label}
              </p>
              <p className="text-xs text-text-muted mt-0.5">{feature.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
