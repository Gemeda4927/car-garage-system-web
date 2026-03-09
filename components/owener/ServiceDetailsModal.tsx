// components/dashboard/ServiceDetailsModal.tsx
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  Wrench, Edit3, EyeOff, Eye, BarChart, Trash2, Calendar,
  DollarSign, Clock as ClockIcon, Layers, X, AlertCircle
} from "lucide-react";
import { getStatusColor, getStatusIcon, formatDate } from "@/lib/constants/dashboard.constants";

interface ServiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: any | null;
  onEdit: () => void;
  onToggleAvailability: () => void;
  onDelete: () => void;
  onViewAnalytics: () => void;
}

export const ServiceDetailsModal = ({
  isOpen,
  onClose,
  service,
  onEdit,
  onToggleAvailability,
  onDelete,
  onViewAnalytics,
}: ServiceDetailsModalProps) => {
  if (!service) return null;

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
                <div
                  className={`relative bg-gradient-to-r ${
                    service.isAvailable ? "from-green-600 to-emerald-600" : "from-gray-600 to-slate-600"
                  } px-8 py-6`}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-32 -translate-y-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full transform -translate-x-24 translate-y-24"></div>
                  <Dialog.Title as="h3" className="text-2xl font-bold text-white relative flex items-center">
                    <Wrench className="h-6 w-6 mr-2" />
                    {service.name}
                  </Dialog.Title>
                  <p className="text-white/80 text-sm mt-1 relative">Service Details</p>
                </div>

                <div className="p-8 space-y-6">
                  {/* Status Badge */}
                  <div className="flex justify-between items-center">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        service.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {service.isAvailable ? "● Available" : "○ Unavailable"}
                    </span>
                    <span className="text-sm text-gray-500">
                      Created: {formatDate(service.createdAt, "short")}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Edit3 className="h-4 w-4 mr-2 text-gray-600" />
                      Description
                    </h4>
                    <p className="text-gray-700">{service.description || "No description provided."}</p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl text-center">
                      <DollarSign className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="text-xl font-bold text-gray-900">{service.price} ETB</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl text-center">
                      <ClockIcon className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="text-xl font-bold text-gray-900">{service.duration} min</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl text-center">
                      <Layers className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="text-xl font-bold text-gray-900 capitalize">{service.category}</p>
                    </div>
                  </div>

                  {/* Bookings Summary */}
                  {service.bookings && service.bookings.length > 0 && (
                    <div className="bg-gray-50 p-6 rounded-2xl">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                        Upcoming Bookings ({service.bookings.length})
                      </h4>
                      <div className="space-y-3 max-h-40 overflow-y-auto">
                        {service.bookings.map((booking: any) => {
                          const statusColor = getStatusColor(booking.status);
                          const StatusIcon = getStatusIcon(booking.status);
                          return (
                            <div key={booking._id} className="bg-white p-3 rounded-xl border border-gray-200">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-900">{booking.carOwner.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {formatDate(booking.bookingDate, "short")} at {booking.timeSlot.start}
                                  </p>
                                </div>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${statusColor.bg} ${statusColor.text}`}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusColor.label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-4 gap-3 pt-4">
                    <button
                      onClick={onEdit}
                      className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={onToggleAvailability}
                      className={`px-4 py-3 ${
                        service.isAvailable ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"
                      } text-white rounded-xl transition-all flex items-center justify-center gap-2`}
                    >
                      {service.isAvailable ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Disable
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          Enable
                        </>
                      )}
                    </button>
                    <button
                      onClick={onViewAnalytics}
                      className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                    >
                      <BarChart className="h-4 w-4" />
                      Analytics
                    </button>
                    <button
                      onClick={onDelete}
                      className="px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50/80 backdrop-blur-sm px-8 py-5 flex justify-end rounded-b-3xl border-t border-gray-200">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
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