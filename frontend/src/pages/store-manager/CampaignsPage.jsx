import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
    MegaphoneIcon,
    PaperAirplaneIcon,
    CheckCircleIcon,
    DevicePhoneMobileIcon,
    ChatBubbleOvalLeftEllipsisIcon,
} from "@heroicons/react/24/outline";

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_CAMPAIGNS = [
    {
        id: "c1",
        name: "Monsoon Sale 2026",
        type: "WhatsApp",
        discount: "20% off on all items",
        target: "All Customers",
        status: "active",
        reach: 1240,
        description:
            "Celebrate the monsoon season with exclusive discounts across the entire catalog.",
    },
    {
        id: "c2",
        name: "Birthday Special Offer",
        type: "SMS",
        discount: "₹500 flat off",
        target: "Birthday Month Customers",
        status: "active",
        reach: 85,
        description:
            "Send personalised birthday greetings paired with an exclusive coupon code.",
    },
    {
        id: "c3",
        name: "Win-back Campaign",
        type: "WhatsApp",
        discount: "₹250 for returning",
        target: "Lapsed Customers (60+ days)",
        status: "active",
        reach: 320,
        description:
            "Re-engage customers who haven't visited in the last two months.",
    },
    {
        id: "c4",
        name: "Loyalty Milestone Reward",
        type: "WhatsApp",
        discount: "Bonus 500 points",
        target: "Gold & Platinum Members",
        status: "sent",
        reach: 412,
        sent: 412,
        sent_at: "2026-06-20",
        open_rate: 78,
        conversions: 134,
        description:
            "Celebrate loyalty milestones by rewarding your best customers.",
    },
    {
        id: "c5",
        name: "Summer Flash Sale",
        type: "SMS",
        discount: "15% off site-wide",
        target: "All Customers",
        status: "sent",
        reach: 890,
        sent: 890,
        sent_at: "2026-06-15",
        open_rate: 62,
        conversions: 201,
        description:
            "A time-limited flash sale for the hottest week of summer.",
    },
];

const MOCK_STATS = {
    campaigns_sent: 8,
    total_reach: 3420,
    avg_open_rate: 71,
    conversions: 564,
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const TYPE_BADGE = {
    WhatsApp: "bg-green-50 text-green-700 border border-green-200",
    SMS: "bg-blue-50  text-blue-700  border border-blue-200",
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

function CampaignCard({ campaign, onSend, sending }) {
    const isActive = campaign.status === "active";
    return (
        <div className="glass-card p-5 flex flex-col gap-3 h-full">
            {/* Title row */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-bold text-slate-800 truncate">
                            {campaign.name}
                        </h3>
                        <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${TYPE_BADGE[campaign.type] || "bg-slate-100 text-slate-600"}`}
                        >
                            {campaign.type === "WhatsApp" ? (
                                <>
                                    <ChatBubbleOvalLeftEllipsisIcon className="inline w-3 h-3 mr-0.5 -mt-0.5" />{" "}
                                    WhatsApp
                                </>
                            ) : (
                                <>
                                    <DevicePhoneMobileIcon className="inline w-3 h-3 mr-0.5 -mt-0.5" />{" "}
                                    SMS
                                </>
                            )}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        {campaign.description}
                    </p>
                </div>
                {isActive ? (
                    <span className="badge-success flex-shrink-0">Active</span>
                ) : (
                    <span className="badge-info flex-shrink-0">Sent</span>
                )}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                    <p className="text-slate-400 font-medium mb-0.5">
                        Discount
                    </p>
                    <p className="text-slate-800 font-bold">
                        {campaign.discount}
                    </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                    <p className="text-slate-400 font-medium mb-0.5">Target</p>
                    <p className="text-slate-800 font-bold">
                        {campaign.target}
                    </p>
                </div>
                {!isActive && (
                    <>
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                            <p className="text-slate-400 font-medium mb-0.5">
                                Customers Reached
                            </p>
                            <p className="text-slate-800 font-bold">
                                {campaign.sent?.toLocaleString("en-IN")}
                            </p>
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-100">
                            <p className="text-slate-400 font-medium mb-0.5">
                                Open Rate
                            </p>
                            <p className="text-emerald-700 font-bold">
                                {campaign.open_rate}%
                            </p>
                        </div>
                    </>
                )}
                {isActive && (
                    <div className="col-span-2 bg-sky-50 rounded-xl p-2.5 border border-sky-100">
                        <p className="text-slate-400 font-medium mb-0.5">
                            Estimated Reach
                        </p>
                        <p className="text-sky-700 font-bold">
                            {campaign.reach?.toLocaleString("en-IN")} customers
                        </p>
                    </div>
                )}
            </div>

            {/* Action */}
            <div className="mt-auto">
                {isActive ? (
                    <button
                        onClick={() => onSend(campaign.id)}
                        disabled={sending}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95 disabled:opacity-70"
                        style={{
                            background:
                                "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
                        }}
                    >
                        {sending ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <PaperAirplaneIcon className="w-4 h-4" />
                        )}
                        {sending ? "Sending…" : "Send to My Customers"}
                    </button>
                ) : (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>
                            Sent {campaign.sent_at} · {campaign.conversions}{" "}
                            conversions
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CampaignsPage() {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [stats, setStats] = useState(MOCK_STATS);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("active");
    const [sendingIds, setSendingIds] = useState(new Set());

    useEffect(() => {
        api.get("/campaigns")
            .then((r) => {
                setCampaigns(r.data.campaigns || r.data || []);
                if (r.data.stats) setStats(r.data.stats);
            })
            .catch(() => setCampaigns(MOCK_CAMPAIGNS))
            .finally(() => setLoading(false));
    }, []);

    const handleSend = async (campaignId) => {
        setSendingIds((s) => new Set([...s, campaignId]));
        try {
            await api.post(`/campaigns/${campaignId}/send`, {
                store_id: user?.store_id,
            });
            toast.success("Campaign sent to your customers!");
            setCampaigns((prev) =>
                prev.map((c) =>
                    c.id === campaignId
                        ? {
                              ...c,
                              status: "sent",
                              sent_at: new Date().toISOString().split("T")[0],
                              sent: c.reach,
                              open_rate: 0,
                              conversions: 0,
                          }
                        : c,
                ),
            );
        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                    "Could not send campaign. Try again.",
            );
        } finally {
            setSendingIds((s) => {
                const ns = new Set(s);
                ns.delete(campaignId);
                return ns;
            });
        }
    };

    const activeCampaigns = campaigns.filter((c) => c.status === "active");
    const sentCampaigns = campaigns.filter((c) => c.status === "sent");
    const displayed = activeTab === "active" ? activeCampaigns : sentCampaigns;

    if (loading) {
        return (
            <div className="space-y-5 animate-slide-up">
                <div className="page-header">
                    <div className="space-y-2">
                        <div className="skeleton h-8 w-44 rounded-xl" />
                        <div className="skeleton h-4 w-64 rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton h-24 rounded-2xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="skeleton h-52 rounded-2xl" />
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
                    <h1 className="page-title">Campaigns</h1>
                    <p className="page-subtitle">
                        Send promotional campaigns to your store's customer base
                    </p>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    label="Campaigns Sent"
                    value={stats.campaigns_sent}
                    sub="This month"
                    cardClass="sm-card-sky"
                />
                <StatCard
                    label="Total Reach"
                    value={stats.total_reach.toLocaleString("en-IN")}
                    sub="Customers contacted"
                    cardClass="sm-card-mint"
                />
                <StatCard
                    label="Avg Open Rate"
                    value={`${stats.avg_open_rate}%`}
                    sub="Across campaigns"
                    cardClass="sm-card-amber"
                />
                <StatCard
                    label="Conversions"
                    value={stats.conversions.toLocaleString("en-IN")}
                    sub="Purchases attributed"
                    cardClass="sm-card-coral"
                />
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                {[
                    {
                        key: "active",
                        label: `Active Campaigns (${activeCampaigns.length})`,
                    },
                    {
                        key: "sent",
                        label: `Sent Campaigns (${sentCampaigns.length})`,
                    },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            activeTab === tab.key
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Campaign Grid ── */}
            {displayed.length === 0 ? (
                <div className="glass-card py-16 text-center">
                    <MegaphoneIcon className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm text-slate-400">
                        {activeTab === "active"
                            ? "No active campaigns available right now"
                            : "No campaigns have been sent yet"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {displayed.map((campaign) => (
                        <CampaignCard
                            key={campaign.id}
                            campaign={campaign}
                            onSend={handleSend}
                            sending={sendingIds.has(campaign.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
