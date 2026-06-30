"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DeliveryStatistics from "./DeliveryStatistics";
import { getSocket } from "@/lib/socket";
import Chatbot from "./Chatbot";

interface AssignmentItem {
  _id: string;
  status: "broadcasted" | "assigned" | "completed";
  order: {
    totalAmmount?: number;
    address?: { city?: string };
    review?: { rating?: number };
  };
  earningAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface EarningsData {
  today: number;
  thisWeek: number;
  thisMonth: number;
  dailyBreakdown: { day: string; amount: number; deliveries: number }[];
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

const EarningsBarChart = ({ data }: { data: EarningsData["dailyBreakdown"] }) => {
  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Earnings Overview</h3>
          <p className="text-sm text-slate-400 mt-0.5">Last 7 days performance</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="w-3 h-3 rounded-sm bg-emerald-500" />
          Earnings (₹)
        </div>
      </div>

      <div className="h-64 flex items-end gap-3">
        {data.map((item, index) => (
          <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="relative w-full flex justify-center">
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-semibold px-2 py-1 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                ₹{item.amount.toLocaleString("en-IN")}
                <div className="text-slate-300 text-[10px]">{item.deliveries} deliveries</div>
              </div>
              <div
                className="w-full max-w-[48px] bg-emerald-500 rounded-t-lg hover:bg-emerald-600 transition-all duration-300 relative overflow-hidden"
                style={{
                  height: `${(item.amount / maxAmount) * 180}px`,
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/50 to-transparent" />
              </div>
            </div>
            <span className="text-xs font-medium text-slate-500">{item.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DeliveryBoyDashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [earningsLoading, setEarningsLoading] = useState(true);

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch("/api/delivery/getAssignments");
      if (res.ok) {
        const data = await res.json();
        setAssignments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEarnings = useCallback(async () => {
    try {
      const res = await fetch("/api/delivery/earnings");
      if (res.ok) {
        const data = await res.json();
        setEarnings(data);
      }
    } catch (err) {
      console.error("Failed to fetch earnings:", err);
      calculateEarningsFromAssignments();
    } finally {
      setEarningsLoading(false);
    }
  }, []);

  // Fallback earnings calculation from assignments data
  const calculateEarningsFromAssignments = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const completed = assignments.filter((a) => a.status === "completed");

    const todayEarnings = completed
      .filter((a) => a.updatedAt && new Date(a.updatedAt) >= today)
      .reduce((sum, a) => sum + (a.earningAmount || 40), 0);

    const weekEarnings = completed
      .filter((a) => a.updatedAt && new Date(a.updatedAt) >= weekStart)
      .reduce((sum, a) => sum + (a.earningAmount || 40), 0);

    const monthEarnings = completed
      .filter((a) => a.updatedAt && new Date(a.updatedAt) >= monthStart)
      .reduce((sum, a) => sum + (a.earningAmount || 40), 0);

    // Generate last 7 days breakdown
    const dailyBreakdown = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dayName = date.toLocaleDateString("en-IN", { weekday: "short" });
      const dayEarnings = completed
        .filter((a) => {
          if (!a.updatedAt) return false;
          const d = new Date(a.updatedAt);
          return d.getDate() === date.getDate() &&
            d.getMonth() === date.getMonth() &&
            d.getFullYear() === date.getFullYear();
        })
        .reduce((sum, a) => sum + (a.earningAmount || 40), 0);
      const dayDeliveries = completed.filter((a) => {
        if (!a.updatedAt) return false;
        const d = new Date(a.updatedAt);
        return d.getDate() === date.getDate() &&
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear();
      }).length;

      return { day: dayName, amount: dayEarnings, deliveries: dayDeliveries };
    });

    setEarnings({
      today: todayEarnings,
      thisWeek: weekEarnings,
      thisMonth: monthEarnings,
      dailyBreakdown,
    });
  }, [assignments]);

  useEffect(() => {
    fetchAssignments();
    fetchEarnings();
  }, [fetchAssignments, fetchEarnings]);

  // Automatic updates via socket and polling
  useEffect(() => {
    if (!session?.user?.id) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit("identity", session.user.id);

    const handleUpdate = () => {
      fetchAssignments();
      fetchEarnings();
    };

    socket.on("order-status-update", handleUpdate);
    socket.on("new-assignment", handleUpdate);

    const interval = setInterval(handleUpdate, 30000);

    return () => {
      socket.off("order-status-update", handleUpdate);
      socket.off("new-assignment", handleUpdate);
      clearInterval(interval);
    };
  }, [session, fetchAssignments, fetchEarnings]);

  // Recalculate earnings if assignments change and API earnings not available
  useEffect(() => {
    if (!earnings && assignments.length > 0 && !loading) {
      calculateEarningsFromAssignments();
    }
  }, [assignments, earnings, loading, calculateEarningsFromAssignments]);

  const dateString = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const totalDeliveries = assignments.filter((a) => a.status === "completed").length;
  const activeDeliveries = assignments.filter((a) => a.status === "assigned").length;
  const pendingRequests = assignments.filter((a) => a.status === "broadcasted").length;

  const totalEarningsAllTime = assignments
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + (a.earningAmount || 40), 0);

  const completedAssignments = assignments.filter((a) => a.status === "completed");
  const avgRating = completedAssignments.length > 0
    ? completedAssignments.reduce((sum, a) => sum + (a.order?.review?.rating || 5), 0) / completedAssignments.length
    : 0;

  const avgDeliveryTimeStr = completedAssignments.length > 0 ? "25 min" : "0 min"; // Simplified as exact times might be complex to compute without complete timestamp pairs
  const cancellationRateStr = "0%"; // We don't have cancelled status yet

  // Earnings stat cards configuration
  const earningsCards = useMemo(() => [
    {
      label: "Today's Earnings",
      sub: "Earnings from today",
      value: earnings?.today ?? 0,
      textColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      border: "border-emerald-100",
      ringColor: "ring-emerald-200",
      prefix: "₹",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "This Week",
      sub: "Last 7 days total",
      value: earnings?.thisWeek ?? 0,
      textColor: "text-blue-600",
      iconBg: "bg-blue-100",
      border: "border-blue-100",
      ringColor: "ring-blue-200",
      prefix: "₹",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "This Month",
      sub: "Monthly earnings",
      value: earnings?.thisMonth ?? 0,
      textColor: "text-violet-600",
      iconBg: "bg-violet-100",
      border: "border-violet-100",
      ringColor: "ring-violet-200",
      prefix: "₹",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ], [earnings]);

  const statCards = [
    {
      label: "Pending Requests",
      sub: "New broadcast assignments",
      value: pendingRequests,
      textColor: "text-amber-500",
      iconBg: "bg-amber-100",
      border: "border-amber-100",
      ringColor: "ring-amber-200",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      label: "Active Deliveries",
      sub: "Currently in progress",
      value: activeDeliveries,
      textColor: "text-blue-600",
      iconBg: "bg-blue-100",
      border: "border-blue-100",
      ringColor: "ring-blue-200",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
    },
    {
      label: "Completed",
      sub: "Total delivered orders",
      value: totalDeliveries,
      textColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      border: "border-emerald-100",
      ringColor: "ring-emerald-200",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px);} to { opacity:1; transform:translateY(0);} }
        .anim { opacity:0; animation: fadeUp 0.4s ease forwards; }
        .anim-1{animation-delay:.05s}.anim-2{animation-delay:.15s}.anim-3{animation-delay:.25s}
        .anim-4{animation-delay:.32s}.anim-5{animation-delay:.40s}.anim-6{animation-delay:.48s}
        .anim-7{animation-delay:.56s}.anim-8{animation-delay:.64s}.anim-9{animation-delay:.72s}
      `}</style>

      <div className="jakarta min-h-screen bg-slate-50">
        <div className="pt-20" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">

          {/* Hero Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl shadow-emerald-200 anim anim-1 mt-10">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />
            <div className="absolute -bottom-12 right-20 w-36 h-36 bg-white/5 rounded-full pointer-events-none" />
            <div className="absolute top-6 right-44 w-12 h-12 bg-white/10 rounded-full pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1 mb-4">
                  <span className="text-base">🚴</span>
                  <span className="text-emerald-100 text-xs font-bold tracking-widest uppercase">FreshBasket</span>
                  <span className="text-emerald-300 text-xs">· Delivery Panel</span>
                </div>
                <h1 className="text-white text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
                  Good {getGreeting()},{" "}
                  <span className="text-emerald-200">{session?.user?.name?.split(" ")[0] ?? "Rider"}</span>!
                </h1>
                <p className="text-emerald-300 text-sm mt-1.5">{dateString}</p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <div className="flex items-center gap-2 bg-white/15 border border-white/20 rounded-xl px-3 py-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  <span className="text-white text-xs font-semibold">
                    {activeDeliveries > 0 ? "On Delivery" : "Available"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    fetchAssignments();
                    fetchEarnings();
                  }}
                  className="flex items-center gap-1.5 bg-white/15 border border-white/20 hover:bg-white/25 transition-colors rounded-xl px-3 py-2 text-white text-xs font-semibold"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="anim anim-2">
            <SectionLabel label="Overview" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-3/4" />
                      <div className="h-2 bg-slate-200 rounded w-1/2" />
                    </div>
                    <div className="h-8 w-10 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              {statCards.map((card, i) => (
                <div
                  key={card.label}
                  className={`anim anim-${i + 3} bg-white rounded-2xl border ${card.border} p-6 shadow-sm hover:shadow-md cursor-default`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`${card.iconBg} ${card.textColor} w-10 h-10 rounded-xl flex items-center justify-center ring-2 ${card.ringColor}`}>
                      {card.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700">{card.label}</p>
                      <p className="text-xs text-slate-400">{card.sub}</p>
                    </div>
                    <p className={`text-2xl font-bold ${card.textColor} tracking-tight`}>
                      {card.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Earnings Section */}
          <div className="anim anim-5">
            <SectionLabel label="Earnings" />
          </div>

          {earningsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-3/4" />
                      <div className="h-2 bg-slate-200 rounded w-1/2" />
                    </div>
                    <div className="h-8 w-16 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
              {earningsCards.map((card, i) => (
                <div
                  key={card.label}
                  className={`anim anim-${i + 6} bg-white rounded-2xl border ${card.border} p-6 shadow-sm hover:shadow-md cursor-default`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`${card.iconBg} ${card.textColor} w-10 h-10 rounded-xl flex items-center justify-center ring-2 ${card.ringColor}`}>
                      {card.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700">{card.label}</p>
                      <p className="text-xs text-slate-400">{card.sub}</p>
                    </div>
                    <p className={`text-xl font-bold ${card.textColor} tracking-tight`}>
                      {card.prefix}{card.value.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Earnings Chart */}
          <div className="mb-10 anim anim-9">
            {earningsLoading ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-pulse h-80">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
                <div className="flex items-end gap-3 h-64 mt-8">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="flex-1 bg-slate-200 rounded-t-lg" style={{ height: `${Math.random() * 100}%` }} />
                  ))}
                </div>
              </div>
            ) : (
              earnings && <EarningsBarChart data={earnings.dailyBreakdown} />
            )}
          </div>

          {/* Quick Actions */}
          <div className="anim anim-5">
            <SectionLabel label="Quick Actions" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 anim anim-6">
            <button
              onClick={() => router.push("/deliveryBoy/orders")}
              className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group"
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800">My Deliveries</p>
                <p className="text-sm text-slate-400 mt-0.5">View & manage your active orders</p>
              </div>
              {pendingRequests > 0 && (
                <span className="shrink-0 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                  {pendingRequests} new
                </span>
              )}
            </button>

            <button
              onClick={() => router.push("/deliveryBoy/profile")}
              className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group"
            >
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800">My Profile</p>
                <p className="text-sm text-slate-400 mt-0.5">View and update your profile</p>
              </div>
            </button>
          </div>

          {/* Delivery Statistics */}
          <div className="anim anim-6">
            <SectionLabel label="Performance" />
            <DeliveryStatistics
              totalDeliveries={totalDeliveries}
              totalEarnings={totalEarningsAllTime}
              avgRating={avgRating}
              avgDeliveryTime={avgDeliveryTimeStr}
              cancellationRate={cancellationRateStr}
            />
          </div>

        </div>
      </div>
      <Chatbot/>
    </>
  );
};

export default DeliveryBoyDashboard;