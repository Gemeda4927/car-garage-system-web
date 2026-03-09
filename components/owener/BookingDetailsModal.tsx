// components/dashboard/BookingDetailsModal.tsx
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { 
  Calendar, User, Car, Wrench, Edit3, AlertCircle, Phone, 
  Activity, CheckCircle, XCircle, Play, CheckCircle2, X 
} from "lucide-react";
import { getStatusColor, getStatusIcon } from "@/lib/utils/booking.utils";
import { BookingStatus } from "@/lib/types/booking.types";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any; // Replace with proper type
  onStatusUpdate: (booking: any) => void;
}

export const BookingDetailsModal = ({
  isOpen,
  onClose,
  booking,
  onStatusUpdate,
}: BookingDetailsModalProps) => {
  if (!booking) return null;

  const statusColor = getStatusColor(booking.status as BookingStatus);
  const StatusIcon = getStatusIcon(booking.status as BookingStatus);

  const canUpdateStatus = ![
    BookingStatus.COMPLETED,
    BookingStatus.CANCELLED,
    BookingStatus.REJECTED
  ].includes(booking.status as BookingStatus);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
                <div className="relative bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
                  <Dialog.Title className="text-2xl font-bold text-white relative flex items-center">
                    <Calendar className="h-6 w-6 mr-2" />
                    Booking Details
                  </Dialog.Title>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full ${statusColor.bg}`}>
                      <StatusIcon className={`h-5 w-5 mr-2 ${statusColor.text}`} />
                      <span className={`font-medium ${statusColor.text}`}>
                        {statusColor.label}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">ID: {booking._id.slice(-8)}</span>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-2xl border-2 border-purple-100">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Wrench className="h-5 w-5 text-purple-600 mr-2" />
                      Service Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Service</p>
                        <p className="font-medium text-gray-900">{booking.serviceName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-medium text-gray-900">{booking.servicePrice} ETB</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-medium text-gray-900">
                          {booking.timeSlot.start} - {booking.timeSlot.end}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border-2 border-blue-100">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <User className="h-5 w-5 text-blue-600 mr-2" />
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium text-gray-900">{booking.carOwner.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{booking.carOwner.phone || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {booking.vehicleInfo && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-2xl border-2 border-green-100">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Car className="h-5 w-5 text-green-600 mr-2" />
                        Vehicle Information
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Make</p>
                          <p className="font-medium text-gray-900">{booking.vehicleInfo.make}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Model</p>
                          <p className="font-medium text-gray-900">{booking.vehicleInfo.model}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Year</p>
                          <p className="font-medium text-gray-900">{booking.vehicleInfo.year}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">License Plate</p>
                          <p className="font-medium text-gray-900">{booking.vehicleInfo.licensePlate}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {booking.notes && (
                    <div className="bg-gray-50 p-5 rounded-2xl">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Edit3 className="h-5 w-5 text-gray-600 mr-2" />
                        Notes
                      </h3>
                      <p className="text-gray-700">{booking.notes}</p>
                    </div>
                  )}

                  {canUpdateStatus && (
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        onClick={() => {
                          onClose();
                          onStatusUpdate(booking);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium flex items-center"
                      >
                        <Activity className="h-5 w-5 mr-2" />
                        Update Status
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50/80 backdrop-blur-sm px-6 py-4 flex justify-end rounded-b-3xl border-t border-gray-200">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};