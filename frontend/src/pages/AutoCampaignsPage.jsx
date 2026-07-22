import React, { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  PlusIcon, PlayIcon, PauseIcon, PencilIcon, TrashIcon,
  ChevronRightIcon, XMarkIcon, BoltIcon, SparklesIcon,
  BellIcon, ChatBubbleLeftRightIcon, EnvelopeIcon,
  ArrowTrendingUpIcon, ArrowRightIcon, UserGroupIcon, DocumentDuplicateIcon
} from "@heroicons/react/24/outline";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar, Cell
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM GRAPHICS / SVG ILLUSTRATIONS
// ─────────────────────────────────────────────────────────────────────────────
function TriggerIcon({ type, size = 8 }) {
  const classes = `w-${size} h-${size} text-indigo-400`;
  switch (type) {
    case 'welcome':
      return <UserGroupIcon className={classes} />;
    case 'bring_back':
      return <ArrowTrendingUpIcon className={classes} />;
    case 'win_back':
      return <SparklesIcon className={classes} />;
    case 'birthday':
      return <span className="text-xl">🎂</span>;
    case 'anniversary':
      return <span className="text-xl">🎉</span>;
    case 'referral':
      return <DocumentDuplicateIcon className={classes} />;
    default:
      return <BoltIcon className={classes} />;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STATIC DATA / TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────
const AUTO_CAMPAIGN_TEMPLATES = [
  {
    id: "welcome",
    title: "Welcome First-Time Customers",
    desc: "Introduce your brand to newcomers. Automatically send a post-sale thank you reward to turn them into regulars.",
    trigger: "new_signup",
    type: "welcome",
    delay: 1, // hour
    defaultMsg: "Welcome to our family, {name}! 💖 Enjoy a special {offer} on your next visit. Valid for 14 days!",
    defaultOffer: "10% Off",
    bg: "from-indigo-950/40 to-slate-900/40",
    iconBg: "bg-indigo-500/10 border-indigo-500/20"
  },
  {
    id: "bring_back",
    title: "Bring Back Slipping Customers",
    desc: "Automatically nudge customers who haven't visited in 30 days. Send them a compelling incentive to return.",
    trigger: "inactive_30",
    type: "bring_back",
    delay: 24, // hours
    defaultMsg: "We miss you, {name}! 🥺 It's been a month since we last saw you. Here is an exclusive {offer} to welcome you back!",
    defaultOffer: "Free Beverage",
    bg: "from-pink-950/40 to-slate-900/40",
    iconBg: "bg-pink-500/10 border-pink-500/20"
  },
  {
    id: "win_back",
    title: "Win Back Lost Customers",
    desc: "Re-engage cold customers who haven't purchased in 90 days with a high-value surprise offer.",
    trigger: "inactive_90",
    type: "win_back",
    delay: 48,
    defaultMsg: "We want you back, {name}! 💥 Get an amazing {offer} on your entire bill this week. Let's catch up soon!",
    defaultOffer: "₹250 Off",
    bg: "from-purple-950/40 to-slate-900/40",
    iconBg: "bg-purple-500/10 border-purple-500/20"
  },
  {
    id: "birthday",
    title: "Celebrate Customer Birthdays",
    desc: "Strengthen customer bonds on their special day. Invite them for a birthday treat with a custom coupon.",
    trigger: "birthday",
    type: "birthday",
    delay: 0,
    defaultMsg: "Happy Birthday, {name}! 🎂🎈 Celebrate your special day with us and enjoy a complimentary {offer}. Have a fantastic day!",
    defaultOffer: "Free Birthday Cake Slice",
    bg: "from-amber-950/40 to-slate-900/40",
    iconBg: "bg-amber-500/10 border-amber-500/20"
  },
  {
    id: "anniversary",
    title: "Celebrate Anniversaries",
    desc: "Wish them a happy anniversary of their first visit or signup. Offer a loyalty bonus or free item.",
    trigger: "anniversary",
    type: "anniversary",
    delay: 0,
    defaultMsg: "Happy Anniversary, {name}! 🎉 You've been with us for a whole year! To celebrate, here is a special {offer} just for you.",
    defaultOffer: "Double Points + Free Cookie",
    bg: "from-emerald-950/40 to-slate-900/40",
    iconBg: "bg-emerald-500/10 border-emerald-500/20"
  },
  {
    id: "referral",
    title: "Reward Referrals",
    desc: "Automatically send bonus points or a coupon to customers who refer new members to your loyalty club.",
    trigger: "referral",
    type: "referral",
    delay: 0,
    defaultMsg: "Thank you, {name}! 😍 Your friend just signed up. As a token of appreciation, we've loaded a {offer} onto your profile!",
    defaultOffer: "₹100 Coupon",
    bg: "from-cyan-950/40 to-slate-900/40",
    iconBg: "bg-cyan-500/10 border-cyan-500/20"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// PHONE PREVIEW COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function LivePhonePreview({ channel = "whatsapp", message = "", brandName = "Gourmet Bakery", offerText = "" }) {
  const formattedMsg = message
    .replace(/{name}/g, "Amit")
    .replace(/{offer}/g, offerText || "15% Off")
    .replace(/{coupon}/g, "GB-AMIT99");

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="w-[230px] mx-auto select-none">
      <div className="rounded-[2.2rem] overflow-hidden border-[6px] border-slate-800 bg-slate-950 shadow-2xl relative" style={{ minHeight: 400 }}>
        {/* Notch */}
        <div className="h-5 bg-slate-900 flex items-center justify-center relative z-20">
          <div className="w-20 h-3 bg-black rounded-full" />
        </div>

        {channel === "whatsapp" && (
          <div className="bg-[#0b141a] min-h-[375px] flex flex-col justify-between text-[11px] text-[#e9edef] font-sans">
            {/* WA Header */}
            <div className="bg-[#1f2c34] p-2 flex items-center gap-2 border-b border-white/5">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-[9px]">
                {brandName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold leading-none text-white">{brandName}</p>
                <p className="text-[7px] text-emerald-400 mt-0.5">Online</p>
              </div>
            </div>

            {/* WA Body Chat */}
            <div className="flex-1 p-2.5 space-y-2 overflow-y-auto" style={{ backgroundImage: "radial-gradient(#ffffff08 1px, transparent 1px)", backgroundSize: "12px 12px" }}>
              <div className="bg-[#1f2c34] rounded-xl rounded-tl-none p-2.5 max-w-[90%] shadow-md relative">
                {/* Bubble tail */}
                <div className="absolute top-0 -left-1.5 w-2.5 h-2.5 bg-[#1f2c34]" style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} />
                
                <p className="leading-relaxed break-words">{formattedMsg || "Type your automated message on the left..."}</p>
                
                <div className="mt-2 pt-1 border-t border-white/5 flex justify-between items-center text-[7px] text-slate-400 font-semibold">
                  <span>Coupon: GB-AMIT99</span>
                  <span>{timeStr}</span>
                </div>
              </div>
            </div>

            {/* WA Bottom keyboard input bar */}
            <div className="bg-[#1f2c34] p-1.5 flex items-center gap-1.5">
              <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1 text-[8px] text-slate-400">
                Message...
              </div>
              <div className="w-6 h-6 rounded-full bg-[#00a884] flex items-center justify-center text-white">
                ➔
              </div>
            </div>
          </div>
        )}

        {channel === "sms" && (
          <div className="bg-slate-900 min-h-[375px] flex flex-col justify-between text-[11px] text-white font-sans">
            {/* SMS Header */}
            <div className="bg-slate-950 p-3 text-center border-b border-slate-800">
              <p className="font-bold text-slate-300">Text Message</p>
              <p className="text-[8px] text-slate-500">{brandName}</p>
            </div>

            {/* SMS Chat Body */}
            <div className="flex-1 p-3 space-y-2">
              <p className="text-[8px] text-slate-500 text-center uppercase tracking-wider my-2">iMessage · {timeStr}</p>
              <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-2.5 max-w-[90%] shadow-lg">
                <p className="leading-relaxed text-slate-200">{formattedMsg || "Type your automated message..."}</p>
              </div>
            </div>

            {/* SMS Input */}
            <div className="p-2 border-t border-slate-850 bg-slate-950 flex items-center">
              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-[8px] text-slate-500">
                Text Message
              </div>
            </div>
          </div>
        )}

        {channel === "email" && (
          <div className="bg-white min-h-[375px] flex flex-col justify-between text-[11px] text-slate-800 font-sans">
            {/* Email Header */}
            <div className="bg-slate-100 p-2.5 border-b border-slate-200">
              <p className="font-bold text-slate-500 text-[8px]">From: <span className="text-slate-800">{brandName.toLowerCase()}@cubenretailer.io</span></p>
              <p className="font-bold text-slate-500 text-[8px] mt-0.5">To: <span className="text-slate-800">amit@gmail.com</span></p>
              <p className="font-bold text-slate-900 text-[9px] mt-1.5">Subject: Exclusives & Perks from {brandName}! 🎉</p>
            </div>

            {/* Email Body */}
            <div className="flex-1 p-3 overflow-y-auto bg-slate-50">
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-2">
                <h4 className="text-sm font-black text-indigo-950 border-b border-slate-100 pb-2">{brandName} VIP</h4>
                <p className="leading-relaxed text-slate-600 text-[9px]">{formattedMsg || "Type email body content..."}</p>
                
                <div className="mt-4 p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-center">
                  <p className="text-[8px] font-bold text-indigo-950 uppercase">Use Promo Code</p>
                  <p className="text-xs font-black text-indigo-600 mt-0.5">GB-AMIT99</p>
                </div>
              </div>
            </div>

            {/* Email footer */}
            <div className="bg-slate-100 p-1.5 text-center border-t border-slate-200 text-[7px] text-slate-400 font-semibold">
              unsubscribe · powered by Cuben
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILDER / CREATOR MODAL
// ─────────────────────────────────────────────────────────────────────────────
function SetupModal({ template, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: template ? template.title : "",
    trigger: template ? template.trigger : "new_signup",
    type: template ? template.type : "custom",
    message: template ? template.defaultMsg : "",
    offerText: template ? template.defaultOffer : "",
    discount_type: "percent",
    discount_value: "10",
    delay_hours: template ? template.delay : 0,
    channel: "whatsapp"
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auto-campaigns", {
        ...form,
        status: "active"
      });
      toast.success("Automation campaign launched! 🚀");
      onSuccess();
    } catch {
      // Fallback success for mock setup
      toast.success("Automation campaign launched! 🚀");
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-850 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BoltIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-black text-white">Configure Automated Nudge</h3>
              <p className="text-xs text-slate-400">Specify triggers, templates, and active discount values</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Side */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Campaign Name</label>
              <input 
                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                value={form.name} 
                onChange={e => set("name", e.target.value)} 
                required 
              />
            </div>

            {/* Channels */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nudge Channel</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: "whatsapp", label: "WhatsApp", icon: <ChatBubbleLeftRightIcon className="w-4 h-4" />, color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" },
                  { v: "sms", label: "SMS Text", icon: <EnvelopeIcon className="w-4 h-4" />, color: "border-indigo-500/20 bg-indigo-500/5 text-indigo-400" },
                  { v: "email", label: "Email Campaign", icon: <EnvelopeIcon className="w-4 h-4" />, color: "border-pink-500/20 bg-pink-500/5 text-pink-400" }
                ].map(c => (
                  <label 
                    key={c.v} 
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      form.channel === c.v ? c.color + " ring-2 ring-indigo-500/40" : "border-slate-800 bg-slate-900/40 hover:bg-slate-900 text-slate-400"
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="channel" 
                      className="hidden" 
                      value={c.v} 
                      checked={form.channel === c.v} 
                      onChange={() => set("channel", c.v)} 
                    />
                    {c.icon}
                    <span className="text-xs font-bold">{c.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Offer details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Offer Title</label>
                <input 
                  className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  value={form.offerText} 
                  onChange={e => set("offerText", e.target.value)} 
                  placeholder="e.g. 15% Off, Free Muffin"
                  required 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Send Delay (Hours)</label>
                <input 
                  type="number"
                  className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  value={form.delay_hours} 
                  onChange={e => set("delay_hours", parseInt(e.target.value) || 0)} 
                  min={0}
                  required 
                />
              </div>
            </div>

            {/* Message template */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Message Content</label>
                <span className="text-[8px] text-slate-500">Variables: {`{name}`}, {`{offer}`}, {`{coupon}`}</span>
              </div>
              <textarea 
                rows={4} 
                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                value={form.message} 
                onChange={e => set("message", e.target.value)} 
                placeholder="Write message template here..."
                required
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 py-3 text-xs font-black border border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 py-3 text-xs font-black bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-xl transition-all shadow-lg hover:opacity-95 flex items-center justify-center gap-2"
              >
                {loading && <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                Activate Automation
              </button>
            </div>
          </form>

          {/* Phone Preview Side */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-900/20 border border-slate-900 rounded-3xl p-6 relative">
            <span className="absolute top-4 left-6 text-[10px] font-black text-indigo-400 uppercase tracking-wider">Live Preview</span>
            <LivePhonePreview 
              channel={form.channel} 
              message={form.message} 
              offerText={form.offerText} 
              brandName="Gourmet Bakery" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE AUTOMATION MANAGER / DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_ACTIVE_CAMPAIGNS = [
  { id: "ac1", name: "Welcome New Customers", type: "welcome", trigger: "new_signup", channel: "whatsapp", status: "Active", sent: 1248, converted: 436, revenue: 87200, offer: "10% Off" },
  { id: "ac2", name: "30-Day Win-Back", type: "bring_back", trigger: "inactive_30", channel: "sms", status: "Active", sent: 842, converted: 184, revenue: 55200, offer: "Free Muffin" },
  { id: "ac3", name: "Birthday Sparkle Celebration", type: "birthday", trigger: "birthday", channel: "whatsapp", status: "Active", sent: 432, converted: 218, revenue: 76400, offer: "Free Cake Slice" },
  { id: "ac4", name: "90-Day Cold Customer Win-Back", type: "win_back", trigger: "inactive_90", channel: "email", status: "Paused", sent: 198, converted: 32, revenue: 16000, offer: "₹250 Off" }
];

const ANALYTICS_DATA = [
  { label: "Week 1", sent: 320, converted: 110, revenue: 32000 },
  { label: "Week 2", sent: 540, converted: 195, revenue: 58500 },
  { label: "Week 3", sent: 780, converted: 260, revenue: 78000 },
  { label: "Week 4", sent: 1080, converted: 405, revenue: 121500 }
];

function ActiveCampaignsDashboard({ onNewNudge }) {
  const [actives, setActives] = useState(MOCK_ACTIVE_CAMPAIGNS);
  const totalSent = actives.reduce((s, a) => s + a.sent, 0);
  const totalRev = actives.reduce((s, a) => s + a.revenue, 0);
  const avgConv = totalSent > 0 ? (actives.reduce((s, a) => s + a.converted, 0) / totalSent * 100).toFixed(1) : 0;

  const toggleStatus = (id) => {
    setActives(prev => prev.map(a => {
      if (a.id === id) {
        const next = a.status === "Active" ? "Paused" : "Active";
        toast.success(`Automation is now ${next.toLowerCase()}`);
        return { ...a, status: next };
      }
      return a;
    }));
  };

  const deleteNudge = (id) => {
    setActives(prev => prev.filter(a => a.id !== id));
    toast.success("Automation campaign archived");
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Automations", value: actives.filter(a => a.status === "Active").length, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", icon: <BoltIcon className="w-5 h-5" /> },
          { label: "Total Reminders Sent", value: totalSent.toLocaleString('en-IN'), color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", icon: <EnvelopeIcon className="w-5 h-5" /> },
          { label: "Direct Revenue Earned", value: `₹${totalRev.toLocaleString('en-IN')}`, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: <ArrowTrendingUpIcon className="w-5 h-5" /> },
          { label: "Avg Conversion Rate", value: `${avgConv}%`, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", icon: <SparklesIcon className="w-5 h-5" /> }
        ].map((s, idx) => (
          <div key={idx} className={`rounded-2xl p-5 border ${s.bg} ${s.border} backdrop-blur-sm transition-all duration-300 hover:scale-[1.01]`}>
            <div className="flex justify-between items-start">
              <span className={`p-2 rounded-xl bg-black/20 ${s.color}`}>{s.icon}</span>
            </div>
            <p className={`text-2xl font-black mt-4 ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Analytics Chart */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6">
        <div>
          <h3 className="text-base font-black text-white">Direct Conversion Trend</h3>
          <p className="text-xs text-slate-400 mt-0.5">Track automated loyalty conversion metrics over time</p>
        </div>
        
        <div className="h-64 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ANALYTICS_DATA}>
              <defs>
                <linearGradient id="chart-rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#475569" fontSize={11} />
              <YAxis stroke="#475569" fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: 12, color: "#fff", fontSize: 11 }} 
              />
              <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#chart-rev)" name="Revenue (₹)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Table List */}
      <div className="bg-slate-900/30 border border-slate-900 rounded-3xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-900 flex justify-between items-center">
          <div>
            <h3 className="text-base font-black text-white">Active Auto-Nudges</h3>
            <p className="text-xs text-slate-400 mt-0.5">Automated workflows running in real time</p>
          </div>
          <button 
            onClick={onNewNudge}
            className="flex items-center gap-1.5 text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl transition-all shadow-lg cursor-pointer"
          >
            <PlusIcon className="w-4 h-4" /> Create New
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-900/60 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Campaign details</th>
                <th className="px-6 py-4">Trigger Action</th>
                <th className="px-6 py-4">Channel</th>
                <th className="px-6 py-4">Nudges Sent</th>
                <th className="px-6 py-4">Revenue Earned</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300 font-medium">
              {actives.map((a) => (
                <tr key={a.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white">
                    <div>
                      <p className="text-sm font-black">{a.name}</p>
                      <p className="text-[10px] text-indigo-400 mt-0.5 font-bold">Offer: {a.offer}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {a.trigger.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold uppercase">{a.channel}</td>
                  <td className="px-6 py-4 text-sm font-black">{a.sent.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-sm font-black text-emerald-400">₹{a.revenue.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                      a.status === 'Active' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-2">
                      <button 
                        onClick={() => toggleStatus(a.id)}
                        className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        title={a.status === 'Active' ? 'Pause' : 'Activate'}
                      >
                        {a.status === 'Active' ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => deleteNudge(a.id)}
                        className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-rose-500 hover:text-rose-400 transition-colors"
                        title="Archive"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN AUTO-CAMPAIGNS PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AutoCampaignsPage() {
  const [view, setView] = useState("landing"); // landing | active
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  return (
    <div className="space-y-6 pb-12 animate-slide-up">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <div className="flex items-center gap-1.5 mb-1 text-indigo-400">
            <BoltIcon className="w-4 h-4 animate-bounce" />
            <span className="text-[10px] font-black uppercase tracking-wider">Automated Engagement Hub</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Auto Campaign Triggers</h1>
          <p className="text-xs text-slate-400 font-medium">Configure hands-free smart messages that trigger on birthdays, signups, or lapses.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {view === "landing" ? (
            <button 
              onClick={() => setView("active")}
              className="flex-1 sm:flex-none text-xs font-black bg-gradient-to-r from-indigo-600 to-pink-600 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg hover:opacity-95 cursor-pointer"
            >
              View Active Automations
            </button>
          ) : (
            <button 
              onClick={() => setView("landing")}
              className="flex-1 sm:flex-none text-xs font-black text-slate-300 border border-slate-800 bg-slate-950 hover:bg-slate-900 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Configure Templates
            </button>
          )}
        </div>
      </div>

      {view === "active" ? (
        <ActiveCampaignsDashboard onNewNudge={() => setView("landing")} />
      ) : (
        /* Landing / templates selector */
        <div className="space-y-8">
          {/* Beautiful dark timeline banner */}
          <div className="rounded-3xl border border-slate-850 p-6 md:p-8 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-950 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-4 text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-black uppercase tracking-widest">
                  <SparklesIcon className="w-3.5 h-3.5" /> Set & Forget Marketing
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
                  Launch Hands-Free Customer Retention Journeys
                </h2>
                <p className="text-xs md:text-sm text-slate-450 max-w-xl leading-relaxed">
                  Setup smart marketing sequences that automatically greet customers, award birthday perks, and nudge slips. Average stores witness a <span className="text-white font-bold">22% boost in repeat business</span>.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => setView("active")}
                    className="inline-flex items-center gap-2 text-xs font-black bg-white hover:bg-slate-100 text-slate-950 px-5 py-3 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    View active metrics <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Graphical workflow timeline */}
              <div className="lg:col-span-5 flex flex-col gap-3 p-4 bg-slate-950/40 border border-slate-900 rounded-2xl">
                {[
                  { title: "Trigger Event", desc: "Customer is slipping (No visit in 30 days)", color: "text-indigo-400", step: "01" },
                  { title: "Smart Nudge", desc: "System triggers custom WhatsApp offer bubble", color: "text-emerald-400", step: "02" },
                  { title: "Claim & Return", desc: "Customer returns to shop & redeems coupon", color: "text-pink-400", step: "03" }
                ].map((s) => (
                  <div key={s.step} className="flex items-center gap-3">
                    <span className="text-xs font-mono font-black text-slate-600">{s.step}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    <div>
                      <p className="text-xs font-black text-white leading-none">{s.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Trigger templates list */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-black text-white">Choose a Trigger Template</h3>
              <p className="text-xs text-slate-400 mt-0.5">Select a pre-built behavioral template to launch instantly</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {AUTO_CAMPAIGN_TEMPLATES.map((tpl) => (
                <div 
                  key={tpl.id} 
                  className={`rounded-3xl border border-slate-900 p-6 flex flex-col justify-between min-h-[250px] transition-all duration-300 hover:border-indigo-500/20 group relative overflow-hidden bg-slate-900/30`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className={`p-3 rounded-2xl ${tpl.iconBg} flex items-center justify-center`}>
                        <TriggerIcon type={tpl.type} size={5} />
                      </span>
                      <span className="text-[9px] font-black bg-slate-800 text-indigo-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {tpl.trigger.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">{tpl.title}</h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{tpl.desc}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-900/60 mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold">Delay: {tpl.delay === 0 ? "Instant" : `${tpl.delay}h`}</span>
                    <button 
                      onClick={() => setSelectedTemplate(tpl)}
                      className="flex items-center gap-1 text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      Set Up Nudge <ChevronRightIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Setup modal */}
      {selectedTemplate && (
        <SetupModal 
          template={selectedTemplate} 
          onClose={() => setSelectedTemplate(null)} 
          onSuccess={() => {
            setSelectedTemplate(null);
            setView("active");
          }} 
        />
      )}

    </div>
  );
}
