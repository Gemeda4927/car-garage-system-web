// lib/api/api.ts
import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import type { RequestConfig } from "../types/apiClient.types";

// --- Base API URL from environment ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

// --- Axios instance ---
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  // Add paramsSerializer to ensure flat parameters
  paramsSerializer: {
    serialize: (params) => {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      return searchParams.toString();
    },
  },
});

// --- Token handling ---
let getTokenFn: (() => string | null) | null = null;

/**
 * Set the token getter function
 */
export const setTokenGetter = (getToken: () => string | null) => {
  getTokenFn = getToken;
  console.log("Token getter set successfully");
};

/**
 * Get the current access token
 */
export const getAccessToken = (): string | null => {
  return getTokenFn ? getTokenFn() : null;
};

// --- Request interceptor ---
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token) {
      console.log("Adding token to request:", config.url, "(redacted)");

      if (!config.headers) config.headers = new AxiosHeaders();
      if (!(config.headers instanceof AxiosHeaders)) {
        config.headers = new AxiosHeaders(config.headers);
      }

      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      console.log("No token available for request:", config.url);
    }

    // Log the full URL with params for debugging
    const fullUrl = `${config.baseURL}${config.url}`;
    const queryString = config.params ? '?' + new URLSearchParams(config.params as any).toString() : '';
    console.log('🌐 Full request URL:', fullUrl + queryString);

    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response interceptor ---
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 (unauthorized) and refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (originalRequest.url?.includes("/auth/refresh-token")) {
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        console.log("Attempting to refresh token...");

        const res = await axios.post<{ token: string }>(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );

        const newToken = res.data.token;
        console.log("Token refreshed successfully");

        // TODO: Update auth store token here
        if (getTokenFn) {
          console.log(
            "Token refreshed, but you need to update your auth store"
          );
        }

        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// --- Generic request wrapper ---
const request = async <T = unknown, D = unknown>({
  url,
  data,
  params,
  headers,
  method,
}: RequestConfig<D> & {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
}): Promise<T> => {
  try {
    console.log(`Making ${method} request to: ${url}`);
    console.log('Request params:', params);

    // Ensure params are flat - if params is an object with a 'params' property, flatten it
    let flatParams = params;
    if (params && typeof params === 'object' && 'params' in params) {
      flatParams = (params as any).params;
      console.log('Flattened params from nested structure:', flatParams);
    }

    const response: AxiosResponse<T> = await apiClient({
      url,
      method,
      data,
      params: flatParams,
      headers,
    });

    return response.data;
  } catch (error) {
    console.error(`Request failed for ${url}:`, error);
    throw error;
  }
};

// --- API methods ---
export const api = {
  get: <T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ) => request<T, undefined>({ url, params, headers, method: "GET" }),

  post: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    headers?: Record<string, string>
  ) => request<T, D>({ url, data, headers, method: "POST" }),

  put: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    headers?: Record<string, string>
  ) => request<T, D>({ url, data, headers, method: "PUT" }),

  patch: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    headers?: Record<string, string>
  ) => request<T, D>({ url, data, headers, method: "PATCH" }),

  delete: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    headers?: Record<string, string>
  ) => request<T, D>({ url, data, headers, method: "DELETE" }),
};

export default apiClient;