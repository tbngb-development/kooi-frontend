import apiClient from "@/lib/axios";
import { ADMIN_AUTH_ENDPOINTS } from "@/constants/api-routes/admin/auth-endpoint";
import type {
  AdminLoginInput,
  LoginResponse,
  ForgotPasswordInput,
  ForgotPasswordResponse,
  VerifyOtpInput,
  VerifyOtpResponse,
  ResetPasswordInput,
  ResetPasswordResponse,
  ChangePasswordInput,
  ChangePasswordResponse,
} from "@/types/auth";
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

// ─── Admin Password Reset (Public) ───────────────────────────────────────────

export async function adminForgotPassword(input: ForgotPasswordInput) {
  const { data } = await apiClient.post<ApiResponse<ForgotPasswordResponse>>(
    ADMIN_AUTH_ENDPOINTS.FORGOT_PASSWORD,
    input,
  );
  return data.data;
}

export async function adminVerifyOtp(input: VerifyOtpInput) {
  const { data } = await apiClient.post<ApiResponse<VerifyOtpResponse>>(
    ADMIN_AUTH_ENDPOINTS.VERIFY_OTP,
    input,
  );
  return data.data;
}

export async function adminResetPassword(input: ResetPasswordInput) {
  const { data } = await apiClient.post<ApiResponse<ResetPasswordResponse>>(
    ADMIN_AUTH_ENDPOINTS.RESET_PASSWORD,
    input,
  );
  return data.data;
}

// ─── Admin Change Password (Authenticated) ────────────────────────────────────

export async function adminChangePassword(input: ChangePasswordInput) {
  const { data } = await apiClient.post<ApiResponse<ChangePasswordResponse>>(
    ADMIN_AUTH_ENDPOINTS.CHANGE_PASSWORD,
    input,
  );
  return data.data;
}
