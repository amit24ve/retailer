import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  PlusIcon, MagnifyingGlassIcon, FunnelIcon, ChevronDownIcon,
  EllipsisHorizontalIcon, PencilIcon, TrashIcon, PaperAirplaneIcon,
  ChartBarIcon, ArrowRightIcon, SparklesIcon, QuestionMarkCircleIcon,
  ArrowTrendingUpIcon, UserGroupIcon, CurrencyRupeeIcon, EyeIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';

// ─── Constants ────────────────────────────────────────────────────────────────

const DISCOUNT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'no-discount', label: 'No Discount', icon: '⊖' },
  { id: 'free-item', label: 'Free Item', icon: '🎁' },
  { id: 'flat', label: '₹ discount', icon: '₹' },
  { id: 'percent', label: 'Discount', icon: '%' },
];

// Template collections — image-backed cards like Reelo screenshot
const TEMPLATE_COLLECTIONS = [
  {
    id: 'drafts',
    label: 'Drafts | Custom Campaigns',
    templates: [
      {
        id: 'd1', title: 'Edit Campaign', status: 'Draft', discount: 'none', whatsapp: true,
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
      },
      {
        id: 'd2', title: 'Write campaign title', status: 'Draft', discount: 'percent', whatsapp: true,
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
      },
    ],
  },
  {
    id: 'donut-day',
    label: 'National Donut Day 🍩 (5th June)',
    templates: [
      {
        id: 't1', title: 'Sweet Savings, Fresh Donuts', discount: 'flat', whatsapp: true,
        image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80',
      },
      {
        id: 't2', title: 'A Sweet Donut Treat on Us', discount: 'free-item', whatsapp: true,
        image: 'https://images.unsplash.com/photo-1556913396-7a3c459ef68e?w=400&q=80',
      },
      {
        id: 't3', title: 'Sprinkles, Smiles & Donuts', discount: 'no-discount', whatsapp: true,
        image: 'https://images.unsplash.com/photo-1625228333786-5a94a5528c91?w=400&q=80',
      },
      {
        id: 't4', title: 'The Donut Delight Offer', discount: 'percent', whatsapp: true,
        image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80',
      },
    ],
  },
  {
    id: 'summer',
    label: 'Summer Sale ☀️',
    templates: [
      {
        id: 's1', title: 'Beat the Heat Deals', discount: 'percent', whatsapp: true,
        image: 'https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?w=400&q=80',
      },
      {
        id: 's2', title: 'Summer Refresh Offer', discount: 'free-item', whatsapp: true,
        image: 'https://images.unsplash.com/photo-1494145904049-0dca59b4bbad?w=400&q=80',
      },
      {
        id: 's3', title: 'Cool Down with Savings', discount: 'flat', whatsapp: true,
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80',
      },
      {
        id: 's4', title: 'Hot Summer, Cool Price', discount: 'no-discount', whatsapp: true,
        image: 'https://images.unsplash.com/photo-1551334787-21e6bd3ab135?w=400&q=80',
      },
    ],
  },
  {
    id: 'loyalty',
    label: 'Loyalty & Rewards 🏆',
    templates: [
      {
        id: 'l1', title: 'Points Expiry Reminder', discount: 'no-discount', whatsapp: true,
        image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400&q=80',
      },
      {
        id: 'l2', title: 'Tier Upgrade Congrats', discount: 'no-discount', whatsapp: true,
        image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80',
      },
      {
        id: 'l3', title: 'Double Points Weekend', discount: 'flat', whatsapp: true,
        image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&q=80',
      },
      {
        id: 'l4', title: 'Birthday Special Reward', discount: 'free-item', whatsapp: true,
        image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400&q=80',
      },
    ],
  },
  {
    id: 'winback',
    label: 'Win Back Customers 🔁',
    templates: [
      {
        id: 'w1', title: 'We Miss You Offer', discount: 'flat', whatsapp: true,
        image: 'https://images.unsplash.com/photo-1521566652839-697aa473761a?w=400&q=80',
      },
      {
        id: 'w2', title: 'Come Back & Save', discount: 'percent', whatsapp: true,
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80',
      },
      {
        id: 'w3', title: 'Exclusive Return Gift', discount: 'free-item', whatsapp: true,
        image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80',
      },
      {
        id: 'w4', title: 'Last Chance Deal', discount: 'percent', whatsapp: true,
        image: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=400&q=80',
      },
    ],
  },
];



// ─── Helpers ──────────────────────────────────────────────────────────────────

const DISCOUNT_ICON = {
  'no-discount': '⊖',
  'free-item':   '🎁',
  'flat':        '₹',
  'percent':     '%',
  'none':        '',
};

const STATUS_STYLE = {
  sent: 'bg-cyan-100 text-amber-700 border-cyan-200',
  paused: 'bg-amber-100 text-amber-700 border-amber-200',
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  active: 'bg-cyan-200 text-amber-800 border-cyan-300',
};

const fmtNum = n => n > 999 ? `${(n / 1000).toFixed(1)}K` : String(n);
const convRate = (c, s) => s > 0 ? `${((c / s) * 100).toFixed(1)}%` : '—';

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-800">{fmtNum(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── WhatsApp icon SVG (reusable) ─────────────────────────────────────────────
const WaIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// ─── Discount icon circle (white bg, like screenshot) ────────────────────────
const DiscountCircle = ({ type }) => {
  const map = {
    'flat':        { icon: '₹',  bg: 'bg-white', text: 'text-slate-800', ring: '' },
    'percent':     { icon: '%',  bg: 'bg-white', text: 'text-slate-800', ring: '' },
    'free-item':   { icon: '🎁', bg: 'bg-white', text: 'text-base',      ring: '' },
    'no-discount': { icon: '⊖',  bg: 'bg-white', text: 'text-slate-500', ring: '' },
  };
  const s = map[type];
  if (!s) return null;
  return (
    <div className={`w-9 h-9 rounded-full ${s.bg} flex items-center justify-center shadow-lg text-sm font-black ${s.text} ring-2 ring-white/40`}>
      {s.icon}
    </div>
  );
};

// ─── Template Card — photo overlay style matching Reelo screenshot ─────────────
function TemplateCard({ t, onClick }) {
  const isDraft = t.status === 'Draft';
  // fallback gradient when image hasn't loaded or is absent
  const fallbackBg = 'linear-gradient(135deg, #a89442, #c9b96e)';

  return (
    <div
      onClick={() => onClick(t)}
      className="relative rounded-2xl overflow-hidden cursor-pointer group hover:scale-[1.03] hover:shadow-2xl transition-all duration-200 select-none"
      style={{ aspectRatio: '3/4' }}
    >
      {/* Photo background */}
      {t.image ? (
        <img
          src={t.image}
          alt={t.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: fallbackBg }} />
      )}

      {/* Dark gradient overlay — bottom-heavy like the screenshot */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

      {/* Top bar: Draft badge + 3-dot menu */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
        {isDraft && (
          <span className="bg-amber-400 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md">
            Draft
          </span>
        )}
        {!isDraft && <span />}
        <button
          onClick={e => { e.stopPropagation(); }}
          className="w-7 h-7 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <EllipsisHorizontalIcon className="w-4 h-4 text-slate-700" />
        </button>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        {/* Title */}
        <p className="text-sm font-bold text-white leading-snug mb-2.5 drop-shadow-md">
          {t.title}
        </p>
        {/* Icon circles row */}
        <div className="flex items-center gap-2">
          {t.discount && t.discount !== 'none' && (
            <DiscountCircle type={t.discount} />
          )}
          {t.whatsapp && (
            <div className="w-9 h-9 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg ring-2 ring-white/40">
              <WaIcon size={17} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Scratch Card — same aspect ratio as image cards ─────────────────────────
function ScratchCard({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-200 bg-slate-100 border-2 border-dashed border-slate-300 hover:border-cyan-500 flex flex-col items-center justify-center gap-3"
      style={{ aspectRatio: '3/4' }}
    >
      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 group-hover:border-cyan-400 group-hover:bg-cyan-50 flex items-center justify-center transition-colors shadow-sm">
        <PlusIcon className="w-6 h-6 text-slate-400 group-hover:text-amber-700 transition-colors" />
      </div>
      <div className="text-center px-3">
        <p className="text-sm font-bold text-slate-600 group-hover:text-amber-800 transition-colors">Start from Scratch</p>
        <p className="text-xs text-slate-400 mt-0.5">Build your own</p>
      </div>
    </div>
  );
}

function CampaignBuilder({ template, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: template?.title || '',
    image: template?.image || null,      // URL or base64 preview
    imageFile: null,
    message: template?.message || '',
    discount_type: template?.discount || 'no-discount',
    discount_value: template?.discount_value || '',
    segment: template?.segment || 'all',
    schedule: template?.schedule || 'now',
    scheduled_at: template?.scheduled_at || '',
    channels: template?.channels || (template?.channel === 'sms' ? ['sms'] : ['whatsapp']),
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleChannel = (channel) => {
    setForm((f) => {
      const exists = f.channels.includes(channel);
      const channels = exists ? f.channels.filter((c) => c !== channel) : [...f.channels, channel];
      return { ...f, channels: channels.length ? channels : [channel] };
    });
  };
  const channelLabel = form.channels.length === 2
    ? 'SMS + WhatsApp'
    : form.channels[0] === 'sms'
      ? 'SMS'
      : 'WhatsApp';
  const imgInputRef = React.useRef(null);

  // Handle local image pick → show preview
  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set('image', ev.target.result);
    reader.readAsDataURL(file);
    set('imageFile', file);
  };

  const STEPS = [
    { n: 1, label: 'Campaign Setup' },
    { n: 2, label: 'Message & Offer' },
    { n: 3, label: 'Audience' },
    { n: 4, label: 'Schedule & Send' },
  ];

  const handleSend = async () => {
    try {
      let campaign;
      const campaignData = {
        name: form.title || 'Untitled Campaign',
        message: form.message || '',
        discount_type: form.discount_type || 'no-discount',
        discount_value: form.discount_value || '',
        segment: form.segment || 'all',
        schedule: form.schedule || 'now',
        scheduled_at: form.scheduled_at || '',
        channel: form.channels.length === 2 ? 'both' : form.channels[0],
        channels: form.channels,
      };

      if (template?.isDbDraft && template?.id) {
        // Update existing campaign
        await api.put(`/campaigns/${template.id}`, campaignData);
        campaign = { campaign_id: template.id };
      } else {
        // Create new campaign
        const res = await api.post('/campaigns', campaignData);
        campaign = res.data;
      }

      // 2. Send the campaign immediately if scheduled for now
      if (campaign && campaign.campaign_id && form.schedule === 'now') {
        const sendRes = await api.post(`/campaigns/${campaign.campaign_id}/send`, {
          message: form.message || '',
          channels: form.channels,
        });
        toast.success(`Campaign sent: ${sendRes.data.sent || 0} delivered, ${sendRes.data.failed || 0} failed`);
      } else {
        toast.success(form.schedule === 'schedule' ? 'Campaign scheduled successfully' : 'Campaign saved successfully');
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error sending campaign:", err);
      toast.error('Failed to send campaign');
    }
    onClose();
  };

  const handleSaveDraft = async () => {
    try {
      const campaignData = {
        name: form.title || 'Untitled Campaign',
        message: form.message || '',
        discount_type: form.discount_type || 'no-discount',
        discount_value: form.discount_value || '',
        segment: form.segment || 'all',
        schedule: form.schedule || 'now',
        scheduled_at: form.scheduled_at || '',
        channel: form.channels.length === 2 ? 'both' : form.channels[0],
        channels: form.channels,
        status: 'draft',
      };

      if (template?.isDbDraft && template?.id) {
        // Update existing draft
        await api.put(`/campaigns/${template.id}`, campaignData);
      } else {
        // Create new draft
        await api.post('/campaigns', campaignData);
      }
      toast.success('Saved as draft! 📋');
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error saving draft:", err);
      toast.error('Failed to save draft');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-500 rounded-xl flex items-center justify-center">
              <PaperAirplaneIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{form.title || 'New Campaign'}</p>
              <p className="text-xs text-slate-400">{channelLabel} Campaign</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors text-xl">×</button>
        </div>

        {/* Step indicators */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.n}>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => s.n <= step && setStep(s.n)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step > s.n ? 'bg-cyan-500 text-white' :
                      step === s.n ? 'bg-slate-900 text-white ring-4 ring-slate-900/20' :
                      'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {step > s.n ? '✓' : s.n}
                  </button>
                  <span className={`text-[9px] font-semibold whitespace-nowrap ${step === s.n ? 'text-slate-900' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-3 mx-1 transition-colors ${step > s.n ? 'bg-cyan-500' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {step === 1 && (
            <>
              {/* ── Campaign image upload ── */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Campaign Image <span className="text-slate-400 font-normal normal-case">(shown on card)</span>
                </label>
                <div
                  onClick={() => imgInputRef.current?.click()}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group border-2 border-dashed border-slate-200 hover:border-cyan-500 transition-colors"
                  style={{ aspectRatio: '16/7' }}
                >
                  {form.image ? (
                    <>
                      <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                      {/* Dark overlay on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="text-white text-sm font-bold">Change Image</span>
                      </div>
                      {/* Bottom preview — shows how the card will look */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-sm font-bold text-white drop-shadow leading-snug mb-2">
                            {form.title || 'Campaign title preview'}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-black text-slate-800 shadow">
                              {form.discount_type === 'flat' ? '₹' : form.discount_type === 'percent' ? '%' : form.discount_type === 'free-item' ? '🎁' : '⊖'}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center shadow">
                              <WaIcon size={15} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-2 py-6">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3 21V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75V21" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-slate-500">Click to upload campaign image</p>
                      <p className="text-xs text-slate-400">JPG, PNG, WEBP · Recommended 800×600</p>
                    </div>
                  )}
                </div>
                <input
                  ref={imgInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImagePick}
                  className="hidden"
                />
                {form.image && (
                  <button
                    onClick={() => { set('image', null); set('imageFile', null); }}
                    className="mt-1.5 text-xs text-red-500 hover:text-red-700 font-semibold"
                  >
                    Remove image
                  </button>
                )}
              </div>

              {/* ── Campaign title ── */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Campaign Title *</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500"
                  value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Summer Win-Back Offer 2026"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Discount Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: 'no-discount', label: 'No Discount', icon: '⊖', desc: 'Send informational message' },
                    { v: 'free-item', label: 'Free Item', icon: '🎁', desc: 'Offer a complimentary item' },
                    { v: 'flat', label: 'Flat ₹ Discount', icon: '₹', desc: 'Fixed rupee off the bill' },
                    { v: 'percent', label: '% Discount', icon: '%', desc: 'Percentage off the bill' },
                  ].map(opt => (
                    <label key={opt.v} className={`flex items-start gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.discount_type === opt.v ? 'border-yellow-600 bg-cyan-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input type="radio" name="discount" value={opt.v} checked={form.discount_type === opt.v} onChange={() => set('discount_type', opt.v)} className="mt-0.5 accent-yellow-600" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{opt.icon} {opt.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              {(form.discount_type === 'flat' || form.discount_type === 'percent') && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Discount Value {form.discount_type === 'flat' ? '(₹)' : '(%)'}
                  </label>
                  <input type="number" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    value={form.discount_value} onChange={e => set('discount_value', e.target.value)} placeholder={form.discount_type === 'flat' ? '500' : '15'} />
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center text-white">
                    <WaIcon size={14} />
                  </div>
                  <span className="text-sm font-bold text-amber-800">{channelLabel} Message Preview</span>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <p className="text-xs text-slate-400 mb-1 font-medium">FROM: Your Brand</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap min-h-[60px]">
                    {form.message || 'Your message preview will appear here...'}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Campaign Message *</label>
                <textarea
                  rows={5}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                  value={form.message} onChange={e => set('message', e.target.value)}
                  placeholder="Hi {name}! 🎉 We have a special offer just for you. Use code SPECIAL to get 20% off your next order. Valid until 30 Jun 2026!"
                />
                <p className="text-xs text-slate-400 mt-1">Use {'{name}'}, {'{points}'}, {'{tier}'}, {'{coupon_code}'} as dynamic variables</p>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Target Audience</label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {[
                  { v: 'all', label: 'All Customers', count: '1,24,822', desc: 'Send to your entire customer base', icon: '👥' },
                  { v: 'active', label: 'Active Customers', count: '84,210', desc: 'Customers with purchase in last 90 days', icon: '✅' },
                  { v: 'dormant', label: 'Dormant Customers', count: '32,480', desc: 'No purchase in last 90+ days', icon: '😴' },
                  { v: 'champions', label: 'Champions Customers', count: '2,840', desc: 'High frequency, high spend customers', icon: '👑' },
                  { v: 'loyal', label: 'Loyal Customers', count: '5,120', desc: 'Consistent buyers with moderate-to-high spend', icon: '❤️' },
                  { v: 'potential', label: 'Potential Customers', count: '8,400', desc: 'Recent buyers with average spend', icon: '⚡' },
                  { v: 'at-risk', label: 'At Risk Customers', count: '3,200', desc: 'Customers showing signs of churning', icon: '⚠️' },
                  { v: 'lost', label: 'Lost Customers', count: '1,840', desc: 'Inactive customers, need aggressive win-back', icon: '❄️' },
                  { v: 'gold-plus', label: 'Gold & Above', count: '4,082', desc: 'Gold, Platinum, Diamond tier members', icon: '🥇' },
                  { v: 'new', label: 'New Customers', count: '8,420', desc: 'Joined in last 30 days', icon: '👋' },
                ].map(seg => (
                  <label key={seg.v} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${form.segment === seg.v ? 'border-yellow-600 bg-cyan-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name="segment" value={seg.v} checked={form.segment === seg.v} onChange={() => set('segment', seg.v)} className="accent-yellow-600" />
                    <span className="text-xl">{seg.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-800">{seg.label}</p>
                        <span className="text-xs font-bold text-amber-700 bg-cyan-50 border border-cyan-300 px-2 py-0.5 rounded-full">{seg.count}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{seg.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Delivery Channels</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: 'whatsapp', label: 'WhatsApp', icon: <WaIcon size={16} />, desc: 'Send via WhatsApp Business API' },
                    { v: 'sms', label: 'SMS', icon: 'SMS', desc: 'Send via mTalkz text message' },
                  ].map(opt => {
                    const active = form.channels.includes(opt.v);
                    return (
                      <label key={opt.v} className={`flex items-start gap-2.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${active ? 'border-yellow-600 bg-cyan-50' : 'border-slate-200 hover:border-slate-300'}`}>
                        <input type="checkbox" checked={active} onChange={() => toggleChannel(opt.v)} className="mt-0.5 accent-yellow-600" />
                        <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-700">{opt.icon}</span>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{opt.label}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Send Timing</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: 'now', label: 'Send Now', icon: '⚡', desc: 'Immediately to all recipients' },
                    { v: 'schedule', label: 'Schedule', icon: '📅', desc: 'Pick a date & time' },
                  ].map(opt => (
                    <label key={opt.v} className={`flex items-start gap-2.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${form.schedule === opt.v ? 'border-yellow-600 bg-cyan-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input type="radio" name="schedule" value={opt.v} checked={form.schedule === opt.v} onChange={() => set('schedule', opt.v)} className="mt-0.5 accent-yellow-600" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{opt.icon} {opt.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              {form.schedule === 'schedule' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Schedule Date & Time</label>
                  <input type="datetime-local" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    value={form.scheduled_at} onChange={e => set('scheduled_at', e.target.value)} />
                </div>
              )}

              {/* Campaign summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Campaign Summary</p>
                {[
                  { label: 'Campaign', value: form.title || '—' },
                  { label: 'Discount', value: form.discount_type.replace('-', ' ') + (form.discount_value ? ` — ${form.discount_type === 'flat' ? '₹' : ''}${form.discount_value}${form.discount_type === 'percent' ? '%' : ''}` : '') },
                  { label: 'Audience', value: form.segment.replace('-', ' ') },
                  { label: 'Channel', value: channelLabel },
                  { label: 'Timing', value: form.schedule === 'now' ? 'Send Immediately' : form.scheduled_at || '—' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-slate-500 capitalize">{row.label}</span>
                    <span className="font-semibold text-slate-900 capitalize">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>
          <div className="flex items-center gap-2">
            {step < 4 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 1 && !form.title}
                className="px-6 py-2.5 text-sm font-bold text-white bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
              >
                Continue <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button onClick={handleSaveDraft}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors">
                  Save Draft
                </button>
                <button onClick={handleSend}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl flex items-center gap-2 transition-colors shadow-md">
                  <PaperAirplaneIcon className="w-4 h-4" />
                  {form.schedule === 'now' ? 'Send Campaign 🚀' : 'Schedule Campaign'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Template Library Tab ─────────────────────────────────────────────────────
function TemplateLibrary({ onCreateCampaign, campaigns = [] }) {
  const [discountFilter, setDiscountFilter] = useState('all');
  const [waEnabled, setWaEnabled] = useState(false);
  const [search, setSearch] = useState('');

  const dbDrafts = campaigns.filter(c => c.status === 'draft').map(c => ({
    id: c.campaign_id || c._id,
    title: c.name || 'Untitled Campaign',
    status: 'Draft',
    discount: c.discount_type || 'no-discount',
    discount_value: c.discount_value || '',
    channel: c.channel || 'whatsapp',
    channels: c.channels || (c.channel === 'sms' ? ['sms'] : ['whatsapp']),
    whatsapp: true,
    image: c.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
    isDbDraft: true,
    message: c.message || '',
    segment: c.segment || 'all',
    schedule: c.schedule || 'now',
    scheduled_at: c.scheduled_at || '',
  }));

  const dynamicCollections = [
    {
      id: 'drafts',
      label: 'Drafts & Custom Campaigns',
      templates: dbDrafts,
    },
    ...TEMPLATE_COLLECTIONS.filter(col => col.id !== 'drafts')
  ];

  const filteredCollections = dynamicCollections.map(col => ({
    ...col,
    templates: col.templates.filter(t =>
      (discountFilter === 'all' || t.discount === discountFilter) &&
      (search === '' || t.title.toLowerCase().includes(search.toLowerCase()))
    ),
  })).filter(col => col.templates.length > 0 || col.id === 'drafts');

  return (
    <div className="space-y-6">
      {/* WhatsApp re-send promo banner */}
      <div
        className="rounded-2xl p-6 flex flex-col xl:flex-row items-center justify-between gap-6 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)' }}
      >
        <div className="flex-1 max-w-xl">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-pink-500">⚡</span>
            <span className="text-sm font-bold text-pink-600">What's New</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 leading-tight mb-2">
            Automatically re-send undelivered{' '}
            <span className="text-amber-700">WhatsApp message</span>{' '}
            💬 and improve delivery rate.
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Get them approved instantly and send your campaigns in a flash! No delays, just action.
          </p>
          <button className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-800 text-white text-sm font-bold rounded-xl transition-colors shadow-md">
            Try Now
          </button>
        </div>
        <div className="flex-shrink-0">
          {/* WhatsApp 3D icon illustration */}
          <div className="w-32 h-32 relative">
            <div className="w-24 h-24 bg-cyan-500 rounded-full flex items-center justify-center shadow-2xl mx-auto text-white">
              <WaIcon size={52} />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-xs font-black">📣</span>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {['bg-blue-400', 'bg-blue-300', 'bg-blue-400'].map((c, i) => (
                <div key={i} className={`w-1.5 h-1.5 ${c} rounded-full`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {DISCOUNT_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setDiscountFilter(f.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                discountFilter === f.id
                  ? 'bg-cyan-500 text-white border-yellow-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {f.icon && <span>{f.icon}</span>}
              {f.label}
            </button>
          ))}
        </div>

        {/* WhatsApp enabled toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center text-white">
            <WaIcon size={12} />
          </div>
          <span className="text-sm font-semibold text-slate-600">WhatsApp enabled</span>
          <div
            onClick={() => setWaEnabled(v => !v)}
            className={`w-10 h-5.5 rounded-full relative transition-colors cursor-pointer ${waEnabled ? 'bg-cyan-500' : 'bg-slate-300'}`}
            style={{ height: 22 }}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${waEnabled ? 'left-5' : 'left-0.5'}`} />
          </div>
        </label>
      </div>

      {/* Template collections */}
      {filteredCollections.map(col => (
        <section key={col.id}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900">{col.label}</h3>
            <button className="text-sm font-semibold text-amber-700 hover:underline">View all</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {col.id === 'drafts' && <ScratchCard onClick={() => onCreateCampaign(null)} />}
            {col.templates.map(t => (
              <TemplateCard key={t.id} t={t} onClick={tpl => onCreateCampaign(tpl)} />
            ))}
          </div>
        </section>
      ))}

      {/* Feedback banner */}
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex items-center gap-5">
        <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 80 80" className="w-14 h-14" fill="none">
            <circle cx="40" cy="40" r="38" fill="#e0f2fe" />
            <circle cx="40" cy="30" r="10" fill="#0284c7" opacity="0.8" />
            <path d="M20 62 Q40 48 60 62" fill="#0284c7" opacity="0.6" />
            <circle cx="28" cy="46" r="4" fill="#c9b96e" opacity="0.7" />
            <circle cx="52" cy="44" r="4" fill="#f59e0b" opacity="0.7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700">We want to make Reelo better for you. What other campaigns would you like to see?</p>
          <button className="text-sm font-bold text-amber-700 hover:underline mt-1">Give feedback</button>
        </div>
      </div>
    </div>
  );
}

// ─── Campaign Performance Tab ─────────────────────────────────────────────────
function CampaignPerformance({ onCreateCampaign, onEditCampaign, onViewCampaign, onDeleteCampaign, campaigns = [], loading }) {
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [showDropdown, setShowDropdown] = useState(false);

  // Map database campaigns
  const allCampaigns = campaigns.map(c => {
    const sent = c.sent || 0;
    const status = c.status || 'draft';
    const delivered = status === 'sent' ? (c.delivered || Math.round(sent * 0.96)) : 0;
    const read = status === 'sent' ? (c.read || c.opened || Math.round(delivered * 0.68)) : 0;
    const clicked = status === 'sent' ? (c.clicked || Math.round(read * 0.35)) : 0;
    const converted = c.converted || 0;
    const revenue = c.revenue || (converted * 150) || 0;

    return {
      id: c.campaign_id || c._id,
      name: c.name || 'Untitled Campaign',
      status: status,
      channel: 'whatsapp',
      sent: sent,
      delivered: delivered,
      read: read,
      clicked: clicked,
      converted: converted,
      revenue: revenue,
      message: c.message || '',
      segment: c.segment || 'all',
      date: c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
      _raw: c,
    };
  });

  const hasCampaigns = allCampaigns.length > 0;

  const totalSent = allCampaigns.reduce((s, c) => s + c.sent, 0);
  const totalRevenue = allCampaigns.reduce((s, c) => s + c.revenue, 0);
  const totalVisits = allCampaigns.reduce((s, c) => s + c.clicked, 0);
  const avgVisitRate = totalSent > 0 ? `${((totalVisits / totalSent) * 100).toFixed(1)}%` : '0%';

  const campaignsSentCount = allCampaigns.filter(c => c.status === 'sent').length;
  const revenueStr = totalRevenue >= 100000 ? `₹${(totalRevenue / 100000).toFixed(1)}L` :
                     totalRevenue >= 1000 ? `₹${(totalRevenue / 1000).toFixed(1)}K` : `₹${totalRevenue}`;

  // Dynamic chart data from the last 7 campaigns
  const chartData = allCampaigns.slice(0, 7).reverse().map(c => ({
    label: c.name.length > 15 ? c.name.slice(0, 12) + '...' : c.name,
    sent: c.sent || 0,
    converted: c.converted || 0,
  }));

  return (
    <div className="space-y-5">
      {/* Summary card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-base font-bold text-slate-900">Summary</h2>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(v => !v)}
              className="flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 bg-white rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors"
            >
              {dateRange}
              <ChevronDownIcon className="w-3.5 h-3.5" />
            </button>
            {showDropdown && (
              <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-xl shadow-xl z-10 py-1 min-w-[160px]">
                {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year'].map(r => (
                  <button key={r} onClick={() => { setDateRange(r); setShowDropdown(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Campaigns sent', value: campaignsSentCount },
            { label: 'Revenue', value: revenueStr },
            { label: 'Avg visit rate', value: avgVisitRate },
            { label: 'Customer visits', value: totalVisits.toLocaleString('en-IN'), hasInfo: true },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl px-4 py-3 border border-slate-100">
              <div className="flex items-center gap-1 mb-1">
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                {s.hasInfo && <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-slate-300" />}
              </div>
              <p className="text-xl font-black text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      {hasCampaigns && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Campaign Delivery Trend</h2>
            <div className="flex gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-cyan-500 inline-block" />Sent</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-cyan-500 inline-block" />Converted</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="sent" name="Sent" fill="#c9b96e" fillOpacity={0.25} radius={[6, 6, 0, 0]} />
              <Bar dataKey="converted" name="Converted" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Campaign table */}
      {hasCampaigns ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">All Campaigns</h2>
            <button
              onClick={() => onCreateCampaign(null)}
              className="flex items-center gap-1.5 text-sm font-bold text-white bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-xl transition-colors"
            >
              <PlusIcon className="w-4 h-4" /> New Campaign
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Campaign', 'Status', 'Sent', 'Delivered', 'Read', 'Clicked', 'Converted', 'Revenue', 'Date'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allCampaigns.map(c => {
                  const delivRate = c.sent > 0 ? Math.round(c.delivered / c.sent * 100) : 0;
                  const readRate = c.delivered > 0 ? Math.round(c.read / c.delivered * 100) : 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 text-white">
                            <WaIcon size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                            <p className="text-xs text-slate-400">WhatsApp</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLE[c.status]}`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-slate-700">{c.sent.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-semibold text-slate-700">{c.delivered.toLocaleString('en-IN')}</span>
                        {c.sent > 0 && <span className="text-xs text-slate-400 ml-1">({delivRate}%)</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-semibold text-slate-700">{c.read.toLocaleString('en-IN')}</span>
                        {c.delivered > 0 && <span className="text-xs text-slate-400 ml-1">({readRate}%)</span>}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-amber-700">{c.clicked.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-bold text-amber-600">{c.converted.toLocaleString('en-IN')}</span>
                        {c.sent > 0 && c.converted > 0 && (
                          <span className="text-xs text-slate-400 ml-1">({convRate(c.converted, c.sent)})</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-bold text-amber-600">
                        {c.revenue > 0 ? `₹${fmtNum(c.revenue)}` : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400">{c.date}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewCampaign(c)}
                            title="View campaign"
                            className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 transition-colors"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditCampaign(c._raw)}
                            title="Edit campaign"
                            className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteCampaign(c._raw)}
                            title="Delete campaign"
                            className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {/* Envelope illustration */}
          <div className="mb-6 relative">
            <div className="w-28 h-20 relative mx-auto">
              <div className="absolute inset-0 bg-pink-100 rounded-2xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 120 80" className="w-full h-full" fill="none">
                  <rect x="5" y="15" width="110" height="60" rx="6" fill="#fecdd3" />
                  <path d="M5 21 L60 50 L115 21" stroke="#f43f5e" strokeWidth="2" fill="none" />
                  <path d="M5 75 L40 48" stroke="#f43f5e" strokeWidth="1.5" opacity="0.5" />
                  <path d="M115 75 L80 48" stroke="#f43f5e" strokeWidth="1.5" opacity="0.5" />
                  {/* Flying person */}
                  <circle cx="25" cy="35" r="5" fill="#1e3a5f" />
                  <path d="M20 40 Q25 55 30 40" fill="#1e3a5f" />
                  <path d="M15 38 Q20 43 25 40" stroke="#1e3a5f" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M30 38 Q35 33 40 35" stroke="#1e3a5f" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Clouds */}
                  <ellipse cx="70" cy="10" rx="8" ry="4" fill="#fca5a5" opacity="0.5" />
                  <ellipse cx="90" cy="6" rx="6" ry="3" fill="#fca5a5" opacity="0.4" />
                  <ellipse cx="50" cy="8" rx="5" ry="3" fill="#fca5a5" opacity="0.4" />
                </svg>
              </div>
            </div>
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">Ready to Launch? Send Your First Campaign Now!</h3>
          <p className="text-sm text-slate-400 mb-5">Create a WhatsApp campaign and start engaging your customers</p>
          <button
            onClick={() => onCreateCampaign(null)}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-800 text-white font-bold rounded-xl transition-colors shadow-md text-sm"
          >
            Create Your First Campaign
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Campaign Detail (View) Modal ─────────────────────────────────────────────
function CampaignDetailModal({ campaign, onClose, onEdit }) {
  if (!campaign) return null;
  const rows = [
    { label: 'Status', value: campaign.status },
    { label: 'Channel', value: 'WhatsApp' },
    { label: 'Audience / Segment', value: campaign.segment || 'All customers' },
    { label: 'Sent', value: (campaign.sent || 0).toLocaleString('en-IN') },
    { label: 'Delivered', value: (campaign.delivered || 0).toLocaleString('en-IN') },
    { label: 'Read', value: (campaign.read || 0).toLocaleString('en-IN') },
    { label: 'Clicked', value: (campaign.clicked || 0).toLocaleString('en-IN') },
    { label: 'Converted', value: (campaign.converted || 0).toLocaleString('en-IN') },
    { label: 'Revenue', value: campaign.revenue > 0 ? `₹${fmtNum(campaign.revenue)}` : '—' },
    { label: 'Created', value: campaign.date || '—' },
  ];
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-cyan-500 rounded-xl flex items-center justify-center text-white">
              <WaIcon size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{campaign.name}</p>
              <p className="text-xs text-slate-400">WhatsApp Campaign</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors text-xl">×</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {campaign.message && (
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Message</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{campaign.message}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {rows.map(r => (
              <div key={r.label} className="rounded-xl border border-slate-100 px-3 py-2.5">
                <p className="text-[11px] text-slate-400 font-medium">{r.label}</p>
                <p className="text-sm font-bold text-slate-800 capitalize mt-0.5">{r.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Close
          </button>
          <button onClick={onEdit} className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors">
            <PencilIcon className="w-4 h-4" /> Edit Campaign
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Campaign Confirmation Modal ───────────────────────────────────────
function DeleteCampaignModal({ campaign, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <TrashIcon className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Delete Campaign?</h3>
          <p className="text-sm text-slate-500 mt-1.5">
            <span className="font-semibold text-slate-700">"{campaign?.name || 'This campaign'}"</span> will be permanently removed. This action cannot be undone.
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
export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState('library');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewCampaign, setViewCampaign] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const returnToRef = useRef(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/campaigns');
      if (res && res.data && res.data.campaigns) {
        setCampaigns(res.data.campaigns);
      }
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const openBuilder = (template) => {
    setSelectedTemplate(template);
    setBuilderOpen(true);
  };

  // Open the builder pre-filled to edit an existing campaign
  const editCampaign = (c) => {
    openBuilder({
      id: c.campaign_id || c._id,
      isDbDraft: true,
      title: c.name || 'Untitled Campaign',
      message: c.message || '',
      discount: c.discount_type || 'no-discount',
      discount_value: c.discount_value || '',
      segment: c.segment || 'all',
      schedule: c.schedule || 'now',
      scheduled_at: c.scheduled_at || '',
      image: c.image || null,
    });
  };

  const handleDeleteCampaign = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.campaign_id || deleteTarget._id;
    try {
      await api.delete(`/campaigns/${id}`);
      toast.success('Campaign deleted');
      setCampaigns(prev => prev.filter(c => (c.campaign_id || c._id) !== id));
    } catch (err) {
      console.error('Error deleting campaign:', err);
      toast.error('Failed to delete campaign');
    } finally {
      setDeleteTarget(null);
    }
  };

  // Close the builder. If we arrived here from another page (e.g. Smart Insights),
  // return the user to that origin page.
  const closeBuilder = () => {
    setBuilderOpen(false);
    setSelectedTemplate(null);
    if (returnToRef.current) {
      const dest = returnToRef.current;
      returnToRef.current = null;
      navigate(dest);
    }
  };

  useEffect(() => {
    if (location.state?.openBuilder) {
      const seg = location.state.segment;
      // Remember where the user came from so we can send them back on close
      returnToRef.current = location.state.from || null;
      const segmentKey = seg ? seg.toLowerCase().replace(' ', '-') : 'all';
      openBuilder({
        title: seg ? `${seg} Special Campaign` : 'New Campaign',
        segment: segmentKey,
      });
      // Clear history state so it doesn't reopen on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="space-y-0 pb-8 animate-slide-up">
      {/* Page title */}
      <div className="mb-5">
        <h1 className="text-2xl font-black text-slate-900">Campaigns</h1>
      </div>

      {/* Tab navigation — underline style matching screenshot */}
      <div className="border-b border-slate-200 mb-6">
        <div className="flex gap-0">
          {[
            { id: 'library', label: 'Template Library' },
            { id: 'performance', label: 'Campaign Performance' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-1 pb-3 mr-8 text-sm font-semibold transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'library' && (
        <TemplateLibrary
          onCreateCampaign={openBuilder}
          campaigns={campaigns}
        />
      )}
      {activeTab === 'performance' && (
        <CampaignPerformance
          onCreateCampaign={openBuilder}
          onEditCampaign={editCampaign}
          onViewCampaign={setViewCampaign}
          onDeleteCampaign={setDeleteTarget}
          campaigns={campaigns}
          loading={loading}
        />
      )}

      {/* Campaign Builder Modal */}
      {builderOpen && (
        <CampaignBuilder
          template={selectedTemplate}
          onClose={closeBuilder}
          onSuccess={() => {
            fetchCampaigns();
            setActiveTab('performance');
          }}
        />
      )}

      {/* Campaign View Modal */}
      {viewCampaign && (
        <CampaignDetailModal
          campaign={viewCampaign}
          onClose={() => setViewCampaign(null)}
          onEdit={() => { const c = viewCampaign; setViewCampaign(null); editCampaign(c); }}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteCampaignModal
          campaign={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteCampaign}
        />
      )}
    </div>
  );
}
