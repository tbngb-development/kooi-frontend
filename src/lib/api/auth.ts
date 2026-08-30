import apiClient from "@/lib/axios";
import type {
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
  SelectTenantResponse,
  ProfileResponse,
  InviteInput,
  InviteResponse,
  AcceptInviteInput,
  TokenPayload,
} from "@/types/user";
import type { ApiResponse } from "@/types/api";

const BASE = "/api/v1/auth";
const ADMIN_BASE = "/api/v1/admin/auth";

// ─── Public ───────────────────────────────────────────────────────────────────

export async function login(input: LoginInput) {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    `${BASE}/login`,
    input,
  );
  return data.data;
}

export async function register(input: RegisterInput) {
  const { data } = await apiClient.post<ApiResponse<RegisterResponse>>(
    `${BASE}/register`,
    input,
  );
  return data.data;
}

export async function refreshTokens() {
  const { data } = await apiClient.post<ApiResponse<{ tokens: TokenPayload }>>(
    `${BASE}/refresh`,
    {},
  );
  return data.data.tokens;
}

export async function selectTenant(tenantId: string) {
  const { data } = await apiClient.post<ApiResponse<SelectTenantResponse>>(
    `${BASE}/select-tenant`,
    { tenantId },
  );
  return data.data;
}

export async function acceptInvite(input: AcceptInviteInput) {
  const { data } = await apiClient.post<ApiResponse<RegisterResponse>>(
    `${BASE}/accept-invite`,
    input,
  );
  return data.data;
}

// ─── Authenticated ────────────────────────────────────────────────────────────

export async function getProfile() {
  const { data } = await apiClient.get<ApiResponse<ProfileResponse>>(
    `${BASE}/profile`,
  );
  return data.data;
}

export async function createInvite(input: InviteInput) {
  const { data } = await apiClient.post<ApiResponse<InviteResponse>>(
    `${BASE}/invites`,
    input,
  );
  return data.data;
}

export async function logout() {
  const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
    `${BASE}/logout`,
    {},
  );
  return data.data;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function adminLogin(input: { email: string; password: string }) {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    `${ADMIN_BASE}/login`,
    input,
  );
  return data.data;
}
