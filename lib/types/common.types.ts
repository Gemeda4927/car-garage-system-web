export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

export interface UserReference {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface TimeRange {
  start: string; // "09:00"
  end: string; // "17:00"
}

export interface WorkingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  open?: string; // "09:00"
  close?: string; // "17:00"
  break?: TimeRange;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: T[];
}
