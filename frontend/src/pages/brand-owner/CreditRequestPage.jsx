import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
    ArrowPathIcon,
    PaperAirplaneIcon,
    CreditCardIcon,
    SparklesIcon,
    ChatBubbleLeftRightIcon,
    EnvelopeIcon,
} from "@heroicons/react/24/outline";

// ─── Status Badge — Custom premium badge styling ───────────────────────────────────
const StatusBadge = ({ status }) => {
    const map = {
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        on_hold: "bg-orange-50 text-orange-700 border-orange-200",
        approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
        rejected: "bg-rose-50 text-rose-700 border-rose-200",
    };
    const icons = {
        pending: "⏳",
        on_hold: "⏸",
        approved: "✓",
        rejected: "✕",
    };
    const labels = {
        pending: "Pending",
        on_hold: "On Hold",
        approved: "Approved",
        rejected: "Rejected",
    };
    return (
        <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${map[status] || "bg-slate-50 text-slate-600 border-slate-200"}`}
        >
            <span className="text-[10px]">{icons[status] || "●"}</span>
            <span>{labels[status] || status}</span>
        </span>
    );
};

export default function CreditRequestPage() {
    const [credits, setCredits] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        sms: "",
        wa_utility: "",
        wa_marketing: "",
        note: "",
    });
    const [refreshKey, setRefreshKey] = useState(0);
    const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get("/brand-owner/credits").catch(() => ({
                data: { sms: 0, wa_utility: 0, wa_marketing: 0 },
            })),
            api
                .get("/brand-owner/credit-requests")
                .catch(() => ({ data: { requests: [] } })),
        ])
            .then(([creditsRes, reqRes]) => {
                setCredits(creditsRes.data);
                setRequests(reqRes.data.requests || []);
            })
            .finally(() => setLoading(false));
    }, [refreshKey]);

    const hasPending = requests.some(
        (r) => r.status === "pending" || r.status === "on_hold",
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        const sms = Number(form.sms) || 0;
        const wa_utility = Number(form.wa_utility) || 0;
        const wa_marketing = Number(form.wa_marketing) || 0;
        if (sms <= 0 && wa_utility <= 0 && wa_marketing <= 0) {
            toast.error("Please enter at least one credit amount to request");
            return;
        }
        setSubmitting(true);
        try {
            await api.post("/brand-owner/credit-request", {
                sms,
                wa_utility,
                wa_marketing,
                note: form.note,
            });
            toast.success(
                "Credit request submitted! Super Admin will process within 24 hours.",
            );
            setForm({ sms: "", wa_utility: "", wa_marketing: "", note: "" });
            refresh();
        } catch (err) {
            toast.error(
                err.response?.data?.detail || "Failed to submit request",
            );
        } finally {
            setSubmitting(false);
        }
    };

    const fmt = (dt) => {
        if (!dt) return "—";
        try {
            return new Date(dt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dt?.substring(0, 16) || "—";
        }
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <CreditCardIcon className="w-6 h-6 text-indigo-650" />
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Request Credits
                        </h1>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                        Request SMS & WhatsApp blaster credits from Super Admin to power your marketing campaigns
                    </p>
                </div>
                <button
                    onClick={refresh}
                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                >
                    <ArrowPathIcon className="w-4 h-4 text-slate-500" />
                </button>
            </div>

            {/* Current Balance Card with deep slate/indigo premium gradient and floating design */}
            <div
                className="rounded-3xl shadow-xl relative border border-white/10 p-6 overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
                }}
            >
                {/* Decorative glows */}
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <SparklesIcon className="w-4 h-4 text-indigo-300 animate-pulse" />
                        <p className="text-indigo-200 text-xs font-black uppercase tracking-widest">
                            Your Current Credit Balance
                        </p>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center py-6">
                            <div className="w-8 h-8 border-2 border-t-transparent border-indigo-400 rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                {
                                    icon: <EnvelopeIcon className="w-5 h-5 text-indigo-400" />,
                                    label: "SMS Credits",
                                    val: credits?.sms ?? 0,
                                    low: (credits?.sms ?? 0) < 50,
                                    bg: "bg-white/5 border-white/10 text-white",
                                },
                                {
                                    icon: <ChatBubbleLeftRightIcon className="w-5 h-5 text-emerald-400" />,
                                    label: "WhatsApp Utility",
                                    val: credits?.wa_utility ?? 0,
                                    low: (credits?.wa_utility ?? 0) < 50,
                                    bg: "bg-white/5 border-white/10 text-white",
                                },
                                {
                                    icon: <SparklesIcon className="w-5 h-5 text-pink-400" />,
                                    label: "WhatsApp Marketing",
                                    val: credits?.wa_marketing ?? 0,
                                    low: (credits?.wa_marketing ?? 0) < 50,
                                    bg: "bg-white/5 border-white/10 text-white",
                                },
                            ].map((c) => (
                                <div
                                    key={c.label}
                                    className={`rounded-2xl px-5 py-4 border transition-all duration-300 hover:bg-white/10 ${c.low ? "bg-rose-500/10 border-rose-500/30 text-rose-200" : c.bg}`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-extrabold text-indigo-200/70 tracking-wide">
                                            {c.label}
                                        </span>
                                        <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                                            {c.icon}
                                        </div>
                                    </div>
                                    <p className="text-3xl font-black tracking-tight mt-1 leading-none">
                                        {(c.val || 0).toLocaleString("en-IN")}
                                    </p>
                                    {c.low ? (
                                        <p className="text-[10px] text-rose-400 font-extrabold mt-2 flex items-center gap-1">
                                            ⚠️ Low balance! Request credits now
                                        </p>
                                    ) : (
                                        <p className="text-[10px] text-indigo-200/40 font-bold mt-2">
                                            Healthy status
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Pending / On Hold Warning Notification */}
            {hasPending && (
                <div
                    className={`border rounded-2xl p-4 flex items-start gap-3 animate-slide-up ${requests.some((r) => r.status === "on_hold") ? "bg-orange-50 border-orange-200 text-orange-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}
                >
                    <span className="text-xl flex-shrink-0 mt-0.5">
                        {requests.some((r) => r.status === "on_hold") ? "⏸" : "⏳"}
                    </span>
                    <div>
                        {requests.some((r) => r.status === "on_hold") ? (
                            <>
                                <p className="text-sm font-bold">
                                    Your Request is On Hold
                                </p>
                                <p className="text-xs mt-1 leading-relaxed opacity-90">
                                    Super Admin has approved your request but is waiting for stock replenishment.
                                    Credits will be automatically transferred once stock becomes available in the platform inventory.
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-sm font-bold">
                                    Credit Request Pending
                                </p>
                                <p className="text-xs mt-1 leading-relaxed opacity-90">
                                    You have an active pending credit request. Super Admin will review and process it within 24 hours.
                                    You cannot submit another request until the current one is processed.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Request Form */}
            {!hasPending && (
                <div className="glass-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/20 to-transparent">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                            New Credit Request
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                            Enter the credit amounts you need. Super Admin will review and allocate them to your account.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {[
                                {
                                    label: "SMS Credits",
                                    field: "sms",
                                    placeholder: "e.g. 500",
                                    sub: "Deliver text campaigns",
                                },
                                {
                                    label: "WA Utility",
                                    field: "wa_utility",
                                    placeholder: "e.g. 200",
                                    sub: "Transactional alerts",
                                },
                                {
                                    label: "WA Marketing",
                                    field: "wa_marketing",
                                    placeholder: "e.g. 100",
                                    sub: "Bulk promotion blasts",
                                },
                            ].map((f) => (
                                <div key={f.field}>
                                    <label className="input-label">
                                        {f.label}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form[f.field]}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                [f.field]: e.target.value,
                                            }))
                                        }
                                        placeholder={f.placeholder}
                                        className="input-field font-semibold"
                                    />
                                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                                        {f.sub}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div>
                            <label className="input-label">
                                Note / Business Reason
                            </label>
                            <textarea
                                value={form.note}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        note: e.target.value,
                                    }))
                                }
                                rows={2}
                                placeholder="State your marketing campaign goals or reason for request..."
                                className="input-field resize-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary w-full cursor-pointer"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Submitting Request...
                                </>
                            ) : (
                                <>
                                    <PaperAirplaneIcon className="w-4 h-4" />
                                    Submit Credit Request
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* Request History */}
            <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                    Request History Ledger
                </h3>
                {loading ? (
                    <div className="py-12 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-t-transparent border-indigo-500 rounded-full animate-spin" />
                    </div>
                ) : requests.length === 0 ? (
                    <div className="glass-card py-12 text-center">
                        <CreditCardIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-550 font-bold">No credit requests found</p>
                        <p className="text-xs text-slate-400 mt-1">
                            When you submit credit requests, their review status and details will be tracked here.
                        </p>
                    </div>
                ) : (
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Credits Requested</th>
                                        <th>Note / Resolution Details</th>
                                        <th className="text-center">Status</th>
                                        <th className="text-right">Requested At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {requests.map((req) => (
                                        <tr key={req.request_id}>
                                            <td>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {[
                                                        {
                                                            val: req.sms_requested,
                                                            label: "SMS",
                                                            color: "bg-indigo-50 text-indigo-700 border-indigo-100",
                                                        },
                                                        {
                                                            val: req.wa_utility_requested,
                                                            label: "WA-U",
                                                            color: "bg-emerald-50 text-emerald-700 border-emerald-100",
                                                        },
                                                        {
                                                            val: req.wa_marketing_requested,
                                                            label: "WA-M",
                                                            color: "bg-pink-50 text-pink-700 border-pink-100",
                                                        },
                                                    ]
                                                        .filter((c) => c.val > 0)
                                                        .map((c, i) => (
                                                            <div
                                                                key={i}
                                                                className={`${c.color} border rounded-lg px-2 py-0.5 text-center text-xs font-bold`}
                                                            >
                                                                <span>{c.val}</span>
                                                                <span className="text-[9px] ml-1 opacity-80 uppercase tracking-wide font-medium">
                                                                    {c.label}
                                                                </span>
                                                            </div>
                                                        ))}
                                                </div>
                                            </td>
                                            <td>
                                                <p className="text-xs text-slate-700 font-semibold max-w-[220px] truncate">
                                                    {req.note || <span className="text-slate-300">—</span>}
                                                </p>
                                                {req.hold_reason && (
                                                    <p className="text-[10px] text-orange-600 font-bold mt-1 flex items-center gap-0.5">
                                                        ⚠️ On hold: {req.hold_reason}
                                                    </p>
                                                )}
                                                {req.rejection_reason && (
                                                    <p className="text-[10px] text-rose-600 font-bold mt-1 flex items-center gap-0.5">
                                                        ✕ Reason: {req.rejection_reason}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <StatusBadge status={req.status} />
                                            </td>
                                            <td className="text-right text-xs">
                                                <p className="text-slate-500 font-semibold">
                                                    {fmt(req.requested_at)}
                                                </p>
                                                {req.processed_at && (
                                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                        Approved: {fmt(req.processed_at)}
                                                    </p>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
