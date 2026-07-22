import { useState, useEffect } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
    "Business Overview",
    "Customer Health",
    "Growth",
    "Sales",
    "Store Performance",
    "Custom",
];

const CATEGORY_COLORS = {
    "Business Overview": {
        bg: "bg-violet-50",
        text: "text-violet-700",
        border: "border-violet-200",
    },
    "Customer Health": {
        bg: "bg-cyan-50",
        text: "text-cyan-700",
        border: "border-cyan-200",
    },
    Growth: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
    },
    Sales: {
        bg: "bg-pink-50",
        text: "text-pink-700",
        border: "border-pink-200",
    },
    "Store Performance": {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
    },
    Custom: {
        bg: "bg-slate-50",
        text: "text-slate-700",
        border: "border-slate-200",
    },
};

// ─── Default store insights ───────────────────────────────────────────────────

const DEFAULT_INSIGHTS = [
    {
        id: "todays-sales",
        category: "Business Overview",
        title: "Today's Sales",
        description:
            "Track your store's total revenue for today and compare with yesterday's performance.",
        metric: "₹18,420",
        metric_label: "Revenue generated today",
        is_going_well: true,
    },
    {
        id: "customer-visits",
        category: "Customer Health",
        title: "Customer Visits This Week",
        description:
            "Number of unique customers who walked into your store this week.",
        metric: "342",
        metric_label: "Unique visits this week",
        is_going_well: true,
    },
    {
        id: "new-customers",
        category: "Growth",
        title: "New Customers This Month",
        description:
            "First-time buyers acquired this month — a direct signal of your store's growth.",
        metric: "87",
        metric_label: "New customers in current month",
        is_going_well: false,
    },
    {
        id: "avg-bill",
        category: "Sales",
        title: "Average Bill Value",
        description:
            "Mean transaction value per customer visit. Higher averages indicate upselling success.",
        metric: "₹1,240",
        metric_label: "Avg. bill value this week",
        is_going_well: true,
    },
    {
        id: "top-products",
        category: "Store Performance",
        title: "Top Products Today",
        description:
            "Best-selling items in your store today. Use this to manage stock proactively.",
        metric: "12",
        metric_label: "Distinct products sold today",
        is_going_well: true,
    },
];

// ─── Insight Card ─────────────────────────────────────────────────────────────

function InsightCard({ card }) {
    const {
        category,
        title,
        metric,
        metric_label,
        is_going_well,
        description,
    } = card;
    const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS["Custom"];

    return (
        <div className="glass-card rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-2.5 min-w-0">
                        {/* Category + badge row */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span
                                className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
                            >
                                {category}
                            </span>
                            {is_going_well && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-cyan-500 shadow-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                                    Going Well
                                </span>
                            )}
                            {!is_going_well && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                                    ⚠ Needs Attention
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h2 className="text-lg font-black text-slate-900 leading-tight tracking-tight">
                            {title}
                        </h2>

                        {/* Description */}
                        {description && (
                            <p className="text-sm text-slate-500 leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Metric bubble */}
                    {metric && (
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-right shrink-0 min-w-[120px]">
                            <p className="text-2xl font-black text-slate-900 leading-none">
                                {metric}
                            </p>
                            {metric_label && (
                                <p className="text-[11px] text-slate-500 font-medium mt-1 leading-tight">
                                    {metric_label}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SmartInsightsPage() {
    useAuth();
    const [activeTab, setActiveTab] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [customInsights, setCustomInsights] = useState([]);
    const [form, setForm] = useState({
        title: "",
        category: "Business Overview",
        description: "",
        metric: "",
        metric_label: "",
        is_going_well: false,
    });

    // Fetch custom insights created by this store
    useEffect(() => {
        api.get("/smart-insights")
            .then((res) => {
                const ci = res.data?.custom_insights || [];
                setCustomInsights(ci.map((c) => ({ ...c, isCustom: true })));
            })
            .catch(() => {});
    }, []);

    const allInsights = [...DEFAULT_INSIGHTS, ...customInsights];
    const goingWellCount = allInsights.filter(
        (c) => c.is_going_well || c.isGoingWell,
    ).length;
    const filtered =
        activeTab === "going-well"
            ? allInsights.filter((c) => c.is_going_well || c.isGoingWell)
            : allInsights;

    const handleSave = async () => {
        if (!form.title.trim()) {
            toast.error("Title is required");
            return;
        }
        setSaving(true);
        try {
            const res = await api.post("/smart-insights", form);
            setCustomInsights((prev) => [
                ...prev,
                { ...res.data, isCustom: true },
            ]);
            toast.success("Insight created!");
            setShowModal(false);
            setForm({
                title: "",
                category: "Business Overview",
                description: "",
                metric: "",
                metric_label: "",
                is_going_well: false,
            });
        } catch {
            toast.error("Failed to create insight");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-5 pb-10 animate-slide-up">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-slate-800" />
                    <h1 className="page-title">Smart Insights</h1>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-1.5 text-sm font-bold"
                >
                    <span className="text-base leading-none">+</span> Create
                    Insight
                </button>
            </div>

            {/* ── Subtitle ── */}
            <p className="page-subtitle">
                Store-level insights to help you make smarter day-to-day
                decisions.
            </p>

            {/* ── Filter tabs ── */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                        activeTab === "all"
                            ? "bg-slate-900 text-white shadow-sm"
                            : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                >
                    All
                </button>
                <button
                    onClick={() => setActiveTab("going-well")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                        activeTab === "going-well"
                            ? "bg-cyan-500 text-white shadow-sm"
                            : "bg-white border border-slate-200 text-slate-700 hover:border-cyan-500"
                    }`}
                >
                    Going Well
                    <span
                        className={`w-5 h-5 rounded-full text-xs font-black flex items-center justify-center ${
                            activeTab === "going-well"
                                ? "bg-white text-cyan-800"
                                : "bg-cyan-500 text-white"
                        }`}
                    >
                        {goingWellCount}
                    </span>
                </button>
            </div>

            {/* ── Cards ── */}
            <div className="space-y-4">
                {filtered.map((card) => (
                    <InsightCard key={card.insight_id || card.id} card={card} />
                ))}
            </div>

            {/* ── Empty state ── */}
            {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mb-4">
                        <SparklesIcon className="w-8 h-8 text-cyan-500" />
                    </div>
                    <p className="text-base font-bold text-slate-700">
                        No insights here yet
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                        All your insights are marked as needing attention.
                    </p>
                </div>
            )}

            {/* ── Create Insight Modal ── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 space-y-5 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900">
                                Create Insight
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-xl font-bold transition"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="input-label">
                                    Title / Headline *
                                </label>
                                <input
                                    className="input-field"
                                    placeholder="e.g. Today's sales are up 20%"
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            title: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="input-label">Category</label>
                                <select
                                    className="input-field"
                                    value={form.category}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            category: e.target.value,
                                        }))
                                    }
                                >
                                    {CATEGORIES.map((c) => (
                                        <option key={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="input-label">
                                    Description / Key Metric
                                </label>
                                <input
                                    className="input-field"
                                    placeholder="e.g. Best sales day in the last 30 days"
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            description: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            {/* Metric + Label */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="input-label">
                                        Metric Value
                                    </label>
                                    <input
                                        className="input-field"
                                        placeholder="e.g. ₹2,400 or 42%"
                                        value={form.metric}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                metric: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="input-label">
                                        Metric Label
                                    </label>
                                    <input
                                        className="input-field"
                                        placeholder="e.g. Sales in last 30 days"
                                        value={form.metric_label}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                metric_label: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            {/* Status toggle */}
                            <div>
                                <label className="input-label">Status</label>
                                <div className="flex gap-2 mt-1">
                                    <button
                                        onClick={() =>
                                            setForm((f) => ({
                                                ...f,
                                                is_going_well: false,
                                            }))
                                        }
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                                            !form.is_going_well
                                                ? "bg-red-50 border-red-200 text-red-700"
                                                : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                                        }`}
                                    >
                                        ⚠ Needs Attention
                                    </button>
                                    <button
                                        onClick={() =>
                                            setForm((f) => ({
                                                ...f,
                                                is_going_well: true,
                                            }))
                                        }
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                                            form.is_going_well
                                                ? "bg-cyan-50 border-cyan-300 text-cyan-700"
                                                : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                                        }`}
                                    >
                                        ✓ Going Well
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-700 transition-all duration-200 disabled:opacity-60"
                        >
                            {saving ? "Saving…" : "Save Insight"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
