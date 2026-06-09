"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import GroceryCards from "@/components/GroceryCards";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { setSearchQuery } from "@/redux/searchSlice";
import toast from "react-hot-toast";
import NavBar from "@/components/Nav";
import Footer from "@/components/Footer";
import {
  Search,
  Filter,
  X,
  ShoppingBag,
  Leaf,
  TrendingUp,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

interface IGrocery {
  _id: string;
  name: string;
  category: string;
  price: string;
  unit: string;
  image: string;
}

interface IUser {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  mobile?: string;
  image?: string;
}

const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="aspect-[4/3] bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded-full w-24" />
      </div>
    </div>
  </div>
);

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    fruits: "🍎",
    vegetables: "🥬",
    dairy: "🥛",
    bakery: "🥖",
    meat: "🥩",
    seafood: "🦐",
    beverages: "🥤",
    snacks: "🍿",
    frozen: "🧊",
    pantry: "🥫",
    organic: "🌿",
  };
  return icons[category.toLowerCase()] || "🛒";
};

const ShopPage = () => {
  const [groceries, setGroceries] = useState<IGrocery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [user, setUser] = useState<IUser | null>(null);
  const [sortBy, setSortBy] = useState<
    "default" | "price-asc" | "price-desc" | "name"
  >("default");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);

  const searchQuery = useSelector((state: RootState) => state.search.query);
  const dispatch = useDispatch<AppDispatch>();
  const prevQuery = useRef("");
  const mainRef = useRef<HTMLDivElement>(null);

  const clearSearch = () => {
    dispatch(setSearchQuery(""));
    prevQuery.current = "";
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/me");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.log("User not authenticated");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchGroceries = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/user/groceries");
        const data = await response.json();
        setGroceries(data);

        const uniqueCategories = [
          ...new Set(data.map((item: IGrocery) => item.category)),
        ];
        setCategories(uniqueCategories as string[]);

        const prices = data.map(
          (item: IGrocery) => parseFloat(item.price) || 0,
        );
        const max = Math.max(...prices, 100);
        setMaxPrice(Math.ceil(max / 10) * 10);
        setPriceRange([0, Math.ceil(max / 10) * 10]);
      } catch (error) {
        console.error("Failed to load groceries:", error);
        toast.error("Failed to load groceries");
      } finally {
        setLoading(false);
      }
    };
    fetchGroceries();
  }, []);

  // Filter and sort groceries
  const filtered = useMemo(() => {
    let result = groceries.filter((g) => {
      const matchesSearch =
        !searchQuery ||
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || g.category === selectedCategory;

      const itemPrice = parseFloat(g.price) || 0;
      const matchesPrice =
        itemPrice >= priceRange[0] && itemPrice <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });

    switch (sortBy) {
      case "price-asc":
        result.sort(
          (a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0),
        );
        break;
      case "price-desc":
        result.sort(
          (a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0),
        );
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }, [groceries, searchQuery, selectedCategory, sortBy, priceRange]);

  useEffect(() => {
    if (!searchQuery || searchQuery === prevQuery.current) return;
    prevQuery.current = searchQuery;

    if (groceries.length === 0) return;

    if (filtered.length > 0) {
      toast.success(
        `Found ${filtered.length} result${filtered.length > 1 ? "s" : ""} for "${searchQuery}"`,
        { icon: "🔍", duration: 2000 },
      );
    } else {
      toast.error(`No groceries found for "${searchQuery}"`, {
        duration: 2000,
      });
    }

    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [searchQuery, filtered.length, groceries.length]);

  // Stats
  const stats = useMemo(
    () => ({
      totalProducts: groceries.length,
      totalCategories: categories.length,
      avgPrice:
        groceries.length > 0
          ? (
              groceries.reduce(
                (sum, g) => sum + (parseFloat(g.price) || 0),
                0,
              ) / groceries.length
            ).toFixed(2)
          : "0.00",
    }),
    [groceries, categories],
  );

  return (
    <>
      {showMobileFilters && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setShowMobileFilters(false)}
        />
      )}

      <div className="flex h-screen overflow-hidden  bg-gray-50/80">
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 shrink-0 h-full 
            overflow-y-auto bg-white/95 backdrop-blur-xl 
            border-r border-gray-200/80 px-5 py-6 flex flex-col gap-4
            shadow-2xl lg:shadow-none transform transition-transform duration-300 ease-out
            ${showMobileFilters ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="lg:hidden flex justify-end mb-2">
            <button
              onClick={() => setShowMobileFilters(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Category Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3 ml-1">
              <Filter size={13} className="text-green-500" />
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                Categories
              </p>
            </div>
            <div className="flex flex-col gap-1">
              {["all", ...categories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`
                    w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                    flex items-center gap-3 group
                    ${
                      selectedCategory === cat
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-200/60 scale-[1.02]"
                        : "text-gray-600 hover:bg-green-50/80 hover:text-green-700 hover:pl-5"
                    }
                  `}
                >
                  <span
                    className={`text-lg transition-transform duration-200 ${selectedCategory === cat ? "scale-110" : "group-hover:scale-110"}`}
                  >
                    {cat === "all" ? "🛍️" : getCategoryIcon(cat)}
                  </span>
                  <span className="flex-1">
                    {cat === "all" ? "All Products" : cat}
                  </span>
                  {selectedCategory === cat && (
                    <ChevronRight size={14} className="opacity-70" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          {!loading && categories.length > 0 && (
            <>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              <div>
                <div className="flex items-center gap-2 mb-3 ml-1">
                  <SlidersHorizontal size={13} className="text-green-500" />
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                    Price Range
                  </p>
                </div>
                <div className="px-2">
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([0, parseInt(e.target.value)])
                    }
                    className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between mt-2 text-xs font-semibold text-gray-500">
                    <span>$0</span>
                    <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      Up to Rs.{priceRange[1]}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main ref={mainRef} className="flex-1 overflow-y-auto scroll-smooth">
          {/* Hero Banner */}
          {!searchQuery && selectedCategory === "all" && !loading && (
            <div className="mx-6 mt-6 mb-6">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-8 lg:p-10 shadow-xl shadow-green-200/40">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
                    <Leaf size={14} className="text-white" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Fresh & Organic
                    </span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    Farm to Table
                  </h1>
                  <p className="text-green-50 text-sm lg:text-base max-w-md mb-6">
                    Discover premium quality groceries sourced directly from
                    local farms. Freshness guaranteed.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-white/30 border-2 border-white/50 flex items-center justify-center text-xs text-white font-bold"
                        >
                          {getCategoryIcon(categories[i - 1] || "organic")}
                        </div>
                      ))}
                    </div>
                    <p className="text-white/80 text-sm font-medium">
                      <span className="text-white font-bold">
                        {stats.totalProducts}+
                      </span>{" "}
                      products available
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="px-6 py-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  {searchQuery ? (
                    <>
                      <Search size={24} className="text-green-500" />
                      Search Results
                    </>
                  ) : selectedCategory === "all" ? (
                    <>
                      <ShoppingBag size={24} className="text-green-500" />
                      All Products
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">
                        {getCategoryIcon(selectedCategory)}
                      </span>
                      {selectedCategory}
                    </>
                  )}
                </h2>
                <p className="text-sm text-gray-400 mt-1 font-medium">
                  {filtered.length} item{filtered.length !== 1 ? "s" : ""}{" "}
                  available
                  {selectedCategory !== "all" &&
                    !searchQuery &&
                    ` in ${selectedCategory}`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-green-400 hover:text-green-600 transition-all shadow-sm"
                >
                  <SlidersHorizontal size={16} />
                  Filters
                </button>

                {/* Sort Dropdown */}
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-gray-600 hover:border-green-400 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none cursor-pointer transition-all shadow-sm"
                  >
                    <option value="default">Sort by: Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name">Name: A-Z</option>
                  </select>
                  <ChevronRight
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Sticky Search Bar */}
            <div className="sticky top-0 z-30 py-4 mb-6 backdrop-blur-md">
              <div className="max-w-lg mx-auto">
                <div className="relative group">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-green-100 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-all duration-300 blur-xl" />

                  {/* Search Container */}
                  <div className="relative flex items-center gap-3 bg-white/95 border border-gray-200 rounded-2xl px-5 py-3 shadow-sm hover:shadow-md focus-within:border-green-500 focus-within:shadow-lg focus-within:shadow-green-100 transition-all duration-300">
                    <Search size={18} className="text-green-500 shrink-0" />

                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                      className="w-full bg-transparent outline-none text-gray-700 placeholder:text-gray-400 text-sm font-medium"
                    />

                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <X size={15} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Active search banner */}
            {searchQuery && (
              <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/80 rounded-2xl px-6 py-4 mb-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Search size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-bold text-green-700 text-lg">
                        {filtered.length}
                      </span>
                      <span className="text-gray-500">
                        {" "}
                        result{filtered.length !== 1 ? "s" : ""} for{" "}
                      </span>
                      <span className="font-bold text-gray-800 bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                        &ldquo;{searchQuery}&rdquo;
                      </span>
                    </p>
                    {selectedCategory !== "all" && (
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Filter size={10} /> Filtered by {selectedCategory}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={clearSearch}
                  className="flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-900 bg-green-100 hover:bg-green-200 px-4 py-2 rounded-xl transition-all"
                >
                  <X size={14} />
                  Clear
                </button>
              </div>
            )}

            {/* Grid / States */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
                {filtered.map((item, index) => (
                  <div
                    key={item._id}
                    className="animate-fadeIn"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <GroceryCards item={item} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-50 to-emerald-100 rounded-full flex items-center justify-center">
                    <Search size={40} className="text-green-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
                    <X size={16} className="text-red-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  No results found
                </h3>
                <p className="text-sm text-gray-400 max-w-sm mb-8 leading-relaxed">
                  {searchQuery
                    ? `We couldn't find anything matching "${searchQuery}". Try adjusting your search or filters.`
                    : `No items available in ${selectedCategory}. Try selecting a different category.`}
                </p>
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-green-200/50 hover:shadow-xl hover:shadow-green-200/60 hover:-translate-y-0.5"
                  >
                    <X
                      size={16}
                      className="group-hover:rotate-90 transition-transform"
                    />
                    Clear Search
                  </button>
                )}
              </div>
            )}
            <div className="h-2" />
          </div>
        </main>
      </div>

      {/* Add custom animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </>
  );
};

export default ShopPage;
