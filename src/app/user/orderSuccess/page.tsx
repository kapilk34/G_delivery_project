"use client";
import React from "react";
import { CheckCircle, Truck } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

function OrderSuccess() {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg w-full text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle size={70} className="text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800">
          Order Placed Successfully
        </h1>
        <p className="text-gray-500 mt-2">
          Thank you for shopping with us. Your groceries are on the way!
        </p>

        <div className="flex items-center justify-center gap-2 text-green-600 mt-5">
          <Truck size={18} />
          <p className="text-sm">Your delivery partner will reach you soon.</p>
        </div>

        <motion.div whileTap={{ scale: 0.93 }} className="mt-6">
          <Link href="/user/my-order">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-all duration-300">
              Go To My Orders
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default OrderSuccess;
