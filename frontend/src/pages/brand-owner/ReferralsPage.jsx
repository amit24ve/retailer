import { useState, useEffect } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  ArrowRightIcon, ChevronDownIcon, CheckIcon,
  ShareIcon, PlayIcon, XMarkIcon, PencilIcon,
  EyeIcon, TrashIcon, PlusIcon,
} from '@heroicons/react/24/outline';

// ─── Mock referral data ───────────────────────────────────────────────────────
function getMockReferrals() {
  const names = ['Siddharth Sharma', 'Priya Patel', 'Rahul Gupta', 'Anjali Singh', 'Vikram Mehta'];
  const statuses = ['rewarded', 'purchased', 'signed_up', 'pending', 'expired'];
  return Array.from({ length: 12 }, (_, i) => ({
    referral_id: `ref-${i}`,
    referrer_name: names[i % names.length],
    referred_mobile: `+9190000${String(10000 + i).padStart(5, '0')}`,
    referred_name: ['Neha', 'Karan', 'Divya', 'Rohit', 'Simran'][i % 5],
    status: statuses[i % statuses.length],
    referrer_reward_credited: i % 3 === 0,
    referred_reward_credited: i % 4 === 0,
    created_at: new Date(Date.now() - i * 86400000 * 3).toISOString(),
  }));
}

const normalizeChannels = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    if (value === 'both') return ['whatsapp', 'sms'];
    return value.split(',').map(channel => channel.trim()).filter(Boolean);
  }
  return ['whatsapp'];
};

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepBar({ current, total, onBack, onNext, onSaveDraft, canProceed }) {
  return (
    <div className="flex items-center justify-between py-3 px-1 mb-6 border-b border-slate-100">
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-xs font-semibold text-slate-500">Step {current} / {total}</span>
        {/* Progress dots */}
        <div className="flex items-center gap-1.5 ml-1">
          {Array.from({ length: total }, (_, i) => (
            <div key={i} className="rounded-full transition-all duration-300"
              style={{
                width: i + 1 === current ? 20 : 8,
                height: 8,
                background: i + 1 <= current ? '#a89442' : '#e2e8f0',
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onSaveDraft}
          className="text-sm font-semibold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors">
          Save as draft
        </button>
        <button onClick={onNext} disabled={!canProceed}
          className="flex items-center gap-2 text-sm font-bold text-white px-5 py-2 rounded-xl transition-all disabled:opacity-40"
          style={{ background: '#a89442' }}>
          Next <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Phone Preview — referral landing page ────────────────────────────────────
function ReferralPhonePreview({ tab, landingTitle, brandName }) {
  return (
    <div className="flex flex-col items-center">
      {/* Tab switcher above phone */}
      <div className="flex items-center gap-1 mb-4 bg-white/60 backdrop-blur p-1 rounded-full border border-slate-200 shadow-sm">
        {['New customer page', 'Success page'].map(t => (
          <button key={t}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={tab === t
              ? { background: '#a89442', color: 'white' }
              : { color: '#64748b' }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Phone frame */}
      <div className="relative mx-auto" style={{ width: 220 }}>
        {/* Phone shell */}
        <div className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-slate-900 bg-white" style={{ minHeight: 380 }}>
          {/* Status bar */}
          <div className="h-6 bg-slate-900 flex items-center justify-center">
            <div className="w-16 h-3 rounded-full bg-black mx-auto" />
          </div>

          {/* Screen content */}
          <div className="bg-cyan-800 px-4 py-5 relative overflow-hidden" style={{ minHeight: 340 }}>
            {/* Pattern bg */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            <div className="relative z-10">
              {/* Sender line */}
              <p className="text-white/70 text-[10px] font-medium mb-1">Amit sent you a gift! 🎁</p>

              {/* Big headline */}
              <h3 className="text-white font-black text-lg leading-snug mb-4">
                {landingTitle || 'Get reward on\nyour first\npurchase!'}
              </h3>

              {/* Brand logo + name */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-white/30">
                  <span className="text-[10px] font-black text-amber-800 uppercase">
                    {brandName?.slice(0, 7) || 'FINANCE'}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <span className="text-sm">🔗</span>
                </div>
                <span className="text-white/80 text-xs font-semibold">{brandName || 'finance'}</span>
              </div>

              {/* White card — claim form */}
              <div className="bg-white rounded-2xl p-3 shadow-lg">
                <p className="text-xs text-slate-700 font-semibold mb-0.5">Enter your details & claim it now.</p>
                <p className="text-[10px] text-slate-400 mb-3">Don't forget to thank your friend!</p>
                <div className="space-y-2">
                  <div className="border border-slate-200 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-slate-400">Your Name</p>
                  </div>
                  <div className="border border-slate-200 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-slate-400">Your Phone Number</p>
                  </div>
                  <div className="bg-cyan-500 rounded-lg px-3 py-2 text-center">
                    <p className="text-[10px] text-white font-bold">Claim Reward</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: New customer reward ──────────────────────────────────────────────
function Step1({ config, onChange }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xl font-black text-slate-900 leading-snug">
          Let's start! What's the reward you want to<br />offer your new customers?
        </p>
      </div>

      <div>
        <p className="text-sm font-bold text-slate-700 mb-3">New customers will get</p>
        <div className="space-y-2.5">
          {[
            { v: 'flat', icon: '₹', iconBg: '#f0fdfa', label: '₹ Discount', desc: 'Fixed amount off their first order' },
            { v: 'percent', icon: '%', iconBg: '#eff6ff', label: '% Discount', desc: 'Percentage off their first order' },
            { v: 'free_item', icon: '🎁', iconBg: '#faf5ff', label: 'Free Item', desc: 'A complimentary product for signing up' },
          ].map(opt => (
            <label key={opt.v}
              className="flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 cursor-pointer transition-all"
              style={{
                borderColor: config.rewardType === opt.v ? '#a89442' : '#e2e8f0',
                background: config.rewardType === opt.v ? '#f0fdfa' : 'white',
              }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                  style={{ background: opt.iconBg }}>
                  {opt.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{opt.label}</p>
                  <p className="text-xs text-slate-400">{opt.desc}</p>
                </div>
              </div>
              <input type="radio" name="rewardType" value={opt.v}
                checked={config.rewardType === opt.v}
                onChange={() => onChange({ ...config, rewardType: opt.v })}
                className="w-4 h-4" style={{ accentColor: '#a89442' }} />
            </label>
          ))}
        </div>
      </div>

      {/* Reward value */}
      {config.rewardType !== 'free_item' && (
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
            Reward Value {config.rewardType === 'flat' ? '(₹)' : '(%)'}
          </label>
          <input type="number"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 bg-white"
            value={config.rewardValue}
            onChange={e => onChange({ ...config, rewardValue: e.target.value })}
            placeholder={config.rewardType === 'flat' ? '100' : '10'} />
        </div>
      )}

      {/* Landing page title */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1.5">Landing page title</label>
        <p className="text-xs text-slate-400 mb-2">0 / 120 characters</p>
        <textarea rows={3}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 bg-white resize-none"
          value={config.landingTitle}
          onChange={e => onChange({ ...config, landingTitle: e.target.value })}
          placeholder="Enter Message Template"
          maxLength={120} />
      </div>

      {/* Reward expiry */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-3">Reward expires in</label>
        <div className="flex items-center gap-2">
          <input type="number" min={0}
            className="w-20 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 bg-white text-center font-bold"
            value={config.expiryDays}
            onChange={e => onChange({ ...config, expiryDays: parseInt(e.target.value) || 0 })} />
          <div className="relative">
            <select className="appearance-none border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 bg-white">
              <option>days</option>
              <option>weeks</option>
              <option>months</option>
            </select>
            <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <span className="text-sm text-slate-500">After claiming the reward</span>
        </div>
      </div>

      {/* Send reminder */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Send a reminder to customers</label>
        <p className="text-xs text-slate-400 mb-3">Channels selected in next steps will be used for this</p>
        <div className="flex items-center gap-2">
          <input type="number" min={0}
            className="w-20 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 bg-white text-center font-bold"
            value={config.reminderDays}
            onChange={e => onChange({ ...config, reminderDays: parseInt(e.target.value) || 0 })} />
          <div className="relative">
            <select className="appearance-none border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 bg-white">
              <option>days</option>
              <option>weeks</option>
            </select>
            <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <span className="text-sm text-slate-500">Before the reward expires</span>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Referrer reward ───────────────────────────────────────────────────
function Step2({ config, onChange }) {
  return (
    <div className="space-y-6">
      <p className="text-xl font-black text-slate-900 leading-snug">
        What reward does the<br /><span className="text-amber-700">referrer</span> get?
      </p>
      <div>
        <p className="text-sm font-bold text-slate-700 mb-3">Referring customer will get</p>
        <div className="space-y-2.5">
          {[
            { v: 'points', icon: '⭐', iconBg: '#fffbeb', label: 'Bonus Points', desc: 'Add loyalty points to their account' },
            { v: 'flat', icon: '₹', iconBg: '#f0fdfa', label: '₹ Discount Coupon', desc: 'Issue a flat discount coupon' },
            { v: 'percent', icon: '%', iconBg: '#eff6ff', label: '% Discount Coupon', desc: 'Issue a percentage discount coupon' },
          ].map(opt => (
            <label key={opt.v}
              className="flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 cursor-pointer transition-all"
              style={{
                borderColor: config.referrerReward === opt.v ? '#a89442' : '#e2e8f0',
                background: config.referrerReward === opt.v ? '#f0fdfa' : 'white',
              }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                  style={{ background: opt.iconBg }}>
                  {opt.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{opt.label}</p>
                  <p className="text-xs text-slate-400">{opt.desc}</p>
                </div>
              </div>
              <input type="radio" name="referrerReward" value={opt.v}
                checked={config.referrerReward === opt.v}
                onChange={() => onChange({ ...config, referrerReward: opt.v })}
                className="w-4 h-4" style={{ accentColor: '#a89442' }} />
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
          Reward Amount {config.referrerReward === 'points' ? '(Points)' : config.referrerReward === 'flat' ? '(₹)' : '(%)'}
        </label>
        <input type="number"
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 bg-white"
          value={config.referrerValue}
          onChange={e => onChange({ ...config, referrerValue: e.target.value })}
          placeholder={config.referrerReward === 'points' ? '250' : config.referrerReward === 'flat' ? '100' : '10'} />
      </div>
    </div>
  );
}

// ─── Step 3: Channel selection ────────────────────────────────────────────────
function Step3({ config, onChange }) {
  const selectedChannels = normalizeChannels(config.channels);
  const toggleChannel = (ch) => {
    const channels = selectedChannels.includes(ch)
      ? selectedChannels.filter(c => c !== ch)
      : [...selectedChannels, ch];
    onChange({ ...config, channels });
  };
  return (
    <div className="space-y-6">
      <p className="text-xl font-black text-slate-900">
        How should we send the<br /><span className="text-amber-700">referral link</span>?
      </p>
      <p className="text-sm text-slate-500">Select channels to share the referral link with your customers</p>
      <div className="space-y-3">
        {[
          { v: 'whatsapp', icon: '💬', label: 'WhatsApp', desc: 'Send via WhatsApp Business API', recommended: true },
          { v: 'sms', icon: '📱', label: 'SMS', desc: 'Send via text message' },
          { v: 'email', icon: '✉️', label: 'Email', desc: 'Send via email' },
        ].map(ch => {
          const active = selectedChannels.includes(ch.v);
          return (
            <label
              key={ch.v}
              className="w-full flex items-center justify-between px-4 py-4 rounded-2xl border-2 cursor-pointer transition-all text-left select-none"
              style={{
                borderColor: active ? '#a89442' : '#e2e8f0',
                background: active ? '#f0fdfa' : 'white',
              }}>
              <input
                type="checkbox"
                className="sr-only"
                checked={active}
                onChange={() => toggleChannel(ch.v)}
              />
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-xl">{ch.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{ch.label}</p>
                    {ch.recommended && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-cyan-200 text-amber-800">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{ch.desc}</p>
                </div>
              </div>
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
                style={{ borderColor: active ? '#a89442' : '#cbd5e1', background: active ? '#a89442' : 'white' }}
              >
                {active && <CheckIcon className="w-3 h-3 text-white" />}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 4: Review & activate ────────────────────────────────────────────────
function Step4({ config }) {
  return (
    <div className="space-y-5">
      <p className="text-xl font-black text-slate-900">Review your referral program</p>
      <div className="space-y-3">
        {[
          { label: 'New customer reward', value: `${config.rewardType === 'flat' ? '₹' : config.rewardType === 'percent' ? '' : ''}${config.rewardValue || '—'}${config.rewardType === 'percent' ? '%' : ''} ${config.rewardType === 'free_item' ? 'Free Item' : config.rewardType === 'flat' ? 'Off' : 'Off'}` },
          { label: 'Referrer reward', value: `${config.referrerReward === 'points' ? '' : config.referrerReward === 'flat' ? '₹' : ''}${config.referrerValue || '—'}${config.referrerReward === 'points' ? ' pts' : config.referrerReward === 'percent' ? '%' : ''} ${config.referrerReward !== 'points' ? 'Off' : 'Bonus Points'}` },
          { label: 'Landing page title', value: config.landingTitle || 'Not set' },
          { label: 'Reward expires', value: config.expiryDays ? `${config.expiryDays} days after claiming` : 'No expiry' },
          { label: 'Channels', value: normalizeChannels(config.channels).join(', ') || 'None selected' },
        ].map(r => (
          <div key={r.label} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{r.label}</span>
            <span className="text-sm font-bold text-slate-900 capitalize">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── "How it works" video section ────────────────────────────────────────────
function HowItWorksSection({ userName, onStart }) {
  const [showVideo, setShowVideo] = useState(false);
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 min-h-[420px] rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      {/* Left: illustration + image */}
      <div className="relative bg-cyan-50 flex flex-col justify-end overflow-hidden">
        {/* Top image */}
        <div className="absolute top-0 left-0 right-0" style={{ height: '45%' }}>
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&q=75"
            alt="customer at store"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-50/90" />
        </div>

        {/* Caption */}
        <div className="relative z-10 px-8 pb-6 pt-[45%]">
          <p className="text-sm text-slate-700 leading-relaxed">
            Let's say, <span className="font-bold">Anu</span> is your{' '}
            <span className="font-bold text-amber-700">repeat customer</span> and makes a purchase at your store
          </p>
        </div>

        {/* Customer photo circle */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4">
          <div className="w-24 h-24 rounded-full border-4 border-cyan-200 overflow-hidden shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80"
              alt="customer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Right: CTA */}
      <div className="flex flex-col justify-center px-10 py-12">
        <p className="text-sm text-slate-500 mb-2">Hey {userName || 'there'},</p>
        <h2 className="text-2xl font-black text-slate-900 leading-snug mb-6">
          Are you wondering how a<br />Referral Program works?
        </h2>
        <button
          onClick={() => setShowVideo(true)}
          className="inline-flex items-center gap-2.5 font-bold text-white px-6 py-3 rounded-xl text-sm w-fit transition-all hover:opacity-90 shadow-md"
          style={{ background: '#a89442' }}
        >
          See How <ArrowRightIcon className="w-4 h-4" />
        </button>

        {/* How it works steps */}
        <div className="mt-8 space-y-4">
          {[
            { step: 1, icon: '📲', title: 'Referrer Shares', desc: 'Customer shares their unique referral link' },
            { step: 2, icon: '👤', title: 'Friend Signs Up', desc: 'New customer registers using the referral link' },
            { step: 3, icon: '🛍️', title: 'Friend Purchases', desc: 'Friend completes their first qualifying order' },
            { step: 4, icon: '🎁', title: 'Both Get Rewarded', desc: 'Friend gets a discount, referrer earns bonus points' },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: '#f0fdfa', border: '2px solid #a89442' }}>
                <span className="text-[10px] font-black text-amber-800">{s.step}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{s.title}</p>
                <p className="text-xs text-slate-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video modal placeholder */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setShowVideo(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowVideo(false)} className="float-right text-slate-400 hover:text-slate-700">
              <XMarkIcon className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-cyan-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlayIcon className="w-8 h-8 text-amber-700" />
            </div>
            <p className="text-lg font-black text-slate-900 mb-2">How Referral Program Works</p>
            <p className="text-sm text-slate-500">Your video demo would play here</p>
            <button onClick={onStart}
              className="mt-5 w-full py-3 font-bold text-white rounded-xl text-sm"
              style={{ background: '#a89442' }}>
              Set Up My Referral Program →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Referral Activity Table ──────────────────────────────────────────────────
const STATUS_STYLE = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  signed_up: 'bg-blue-50 text-blue-700 border-blue-200',
  purchased: 'bg-cyan-50 text-amber-700 border-cyan-200',
  rewarded:  'bg-cyan-50 text-amber-800 border-cyan-300',
  expired:   'bg-red-50 text-red-600 border-red-200',
};

function ActivityTable({ referrals, loading, onView, onDelete }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? referrals : referrals.filter(r => r.status === filter);
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-sm font-bold text-slate-900">Referral Activity</h3>
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full">
          {['all', 'rewarded', 'purchased', 'pending', 'expired'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all"
              style={filter === f ? { background: '#a89442', color: 'white' } : { color: '#64748b' }}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-50 bg-slate-50">
              {['Referrer', 'Friend', 'Status', 'Referrer Reward', 'Friend Reward', 'Date'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : filtered.map(r => (
                  <tr key={r.referral_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-yellow-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {r.referrer_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{r.referrer_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-slate-700">{r.referred_name || '—'}</p>
                      <p className="text-xs text-slate-400 font-mono">{r.referred_mobile}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLE[r.status] || ''}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${r.referrer_reward_credited ? 'bg-cyan-50 text-amber-700 border-cyan-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {r.referrer_reward_credited ? '✓ +250 pts' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${r.referred_reward_credited ? 'bg-cyan-50 text-amber-700 border-cyan-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {r.referred_reward_credited ? '✓ ₹100 off' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">
                      {r.created_at ? format(new Date(r.created_at), 'dd MMM yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onView?.(r)}
                          title="View referral"
                          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 transition-colors">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete?.(r)}
                          title="Delete referral"
                          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                  No referrals found for this filter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Record Referral Modal ────────────────────────────────────────────────────
function RecordReferralModal({ onClose, onSaved, defaultChannels = ['whatsapp'] }) {
  const initialChannels = normalizeChannels(defaultChannels);
  const [form, setForm] = useState({
    referrer_name: '',
    referred_name: '',
    referred_mobile: '',
    referred_email: '',
    status: 'pending',
    channel: initialChannels[0] || 'whatsapp',
    channels: initialChannels,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleChannel = (ch) => {
    setForm((f) => {
      const exists = f.channels.includes(ch);
      const channels = exists ? f.channels.filter(c => c !== ch) : [...f.channels, ch];
      const nextChannels = channels.length ? channels : [ch];
      return { ...f, channels: nextChannels, channel: nextChannels[0] };
    });
  };

  const handleSave = async () => {
    if (!form.referrer_name.trim() || !form.referred_mobile.trim()) {
      toast.error('Referrer name and friend mobile are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        channel: form.channels.length === 2 && form.channels.includes('sms') && form.channels.includes('whatsapp') ? 'both' : form.channels[0],
        channels: normalizeChannels(form.channels),
      };
      const res = await api.post('/referrals', payload);
      const send = res.data?.send_result;
      if (send) {
        toast.success(`Referral recorded. Sent: ${send.sent || 0}, Failed: ${send.failed || 0}`);
      } else {
        toast.success('Referral recorded! 🤝');
      }
      onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to record referral');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-slide-up overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-sm font-bold text-slate-900">Record a Referral</p>
            <p className="text-xs text-slate-400">Track who your customers have referred</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Referrer (your customer) *</label>
            <input className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={form.referrer_name} onChange={e => set('referrer_name', e.target.value)} placeholder="e.g. Priya Patel" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Friend Name</label>
              <input className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={form.referred_name} onChange={e => set('referred_name', e.target.value)} placeholder="e.g. Neha" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Friend Mobile *</label>
              <input className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={form.referred_mobile} onChange={e => set('referred_mobile', e.target.value)} placeholder="+91…" />
            </div>
          </div>
          {form.channels.includes('email') && (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Friend Email</label>
              <input className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={form.referred_email} onChange={e => set('referred_email', e.target.value)} placeholder="friend@example.com" />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Status</label>
            <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="pending">Pending</option>
              <option value="signed_up">Signed Up</option>
              <option value="purchased">Purchased</option>
              <option value="rewarded">Rewarded</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Send Via</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: 'whatsapp', label: 'WhatsApp' },
                { v: 'sms', label: 'SMS' },
                { v: 'email', label: 'Email' },
              ].map(ch => {
                const active = form.channels.includes(ch.v);
                return (
                  <button
                    key={ch.v}
                    type="button"
                    onClick={() => toggleChannel(ch.v)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${active ? 'border-amber-600 bg-cyan-50 text-amber-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    {ch.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition-colors flex items-center justify-center gap-2" style={{ background: '#a89442' }}>
              {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── View Referral Modal ──────────────────────────────────────────────────────
function ViewReferralModal({ referral, onClose }) {
  if (!referral) return null;
  const rows = [
    { label: 'Referrer', value: referral.referrer_name },
    { label: 'Friend', value: referral.referred_name || '—' },
    { label: 'Friend Mobile', value: referral.referred_mobile || '—' },
    { label: 'Status', value: referral.status },
    { label: 'Channel', value: referral.channel || 'whatsapp' },
    { label: 'Referrer Reward', value: referral.referrer_reward_credited ? 'Credited' : 'Pending' },
    { label: 'Friend Reward', value: referral.referred_reward_credited ? 'Credited' : 'Pending' },
    { label: 'Date', value: referral.created_at ? format(new Date(referral.created_at), 'dd MMM yyyy, HH:mm') : '—' },
  ];
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl animate-slide-up overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-900">Referral Details</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-2">
          {rows.map(r => (
            <div key={r.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-400 font-medium">{r.label}</span>
              <span className="text-slate-800 font-semibold capitalize text-right">{r.value}</span>
            </div>
          ))}
        </div>
        <div className="px-6 pb-5">
          <button onClick={onClose} className="w-full py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Referral Confirmation ─────────────────────────────────────────────
function DeleteReferralModal({ referral, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl animate-slide-up overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <TrashIcon className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Delete Referral?</h3>
          <p className="text-sm text-slate-500 mt-1.5">
            This referral record for <span className="font-semibold text-slate-700">{referral?.referred_name || referral?.referred_mobile || 'this friend'}</span> will be permanently removed.
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
export default function ReferralsPage() {
  const { user } = useAuth();
  const [view, setView] = useState('landing');   // landing | setup | active
  const [step, setStep] = useState(1);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewTab] = useState('New customer page');
  const [activeTab, setActiveTab] = useState('overview');   // overview | sent
  const [showRecord, setShowRecord] = useState(false);
  const [viewingRef, setViewingRef] = useState(null);
  const [deletingRef, setDeletingRef] = useState(null);
  const [config, setConfig] = useState({
    rewardType: 'flat',
    rewardValue: '100',
    landingTitle: 'Get reward on your first purchase!',
    expiryDays: 30,
    reminderDays: 3,
    referrerReward: 'points',
    referrerValue: '250',
    channels: ['whatsapp'],
  });

  const fetchReferrals = () => {
    setLoading(true);
    api.get('/referrals')
      .then(r => setReferrals(r.data.referrals || []))
      .catch(() => setReferrals(getMockReferrals()))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (view === 'active') Promise.resolve().then(fetchReferrals);
  }, [view]);

  useEffect(() => {
    api.get('/referrals/program')
      .then((r) => {
        if (r.data?.program) {
          setConfig((prev) => ({ ...prev, ...r.data.program, channels: normalizeChannels(r.data.program.channels || r.data.program.channel) }));
          setView('active');
        }
      })
      .catch(() => {});
  }, []);

  const TOTAL_STEPS = 4;

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(s => s + 1);
    else {
      // Activate — save the program configuration
      api.post('/referrals/program', config).catch(() => {});
      toast.success('Referral program activated! 🎉');
      setActiveTab('overview');
      setView('active');
    }
  };

  const handleDeleteReferral = async () => {
    if (!deletingRef) return;
    try {
      await api.delete(`/referrals/${deletingRef.referral_id}`);
      setReferrals(prev => prev.filter(r => r.referral_id !== deletingRef.referral_id));
      toast.success('Referral deleted');
    } catch {
      toast.error('Failed to delete referral');
    } finally {
      setDeletingRef(null);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
    else setView('landing');
  };

  const stats = [
    { label: 'Total Referrals', value: referrals.length.toLocaleString('en-IN'), icon: '🤝', color: 'text-amber-600', bg: 'bg-cyan-50' },
    { label: 'Conversions', value: referrals.filter(r => r.status === 'rewarded' || r.status === 'purchased').length.toLocaleString('en-IN'), icon: '✅', color: 'text-amber-600', bg: 'bg-cyan-50' },
    { label: 'Points Rewarded', value: `${(referrals.filter(r => r.referrer_reward_credited).length * 250).toLocaleString('en-IN')}`, icon: '⭐', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'New Members', value: referrals.filter(r => r.referred_reward_credited).length.toLocaleString('en-IN'), icon: '👤', color: 'text-amber-700', bg: 'bg-cyan-50' },
  ];

  // ── Landing view ──
  if (view === 'landing') {
    return (
      <div className="space-y-6 pb-10 animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Referral Program</h1>
            <p className="text-sm text-slate-500 mt-1">Turn your happy customers into your best salespeople</p>
          </div>
          <button onClick={() => { setStep(1); setView('setup'); }}
            className="flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-xl shadow-md transition-all hover:opacity-90"
            style={{ background: '#a89442' }}>
            Set Up Referral Program <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
        <HowItWorksSection userName={user?.full_name?.split(' ')[0]} onStart={() => { setStep(1); setView('setup'); }} />
      </div>
    );
  }

  // ── Setup flow ──
  if (view === 'setup') {
    return (
      <div className="pb-10 animate-slide-up">
        <StepBar
          current={step} total={TOTAL_STEPS}
          onBack={handleBack} onNext={handleNext}
          onSaveDraft={() => toast.success('Saved as draft!')}
          canProceed={step !== 3 || normalizeChannels(config.channels).length > 0}
        />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          {/* Left: Phone preview */}
          <div className="xl:sticky xl:top-4">
            <ReferralPhonePreview
              tab={previewTab}
              landingTitle={config.landingTitle}
              brandName={user?.brand_name}
            />
          </div>
          {/* Right: Config */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            {step === 1 && <Step1 config={config} onChange={setConfig} />}
            {step === 2 && <Step2 config={config} onChange={setConfig} />}
            {step === 3 && <Step3 config={config} onChange={setConfig} />}
            {step === 4 && <Step4 config={config} />}
          </div>
        </div>
      </div>
    );
  }

  // ── Active view ──
  return (
    <div className="space-y-5 pb-10 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Active</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Referral Program</h1>
          <p className="text-sm text-slate-500 mt-0.5">Dual-incentive reward — referrer + new customer</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowRecord(true)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors">
            <PlusIcon className="w-4 h-4" /> Record Referral
          </button>
          <button onClick={() => { setStep(1); setView('setup'); }}
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors">
            <PencilIcon className="w-4 h-4" /> Edit Program
          </button>
          <button
            className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-xl"
            style={{ background: '#a89442' }}>
            <ShareIcon className="w-4 h-4" /> Share Link
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full w-fit">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'sent', label: `Sent Referrals (${referrals.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
            style={activeTab === t.id ? { background: '#a89442', color: 'white' } : { color: '#64748b' }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white/80`}>
                <span className="text-2xl">{s.icon}</span>
                <p className={`text-2xl font-black ${s.color} mt-1.5`}>{s.value}</p>
                <p className="text-xs text-slate-600 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Config summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">New Customer Gets</p>
              <p className="text-2xl font-black text-amber-700">
                {config.rewardType === 'flat' ? `₹${config.rewardValue} Off` : config.rewardType === 'percent' ? `${config.rewardValue}% Off` : 'Free Item'}
              </p>
              <p className="text-xs text-slate-400 mt-1">On their first purchase · Expires in {config.expiryDays} days</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Referrer Gets</p>
              <p className="text-2xl font-black text-amber-600">
                {config.referrerReward === 'points' ? `+${config.referrerValue} pts` : config.referrerReward === 'flat' ? `₹${config.referrerValue} Off` : `${config.referrerValue}% Off`}
              </p>
              <p className="text-xs text-slate-400 mt-1">After friend's first qualifying purchase</p>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Everyone your customers have referred is tracked here.</p>
            <button onClick={() => setShowRecord(true)}
              className="flex items-center gap-1.5 text-sm font-bold text-white px-4 py-2 rounded-xl shadow-sm transition-all hover:opacity-90"
              style={{ background: '#a89442' }}>
              <PlusIcon className="w-4 h-4" /> Record Referral
            </button>
          </div>
          <ActivityTable
            referrals={referrals}
            loading={loading}
            onView={setViewingRef}
            onDelete={setDeletingRef}
          />
        </div>
      )}

      {/* Modals */}
      {showRecord && (
        <RecordReferralModal
          defaultChannels={config.channels}
          onClose={() => setShowRecord(false)}
          onSaved={() => { setShowRecord(false); setActiveTab('sent'); fetchReferrals(); }}
        />
      )}
      {viewingRef && (
        <ViewReferralModal referral={viewingRef} onClose={() => setViewingRef(null)} />
      )}
      {deletingRef && (
        <DeleteReferralModal referral={deletingRef} onCancel={() => setDeletingRef(null)} onConfirm={handleDeleteReferral} />
      )}
    </div>
  );
}
