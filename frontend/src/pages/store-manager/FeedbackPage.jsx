import { useState, useEffect } from "react";
import api from "../../services/api";
import {
    ChartBarIcon,
    ChatBubbleOvalLeftEllipsisIcon,
} from "@heroicons/react/24/outline";

// ── Mock data ───────────────────────────────────────────────────────────────
const MOCK_FEEDBACK = [
    {
        id: "f1",
        customer_name: "Priya Sharma",
        mobile: "98765XXXXX",
        rating: 5,
        comment:
            "Amazing service! Staff was super helpful and the products are great quality. Will definitely come back.",
        date: "2026-06-28",
        type: "in-store",
    },
    {
        id: "f2",
        customer_name: "Rahul Mehta",
        mobile: "87654XXXXX",
        rating: 4,
        comment:
            "Good experience overall. Product range is excellent, billing could be a bit faster.",
        date: "2026-06-27",
        type: "post-purchase",
    },
    {
        id: "f3",
        customer_name: "Anita Patel",
        mobile: "76543XXXXX",
        rating: 2,
        comment:
            "Wait time was too long. Staff did not acknowledge me for the first 10 minutes.",
        date: "2026-06-26",
        type: "in-store",
    },
    {
        id: "f4",
        customer_name: "Vikram Singh",
        mobile: "95432XXXXX",
        rating: 5,
        comment:
            "Outstanding! Love the loyalty points system. Saved ₹800 on my last bill!",
        date: "2026-06-25",
        type: "post-purchase",
    },
    {
        id: "f5",
        customer_name: "Sunita Gupta",
        mobile: "86543XXXXX",
        rating: 3,
        comment:
            "Average experience. Some items were out of stock that I needed.",
        date: "2026-06-24",
        type: "in-store",
    },
    {
        id: "f6",
        customer_name: "Arjun Nair",
        mobile: "97654XXXXX",
        rating: 5,
        comment:
            "Wonderful! The store manager personally helped me pick the right items for my budget.",
        date: "2026-06-23",
        type: "post-purchase",
    },
    {
        id: "f7",
        customer_name: "Deepa Krishnan",
        mobile: "88765XXXXX",
        rating: 1,
        comment:
            "Very disappointed. Was given wrong product and return process was a hassle.",
        date: "2026-06-22",
        type: "in-store",
    },
    {
        id: "f8",
        customer_name: "Karan Malhotra",
        mobile: "99876XXXXX",
        rating: 4,
        comment:
            "Nice ambiance, good staff. Parking could be better but overall a pleasant experience.",
        date: "2026-06-21",
        type: "post-purchase",
    },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
const RATING_EMOJI = { 1: "😡", 2: "😞", 3: "😐", 4: "😊", 5: "🤩" };
const RATING_LABEL = {
    1: "Terrible",
    2: "Poor",
    3: "Okay",
    4: "Good",
    5: "Excellent",
};
const RATING_COLOR = {
    1: "text-red-500",
    2: "text-orange-400",
    3: "text-amber-400",
    4: "text-emerald-500",
    5: "text-emerald-600",
};

function StarRow({ rating }) {
    return (
        <span className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <span
                    key={i}
                    className={`text-sm ${i <= rating ? RATING_COLOR[rating] : "text-slate-200"}`}
                >
                    ★
                </span>
            ))}
        </span>
    );
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
export default function FeedbackPage() {
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ratingFilter, setRatingFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");

    useEffect(() => {
        api.get("/feedback")
            .then((r) => setFeedback(r.data.feedback || r.data || []))
            .catch(() => setFeedback(MOCK_FEEDBACK))
            .finally(() => setLoading(false));
    }, []);

    const filtered = feedback.filter((f) => {
        const rMatch =
            ratingFilter === "all" || f.rating === parseInt(ratingFilter);
        const dMatch = !dateFilter || (f.date && f.date.startsWith(dateFilter));
        return rMatch && dMatch;
    });

    const total = feedback.length;
    const promoters = feedback.filter((f) => f.rating >= 4).length;
    const passives = feedback.filter((f) => f.rating === 3).length;
    const detractors = feedback.filter((f) => f.rating <= 2).length;
    const promoterPct = total ? Math.round((promoters / total) * 100) : 0;
    const passivePct = total ? Math.round((passives / total) * 100) : 0;
    const detractorPct = total ? Math.round((detractors / total) * 100) : 0;
    const npsScore = promoterPct - detractorPct;

    if (loading) {
        return (
            <div className="space-y-5 animate-slide-up">
                <div className="page-header">
                    <div className="space-y-2">
                        <div className="skeleton h-8 w-56 rounded-xl" />
                        <div className="skeleton h-4 w-72 rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton h-24 rounded-2xl" />
                    ))}
                </div>
                <div className="skeleton h-36 rounded-2xl" />
                <div className="skeleton h-64 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-slide-up">
            {/* ── Header ── */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Customer Feedback</h1>
                    <p className="page-subtitle">
                        Reviews and ratings collected at your store
                    </p>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    label="NPS Score"
                    value={npsScore >= 0 ? `+${npsScore}` : `${npsScore}`}
                    sub="Net Promoter Score"
                    cardClass="sm-card-sky"
                />
                <StatCard
                    label="Total Reviews"
                    value={total}
                    sub="All time"
                    cardClass="sm-card-mint"
                />
                <StatCard
                    label="Promoters"
                    value={`${promoterPct}%`}
                    sub={`${promoters} customers`}
                    cardClass="sm-card-amber"
                />
                <StatCard
                    label="Detractors"
                    value={`${detractorPct}%`}
                    sub={`${detractors} customers`}
                    cardClass="sm-card-coral"
                />
            </div>

            {/* ── NPS Breakdown ── */}
            <div className="glass-card p-5">
                <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <ChartBarIcon className="w-4 h-4 text-emerald-500" />
                    NPS Breakdown
                </h2>
                <div className="grid grid-cols-3 gap-4">
                    {/* Promoters */}
                    <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-100 text-center">
                        <span className="text-3xl">😊</span>
                        <p className="text-3xl font-black text-emerald-700 mt-1">
                            {promoters}
                        </p>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mt-1">
                            Promoters
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Rating 4 – 5
                        </p>
                        <div className="mt-3 h-1.5 rounded-full bg-emerald-200 overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${promoterPct}%` }}
                            />
                        </div>
                        <p className="text-sm font-bold text-emerald-600 mt-1">
                            {promoterPct}%
                        </p>
                    </div>

                    {/* Passives */}
                    <div className="rounded-2xl p-4 bg-amber-50 border border-amber-100 text-center">
                        <span className="text-3xl">😐</span>
                        <p className="text-3xl font-black text-amber-700 mt-1">
                            {passives}
                        </p>
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mt-1">
                            Passives
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Rating 3
                        </p>
                        <div className="mt-3 h-1.5 rounded-full bg-amber-200 overflow-hidden">
                            <div
                                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                style={{ width: `${passivePct}%` }}
                            />
                        </div>
                        <p className="text-sm font-bold text-amber-600 mt-1">
                            {passivePct}%
                        </p>
                    </div>

                    {/* Detractors */}
                    <div className="rounded-2xl p-4 bg-rose-50 border border-rose-100 text-center">
                        <span className="text-3xl">😡</span>
                        <p className="text-3xl font-black text-rose-700 mt-1">
                            {detractors}
                        </p>
                        <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mt-1">
                            Detractors
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Rating 1 – 2
                        </p>
                        <div className="mt-3 h-1.5 rounded-full bg-rose-200 overflow-hidden">
                            <div
                                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                                style={{ width: `${detractorPct}%` }}
                            />
                        </div>
                        <p className="text-sm font-bold text-rose-600 mt-1">
                            {detractorPct}%
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Filters + Feedback List ── */}
            <div className="glass-card overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4 text-emerald-500" />
                        All Feedback
                        <span className="text-xs font-semibold text-slate-400">
                            ({filtered.length})
                        </span>
                    </h2>
                    <div className="flex gap-2 flex-wrap items-center">
                        <select
                            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 focus:outline-none focus:border-emerald-400 cursor-pointer"
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(e.target.value)}
                        >
                            <option value="all">All Ratings</option>
                            {[5, 4, 3, 2, 1].map((r) => (
                                <option key={r} value={r}>
                                    {RATING_EMOJI[r]} {r} Star
                                    {r !== 1 ? "s" : ""}
                                </option>
                            ))}
                        </select>
                        <input
                            type="date"
                            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 focus:outline-none focus:border-emerald-400"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                        {(ratingFilter !== "all" || dateFilter) && (
                            <button
                                className="btn-secondary text-xs !px-3 !py-2"
                                onClick={() => {
                                    setRatingFilter("all");
                                    setDateFilter("");
                                }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <ChatBubbleOvalLeftEllipsisIcon className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                        <p className="text-sm text-slate-400">
                            No feedback matches your filters
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filtered.map((fb) => (
                            <div
                                key={fb.id}
                                className="px-5 py-4 hover:bg-slate-50/60 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Avatar with emoji */}
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-lg">
                                        {RATING_EMOJI[fb.rating]}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {/* Top row */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-bold text-slate-800">
                                                    {fb.customer_name}
                                                </span>
                                                <StarRow rating={fb.rating} />
                                                <span
                                                    className={`text-xs font-semibold ${RATING_COLOR[fb.rating]}`}
                                                >
                                                    {RATING_LABEL[fb.rating]}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {fb.type && (
                                                    <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium capitalize">
                                                        {fb.type.replace(
                                                            "-",
                                                            " ",
                                                        )}
                                                    </span>
                                                )}
                                                <span className="text-xs text-slate-400">
                                                    {fb.date}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Comment */}
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {fb.comment}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
