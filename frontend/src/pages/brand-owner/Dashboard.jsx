import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
} from "recharts";
import {
    ArrowTopRightOnSquareIcon,
    ArrowPathIcon,
    XMarkIcon,
    PaperAirplaneIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";

// ─── Refill Credits Modal ─────────────────────────────────────────────────────
function RefillCreditsModal({ currentCredits, onClose }) {
    const [sms, setSms] = useState("");
    const [waU, setWaU] = useState("");
    const [waM, setWaM] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const s = Number(sms) || 0;
        const u = Number(waU) || 0;
        const m = Number(waM) || 0;
        if (s <= 0 && u <= 0 && m <= 0) {
            toast.error("Please enter at least one credit amount");
            return;
        }
        setLoading(true);
        try {
            await api.post("/brand-owner/credit-request", {
                sms: s,
                wa_utility: u,
                wa_marketing: m,
                note,
            });
            setDone(true);
        } catch (err) {
            toast.error(
                err.response?.data?.detail ||
                    "Failed to submit request. Please try again.",
            );
        } finally {
            setLoading(false);
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
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 animate-scale-up">
                {/* Header */}
                <div
                    className="px-6 py-5 flex items-center justify-between"
                    style={{
                        background:
                            "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
                    }}
                >
                    <div>
                        <p className="text-base font-black text-slate-900">
                            Refill Credits
                        </p>
                        <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                            Request credits from Super Admin
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-50 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                    >
                        <XMarkIcon className="w-4 h-4 text-indigo-900" />
                    </button>
                </div>

                {!done ? (
                    <form onSubmit={handleSubmit}>
                        {/* Current Balance */}
                        <div className="px-6 pt-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                                Current Balance
                            </p>
                            <div className="flex gap-3">
                                {[
                                    {
                                        icon: "📱",
                                        label: "SMS",
                                        val: currentCredits?.sms ?? 0,
                                        color: "text-blue-700",
                                        bg: "bg-blue-50/50 border border-blue-100",
                                    },
                                    {
                                        icon: "💚",
                                        label: "WA-U",
                                        val: currentCredits?.wa_utility ?? 0,
                                        color: "text-emerald-700",
                                        bg: "bg-emerald-50/50 border border-emerald-100",
                                    },
                                    {
                                        icon: "💗",
                                        label: "WA-M",
                                        val: currentCredits?.wa_marketing ?? 0,
                                        color: "text-pink-700",
                                        bg: "bg-pink-50/50 border border-pink-100",
                                    },
                                ].map((c) => (
                                    <div
                                        key={c.label}
                                        className={`flex-1 ${c.bg} rounded-xl p-2.5 text-center`}
                                    >
                                        <p className="text-sm">{c.icon}</p>
                                        <p
                                            className={`text-sm font-black ${c.color}`}
                                        >
                                            {c.val}
                                        </p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">
                                            {c.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="px-6 pt-4 space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                How Many Credits Do You Need?
                            </p>
                            {[
                                {
                                    label: "📱 SMS Credits",
                                    val: sms,
                                    set: setSms,
                                    ph: "e.g. 500",
                                },
                                {
                                    label: "💚 WhatsApp Utility",
                                    val: waU,
                                    set: setWaU,
                                    ph: "e.g. 200",
                                },
                                {
                                    label: "💗 WhatsApp Marketing",
                                    val: waM,
                                    set: setWaM,
                                    ph: "e.g. 100",
                                },
                            ].map((f) => (
                                <div key={f.label}>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">
                                        {f.label}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={f.val}
                                        onChange={(e) => f.set(e.target.value)}
                                        placeholder={f.ph}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Note (optional)
                                </label>
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Reason? (campaign, festival, etc.)"
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-5 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                                style={{
                                    background:
                                        "linear-gradient(135deg,#6366f1,#4f46e5)",
                                }}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <PaperAirplaneIcon className="w-3.5 h-3.5" />
                                        Send Request
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    /* Success State */
                    <div className="p-8 text-center animate-fade-in">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
                            <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
                        </div>
                        <p className="text-lg font-black text-slate-900 mb-1">
                            Request Sent! ✅
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">
                            Your credit request has been sent to Super Admin.
                        </p>
                        <p className="text-xs text-indigo-600 font-bold bg-indigo-50/50 rounded-xl p-3 mb-6">
                            ⏱ Super Admin will approve within 24 hours — credits
                            will be added to your account immediately.
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-md hover:opacity-90"
                            style={{
                                background:
                                    "linear-gradient(135deg,#6366f1,#4f46e5)",
                            }}
                        >
                            Got It!
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Setup Steps ─────────────────────────────────────────────────────────────
const SETUP_STEPS = [
    {
        label: "Integrate POS",
        desc: "Integrating a POS will help you to capture and reach every customer.",
        route: "/customers/add?tab=pos",
    },
    {
        label: "Try sending a campaign",
        desc: "Sending a campaign helps you to reach to your target customer easily!",
        route: "/campaigns",
    },
    {
        label: "Activate Feedback",
        desc: "See your customer's compliments and suggestion easily.",
        route: "/feedback",
    },
    {
        label: "Activate loyalty program",
        desc: "Make them comeback with points & awesome rewards.",
        route: "/loyalty",
    },
    {
        label: "Import customers",
        desc: "Import your all existing customer to Cuben Retailer for better experience.",
        route: "/customers/add?tab=import",
    },
    {
        label: "Activate Auto-Campaign",
        desc: "Set campaigns and forget about it, we will do the rest of thing for you.",
        route: "/auto-campaigns",
    },
];

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-100 rounded-xl px-3 py-2.5 shadow-lg text-xs font-semibold">
            <p className="font-bold text-slate-800 mb-1">{label}</p>
            {payload.map((p) => (
                <p
                    key={p.name}
                    style={{ color: p.color }}
                    className="font-bold"
                >
                    {p.name}:{" "}
                    {typeof p.value === "number"
                        ? p.value.toLocaleString("en-IN")
                        : p.value}
                </p>
            ))}
        </div>
    );
};

// ─── Business Highlights tab chart ───────────────────────────────────────────
const CHART_TABS = [
    "Total Sales",
    "Total Orders",
    "Total Customers",
    "Rewards Redeemed",
];

// ─── Visit Journey dots ───────────────────────────────────────────────────────
const VisitJourney = ({ rates }) => (
    <div className="flex items-center gap-0 mt-4">
        {rates.map((r, i) => (
            <React.Fragment key={i}>
                <div className="flex flex-col items-center">
                    <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border-2 ${i === 0 ? "border-pink-400 bg-pink-50 text-pink-600 animate-pulse" : "border-slate-200 bg-white text-slate-400"}`}
                    >
                        {r}%
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 whitespace-nowrap">
                        {i + 1}
                        {i === 0
                            ? "st"
                            : i === 1
                              ? "nd"
                              : i === 2
                                ? "rd"
                                : "th"}{" "}
                        visit
                    </p>
                </div>
                {i < rates.length - 1 && (
                    <div className="flex-1 h-px bg-slate-100 mb-4 mx-0.5" />
                )}
            </React.Fragment>
        ))}
    </div>
);

// ─── Program Performance Card ─────────────────────────────────────────────────
const ProgramCard = ({
    icon,
    title,
    link,
    linkLabel = "View More",
    stats,
    bg = "bg-white",
}) => (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-bold text-slate-800">
                    {title}
                </span>
            </div>
            <Link
                to={link}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-0.5"
            >
                {linkLabel}
            </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
            {stats.map((s, i) => (
                <div
                    key={i}
                    className="bg-slate-50/60 border border-slate-50 rounded-xl p-3 text-left"
                >
                    <p className="text-lg font-black text-slate-950">
                        {s.value}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-tight uppercase tracking-wider">
                        {s.label}
                    </p>
                </div>
            ))}
        </div>
    </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function BrandOwnerDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoveredStep, setHoveredStep] = useState(0);
    const [showSetup, setShowSetup] = useState(true);
    const [dateTab, setDateTab] = useState("yesterday");
    const [chartTab, setChartTab] = useState("Total Sales");
    const [chartRange, setChartRange] = useState("Last 12 Weeks");
    const [showRefill, setShowRefill] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);

    const handleGetEmailReport = async () => {
        setReportLoading(true);
        try {
            await api.post("/analytics/send-email-report", {
                email: user?.email,
                date_range: dateTab,
            });
            toast.success(
                `Email report sent to ${user?.email || "your email"} successfully!`,
            );
        } catch (err) {
            toast.error(
                err.response?.data?.detail || "Failed to send email report",
            );
        } finally {
            setReportLoading(false);
        }
    };

    useEffect(() => {
        api.get("/analytics/dashboard")
            .then((r) => setData(r.data))
            .catch(() => setData(getMockData()))
            .finally(() => setLoading(false));
    }, []);

    const navigate = useNavigate();

    const handleStepStart = (i) => {
        const route = SETUP_STEPS[i]?.route;
        if (route) navigate(route);
    };

    const d = data || getMockData();

    // Build chart data per tab and range dynamically
    const getFilteredChartData = () => {
        let baseVal = 100;
        let variance = 50;
        if (chartTab === "Total Sales") {
            baseVal = 60000;
            variance = 25000;
        } else if (chartTab === "Total Orders") {
            baseVal = 150;
            variance = 80;
        } else if (chartTab === "Total Customers") {
            baseVal = 40;
            variance = 25;
        } else {
            baseVal = 20;
            variance = 15;
        }

        if (chartRange === "Today") {
            return [
                "09:00",
                "11:00",
                "13:00",
                "15:00",
                "17:00",
                "19:00",
                "21:00",
                "23:00",
            ].map((label, idx) => ({
                label,
                value: Math.max(
                    0,
                    Math.floor(baseVal / 10 + Math.sin(idx) * (variance / 10)),
                ),
            }));
        }
        if (chartRange === "Yesterday") {
            return [
                "09:00",
                "11:00",
                "13:00",
                "15:00",
                "17:00",
                "19:00",
                "21:00",
                "23:00",
            ].map((label, idx) => ({
                label,
                value: Math.max(
                    0,
                    Math.floor(baseVal / 10 + Math.cos(idx) * (variance / 10)),
                ),
            }));
        }
        if (chartRange === "Last 7 Days") {
            return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (label, idx) => ({
                    label,
                    value: Math.max(
                        0,
                        Math.floor(
                            baseVal / 7 + Math.sin(idx * 1.5) * (variance / 7),
                        ),
                    ),
                }),
            );
        }
        if (chartRange === "Last 30 Days") {
            return ["Week 1", "Week 2", "Week 3", "Week 4"].map(
                (label, idx) => ({
                    label,
                    value: Math.max(
                        0,
                        Math.floor(baseVal + Math.sin(idx) * variance),
                    ),
                }),
            );
        }
        if (chartRange === "Last 6 Months") {
            return ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map(
                (label, idx) => ({
                    label,
                    value: Math.max(
                        0,
                        Math.floor(baseVal * 4 + Math.cos(idx) * variance * 3),
                    ),
                }),
            );
        }
        if (chartRange === "Last 12 Months") {
            return [
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
            ].map((label, idx) => ({
                label,
                value: Math.max(
                    0,
                    Math.floor(baseVal * 4 + Math.sin(idx) * variance * 3),
                ),
            }));
        }
        if (chartRange === "Last Year") {
            return ["Q1", "Q2", "Q3", "Q4"].map((label, idx) => ({
                label,
                value: Math.max(
                    0,
                    Math.floor(baseVal * 12 + Math.cos(idx * 2) * variance * 8),
                ),
            }));
        }
        if (chartRange === "This Year") {
            return ["Q1", "Q2", "Q3", "Q4"].map((label, idx) => ({
                label,
                value: Math.max(
                    0,
                    Math.floor(baseVal * 12 + Math.sin(idx * 2) * variance * 8),
                ),
            }));
        }

        const originalData = d.weekly_chart[chartTab] || [];
        if (originalData.length > 0) {
            return originalData;
        }
        return Array.from({ length: 12 }, (_, i) => ({
            label: `W${i + 1}`,
            value: Math.max(
                0,
                baseVal + Math.floor((Math.random() - 0.3) * variance),
            ),
        }));
    };

    const chartData = getFilteredChartData();

    return (
        <div className="space-y-6 pb-8 animate-fade-in">
            {/* ── Section 1: Setup banner (keep as-is per user request) ── */}
            {showSetup && (
                <div
                    className="rounded-3xl overflow-hidden border border-indigo-100 shadow-sm"
                    style={{
                        background:
                            "linear-gradient(135deg, #f0f2ff 0%, #e0e7ff 100%)",
                    }}
                >
                    <div className="flex flex-col xl:flex-row gap-0">
                        {/* Left */}
                        <div className="p-7 xl:w-80 flex-shrink-0">
                            <p className="text-sm font-bold text-indigo-600 mb-1">
                                👋 Welcome {user?.full_name || "there"}
                            </p>
                            <p className="text-2xl font-black text-slate-900 leading-tight">
                                Let's get you set up
                                <br />
                                for success!
                            </p>
                            {/* Illustration placeholder */}
                            <div className="mt-4 flex items-center justify-center h-28 opacity-80">
                                <svg
                                    viewBox="0 0 120 100"
                                    className="w-36 h-28"
                                    fill="none"
                                >
                                    <ellipse
                                        cx="60"
                                        cy="90"
                                        rx="40"
                                        ry="6"
                                        fill="#c7d2fe"
                                        opacity="0.5"
                                    />
                                    <circle
                                        cx="60"
                                        cy="45"
                                        r="28"
                                        fill="#e0e7ff"
                                        opacity="0.6"
                                    />
                                    <path
                                        d="M50 70 Q45 50 55 35 Q60 25 68 30 Q78 38 72 55 Q68 65 60 70 Z"
                                        fill="#4f46e5"
                                        opacity="0.6"
                                    />
                                    <circle
                                        cx="62"
                                        cy="28"
                                        r="7"
                                        fill="#4f46e5"
                                        opacity="0.8"
                                    />
                                    <path
                                        d="M55 55 Q40 48 42 38"
                                        stroke="#4f46e5"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        opacity="0.7"
                                    />
                                    <path
                                        d="M68 52 Q82 44 80 35"
                                        stroke="#4f46e5"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        opacity="0.7"
                                    />
                                    <path
                                        d="M46 38 Q36 28 44 20"
                                        stroke="#818cf8"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        opacity="0.5"
                                    />
                                    <path
                                        d="M74 35 Q84 25 78 16"
                                        stroke="#818cf8"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        opacity="0.5"
                                    />
                                </svg>
                            </div>
                            <div className="mt-4">
                                <p className="text-xs font-bold text-indigo-700 bg-white/80 rounded-xl px-3 py-2 text-center shadow-sm">
                                    👆 Hover any step to get started
                                </p>
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="flex-1 p-5 space-y-1.5 bg-white/30 backdrop-blur-sm border-l border-indigo-50/50">
                            {SETUP_STEPS.map((step, i) => {
                                const isActive = hoveredStep === i;
                                return (
                                    <div
                                        key={i}
                                        onMouseEnter={() => setHoveredStep(i)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200
                                            ${isActive ? "bg-white shadow-md border border-slate-100 scale-[1.01]" : "hover:bg-white/40"}`}
                                    >
                                        {/* Circle indicator */}
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                                                ${isActive ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-white"}`}
                                        >
                                            {isActive && (
                                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                            )}
                                        </div>

                                        {/* Text */}
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={`text-sm font-bold transition-colors duration-200 ${
                                                    isActive
                                                        ? "text-slate-900"
                                                        : "text-slate-700"
                                                }`}
                                            >
                                                {step.label}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-medium">
                                                {step.desc}
                                            </p>
                                        </div>

                                        {/* Start button — only on active/hovered step */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleStepStart(i);
                                            }}
                                            className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                                                isActive
                                                    ? "opacity-100 pointer-events-auto scale-100"
                                                    : "opacity-0 pointer-events-none scale-95"
                                            }`}
                                        >
                                            Start <span>→</span>
                                        </button>
                                    </div>
                                );
                            })}
                            <button
                                onClick={() => setShowSetup(false)}
                                className="ml-4 mt-1 text-xs font-semibold text-slate-400 hover:text-slate-600 underline cursor-pointer"
                            >
                                Dismiss setup guide
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Section 2: "your business at a glance" header ── */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    your business at a glance ✨
                </h2>
                <button
                    onClick={handleGetEmailReport}
                    disabled={reportLoading}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                    {reportLoading ? (
                        <div className="w-4 h-4 border-2 border-slate-700/30 border-t-slate-700 rounded-full animate-spin" />
                    ) : (
                        <svg
                            className="w-4 h-4 text-pink-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                        </svg>
                    )}
                    {reportLoading ? "Sending..." : "Get email report"}
                </button>
            </div>

            {/* Yesterday / Today tabs + Highlights cards */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        Performance Highlights
                    </p>
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                        {["yesterday", "today"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setDateTab(t)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${dateTab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4 stat tiles */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    {[
                        {
                            label: "Sales",
                            value: `₹${(d.metrics.total_revenue / 1e5).toFixed(0)}K`,
                            icon: "🪙",
                            bg: "bg-indigo-50/40 border-indigo-100/50 hover:border-indigo-200",
                            labelColor: "text-indigo-600",
                        },
                        {
                            label: "Orders",
                            value: d.metrics.total_orders.toLocaleString(
                                "en-IN",
                            ),
                            icon: "🛍️",
                            bg: "bg-pink-50/40 border-pink-100/50 hover:border-pink-200",
                            labelColor: "text-pink-600",
                        },
                        {
                            label: "Customers",
                            value: d.metrics.new_customers.toLocaleString(
                                "en-IN",
                            ),
                            icon: "👤",
                            bg: "bg-blue-50/40 border-blue-100/50 hover:border-blue-200",
                            labelColor: "text-blue-600",
                        },
                        {
                            label: "Rewards Redeemed",
                            value: d.metrics.rewards_redeemed.toLocaleString(
                                "en-IN",
                            ),
                            icon: "🎁",
                            bg: "bg-purple-50/40 border-purple-100/50 hover:border-purple-200",
                            labelColor: "text-purple-600",
                        },
                    ].map((card) => (
                        <div
                            key={card.label}
                            className={`${card.bg} rounded-3xl p-5 flex items-center justify-between border shadow-sm hover:shadow-md transition-all duration-300`}
                        >
                            <div>
                                <p
                                    className={`text-xs font-extrabold uppercase tracking-wider ${card.labelColor}`}
                                >
                                    {card.label}
                                </p>
                                <p className="text-2xl font-black text-slate-900 mt-1.5">
                                    {card.value}
                                </p>
                            </div>
                            <span className="text-3xl bg-white w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0">
                                {card.icon}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Business Highlights chart ── */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-1 px-5 pt-5 pb-0">
                    <span className="text-indigo-600 mr-1">
                        <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </span>
                    <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        Business Highlights
                    </span>
                </div>

                {/* Metric tabs + range */}
                <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-4 flex-wrap border-b border-slate-50">
                    <div className="flex gap-6 overflow-x-auto scrollbar-hidden">
                        {CHART_TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setChartTab(tab)}
                                className={`pb-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${chartTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                            >
                                <span
                                    className={`block text-lg font-black ${chartTab === tab ? "text-indigo-600" : "text-slate-400"}`}
                                >
                                    {tab === "Total Sales"
                                        ? `₹${(d.metrics.total_revenue / 1e5).toFixed(0)}K`
                                        : tab === "Total Orders"
                                          ? d.metrics.total_orders
                                          : tab === "Total Customers"
                                            ? d.metrics.new_customers
                                            : d.metrics.rewards_redeemed}
                                </span>
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={chartRange}
                            onChange={(e) => setChartRange(e.target.value)}
                            className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer font-semibold"
                        >
                            <option>Today</option>
                            <option>Yesterday</option>
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>Last 12 Weeks</option>
                            <option>Last 6 Months</option>
                            <option>Last 12 Months</option>
                            <option>This Year</option>
                            <option>Last Year</option>
                        </select>
                        <button className="w-8 h-8 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer">
                            <ArrowTopRightOnSquareIcon className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Chart area */}
                <div className="px-5 py-5 h-56">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{
                                    top: 4,
                                    right: 4,
                                    bottom: 0,
                                    left: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="chartGrad"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#6366f1"
                                            stopOpacity={0.2}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#6366f1"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="4 4"
                                    stroke="#f8fafc"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={45}
                                    tickFormatter={(v) =>
                                        v >= 1000
                                            ? `${(v / 1000).toFixed(0)}K`
                                            : v
                                    }
                                />
                                <Tooltip content={<ChartTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    name={chartTab}
                                    stroke="#4f46e5"
                                    strokeWidth={3}
                                    fill="url(#chartGrad)"
                                    dot={false}
                                    activeDot={{ r: 6, fill: "#4f46e5", stroke: "#ffffff", strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center gap-2">
                            <div className="relative">
                                {/* Bar skeletons */}
                                <div className="flex items-end gap-2 opacity-20">
                                    {[
                                        40, 60, 45, 80, 55, 70, 50, 90, 65, 75,
                                        55, 85,
                                    ].map((h, i) => (
                                        <div
                                            key={i}
                                            className="w-5 rounded-t"
                                            style={{
                                                height: h,
                                                background: "#c7d2fe",
                                            }}
                                        />
                                    ))}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white rounded-2xl px-5 py-3 shadow-md border border-slate-100 text-center">
                                        <div className="w-9 h-9 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <svg
                                                className="w-5 h-5 text-indigo-500"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={1.5}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-bold text-slate-700">
                                            No Data Available
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Start collecting data to see your
                                            <br />
                                            data visualised here
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Section 3: 3 insight cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Card 1 – Mobile capture */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <p className="text-3xl font-black text-slate-950">
                                {d.insights.mobile_capture_pct}%
                            </p>
                            <p className="text-xs font-semibold text-slate-500 mt-1.5 leading-relaxed">
                                <span className="font-bold text-indigo-600">
                                    {d.insights.mobile_capture_count} valid
                                    mobile numbers captured
                                </span>
                                <br />
                                in the last 30 days
                            </p>
                        </div>
                        <button className="w-8 h-8 border border-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-50 flex-shrink-0 cursor-pointer">
                            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                    </div>
                    {d.insights.mobile_capture_pct < 80 && (
                        <div className="flex items-start gap-2.5 bg-rose-50/50 border border-rose-100 rounded-2xl px-3.5 py-2.5">
                            <div className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-rose-600 text-xs font-black">
                                    !
                                </span>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-rose-600 uppercase tracking-wider">
                                    Below Industry Average
                                </p>
                                <p className="text-xs text-rose-800 font-semibold leading-tight">
                                    Industry average is over 80%
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Card 2 – 5th visit retention */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-start justify-between mb-1">
                        <div>
                            <p className="text-3xl font-black text-slate-950">
                                {d.insights.fifth_visit_pct}%
                            </p>
                            <p className="text-xs font-semibold text-slate-500 mt-1.5 leading-relaxed">
                                customers make it till the 5th visit
                                <br />
                                in last 6 months
                            </p>
                        </div>
                        <button className="w-8 h-8 border border-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-50 flex-shrink-0 cursor-pointer">
                            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                    </div>
                    <VisitJourney rates={d.insights.visit_rates} />
                </div>

                {/* Card 3 – AOV */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <p className="text-3xl font-black text-slate-950">
                                ₹{d.insights.aov.toLocaleString("en-IN")}
                            </p>
                            <p className="text-xs font-semibold text-slate-500 mt-1.5 leading-relaxed">
                                Average Order Value of last 12 months.
                            </p>
                        </div>
                        <button className="w-8 h-8 border border-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-50 flex-shrink-0 cursor-pointer">
                            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                    </div>
                    {/* Mini AOV bar chart */}
                    <div className="h-14 flex items-end gap-1 overflow-hidden rounded-xl bg-slate-50/60 p-1 border border-slate-50">
                        {d.insights.aov_trend.map((v, i) => (
                            <div
                                key={i}
                                className="flex-1 rounded-sm"
                                style={{
                                    height: `${(v / Math.max(...d.insights.aov_trend)) * 100}%`,
                                    background: `linear-gradient(to top, #4f46e5, #ec4899)`,
                                    minHeight: 4,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Section 4: Credits balance ── */}
            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <svg
                            className="w-4 h-4 text-indigo-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                        </svg>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            Your Credits Balance
                        </h3>
                        <button className="w-4.5 h-4.5 rounded-full border border-slate-200 flex items-center justify-center bg-white text-[10px] text-slate-400 font-bold shadow-sm">
                            i
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-1.5 text-xs font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-colors shadow-sm cursor-pointer">
                            <ArrowPathIcon className="w-3.5 h-3.5" />
                            Auto Refill Credits
                        </button>
                        <button
                            onClick={() => setShowRefill(true)}
                            className="flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl transition-all shadow-md hover:opacity-90 active:scale-95 cursor-pointer"
                            style={{
                                background:
                                    "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                            }}
                        >
                            <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            Refill Credits
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    {[
                        {
                            label: "SMS",
                            value: d.credits.sms,
                            icon: "💬",
                            bg: "bg-blue-50/30 border-blue-100/50",
                        },
                        {
                            label: "Email",
                            value: d.credits.email,
                            icon: "✉️",
                            bg: "bg-orange-50/30 border-orange-100/50",
                        },
                        {
                            label: "Whatsapp Utility",
                            value: d.credits.wa_utility,
                            icon: "💚",
                            bg: "bg-emerald-50/30 border-emerald-100/50",
                        },
                        {
                            label: "Whatsapp Marketing",
                            value: d.credits.wa_marketing,
                            icon: "💗",
                            bg: "bg-pink-50/30 border-pink-100/50",
                        },
                    ].map((c) => (
                        <div
                            key={c.label}
                            className={`bg-white border rounded-3xl p-5 shadow-sm ${c.bg}`}
                        >
                            <p className="text-2xl font-black text-slate-900 leading-none">
                                {c.value}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-base bg-white w-7 h-7 rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">{c.icon}</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                    {c.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Refill Credits Modal ── */}
            {showRefill && (
                <RefillCreditsModal
                    currentCredits={d.credits}
                    onClose={() => setShowRefill(false)}
                />
            )}

            {/* ── Section 5: "How is Cuben Retailer working for my business?" banner ── */}
            <div
                className="rounded-3xl overflow-hidden shadow-md border border-indigo-100"
                style={{
                    background:
                        "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                }}
            >
                <div className="flex flex-col xl:flex-row items-start xl:items-center gap-6 p-6">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-3 text-white text-base font-black">
                            📈
                        </div>
                        <h3 className="text-xl font-black text-white leading-tight max-w-[220px]">
                            How is{" "}
                            <span className="text-yellow-300">Cuben Retailer</span>{" "}
                            working
                            <br />
                            for my business?
                        </h3>
                    </div>
                    <div className="flex flex-1 gap-4 w-full">
                        {[
                            {
                                label: "Total Sales",
                                value: `₹${(d.cuben_retailer_impact.total_sales / 1e5).toFixed(0)}K`,
                            },
                            {
                                label: "Additional Purchases",
                                value: d.cuben_retailer_impact.additional_purchases.toLocaleString(
                                    "en-IN",
                                ),
                            },
                            {
                                label: "New Customers",
                                value: d.cuben_retailer_impact.new_customers.toLocaleString(
                                    "en-IN",
                                ),
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className="flex-1 bg-white/10 backdrop-blur-sm border border-white/5 rounded-2xl px-4 py-4"
                            >
                                <p className="text-2xl font-black text-white">
                                    {s.value}
                                </p>
                                <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-wider mt-1">
                                    {s.label}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="flex-shrink-0 opacity-25 hidden xl:block">
                        <svg
                            viewBox="0 0 80 60"
                            className="w-24 h-16"
                            fill="none"
                        >
                            <path
                                d="M5 50 Q20 20 40 30 Q60 40 75 10"
                                stroke="white"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                fill="none"
                            />
                            <path
                                d="M65 5 L75 10 L70 20"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* ── Section 6: Upcoming Celebrations + Profile Completion ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {/* Upcoming Celebrations */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            Upcoming Celebrations
                        </h3>
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer">
                            See all
                        </button>
                    </div>
                    {/* Tip banner */}
                    <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100/50 rounded-2xl px-4 py-3 mb-4 animate-pulse">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🎂</span>
                            <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                                People spend 25% more on their birthdays and
                                <br />
                                anniversaries!
                            </p>
                        </div>
                        <Link
                            to="/auto-campaigns"
                            className="flex-shrink-0 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-xl transition-colors ml-3 cursor-pointer shadow-sm"
                        >
                            Activate Offer
                        </Link>
                    </div>
                    {/* Empty state or list */}
                    {d.celebrations.length === 0 ? (
                        <div className="space-y-2.5">
                            <p className="text-xs text-slate-400 font-semibold mb-3">
                                You will see upcoming celebrations here
                            </p>
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-slate-50 animate-pulse" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-2.5 bg-slate-50 rounded-full animate-pulse w-3/4" />
                                        <div className="h-2 bg-slate-50 rounded-full animate-pulse w-1/2" />
                                    </div>
                                    <div className="h-2.5 bg-slate-50 rounded-full animate-pulse w-16" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {d.celebrations.map((c, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0 border border-indigo-100">
                                        {c.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 truncate">
                                            {c.name}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {c.event} · {c.date}
                                        </p>
                                    </div>
                                    <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex-shrink-0 cursor-pointer">
                                        Send
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Customer Profile Completion */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            Customer Profile Completion
                        </h3>
                        <button className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center bg-white text-[10px] text-slate-400 font-bold shadow-sm">
                            i
                        </button>
                    </div>

                    {/* Profile completeness fields */}
                    <div className="space-y-3.5 mb-4">
                        {[
                            {
                                label: "Name",
                                icon: "👤",
                                pct: d.profile_completion.name,
                            },
                            {
                                label: "Mobile",
                                icon: "📱",
                                pct: d.profile_completion.mobile,
                            },
                            {
                                label: "Email",
                                icon: "✉️",
                                pct: d.profile_completion.email,
                            },
                            {
                                label: "Birthday",
                                icon: "🎂",
                                pct: d.profile_completion.birthday,
                            },
                            {
                                label: "Anniversary",
                                icon: "💍",
                                pct: d.profile_completion.anniversary,
                            },
                        ].map((f) => (
                            <div
                                key={f.label}
                                className="flex items-center gap-3"
                            >
                                <span className="text-sm w-5">{f.icon}</span>
                                <span className="text-xs font-bold text-slate-500 w-16">
                                    {f.label}
                                </span>
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                                        style={{ width: `${f.pct}%` }}
                                    />
                                </div>
                                <span className="text-xs font-bold text-slate-500 w-8 text-right">
                                    {f.pct}%
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Summary pill */}
                    <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl px-4 py-3">
                        <p className="text-xs text-slate-700 font-semibold leading-normal">
                            🎉 <span className="font-extrabold text-indigo-600">
                                {d.profile_completion.overall}%
                            </span>{" "}
                            of customers have completed their profile details. Reach out to them to complete their profiles!
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Section 7: Programs Performance ── */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <svg
                        className="w-4 h-4 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                    </svg>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        See how your programs are performing
                    </h3>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <ProgramCard
                        icon="🏆"
                        title="Loyalty"
                        link="/loyalty"
                        bg="bg-amber-50"
                        stats={[
                            {
                                label: "No. of Redemptions",
                                value: d.programs.loyalty.redemptions.toLocaleString(
                                    "en-IN",
                                ),
                            },
                            {
                                label: "Redemption Rate",
                                value: `${d.programs.loyalty.rate}%`,
                            },
                            {
                                label: "Est. Revenue Gain",
                                value: `₹${(d.programs.loyalty.revenue / 1000).toFixed(0)}K`,
                            },
                        ]}
                    />
                    <ProgramCard
                        icon="📢"
                        title="Campaign"
                        link="/campaigns"
                        bg="bg-blue-50"
                        stats={[
                            {
                                label: "Total Sent",
                                value: d.programs.campaign.sent.toLocaleString(
                                    "en-IN",
                                ),
                            },
                            {
                                label: "Customer's Visited",
                                value: d.programs.campaign.visited.toLocaleString(
                                    "en-IN",
                                ),
                            },
                            {
                                label: "Approx. Revenue Gain",
                                value: `₹${(d.programs.campaign.revenue / 1000).toFixed(0)}K`,
                            },
                        ]}
                    />
                    <ProgramCard
                        icon="😊"
                        title="Feedback"
                        link="/feedback"
                        bg="bg-cyan-50"
                        stats={[
                            {
                                label: "Total Feedbacks",
                                value: d.programs.feedback.total.toLocaleString(
                                    "en-IN",
                                ),
                            },
                            {
                                label: "Average Rating",
                                value: `${d.programs.feedback.avg_rating}/10`,
                            },
                            {
                                label: "Negative Feedback",
                                value: `${d.programs.feedback.negative_pct}%`,
                            },
                        ]}
                    />
                    <ProgramCard
                        icon="⚡"
                        title="Auto-campaign"
                        link="/auto-campaigns"
                        bg="bg-purple-50"
                        stats={[
                            {
                                label: "Currently Active",
                                value: `${d.programs.auto_campaign.active} / 5`,
                            },
                            {
                                label: "Customers Visited",
                                value: d.programs.auto_campaign.visited.toLocaleString(
                                    "en-IN",
                                ),
                            },
                            {
                                label: "Approx. Revenue Gain",
                                value: `₹${(d.programs.auto_campaign.revenue / 1000).toFixed(0)}K`,
                            },
                        ]}
                    />
                    <ProgramCard
                        icon="⬛"
                        title="QR Codes"
                        link="/qr-code"
                        linkLabel="Create your first QR"
                        bg="bg-slate-50"
                        stats={[
                            {
                                label: "Active QR codes",
                                value: d.programs.qr.active.toLocaleString(
                                    "en-IN",
                                ),
                            },
                            {
                                label: "Customers Captured",
                                value: d.programs.qr.customers.toLocaleString(
                                    "en-IN",
                                ),
                            },
                            {
                                label: "Approx. Revenue",
                                value: `₹${(d.programs.qr.revenue / 1000).toFixed(0)}K`,
                            },
                        ]}
                    />
                    <ProgramCard
                        icon="🤝"
                        title="Referral"
                        link="/referrals"
                        bg="bg-pink-50"
                        stats={[
                            {
                                label: "Potential Customers",
                                value: d.programs.referral.potential.toLocaleString(
                                    "en-IN",
                                ),
                            },
                            {
                                label: "New Customers",
                                value: d.programs.referral.new_customers.toLocaleString(
                                    "en-IN",
                                ),
                            },
                            {
                                label: "Approx. Revenue",
                                value: `₹${(d.programs.referral.revenue / 1000).toFixed(0)}K`,
                            },
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}

// ─── Mock data ────────────────────────────────────────────────────────────────
function getMockData() {
    const weeklyChartData = (base, variance) =>
        Array.from({ length: 12 }, (_, i) => ({
            label: `W${i + 1}`,
            value: Math.max(
                0,
                base + Math.floor((Math.random() - 0.3) * variance),
            ),
        }));

    return {
        metrics: {
            total_revenue: 842884,
            total_orders: 1248,
            new_customers: 342,
            rewards_redeemed: 184,
        },
        weekly_chart: {
            "Total Sales": weeklyChartData(70000, 30000),
            "Total Orders": weeklyChartData(100, 60),
            "Total Customers": weeklyChartData(30, 20),
            "Rewards Redeemed": weeklyChartData(15, 12),
        },
        insights: {
            mobile_capture_pct: 64,
            mobile_capture_count: 182,
            fifth_visit_pct: 42,
            visit_rates: [100, 72, 58, 48, 42],
            aov: 2401,
            aov_trend: [
                2100, 2300, 2150, 2450, 2200, 2800, 2400, 2600, 2350, 2700,
                2500, 2401,
            ],
        },
        credits: {
            sms: 100,
            email: 100,
            wa_utility: 100,
            wa_marketing: 100,
        },
        cuben_retailer_impact: {
            total_sales: 842884,
            additional_purchases: 284,
            new_customers: 342,
        },
        celebrations: [],
        profile_completion: {
            name: 88,
            mobile: 100,
            email: 42,
            birthday: 28,
            anniversary: 12,
            overall: 0,
        },
        programs: {
            loyalty: { redemptions: 0, rate: 0, revenue: 0 },
            campaign: { sent: 0, visited: 0, revenue: 0 },
            feedback: { total: 0, avg_rating: 0, negative_pct: 0 },
            auto_campaign: { active: 0, visited: 0, revenue: 0 },
            qr: { active: 0, customers: 0, revenue: 0 },
            referral: { potential: 0, new_customers: 0, revenue: 0 },
        },
    };
}
