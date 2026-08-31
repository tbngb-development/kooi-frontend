import type { Membership } from "./tenant";
import type { User } from "./user";

// ─── Requests ─────────────────────────────────────────────────────────────────

export interface LoginInput {
  email: string;
  password: string;
  tenantId?: string;
}

export interface RegisterInput {
  tenantName: string;
  name: string;
  email: string;
  password: string;
}

export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface InviteInput {
  email: string;
  role: "ADMIN" | "USER";
}

export interface AcceptInviteInput {
  inviteToken: string;
  email: string;
  password: string;
  name: string;
}

// ─── Responses (V1: tokens removed — delivered via httpOnly cookies) ─────────

export interface LoginResponse {
  requiresTenantSelection: boolean;
  user: User;
  memberships: Membership[];
}

export interface RegisterResponse {
  user: Pick<User, "id" | "email" | "name">;
  tenant: { id: string; name: string };
  membership: { id: string; role: "OWNER" };
}

export interface SelectTenantResponse {
  membership: {
    id: string;
    tenantId: string;
    tenantName: string;
    role: string;
  };
}

export interface RefreshResponse {
  refreshed: boolean;
}

export interface ProfileResponse {
  user: User;
  memberships: Membership[];
}

export interface InviteResponse {
  inviteToken: string;
  inviteUrl: string;
  expiresAt: string;
}

export interface AcceptInviteResponse {
  user: Pick<User, "id" | "email" | "name">;
  membership: {
    id: string;
    tenantId: string;
    tenantName: string;
    role: string;
  };
}
