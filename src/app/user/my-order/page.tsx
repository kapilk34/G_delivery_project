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
  Calendar, 
  CreditCard, 
  Hash,
  Star,
  RefreshCw,
  Search,
  Filter,
  Phone,
  Mail,
  User,
  AlertCircle,
  Box,
  Navigation
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";

// ─── Types ─────────────────────────────────────────────────────────

type OrderStatus = "pending" | "Out of Delivery" | "delivered";

// ─── Status Configuration ──────────────────────────────────────────

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

// ─── Mock Socket (replace with your actual socket implementation) ───

const getSocket = () => {
  return null;
};

// ─── Utility Components ────────────────────────────────────────────

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

const ProgressBar = ({ status }: { status: OrderStatus }) => {
  const steps = [
    { label: "Ordered", icon: Box, key: "ordered" },
    { label: "Processing", icon: Clock, key: "processing" },
    { label: "Shipped", icon: Package, key: "shipped" },
    { label: "Delivered", icon: CheckCircle, key: "delivered" },
  ];

  const getStepStatus = (stepKey: string) => {
    if (status === "delivered") return "completed";
    if (status === "Out of Delivery") {
      return stepKey === "ordered" || stepKey === "processing" || stepKey === "shipped" ? "completed" : "pending";
    }
    if (status === "pending") {
      return stepKey === "ordered" ? "completed" : "pending";
    }
    return "pending";
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
            style={{
              width: status === "delivered" ? "100%" : status === "Out of Delivery" ? "66%" : "25%"
            }}
          />
        </div>
        
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step.key);
          const Icon = step.icon;
          
          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  stepStatus === "completed"
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white border-gray-200 text-gray-400"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-xs mt-2 font-medium ${
                stepStatus === "completed" ? "text-gray-900" : "text-gray-400"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
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
  status 
}: { 
  location?: { latitude: number; longitude: number }; 
  status: OrderStatus 
}) => {
  if (status !== "Out of Delivery" || !location) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Navigation className="w-5 h-5 text-blue-600 animate-pulse" />
        </div>
        <div>
          <p className="font-semibold text-blue-900 text-sm">Live Tracking</p>
          <p className="text-xs text-blue-600">Your delivery is on the way</p>
        </div>
      </div>
      
      <div className="bg-white/60 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 text-xs text-blue-700">
          <MapPin className="w-3.5 h-3.5" />
          <span>Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}</span>
        </div>
        <div className="h-24 bg-blue-100 rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_70%)]" />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-1">
            <Truck className="w-8 h-8 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Map View</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Order Card Component ──────────────────────────────────────────

const OrderCard = ({ 
  order, 
  deliveryLocation 
}: { 
  order: IOrder; 
  deliveryLocation?: { latitude: number; longitude: number };
}) => {
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

  // Mock items - replace with actual order.items
  const items = order.items || [
    { name: "Premium Wireless Headphones", quantity: 1, price: 299.99, image: "/api/placeholder/80/80" },
    { name: "USB-C Charging Cable", quantity: 2, price: 19.99, image: "/api/placeholder/80/80" },
  ];

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = order.shippingCost || 0;
  const tax = order.tax || subtotal * 0.08;
  const total = order.totalAmount || subtotal + shipping + tax;

  const deliveryBoy = order.assignedDeliveryBoy;
  const deliveryBoyName = typeof deliveryBoy === "object" ? deliveryBoy?.name || "Delivery Partner" : "Delivery Partner";
  const deliveryBoyPhone = typeof deliveryBoy === "object" ? deliveryBoy?.phone : undefined;

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
        {/* Progress Bar */}
        <div className="mb-6">
          <ProgressBar status={status} />
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
                  className="text-xs text-indigo-600 font-medium hover:text-indigo-700"
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
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium text-gray-700">
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="font-medium text-gray-700">${tax.toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-200 my-2" />
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">${total.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {order.paymentMethod || "Card ending in 4242"}
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

            {/* Live Tracking */}
            <DeliveryTracker location={deliveryLocation} status={status} />

            {/* Shipping Address */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                Shipping Address
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {order.shippingAddress || "123 Main Street, Apt 4B, New York, NY 10001"}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {status === "delivered" && (
              <button className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors border border-amber-200">
                <Star className="w-4 h-4" />
                Write a Review
              </button>
            )}
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200">
              <RefreshCw className="w-4 h-4" />
              Reorder
            </button>
          </div>
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
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
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [deliveryLocations, setDeliveryLocations] = useState<Record<string, { latitude: number; longitude: number }>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

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

    const handleStatusUpdate = (data: { orderId: string, status: string }) => {
      setOrders(prev => prev.map(o => 
        o._id?.toString() === data.orderId 
          ? { ...o, orderStatus: data.status as OrderStatus } 
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
  }, []);

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
                <div className="bg-indigo-600 p-1.5 rounded-lg">
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
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
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
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md"
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
              return (
                <OrderCard
                  key={order._id?.toString()}
                  order={order}
                  deliveryLocation={deliveryBoyId ? deliveryLocations[deliveryBoyId] : undefined}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyOrder;