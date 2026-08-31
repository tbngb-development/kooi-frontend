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

// ─── Tokens ───────────────────────────────────────────────────────────────────

export interface TokenPayload {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

// ─── Responses ────────────────────────────────────────────────────────────────

export interface LoginResponse {
  tokens: TokenPayload | null;
  requiresTenantSelection: boolean;
  user: User;
  memberships: Membership[];
}

export interface RegisterResponse {
  tokens: TokenPayload;
  user: Pick<User, "id" | "email" | "name">;
  tenant: { id: string; name: string };
  membership: { id: string; role: "OWNER" };
}

export interface SelectTenantResponse {
  tokens: TokenPayload;
  membership: Membership;
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
