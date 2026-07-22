import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
    ArrowPathIcon,
    PencilSquareIcon,
    XMarkIcon,
    CheckIcon,
    ExclamationTriangleIcon,
    DevicePhoneMobileIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";

// ─── Credit Bar ───────────────────────────────────────────────────────────────
const CreditBar = ({ label, used, total, colorClass }) => {
    const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
    const low = pct < 20;
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-600">
                    {label}
                </span>
                <span
                    className={`text-xs font-bold ${low ? "text-red-600" : "text-slate-700"}`}
                >
                    {used.toLocaleString("en-IN")} /{" "}
                    {total.toLocaleString("en-IN")}
                    {low && " ⚠️"}
                </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${low ? "bg-red-400" : colorClass}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditCreditModal({ brand, onClose, onSaved }) {
    const [mode, setMode] = useState("set");
    const [sms, setSms] = useState(brand.credits?.sms ?? 0);
    const [waU, setWaU] = useState(brand.credits?.wa_utility ?? 0);
    const [waM, setWaM] = useState(brand.credits?.wa_marketing ?? 0);
    const [saving, setSaving] = useState(false);

    const switchMode = (m) => {
        setMode(m);
        setSms(m === "set" ? (brand.credits?.sms ?? 0) : 0);
        setWaU(m === "set" ? (brand.credits?.wa_utility ?? 0) : 0);
        setWaM(m === "set" ? (brand.credits?.wa_marketing ?? 0) : 0);
    };

    const save = async () => {
        setSaving(true);
        try {
            if (mode === "set") {
                await api.put(`/admin/credits/${brand.brand_id}`, {
                    sms: Number(sms),
                    wa_utility: Number(waU),
                    wa_marketing: Number(waM),
                });
                toast.success(`Credits updated for ${brand.brand_name}`);
            } else {
                await api.post(`/admin/credits/${brand.brand_id}/topup`, {
                    sms: Number(sms),
                    wa_utility: Number(waU),
                    wa_marketing: Number(waM),
                });
                toast.success(`Credits added to ${brand.brand_name}!`);
            }
            onSaved();
            onClose();
        } catch {
            toast.error("Failed to update credits");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
                background: "rgba(15,23,42,0.55)",
                backdropFilter: "blur(4px)",
            }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div
                    className="px-5 py-4 flex items-center justify-between"
                    style={{
                        background:
                            "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
                    }}
                >
                    <div>
                        <p className="text-base font-black text-slate-900">
                            Edit Brand Credits
                        </p>
                        <p className="text-xs text-indigo-700 mt-0.5 font-semibold">
                            {brand.brand_name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/50 flex items-center justify-center transition-colors"
                    >
                        <XMarkIcon className="w-4 h-4 text-indigo-700" />
                    </button>
                </div>

                {/* Mode toggle */}
                <div className="px-5 pt-4">
                    <div className="flex bg-slate-100 p-0.5 rounded-xl">
                        {[
                            ["set", "Set Credits"],
                            ["add", "Add Credits"],
                        ].map(([m, label]) => (
                            <button
                                key={m}
                                onClick={() => switchMode(m)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                {m === "add" ? "+ " : ""}
                                {label}
                            </button>
                        ))}
                    </div>
                    {mode === "add" && (
                        <div className="mt-3 bg-slate-50 rounded-xl p-3">
                            <p className="text-xs font-bold text-slate-500 mb-1.5">
                                Current Balance
                            </p>
                            <div className="flex gap-4 text-xs font-bold text-slate-700">
                                <span>SMS: {brand.credits?.sms ?? 0}</span>
                                <span>
                                    WA-U: {brand.credits?.wa_utility ?? 0}
                                </span>
                                <span>
                                    WA-M: {brand.credits?.wa_marketing ?? 0}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5 space-y-4">
                    {[
                        {
                            label: `📱 SMS ${mode === "add" ? "to Add" : "Credits"}`,
                            val: sms,
                            set: setSms,
                        },
                        {
                            label: `💚 WA Utility ${mode === "add" ? "to Add" : "Credits"}`,
                            val: waU,
                            set: setWaU,
                        },
                        {
                            label: `💗 WA Marketing ${mode === "add" ? "to Add" : "Credits"}`,
                            val: waM,
                            set: setWaM,
                        },
                    ].map((f) => (
                        <div key={f.label}>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                {f.label}
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={f.val}
                                onChange={(e) => f.set(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all bg-white"
                            />
                        </div>
                    ))}
                </div>
                <div className="px-5 pb-5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={save}
                        disabled={saving}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-1.5"
                        style={{
                            background:
                                mode === "add"
                                    ? "linear-gradient(135deg,#059669,#10b981)"
                                    : "linear-gradient(135deg,#0d9488,#0f766e)",
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
                                {mode === "add" ? "Add Credits" : "Save"}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Platform Stock Topup Modal ──────────────────────────────────────────────
function PlatformStockTopupModal({ onClose, onUpdated }) {
    const [sms, setSms] = useState(0);
    const [waU, setWaU] = useState(0);
    const [waM, setWaM] = useState(0);
    const [saving, setSaving] = useState(false);

    const handleTopup = async () => {
        if ((sms || 0) <= 0 && (waU || 0) <= 0 && (waM || 0) <= 0) {
            toast.error("Enter at least one credit amount");
            return;
        }
        setSaving(true);
        try {
            await api.post("/admin/platform-stock/topup", {
                sms: Number(sms),
                wa_utility: Number(waU),
                wa_marketing: Number(waM),
            });
            toast.success("Platform stock updated!");
            onUpdated();
            onClose();
        } catch (err) {
            toast.error(
                err.response?.data?.detail || "Failed to update platform stock",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
                background: "rgba(15,23,42,0.6)",
                backdropFilter: "blur(4px)",
            }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div
                    className="px-6 py-5 flex items-center gap-3"
                    style={{
                        background:
                            "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
                        borderRadius: "16px 16px 0 0",
                    }}
                >
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center border border-indigo-200/50">
                        <SparklesIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-base font-black text-slate-900">
                            Top Up Platform Stock
                        </p>
                        <p className="text-xs text-indigo-700 mt-0.5 font-semibold">
                            Add credits to platform reserves
                        </p>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-indigo-50/40 border border-indigo-150 rounded-xl p-3">
                        <p className="text-xs font-bold text-indigo-700">
                            💡 These credits will be available for all brands
                            to request via refill requests
                        </p>
                    </div>
                    {[
                        {
                            label: "📱 SMS Credits to Add",
                            val: sms,
                            set: setSms,
                        },
                        {
                            label: "💚 WA Utility Credits to Add",
                            val: waU,
                            set: setWaU,
                        },
                        {
                            label: "💗 WA Marketing Credits to Add",
                            val: waM,
                            set: setWaM,
                        },
                    ].map((f) => (
                        <div key={f.label}>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                {f.label}
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={f.val}
                                onChange={(e) => f.set(e.target.value)}
                                placeholder="0"
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all bg-white"
                            />
                        </div>
                    ))}
                </div>
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleTopup}
                        disabled={saving}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-1.5"
                        style={{
                            background:
                                "linear-gradient(135deg,#059669,#10b981)",
                        }}
                    >
                        {saving ? (
                            <>
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <CheckIcon className="w-3.5 h-3.5" />
                                Add to Stock
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CreditsPage() {
    const [credits, setCredits] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editBrand, setEditBrand] = useState(null);
    const [showTopupModal, setShowTopupModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

    useEffect(() => {
        setLoading(true);
        api.get("/admin/platform-credits")
            .then((r) => setCredits(r.data))
            .catch(() =>
                setCredits({
                    platform_totals: {
                        sms: 340,
                        wa_utility: 180,
                        wa_marketing: 90,
                    },
                    per_brand: [
                        {
                            brand_id: "brand-fashion-india-001",
                            brand_name: "Fashion Brand India",
                            credits: {
                                sms: 340,
                                email: 100,
                                wa_utility: 180,
                                wa_marketing: 90,
                            },
                        },
                    ],
                    total_brands: 1,
                }),
            )
            .finally(() => setLoading(false));
    }, [refreshKey]);

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="w-8 h-8 border-2 border-t-transparent border-indigo-600 rounded-full animate-spin" />
            </div>
        );

    const totals = credits?.platform_totals || {
        sms: 0,
        wa_utility: 0,
        wa_marketing: 0,
    };
    const perBrand = credits?.per_brand || [];

    // Collect low-credit warnings
    const lowCredit = perBrand.filter(
        (b) =>
            (b.credits?.sms ?? 0) < 50 ||
            (b.credits?.wa_utility ?? 0) < 50 ||
            (b.credits?.wa_marketing ?? 0) < 50,
    );

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">
                        Credits Management
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Platform-wide SMS &amp; WhatsApp credit tracking
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={refresh}
                        className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-colors"
                    >
                        <ArrowPathIcon className="w-4 h-4 text-slate-500" />
                    </button>
                    <button
                        onClick={() => setShowTopupModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
                        style={{
                            background:
                                "linear-gradient(135deg,#059669,#10b981)",
                        }}
                    >
                        <SparklesIcon className="w-4 h-4" />
                        Top Up Platform Stock
                    </button>
                </div>
            </div>

            {/* Platform Totals Hero */}
            <div
                className="rounded-3xl overflow-hidden relative shadow-xl border border-white/10"
                style={{
                    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
                }}
            >
                {/* Floating glows */}
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative px-7 py-6 z-10">
                    <p className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-4">
                        Platform Total Credits — All Brands Combined
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            {
                                icon: "📱",
                                label: "Total SMS Credits",
                                val: totals.sms,
                                warn: totals.sms < 500,
                                bg: "bg-white/5 border border-white/10 text-white",
                                color: "text-indigo-200",
                            },
                            {
                                icon: "💚",
                                label: "WA Utility Credits",
                                val: totals.wa_utility,
                                warn: totals.wa_utility < 200,
                                bg: "bg-white/5 border border-white/10 text-white",
                                color: "text-emerald-200",
                            },
                            {
                                icon: "💗",
                                label: "WA Marketing Credits",
                                val: totals.wa_marketing,
                                warn: totals.wa_marketing < 200,
                                bg: "bg-white/5 border border-white/10 text-white",
                                color: "text-pink-200",
                            },
                        ].map((c) => (
                            <div
                                key={c.label}
                                className={`rounded-2xl px-4 py-4 text-center border transition-all duration-300 hover:bg-white/10 ${c.warn ? "bg-rose-500/20 border-rose-500/30 text-rose-200" : c.bg}`}
                            >
                                <p className="text-2xl mb-1">{c.icon}</p>
                                <p
                                    className={`text-3xl font-black ${c.warn ? "text-rose-450" : c.color}`}
                                >
                                    {c.val.toLocaleString("en-IN")}
                                </p>
                                <p className="text-xs text-indigo-200/50 mt-1 font-semibold uppercase tracking-wider">
                                    {c.label}
                                </p>
                                {c.warn && (
                                    <p className="text-[10px] text-rose-400 font-extrabold mt-1.5">
                                        ⚠️ Low Reserves
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-indigo-200/40 text-xs font-bold mt-4">
                        {credits?.total_brands || perBrand.length} brand(s) ·
                        Click any brand below to manage credits
                    </p>
                </div>
            </div>

            {/* Low Credit Alerts */}
            {lowCredit.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                        <p className="text-sm font-bold text-amber-700">
                            Low Credits Warning
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {lowCredit.map((b) => (
                            <button
                                key={b.brand_id}
                                onClick={() => setEditBrand(b)}
                                className="text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-full transition-colors"
                            >
                                ⚠️ {b.brand_name} — Top up needed
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Per Brand Credits Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <DevicePhoneMobileIcon className="w-4 h-4 text-teal-600" />
                        <h2 className="text-sm font-bold text-slate-800">
                            Credits Per Brand
                        </h2>
                        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full ml-1">
                            {perBrand.length} brands
                        </span>
                    </div>
                </div>

                {perBrand.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                        No brands found
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {perBrand.map((b) => {
                            const hasLow =
                                (b.credits?.sms ?? 0) < 50 ||
                                (b.credits?.wa_utility ?? 0) < 50 ||
                                (b.credits?.wa_marketing ?? 0) < 50;
                            return (
                                <div
                                    key={b.brand_id}
                                    className={`px-6 py-5 ${hasLow ? "bg-amber-50/30" : "hover:bg-slate-50/50"} transition-colors`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white"
                                                style={{
                                                    background:
                                                        "linear-gradient(135deg,#1aafa4,#0d9488)",
                                                }}
                                            >
                                                {b.brand_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {b.brand_name}
                                                </p>
                                                <p className="text-xs text-slate-400 font-mono">
                                                    {b.brand_id}
                                                </p>
                                            </div>
                                            {hasLow && (
                                                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                                    Low Credits
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setEditBrand(b)}
                                            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/50 hover:bg-indigo-100/70 border border-indigo-100/50 px-3 py-1.5 rounded-xl transition-all"
                                        >
                                            <PencilSquareIcon className="w-3.5 h-3.5" />
                                            Edit Credits
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                        <CreditBar
                                            label="📱 SMS"
                                            used={b.credits?.sms ?? 0}
                                            total={1000}
                                            colorClass="bg-blue-500"
                                        />
                                        <CreditBar
                                            label="💚 WA Utility"
                                            used={b.credits?.wa_utility ?? 0}
                                            total={500}
                                            colorClass="bg-green-500"
                                        />
                                        <CreditBar
                                            label="💗 WA Marketing"
                                            used={b.credits?.wa_marketing ?? 0}
                                            total={500}
                                            colorClass="bg-pink-500"
                                        />
                                    </div>
                                    {/* Credit values */}
                                    <div className="flex gap-3 mt-3 flex-wrap">
                                        {[
                                            {
                                                label: "SMS",
                                                val: b.credits?.sms ?? 0,
                                                color: "text-blue-700",
                                                bg: "bg-blue-50",
                                            },
                                            {
                                                label: "WA Utility",
                                                val: b.credits?.wa_utility ?? 0,
                                                color: "text-green-700",
                                                bg: "bg-green-50",
                                            },
                                            {
                                                label: "WA Marketing",
                                                val:
                                                    b.credits?.wa_marketing ??
                                                    0,
                                                color: "text-pink-700",
                                                bg: "bg-pink-50",
                                            },
                                        ].map((c) => (
                                            <div
                                                key={c.label}
                                                className={`${c.bg} rounded-xl px-3 py-2 flex items-center gap-2`}
                                            >
                                                <span
                                                    className={`text-sm font-black ${c.color}`}
                                                >
                                                    {c.val.toLocaleString(
                                                        "en-IN",
                                                    )}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {c.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {editBrand && (
                <EditCreditModal
                    brand={editBrand}
                    onClose={() => setEditBrand(null)}
                    onSaved={refresh}
                />
            )}
            {showTopupModal && (
                <PlatformStockTopupModal
                    onClose={() => setShowTopupModal(false)}
                    onUpdated={refresh}
                />
            )}
        </div>
    );
}
