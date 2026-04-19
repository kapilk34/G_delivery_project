"use client";

import React from "react";
import Image from "next/image";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import { IOrder } from "@/models/orderModel";
import {
  Package,
  CalendarDays,
  CreditCard,
  MapPin,
} from "lucide-react";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface DeliveryLocation {
  latitude: number;
  longitude: number;
}

interface UserOrderCardProps {
  order: IOrder;
  deliveryLocation?: DeliveryLocation;
}

interface OrderItem {
  name: string;
  image?: string;
  quantity: number;
  price: number;
}

interface UserOrderCardProps {
  order: IOrder;
}

function UserOrderCard({ order, deliveryLocation }: UserOrderCardProps) {
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

  const destinationPosition = address
    ? [address.latitude, address.longitude] as [number, number]
    : null;

  const showTracking = Boolean(
    order.assignedDeliveryBoy &&
      (order.orderStatus === "Out of Delivery" || order.orderStatus === "delivered")
  );

  const mapCenter = deliveryLocation
    ? [deliveryLocation.latitude, deliveryLocation.longitude]
    : destinationPosition;

  const paymentLabel =
    paymentMethod === "online" ? "Online Payment" : "Cash on Delivery";

  const paidStatus = isPaid ?? false;

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
            <p className="text-sm font-semibold break-all">{_id?.toString()}</p>
          </div>
        </div>

        {/* STATUS SECTION */}
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">

          {/* ORDER STATUS */}
          <span className="text-xs px-3 py-1 rounded-full font-medium bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-sm">
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
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border bg-white flex items-center justify-center shrink-0">
              <Image
                src={item?.image ?? "/placeholder.png"}
                alt={item?.name ?? "product"}
                width={64}
                height={64}
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

      {showTracking && destinationPosition && (
        <div className="border-t pt-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Live Delivery Tracking
          </p>

          {mapCenter ? (
            <div className="h-72 rounded-2xl overflow-hidden">
              <MapContainer center={mapCenter as [number, number]} zoom={13} scrollWheelZoom className="h-full w-full">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={destinationPosition} />
                {deliveryLocation && (
                  <Marker position={[deliveryLocation.latitude, deliveryLocation.longitude]} />
                )}
              </MapContainer>
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
              Waiting for the delivery boy&apos;s location...
            </div>
          )}
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