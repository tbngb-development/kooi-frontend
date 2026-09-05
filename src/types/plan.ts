export interface PlanFeatures {
  dashboardTier: "standard" | "advanced" | "custom";
  agentCapability:
    | "basic"
    | "basic_knowledge"
    | "advanced_knowledge"
    | "custom";
  integrations: "none" | "basic" | "api_selected" | "custom";
  supportTier: "standard" | "priority" | "sla";
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
  onboardingFee: number;
  perMinuteRate: number;
  billingMinimumSec: number;
  billingIncrementSec: number;
  maxActiveCampaigns: number | null;
  maxLeadsPerBatch: number | null;
  retryAutomation: boolean;
  industryPackLimit: number | null;
  features: PlanFeatures;
  includedBalance: number;
  bonusValidityDays: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanInput {
  name: string;
  slug: string;
  isActive?: boolean;
  displayOrder?: number;
  onboardingFee: number;
  perMinuteRate: number;
  billingMinimumSec: number;
  billingIncrementSec: number;
  maxActiveCampaigns?: number | null;
  maxLeadsPerBatch?: number | null;
  retryAutomation?: boolean;
  industryPackLimit?: number | null;
  features: PlanFeatures;
  includedBalance: number;
  bonusValidityDays?: number | null;
}

export type UpdatePlanInput = Partial<CreatePlanInput>;

export type TenantPlanStatus =
  | "PENDING_PAYMENT"
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED";

export interface TenantPlan {
  planId: string;
  plan: Plan;
  status: TenantPlanStatus;
  activatedAt: string | null;
  bonusExpiresAt: string | null;
}
