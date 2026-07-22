import { useState, useEffect } from "react";
import api from "../../services/api";
import {
    InformationCircleIcon,
    CheckCircleIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_PLANS = [
    {
        id: "p1",
        tier: "Silver",
        name: "Silver Member",
        price: 499,
        validity: "12 months",
        benefits: [
            "5% cashback on every purchase",
            "Birthday bonus – 200 extra points",
            "Early access to new arrivals",
            "Priority billing queue",
        ],
        members: 124,
    },
    {
        id: "p2",
        tier: "Gold",
        name: "Gold Member",
        price: 999,
        validity: "12 months",
        benefits: [
            "10% cashback on every purchase",
            "Birthday bonus – 500 extra points",
            "2× loyalty points all year",
            "Free home delivery (3 orders/month)",
            "Exclusive Gold-only offers",
        ],
        members: 87,
    },
    {
        id: "p3",
        tier: "Platinum",
        name: "Platinum Elite",
        price: 1999,
        validity: "12 months",
        benefits: [
            "15% cashback on every purchase",
            "Birthday bonus – 1,000 extra points",
            "3× loyalty points all year",
            "Unlimited free home delivery",
            "VIP event invitations",
            "Dedicated customer support line",
        ],
        members: 34,
    },
    {
        id: "p4",
        tier: "Diamond",
        name: "Diamond VIP",
        price: 3999,
        validity: "12 months",
        benefits: [
            "20% cashback on every purchase",
            "Birthday bonus – 2,000 extra points",
            "5× loyalty points all year",
            "Unlimited delivery + gift-wrapping",
            "Annual appreciation gift",
            "Personal account manager",
            "Exclusive concierge service",
        ],
        members: 12,
    },
];

const MOCK_SIGNUPS = [
    {
        id: "s1",
        customer_name: "Priya Sharma",
        plan: "Gold Member",
        purchase_date: "2026-06-25",
        expiry: "2027-06-24",
        amount: 999,
    },
    {
        id: "s2",
        customer_name: "Rahul Mehta",
        plan: "Silver Member",
        purchase_date: "2026-06-24",
        expiry: "2027-06-23",
        amount: 499,
    },
    {
        id: "s3",
        customer_name: "Anita Patel",
        plan: "Platinum Elite",
        purchase_date: "2026-06-22",
        expiry: "2027-06-21",
        amount: 1999,
    },
    {
        id: "s4",
        customer_name: "Vikram Singh",
        plan: "Gold Member",
        purchase_date: "2026-06-20",
        expiry: "2027-06-19",
        amount: 999,
    },
    {
        id: "s5",
        customer_name: "Sunita Gupta",
        plan: "Silver Member",
        purchase_date: "2026-06-18",
        expiry: "2027-06-17",
        amount: 499,
    },
];

// ── Tier configuration ───────────────────────────────────────────────────────
const TIER_CFG = {
    Silver: {
        badge: "badge-silver",
        cardBg: "bg-slate-50  border-slate-200",
        icon: "🥈",
        accent: "text-slate-600",
        checkColor: "text-slate-500",
    },
    Gold: {
        badge: "badge-gold",
        cardBg: "bg-amber-50  border-amber-200",
        icon: "🥇",
        accent: "text-amber-600",
        checkColor: "text-amber-500",
    },
    Platinum: {
        badge: "badge-platinum",
        cardBg: "bg-indigo-50 border-indigo-200",
        icon: "💎",
        accent: "text-indigo-600",
        checkColor: "text-indigo-500",
    },
    Diamond: {
        badge: "badge-diamond",
        cardBg: "bg-purple-50 border-purple-200",
        icon: "👑",
        accent: "text-purple-600",
        checkColor: "text-purple-500",
    },
};

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

function PlanCard({ plan }) {
    const cfg = TIER_CFG[plan.tier] || TIER_CFG.Silver;
    return (
        <div
            className={`glass-card p-5 flex flex-col gap-4 border ${cfg.cardBg}`}
        >
            {/* Plan header */}
            <div className="flex items-center gap-3">
                <span className="text-3xl">{cfg.icon}</span>
                <div>
                    <h3 className="text-sm font-bold text-slate-800">
                        {plan.name}
                    </h3>
                    <span className={cfg.badge}>{plan.tier}</span>
                </div>
            </div>

            {/* Price */}
            <div className="text-center rounded-2xl py-3 bg-white/80 border border-white shadow-sm">
                <p className={`text-3xl font-black ${cfg.accent}`}>
                    ₹{plan.price.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                    per {plan.validity}
                </p>
            </div>

            {/* Benefits */}
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Benefits
                </p>
                <ul className="space-y-1.5">
                    {plan.benefits.map((b, i) => (
                        <li
                            key={i}
                            className="flex items-start gap-1.5 text-xs text-slate-600"
                        >
                            <CheckCircleIcon
                                className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${cfg.checkColor}`}
                            />
                            {b}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Members count */}
            <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Active members</span>
                <span className={`text-sm font-bold ${cfg.accent}`}>
                    {plan.members || 0}
                </span>
            </div>
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function MembershipPage() {
    const [plans, setPlans] = useState([]);
    const [signups, setSignups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/membership")
            .then((r) => {
                setPlans(r.data.plans || MOCK_PLANS);
                setSignups(r.data.recent_signups || MOCK_SIGNUPS);
            })
            .catch(() => {
                setPlans(MOCK_PLANS);
                setSignups(MOCK_SIGNUPS);
            })
            .finally(() => setLoading(false));
    }, []);

    const activeMemberCount = plans.reduce((s, p) => s + (p.members || 0), 0);
    const membershipRevenue = plans.reduce(
        (s, p) => s + (p.members || 0) * (p.price || 0),
        0,
    );
    const avgMemberLTV = activeMemberCount
        ? Math.round(membershipRevenue / activeMemberCount)
        : 0;

    if (loading) {
        return (
            <div className="space-y-5 animate-slide-up">
                <div className="page-header">
                    <div className="space-y-2">
                        <div className="skeleton h-8 w-56 rounded-xl" />
                        <div className="skeleton h-4 w-72 rounded" />
                    </div>
                </div>
                <div className="skeleton h-14 rounded-2xl" />
                <div className="grid grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="skeleton h-24 rounded-2xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton h-64 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-slide-up">
            {/* ── Header ── */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Membership Plans</h1>
                    <p className="page-subtitle">
                        Active tiers and member statistics for your store
                    </p>
                </div>
            </div>

            {/* ── Info Banner ── */}
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-indigo-50 border border-indigo-100">
                <InformationCircleIcon className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <p className="text-sm text-indigo-700 font-medium">
                    Membership plans are configured by your Brand Owner. Contact
                    them to make changes to pricing or benefits.
                </p>
            </div>

            {/* ── Store Member Stats ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    label="Active Members"
                    value={activeMemberCount}
                    sub="Across all tiers"
                    cardClass="sm-card-sky"
                />
                <StatCard
                    label="Revenue from Memberships"
                    value={`₹${membershipRevenue.toLocaleString("en-IN")}`}
                    sub="Lifetime total"
                    cardClass="sm-card-mint"
                />
                <StatCard
                    label="Avg Member LTV"
                    value={`₹${avgMemberLTV.toLocaleString("en-IN")}`}
                    sub="Per member"
                    cardClass="sm-card-amber"
                />
            </div>

            {/* ── Plan Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {plans.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} />
                ))}
            </div>

            {/* ── Recent Signups Table ── */}
            <div className="glass-card overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <SparklesIcon className="w-4 h-4 text-emerald-500" />
                        Recent Member Signups
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Plan</th>
                                <th>Purchase Date</th>
                                <th>Expiry</th>
                                <th className="text-right">Amount Paid</th>
                            </tr>
                        </thead>
                        <tbody>
                            {signups.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-10 text-center text-sm text-slate-400"
                                    >
                                        No signups recorded yet
                                    </td>
                                </tr>
                            ) : (
                                signups.map((s) => (
                                    <tr key={s.id}>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
                                                    {s.customer_name[0]}
                                                </div>
                                                <span className="font-semibold text-slate-800">
                                                    {s.customer_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                {s.plan}
                                            </span>
                                        </td>
                                        <td className="text-xs text-slate-500">
                                            {s.purchase_date}
                                        </td>
                                        <td className="text-xs text-slate-500">
                                            {s.expiry}
                                        </td>
                                        <td className="text-right font-bold text-emerald-600">
                                            ₹
                                            {(s.amount || 0).toLocaleString(
                                                "en-IN",
                                            )}
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
