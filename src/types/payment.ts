// src/types/payment.ts

// ── Shared ───────────────────────────────────────────────────────────────────

export type RechargePurpose = "ONBOARDING" | "WALLET_TOPUP" | "PLAN_UPGRADE";

export type RechargeStatus = "INITIATED" | "SUCCESS" | "FAILED" | "REFUNDED";

// ── Tenant: Create Order ─────────────────────────────────────────────────────

export interface CreateOrderInput {
  purpose: RechargePurpose;
  /** Required for WALLET_TOPUP only; omitted for ONBOARDING/PLAN_UPGRADE */
  amountPaisa?: number;
  /** Required for PLAN_UPGRADE only; omitted for ONBOARDING/WALLET_TOPUP */
  newPlanId?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: "INR";
  keyId: string;
  rechargeId: string;
  // Present only for PLAN_UPGRADE:
  newPlanVersionId?: string;
  feeDifference?: number;
}

// ── Tenant: Verify ───────────────────────────────────────────────────────────

export interface VerifyPaymentInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResponse {
  alreadyProcessed: boolean;
  rechargeId: string;
  /** Tells the frontend which flow was completed */
  purpose: "ONBOARDING" | "WALLET_TOPUP";
}

// ── Tenant: Order Status ─────────────────────────────────────────────────────

export interface OrderStatusResponse {
  rechargeId: string;
  status: RechargeStatus;
  amount: number;
  purpose: RechargePurpose;
}

// ── Admin: Payment List ──────────────────────────────────────────────────────

export interface AdminPayment {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  purpose: RechargePurpose;
  status: "SUCCESS" | "FAILED" | "INITIATED";
  createdAt: string;
  completedAt: string | null;
}

export interface AdminPaymentsPage {
  items: AdminPayment[];
  total: number;
  page: number;
  limit: number;
}

// ── Admin: Summary (per-tenant, tenantId required by backend) ────────────────

export interface AdminPaymentSummary {
  totalRecharges: number;
  totalAmountPaisa: number;
  successfulRecharges: number;
  failedRecharges: number;
}
