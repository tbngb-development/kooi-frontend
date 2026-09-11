"use client";

import { useState } from "react";
import { useAdminPlans, useAdminChangePlan } from "@/hooks/admin/useAdminPlans";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { paisaToInr } from "@/lib/utils/formatMoney";
import { ArrowLeftRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface AdminPlanChangePanelProps {
  tenantId: string;
  currentPlanName?: string;
  currentPlanId?: string;
}

export function AdminPlanChangePanel({
  tenantId,
  currentPlanName,
  currentPlanId,
}: AdminPlanChangePanelProps) {
  const { data: plans, isLoading } = useAdminPlans(false);
  const { mutate: changePlan, isPending } = useAdminChangePlan();

  const [newPlanId, setNewPlanId] = useState("");
  const [waiveFee, setWaiveFee] = useState(false);

  const planOptions =
    plans
      ?.filter((p) => p.id !== currentPlanId && p.currentVersion)
      .map((p) => ({
        value: p.id,
        label: `${p.name} (${paisaToInr(p.currentVersion!.onboardingFee)} onboarding)`,
      })) ?? [];

  const handleChange = () => {
    if (!newPlanId) return;

    const confirmMsg = waiveFee
      ? "This will change the plan AND waive the fee difference. Continue?"
      : "This will change the tenant's plan. If the new plan costs more, the tenant will need to pay the difference. Continue?";

    if (!window.confirm(confirmMsg)) return;

    changePlan(
      { tenantId, data: { newPlanId, waiveFee } },
      {
        onSuccess: (data) => {
          setNewPlanId("");
          setWaiveFee(false);
          if (data.effectiveImmediately) {
            toast.success(
              `Plan changed (${data.direction.toLowerCase()}). Effective immediately.`,
            );
          } else {
            toast.info(
              `Plan change initiated. Tenant must complete payment of ${paisaToInr(data.onboardingFeeDifference)}.`,
            );
          }
        },
      },
    );
  };

  if (isLoading) {
    return (
      <Card className="p-5">
        <div className="flex justify-center py-4">
          <Spinner className="text-brand-600" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2">
        <ArrowLeftRight size={16} className="text-secondary-600" />
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Change Tenant Plan
        </h3>
      </div>

      {currentPlanName && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-muted">Current:</span>
          <Badge variant="success" dot>
            {currentPlanName}
          </Badge>
        </div>
      )}

      <Select
        label="New Plan"
        value={newPlanId}
        onChange={(e) => setNewPlanId(e.target.value)}
        options={planOptions}
        placeholder="Select a plan..."
      />

      <label className="flex items-center gap-2 text-sm font-medium text-text-secondary cursor-pointer">
        <input
          type="checkbox"
          checked={waiveFee}
          onChange={(e) => setWaiveFee(e.target.checked)}
          className="rounded border-surface-border text-brand-600 focus:ring-brand-500"
        />
        Waive onboarding fee difference
      </label>

      <Button
        onClick={handleChange}
        loading={isPending}
        disabled={!newPlanId}
        leftIcon={<ShieldCheck size={14} />}
        className="w-full sm:w-auto"
      >
        Change Plan
      </Button>
    </Card>
  );
}
