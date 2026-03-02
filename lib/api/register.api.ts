import { api, ApiError } from "./api";
import {
  FileUploadState,
  GarageRegistrationRequest,
  GarageRegistrationResponse,
  UserRole,
  GarageRegistrationFiles,
} from "../types/register.type";

// Extended error type with validation errors
interface RegistrationError extends ApiError {
  validationErrors?: Record<string, string>;
  fieldErrors?: Array<{
    field: string;
    message: string;
  }>;
}

class RegisterApi {
  private readonly baseUrl =
    "https://car-garage-system-2.onrender.com/api/v1/auth";
  private readonly vehicleOwnerUrl = `${this.baseUrl}/register`;
  private readonly garageOwnerUrl = `${this.baseUrl}/register-garage`;

  async register(
    data: GarageRegistrationRequest,
    files?: GarageRegistrationFiles
  ): Promise<GarageRegistrationResponse> {
    try {
      // VEHICLE OWNER
      if (data.role === "user") {
        return await this.registerVehicleOwner(
          data
        );
      }

      // GARAGE OWNER
      if (data.role === "garage_owner") {
        return await this.registerGarageOwner(
          data,
          files
        );
      }

      throw new Error(
        `Invalid role: ${data.role}`
      );
    } catch (error: unknown) {
      throw this.handleRegistrationError(error);
    }
  }

  private async registerVehicleOwner(
    data: GarageRegistrationRequest
  ): Promise<GarageRegistrationResponse> {
    // Clean and validate the data before sending
    const vehicleOwnerData = {
      name: data.name?.trim(),
      email: data.email?.trim().toLowerCase(),
      password: data.password,
      phone: data.phone?.trim(),
      role: "user" as UserRole,
    };

    // Validate required fields
    this.validateVehicleOwnerData(
      vehicleOwnerData
    );

    console.log(
      "=== VEHICLE OWNER REGISTRATION ==="
    );
    console.log("URL:", this.vehicleOwnerUrl);
    console.log(
      "Payload:",
      JSON.stringify(vehicleOwnerData, null, 2)
    );

    try {
      const response =
        await api.request<GarageRegistrationResponse>(
          {
            method: "POST",
            url: this.vehicleOwnerUrl,
            data: vehicleOwnerData,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

      console.log("=== REGISTRATION SUCCESS ===");
      console.log("Response:", response);

      return response;
    } catch (error) {
      console.error(
        "=== VEHICLE OWNER REGISTRATION FAILED ==="
      );
      throw error;
    }
  }

  private async registerGarageOwner(
    data: GarageRegistrationRequest,
    files?: GarageRegistrationFiles
  ): Promise<GarageRegistrationResponse> {
    const formData = new FormData();

    // Helper to safely append to FormData
    const appendToFormData = (
      key: string,
      value: any
    ): void => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      )
        return;

      if (typeof value === "boolean") {
        formData.append(
          key,
          value ? "true" : "false"
        );
      } else if (typeof value === "number") {
        formData.append(key, value.toString());
      } else if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else {
        formData.append(key, String(value));
      }
    };

    // Append all form fields
    Object.entries(data).forEach(
      ([key, value]) => {
        appendToFormData(key, value);
      }
    );

    // Append files
    if (files) {
      Object.entries(files).forEach(
        ([key, file]) => {
          if (file instanceof File) {
            formData.append(key, file);
          }
        }
      );
    }

    console.log(
      "=== GARAGE OWNER REGISTRATION ==="
    );
    console.log("URL:", this.garageOwnerUrl);
    console.log("FormData entries:");
    formData.forEach((value, key) => {
      console.log(
        `  ${key}:`,
        value instanceof File
          ? `File: ${value.name} (${value.type}, ${(value.size / 1024).toFixed(2)} KB)`
          : value
      );
    });

    try {
      const response =
        await api.request<GarageRegistrationResponse>(
          {
            method: "POST",
            url: this.garageOwnerUrl,
            data: formData,
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      console.log("=== GARAGE OWNER SUCCESS ===");
      console.log("Response:", response);

      return response;
    } catch (error) {
      console.error(
        "=== GARAGE OWNER REGISTRATION FAILED ==="
      );
      throw error;
    }
  }

  private validateVehicleOwnerData(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: UserRole;
  }): void {
    const errors: Record<string, string> = {};

    // Check required fields
    if (!data.name)
      errors.name = "Name is required";
    if (!data.email)
      errors.email = "Email is required";
    if (!data.password)
      errors.password = "Password is required";
    if (!data.phone)
      errors.phone = "Phone number is required";

    if (Object.keys(errors).length > 0) {
      const error = new Error(
        "Validation failed"
      ) as RegistrationError;
      error.validationErrors = errors;
      throw error;
    }

    // Email validation
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      const error = new Error(
        "Invalid email format"
      ) as RegistrationError;
      error.validationErrors = {
        email:
          "Please enter a valid email address",
      };
      throw error;
    }

    // Password validation
    if (data.password.length < 8) {
      const error = new Error(
        "Password too short"
      ) as RegistrationError;
      error.validationErrors = {
        password:
          "Password must be at least 8 characters long",
      };
      throw error;
    }

    const hasUpperCase = /[A-Z]/.test(
      data.password
    );
    const hasLowerCase = /[a-z]/.test(
      data.password
    );
    const hasNumbers = /\d/.test(data.password);

    if (
      !hasUpperCase ||
      !hasLowerCase ||
      !hasNumbers
    ) {
      const error = new Error(
        "Password requirements not met"
      ) as RegistrationError;
      error.validationErrors = {
        password:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      };
      throw error;
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(data.phone)) {
      console.warn(
        "Phone number format may be invalid:",
        data.phone
      );
    }
  }

  private handleRegistrationError(
    error: unknown
  ): RegistrationError {
    console.error("=== REGISTRATION ERROR ===");

    if (error instanceof ApiError) {
      console.error("API Error Details:", {
        message: error.message,
        status: error.status,
        data: error.data,
        validationErrors: error.validationErrors,
      });

      // Extract validation errors from different response formats
      let validationErrors: Record<
        string,
        string
      > = {};

      if (error.validationErrors) {
        validationErrors = error.validationErrors;
      } else if (
        error.data &&
        typeof error.data === "object"
      ) {
        const data = error.data as any;

        // Check for errors array format
        if (
          data.errors &&
          Array.isArray(data.errors)
        ) {
          data.errors.forEach((err: any) => {
            if (err.field && err.message) {
              validationErrors[err.field] =
                err.message;
            }
          });
        }

        // Check for field-specific errors
        Object.keys(data).forEach((key) => {
          if (
            key !== "message" &&
            key !== "success" &&
            typeof data[key] === "string"
          ) {
            validationErrors[key] = data[key];
          }
        });
      }

      // Create enhanced error
      const enhancedError = new Error(
        Object.keys(validationErrors).length > 0
          ? "Please check the form for errors"
          : error.message || "Registration failed"
      ) as RegistrationError;

      enhancedError.validationErrors =
        validationErrors;
      enhancedError.status = error.status;
      enhancedError.data = error.data;
      enhancedError.fieldErrors =
        error.data?.errors;

      return enhancedError;
    }

    if (error instanceof Error) {
      console.error(
        "Standard Error:",
        error.message
      );
      const standardError = new Error(
        error.message
      ) as RegistrationError;
      return standardError;
    }

    console.error("Unknown error:", error);
    return new Error(
      "An unexpected error occurred during registration"
    ) as RegistrationError;
  }

  // Utility methods
  async checkEmail(email: string): Promise<{
    available: boolean;
    message?: string;
  }> {
    try {
      const response = await api.get<{
        available: boolean;
        message?: string;
      }>(
        `${this.baseUrl}/check-email?email=${encodeURIComponent(email)}`
      );

      return response;
    } catch (error) {
      console.error("Email check failed:", error);

      if (
        error instanceof ApiError &&
        error.status === 404
      ) {
        console.warn(
          "Email check endpoint not found, skipping validation"
        );
        return { available: true };
      }

      throw error;
    }
  }

  async validatePhone(phone: string): Promise<{
    valid: boolean;
    formatted?: string;
    message?: string;
  }> {
    try {
      const response = await api.get<{
        valid: boolean;
        formatted?: string;
        message?: string;
      }>(
        `${this.baseUrl}/validate-phone?phone=${encodeURIComponent(phone)}`
      );

      return response;
    } catch (error) {
      console.error(
        "Phone validation failed:",
        error
      );

      if (
        error instanceof ApiError &&
        error.status === 404
      ) {
        console.warn(
          "Phone validation endpoint not found, using basic validation"
        );
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        return {
          valid: phoneRegex.test(phone),
          message: phoneRegex.test(phone)
            ? undefined
            : "Invalid phone format",
        };
      }

      throw error;
    }
  }

  validateFile(
    file: File,
    maxSizeMB: number = 5
  ): { valid: boolean; message?: string } {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        message: `File size must be less than ${maxSizeMB}MB`,
      };
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        message:
          "File must be an image (JPEG, PNG) or PDF",
      };
    }

    return { valid: true };
  }
}

// Type guards
export function isRegistrationSuccess(
  response: GarageRegistrationResponse
): response is Required<
  Pick<
    GarageRegistrationResponse,
    "success" | "data"
  >
> &
  GarageRegistrationResponse {
  return (
    response.success === true &&
    response.data !== undefined
  );
}

export function hasValidationErrors(
  response: GarageRegistrationResponse
): response is Required<
  Pick<GarageRegistrationResponse, "errors">
> &
  GarageRegistrationResponse {
  return (
    response.errors !== undefined &&
    response.errors.length > 0
  );
}

export function hasErrorValidationErrors(
  error: any
): error is RegistrationError {
  return (
    error &&
    (error.validationErrors !== undefined ||
      error.fieldErrors !== undefined) &&
    (Object.keys(error.validationErrors || {})
      .length > 0 ||
      (error.fieldErrors || []).length > 0)
  );
}

export function formatValidationErrors(
  error: RegistrationError
): Record<string, string> {
  if (error.validationErrors) {
    return error.validationErrors;
  }

  if (error.fieldErrors) {
    return error.fieldErrors.reduce(
      (acc, curr) => {
        acc[curr.field] = curr.message;
        return acc;
      },
      {} as Record<string, string>
    );
  }

  if (
    error.data &&
    typeof error.data === "object"
  ) {
    const data = error.data as any;
    if (
      data.errors &&
      Array.isArray(data.errors)
    ) {
      return data.errors.reduce(
        (
          acc: Record<string, string>,
          curr: any
        ) => {
          acc[curr.field || curr.path] =
            curr.message || curr.msg;
          return acc;
        },
        {}
      );
    }
  }

  return {};
}

export const registerApi = new RegisterApi();
