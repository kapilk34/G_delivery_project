"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";

const categories=[
    "Fruits & Vegetables",
    "Dairy & Eggs",
    "Rice, Atta & Biscuits",
    "Snacks & Branded Foods",
    "Beverages",
    "Personal Care",
    "Household & Cleaning",
    "Baby Care",
    "Pet Care",
]

const units =[
    "kg", "g", "liter", "ml", "piece", "pack"
]

function AddGrocery() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-white py-16 px-4 relative">
        <Link href={"/"} className="absolute top-6 left-6 flex items-center gap-2 text-green-700 font-semibold bg-white px-4 py-2 rounded-full shadow-md hover:bg-green-100 hover:shadow-lg transition-all">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden md:flex">Back to Home</span>
        </Link>

        <div className="bg-white w-full max-w-2xl shadow-2xl rounded-3xl border border-green-100 p-8">
            <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 cursor-pointer hover:text-green-700 transition">
                <PlusCircle className="text-green-600 w-6 h-6" />
                <h1 className="text-lg font-semibold">Add Your Grocery</h1>
            </div>
            <p className="text-gray-500 text-sm mt-2 text-center">Fill out the details bolow to add a new grocery item.</p>
            </div>

            <form className="flex flex-col gap-6 w-full">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Grocery Name<span>*</span></label>
                    <input type="text"placeholder="Eg: Sweets, Milk, rice..." id="name" name="name" required className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category<span>*</span></label>
                        <select id="category" name="category" required className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"></select>
                    </div>
                    <div></div>
                </div>
            </form>

        </div>
    </div>
  );
}

export default AddGrocery;
