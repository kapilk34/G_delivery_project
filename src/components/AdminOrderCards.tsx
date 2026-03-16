"use client";

import { IOrder } from "@/models/orderModel";
import { CreditCard, MapPin, Package, Phone, User } from "lucide-react";
import React, { useState } from "react";
import Image from "next/image";
import axios from "axios";

function AdminOrderCards({ order, onStatusChange }: { order: IOrder, onStatusChange?: (orderId: string, status: string) => void }) {
  const statusOptions = ["pending", "Out of Delivery"]
  // const [status,setStatus] = useState<string>(order.orderStatus)
  const updateStatus = async (orderId:string,status:string)=>{
    try {
      const result = await axios.post(`/api/admin/updateOrderStatus/${orderId}`,{status})
      if(result?.data?.order){
        onStatusChange?.(orderId, status)
      }
      console.log(result.data)
    } catch(error){
      console.error("Failed to update order status", error);
    }
  }
  return (
    <div key={order._id?.toString()} className="bg-white shadow-md hover:shadow-lg border border-gray-100 rounded-2xl p-6 transition-all">
      
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

        <div className="space-y-1 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-bold flex items-center gap-2 text-green-700">
                <Package />
                order #{order._id?.toString().slice(-6)}
              </p>

              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${order.isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {order.isPaid ? "Paid" : "Unpaid"}
              </span>

              <p className="text-gray-500 text-sm">
                {new Date(order.createdAt!).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 md:hidden">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                order.orderStatus === "delivered"
                  ? "bg-green-100 text-green-700"
                  : order.orderStatus === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-blue-100 text-blue-700"
              }`}>
                {order.orderStatus}
              </span>

              <select value={order.orderStatus} className="border border-gray-300 rounded-lg px-3 py-1 text-sm shadow-sm hover:border-green-400 transition focus:ring-2 focus:ring-green-500 outline-none" onChange={(e)=>{
                const id = order._id?.toString()
                if (id) updateStatus(id, e.target.value)
              }}>
                {statusOptions.map(st =>(
                  <option key={st} value={st}>{st.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-3 flex-wrap">
            {order.items.map((item, idx) => (
              <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                <Image 
                  src={item.image} 
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-1 text-gray-700 text-sm">
            <p className="flex items-center gap-2 font-semibold">
              <User size={18} className="text-green-600" />
              <span>{order?.address?.fullName}</span>
            </p>

            <p className="flex items-center gap-2 font-semibold">
              <Phone size={18} className="text-green-600" />
              <span>{order?.address?.mobile}</span>
            </p>

            <p className="flex items-center gap-2 font-semibold">
              <MapPin size={18} className="text-green-600" />
              <span>{order?.address?.fullAddress}</span>
            </p>
          </div>

          <p className="flex items-center gap-2 text-sm mt-4 text-gray-700">
            <CreditCard size={20} className="text-green-600" />
            <span>{order.paymentMethod === "cod" ? "Cash On Delivery" : "Online Payment"}</span>
          </p>
        </div>

        <div className="hidden md:flex flex-col items-end gap-2">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
            order.orderStatus === "delivered"
              ? "bg-green-100 text-green-700"
              : order.orderStatus === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-blue-100 text-blue-700"
          }`}>
            {order.orderStatus}
          </span>

          <select value={order.orderStatus} className="border border-gray-300 rounded-lg px-3 py-1 text-sm shadow-sm hover:border-green-400 transition focus:ring-2 focus:ring-green-500 outline-none" onChange={(e)=>{
            const id = order._id?.toString()
            if (id) updateStatus(id, e.target.value)
          }}>
            {statusOptions.map(st =>(
              <option key={st} value={st}>{st.toUpperCase()}</option>
            ))}
          </select>
        </div>

      </div>

      <hr className="my-4 border-gray-200" />

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Delivery Status:</span>
          <span className={`font-semibold capitalize ${
            order.orderStatus === "delivered"
              ? "text-green-700"
              : order.orderStatus === "pending"
              ? "text-yellow-700"
              : "text-blue-700"
          }`}>
            {order.orderStatus}
          </span>
        </div>
        <div className="text-lg font-bold text-green-700">
          ₹{order.totalAmmount}
        </div>
      </div>
    </div>
  );
}

export default AdminOrderCards;
