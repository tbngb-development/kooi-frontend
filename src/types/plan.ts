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

export interface Plan {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;

  // Pricing
  pricingModel: PricingModel;
  onboardingFee: number; // in paisa
  onboardingFeeOriginal: number | null; // in paisa (null if no discount/MSRP)
  perMinuteRate: number; // in paisa
  billingMinimumSec: number;
  billingIncrementSec: number;

  // Limits
  maxActiveCampaigns: number | null;
  maxLeadsPerBatch: number | null;
  maxAgents: number | null;
  maxTeamMembers: number | null;
  retryAutomation: boolean;
  industryPackLimit: number | null;

  // Capabilities
  callingChannel: CallingChannel;
  brochureUpload: boolean;

  // Feature Tiers (Flattened from old features JSON)
  dashboardTier: DashboardTier;
  agentCapability: AgentCapability;
  integrations: IntegrationTier;
  supportTier: SupportTier;

  // Wallet Threshold (Plan-managed)
  lowBalanceThreshold: number; // in paisa

  // Bonus
  includedBalance: number; // in paisa
  bonusValidityDays: number | null;

  createdAt: string;
  updatedAt: string;
}

export interface TenantPlan {
  planId: string;
  plan: Plan;
  status: TenantPlanStatus;
  activatedAt: string | null;
  bonusExpiresAt: string | null;
}


export interface CreatePlanInput {
  name: string;
  slug: string;
  isActive?: boolean;
  displayOrder?: number;

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

export type UpdatePlanInput = Partial<CreatePlanInput>;
