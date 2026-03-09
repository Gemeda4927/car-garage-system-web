// lib/utils/booking.utils.ts
import {
  Clock,
  CheckCircle,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { BookingStatus } from "@/lib/types/booking.types";

export const getStatusColor = (
  status: BookingStatus
): {
  bg: string;
  text: string;
  label: string;
} => {
  const colors = {
    [BookingStatus.PENDING]: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      label: "Pending",
    },
    [BookingStatus.APPROVED]: {
      bg: "bg-green-100",
      text: "text-green-700",
      label: "Approved",
    },
    [BookingStatus.IN_PROGRESS]: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      label: "In Progress",
    },
    [BookingStatus.COMPLETED]: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      label: "Completed",
    },
    [BookingStatus.CANCELLED]: {
      bg: "bg-red-100",
      text: "text-red-700",
      label: "Cancelled",
    },
    [BookingStatus.REJECTED]: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      label: "Rejected",
    },
  };
  return (
    colors[status] ||
    colors[BookingStatus.PENDING]
  );
};

export const getStatusIcon = (
  status: BookingStatus
) => {
  const icons = {
    [BookingStatus.PENDING]: Clock,
    [BookingStatus.APPROVED]: CheckCircle,
    [BookingStatus.IN_PROGRESS]: Play,
    [BookingStatus.COMPLETED]: CheckCircle2,
    [BookingStatus.CANCELLED]: XCircle,
    [BookingStatus.REJECTED]: AlertTriangle,
  };
  return icons[status] || Info;
};
