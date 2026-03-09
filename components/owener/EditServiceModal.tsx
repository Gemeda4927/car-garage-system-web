// components/dashboard/EditServiceModal.tsx
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  Edit3, X, Save, Loader2, Tag, DollarSign,
  Clock as ClockIcon, Layers, AlertCircle
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants/dashboard.constants";

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    name: string;
    description: string;
    price: number;
    duration: number;
    category: string;
  };
  setFormData: (data: any) => void;
  formErrors: any;
  onSubmit: () => void;
  isLoading: boolean;
  service: any | null;
}

export const EditServiceModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  formErrors,
  onSubmit,
  isLoading,
  service,
}: EditServiceModalProps) => {
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
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-32 -translate-y-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full transform -translate-x-24 translate-y-24"></div>
                  <Dialog.Title as="h3" className="text-2xl font-bold text-white relative flex items-center">
                    <Edit3 className="h-6 w-6 mr-2" />
                    Edit Service
                  </Dialog.Title>
                  <p className="text-blue-100 text-sm mt-1 relative">
                    Update your service details
                  </p>
                </div>

                <div className="px-8 py-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {/* Service Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Tag className="h-4 w-4 text-blue-600 mr-2" />
                      Service Name <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-5 py-4 border-2 ${
                        formErrors.name ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                      } rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {formErrors.name && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-5 py-4 border-2 border-gray-200 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Price & Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price (ETB) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.price || ""}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        min="0"
                        className={`w-full px-5 py-4 border-2 ${
                          formErrors.price ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                        } rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {formErrors.price && (
                        <p className="mt-2 text-sm text-red-600">{formErrors.price}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Duration (mins) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.duration || ""}
                        onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                        min="5"
                        step="5"
                        className={`w-full px-5 py-4 border-2 ${
                          formErrors.duration ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                        } rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {formErrors.duration && (
                        <p className="mt-2 text-sm text-red-600">{formErrors.duration}</p>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={`w-full px-5 py-4 border-2 ${
                        formErrors.category ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                      } rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.category && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.category}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50/80 backdrop-blur-sm px-8 py-5 flex justify-end space-x-4 rounded-b-3xl border-t border-gray-200">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium flex items-center"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={onSubmit}
                    disabled={isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 shadow-lg font-medium flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        <span>Save Changes</span>
                      </>
                    )}
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