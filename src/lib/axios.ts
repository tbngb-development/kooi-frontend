import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { AUTH_ENDPOINTS } from "@/constants/api-routes/auth-endpoint";
import { ADMIN_AUTH_ENDPOINTS } from "@/constants/api-routes/admin/auth-endpoint";
import { AUTH_STORAGE_KEY } from "@/constants/config/auth.config";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120_000,
  withCredentials: true,
});

// ─── Refresh Queue ────────────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(null);
    }
  });
  failedQueue = [];
};

// ─── Auth endpoint detection ──────────────────────────────────────────────────
const AUTH_PATHS = [
  AUTH_ENDPOINTS.REFRESH,
  AUTH_ENDPOINTS.LOGIN,
  ADMIN_AUTH_ENDPOINTS.LOGIN,
  AUTH_ENDPOINTS.REGISTER,
] as const;

function isAuthEndpoint(url: string): boolean {
  return AUTH_PATHS.some((path) => url.includes(path));
}

// ─── Response Interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (
    error: AxiosError<{
      success?: boolean;
      error?: string;
      code?: string;
      message?: string;
    }>,
  ) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const url = originalRequest.url ?? "";

      if (isAuthEndpoint(url)) {
        return rejectWithNormalisedError(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post(AUTH_ENDPOINTS.REFRESH, {});
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        return rejectWithNormalisedError(error, true);
      } finally {
        isRefreshing = false;
      }
    }

    return rejectWithNormalisedError(error);
  },
);

function rejectWithNormalisedError(
  error: AxiosError<{
    success?: boolean;
    error?: string;
    code?: string;
    message?: string;
  }>,
  shouldRedirect = false,
) {
  const url = error.config?.url ?? "";

  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;
    const isOnAuthPage =
      currentPath === "/login" ||
      currentPath === "/admin/login" ||
      currentPath === "/register";

    if (
      (shouldRedirect ||
        (error.response?.status === 401 && !isAuthEndpoint(url))) &&
      !isOnAuthPage
    ) {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch {
        // ignore
      }
      const isAdminRoute = currentPath.startsWith("/admin");
      window.location.href = isAdminRoute ? "/admin/login" : "/login";
    }
  }

  const data = error.response?.data;
  const message =
    data?.error ??
    data?.message ??
    error.message ??
    "An unexpected error occurred";

  return Promise.reject(new Error(message));
}

export default apiClient;
