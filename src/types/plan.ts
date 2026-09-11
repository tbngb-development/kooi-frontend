// ── Enums / Union Types ──────────────────────────────────────────────────────

export type PlanVersionStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type PricingModel = "STANDARD" | "VOLUME" | "CUSTOM";

export type CallingChannel = "SHARED" | "DEDICATED" | "DEDICATED_WITH_NUMBER";

export type DashboardTier = "BASIC" | "STANDARD" | "ADVANCED" | "CUSTOM";

export type AgentCapability =
  | "BASIC"
  | "BASIC_KNOWLEDGE"
  | "ADVANCED_KNOWLEDGE"
  | "CUSTOM";

export type IntegrationTier = "NONE" | "BASIC" | "API_SELECTED" | "CUSTOM";

export type SupportTier = "STANDARD" | "PRIORITY" | "SLA";

export type TenantPlanStatus =
  | "PENDING_PAYMENT"
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED";

// ── Plan Version (all commercial data lives here now) ────────────────────────

export interface PlanVersion {
  id: string;
  planId: string;
  version: number;
  status: PlanVersionStatus;
  currency: string;
  pricingModel: PricingModel;

  // Pricing (integer paisa)
  onboardingFee: number;
  onboardingFeeOriginal: number | null;
  perMinuteRate: number;
  billingMinimumSec: number;
  billingIncrementSec: number;

  // Limits (null = unlimited)
  maxActiveCampaigns: number | null;
  maxLeadsPerBatch: number | null;
  maxAgents: number | null;
  maxTeamMembers: number | null;
  retryAutomation: boolean;
  industryPackLimit: number | null;

  // Capabilities
  callingChannel: CallingChannel;
  brochureUpload: boolean;

  // Feature tiers
  dashboardTier: DashboardTier;
  agentCapability: AgentCapability;
  integrations: IntegrationTier;
  supportTier: SupportTier;

  // Wallet / bonus
  lowBalanceThreshold: number;
  includedBalance: number;
  bonusValidityDays: number | null;

  // Lifecycle timestamps
  publishedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Plan (catalogue item — commercial data nested in currentVersion) ─────────

export interface Plan {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
  description: string | null;
  /** Null when no version has been published yet */
  currentVersion: PlanVersion | null;
  createdAt: string;
  updatedAt: string;
}

/** Admin detail view includes the full version history */
export interface PlanWithVersions extends Plan {
  versions: PlanVersion[];
}

// ── Effective Terms (tenant's active commercial snapshot) ────────────────────

/**
 * Merged result of PlanVersion + any enterprise overrides.
 * This is the single source of truth for feature-gating and billing.
 */
export interface EffectivePlanTerms extends PlanVersion {
  planName: string;
  planSlug: string;
  planVersionId: string;
  /** True when enterprise overrides have been applied */
  isCustomPriced: boolean;
}

// ── Tenant Plan ──────────────────────────────────────────────────────────────

export interface TenantPlan {
  tenantId: string;
  status: TenantPlanStatus;
  planId: string;
  planVersionId: string;
  effectiveTerms: EffectivePlanTerms;
  overrides: {
    onboardingFeeOverride: number | null;
    perMinuteRateOverride: number | null;
  };
  activatedAt: string | null;
  bonusExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Admin Inputs ─────────────────────────────────────────────────────────────

/**
 * Creates a plan AND its v1 PlanVersion in one call.
 * Commercial fields are forwarded to the version.
 */
export interface CreatePlanInput {
  name: string;
  slug: string;
  displayOrder?: number;
  description?: string;
  /** If false the initial version stays as DRAFT */
  publishImmediately?: boolean;

  // ── v1 commercial fields ──
  pricingModel?: PricingModel;
  onboardingFee: number;
  onboardingFeeOriginal?: number | null;
  perMinuteRate: number;
  billingMinimumSec: number;
  billingIncrementSec: number;
  maxActiveCampaigns?: number | null;
  maxLeadsPerBatch?: number | null;
  maxAgents?: number | null;
  maxTeamMembers?: number | null;
  retryAutomation?: boolean;
  industryPackLimit?: number | null;
  callingChannel?: CallingChannel;
  brochureUpload?: boolean;
  dashboardTier?: DashboardTier;
  agentCapability?: AgentCapability;
  integrations?: IntegrationTier;
  supportTier?: SupportTier;
  lowBalanceThreshold?: number;
  includedBalance: number;
  bonusValidityDays?: number | null;
}

/**
 * Metadata-only update. Commercial fields are NO LONGER accepted here —
 * create a new PlanVersion instead.
 */
export interface UpdatePlanMetaInput {
  name?: string;
  displayOrder?: number;
  isActive?: boolean;
  description?: string;
}

/** Creates a new DRAFT version under an existing plan */
export interface CreatePlanVersionInput {
  pricingModel?: PricingModel;
  onboardingFee: number;
  onboardingFeeOriginal?: number | null;
  perMinuteRate: number;
  billingMinimumSec: number;
  billingIncrementSec: number;
  maxActiveCampaigns?: number | null;
  maxLeadsPerBatch?: number | null;
  maxAgents?: number | null;
  maxTeamMembers?: number | null;
  retryAutomation?: boolean;
  industryPackLimit?: number | null;
  callingChannel?: CallingChannel;
  brochureUpload?: boolean;
  dashboardTier?: DashboardTier;
  agentCapability?: AgentCapability;
  integrations?: IntegrationTier;
  supportTier?: SupportTier;
  lowBalanceThreshold?: number;
  includedBalance: number;
  bonusValidityDays?: number | null;
}

/** Enterprise per-tenant commercial overrides */
export interface TenantPlanOverridesInput {
  onboardingFeeOverride: number | null;
  perMinuteRateOverride: number | null;
}

// ── Plan Change (Upgrade / Downgrade) ──────────────────────────────────────

export type PlanChangeDirection = "UPGRADE" | "DOWNGRADE" | "LATERAL";

export interface ChangePlanRequest {
  newPlanId: string;
}

export interface ChangePlanResponse {
  tenantId: string;
  previousPlanVersionId: string;
  newPlanVersionId: string;
  direction: PlanChangeDirection;
  /** Integer paisa — the additional amount the tenant must pay (0 for downgrades) */
  onboardingFeeDifference: number;
  /** True when the new plan's fee is higher and payment is needed */
  requiresPayment: boolean;
  /** True when the plan was changed immediately (downgrade / lateral / waived) */
  effectiveImmediately: boolean;
}

export interface AdminChangePlanRequest {
  newPlanId: string;
  /** If true, skips the onboarding fee difference entirely */
  waiveFee?: boolean;
}
