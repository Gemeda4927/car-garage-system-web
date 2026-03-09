// components/dashboard/CreateGarageModal.tsx
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  Building2, Phone, Clock, Edit3, MapPin, Sun, Moon, Clock3, Clock4,
  Clock5, Clock6, Clock7, X, Save, Loader2, Car, AlertCircle, Globe, Mail
} from "lucide-react";

interface CreateGarageModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any; // Replace with proper GarageFormState type
  setFormData: (data: any) => void;
  formErrors: any;
  onSubmit: () => void;
  isLoading: boolean;
}

export const CreateGarageModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  formErrors,
  onSubmit,
  isLoading,
}: CreateGarageModalProps) => {
  const [activeTab, setActiveTab] = useState<"basic" | "contact" | "hours">("basic");

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Building2, color: "blue" },
    { id: "contact", label: "Contact", icon: Phone, color: "purple" },
    { id: "hours", label: "Hours", icon: Clock, color: "green" },
  ] as const;

  const renderBasicInfo = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <Building2 className="h-4 w-4 text-blue-600 mr-2" />
          Garage Name <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Premium Auto Care"
          className={`w-full px-5 py-4 border-2 ${
            formErrors.name ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
          } rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {formErrors.name && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {formErrors.name}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <Edit3 className="h-4 w-4 text-green-600 mr-2" />
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your garage..."
          rows={4}
          className="w-full px-5 py-4 border-2 border-gray-200 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Addis Ababa"
            className="w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            placeholder="Addis Ababa"
            className="w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 rounded-xl"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
        <input
          type="text"
          value={formData.street}
          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          placeholder="Bole Road, Near Mexico Square"
          className="w-full px-5 py-4 border-2 border-gray-200 bg-gray-50 rounded-2xl"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            placeholder="Ethiopia"
            className="w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Zip Code</label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            placeholder="1000"
            className="w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 rounded-xl"
          />
        </div>
      </div>
    </div>
  );

  const renderContactInfo = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Phone <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-4 top-4 text-gray-400 h-5 w-5" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+251 911 234 567"
            className={`w-full pl-12 pr-5 py-4 border-2 ${
              formErrors.phone ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
            } rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500`}
          />
        </div>
        {formErrors.phone && <p className="mt-2 text-sm text-red-600">{formErrors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-4 text-gray-400 h-5 w-5" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="garage@example.com"
            className={`w-full pl-12 pr-5 py-4 border-2 ${
              formErrors.email ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
            } rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500`}
          />
        </div>
        {formErrors.email && <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
        <div className="relative">
          <Globe className="absolute left-4 top-4 text-gray-400 h-5 w-5" />
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://example.com"
            className="w-full pl-12 pr-5 py-4 border-2 border-gray-200 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );

  const renderBusinessHours = () => {
    const days = [
      { key: "monday", label: "Monday", icon: Sun },
      { key: "tuesday", label: "Tuesday", icon: Clock3 },
      { key: "wednesday", label: "Wednesday", icon: Clock4 },
      { key: "thursday", label: "Thursday", icon: Clock5 },
      { key: "friday", label: "Friday", icon: Clock6 },
      { key: "saturday", label: "Saturday", icon: Clock7 },
      { key: "sunday", label: "Sunday", icon: Moon },
    ] as const;

    return (
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {days.map(({ key, label, icon: Icon }) => (
          <div key={key} className="bg-gray-50 p-5 rounded-2xl border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5 text-gray-600" />
                <span className="font-semibold text-gray-800">{label}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData[`${key}Closed`]}
                  onChange={(e) => setFormData({ ...formData, [`${key}Closed`]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {formData[`${key}Closed`] ? "Closed" : "Open"}
                </span>
              </label>
            </div>

            {!formData[`${key}Closed`] && (
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Open</label>
                  <input
                    type="time"
                    value={formData[`${key}Open`]}
                    onChange={(e) => setFormData({ ...formData, [`${key}Open`]: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Close</label>
                  <input
                    type="time"
                    value={formData[`${key}Close`]}
                    onChange={(e) => setFormData({ ...formData, [`${key}Close`]: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

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
                <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-8 py-6">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-32 -translate-y-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full transform -translate-x-24 translate-y-24"></div>
                  <Dialog.Title as="h3" className="text-2xl font-bold text-white relative flex items-center">
                    <Car className="h-6 w-6 mr-2" />
                    Create New Garage
                  </Dialog.Title>
                  <p className="text-emerald-100 text-sm mt-1 relative">Fill in the details to list your garage</p>
                </div>

                <div className="border-b border-gray-200 px-8 pt-4">
                  <nav className="flex space-x-6">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`relative pb-3 px-1 font-medium text-sm transition-all ${
                            activeTab === tab.id ? `text-${tab.color}-600` : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <span className="flex items-center space-x-2">
                            <Icon className={`h-5 w-5 ${activeTab === tab.id ? `text-${tab.color}-600` : "text-gray-400"}`} />
                            <span>{tab.label}</span>
                          </span>
                          {activeTab === tab.id && (
                            <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${tab.color}-600 rounded-full`}></span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="px-8 py-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {activeTab === "basic" && renderBasicInfo()}
                  {activeTab === "contact" && renderContactInfo()}
                  {activeTab === "hours" && renderBusinessHours()}
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
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 shadow-lg font-medium flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        <span>Create Garage</span>
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