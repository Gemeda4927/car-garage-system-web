import {
  CategoriesResponse,
  CreateServiceData,
  ServiceFilters,
  ServiceResponse,
  ServicesResponse,
  UpdateServiceData,
} from "../types/service.types";
import { api } from "./api";

class ServiceApi {
  private baseUrl = "services";

  // GET /services - Get all services with filters
  async getAllServices(filters?: ServiceFilters): Promise<ServicesResponse> {
    try {
      console.log("🔍 [ServiceApi] Fetching services with filters:", filters);

      const response = await api.get<ServicesResponse>(this.baseUrl, filters);

      console.log("✅ [ServiceApi] Services response:", response);
      return response;
    } catch (error) {
      console.error("❌ [ServiceApi] Error fetching services:", error);
      throw error;
    }
  }

  // GET /services/:id - Get single service
  async getServiceById(id: string): Promise<ServiceResponse> {
    try {
      console.log(`🔍 [ServiceApi] Fetching service by ID: ${id}`);

      const response = await api.get<ServiceResponse>(`${this.baseUrl}/${id}`);

      console.log("✅ [ServiceApi] Service response:", response);
      return response;
    } catch (error) {
      console.error(`❌ [ServiceApi] Error fetching service ${id}:`, error);
      throw error;
    }
  }

  // POST /services - Create service
  async createService(data: CreateServiceData): Promise<ServiceResponse> {
    try {
      console.log("🆕 [ServiceApi] Creating service with data:", data);

      const response = await api.post<ServiceResponse, CreateServiceData>(
        this.baseUrl,
        data
      );

      console.log("✅ [ServiceApi] Service created:", response);
      return response;
    } catch (error) {
      console.error("❌ [ServiceApi] Error creating service:", error);
      throw error;
    }
  }

  // PATCH /services/:id - Update service
  async updateService(id: string, data: UpdateServiceData): Promise<ServiceResponse> {
    try {
      console.log(`✏️ [ServiceApi] Updating service ${id} with data:`, data);

      const response = await api.patch<ServiceResponse, UpdateServiceData>(
        `${this.baseUrl}/${id}`,
        data
      );

      console.log("✅ [ServiceApi] Service updated:", response);
      return response;
    } catch (error) {
      console.error(`❌ [ServiceApi] Error updating service ${id}:`, error);
      throw error;
    }
  }

  // DELETE /services/:id - Soft delete
  async deleteService(id: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`🗑️ [ServiceApi] Soft deleting service: ${id}`);

      const response = await api.delete<{ success: boolean; message: string }>(
        `${this.baseUrl}/${id}`
      );

      console.log("✅ [ServiceApi] Service deleted:", response);
      return response;
    } catch (error) {
      console.error(`❌ [ServiceApi] Error deleting service ${id}:`, error);
      throw error;
    }
  }

  // PUT /services/:id/toggle-availability
  async toggleServiceAvailability(id: string): Promise<ServiceResponse> {
    try {
      console.log(`🔄 [ServiceApi] Toggling availability for service: ${id}`);

      const response = await api.put<ServiceResponse>(
        `${this.baseUrl}/${id}/toggle-availability`
      );

      console.log("✅ [ServiceApi] Availability toggled:", response);
      return response;
    } catch (error) {
      console.error(`❌ [ServiceApi] Error toggling availability ${id}:`, error);
      throw error;
    }
  }

  // GET /services/categories/list
  async getServiceCategories(): Promise<CategoriesResponse> {
    try {
      console.log("📂 [ServiceApi] Fetching service categories");

      const response = await api.get<CategoriesResponse>(
        `${this.baseUrl}/categories/list`
      );

      console.log("✅ [ServiceApi] Categories response:", response);
      return response;
    } catch (error) {
      console.error("❌ [ServiceApi] Error fetching categories:", error);
      throw error;
    }
  }

  // PUT /services/:id/restore - Admin only
  async restoreService(id: string): Promise<ServiceResponse> {
    try {
      console.log(`♻️ [ServiceApi] Restoring service: ${id}`);

      const response = await api.put<ServiceResponse>(
        `${this.baseUrl}/${id}/restore`
      );

      console.log("✅ [ServiceApi] Service restored:", response);
      return response;
    } catch (error) {
      console.error(`❌ [ServiceApi] Error restoring service ${id}:`, error);
      throw error;
    }
  }

  // DELETE /services/:id/hard - Permanent delete
  async hardDeleteService(id: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`🔥 [ServiceApi] Permanently deleting service: ${id}`);

      const response = await api.delete<{ success: boolean; message: string }>(
        `${this.baseUrl}/${id}/hard`
      );

      console.log("✅ [ServiceApi] Service permanently deleted:", response);
      return response;
    } catch (error) {
      console.error(`❌ [ServiceApi] Error hard deleting service ${id}:`, error);
      throw error;
    }
  }
}

export const serviceApi = new ServiceApi();
