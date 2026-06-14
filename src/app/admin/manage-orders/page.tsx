"use client";

import { IOrder } from "@/models/orderModel";
import axios from "axios";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Truck,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Calendar,
  Hash,
  User,
  CreditCard,
  Copy,
  Check,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import { getSocket } from "@/lib/socket";

type OrderStatus = "pending" | "Out of Delivery" | "delivered";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ElementType;
    gradient: string;
    dot: string;
  }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: Clock,
    gradient: "from-amber-500/10 to-orange-500/5",
    dot: "bg-amber-500",
  },
  "Out of Delivery": {
    label: "Out for Delivery",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Truck,
    gradient: "from-blue-500/10 to-cyan-500/5",
    dot: "bg-blue-500",
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CheckCircle,
    gradient: "from-emerald-500/10 to-teal-500/5",
    dot: "bg-emerald-500",
  },
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      </div>
      <div className={`${bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} ${config.border} border`}>
      <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
      <Icon className={`w-3.5 h-3.5 ${config.color}`} />
      <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
    </div>
  );
};

const TimelineStep = ({
  label,
  time,
  active,
  completed,
  isLast,
}: {
  label: string;
  time?: string;
  active: boolean;
  completed: boolean;
  isLast: boolean;
}) => (
  <div className="flex items-start gap-3 relative">
    <div className="flex flex-col items-center">
      <div
        className={`w-3 h-3 rounded-full border-2 transition-colors duration-300 ${
          completed || active ? "bg-indigo-600 border-indigo-600" : "bg-white border-gray-300"
        }`}
      />
      {!isLast && (
        <div className={`w-0.5 h-8 mt-1 transition-colors duration-300 ${completed ? "bg-indigo-600" : "bg-gray-200"}`} />
      )}
    </div>
    <div className="pb-6">
      <p className={`text-sm font-medium ${active || completed ? "text-gray-900" : "text-gray-400"}`}>{label}</p>
      {time && <p className="text-xs text-gray-400 mt-0.5">{time}</p>}
    </div>
  </div>
);

const OrderCard = ({
  order,
  onStatusChange,
  index,
}: {
  order: IOrder;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  index: number;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);

  const status = (order.orderStatus as OrderStatus) || "pending";
  const config = STATUS_CONFIG[status];
  const orderId = order._id?.toString() || `ORD-${String(index + 1).padStart(4, "0")}`;

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
    : "N/A";
  const orderTime = order.createdAt
    ? new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : "";

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const items: OrderItem[] = (order.items || []).map((item) => ({
    name: item.name,
    quantity: item.quantity,
    price: Number(item.price),
    image: item.image,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = order.totalAmmount || subtotal;

  const handleStatusUpdate = async (s: OrderStatus) => {
    if (s === status || updating) return;
    setUpdating(true);
    try {
      await axios.post(`/api/admin/updateOrderStatus/${orderId}`, { status: s });
      onStatusChange(orderId, s);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Card Header */}
      <div className={`bg-gradient-to-r ${config.gradient} px-6 py-4 border-b ${config.border}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-400" />
              <span className="font-mono text-sm font-semibold text-gray-700 tracking-wide">{orderId.slice(-8).toUpperCase()}</span>
              <button onClick={copyOrderId} className="p-1 hover:bg-white/60 rounded-md transition-colors" title="Copy order ID">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />}
              </button>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{orderDate}</span>
              <span className="text-gray-300">•</span>
              <span>{orderTime}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={status} />
            <button onClick={() => setExpanded(!expanded)} className="p-2 hover:bg-white/60 rounded-lg transition-colors">
              {expanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Customer Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{order.address?.fullName || "—"}</p>
              </div>
            </div>
            <div className="space-y-2 pl-1">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span>{order.address?.mobile || "—"}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">
                  {[order.address?.fullAddress, order.address?.city, order.address?.state, order.address?.pincode]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items Preview */}
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Order Items ({items.length})
            </p>
            <div className="space-y-3">
              {items.slice(0, 2).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              {items.length > 2 && (
                <button onClick={() => setExpanded(true)} className="text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
                  +{items.length - 2} more items
                </button>
              )}
            </div>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-3">
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-700">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">₹{Number(total).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                </span>
              </div>
              <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${order.isPaid ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                {order.isPaid ? "Paid" : "Unpaid"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Update Status:</span>
            <div className="flex gap-1.5">
              {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusUpdate(s)}
                  disabled={updating}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                    status === s
                      ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color} ${STATUS_CONFIG[s].border} border shadow-sm`
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            {expanded ? "Show Less" : "View Details"}
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Full Items List */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" />
                All Items
              </h4>
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">₹{item.price.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Timeline + Details */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Order Timeline
              </h4>
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <TimelineStep label="Order Placed" time={orderDate} active completed isLast={false} />
                <TimelineStep
                  label="Payment Confirmed"
                  time={order.isPaid ? orderDate : undefined}
                  active={order.isPaid}
                  completed={order.isPaid}
                  isLast={false}
                />
                <TimelineStep
                  label="Out for Delivery"
                  time={status === "Out of Delivery" || status === "delivered" ? orderDate : undefined}
                  active={status === "Out of Delivery" || status === "delivered"}
                  completed={status === "delivered"}
                  isLast={false}
                />
                <TimelineStep
                  label="Delivered"
                  time={status === "delivered" ? orderDate : undefined}
                  active={status === "delivered"}
                  completed={status === "delivered"}
                  isLast
                />
              </div>

              <div className="mt-4 bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Additional Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Payment Status</p>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${order.isPaid ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                      {order.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Payment Method</p>
                    <p className="font-medium text-gray-700">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">City</p>
                    <p className="font-medium text-gray-700">{order.address?.city || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">State</p>
                    <p className="font-medium text-gray-700">{order.address?.state || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function ManageOrders() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      setIsRefreshing(true);
      const result = await axios.get("/api/admin/manage-orders");
      setOrders(result.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const handleNewOrder = (newOrder: IOrder) => setOrders((prev) => [newOrder, ...prev]);
    const handleOrderUpdate = (data: { orderId: string; status: string }) => {
      setOrders((prev) =>
        prev.map((order) =>
          order._id?.toString() === data.orderId ? { ...order, orderStatus: data.status as OrderStatus } : order
        )
      );
    };
    socket.on("new-order", handleNewOrder);
    socket.on("order-status-update", handleOrderUpdate);
    return () => {
      socket.off("new-order", handleNewOrder);
      socket.off("order-status-update", handleOrderUpdate);
    };
  }, []);

  const handleOrderStatusChange = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => (order._id?.toString() === orderId ? { ...order, orderStatus: status } : order))
    );
  };

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter !== "all") result = result.filter((o) => o.orderStatus === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o._id?.toString().toLowerCase().includes(q) ||
          o.address?.fullName?.toLowerCase().includes(q) ||
          o.address?.mobile?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, statusFilter, searchQuery]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.orderStatus === "pending").length,
    outForDelivery: orders.filter((o) => o.orderStatus === "Out of Delivery").length,
    delivered: orders.filter((o) => o.orderStatus === "delivered").length,
  }), [orders]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
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
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Order Management</h1>
              </div>
            </div>
            <button
              onClick={fetchOrders}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Orders" value={stats.total} icon={Package} color="text-indigo-600" bgColor="bg-indigo-50" />
          <StatCard label="Pending" value={stats.pending} icon={Clock} color="text-amber-600" bgColor="bg-amber-50" />
          <StatCard label="Out for Delivery" value={stats.outForDelivery} icon={Truck} color="text-blue-600" bgColor="bg-blue-50" />
          <StatCard label="Delivered" value={stats.delivered} icon={CheckCircle} color="text-emerald-600" bgColor="bg-emerald-50" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, customer name, mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {(["all", "pending", "Out of Delivery", "delivered"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    statusFilter === s
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {s === "all" ? "All Orders" : STATUS_CONFIG[s as OrderStatus]?.label || s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {loading && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-indigo-600 animate-spin" />
                <p className="text-sm font-medium text-gray-500">Loading orders...</p>
              </div>
            </div>
          )}

          {!loading && filteredOrders.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {searchQuery || statusFilter !== "all" ? "No matching orders" : "No Orders Yet"}
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Orders will appear here when customers place them."}
              </p>
            </div>
          )}

          {!loading && filteredOrders.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 px-1">
                Showing <span className="font-semibold text-gray-900">{filteredOrders.length}</span>{" "}
                {filteredOrders.length === 1 ? "order" : "orders"}
                {statusFilter !== "all" && (
                  <span> with status <span className="font-medium text-gray-900">"{STATUS_CONFIG[statusFilter]?.label}"</span></span>
                )}
              </p>
              <div className="grid gap-4">
                {filteredOrders.map((order, index) => (
                  <OrderCard
                    key={order._id?.toString() || index}
                    order={order}
                    onStatusChange={handleOrderStatusChange}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ManageOrders;
