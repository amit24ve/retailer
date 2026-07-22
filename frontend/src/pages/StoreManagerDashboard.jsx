import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";
import {
    ShoppingCartIcon,
    UsersIcon,
    CurrencyRupeeIcon,
    StarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    QrCodeIcon,
    CheckBadgeIcon,
    ClockIcon,
    BuildingStorefrontIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";

// ── Brand colors ─────────────────────────────────────────────────────────────
const C = {
    navy: "#0A2540", // KPI numbers, headings
    sky: "#00B4D8", // primary graph, links, accents
    mint: "#2EA77E", // good / success status
    coral: "#FF6B6B", // alert / error / refunded
    amber: "#FF9F1C", // warning / pending
    canvas: "#F4F6F9", // page background
    white: "#FFFFFF", // card backgrounds
};

// ─── Tooltip ─────────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-xl text-xs">
            <p className="font-bold mb-1.5" style={{ color: C.navy }}>
                {label}
            </p>
            {payload.map((p) => (
                <div
                    key={p.name}
                    className="flex items-center gap-1.5 mb-1 last:mb-0"
                >
                    <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: p.color }}
                    />
                    <span className="text-slate-500">{p.name}:</span>
                    <span className="font-extrabold" style={{ color: C.navy }}>
                        {p.name.includes("Revenue") ? "₹" : ""}
                        {Number(p.value).toLocaleString("en-IN")}
                    </span>
                </div>
            ))}
        </div>
    );
};

// ─── KPI Stat Card ────────────────────────────────────────────────────────────
const TodayCard = ({
    icon: Icon,
    label,
    value,
    change,
    changeLabel,
    accentColor,
    cardClass,
}) => (
    <div
        className={`${cardClass} rounded-2xl p-5 border relative overflow-hidden`}
    >
        <div className="flex items-start justify-between">
            <div className="relative z-10">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                    {label}
                </p>
                <p
                    className="text-2xl font-black leading-tight"
                    style={{ color: C.navy }}
                >
                    {value}
                </p>
                {change !== undefined && (
                    <div
                        className={`flex items-center gap-1 mt-2 text-xs font-bold ${change >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                    >
                        {change >= 0 ? (
                            <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                        ) : (
                            <ArrowTrendingDownIcon className="w-3.5 h-3.5" />
                        )}
                        <span>
                            {Math.abs(change)}% {changeLabel}
                        </span>
                    </div>
                )}
            </div>
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
                style={{
                    background: `${accentColor}18`,
                    borderColor: `${accentColor}35`,
                }}
            >
                <Icon className="w-5 h-5" style={{ color: accentColor }} />
            </div>
        </div>
    </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const map = {
        completed: { bg: "#EBF7F2", color: C.mint, border: "#A3DFC9" },
        pending: { bg: "#FFF8EC", color: C.amber, border: "#FFD899" },
        refunded: { bg: "#FFF2F2", color: C.coral, border: "#FFB8B8" },
    };
    const s = map[status] || {
        bg: "#F1F5F9",
        color: "#64748b",
        border: "#E2E8F0",
    };
    return (
        <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border"
            style={{ background: s.bg, color: s.color, borderColor: s.border }}
        >
            {status}
        </span>
    );
};

// ─── Mock fallback data ───────────────────────────────────────────────────────
const getMockData = () => ({
    store_info: {
        store_id: "s1",
        store_name: "New Delhi Flagship",
        city: "New Delhi",
        state: "Delhi",
        store_code: "DEL-FLAGSHIP-01",
        status: "active",
    },
    today_metrics: {
        revenue: 42440,
        orders: 18,
        new_customers: 3,
        points_issued: 1840,
        loyalty_txns: 14,
        yesterday_revenue: 38200,
        revenue_growth_pct: 11.1,
    },
    month_metrics: {
        revenue: 842884,
        orders: 284,
        total_customers: 48,
    },
    weekly_chart: {
        Revenue: [
            { label: "Mon", value: 38200 },
            { label: "Tue", value: 44800 },
            { label: "Wed", value: 32100 },
            { label: "Thu", value: 51200 },
            { label: "Fri", value: 62400 },
            { label: "Sat", value: 78900 },
            { label: "Sun", value: 42440 },
        ],
        Orders: [
            { label: "Mon", value: 14 },
            { label: "Tue", value: 18 },
            { label: "Wed", value: 12 },
            { label: "Thu", value: 20 },
            { label: "Fri", value: 26 },
            { label: "Sat", value: 32 },
            { label: "Sun", value: 18 },
        ],
    },
    recent_orders: [
        {
            order_id: "1",
            customer_name: "Siddharth Sharma",
            amount: 3240,
            status: "completed",
            invoice: "INV-2026-9001",
            points: 324,
            time: "10:30 AM",
        },
        {
            order_id: "2",
            customer_name: "Priya Patel",
            amount: 1850,
            status: "completed",
            invoice: "INV-2026-9002",
            points: 185,
            time: "11:15 AM",
        },
        {
            order_id: "3",
            customer_name: "Rahul Gupta",
            amount: 5600,
            status: "completed",
            invoice: "INV-2026-9003",
            points: 560,
            time: "12:05 PM",
        },
        {
            order_id: "4",
            customer_name: "Anjali Singh",
            amount: 920,
            status: "pending",
            invoice: "INV-2026-9004",
            points: 0,
            time: "01:20 PM",
        },
        {
            order_id: "5",
            customer_name: "Vikram Mehta",
            amount: 7200,
            status: "completed",
            invoice: "INV-2026-9005",
            points: 720,
            time: "02:45 PM",
        },
        {
            order_id: "6",
            customer_name: "Neha Joshi",
            amount: 2100,
            status: "completed",
            invoice: "INV-2026-9006",
            points: 210,
            time: "03:10 PM",
        },
        {
            order_id: "7",
            customer_name: "Arjun Kumar",
            amount: 4350,
            status: "completed",
            invoice: "INV-2026-9007",
            points: 435,
            time: "04:00 PM",
        },
        {
            order_id: "8",
            customer_name: "Deepa Nair",
            amount: 1200,
            status: "refunded",
            invoice: "INV-2026-9008",
            points: 0,
            time: "04:45 PM",
        },
    ],
});

const CHART_TABS = ["Revenue", "Orders"];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StoreManagerDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartTab, setChartTab] = useState("Revenue");

    useEffect(() => {
        api.get("/analytics/store-dashboard")
            .then((r) => setData(r.data))
            .catch(() => setData(getMockData()))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="flex flex-col items-center gap-3">
                    <div
                        className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                        style={{
                            borderColor: C.sky,
                            borderTopColor: "transparent",
                        }}
                    />
                    <p className="text-slate-500 text-sm font-semibold">
                        Loading store dashboard...
                    </p>
                </div>
            </div>
        );
    }

    const d = data || getMockData();
    const tm = d.today_metrics;
    const mm = d.month_metrics;
    const si = d.store_info;
    const chartData = d.weekly_chart[chartTab] || [];

    const now = new Date();
    const dateString = now.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    const greeting =
        now.getHours() < 12
            ? "Morning"
            : now.getHours() < 17
              ? "Afternoon"
              : "Evening";

    return (
        /* Canvas background wraps everything */
        <div
            className="-m-6 p-6 min-h-full space-y-6 pb-8"
            style={{ background: C.canvas }}
        >
            {/* ── Header Banner ─────────────────────────────────────────── */}
            <div
                className="rounded-3xl overflow-hidden relative shadow-xl"
                style={{
                    background: `linear-gradient(135deg, ${C.navy} 0%, #0d3d6b 100%)`,
                }}
            >
                {/* Glows */}
                <div
                    className="absolute -right-10 -top-10 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-20"
                    style={{ background: C.sky }}
                />
                <div
                    className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-10"
                    style={{ background: C.mint }}
                />

                <div className="relative px-7 py-6 z-10">
                    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                        <div className="flex-1">
                            {/* Badge */}
                            <div className="flex items-center gap-2 mb-2">
                                <BuildingStorefrontIcon
                                    className="w-5 h-5"
                                    style={{ color: C.sky }}
                                />
                                <span
                                    className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border"
                                    style={{
                                        color: C.sky,
                                        borderColor: `${C.sky}40`,
                                        background: `${C.sky}18`,
                                    }}
                                >
                                    Store Manager Console
                                </span>
                            </div>

                            {/* Greeting */}
                            <h1 className="text-2xl font-black text-white mb-1 tracking-tight">
                                Good {greeting},{" "}
                                {user?.full_name?.split(" ")[0] || "Manager"} 👋
                            </h1>

                            {/* Store info row */}
                            <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                                <p
                                    className="text-sm font-extrabold"
                                    style={{ color: `${C.sky}CC` }}
                                >
                                    {si.store_name}
                                </p>
                                <span className="w-1 h-1 rounded-full bg-white/30" />
                                <p className="text-xs font-semibold text-white/50">
                                    {si.city}, {si.state}
                                </p>
                                <span className="w-1 h-1 rounded-full bg-white/30" />
                                <span
                                    className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border"
                                    style={
                                        si.status === "active"
                                            ? {
                                                  background: `${C.mint}25`,
                                                  color: "#7FEBB8",
                                                  borderColor: `${C.mint}40`,
                                              }
                                            : {
                                                  background: `${C.coral}25`,
                                                  color: "#FFAAAA",
                                                  borderColor: `${C.coral}40`,
                                              }
                                    }
                                >
                                    {si.status === "active"
                                        ? "● Open"
                                        : "● Closed"}
                                </span>
                            </div>
                            <p className="text-xs font-bold text-white/30 mt-2">
                                {dateString}
                            </p>
                        </div>

                        {/* Quick header stats */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {[
                                {
                                    label: "Today's Sales",
                                    value: `₹${(tm.revenue / 1000).toFixed(1)}K`,
                                    icon: "💰",
                                },
                                {
                                    label: "Today's Orders",
                                    value: tm.orders,
                                    icon: "🛍️",
                                },
                                {
                                    label: "Points Issued",
                                    value: tm.points_issued.toLocaleString(
                                        "en-IN",
                                    ),
                                    icon: "⭐",
                                },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-2xl px-4 py-3 text-center min-w-[110px] border"
                                    style={{
                                        background: "rgba(255,255,255,0.06)",
                                        borderColor: "rgba(255,255,255,0.12)",
                                    }}
                                >
                                    <span className="text-lg">{stat.icon}</span>
                                    <p className="text-lg font-black text-white leading-none mt-1">
                                        {stat.value}
                                    </p>
                                    <p
                                        className="text-[9px] font-extrabold uppercase tracking-wider mt-1.5"
                                        style={{ color: `${C.sky}80` }}
                                    >
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── KPI Cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <TodayCard
                    icon={CurrencyRupeeIcon}
                    label="Today's Revenue"
                    value={`₹${tm.revenue.toLocaleString("en-IN")}`}
                    change={tm.revenue_growth_pct}
                    changeLabel="vs yesterday"
                    accentColor={C.sky}
                    cardClass="sm-card-sky"
                />
                <TodayCard
                    icon={ShoppingCartIcon}
                    label="Orders Placed"
                    value={tm.orders}
                    accentColor={C.amber}
                    cardClass="sm-card-amber"
                />
                <TodayCard
                    icon={UsersIcon}
                    label="New Customers"
                    value={tm.new_customers}
                    change={50}
                    changeLabel="vs last week"
                    accentColor={C.mint}
                    cardClass="sm-card-mint"
                />
                <TodayCard
                    icon={StarIcon}
                    label="Loyalty Points Earned"
                    value={tm.points_issued.toLocaleString("en-IN")}
                    change={20}
                    changeLabel="vs yesterday"
                    accentColor={C.coral}
                    cardClass="sm-card-coral"
                />
            </div>

            {/* ── Weekly Performance Chart ──────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h3
                            className="text-sm font-black uppercase tracking-wider"
                            style={{ color: C.navy }}
                        >
                            Weekly Store Analytics
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                            Weekly trend — sales & order volume
                        </p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {CHART_TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setChartTab(tab)}
                                className="text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                style={
                                    chartTab === tab
                                        ? {
                                              background: "#FFFFFF",
                                              color: C.sky,
                                              boxShadow:
                                                  "0 1px 3px rgba(0,0,0,0.08)",
                                          }
                                        : { color: "#94a3b8" }
                                }
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-6 h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        {chartTab === "Revenue" ? (
                            <AreaChart
                                data={chartData}
                                margin={{
                                    left: -20,
                                    right: 10,
                                    top: 10,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="smRevGrad"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor={C.sky}
                                            stopOpacity={0.22}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={C.sky}
                                            stopOpacity={0.0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#f1f5f9"
                                />
                                <XAxis
                                    dataKey="label"
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    fontWeight={650}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    fontWeight={650}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) => `₹${v / 1000}k`}
                                />
                                <Tooltip content={<ChartTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    name="Revenue"
                                    stroke={C.sky}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#smRevGrad)"
                                />
                            </AreaChart>
                        ) : (
                            <BarChart
                                data={chartData}
                                margin={{
                                    left: -20,
                                    right: 10,
                                    top: 10,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#f1f5f9"
                                />
                                <XAxis
                                    dataKey="label"
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    fontWeight={650}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    fontWeight={650}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar
                                    dataKey="value"
                                    name="Orders"
                                    fill={C.sky}
                                    radius={[8, 8, 0, 0]}
                                    barSize={28}
                                />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── Quick Action Cards ────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    {
                        title: "Add Customer Profile",
                        desc: "Register walk-in customer to loyalty program",
                        icon: "👤",
                        stat: "Register",
                        statLabel: "new member",
                        link: "/customers/add",
                        bg: `linear-gradient(135deg, ${C.navy} 0%, #0d3d6b 100%)`,
                        shadow: "rgba(10,37,64,0.30)",
                    },
                    {
                        title: "Create Checkout Order",
                        desc: "Record transaction & allocate loyalty points",
                        icon: "🧾",
                        stat: "Billing POS",
                        statLabel: "issue points",
                        link: "/orders",
                        bg: `linear-gradient(135deg, ${C.sky} 0%, #0090AD 100%)`,
                        shadow: "rgba(0,180,216,0.30)",
                    },
                    {
                        title: "Dynamic QR Scanner",
                        desc: "Let customers scan to join or check points",
                        icon: "📲",
                        stat: "QR Codes",
                        statLabel: "display codes",
                        link: "/qr-code",
                        bg: `linear-gradient(135deg, ${C.mint} 0%, #1d7d5e 100%)`,
                        shadow: "rgba(46,167,126,0.30)",
                    },
                ].map((card) => (
                    <Link
                        key={card.title}
                        to={card.link}
                        className="rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300 block relative overflow-hidden text-white"
                        style={{
                            background: card.bg,
                            boxShadow: `0 8px 20px ${card.shadow}`,
                        }}
                    >
                        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <span className="text-2xl">{card.icon}</span>
                                <p className="text-sm font-black mt-3">
                                    {card.title}
                                </p>
                                <p className="text-xs text-white/70 mt-1 leading-relaxed max-w-[200px]">
                                    {card.desc}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black uppercase tracking-wider">
                                    {card.stat}
                                </p>
                                <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider mt-0.5">
                                    {card.statLabel}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* ── Recent Transactions ───────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3
                        className="text-xs font-black uppercase tracking-widest flex items-center gap-2"
                        style={{ color: C.navy }}
                    >
                        <ClockIcon
                            className="w-4 h-4"
                            style={{ color: C.sky }}
                        />
                        Recent Transactions — {si.store_name}
                    </h3>
                    <Link
                        to="/orders"
                        className="text-xs font-bold transition-colors"
                        style={{ color: C.sky }}
                    >
                        View All Orders
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Invoice</th>
                                <th className="text-right">Amount</th>
                                <th className="text-right">Points Earned</th>
                                <th className="text-center">Status</th>
                                <th className="text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(d.recent_orders || []).map((order) => (
                                <tr key={order.order_id}>
                                    <td>
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 border"
                                                style={{
                                                    background: `${C.sky}15`,
                                                    borderColor: `${C.sky}30`,
                                                    color: C.navy,
                                                }}
                                            >
                                                {order.customer_name.charAt(0)}
                                            </div>
                                            <span
                                                className="font-semibold"
                                                style={{ color: C.navy }}
                                            >
                                                {order.customer_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-slate-500 text-xs font-mono">
                                        {order.invoice}
                                    </td>
                                    <td
                                        className="text-right font-bold"
                                        style={{ color: C.navy }}
                                    >
                                        ₹{order.amount.toLocaleString("en-IN")}
                                    </td>
                                    <td className="text-right">
                                        {order.points > 0 ? (
                                            <span
                                                className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                                                style={{
                                                    background: "#FFF8EC",
                                                    color: C.amber,
                                                    borderColor: "#FFD899",
                                                }}
                                            >
                                                +{order.points} Pts
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-300">
                                                —
                                            </span>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="text-right text-xs text-slate-400 font-semibold">
                                        {order.time}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Shift Summary ─────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                    <CheckBadgeIcon
                        className="w-5 h-5"
                        style={{ color: C.mint }}
                    />
                    <h3
                        className="text-xs font-black uppercase tracking-widest"
                        style={{ color: C.navy }}
                    >
                        Today's Shift Summary
                    </h3>
                    <span className="ml-auto text-xs font-bold text-slate-400">
                        {dateString}
                    </span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        {
                            label: "Total Revenue",
                            value: `₹${tm.revenue.toLocaleString("en-IN")}`,
                            icon: "💰",
                            highlight: true,
                        },
                        {
                            label: "Total Orders",
                            value: tm.orders,
                            icon: "🛍️",
                            highlight: false,
                        },
                        {
                            label: "New Customers",
                            value: tm.new_customers,
                            icon: "👤",
                            highlight: false,
                        },
                        {
                            label: "Loyalty Points",
                            value: tm.points_issued.toLocaleString("en-IN"),
                            icon: "⭐",
                            highlight: false,
                        },
                        {
                            label: "Avg. Order Value",
                            value: `₹${tm.orders > 0 ? (tm.revenue / tm.orders).toLocaleString("en-IN", { maximumFractionDigits: 0 }) : 0}`,
                            icon: "📊",
                            highlight: false,
                        },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="rounded-2xl p-4 text-center border transition-all duration-300"
                            style={
                                item.highlight
                                    ? {
                                          background: `linear-gradient(135deg, ${C.sky} 0%, #0090AD 100%)`,
                                          borderColor: "transparent",
                                          boxShadow: `0 6px 16px ${C.sky}40`,
                                      }
                                    : {
                                          background: "#F8FAFB",
                                          borderColor: "#E9EDF2",
                                      }
                            }
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <p
                                className="text-xl font-black mt-1.5"
                                style={{
                                    color: item.highlight ? "#FFFFFF" : C.navy,
                                }}
                            >
                                {item.value}
                            </p>
                            <p
                                className="text-[10px] uppercase tracking-wider font-extrabold mt-1"
                                style={{
                                    color: item.highlight
                                        ? "rgba(255,255,255,0.80)"
                                        : "#94a3b8",
                                }}
                            >
                                {item.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
