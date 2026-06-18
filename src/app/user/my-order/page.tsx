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
  Navigation
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import { getSocket } from "@/lib/socket";
import dynamicImport from "next/dynamic";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import { useSession } from "next-auth/react";
import ReviewModal from "./ReviewModal";

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
  },
  "Out of Delivery": {
    label: "On the Way",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Truck,
    gradient: "from-blue-500/10 to-cyan-500/5",
    dot: "bg-blue-500",
    description: "Your order is out for delivery",
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
            className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
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
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white border-gray-200 text-gray-400"
                } ${isActive ? "ring-4 ring-indigo-100 animate-pulse" : ""}`}
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
        <span className="text-xs font-bold text-indigo-600">
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
      <p className="font-semibold text-gray-900 text-sm">${(numPrice * quantity).toFixed(2)}</p>
      <p className="text-xs text-gray-400">${numPrice.toFixed(2)} each</p>
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
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Navigation className="w-5 h-5 text-blue-600 animate-pulse" />
        </div>
        <div>
          <p className="font-semibold text-blue-900 text-sm">Live Tracking</p>
          <p className="text-xs text-blue-600">
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
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <MapPin className="w-3.5 h-3.5" />
            <span>Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}</span>
          </div>
        )}
        <div className="h-[250px] bg-blue-100 rounded-lg relative overflow-hidden z-0">
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
                  className="text-xs font-medium hover:text-green-700"
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
                <span className="font-medium text-gray-700">${subtotal.toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-200 my-2" />
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">${total.toFixed(2)}</span>
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
              <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900 text-sm">{deliveryBoyName}</p>
                    <p className="text-xs text-blue-600">Your delivery partner</p>
                  </div>
                </div>
                
                {deliveryBoyPhone && (
                  <a 
                    href={`tel:${deliveryBoyPhone}`}
                    className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 transition-colors bg-white/60 rounded-lg p-2.5"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{deliveryBoyPhone}</span>
                  </a>
                )}
              </div>
            )}

            {/* ETA and Distance Summary */}
            {status !== "delivered" && routeDetails && (
              <div className="bg-indigo-50 text-indigo-950 p-4 rounded-xl border border-indigo-100 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-gray-900 font-semi-bold">Estimated Arrival</p>
                  <p className="text-lg font-bold">{routeDetails.durationMin} mins</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 font-semi-bold">Distance Remaining</p>
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
            className="flex items-center gap-1.5 text-sm font-medium hover:text-green-700 transition-colors"
          >
            {expanded ? "Show Less" : "View Details"}
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expanded ? "rotate-90" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────

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
    return result;
  }, [orders, statusFilter, searchQuery]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.orderStatus === "pending").length,
    outForDelivery: orders.filter(o => o.orderStatus === "Out of Delivery").length,
    delivered: orders.filter(o => o.orderStatus === "delivered").length,
  }), [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-gray-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium text-sm">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                <div className="bg-green-600 p-1.5 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">My Orders</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, icon: Package, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Processing", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "On the Way", value: stats.outForDelivery, icon: Truck, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Delivered", value: stats.delivered, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className={`${stat.bg} p-2.5 rounded-xl`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {(["all", "pending", "Out of Delivery", "delivered"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    statusFilter === status
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {status === "all" ? "All" : STATUS_CONFIG[status]?.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Start shopping to view your orders here. Your order history will appear once you make a purchase.
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              Start Shopping
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No matching orders</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 px-1">
              Showing <span className="font-semibold text-gray-900">{filteredOrders.length}</span>{" "}
              {filteredOrders.length === 1 ? "order" : "orders"}
            </p>
            {filteredOrders.map((order) => {
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