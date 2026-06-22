"use client";

import React from "react";

interface DeliveryStatisticsProps {
  totalDeliveries: number;
  totalEarnings: number;
  avgRating: number;
  avgDeliveryTime: string;
  cancellationRate: string;
}

export default function DeliveryDashboard({
  totalDeliveries,
  totalEarnings,
  avgRating,
  avgDeliveryTime,
  cancellationRate,
}: DeliveryStatisticsProps) {
  const stats = [
    {
      title: "Total Deliveries",
      value: totalDeliveries.toString(),
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    color: "bg-blue-50 text-blue-600",
    borderColor: "border-blue-200",
    accentColor: "bg-blue-500",
    trend: "+12%",
    trendUp: true,
  },
    {
      title: "Total Earnings",
      value: `₹${totalEarnings.toLocaleString("en-IN")}`,
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    color: "bg-emerald-50 text-emerald-600",
    borderColor: "border-emerald-200",
    accentColor: "bg-emerald-500",
    trend: "+8.5%",
    trendUp: true,
  },
    {
      title: "Avg Rating",
      value: avgRating.toFixed(1),
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    ),
    color: "bg-amber-50 text-amber-600",
    borderColor: "border-amber-200",
    accentColor: "bg-amber-500",
    trend: "+0.3",
    trendUp: true,
  },
    {
      title: "Avg Delivery Time",
      value: avgDeliveryTime,
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    color: "bg-violet-50 text-violet-600",
    borderColor: "border-violet-200",
    accentColor: "bg-violet-500",
    trend: "-2 min",
    trendUp: true,
  },
    {
      title: "Cancellation Rate",
      value: cancellationRate,
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
      </svg>
    ),
    color: "bg-rose-50 text-rose-600",
    borderColor: "border-rose-200",
    accentColor: "bg-rose-500",
    trend: "-0.4%",
  },
];

  return (
    <div className=" bg-slate-50 p-6 md:p-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 text-center">
        <h1 className="text-3xl md:text-2xl font-bold text-green-700 tracking-tight">
          Delivery Statistics
        </h1>
        <div className="mt-4 mx-auto w-20 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500 rounded-full" />
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`group relative bg-white rounded-2xl border ${stat.borderColor} p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
          >
            {/* Top accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accentColor} opacity-80`} />

            {/* Subtle gradient overlay on hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b ${stat.color.split(" ")[0]} to-transparent pointer-events-none`} style={{ opacity: 0.03 }} />

            {/* Icon */}
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${stat.color} mb-5 shadow-sm`}>
              {stat.icon}
            </div>

            {/* Title */}
            <p className="text-sm font-semibold text-slate-700 tracking-wider mb-1">
              {stat.title}
            </p>

            {/* Value */}
            <p className="text-3xl font-bold text-slate-800 mb-3">
              {stat.value}
            </p>

            {/* Trend */}
            <div className="flex items-center gap-1.5 ">
              <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${stat.trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.trendUp ? "M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" : "M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"} />
                </svg>
                {stat.trend}
              </span>
              <span className="text-xs text-slate-400">vs last week</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}