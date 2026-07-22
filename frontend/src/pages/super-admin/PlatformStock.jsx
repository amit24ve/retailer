import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
    ArrowPathIcon,
    PlusIcon,
    PencilSquareIcon,
    CheckIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

function StockModal({ stock, onClose, onSaved }) {
    const [mode, setMode] = useState("add");
    const [sms, setSms] = useState(0);
    const [waU, setWaU] = useState(0);
    const [waM, setWaM] = useState(0);
    const [saving, setSaving] = useState(false);

    const switchMode = (m) => {
        setMode(m);
        setSms(m === "set" ? (stock?.sms ?? 0) : 0);
        setWaU(m === "set" ? (stock?.wa_utility ?? 0) : 0);
        setWaM(m === "set" ? (stock?.wa_marketing ?? 0) : 0);
    };

    const save = async () => {
        setSaving(true);
        try {
            if (mode === "add") {
                const res = await api.post("/admin/platform-stock/topup", {
                    sms: Number(sms),
                    wa_utility: Number(waU),
                    wa_marketing: Number(waM),
                });
                toast.success("Platform stock topped up!");
                if (res.data.auto_released > 0) {
                    toast.success(
                        `✅ ${res.data.auto_released} held request${res.data.auto_released > 1 ? "s" : ""} auto-released!`,
                        { duration: 5000 },
                    );
                }
            } else {
                await api.put("/admin/platform-stock/set", {
                    sms: Number(sms),
                    wa_utility: Number(waU),
                    wa_marketing: Number(waM),
                });
                toast.success("Platform stock updated!");
            }
            onSaved();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to update stock");
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
                        <p className="text-sm font-black text-slate-900">
                            Manage Platform Stock
                        </p>
                        <p className="text-xs text-indigo-600 mt-0.5 font-semibold">
                            Super Admin Credit Pool
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/50 flex items-center justify-center transition-colors"
                    >
                        <XMarkIcon className="w-4 h-4 text-indigo-700" />
                    </button>
                </div>

                <div className="px-5 pt-4">
                    <div className="flex bg-slate-100 p-0.5 rounded-xl">
                        {[
                            ["add", "+ Add Credits"],
                            ["set", "Set Credits"],
                        ].map(([m, label]) => (
                            <button
                                key={m}
                                onClick={() => switchMode(m)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    {mode === "add" && stock && (
                        <div className="mt-3 bg-indigo-50/40 rounded-xl p-3 border border-indigo-100">
                            <p className="text-xs font-bold text-indigo-700 mb-1.5">
                                Current Stock
                            </p>
                            <div className="flex gap-4 text-xs font-bold text-slate-700">
                                <span>
                                    📱 SMS:{" "}
                                    {(stock.sms || 0).toLocaleString("en-IN")}
                                </span>
                                <span>
                                    💚 WA-U:{" "}
                                    {(stock.wa_utility || 0).toLocaleString(
                                        "en-IN",
                                    )}
                                </span>
                                <span>
                                    💗 WA-M:{" "}
                                    {(stock.wa_marketing || 0).toLocaleString(
                                        "en-IN",
                                    )}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5 space-y-4">
                    {[
                        {
                            label: `📱 SMS Credits ${mode === "add" ? "to Add" : ""}`,
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
                                {mode === "add" ? "Add to Stock" : "Set Stock"}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PlatformStock() {
    const [stock, setStock] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

    useEffect(() => {
        setLoading(true);
        api.get("/admin/platform-stock")
            .then((r) => setStock(r.data))
            .catch(() =>
                setStock({ sms: 10000, wa_utility: 5000, wa_marketing: 5000 }),
            )
            .finally(() => setLoading(false));
    }, [refreshKey]);

    const [heldSummary, setHeldSummary] = useState(null);

    useEffect(() => {
        api.get("/admin/credit-requests/held-summary")
            .then((r) => setHeldSummary(r.data))
            .catch(() => setHeldSummary(null));
    }, [refreshKey]);

    const lowSMS = (stock?.sms || 0) < 1000;
    const lowWAU = (stock?.wa_utility || 0) < 500;
    const lowWAM = (stock?.wa_marketing || 0) < 500;
    const hasLow = lowSMS || lowWAU || lowWAM;

    return (
        <div className="space-y-5 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">
                        Platform Stock
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Super Admin's own credit pool — used to fulfil brand
                        owner requests
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
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
                        style={{
                            background:
                                "linear-gradient(135deg,#1aafa4,#0d9488)",
                        }}
                    >
                        <PlusIcon className="w-4 h-4" />
                        Manage Stock
                    </button>
                </div>
            </div>

            {/* Low Stock Warning */}
            {hasLow && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                        <p className="text-sm font-bold text-red-700">
                            Low Platform Stock
                        </p>
                        <p className="text-xs text-red-500 mt-0.5">
                            {[
                                lowSMS && "SMS",
                                lowWAU && "WA Utility",
                                lowWAM && "WA Marketing",
                            ]
                                .filter(Boolean)
                                .join(", ")}{" "}
                            credits are running low. Top up to continue
                            approving requests.
                        </p>
                    </div>
                </div>
            )}

            {/* Stock Cards */}
            <div
                className="rounded-3xl overflow-hidden relative shadow-xl border border-white/10"
                style={{
                    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
                }}
            >
                {/* Floating glows */}
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative px-7 py-8 z-10">
                    <p className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-6">
                        Platform Total Credits — Available to Assign
                    </p>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-2 border-t-transparent border-indigo-500 rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                {
                                    icon: "📱",
                                    label: "SMS Credits",
                                    val: stock?.sms ?? 0,
                                    warn: lowSMS,
                                    bg: "bg-white/5 border border-white/10 text-white",
                                    color: "text-indigo-200",
                                },
                                {
                                    icon: "💚",
                                    label: "WA Utility",
                                    val: stock?.wa_utility ?? 0,
                                    warn: lowWAU,
                                    bg: "bg-white/5 border border-white/10 text-white",
                                    color: "text-emerald-200",
                                },
                                {
                                    icon: "💗",
                                    label: "WA Marketing",
                                    val: stock?.wa_marketing ?? 0,
                                    warn: lowWAM,
                                    bg: "bg-white/5 border border-white/10 text-white",
                                    color: "text-pink-200",
                                },
                            ].map((c) => (
                                <div
                                    key={c.label}
                                    className={`rounded-2xl px-4 py-5 text-center border transition-all duration-300 hover:bg-white/10 ${c.warn ? "bg-rose-500/20 border-rose-500/30 text-rose-250" : c.bg}`}
                                >
                                    <p className="text-3xl mb-2">{c.icon}</p>
                                    <p
                                        className={`text-3xl font-black ${c.warn ? "text-rose-400" : c.color}`}
                                    >
                                        {(c.val || 0).toLocaleString("en-IN")}
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
                    )}
                </div>
            </div>

            {/* On Hold Requests Summary */}
            {heldSummary && heldSummary.total_on_hold > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">⏸</span>
                            <div>
                                <p className="text-sm font-bold text-orange-800">
                                    {heldSummary.total_on_hold} Request
                                    {heldSummary.total_on_hold > 1 ? "s" : ""}{" "}
                                    On Hold
                                </p>
                                <p className="text-xs text-orange-600 mt-0.5">
                                    {heldSummary.can_release_now > 0
                                        ? `✅ ${heldSummary.can_release_now} can be released right now with current stock`
                                        : "Add more stock below to release held requests"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            {
                                label: "SMS Needed",
                                val: heldSummary.total_needed?.sms || 0,
                                avail: heldSummary.current_stock?.sms || 0,
                                icon: "📱",
                            },
                            {
                                label: "WA Utility Needed",
                                val: heldSummary.total_needed?.wa_utility || 0,
                                avail:
                                    heldSummary.current_stock?.wa_utility || 0,
                                icon: "💚",
                            },
                            {
                                label: "WA Marketing Needed",
                                val:
                                    heldSummary.total_needed?.wa_marketing || 0,
                                avail:
                                    heldSummary.current_stock?.wa_marketing ||
                                    0,
                                icon: "💗",
                            },
                        ].map((c) => {
                            const isShort = c.avail < c.val;
                            return (
                                <div
                                    key={c.label}
                                    className={`rounded-xl p-3 text-center border ${isShort ? "bg-red-50 border-red-200" : "bg-white border-orange-100"}`}
                                >
                                    <p className="text-sm mb-1">{c.icon}</p>
                                    <p
                                        className={`text-sm font-black ${isShort ? "text-red-600" : "text-green-700"}`}
                                    >
                                        {c.avail.toLocaleString("en-IN")} /{" "}
                                        {c.val.toLocaleString("en-IN")}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                        {c.label}
                                    </p>
                                    <p
                                        className={`text-[10px] font-bold mt-0.5 ${isShort ? "text-red-500" : "text-green-600"}`}
                                    >
                                        {isShort
                                            ? `Need ${(c.val - c.avail).toLocaleString("en-IN")} more`
                                            : "✓ Sufficient"}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                    {heldSummary.held_requests?.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                            <p className="text-xs font-bold text-orange-700">
                                Held Requests (oldest first):
                            </p>
                            {heldSummary.held_requests.map((r, i) => (
                                <div
                                    key={r.request_id}
                                    className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-orange-100"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-orange-700">
                                            #{i + 1}
                                        </span>
                                        <span className="text-xs font-semibold text-slate-700">
                                            {r.brand_name}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 text-[10px] font-bold">
                                        {r.sms_requested > 0 && (
                                            <span className="text-blue-600">
                                                📱{r.sms_requested}
                                            </span>
                                        )}
                                        {r.wa_utility_requested > 0 && (
                                            <span className="text-green-600">
                                                💚{r.wa_utility_requested}
                                            </span>
                                        )}
                                        {r.wa_marketing_requested > 0 && (
                                            <span className="text-pink-600">
                                                💗{r.wa_marketing_requested}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Info box */}
            <div className="bg-indigo-50/40 border border-indigo-150 rounded-2xl p-5">
                <p className="text-sm font-bold text-indigo-850 mb-2">
                    How Platform Stock Works
                </p>
                <ul className="space-y-1.5">
                    {[
                        "This is the Super Admin's own credit pool, separate from Brand Owner credits.",
                        "When you approve a Brand Owner's credit request, credits are deducted from this stock.",
                        "Top up this stock regularly to ensure you can always fulfil Brand Owner requests.",
                        "If stock is insufficient, you cannot approve requests until you top up.",
                    ].map((t, i) => (
                        <li
                            key={i}
                            className="flex items-start gap-2 text-xs text-indigo-700 font-medium"
                        >
                            <span className="text-indigo-400 mt-0.5">•</span>
                            {t}
                        </li>
                    ))}
                </ul>
                <button
                    onClick={() => setShowModal(true)}
                    className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-100/60 hover:bg-indigo-200/80 border border-indigo-200/50 px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                    <PencilSquareIcon className="w-3.5 h-3.5" />
                    Manage Stock
                </button>
            </div>

            {showModal && (
                <StockModal
                    stock={stock}
                    onClose={() => setShowModal(false)}
                    onSaved={refresh}
                />
            )}
        </div>
    );
}
