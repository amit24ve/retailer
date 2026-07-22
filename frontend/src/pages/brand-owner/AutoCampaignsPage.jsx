import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  PlusIcon, PlayIcon, PauseIcon, PencilIcon, TrashIcon,
  ChevronDownIcon, ChevronRightIcon, XMarkIcon, BoltIcon, EyeIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

// ─── Surfing illustration (reused empty state) ────────────────────────────────
function SurfingEmpty({ text = 'We are surfing through your data.', sub = 'This will look more exciting once your customers redeem campaigns' }) {
  return (
    <div className="flex flex-col items-center py-10 gap-3">
      <svg viewBox="0 0 200 160" className="w-36 h-28" fill="none">
        {[28, 44, 60, 80, 100].map((h, i) => (
          <rect key={i} x={22 + i * 20} y={110 - h} width="14" height={h} rx="4"
            fill={i < 3 ? '#fca5a5' : '#f87171'} opacity={0.7 + i * 0.06} />
        ))}
        <ellipse cx="128" cy="128" rx="22" ry="24" fill="#dbeafe" />
        <circle cx="128" cy="90" r="14" fill="#1e3a5f" />
        <path d="M116 88 Q120 78 128 80 Q136 78 140 88" fill="#1e1e2e" />
        <path d="M106 110 Q113 105 120 110" stroke="#1e3a5f" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M150 105 Q143 108 136 110" stroke="#1e3a5f" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M106 110 Q102 102 110 100" stroke="#1e3a5f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>
      <p className="text-sm font-bold text-slate-700 text-center">{text}</p>
      <p className="text-xs text-slate-400 text-center max-w-xs">{sub}</p>
    </div>
  );
}

// ─── Campaign Type Illustrations (SVG inline) ─────────────────────────────────
function WelcomeIllustration() {
  return (
    <svg viewBox="0 0 120 100" className="w-20 h-16" fill="none">
      <circle cx="60" cy="50" r="45" fill="#e0f2fe" opacity="0.5" />
      <circle cx="60" cy="35" r="10" fill="#0284c7" opacity="0.8" />
      <path d="M42 70 Q60 55 78 70" fill="#0284c7" opacity="0.6" />
      <path d="M30 58 Q38 52 44 56" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M76 56 Q82 52 90 58" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="30" cy="40" r="6" fill="#7dd3fc" opacity="0.7" />
      <circle cx="90" cy="38" r="5" fill="#7dd3fc" opacity="0.6" />
      <path d="M28 36 Q25 28 30 25" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M88 34 Q91 26 88 23" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function BringBackIllustration() {
  return (
    <svg viewBox="0 0 120 100" className="w-20 h-16" fill="none">
      <circle cx="60" cy="55" r="38" fill="#fef3c7" opacity="0.6" />
      <circle cx="60" cy="30" r="11" fill="#d97706" opacity="0.8" />
      <path d="M44 68 Q60 54 76 68" fill="#d97706" opacity="0.6" />
      {/* Sale tag */}
      <rect x="50" y="50" width="22" height="18" rx="4" fill="#f59e0b" opacity="0.9" />
      <path d="M56 55 L64 65 M64 55 L56 65" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="76" cy="38" r="4" fill="#fbbf24" />
      <path d="M76 34 L80 28" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function WinBackIllustration() {
  return (
    <svg viewBox="0 0 120 100" className="w-20 h-16" fill="none">
      <circle cx="60" cy="50" r="42" fill="#fce7f3" opacity="0.5" />
      <circle cx="60" cy="30" r="10" fill="#be185d" opacity="0.8" />
      <path d="M44 65 Q60 52 76 65" fill="#be185d" opacity="0.6" />
      {/* Trophy */}
      <path d="M52 48 Q52 60 60 62 Q68 60 68 48 Z" fill="#ec4899" opacity="0.8" />
      <rect x="56" y="62" width="8" height="5" rx="1" fill="#db2777" />
      <path d="M42 50 Q40 42 46 40" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M78 50 Q80 42 74 40" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function BirthdayIllustration() {
  return (
    <svg viewBox="0 0 120 100" className="w-20 h-16" fill="none">
      <circle cx="60" cy="50" r="42" fill="#ede9fe" opacity="0.5" />
      <circle cx="60" cy="32" r="10" fill="#c9b96e" opacity="0.8" />
      <path d="M44 68 Q60 54 76 68" fill="#c9b96e" opacity="0.6" />
      {/* Balloons */}
      <circle cx="35" cy="35" r="8" fill="#22d3ee" opacity="0.8" />
      <circle cx="85" cy="33" r="7" fill="#c4b5fd" opacity="0.8" />
      <path d="M35 43 Q33 52 36 55" stroke="#c9b96e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M85 40 Q83 49 86 52" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Sparkles */}
      <path d="M50 20 L51 24 L55 25 L51 26 L50 30 L49 26 L45 25 L49 24 Z" fill="#f59e0b" opacity="0.9" />
    </svg>
  );
}

function AnniversaryIllustration() {
  return (
    <svg viewBox="0 0 120 100" className="w-20 h-16" fill="none">
      <circle cx="60" cy="55" r="38" fill="#f0fdf4" opacity="0.6" />
      <circle cx="45" cy="38" r="9" fill="#166534" opacity="0.7" />
      <circle cx="75" cy="35" r="9" fill="#16a34a" opacity="0.7" />
      <path d="M36 60 Q45 50 54 56" fill="#166534" opacity="0.5" />
      <path d="M66 57 Q75 48 84 60" fill="#16a34a" opacity="0.5" />
      {/* Dance figure */}
      <path d="M58 52 Q56 44 60 40 Q64 44 62 52" stroke="#15803d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M54 56 Q56 62 60 60 Q64 62 66 56" stroke="#15803d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Music notes */}
      <text x="86" y="30" fontSize="12" fill="#4ade80">♪</text>
      <text x="92" y="45" fontSize="9" fill="#86efac">♫</text>
    </svg>
  );
}

function ReferralIllustration() {
  return (
    <svg viewBox="0 0 120 100" className="w-20 h-16" fill="none">
      <circle cx="60" cy="50" r="42" fill="#fff7ed" opacity="0.5" />
      <circle cx="40" cy="35" r="9" fill="#ea580c" opacity="0.7" />
      <circle cx="80" cy="35" r="9" fill="#f97316" opacity="0.7" />
      <path d="M60 45 L40 52 M60 45 L80 52" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="30" r="7" fill="#fb923c" opacity="0.9" />
      <path d="M55 55 Q60 48 65 55" fill="#ea580c" opacity="0.5" />
      <path d="M45 58 L40 65 M75 58 L80 65" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Campaign type card data ──────────────────────────────────────────────────
const CAMPAIGN_TYPES = [
  {
    id: 'welcome',
    title: 'Welcome first time customers',
    desc: 'Introduce your brand to first time customers and encourage them to become loyal returning customers with post-sale promotions.',
    Illustration: WelcomeIllustration,
    bg: '#f0f9ff',
    border: '#bae6fd',
    trigger: 'new_signup',
    highlighted: false,
  },
  {
    id: 'bring_back',
    title: 'Bring back your customers',
    desc: "When customers haven't visited in a while, this campaign sends them an incentive to return again much sooner than they would otherwise.",
    Illustration: BringBackIllustration,
    bg: '#fff8f1',
    border: '#fed7aa',
    trigger: 'inactive_60',
    highlighted: true,
  },
  {
    id: 'win_back',
    title: 'Win back customers',
    desc: "Get customers to visit again! This campaign sends an incentive to your old customers who haven't purchased in a long time.",
    Illustration: WinBackIllustration,
    bg: '#fdf4ff',
    border: '#f5d0fe',
    trigger: 'inactive_90',
    highlighted: false,
  },
  {
    id: 'birthday',
    title: 'Celebrate customer Birthdays',
    desc: 'Birthdays are the perfect opportunity to build customer relationships. Invite them with an offer to increase your sales.',
    Illustration: BirthdayIllustration,
    bg: '#f5f3ff',
    border: '#ddd6fe',
    trigger: 'birthday',
    highlighted: false,
  },
  {
    id: 'anniversary',
    title: 'Celebrate customer Anniversaries',
    desc: 'Strengthen customer relationships and make them feel special. This campaign wishes your customers "Happy Anniversary".',
    Illustration: AnniversaryIllustration,
    bg: '#f0fdf4',
    border: '#bbf7d0',
    trigger: 'anniversary',
    highlighted: false,
  },
  {
    id: 'referral',
    title: 'Reward loyal referrers',
    desc: 'Automatically reward customers who bring new visitors to your store with bonus points and exclusive offers.',
    Illustration: ReferralIllustration,
    bg: '#fff7ed',
    border: '#fed7aa',
    trigger: 'referral',
    highlighted: false,
  },
];

// ─── Performance chart data ───────────────────────────────────────────────────
const PERF_DATA = [
  { week: 'Week 1', visits: 0, revenue: 0 },
  { week: 'Week 2', visits: 0, revenue: 0 },
  { week: 'Week 3', visits: 0, revenue: 0 },
  { week: 'Week 4', visits: 0, revenue: 0 },
];

// ─── Create Campaign Modal ────────────────────────────────────────────────────
function CreateCampaignModal({ campaignType, editing, onClose, onSuccess }) {
  const isEdit = !!editing;
  const [form, setForm] = useState({
    name: editing?.name || (campaignType ? `${campaignType.title}` : ''),
    message: editing?.message || '',
    delay_hours: editing?.delay_hours ?? 0,
    discount_type: editing?.discount_type || 'no-discount',
    discount_value: editing?.discount_value || '',
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/auto-campaigns/${editing.campaign_id}`, { ...form });
      } else {
        await api.post('/auto-campaigns', { ...form, trigger: campaignType?.trigger || 'new_signup' });
      }
      onSuccess();
    } catch {
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {campaignType && (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: campaignType.bg }}>
                <campaignType.Illustration />
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-slate-900">{isEdit ? 'Edit Auto Campaign' : 'Set up Auto Campaign'}</p>
              <p className="text-xs text-slate-400">{campaignType?.title || editing?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Campaign Name</label>
            <input className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">WhatsApp Message</label>
            <textarea rows={4}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
              value={form.message} onChange={e => set('message', e.target.value)}
              placeholder="Hi {name}! Here's a special offer just for you..." required />
            <p className="text-xs text-slate-400 mt-1">Use {'{name}'}, {'{points}'}, {'{coupon}'} as variables</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Offer Type</label>
              <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={form.discount_type} onChange={e => set('discount_type', e.target.value)}>
                <option value="no-discount">No Discount</option>
                <option value="flat">Flat ₹ Off</option>
                <option value="percent">% Off</option>
                <option value="free-item">Free Item</option>
              </select>
            </div>
            {form.discount_type !== 'no-discount' && (
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Value</label>
                <input type="number" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  value={form.discount_value} onChange={e => set('discount_value', e.target.value)}
                  placeholder={form.discount_type === 'flat' ? '200' : '15'} />
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
              Send Delay (hours after trigger)
            </label>
            <input type="number" min={0} max={72}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={form.delay_hours} onChange={e => set('delay_hours', parseInt(e.target.value) || 0)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 text-sm font-bold text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isEdit ? 'Save Changes' : 'Activate Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── View Auto Campaign Modal ─────────────────────────────────────────────────
function ViewAutoCampaignModal({ campaign, typeInfo, onClose, onEdit }) {
  if (!campaign) return null;
  const stats = [
    { label: 'Sent', value: campaign.sent?.toLocaleString('en-IN') || '0' },
    { label: 'Opened', value: campaign.opened?.toLocaleString('en-IN') || '0' },
    { label: 'Converted', value: campaign.converted?.toLocaleString('en-IN') || '0' },
    { label: 'Revenue', value: campaign.revenue ? `₹${(campaign.revenue / 1000).toFixed(1)}K` : '₹0' },
  ];
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-slide-up overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {typeInfo?.Illustration && (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: typeInfo.bg }}>
                <typeInfo.Illustration />
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-slate-900">{campaign.name}</p>
              <p className="text-xs text-slate-400">Trigger: {typeInfo?.title || campaign.trigger}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${campaign.status === 'active' ? 'bg-cyan-100 text-amber-700' : 'bg-amber-100 text-amber-700'}`}>
              {campaign.status}
            </span>
            <span className="text-xs text-slate-400">Delay: {campaign.delay_hours || 0}h after trigger</span>
          </div>
          {campaign.message && (
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Message</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{campaign.message}</p>
            </div>
          )}
          <div className="grid grid-cols-4 gap-2">
            {stats.map(s => (
              <div key={s.label} className="rounded-xl border border-slate-100 px-2 py-2.5 text-center">
                <p className="text-sm font-black text-slate-900">{s.value}</p>
                <p className="text-[10px] text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Close
          </button>
          <button onClick={onEdit} className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors">
            <PencilIcon className="w-4 h-4" /> Edit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Auto Campaign Confirmation ────────────────────────────────────────
function DeleteAutoCampaignModal({ campaign, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl animate-slide-up overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <TrashIcon className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Delete Auto Campaign?</h3>
          <p className="text-sm text-slate-500 mt-1.5">
            <span className="font-semibold text-slate-700">"{campaign?.name || 'This campaign'}"</span> will be permanently removed. This cannot be undone.
          </p>
          <div className="flex items-center gap-2 mt-6">
            <button onClick={onCancel} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm} className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AutoCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [statusFilter, setStatusFilter] = useState('active');
  const [objectiveFilter, setObjectiveFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [chartMetric, setChartMetric] = useState('visits');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [viewingCampaign, setViewingCampaign] = useState(null);
  const [deletingCampaign, setDeletingCampaign] = useState(null);

  const refresh = () =>
    api.get('/auto-campaigns').then(r => setCampaigns(r.data.campaigns || [])).catch(() => setCampaigns([]));

  useEffect(() => {
    refresh();
  }, []);

  const handleGetStarted = (type) => {
    setSelectedType(type);
    setShowCreate(true);
  };

  const handleCreated = () => {
    setShowCreate(false);
    setSelectedType(null);
    toast.success('Auto campaign activated! 🚀');
    refresh();
  };

  const handleEdited = () => {
    setEditingCampaign(null);
    toast.success('Auto campaign updated! ✅');
    refresh();
  };

  const handleDelete = async () => {
    if (!deletingCampaign) return;
    try {
      await api.delete(`/auto-campaigns/${deletingCampaign.campaign_id}`);
      setCampaigns(prev => prev.filter(c => c.campaign_id !== deletingCampaign.campaign_id));
      toast.success('Auto campaign deleted');
    } catch {
      toast.error('Failed to delete campaign');
    } finally {
      setDeletingCampaign(null);
    }
  };

  // 'active' tab → only active campaigns; 'inactive' tab → anything not active
  // (paused / inactive / suspended), so paused campaigns don't disappear.
  const filtered = campaigns.filter(c => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
          ? c.status === 'active'
          : c.status !== 'active';
    return matchesStatus && (objectiveFilter === 'all' || c.trigger === objectiveFilter);
  });

  return (
    <div className="space-y-6 pb-10 animate-slide-up">

      {/* ── Hero Banner ── */}
      <div
        className="rounded-3xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #e9e0ff 0%, #d4c6ff 40%, #c7b8ff 100%)' }}
      >
        <div className="flex flex-col xl:flex-row items-start gap-0">
          {/* Left content */}
          <div className="flex-1 p-7 pb-6">
            <span className="inline-flex items-center gap-1.5 bg-cyan-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full mb-4">
              <BoltIcon className="w-3 h-3" /> NEW
            </span>
            <h2 className="text-2xl font-black text-slate-900 leading-tight mb-3">
              Send a reminder 🔔 for auto-<br />campaigns &amp; increase your sales
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-5 max-w-sm">
              Remind your customers when they haven't redeemed their campaign reward to maximize your campaign success!
            </p>
            <button className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-md">
              <PlayIcon className="w-3.5 h-3.5" /> Learn more
            </button>
          </div>

          {/* Center: Timeline */}
          <div className="flex-1 px-6 py-7 space-y-4">
            {[
              { date: 'AUG\n01', icon: '💬', text: 'Customer automatically\ngets a birthday message' },
              { date: 'AUG\n06', icon: '🔔', text: 'Customer gets a reminder\nbefore their reward expires' },
              { date: 'AUG\n08', icon: '🎂', text: "Your customer's birthday" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {/* Date badge */}
                <div className="w-12 h-12 rounded-xl bg-white/70 backdrop-blur flex flex-col items-center justify-center flex-shrink-0 shadow-sm border border-white/50">
                  {item.date.split('\n').map((d, j) => (
                    <span key={j} className={`${j === 0 ? 'text-[9px] font-semibold text-slate-500 uppercase' : 'text-sm font-black text-slate-900 leading-none'}`}>{d}</span>
                  ))}
                </div>
                {/* Arrow + icon */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-white/70 backdrop-blur flex items-center justify-center text-base shadow-sm">{item.icon}</div>
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-snug">{item.text.split('\n').map((t, j) => <span key={j}>{t}{j < 1 && <br />}</span>)}</p>
              </div>
            ))}
          </div>

          {/* Right: WhatsApp message previews */}
          <div className="w-56 p-4 space-y-3 flex-shrink-0">
            {/* Message card 1 */}
            <div className="bg-white rounded-2xl p-3 shadow-lg border border-white/80">
              <div className="w-full h-20 rounded-xl overflow-hidden mb-2">
                <img src="https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=300&q=70" alt="birthday" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs font-semibold text-slate-800">Hey Manya 👋</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">It's your Birthday! 🎉🎂 Enjoy a free dessert from us. 😊</p>
            </div>
            {/* Message card 2 */}
            <div className="bg-white rounded-2xl p-3 shadow-lg border border-white/80">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs">🎁</div>
                <p className="text-[10px] font-bold text-amber-700">Reminder for Manya</p>
              </div>
              <div className="w-full h-14 rounded-lg overflow-hidden mb-1.5">
                <img src="https://images.unsplash.com/photo-1551024601-bec78aea704b?w=300&q=70" alt="cake" className="w-full h-full object-cover" />
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">Your <span className="font-bold text-slate-700">free birthday dessert</span> is expiring in 2 days! Hurry!</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Campaign Type Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {CAMPAIGN_TYPES.map(ct => (
          <div
            key={ct.id}
            className="rounded-2xl border p-5 transition-all duration-200 hover:shadow-md relative"
            style={{
              background: ct.highlighted ? 'white' : ct.bg,
              borderColor: ct.highlighted ? '#e2e8f0' : ct.border,
              boxShadow: ct.highlighted ? '0 0 0 2px #c9b96e' : undefined,
            }}
          >
            {/* Illustration */}
            <div className="mb-4 flex justify-center">
              <ct.Illustration />
            </div>

            {/* Content */}
            <h3 className={`text-sm font-black mb-1.5 ${ct.highlighted ? 'text-slate-900' : 'text-slate-700'}`}>
              {ct.title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">{ct.desc}</p>

            {/* CTA */}
            <button
              onClick={() => handleGetStarted(ct)}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                ct.highlighted
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-cyan-500 hover:text-amber-700'
              }`}
            >
              Get Started <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* ── Overall Performance ── */}
      <section>
        <div className="mb-3">
          <h2 className="text-lg font-black text-slate-900">Overall performance</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Track the performance of your automated marketing campaigns with real-time analytics reports.
            This will look exciting once you activate automated campaigns.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {/* Summary header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900">Summary of all Automated campaigns</h3>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(v => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 border border-slate-200 bg-white rounded-xl px-3 py-1.5 hover:bg-slate-50 transition-colors"
              >
                Last 30 Days &nbsp;<span className="text-slate-400 text-[10px]">10,May 26 - 09,Jun 26</span>
                <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {showDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-10 py-1 min-w-[180px]">
                  {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last 12 Months'].map(r => (
                    <button key={r} onClick={() => { setDateRange(r); setShowDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-slate-100 px-5 py-4">
            {[
              { label: 'Attributed Revenue', value: '₹0' },
              { label: 'Total Delivered', value: '0' },
              { label: 'Customer visits', value: '0' },
              { label: 'Avg visit rate', value: '0%' },
            ].map(s => (
              <div key={s.label} className="px-4 first:pl-0 last:pr-0">
                <p className="text-2xl font-black text-slate-900">{s.value}</p>
                <p className="text-xs text-amber-700 font-semibold mt-0.5 border-b border-dashed border-cyan-500 inline-block">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Chart toggle + chart area */}
          <div className="px-5 pb-5">
            <div className="flex items-center justify-end gap-2 mb-4">
              {[
                { v: 'visits', label: 'Total visits' },
                { v: 'revenue', label: 'Estimated revenue' },
              ].map(m => (
                <button key={m.v} onClick={() => setChartMetric(m.v)}
                  className="text-xs font-bold px-4 py-2 rounded-full transition-all"
                  style={chartMetric === m.v
                    ? { background: '#a89442', color: 'white' }
                    : { background: 'white', color: '#475569', border: '1px solid #e2e8f0' }}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Empty state */}
            <div className="bg-slate-50 rounded-2xl border border-slate-100">
              <SurfingEmpty
                text="We are surfing through your data."
                sub="This will look more exciting once your customers redeem campaigns"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Recent Auto Campaigns ── */}
      <section>
        <h2 className="text-lg font-black text-slate-900 mb-4">Recent Auto Campaigns</h2>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          {/* Active / Inactive tabs */}
          <div className="flex items-center gap-1.5">
            {['active', 'inactive'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all"
                style={statusFilter === s
                  ? { background: '#a89442', color: 'white' }
                  : { background: 'white', color: '#475569', border: '1px solid #e2e8f0' }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Right filters */}
          <div className="flex items-center gap-2">
            <select value={objectiveFilter} onChange={e => setObjectiveFilter(e.target.value)}
              className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300">
              <option value="all">All Objectives</option>
              <option value="new_signup">Welcome</option>
              <option value="inactive_60">Bring Back (60d)</option>
              <option value="inactive_90">Win Back (90d)</option>
              <option value="birthday">Birthday</option>
              <option value="anniversary">Anniversary</option>
            </select>
            <select value={dateRange} onChange={e => setDateRange(e.target.value)}
              className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300">
              <option value="30d">Last 30 Days  10,May 26 - 09,Jun 26</option>
              <option value="12m">Last 12 Months  01,Jun 25 - 09,Jun 26</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </div>

        {/* List or empty */}
        {filtered.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl">
            <SurfingEmpty
              text="No campaigns found."
              sub="Activate a campaign above to see it here"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => {
              const typeInfo = CAMPAIGN_TYPES.find(t => t.trigger === c.trigger);
              const Illus = typeInfo?.Illustration;
              return (
                <div key={c.campaign_id || c.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-cyan-400 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {Illus && (
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: typeInfo?.bg || '#f1f5f9' }}>
                          <Illus />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-slate-900">{c.name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-cyan-100 text-amber-700' : 'bg-amber-100 text-amber-700'}`}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">Trigger: {typeInfo?.title || c.trigger}</p>
                        {c.message && <p className="text-xs text-slate-500 mt-1 italic max-w-sm truncate">"{c.message}"</p>}
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => setViewingCampaign(c)}
                        title="View campaign"
                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 transition-colors">
                        <EyeIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingCampaign(c)}
                        title="Edit campaign"
                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-colors">
                        <PencilIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          try { await api.post(`/auto-campaigns/${c.campaign_id}/toggle`); } catch {}
                          setCampaigns(prev => prev.map(x => x.campaign_id === c.campaign_id ? { ...x, status: x.status === 'active' ? 'paused' : 'active' } : x));
                          toast.success(c.status === 'active' ? 'Campaign paused — moved to Inactive' : 'Campaign resumed — moved to Active');
                        }}
                        title={c.status === 'active' ? 'Pause campaign' : 'Resume campaign'}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${c.status === 'active' ? 'border-amber-200 text-amber-500 hover:bg-amber-50' : 'border-cyan-200 text-cyan-500 hover:bg-cyan-50'}`}>
                        {c.status === 'active' ? <PauseIcon className="w-3.5 h-3.5" /> : <PlayIcon className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setDeletingCampaign(c)}
                        title="Delete campaign"
                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100">
                    {[
                      { label: 'Sent', value: c.sent?.toLocaleString('en-IN') || '0' },
                      { label: 'Opened', value: c.opened?.toLocaleString('en-IN') || '0', color: 'text-blue-600' },
                      { label: 'Converted', value: c.converted?.toLocaleString('en-IN') || '0', color: 'text-amber-600' },
                      { label: 'Revenue', value: c.revenue ? `₹${(c.revenue / 1000).toFixed(1)}K` : '₹0', color: 'text-amber-700' },
                    ].map(s => (
                      <div key={s.label} className="text-center">
                        <p className={`text-sm font-black ${s.color || 'text-slate-900'}`}>{s.value}</p>
                        <p className="text-[10px] text-slate-400">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Create modal */}
      {showCreate && (
        <CreateCampaignModal
          campaignType={selectedType}
          onClose={() => { setShowCreate(false); setSelectedType(null); }}
          onSuccess={handleCreated}
        />
      )}

      {/* Edit modal */}
      {editingCampaign && (
        <CreateCampaignModal
          campaignType={CAMPAIGN_TYPES.find(t => t.trigger === editingCampaign.trigger)}
          editing={editingCampaign}
          onClose={() => setEditingCampaign(null)}
          onSuccess={handleEdited}
        />
      )}

      {/* View modal */}
      {viewingCampaign && (
        <ViewAutoCampaignModal
          campaign={viewingCampaign}
          typeInfo={CAMPAIGN_TYPES.find(t => t.trigger === viewingCampaign.trigger)}
          onClose={() => setViewingCampaign(null)}
          onEdit={() => { const c = viewingCampaign; setViewingCampaign(null); setEditingCampaign(c); }}
        />
      )}

      {/* Delete confirmation */}
      {deletingCampaign && (
        <DeleteAutoCampaignModal
          campaign={deletingCampaign}
          onCancel={() => setDeletingCampaign(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}


