"use client";

import React, { useMemo, useState } from "react";
import { IOrder } from "@/models/orderModel";
import {
  Package,
  CalendarDays,
  CreditCard,
  MapPin,
} from "lucide-react";

interface OrderItem {
  name: string;
  image?: string;
  quantity: number;
  price: number;
}

interface UserOrderCardProps {
  order: IOrder;
}

function UserOrderCard({ order }: UserOrderCardProps) {
  if (!order) return null;

  const {
    _id,
    orderStatus,
    paymentMethod,
    isPaid,
    items,
    address,
    createdAt,
    totalAmmount,
  } = order;

  const paymentLabel =
    paymentMethod === "online" ? "Online Payment" : "Cash on Delivery";

  const paidStatus = isPaid ?? false;

  const [status, setStatus] = useState(order.orderStatus)

  // Optimized status calculation
  const step = useMemo(() => {
    switch (orderStatus) {
      case "confirmed":
        return 1;
      case "shipped":
        return 2;
      case "delivered":
        return 3;
      default:
        return 1;
    }
  }, [orderStatus]);

  return (
    <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-4 sm:p-6 hover:shadow-xl transition duration-300 space-y-5">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        {/* ORDER ID */}
        <div className="flex items-center gap-2 text-gray-700">
          <div className="p-2 bg-green-100 rounded-lg">
            <Package className="w-5 h-5 text-green-600" />
          </div>

          <div>
            <p className="text-xs text-gray-500">Order ID</p>
            <p className="text-sm font-semibold break-all">{_id}</p>
          </div>
        </div>

        {/* STATUS SECTION */}
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">

          {/* ORDER STATUS */}
          <span className="text-xs px-3 py-1 rounded-full font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm">
            {orderStatus || "Processing"}
          </span>

          {/* PAYMENT METHOD */}
          <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
            <CreditCard className="w-3 h-3" />
            {paymentLabel}
          </span>

          {/* PAYMENT STATUS */}
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${
              paidStatus
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {paidStatus ? "Paid" : "Payment Pending"}
          </span>
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {items?.map((item: OrderItem, index: number) => (
          <div
            key={index}
            className="flex items-center gap-3 sm:gap-4 bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition"
          >
            {/* IMAGE */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border bg-white flex items-center justify-center flex-shrink-0">
              <img
                src={item?.image ?? "/placeholder.png"}
                alt={item?.name ?? "product"}
                loading="lazy"
                className="w-full h-full object-cover hover:scale-110 transition duration-300"
              />
            </div>

            {/* DETAILS */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {item?.name}
              </p>

              <p className="text-xs text-gray-500">
                Qty: {item?.quantity}
              </p>
            </div>

            {/* PRICE */}
            <div className="text-sm font-bold text-gray-800 whitespace-nowrap">
              ₹{item?.price}
            </div>
          </div>
        ))}
      </div>

      {/* DELIVERY ADDRESS */}
      {address && (
        <div className="border-t pt-4">

          <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-600" />
            Delivery Address
          </p>

          <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 space-y-1">

            <p className="font-semibold">
              {address?.fullName || "Customer"}
            </p>

            {address?.mobile && (
              <p className="text-gray-600">
                📞 {address.mobile}
              </p>
            )}

            <p>{address?.fullAddress}</p>

            <p>
              {address?.city}, {address?.state}
            </p>

            <p>
              Pincode: {address?.pincode}
            </p>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="border-t pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <CalendarDays className="w-4 h-4" />
          {createdAt
            ? new Date(createdAt).toLocaleDateString()
            : "-"}
        </div>

        <div className="text-lg font-bold text-green-600">
          ₹{totalAmmount ?? 0}
        </div>

      </div>
    </div>
  );
}

export default React.memo(
  UserOrderCard,
  (prevProps, nextProps) =>
    prevProps.order?._id === nextProps.order?._id &&
    prevProps.order?.orderStatus === nextProps.order?.orderStatus
);