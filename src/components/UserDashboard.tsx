"use client"

import React, { useEffect, useRef, useState } from "react";
import HeroSection from "./HeroSection";
import CategorySlider from "./CategorySlider";
import GroceryCards from "./GroceryCards";
import UserBanner from "./UserBanner";
import Testimonials from "./Testimonials";
import Footer from "./Footer";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { setSearchQuery } from "@/redux/searchSlice";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface IGrocery {
  _id: string;
  name: string;
  category: string;
  price: string;
  unit: string;
  image: string;
}

function UserDashboard() {
  const [groceries, setGroceries] = useState<IGrocery[]>([]);
  const searchQuery = useSelector((state: RootState) => state.search.query);
  const dispatch = useDispatch<AppDispatch>();
  const grocerySectionRef = useRef<HTMLDivElement>(null);
  const prevQuery = useRef("");

  const clearSearch = () => {
    dispatch(setSearchQuery(""));
    prevQuery.current = "";
  };

  useEffect(() => {
    fetch("/api/user/groceries")
      .then((r) => r.json())
      .then(setGroceries)
      .catch(() => toast.error("Failed to load groceries"));
  }, []);

  const filtered = searchQuery
    ? groceries.filter(
        (g) =>
          g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : groceries;

  // Auto-scroll and toast when searchQuery changes
  useEffect(() => {
    if (!searchQuery || searchQuery === prevQuery.current) return;
    prevQuery.current = searchQuery;

    grocerySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    if (groceries.length === 0) return; // still loading

    if (filtered.length > 0) {
      toast.success(`Found ${filtered.length} result${filtered.length > 1 ? "s" : ""} for "${searchQuery}"`);
    } else {
      toast.error(`No groceries found for "${searchQuery}"`);
    }
  }, [searchQuery, filtered.length, groceries.length]);

  return (
    <>
      <HeroSection />
      <CategorySlider />
      <div ref={grocerySectionRef} className="w-[90%] md:w-[80%] mx-auto mt-10 scroll-mt-28">
        <h2 className="text-2xl md:text-2xl font-bold text-green-700 mb-6 text-center">
          Popular Grocery Items
        </h2>

        {/* Search results pinned at top */}
        {searchQuery && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-green-700">{filtered.length}</span> result{filtered.length !== 1 ? "s" : ""} for{" "}
                <span className="font-semibold text-gray-700">"{searchQuery}"</span>
              </p>
              <button onClick={clearSearch} className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-all">
                Clear Search
              </button>
            </div>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {filtered.map((item, index) => (
                  <GroceryCards key={index} item={item} />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-10 text-base">
                No groceries matched your search.
              </p>
            )}
            <div className="my-10 border-t border-gray-200" />
            <p className="text-sm font-semibold text-gray-500 mb-4">All Items</p>
          </div>
        )}

        {/* All items always shown below */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {groceries.map((item, index) => (
            <GroceryCards key={index} item={item} />
          ))}
        </div>
      </div>
      <UserBanner />
      <Testimonials />
      <Footer />
    </>
  );
}

export default UserDashboard;
