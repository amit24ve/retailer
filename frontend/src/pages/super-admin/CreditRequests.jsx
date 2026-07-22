import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
    ArrowPathIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
    CheckIcon,
} from "@heroicons/react/24/outline";

const StatusBadge = ({ status }) => {
    const map = {
        pending: "bg-amber-100 text-amber-700 border-amber-200",
        on_hold: "bg-orange-100 text-orange-700 border-orange-200",
        approved: "bg-green-100 text-green-700 border-green-200",
        rejected: "bg-red-100 text-red-600 border-red-200",
    };
    const icons = {
        pending: "⏳",
        on_hold: "⏸",
        approved: "✅",
        rejected: "❌",
    };
    const labels = {
        pending: "Pending",
        on_hold: "On Hold",
        approved: "Approved",
        rejected: "Rejected",
    };
    return (
        <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${map[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}
        >
            {icons[status] || "?"} {labels[status] || status}
        </span>
    );
};

function ApproveModal({ req, onClose, onDone }) {
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    const approve = async () => {
        setLoading(true);
        try {
            await api.post(`/admin/credit-requests/${req.request_id}/approve`, {
                note,
            });
            toast.success("Request approved! Credits transferred.");
            onDone();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to approve");
        } finally {
            setLoading(false);
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
                            Approve Credit Request
                        </p>
                        <p className="text-xs text-indigo-600 mt-0.5 font-semibold">
                            {req.brand_name} — {req.owner_name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg bg-indigo-55/40 hover:bg-indigo-100 border border-indigo-200/50 flex items-center justify-center transition-colors"
                    >
                        <XMarkIcon className="w-4 h-4 text-indigo-700" />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="bg-indigo-50/40 rounded-xl p-4 border border-indigo-100">
                        <p className="text-xs font-bold text-indigo-700 mb-2">
                            Credits to Transfer
                        </p>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            {[
                                {
                                    label: "SMS",
                                    val: req.sms_requested,
                                    icon: "📱",
                                },
                                {
                                    label: "WA Utility",
                                    val: req.wa_utility_requested,
                                    icon: "💚",
                                },
                                {
                                    label: "WA Marketing",
                                    val: req.wa_marketing_requested,
                                    icon: "💗",
                                },
                            ].map((c) => (
                                <div
                                    key={c.label}
                                    className="bg-white rounded-lg p-2 border border-indigo-100"
                                >
                                    <p className="text-sm">{c.icon}</p>
                                    <p className="text-lg font-black text-indigo-700">
                                        {c.val}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-semibold">
                                        {c.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {req.note && (
                        <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-xs font-bold text-slate-500 mb-1">
                                Brand Owner's Note
                            </p>
                            <p className="text-xs text-slate-700">{req.note}</p>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Admin Note (optional)
                        </label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add a note for the brand owner..."
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all bg-white"
                        />
                    </div>
                </div>
                <div className="px-5 pb-5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={approve}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-1.5"
                        style={{
                            background:
                                "linear-gradient(135deg,#059669,#10b981)",
                        }}
                    >
                        {loading ? (
                            <>
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckIcon className="w-3.5 h-3.5" />
                                Approve & Transfer
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function RejectModal({ req, onClose, onDone }) {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const reject = async () => {
        setLoading(true);
        try {
            await api.post(`/admin/credit-requests/${req.request_id}/reject`, {
                reason: reason || "Request rejected by Super Admin",
            });
            toast.success("Request rejected.");
            onDone();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to reject");
        } finally {
            setLoading(false);
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
                <div className="px-5 py-4 flex items-center justify-between bg-red-50 border-b border-red-100">
                    <div>
                        <p className="text-sm font-black text-red-700">
                            Reject Request
                        </p>
                        <p className="text-xs text-red-500 mt-0.5">
                            {req.brand_name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center"
                    >
                        <XMarkIcon className="w-4 h-4 text-red-600" />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Rejection Reason
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            placeholder="Provide a reason for rejection..."
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                        />
                    </div>
                </div>
                <div className="px-5 pb-5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={reject}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                        {loading ? (
                            <>
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Rejecting...
                            </>
                        ) : (
                            <>
                                <XMarkIcon className="w-3.5 h-3.5" />
                                Reject
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ReleaseModal({ req, onClose, onDone }) {
    const [loading, setLoading] = useState(false);

    const release = async () => {
        setLoading(true);
        try {
            const res = await api.post(
                `/admin/credit-requests/${req.request_id}/approve`,
                { note: "Released from hold" },
            );
            if (res.data.status === "on_hold") {
                toast.error(
                    "Still insufficient stock. Please add more stock first.",
                );
            } else {
                toast.success("Request released! Credits transferred.");
                onDone();
                onClose();
            }
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to release");
        } finally {
            setLoading(false);
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
                            "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)",
                    }}
                >
                    <div>
                        <p className="text-sm font-black text-orange-900">
                            Release Held Request
                        </p>
                        <p className="text-xs text-orange-700 mt-0.5">
                            {req.brand_name} — {req.owner_name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center"
                    >
                        <XMarkIcon className="w-4 h-4 text-orange-700" />
                    </button>
                </div>
                <div className="p-5">
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
                        <p className="text-xs font-bold text-orange-700 mb-1">
                            ⏸ Hold Reason
                        </p>
                        <p className="text-xs text-orange-600">
                            {req.hold_reason ||
                                "Insufficient platform stock at time of approval"}
                        </p>
                    </div>
                    <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3 mb-4">
                        <p className="text-xs font-bold text-indigo-700 mb-2">
                            Credits to Transfer
                        </p>
                        <div className="flex gap-3">
                            {[
                                {
                                    val: req.sms_requested,
                                    label: "SMS",
                                    color: "text-blue-700",
                                },
                                {
                                    val: req.wa_utility_requested,
                                    label: "WA-U",
                                    color: "text-green-700",
                                },
                                {
                                    val: req.wa_marketing_requested,
                                    label: "WA-M",
                                    color: "text-pink-700",
                                },
                            ]
                                .filter((c) => c.val > 0)
                                .map((c, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-white rounded-lg p-2 text-center border border-slate-100"
                                    >
                                        <p
                                            className={`text-sm font-black ${c.color}`}
                                        >
                                            {c.val}
                                        </p>
                                        <p className="text-[10px] text-slate-500">
                                            {c.label}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">
                        This will try to approve the request now. If stock is
                        still insufficient, it will remain on hold.
                    </p>
                </div>
                <div className="px-5 pb-5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={release}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-1.5"
                        style={{
                            background:
                                "linear-gradient(135deg,#ea580c,#dc2626)",
                        }}
                    >
                        {loading ? (
                            <>
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Releasing...
                            </>
                        ) : (
                            <>⏸ → ✅ Try Release</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

const MOCK_REQUESTS = [
    {
        request_id: "req-001",
        brand_name: "Fashion Brand India",
        owner_name: "Rajesh Kumar",
        sms_requested: 500,
        wa_utility_requested: 200,
        wa_marketing_requested: 100,
        note: "Running a festival campaign next week",
        status: "pending",
        requested_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
        request_id: "req-002",
        brand_name: "Spice Garden",
        owner_name: "Anita Sharma",
        sms_requested: 300,
        wa_utility_requested: 0,
        wa_marketing_requested: 150,
        note: "",
        status: "approved",
        requested_at: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        processed_at: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000,
        ).toISOString(),
    },
];

export default function CreditRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [approveReq, setApproveReq] = useState(null);
    const [rejectReq, setRejectReq] = useState(null);
    const [releaseReq, setReleaseReq] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

    useEffect(() => {
        setLoading(true);
        api.get("/admin/credit-requests")
            .then((r) => setRequests(r.data.requests || []))
            .catch(() => setRequests(MOCK_REQUESTS))
            .finally(() => setLoading(false));
    }, [refreshKey]);

    const filtered =
        filterStatus === "all"
            ? requests
            : requests.filter((r) => r.status === filterStatus);
    const pending = requests.filter((r) => r.status === "pending").length;
    const onHold = requests.filter((r) => r.status === "on_hold").length;

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
        <div className="space-y-5 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">
                        Credit Requests
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Brand owner credit refill requests
                        {(pending > 0 || onHold > 0) && (
                            <span className="ml-2 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                {pending} pending
                                {onHold > 0 ? ` · ${onHold} on hold` : ""}
                            </span>
                        )}
                    </p>
                </div>
                <button
                    onClick={refresh}
                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-colors"
                >
                    <ArrowPathIcon className="w-4 h-4 text-slate-500" />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                    {
                        label: "Pending",
                        val: requests.filter((r) => r.status === "pending")
                            .length,
                        icon: "⏳",
                        bg: "bg-amber-50",
                        color: "text-amber-700",
                    },
                    {
                        label: "On Hold",
                        val: requests.filter((r) => r.status === "on_hold")
                            .length,
                        icon: "⏸",
                        bg: "bg-orange-50",
                        color: "text-orange-700",
                    },
                    {
                        label: "Approved",
                        val: requests.filter((r) => r.status === "approved")
                            .length,
                        icon: "✅",
                        bg: "bg-green-50",
                        color: "text-green-700",
                    },
                    {
                        label: "Rejected",
                        val: requests.filter((r) => r.status === "rejected")
                            .length,
                        icon: "❌",
                        bg: "bg-red-50",
                        color: "text-red-600",
                    },
                ].map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
                        <p className="text-xl mb-1">{s.icon}</p>
                        <p className={`text-2xl font-black ${s.color}`}>
                            {s.val}
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {s.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Pending Alert */}
            {pending > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <p className="text-sm font-semibold text-amber-700">
                        {pending} request{pending > 1 ? "s" : ""} awaiting
                        approval. Please process within 24 hours.
                    </p>
                </div>
            )}

            {/* On Hold Alert */}
            {onHold > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
                    <span className="text-xl flex-shrink-0">⏸</span>
                    <div>
                        <p className="text-sm font-bold text-orange-700">
                            {onHold} Request{onHold > 1 ? "s" : ""} On Hold —
                            Insufficient Stock
                        </p>
                        <p className="text-xs text-orange-600 mt-0.5">
                            These requests were approved but stock was
                            insufficient. Go to <strong>Platform Stock</strong>{" "}
                            page and add more credits — held requests will
                            auto-release.
                        </p>
                    </div>
                </div>
            )}

            {/* Filter */}
            <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl w-fit">
                {["all", "pending", "on_hold", "approved", "rejected"].map(
                    (s) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filterStatus === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            {s === "on_hold" ? "On Hold" : s}
                        </button>
                    ),
                )}
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="py-16 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-t-transparent border-indigo-600 rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <ClockIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">
                            No {filterStatus !== "all" ? filterStatus : ""}{" "}
                            requests
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">
                                        Brand Owner
                                    </th>
                                    <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">
                                        Credits Requested
                                    </th>
                                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">
                                        Note
                                    </th>
                                    <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">
                                        Status
                                    </th>
                                    <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">
                                        Requested At
                                    </th>
                                    <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((req) => (
                                    <tr
                                        key={req.request_id}
                                        className={`hover:bg-slate-50/50 transition-colors ${req.status === "pending" ? "bg-amber-50/30" : req.status === "on_hold" ? "bg-orange-50/50" : ""}`}
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg,#1aafa4,#0d9488)",
                                                    }}
                                                >
                                                    {req.brand_name?.charAt(
                                                        0,
                                                    ) || "B"}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 text-sm">
                                                        {req.brand_name}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        {req.owner_name}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1.5 justify-center flex-wrap">
                                                {[
                                                    {
                                                        val: req.sms_requested,
                                                        label: "SMS",
                                                        icon: "📱",
                                                        color: "bg-blue-50 text-blue-700",
                                                    },
                                                    {
                                                        val: req.wa_utility_requested,
                                                        label: "WA-U",
                                                        icon: "💚",
                                                        color: "bg-green-50 text-green-700",
                                                    },
                                                    {
                                                        val: req.wa_marketing_requested,
                                                        label: "WA-M",
                                                        icon: "💗",
                                                        color: "bg-pink-50 text-pink-700",
                                                    },
                                                ]
                                                    .filter((c) => c.val > 0)
                                                    .map((c, i) => (
                                                        <div
                                                            key={i}
                                                            className={`${c.color} rounded-lg px-2 py-1 text-center`}
                                                        >
                                                            <p className="text-xs font-black">
                                                                {c.val}
                                                            </p>
                                                            <p className="text-[9px]">
                                                                {c.label}
                                                            </p>
                                                        </div>
                                                    ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-xs text-slate-500 max-w-[150px] truncate">
                                                {req.note || "—"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <StatusBadge status={req.status} />
                                            {req.status === "on_hold" &&
                                                req.hold_reason && (
                                                    <p className="text-[10px] text-orange-600 mt-1 max-w-[140px] mx-auto leading-tight">
                                                        {req.hold_reason}
                                                    </p>
                                                )}
                                            {req.rejection_reason && (
                                                <p className="text-[10px] text-red-500 mt-1 max-w-[120px] mx-auto truncate">
                                                    {req.rejection_reason}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <p className="text-xs text-slate-500">
                                                {fmt(req.requested_at)}
                                            </p>
                                            {req.processed_at && (
                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                    Processed:{" "}
                                                    {fmt(req.processed_at)}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            {req.status === "pending" ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            setApproveReq(req)
                                                        }
                                                        className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-xl transition-colors"
                                                    >
                                                        <CheckIcon className="w-3.5 h-3.5" />{" "}
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setRejectReq(req)
                                                        }
                                                        className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors"
                                                    >
                                                        <XMarkIcon className="w-3.5 h-3.5" />{" "}
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : req.status === "on_hold" ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            setReleaseReq(req)
                                                        }
                                                        className="flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl transition-colors"
                                                    >
                                                        ⏸ Try Release
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setRejectReq(req)
                                                        }
                                                        className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1.5 rounded-xl transition-colors"
                                                    >
                                                        <XMarkIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 block text-center">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {approveReq && (
                <ApproveModal
                    req={approveReq}
                    onClose={() => setApproveReq(null)}
                    onDone={refresh}
                />
            )}
            {rejectReq && (
                <RejectModal
                    req={rejectReq}
                    onClose={() => setRejectReq(null)}
                    onDone={refresh}
                />
            )}
            {releaseReq && (
                <ReleaseModal
                    req={releaseReq}
                    onClose={() => setReleaseReq(null)}
                    onDone={refresh}
                />
            )}
        </div>
    );
}
