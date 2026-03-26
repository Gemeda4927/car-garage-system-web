export interface GarageInfo {
  name: string;
  address: string;
  phone: string;
  hours: string;
  description: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  status: string;
}

export interface Booking {
  id: string;
  customer: string;
  service: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  payment: "pending" | "completed";
}

export interface DashboardStats {
  totalServices: number;
  totalBookings: number;
  pendingPayments: number;
  completedPayments: number;
}