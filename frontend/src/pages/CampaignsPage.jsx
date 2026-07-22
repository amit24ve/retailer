import React, { useState, useRef } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  PlusIcon, MagnifyingGlassIcon, FunnelIcon, ChevronDownIcon,
  EllipsisHorizontalIcon, PencilIcon, TrashIcon, PaperAirplaneIcon,
  ChartBarIcon, ArrowRightIcon, SparklesIcon, QuestionMarkCircleIcon,
  ArrowTrendingUpIcon, UserGroupIcon, CurrencyRupeeIcon, EyeIcon,
  XMarkIcon, BoltIcon, EnvelopeIcon, ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar, Cell
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
const DISCOUNT_FILTERS = [
  { id: "all", label: "All Offers" },
  { id: "no-discount", label: "Informational", icon: "⊖" },
  { id: "free-item", label: "Free Gifts", icon: "🎁" },
  { id: "flat", label: "₹ Cash Off", icon: "₹" },
  { id: "percent", label: "% Discount", icon: "%" },
];

const TEMPLATE_COLLECTIONS = [
  {
    id: "drafts",
    label: "Drafts & Custom Campaigns",
    templates: [
      {
        id: "d1",
        title: "Weekend Flash Sale Nudge",
        status: "Draft",
        discount: "percent",
        whatsapp: true,
        image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80",
      },
      {
        id: "d2",
        title: "VIP Reward Invite",
        status: "Draft",
        discount: "free-item",
        whatsapp: true,
        image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400&q=80",
      },
    ],
  },
  {
    id: "donut-day",
    label: "National Donut Day Special 🍩",
    templates: [
      {
        id: "t1",
        title: "Sweet Savings, Fresh Glaze Deals",
        discount: "flat",
        whatsapp: true,
        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80",
      },
      {
        id: "t2",
        title: "A Sweet Donut Treat on Us",
        discount: "free-item",
        whatsapp: true,
        image: "https://images.unsplash.com/photo-1556913396-7a3c459ef68e?w=400&q=80",
      },
      {
        id: "t3",
        title: "Sprinkles, Smiles & Special Dough",
        discount: "no-discount",
        whatsapp: true,
        image: "https://images.unsplash.com/photo-1625228333786-5a94a5528c91?w=400&q=80",
      },
    ],
  },
  {
    id: "summer",
    label: "Summer Heatwave Sale ☀️",
    templates: [
      {
        id: "s1",
        title: "Beat the Heat: Refreshing 15% Off",
        discount: "percent",
        whatsapp: true,
        image: "https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?w=400&q=80",
      },
      {
        id: "s2",
        title: "Free Cooling Drink with Every Order",
        discount: "free-item",
        whatsapp: true,
        image: "https://images.unsplash.com/photo-1494145904049-0dca59b4bbad?w=400&q=80",
      },
    ],
  },
];

const MOCK_PERFORMANCE = [
  { id: "p1", name: "Weekend Flash Sale", status: "sent", channel: "whatsapp", sent: 4820, delivered: 4640, read: 3241, clicked: 1820, converted: 782, revenue: 124800, date: "7 Jun 2026" },
  { id: "p2", name: "VIP Customer Perks", status: "sent", channel: "whatsapp", sent: 1240, delivered: 1210, read: 1180, clicked: 840, converted: 420, revenue: 58200, date: "5 Jun 2026" },
  { id: "p3", name: "Post-Visit Review Nudge", status: "sent", channel: "whatsapp", sent: 8440, delivered: 8200, read: 6200, clicked: 3840, converted: 2100, revenue: 0, date: "3 Jun 2026" },
  { id: "p4", name: "Summer Launch Discount", status: "paused", channel: "whatsapp", sent: 321, delivered: 310, read: 298, clicked: 220, converted: 180, revenue: 24600, date: "1 Jun 2026" },
  { id: "p5", name: "National Donut Day Blast", status: "draft", channel: "whatsapp", sent: 0, delivered: 0, read: 0, clicked: 0, converted: 0, revenue: 0, date: "—" },
];

const PERF_CHART_DATA = [
  { label: "Week 1", sent: 2100, converted: 340 },
  { label: "Week 2", sent: 3400, converted: 520 },
  { label: "Week 3", sent: 2800, converted: 410 },
  { label: "Week 4", sent: 4820, converted: 782 },
];

const STATUS_STYLE = {
  sent: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  paused: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  draft: "bg-slate-800 border-slate-700 text-slate-400",
  active: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function DiscountCircle({ type }) {
  const map = {
    flat: "₹",
    percent: "%",
    "free-item": "🎁",
    "no-discount": "⊖"
  };
  return (
    <div className="w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-lg text-xs font-black ring-2 ring-white/20">
      {map[type] || "⊖"}
    </div>
  );
}

function LivePhonePreview({ channel = "whatsapp", message = "", offerText = "", brandName = "Gourmet Bakery" }) {
  const formattedMsg = message
    .replace(/{name}/g, "Amit")
    .replace(/{offer}/g, offerText || "15% Off")
    .replace(/{coupon}/g, "CAMP-VIP99");
  
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="w-[220px] mx-auto select-none">
      <div className="rounded-[2rem] overflow-hidden border-[6px] border-slate-800 bg-slate-950 shadow-2xl relative" style={{ minHeight: 380 }}>
        {/* Notch */}
        <div className="h-5 bg-slate-950 flex items-center justify-center relative z-20">
          <div className="w-18 h-3 bg-black rounded-full" />
        </div>

        {channel === "whatsapp" && (
          <div className="bg-[#0b141a] min-h-[355px] flex flex-col justify-between text-[10px] text-[#e9edef] font-sans">
            <div className="bg-[#1f2c34] p-2.5 flex items-center gap-2 border-b border-white/5">
              <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-[8px]">
                {brandName.charAt(0)}
              </div>
              <p className="font-bold text-white leading-none">{brandName}</p>
            </div>

            <div className="flex-1 p-3 space-y-2 overflow-y-auto" style={{ backgroundImage: "radial-gradient(#ffffff05 1px, transparent 1px)", backgroundSize: "10px 10px" }}>
              <div className="bg-[#1f2c34] rounded-xl rounded-tl-none p-2.5 max-w-[90%] shadow-md relative">
                <div className="absolute top-0 -left-1.5 w-2 h-2 bg-[#1f2c34]" style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} />
                <p className="leading-relaxed break-words">{formattedMsg || "Hello! Setup your campaign content..."}</p>
                <div className="mt-2 text-[6px] text-slate-400 text-right">{timeStr}</div>
              </div>
            </div>

            <div className="bg-[#1f2c34] p-1.5 flex items-center gap-1.5">
              <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1 text-[8px] text-slate-500">Message...</div>
            </div>
          </div>
        )}

        {channel === "sms" && (
          <div className="bg-slate-950 min-h-[355px] flex flex-col justify-between text-[10px] text-white font-sans p-3">
            <div className="text-center border-b border-slate-900 pb-2">
              <p className="font-bold text-slate-400 text-[9px]">Text Message</p>
            </div>
            <div className="flex-1 pt-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 max-w-[90%] shadow-lg">
                <p className="leading-relaxed text-slate-300">{formattedMsg || "Type SMS text on the left..."}</p>
              </div>
            </div>
          </div>
        )}

        {channel === "email" && (
          <div className="bg-white min-h-[355px] flex flex-col justify-between text-[10px] text-slate-800 font-sans">
            <div className="bg-slate-100 p-2 border-b border-slate-200">
              <p className="text-[7px] text-slate-500">Subject: <span className="text-slate-900 font-bold">Exclusive Offer from {brandName}!</span></p>
            </div>
            <div className="flex-1 p-3 bg-slate-50 overflow-y-auto">
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-2">
                <h4 className="text-xs font-black text-indigo-950">{brandName}</h4>
                <p className="leading-relaxed text-[8px] text-slate-600">{formattedMsg || "Type email body content..."}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN BUILDER MODAL (WIZARD)
// ─────────────────────────────────────────────────────────────────────────────
function CampaignBuilder({ template, onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: template?.title || "",
    image: template?.image || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80",
    message: "Hey {name}! 🎁 We are super excited to offer you a special {offer}! Use code {coupon} at checkout to claim your deal. See you soon!",
    discount_type: template?.discount || "percent",
    discount_value: "15",
    segment: "all",
    schedule: "now",
    scheduled_at: "",
    channel: "whatsapp"
  });
  
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const imgInputRef = useRef(null);

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("image", ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    try {
      // Step 1: Create campaign in DB
      const campRes = await api.post('/campaigns', {
        name: form.title || 'Untitled Campaign',
        message: form.message || form.title,
        trigger: form.schedule,
        channel: form.channel,
      });
      const campaignId = campRes.data.campaign_id;

      if (form.channel === 'whatsapp' && campaignId) {
        // Step 2: Send via WhatsApp API (Bonvoice)
        const sendRes = await api.post(`/campaigns/${campaignId}/send`, {
          message: form.message || form.title,
        });
        toast.success(`Campaign sent to ${sendRes.data.sent} customers via WhatsApp! 🚀`);
      } else {
        toast.success('Campaign saved and queued! 🚀');
      }
      onClose();
    } catch (err) {
      const errMsg = err?.response?.data?.detail || 'Failed to send campaign';
      toast.error(errMsg);
    }
  };

  const STEPS = [
    { n: 1, label: "Setup" },
    { n: 2, label: "Message & Offer" },
    { n: 3, label: "Audience" },
    { n: 4, label: "Review" }
  ];

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-850 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-850 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <PaperAirplaneIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-black text-white">{form.title || "New Campaign"}</h3>
              <p className="text-xs text-slate-400 font-medium">Step-by-step custom blast wizard</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-850 text-slate-450 hover:text-white flex items-center justify-center transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Node Bar */}
        <div className="px-8 py-4 border-b border-slate-900/40 bg-slate-950/20 flex justify-center">
          <div className="flex items-center gap-4 w-full max-w-lg">
            {STEPS.map((s, idx) => (
              <React.Fragment key={s.n}>
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => s.n <= step && setStep(s.n)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                      step > s.n 
                        ? "bg-indigo-600 text-white" 
                        : step === s.n 
                          ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white ring-4 ring-indigo-500/25" 
                          : "bg-slate-900 text-slate-500 border border-slate-800"
                    }`}
                  >
                    {step > s.n ? "✓" : s.n}
                  </button>
                  <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 mt-1">{s.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 -mt-4 transition-colors ${step > s.n ? "bg-indigo-600" : "bg-slate-850"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Inputs */}
          <div className="lg:col-span-7 space-y-4">
            
            {step === 1 && (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Campaign Image</label>
                  <div 
                    onClick={() => imgInputRef.current?.click()}
                    className="relative rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed border-slate-800 hover:border-indigo-500 transition-colors flex flex-col items-center justify-center bg-slate-900/40 py-6"
                  >
                    {form.image ? (
                      <img src={form.image} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="banner" />
                    ) : null}
                    <div className="relative z-10 text-center space-y-2">
                      <span className="text-2xl">📷</span>
                      <p className="text-xs font-black text-slate-200">Upload Campaign Visuals</p>
                      <p className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP</p>
                    </div>
                  </div>
                  <input ref={imgInputRef} type="file" className="hidden" accept="image/*" onChange={handleImagePick} />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Campaign Title</label>
                  <input 
                    className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    value={form.title} 
                    onChange={e => set("title", e.target.value)} 
                    placeholder="Weekend Special Blast..." 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Deliver Via</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { v: "whatsapp", label: "WhatsApp", icon: <ChatBubbleLeftRightIcon className="w-4 h-4" />, color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" },
                      { v: "sms", label: "SMS Text", icon: <EnvelopeIcon className="w-4 h-4" />, color: "border-indigo-500/20 bg-indigo-500/5 text-indigo-400" },
                      { v: "email", label: "Email Blast", icon: <EnvelopeIcon className="w-4 h-4" />, color: "border-pink-500/20 bg-pink-500/5 text-pink-400" }
                    ].map(c => (
                      <label 
                        key={c.v} 
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                          form.channel === c.v ? c.color + " ring-2 ring-indigo-500/40" : "border-slate-800 bg-slate-900/40 hover:bg-slate-900 text-slate-450"
                        }`}
                      >
                        <input type="radio" className="hidden" value={c.v} checked={form.channel === c.v} onChange={() => set("channel", c.v)} />
                        {c.icon}
                        <span className="text-xs font-bold">{c.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Offer Category</label>
                    <select 
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                      value={form.discount_type} 
                      onChange={e => set("discount_type", e.target.value)}
                    >
                      <option value="percent">% Discount</option>
                      <option value="flat">₹ Flat Off</option>
                      <option value="free-item">Free Gift</option>
                      <option value="no-discount">Informational (No Offer)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Offer Text / Value</label>
                    <input 
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                      value={form.discount_value} 
                      onChange={e => set("discount_value", e.target.value)} 
                      placeholder="15% Off / ₹100 Off" 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Message Blast Template</label>
                    <span className="text-[8px] text-slate-500">Variables: {`{name}`}, {`{offer}`}, {`{coupon}`}</span>
                  </div>
                  <textarea 
                    rows={6} 
                    className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                    value={form.message} 
                    onChange={e => set("message", e.target.value)} 
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Audience Segment</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { v: "all", title: "All Customers Blaster", desc: "Delivers to entire database (4,820 customers)", icon: "👥" },
                      { v: "slipping", title: "Slipping Regulars", desc: "No visit in past 30 days (842 customers)", icon: "🏃‍♂️" },
                      { v: "active", title: "Highly Active Members", desc: "Visited in past 14 days (1,248 customers)", icon: "🔥" }
                    ].map(s => (
                      <label 
                        key={s.v} 
                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                          form.segment === s.v ? "border-indigo-500 bg-indigo-500/5 text-white" : "border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-900"
                        }`}
                      >
                        <input type="radio" className="hidden" value={s.v} checked={form.segment === s.v} onChange={() => set("segment", s.v)} />
                        <span className="text-2xl">{s.icon}</span>
                        <div>
                          <p className="text-xs font-black text-white">{s.title}</p>
                          <p className="text-[10px] text-slate-550 mt-0.5">{s.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2">Campaign Blaster Summary</h4>
                  {[
                    { label: "Campaign Blast Title", value: form.title || "—" },
                    { label: "Channel", value: form.channel },
                    { label: "Target Segment", value: form.segment },
                    { label: "Offer Configured", value: form.discount_value || "—" }
                  ].map(row => (
                    <div key={row.label} className="flex justify-between text-xs border-b border-slate-900 pb-2 last:border-0 last:pb-0">
                      <span className="text-slate-500 font-bold">{row.label}</span>
                      <span className="text-white font-bold uppercase">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Blast Schedule</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: "now", label: "Send Instantly" },
                      { v: "later", label: "Schedule for Later" }
                    ].map(s => (
                      <label 
                        key={s.v} 
                        className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                          form.schedule === s.v ? "border-indigo-500 bg-indigo-500/5 text-white" : "border-slate-800 bg-slate-900/40 text-slate-450"
                        }`}
                      >
                        <input type="radio" className="hidden" value={s.v} checked={form.schedule === s.v} onChange={() => set("schedule", s.v)} />
                        <span className="text-xs font-black">{s.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Live Smartphone Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-900/20 border border-slate-900 rounded-3xl p-6 relative">
            <span className="absolute top-4 left-6 text-[10px] font-black text-indigo-400 uppercase tracking-wider">Smartphone Preview</span>
            <LivePhonePreview 
              channel={form.channel} 
              message={form.message} 
              offerText={form.discount_value} 
              brandName="Gourmet Bakery" 
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-850 flex justify-between items-center bg-slate-950">
          <button 
            onClick={() => step > 1 ? setStep(s => s - 1) : onClose()} 
            className="text-xs font-black border border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900 px-4 py-2.5 rounded-xl transition-colors"
          >
            {step === 1 ? "Cancel" : "← Previous Step"}
          </button>
          
          <div className="flex gap-2">
            {step < 4 ? (
              <button 
                onClick={() => setStep(s => s + 1)} 
                disabled={step === 1 && !form.title}
                className="flex items-center gap-1.5 text-xs font-black bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl transition-all shadow-lg"
              >
                Continue <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => {
                    toast.success("Draft saved successfully!");
                    onClose();
                  }}
                  className="text-xs font-black border border-slate-850 bg-slate-900/50 hover:bg-slate-900 text-slate-300 px-4 py-2.5 rounded-xl transition-all"
                >
                  Save Draft
                </button>
                <button 
                  onClick={handleSend}
                  className="flex items-center gap-2 text-xs font-black bg-gradient-to-r from-indigo-600 to-pink-600 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg hover:opacity-95"
                >
                  <PaperAirplaneIcon className="w-4.5 h-4.5" />
                  {form.schedule === "now" ? "Blast Campaign 🚀" : "Schedule Blast"}
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE LIBRARY VIEW
// ─────────────────────────────────────────────────────────────────────────────
function TemplateLibrary({ onCreateCampaign }) {
  const [discountFilter, setDiscountFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredCollections = TEMPLATE_COLLECTIONS.map(col => ({
    ...col,
    templates: col.templates.filter(
      t => (discountFilter === "all" || t.discount === discountFilter) &&
           (search === "" || t.title.toLowerCase().includes(search.toLowerCase()))
    )
  })).filter(col => col.templates.length > 0);

  return (
    <div className="space-y-6">
      
      {/* Smart Whatsapp automation promotional banner */}
      <div className="rounded-3xl border border-slate-850 p-6 md:p-8 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-950 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex-1 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            <SparklesIcon className="w-3.5 h-3.5" /> Direct Blaster Engine
          </div>
          <h2 className="text-xl font-black text-white leading-tight tracking-tight">
            Automatically Re-route Undelivered Blasts & Secure Immediate Approvals
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Protect your sender score. Reroute failed WhatsApp nudges to SMS/Email streams automatically to guarantee 100% customer reach.
          </p>
          <div className="pt-2">
            <button className="text-xs font-black bg-white hover:bg-slate-100 text-slate-950 px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer">
              Initialize Auto-Routing
            </button>
          </div>
        </div>

        {/* 3D-like graphic elements */}
        <div className="flex-shrink-0 relative w-28 h-28 hidden sm:block">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl mx-auto text-white rotate-6 hover:rotate-12 transition-transform duration-300">
            <ChatBubbleLeftRightIcon className="w-10 h-10" />
          </div>
          <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-lg font-bold">1</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/20 border border-slate-900 rounded-3xl p-5">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
            placeholder="Search campaign templates..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Filters */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto justify-end">
          {DISCOUNT_FILTERS.map(f => (
            <button 
              key={f.id} 
              onClick={() => setDiscountFilter(f.id)}
              className={`text-[10px] font-black px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                discountFilter === f.id ? "bg-indigo-600 border-indigo-500 text-white shadow-lg" : "bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Lists Grid */}
      <div className="space-y-8">
        {filteredCollections.map(col => (
          <div key={col.id} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">{col.label}</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {col.id === "drafts" && (
                /* Start from scratch button */
                <div 
                  onClick={() => onCreateCampaign(null)}
                  className="group rounded-3xl border-2 border-dashed border-slate-850 hover:border-indigo-500 bg-slate-900/20 hover:bg-slate-900/40 cursor-pointer flex flex-col items-center justify-center p-6 min-h-[260px] text-center transition-all duration-300"
                >
                  <span className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 group-hover:scale-115 transition-transform">
                    <PlusIcon className="w-5 h-5" />
                  </span>
                  <h4 className="text-xs font-black text-white">Create Custom Blast</h4>
                  <p className="text-[9px] text-slate-500 mt-1">Build completely custom campaigns</p>
                </div>
              )}

              {col.templates.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => onCreateCampaign(t)}
                  className="group rounded-3xl border border-slate-900 hover:border-indigo-500/20 overflow-hidden cursor-pointer bg-slate-900/30 min-h-[260px] flex flex-col justify-between transition-all duration-300 relative"
                >
                  {/* Photo area */}
                  <div className="relative h-32 overflow-hidden bg-slate-900">
                    <img src={t.image} alt={t.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    {t.status === "Draft" && (
                      <span className="absolute top-3 left-3 bg-pink-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Draft
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h4 className="text-xs font-black text-white leading-relaxed truncate-2-lines">{t.title}</h4>
                    <div className="flex justify-between items-end border-t border-slate-900 pt-3 mt-3">
                      <DiscountCircle type={t.discount} />
                      <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest hover:underline">Blaster Nudge</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE DASHBOARD VIEW
// ─────────────────────────────────────────────────────────────────────────────
function CampaignPerformance({ onCreateCampaign }) {
  return (
    <div className="space-y-6">
      
      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Sent campaigns count", value: "14,820", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", icon: <EnvelopeIcon className="w-5 h-5" /> },
          { label: "Average Delivery Rate", value: "97.4%", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", icon: <BoltIcon className="w-5 h-5" /> },
          { label: "Direct Revenue Generated", value: "₹207.6K", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: <ArrowTrendingUpIcon className="w-5 h-5" /> },
          { label: "Unique Converters", value: "3,322", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", icon: <UserGroupIcon className="w-5 h-5" /> }
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

      {/* Performance graphs */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6">
        <div>
          <h3 className="text-base font-black text-white">Direct Conversion trend</h3>
          <p className="text-xs text-slate-400 mt-0.5">Campaign conversion rates compared to overall sends</p>
        </div>
        <div className="h-64 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={PERF_CHART_DATA}>
              <defs>
                <linearGradient id="glow-indigo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#475569" fontSize={11} />
              <YAxis stroke="#475569" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: 12, color: "#fff", fontSize: 11 }} />
              <Area type="monotone" dataKey="sent" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#glow-indigo)" name="Sent" />
              <Area type="monotone" dataKey="converted" stroke="#ec4899" strokeWidth={3} fill="none" name="Converted" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed logs table */}
      <div className="bg-slate-900/30 border border-slate-900 rounded-3xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-900 flex justify-between items-center">
          <div>
            <h3 className="text-base font-black text-white">Historical Blaster Runs</h3>
            <p className="text-xs text-slate-400 mt-0.5">Campaign logs and tracking report metrics</p>
          </div>
          <button 
            onClick={() => onCreateCampaign(null)}
            className="text-xs font-black text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            Launch New Blast
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-900/60 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Campaign Blast details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Sent</th>
                <th className="px-6 py-4">Delivered</th>
                <th className="px-6 py-4">Read</th>
                <th className="px-6 py-4">Clicked</th>
                <th className="px-6 py-4">Converted</th>
                <th className="px-6 py-4">Revenue</th>
                <th className="px-6 py-4">Blast Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300 font-medium">
              {MOCK_PERFORMANCE.map(c => {
                const delivRate = c.sent > 0 ? Math.round((c.delivered / c.sent) * 100) : 0;
                const readRate = c.delivered > 0 ? Math.round((c.read / c.delivered) * 100) : 0;
                return (
                  <tr key={c.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded-xl bg-slate-800 text-indigo-400"><ChatBubbleLeftRightIcon className="w-4 h-4" /></span>
                        <div>
                          <p className="text-sm font-black text-white">{c.name}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase">{c.channel}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase ${STATUS_STYLE[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black">{c.sent.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className="font-semibold text-white">{c.delivered.toLocaleString("en-IN")}</span>
                      {c.sent > 0 && <span className="text-slate-500 text-[9px] ml-1">({delivRate}%)</span>}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="font-semibold text-white">{c.read.toLocaleString("en-IN")}</span>
                      {c.delivered > 0 && <span className="text-slate-500 text-[9px] ml-1">({readRate}%)</span>}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-300">{c.clicked.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className="font-black text-white">{c.converted.toLocaleString("en-IN")}</span>
                      {c.sent > 0 && <span className="text-slate-500 text-[9px] ml-1">({Math.round(c.converted / c.sent * 100)}%)</span>}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-emerald-400">{c.revenue > 0 ? `₹${c.revenue.toLocaleString('en-IN')}` : "—"}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{c.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN BLOW-OUT PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState("library");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const openBuilder = (template) => {
    setSelectedTemplate(template);
    setBuilderOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-slide-up">
      
      {/* Title block */}
      <div className="border-b border-slate-900 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1 text-indigo-400">
            <PaperAirplaneIcon className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Engagement & Blast Center</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Campaign Blaster</h1>
          <p className="text-xs text-slate-400">Create, schedule, and analyze custom broadcasts for WhatsApp, SMS, and Email.</p>
        </div>
        <button 
          onClick={() => openBuilder(null)}
          className="flex items-center gap-1.5 text-xs font-black bg-gradient-to-r from-indigo-600 to-pink-600 hover:opacity-95 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg cursor-pointer w-full sm:w-auto justify-center"
        >
          <PlusIcon className="w-4 h-4" /> Create Custom Campaign
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-slate-900">
        <div className="flex gap-6">
          {[
            { id: "library", label: "Campaign Templates" },
            { id: "performance", label: "Performance Analytics" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px cursor-pointer ${
                activeTab === tab.id
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab contents */}
      {activeTab === "library" && (
        <TemplateLibrary onCreateCampaign={openBuilder} />
      )}
      {activeTab === "performance" && (
        <CampaignPerformance onCreateCampaign={openBuilder} />
      )}

      {/* Campaign Builder Wizard Modal */}
      {builderOpen && (
        <CampaignBuilder
          template={selectedTemplate}
          onClose={() => {
            setBuilderOpen(false);
            setSelectedTemplate(null);
          }}
        />
      )}

    </div>
  );
}
