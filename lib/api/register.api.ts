// api/register.api.ts
import {
  FileUploadState,
  GarageRegistrationRequest,
  GarageRegistrationResponse,
} from "../types/register.type";
import { api } from "./api";

class RegisterApi {
  private readonly baseUrl =
    "/api/v1/auth/register-garage";

  async registerGarage(
    data: GarageRegistrationRequest,
    files: FileUploadState // Now accepts FileUploadState with File | undefined
  ): Promise<GarageRegistrationResponse> {
    const formData = new FormData();

    // Append all text fields
    Object.entries(data).forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== null
        ) {
          if (typeof value === "boolean") {
            formData.append(key, String(value));
          } else if (typeof value === "number") {
            formData.append(
              key,
              value.toString()
            );
          } else {
            formData.append(key, value as string);
          }
        }
      }
    );

    // Append files - only if they exist (not undefined)
    if (files.profileImage) {
      formData.append(
        "profileImage",
        files.profileImage
      );
    }
    if (files.certificateOfIncorporation) {
      formData.append(
        "certificateOfIncorporation",
        files.certificateOfIncorporation
      );
    }
    if (files.insuranceCertificate) {
      formData.append(
        "insuranceCertificate",
        files.insuranceCertificate
      );
    }
    if (files.garageAgreement) {
      formData.append(
        "garageAgreement",
        files.garageAgreement
      );
    }
    if (files.businessLicense) {
      formData.append(
        "businessLicense",
        files.businessLicense
      );
    }

    return api.request<GarageRegistrationResponse>(
      {
        method: "POST",
        url: this.baseUrl,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }
}

export const registerApi = new RegisterApi();
