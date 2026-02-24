import { useCallback } from "react";
import { useRegisterStore } from "../store/register.store";
import {
  GarageRegistrationRequest,
  UserRole,
} from "../types/register.type";

export const useRegister = () => {
  const {
    formData,
    files,
    isLoading,
    isSuccess,
    isError,
    error,
    data,
    validationErrors,
    setFormData,
    setFile,
    setRole,
    register,
    reset,
    clearError,
  } = useRegisterStore();

  const updateFormField = useCallback(
    <K extends keyof GarageRegistrationRequest>(
      field: K,
      value: GarageRegistrationRequest[K]
    ) => {
      setFormData({ [field]: value });
      clearError();
    },
    [setFormData, clearError]
  );

  const updateFile = useCallback(
    (
      fileType: keyof typeof files,
      file: File | null
    ) => {
      setFile(fileType, file);
      clearError();
    },
    [setFile, clearError]
  );

  const updateRole = useCallback(
    (role: UserRole) => {
      setRole(role);
      clearError();
    },
    [setRole, clearError]
  );

  const handleRegister = useCallback(async () => {
    return await register();
  }, [register]);

  const getFieldError = useCallback(
    (
      field: keyof GarageRegistrationRequest
    ): string | undefined => {
      return validationErrors?.[field];
    },
    [validationErrors]
  );

  return {
    // State
    formData,
    files,
    isLoading,
    isSuccess,
    isError,
    error,
    data,
    validationErrors,

    // Actions
    updateFormField,
    updateFile,
    updateRole,
    register: handleRegister,
    reset,
    clearError,
    getFieldError,
  };
};
