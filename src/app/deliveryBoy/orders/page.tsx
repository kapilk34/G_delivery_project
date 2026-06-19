"use client";

import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import nextDynamic from "next/dynamic";
import {
  MapPin, Package, Navigation, CheckCircle, XCircle, Bell, Clock,
  Truck, Layers, Target, Route, Expand, Minimize2,
  LocateFixed, Timer, DollarSign, Ban, Award,
} from "lucide-react";
import { getSocket } from "@/lib/socket";
import { motion, AnimatePresence } from "motion/react";

const DeliveryMapComponent = nextDynamic(() => import("./DeliviveryMapComponent"), { ssr: false });

type AssignmentItem = {
  _id: string;
  status: "broadcasted" | "assigned" | "completed";
  order: {
    _id: string;
    orderStatus: "pending" | "Out of Delivery" | "delivered";
    isPickedUp?: boolean;
    address: {
      fullAddress: string;
      latitude: number;
      longitude: number;
    };
  };
};

type LatLng = [number, number];

interface AxiosError {
  response?: { data?: { message?: string } };
  message?: string;
}

const statusConfig = {
  broadcasted: {
    border: "border-l-4 border-l-amber-500",
    headerBg: "bg-amber-50/50",
    iconBg: "bg-amber-100",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    label: "New Request",
    pulse: true,
  },
  assigned: {
    border: "border-l-4 border-l-blue-500",
    headerBg: "bg-blue-50/50",
    iconBg: "bg-blue-100",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    label: "In Progress",
    pulse: false,
  },
  completed: {
    border: "border-l-4 border-l-emerald-500",
    headerBg: "bg-emerald-50/50",
    iconBg: "bg-emerald-100",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    label: "Completed",
    pulse: false,
  },
};

const PER_DELIVERY_AMOUNT = 120;

function HorizontalDeliveryCard({
  assignment, index, currentPosition,
  respondToAssignment, completeDelivery, pickupOrder,
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
  const cfg = statusConfig[assignment.status];
  const shortId = assignment?.order?._id?.toString().slice(-6).toUpperCase() || "";

  const getStatusIcon = () => {
    switch (assignment.status) {
      case "broadcasted": return <Bell className="w-5 h-5" />;
      case "assigned": return <Truck className="w-5 h-5" />;
      case "completed": return <CheckCircle className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden ${cfg.border}`}
    >
      <div className="flex flex-col lg:flex-row">
        {/* Left: Status & Order Info */}
        <div className={`flex-1 p-5 ${cfg.headerBg}`}>
          <div className="flex items-start gap-4">
            <div className={`relative flex-shrink-0 w-14 h-14 ${cfg.iconBg} rounded-2xl flex items-center justify-center shadow-sm`}>
              {getStatusIcon()}
              {cfg.pulse && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md animate-pulse" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-sm font-bold text-slate-700 bg-white/80 border border-slate-200/60 px-3 py-1 rounded-lg tracking-wider">
                  #{shortId}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.badge}`}>
                  {cfg.label}
                </span>
                {assignment.status === "assigned" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                    <Timer className="w-3 h-3" /> Active
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="line-clamp-1">{assignment?.order?.address?.fullAddress}</span>
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Just now</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />₹{PER_DELIVERY_AMOUNT}</span>
                <span className="flex items-center gap-1 capitalize"><Package className="w-3.5 h-3.5" />{assignment?.order?.orderStatus}</span>
              </div>
              {routeInfo && assignment.status === "assigned" && (
                <div className="mt-2 flex items-center gap-3 text-xs font-semibold text-indigo-600">
                  <span>{routeInfo.distanceKm} km</span>
                  <span>~{routeInfo.durationMin} min</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle: Actions */}
        <div className="flex items-center gap-3 px-5 py-4 lg:py-0 lg:border-l border-slate-100 bg-white">
          {assignment.status === "broadcasted" && (
            <>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => respondToAssignment(assignment._id, "accept")}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all">
                <CheckCircle className="w-4 h-4" /> Accept
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => respondToAssignment(assignment._id, "reject")}
                className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 rounded-xl text-sm font-bold transition-all">
                <Ban className="w-4 h-4" /> Decline
              </motion.button>
            </>
          )}
          {assignment.status === "assigned" && (
            <div className="flex items-center gap-3 flex-wrap">
              {!assignment.order.isPickedUp && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => pickupOrder(assignment._id)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 transition-all">
                  <Package className="w-4 h-4" /> Pick Up Order
                </motion.button>
              )}
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => completeDelivery(assignment._id)}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all">
                <CheckCircle className="w-4 h-4" /> Mark as Delivered
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all">
                <Navigation className="w-4 h-4" />
                {expanded ? "Hide Map" : "Navigate"}
              </motion.button>
            </div>
          )}
          {assignment.status === "completed" && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <Award className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-emerald-700">Delivered</p>
                <p className="text-xs text-emerald-600">+₹{PER_DELIVERY_AMOUNT} earned</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Expand */}
        <div className="flex items-center gap-2 px-5 py-4 lg:py-0 lg:border-l border-slate-100 bg-white">
          {assignment.status === "assigned" && currentPosition && (
            <div className="hidden lg:flex flex-col items-end mr-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <LocateFixed className="w-3.5 h-3.5 text-green-500" /><span>Live</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                {currentPosition[0].toFixed(4)}, {currentPosition[1].toFixed(4)}
              </p>
            </div>
          )}
          <button onClick={() => setExpanded(!expanded)}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600">
            {expanded ? <Minimize2 className="w-5 h-5" /> : <Expand className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Map for assigned */}
      <AnimatePresence>
        {expanded && assignment.status === "assigned" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 360, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <Route className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">Live Navigation</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                  </div>
                  <span className="text-xs font-bold text-green-700">Tracking Active</span>
                </div>
              </div>
              <div className="flex-1 rounded-xl border border-slate-200 overflow-hidden shadow-inner">
                <DeliveryMapComponent
                  deliveryLocation={currentPosition}
                  destinationLocation={[assignment.order.address.latitude, assignment.order.address.longitude]}
                  isPickedUp={assignment.order.isPickedUp ?? false}
                  onRouteCalculated={setRouteInfo}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Details for completed/broadcasted */}
      <AnimatePresence>
        {expanded && assignment.status !== "assigned" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Delivery Address</p>
                <p className="text-sm font-semibold text-slate-700 leading-relaxed">{assignment?.order?.address?.fullAddress}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5" />
                  {assignment?.order?.address?.latitude.toFixed(4)}, {assignment?.order?.address?.longitude.toFixed(4)}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Order Details</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Order ID</span>
                    <span className="font-mono font-semibold text-slate-700">#{shortId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <span className="font-semibold text-slate-700 capitalize">{assignment?.order?.orderStatus}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Earnings</span>
                    <span className="font-bold text-emerald-600">₹{PER_DELIVERY_AMOUNT}</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Actions</p>
                <div className="space-y-2">
                  {assignment.status === "broadcasted" && (
                    <>
                      <button onClick={() => respondToAssignment(assignment._id, "accept")}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all">
                        <CheckCircle className="w-4 h-4" /> Accept Delivery
                      </button>
                      <button onClick={() => respondToAssignment(assignment._id, "reject")}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all">
                        <Ban className="w-4 h-4" /> Decline
                      </button>
                    </>
                  )}
                  {assignment.status === "completed" && (
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                      <Award className="w-5 h-5" />
                      <div>
                        <p className="text-sm font-bold">Completed Successfully</p>
                        <p className="text-xs text-emerald-600">Payment: ₹{PER_DELIVERY_AMOUNT}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function DeliveryOrdersPage() {
  const { data: session } = useSession();
  const [assignment, setAssignment] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPosition, setCurrentPosition] = useState<LatLng | null>(null);
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: string }>({ show: false, message: "", type: "" });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 right-6 z-50"
          >
            <div className={`rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-3 backdrop-blur-md border ${
              notification.type === "success" ? "bg-emerald-500/95 text-white border-emerald-400/50" :
              notification.type === "error" ? "bg-rose-500/95 text-white border-rose-400/50" :
              "bg-blue-500/95 text-white border-blue-400/50"
            }`}>
              <div className="p-1 bg-white/20 rounded-lg">
                {notification.type === "success" && <CheckCircle className="w-5 h-5" />}
                {notification.type === "error" && <XCircle className="w-5 h-5" />}
                {notification.type === "info" && <Bell className="w-5 h-5" />}
              </div>
              <p className="font-bold text-sm">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 mt-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              My Deliveries
            </h2>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              {assignment.length} assignment{assignment.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-100">
            <Target className="w-3.5 h-3.5" />
            Live Updates
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="relative">
              <div className="w-20 h-20 border-4 border-slate-200 border-t-indigo-500 rounded-full" />
              <Truck className="w-7 h-7 text-indigo-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </motion.div>
            <p className="mt-6 text-slate-500 font-bold text-lg">Loading your deliveries...</p>
            <p className="text-sm text-slate-400 mt-1">Fetching real-time data</p>
          </div>
        ) : assignment.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg shadow-slate-200/30 border border-slate-100 py-24 text-center">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-3xl opacity-20 animate-pulse" />
              <Package className="w-24 h-24 text-slate-300 mx-auto relative" />
            </div>
            <h3 className="text-2xl font-black text-slate-700 mt-8">No Active Deliveries</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto font-semibold">You&apos;re all caught up! New assignments will appear here automatically.</p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-8 inline-flex items-center gap-2 px-5 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              </div>
              <span className="text-sm font-bold text-emerald-700">Waiting for new orders...</span>
            </motion.div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {assignment.map((a, index) => (
              <HorizontalDeliveryCard
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
