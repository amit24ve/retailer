import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowRightIcon, PlusIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';

// ─── Phone Mockup component ───────────────────────────────────────────────────
function PhoneMockup({ accentColor = '#e91e8c', brandName = "Baked by Nini's", price = 500, benefits = [], saving = 500, showSuccess = false }) {
  return (
    <div className="relative mx-auto select-none" style={{ width: 180 }}>
      {/* Phone shell */}
      <div className="rounded-[2rem] overflow-hidden border-[5px] border-slate-900 bg-white shadow-2xl" style={{ minHeight: 360 }}>
        {/* Notch */}
        <div className="h-6 bg-slate-900 flex items-center justify-center relative">
          <div className="w-20 h-3.5 bg-black rounded-full" />
        </div>

        {showSuccess ? (
          /* Success screen */
          <div className="bg-white p-3">
            {/* Yellow top bar */}
            <div className="bg-yellow-400 rounded-xl px-3 py-2 mb-2 text-center">
              <p className="text-[8px] font-semibold text-slate-800">We love regulars! Enjoy exclusive club<br />member benefits!</p>
            </div>
            <div className="bg-slate-900 rounded-xl px-3 py-2 mb-2 flex items-center gap-1.5">
              <span className="text-xs">🎉</span>
              <p className="text-[8px] font-bold text-white">You'll potentially save ₹{(saving * 10).toLocaleString('en-IN')}</p>
            </div>
            <div className="border-t border-slate-100 pt-2 mb-1">
              <p className="text-[7px] font-black text-slate-400 text-center tracking-widest uppercase mb-2">— Benefits —</p>
              {benefits.slice(0, 2).map((b, i) => (
                <div key={i} className="flex items-center justify-between mb-1.5">
                  <p className="text-[8px] text-slate-700 font-medium flex-1">{b}</p>
                  <span className="text-xs ml-1">🎁</span>
                </div>
              ))}
            </div>
            <div className="bg-yellow-400 rounded-lg px-3 py-2 text-center mt-2">
              <p className="text-[8px] font-black text-slate-900">Buy now for ₹{price.toLocaleString('en-IN')} →</p>
              <p className="text-[7px] text-slate-700">Valid for 12 months</p>
            </div>
            <p className="text-[7px] text-slate-400 text-center mt-2">🔒 cubenretailer.io</p>
          </div>
        ) : (
          /* Main membership screen */
          <div style={{ background: accentColor }} className="p-4 min-h-[320px] relative overflow-hidden">
            {/* Pattern bg */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            <div className="relative z-10">
              {/* Brand logo */}
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3 mx-auto shadow-lg border-2 border-white/30">
                <span className="text-[7px] font-black text-slate-700 text-center leading-tight uppercase px-0.5">
                  {brandName.split(' ').map(w => w[0]).join('').slice(0, 4)}
                </span>
              </div>
              <p className="text-white font-black text-sm text-center leading-snug mb-1">
                The {brandName} Pass
              </p>
              <p className="text-white/70 text-[8px] text-center leading-relaxed mb-3">
                Get VIP treatment with exclusive offers, savings, and personalized perks.
              </p>
              <div className="bg-white/10 backdrop-blur rounded-xl px-3 py-2 mb-3 flex items-center gap-1.5">
                <span className="text-xs">🎉</span>
                <p className="text-[8px] font-bold text-white">You'll potentially save ₹{saving.toLocaleString('en-IN')}</p>
              </div>
              <div className="border-t border-white/20 pt-2">
                <p className="text-[7px] font-black text-white/60 text-center tracking-widest uppercase mb-2">— Benefits —</p>
                {benefits.slice(0, 2).map((b, i) => (
                  <div key={i} className="bg-white/10 rounded-lg px-2 py-1.5 mb-1.5">
                    <p className="text-[8px] text-white font-medium">{b}</p>
                  </div>
                ))}
                {benefits.length === 0 && (
                  <>
                    <div className="bg-white rounded-lg px-2 py-1.5 mb-1 flex justify-between">
                      <p className="text-[7px] text-slate-500">You Pay</p>
                      <p className="text-[7px] text-slate-500">You Get</p>
                    </div>
                    <div className="bg-white/10 rounded-lg px-2 py-1.5">
                      <p className="text-[8px] text-white font-bold">₹{price.toLocaleString('en-IN')}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Notification bubble ──────────────────────────────────────────────────────
function NotifBubble({ text, sub, icon, style, dark = false }) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-2xl shadow-xl text-xs font-semibold absolute z-10 ${dark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'} border border-white/20`}
      style={{ minWidth: 160, ...style }}
    >
      {icon && <span className="text-base flex-shrink-0">{icon}</span>}
      <div>
        <p className="font-bold leading-tight">{text}</p>
        {sub && <p className={`text-[10px] ${dark ? 'text-slate-300' : 'text-slate-500'}`}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Revenue calculator slider ────────────────────────────────────────────────
function RevenueCalculator({ onStart }) {
  const [members, setMembers] = useState(527);
  const [pricePerUnit] = useState(5000);
  const revenue = members * pricePerUnit;

  return (
    <section className="py-16 px-6 text-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%)' }}>
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <svg viewBox="0 0 200 200" className="w-96 h-96" fill="none">
          <path d="M20 180 Q50 60 100 40 Q150 20 180 80" stroke="#a89442" strokeWidth="3" fill="none" />
          <path d="M10 160 Q60 80 100 70 Q140 60 190 100" stroke="#a89442" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <h2 className="text-3xl font-black text-slate-900 mb-2">
          With <span className="text-amber-600">Membership</span>
        </h2>
        <h2 className="text-3xl font-black text-slate-900 mb-6">You could potentially earn</h2>
        <p className="text-6xl font-black text-slate-900 mb-4 tracking-tight">
          ₹ {revenue.toLocaleString('en-IN')}
        </p>
        <p className="text-sm text-slate-600 mb-6">
          <span className="font-bold text-slate-900 border-b border-dashed border-slate-400">{members} memberships</span>
          {' '}at an estimate of{' '}
          <span className="font-bold text-slate-900">₹ {pricePerUnit.toLocaleString('en-IN')} per unit</span>
          {' '}over{' '}
          <span className="font-bold text-slate-900">365 days</span>
        </p>
        {/* Slider */}
        <div className="relative mx-auto max-w-lg">
          <input
            type="range"
            min={50}
            max={2000}
            step={1}
            value={members}
            onChange={e => setMembers(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full outline-none cursor-pointer"
            style={{ accentColor: '#a89442' }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">Drag to see your potential earnings</p>
      </div>
    </section>
  );
}

// ─── Benefits section ─────────────────────────────────────────────────────────
function BenefitsSection() {
  const benefits = [
    {
      emoji: '💵',
      bg: '#f0fdf4',
      title: 'Increase Cashflow',
      desc: 'Generate prepaid revenue and improve cash stability',
    },
    {
      emoji: '🛒',
      bg: '#f0fdfa',
      title: 'Drive Repeat Visits',
      desc: 'Drive frequent visits and build stronger loyalty',
    },
    {
      emoji: '🎉',
      bg: '#fefce8',
      title: 'Boost brand recall',
      desc: 'Stay top-of-mind and deepen customer relationships',
    },
  ];

  return (
    <section className="py-16 px-6 bg-white">
      <h2 className="text-3xl font-black text-center mb-12">
        <span className="text-amber-600">Benefits</span>{' '}
        <span className="text-slate-900">of Membership</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
        {benefits.map(b => (
          <div key={b.title} className="text-center">
            <div
              className="w-28 h-28 rounded-full mx-auto mb-5 flex items-center justify-center text-5xl shadow-sm"
              style={{ background: b.bg }}
            >
              {b.emoji}
            </div>
            <p className="text-base font-black text-slate-900 mb-2">{b.title}</p>
            <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>

      {/* Brand logos row */}
      <div className="mt-14 max-w-2xl mx-auto text-center">
        <p className="text-xl font-black text-slate-900 mb-1">
          Think Zomato Gold, Amazon Prime<br />
          Zepto Pass, Starbucks Card -{' '}
          <span className="text-pink-500">now for your brand!</span>
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
          {[
            { name: 'zepto pass', bg: '#6b21a8', text: 'white', logo: 'zepto|pass' },
            { name: 'prime', bg: '#00a8e0', text: 'white', logo: 'prime' },
            { name: 'starbucks', bg: '#00704a', text: 'white', logo: '☕' },
            { name: 'zomato gold', bg: '#1a1a1a', text: '#f59e0b', logo: 'zomato gold' },
          ].map(b => (
            <div key={b.name}
              className="rounded-2xl px-5 py-3 flex items-center justify-center font-black text-sm shadow-md"
              style={{ background: b.bg, color: b.text, minWidth: 130, minHeight: 50 }}>
              {b.name === 'zepto pass' ? (
                <span><span className="text-white">zepto</span><span className="text-yellow-300">|pass</span></span>
              ) : b.name === 'prime' ? (
                <span className="flex items-center gap-1">prime <span className="text-yellow-300 text-lg">~</span></span>
              ) : b.name === 'starbucks' ? (
                <span className="flex items-center gap-1.5">☕ <span className="font-black">starbucks</span></span>
              ) : (
                <span>zomato <span className="text-yellow-400">gold</span></span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How does it work section ─────────────────────────────────────────────────
function HowItWorks({ onStart }) {
  return (
    <section className="py-16 px-6 bg-white border-t border-slate-100">
      <h2 className="text-4xl font-black text-slate-900 text-center mb-12">
        How does it work?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
        {/* Step 1 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-2 mb-4">
            {/* Two overlapping phone mockups */}
            <div className="relative h-48 flex items-center justify-center">
              <div className="absolute left-2 top-0 scale-90 opacity-80">
                <PhoneMockup accentColor="#e91e8c" brandName="Baked by Nini's" price={1000} saving={500}
                  benefits={['Get one free Beer every month', '20% off on entire purchase']} />
              </div>
              <div className="absolute right-2 top-0 scale-90 opacity-90">
                <PhoneMockup accentColor="#f59e0b" brandName="Beer Cafe Club" price={1000} saving={5000}
                  showSuccess={true}
                  benefits={['Get one free Beer every month', '20% off on entire purchase']} />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="relative h-48 flex items-center justify-center">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg w-44 text-center">
              <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                <CheckIcon className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-black text-slate-900 mb-3">Congratulations! 🥳<br />You're now a member</p>
              <div className="border-t border-slate-100 pt-2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">— Benefits —</p>
                {['Get one free Beer every month', '20% off on entire purchase', '₹100 off on your dine-in order'].map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5 mb-1.5 text-left">
                    <span className="text-xs">🎁</span>
                    <p className="text-[8px] text-slate-700">{b}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="relative h-48 flex items-center justify-center">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-lg w-44">
              {/* Redemption notification */}
              <div className="bg-slate-900 text-white rounded-xl px-2 py-1.5 flex items-center gap-1.5 mb-3">
                <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-[7px] text-white font-black">R</span>
                </div>
                <div>
                  <p className="text-[7px] font-bold text-white">Rahul redeemed</p>
                  <p className="text-[7px] text-slate-300">20% off on entire purchase</p>
                </div>
              </div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center mb-2">— Benefits —</p>
              <div className="mb-2">
                <p className="text-[8px] text-slate-700 font-medium mb-0.5">Get one free Beer every month</p>
                <p className="text-[7px] text-slate-400">Redemption</p>
                <div className="flex items-center justify-between text-[7px] text-slate-500 mb-0.5">
                  <span>6</span><span>12</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: '50%' }} />
                </div>
              </div>
              <p className="text-[7px] text-slate-400 line-through mb-1">20% off on entire purchase</p>
              {/* Manya notification */}
              <div className="bg-pink-500 text-white rounded-lg px-2 py-1 flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <span className="text-[6px] text-pink-600 font-black">M</span>
                </div>
                <p className="text-[7px] font-bold">Manya redeemed a free beer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step numbers */}
      <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[
          'Design your membership\nwith exclusive benefits',
          'Customers buy it &\nyou earn prepaid revenue',
          'Members return regularly to\nredeem benefits',
        ].map((text, i) => (
          <div key={i} className="text-center">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-black mx-auto mb-3">
              {i + 1}
            </div>
            <p className="text-sm text-slate-700 leading-snug font-medium">
              {text.split('\n').map((line, j) => <span key={j}>{line}{j < 1 && <br />}</span>)}
            </p>
          </div>
        ))}
      </div>

      {/* Starbucks cash banner */}
      <div className="mt-14 max-w-4xl mx-auto rounded-3xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #e6fdf5 0%, #ccfbf1 100%)' }}>
        <div className="flex items-center justify-between px-10 py-10">
          <div className="flex-1">
            <p className="text-2xl font-black text-slate-900 leading-tight mb-3">
              Starbucks ☕ has <span className="font-black">more cash</span> than<br />
              some banks with the <span className="font-black">help of<br />Membership.</span>
            </p>
            <p className="text-sm text-slate-600 mb-5">You can launch the same in less than 2 minutes.</p>
            <button onClick={onStart}
              className="inline-flex items-center gap-2 text-sm font-bold text-white px-6 py-3 rounded-xl transition-all shadow-md hover:opacity-90"
              style={{ background: '#a89442' }}>
              Let's Get Started <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
          {/* Money illustration */}
          <div className="flex-shrink-0 text-7xl ml-8">
            <div className="relative">
              <span style={{ fontSize: 80 }}>💵</span>
              <span className="absolute -bottom-2 -right-4" style={{ fontSize: 60 }}>💵</span>
              <span className="absolute -bottom-6 -right-8 opacity-60" style={{ fontSize: 50 }}>💵</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Membership plan editor ───────────────────────────────────────────────────
function PlanEditor({ plan, onChange, onDelete }) {
  const [open, setOpen] = useState(true);
  const TIER_COLORS = {
    Silver: '#94a3b8', Gold: '#f59e0b', Platinum: '#0ea5e9', Diamond: '#06b6d4'
  };
  const color = TIER_COLORS[plan.tier] || '#a89442';

  return (
    <div className="bg-white border rounded-2xl overflow-hidden transition-all" style={{ borderColor: open ? color + '60' : '#e2e8f0' }}>
      <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(v => !v)}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
            style={{ background: color + '20' }}>
            {plan.icon}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{plan.name}</p>
            <p className="text-xs text-slate-400">₹{plan.price.toLocaleString('en-IN')} · {plan.duration} months</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ background: color }}>
            {plan.members} members
          </span>
          <ArrowRightIcon className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Plan Name</label>
              <input className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                value={plan.name} onChange={e => onChange({ ...plan, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Price (₹)</label>
              <input type="number" className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                value={plan.price} onChange={e => onChange({ ...plan, price: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Duration (months)</label>
              <input type="number" min={1} max={36} className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                value={plan.duration} onChange={e => onChange({ ...plan, duration: parseInt(e.target.value) || 1 })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Welcome Points</label>
              <input type="number" className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                value={plan.welcomePoints} onChange={e => onChange({ ...plan, welcomePoints: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Benefits (one per line)</label>
            <textarea rows={3} className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-300 resize-none"
              value={plan.benefits.join('\n')} onChange={e => onChange({ ...plan, benefits: e.target.value.split('\n').filter(Boolean) })}
              placeholder="Get one free item every month&#10;20% off on entire purchase&#10;₹100 off on dine-in" />
          </div>
          <button onClick={() => onDelete(plan.id)} className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors">
            Remove plan
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Default plans ────────────────────────────────────────────────────────────
const DEFAULT_PLANS = [
  { id: 'p1', tier: 'Silver', icon: '🥈', name: 'Silver Pass', price: 499, duration: 12, welcomePoints: 100, benefits: ['Birthday bonus 100 pts', '2% cashback on all purchases'], members: 1248 },
  { id: 'p2', tier: 'Gold', icon: '🥇', name: 'Gold Membership', price: 999, duration: 12, welcomePoints: 500, benefits: ['Free delivery on all orders', '4% cashback', 'Exclusive member events'], members: 421 },
  { id: 'p3', tier: 'Platinum', icon: '💠', name: 'Platinum Club', price: 2499, duration: 12, welcomePoints: 1500, benefits: ['Dedicated concierge', '6% cashback', 'Exclusive product access', 'VIP event invites'], members: 82 },
  { id: 'p4', tier: 'Diamond', icon: '💎', name: 'Diamond VIP', price: 4999, duration: 12, welcomePoints: 5000, benefits: ['Personal shopper', '10% cashback', 'Free returns', 'Quarterly luxury gifts'], members: 16 },
];

// ─── Active membership dashboard ──────────────────────────────────────────────
function ActiveDashboard({ plans, setPlans, onEdit }) {
  const totalRevenue = plans.reduce((s, p) => s + p.price * p.members, 0);
  const totalMembers = plans.reduce((s, p) => s + p.members, 0);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: totalMembers.toLocaleString('en-IN'), color: 'text-amber-700', bg: 'bg-cyan-50', icon: '👥' },
          { label: 'Active Plans', value: plans.length, color: 'text-amber-600', bg: 'bg-cyan-50', icon: '📋' },
          { label: 'Membership Revenue', value: `₹${(totalRevenue / 1000).toFixed(0)}K`, color: 'text-amber-600', bg: 'bg-cyan-50', icon: '💰' },
          { label: 'Avg Plan Value', value: `₹${Math.round(totalRevenue / Math.max(totalMembers, 1)).toLocaleString('en-IN')}`, color: 'text-amber-600', bg: 'bg-amber-50', icon: '📊' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white/80`}>
            <span className="text-2xl">{s.icon}</span>
            <p className={`text-2xl font-black ${s.color} mt-1.5`}>{s.value}</p>
            <p className="text-xs text-slate-600 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Plans grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-black text-slate-900">Your Membership Plans</h2>
          <button onClick={() => setPlans(prev => [...prev, {
            id: `p${Date.now()}`, tier: 'Silver', icon: '⭐', name: 'New Plan',
            price: 499, duration: 12, welcomePoints: 100, benefits: [], members: 0,
          }])} className="flex items-center gap-1.5 text-xs font-bold text-amber-700 border border-cyan-400 bg-cyan-50 hover:bg-cyan-200 px-3 py-1.5 rounded-xl transition-colors">
            <PlusIcon className="w-3.5 h-3.5" /> Add Plan
          </button>
        </div>
        <div className="space-y-2.5">
          {plans.map(plan => (
            <PlanEditor key={plan.id} plan={plan}
              onChange={updated => setPlans(prev => prev.map(p => p.id === updated.id ? updated : p))}
              onDelete={id => setPlans(prev => prev.filter(p => p.id !== id))} />
          ))}
        </div>
      </div>

      {/* Members table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recent Members</h3>
          <button onClick={() => toast.success('Exporting...')} className="text-xs font-semibold text-amber-700 hover:underline">Export</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50">
                {['Member', 'Plan', 'Joined', 'Expires', 'Paid', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { name: 'Siddharth Sharma', plan: 'Diamond VIP', joined: '2026-01-15', expires: '2027-01-15', paid: 4999, status: 'active' },
                { name: 'Priya Patel', plan: 'Platinum Club', joined: '2026-02-01', expires: '2027-02-01', paid: 2499, status: 'active' },
                { name: 'Rahul Gupta', plan: 'Gold Membership', joined: '2026-03-10', expires: '2027-03-10', paid: 999, status: 'active' },
                { name: 'Anjali Singh', plan: 'Silver Pass', joined: '2026-04-05', expires: '2027-04-05', paid: 499, status: 'active' },
                { name: 'Vikram Mehta', plan: 'Gold Membership', joined: '2025-06-01', expires: '2026-06-01', paid: 999, status: 'expiring' },
              ].map((m, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-yellow-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {m.name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-semibold text-amber-800 bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-full">{m.plan}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{m.joined}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{m.expires}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-amber-600">₹{m.paid}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${m.status === 'active' ? 'bg-cyan-50 text-amber-700 border border-cyan-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                      {m.status === 'expiring' ? '⚠️ Expiring Soon' : '✓ Active'}
                    </span>
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MembershipPage() {
  const [view, setView] = useState('landing');  // landing | active
  const [plans, setPlans] = useState(DEFAULT_PLANS);

  const handleStart = () => {
    setView('active');
    toast.success('Membership program activated! 🎉');
  };

  if (view === 'active') {
    return (
      <div className="pb-10 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Active</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Membership Program</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage your paid membership plans and members</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView('landing')}
              className="text-sm font-semibold text-slate-600 border border-slate-200 bg-white px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
              View Landing Page
            </button>
            <button onClick={() => toast.success('Link copied!')}
              className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-xl transition-all"
              style={{ background: '#a89442' }}>
              Share Membership Link
            </button>
          </div>
        </div>
        <ActiveDashboard plans={plans} setPlans={setPlans} onEdit={() => {}} />
      </div>
    );
  }

  // Landing / marketing page
  return (
    <div className="-mx-6 -mt-6 pb-10 animate-slide-up">

      {/* ── Hero ── */}
      <section className="px-6 pt-10 pb-6 bg-white text-center">
        <h1 className="text-4xl font-black leading-tight mb-8 max-w-3xl mx-auto">
          <span className="text-amber-600">Unlock</span>{' '}
          <span className="text-slate-900">New Revenue Stream & Build</span>
          <br />
          <span className="text-slate-900">Customer loyalty </span>
          <span className="text-amber-600">with </span>
          <span className="text-slate-900">Membership!</span>
        </h1>

        {/* Two phones side by side */}
        <div className="flex items-end justify-center gap-4 relative mt-4">
          {/* Notification — left */}
          <div className="absolute left-[8%] top-16 z-20 bg-white rounded-2xl px-3.5 py-2.5 shadow-2xl border border-slate-100 flex items-center gap-2.5 max-w-[180px]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0 text-xs font-black text-white">R</div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">Ravi purchased</p>
              <p className="text-xs text-slate-500">a new membership</p>
            </div>
          </div>

          {/* Phone 1 — pink */}
          <div className="relative z-10">
            <PhoneMockup accentColor="#e91e8c" brandName="Baked by Nini's" price={1000} saving={500}
              benefits={['Get one free Beer every month', '20% off on entire purchase']} />
          </div>

          {/* Phone 2 — yellow/success */}
          <div className="relative z-10 translate-y-4">
            <PhoneMockup accentColor="#f59e0b" brandName="Beer Cafe Club" price={4999} saving={5000}
              showSuccess={true}
              benefits={['Get one free Beer every month', '20% off on entire purchase']} />
          </div>

          {/* Notification — bottom right */}
          <div className="absolute right-[6%] bottom-16 z-20 bg-slate-900 text-white rounded-2xl px-3.5 py-2.5 shadow-2xl flex items-center gap-2.5 max-w-[220px]">
            <div className="w-6 h-6 rounded bg-cyan-500 flex items-center justify-center flex-shrink-0">
              <CheckIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-black leading-tight">Rahul redeemed</p>
              <p className="text-[10px] text-slate-300">20% off on entire purchase</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Launch banner ── */}
      <section className="mx-4 rounded-3xl relative overflow-hidden py-8 px-8"
        style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdfa 100%)' }}>
        <div className="flex items-center justify-between">
          <div className="text-5xl">📣</div>
          <div className="text-center flex-1">
            <p className="text-xl font-black text-slate-900 leading-tight">
              Launch your Membership 💸<br />
              in less than <span className="text-amber-600">2 minutes</span>
            </p>
            <button onClick={handleStart}
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white px-6 py-2.5 rounded-xl transition-all shadow-md hover:opacity-90"
              style={{ background: '#a89442' }}>
              Let's Get Started <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="text-5xl">🚀</div>
        </div>
      </section>

      {/* ── Revenue calculator ── */}
      <RevenueCalculator onStart={handleStart} />

      {/* ── Benefits section ── */}
      <BenefitsSection />

      {/* ── How it works ── */}
      <HowItWorks onStart={handleStart} />
    </div>
  );
}


