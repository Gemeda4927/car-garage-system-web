// ===============================
// User Roles
// ===============================
export type UserRole = "user" | "garage_owner";

// ===============================
// File Upload Structure
// ===============================
export interface GarageRegistrationFiles {
  profileImage?: File | null;
  certificateOfIncorporation?: File | null;
  insuranceCertificate?: File | null;
  garageAgreement?: File | null;
  businessLicense?: File | null;
}

// ===============================
// Garage Registration Request (matches form-data structure)
// ===============================
export interface GarageRegistrationRequest {
  // Personal Information
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;

  // Business Information
  businessName: string;
  businessRegNumber: string;
  taxId: string;
  yearsOfExperience: number;

  // Address Information
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;

  // Contact Information
  businessPhone: string;
  businessEmail: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  emergencyPhone: string;

  // Business Operations
  available24_7: boolean;
  serviceCategories: string; // Comma-separated e.g., "Oil Change,Brake Service,Engine Repair,AC Service"
  specializedBrands: string; // Comma-separated e.g., "Toyota,Honda,Mercedes-Benz,BMW"
  numberOfBays: number;
  staffCount: number;
  certifications: string; // e.g., "ISO 9001,AAA Approved"

  // Operating Hours
  mondayHours: string; // e.g., "8:00 AM - 6:00 PM"
  tuesdayHours: string;
  wednesdayHours: string;
  thursdayHours: string;
  fridayHours: string;
  saturdayHours: string; // e.g., "9:00 AM - 4:00 PM"
  sundayHours: string; // e.g., "Closed"

  // Services & Licensing
  emergencyServices: boolean;
  licenseNumber: string;

  // Insurance Information
  insuranceProvider: string;
  insuranceNumber: string;
  insuranceExpiry: string; // ISO date string e.g., "2025-12-31"

  // Additional Information
  description: string;
  specialties: string; // e.g., "German cars, AC repair, Transmission"
  establishedYear: number; // e.g., 2014
}

// ===============================
// Complete Registration Data (including files)
// ===============================
export interface CompleteGarageRegistration extends GarageRegistrationRequest {
  files: GarageRegistrationFiles;
}

// ===============================
// Default Values for Vehicle Owner
// ===============================
export const defaultVehicleOwner: GarageRegistrationRequest =
  {
    // Personal Info
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user",

    // Business Info - Empty for regular users
    businessName: "",
    businessRegNumber: "",
    taxId: "",
    yearsOfExperience: 0,
    address: "",
    city: "",
    state: "",
    country: "Ethiopia",
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
    mondayHours: "",
    tuesdayHours: "",
    wednesdayHours: "",
    thursdayHours: "",
    fridayHours: "",
    saturdayHours: "",
    sundayHours: "",
    emergencyServices: false,
    licenseNumber: "",
    insuranceProvider: "",
    insuranceNumber: "",
    insuranceExpiry: "",
    description: "",
    specialties: "",
    establishedYear: new Date().getFullYear(),
  };

// ===============================
// Default Values for Garage Owner
// ===============================
export const defaultGarageOwner: GarageRegistrationRequest =
  {
    // Personal Info
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "garage_owner",

    // Business Info - Default empty values
    businessName: "",
    businessRegNumber: "",
    taxId: "",
    yearsOfExperience: 0,
    address: "",
    city: "",
    state: "",
    country: "Ethiopia",
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

// ===============================
// Example Data (based on your input)
// ===============================
export const exampleGarageRegistration: GarageRegistrationRequest =
  {
    name: "Abbaa Jifaar Lammeesso",
    email: "warenasir746@gmail.com",
    password: "Garage@1234",
    phone: "+2348023456789",
    role: "garage_owner",
    businessName: "Premium Auto Care Ltd",
    businessRegNumber: "RC-1234567",
    taxId: "TAX-98765432",
    yearsOfExperience: 10,
    address: "42 Auto Avenue, Ikeja",
    city: "Jimmaa",
    state: "Jimma02",
    country: "Ethiopia",
    zipCode: "100001",
    businessPhone: "+2348034567890",
    businessEmail: "info@premiumautocare.com",
    website: "https://premiumautocare.com",
    facebook:
      "https://facebook.com/premiumautocare",
    instagram:
      "https://instagram.com/premiumautocare",
    emergencyPhone: "+2348034567891",
    available24_7: false,
    serviceCategories:
      "Oil Change,Brake Service,Engine Repair,AC Service",
    specializedBrands:
      "Toyota,Honda,Mercedes-Benz,BMW",
    numberOfBays: 5,
    staffCount: 12,
    certifications: "ISO 9001,AAA Approved",
    mondayHours: "8:00 AM - 6:00 PM",
    tuesdayHours: "8:00 AM - 6:00 PM",
    wednesdayHours: "8:00 AM - 6:00 PM",
    thursdayHours: "8:00 AM - 6:00 PM",
    fridayHours: "8:00 AM - 6:00 PM",
    saturdayHours: "9:00 AM - 4:00 PM",
    sundayHours: "Closed",
    emergencyServices: true,
    licenseNumber: "BL-87654321",
    insuranceProvider: "Leadway Assurance",
    insuranceNumber: "INS-12345678",
    insuranceExpiry: "2025-12-31",
    description:
      "Premium Auto Care is a full-service automotive repair facility with over 10 years of experience serving the Ikeja community.",
    specialties:
      "German cars, AC repair, Transmission",
    establishedYear: 2014,
  };

// ===============================
// File Upload Example
// ===============================
export const exampleFileUpload: GarageRegistrationFiles =
  {
    profileImage: null, // Would be File object from input
    certificateOfIncorporation: null, // "Pharmaceutical Procure..." from your image
    insuranceCertificate: null, // "Wubinesh misganaw b..." from your image
    garageAgreement: null, // "Pharmaceutical Procure..." from your image
    businessLicense: null, // "Pharmaceutical Procure..." from your image
  };

// ===============================
// Garage Registration Response
// ===============================
export interface GarageRegistrationResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
    businessName: string;
    role: UserRole;
    token?: string;
    files?: {
      profileImage?: string; // URL to uploaded file
      certificateOfIncorporation?: string; // URL
      insuranceCertificate?: string; // URL
      garageAgreement?: string; // URL
      businessLicense?: string; // URL
    };
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// ===============================
// Registration State (for frontend)
// ===============================
export interface GarageRegistrationState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
  data: GarageRegistrationResponse["data"] | null;
  validationErrors: Record<string, string> | null;
  fileUploadProgress?: Record<
    keyof GarageRegistrationFiles,
    number
  >;
}

// ===============================
// Utility function to prepare FormData for API submission
// ===============================
export function prepareGarageRegistrationFormData(
  data: GarageRegistrationRequest,
  files: GarageRegistrationFiles
): FormData {
  const formData = new FormData();

  // Append all text fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });

  // Append files if they exist
  Object.entries(files).forEach(([key, file]) => {
    if (file instanceof File) {
      formData.append(key, file);
    }
  });

  return formData;
}
