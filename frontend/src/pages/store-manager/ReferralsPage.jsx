import { useState, useEffect } from "react";
import api from "../../services/api";
import {
    UsersIcon,
    GiftIcon,
    ClockIcon,
    CheckCircleIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_REFERRALS = [
    {
        id: "r1",
        referrer_name: "Priya Sharma",
        referrer_mobile: "9876543210",
        referred_name: "Neha Sharma",
        referred_mobile: "8765432109",
        status: "rewarded",
        date: "2026-06-28",
        reward_amount: 200,
    },
    {
        id: "r2",
        referrer_name: "Rahul Mehta",
        referrer_mobile: "8765432109",
        referred_name: "Amit Mehta",
        referred_mobile: "7654321098",
        status: "pending",
        date: "2026-06-27",
        reward_amount: 200,
    },
    {
        id: "r3",
        referrer_name: "Anita Patel",
        referrer_mobile: "7654321098",
        referred_name: "Rohit Patel",
        referred_mobile: "6543210987",
        status: "rewarded",
        date: "2026-06-26",
        reward_amount: 200,
    },
    {
        id: "r4",
        referrer_name: "Vikram Singh",
        referrer_mobile: "9543210987",
        referred_name: "Manish Singh",
        referred_mobile: "8432109876",
        status: "expired",
        date: "2026-06-20",
        reward_amount: 0,
    },
    {
        id: "r5",
        referrer_name: "Sunita Gupta",
        referrer_mobile: "8654321098",
        referred_name: "Kavya Gupta",
        referred_mobile: "9543210987",
        status: "pending",
        date: "2026-06-25",
        reward_amount: 200,
    },
    {
        id: "r6",
        referrer_name: "Arjun Nair",
        referrer_mobile: "9765432109",
        referred_name: "Ravi Nair",
        referred_mobile: "8654321098",
        status: "rewarded",
        date: "2026-06-24",
        reward_amount: 200,
    },
    {
        id: "r7",
        referrer_name: "Deepa Krishnan",
        referrer_mobile: "8876543210",
        referred_name: "Lakshmi Krishnan",
        referred_mobile: "7765432109",
        status: "rewarded",
        date: "2026-06-23",
        reward_amount: 200,
    },
    {
        id: "r8",
        referrer_name: "Karan Malhotra",
        referrer_mobile: "9987654321",
        referred_name: "Poonam Malhotra",
        referred_mobile: "8876543210",
        status: "expired",
        date: "2026-06-15",
        reward_amount: 0,
    },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_BADGE = {
    rewarded: "badge-success",
    pending: "badge-warning",
    expired: "badge-danger",
};

const STATUS_LABEL = {
    rewarded: "Rewarded",
    pending: "Pending",
    expired: "Expired",
};

function StatCard({ label, value, sub, icon: Icon, iconBg, cardClass }) {
    return (
        <div className={`glass-card p-5 border ${cardClass}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        {label}
                    </p>
                    <p className="text-3xl font-black text-slate-900">
                        {value}
                    </p>
                    {sub && (
                        <p className="text-xs text-slate-400 mt-1">{sub}</p>
                    )}
                </div>
                {Icon && (
                    <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
                    >
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ReferralsPage() {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [monthFilter, setMonthFilter] = useState("");

    useEffect(() => {
        api.get("/referrals")
            .then((r) => setReferrals(r.data.referrals || r.data || []))
            .catch(() => setReferrals(MOCK_REFERRALS))
            .finally(() => setLoading(false));
    }, []);

    const filtered = referrals.filter((r) => {
        const sMatch = statusFilter === "all" || r.status === statusFilter;
        const mMatch =
            !monthFilter || (r.date && r.date.startsWith(monthFilter));
        return sMatch && mMatch;
    });

    const total = referrals.length;
    const successful = referrals.filter((r) => r.status === "rewarded").length;
    const pending = referrals.filter((r) => r.status === "pending").length;
    const rewardsGiven = referrals
        .filter((r) => r.status === "rewarded")
        .reduce((sum, r) => sum + (r.reward_amount || 0), 0);

    if (loading) {
        return (
            <div className="space-y-5 animate-slide-up">
                <div className="page-header">
                    <div className="space-y-2">
                        <div className="skeleton h-8 w-40 rounded-xl" />
                        <div className="skeleton h-4 w-64 rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton h-24 rounded-2xl" />
                    ))}
                </div>
                <div className="skeleton h-80 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-slide-up">
            {/* ── Header ── */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Referrals</h1>
                    <p className="page-subtitle">
                        Track customer referrals and rewards at your store
                    </p>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    label="Total Referrals"
                    value={total}
                    sub="All time"
                    icon={UsersIcon}
                    iconBg="bg-sky-100 text-sky-600"
                    cardClass="sm-card-sky"
                />
                <StatCard
                    label="Successful"
                    value={successful}
                    sub="Rewarded"
                    icon={CheckCircleIcon}
                    iconBg="bg-emerald-100 text-emerald-600"
                    cardClass="sm-card-mint"
                />
                <StatCard
                    label="Pending"
                    value={pending}
                    sub="Awaiting purchase"
                    icon={ClockIcon}
                    iconBg="bg-amber-100 text-amber-600"
                    cardClass="sm-card-amber"
                />
                <StatCard
                    label="Rewards Given"
                    value={`₹${rewardsGiven.toLocaleString("en-IN")}`}
                    sub="Total value"
                    icon={GiftIcon}
                    iconBg="bg-rose-100 text-rose-600"
                    cardClass="sm-card-coral"
                />
            </div>

            {/* ── Table ── */}
            <div className="glass-card overflow-hidden">
                {/* Toolbar */}
                <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <UserGroupIcon className="w-4 h-4 text-emerald-500" />
                        Referral Activity
                        <span className="text-xs font-semibold text-slate-400">
                            ({filtered.length})
                        </span>
                    </h2>
                    <div className="flex gap-2 flex-wrap items-center">
                        <select
                            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 focus:outline-none focus:border-emerald-400 cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="rewarded">Rewarded</option>
                            <option value="pending">Pending</option>
                            <option value="expired">Expired</option>
                        </select>
                        <input
                            type="month"
                            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 focus:outline-none focus:border-emerald-400"
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                        />
                        {(statusFilter !== "all" || monthFilter) && (
                            <button
                                className="btn-secondary text-xs !px-3 !py-2"
                                onClick={() => {
                                    setStatusFilter("all");
                                    setMonthFilter("");
                                }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Referrer</th>
                                <th>Mobile</th>
                                <th>Referred Person</th>
                                <th>Referred Mobile</th>
                                <th>Status</th>
                                <th>Reward</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="py-12 text-center"
                                    >
                                        <UserGroupIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                        <p className="text-sm text-slate-400">
                                            No referrals match the selected
                                            filters
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((r) => (
                                    <tr key={r.id}>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 flex-shrink-0">
                                                    {r.referrer_name[0]}
                                                </div>
                                                <span className="font-semibold text-slate-800">
                                                    {r.referrer_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="font-mono text-xs text-slate-500">
                                                {r.referrer_mobile}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-700 flex-shrink-0">
                                                    {r.referred_name[0]}
                                                </div>
                                                <span className="font-semibold text-slate-700">
                                                    {r.referred_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="font-mono text-xs text-slate-500">
                                                {r.referred_mobile}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={
                                                    STATUS_BADGE[r.status] ||
                                                    "badge-info"
                                                }
                                            >
                                                {STATUS_LABEL[r.status] ||
                                                    r.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`text-sm font-bold ${r.reward_amount > 0 ? "text-emerald-600" : "text-slate-300"}`}
                                            >
                                                {r.reward_amount > 0
                                                    ? `₹${r.reward_amount}`
                                                    : "—"}
                                            </span>
                                        </td>
                                        <td className="text-xs text-slate-400">
                                            {r.date}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
