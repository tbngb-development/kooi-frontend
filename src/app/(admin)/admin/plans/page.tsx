"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, Controller, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreditCard,
  Plus,
  Pencil,
  Layers,
  PhoneCall,
  Lock,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";

import {
  useAdminPlans,
  useCreatePlan,
  useUpdatePlanMeta,
  useAdminPlanDetail,
} from "@/hooks/admin/useAdminPlans";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Drawer } from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { RefreshButton } from "@/components/ui/RefreshButton";
import NumberInput from "@/components/ui/NumberInput";
import { PlanVersionManager } from "@/components/admin/PlanVersionManager";
import { paisaToInr } from "@/lib/utils/formatMoney";
import type {
  Plan,
  PricingModel,
  CallingChannel,
  DashboardTier,
  AgentCapability,
  IntegrationTier,
  SupportTier,
  CreatePlanInput,
} from "@/types/plan";

// ── Zod Validation Schema ───────────────────────────────────────────────────

const planSchema = z.object({
  // Metadata Configuration
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  isActive: z.boolean(),
  displayOrder: z.number().min(0),
  description: z.string().optional(),

  // Initial Version Pricing Terms
  pricingModel: z.enum(["STANDARD", "VOLUME", "CUSTOM"]),
  onboardingFee: z.number().min(0, "Must be 0 or greater"),
  onboardingFeeOriginal: z.number().nullable().optional(),
  perMinuteRate: z.number().min(0, "Must be 0 or greater"),
  billingMinimumSec: z.number().min(1, "Must be at least 1 second"),
  billingIncrementSec: z.number().min(1, "Must be at least 1 second"),

  maxActiveCampaigns: z.number().nullable().optional(),
  maxLeadsPerBatch: z.number().nullable().optional(),
  maxAgents: z.number().nullable().optional(),
  maxTeamMembers: z.number().nullable().optional(),
  retryAutomation: z.boolean(),
  industryPackLimit: z.number().nullable().optional(),

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

  lowBalanceThreshold: z.number().min(0, "Must be 0 or greater"),
  includedBalance: z.number().min(0, "Must be 0 or greater"),
  bonusValidityDays: z.number().nullable().optional(),
});

type PlanFormValues = z.infer<typeof planSchema>;

// ── Select Configuration Options ────────────────────────────────────────────

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
  description: "",
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

function planToMetadataFormValues(plan: Plan): PlanFormValues {
  const v = plan.currentVersion;
  return {
    name: plan.name,
    slug: plan.slug,
    isActive: plan.isActive,
    displayOrder: plan.displayOrder,
    description: plan.description ?? "",
    pricingModel: v?.pricingModel ?? "STANDARD",
    onboardingFee: v?.onboardingFee ?? 0,
    onboardingFeeOriginal: v?.onboardingFeeOriginal ?? null,
    perMinuteRate: v?.perMinuteRate ?? 0,
    billingMinimumSec: v?.billingMinimumSec ?? 30,
    billingIncrementSec: v?.billingIncrementSec ?? 15,
    maxActiveCampaigns: v?.maxActiveCampaigns ?? null,
    maxLeadsPerBatch: v?.maxLeadsPerBatch ?? null,
    maxAgents: v?.maxAgents ?? null,
    maxTeamMembers: v?.maxTeamMembers ?? null,
    retryAutomation: v?.retryAutomation ?? false,
    industryPackLimit: v?.industryPackLimit ?? null,
    callingChannel: v?.callingChannel ?? "SHARED",
    brochureUpload: v?.brochureUpload ?? false,
    dashboardTier: v?.dashboardTier ?? "BASIC",
    agentCapability: v?.agentCapability ?? "BASIC",
    integrations: v?.integrations ?? "NONE",
    supportTier: v?.supportTier ?? "STANDARD",
    lowBalanceThreshold: v?.lowBalanceThreshold ?? 10000,
    includedBalance: v?.includedBalance ?? 0,
    bonusValidityDays: v?.bonusValidityDays ?? null,
  };
}

// ── Admin Plans Component ───────────────────────────────────────────────────

export default function AdminPlansPage() {
  const qc = useQueryClient();
  const { data: plans, isLoading, isFetching } = useAdminPlans();

  const createMutation = useCreatePlan();
  const updateMetaMutation = useUpdatePlanMeta();

  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [showFormDrawer, setShowFormDrawer] = useState(false);

  // Active version sliding manager states
  const [activeManagerPlanId, setActiveManagerPlanId] = useState<string | null>(
    null,
  );
  const { data: detailPlan, refetch: refetchDetail } =
    useAdminPlanDetail(activeManagerPlanId);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: DEFAULT_FORM,
  });

  // ✅ FIX: Live reactive values instead of _formValues (internal API)
  const watchedValues = useWatch({ control });

  const openCreate = () => {
    setEditPlan(null);
    reset(DEFAULT_FORM);
    setShowFormDrawer(true);
  };

  const openEdit = (plan: Plan) => {
    setEditPlan(plan);
    reset(planToMetadataFormValues(plan));
    setShowFormDrawer(true);
  };

  const closeForm = () => {
    if (isSubmitting) return;
    setShowFormDrawer(false);
    setEditPlan(null);
  };

  const onSubmit = (data: PlanFormValues) => {
    if (editPlan) {
      updateMetaMutation.mutate(
        {
          id: editPlan.id,
          data: {
            name: data.name,
            displayOrder: data.displayOrder,
            isActive: data.isActive,
            description: data.description || undefined,
          },
        },
        {
          onSuccess: () => {
            setShowFormDrawer(false);
            setEditPlan(null);
          },
        },
      );
    } else {
      const payload: CreatePlanInput = {
        name: data.name,
        slug: data.slug,
        displayOrder: data.displayOrder,
        description: data.description || undefined,
        publishImmediately: true,
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

      createMutation.mutate(payload, {
        onSuccess: () => {
          setShowFormDrawer(false);
        },
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMetaMutation.isPending;

  return (
    <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
      {/* Dynamic Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            Plans & Commercial Suites
          </h1>
          <p className="text-sm text-text-muted mt-1 font-medium">
            Manage global workspace configurations, per-minute pricing tables,
            limits, and live releases.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <RefreshButton
            onRefresh={() =>
              qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_PLANS.all })
            }
            isRefreshing={isFetching}
          />
          <Button onClick={openCreate} className="gap-1.5 shadow-sm h-9">
            <Plus size={16} strokeWidth={2.5} /> Deploy New Suite
          </Button>
        </div>
      </div>

      {/* Catalog Grid View */}
      {isLoading ? (
        <div className="py-24 flex justify-center items-center">
          <Spinner className="text-brand-600 h-10 w-10 animate-spin" />
        </div>
      ) : !plans || plans.length === 0 ? (
        <EmptyState
          icon={<CreditCard size={28} className="text-text-placeholder" />}
          title="No subscription packages found"
          description="Build out and activate your first billing tier to get started."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...plans]
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((plan) => {
              const v = plan.currentVersion;
              return (
                <div
                  key={plan.id}
                  className="bg-surface rounded-2xl border border-surface-border shadow-sm flex flex-col hover:shadow-md hover:border-neutral-300 transition-all duration-normal ease-out relative overflow-hidden"
                >
                  {/* Active/Inactive badge */}
                  <div className="absolute top-6 right-4 z-10">
                    <Badge
                      variant={plan.isActive ? "success" : "gray"}
                      dot={plan.isActive}
                    >
                      {plan.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </div>

                  {/* Header identity */}
                  <div className="p-6 pb-4 border-b border-surface-subtle bg-surface-subtle/40">
                    <h3 className="text-lg font-extrabold text-text-primary capitalize mt-1.5">
                      {plan.name}
                    </h3>
                    <code className="text-xs font-mono text-text-placeholder mt-0.5 block leading-tight">
                      {plan.slug}
                    </code>
                    {plan.description && (
                      <p className="text-sm text-text-secondary line-clamp-2 mt-2 font-medium">
                        {plan.description}
                      </p>
                    )}
                  </div>

                  {/* Pricing Suite details */}
                  <div className="p-6 flex-1 space-y-4">
                    {v ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            Subscription Cost
                          </span>
                          <div className="flex flex-col mt-0.5">
                            {v.onboardingFeeOriginal != null &&
                              v.onboardingFeeOriginal > v.onboardingFee && (
                                <s className="text-xs text-text-placeholder font-mono">
                                  {paisaToInr(v.onboardingFeeOriginal)}
                                </s>
                              )}
                            <span className="text-base font-extrabold text-text-primary font-mono leading-none">
                              {paisaToInr(v.onboardingFee)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            Minute Rate
                          </span>
                          <span className="text-base font-extrabold text-brand-700 font-mono mt-0.5 leading-none">
                            {paisaToInr(v.perMinuteRate)}/min
                          </span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            Included wallet
                          </span>
                          <span className="text-sm font-semibold text-text-primary font-mono mt-0.5">
                            {paisaToInr(v.includedBalance)}
                          </span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            Pricing Model
                          </span>
                          <div className="mt-0.5">
                            <Badge
                              variant={
                                v.pricingModel === "CUSTOM"
                                  ? "purple"
                                  : v.pricingModel === "VOLUME"
                                    ? "blue"
                                    : "gray"
                              }
                            >
                              {v.pricingModel}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 py-4 text-sm text-text-placeholder italic font-medium">
                        No active commercial versions set.
                      </div>
                    )}

                    {/* Feature constraints */}
                    {v && (
                      <div className="pt-4 border-t border-surface-subtle space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-text-secondary">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Lock size={13} className="text-text-placeholder" />{" "}
                            Campaigns
                          </span>
                          <span className="font-mono font-bold text-text-primary">
                            {v.maxActiveCampaigns ?? "∞"} Limit
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-text-secondary">
                          <span className="flex items-center gap-1.5 font-medium">
                            <PhoneCall
                              size={13}
                              className="text-text-placeholder"
                            />{" "}
                            Agents Limit
                          </span>
                          <span className="font-mono font-bold text-text-primary">
                            {v.maxAgents ?? "∞"} Limit
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-text-secondary">
                          <span className="flex items-center gap-1.5 font-medium">
                            <ShieldAlert
                              size={13}
                              className="text-text-placeholder"
                            />{" "}
                            Retry Automation
                          </span>
                          <span className="font-semibold text-text-primary">
                            {v.retryAutomation ? "Active" : "Disabled"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-text-secondary">
                          <span className="flex items-center gap-1.5 font-medium">
                            <MessageSquare
                              size={13}
                              className="text-text-placeholder"
                            />{" "}
                            Document upload
                          </span>
                          <span className="font-semibold text-text-primary">
                            {v.brochureUpload ? "Active" : "Disabled"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card action footer */}
                  <div className="p-4 bg-surface-muted border-t border-surface-subtle flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(plan)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl bg-surface border border-surface-border text-text-secondary hover:bg-surface-hover hover:border-neutral-300 transition-all cursor-pointer shadow-xs"
                    >
                      <Pencil size={12} /> Metadata
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveManagerPlanId(plan.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl bg-surface border border-surface-border text-secondary-700 hover:bg-secondary-50 hover:border-secondary-200 transition-all cursor-pointer shadow-xs"
                    >
                      <Layers size={12} /> Configure Release
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Metadata Configuration Slide Drawer */}
      <Drawer
        isOpen={showFormDrawer}
        onClose={closeForm}
        title={
          editPlan
            ? `Configure Metadata — ${editPlan.name}`
            : "Deploy Plan Package"
        }
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Metadata Section */}
          <Section title="Plan Metadata Specifications">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Plan Display Name"
                error={errors.name?.message}
                {...register("name")}
                placeholder="e.g. Growth"
              />
              <Input
                label="Slug ID (Unique reference)"
                error={errors.slug?.message}
                {...register("slug")}
                disabled={!!editPlan}
                placeholder="e.g. growth"
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-base font-medium text-text-secondary">
                  Catalogue Display Order
                </label>
                <Controller
                  name="displayOrder"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      value={field.value}
                      onChange={(val) =>
                        field.onChange(val === "" ? 0 : Number(val))
                      }
                      min={0}
                    />
                  )}
                />
              </div>
              <Input
                label="Plan Summary Description"
                error={errors.description?.message}
                {...register("description")}
                placeholder="Write plan descriptions..."
              />
            </div>
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 text-base font-semibold text-text-secondary cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-surface-border text-brand-600 focus:ring-brand-500 h-4.5 w-4.5"
                  {...register("isActive")}
                />
                Activate & Publish within catalog
              </label>
            </div>
          </Section>

          {/* Pricing terms - only during creation */}
          {!editPlan && (
            <>
              <Section title="Draft Version Pricing Rules (Paisa)">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Controller
                    name="pricingModel"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Pricing Scheme"
                        options={PRICING_MODEL_OPTIONS}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        error={errors.pricingModel?.message}
                      />
                    )}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-base font-medium text-text-secondary">
                      Onboarding Fee (Paisa)
                    </label>
                    <Controller
                      name="onboardingFee"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          value={field.value}
                          onChange={(val) =>
                            field.onChange(val === "" ? 0 : Number(val))
                          }
                          step="10000"
                          min={0}
                        />
                      )}
                    />
                    <span className="text-xs font-mono font-semibold text-brand-700 mt-1">
                      {paisaToInr(watchedValues.onboardingFee ?? 0)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-base font-medium text-text-secondary">
                      Onboarding MSRP original (Paisa)
                    </label>
                    <Controller
                      name="onboardingFeeOriginal"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          value={field.value ?? ""}
                          onChange={(val) =>
                            field.onChange(val === "" ? null : Number(val))
                          }
                          step="10000"
                          min={0}
                        />
                      )}
                    />
                    <span className="text-xs font-mono font-semibold text-brand-700 mt-1">
                      {watchedValues.onboardingFeeOriginal
                        ? paisaToInr(watchedValues.onboardingFeeOriginal)
                        : "No MSRP set"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-base font-medium text-text-secondary">
                      AI Voice minute Rate (Paisa)
                    </label>
                    <Controller
                      name="perMinuteRate"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          value={field.value}
                          onChange={(val) =>
                            field.onChange(val === "" ? 0 : Number(val))
                          }
                          step="50"
                          min={0}
                        />
                      )}
                    />
                    <span className="text-xs font-mono font-semibold text-brand-700 mt-1">
                      {paisaToInr(watchedValues.perMinuteRate ?? 0)}/min
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-base font-medium text-text-secondary">
                      Included Wallet Balance (Paisa)
                    </label>
                    <Controller
                      name="includedBalance"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          value={field.value}
                          onChange={(val) =>
                            field.onChange(val === "" ? 0 : Number(val))
                          }
                          step="10000"
                          min={0}
                        />
                      )}
                    />
                    <span className="text-xs font-mono font-semibold text-brand-700 mt-1">
                      {paisaToInr(watchedValues.includedBalance ?? 0)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-base font-medium text-text-secondary">
                      Billing Minimum (Seconds)
                    </label>
                    <Controller
                      name="billingMinimumSec"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          value={field.value}
                          onChange={(val) =>
                            field.onChange(val === "" ? 30 : Number(val))
                          }
                          min={1}
                        />
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-base font-medium text-text-secondary">
                      Billing Increment Cadence (Seconds)
                    </label>
                    <Controller
                      name="billingIncrementSec"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          value={field.value}
                          onChange={(val) =>
                            field.onChange(val === "" ? 15 : Number(val))
                          }
                          min={1}
                        />
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-base font-medium text-text-secondary">
                      Low Balance Threshold (Paisa)
                    </label>
                    <Controller
                      name="lowBalanceThreshold"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          value={field.value}
                          onChange={(val) =>
                            field.onChange(val === "" ? 10000 : Number(val))
                          }
                          step="5000"
                          min={0}
                        />
                      )}
                    />
                    <span className="text-xs font-mono font-semibold text-brand-700 mt-1">
                      {paisaToInr(watchedValues.lowBalanceThreshold ?? 0)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-base font-medium text-text-secondary">
                      Bonus Validity Days
                    </label>
                    <Controller
                      name="bonusValidityDays"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          value={field.value ?? ""}
                          onChange={(val) =>
                            field.onChange(val === "" ? null : Number(val))
                          }
                          placeholder="Unlimited"
                          min={0}
                        />
                      )}
                    />
                  </div>
                </div>
              </Section>

              {/* Gating Limits */}
              <Section title="Workspace Gating Limits">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-base font-medium text-text-secondary">
                      Max Campaigns
                    </label>
                    <Controller
                      name="maxActiveCampaigns"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          value={field.value ?? ""}
                          onChange={(val) =>
                            field.onChange(val === "" ? null : Number(val))
                          }
                          placeholder="Unlimited"
                        />
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-base font-medium text-text-secondary">
                      Max Batch upload
                    </label>
                    <Controller
                      name="maxLeadsPerBatch"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          value={field.value ?? ""}
                          onChange={(val) =>
                            field.onChange(val === "" ? null : Number(val))
                          }
                          placeholder="Unlimited"
                        />
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-base font-medium text-text-secondary">
                      Max Assistants
                    </label>
                    <Controller
                      name="maxAgents"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          value={field.value ?? ""}
                          onChange={(val) =>
                            field.onChange(val === "" ? null : Number(val))
                          }
                          placeholder="Unlimited"
                        />
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-base font-medium text-text-secondary">
                      Max Workspace Members
                    </label>
                    <Controller
                      name="maxTeamMembers"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          value={field.value ?? ""}
                          onChange={(val) =>
                            field.onChange(val === "" ? null : Number(val))
                          }
                          placeholder="Unlimited"
                        />
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-base font-medium text-text-secondary">
                      Industry Pack Limit
                    </label>
                    <Controller
                      name="industryPackLimit"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          value={field.value ?? ""}
                          onChange={(val) =>
                            field.onChange(val === "" ? null : Number(val))
                          }
                          placeholder="Unlimited"
                        />
                      )}
                    />
                  </div>
                </div>
              </Section>

              {/* Feature Gating */}
              <Section title="Workspace Capability Gating">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Controller
                    name="callingChannel"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Channel Route Mode"
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
                        label="Dashboard Interface Mode"
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
                        label="Voice Core Capability Engine"
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
                        label="CRM Integrations Scope"
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
                        label="Support Escalation Tier"
                        options={SUPPORT_TIER_OPTIONS}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    )}
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <label className="flex items-center gap-2.5 text-base font-semibold text-text-secondary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-surface-border text-brand-600 focus:ring-brand-500 h-4.5 w-4.5"
                      {...register("retryAutomation")}
                    />
                    Outbound Retry Automation Rules
                  </label>
                  <label className="flex items-center gap-2.5 text-base font-semibold text-text-secondary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-surface-border text-brand-600 focus:ring-brand-500 h-4.5 w-4.5"
                      {...register("brochureUpload")}
                    />
                    AI Vector PDF Brochure Synthesis
                  </label>
                </div>
              </Section>
            </>
          )}

          {/* Sticky drawer footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-border bg-surface sticky bottom-0 z-10 pb-2">
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={closeForm}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button size="md" type="submit" loading={isSubmitting}>
              {editPlan ? "Apply Changes" : "Deploy Plan Package"}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Plan Versioning Slide Drawer */}
      <Drawer
        isOpen={!!activeManagerPlanId}
        onClose={() => setActiveManagerPlanId(null)}
        title={
          detailPlan
            ? `Release Timelines — ${detailPlan.name}`
            : "Version Timelines"
        }
        size="lg"
      >
        {detailPlan ? (
          <div className="py-1">
            <PlanVersionManager plan={detailPlan} onRefresh={refetchDetail} />
          </div>
        ) : (
          <div className="py-24 flex justify-center items-center">
            <Spinner className="text-secondary-600 h-8 w-8 animate-spin" />
          </div>
        )}
      </Drawer>
    </div>
  );
}

// ── Section Helper Component ────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 pt-4 first:pt-0">
      <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted border-l-4 border-brand-500 pl-3 leading-none">
        {title}
      </h3>
      <div className="bg-surface p-5 rounded-xl border border-surface-border/80 shadow-xs space-y-4">
        {children}
      </div>
    </section>
  );
}
