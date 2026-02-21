import {
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  Garage,
  GaragesListResponse,
  GarageQueryParams,
} from "../types/garage.types";
import { garageApi } from "../api/garage.api";

// ------------------------
// Hook to fetch all garages
// ------------------------
interface UseGaragesReturn {
  garages: Garage[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalPages?: number;
  currentPage?: number;
}

interface UseGaragesProps {
  autoFetch?: boolean;
  city?: string;
  isVerified?: boolean;
  minRating?: number;
  page?: number;
  limit?: number;
}

export const useGarages = ({
  autoFetch = true,
  city,
  isVerified,
  minRating,
  page = 1,
  limit = 10,
}: UseGaragesProps = {}): UseGaragesReturn => {
  const [garages, setGarages] = useState<
    Garage[]
  >([]);
  const [loading, setLoading] =
    useState<boolean>(false);
  const [error, setError] = useState<
    string | null
  >(null);
  const [totalPages, setTotalPages] =
    useState<number>(1);
  const [currentPage, setCurrentPage] =
    useState<number>(page);

  const fetchGarages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ Fix: Properly type the params object
      const params: GarageQueryParams = {
        page,
        limit,
      };

      if (city) params.city = city;
      if (isVerified !== undefined)
        params.isVerified = isVerified;
      if (minRating) params.minRating = minRating;

      const response: GaragesListResponse =
        await garageApi.getGarages(params);

      if (response.success) {
        setGarages(response.garages);
        setTotalPages(response.pages || 1);
        setCurrentPage(response.page || page);
      } else {
        setError("Failed to fetch garages");
      }
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch garages"
      );
    } finally {
      setLoading(false);
    }
  }, [city, isVerified, minRating, page, limit]);

  useEffect(() => {
    if (autoFetch) fetchGarages();
  }, [fetchGarages, autoFetch]);

  return {
    garages,
    loading,
    error,
    refetch: fetchGarages,
    totalPages,
    currentPage,
  };
};

// ------------------------
// Hook to fetch a single garage by ID
// ------------------------
interface UseGarageReturn {
  garage: Garage | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  activeServices: Garage["services"];
}

export const useGarage = (
  id: string | null
): UseGarageReturn => {
  const [garage, setGarage] =
    useState<Garage | null>(null);
  const [loading, setLoading] =
    useState<boolean>(false);
  const [error, setError] = useState<
    string | null
  >(null);

  const fetchGarage = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response =
        await garageApi.getGarageById(id);

      if (response.success && response.garage) {
        // Log for debugging
        console.log(
          "Garage fetched:",
          response.garage
        );
        console.log(
          "Services:",
          response.garage.services
        );

        setGarage(response.garage);
      } else {
        setError("Failed to fetch garage");
      }
    } catch (err: unknown) {
      console.error(
        "Error fetching garage:",
        err
      );
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch garage"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGarage();
  }, [fetchGarage]);

  // Filter active services safely
  const activeServices =
    garage?.services?.filter(
      (s) => s.isActive !== false
    ) || [];

  return {
    garage,
    loading,
    error,
    refetch: fetchGarage,
    activeServices,
  };
};

// ------------------------
// Hook to search garages by location
// ------------------------
interface UseNearbyGaragesReturn {
  garages: Garage[];
  loading: boolean;
  error: string | null;
  refetch: (
    lat: number,
    lng: number,
    radius?: number
  ) => Promise<void>;
}

export const useNearbyGarages =
  (): UseNearbyGaragesReturn => {
    const [garages, setGarages] = useState<
      Garage[]
    >([]);
    const [loading, setLoading] =
      useState<boolean>(false);
    const [error, setError] = useState<
      string | null
    >(null);

    const searchNearby = useCallback(
      async (
        lat: number,
        lng: number,
        radius: number = 10
      ) => {
        setLoading(true);
        setError(null);

        try {
          const response =
            await garageApi.searchGaragesByLocation(
              { lat, lng, radius }
            );

          if (response.success) {
            setGarages(response.garages);
          } else {
            setError("Failed to search garages");
          }
        } catch (err: unknown) {
          console.error(err);
          setError(
            err instanceof Error
              ? err.message
              : "Failed to search garages"
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

    return {
      garages,
      loading,
      error,
      refetch: searchNearby,
    };
  };
