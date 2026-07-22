import { useState, useEffect } from "react";
import api from "../../services/api";
import {
    TagIcon,
    CheckCircleIcon,
    XCircleIcon,
    TicketIcon,
    ShieldCheckIcon,
    CalendarIcon,
} from "@heroicons/react/24/outline";

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_COUPONS = [
    {
        id: "c1",
        code: "MONSOON20",
        discount_type: "percentage",
        discount_value: 20,
        min_cart_value: 999,
        current_use_count: 87,
        usage_limit_global: 500,
        is_active: true,
        expiry_date: "2026-08-31",
    },
    {
        id: "c2",
        code: "WELCOME250",
        discount_type: "flat",
        discount_value: 250,
        min_cart_value: 500,
        current_use_count: 44,
        usage_limit_global: 0,
        is_active: true,
        expiry_date: "2026-12-31",
    },
    {
        id: "c3",
        code: "BDAY500",
        discount_type: "flat",
        discount_value: 500,
        min_cart_value: 2000,
        current_use_count: 12,
        usage_limit_global: 1,
        is_active: true,
        expiry_date: "2026-12-31",
    },
    {
        id: "c4",
        code: "CASHBACK10",
        discount_type: "cashback",
        discount_value: 10,
        min_cart_value: 1500,
        current_use_count: 163,
        usage_limit_global: 0,
        is_active: true,
        expiry_date: "2026-09-30",
    },
    {
        id: "c5",
        code: "WINBACK150",
        discount_type: "flat",
        discount_value: 150,
        min_cart_value: 0,
        current_use_count: 31,
        usage_limit_global: 0,
        is_active: false,
        expiry_date: "2026-05-31",
    },
];

const MOCK_STATS = {
    total_coupons: 5,
    active_coupons: 4,
    used_today: 7,
    total_saved: 142500,
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function discountLabel(c) {
    if (c.discount_type === "percentage") return `${c.discount_value}% off`;
    if (c.discount_type === "cashback") return `${c.discount_value}% cashback`;
    return `₹${c.discount_value} off`;
}

function StatCard({ label, value, sub, cardClass }) {
    return (
        <div className={`glass-card p-5 border ${cardClass}`}>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                {label}
            </p>
            <p className="text-3xl font-black text-slate-900">{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CouponsPage() {
    const [coupons, setCoupons] = useState([]);
    const [stats, setStats] = useState(MOCK_STATS);
    const [loading, setLoading] = useState(true);

    // Validator state
    const [form, setForm] = useState({
        coupon_code: "",
        cart_total: "",
        customer_mobile: "",
    });
    const [validating, setValidating] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        api.get("/coupons")
            .then((r) => {
                setCoupons(r.data.coupons || r.data || []);
                if (r.data.stats) setStats(r.data.stats);
            })
            .catch(() => setCoupons(MOCK_COUPONS))
            .finally(() => setLoading(false));
    }, []);

    const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleValidate = async (e) => {
        e.preventDefault();
        setValidating(true);
        setResult(null);
        try {
            const res = await api.post("/coupons/validate", {
                coupon_code: form.coupon_code.trim(),
                cart_total: parseFloat(form.cart_total),
                customer_mobile: form.customer_mobile || undefined,
            });
            setResult(res.data);
        } catch (err) {
            const d = err?.response?.data;
            setResult({
                is_valid: false,
                validation_message:
                    d?.detail || d?.message || "Coupon not found or invalid.",
                error_code: d?.error_code || "INVALID",
            });
        } finally {
            setValidating(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-5 animate-slide-up">
                <div className="page-header">
                    <div className="space-y-2">
                        <div className="skeleton h-8 w-64 rounded-xl" />
                        <div className="skeleton h-4 w-72 rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton h-24 rounded-2xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                    <div className="skeleton h-96 rounded-2xl" />
                    <div className="xl:col-span-2 skeleton h-96 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-slide-up">
            {/* ── Header ── */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Coupons & Validation</h1>
                    <p className="page-subtitle">
                        Validate coupon codes at checkout and view active
                        promotions
                    </p>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    label="Total Coupons"
                    value={stats.total_coupons}
                    sub="In system"
                    cardClass="sm-card-sky"
                />
                <StatCard
                    label="Active Coupons"
                    value={stats.active_coupons}
                    sub="Currently valid"
                    cardClass="sm-card-mint"
                />
                <StatCard
                    label="Used Today"
                    value={stats.used_today}
                    sub="Redemptions"
                    cardClass="sm-card-amber"
                />
                <StatCard
                    label="Total Saved"
                    value={`₹${stats.total_saved?.toLocaleString("en-IN")}`}
                    sub="By customers"
                    cardClass="sm-card-coral"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* ── Coupon Validator (main feature) ── */}
                <div className="xl:col-span-1">
                    <div
                        className="glass-card p-5 border-2"
                        style={{ borderColor: "rgba(16,185,129,0.25)" }}
                    >
                        {/* Card heading */}
                        <div className="flex items-center gap-3 mb-5">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: "rgba(16,185,129,0.12)" }}
                            >
                                <ShieldCheckIcon
                                    className="w-5 h-5"
                                    style={{ color: "#10b981" }}
                                />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">
                                    Coupon Validator
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Verify codes in real time at checkout
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleValidate} className="space-y-3">
                            <div>
                                <label className="input-label">
                                    Coupon Code
                                </label>
                                <input
                                    className="input-field font-mono uppercase tracking-widest"
                                    value={form.coupon_code}
                                    onChange={(e) =>
                                        setField(
                                            "coupon_code",
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    placeholder="MONSOON20"
                                    required
                                />
                            </div>
                            <div>
                                <label className="input-label">
                                    Cart Total (₹)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="input-field"
                                    value={form.cart_total}
                                    onChange={(e) =>
                                        setField("cart_total", e.target.value)
                                    }
                                    placeholder="2500.00"
                                    required
                                />
                            </div>
                            <div>
                                <label className="input-label">
                                    Customer Mobile{" "}
                                    <span className="text-slate-400 normal-case font-normal">
                                        (optional)
                                    </span>
                                </label>
                                <input
                                    className="input-field"
                                    value={form.customer_mobile}
                                    onChange={(e) =>
                                        setField(
                                            "customer_mobile",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="9876543210"
                                    maxLength={10}
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={validating}
                                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95 disabled:opacity-70"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                    boxShadow:
                                        "0 4px 14px rgba(16,185,129,0.35)",
                                }}
                            >
                                {validating ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <TagIcon className="w-4 h-4" />
                                )}
                                {validating ? "Validating…" : "Validate Coupon"}
                            </button>
                        </form>

                        {/* Validation result */}
                        {result && (
                            <div
                                className={`mt-4 p-4 rounded-2xl border animate-slide-up ${
                                    result.is_valid
                                        ? "bg-emerald-50 border-emerald-200"
                                        : "bg-rose-50 border-rose-200"
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    {result.is_valid ? (
                                        <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <XCircleIcon className="w-5 h-5 text-rose-500" />
                                    )}
                                    <span
                                        className={`text-sm font-bold ${result.is_valid ? "text-emerald-700" : "text-rose-700"}`}
                                    >
                                        {result.is_valid
                                            ? "✓ Valid Coupon!"
                                            : "Invalid Coupon"}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 mb-1">
                                    {result.validation_message}
                                </p>

                                {result.is_valid && (
                                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-white rounded-xl p-3 border border-emerald-100">
                                            <p className="text-slate-400 font-medium">
                                                Discount Applied
                                            </p>
                                            <p className="text-slate-900 font-black text-base mt-0.5">
                                                ₹
                                                {(
                                                    result.discount_applied || 0
                                                ).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                        <div className="bg-white rounded-xl p-3 border border-emerald-100">
                                            <p className="text-slate-400 font-medium">
                                                New Total
                                            </p>
                                            <p className="text-emerald-600 font-black text-base mt-0.5">
                                                ₹
                                                {(
                                                    result.new_cart_total || 0
                                                ).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                        {result.expiry_date && (
                                            <div className="col-span-2 flex items-center gap-1.5 text-slate-400">
                                                <CalendarIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span>
                                                    Expires {result.expiry_date}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!result.is_valid && result.error_code && (
                                    <p className="mt-2 text-xs font-mono text-rose-500 bg-rose-100 px-2 py-1 rounded-lg inline-block">
                                        {result.error_code}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Active Coupons List ── */}
                <div className="xl:col-span-2 glass-card overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <TicketIcon className="w-4 h-4 text-emerald-500" />
                            Active Coupons
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Discount</th>
                                    <th>Min Cart</th>
                                    <th>Usage</th>
                                    <th>Expires</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-12 text-center"
                                        >
                                            <TicketIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                            <p className="text-sm text-slate-400">
                                                No coupons available
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    coupons.map((c) => (
                                        <tr key={c.id || c.coupon_id}>
                                            <td>
                                                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                                                    {c.code}
                                                </span>
                                            </td>
                                            <td className="text-xs font-semibold text-slate-700 capitalize">
                                                {discountLabel(c)}
                                            </td>
                                            <td className="text-xs text-slate-500">
                                                {c.min_cart_value > 0
                                                    ? `₹${c.min_cart_value.toLocaleString("en-IN")}`
                                                    : "No min"}
                                            </td>
                                            <td className="text-xs">
                                                <span className="text-slate-800 font-semibold">
                                                    {c.current_use_count || 0}
                                                </span>
                                                <span className="text-slate-400">
                                                    {" "}
                                                    /{" "}
                                                    {c.usage_limit_global > 0
                                                        ? c.usage_limit_global
                                                        : "∞"}
                                                </span>
                                            </td>
                                            <td className="text-xs text-slate-400">
                                                {c.expiry_date || "—"}
                                            </td>
                                            <td>
                                                <span
                                                    className={
                                                        c.is_active
                                                            ? "badge-success"
                                                            : "badge-danger"
                                                    }
                                                >
                                                    {c.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
