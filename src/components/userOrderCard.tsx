"use client";

import React from "react";
import { IOrder } from "@/models/orderModel";
import { Package, Truck, CheckCircle, CalendarDays } from "lucide-react";

interface UserOrderCardProps {
  order: IOrder;
}

function UserOrderCard({ order }: UserOrderCardProps) {
  if (!order) return null;

  const getStatusStep = () => {
    switch (order.orderStatus) {
      case "confirmed":
        return 1;
      case "shipped":
        return 2;
      case "delivered":
        return 3;
      default:
        return 1;
    }
  };

  const step = getStatusStep();

  return (
    <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-6 hover:shadow-xl transition duration-300 space-y-5">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2 text-gray-700">
          <div className="p-2 bg-green-100 rounded-lg">
            <Package className="w-5 h-5 text-green-600" />
          </div>

          <div>
            <p className="text-xs text-gray-500">Order ID</p>
            <p className="text-sm font-semibold">{order._id}</p>
          </div>
        </div>

        <span className="text-xs px-4 py-1 rounded-full font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm">
          {order.orderStatus || "Processing"}
        </span>

      </div>

      {/* PRODUCTS */}
      <div className="space-y-4">

        {order.items?.map((item: any, index: number) => (
          <div
            key={index}
            className="flex items-center gap-4 bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition"
          >
            {/* IMAGE */}
            <div className="w-16 h-16 rounded-lg overflow-hidden border bg-white flex items-center justify-center">
              <img
                src={item.image || "/placeholder.png"}
                alt={item.name}
                className="w-full h-full object-cover hover:scale-110 transition duration-300"
              />
            </div>

            {/* DETAILS */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">
                {item.name}
              </p>

              <p className="text-xs text-gray-500">
                Quantity: {item.quantity}
              </p>
            </div>

            {/* PRICE */}
            <div className="text-sm font-bold text-gray-800">
              ₹{item.price}
            </div>
          </div>
        ))}

      </div>

      {/* TRACKING */}
      <div className="border-t pt-4">

        <p className="text-sm font-semibold text-gray-700 mb-4">
          Order Tracking
        </p>

        <div className="flex items-center justify-between relative">

          {/* STEP 1 */}
          <div className="flex flex-col items-center text-center flex-1">
            <div
              className={`p-2 rounded-full ${
                step >= 1 ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              <CheckCircle
                className={`w-5 h-5 ${
                  step >= 1 ? "text-green-600" : "text-gray-300"
                }`}
              />
            </div>
            <p className="text-xs mt-2 text-gray-600">Processing</p>
          </div>

          <div
            className={`flex-1 h-[3px] ${
              step >= 2 ? "bg-green-500" : "bg-gray-200"
            }`}
          />

          {/* STEP 2 */}
          <div className="flex flex-col items-center text-center flex-1">
            <div
              className={`p-2 rounded-full ${
                step >= 2 ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              <Truck
                className={`w-5 h-5 ${
                  step >= 2 ? "text-green-600" : "text-gray-300"
                }`}
              />
            </div>

            <p className="text-xs mt-2 text-gray-600">Shipped</p>
          </div>

          <div
            className={`flex-1 h-[3px] ${
              step >= 3 ? "bg-green-500" : "bg-gray-200"
            }`}
          />

          {/* STEP 3 */}
          <div className="flex flex-col items-center text-center flex-1">
            <div
              className={`p-2 rounded-full ${
                step >= 3 ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              <Package
                className={`w-5 h-5 ${
                  step >= 3 ? "text-green-600" : "text-gray-300"
                }`}
              />
            </div>

            <p className="text-xs mt-2 text-gray-600">Delivered</p>
          </div>

        </div>

      </div>

      {/* ORDER FOOTER */}
      <div className="border-t pt-4 flex items-center justify-between">

        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <CalendarDays className="w-4 h-4" />
          {order.createdAt
            ? new Date(order.createdAt).toLocaleDateString()
            : "-"}
        </div>

        <div className="text-lg font-bold text-green-600">
          ₹{order.totalAmmount}
        </div>

      </div>

    </div>
  );
}

export default React.memo(UserOrderCard);