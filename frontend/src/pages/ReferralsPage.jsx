import { useState, useEffect } from 'react';
import api from '../services/api';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  ArrowRightIcon, ChevronDownIcon, CheckIcon,
  ShareIcon, PlayIcon, XMarkIcon, PencilIcon,
  GiftIcon, ShieldCheckIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';

// ─── Mock referral data ───────────────────────────────────────────────────────
function getMockReferrals() {
  const names = ['Siddharth Sharma', 'Priya Patel', 'Rahul Gupta', 'Anjali Singh', 'Vikram Mehta', 'Rohan Das', 'Tanya Sen', 'Aman Verma'];
  const statuses = ['rewarded', 'purchased', 'signed_up', 'pending', 'expired'];
  return Array.from({ length: 14 }, (_, i) => ({
    referral_id: `ref-${i}`,
    referrer_name: names[i % names.length],
    referred_mobile: `+91 99887 ${String(12000 + i).padStart(5, '0')}`,
    referred_name: ['Neha', 'Karan', 'Divya', 'Rohit', 'Simran', 'Varun', 'Riya', 'Sameer'][i % 8],
    status: statuses[i % statuses.length],
    referrer_reward_credited: i % 2 === 0,
    referred_reward_credited: i % 3 === 0,
    created_at: new Date(Date.now() - i * 86400000 * 1.5).toISOString(),
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
    <div className="flex items-center justify-between py-4 px-6 mb-8 bg-white border border-slate-100 rounded-2xl shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={onBack}
          className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configure Program</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-extrabold text-slate-800">Step {current} of {total}</span>
            <div className="flex items-center gap-1.5 ml-2">
              {Array.from({ length: total }, (_, i) => (
                <div key={i} className="rounded-full transition-all duration-300 h-2"
                  style={{
                    width: i + 1 === current ? 24 : 8,
                    background: i + 1 <= current 
                      ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' 
                      : '#e2e8f0',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onSaveDraft}
          className="text-sm font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 rounded-xl transition-all">
          Save Draft
        </button>
        <button onClick={onNext} disabled={!canProceed}
          className="btn-primary disabled:opacity-40 px-6 py-2.5">
          {current === total ? 'Activate Program' : 'Next Step'}
          <ArrowRightIcon className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}

// ─── Phone Preview — referral landing page ────────────────────────────────────
function ReferralPhonePreview({ tab, setTab, config, brandName }) {
  const rewardLabel = config.rewardType === 'flat' 
    ? `₹${config.rewardValue} OFF` 
    : config.rewardType === 'percent' 
      ? `${config.rewardValue}% OFF` 
      : 'FREE Gift';

  return (
    <div className="flex flex-col items-center">
      {/* Tab switcher above phone */}
      <div className="flex items-center gap-1 mb-6 bg-slate-100 p-1 rounded-full border border-slate-200/60 shadow-inner">
        {['Invite Message', 'Claim Page', 'Success Page'].map(t => (
          <button key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200"
            style={tab === t
              ? { background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)' }
              : { color: '#64748b' }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Phone frame */}
      <div className="relative mx-auto border-[10px] border-slate-950 rounded-[3rem] shadow-2xl bg-slate-950 overflow-hidden" style={{ width: 280, height: 500 }}>
        {/* Dynamic Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-40 flex items-center justify-between px-4">
          <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800" />
          <span className="w-12 h-1 bg-slate-900 rounded-full" />
        </div>

        {/* Status Bar */}
        <div className="h-7 bg-slate-950 flex justify-between items-center px-6 pt-1 text-[10px] text-white/90 font-bold z-30 relative">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        {/* Screen Content Wrapper */}
        <div className="w-full h-[463px] bg-slate-50 overflow-y-auto scrollbar-hidden relative">
          
          {/* TAB 1: WHATSAPP INVITE */}
          {tab === 'Invite Message' && (
            <div className="h-full bg-[#efeae2] flex flex-col justify-between">
              {/* WhatsApp Header */}
              <div className="bg-[#075e54] text-white px-3 py-2 flex items-center gap-2 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-800">
                  {brandName?.charAt(0) || 'S'}
                </div>
                <div>
                  <p className="text-[11px] font-bold leading-tight">{brandName || 'Store Partner'}</p>
                  <p className="text-[9px] text-white/80">Online</p>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm max-w-[85%] border border-slate-200/50 relative">
                  <p className="text-[11px] text-slate-800 leading-relaxed font-medium">
                    Hey there! Your friend <span className="font-bold text-indigo-600">Amit</span> has sent you a special invite reward to try <span className="font-bold">{brandName || 'our store'}</span>! 🎁
                  </p>
                  <p className="text-[11px] text-slate-800 leading-relaxed font-bold mt-2">
                    Claim your {rewardLabel} voucher now:
                  </p>
                  <span className="text-[10px] text-indigo-500 font-semibold block mt-1 underline break-all">
                    reelo.cc/r/amt-{brandName?.toLowerCase().replace(/\s+/g, '') || 'shop'}
                  </span>

                  {/* Rich link card preview */}
                  <div className="mt-2.5 rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                    <div className="h-20 bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white relative">
                      <GiftIcon className="w-8 h-8 opacity-85 animate-bounce" />
                      <span className="absolute bottom-1.5 right-1.5 bg-slate-900/60 text-[9px] text-white px-1.5 py-0.5 rounded font-bold">
                        EXCLUSIVE GIFT
                      </span>
                    </div>
                    <div className="p-2">
                      <p className="text-[10px] font-bold text-slate-800 leading-snug">
                        {config.landingTitle || 'Claim your special first purchase discount!'}
                      </p>
                      <p className="text-[8px] text-slate-400 mt-0.5">{brandName || 'Retail Shop'}</p>
                    </div>
                  </div>
                  <span className="text-[8px] text-slate-400 block text-right mt-1">9:42 AM</span>
                </div>
              </div>

              {/* Input Area */}
              <div className="bg-[#f0f0f0] p-2 flex items-center gap-2 border-t border-slate-200">
                <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[10px] text-slate-400">
                  Type a message...
                </div>
                <div className="w-7 h-7 rounded-full bg-[#075e54] flex items-center justify-center text-white text-xs font-bold">
                  ➔
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLAIM PAGE */}
          {tab === 'Claim Page' && (
            <div className="h-full bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 text-white flex flex-col p-4 justify-between">
              <div className="text-center pt-2">
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto shadow-xl backdrop-blur-md mb-2">
                  <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
                    {brandName?.slice(0, 2).toUpperCase() || 'ST'}
                  </span>
                </div>
                <p className="text-[10px] text-pink-400 font-bold tracking-widest uppercase">{brandName || 'Our Store'}</p>
                <h3 className="text-xs font-extrabold text-slate-200 mt-1 leading-snug px-3">
                  {config.landingTitle || 'Get a special reward on your first purchase!'}
                </h3>
              </div>

              {/* Voucher Ticket Widget */}
              <div className="bg-white/10 border border-white/10 rounded-2xl p-3 backdrop-blur-md my-3 shadow-2xl relative overflow-hidden">
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900" />
                
                <div className="border-2 border-dashed border-white/20 rounded-xl p-3 text-center bg-white/5">
                  <p className="text-[9px] font-bold text-slate-400 tracking-wider">YOUR WELCOME GIFT</p>
                  <p className="text-lg font-black text-pink-400 tracking-tight my-1">{rewardLabel}</p>
                  <p className="text-[8px] text-slate-400">Valid for {config.expiryDays} days after activation</p>
                </div>
              </div>

              {/* Claims Form */}
              <div className="bg-white rounded-2xl p-3 shadow-2xl text-slate-800 space-y-2.5">
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase">Your Name</label>
                  <input type="text" disabled placeholder="e.g. Rahul Sharma" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase">Mobile Number</label>
                  <div className="flex gap-1">
                    <span className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] text-slate-500 font-bold">+91</span>
                    <input type="text" disabled placeholder="99887 76655" className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] focus:outline-none" />
                  </div>
                </div>
                <button type="button" className="w-full py-2 rounded-xl text-white font-bold text-[10px] shadow-lg transition-all duration-200" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                  Claim My Reward
                </button>
              </div>

              <p className="text-[8px] text-slate-500 text-center mt-2">
                Powered by Reelo Customer Engagement
              </p>
            </div>
          )}

          {/* TAB 3: SUCCESS PAGE */}
          {tab === 'Success Page' && (
            <div className="h-full bg-slate-900 text-white flex flex-col items-center justify-center p-5 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 animate-pulse">
                <CheckCircleIcon className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-sm font-black text-white leading-tight">Reward Claimed successfully!</h3>
              <p className="text-[10px] text-slate-400 mt-2 px-4 leading-relaxed">
                A confirmation message with coupon details has been sent to your mobile number.
              </p>

              <div className="mt-6 bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 w-full max-w-[200px] shadow-lg">
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">YOUR COUPON CODE</p>
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  <span className="font-mono text-xs font-black text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20 tracking-wider">
                    WELCOME{config.rewardValue || '50'}
                  </span>
                </div>
                <p className="text-[8px] text-slate-400 mt-2">Show this code at billing to redeem your {rewardLabel}.</p>
              </div>

              <p className="text-[9px] text-slate-500 mt-10">
                You can now close this window.
              </p>
            </div>
          )}

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
        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
          Step 1: Welcome Incentive
        </h3>
        <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">
          What reward do you want to offer new customers referred by friends?
        </p>
      </div>

      <div className="space-y-3">
        {[
          { v: 'flat', icon: '₹', iconBg: 'bg-indigo-50 text-indigo-600', label: 'Flat Discount (₹)', desc: 'Give a fixed amount off their first billing' },
          { v: 'percent', icon: '%', iconBg: 'bg-pink-50 text-pink-600', label: 'Percentage Off (%)', desc: 'Give a percentage discount on their purchase' },
          { v: 'free_item', icon: '🎁', iconBg: 'bg-emerald-50 text-emerald-600', label: 'Free Item / Gift', desc: 'Offer a free item or complimentary drink/product' },
        ].map(opt => (
          <label key={opt.v}
            className="flex items-center justify-between px-5 py-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:border-indigo-200"
            style={{
              borderColor: config.rewardType === opt.v ? '#6366f1' : '#f1f5f9',
              background: config.rewardType === opt.v ? '#f5f3ff' : 'white',
              boxShadow: config.rewardType === opt.v ? '0 4px 12px rgba(99, 102, 241, 0.04)' : 'none'
            }}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-black ${opt.iconBg}`}>
                {opt.icon}
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-800">{opt.label}</p>
                <p className="text-xs text-slate-450 mt-0.5 leading-snug">{opt.desc}</p>
              </div>
            </div>
            <input type="radio" name="rewardType" value={opt.v}
              checked={config.rewardType === opt.v}
              onChange={() => onChange({ ...config, rewardType: opt.v })}
              className="w-4.5 h-4.5 text-indigo-650 focus:ring-indigo-500 border-slate-350 accent-indigo-600" />
          </label>
        ))}
      </div>

      {config.rewardType !== 'free_item' && (
        <div className="animate-slide-up">
          <label className="input-label">
            Welcome Reward Value {config.rewardType === 'flat' ? '(₹)' : '(%)'}
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-black text-sm">
              {config.rewardType === 'flat' ? '₹' : '%'}
            </div>
            <input type="number"
              className="input-field pl-8 font-extrabold"
              value={config.rewardValue}
              onChange={e => onChange({ ...config, rewardValue: e.target.value })}
              placeholder={config.rewardType === 'flat' ? '150' : '15'} />
          </div>
        </div>
      )}

      <div>
        <label className="input-label">Landing Page Greeting Title</label>
        <textarea rows={2}
          className="input-field resize-none font-medium"
          value={config.landingTitle}
          onChange={e => onChange({ ...config, landingTitle: e.target.value })}
          placeholder="e.g. Get a special reward on your first purchase!"
          maxLength={120} />
        <div className="flex justify-between items-center mt-1 px-1">
          <span className="text-[10px] text-slate-400 font-medium">Be clear, concise, and inviting.</span>
          <span className="text-[10px] text-slate-400 font-bold font-mono">{config.landingTitle.length}/120</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="input-label">Reward Validity</label>
          <div className="relative">
            <select 
              className="input-field pr-10 font-semibold appearance-none"
              value={config.expiryDays}
              onChange={e => onChange({ ...config, expiryDays: parseInt(e.target.value) || 30 })}
            >
              <option value={7}>7 Days</option>
              <option value={15}>15 Days</option>
              <option value={30}>30 Days</option>
              <option value={60}>60 Days</option>
              <option value={90}>90 Days</option>
            </select>
            <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="input-label">Send Expiry Reminder</label>
          <div className="relative">
            <select 
              className="input-field pr-10 font-semibold appearance-none"
              value={config.reminderDays}
              onChange={e => onChange({ ...config, reminderDays: parseInt(e.target.value) || 3 })}
            >
              <option value={1}>1 day before</option>
              <option value={2}>2 days before</option>
              <option value={3}>3 days before</option>
              <option value={5}>5 days before</option>
              <option value={0}>Don't remind</option>
            </select>
            <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Referrer reward ───────────────────────────────────────────────────
function Step2({ config, onChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
          Step 2: Referrer Incentive
        </h3>
        <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">
          What reward does your existing customer get when their friend purchases?
        </p>
      </div>

      <div className="space-y-3">
        {[
          { v: 'points', icon: '⭐', iconBg: 'bg-amber-50 text-amber-600', label: 'Loyalty Points Credit', desc: 'Add loyalty reward points directly to their account' },
          { v: 'flat', icon: '₹', iconBg: 'bg-indigo-50 text-indigo-600', label: 'Discount Voucher (₹)', desc: 'Issue a flat discount voucher code' },
          { v: 'percent', icon: '%', iconBg: 'bg-pink-50 text-pink-600', label: 'Discount Voucher (%)', desc: 'Issue a percentage off discount voucher code' },
        ].map(opt => (
          <label key={opt.v}
            className="flex items-center justify-between px-5 py-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:border-indigo-200"
            style={{
              borderColor: config.referrerReward === opt.v ? '#6366f1' : '#f1f5f9',
              background: config.referrerReward === opt.v ? '#f5f3ff' : 'white',
              boxShadow: config.referrerReward === opt.v ? '0 4px 12px rgba(99, 102, 241, 0.04)' : 'none'
            }}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-black ${opt.iconBg}`}>
                {opt.icon}
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-800">{opt.label}</p>
                <p className="text-xs text-slate-450 mt-0.5 leading-snug">{opt.desc}</p>
              </div>
            </div>
            <input type="radio" name="referrerReward" value={opt.v}
              checked={config.referrerReward === opt.v}
              onChange={() => onChange({ ...config, referrerReward: opt.v })}
              className="w-4.5 h-4.5 text-indigo-650 focus:ring-indigo-500 border-slate-350 accent-indigo-600" />
          </label>
        ))}
      </div>

      <div>
        <label className="input-label">
          Incentive Value {config.referrerReward === 'points' ? '(Points)' : config.referrerReward === 'flat' ? '(₹)' : '(%)'}
        </label>
        <div className="relative rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
            {config.referrerReward === 'points' ? '⭐' : config.referrerReward === 'flat' ? '₹' : '%'}
          </div>
          <input type="number"
            className="input-field pl-8 font-extrabold"
            value={config.referrerValue}
            onChange={e => onChange({ ...config, referrerValue: e.target.value })}
            placeholder={config.referrerReward === 'points' ? '250' : '100'} />
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 italic">
          * This reward is generated and sent automatically only AFTER the referred friend makes their first qualifying checkout at your shop.
        </p>
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
      <div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
          Step 3: Distribution Channels
        </h3>
        <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">
          Choose the channels to share referral links and voucher updates
        </p>
      </div>

      <div className="space-y-3">
        {[
          { v: 'whatsapp', icon: '💬', label: 'WhatsApp Messenger', desc: 'Direct invite via WhatsApp Business API API', recommended: true },
          { v: 'sms', icon: '📱', label: 'Transactional SMS', desc: 'Standard carrier text message delivery' },
          { v: 'email', icon: '✉️', label: 'Smart Email Newsletters', desc: 'Direct high-fidelity email layout delivery' },
        ].map(ch => {
          const active = selectedChannels.includes(ch.v);
          return (
            <label key={ch.v}
              className="flex items-center justify-between px-5 py-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:border-indigo-200 select-none"
              style={{
                borderColor: active ? '#6366f1' : '#f1f5f9',
                background: active ? '#f5f3ff' : 'white',
                boxShadow: active ? '0 4px 12px rgba(99, 102, 241, 0.04)' : 'none'
              }}>
              <input
                type="checkbox"
                className="sr-only"
                checked={active}
                onChange={() => toggleChannel(ch.v)}
              />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100/80 flex items-center justify-center text-xl">{ch.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-extrabold text-slate-800">{ch.label}</p>
                    {ch.recommended && (
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 uppercase tracking-wider">
                        High Yield
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-450 mt-0.5 leading-snug">{ch.desc}</p>
                </div>
              </div>
              <div
                className="w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0"
                style={{ 
                  borderColor: active ? '#6366f1' : '#cbd5e1', 
                  background: active ? '#6366f1' : 'white' 
                }}
              >
                {active && <CheckIcon className="w-3.5 h-3.5 text-white stroke-[3px]" />}
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
  const getRewardDesc = (type, val) => {
    if (type === 'flat') return `₹${val} Flat Discount`;
    if (type === 'percent') return `${val}% Percentage Off`;
    return 'Free Promotional Gift';
  };

  const getReferrerDesc = (type, val) => {
    if (type === 'points') return `${val} Reward Points`;
    if (type === 'flat') return `₹${val} Off Coupon`;
    return `${val}% Off Coupon`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
          Step 4: Review Configuration
        </h3>
        <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">
          Verify all components before taking your referral engine live
        </p>
      </div>

      <div className="space-y-3.5 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
        {[
          { label: 'Friend Bonus (First Visit)', value: getRewardDesc(config.rewardType, config.rewardValue), icon: '🎁', color: 'text-indigo-600' },
          { label: 'Referrer Bonus (After Visit)', value: getReferrerDesc(config.referrerReward, config.referrerValue), icon: '⭐', color: 'text-amber-600' },
          { label: 'Landing Promo Headline', value: config.landingTitle || 'Not set', icon: '📝', color: 'text-slate-600' },
          { label: 'Coupon Lifetime Limit', value: `${config.expiryDays} Days after claim`, icon: '⏳', color: 'text-pink-600' },
          { label: 'Activated Channels', value: config.channels.map(c => c.toUpperCase()).join(', ') || 'None Selected', icon: '📣', color: 'text-emerald-600' },
        ].map(r => (
          <div key={r.label} className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
            <span className={`text-base p-1.5 bg-slate-50 rounded-lg ${r.color}`}>{r.icon}</span>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-tight">{r.label}</span>
              <span className="text-xs font-extrabold text-slate-800 block mt-0.5 truncate">{r.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/25 flex items-start gap-3">
        <ShieldCheckIcon className="w-5 h-5 text-emerald-650 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-emerald-800">Fraud Prevention Enabled</p>
          <p className="text-[10px] text-emerald-700/85 mt-0.5 leading-relaxed">
            Reelo's security protocol ensures that referrers cannot refer their own device numbers or claim rewards using matching payment methods.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── "How it works" video section ────────────────────────────────────────────
function HowItWorksSection({ onStart }) {
  const [showVideo, setShowVideo] = useState(false);
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 min-h-[460px] rounded-3xl overflow-hidden border border-slate-150 bg-white shadow-sm hover:shadow-md transition-all duration-300">
      {/* Left: Illustration overlay */}
      <div className="relative bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex flex-col justify-end overflow-hidden p-8 xl:p-12">
        {/* Background visual graphics */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl -ml-20 -mb-20" />
        
        {/* Mock Graphic cards */}
        <div className="relative z-10 space-y-4 mb-8 max-w-sm animate-pulse">
          <div className="bg-white/10 border border-white/10 p-4 rounded-2xl backdrop-blur-md shadow-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/25 flex items-center justify-center text-lg">🎁</div>
            <div>
              <p className="text-xs font-bold text-white">Anu referred Divya</p>
              <p className="text-[10px] text-slate-400">Invite link shared via WhatsApp</p>
            </div>
          </div>
          <div className="bg-white/10 border border-white/10 p-4 rounded-2xl backdrop-blur-md shadow-xl flex items-center gap-3 ml-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/25 flex items-center justify-center text-lg">🛍️</div>
            <div>
              <p className="text-xs font-bold text-white">Divya completed first purchase</p>
              <p className="text-[10px] text-slate-450">₹1,500 billing done successfully</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <span className="text-[10px] font-extrabold tracking-widest text-pink-500 uppercase block mb-1">Cuben Referral Engine</span>
          <p className="text-lg font-black text-white leading-relaxed">
            Let your customers advocate for you.<br />
            Give a reward, get a new loyal member.
          </p>
        </div>
      </div>

      {/* Right: CTA details */}
      <div className="flex flex-col justify-center px-8 py-10 xl:px-12">
        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1.5">Viral Marketing Loop</p>
        <h2 className="text-2xl font-black text-slate-900 leading-snug mb-3">
          Launch a high-impact<br />Referral Program today
        </h2>
        <p className="text-xs text-slate-450 leading-relaxed mb-6">
          Encourage word-of-mouth recommendations by rewarding both your active repeat shoppers and their friends. 
        </p>

        <div className="space-y-4.5 mb-8">
          {[
            { step: '01', icon: '📲', title: 'Loyal Shopper Shares Link', desc: 'Customers get their unique referral links automatically via WhatsApp/SMS after checkouts' },
            { step: '02', icon: '🎁', title: 'Friend Gets Welcome Gift', desc: 'The referred friend signs up via mobile and claims a welcome discount code' },
            { step: '03', icon: '🛍️', title: 'Friend Checkouts, Both Reward!', desc: 'Once the friend makes their first bill, the referrer instantly receives bonus points or a cash voucher' },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-650 flex-shrink-0 mt-0.5">
                {s.step}
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <span>{s.icon}</span> {s.title}
                </p>
                <p className="text-[10px] text-slate-450 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onStart}
            className="btn-primary"
          >
            Create Referral Program <ArrowRightIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowVideo(true)}
            className="btn-secondary"
          >
            <PlayIcon className="w-4.5 h-4.5 text-indigo-600" /> Watch Tutorial
          </button>
        </div>
      </div>

      {/* Video modal placeholder */}
      {showVideo && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setShowVideo(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-black text-slate-450 uppercase tracking-wider">Demo Video</span>
              <button onClick={() => setShowVideo(false)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-200 shadow-inner">
              <PlayIcon className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">Referrals in 2 Minutes</h3>
            <p className="text-xs text-slate-450 leading-relaxed px-2">
              Learn how brand owners use Reelo's dual-incentive engine to drive a 25% increase in month-on-month new customer acquisitions.
            </p>
            
            {/* Interactive gif placeholder */}
            <div className="my-5 rounded-2xl h-36 bg-slate-950 flex items-center justify-center text-xs text-slate-500 font-mono relative overflow-hidden border border-slate-800">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/40 to-pink-950/40" />
              <span className="relative z-10 text-[10px] text-indigo-400">▶ [Video Demonstration Stream]</span>
            </div>

            <button onClick={onStart}
              className="w-full btn-primary py-3">
              Configure My Rewards Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Referral Activity Table ──────────────────────────────────────────────────
const STATUS_STYLE = {
  pending:   'bg-amber-50 text-amber-700 border-amber-100',
  signed_up: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  purchased: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  rewarded:  'bg-pink-50 text-pink-700 border-pink-100',
  expired:   'bg-rose-50 text-rose-600 border-rose-100',
};

function ActivityTable({ referrals, loading }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  const filtered = referrals.filter(r => {
    const matchesFilter = filter === 'all' ? true : r.status === filter;
    const matchesSearch = search === '' ? true : (
      r.referrer_name.toLowerCase().includes(search.toLowerCase()) ||
      r.referred_name.toLowerCase().includes(search.toLowerCase()) ||
      r.referred_mobile.includes(search)
    );
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-850">Referral Ledger</h3>
          <p className="text-[11px] text-slate-400 font-medium">Real-time tracker of referred signups and purchases</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field max-w-xs py-1.5 px-3 text-xs rounded-lg"
          />
          
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['all', 'rewarded', 'purchased', 'pending', 'expired'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all duration-150"
                style={filter === f 
                  ? { background: 'white', color: '#4f46e5', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' } 
                  : { color: '#64748b' }}>
                {f === 'all' ? 'Show All' : f}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {['Referrer Customer', 'Friend Referred', 'Status Status', 'Referrer Reward', 'Friend Reward', 'Date Referred'].map(h => (
                <th key={h} className="text-xs">
                  {h.split(' ')[0]} {h.split(' ')[1]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              : filtered.map(r => (
                  <tr key={r.referral_id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-xs font-extrabold text-white">
                          {r.referrer_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{r.referrer_name}</p>
                          <span className="text-[9px] text-slate-400 font-semibold">Advocate</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-xs font-bold text-slate-700">{r.referred_name || '—'}</p>
                      <p className="text-[10px] text-slate-450 font-mono mt-0.5">{r.referred_mobile}</p>
                    </td>
                    <td>
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase tracking-wider ${STATUS_STYLE[r.status] || ''}`}>
                        {r.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {r.referrer_reward_credited ? (
                          <span className="badge-success text-[10px] py-0.5">
                            ✓ 250 pts credited
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                            Pending purchase
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {r.referred_reward_credited ? (
                          <span className="badge-success text-[10px] py-0.5">
                            ✓ Active voucher
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                            Pending signup
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-[11px] text-slate-450 font-semibold">
                      {r.created_at ? format(new Date(r.created_at), 'dd MMM yyyy') : '—'}
                    </td>
                  </tr>
                ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-slate-450 font-semibold">
                  No referral records match your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
  const [previewTab, setPreviewTab] = useState('Invite Message');
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

  useEffect(() => {
    if (view === 'active') {
      Promise.resolve().then(() => {
        setLoading(true);
        api.get('/referrals').then(r => setReferrals(r.data.referrals || [])).catch(() => setReferrals(getMockReferrals())).finally(() => setLoading(false));
      });
    }
  }, [view]);

  const TOTAL_STEPS = 4;

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(s => s + 1);
    else {
      // Activate
      api.post('/referrals', config).catch(() => {});
      toast.success('Referral program activated! 🎉');
      setView('active');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
    else setView('landing');
  };

  const stats = [
    { label: 'Total Referrals', value: referrals.length.toString(), icon: '🤝', color: 'text-indigo-600', bg: 'bg-indigo-50/70 border-indigo-100' },
    { label: 'Conversions', value: referrals.filter(r => r.status === 'rewarded' || r.status === 'purchased').length.toString(), icon: '✅', color: 'text-emerald-600', bg: 'bg-emerald-50/70 border-emerald-100' },
    { label: 'Points Gifted', value: `${(referrals.filter(r => r.referrer_reward_credited).length * 250).toLocaleString('en-IN')}`, icon: '⭐', color: 'text-amber-600', bg: 'bg-amber-50/70 border-amber-100' },
    { label: 'New Members', value: referrals.filter(r => r.referred_reward_credited).length.toString(), icon: '👤', color: 'text-pink-600', bg: 'bg-pink-50/70 border-pink-100' },
  ];

  // ── Landing view ──
  if (view === 'landing') {
    return (
      <div className="space-y-6 pb-10 animate-slide-up">
        <div className="page-header">
          <div>
            <h1 className="page-title">Referral Program</h1>
            <p className="page-subtitle">Turn your loyal shoppers into brand advocates with automated incentives</p>
          </div>
          <button onClick={() => { setStep(1); setView('setup'); }}
            className="btn-primary shadow-lg">
            Set Up Referral Program <ArrowRightIcon className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        <HowItWorksSection onStart={() => { setStep(1); setView('setup'); }} />
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
          onSaveDraft={() => toast.success('Saved program config as draft!')}
          canProceed={true}
        />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Left: Phone preview (5 cols) */}
          <div className="xl:col-span-5 xl:sticky xl:top-6 bg-white border border-slate-150 p-6 rounded-3xl shadow-sm">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 text-center">Live Interactive Phone Preview</h4>
            <ReferralPhonePreview
              tab={previewTab}
              setTab={setPreviewTab}
              config={config}
              brandName={user?.brand_name}
            />
          </div>
          {/* Right: Config Form (7 cols) */}
          <div className="xl:col-span-7 bg-white rounded-3xl border border-slate-150 p-6 shadow-sm min-h-[480px] flex flex-col justify-between">
            <div>
              {step === 1 && <Step1 config={config} onChange={setConfig} />}
              {step === 2 && <Step2 config={config} onChange={setConfig} />}
              {step === 3 && <Step3 config={config} onChange={setConfig} />}
              {step === 4 && <Step4 config={config} />}
            </div>
            
            <div className="border-t border-slate-100 pt-6 mt-8 flex justify-between items-center">
              <button 
                type="button" 
                onClick={handleBack}
                className="text-xs font-bold text-slate-500 hover:text-slate-850 transition-all"
              >
                ← Back
              </button>
              <button 
                type="button" 
                onClick={handleNext}
                className="btn-primary px-6"
              >
                {step === TOTAL_STEPS ? 'Finish & Activate' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Active view ──
  return (
    <div className="space-y-6 pb-10 animate-slide-up">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest">Active & Running</span>
          </div>
          <h1 className="page-title">Referral Program</h1>
          <p className="page-subtitle">Your dual-incentive marketing loop is live, acquiring new shoppers.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setStep(1); setView('setup'); }}
            className="btn-secondary">
            <PencilIcon className="w-4 h-4" /> Edit Parameters
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://reelo.cc/r/amt-${user?.brand_name?.toLowerCase().replace(/\s+/g, '') || 'shop'}`);
              toast.success('Program link copied to clipboard!');
            }}
            className="btn-primary shadow-md">
            <ShareIcon className="w-4 h-4" /> Copy Referral Link
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`glass-card p-5 border-2 ${s.bg} hover:scale-102 hover:-translate-y-1 transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{s.label}</span>
              <span className="text-xl bg-white/70 shadow-sm rounded-lg p-1">{s.icon}</span>
            </div>
            <p className={`text-2xl font-black ${s.color} mt-4`}>{s.value}</p>
            <p className="text-[10px] text-slate-450 font-medium mt-1">Updated just now</p>
          </div>
        ))}
      </div>

      {/* Current active rewards cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-150 p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 text-9xl text-indigo-500/5 font-black">🎁</div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">👥</span>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">New Customer Incentive</span>
          </div>
          <p className="text-2xl font-black text-indigo-950">
            {config.rewardType === 'flat' ? `₹${config.rewardValue} Flat Discount` : config.rewardType === 'percent' ? `${config.rewardValue}% Off First Bill` : 'Complimentary Welcome Gift'}
          </p>
          <p className="text-xs text-slate-450 mt-1.5 leading-relaxed max-w-sm">
            Applied automatically at checkout for new customers who sign up via a referral invitation page. Valid for {config.expiryDays} days.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-pink-50 to-white border border-pink-150 p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 text-9xl text-pink-500/5 font-black">⭐</div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">👑</span>
            <span className="text-[10px] font-black text-pink-600 uppercase tracking-widest">Referrer Advocate Reward</span>
          </div>
          <p className="text-2xl font-black text-pink-950">
            {config.referrerReward === 'points' ? `+${config.referrerValue} Loyalty Points` : config.referrerReward === 'flat' ? `₹${config.referrerValue} Flat Voucher` : `${config.referrerValue}% Off Discount`}
          </p>
          <p className="text-xs text-slate-450 mt-1.5 leading-relaxed max-w-sm">
            Credited directly to the advocate's profile immediately after their referred friend successfully makes their first purchase at the store.
          </p>
        </div>
      </div>

      {/* Activity table */}
      <ActivityTable referrals={referrals} loading={loading} />
    </div>
  );
}
