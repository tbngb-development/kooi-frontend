import type { TenantRole, Membership } from "@/store/authStore";

// ─── V1 User ──────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  isPlatformAdmin: boolean;
}

// ─── Auth Request / Response ──────────────────────────────────────────────────

export interface LoginInput {
  email: string;
  password: string;
  tenantId?: string; // V1: skip tenant selection if provided
}

export interface RegisterInput {
  tenantName: string;
  name: string;
  email: string;
  password: string;
}

export interface TokenPayload {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // 900
  refreshExpiresIn: number; // 604800
}

export interface LoginResponse {
  tokens: TokenPayload | null; // null when requiresTenantSelection is true
  requiresTenantSelection: boolean;
  user: User;
  memberships: Membership[];
}

export interface RegisterResponse {
  tokens: TokenPayload;
  user: Pick<User, "id" | "email" | "name">;
  tenant: {
    id: string;
    name: string;
  };
  membership: {
    id: string;
    role: "OWNER";
  };
}

export interface SelectTenantResponse {
  tokens: TokenPayload;
  membership: Membership;
}

export interface ProfileResponse {
  user: User;
  memberships: Membership[];
}

export interface InviteInput {
  email: string;
  role: "ADMIN" | "USER";
}

export interface InviteResponse {
  inviteToken: string;
  inviteUrl: string;
  expiresAt: string; // ISO 8601
}

export interface AcceptInviteInput {
  inviteToken: string;
  email: string;
  password: string;
  name: string;
}

// ─── Team Management ──────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: TenantRole;
  createdAt: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password?: string; // V1: auto-generated if omitted
  role?: TenantRole; // default: USER
}

export interface UpdateUserInput {
  name?: string;
  role?: TenantRole;
}
