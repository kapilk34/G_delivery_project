"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

interface DashboardStats {
    totalProducts: number
    totalOrders: number
    totalRevenue: number
}

const statCards = [
    {
        key: "totalProducts" as const,
        label: "Total Products",
        sub: "Active grocery items",
        lightBg: "bg-emerald-50",
        border: "border-emerald-100",
        textColor: "text-emerald-600",
        iconBg: "bg-emerald-100",
        ringColor: "ring-emerald-200",
        barGradient: "from-emerald-300 to-emerald-500",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        ),
        format: (v: number) => v.toLocaleString("en-IN"),
        trend: "+12 this week",
        trendUp: true,
    },
    {
        key: "totalOrders" as const,
        label: "Total Orders",
        sub: "Orders placed by customers",
        lightBg: "bg-orange-50",
        border: "border-orange-100",
        textColor: "text-orange-500",
        iconBg: "bg-orange-100",
        ringColor: "ring-orange-200",
        barGradient: "from-orange-300 to-orange-500",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
        ),
        format: (v: number) => v.toLocaleString("en-IN"),
        trend: "+38 today",
        trendUp: true,
    },
    {
        key: "totalRevenue" as const,
        label: "Total Revenue",
        sub: "Delivered & paid orders",
        lightBg: "bg-violet-50",
        border: "border-violet-100",
        textColor: "text-violet-600",
        iconBg: "bg-violet-100",
        ringColor: "ring-violet-200",
        barGradient: "from-violet-300 to-violet-500",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        format: (v: number) => `₹${v.toLocaleString("en-IN")}`,
        trend: "+₹4,200 today",
        trendUp: true,
    },
]

function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return "morning"
    if (h < 17) return "afternoon"
    return "evening"
}

function AdminDashboard() {
    const { data: session } = useSession()
    const [stats, setStats] = useState<DashboardStats>({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true)
                const response = await fetch("/api/admin/dashboard-stats")
                if (!response.ok) throw new Error("Failed to fetch stats")
                const data = await response.json()
                setStats(data)
                setError(null)
            } catch (err) {
                console.error("Error fetching stats:", err)
                setError("Failed to load dashboard statistics")
            } finally {
                setLoading(false)
            }
        }

        if (session?.user.role === "admin") fetchStats()
    }, [session])

    /* ── Unauthorized ── */
    if (!session || session.user.role !== "admin") {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 px-4">
                <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100 flex flex-col items-center gap-3 text-center max-w-sm w-full">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-3xl">🔒</div>
                    <p className="text-slate-800 font-semibold text-lg">Access Restricted</p>
                    <p className="text-slate-400 text-sm">You don't have permission to view this page.</p>
                </div>
            </div>
        )
    }

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 px-4">
                <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100 flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="text-slate-500 text-sm font-medium">Loading dashboard…</p>
                </div>
            </div>
        )
    }

    /* ── Error ── */
    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 px-4">
                <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100 flex flex-col items-center gap-3 text-center max-w-sm w-full">
                    <div className="text-4xl">⚠️</div>
                    <p className="text-slate-800 font-semibold">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 px-5 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    const dateString = new Date().toLocaleDateString("en-IN", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    })

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim { opacity: 0; animation: fadeUp 0.4s ease forwards; }
        .anim-1 { animation-delay: 0.05s; }
        .anim-2 { animation-delay: 0.15s; }
        .anim-3 { animation-delay: 0.25s; }
        .anim-4 { animation-delay: 0.32s; }
        .anim-5 { animation-delay: 0.40s; }
        .anim-6 { animation-delay: 0.48s; }
        .anim-7 { animation-delay: 0.56s; }
        .anim-8 { animation-delay: 0.62s; }
      `}</style>

            <div className="jakarta min-h-screen bg-slate-50">
                {/* Navbar spacer */}
                <div className="pt-20" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">

                    {/* ── Hero Banner ── */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl shadow-emerald-200 anim anim-1 mt-10">
                        {/* Decorative blobs */}
                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />
                        <div className="absolute -bottom-12 right-20 w-36 h-36 bg-white/5 rounded-full pointer-events-none" />
                        <div className="absolute top-6 right-44 w-12 h-12 bg-white/10 rounded-full pointer-events-none" />
                        <div className="absolute bottom-6 left-1/2 w-6 h-6 bg-white/10 rounded-full pointer-events-none" />

                        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                            <div>
                                {/* Brand tag */}
                                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1 mb-4">
                                    <span className="text-base">🛒</span>
                                    <span className="text-emerald-100 text-xs font-bold tracking-widest uppercase">FreshBasket</span>
                                    <span className="text-emerald-300 text-xs">· Admin Panel</span>
                                </div>

                                <h1 className="text-white text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
                                    Good {getGreeting()},{" "}
                                    <span className="text-emerald-200">{session?.user?.name?.split(" ")[0] ?? "Admin"}</span> 👋
                                </h1>
                                <p className="text-emerald-300 text-sm mt-1.5">{dateString}</p>
                            </div>

                            {/* Right controls */}
                            <div className="flex items-center gap-2.5 shrink-0">
                                <div className="flex items-center gap-2 bg-white/15 border border-white/20 rounded-xl px-3 py-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                                    <span className="text-white text-xs font-semibold">Store Live</span>
                                </div>
                                <button
                                    onClick={() => window.location.reload()}
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

                    {/* ── Section label: Overview ── */}
                    <div className="flex items-center gap-3 mb-5 anim anim-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Overview</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* ── Stat Cards ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {statCards.map((card, i) => (
                            <div
                                key={card.key}
                                className={`anim anim-${i + 3} bg-white rounded-2xl border ${card.border} p-6 shadow-sm hover:shadow-md cursor-default group`}
                            >
                                {/* Icon + badge row */}
                                <div className="flex items-center gap-6">
                                    <div className={`${card.iconBg} ${card.textColor} w-10 h-10 rounded-xl flex items-center justify-center ring-2 ${card.ringColor}`}>
                                        {card.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">{card.label}</p>
                                        <p className="text-xs text-slate-400">{card.sub}</p>
                                    </div>
                                    {/* Value */}
                                    <p className={`flex justify-end text-3xl font-bold ${card.textColor} tracking-tight leading-none`}>
                                        {card.format(stats[card.key])}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminDashboard