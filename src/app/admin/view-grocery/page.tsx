"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Trash2 } from "lucide-react";
import Image from "next/image";
import axios from "axios";

interface IGrocery {
  _id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  image?: string;
}

function ViewGrocery() {
  const [groceries, setGroceries] = useState<IGrocery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroceries = async () => {
      try {
        const result = await axios.get("/api/admin/view-grocery");
        setGroceries(result.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroceries();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/admin/view-grocery/${id}`);
      setGroceries(groceries.filter((g) => g._id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-white pb-16">
      <Link href={"/"} className="inline-flex items-center gap-2 text-green-700 font-semibold bg-white px-4 py-2 rounded-full shadow-md hover:bg-green-100 hover:shadow-lg transition-all m-6">
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden md:flex">Back To Home</span>
      </Link>

      <div className="flex items-center justify-center gap-2 mb-8">
        <Package className="text-green-600 w-6 h-6" />
        <h1 className="text-2xl font-bold text-green-700">View Groceries</h1>
      </div>
      <div className="px-4 md:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-gray-500">Loading groceries...</div>
          </div>
        ) : groceries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-md">
            <Package className="text-gray-300 w-16 h-16 mb-4" />
            <p className="text-gray-500 text-lg">No groceries added yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groceries.map((grocery) => (
              <div
                key={grocery._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-100"
              >
                {grocery.image && (
                  <div className="relative w-full h-40 bg-gray-100">
                    <Image
                      src={grocery.image}
                      alt={grocery.name}
                      fill
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {grocery.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {grocery.category}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-green-600">
                      ₹{grocery.price}
                    </span>
                    <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                      {grocery.unit}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(grocery._id)}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewGrocery;
