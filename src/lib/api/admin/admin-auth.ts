import apiClient from "@/lib/axios";
import { ADMIN_AUTH_ENDPOINTS } from "@/constants/api-routes/admin/auth-endpoint";
import type { AdminLoginInput, LoginResponse } from "@/types/auth";
import type { ApiResponse } from "@/types/api";

export async function adminLogin(input: AdminLoginInput) {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    ADMIN_AUTH_ENDPOINTS.LOGIN,
    input,
  );
  return data.data;
}

export async function adminLogout() {
  const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
    ADMIN_AUTH_ENDPOINTS.LOGOUT,
    {},
  );
  return data.data;
}