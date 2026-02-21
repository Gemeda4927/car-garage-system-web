import { api } from "./api";
import {
  GaragesListResponse,
  Garage,
} from "../types/garage.types";

export const garageApi = {
  // Get all garages
  getGarages:
    async (): Promise<GaragesListResponse> => {
      return api.get<GaragesListResponse>(
        "/garages"
      );
    },

  // Get single garage by ID
  getGarageById: async (
    id: string
  ): Promise<{
    success: boolean;
    garage: Garage;
  }> => {
    return api.get<{
      success: boolean;
      garage: Garage;
    }>(`/garages/${id}`);
  },
};
