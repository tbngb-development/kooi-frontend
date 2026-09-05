export type RechargePurpose = "ONBOARDING" | "WALLET_TOPUP";

export interface CreateOrderInput {
  purpose: RechargePurpose;
  amountPaisa?: number;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: "INR";
  keyId: string;
  rechargeId: string;
  purpose: RechargePurpose;
}

export interface VerifyPaymentInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResponse {
  success: true;
  alreadyProcessed: boolean;
  rechargeId: string;
  purpose: RechargePurpose;
}

export interface RazorpayPaymentInfo {
  id: string;
  status: string;
  amount: number;
  currency: string;
  method: string | null;
  captured: boolean;
  createdAt: number;
}

export interface OrderStatusResponse {
  orderId: string;
  payments: RazorpayPaymentInfo[];
}

export interface AdminPayment {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number; // in paisa
  status: "SUCCESS" | "FAILED" | "PENDING";
  purpose: string;
  createdAt: string;
}

export interface AdminPaymentsPage {
  items: AdminPayment[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminPaymentSummary {
  totalRevenue: number; // in paisa
  mrrApprox: number; // in paisa
  successCount: number;
  failedCount: number;
}
