// components/dashboard/ServiceAnalyticsModal.tsx
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { BarChart, Star, TrendingUp, X } from "lucide-react";

interface ServiceAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: any | null;
  analytics: {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
    averageRating: number;
    monthlyTrend?: Array<{
      month: string;
      bookings: number;
      revenue: number;
    }>;
  } | null;
}

export const ServiceAnalyticsModal = ({
  isOpen,
  onClose,
  service,
  analytics,
}: ServiceAnalyticsModalProps) => {
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-32 -translate-y-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full transform -translate-x-24 translate-y-24"></div>
                  <Dialog.Title as="h3" className="text-2xl font-bold text-white relative flex items-center">
                    <BarChart className="h-6 w-6 mr-2" />
                    {service.name} - Analytics
                  </Dialog.Title>
                </div>

                <div className="p-8">
                  {analytics ? (
                    <div className="space-y-8">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl text-center">
                          <p className="text-sm text-gray-600">Total Bookings</p>
                          <p className="text-2xl font-bold text-gray-900">{analytics.totalBookings}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl text-center">
                          <p className="text-sm text-gray-600">Completed</p>
                          <p className="text-2xl font-bold text-gray-900">{analytics.completedBookings}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl text-center">
                          <p className="text-sm text-gray-600">Cancelled</p>
                          <p className="text-2xl font-bold text-gray-900">{analytics.cancelledBookings}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl text-center">
                          <p className="text-sm text-gray-600">Revenue</p>
                          <p className="text-2xl font-bold text-gray-900">{analytics.totalRevenue} ETB</p>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="bg-yellow-50 p-6 rounded-2xl">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <Star className="h-5 w-5 text-yellow-600 mr-2" />
                          Average Rating
                        </h4>
                        <div className="flex items-center gap-4">
                          <span className="text-4xl font-bold text-gray-900">
                            {analytics.averageRating.toFixed(1)}
                          </span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-6 w-6 ${
                                  star <= Math.round(analytics.averageRating)
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Monthly Trend */}
                      {analytics.monthlyTrend && analytics.monthlyTrend.length > 0 && (
                        <div className="bg-gray-50 p-6 rounded-2xl">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                            Monthly Trend
                          </h4>
                          <div className="space-y-3">
                            {analytics.monthlyTrend.map((month) => (
                              <div key={month.month} className="flex items-center gap-4">
                                <span className="w-24 text-sm text-gray-600">{month.month}</span>
                                <div className="flex-1 h-8 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                    style={{
                                      width: `${(month.bookings / Math.max(...analytics.monthlyTrend!.map((m) => m.bookings))) * 100}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-900">{month.bookings} bookings</span>
                                <span className="text-sm text-gray-600">{month.revenue} ETB</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BarChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No analytics data available yet.</p>
                    </div>
                  )}
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