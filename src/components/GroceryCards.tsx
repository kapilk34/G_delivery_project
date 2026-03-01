"use client"

import React from "react";
import mongoose from "mongoose";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";

interface IGrocery {
  _id?: mongoose.Types.ObjectId;
  name: string;
  category: string;
  price: string;
  unit: string;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
}

function GroceryCards({ item }: { item: IGrocery }) {
  const dispatch = useDispatch<AppDispatch>()

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
      <div className="relative w-full aspect-[4/3] bg-gray-50 overflow-hidden">
        <Image src={item.image} fill alt={item.name} sizes="(max-width: 768px) 100vw, 25vw" className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"  />
        <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-500 font-medium mb-1"> {item.category} </p>
        <h3>{item.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">{item.unit}</span>
          <span className="text-green-700 font-bold text-lg">₹{item.price}</span>
        </div>

        <motion.button className="mt-4 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-full py-2 text-sm font-medium transition-all" whileTap={{scale:0.96}} onClick={()}>
          <ShoppingCart/>
          Add to Cart
        </motion.button>
      </div>
    </div>
  );
}

export default GroceryCards;