"use client";

import React from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import {
  HiOutlineEye,
  HiOutlineCheckCircle,
  HiOutlineRefresh,
  HiOutlineStar,
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineClock,
} from "react-icons/hi";

import { HiOutlineBuildingOffice } from "react-icons/hi2";

import { PopulatedGarage } from "@/lib/types/garage.types";

interface GarageTableProps {
  garages?: PopulatedGarage[] | null;
  loading?: boolean;
  error?: string | null;

  onVerify?: (id: string) => void;
  onToggleActive?: (id: string) => void;
  onFeature?: (id: string) => void;
  onViewDetails?: (garage: PopulatedGarage) => void;
}

export function GarageTable({
  garages,
  loading,
  error,
  onVerify,
  onToggleActive,
  onFeature,
  onViewDetails,
}: GarageTableProps) {

  const garageList = Array.isArray(garages) ? garages : [];

  const handleAction = (
    action: string,
    id?: string,
    garage?: PopulatedGarage
  ) => {

    if (!id) {
      toast.error("Invalid garage");
      return;
    }

    switch (action) {

      case "view":
        garage && onViewDetails?.(garage);
        break;

      case "verify":
        onVerify?.(id);
        toast.success("Garage verified");
        break;

      case "toggle":
        onToggleActive?.(id);
        toast.success("Garage status updated");
        break;

      case "feature":
        onFeature?.(id);
        toast.success("Garage featured");
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  if (garageList.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
        No garages found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

      <div className="overflow-x-auto">

        <table className="min-w-full divide-y">

          {/* HEADER */}

          <thead className="bg-gray-50 text-xs uppercase text-gray-500">

            <tr>
              <th className="px-6 py-3 text-left">Garage</th>
              <th className="px-6 py-3 text-left">Owner</th>
              <th className="px-6 py-3 text-left">Address</th>
              <th className="px-6 py-3 text-left">Contact</th>
              <th className="px-6 py-3 text-left">Services</th>
              <th className="px-6 py-3 text-left">Stats</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Created</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>

          </thead>

          {/* BODY */}

          <tbody className="divide-y">

            {garageList.map((garage, index) => {

              const owner =
                typeof garage.owner === "object"
                  ? garage.owner
                  : null;

              return (

                <motion.tr
                  key={garage._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="hover:bg-gray-50"
                >

                  {/* GARAGE */}

                  <td className="px-6 py-4">

                    <div className="flex gap-3">

                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <HiOutlineBuildingOffice className="text-indigo-600" />
                      </div>

                      <div>

                        <div className="font-medium">
                          {garage.name}
                        </div>

                        <div className="text-xs text-gray-500">
                          ID: {garage._id.slice(-6)}
                        </div>

                        <div className="text-xs text-gray-400 max-w-xs line-clamp-2">
                          {garage.description}
                        </div>

                      </div>

                    </div>

                  </td>

                  {/* OWNER */}

                  <td className="px-6 py-4 text-sm">

                    {owner && (
                      <div>

                        <div className="font-medium">
                          {owner.name}
                        </div>

                        <div className="text-xs text-gray-500 flex gap-1 items-center">
                          <HiOutlineMail className="w-3 h-3"/>
                          {owner.email}
                        </div>

                        {owner.phone && (
                          <div className="text-xs text-gray-500 flex gap-1 items-center">
                            <HiOutlinePhone className="w-3 h-3"/>
                            {owner.phone}
                          </div>
                        )}

                      </div>
                    )}

                  </td>

                  {/* ADDRESS */}

                  <td className="px-6 py-4 text-sm">

                    {garage.address && (

                      <div className="flex gap-1 text-gray-600">

                        <HiOutlineLocationMarker className="mt-1"/>

                        <div>

                          {garage.address.street}

                          <div className="text-xs text-gray-500">
                            {garage.address.city}, {garage.address.state}
                          </div>

                          <div className="text-xs text-gray-400">
                            {garage.address.country}
                          </div>

                        </div>

                      </div>

                    )}

                  </td>

                  {/* CONTACT */}

                  <td className="px-6 py-4 text-xs">

                    {garage.contactInfo && (

                      <div className="space-y-1">

                        <div className="flex gap-1 items-center">
                          <HiOutlinePhone/>
                          {garage.contactInfo.phone}
                        </div>

                        <div className="flex gap-1 items-center">
                          <HiOutlineMail/>
                          {garage.contactInfo.email}
                        </div>

                      </div>

                    )}

                  </td>

                  {/* SERVICES */}

                  <td className="px-6 py-4 text-xs">

                    {garage.services?.length ? (

                      <div className="space-y-1">

                        {garage.services.map((s) => (
                          <div key={s._id} className="text-gray-600">
                            {s.name} - {s.price} ETB
                          </div>
                        ))}

                      </div>

                    ) : "No services"}

                  </td>

                  {/* STATS */}

                  <td className="px-6 py-4 text-xs">

                    <div>

                      <div>
                        Bookings: {garage.stats?.totalBookings}
                      </div>

                      <div>
                        Completed: {garage.stats?.completedBookings}
                      </div>

                      <div className="flex items-center gap-1">
                        <HiOutlineStar className="text-yellow-500"/>
                        {garage.stats?.averageRating}
                      </div>

                    </div>

                  </td>

                  {/* STATUS */}

                  <td className="px-6 py-4 text-xs">

                    <div className="flex flex-col gap-1">

                      {garage.isVerified ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full w-fit">
                          Verified
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full w-fit">
                          Pending
                        </span>
                      )}

                      {garage.isActive ? (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full w-fit">
                          Active
                        </span>
                      ) : (
                        <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full w-fit">
                          Inactive
                        </span>
                      )}

                    </div>

                  </td>

                  {/* CREATED */}

                  <td className="px-6 py-4 text-xs">

                    <div className="flex items-center gap-1">

                      <HiOutlineClock/>

                      {new Date(
                        garage.createdAt
                      ).toLocaleDateString()}

                    </div>

                  </td>

                  {/* ACTIONS */}

                  <td className="px-6 py-4">

                    <div className="flex justify-end gap-2 text-lg">

                      <button
                        onClick={() =>
                          handleAction("view", garage._id, garage)
                        }
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <HiOutlineEye/>
                      </button>

                      {!garage.isVerified && (
                        <button
                          onClick={() =>
                            handleAction("verify", garage._id)
                          }
                          className="p-2 hover:bg-green-100 text-green-600 rounded"
                        >
                          <HiOutlineCheckCircle/>
                        </button>
                      )}

                      <button
                        onClick={() =>
                          handleAction("toggle", garage._id)
                        }
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded"
                      >
                        <HiOutlineRefresh/>
                      </button>

                      <button
                        onClick={() =>
                          handleAction("feature", garage._id)
                        }
                        className="p-2 hover:bg-yellow-100 text-yellow-600 rounded"
                      >
                        <HiOutlineStar/>
                      </button>

                    </div>

                  </td>

                </motion.tr>

              );

            })}

          </tbody>

        </table>

      </div>

    </div>
  );
}