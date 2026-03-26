/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/api/api.ts
import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import type { RequestConfig } from "../types/apiClient.types";

// --- Base API URL from environment ---
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not defined"
  );
}

// Enable debug logging only in development
const isDev =
  process.env.NODE_ENV === "development";

// --- Axios instance with optimized config ---
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  // Optimize params serializer
  paramsSerializer: {
    serialize: (params) => {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          searchParams.append(key, String(value));
        }
      });
      return searchParams.toString();
    },
  },
  // Add timeout to prevent hanging requests
  timeout: 30000,
});

// --- Token handling with direct reference for speed ---
let currentToken: string | null = null;
let tokenGetterFn: (() => string | null) | null =
  null;

/**
 * Set the token getter function (optimized for performance)
 */
export const setTokenGetter = (
  getToken: () => string | null
) => {
  tokenGetterFn = getToken;
  // Immediately get the token for fast access
  if (tokenGetterFn) {
    currentToken = tokenGetterFn();
  }
  if (isDev)
    console.log("🔑 Token getter updated");
};

/**
 * Get the current access token - super fast direct access
 */
export const getAccessToken = ():
  | string
  | null => {
  // Return cached token if available, otherwise get from getter
  if (tokenGetterFn) {
    // Only update cache if needed (every request)
    currentToken = tokenGetterFn();
  }
  return currentToken;
};

/**
 * Manually update token (for refresh scenarios)
 */
export const updateToken = (
  token: string | null
) => {
  currentToken = token;
  if (isDev && token)
    console.log("🔄 Token manually updated");
};

/**
 * Clear the token cache - use this on logout
 * This ensures no stale tokens are kept in memory
 */
export const clearTokenCache = () => {
  currentToken = null;
  tokenGetterFn = null;
  if (isDev)
    console.log("🧹 Token cache cleared");
};

// --- Optimized request interceptor ---
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token) {
      if (!config.headers)
        config.headers = new AxiosHeaders();
      if (
        !(config.headers instanceof AxiosHeaders)
      ) {
        config.headers = new AxiosHeaders(
          config.headers
        );
      }
      config.headers.set(
        "Authorization",
        `Bearer ${token}`
      );
    }

    // Only log in development
    if (isDev) {
      const fullUrl = `${config.baseURL}${config.url}`;
      const queryString = config.params
        ? "?" +
          new URLSearchParams(
            config.params as any
          ).toString()
        : "";
      console.log(
        `🚀 ${config.method?.toUpperCase()} ${fullUrl}${queryString}`
      );
    }

    return config;
  },
  (error) => {
    if (isDev)
      console.error(
        "Request interceptor error:",
        error
      );
    return Promise.reject(error);
  }
);

// --- Optimized response interceptor ---
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (isDev) {
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`
      );
    }
    return response;
  },
  async (error) => {
    const originalRequest =
      error.config as AxiosRequestConfig & {
        _retry?: boolean;
        _retryCount?: number;
      };

    // Handle 401 with retry limit
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      originalRequest._retryCount =
        (originalRequest._retryCount || 0) + 1;

      // Prevent infinite retry loops
      if (originalRequest._retryCount > 2) {
        if (isDev)
          console.error(
            "Max retry attempts reached, redirecting to login"
          );
        if (typeof window !== "undefined") {
          clearTokenCache();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      // Skip refresh for auth endpoints
      if (
        originalRequest.url?.includes(
          "/auth/refresh-token"
        ) ||
        originalRequest.url?.includes(
          "/auth/login"
        )
      ) {
        if (isDev)
          console.log(
            "Auth endpoint failed, redirecting to login"
          );
        if (typeof window !== "undefined") {
          clearTokenCache();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        if (isDev)
          console.log(
            "🔄 Attempting token refresh..."
          );

        const refreshStart = performance.now();
        const res = await axios.post<{
          token: string;
        }>(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 10000, // 10 second timeout for refresh
          }
        );

        const newToken = res.data.token;

        if (!newToken) {
          throw new Error(
            "No token received from refresh endpoint"
          );
        }

        // Update token cache
        updateToken(newToken);

        // Update token getter if it exists
        if (tokenGetterFn) {
          // Create new getter that returns the new token
          const oldGetter = tokenGetterFn;
          tokenGetterFn = () => newToken;
        }

        if (isDev) {
          const refreshTime =
            performance.now() - refreshStart;
          console.log(
            `✅ Token refreshed in ${refreshTime.toFixed(2)}ms`
          );
        }

        // Update the original request with new token
        if (originalRequest.headers) {
          (
            originalRequest.headers as Record<
              string,
              string
            >
          ).Authorization = `Bearer ${newToken}`;
        }

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (isDev)
          console.error(
            "❌ Token refresh failed:",
            refreshError
          );
        // Clear token on refresh failure
        clearTokenCache();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (isDev && error.response) {
      console.error(
        `❌ API Error: ${error.response.status} - ${error.config?.url}`
      );
      console.error(
        "Error details:",
        error.response.data
      );
    }

    return Promise.reject(error);
  }
);

// --- Optimized generic request wrapper ---
const request = async <T = unknown, D = unknown>({
  url,
  data,
  params,
  headers,
  method,
}: RequestConfig<D> & {
  method:
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE";
}): Promise<T> => {
  const startTime = isDev ? performance.now() : 0;

  try {
    // Ensure params are flat - performance optimization
    let flatParams = params;
    if (
      params &&
      typeof params === "object" &&
      "params" in params &&
      (params as any).params
    ) {
      flatParams = (params as any).params;
    }

    const response: AxiosResponse<T> =
      await apiClient({
        url,
        method,
        data,
        params: flatParams,
        headers,
      });

    // Log performance in development
    if (isDev) {
      const duration =
        performance.now() - startTime;
      console.log(
        `⏱️  ${method} ${url} completed in ${duration.toFixed(2)}ms`
      );
    }

    return response.data;
  } catch (error) {
    if (isDev) {
      const duration =
        performance.now() - startTime;
      console.error(
        `⏱️  ${method} ${url} failed after ${duration.toFixed(2)}ms`
      );
    }
    throw error;
  }
};

// --- Optimized API methods ---
export const api = {
  get: <T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ) =>
    request<T, undefined>({
      url,
      params,
      headers,
      method: "GET",
    }),

  post: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    headers?: Record<string, string>
  ) =>
    request<T, D>({
      url,
      data,
      headers,
      method: "POST",
    }),

  put: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    headers?: Record<string, string>
  ) =>
    request<T, D>({
      url,
      data,
      headers,
      method: "PUT",
    }),

  patch: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    headers?: Record<string, string>
  ) =>
    request<T, D>({
      url,
      data,
      headers,
      method: "PATCH",
    }),

  delete: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    headers?: Record<string, string>
  ) =>
    request<T, D>({
      url,
      data,
      headers,
      method: "DELETE",
    }),
};

export default apiClient;
