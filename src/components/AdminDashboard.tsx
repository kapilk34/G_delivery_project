"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, PointElement,
    LineElement, Filler, Tooltip, Legend,
} from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Tooltip, Legend)

interface DashboardStats {
    totalProducts: number
    totalOrders: number
    totalRevenue: number
}

interface AreaIncomeData {
    _id: string
    totalIncome: number
    totalOrders: number
    averageOrder: number
}

interface UserRevenueData {
    _id: string
    totalSpent: number
    orderCount: number
    averageOrderValue: number
    name: string
    email: string
    city: string
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
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        ),
        format: (v: number) => v.toLocaleString("en-IN"),
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
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
        ),
        format: (v: number) => v.toLocaleString("en-IN"),
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
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        format: (v: number) => `₹${v.toLocaleString("en-IN")}`,
    },
]

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const CHART_DEFAULTS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { color: "rgba(0,0,0,0.04)" }, ticks: { color: "#9ca3af", font: { size: 11 } } },
        y: { grid: { color: "rgba(0,0,0,0.04)" }, ticks: { color: "#9ca3af", font: { size: 11 } } },
    },
}

function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return "Morning"
    if (h < 17) return "Afternoon"
    return "Evening"
}

function SectionLabel({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 mb-5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            <div className="flex-1 h-px bg-slate-200" />
        </div>
    )
}

function AdminDashboard() {
    const { data: session } = useSession()
    const [stats, setStats] = useState<DashboardStats>({ totalProducts: 0, totalOrders: 0, totalRevenue: 0 })
    const [areaIncomeData, setAreaIncomeData] = useState<AreaIncomeData[]>([])
    const [userRevenueData, setUserRevenueData] = useState<UserRevenueData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchStats = async () => {
        try {
            setLoading(true)
            const [statsRes, incomeRes] = await Promise.all([
                fetch("/api/admin/dashboard-stats"),
                fetch("/api/admin/user-income-area")
            ])
            
            if (!statsRes.ok) throw new Error("Failed to fetch stats")
            if (!incomeRes.ok) throw new Error("Failed to fetch income data")
            
            const statsData = await statsRes.json()
            const incomeData = await incomeRes.json()
            
            setStats(statsData)
            setAreaIncomeData(incomeData.userIncomeByArea || [])
            setUserRevenueData(incomeData.topUsersByRevenue || [])
            setError(null)
        } catch (err) {
            console.error("Error fetching stats:", err)
            setError("Failed to load dashboard statistics")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (session?.user && session.user.role === "admin") fetchStats()
    }, [session])

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

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 px-4">
                <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100 flex flex-col items-center gap-3 text-center max-w-sm w-full">
                    <div className="text-4xl">⚠️</div>
                    <p className="text-slate-800 font-semibold">{error}</p>
                    <button
                        onClick={fetchStats}
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

    /* ── Chart Data ── */
    const ordersData = {
        labels: DAYS,
        datasets: [{
            label: "Orders",
            data: [82, 110, 97, 143, 161, 198, 132],
            backgroundColor: "rgba(249,115,22,0.75)",
            borderRadius: 6,
            borderSkipped: false as const,
        }],
    }

    const revenueData = {
        labels: DAYS,
        datasets: [{
            label: "Revenue",
            data: [12400, 18200, 15800, 22600, 26300, 31400, 20800],
            backgroundColor: "rgba(139,92,246,0.75)",
            borderRadius: 6,
            borderSkipped: false as const,
        }],
    }

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px);} to { opacity:1; transform:translateY(0);} }
        .anim { opacity:0; animation: fadeUp 0.4s ease forwards; }
        .anim-1{animation-delay:.05s}.anim-2{animation-delay:.15s}.anim-3{animation-delay:.25s}
        .anim-4{animation-delay:.32s}.anim-5{animation-delay:.40s}.anim-6{animation-delay:.48s}
        .anim-7{animation-delay:.56s}.anim-8{animation-delay:.62s}.anim-9{animation-delay:.70s}
      `}</style>

            <div className="jakarta min-h-screen bg-slate-50">
                <div className="pt-20" />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">

                    {/* ── Hero Banner ── */}
                            <div className="relative overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-700 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl shadow-emerald-200 anim anim-1 mt-10">
                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />
                        <div className="absolute -bottom-12 right-20 w-36 h-36 bg-white/5 rounded-full pointer-events-none" />
                        <div className="absolute top-6 right-44 w-12 h-12 bg-white/10 rounded-full pointer-events-none" />

                        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1 mb-4">
                                    <span className="text-base">🛒</span>
                                    <span className="text-emerald-100 text-xs font-bold tracking-widest uppercase">FreshBasket</span>
                                    <span className="text-emerald-300 text-xs">· Admin Panel</span>
                                </div>
                                <h1 className="text-white text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
                                    Good {getGreeting()},{" "}
                                    <span className="text-emerald-200">{session?.user?.name?.split(" ")[0] ?? "Admin"}</span>!
                                </h1>
                                <p className="text-emerald-300 text-sm mt-1.5">{dateString}</p>
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0">
                                <div className="flex items-center gap-2 bg-white/15 border border-white/20 rounded-xl px-3 py-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                                    <span className="text-white text-xs font-semibold">Store Live</span>
                                </div>
                                <button
                                    onClick={fetchStats}
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

                    {/* ── Overview Stats ── */}
                    <div className="anim anim-2">
                        <SectionLabel label="Overview" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
                        {statCards.map((card, i) => (
                            <div
                                key={card.key}
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
                                        {card.format(stats[card.key])}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Weekly Progress ── */}
                    <div className="anim anim-6">
                        <SectionLabel label="Weekly Progress" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8 anim anim-7">

                        {/* Orders Bar */}
                        <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-semibold text-slate-700">Orders this week</p>
                                <span className="text-xs font-semibold bg-orange-50 text-orange-500 px-2.5 py-1 rounded-full">+12.4%</span>
                            </div>
                            <p className="text-xs text-slate-400 mb-4">Daily order volume</p>
                            <div className="h-40">
                                <Bar
                                    data={ordersData}
                                    options={{
                                        ...CHART_DEFAULTS,
                                        scales: {
                                            x: CHART_DEFAULTS.scales.x,
                                            y: { ...CHART_DEFAULTS.scales.y, ticks: { ...CHART_DEFAULTS.scales.y.ticks, callback: (v) => v } },
                                        },
                                    }}
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                                <span className="w-2.5 h-2.5 rounded-sm bg-orange-400 inline-block" />Orders
                            </div>
                        </div>

                        {/* Revenue Bar */}
                        <div className="bg-white rounded-2xl border border-violet-100 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-semibold text-slate-700">Revenue this week</p>
                                <span className="text-xs font-semibold bg-violet-50 text-violet-600 px-2.5 py-1 rounded-full">+18.7%</span>
                            </div>
                            <p className="text-xs text-slate-400 mb-4">Daily revenue in ₹</p>
                            <div className="h-40">
                                <Bar
                                    data={revenueData}
                                    options={{
                                        ...CHART_DEFAULTS,
                                        scales: {
                                            x: CHART_DEFAULTS.scales.x,
                                            y: {
                                                ...CHART_DEFAULTS.scales.y,
                                                ticks: {
                                                    ...CHART_DEFAULTS.scales.y.ticks,
                                                    callback: (v: number) => `₹${Math.round(v / 1000)}k`,
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                                <span className="w-2.5 h-2.5 rounded-sm bg-violet-400 inline-block" />Revenue (₹)
                            </div>
                        </div>
                    </div>

                    {/* ── Income by Area ── */}
                    <div className="mt-10 anim anim-8">
                        <SectionLabel label="Income & Area Analysis" />
                    </div>
                    
                    {/* Area Income Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8 anim anim-9">
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">Income by Area</p>
                                    <p className="text-xs text-slate-400">Revenue distribution across delivery zones</p>
                                </div>
                                <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
                                    {areaIncomeData.length} Areas
                                </span>
                            </div>
                            <div className="h-64">
                                {areaIncomeData.length > 0 ? (
                                    <Bar
                                        data={{
                                            labels: areaIncomeData.map(d => d._id),
                                            datasets: [{
                                                label: "Income (₹)",
                                                data: areaIncomeData.map(d => d.totalIncome),
                                                backgroundColor: "rgba(16,185,129,0.75)",
                                                borderRadius: 6,
                                                borderSkipped: false as const,
                                            }]
                                        }}
                                        options={{
                                            ...CHART_DEFAULTS,
                                            scales: {
                                                x: CHART_DEFAULTS.scales.x,
                                                y: {
                                                    ...CHART_DEFAULTS.scales.y,
                                                    ticks: {
                                                        ...CHART_DEFAULTS.scales.y.ticks,
                                                        callback: ((v: number) => `₹${Math.round(v / 1000)}k`) as any,
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400">
                                        No data available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Orders by Area */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">Orders by Area</p>
                                    <p className="text-xs text-slate-400">Total delivered orders per zone</p>
                                </div>
                                <span className="text-xs font-semibold bg-orange-50 text-orange-500 px-2.5 py-1 rounded-full">
                                    {areaIncomeData.reduce((acc, d) => acc + d.totalOrders, 0)} Orders
                                </span>
                            </div>
                            <div className="h-64">
                                {areaIncomeData.length > 0 ? (
                                    <Bar
                                        data={{
                                            labels: areaIncomeData.map(d => d._id),
                                            datasets: [{
                                                label: "Orders",
                                                data: areaIncomeData.map(d => d.totalOrders),
                                                backgroundColor: "rgba(249,115,22,0.75)",
                                                borderRadius: 6,
                                                borderSkipped: false as const,
                                            }]
                                        }}
                                        options={{
                                            ...CHART_DEFAULTS,
                                            scales: {
                                                x: CHART_DEFAULTS.scales.x,
                                                y: {
                                                    ...CHART_DEFAULTS.scales.y,
                                                    ticks: {
                                                        ...CHART_DEFAULTS.scales.y.ticks,
                                                        callback: ((v: number) => v) as any,
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400">
                                        No data available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Top Users by Revenue Table */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm anim anim-9">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <p className="text-sm font-semibold text-slate-700">Top Users by Spending</p>
                                <p className="text-xs text-slate-400">Highest revenue generating users</p>
                            </div>
                            <span className="text-xs font-semibold bg-violet-50 text-violet-600 px-2.5 py-1 rounded-full">
                                Top 10
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Rank</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600">User Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Area</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Total Spent</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Orders</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Avg Order</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userRevenueData.length > 0 ? (
                                        userRevenueData.map((user, idx) => (
                                            <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-4">
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 font-semibold text-xs">
                                                        {idx + 1}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="font-medium text-slate-800">{user.name}</p>
                                                        <p className="text-xs text-slate-400">{user.email}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                                                        {user.city}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-emerald-600">
                                                    ₹{user.totalSpent.toLocaleString("en-IN")}
                                                </td>
                                                <td className="py-3 px-4 text-slate-600">
                                                    {user.orderCount}
                                                </td>
                                                <td className="py-3 px-4 text-slate-600">
                                                    ₹{Math.round(user.averageOrderValue).toLocaleString("en-IN")}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-slate-400">
                                                No user data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default AdminDashboard