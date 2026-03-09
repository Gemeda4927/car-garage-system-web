// components/dashboard/ServicesList.tsx
import { useState, Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { 
  Wrench, MoreVertical, Edit3, EyeOff, Eye, BarChart, Trash2, 
  Calendar, Search, CheckCircle, XCircle 
} from "lucide-react";

interface ServicesListProps {
  garage: any; // Replace with proper PopulatedGarage type
  onEdit: (service: any) => void;
  onToggleAvailability: (service: any) => void;
  onDelete: (service: any) => void;
  onViewDetails: (service: any) => void;
  onViewAnalytics: (service: any) => void;
}

export const ServicesList = ({
  garage,
  onEdit,
  onToggleAvailability,
  onDelete,
  onViewDetails,
  onViewAnalytics,
}: ServicesListProps) => {
  const [filter, setFilter] = useState<"all" | "available" | "unavailable">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  if (!garage.services || garage.services.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
        <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wrench className="h-10 w-10 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Services Yet</h3>
        <p className="text-gray-600">Add your first service to start receiving bookings.</p>
      </div>
    );
  }

  const filteredServices = garage.services.filter((service: any) => {
    if (filter === "available" && !service.isAvailable) return false;
    if (filter === "unavailable" && service.isAvailable) return false;
    if (categoryFilter !== "all" && service.category !== categoryFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        service.name.toLowerCase().includes(term) ||
        service.description?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const categories = ["all", ...new Set(garage.services.map((s: any) => s.category))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Your Services ({filteredServices.length} of {garage.services.length})
        </h3>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            {(["all", "available", "unavailable"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-2 rounded-xl text-sm capitalize ${
                  filter === status
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service: any) => (
          <div
            key={service._id}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all group cursor-pointer"
            onClick={() => onViewDetails(service)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold text-gray-900">{service.name}</h4>
                <p className="text-sm text-gray-500 mt-1 capitalize">{service.category}</p>
              </div>
              <Menu as="div" className="relative">
                <Menu.Button
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(service);
                            }}
                            className={`${
                              active ? "bg-gray-100" : ""
                            } block w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-2`}
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleAvailability(service);
                            }}
                            className={`${
                              active ? "bg-gray-100" : ""
                            } block w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-2`}
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
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewAnalytics(service);
                            }}
                            className={`${
                              active ? "bg-gray-100" : ""
                            } block w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-2`}
                          >
                            <BarChart className="h-4 w-4" />
                            Analytics
                          </button>
                        )}
                      </Menu.Item>
                      <hr className="my-1" />
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(service);
                            }}
                            className={`${
                              active ? "bg-gray-100" : ""
                            } block w-full text-left px-4 py-2 text-sm text-red-600 flex items-center gap-2`}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>

            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold text-gray-900">{service.price} ETB</span>
              <span className="text-sm text-gray-500">{service.duration} min</span>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  service.isAvailable
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {service.isAvailable ? "Available" : "Unavailable"}
              </span>

              {service.bookings && service.bookings.length > 0 && (
                <span className="text-sm text-purple-600 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {service.bookings.length} booking{service.bookings.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};