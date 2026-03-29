"use client";

import AdminOrderCards from "@/components/AdminOrderCards";
import { getSocket } from "@/lib/socket";
import { IOrder } from "@/models/orderModel";
import axios from "axios";
import { ArrowLeft, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

function ManageOrders() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getOrders = async () => {
      try {
        const result = await axios.get("/api/admin/manage-orders");
        setOrders(result.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getOrders();
  }, []);

  useEffect(() => {
    const socket = getSocket()
    socket?.on("new-order",(newOrder)=>{
      setOrders((prev)=>[newOrder,...prev!])
    })
    return ()=>socket.off("new-order")
  },[])

  useEffect(() => {
    const socket = getSocket();
    const handleOrderUpdate = (data: { orderId: string; status: string }) => {
      setOrders((prev) =>
        prev.map((order) =>
          order._id?.toString() === data.orderId ? { ...order, orderStatus: data.status as "pending" | "Out of Delivery" | "delivered" } : order
        )
      );
    };

    socket?.on("order-status-update", handleOrderUpdate);

    return () => {
      socket?.off("order-status-update", handleOrderUpdate);
    };
  },[])

  const handleOrderStatusChange = (orderId: string, status: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order._id?.toString() === orderId ? { ...order, orderStatus: status } : order
      )
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-white shadow-md border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          
          <button
            className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          <h1 className="text-2xl font-bold text-gray-800">
            Manage Orders
          </h1>

          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            <Package className="w-4 h-4" />
            {orders?.length || 0} Orders
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          </div>
        )}

        {/* Empty Orders */}
        {!loading && orders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <Package className="mx-auto w-12 h-12 text-gray-400 mb-3" />
            <h2 className="text-lg font-semibold text-gray-600">
              No Orders Found
            </h2>
            <p className="text-gray-500 text-sm">
              Orders will appear here when customers place them.
            </p>
          </div>
        )}

        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <div
                key={order._id || index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
              >
                <AdminOrderCards order={order} onStatusChange={handleOrderStatusChange} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageOrders;