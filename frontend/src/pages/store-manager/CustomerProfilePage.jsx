import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
    ArrowLeftIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    CalendarIcon,
    StarIcon,
    BuildingStorefrontIcon,
    ShoppingBagIcon,
} from "@heroicons/react/24/outline";

// ─── Mock data ────────────────────────────────────────────────────────────────
function getMockCustomer(id) {
    return {
        customer_id: id || "c001",
        name: "Siddharth Sharma",
        email: "siddharth@email.com",
        mobile: "+91 98765 43210",
        gender: "Male",
        dob: "1991-10-15",
        city: "New Delhi",
        state: "Delhi",
        loyalty_tier: "Gold",
        status: "active",
        lifetime_value: 148220,
        total_orders: 12,
        current_points_balance: 4210,
        visits_to_store: 9,
        created_at: "2024-01-12T00:00:00Z",
        last_purchase_date: "2026-06-20T10:30:00Z",
    };
}

function getMockOrders() {
    return [
        {
            order_id: "INV-2026-9001",
            date: "2026-06-20T10:30:00Z",
            amount: 3240,
            points_earned: 324,
            status: "completed",
        },
        {
            order_id: "INV-2026-8840",
            date: "2026-05-02T19:30:00Z",
            amount: 4200,
            points_earned: 420,
            status: "completed",
        },
        {
            order_id: "INV-2026-7810",
            date: "2026-04-15T14:20:00Z",
            amount: 1850,
            points_earned: 185,
            status: "completed",
        },
        {
            order_id: "INV-2026-6990",
            date: "2026-03-28T11:00:00Z",
            amount: 5600,
            points_earned: 560,
            status: "completed",
        },
        {
            order_id: "INV-2026-6210",
            date: "2026-02-14T16:45:00Z",
            amount: 920,
            points_earned: 0,
            status: "refunded",
        },
    ];
}

function getMockPointsHistory() {
    return [
        {
            txn_id: "pt-001",
            type: "earn",
            points: 324,
            description: "Purchase — INV-2026-9001",
            date: "2026-06-20T10:30:00Z",
        },
        {
            txn_id: "pt-002",
            type: "earn",
            points: 420,
            description: "Purchase — INV-2026-8840",
            date: "2026-05-02T19:30:00Z",
        },
        {
            txn_id: "pt-003",
            type: "redeem",
            points: -500,
            description: "Redemption at checkout",
            date: "2026-04-20T13:00:00Z",
        },
        {
            txn_id: "pt-004",
            type: "earn",
            points: 185,
            description: "Purchase — INV-2026-7810",
            date: "2026-04-15T14:20:00Z",
        },
        {
            txn_id: "pt-005",
            type: "earn",
            points: 250,
            description: "Bonus — Referral reward",
            date: "2026-03-10T09:00:00Z",
        },
    ];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso, includeTime = false) {
    if (!iso) return "—";
    try {
        const opts = { day: "2-digit", month: "short", year: "numeric" };
        if (includeTime) {
            opts.hour = "2-digit";
            opts.minute = "2-digit";
            opts.hour12 = true;
        }
        return new Date(iso).toLocaleDateString("en-IN", opts);
    } catch {
        return "—";
    }
}

const TIER_BADGE_CLS = {
    Silver: "badge-silver",
    Gold: "badge-gold",
    Platinum: "badge-platinum",
    Diamond: "badge-diamond",
};
const TIER_ICON = { Silver: "⚪", Gold: "🥇", Platinum: "💎", Diamond: "💠" };

const ORDER_STATUS_CLS = {
    completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    refunded: "bg-rose-50 text-rose-600 border border-rose-200",
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function ProfileSkeleton() {
    return (
        <div className="space-y-5 animate-pulse">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                <div className="h-6 w-48 bg-slate-200 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                <div className="space-y-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 h-64" />
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 h-48" />
                </div>
                <div className="xl:col-span-2 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 h-64" />
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 h-48" />
                </div>
            </div>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CustomerProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [txns, setTxns] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Fetch customer data ────────────────────────────────────────────────────
    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [cRes, oRes, tRes] = await Promise.all([
                    api.get(`/customers/${id}`),
                    api.get(`/customers/${id}/orders`, {
                        params: { limit: 5 },
                    }),
                    api.get(`/customers/${id}/timeline`, {
                        params: { limit: 5 },
                    }),
                ]);
                setCustomer(cRes.data);
                setOrders(oRes.data?.orders || oRes.data || []);
                setTxns(tRes.data?.timeline || tRes.data || []);
            } catch {
                setCustomer(getMockCustomer(id));
                setOrders(getMockOrders());
                setTxns(getMockPointsHistory());
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id]);

    if (loading) return <ProfileSkeleton />;

    const c = customer;
    const tier = c?.loyalty_tier || "Silver";

    // ── Tier progress ──────────────────────────────────────────────────────────
    const TIER_THRESHOLDS = [
        { tier: "Silver", min: 0, max: 10000, color: "#94a3b8" },
        { tier: "Gold", min: 10000, max: 50000, color: "#f59e0b" },
        { tier: "Platinum", min: 50000, max: 100000, color: "#818cf8" },
        { tier: "Diamond", min: 100000, max: 100000, color: "#a78bfa" },
    ];
    const ltv = c?.lifetime_value || 0;

    return (
        <div className="space-y-5 pb-10 animate-slide-up">
            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate("/customers")}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="page-title">Customer Profile</h1>
                    <p className="page-subtitle">Store-scoped loyalty view</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* ── LEFT COLUMN ───────────────────────────────────────────────────── */}
                <div className="space-y-4">
                    {/* Profile card */}
                    <div className="glass-card p-5">
                        {/* Avatar + name */}
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black text-white flex-shrink-0 shadow-md"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #10b981, #0d9488)",
                                }}
                            >
                                {c.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900">
                                    {c.name}
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    ID: {c.customer_id?.slice(0, 12)}
                                </p>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span
                                className={`${TIER_BADGE_CLS[tier] || "badge-silver"} text-sm px-3 py-1`}
                            >
                                {TIER_ICON[tier]} {tier} Member
                            </span>
                            <span
                                className={
                                    c.status === "active"
                                        ? "badge-success"
                                        : "badge-warning"
                                }
                            >
                                {c.status}
                            </span>
                        </div>

                        {/* Contact details */}
                        <div className="space-y-2.5 text-sm">
                            {c.mobile && (
                                <div className="flex items-center gap-2 text-slate-600">
                                    <PhoneIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    {c.mobile}
                                </div>
                            )}
                            {c.email && (
                                <div className="flex items-center gap-2 text-slate-600">
                                    <EnvelopeIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    {c.email}
                                </div>
                            )}
                            {c.dob && (
                                <div className="flex items-center gap-2 text-slate-600">
                                    <CalendarIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    DOB: {fmtDate(c.dob)}
                                </div>
                            )}
                            {(c.city || c.state) && (
                                <div className="flex items-center gap-2 text-slate-600">
                                    <MapPinIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    {[c.city, c.state]
                                        .filter(Boolean)
                                        .join(", ")}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Key metrics */}
                    <div className="glass-card p-5">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                            Key Metrics
                        </h3>
                        <div className="space-y-3">
                            {[
                                {
                                    label: "Points Balance",
                                    value: (
                                        c.current_points_balance || 0
                                    ).toLocaleString("en-IN"),
                                    color: "text-emerald-600",
                                },
                                {
                                    label: "Lifetime Value",
                                    value: `₹${(c.lifetime_value || 0).toLocaleString("en-IN")}`,
                                    color: "text-indigo-600",
                                },
                                {
                                    label: "Total Orders",
                                    value: c.total_orders || 0,
                                    color: "text-slate-700",
                                },
                                {
                                    label: "Visited My Store",
                                    value: c.visits_to_store || "—",
                                    color: "text-emerald-600",
                                },
                                {
                                    label: "Member Since",
                                    value: c.created_at
                                        ? fmtDate(c.created_at)
                                        : "—",
                                    color: "text-slate-500",
                                },
                                {
                                    label: "Last Visit",
                                    value: c.last_purchase_date
                                        ? fmtDate(c.last_purchase_date)
                                        : "—",
                                    color: "text-slate-500",
                                },
                            ].map((m) => (
                                <div
                                    key={m.label}
                                    className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0"
                                >
                                    <span className="text-xs text-slate-500">
                                        {m.label}
                                    </span>
                                    <span
                                        className={`text-xs font-bold ${m.color}`}
                                    >
                                        {m.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tier progress */}
                    <div className="glass-card p-5">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                            Tier Progress
                        </h3>
                        {TIER_THRESHOLDS.map((t) => {
                            const isActive = tier === t.tier;
                            const pct =
                                t.max === t.min
                                    ? 100
                                    : Math.min(
                                          100,
                                          Math.max(
                                              0,
                                              ((ltv - t.min) /
                                                  (t.max - t.min)) *
                                                  100,
                                          ),
                                      );
                            return (
                                <div
                                    key={t.tier}
                                    className={`mb-3 p-2 rounded-lg ${isActive ? "bg-emerald-50 border border-emerald-100" : ""}`}
                                >
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span
                                            className={
                                                isActive
                                                    ? "text-emerald-700 font-bold"
                                                    : "text-slate-400"
                                            }
                                        >
                                            {t.tier}
                                            {isActive ? " ← Current" : ""}
                                        </span>
                                        <span className="text-slate-400">
                                            ₹{t.min.toLocaleString("en-IN")}+
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${Math.max(0, pct)}%`,
                                                background: t.color,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── RIGHT COLUMNS (2/3) ────────────────────────────────────────────── */}
                <div className="xl:col-span-2 space-y-5">
                    {/* Store visit banner */}
                    <div
                        className="border rounded-2xl p-4 flex items-center gap-4"
                        style={{
                            background:
                                "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                            borderColor: "#6ee7b7",
                        }}
                    >
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                            style={{ background: "#10b981" }}
                        >
                            <BuildingStorefrontIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-emerald-800">
                                Visited Your Store
                            </p>
                            <p className="text-2xl font-black text-emerald-900">
                                {c.visits_to_store ?? "—"} times
                            </p>
                        </div>
                        <div className="ml-auto text-right">
                            <p className="text-xs text-emerald-600 font-semibold">
                                Last visit
                            </p>
                            <p className="text-sm font-bold text-emerald-800">
                                {fmtDate(c.last_purchase_date)}
                            </p>
                        </div>
                    </div>

                    {/* Recent orders */}
                    <div className="glass-card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <ShoppingBagIcon className="w-4 h-4 text-emerald-500" />
                                <h3 className="text-sm font-bold text-slate-800">
                                    Recent Orders
                                </h3>
                                <span className="text-xs text-slate-400">
                                    (last 5)
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="text-left pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                            Invoice
                                        </th>
                                        <th className="text-left pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                            Date
                                        </th>
                                        <th className="text-right pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                            Amount
                                        </th>
                                        <th className="text-right pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                            Pts Earned
                                        </th>
                                        <th className="text-left pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="text-center py-8 text-sm text-slate-400"
                                            >
                                                No orders yet
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((o) => (
                                            <tr
                                                key={o.order_id}
                                                className="hover:bg-slate-50 transition-colors"
                                            >
                                                <td className="py-3 font-mono text-xs text-slate-600">
                                                    {o.order_id}
                                                </td>
                                                <td className="py-3 text-xs text-slate-500">
                                                    {fmtDate(o.date)}
                                                </td>
                                                <td className="py-3 text-right font-bold text-slate-800">
                                                    ₹
                                                    {(
                                                        o.amount || 0
                                                    ).toLocaleString("en-IN")}
                                                </td>
                                                <td className="py-3 text-right font-mono text-emerald-600 font-semibold">
                                                    +{o.points_earned || 0}
                                                </td>
                                                <td className="py-3">
                                                    <span
                                                        className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${ORDER_STATUS_CLS[o.status] || ""}`}
                                                    >
                                                        {o.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Loyalty points history */}
                    <div className="glass-card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <StarIcon className="w-4 h-4 text-amber-500" />
                                <h3 className="text-sm font-bold text-slate-800">
                                    Points History
                                </h3>
                                <span className="text-xs text-slate-400">
                                    (last 5 transactions)
                                </span>
                            </div>
                            <div
                                className="text-xs font-bold px-3 py-1 rounded-full"
                                style={{
                                    background: "#ecfdf5",
                                    color: "#059669",
                                }}
                            >
                                Balance:{" "}
                                {(c.current_points_balance || 0).toLocaleString(
                                    "en-IN",
                                )}{" "}
                                pts
                            </div>
                        </div>
                        <div className="space-y-2">
                            {txns.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-8">
                                    No transactions yet
                                </p>
                            ) : (
                                txns.map((t, i) => {
                                    // Normalise: accept either the mock shape or the API timeline shape
                                    const isEarn =
                                        t.type === "earn" || t.points > 0;
                                    const pts =
                                        t.points ??
                                        t.payload?.points_allocated ??
                                        t.payload?.points ??
                                        0;
                                    const desc =
                                        t.description ||
                                        t.summary ||
                                        "Loyalty transaction";
                                    const date = t.date || t.created_at;
                                    return (
                                        <div
                                            key={t.txn_id || t.event_id || i}
                                            className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                                        >
                                            <div
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black ${
                                                    isEarn
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-rose-100 text-rose-600"
                                                }`}
                                            >
                                                {isEarn ? "+" : "−"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-slate-700 truncate">
                                                    {desc}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {fmtDate(date, true)}
                                                </p>
                                            </div>
                                            <div
                                                className={`text-sm font-black tabular-nums ${isEarn ? "text-emerald-600" : "text-rose-500"}`}
                                            >
                                                {isEarn ? "+" : ""}
                                                {Number(pts).toLocaleString(
                                                    "en-IN",
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
