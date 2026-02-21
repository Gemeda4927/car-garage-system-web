import { api } from "./api";
import {
  GaragesListResponse,
  GarageResponse,
  LocationSearchParams,
  GarageQueryParams,
} from "../types/garage.types";

export const garageApi = {
  // Get all garages (with filters and pagination)
  getGarages: async (
    params?: GarageQueryParams
  ): Promise<GaragesListResponse> => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(
        ([key, value]) => {
          if (
            value !== undefined &&
            value !== null
          ) {
            queryParams.append(
              key,
              value.toString()
            );
          }
        }
      );
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `/garages?${queryString}`
      : "/garages";

    return api.get<GaragesListResponse>(url);
  },

  // Get single garage by ID
  getGarageById: async (
    id: string
  ): Promise<GarageResponse> => {
    return api.get<GarageResponse>(
      `/garages/${id}`
    );
  },

  // Search garages by location
  searchGaragesByLocation: async (
    params: LocationSearchParams
  ): Promise<GaragesListResponse> => {
    const { lat, lng, radius = 10 } = params;
    return api.get<GaragesListResponse>(
      `/garages/search/location?lat=${lat}&lng=${lng}&radius=${radius}`
    );
  },
};
