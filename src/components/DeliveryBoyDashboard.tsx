"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DeliveryStatistics from "./DeliveryStatistics";

interface AssignmentItem {
  _id: string;
  status: "broadcasted" | "assigned" | "completed";
  order: {
    totalAmmount?: number;
    address?: { city?: string };
  };
  createdAt?: string;
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

const DeliveryBoyDashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const dateString = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const totalDeliveries = assignments.filter((a) => a.status === "completed").length;
  const activeDeliveries = assignments.filter((a) => a.status === "assigned").length;
  const pendingRequests = assignments.filter((a) => a.status === "broadcasted").length;

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
                  onClick={fetchAssignments}
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
            <DeliveryStatistics />
          </div>

        </div>
      </div>
    </>
  );
};

export default DeliveryBoyDashboard;
