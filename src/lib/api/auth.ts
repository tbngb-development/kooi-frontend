import apiClient from "@/lib/axios";
import { AUTH_ENDPOINTS } from "@/constants/api-routes/auth-endpoint";
import type {
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
  SelectTenantResponse,
  RefreshResponse,
  ProfileResponse,
  InviteInput,
  InviteResponse,
  AcceptInviteInput,
  AcceptInviteResponse,
} from "@/types/auth";
import type { ApiResponse } from "@/types/api";

// ─── Public ───────────────────────────────────────────────────────────────────

export async function login(input: LoginInput) {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    AUTH_ENDPOINTS.LOGIN,
    input,
  );
  return data.data;
}

export async function register(input: RegisterInput) {
  const { data } = await apiClient.post<ApiResponse<RegisterResponse>>(
    AUTH_ENDPOINTS.REGISTER,
    input,
  );
  return data.data;
}

export async function refreshTokens() {
  const { data } = await apiClient.post<ApiResponse<RefreshResponse>>(
    AUTH_ENDPOINTS.REFRESH,
    {},
  );
  return data.data.refreshed;
}

export async function acceptInvite(input: AcceptInviteInput) {
  const { data } = await apiClient.post<ApiResponse<AcceptInviteResponse>>(
    AUTH_ENDPOINTS.ACCEPT_INVITE,
    input,
  );
  return data.data;
}

// ─── Authenticated ────────────────────────────────────────────────────────────

export async function selectTenant(tenantId: string) {
  const { data } = await apiClient.post<ApiResponse<SelectTenantResponse>>(
    AUTH_ENDPOINTS.SELECT_TENANT,
    { tenantId },
  );
  return data.data;
}

export async function getProfile() {
  const { data } = await apiClient.get<ApiResponse<ProfileResponse>>(
    AUTH_ENDPOINTS.PROFILE,
  );
  return data.data;
}

export async function createInvite(input: InviteInput) {
  const { data } = await apiClient.post<ApiResponse<InviteResponse>>(
    AUTH_ENDPOINTS.INVITES,
    input,
  );
  return data.data;
}

export async function logout() {
  const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
    AUTH_ENDPOINTS.LOGOUT,
    {},
  );
  return data.data;
}
