import {
  ApiError,
  CategoriesResponse,
  CreateServicePayload,
  ServiceAnalyticsResponse,
  ServiceBookingsResponse,
  ServiceFilters,
  ServiceResponse,
  ServicesResponse,
  UpdateServicePayload,
} from "../types/service.types";
import apiClient from "./api";

class ServiceApi {
  private readonly baseUrl = "services";

  /**
   * Create a new service
   * POST /api/services
   */
  async createService(
    payload: CreateServicePayload
  ): Promise<ServiceResponse> {
    try {
      const response =
        await apiClient.post<ServiceResponse>(
          this.baseUrl,
          payload
        );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(
        error,
        "Failed to create service"
      );
    }
  }

  /**
   * Get all services with filters
   * GET /api/services
   */
  async getAllServices(
    filters?: ServiceFilters
  ): Promise<ServicesResponse> {
    try {
      const queryParams =
        this.buildQueryParams(filters);
      const url = queryParams
        ? `${this.baseUrl}?${queryParams}`
        : this.baseUrl;

      const response =
        await apiClient.get<ServicesResponse>(
          url
        );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(
        error,
        "Failed to fetch services"
      );
    }
  }

  /**
   * Get service by ID
   * GET /api/services/:serviceId
   */
  async getServiceById(
    serviceId: string
  ): Promise<ServiceResponse> {
    try {
      const response =
        await apiClient.get<ServiceResponse>(
          `${this.baseUrl}/${serviceId}`
        );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(
        error,
        "Failed to fetch service"
      );
    }
  }

  /**
   * Update service
   * PATCH /api/services/:serviceId
   */
  async updateService(
    serviceId: string,
    payload: UpdateServicePayload
  ): Promise<ServiceResponse> {
    try {
      const response =
        await apiClient.patch<ServiceResponse>(
          `${this.baseUrl}/${serviceId}`,
          payload
        );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(
        error,
        "Failed to update service"
      );
    }
  }

  /**
   * Toggle service availability
   * PUT /api/services/:serviceId/toggle-availability
   */
  async toggleAvailability(
    serviceId: string
  ): Promise<ServiceResponse> {
    try {
      const response =
        await apiClient.put<ServiceResponse>(
          `${this.baseUrl}/${serviceId}/toggle-availability`
        );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(
        error,
        "Failed to toggle service availability"
      );
    }
  }

  /**
   * Soft delete service
   * DELETE /api/services/:serviceId
   */
  async softDeleteService(
    serviceId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await apiClient.delete<{
        success: boolean;
        message: string;
      }>(`${this.baseUrl}/${serviceId}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(
        error,
        "Failed to delete service"
      );
    }
  }

  /**
   * Restore soft-deleted service
   * PUT /api/services/:serviceId/restore
   */
  async restoreService(
    serviceId: string
  ): Promise<ServiceResponse> {
    try {
      const response =
        await apiClient.put<ServiceResponse>(
          `${this.baseUrl}/${serviceId}/restore`
        );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(
        error,
        "Failed to restore service"
      );
    }
  }

  /**
   * Hard delete service (permanent)
   * DELETE /api/services/:serviceId/hard
   */
  async hardDeleteService(
    serviceId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await apiClient.delete<{
        success: boolean;
        message: string;
      }>(`${this.baseUrl}/${serviceId}/hard`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(
        error,
        "Failed to permanently delete service"
      );
    }
  }

  /**
   * Get service analytics
   * GET /api/services/:serviceId/analytics
   */
  async getServiceAnalytics(
    serviceId: string
  ): Promise<ServiceAnalyticsResponse> {
    try {
      const response =
        await apiClient.get<ServiceAnalyticsResponse>(
          `${this.baseUrl}/${serviceId}/analytics`
        );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(
        error,
        "Failed to fetch service analytics"
      );
    }
  }

  /**
   * Get service bookings
   * GET /api/services/:serviceId/bookings
   */
  async getServiceBookings(
    serviceId: string,
    filters?: {
      status?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<ServiceBookingsResponse> {
    try {
      const queryParams =
        this.buildQueryParams(filters);
      const url = queryParams
        ? `${this.baseUrl}/${serviceId}/bookings?${queryParams}`
        : `${this.baseUrl}/${serviceId}/bookings`;

      const response =
        await apiClient.get<ServiceBookingsResponse>(
          url
        );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(
        error,
        "Failed to fetch service bookings"
      );
    }
  }

  /**
   * Get all service categories with stats
   * GET /api/services/categories
   */
  async getCategories(
    garageId?: string
  ): Promise<CategoriesResponse> {
    try {
      const url = garageId
        ? `/api/services/categories?garageId=${garageId}`
        : "/api/services/categories";

      const response =
        await apiClient.get<CategoriesResponse>(
          url
        );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(
        error,
        "Failed to fetch categories"
      );
    }
  }

  /**
   * Get services by garage
   * Convenience method
   */
  async getServicesByGarage(
    garageId: string,
    filters?: Omit<ServiceFilters, "garageId">
  ): Promise<ServicesResponse> {
    return this.getAllServices({
      ...filters,
      garageId,
    });
  }

  /**
   * Get available services only
   * Convenience method
   */
  async getAvailableServices(
    filters?: Omit<ServiceFilters, "isAvailable">
  ): Promise<ServicesResponse> {
    return this.getAllServices({
      ...filters,
      isAvailable: true,
    });
  }

  /**
   * Batch update services (if needed)
   * Custom endpoint if your API supports it
   */
  async batchUpdateServices(
    serviceIds: string[],
    updates: Partial<UpdateServicePayload>
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await apiClient.patch<{
        success: boolean;
        message: string;
      }>(`${this.baseUrl}/batch`, {
        serviceIds,
        updates,
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(
        error,
        "Failed to batch update services"
      );
    }
  }

  /**
   * Build query parameters from filters
   */
  private buildQueryParams(
    filters?: Record<string, unknown>
  ): string {
    if (!filters) return "";

    const params = new URLSearchParams();

    Object.entries(filters).forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          params.append(key, value.toString());
        }
      }
    );

    return params.toString();
  }

  /**
   * Handle API errors
   */
  private handleError(
    error: unknown,
    defaultMessage: string
  ): Error {
    if (error.response) {
      // Server responded with error
      const apiError = error.response
        .data as ApiError;
      return new Error(
        apiError.message || defaultMessage
      );
    } else if (error.request) {
      // Request made but no response
      return new Error(
        "No response from server. Please check your connection."
      );
    } else {
      // Something else happened
      return new Error(
        error.message || defaultMessage
      );
    }
  }
}

// Create and export singleton instance
export const serviceApi = new ServiceApi();
