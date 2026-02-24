import { create } from "zustand/react";
import { defaultGarageRegistration, FileUploadState, GarageRegistrationRequest, GarageRegistrationResponse, GarageRegistrationState, UserRole } from "../types/register.type";
import { persist } from 'zustand/middleware';
import { registerApi } from "../api/register.api";


// Initial empty state using default values
const initialFormData: GarageRegistrationRequest = defaultGarageRegistration;

const initialFileState: FileUploadState = {
  profileImage: null,
  certificateOfIncorporation: null,
  insuranceCertificate: null,
  garageAgreement: null,
  businessLicense: null,
};

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
      formData: initialFormData,
      files: initialFileState,

      // Actions
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
        set((state) => ({
          formData: { ...state.formData, role },
        }));
      },

      register: async () => {
        set({ isLoading: true, isError: false, error: null, validationErrors: null });
        
        try {
          const { formData, files } = get();
          
          // Create a new FileUploadState object with only non-null files
          const apiFiles: FileUploadState = {
            profileImage: files.profileImage instanceof File ? files.profileImage : undefined,
            certificateOfIncorporation: files.certificateOfIncorporation instanceof File ? files.certificateOfIncorporation : undefined,
            insuranceCertificate: files.insuranceCertificate instanceof File ? files.insuranceCertificate : undefined,
            garageAgreement: files.garageAgreement instanceof File ? files.garageAgreement : undefined,
            businessLicense: files.businessLicense instanceof File ? files.businessLicense : undefined,
          };
          
          const response = await registerApi.registerGarage(formData, apiFiles);
          
          if (response.success) {
            set({ 
              isLoading: false, 
              isSuccess: true, 
              data: response.data,
              validationErrors: null 
            });
            
            if (response.data?.token) {
              localStorage.setItem('auth_token', response.data.token);
              // Store user role
              localStorage.setItem('user_role', response.data.role);
            }
          } else {
            const errors = response.errors?.reduce((acc, err) => ({
              ...acc,
              [err.field]: err.message
            }), {}) || null;
            
            set({ 
              isLoading: false, 
              isError: true, 
              error: response.message,
              validationErrors: errors
            });
          }
          
          return response;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          set({ 
            isLoading: false, 
            isError: true, 
            error: errorMessage,
            validationErrors: null
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
          formData: initialFormData,
          files: initialFileState,
        });
      },

      clearError: () => {
        set({ error: null, isError: false, validationErrors: null });
      },
    }),
    {
      name: 'garage-registration-storage',
      partialize: (state) => ({
        formData: state.formData,
      }),
    }
  )
);