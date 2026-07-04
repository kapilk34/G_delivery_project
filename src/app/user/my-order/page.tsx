"use client";

export const dynamic = 'force-dynamic';

import { IOrder } from "@/models/orderModel";
import axios from "axios";
import { 
  ArrowLeft, 
  Package, 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin, 
  ChevronRight, 
  CreditCard, 
  Hash,
  Star,
  RefreshCw,
  Search,
  Phone,
  Box,
  Navigation,
  TrendingUp,
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  CalendarDays,
  ArrowUpDown
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { getSocket } from "@/lib/socket";
import dynamicImport from "next/dynamic";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import { useSession } from "next-auth/react";
import ReviewModal from "./ReviewModal";
import NavBar from "@/components/Nav";
import SkeletonLoader from "@/components/SkeletonLoader";

const DeliveryMapComponent = dynamicImport(() => import("./DeliveryMapComponent"), { ssr: false });

// ─── Review State ──────────────────────────────────────────────────
type ReviewModalState = { orderId: string; deliveryBoyName: string } | null;

type OrderStatus = "pending" | "Out of Delivery" | "delivered";

const STATUS_CONFIG: Record<OrderStatus, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ElementType;
  gradient: string;
  dot: string;
  description: string;
  chipBg: string;
  chipText: string;
  chipBorder: string;
}> = {
  pending: {
    label: "Processing",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: Clock,
    gradient: "from-amber-500/10 to-orange-500/5",
    dot: "bg-amber-500",
    description: "Your order is being prepared",
    chipBg: "bg-amber-50",
    chipText: "text-amber-700",
    chipBorder: "border-amber-200",
  },
  "Out of Delivery": {
    label: "On the Way",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: Truck,
    gradient: "from-green-500/10 to-emerald-500/5",
    dot: "bg-green-500",
    description: "Your order is out for delivery",
    chipBg: "bg-green-50",
    chipText: "text-green-700",
    chipBorder: "border-green-200",
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CheckCircle,
    gradient: "from-emerald-500/10 to-teal-500/5",
    dot: "bg-emerald-500",
    description: "Your order has been delivered",
    chipBg: "bg-emerald-50",
    chipText: "text-emerald-700",
    chipBorder: "border-emerald-200",
  },
};

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} ${config.border} border`}>
      <span className={`w-2 h-2 rounded-full ${config.dot} ${status !== "delivered" ? "animate-pulse" : ""}`} />
      <Icon className={`w-3.5 h-3.5 ${config.color}`} />
      <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
    </div>
  );
};

const ProgressBar = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { label: "Confirmed", icon: CheckCircle },
    { label: "Preparing", icon: Clock },
    { label: "Picked Up", icon: Package },
    { label: "Out for Delivery", icon: Truck },
    { label: "Arriving Soon", icon: Navigation },
    { label: "Delivered", icon: Box },
  ];

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100">
          <div 
            className="h-full bg-green-600 transition-all duration-500 rounded-full"
            style={{
              width: `${(currentStep / (steps.length - 1)) * 100}%`
            }}
          />
        </div>

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index <= currentStep;
          const isActive = index === currentStep;

          return (
            <div key={index} className="flex flex-col items-center relative z-10 flex-1">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-green-600 border-green-600 text-white"
                    : "bg-white border-gray-200 text-gray-400"
                } ${isActive ? "ring-4 ring-green-100 animate-pulse" : ""}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] mt-2 font-semibold text-center hidden sm:block ${
                isCompleted ? "text-gray-900 font-bold" : "text-gray-400"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Mobile-only active step label */}
      <div className="text-center sm:hidden mt-2">
        <span className="text-xs font-bold text-green-600">
          Status: {steps[currentStep]?.label}
        </span>
      </div>
    </div>
  );
};

const OrderItemRow = ({ 
  name, 
  quantity, 
  price, 
  image 
}: { 
  name: string; 
  quantity: number; 
  price: number; 
  image?: string 
}) => {
  const numPrice = Number(price);
  return (
  <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
      {image ? (
        <img src={image} alt={name} className="w-full h-full object-cover" />
      ) : (
        <Package className="w-6 h-6 text-gray-300" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 text-sm truncate">{name}</p>
      <p className="text-xs text-gray-500 mt-0.5">Qty: {quantity}</p>
    </div>
    <div className="text-right">
      <p className="font-semibold text-gray-900 text-sm">₹{(numPrice * quantity).toFixed(2)}</p>
      <p className="text-xs text-gray-400">₹{numPrice.toFixed(2)} each</p>
    </div>
  </div>
  );
};

const DeliveryTracker = ({ 
  location, 
  status,
  destination,
  isPickedUp,
  onRouteUpdate
}: { 
  location?: { latitude: number; longitude: number }; 
  status: OrderStatus;
  destination?: { latitude: number; longitude: number };
  isPickedUp: boolean;
  onRouteUpdate: (distanceKm: number, durationMin: number) => void;
}) => {
  if (status === "delivered") return null;

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <Navigation className="w-5 h-5 text-green-600 animate-pulse" />
        </div>
        <div>
          <p className="font-semibold text-green-900 text-sm">Live Tracking</p>
          <p className="text-xs text-green-600">
            {status === "pending" 
              ? "Preparing your order..." 
              : isPickedUp 
                ? "Your order is out for delivery!" 
                : "Delivery partner heading to the store"}
          </p>
        </div>
      </div>

      <div className="bg-white/60 rounded-lg p-3 space-y-2">
        {location && (
          <div className="flex items-center gap-2 text-xs text-green-700">
            <MapPin className="w-3.5 h-3.5" />
            <span>Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}</span>
          </div>
        )}
        <div className="h-[250px] bg-green-100 rounded-lg relative overflow-hidden z-0">
          <DeliveryMapComponent 
            deliveryLocation={location ? [location.latitude, location.longitude] : null} 
            destinationLocation={destination ? [destination.latitude, destination.longitude] : null}
            isPickedUp={isPickedUp}
            onRouteCalculated={(data: { distanceKm: number; durationMin: number }) => {
              onRouteUpdate(data.distanceKm, data.durationMin);
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ─── Order Card Component ──────────────────────────────────────────

const OrderCard = ({ 
  order, 
  deliveryLocation,
  routeDetails,
  onRouteUpdate,
  onOpenReview,
}: { 
  order: IOrder; 
  deliveryLocation?: { latitude: number; longitude: number };
  routeDetails?: { distanceKm: number; durationMin: number };
  onRouteUpdate: (distanceKm: number, durationMin: number) => void;
  onOpenReview: (orderId: string, deliveryBoyName: string) => void;
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const status = (order.orderStatus as OrderStatus) || "pending";
  const config = STATUS_CONFIG[status];

  const orderId = order._id?.toString() || "ORD-0000";
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  const orderTime = order.createdAt
    ? new Date(order.createdAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const items = order.items || [];

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const total = order.totalAmmount || subtotal;

  const deliveryBoy = order.assignedDeliveryBoy as any;
  const deliveryBoyName = typeof deliveryBoy === "object" ? deliveryBoy?.name || "Delivery Partner" : "Delivery Partner";
  const deliveryBoyPhone = typeof deliveryBoy === "object" ? deliveryBoy?.phone : undefined;

  const handleReorder = () => {
    items.forEach((item: any) => {
      dispatch(
        addToCart({
          _id: item.grocery?._id || item.grocery || Math.random().toString(),
          name: item.name,
          category: "Reordered",
          price: item.price,
          unit: item.unit,
          quantity: item.quantity,
          image: item.image,
        })
      );
    });
    router.push("/user/cart");
  };

  const currentStep = useMemo(() => {
    if (order.orderStatus === "delivered") return 5;
    if (order.isPickedUp) {
      if (routeDetails && routeDetails.distanceKm < 0.5) {
        return 4; // Arriving Soon
      }
      return 3; // Out for Delivery
    }
    if (order.assignedDeliveryBoy) {
      return 1; // Preparing (assigned & heading to store)
    }
    return 0; // Order Confirmed
  }, [order.orderStatus, order.isPickedUp, order.assignedDeliveryBoy, routeDetails]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Card Header */}
      <div className={`bg-gradient-to-r ${config.gradient} px-6 py-4 border-b ${config.border}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center">
                <Hash className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="font-mono text-sm font-semibold text-gray-700">{orderId}</p>
                <p className="text-xs text-gray-500">{orderDate} at {orderTime}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={status} />
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 hover:bg-white/60 rounded-lg transition-colors"
            >
              <ChevronRight 
                className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${expanded ? "rotate-90" : ""}`} 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="mb-6">
          <ProgressBar currentStep={currentStep} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Items Summary */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Items ({items.length})
              </h3>
              {!expanded && items.length > 2 && (
                <button 
                  onClick={() => setExpanded(true)}
                  className="text-xs font-medium text-green-600 hover:text-green-700"
                >
                  +{items.length - 2} more
                </button>
              )}
            </div>

            <div className="space-y-2">
              {(expanded ? items : items.slice(0, 2)).map((item, idx) => (
                <OrderItemRow key={idx} {...item} />
              ))}
            </div>

            {/* Live Tracking */}
            <DeliveryTracker 
              location={deliveryLocation} 
              status={status} 
              destination={order.address ? { latitude: order.address.latitude, longitude: order.address.longitude } : undefined} 
              isPickedUp={!!order.isPickedUp}
              onRouteUpdate={onRouteUpdate}
            />

          </div>

          {/* Right Column: Price & Delivery */}
          <div className="lg:col-span-5 space-y-4">
            {/* Price Breakdown */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-700">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-200 my-2" />
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                </span>
              </div>
            </div>

            {/* Delivery Info */}
            {status === "Out of Delivery" && (
              <div className="bg-green-50 rounded-xl border border-green-100 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900 text-sm">{deliveryBoyName}</p>
                    <p className="text-xs text-green-600">Your delivery partner</p>
                  </div>
                </div>

                {deliveryBoyPhone && (
                  <a 
                    href={`tel:${deliveryBoyPhone}`}
                    className="flex items-center gap-2 text-sm text-green-700 hover:text-green-800 transition-colors bg-white/60 rounded-lg p-2.5"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{deliveryBoyPhone}</span>
                  </a>
                )}
              </div>
            )}

            {/* ETA and Distance Summary */}
            {status !== "delivered" && routeDetails && (
              <div className="bg-green-50 text-green-950 p-4 rounded-xl border border-green-100 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-gray-900 font-semibold">Estimated Arrival</p>
                  <p className="text-lg font-bold">{routeDetails.durationMin} mins</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 font-semibold">Distance Remaining</p>
                  <p className="text-lg font-bold">{routeDetails.distanceKm.toFixed(1)} km</p>
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                Shipping Address
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {order.address
                  ? `${order.address.fullAddress}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`
                  : "Address not available"}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {status === "delivered" && (
              order.isReviewed ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">
                  <CheckCircle className="w-4 h-4" />
                  <span>Reviewed</span>
                  <div className="flex items-center gap-0.5 ml-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-3 h-3 ${ s <= (order.review?.rating ?? 0) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                    ))}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => onOpenReview(orderId, deliveryBoyName)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors border border-amber-200"
                >
                  <Star className="w-4 h-4" />
                  Write a Review
                </button>
              )
            )}
            <button 
              onClick={handleReorder}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
              Reorder
            </button>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
          >
            {expanded ? "Show Less" : "View Details"}
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expanded ? "rotate-90" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Modern Stat Card Component ────────────────────────────────────

const StatCard = ({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  bg, 
  border, 
  gradient,
  description,
  index 
}: { 
  label: string; 
  value: number; 
  icon: React.ElementType; 
  color: string; 
  bg: string; 
  border: string;
  gradient: string;
  description: string;
  index: number;
}) => {
  return (
    <div 
      className={`group relative bg-white rounded-2xl border ${border} p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`${bg} p-3 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className={`w-3.5 h-3.5 ${color} opacity-60`} />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
          <p className="text-sm font-semibold text-gray-700">{label}</p>
          <p className="text-xs text-gray-400 font-medium">{description}</p>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-30 group-hover:opacity-100 transition-opacity duration-300`} />
    </div>
  );
};

// ─── Modern Filter Bar Component ───────────────────────────────────

const FilterBar = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  stats,
  totalResults
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: OrderStatus | "all";
  setStatusFilter: (s: OrderStatus | "all") => void;
  stats: { total: number; pending: number; outForDelivery: number; delivered: number };
  totalResults: number;
}) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const statusOptions = [
    { value: "all" as const, label: "All Orders", count: stats.total, icon: Package },
    { value: "pending" as const, label: "Processing", count: stats.pending, icon: Clock, config: STATUS_CONFIG.pending },
    { value: "Out of Delivery" as const, label: "On the Way", count: stats.outForDelivery, icon: Truck, config: STATUS_CONFIG["Out of Delivery"] },
    { value: "delivered" as const, label: "Delivered", count: stats.delivered, icon: CheckCircle, config: STATUS_CONFIG.delivered },
  ];

  const activeFiltersCount = (searchQuery ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header Row */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-xl">
            <SlidersHorizontal className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Filters & Search</h3>
            <p className="text-xs text-gray-400">{totalResults} {totalResults === 1 ? 'order' : 'orders'} found</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
            >
              <X className="w-3 h-3" />
              Clear All ({activeFiltersCount})
            </button>
          )}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <Filter className="w-3 h-3" />
            Filters
            <ChevronDown className={`w-3 h-3 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search & Filter Content */}
      <div className={`p-6 space-y-5 ${showMobileFilters ? '' : 'hidden lg:block'}`}>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Modern Search Input */}
          <div className="relative w-full lg:w-[420px]">
            <div className={`absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none ${searchFocused ? 'ring-green-500/20' : ''}`} />
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${searchFocused ? 'text-green-600' : 'text-gray-400'}`}>
              <Search className="w-5 h-5" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by order ID, item name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Sort indicator (decorative) */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-gray-400 font-medium">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Sorted by newest first</span>
            <ArrowUpDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
          {/* <span className="text-xs font-semibold text-gray-400 tracking-wider shrink-0">Status:</span> */}
          {statusOptions.map((option) => {
            const isActive = statusFilter === option.value;
            const Icon = option.icon;

            return (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 shrink-0 ${
                  isActive
                    ? "bg-green-600 text-white shadow-lg shadow-green-600/25 scale-105"
                    : "bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-700 border border-gray-200 hover:border-green-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : option.config?.color || 'text-gray-500'}`} />
                <span>{option.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {option.count}
                </span>
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Filters Tags */}
        {activeFiltersCount > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 flex-wrap">
              {statusFilter !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold border border-green-200">
                  <Filter className="w-3 h-3" />
                  {STATUS_CONFIG[statusFilter]?.label}
                  <button 
                    onClick={() => setStatusFilter("all")} 
                    className="ml-1 p-0.5 hover:bg-green-200 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function MyOrder() {
  const router = useRouter();
  const { data: session } = useSession();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [deliveryLocations, setDeliveryLocations] = useState<Record<string, { latitude: number; longitude: number }>>({} as Record<string, { latitude: number; longitude: number }>);
  const [orderRouteDetails, setOrderRouteDetails] = useState<Record<string, { distanceKm: number; durationMin: number }>>({} as Record<string, { distanceKm: number; durationMin: number }>);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [reviewModal, setReviewModal] = useState<ReviewModalState>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

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
        setOrders(response?.data?.orders || []);
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
    if (!socket) return;

    if (session?.user?.id) {
      socket.emit("identity", session.user.id);
    }

    const handleStatusUpdate = (data: { orderId: string, status: string, isPickedUp?: boolean }) => {
      setOrders(prev => prev.map(o => 
        o._id?.toString() === data.orderId 
          ? { 
              ...o, 
              orderStatus: data.status as OrderStatus,
              isPickedUp: data.isPickedUp !== undefined ? data.isPickedUp : o.isPickedUp
            } 
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
  }, [session?.user?.id]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter !== "all") {
      result = result.filter(o => o.orderStatus === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o._id?.toString().toLowerCase().includes(q) ||
        o.items?.some((i: any) => i.name?.toLowerCase().includes(q))
      );
    }
    return [...result].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [orders, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredOrders, currentPage]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.orderStatus === "pending").length,
    outForDelivery: orders.filter(o => o.orderStatus === "Out of Delivery").length,
    delivered: orders.filter(o => o.orderStatus === "delivered").length,
  }), [orders]);

  const statCards = [
    { 
      label: "Total Orders", 
      value: stats.total, 
      icon: Package, 
      color: "text-green-700", 
      bg: "bg-green-50",
      border: "border-green-200",
      description: "All time orders"
    },
    { 
      label: "Processing", 
      value: stats.pending, 
      icon: Clock, 
      color: "text-amber-700", 
      bg: "bg-amber-50",
      border: "border-amber-200",
      description: "Currently preparing"
    },
    { 
      label: "On the Way", 
      value: stats.outForDelivery, 
      icon: Truck, 
      color: "text-green-700", 
      bg: "bg-green-50",
      border: "border-green-200",
      description: "Active deliveries"
    },
    { 
      label: "Delivered", 
      value: stats.delivered, 
      icon: CheckCircle, 
      color: "text-emerald-700", 
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      description: "Completed orders"
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <NavBar user={session?.user as any || null} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 space-y-8">
          <SkeletonLoader type="card" count={4} />
          <SkeletonLoader type="list" count={3} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <NavBar user={session?.user as any || null} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 space-y-8">

        {/* Page Header - Amazon/Flipkart Style */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-green-600 rounded-full" />
              <p className="text-xs font-bold text-green-600 uppercase tracking-widest">Order Management</p>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Orders</h1>
            <p className="text-sm text-gray-500 mt-1.5 font-medium">Track, manage, and reorder your purchases</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-600/20 hover:shadow-green-600/30 hover:-translate-y-0.5"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </button>
        </div>

        {/* Stats Cards - Modern E-commerce Style */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <StatCard key={stat.label} {...stat} index={index} />
          ))}
        </div>

        {/* Modern Filter Bar */}
        <FilterBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          stats={stats}
          totalResults={filteredOrders.length}
        />

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Package className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              Your order history is empty. Start shopping to see your orders here and track their delivery status in real-time.
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-600/20 hover:shadow-green-600/30 hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-4 h-4" />
              Start Shopping
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No matching orders</h3>
            <p className="text-sm text-gray-500 mb-6">Try adjusting your search terms or filter criteria to find what you are looking for.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Results Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-500 font-medium">
                  Showing <span className="font-bold text-gray-900">{filteredOrders.length}</span>{" "}
                  {filteredOrders.length === 1 ? "order" : "orders"}
                </p>
                {statusFilter !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold border border-green-200">
                    <Filter className="w-3 h-3" />
                    {STATUS_CONFIG[statusFilter]?.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 font-medium hidden sm:block">
                Page {currentPage} of {totalPages || 1}
              </p>
            </div>

            {paginatedOrders.map((order) => {
              const deliveryBoyId = getDeliveryBoyId(order.assignedDeliveryBoy);
              const orderIdStr = order._id?.toString() || "";

              // Fallback to coordinates stored in database for the delivery boy if socket updates haven't arrived yet
              let deliveryLoc = deliveryBoyId ? deliveryLocations[deliveryBoyId] : undefined;
              if (!deliveryLoc && order.assignedDeliveryBoy && typeof order.assignedDeliveryBoy === "object") {
                const dbBoy = order.assignedDeliveryBoy as any;
                if (dbBoy.location && dbBoy.location.coordinates && dbBoy.location.coordinates[0] !== 0) {
                  deliveryLoc = {
                    latitude: dbBoy.location.coordinates[1],
                    longitude: dbBoy.location.coordinates[0]
                  };
                }
              }

              return (
                <OrderCard
                  key={orderIdStr}
                  order={order}
                  deliveryLocation={deliveryLoc}
                  routeDetails={orderRouteDetails[orderIdStr]}
                  onRouteUpdate={(distanceKm, durationMin) => {
                    setOrderRouteDetails(prev => ({
                      ...prev,
                      [orderIdStr]: { distanceKm, durationMin }
                    }));
                  }}
                  onOpenReview={(orderId, deliveryBoyName) => setReviewModal({ orderId, deliveryBoyName })}
                />
              );
            })}

            {/* Modern Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10 pt-6">
                <button 
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Previous
                </button>

                <div className="flex items-center gap-1.5">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    const isActive = currentPage === page;

                    // Show first, last, current, and neighbors
                    const shouldShow = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                    const showEllipsis = (page === 2 && currentPage > 3) || (page === totalPages - 1 && currentPage < totalPages - 2);

                    if (showEllipsis) {
                      return <span key={page} className="px-2 text-gray-400 font-bold">...</span>;
                    }
                    if (!shouldShow) return null;

                    return (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                          isActive 
                            ? "bg-green-600 text-white shadow-lg shadow-green-600/25 scale-110" 
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button 
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {reviewModal && (
        <ReviewModal
          orderId={reviewModal.orderId}
          deliveryBoyName={reviewModal.deliveryBoyName}
          onClose={() => setReviewModal(null)}
          onSuccess={(reviewedOrderId) => {
            setOrders(prev => prev.map(o =>
              o._id?.toString() === reviewedOrderId ? { ...o, isReviewed: true } : o
            ));
          }}
        />
      )}
    </div>
  );
}

export default MyOrder;