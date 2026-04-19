"use client";

import { IOrder } from "@/models/orderModel";
import axios from "axios";
import { ArrowLeft, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import UserOrderCard from "@/components/userOrderCard";
import { getSocket } from "@/lib/socket";

function MyOrder() {
  const router = useRouter();

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [deliveryLocations, setDeliveryLocations] = useState<Record<string, { latitude: number; longitude: number }>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const getDeliveryBoyId = (assignedDeliveryBoy: any) => {
    if (!assignedDeliveryBoy) return undefined;
    if (typeof assignedDeliveryBoy === "string") return assignedDeliveryBoy;
    if (typeof assignedDeliveryBoy === "object") {
      return assignedDeliveryBoy._id?.toString?.() ?? String(assignedDeliveryBoy);
    }
    return String(assignedDeliveryBoy);
  };

  useEffect(() => {
    const getMyOrders = async () => {
      try {
        const response = await axios.get("/api/user/my-orders");

        if (response?.data?.orders) {
          setOrders(response.data.orders);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    getMyOrders();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    
    const handleStatusUpdate = (data: { orderId: string, status: string }) => {
      setOrders(prevOrders => prevOrders.map(o => 
        o._id?.toString() === data.orderId 
          ? { ...o, orderStatus: data.status as "pending" | "Out of Delivery" | "delivered" } 
          : o
      ));
    };

    const handleLocationUpdate = (data: { deliveryBoyId: string, latitude: number, longitude: number }) => {
      setDeliveryLocations(prev => ({
        ...prev,
        [data.deliveryBoyId]: {
          latitude: data.latitude,
          longitude: data.longitude,
        }
      }));
    };

    socket.on("orderStatusUpdated", handleStatusUpdate);
    socket.on("order-status-update", handleStatusUpdate);
    socket.on("deliveryBoyLocationUpdated", handleLocationUpdate);

    return () => {
      socket.off("orderStatusUpdated", handleStatusUpdate);
      socket.off("order-status-update", handleStatusUpdate);
      socket.off("deliveryBoyLocationUpdated", handleLocationUpdate);
    };
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-600 text-lg">
        Loading your orders...
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">

          <button
            className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-5 h-5" />

            <h1 className="text-xl font-semibold text-gray-800">
              My Orders
            </h1>

          </button>

        </div>
      </div>

      {/* EMPTY STATE */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 px-4">

          <Package className="w-16 h-16 text-gray-400 mb-4" />

          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Orders Found
          </h2>

          <p className="text-gray-500 text-sm mb-6">
            Start shopping to view your orders here.
          </p>

          <button
            onClick={() => router.push("/")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full text-sm font-medium transition"
          >
            Start Shopping
          </button>

        </div>
      ) : (
        <div className="max-w-6xl mx-auto p-4 space-y-4">

          {orders.map((order) => {
            const deliveryBoyId = getDeliveryBoyId(order.assignedDeliveryBoy);
            return (
              <UserOrderCard
                key={order._id?.toString()}
                order={order}
                deliveryLocation={deliveryBoyId ? deliveryLocations[deliveryBoyId] : undefined}
              />
            );
          })}

        </div>
      )}

    </div>
  );
}

export default MyOrder;