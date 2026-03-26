"use client";

import { JSX, useState } from "react";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  status: string;
}

interface ServicesTabProps {
  services: Service[];
  onAddService: (service: Omit<Service, "id">) => void;
}

export default function ServicesTab({ services, onAddService }: ServicesTabProps): JSX.Element {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    price: 0,
    duration: "",
    status: "active"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newService.name && newService.price > 0 && newService.duration) {
      onAddService(newService);
      setNewService({ name: "", price: 0, duration: "", status: "active" });
      setShowAddForm(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Add Service Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Services</h2>
            <p className="text-gray-500 mt-1">Manage your automotive services</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            {showAddForm ? "Cancel" : "+ Add New Service"}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
              <input
                type="text"
                value={newService.name}
                onChange={(e) => setNewService({...newService, name: e.target.value})}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={newService.price}
                onChange={(e) => setNewService({...newService, price: parseFloat(e.target.value)})}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <input
                type="text"
                value={newService.duration}
                onChange={(e) => setNewService({...newService, duration: e.target.value})}
                placeholder="e.g., 30 min"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Service
            </button>
          </form>
        )}

        {/* Services List */}
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{service.name}</h3>
                <p className="text-sm text-gray-500">Duration: {service.duration}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">${service.price.toFixed(2)}</p>
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-600 mt-1">
                  {service.status}
                </span>
              </div>
            </div>
          ))}
          
          {services.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No services added yet. Click &quot;Add New Service&quot; to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}