export type InviteStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

export interface CreateOwnerInviteInput {
  email: string;
  tenantName: string;
  planId: string;
  expiryDays?: number;
}

export interface OwnerInvite {
  id: string;
  email: string;
  tenantName: string;
  planId: string;
  planName: string;
  status: InviteStatus;
  expiresAt: string;
  resendCount: number;
  inviteUrl: string;
  createdAt: string;
}

export interface PublicInviteView {
  email: string;
  tenantName: string;
  plan: {
    id: string;
    name: string;
    slug: string;
    onboardingFee: number;
  };
  expiresAt: string;
  status: InviteStatus;
}

export interface AcceptOwnerInviteInput {
  token: string;
  email: string;
  name: string;
  password: string;
}

export interface AcceptOwnerInviteResponse {
  user: { id: string; email: string; name: string };
  tenant: { id: string; name: string };
  membership: { id: string; role: "OWNER" };
  paymentRequired: boolean;
  plan: {
    id: string;
    name: string;
    slug: string;
    onboardingFee: number;
  } | null;
}
