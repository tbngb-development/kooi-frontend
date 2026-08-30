import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120_000,
  withCredentials: true, // HTTP-only cookies
});

// ─── Refresh Queue (prevents duplicate refresh calls) ─────────────────────────
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

    // On 401, attempt cookie-based refresh before redirecting
    if (error.response?.status === 401 && !originalRequest._retry) {
      const url = originalRequest.url ?? "";

      // NEVER attempt refresh on auth endpoints (login, register, refresh)
      if (
        url.includes("/auth/refresh") ||
        url.includes("/auth/login") ||
        url.includes("/admin/auth/login") ||
        url.includes("/auth/register")
      ) {
        return rejectWithNormalisedError(error);
      }

      // Queue concurrent requests while refreshing
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post("/api/v1/auth/refresh", {});
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

/**
 * Normalises V1 error responses and only redirects to login when an
 * existing session has actually expired — NOT on failed login attempts.
 */
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
  const isAuthEndpoint =
    url.includes("/auth/login") ||
    url.includes("/admin/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh");

  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;
    const isOnAuthPage =
      currentPath === "/login" ||
      currentPath === "/admin/login" ||
      currentPath === "/register";

    // Only redirect if:
    // 1. Explicitly requested (e.g. refresh token expired), OR
    // 2. Received a 401 on a PROTECTED route while NOT already on a login page
    if (
      (shouldRedirect || (error.response?.status === 401 && !isAuthEndpoint)) &&
      !isOnAuthPage
    ) {
      try {
        localStorage.removeItem("auth-storage");
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
