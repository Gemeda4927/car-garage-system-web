
import {
  Fragment,
  useState,
  useEffect,
} from "react";
import {
  Dialog,
  Transition,
} from "@headlessui/react";
import {
  Building2,
  PhoneCall,
  Clock,
  Edit3,
  MapPin,
  Sun,
  Moon,
  Clock3,
  Clock4,
  Clock5,
  Clock6,
  Clock7,
  X,
  Save,
  Loader2,
  Sparkles,
  AlertCircle,
  Globe,
  Mail,
  Phone,
} from "lucide-react";

interface EditGarageModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  setFormData: (data: any) => void;
  formErrors: any;
  onSubmit: () => void;
  isLoading: boolean;
}

export const EditGarageModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  formErrors,
  onSubmit,
  isLoading,
}: EditGarageModalProps) => {
  const [activeTab, setActiveTab] = useState<
    "basic" | "contact" | "hours"
  >("basic");

  // Reset active tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("basic");
    }
  }, [isOpen]);

  const handleFieldChange = (
    field: string,
    value: any
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSubmit();
  };

  const tabs = [
    {
      id: "basic",
      label: "Basic Info",
      icon: Building2,
      description:
        "Update your garage name, description and location",
    },
    {
      id: "contact",
      label: "Contact",
      icon: PhoneCall,
      description: "Update your contact details",
    },
    {
      id: "hours",
      label: "Hours",
      icon: Clock,
      description: "Update your business hours",
    },
  ] as const;

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border-2 border-blue-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <Building2 className="h-4 w-4 text-blue-600 mr-2" />
          Garage Name{" "}
          <span className="text-red-500 ml-1">
            *
          </span>
        </label>
        <input
          type="text"
          value={formData.name || ""}
          onChange={(e) =>
            handleFieldChange(
              "name",
              e.target.value
            )
          }
          placeholder="e.g., Premium Auto Care"
          className={`w-full px-5 py-4 border-2 ${
            formErrors.name
              ? "border-red-300 bg-red-50"
              : "border-gray-200 bg-white"
          } rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400`}
        />
        {formErrors.name && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {formErrors.name}
          </p>
        )}
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-2xl border-2 border-green-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <Edit3 className="h-4 w-4 text-green-600 mr-2" />
          Description
        </label>
        <textarea
          value={formData.description || ""}
          onChange={(e) =>
            handleFieldChange(
              "description",
              e.target.value
            )
          }
          placeholder="Describe your garage, services, and specialties..."
          rows={4}
          className="w-full px-5 py-4 border-2 border-gray-200 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
        />
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-2xl border-2 border-purple-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <MapPin className="h-5 w-5 text-purple-600 mr-2" />
          Address Information
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              City
            </label>
            <input
              type="text"
              value={formData.city || ""}
              onChange={(e) =>
                handleFieldChange(
                  "city",
                  e.target.value
                )
              }
              placeholder="Addis Ababa"
              className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              State
            </label>
            <input
              type="text"
              value={formData.state || ""}
              onChange={(e) =>
                handleFieldChange(
                  "state",
                  e.target.value
                )
              }
              placeholder="Addis Ababa"
              className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Street Address
          </label>
          <input
            type="text"
            value={formData.street || ""}
            onChange={(e) =>
              handleFieldChange(
                "street",
                e.target.value
              )
            }
            placeholder="Bole Road, Near Mexico Square"
            className="w-full px-5 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Country
            </label>
            <input
              type="text"
              value={
                formData.country || "Ethiopia"
              }
              onChange={(e) =>
                handleFieldChange(
                  "country",
                  e.target.value
                )
              }
              placeholder="Ethiopia"
              className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Zip Code
            </label>
            <input
              type="text"
              value={formData.zipCode || ""}
              onChange={(e) =>
                handleFieldChange(
                  "zipCode",
                  e.target.value
                )
              }
              placeholder="1000"
              className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContactInfo = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-2xl border-2 border-purple-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <Phone className="h-4 w-4 text-purple-600 mr-2" />
          Phone{" "}
          <span className="text-red-500 ml-1">
            *
          </span>
        </label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="tel"
            value={formData.phone || ""}
            onChange={(e) =>
              handleFieldChange(
                "phone",
                e.target.value
              )
            }
            placeholder="+251 911 234 567"
            className={`w-full pl-12 pr-5 py-4 border-2 ${
              formErrors.phone
                ? "border-red-300 bg-red-50"
                : "border-gray-200 bg-white"
            } rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-700`}
          />
        </div>
        {formErrors.phone && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {formErrors.phone}
          </p>
        )}
      </div>

      <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-5 rounded-2xl border-2 border-pink-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <Mail className="h-4 w-4 text-pink-600 mr-2" />
          Email{" "}
          <span className="text-red-500 ml-1">
            *
          </span>
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="email"
            value={formData.email || ""}
            onChange={(e) =>
              handleFieldChange(
                "email",
                e.target.value
              )
            }
            placeholder="garage@example.com"
            className={`w-full pl-12 pr-5 py-4 border-2 ${
              formErrors.email
                ? "border-red-300 bg-red-50"
                : "border-gray-200 bg-white"
            } rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-700`}
          />
        </div>
        {formErrors.email && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {formErrors.email}
          </p>
        )}
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-5 rounded-2xl border-2 border-indigo-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <Globe className="h-4 w-4 text-indigo-600 mr-2" />
          Website
        </label>
        <div className="relative">
          <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="url"
            value={formData.website || ""}
            onChange={(e) =>
              handleFieldChange(
                "website",
                e.target.value
              )
            }
            placeholder="https://example.com"
            className="w-full pl-12 pr-5 py-4 border-2 border-gray-200 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-700"
          />
        </div>
      </div>
    </div>
  );

  const renderBusinessHours = () => {
    const days = [
      {
        key: "monday",
        label: "Monday",
        icon: Sun,
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600",
      },
      {
        key: "tuesday",
        label: "Tuesday",
        icon: Clock3,
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
      },
      {
        key: "wednesday",
        label: "Wednesday",
        icon: Clock4,
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
      },
      {
        key: "thursday",
        label: "Thursday",
        icon: Clock5,
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        key: "friday",
        label: "Friday",
        icon: Clock6,
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200",
        iconBg: "bg-indigo-100",
        iconColor: "text-indigo-600",
      },
      {
        key: "saturday",
        label: "Saturday",
        icon: Clock7,
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
      },
      {
        key: "sunday",
        label: "Sunday",
        icon: Moon,
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        iconBg: "bg-gray-100",
        iconColor: "text-gray-600",
      },
    ];

    return (
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {days.map(
          ({
            key,
            label,
            icon: Icon,
            bgColor,
            borderColor,
            iconBg,
            iconColor,
          }) => (
            <div
              key={key}
              className={`bg-gradient-to-r ${bgColor} to-white p-5 rounded-2xl border-2 ${borderColor} hover:border-opacity-100 transition-all shadow-sm`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 ${iconBg} rounded-xl`}
                  >
                    <Icon
                      className={`h-5 w-5 ${iconColor}`}
                    />
                  </div>
                  <span className="font-semibold text-gray-800">
                    {label}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      formData[`${key}Closed`] ||
                      false
                    }
                    onChange={(e) => {
                      handleFieldChange(
                        `${key}Closed`,
                        e.target.checked
                      );
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {formData[`${key}Closed`]
                      ? "Closed"
                      : "Open"}
                  </span>
                </label>
              </div>

              {!formData[`${key}Closed`] && (
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Open
                    </label>
                    <input
                      type="time"
                      value={
                        formData[`${key}Open`] ||
                        "09:00"
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          `${key}Open`,
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Close
                    </label>
                    <input
                      type="time"
                      value={
                        formData[`${key}Close`] ||
                        "18:00"
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          `${key}Close`,
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>
    );
  };

  const getTabColor = (tabId: string) => {
    switch (tabId) {
      case "basic":
        return "text-blue-600";
      case "contact":
        return "text-purple-600";
      case "hours":
        return "text-green-600";
      default:
        return "text-blue-600";
    }
  };

  const getTabBorderColor = (tabId: string) => {
    switch (tabId) {
      case "basic":
        return "bg-blue-600";
      case "contact":
        return "bg-purple-600";
      case "hours":
        return "bg-green-600";
      default:
        return "bg-blue-600";
    }
  };

  return (
    <Transition
      appear
      show={isOpen}
      as={Fragment}
    >
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
      >
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
                <form onSubmit={handleSubmit}>
                  <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-6">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-32 -translate-y-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full transform -translate-x-24 translate-y-24"></div>
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-bold text-white relative flex items-center"
                    >
                      <Edit3 className="h-6 w-6 mr-2" />
                      Edit Garage
                    </Dialog.Title>
                    <p className="text-blue-100 text-sm mt-1 relative flex items-center">
                      <Sparkles className="h-4 w-4 mr-1" />
                      Update your garage
                      information
                    </p>
                  </div>

                  <div className="border-b border-gray-200 px-8 pt-4">
                    <nav className="flex space-x-6">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() =>
                              setActiveTab(tab.id)
                            }
                            className={`relative pb-3 px-1 font-medium text-sm transition-all group ${
                              activeTab === tab.id
                                ? getTabColor(
                                    tab.id
                                  )
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            <span className="flex items-center space-x-2">
                              <Icon
                                className={`h-5 w-5 ${activeTab === tab.id ? getTabColor(tab.id) : "text-gray-400"}`}
                              />
                              <span>
                                {tab.label}
                              </span>
                            </span>
                            {activeTab ===
                              tab.id && (
                              <span
                                className={`absolute bottom-0 left-0 right-0 h-0.5 ${getTabBorderColor(tab.id)} rounded-full`}
                              />
                            )}
                          </button>
                        );
                      })}
                    </nav>
                    <p className="text-xs text-gray-500 mt-2 mb-2">
                      {
                        tabs.find(
                          (t) =>
                            t.id === activeTab
                        )?.description
                      }
                    </p>
                  </div>

                  <div className="px-8 py-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {activeTab === "basic" &&
                      renderBasicInfo()}
                    {activeTab === "contact" &&
                      renderContactInfo()}
                    {activeTab === "hours" &&
                      renderBusinessHours()}
                  </div>

                  <div className="bg-gray-50/80 backdrop-blur-sm px-8 py-5 flex justify-end space-x-4 rounded-b-3xl border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium flex items-center"
                    >
                      <X className="h-5 w-5 mr-2" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 shadow-lg font-medium flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          <span>
                            Save Changes
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
