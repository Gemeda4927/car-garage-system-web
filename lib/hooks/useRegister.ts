import {
  useCallback,
  useState,
  useEffect,
} from "react";
import { useRegisterStore } from "../store/register.store";
import {
  GarageRegistrationRequest,
  FileUploadState,
  UserRole,
  defaultVehicleOwner,
  defaultGarageOwner,
} from "../types/register.type";
import {
  registerApi,
  hasErrorValidationErrors,
} from "../api/register.api";

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
    register: storeRegister,
    reset,
    clearError,
  } = useRegisterStore();

  const [
    passwordRequirements,
    setPasswordRequirements,
  ] = useState<{
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  } | null>(null);

  // Load password requirements on mount
  useEffect(() => {
    loadPasswordRequirements();
  }, []);

  // ------------------------------
  // Load password requirements
  // ------------------------------
  const loadPasswordRequirements =
    useCallback(async () => {
      try {
        const requirements =
          await registerApi.getPasswordRequirements();
        setPasswordRequirements(requirements);
      } catch (err) {
        console.warn(
          "Could not load password requirements:",
          err
        );
        // Set defaults if API fails
        setPasswordRequirements({
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
        });
      }
    }, []);

  // ------------------------------
  // Update a text field in the form
  // ------------------------------
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

  // ------------------------------
  // Update a file in the form
  // ------------------------------
  const updateFile = useCallback(
    <K extends keyof FileUploadState>(
      fileType: K,
      file: File | null
    ) => {
      setFile(fileType, file);
      clearError();
    },
    [setFile, clearError]
  );

  // ------------------------------
  // Update user role
  // ------------------------------
  const updateRole = useCallback(
    (role: UserRole) => {
      setRole(role);
      clearError();
    },
    [setRole, clearError]
  );

  // ------------------------------
  // Validate email format and availability
  // ------------------------------
  const validateEmail = useCallback(
    async (
      email: string
    ): Promise<{
      valid: boolean;
      message?: string;
    }> => {
      if (!email)
        return {
          valid: false,
          message: "Email is required",
        };

      try {
        // Basic format validation
        const emailRegex =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return {
            valid: false,
            message: "Invalid email format",
          };
        }

        // Check availability if email is valid
        const result =
          await registerApi.checkEmail(email);
        return {
          valid: result.available,
          message: result.available
            ? undefined
            : "Email is already registered",
        };
      } catch (err) {
        console.error(
          "Email validation error:",
          err
        );
        return { valid: true }; // Assume valid if check fails
      }
    },
    []
  );

  // ------------------------------
  // Validate phone number
  // ------------------------------
  const validatePhone = useCallback(
    async (
      phone: string
    ): Promise<{
      valid: boolean;
      formatted?: string;
      message?: string;
    }> => {
      if (!phone)
        return {
          valid: false,
          message: "Phone number is required",
        };

      try {
        return await registerApi.validatePhone(
          phone
        );
      } catch (err) {
        console.error(
          "Phone validation error:",
          err
        );
        // Basic validation as fallback
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        return {
          valid: phoneRegex.test(phone),
          message: phoneRegex.test(phone)
            ? undefined
            : "Invalid phone format",
        };
      }
    },
    []
  );

  // ------------------------------
  // Validate password strength
  // ------------------------------
  const validatePassword = useCallback(
    (
      password: string
    ): { valid: boolean; message?: string } => {
      if (!password)
        return {
          valid: false,
          message: "Password is required",
        };

      if (!passwordRequirements) {
        // Default validation if requirements not loaded
        if (password.length < 8) {
          return {
            valid: false,
            message:
              "Password must be at least 8 characters long",
          };
        }
        return { valid: true };
      }

      const {
        minLength,
        requireUppercase,
        requireLowercase,
        requireNumbers,
        requireSpecialChars,
      } = passwordRequirements;

      if (password.length < minLength) {
        return {
          valid: false,
          message: `Password must be at least ${minLength} characters long`,
        };
      }

      if (
        requireUppercase &&
        !/[A-Z]/.test(password)
      ) {
        return {
          valid: false,
          message:
            "Password must contain at least one uppercase letter",
        };
      }

      if (
        requireLowercase &&
        !/[a-z]/.test(password)
      ) {
        return {
          valid: false,
          message:
            "Password must contain at least one lowercase letter",
        };
      }

      if (
        requireNumbers &&
        !/\d/.test(password)
      ) {
        return {
          valid: false,
          message:
            "Password must contain at least one number",
        };
      }

      if (
        requireSpecialChars &&
        !/[!@#$%^&*]/.test(password)
      ) {
        return {
          valid: false,
          message:
            "Password must contain at least one special character",
        };
      }

      return { valid: true };
    },
    [passwordRequirements]
  );

  // ------------------------------
  // Validate business registration number
  // ------------------------------
  const validateBusinessRegNumber = useCallback(
    async (
      regNumber: string
    ): Promise<{
      valid: boolean;
      businessName?: string;
      message?: string;
    }> => {
      if (!regNumber)
        return {
          valid: false,
          message:
            "Business registration number is required",
        };

      try {
        return await registerApi.verifyBusinessRegNumber(
          regNumber
        );
      } catch (err) {
        console.error(
          "Business registration validation error:",
          err
        );
        return { valid: true }; // Assume valid if check fails
      }
    },
    []
  );

  // ------------------------------
  // Trigger registration with role-specific validation
  // ------------------------------
  const handleRegister = useCallback(async () => {
    try {
      // Basic validation before sending
      if (!formData.name?.trim()) {
        throw new Error("Full name is required");
      }

      if (!formData.email?.trim()) {
        throw new Error(
          "Email address is required"
        );
      }

      // Validate email format
      const emailValidation = await validateEmail(
        formData.email
      );
      if (!emailValidation.valid) {
        throw new Error(
          emailValidation.message ||
            "Invalid email"
        );
      }

      if (!formData.password) {
        throw new Error("Password is required");
      }

      // Validate password strength
      const passwordValidation = validatePassword(
        formData.password
      );
      if (!passwordValidation.valid) {
        throw new Error(
          passwordValidation.message
        );
      }

      if (!formData.phone?.trim()) {
        throw new Error(
          "Phone number is required"
        );
      }

      // Validate phone
      const phoneValidation = await validatePhone(
        formData.phone
      );
      if (!phoneValidation.valid) {
        throw new Error(
          phoneValidation.message ||
            "Invalid phone number"
        );
      }

      // Role-specific validation
      if (formData.role === "garage_owner") {
        const requiredGarageFields = [
          {
            field: "businessName",
            message: "Business name is required",
          },
          {
            field: "businessRegNumber",
            message:
              "Business registration number is required",
          },
          {
            field: "address",
            message:
              "Business address is required",
          },
          {
            field: "businessPhone",
            message: "Business phone is required",
          },
          {
            field: "businessEmail",
            message: "Business email is required",
          },
          {
            field: "licenseNumber",
            message: "License number is required",
          },
        ];

        for (const {
          field,
          message,
        } of requiredGarageFields) {
          if (
            !formData[
              field as keyof GarageRegistrationRequest
            ]
          ) {
            throw new Error(message);
          }
        }

        // Validate business registration number
        const businessRegValidation =
          await validateBusinessRegNumber(
            formData.businessRegNumber
          );
        if (!businessRegValidation.valid) {
          throw new Error(
            businessRegValidation.message ||
              "Invalid business registration number"
          );
        }
      }

      return await storeRegister();
    } catch (err: any) {
      console.error(
        "Registration validation error:",
        err
      );

      // If it's an API error with validation errors, format them nicely
      if (hasErrorValidationErrors(err)) {
        const fieldErrors = err.validationErrors;
        const firstError =
          Object.values(fieldErrors)[0];
        throw new Error(
          firstError ||
            err.message ||
            "Registration failed"
        );
      }

      throw err;
    }
  }, [
    formData,
    storeRegister,
    validateEmail,
    validatePhone,
    validatePassword,
    validateBusinessRegNumber,
  ]);

  // ------------------------------
  // Get validation error for a specific field
  // ------------------------------
  const getFieldError = useCallback(
    <K extends keyof GarageRegistrationRequest>(
      field: K
    ): string | undefined => {
      return validationErrors?.[field];
    },
    [validationErrors]
  );

  // ------------------------------
  // Check if a field is required based on role
  // ------------------------------
  const isFieldRequired = useCallback(
    (
      field: keyof GarageRegistrationRequest
    ): boolean => {
      // Basic fields are always required
      const basicRequiredFields = [
        "name",
        "email",
        "password",
        "phone",
      ];
      if (basicRequiredFields.includes(field)) {
        return true;
      }

      // Garage-specific required fields
      if (formData.role === "garage_owner") {
        const garageRequiredFields = [
          "businessName",
          "businessRegNumber",
          "address",
          "businessPhone",
          "businessEmail",
          "licenseNumber",
        ];
        return garageRequiredFields.includes(
          field
        );
      }

      return false;
    },
    [formData.role]
  );

  // ------------------------------
  // Get field placeholder text
  // ------------------------------
  const getFieldPlaceholder = useCallback(
    (
      field: keyof GarageRegistrationRequest
    ): string => {
      const placeholders: Partial<
        Record<
          keyof GarageRegistrationRequest,
          string
        >
      > = {
        name: "John Doe",
        email: "john@example.com",
        phone: "+251912345678",
        businessName: "Premium Auto Care",
        businessRegNumber: "RC-1234567",
        taxId: "123-456-789",
        address: "123 Mechanic Street, Lagos",
        city: "Lagos",
        state: "Lagos State",
        country: "Ethiopia",
        zipCode: "100001",
        businessPhone: "+251987654321",
        businessEmail: "info@premiumautocare.com",
        website: "https://premiumautocare.com",
        facebook:
          "https://facebook.com/yourgarage",
        instagram:
          "https://instagram.com/yourgarage",
        emergencyPhone: "+251912345678",
        licenseNumber: "LAG/GAR/2023/001",
        insuranceProvider: "XYZ Insurance Co.",
        insuranceNumber: "INS-12345-6789",
        description:
          "Tell us about your garage...",
        specialties:
          "Engine repair, Transmission, AC service",
        serviceCategories:
          "Oil Change, Brake Service, Engine Diagnostics",
        specializedBrands: "Toyota, Honda, BMW",
        certifications:
          "ASE Certified, Manufacturer Trained",
      };
      return placeholders[field] || "";
    },
    []
  );

  // ------------------------------
  // Get field type
  // ------------------------------
  const getFieldType = useCallback(
    (
      field: keyof GarageRegistrationRequest
    ): string => {
      const types: Partial<
        Record<
          keyof GarageRegistrationRequest,
          string
        >
      > = {
        email: "email",
        password: "password",
        phone: "tel",
        website: "url",
        facebook: "url",
        instagram: "url",
        insuranceExpiry: "date",
        yearsOfExperience: "number",
        numberOfBays: "number",
        staffCount: "number",
        establishedYear: "number",
      };
      return types[field] || "text";
    },
    []
  );

  // ------------------------------
  // Reset form to default based on role
  // ------------------------------
  const resetForm = useCallback(() => {
    reset();
  }, [reset]);

  // ------------------------------
  // Expose state and actions
  // ------------------------------
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
    passwordRequirements,

    // Actions
    updateFormField,
    updateFile,
    updateRole,
    register: handleRegister,
    reset: resetForm,
    clearError,

    // Validation helpers
    getFieldError,
    isFieldRequired,
    getFieldPlaceholder,
    getFieldType,
    validateEmail,
    validatePhone,
    validatePassword,
    validateBusinessRegNumber,
  };
};
