import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TenantPlanStatus } from "@/types/plan";

export type PlanStatus = TenantPlanStatus | "NONE";

export interface ActivePlanDetails {
  id: string;
  name: string;
  slug: string;
  onboardingFee: number;
  perMinuteRate: number;
  includedBalance: number;
}

interface TenantState {
  activeTenantId: string | null;
  activePlan: ActivePlanDetails | null;
  planStatus: PlanStatus;
  paymentRequired: boolean;

  setTenantContext: (
    tenantId: string | null,
    plan: ActivePlanDetails | null,
    status: PlanStatus,
  ) => void;
  updatePlanStatus: (status: PlanStatus) => void;
  markPaymentDone: () => void;
  clearTenantContext: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      activeTenantId: null,
      activePlan: null,
      planStatus: "NONE",
      paymentRequired: false,

      setTenantContext: (tenantId, plan, status) =>
        set({
          activeTenantId: tenantId,
          activePlan: plan,
          planStatus: status,
          paymentRequired: status === "PENDING_PAYMENT",
        }),

      updatePlanStatus: (status) =>
        set({
          planStatus: status,
          paymentRequired: status === "PENDING_PAYMENT",
        }),

      markPaymentDone: () =>
        set({
          planStatus: "ACTIVE",
          paymentRequired: false,
        }),

      clearTenantContext: () =>
        set({
          activeTenantId: null,
          activePlan: null,
          planStatus: "NONE",
          paymentRequired: false,
        }),
    }),
    {
      name: "kooi-tenant-storage",
      partialize: (state) => ({
        activeTenantId: state.activeTenantId,
        activePlan: state.activePlan,
        planStatus: state.planStatus,
        paymentRequired: state.paymentRequired,
      }),
    },
  ),
);
