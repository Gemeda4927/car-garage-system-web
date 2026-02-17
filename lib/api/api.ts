import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";

// Custom error class for API errors
export class ApiError extends Error {
  public status?: number;
  public data?: unknown;

  constructor(
    message: string,
    status?: number,
    data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export type RequestData =
  | Record<string, unknown>
  | FormData
  | URLSearchParams
  | null
  | undefined;

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout:
        Number(
          process.env.NEXT_PUBLIC_API_TIMEOUT
        ) || 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor for auth tokens
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth token if available
        if (typeof window !== "undefined") {
          const token =
            localStorage.getItem("auth_token");
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error: AxiosError) =>
        Promise.reject(this.handleError(error))
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        // Handle common errors
        if (error.response?.status === 401) {
          // Clear token and redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }
        }
        return Promise.reject(
          this.handleError(error)
        );
      }
    );
  }

  // Error handler
  private handleError(
    error: AxiosError
  ): ApiError {
    if (error.response) {
      // The request was made and the server responded with a status code
      return new ApiError(
        error.message,
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      // The request was made but no response was received
      return new ApiError(
        "No response received from server"
      );
    } else {
      // Something happened in setting up the request
      return new ApiError(error.message);
    }
  }

  // Generic request method
  async request<TResponse>(
    config: AxiosRequestConfig
  ): Promise<TResponse> {
    try {
      const response =
        await this.client.request<TResponse>(
          config
        );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Method that returns the full Axios response
  async requestWithFullResponse<TResponse>(
    config: AxiosRequestConfig
  ): Promise<AxiosResponse<TResponse>> {
    try {
      return await this.client.request<TResponse>(
        config
      );
    } catch (error) {
      throw error;
    }
  }

  // HTTP method helpers with generic data type
  async get<TResponse>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    return this.request<TResponse>({
      ...config,
      method: "GET",
      url,
    });
  }

  async post<TResponse, TData = unknown>(
    url: string,
    data?: TData,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    return this.request<TResponse>({
      ...config,
      method: "POST",
      url,
      data: data as unknown,
    });
  }

  async put<TResponse, TData = unknown>(
    url: string,
    data?: TData,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    return this.request<TResponse>({
      ...config,
      method: "PUT",
      url,
      data: data as unknown,
    });
  }

  async patch<TResponse, TData = unknown>(
    url: string,
    data?: TData,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    return this.request<TResponse>({
      ...config,
      method: "PATCH",
      url,
      data: data as unknown,
    });
  }

  async delete<TResponse>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    return this.request<TResponse>({
      ...config,
      method: "DELETE",
      url,
    });
  }
}

export const api = new ApiClient();
