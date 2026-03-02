import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  defaultVehicleOwner,
  defaultGarageOwner,
  FileUploadState,
  GarageRegistrationRequest,
  GarageRegistrationResponse,
  GarageRegistrationState,
  UserRole,
} from "../types/register.type";
import { registerApi } from "../api/register.api";

// ===============================
// Initial States
// ===============================
const initialFileState: FileUploadState = {
  profileImage: null,
  certificateOfIncorporation: null,
  insuranceCertificate: null,
  garageAgreement: null,
  businessLicense: null,
};

// ===============================
// Store Interface
// ===============================
interface RegisterStore extends GarageRegistrationState {
  formData: GarageRegistrationRequest;
  files: FileUploadState;

  // Actions
  setFormData: (data: Partial<GarageRegistrationRequest>) => void;
  setFile: (key: keyof FileUploadState, file: File | null) => void;
  setRole: (role: UserRole) => void;
  register: () => Promise<GarageRegistrationResponse>;
  reset: () => void;
  clearError: () => void;
}

// ===============================
// Zustand Store
// ===============================
export const useRegisterStore = create<RegisterStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
      data: null,
      validationErrors: null,
      formData: defaultVehicleOwner, // Start with vehicle owner by default
      files: initialFileState,

      // ===============================
      // Actions
      // ===============================
      setFormData: (data) => {
        set((state) => ({
          formData: { ...state.formData, ...data },
        }));
      },

      setFile: (key, file) => {
        set((state) => ({
          files: { ...state.files, [key]: file },
        }));
      },

      setRole: (role) => {
        set((state) => {
          // Set the appropriate default based on role
          const defaultData = role === "user" ? defaultVehicleOwner : defaultGarageOwner;
          
          // Preserve basic user info when switching roles
          const newFormData = {
            ...defaultData,
            name: state.formData.name,
            email: state.formData.email,
            password: state.formData.password,
            phone: state.formData.phone,
            role: role,
          };

          return {
            formData: newFormData,
            files: initialFileState, // Clear files when switching roles
          };
        });
      },

      register: async () => {
        set({
          isLoading: true,
          isError: false,
          error: null,
          validationErrors: null,
        });

        try {
          const { formData, files } = get();
          const response = await registerApi.register(formData, files);

          if (response.success) {
            set({
              isLoading: false,
              isSuccess: true,
              data: response.data,
              validationErrors: null,
            });

            if (response.data?.token) {
              localStorage.setItem("auth_token", response.data.token);
              localStorage.setItem("user_role", response.data.role);
            }

            return response;
          } else {
            // Handle validation errors from response
            const errors = response.errors?.reduce(
              (acc, err) => ({ ...acc, [err.field]: err.message }),
              {} as Record<string, string>
            );

            set({
              isLoading: false,
              isError: true,
              error: response.message,
              validationErrors: errors || null,
            });

            throw new Error(response.message);
          }
        } catch (error: unknown) {
          console.error("Registration error:", error);
          
          // Check if error has validation errors
          const validationErrors = error.validationErrors || null;
          
          set({
            isLoading: false,
            isError: true,
            error: error.message || "Registration failed",
            validationErrors: validationErrors,
          });
          
          throw error;
        }
      },

      reset: () => {
        set({
          isLoading: false,
          isSuccess: false,
          isError: false,
          error: null,
          data: null,
          validationErrors: null,
          formData: defaultVehicleOwner,
          files: initialFileState,
        });
      },

      clearError: () => {
        set({
          error: null,
          isError: false,
          validationErrors: null,
        });
      },
    }),
    {
      name: "garage-registration-storage",
      partialize: (state) => ({
        formData: state.formData, // Only persist formData
      }),
    }
  )
);