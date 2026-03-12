"use client";

import { motion } from "framer-motion";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";

interface Service {
  _id: string;
  name: string;
  category: string;
  price: number;
  isActive: boolean;
  garage?: {
    name: string;
  };
}

interface Props {
  services: Service[];
  onEdit?: (service: Service) => void;
  onDelete?: (id: string) => void;
}

export default function ServiceTable({ services, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Services</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Service</th>
              <th className="px-6 py-3">Garage</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {services.map((service) => (
              <motion.tr
                key={service._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-t border-gray-100 hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-medium text-gray-800">
                  {service.name}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {service.garage?.name || "—"}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {service.category}
                </td>

                <td className="px-6 py-4 font-medium text-gray-800">
                  ${service.price}
                </td>

                <td className="px-6 py-4">
                  {service.isActive ? (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                      Inactive
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => onEdit?.(service)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <HiOutlinePencil size={18} />
                    </button>

                    <button
                      onClick={() => onDelete?.(service._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <HiOutlineTrash size={18} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {services.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No services found
          </div>
        )}
      </div>
    </div>
  );
}