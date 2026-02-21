import { useEffect, useState, useCallback } from "react";
import { Garage, GaragesListResponse } from "../types/garage.types";
import { garageApi } from "../api/garage.api";

// ------------------------
// Hook to fetch all garages
// ------------------------
interface UseGaragesReturn {
  garages: Garage[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useGarages = (autoFetch = true): UseGaragesReturn => {
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGarages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: GaragesListResponse = await garageApi.getGarages();
      if (response.success) {
        setGarages(response.garages);
      } else {
        setError("Failed to fetch garages");
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to fetch garages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchGarages();
  }, [fetchGarages, autoFetch]);

  return { garages, loading, error, refetch: fetchGarages };
};

// ------------------------
// Hook to fetch a single garage by ID
// ------------------------
interface UseGarageReturn {
  garage: Garage | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useGarage = (id: string | null): UseGarageReturn => {
  const [garage, setGarage] = useState<Garage | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGarage = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await garageApi.getGarageById(id);
      if (response.success) {
        setGarage(response.garage);
      } else {
        setError("Failed to fetch garage");
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to fetch garage");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGarage();
  }, [fetchGarage]);

  return { garage, loading, error, refetch: fetchGarage };
};