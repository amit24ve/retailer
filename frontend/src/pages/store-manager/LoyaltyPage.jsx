import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import {
    InformationCircleIcon,
    SparklesIcon,
    ShieldCheckIcon,
    UsersIcon,
    CurrencyRupeeIcon,
    ClockIcon,
} from "@heroicons/react/24/outline";

// ─── Tier configuration ───────────────────────────────────────────────────────

const TIERS = [
    {
        key: "silver",
        label: "Silver",
        icon: "🥈",
        badgeClass: "badge-silver",
        color: "text-slate-300",
        border: "border-slate-400/30",
        bg: "bg-slate-500/10",
        ringColor: "ring-slate-400/20",
    },
    {
        key: "gold",
        label: "Gold",
        icon: "🥇",
        badgeClass: "badge-gold",
        color: "text-amber-400",
        border: "border-amber-400/30",
        bg: "bg-amber-500/10",
        ringColor: "ring-amber-400/20",
    },
    {
        key: "platinum",
        label: "Platinum",
        icon: "💎",
        badgeClass: "badge-platinum",
        color: "text-blue-300",
        border: "border-blue-400/30",
        bg: "bg-blue-500/10",
        ringColor: "ring-blue-400/20",
    },
    {
        key: "diamond",
        label: "Diamond",
        icon: "✨",
        badgeClass: "badge-diamond",
        color: "text-purple-400",
        border: "border-purple-400/30",
        bg: "bg-purple-500/10",
        ringColor: "ring-purple-400/20",
    },
];

// ─── Defaults for tier data when API doesn't include it ───────────────────────

const MOCK_TIER_DATA = {
    silver: {
        min_points: 0,
        benefits: [
            "5% bonus points on every purchase",
            "Birthday reward voucher",
            "Monthly newsletter & offers",
        ],
    },
    gold: {
        min_points: 1000,
        benefits: [
            "10% bonus points on every purchase",
            "Priority billing counter",
            "Birthday double points",
            "Exclusive member offers",
        ],
    },
    platinum: {
        min_points: 5000,
        benefits: [
            "20% bonus points on every purchase",
            "Free home delivery",
            "Early access to seasonal sales",
            "Dedicated customer support",
        ],
    },
    diamond: {
        min_points: 15000,
        benefits: [
            "30% bonus points on every purchase",
            "VIP lounge access",
            "Personal shopping assistant",
            "Quarterly luxury gift",
            "Free garment alterations",
        ],
    },
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LoyaltyPage() {
    const { user } = useAuth();
    const [loyalty, setLoyalty] = useState(null);
    const [distribution, setDistribution] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/loyalty")
            .then((r) => {
                setLoyalty(r.data.loyalty || r.data);
                setDistribution(r.data.distribution || null);
            })
            .catch(() => {
                setLoyalty(getMockLoyalty());
                setDistribution(getMockDistribution());
            })
            .finally(() => setLoading(false));
    }, []);

    // Normalise the program object regardless of API shape
    const prog = loyalty?.program ?? loyalty ?? {};

    return (
        <div className="space-y-5 animate-slide-up">
            {/* Header — no action buttons (read-only for store manager) */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Loyalty Program</h1>
                    <p className="page-subtitle">
                        Current loyalty settings configured for your store
                    </p>
                </div>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <InformationCircleIcon className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-300">
                    Loyalty settings are managed by your{" "}
                    <span className="font-semibold text-emerald-200">
                        Brand Owner
                    </span>
                    . Contact them if you need any changes to the program.
                </p>
            </div>

            {loading ? (
                <LoadingSkeleton />
            ) : (
                <>
                    {/* ── Program overview ─────────────────────────────────────── */}
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <SparklesIcon className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-sm font-semibold text-white">
                                Program Overview
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <InfoCell
                                label="Program Type"
                                value={
                                    <span className="capitalize">
                                        {(prog.type || "amount_spent").replace(
                                            /_/g,
                                            " ",
                                        )}
                                    </span>
                                }
                            />
                            <InfoCell
                                label="Earning Rate"
                                value={
                                    <span className="text-emerald-400">
                                        ₹{prog.earn_per_rupee ?? 10} = 1 Point
                                    </span>
                                }
                                icon={
                                    <CurrencyRupeeIcon className="w-3.5 h-3.5 text-emerald-400" />
                                }
                            />
                            <InfoCell
                                label="Redemption Rate"
                                value={
                                    <span className="text-amber-400">
                                        {prog.redemption_rate ?? 100} pts = ₹
                                        {prog.redemption_value ?? 10}
                                    </span>
                                }
                            />
                            <InfoCell
                                label="Program Status"
                                value={
                                    <span className="badge-success">
                                        Active
                                    </span>
                                }
                            />
                            <InfoCell
                                label="Min Redemption"
                                value={`${(prog.min_redemption_points ?? 200).toLocaleString("en-IN")} pts`}
                            />
                            <InfoCell
                                label="Points Expiry"
                                value={`${prog.points_expiry_days ?? 365} days`}
                                icon={
                                    <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                                }
                            />
                        </div>
                    </div>

                    {/* ── Tier levels ──────────────────────────────────────────── */}
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-sm font-semibold text-white">
                                Tier Levels &amp; Benefits
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {TIERS.map((tier) => {
                                const td =
                                    prog.tiers?.[tier.key] ??
                                    MOCK_TIER_DATA[tier.key];
                                return (
                                    <div
                                        key={tier.key}
                                        className={`rounded-xl p-4 border ${tier.border} ${tier.bg} ring-1 ${tier.ringColor}`}
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-2xl">
                                                {tier.icon}
                                            </span>
                                            <span
                                                className={`text-sm font-bold ${tier.color}`}
                                            >
                                                {tier.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-0.5">
                                            Min Points Required
                                        </p>
                                        <p
                                            className={`text-xl font-bold ${tier.color} mb-3`}
                                        >
                                            {(
                                                td.min_points ?? 0
                                            ).toLocaleString("en-IN")}
                                        </p>
                                        <div className="space-y-1.5">
                                            {(td.benefits ?? []).map((b, i) => (
                                                <p
                                                    key={i}
                                                    className="text-xs text-gray-300 flex items-start gap-1.5"
                                                >
                                                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">
                                                        •
                                                    </span>
                                                    {b}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Customer tier distribution ───────────────────────────── */}
                    {distribution && (
                        <div className="glass-card p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <UsersIcon className="w-5 h-5 text-emerald-400" />
                                <h2 className="text-sm font-semibold text-white">
                                    Customer Tier Distribution —{" "}
                                    {user?.store_name || "Your Store"}
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {TIERS.map((tier) => {
                                    const count = distribution[tier.key] ?? 0;
                                    const total =
                                        Object.values(distribution).reduce(
                                            (a, b) => a + b,
                                            0,
                                        ) || 1;
                                    const pct = Math.round(
                                        (count / total) * 100,
                                    );
                                    return (
                                        <div
                                            key={tier.key}
                                            className={`rounded-xl p-4 border ${tier.border} ${tier.bg} text-center`}
                                        >
                                            <span className="text-2xl">
                                                {tier.icon}
                                            </span>
                                            <p
                                                className={`text-2xl font-bold ${tier.color} mt-1`}
                                            >
                                                {count.toLocaleString("en-IN")}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {tier.label} Members
                                            </p>
                                            <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${tier.bg.replace("bg-", "bg-").replace("/10", "/60")}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-1">
                                                {pct}% of store members
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoCell({ label, value, icon }) {
    return (
        <div>
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-white flex items-center gap-1">
                {icon}
                {value}
            </p>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-5">
            {[4, 4, 4].map((cols, idx) => (
                <div key={idx} className="glass-card p-5">
                    <div className="skeleton h-5 w-40 rounded mb-4" />
                    <div className={`grid grid-cols-${cols} gap-4`}>
                        {[...Array(cols)].map((_, i) => (
                            <div key={i}>
                                <div className="skeleton h-3 w-24 rounded mb-2" />
                                <div className="skeleton h-5 w-32 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

function getMockLoyalty() {
    return {
        program: {
            type: "amount_spent",
            earn_per_rupee: 10,
            redemption_rate: 100,
            redemption_value: 10,
            min_redemption_points: 200,
            points_expiry_days: 365,
            tiers: MOCK_TIER_DATA,
        },
    };
}

function getMockDistribution() {
    return { silver: 284, gold: 96, platinum: 31, diamond: 8 };
}
