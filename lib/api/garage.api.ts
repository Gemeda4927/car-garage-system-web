import {
  CreateGaragePayload,
  UpdateGaragePayload,
  PopulatedGarage,
} from "../types/garage.types";
import { api } from "./api";

// Debug logger
const debugLog = (method: string, url: string, data?: any, response?: any, error?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    method,
    url,
    ...(data && { requestData: data }),
    ...(response && { response }),
    ...(error && { error: error?.response?.data || error?.message || error }),
  };
  
  console.log(`🚀 [GARAGE SERVICE DEBUG]`, logEntry);
  
  // Also log to console with colors for better visibility
  if (error) {
    console.error(`❌ ${method} ${url} failed:`, error?.response?.data || error?.message || error);
  } else {
    console.log(`✅ ${method} ${url} success:`, response);
  }
  
  return logEntry;
};

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface GaragesResponse {
  garages: PopulatedGarage[];
  priceRange: {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface GarageResponse {
  garage: PopulatedGarage;
}

export const garageService = {
  // Create Garage
  create: async (data: CreateGaragePayload) => {
    debugLog('POST', 'garages', data);
    try {
      const response = await api.post<ApiResponse<GarageResponse>>("garages", data);
      debugLog('POST', 'garages', data, response.data);
      return response;
    } catch (error) {
      debugLog('POST', 'garages', data, undefined, error);
      throw error;
    }
  },

  // Get All Garages
  getAll: async (params?: Record<string, unknown>) => {
    debugLog('GET', 'garages', params);
    try {
      const response = await api.get<ApiResponse<GaragesResponse>>("garages", { params });
      debugLog('GET', 'garages', params, {
        totalGarages: response.data?.data?.garages?.length,
        pagination: response.data?.data?.pagination,
        priceRange: response.data?.data?.priceRange
      });
      return response;
    } catch (error) {
      debugLog('GET', 'garages', params, undefined, error);
      throw error;
    }
  },

  // Get Garage By ID
  getById: async (garageId: string) => {
    debugLog('GET', `garages/${garageId}`);
    try {
      const response = await api.get<ApiResponse<GarageResponse>>(`garages/${garageId}`);
      debugLog('GET', `garages/${garageId}`, undefined, {
        garageId: response.data?.data?.garage?._id,
        garageName: response.data?.data?.garage?.name
      });
      return response;
    } catch (error) {
      debugLog('GET', `garages/${garageId}`, undefined, undefined, error);
      throw error;
    }
  },

  // Update Garage
  update: async (garageId: string, data: UpdateGaragePayload) => {
    debugLog('PATCH', `garages/${garageId}`, data);
    try {
      const response = await api.patch<ApiResponse<GarageResponse>>(`garages/${garageId}`, data);
      debugLog('PATCH', `garages/${garageId}`, data, {
        updatedGarageId: response.data?.data?.garage?._id,
        updatedFields: Object.keys(data)
      });
      return response;
    } catch (error) {
      debugLog('PATCH', `garages/${garageId}`, data, undefined, error);
      throw error;
    }
  },

  // Soft Delete Garage
  delete: async (garageId: string) => {
    debugLog('DELETE', `garages/${garageId}`);
    try {
      const response = await api.delete<ApiResponse<null>>(`garages/${garageId}`);
      debugLog('DELETE', `garages/${garageId}`, undefined, { success: true });
      return response;
    } catch (error) {
      debugLog('DELETE', `garages/${garageId}`, undefined, undefined, error);
      throw error;
    }
  },

  // =============================
  // Additional APIs (Added)
  // =============================

  // Restore Soft Deleted Garage
  restore: async (garageId: string) => {
    debugLog('PATCH', `garages/${garageId}/restore`);
    try {
      const response = await api.patch<ApiResponse<GarageResponse>>(`garages/${garageId}/restore`);
      debugLog('PATCH', `garages/${garageId}/restore`, undefined, {
        restoredGarageId: response.data?.data?.garage?._id,
        restoredGarageName: response.data?.data?.garage?.name
      });
      return response;
    } catch (error) {
      debugLog('PATCH', `garages/${garageId}/restore`, undefined, undefined, error);
      throw error;
    }
  },

  // Hard Delete Garage
  hardDelete: async (garageId: string) => {
    debugLog('DELETE', `garages/${garageId}/force`);
    try {
      const response = await api.delete<ApiResponse<null>>(`garages/${garageId}/force`);
      debugLog('DELETE', `garages/${garageId}/force`, undefined, { success: true });
      return response;
    } catch (error) {
      debugLog('DELETE', `garages/${garageId}/force`, undefined, undefined, error);
      throw error;
    }
  },

  // Get Deleted Garages
  getDeleted: async (params?: Record<string, unknown>) => {
    debugLog('GET', 'garages/deleted', params);
    try {
      const response = await api.get<ApiResponse<GaragesResponse>>("garages/deleted", { params });
      debugLog('GET', 'garages/deleted', params, {
        totalDeleted: response.data?.data?.garages?.length,
        pagination: response.data?.data?.pagination
      });
      return response;
    } catch (error) {
      debugLog('GET', 'garages/deleted', params, undefined, error);
      throw error;
    }
  },

  // Search Garages
  search: async (query: string) => {
    debugLog('GET', 'garages/search', { query });
    try {
      const response = await api.get<ApiResponse<GaragesResponse>>("garages/search", { params: { q: query } });
      debugLog('GET', 'garages/search', { query }, {
        resultsCount: response.data?.data?.garages?.length,
        searchTerm: query
      });
      return response;
    } catch (error) {
      debugLog('GET', 'garages/search', { query }, undefined, error);
      throw error;
    }
  },

  // Get Garages By Owner
  getByOwner: async (ownerId: string) => {
    debugLog('GET', `garages/owner/${ownerId}`);
    try {
      const response = await api.get<ApiResponse<GaragesResponse>>(`garages/owner/${ownerId}`);
      debugLog('GET', `garages/owner/${ownerId}`, undefined, {
        ownerId,
        garagesCount: response.data?.data?.garages?.length
      });
      return response;
    } catch (error) {
      debugLog('GET', `garages/owner/${ownerId}`, undefined, undefined, error);
      throw error;
    }
  },

  // Toggle Garage Active Status
  toggleActive: async (garageId: string) => {
    debugLog('PUT', `garages/${garageId}/toggle-active`);
    try {
      const response = await api.put<ApiResponse<GarageResponse>>(`garages/${garageId}/toggle-active`);
      debugLog('PUT', `garages/${garageId}/toggle-active`, undefined, {
        garageId: response.data?.data?.garage?._id,
        newStatus: response.data?.data?.garage?.isActive ? 'active' : 'inactive'
      });
      return response;
    } catch (error) {
      debugLog('PUT', `garages/${garageId}/toggle-active`, undefined, undefined, error);
      throw error;
    }
  },
};

// Add a debug helper to track all requests
export const debugGarageService = {
  enableDetailedLogging: () => {
    console.log('🔍 Garage Service Debug Mode ENABLED');
    const originalMethods = { ...garageService };
    
    // Create a proxy to log all method calls
    return new Proxy(garageService, {
      get(target, prop: string) {
        const original = target[prop as keyof typeof garageService];
        if (typeof original === 'function') {
          return async (...args: any[]) => {
            console.group(`📡 GarageService.${prop}`);
            console.log('Arguments:', args);
            try {
              const result = await original.apply(target, args);
              console.log('Result:', result.data);
              console.groupEnd();
              return result;
            } catch (error) {
              console.error('Error:', error);
              console.groupEnd();
              throw error;
            }
          };
        }
        return original;
      }
    });
  },

  // Helper to clear logs
  clearLogs: () => {
    console.clear();
    console.log('🧹 Console cleared - Garage Service Debug');
  },

  // Helper to test connection
  testConnection: async () => {
    console.log('🔌 Testing garage service connection...');
    try {
      const start = Date.now();
      const response = await garageService.getAll({ limit: 1 });
      const end = Date.now();
      console.log('✅ Connection successful!', {
        responseTime: `${end - start}ms`,
        status: response.status,
        hasData: !!response.data
      });
      return true;
    } catch (error) {
      console.error('❌ Connection failed:', error);
      return false;
    }
  }
};

// Auto-execute test in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    console.log('🐛 Garage Service Debug Mode Active');
    debugGarageService.testConnection().then(connected => {
      if (!connected) {
        console.warn('⚠️  Garage service may not be properly configured');
      }
    });
  }, 1000);
}