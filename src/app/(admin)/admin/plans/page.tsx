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
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { RefreshButton } from "@/components/ui/RefreshButton";
import {
  CreditCard,
  Plus,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { paisaToInr } from "@/constants/config/wallet.config";
import type {
  AgentCapability,
  CallingChannel,
  CreatePlanInput,
  DashboardTier,
  IntegrationTier,
  Plan,
  PricingModel,
  SupportTier,
} from "@/types/plan";

// ── Fixed Zod Schema & Types ────────────────────────────────────────────────

const nullableNumber = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((v): number | null => {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  });

const planSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  isActive: z.boolean(),
  displayOrder: z.coerce.number().min(0),

  pricingModel: z.enum(["STANDARD", "VOLUME", "CUSTOM"]),
  onboardingFee: z.coerce.number().min(0, "Must be 0 or greater"),
  onboardingFeeOriginal: nullableNumber,
  perMinuteRate: z.coerce.number().min(0, "Must be 0 or greater"),
  billingMinimumSec: z.coerce.number().min(1, "Must be at least 1 second"),
  billingIncrementSec: z.coerce.number().min(1, "Must be at least 1 second"),

  maxActiveCampaigns: nullableNumber,
  maxLeadsPerBatch: nullableNumber,
  maxAgents: nullableNumber,
  maxTeamMembers: nullableNumber,
  retryAutomation: z.boolean(),
  industryPackLimit: nullableNumber,

  callingChannel: z.enum(["SHARED", "DEDICATED", "DEDICATED_WITH_NUMBER"]),
  brochureUpload: z.boolean(),

  dashboardTier: z.enum(["BASIC", "STANDARD", "ADVANCED", "CUSTOM"]),
  agentCapability: z.enum([
    "BASIC",
    "BASIC_KNOWLEDGE",
    "ADVANCED_KNOWLEDGE",
    "CUSTOM",
  ]),
  integrations: z.enum(["NONE", "BASIC", "API_SELECTED", "CUSTOM"]),
  supportTier: z.enum(["STANDARD", "PRIORITY", "SLA"]),

  lowBalanceThreshold: z.coerce.number().min(0, "Must be 0 or greater"),

  includedBalance: z.coerce.number().min(0, "Must be 0 or greater"),
  bonusValidityDays: nullableNumber,
});

type PlanFormValues = z.infer<typeof planSchema>;

// ── Select Options ──────────────────────────────────────────────────────────

const PRICING_MODEL_OPTIONS = [
  { value: "STANDARD", label: "Standard" },
  { value: "VOLUME", label: "Volume" },
  { value: "CUSTOM", label: "Custom (Enterprise)" },
];

const CALLING_CHANNEL_OPTIONS = [
  { value: "SHARED", label: "Shared" },
  { value: "DEDICATED", label: "Dedicated" },
  { value: "DEDICATED_WITH_NUMBER", label: "Dedicated + Number" },
];

const DASHBOARD_TIER_OPTIONS = [
  { value: "BASIC", label: "Basic" },
  { value: "STANDARD", label: "Standard" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "CUSTOM", label: "Custom" },
];

const AGENT_CAPABILITY_OPTIONS = [
  { value: "BASIC", label: "Basic" },
  { value: "BASIC_KNOWLEDGE", label: "Basic + Knowledge" },
  { value: "ADVANCED_KNOWLEDGE", label: "Advanced Knowledge" },
  { value: "CUSTOM", label: "Custom" },
];

const INTEGRATION_OPTIONS = [
  { value: "NONE", label: "None" },
  { value: "BASIC", label: "Basic" },
  { value: "API_SELECTED", label: "API + Selected" },
  { value: "CUSTOM", label: "Custom" },
];

const SUPPORT_TIER_OPTIONS = [
  { value: "STANDARD", label: "Standard" },
  { value: "PRIORITY", label: "Priority" },
  { value: "SLA", label: "SLA" },
];

const DEFAULT_FORM: PlanFormValues = {
  name: "",
  slug: "",
  isActive: true,
  displayOrder: 0,
  pricingModel: "STANDARD",
  onboardingFee: 0,
  onboardingFeeOriginal: null,
  perMinuteRate: 0,
  billingMinimumSec: 30,
  billingIncrementSec: 15,
  maxActiveCampaigns: null,
  maxLeadsPerBatch: null,
  maxAgents: null,
  maxTeamMembers: null,
  retryAutomation: false,
  industryPackLimit: null,
  callingChannel: "SHARED",
  brochureUpload: false,
  dashboardTier: "BASIC",
  agentCapability: "BASIC",
  integrations: "NONE",
  supportTier: "STANDARD",
  lowBalanceThreshold: 10000,
  includedBalance: 0,
  bonusValidityDays: null,
};

function planToFormValues(plan: Plan): PlanFormValues {
  return {
    name: plan.name,
    slug: plan.slug,
    isActive: plan.isActive,
    displayOrder: plan.displayOrder,
    pricingModel: plan.pricingModel,
    onboardingFee: plan.onboardingFee,
    onboardingFeeOriginal: plan.onboardingFeeOriginal,
    perMinuteRate: plan.perMinuteRate,
    billingMinimumSec: plan.billingMinimumSec,
    billingIncrementSec: plan.billingIncrementSec,
    maxActiveCampaigns: plan.maxActiveCampaigns,
    maxLeadsPerBatch: plan.maxLeadsPerBatch,
    maxAgents: plan.maxAgents,
    maxTeamMembers: plan.maxTeamMembers,
    retryAutomation: plan.retryAutomation,
    industryPackLimit: plan.industryPackLimit,
    callingChannel: plan.callingChannel,
    brochureUpload: plan.brochureUpload,
    dashboardTier: plan.dashboardTier,
    agentCapability: plan.agentCapability,
    integrations: plan.integrations,
    supportTier: plan.supportTier,
    lowBalanceThreshold: plan.lowBalanceThreshold,
    includedBalance: plan.includedBalance,
    bonusValidityDays: plan.bonusValidityDays,
  };
}

function formToPayload(data: PlanFormValues): CreatePlanInput {
  return {
    name: data.name,
    slug: data.slug,
    isActive: data.isActive,
    displayOrder: data.displayOrder,
    pricingModel: data.pricingModel as PricingModel,
    onboardingFee: data.onboardingFee,
    onboardingFeeOriginal: data.onboardingFeeOriginal,
    perMinuteRate: data.perMinuteRate,
    billingMinimumSec: data.billingMinimumSec,
    billingIncrementSec: data.billingIncrementSec,
    maxActiveCampaigns: data.maxActiveCampaigns,
    maxLeadsPerBatch: data.maxLeadsPerBatch,
    maxAgents: data.maxAgents,
    maxTeamMembers: data.maxTeamMembers,
    retryAutomation: data.retryAutomation,
    industryPackLimit: data.industryPackLimit,
    callingChannel: data.callingChannel as CallingChannel,
    brochureUpload: data.brochureUpload,
    dashboardTier: data.dashboardTier as DashboardTier,
    agentCapability: data.agentCapability as AgentCapability,
    integrations: data.integrations as IntegrationTier,
    supportTier: data.supportTier as SupportTier,
    lowBalanceThreshold: data.lowBalanceThreshold,
    includedBalance: data.includedBalance,
    bonusValidityDays: data.bonusValidityDays,
  };
}

// ── Component ───────────────────────────────────────────────────────────────

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
      setEditPlan(null);
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });

  // Let React Hook Form infer types from the zodResolver
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: DEFAULT_FORM,
  });

  const openCreate = () => {
    setEditPlan(null);
    reset(DEFAULT_FORM);
    setShowForm(true);
  };

  const openEdit = (plan: Plan) => {
    setEditPlan(plan);
    reset(planToFormValues(plan));
    setShowForm(true);
  };

  const closeForm = () => {
    if (isSubmitting) return;
    setShowForm(false);
    setEditPlan(null);
  };

  const onSubmit = (data: PlanFormValues) => {
    const payload = formToPayload(data);

    if (editPlan) {
      updateMutation.mutate({ id: editPlan.id, data: payload });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setShowForm(false);
          setEditPlan(null);
        },
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Plans & Pricing
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage subscription tiers, rates, limits, and feature gates.
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

      {/* Table */}
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
                  <th className="px-5 py-3">Model</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Onboarding</th>
                  <th className="px-5 py-3 text-right">Rate</th>
                  <th className="px-5 py-3 text-right">Balance</th>
                  <th className="px-5 py-3 text-right">Agents</th>
                  <th className="px-5 py-3 text-right">Team</th>
                  <th className="px-5 py-3 text-right">Campaigns</th>
                  <th className="px-5 py-3 text-right">Threshold</th>
                  <th className="px-5 py-3 text-center">Retry</th>
                  <th className="px-5 py-3 text-center">Brochure</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-subtle font-medium text-text-primary">
                {[...plans]
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((plan) => (
                    <tr
                      key={plan.id}
                      className="hover:bg-surface-muted/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold capitalize">{plan.name}</p>
                        <p className="text-xs text-text-placeholder font-mono">
                          {plan.slug}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant={
                            plan.pricingModel === "CUSTOM"
                              ? "purple"
                              : plan.pricingModel === "VOLUME"
                                ? "blue"
                                : "gray"
                          }
                        >
                          {plan.pricingModel}
                        </Badge>
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
                        <div className="flex flex-col items-end gap-0.5">
                          {plan.onboardingFeeOriginal != null &&
                            plan.onboardingFeeOriginal > plan.onboardingFee && (
                              <s className="text-[10px] text-text-placeholder">
                                {paisaToInr(plan.onboardingFeeOriginal)}
                              </s>
                            )}
                          <span>{paisaToInr(plan.onboardingFee)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-mono">
                        {paisaToInr(plan.perMinuteRate)}/min
                      </td>
                      <td className="px-5 py-4 text-right font-mono">
                        {paisaToInr(plan.includedBalance)}
                      </td>
                      <td className="px-5 py-4 text-right font-mono">
                        {plan.maxAgents ?? "∞"}
                      </td>
                      <td className="px-5 py-4 text-right font-mono">
                        {plan.maxTeamMembers ?? "∞"}
                      </td>
                      <td className="px-5 py-4 text-right font-mono">
                        {plan.maxActiveCampaigns ?? "∞"}
                      </td>
                      <td className="px-5 py-4 text-right font-mono">
                        {paisaToInr(plan.lowBalanceThreshold)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {plan.retryAutomation ? (
                          <ToggleRight
                            size={18}
                            className="text-brand-600 inline-block"
                          />
                        ) : (
                          <ToggleLeft
                            size={18}
                            className="text-text-placeholder inline-block"
                          />
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {plan.brochureUpload ? (
                          <ToggleRight
                            size={18}
                            className="text-brand-600 inline-block"
                          />
                        ) : (
                          <ToggleLeft
                            size={18}
                            className="text-text-placeholder inline-block"
                          />
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editPlan ? `Edit Plan — ${editPlan.name}` : "Create Plan"}
        size="xl"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 max-h-[70vh] overflow-y-auto thin-scrollbar pr-1"
        >
          {/* Identity */}
          <Section title="Identity">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <Input
                label="Display Order"
                type="number"
                error={errors.displayOrder?.message}
                {...register("displayOrder")}
              />
              <Controller
                name="pricingModel"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Pricing Model"
                    options={PRICING_MODEL_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    error={errors.pricingModel?.message}
                  />
                )}
              />
            </div>
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-surface-border"
                  {...register("isActive")}
                />
                Active (visible to tenants)
              </label>
            </div>
          </Section>

          {/* Pricing */}
          <Section title="Pricing (paisa)">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Onboarding Fee"
                type="number"
                error={errors.onboardingFee?.message}
                {...register("onboardingFee")}
              />
              <Input
                label="Onboarding Fee Original (MSRP)"
                type="number"
                error={errors.onboardingFeeOriginal?.message}
                {...register("onboardingFeeOriginal")}
                placeholder="Optional strikethrough"
              />
              <Input
                label="Per Minute Rate"
                type="number"
                error={errors.perMinuteRate?.message}
                {...register("perMinuteRate")}
              />
              <Input
                label="Included Balance"
                type="number"
                error={errors.includedBalance?.message}
                {...register("includedBalance")}
              />
              <Input
                label="Billing Minimum (sec)"
                type="number"
                error={errors.billingMinimumSec?.message}
                {...register("billingMinimumSec")}
              />
              <Input
                label="Billing Increment (sec)"
                type="number"
                error={errors.billingIncrementSec?.message}
                {...register("billingIncrementSec")}
              />
              <Input
                label="Bonus Validity (days)"
                type="number"
                error={errors.bonusValidityDays?.message}
                {...register("bonusValidityDays")}
                placeholder="None"
              />
              <Input
                label="Low Balance Threshold"
                type="number"
                error={errors.lowBalanceThreshold?.message}
                {...register("lowBalanceThreshold")}
              />
            </div>
          </Section>

          {/* Limits */}
          <Section title="Limits (empty = unlimited)">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Max Active Campaigns"
                type="number"
                {...register("maxActiveCampaigns")}
                placeholder="Unlimited"
              />
              <Input
                label="Max Leads / Batch"
                type="number"
                {...register("maxLeadsPerBatch")}
                placeholder="Unlimited"
              />
              <Input
                label="Max Agents"
                type="number"
                {...register("maxAgents")}
                placeholder="Unlimited"
              />
              <Input
                label="Max Team Members (incl. admin)"
                type="number"
                {...register("maxTeamMembers")}
                placeholder="Unlimited"
              />
              <Input
                label="Industry Pack Limit"
                type="number"
                {...register("industryPackLimit")}
                placeholder="Unlimited"
              />
            </div>
          </Section>

          {/* Capabilities & Tiers */}
          <Section title="Capabilities & Tiers">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="callingChannel"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Calling Channel"
                    options={CALLING_CHANNEL_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                )}
              />
              <Controller
                name="dashboardTier"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Dashboard Tier"
                    options={DASHBOARD_TIER_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                )}
              />
              <Controller
                name="agentCapability"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Agent Capability"
                    options={AGENT_CAPABILITY_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                )}
              />
              <Controller
                name="integrations"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Integrations"
                    options={INTEGRATION_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                )}
              />
              <Controller
                name="supportTier"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Support Tier"
                    options={SUPPORT_TIER_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                )}
              />
            </div>

            <div className="flex flex-wrap gap-5 pt-2">
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-surface-border"
                  {...register("retryAutomation")}
                />
                Retry Automation
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-surface-border"
                  {...register("brochureUpload")}
                />
                Brochure Upload
              </label>
            </div>
          </Section>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-surface-border sticky bottom-0 bg-surface pb-1">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={closeForm}
              disabled={isSubmitting}
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-text-placeholder">
        {title}
      </h3>
      {children}
    </section>
  );
}
