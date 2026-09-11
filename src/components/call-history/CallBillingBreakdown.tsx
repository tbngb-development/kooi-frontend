"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { paisaToInr } from "@/lib/utils/formatMoney";
import type { Call } from "@/types/call";
import { Coins, Clock, Award } from "lucide-react";

interface CallBillingBreakdownProps {
  call: Call;
}

export function CallBillingBreakdown({ call }: CallBillingBreakdownProps) {
  // If the call hasn't been charged, return empty
  if (call.chargedAmount === null && call.platformCost === null) return null;

  // Authoritative paisa platform cost resolved
  const chargedAmount = call.chargedAmount ?? call.platformCost ?? 0;
  const ratePerMinute = call.appliedRate ?? 0;
  const billingMinimum = call.appliedMinSec ?? 0;
  const billingIncrement = call.appliedIncrementSec ?? 0;
  const billableSec = call.billableSeconds ?? 0;

  return (
    <Card className="p-5 border border-surface-border bg-surface-muted/30 space-y-4">
      <div className="flex items-center justify-between border-b border-surface-subtle pb-3">
        <div className="flex items-center gap-2">
          <Coins size={16} className="text-brand-600 animate-pulse" />
          <h4 className="text-sm font-bold text-text-primary uppercase tracking-wide">
            Billing & Settlement Ledger
          </h4>
        </div>
        <Badge variant="success" dot className="font-mono">
          Settled
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Cost */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-text-placeholder uppercase tracking-wider">
            Platform Cost
          </p>
          <p className="text-base font-extrabold font-mono text-brand-700">
            {paisaToInr(chargedAmount)}
          </p>
        </div>

        {/* Rate */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-text-placeholder uppercase tracking-wider">
            Applied Rate
          </p>
          <p className="text-xs font-semibold text-text-secondary font-mono">
            {ratePerMinute > 0 ? `${paisaToInr(ratePerMinute)}/min` : "Custom"}
          </p>
        </div>

        {/* Billable Seconds */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-text-placeholder uppercase tracking-wider">
            Billable Seconds
          </p>
          <p className="text-xs font-semibold text-text-secondary font-mono flex items-center gap-1">
            <Clock size={12} className="text-text-placeholder" />
            {billableSec}s (actual: {call.duration ?? 0}s)
          </p>
        </div>

        {/* Increments */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-text-placeholder uppercase tracking-wider">
            Billing Increments
          </p>
          <p className="text-xs font-semibold text-text-secondary font-mono">
            {billingMinimum}s min / {billingIncrement}s inc
          </p>
        </div>
      </div>

      {call.planVersionId && (
        <div className="flex items-center gap-1 text-[10px] font-bold text-text-placeholder uppercase tracking-wider border-t border-surface-subtle pt-3">
          <Award size={12} className="text-brand-500" />
          Plan Session Trace:{" "}
          <span className="font-mono text-text-secondary">
            {call.planVersionId}
          </span>
        </div>
      )}
    </Card>
  );
}
