import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import type { RequestConfig } from "../types/apiClient.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL)
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not defined"
  );

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let accessToken: string | null = null;

export const setAccessToken = (token: string) =>
  (accessToken = token);
export const getAccessToken = (): string | null =>
  accessToken;
export const clearAccessToken = () =>
  (accessToken = null);

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      if (
        !(config.headers instanceof AxiosHeaders)
      ) {
        config.headers = new AxiosHeaders(
          config.headers
        );
      }
      config.headers.set(
        "Authorization",
        `Bearer ${accessToken}`
      );
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest =
      error.config as AxiosRequestConfig & {
        _retry?: boolean;
      };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post<{
          token: string;
        }>(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = res.data.token;
        setAccessToken(newToken);

        if (originalRequest.headers) {
          (
            originalRequest.headers as Record<
              string,
              string
            >
          ).Authorization = `Bearer ${newToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        if (typeof window !== "undefined")
          window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

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
  const response: AxiosResponse<T> =
    await apiClient({
      url,
      method,
      data,
      params,
      headers,
    });
  return response.data;
};

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
