"use client";

import axios from "axios";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import nextDynamic from "next/dynamic";
import {
  MapPin, Package, Navigation, CheckCircle, XCircle, Bell, Clock, Truck, Layers, Target, Route, Expand, Minimize2, LocateFixed, Timer, DollarSign, Ban, Award, ChevronRight, ArrowUpRight, Phone, Calendar, Star, ShieldCheck, Zap, TrendingUp, Sparkles, Info, Hash, Box, ShoppingBag, CreditCard, ArrowLeft, Home
} from "lucide-react";
import { getSocket } from "@/lib/socket";
import { motion, AnimatePresence } from "motion/react";
import { IOrder } from "@/models/orderModel";
import Link from "next/link";

const DeliveryMapComponent = nextDynamic(() => import("./DeliviveryMapComponent"), { ssr: false });

type AssignmentItem = {
  _id: string;
  status: "broadcasted" | "assigned" | "completed";
  order: IOrder;
  createdAt?: Date | string;
  acceptedAt?: Date | string;
};

type LatLng = [number, number];

interface AxiosError {
  response?: { data?: { message?: string } };
  message?: string;
}

// ─── Premium Status Configuration ─────────────────────────────────────────────
type AssignmentStatus = "broadcasted" | "assigned" | "completed";

const STATUS_CONFIG: Record<AssignmentStatus, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ElementType;
  gradient: string;
  dot: string;
  description: string;
}> = {
  broadcasted: {
    label: "New Request",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: Bell,
    gradient: "from-amber-500/10 to-orange-500/5",
    dot: "bg-amber-500",
    description: "New broadcasted delivery request",
  },
  assigned: {
    label: "In Progress",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Truck,
    gradient: "from-blue-500/10 to-cyan-500/5",
    dot: "bg-blue-500",
    description: "Delivery is in progress",
  },
  completed: {
    label: "Completed",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CheckCircle,
    gradient: "from-emerald-500/10 to-teal-500/5",
    dot: "bg-emerald-500",
    description: "Order has been delivered",
  },
};

const calculateEarning = (distanceKm: number | null): { amount: number; breakdown: string } => {
  if (distanceKm === null) return { amount: 40, breakdown: "Base fare (distance pending)" };
  if (distanceKm < 3) return { amount: 40, breakdown: `Flat rate for <3 km` };
  const amount = Math.round(distanceKm * 12);
  return { amount, breakdown: `${distanceKm.toFixed(1)} km × ₹12/km` };
};

const StatusBadge = ({ status }: { status: AssignmentStatus }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.broadcasted;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} ${config.border} border`}>
      <span className={`w-2 h-2 rounded-full ${config.dot} ${status === "broadcasted" ? "animate-pulse" : ""}`} />
      <Icon className={`w-3.5 h-3.5 ${config.color}`} />
      <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
    </div>
  );
};

// ─── Progress Bar ──────────────────────────────────────────────────────────
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
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white border-gray-200 text-gray-400"
                  } ${isActive ? "ring-4 ring-indigo-100 animate-pulse" : ""}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] mt-2 font-semibold text-center hidden sm:block ${isCompleted ? "text-gray-900 font-bold" : "text-gray-400"
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
    </div>
  );
};

// ─── Delivery Tracker Map ──────────────────────────────────────────────────
const DeliveryTracker = ({
  location,
  status,
  destination,
  isPickedUp,
  onRouteCalculated,
}: {
  location: [number, number] | null;
  status: AssignmentStatus;
  destination: [number, number];
  isPickedUp: boolean;
  onRouteCalculated: (data: { distanceKm: number; durationMin: number }) => void;
}) => {
  if (status === "completed") return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Navigation className="w-5 h-5 text-blue-600 animate-pulse" />
        </div>
        <div>
          <p className="font-semibold text-blue-900 text-sm">Live Navigation</p>
          <p className="text-xs text-blue-600">
            {status === "broadcasted"
              ? "Accept the delivery to start tracking"
              : isPickedUp
                ? "Heading to customer's destination"
                : "Heading to the store to pick up"}
          </p>
        </div>
      </div>

      {status === "assigned" && (
        <div className="bg-white/60 rounded-lg p-3 space-y-2">
          {location && (
            <div className="flex items-center gap-2 text-xs text-blue-700">
              <MapPin className="w-3.5 h-3.5" />
              <span>Lat: {location[0].toFixed(4)}, Lng: {location[1].toFixed(4)}</span>
            </div>
          )}
          <div className="h-[250px] bg-blue-100 rounded-lg relative overflow-hidden z-0">
            <DeliveryMapComponent
              deliveryLocation={location}
              destinationLocation={destination}
              isPickedUp={isPickedUp}
              onRouteCalculated={onRouteCalculated}
            />
          </div>
        </div>
      )}
    </div>
  );
};

function getRelativeTime(date?: Date | string): string {
  if (!date) return "Just now";
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

function PremiumDeliveryCard({
  assignment,
  index,
  currentPosition,
  respondToAssignment,
  completeDelivery,
  pickupOrder,
}: {
  assignment: AssignmentItem;
  index: number;
  currentPosition: LatLng | null;
  respondToAssignment: (id: string, action: "accept" | "reject") => void;
  completeDelivery: (id: string) => void;
  pickupOrder: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const status = assignment.status;

  // Fetch route data independently so ETA/distance shows without opening the map
  useEffect(() => {
    if (status === "completed" || !currentPosition || !assignment.order?.address) return;
    const { latitude, longitude } = assignment.order.address;
    if (!latitude || !longitude) return;

    const controller = new AbortController();
    const [dLat, dLng] = currentPosition;
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${dLng},${dLat};${longitude},${latitude}?overview=false`,
      { signal: controller.signal }
    )
      .then(r => r.json())
      .then(data => {
        if (data.routes?.[0]) {
          const route = data.routes[0];
          setRouteInfo({
            distanceKm: parseFloat((route.distance / 1000).toFixed(2)),
            durationMin: Math.round(route.duration / 60),
          });
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [currentPosition?.[0], currentPosition?.[1], status]);
  const config = STATUS_CONFIG[status];

  const orderId = assignment.order?._id?.toString() || "ORD-0000";
  const orderDate = assignment.order?.createdAt
    ? new Date(assignment.order.createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    : assignment.createdAt
      ? new Date(assignment.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
      : "N/A";

  const orderTime = assignment.order?.createdAt
    ? new Date(assignment.order.createdAt).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
    : assignment.createdAt
      ? new Date(assignment.createdAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
      : "";

  const items = assignment.order?.items || [];

  // const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  // const total = assignment.order?.totalAmmount || subtotal;

  const currentStep = useMemo(() => {
    if (assignment.status === "completed" || assignment.order?.orderStatus === "delivered") return 5;
    if (assignment.status === "assigned") {
      if (assignment.order?.isPickedUp) {
        if (routeInfo && routeInfo.distanceKm < 0.5) {
          return 4; // Arriving Soon
        }
        return 3; // Out for Delivery
      }
      return 1; // Preparing / Assigned
    }
    return 0; // Confirmed
  }, [assignment.status, assignment.order?.isPickedUp, assignment.order?.orderStatus, routeInfo]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
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
          {/* Items Summary & Tracking */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Items
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

            {/* Live Navigation Tracker */}
            {expanded && status === "assigned" && assignment.order?.address && (
              <DeliveryTracker
                location={currentPosition}
                status={status}
                destination={[assignment.order.address.latitude, assignment.order.address.longitude]}
                isPickedUp={!!assignment.order?.isPickedUp}
                onRouteCalculated={setRouteInfo}
              />
            )}

            {status === "assigned" && (
              <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900 text-sm">
                      {assignment.order?.address?.fullName || "Customer"}
                    </p>
                    <p className="text-xs text-blue-600">Contact Customer</p>
                  </div>
                </div>

                {assignment.order?.address?.mobile && (
                  <a
                    href={`tel:${assignment.order.address.mobile}`}
                    className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 transition-colors bg-white/60 rounded-lg p-2.5"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{assignment.order.address.mobile}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Earnings breakdown & Info */}
          <div className="lg:col-span-5 space-y-4">
            {/* Earnings Breakdown */}
            {(() => {
              const earning = calculateEarning(routeInfo?.distanceKm ?? null);
              return (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Earnings & Payment</h3>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500">Your Earning</span>
                    <span className="font-bold text-emerald-600 text-lg">₹{earning.amount}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    {/* <span>{earning.breakdown}</span> */}
                    {!routeInfo && status !== "completed" && (
                      <span className="text-amber-500 font-medium">Estimated</span>
                    )}
                  </div>
                  <div className="h-px bg-gray-200 my-2" />
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {assignment.order?.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* ETA and Distance Summary */}
            {status !== "completed" && (
              <div className="bg-indigo-50 text-indigo-950 p-4 rounded-xl border border-indigo-100 shadow-sm">
                {routeInfo ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-900 font-semibold text-sm">Estimated Time</p>
                      <p className="text-lg font-bold">{routeInfo.durationMin} min</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 font-semibold text-sm">Distance</p>
                      <p className="text-lg font-bold">{routeInfo.distanceKm.toFixed(1)} km</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-indigo-700 font-medium">Calculating route...</span>
                  </div>
                )}
              </div>
            )}

            {/* Delivery/Shipping Address */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                Delivery Address
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {assignment.order?.address
                  ? `${assignment.order.address.fullAddress}, ${assignment.order.address.city}, ${assignment.order.address.state} - ${assignment.order.address.pincode}`
                  : "Address not available"}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {status === "broadcasted" && (
              <>
                <button
                  onClick={() => respondToAssignment(assignment._id, "accept")}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept Delivery
                </button>
                <button
                  onClick={() => respondToAssignment(assignment._id, "reject")}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-sm font-medium transition-colors border border-rose-200"
                >
                  <Ban className="w-4 h-4" />
                  Decline
                </button>
              </>
            )}

            {status === "assigned" && (
              <>
                {!assignment.order?.isPickedUp && (
                  <button
                    onClick={() => pickupOrder(assignment._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    Pick Up Order
                  </button>
                )}
                <button
                  onClick={() => completeDelivery(assignment._id)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Delivered
                </button>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                >
                  <Navigation className="w-4 h-4" />
                  {expanded ? "Hide Map" : "Navigate"}
                </button>
              </>
            )}

            {status === "completed" && (
              assignment.order?.isReviewed ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">
                  <CheckCircle className="w-4 h-4" />
                  <span>Customer Rating:</span>
                  <div className="flex items-center gap-0.5 ml-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-3 h-3 ${s <= (assignment.order?.review?.rating ?? 0) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">
                  <CheckCircle className="w-4 h-4" />
                  <span>Delivered Successfully (+₹{calculateEarning(routeInfo?.distanceKm ?? null).amount})</span>
                </div>
              )
            )}
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
    </motion.div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function DeliveryOrdersPage() {
  const { data: session } = useSession();
  const [assignment, setAssignment] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPosition, setCurrentPosition] = useState<LatLng | null>(null);
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: string }>({ show: false, message: "", type: "" });
  const [activeFilter, setActiveFilter] = useState<"all" | "broadcasted" | "assigned" | "completed">("all");

  const showNotification = (message: string, type: "success" | "error" | "info") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 4000);
  };

  const fetchAssignment = useCallback(async () => {
    try {
      const result = await axios.get("/api/delivery/getAssignments");
      setAssignment(result.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCurrentPosition([lat, lon]);
        if (session?.user?.id) {
          const socket = getSocket();
          socket.emit("updateLocation", { userId: session.user.id, latitude: lat, longitude: lon });
        }
      },
      (err) => console.error("Geolocation failed", err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;
    const socket = getSocket();
    socket.emit("identity", session.user.id);
    const handleUpdate = async () => { await fetchAssignment(); showNotification("New assignment available!", "info"); };
    socket.on("order-status-update", handleUpdate);
    return () => { socket.off("order-status-update", handleUpdate); };
  }, [session?.user?.id, fetchAssignment]);

  useEffect(() => {
    if (session?.user?.id) fetchAssignment();
  }, [session?.user?.id, fetchAssignment]);

  useEffect(() => {
    const interval = setInterval(fetchAssignment, 30000);
    return () => clearInterval(interval);
  }, [fetchAssignment]);

  const respondToAssignment = async (assignmentId: string, action: "accept" | "reject") => {
    try {
      await axios.post("/api/delivery/respond-assignment", { assignmentId, action });
      await fetchAssignment();
      showNotification(`Successfully ${action}ed the delivery!`, "success");
    } catch (error: unknown) {
      const err = error as AxiosError;
      showNotification(`Failed to ${action} assignment: ${err?.response?.data?.message || err?.message}`, "error");
    }
  };

  const completeDelivery = async (assignmentId: string) => {
    try {
      await axios.post("/api/delivery/deliver-order", { assignmentId });
      await fetchAssignment();
      showNotification("Delivery completed successfully! 🎉", "success");
    } catch (error: unknown) {
      const err = error as AxiosError;
      showNotification(`Failed to complete delivery: ${err?.response?.data?.message || err?.message}`, "error");
    }
  };

  const pickupOrder = async (assignmentId: string) => {
    try {
      await axios.post("/api/delivery/pickup-order", { assignmentId });
      await fetchAssignment();
      showNotification("Order picked up successfully! 📦", "success");
    } catch (error: unknown) {
      const err = error as AxiosError;
      showNotification(`Failed to pick up order: ${err?.response?.data?.message || err?.message}`, "error");
    }
  };

  const filteredAssignments = activeFilter === "all"
    ? [...assignment].sort((a, b) => {
        const statusOrder = { broadcasted: 0, assigned: 1, completed: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      })
    : [...assignment].filter(a => a.status === activeFilter).sort((a, b) => {
        const statusOrder = { broadcasted: 0, assigned: 1, completed: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });

  const counts = {
    all: assignment.length,
    broadcasted: assignment.filter(a => a.status === "broadcasted").length,
    assigned: assignment.filter(a => a.status === "assigned").length,
    completed: assignment.filter(a => a.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-400/[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-400/[0.03] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-400/[0.02] rounded-full blur-[120px]" />
      </div>

      {/* Subtle grid pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: "radial-gradient(circle, #64748b 1px, transparent 1px)", backgroundSize: "32px 32px" }}
      />

      {/* Notification Toast */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -30, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, x: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed top-6 right-6 z-50"
          >
            <div className={`rounded-2xl shadow-2xl shadow-black/10 px-6 py-4 flex items-center gap-4 backdrop-blur-xl border ${notification.type === "success" ? "bg-emerald-500/95 text-white border-emerald-400/30" :
                notification.type === "error" ? "bg-rose-500/95 text-white border-rose-400/30" :
                  "bg-blue-500/95 text-white border-blue-400/30"
              }`}>
              <div className="p-1.5 bg-white/20 rounded-xl">
                {notification.type === "success" && <CheckCircle className="w-5 h-5" strokeWidth={2.5} />}
                {notification.type === "error" && <XCircle className="w-5 h-5" strokeWidth={2.5} />}
                {notification.type === "info" && <Bell className="w-5 h-5" strokeWidth={2.5} />}
              </div>
              <p className="font-bold text-[13px] leading-snug">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Back Button ────────────────────────────────────────────── */}
      <div className="fixed top-4 left-4 z-50">
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-gray-900 transition-colors" />
            <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">Back</span>
          </motion.button>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 mt-12">
        {/* ─── Page Header ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2.5 bg-gray-900 rounded-xl shadow-sm">
                  <Truck className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Deliveries</h1>
                  <p className="text-[13px] text-gray-500 font-medium">
                    {assignment.length} assignment{assignment.length !== 1 ? "s" : ""} total
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-sm">
              <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
              </div>
              <span className="text-[12px] font-bold text-gray-600">Live Updates</span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
            {(["all", "broadcasted", "assigned", "completed"] as const).map((filter) => (
              <motion.button
                key={filter}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveFilter(filter)}
                className={`relative px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-300 whitespace-nowrap ${activeFilter === filter
                    ? "bg-gray-900 text-white shadow-md shadow-gray-900/10"
                    : "bg-white text-gray-600 border border-gray-200/60 hover:bg-gray-50"
                  }`}
              >
                <span className="capitalize">{filter === "all" ? "All Orders" : filter}</span>
                <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-black ${activeFilter === filter ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                  {counts[filter]}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <div className="w-16 h-16 border-[3px] border-gray-100 border-t-gray-900 rounded-full" />
              <Truck className="w-5 h-5 text-gray-900 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" strokeWidth={2} />
            </motion.div>
            <p className="mt-6 text-gray-500 font-bold text-lg">Loading your deliveries...</p>
            <p className="text-[13px] text-gray-400 mt-1 font-medium">Fetching real-time data</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-100 py-24 text-center"
          >
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gray-400 rounded-full blur-3xl opacity-10 animate-pulse" />
              <Package className="w-20 h-20 text-gray-300 mx-auto relative" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-black text-gray-700">No Active Deliveries</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto font-medium text-[14px]">
              You&apos;re all caught up! New assignments will appear here automatically.
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 inline-flex items-center gap-2.5 px-5 py-3 bg-gray-50 border border-gray-200/60 rounded-2xl"
            >
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-gray-500 rounded-full" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-gray-500 rounded-full animate-ping" />
              </div>
              <span className="text-[13px] font-bold text-gray-600">Waiting for new orders...</span>
            </motion.div>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {filteredAssignments.map((a, index) => (
              <PremiumDeliveryCard
                key={a._id}
                assignment={a}
                index={index}
                currentPosition={currentPosition}
                respondToAssignment={respondToAssignment}
                completeDelivery={completeDelivery}
                pickupOrder={pickupOrder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}