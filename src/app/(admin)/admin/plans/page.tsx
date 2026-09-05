"use client";

import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAdminPlans, useCreatePlan } from "@/hooks/admin/useAdminPlans";
import { adminPlansApi } from "@/lib/api/admin/admin-plans";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { RefreshButton } from "@/components/ui/RefreshButton";
import {
  CreditCard,
  Plus,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { CreatePlanInput, Plan, PlanFeatures } from "@/types/plan";

const planSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  onboardingFee: z.number().min(0, "Must be 0 or greater"),
  perMinuteRate: z.number().min(0, "Must be 0 or greater"),
  billingMinimumSec: z.number().min(1, "Must be at least 1 second"),
  billingIncrementSec: z.number().min(1, "Must be at least 1 second"),
  maxActiveCampaigns: z.number().nullable().optional(),
  maxLeadsPerBatch: z.number().nullable().optional(),
  retryAutomation: z.boolean(),
  industryPackLimit: z.number().nullable().optional(),
  includedBalance: z.number().min(0, "Must be 0 or greater"),
  bonusValidityDays: z.number().nullable().optional(),
  displayOrder: z.number().min(0),
});

type PlanFormValues = z.infer<typeof planSchema>;

const defaultFeatures: PlanFeatures = {
  dashboardTier: "standard",
  agentCapability: "basic",
  integrations: "none",
  supportTier: "standard",
};

function paisaToInr(paisa: number): string {
  return `₹${(paisa / 100).toFixed(2)}`;
}

const parseNullableNumber = (v: unknown): number | null => {
  if (v === "" || v === null || v === undefined) return null;
  const num = Number(v);
  return Number.isNaN(num) ? null : num;
};

export default function AdminPlansPage() {
  const qc = useQueryClient();
  const { data: plans, isLoading, isFetching } = useAdminPlans();
  const createMutation = useCreatePlan();

  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [showForm, setShowForm] = useState(false);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreatePlanInput }) =>
      adminPlansApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_PLANS.all });
      if (editPlan) {
        qc.invalidateQueries({
          queryKey: QUERY_KEYS.ADMIN_PLANS.detail(editPlan.id),
        });
      }
      toast.success("Plan updated successfully");
      setShowForm(false);
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      slug: "",
      onboardingFee: 0,
      perMinuteRate: 0,
      billingMinimumSec: 60,
      billingIncrementSec: 30,
      includedBalance: 0,
      retryAutomation: false,
      displayOrder: 0,
      maxActiveCampaigns: null,
      maxLeadsPerBatch: null,
      industryPackLimit: null,
      bonusValidityDays: null,
    },
  });

  const openCreate = () => {
    setEditPlan(null);
    reset({
      name: "",
      slug: "",
      onboardingFee: 0,
      perMinuteRate: 0,
      billingMinimumSec: 60,
      billingIncrementSec: 30,
      includedBalance: 0,
      retryAutomation: false,
      displayOrder: 0,
      maxActiveCampaigns: null,
      maxLeadsPerBatch: null,
      industryPackLimit: null,
      bonusValidityDays: null,
    });
    setShowForm(true);
  };

  const openEdit = (plan: Plan) => {
    setEditPlan(plan);
    reset({
      name: plan.name,
      slug: plan.slug,
      onboardingFee: plan.onboardingFee,
      perMinuteRate: plan.perMinuteRate,
      billingMinimumSec: plan.billingMinimumSec,
      billingIncrementSec: plan.billingIncrementSec,
      maxActiveCampaigns: plan.maxActiveCampaigns ?? null,
      maxLeadsPerBatch: plan.maxLeadsPerBatch ?? null,
      retryAutomation: plan.retryAutomation,
      industryPackLimit: plan.industryPackLimit ?? null,
      includedBalance: plan.includedBalance,
      bonusValidityDays: plan.bonusValidityDays ?? null,
      displayOrder: plan.displayOrder,
    });
    setShowForm(true);
  };

  const onSubmit = (data: PlanFormValues) => {
    const payload: CreatePlanInput = {
      name: data.name,
      slug: data.slug,
      onboardingFee: data.onboardingFee,
      perMinuteRate: data.perMinuteRate,
      billingMinimumSec: data.billingMinimumSec,
      billingIncrementSec: data.billingIncrementSec,
      maxActiveCampaigns: data.maxActiveCampaigns ?? null,
      maxLeadsPerBatch: data.maxLeadsPerBatch ?? null,
      retryAutomation: data.retryAutomation,
      industryPackLimit: data.industryPackLimit ?? null,
      includedBalance: data.includedBalance,
      bonusValidityDays: data.bonusValidityDays ?? null,
      displayOrder: data.displayOrder,
      features: defaultFeatures,
    };

    if (editPlan) {
      updateMutation.mutate({ id: editPlan.id, data: payload });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setShowForm(false),
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Plans & Pricing
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage subscription tiers, rates, and feature gates.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <RefreshButton
            onRefresh={() =>
              qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_PLANS.all })
            }
            isRefreshing={isFetching}
          />
          <Button onClick={openCreate} className="gap-1.5 h-9 text-sm">
            <Plus size={14} /> New Plan
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border border-surface-border rounded-xl bg-surface">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Spinner className="text-error-600" />
          </div>
        ) : !plans || plans.length === 0 ? (
          <EmptyState
            icon={<CreditCard size={24} />}
            title="No plans configured"
            description="Create your first subscription plan."
          />
        ) : (
          <div className="overflow-x-auto thin-scrollbar">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-muted text-text-secondary font-semibold">
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Onboarding</th>
                  <th className="px-5 py-3 text-right">Per Minute</th>
                  <th className="px-5 py-3 text-right">Included Balance</th>
                  <th className="px-5 py-3 text-right">Max Campaigns</th>
                  <th className="px-5 py-3 text-right">Retry</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-subtle font-medium text-text-primary">
                {plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="hover:bg-surface-muted/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold">{plan.name}</p>
                      <p className="text-xs text-text-placeholder font-mono">
                        {plan.slug}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={plan.isActive ? "success" : "gray"}
                        dot={plan.isActive}
                      >
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right font-mono">
                      {paisaToInr(plan.onboardingFee)}
                    </td>
                    <td className="px-5 py-4 text-right font-mono">
                      {paisaToInr(plan.perMinuteRate)}/min
                    </td>
                    <td className="px-5 py-4 text-right font-mono">
                      {paisaToInr(plan.includedBalance)}
                    </td>
                    <td className="px-5 py-4 text-right font-mono">
                      {plan.maxActiveCampaigns ?? "∞"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {plan.retryAutomation ? (
                        <ToggleRight size={18} className="text-brand-600" />
                      ) : (
                        <ToggleLeft
                          size={18}
                          className="text-text-placeholder"
                        />
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => openEdit(plan)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-error-600 hover:text-error-500 transition-colors cursor-pointer"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editPlan ? "Edit Plan" : "Create Plan"}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Plan Name"
              error={errors.name?.message}
              {...register("name")}
              placeholder="e.g. Growth"
            />
            <Input
              label="Slug"
              error={errors.slug?.message}
              {...register("slug")}
              placeholder="e.g. growth"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Onboarding Fee (paisa)"
              type="number"
              error={errors.onboardingFee?.message}
              {...register("onboardingFee", { valueAsNumber: true })}
            />
            <Input
              label="Per Minute Rate (paisa)"
              type="number"
              error={errors.perMinuteRate?.message}
              {...register("perMinuteRate", { valueAsNumber: true })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Billing Min (sec)"
              type="number"
              error={errors.billingMinimumSec?.message}
              {...register("billingMinimumSec", { valueAsNumber: true })}
            />
            <Input
              label="Billing Increment (sec)"
              type="number"
              error={errors.billingIncrementSec?.message}
              {...register("billingIncrementSec", { valueAsNumber: true })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Included Balance (paisa)"
              type="number"
              error={errors.includedBalance?.message}
              {...register("includedBalance", { valueAsNumber: true })}
            />
            <Input
              label="Max Active Campaigns"
              type="number"
              {...register("maxActiveCampaigns", {
                setValueAs: parseNullableNumber,
              })}
              placeholder="Unlimited"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Leads/Batch"
              type="number"
              {...register("maxLeadsPerBatch", {
                setValueAs: parseNullableNumber,
              })}
              placeholder="Unlimited"
            />
            <Input
              label="Industry Pack Limit"
              type="number"
              {...register("industryPackLimit", {
                setValueAs: parseNullableNumber,
              })}
              placeholder="Unlimited"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Bonus Validity (days)"
              type="number"
              {...register("bonusValidityDays", {
                setValueAs: parseNullableNumber,
              })}
              placeholder="None"
            />
            <Input
              label="Display Order"
              type="number"
              error={errors.displayOrder?.message}
              {...register("displayOrder", { valueAsNumber: true })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-surface-border"
              {...register("retryAutomation")}
            />
            Enable Retry Automation
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button size="sm" type="submit" loading={isSubmitting}>
              {editPlan ? "Save Changes" : "Create Plan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
