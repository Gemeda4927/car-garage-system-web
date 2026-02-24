// types/register.type.ts

export type UserRole = "user" | "garage_owner";

export interface GarageRegistrationRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole; // Added role field
  businessName: string;
  businessRegNumber: string;
  taxId: string;
  yearsOfExperience: number;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  businessPhone: string;
  businessEmail: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  emergencyPhone: string;
  available24_7: boolean;
  serviceCategories: string;
  specializedBrands: string;
  numberOfBays: number;
  staffCount: number;
  certifications: string;
  mondayHours: string;
  tuesdayHours: string;
  wednesdayHours: string;
  thursdayHours: string;
  fridayHours: string;
  saturdayHours: string;
  sundayHours: string;
  emergencyServices: boolean;
  licenseNumber: string;
  insuranceProvider: string;
  insuranceNumber: string;
  insuranceExpiry: string;
  description: string;
  specialties: string;
  establishedYear: number;
}

export interface GarageRegistrationResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
    businessName: string;
    role: UserRole; // Added role to response
    token?: string;
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface GarageRegistrationState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
  data: GarageRegistrationResponse["data"] | null;
  validationErrors: Record<string, string> | null;
}

export interface FileUploadState {
  profileImage?: File | null;
  certificateOfIncorporation?: File | null;
  insuranceCertificate?: File | null;
  garageAgreement?: File | null;
  businessLicense?: File | null;
}
// Default values for new registration
export const defaultGarageRegistration: GarageRegistrationRequest =
  {
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "garage_owner",
    businessName: "",
    businessRegNumber: "",
    taxId: "",
    yearsOfExperience: 0,
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    zipCode: "",
    businessPhone: "",
    businessEmail: "",
    website: "",
    facebook: "",
    instagram: "",
    emergencyPhone: "",
    available24_7: false,
    serviceCategories: "",
    specializedBrands: "",
    numberOfBays: 0,
    staffCount: 0,
    certifications: "",
    mondayHours: "9:00 AM - 6:00 PM",
    tuesdayHours: "9:00 AM - 6:00 PM",
    wednesdayHours: "9:00 AM - 6:00 PM",
    thursdayHours: "9:00 AM - 6:00 PM",
    fridayHours: "9:00 AM - 6:00 PM",
    saturdayHours: "10:00 AM - 4:00 PM",
    sundayHours: "Closed",
    emergencyServices: false,
    licenseNumber: "",
    insuranceProvider: "",
    insuranceNumber: "",
    insuranceExpiry: "",
    description: "",
    specialties: "",
    establishedYear: new Date().getFullYear(),
  };
