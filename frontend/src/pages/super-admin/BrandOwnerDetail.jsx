import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
    ArrowLeftIcon,
    PencilSquareIcon,
    CheckIcon,
    XMarkIcon,
    BuildingStorefrontIcon,
    UserCircleIcon,
    CreditCardIcon,
    ChartBarIcon,
    ShieldCheckIcon,
    NoSymbolIcon,
    CheckCircleIcon,
    EyeIcon,
    EyeSlashIcon,
} from "@heroicons/react/24/outline";

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({ title, icon: Icon, children, className = "" }) => (
    <div
        className={`bg-white border border-slate-200 rounded-2xl overflow-hidden ${className}`}
    >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Icon className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

// ─── Editable Field ───────────────────────────────────────────────────────────
const EditField = ({
    label,
    value,
    onChange,
    type = "text",
    readOnly = false,
}) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            {label}
        </label>
        <input
            type={type}
            value={value || ""}
            onChange={onChange}
            readOnly={readOnly}
            className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none transition-all ${
                readOnly
                    ? "bg-slate-50 border-slate-100 cursor-not-allowed text-slate-500"
                    : "border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
            }`}
        />
    </div>
);

// ─── Stat Tile ────────────────────────────────────────────────────────────────
const StatTile = ({ icon, label, value, bg, color }) => (
    <div className={`${bg} rounded-xl p-4`}>
        <p className="text-2xl mb-1">{icon}</p>
        <p className={`text-xl font-black ${color}`}>{value}</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5 leading-tight">
            {label}
        </p>
    </div>
);

// ─── MOCK fallback ────────────────────────────────────────────────────────────
const MOCK = {
    user: {
        user_id: "demo-u1",
        full_name: "Rajesh Kumar",
        email: "brandowner@fashionbrand.io",
        phone: "+91 9800000001",
        status: "active",
        role: "Brand Owner",
        created_at: "2025-01-15",
        last_login: "2026-06-19",
    },
    brand: {
        brand_id: "brand-fashion-india-001",
        name: "Fashion Brand India",
        logo_url: "",
        currency: "INR",
        status: "active",
        settings: {
            points_per_100: 10,
            point_to_inr: 0.1,
            min_redemption_points: 500,
            max_redemption_pct: 0.5,
        },
    },
    credits: { sms: 340, email: 100, wa_utility: 180, wa_marketing: 90 },
    stats: {
        total_customers: 48,
        total_orders: 120,
        completed_orders: 110,
        total_revenue: 842884,
        avg_rating: 4.2,
        total_campaigns: 5,
        active_campaigns: 3,
        total_stores: 6,
    },
    stores: [
        {
            store_id: "s1",
            name: "New Delhi Flagship",
            city: "New Delhi",
            state: "Delhi",
            status: "active",
            store_code: "DEL-01",
        },
        {
            store_id: "s2",
            name: "Mumbai Colaba",
            city: "Mumbai",
            state: "Maharashtra",
            status: "active",
            store_code: "MUM-01",
        },
    ],
};

export default function BrandOwnerDetail() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const [form, setForm] = useState({
        full_name: "",
        phone: "",
        brand_name: "",
        brand_currency: "INR",
        new_password: "",
        sms: "",
        wa_utility: "",
        wa_marketing: "",
        company_name: "",
        gst_number: "",
        business_type: "",
        city: "",
        state: "",
        pincode: "",
        website: "",
    });

    const load = () => {
        setLoading(true);
        api.get(`/admin/brand-owner/${userId}`)
            .then((r) => {
                setData(r.data);
                setForm({
                    full_name: r.data.user.full_name,
                    phone: r.data.user.phone || "",
                    brand_name: r.data.brand.name,
                    brand_currency: r.data.brand.currency || "INR",
                    new_password: "",
                    sms: r.data.credits.sms ?? 0,
                    wa_utility: r.data.credits.wa_utility ?? 0,
                    wa_marketing: r.data.credits.wa_marketing ?? 0,
                    company_name: r.data.user.company_name || "",
                    gst_number: r.data.user.gst_number || "",
                    business_type: r.data.user.business_type || "",
                    city: r.data.user.city || "",
                    state: r.data.user.state || "",
                    pincode: r.data.user.pincode || "",
                    website: r.data.user.website || "",
                });
            })
            .catch(() => {
                setData(MOCK);
                setForm({
                    full_name: MOCK.user.full_name,
                    phone: MOCK.user.phone,
                    brand_name: MOCK.brand.name,
                    brand_currency: MOCK.brand.currency,
                    new_password: "",
                    sms: MOCK.credits.sms,
                    wa_utility: MOCK.credits.wa_utility,
                    wa_marketing: MOCK.credits.wa_marketing,
                    company_name: "",
                    gst_number: "",
                    business_type: "",
                    city: "",
                    state: "",
                    pincode: "",
                    website: "",
                });
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, [userId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Update owner details
            await api.put(`/admin/brand-owner/${userId}`, {
                full_name: form.full_name,
                phone: form.phone,
                brand_name: form.brand_name,
                brand_currency: form.brand_currency,
                company_name: form.company_name,
                gst_number: form.gst_number,
                business_type: form.business_type,
                city: form.city,
                state: form.state,
                pincode: form.pincode,
                website: form.website,
                ...(form.new_password
                    ? { new_password: form.new_password }
                    : {}),
            });
            // Update credits
            await api.put(`/admin/credits/${data.brand.brand_id}`, {
                sms: Number(form.sms),
                wa_utility: Number(form.wa_utility),
                wa_marketing: Number(form.wa_marketing),
            });
            toast.success("Brand owner updated successfully!");
            setEditing(false);
            load();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async () => {
        try {
            const res = await api.patch(
                `/admin/brand-owner/${userId}/toggle-status`,
            );
            toast.success(`Account is now ${res.data.status}`);
            load();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed");
        }
    };

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="w-8 h-8 border-2 border-t-transparent border-indigo-600 rounded-full animate-spin" />
            </div>
        );

    const d = data || MOCK;
    const isActive = d.user.status === "active";
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    return (
        <div className="space-y-6 pb-8">
            {/* ── Top bar ── */}
            <div className="flex items-center gap-4 flex-wrap">
                <button
                    onClick={() => navigate("/admin/brand-owners")}
                    className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back to Brand Owners
                </button>
                <div className="ml-auto flex items-center gap-2">
                    {/* Toggle Status */}
                    <button
                        onClick={handleToggleStatus}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                            isActive
                                ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                        }`}
                    >
                        {isActive ? (
                            <>
                                <NoSymbolIcon className="w-3.5 h-3.5" />
                                Deactivate
                            </>
                        ) : (
                            <>
                                <CheckCircleIcon className="w-3.5 h-3.5" />
                                Activate
                            </>
                        )}
                    </button>
                    {/* Edit / Save */}
                    {editing ? (
                        <>
                            <button
                                onClick={() => setEditing(false)}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                <XMarkIcon className="w-3.5 h-3.5" />
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-60 transition-all"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                                }}
                            >
                                {saving ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckIcon className="w-3.5 h-3.5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                            style={{
                                background:
                                    "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                            }}
                        >
                            <PencilSquareIcon className="w-3.5 h-3.5" />
                            Edit Details
                        </button>
                    )}
                </div>
            </div>

            {/* ── Hero Header ── */}
            <div
                className="rounded-2xl overflow-hidden relative"
                style={{
                    background:
                        "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
                }}
            >
                <div className="px-7 py-6 flex flex-col xl:flex-row items-start xl:items-center gap-5">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
                        style={{
                            background:
                                "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                        }}
                    >
                        {d.user.full_name?.charAt(0) || "B"}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl font-black text-slate-900">
                                {d.user.full_name}
                            </h1>
                            <span
                                className={`text-xs font-bold px-2.5 py-1 rounded-full ${isActive ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-600 border border-red-200"}`}
                            >
                                {isActive ? "● Active" : "● Inactive"}
                            </span>
                        </div>
                        <p className="text-indigo-700 text-sm mt-0.5">
                            {d.user.email}
                        </p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="text-xs font-semibold text-indigo-700 bg-white/60 px-2.5 py-1 rounded-full">
                                🏢 {d.brand.name}
                            </span>
                            {d.user.phone && (
                                <span className="text-xs text-indigo-700">
                                    {d.user.phone}
                                </span>
                            )}
                            {d.user.business_type && (
                                <span className="text-xs font-bold text-indigo-700 bg-white/60 px-2.5 py-1 rounded-full">
                                    {d.user.business_type}
                                </span>
                            )}
                            {(d.user.city || d.user.state) && (
                                <span className="text-xs text-indigo-700">
                                    📍{" "}
                                    {[d.user.city, d.user.state]
                                        .filter(Boolean)
                                        .join(", ")}
                                </span>
                            )}
                            <span className="text-xs text-indigo-700">
                                Joined: {d.user.created_at?.substring(0, 10)}
                            </span>
                        </div>
                    </div>
                    {/* Quick credit pills */}
                    <div className="flex gap-2 flex-wrap flex-shrink-0">
                        {[
                            { label: "SMS", val: d.credits.sms, icon: "📱" },
                            {
                                label: "WA Utility",
                                val: d.credits.wa_utility,
                                icon: "💚",
                            },
                            {
                                label: "WA Mktg",
                                val: d.credits.wa_marketing,
                                icon: "💗",
                            },
                        ].map((c) => (
                            <div
                                key={c.label}
                                className="bg-white/60 backdrop-blur border border-white/50 rounded-xl px-3 py-2 text-center"
                            >
                                <p className="text-lg font-black text-slate-800">
                                    {c.icon} {c.val}
                                </p>
                                <p className="text-[10px] text-indigo-700">
                                    {c.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatTile
                    icon="👥"
                    label="Total Customers"
                    value={d.stats.total_customers.toLocaleString("en-IN")}
                    bg="bg-blue-50"
                    color="text-blue-700"
                />
                <StatTile
                    icon="🛍️"
                    label="Total Orders"
                    value={d.stats.total_orders.toLocaleString("en-IN")}
                    bg="bg-purple-50"
                    color="text-purple-700"
                />
                <StatTile
                    icon="💰"
                    label="Total Revenue"
                    value={`₹${(d.stats.total_revenue / 100000).toFixed(1)}L`}
                    bg="bg-amber-50"
                    color="text-amber-700"
                />
                <StatTile
                    icon="⭐"
                    label="Avg. Rating"
                    value={d.stats.avg_rating || "—"}
                    bg="bg-green-50"
                    color="text-green-700"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* ── Left column: personal + brand ── */}
                <div className="xl:col-span-2 space-y-5">
                    {/* Personal Info */}
                    <SectionCard
                        title="Personal Information"
                        icon={UserCircleIcon}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <EditField
                                label="Full Name"
                                value={form.full_name}
                                onChange={(e) =>
                                    set("full_name", e.target.value)
                                }
                                readOnly={!editing}
                            />
                            <EditField
                                label="Phone"
                                value={form.phone}
                                onChange={(e) => set("phone", e.target.value)}
                                readOnly={!editing}
                            />
                            <EditField
                                label="Email Address"
                                value={d.user.email}
                                readOnly={true}
                            />
                            <EditField
                                label="Role"
                                value={d.user.role}
                                readOnly={true}
                            />
                            <EditField
                                label="Account Created"
                                value={d.user.created_at?.substring(0, 10)}
                                readOnly={true}
                            />
                            <EditField
                                label="Last Login"
                                value={
                                    d.user.last_login?.substring(0, 10) ||
                                    "Never"
                                }
                                readOnly={true}
                            />
                        </div>
                        {editing && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                                    Change Password (optional)
                                </p>
                                <div className="relative max-w-xs">
                                    <input
                                        type={showPass ? "text" : "password"}
                                        value={form.new_password}
                                        onChange={(e) =>
                                            set("new_password", e.target.value)
                                        }
                                        placeholder="Leave blank to keep unchanged"
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPass ? (
                                            <EyeSlashIcon className="w-4 h-4" />
                                        ) : (
                                            <EyeIcon className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </SectionCard>

                    {/* Company Details */}
                    <SectionCard
                        title="Company & Business Details"
                        icon={BuildingStorefrontIcon}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <EditField
                                label="Legal Company Name"
                                value={form.company_name}
                                onChange={(e) =>
                                    set("company_name", e.target.value)
                                }
                                readOnly={!editing}
                            />
                            <EditField
                                label="GST Number"
                                value={form.gst_number}
                                onChange={(e) =>
                                    set("gst_number", e.target.value)
                                }
                                readOnly={!editing}
                            />
                            {editing ? (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Business Type
                                    </label>
                                    <select
                                        value={form.business_type}
                                        onChange={(e) =>
                                            set("business_type", e.target.value)
                                        }
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
                                    >
                                        <option value="">Select type...</option>
                                        {[
                                            "Retail",
                                            "Restaurant",
                                            "FMCG",
                                            "Fashion",
                                            "Electronics",
                                            "Pharmacy",
                                            "Grocery",
                                            "Services",
                                            "Other",
                                        ].map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <EditField
                                    label="Business Type"
                                    value={form.business_type || "—"}
                                    readOnly={true}
                                />
                            )}
                            <EditField
                                label="Website"
                                value={form.website}
                                onChange={(e) => set("website", e.target.value)}
                                readOnly={!editing}
                            />
                            <EditField
                                label="City"
                                value={form.city}
                                onChange={(e) => set("city", e.target.value)}
                                readOnly={!editing}
                            />
                            <EditField
                                label="State"
                                value={form.state}
                                onChange={(e) => set("state", e.target.value)}
                                readOnly={!editing}
                            />
                            <EditField
                                label="Pincode"
                                value={form.pincode}
                                onChange={(e) => set("pincode", e.target.value)}
                                readOnly={!editing}
                            />
                        </div>
                    </SectionCard>

                    {/* Brand Info */}
                    <SectionCard
                        title="Brand Information"
                        icon={BuildingStorefrontIcon}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <EditField
                                label="Brand Name"
                                value={form.brand_name}
                                onChange={(e) =>
                                    set("brand_name", e.target.value)
                                }
                                readOnly={!editing}
                            />
                            <EditField
                                label="Currency"
                                value={form.brand_currency}
                                onChange={(e) =>
                                    set("brand_currency", e.target.value)
                                }
                                readOnly={!editing}
                            />
                            <EditField
                                label="Brand ID"
                                value={d.brand.brand_id}
                                readOnly={true}
                            />
                            <EditField
                                label="Brand Status"
                                value={d.brand.status}
                                readOnly={true}
                            />
                        </div>
                        {d.brand.settings && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                                    Loyalty Settings
                                </p>
                                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                                    {[
                                        {
                                            label: "Points per ₹100",
                                            val:
                                                d.brand.settings
                                                    .points_per_100 ?? 10,
                                        },
                                        {
                                            label: "₹ per Point",
                                            val:
                                                d.brand.settings.point_to_inr ??
                                                0.1,
                                        },
                                        {
                                            label: "Min Redemption",
                                            val: `${d.brand.settings.min_redemption_points ?? 500} pts`,
                                        },
                                        {
                                            label: "Max Redemption %",
                                            val: `${((d.brand.settings.max_redemption_pct ?? 0.5) * 100).toFixed(0)}%`,
                                        },
                                    ].map((s) => (
                                        <div
                                            key={s.label}
                                            className="bg-slate-50 rounded-xl p-3 text-center"
                                        >
                                            <p className="text-lg font-black text-indigo-700">
                                                {s.val}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight">
                                                {s.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </SectionCard>

                    {/* Stores */}
                    {d.stores?.length > 0 && (
                        <SectionCard
                            title={`Stores (${d.stores.length})`}
                            icon={BuildingStorefrontIcon}
                        >
                            <div className="space-y-2">
                                {d.stores.map((s) => (
                                    <div
                                        key={s.store_id}
                                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100/60 flex items-center justify-center flex-shrink-0">
                                            <BuildingStorefrontIcon className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate">
                                                {s.name}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {s.city}, {s.state} ·{" "}
                                                {s.store_code}
                                            </p>
                                        </div>
                                        <span
                                            className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${s.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                                        >
                                            {s.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}
                </div>

                {/* ── Right column: credits + activity ── */}
                <div className="space-y-5">
                    {/* Credits Management */}
                    <SectionCard
                        title="SMS & WhatsApp Credits"
                        icon={CreditCardIcon}
                    >
                        <div className="space-y-4">
                            {[
                                {
                                    label: "📱 SMS Credits",
                                    key: "sms",
                                    bg: "bg-blue-50",
                                    color: "text-blue-700",
                                },
                                {
                                    label: "💚 WhatsApp Utility",
                                    key: "wa_utility",
                                    bg: "bg-green-50",
                                    color: "text-green-700",
                                },
                                {
                                    label: "💗 WhatsApp Marketing",
                                    key: "wa_marketing",
                                    bg: "bg-pink-50",
                                    color: "text-pink-700",
                                },
                            ].map((f) => (
                                <div key={f.key}>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                                        {f.label}
                                    </label>
                                    {editing ? (
                                        <input
                                            type="number"
                                            min="0"
                                            value={form[f.key]}
                                            onChange={(e) =>
                                                set(f.key, e.target.value)
                                            }
                                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                        />
                                    ) : (
                                        <div
                                            className={`${f.bg} rounded-xl px-4 py-3 flex items-center justify-between`}
                                        >
                                            <span
                                                className={`text-xl font-black ${f.color}`}
                                            >
                                                {Number(
                                                    form[f.key],
                                                ).toLocaleString("en-IN")}
                                            </span>
                                            {Number(form[f.key]) < 50 && (
                                                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                                    Low
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    {/* Activity Stats */}
                    <SectionCard title="Activity Overview" icon={ChartBarIcon}>
                        <div className="space-y-3">
                            {[
                                {
                                    label: "Total Stores",
                                    val: d.stats.total_stores,
                                    icon: "🏪",
                                },
                                {
                                    label: "Active Campaigns",
                                    val: d.stats.active_campaigns,
                                    icon: "📢",
                                },
                                {
                                    label: "Total Campaigns",
                                    val: d.stats.total_campaigns,
                                    icon: "📋",
                                },
                                {
                                    label: "Completed Orders",
                                    val: d.stats.completed_orders,
                                    icon: "✅",
                                },
                            ].map((s) => (
                                <div
                                    key={s.label}
                                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                                >
                                    <span className="text-sm text-slate-600 font-medium">
                                        {s.icon} {s.label}
                                    </span>
                                    <span className="text-sm font-bold text-slate-900">
                                        {s.val}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    {/* Danger Zone */}
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheckIcon className="w-4 h-4 text-red-500" />
                            <p className="text-sm font-bold text-red-700">
                                Account Control
                            </p>
                        </div>
                        <p className="text-xs text-red-600 mb-4">
                            {isActive
                                ? "Deactivating this account will prevent the brand owner from logging in."
                                : "Activating this account will restore access."}
                        </p>
                        <button
                            onClick={handleToggleStatus}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                                isActive
                                    ? "bg-red-500 hover:bg-red-600 text-white"
                                    : "bg-green-500 hover:bg-green-600 text-white"
                            }`}
                        >
                            {isActive
                                ? "🚫 Deactivate Account"
                                : "✅ Activate Account"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
