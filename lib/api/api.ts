import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import type { RequestConfig } from "../types/apiClient.types";

// Base API URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// --- Token handling --- //
let getTokenFn: (() => string | null) | null = null;

export const setTokenGetter = (getToken: () => string | null) => {
  getTokenFn = getToken;
  console.log("Token getter set successfully");
};

export const getAccessToken = (): string | null => {
  return getTokenFn ? getTokenFn() : null;
};

// --- Request interceptor - SINGLE INSTANCE --- //
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    
    if (token) {
      console.log("Adding token to request:", config.url);
      
      // Ensure headers are properly set
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      
      if (!(config.headers instanceof AxiosHeaders)) {
        config.headers = new AxiosHeaders(config.headers);
      }
      
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      console.log("No token available for request:", config.url);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response interceptor --- //
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if it's a 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't retry if it's the refresh endpoint itself
      if (originalRequest.url?.includes('/auth/refresh-token')) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        console.log("Attempting to refresh token...");
        
        const res = await axios.post<{ token: string }>(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const newToken = res.data.token;
        console.log("Token refreshed successfully");

        // Update the token in the auth store through the getter
        if (getTokenFn) {
          // Note: This assumes your auth store has a way to update the token
          // You might need to expose a method to set the token
          console.log("Token refreshed, but you need to update your auth store");
        }

        // Update the authorization header for the retry
        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        }

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        
        // Redirect to login on refresh failure
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// --- Generic request wrapper --- //
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
    
    const response: AxiosResponse<T> = await apiClient({
      url,
      method,
      data,
      params,
      headers,
    });
    
    return response.data;
  } catch (error) {
    console.error(`Request failed for ${url}:`, error);
    throw error;
  }
};

// --- API methods --- //
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