import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import {
    BuildingOffice2Icon,
    CreditCardIcon,
    ArrowRightIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    InboxIcon,
    ArchiveBoxIcon,
    ExclamationTriangleIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";

const NavCard = ({ icon: Icon, title, desc, to, iconBg }) => (
    <Link
        to={to}
        className="group block glass-card p-5 cursor-pointer"
    >
        <div className="flex items-center justify-between mb-3">
            <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border text-white ${iconBg}`}
            >
                <Icon className="w-5 h-5" />
            </div>
            <ArrowRightIcon className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </div>
        <p className="text-sm font-black text-slate-800">{title}</p>
        <p className="text-xs text-slate-405 mt-0.5 leading-relaxed font-medium">{desc}</p>
    </Link>
);

const MOCK = {
    total_brands: 1,
    active_brands: 1,
    inactive_brands: 0,
    total_stores: 6,
    total_customers: 48,
    total_orders: 120,
    total_revenue: 842884,
    platform_credits: { sms: 340, wa_utility: 180, wa_marketing: 90 },
    pending_requests: 0,
    recent_brands: [
        {
            brand_id: "brand-fashion-india-001",
            brand_name: "Fashion Brand India",
            owner: "Rajesh Kumar",
            status: "active",
            created_at: "2025-01-15",
        },
    ],
};

export default function SADashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        setLoading(true);
        api.get("/admin/platform-stats")
            .then((r) => setStats(r.data))
            .catch(() => setStats(MOCK))
            .finally(() => setLoading(false));
    }, [refreshKey]);

    const s = stats || MOCK;

    return (
        <div className="space-y-6 pb-8">
            {/* ── Hero Banner — Premium Dark Indigo Gradient ── */}
            <div
                className="rounded-3xl overflow-hidden relative shadow-xl border border-white/10"
                style={{
                    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
                }}
            >
                {/* Decorative glows */}
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative px-7 py-6 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <ShieldCheckIcon className="w-5 h-5 text-indigo-400" />
                            <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-400/20">
                                Super Admin Console
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight">
                            Welcome back, {user?.full_name?.split(" ")[0] || "Admin"} 👋
                        </h1>
                        <p className="text-xs text-indigo-200/60 font-semibold mt-1">
                            Platform control center · Manage all brand owner configurations & platform credits
                        </p>
                    </div>
                    <button
                        onClick={() => setRefreshKey((k) => k + 1)}
                        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all active:scale-95 flex-shrink-0 cursor-pointer"
                    >
                        <ArrowPathIcon className="w-4 h-4 text-indigo-200" />
                    </button>
                </div>

                {/* Stat tiles — Sleek glassmorphic micro-cards */}
                <div className="relative z-10 px-7 pb-7">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                label: "Brand Owners",
                                val: s.total_brands,
                                icon: "🏢",
                                color: "text-indigo-200",
                            },
                            {
                                label: "Active Brands",
                                val: s.active_brands,
                                icon: "✅",
                                color: "text-emerald-200",
                            },
                            {
                                label: "Total Stores",
                                val: s.total_stores,
                                icon: "🏪",
                                color: "text-pink-200",
                            },
                            {
                                label: "Platform Customers",
                                val: (s.total_customers || 0).toLocaleString("en-IN"),
                                icon: "👥",
                                color: "text-indigo-200",
                            },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl px-4 py-3 hover:bg-white/10 transition-all duration-200"
                            >
                                <p className="text-2xl mb-1">{item.icon}</p>
                                <p className={`text-2xl font-black ${item.color} leading-none mt-1.5`}>
                                    {loading ? "..." : item.val}
                                </p>
                                <p className="text-[10px] font-extrabold text-indigo-200/50 uppercase tracking-wider mt-1.5">
                                    {item.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Pending Credit Requests Alert ── */}
            {!loading && (s.pending_requests || 0) > 0 && (
                <Link
                    to="/admin/credit-requests"
                    className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 hover:bg-amber-100/70 transition-all shadow-sm animate-pulse"
                >
                    <div className="flex items-center gap-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-black text-amber-850">
                                {s.pending_requests} Pending Credit Request{s.pending_requests > 1 ? "s" : ""}
                            </p>
                            <p className="text-xs text-amber-600 font-medium mt-0.5">
                                Brand owners are waiting for credit allocations. Please review and process these requests.
                            </p>
                        </div>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                </Link>
            )}

            {/* ── Platform Credits ── */}
            <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/50 to-transparent">
                    <p className="text-xs font-black text-slate-800 uppercase tracking-widest">
                        Platform Credits Pool — All Brands Combined
                    </p>
                    <Link
                        to="/admin/credits"
                        className="flex items-center gap-1 text-xs font-bold text-indigo-650 hover:text-indigo-800 transition-colors"
                    >
                        Allocations Ledger <ArrowRightIcon className="w-3 h-3" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    {[
                        {
                            icon: "📱",
                            label: "SMS Credits Pool",
                            val: s.platform_credits?.sms ?? 0,
                            warn: (s.platform_credits?.sms ?? 0) < 500,
                            color: "text-indigo-600 bg-indigo-50/50 border-indigo-100",
                        },
                        {
                            icon: "💚",
                            label: "WhatsApp Utility Pool",
                            val: s.platform_credits?.wa_utility ?? 0,
                            warn: (s.platform_credits?.wa_utility ?? 0) < 200,
                            color: "text-emerald-600 bg-emerald-50/50 border-emerald-100",
                        },
                        {
                            icon: "💗",
                            label: "WhatsApp Marketing Pool",
                            val: s.platform_credits?.wa_marketing ?? 0,
                            warn: (s.platform_credits?.wa_marketing ?? 0) < 200,
                            color: "text-pink-600 bg-pink-50/50 border-pink-100",
                        },
                    ].map((c) => (
                        <div
                            key={c.label}
                            className={`px-5 py-5 text-center transition-colors duration-300 ${c.warn ? "bg-rose-500/5" : ""}`}
                        >
                            <p className="text-2xl mb-1">{c.icon}</p>
                            <p
                                className={`text-2xl font-black ${c.warn ? "text-rose-600" : c.color.split(" ")[0]}`}
                            >
                                {loading ? "..." : c.val.toLocaleString("en-IN")}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 font-semibold">
                                {c.label}
                            </p>
                            {c.warn && !loading && (
                                <p className="text-[10px] text-rose-500 font-extrabold mt-1.5 flex items-center justify-center gap-0.5">
                                    ⚠️ Critically Low Stock!
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Quick Actions ── */}
            <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                    Super Admin Workflows
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <NavCard
                        icon={BuildingOffice2Icon}
                        title="Brand Owners"
                        desc="Create, view & modify brand owner registrations"
                        to="/admin/brand-owners"
                        iconBg="bg-indigo-600 border-indigo-500"
                    />
                    <NavCard
                        icon={CreditCardIcon}
                        title="Direct Top-ups"
                        desc="Directly allocate SMS & WhatsApp message balances"
                        to="/admin/credits"
                        iconBg="bg-pink-600 border-pink-500"
                    />
                    <NavCard
                        icon={InboxIcon}
                        title="Refill Requests"
                        desc="Approve, reject or hold credit requests from brands"
                        to="/admin/credit-requests"
                        iconBg="bg-amber-600 border-amber-500"
                    />
                    <NavCard
                        icon={ArchiveBoxIcon}
                        title="Stock Replenishment"
                        desc="Refill global platform credit stock pools"
                        to="/admin/platform-stock"
                        iconBg="bg-slate-800 border-slate-700"
                    />
                </div>
            </div>

            {/* ── Recent Brand Owners ── */}
            {s.recent_brands?.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                            Recently Registered Brands
                        </h3>
                        <Link
                            to="/admin/brand-owners"
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                            View all brands <ArrowRightIcon className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <div className="glass-card overflow-hidden">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Brand</th>
                                    <th>Owner</th>
                                    <th className="text-center">Status</th>
                                    <th className="text-right">Joined At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {s.recent_brands.map((b) => (
                                    <tr key={b.brand_id}>
                                        <td>
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white"
                                                    style={{
                                                        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                                                    }}
                                                >
                                                    {b.brand_name?.charAt(0)}
                                                </div>
                                                <span className="font-semibold text-slate-800">
                                                    {b.brand_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-slate-650 font-semibold">
                                            {b.owner}
                                        </td>
                                        <td className="text-center">
                                            <span
                                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border ${b.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"}`}
                                            >
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="text-right text-xs text-slate-450 font-semibold">
                                            {b.created_at?.substring(0, 10)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
