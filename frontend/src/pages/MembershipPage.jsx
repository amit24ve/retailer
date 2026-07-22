import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  ArrowRightIcon, PlusIcon, PencilIcon, CheckIcon, TrashIcon,
  SparklesIcon, CreditCardIcon, UserGroupIcon, GiftIcon, ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

// ─────────────────────────────────────────────────────────────────────────────
// METALLIC CARD GRADIENTS
// ─────────────────────────────────────────────────────────────────────────────
const METALLIC_GRADIENTS = {
  Silver: 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 50%, #64748b 100%)',
  Gold: 'linear-gradient(135deg, #d97706 0%, #fef08a 50%, #b45309 100%)',
  Platinum: 'linear-gradient(135deg, #4f46e5 0%, #c084fc 50%, #db2777 100%)',
  Diamond: 'linear-gradient(135deg, #06b6d4 0%, #99f6e4 50%, #3b82f6 100%)'
};

const TIER_TEXT_COLORS = {
  Silver: 'text-slate-800',
  Gold: 'text-amber-950',
  Platinum: 'text-white',
  Diamond: 'text-cyan-950'
};

// ─────────────────────────────────────────────────────────────────────────────
// HIGH-FIDELITY MEMBER CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function PremiumMemberCard({ tier = 'Gold', brandName = "Baked by Nini's", price = 999, benefits = [], duration = 12, name = "Gold Member" }) {
  const gradient = METALLIC_GRADIENTS[tier] || METALLIC_GRADIENTS.Gold;
  const textColor = TIER_TEXT_COLORS[tier] || 'text-white';
  
  return (
    <div 
      className="w-full aspect-[1.58/1] rounded-2xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden select-none border border-white/20 transition-all duration-500 hover:scale-[1.02] hover:shadow-cyan-500/10"
      style={{ background: gradient }}
    >
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      
      {/* Top section */}
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className={`text-[10px] uppercase tracking-widest font-extrabold opacity-75 ${textColor}`}>
            {tier} Membership
          </p>
          <h4 className={`text-lg font-black tracking-tight mt-0.5 leading-none ${textColor}`}>
            {brandName}
          </h4>
        </div>
        {/* Card Chip SVG */}
        <svg className="w-8 h-8 opacity-90" viewBox="0 0 48 48" fill="none">
          <rect x="6" y="12" width="36" height="24" rx="4" fill="url(#chip-grad)" />
          <path d="M18 12v24M30 12v24M6 20h12M30 20h12M6 28h12M30 28h12" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" />
          <defs>
            <linearGradient id="chip-grad" x1="6" y1="12" x2="42" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffe082" />
              <stop offset="1" stopColor="#ffb300" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Middle: Benefits preview */}
      <div className="relative z-10 my-2">
        <p className={`text-[9px] font-bold uppercase tracking-wider opacity-60 ${textColor}`}>
          Key Privilege
        </p>
        <p className={`text-xs font-black truncate mt-0.5 ${textColor}`}>
          {benefits[0] || 'Exclusive VIP treatment & offers'}
        </p>
      </div>

      {/* Bottom section */}
      <div className="flex justify-between items-end relative z-10 border-t border-white/10 pt-3">
        <div>
          <p className={`text-[7px] uppercase tracking-wider opacity-60 ${textColor}`}>
            Card Number
          </p>
          <p className={`text-xs font-mono font-bold tracking-widest ${textColor}`}>
            •••• •••• •••• {duration}24
          </p>
        </div>
        <div className="text-right">
          <p className={`text-[7px] uppercase tracking-wider opacity-60 ${textColor}`}>
            Price
          </p>
          <p className={`text-sm font-extrabold leading-none ${textColor}`}>
            ₹{price.toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PHONE MOCKUP
// ─────────────────────────────────────────────────────────────────────────────
function PhoneMockup({ accentColor = '#4f46e5', brandName = "Baked by Nini's", price = 999, benefits = [], tier = 'Gold', showSuccess = false }) {
  return (
    <div className="relative mx-auto select-none" style={{ width: 220 }}>
      {/* Phone shell */}
      <div className="rounded-[2.5rem] overflow-hidden border-[8px] border-slate-900 bg-slate-950 shadow-2xl relative" style={{ minHeight: 440 }}>
        {/* Camera notch */}
        <div className="h-6 bg-slate-900 flex items-center justify-center relative z-20">
          <div className="w-24 h-4 bg-black rounded-full" />
        </div>

        {showSuccess ? (
          /* Success screen */
          <div className="bg-slate-900 p-4 text-white min-h-[408px] flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                <CheckIcon className="w-6 h-6 text-emerald-400" />
              </div>
              <h5 className="text-sm font-black text-center text-white">Purchase Successful!</h5>
              <p className="text-[10px] text-slate-400 text-center mt-1">You are now an elite club member.</p>
              
              <div className="mt-4 bg-slate-800/50 border border-slate-700/30 rounded-xl p-3">
                <p className="text-[8px] font-extrabold text-indigo-300 uppercase tracking-widest text-center mb-2">Your Privileges</p>
                <div className="space-y-2">
                  {benefits.slice(0, 3).map((b, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-xs mt-0.5">🎁</span>
                      <p className="text-[9px] text-slate-200 font-medium leading-snug">{b}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 text-center">
              <p className="text-[8px] text-slate-500">🔒 Powered by Cuben Retailer</p>
            </div>
          </div>
        ) : (
          /* Main membership screen */
          <div className="bg-slate-900 p-4 text-white min-h-[408px] flex flex-col justify-between relative overflow-hidden">
            {/* Soft decorative glow */}
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 space-y-4">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center mb-2 mx-auto border border-indigo-400/30 shadow-lg">
                  <span className="text-xs font-black text-white">
                    {brandName.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()}
                  </span>
                </div>
                <h5 className="text-xs font-extrabold text-indigo-300 tracking-wider uppercase">Club Membership</h5>
                <h4 className="text-sm font-black text-white mt-0.5">{brandName}</h4>
              </div>

              {/* High-fidelity Card */}
              <div className="scale-95 origin-center">
                <PremiumMemberCard 
                  tier={tier} 
                  brandName={brandName} 
                  price={price} 
                  benefits={benefits} 
                  duration={12} 
                />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2">
                <span className="text-base">🚀</span>
                <div>
                  <p className="text-[8px] font-medium text-slate-400">Estimated Annual Saving</p>
                  <p className="text-xs font-black text-emerald-400 leading-none mt-0.5">₹4,500+</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-2">
              <button className="w-full py-2.5 rounded-xl text-[10px] font-black text-white tracking-wider uppercase transition-all shadow-lg shadow-indigo-600/30 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)' }}>
                Join Club Now
              </button>
              <p className="text-[7px] text-slate-500 text-center mt-2">Valid for 12 Months · Cancel Anytime</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REVENUE CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────
function RevenueCalculator({ onStart }) {
  const [members, setMembers] = useState(650);
  const pricePerUnit = 1200;
  const revenue = members * pricePerUnit;

  return (
    <section className="py-16 px-6 text-center relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border-y border-slate-800">
      {/* Decorative neon grid background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} 
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-4">
          <SparklesIcon className="w-3.5 h-3.5" /> Potential Earnings Calculator
        </div>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
          Unlock a Powerful <span className="bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">Prepaid Revenue</span> Stream
        </h2>
        <p className="text-sm text-slate-400 mb-8">See how much upfront cash you can secure from dedicated members.</p>
        
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-8 max-w-lg mx-auto shadow-2xl">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Estimated Prepaid Cash</p>
          <p className="text-5xl font-black text-white my-3 tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            ₹{revenue.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mb-6">
            Based on <span className="text-white font-bold">{members} members</span> acquiring a pass at <span className="text-white font-bold">₹{pricePerUnit}</span>
          </p>
          
          {/* Custom Slider */}
          <div className="relative mt-8">
            <input
              type="range"
              min={50}
              max={3000}
              step={50}
              value={members}
              onChange={e => setMembers(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-2.5 font-bold">
              <span>50 Members</span>
              <span>1,500</span>
              <span>3,000 Members</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BENEFITS SECTION
// ─────────────────────────────────────────────────────────────────────────────
function BenefitsSection() {
  const benefits = [
    {
      emoji: '💳',
      title: 'Instant Upfront Liquidity',
      desc: 'Earn prepaid membership revenue to fuel store operations or expansion immediately.',
    },
    {
      emoji: '🔄',
      title: 'Guaranteed Repeat Visits',
      desc: 'Members visit up to 3x more frequently to maximize the value of their bought benefits.',
    },
    {
      emoji: '💖',
      title: 'Premium Brand Stickiness',
      desc: 'Form elite customer clubs that shut out local competitors and secure lifetime loyalty.',
    },
  ];

  return (
    <section className="py-16 px-6 bg-slate-950">
      <h2 className="text-3xl font-black text-center mb-12 text-white tracking-tight">
        Why Top Retailers Launch <span className="bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">Elite Memberships</span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {benefits.map(b => (
          <div key={b.title} className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 hover:border-indigo-500/20 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform">
              {b.emoji}
            </div>
            <h4 className="text-lg font-black text-white mb-2">{b.title}</h4>
            <p className="text-sm text-slate-400 leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>

      {/* Inspiration row */}
      <div className="mt-20 max-w-3xl mx-auto text-center border-t border-slate-900 pt-16">
        <p className="text-lg font-extrabold text-slate-300 mb-6">
          Inspired by the worlds most successful loyalty models
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {[
            { name: 'Starbucks Gold', logo: '☕ Starbucks Card' },
            { name: 'Zomato Gold', logo: '🍔 Zomato Gold' },
            { name: 'Zepto Pass', logo: '⚡ Zepto Pass' },
            { name: 'Amazon Prime', logo: '📦 Prime' }
          ].map(b => (
            <span key={b.name} className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold">
              {b.logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOW IT WORKS SECTION
// ─────────────────────────────────────────────────────────────────────────────
function HowItWorks({ onStart }) {
  return (
    <section className="py-16 px-6 bg-slate-950 border-t border-slate-900">
      <h2 className="text-3xl font-black text-white text-center mb-12 tracking-tight">
        How Cuben Membership Works
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
        {[
          {
            step: '01',
            title: 'Design Tiered Passes',
            desc: 'Create Bronze, Silver, Gold or custom metallic passes. Define prices, durations, and exclusive rewards.',
            element: (
              <div className="scale-90 opacity-90 hover:opacity-100 transition-opacity">
                <PremiumMemberCard tier="Gold" brandName="Gourmet Bakery" price={999} benefits={['10% off all cakes', 'Free muffin on birthday']} />
              </div>
            )
          },
          {
            step: '02',
            title: 'Customers Purchase Online',
            desc: 'Members buy their digital pass in 1-click via UPI/Cards at billing or on their smartphone.',
            element: (
              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-850 shadow-xl max-w-[200px] mx-auto text-center">
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2 text-emerald-400 font-bold">✓</div>
                <p className="text-[10px] font-black text-white">Payment Received</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Rahul Gupta bought Gold Pass</p>
                <p className="text-xs font-black text-emerald-400 mt-2">₹999.00</p>
              </div>
            )
          },
          {
            step: '03',
            title: 'Enjoy & Redeem Benefits',
            desc: 'Members scan their pass at checkout. Our system automatically tracks and applies their active privileges.',
            element: (
              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-850 shadow-xl max-w-[200px] mx-auto space-y-2">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <span className="text-xs">🎁</span>
                  <div className="text-left">
                    <p className="text-[9px] font-bold text-white">10% Off Applied</p>
                    <p className="text-[8px] text-slate-500">Gold Member Reward</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-400">
                  <span>Saved today</span>
                  <span className="text-emerald-400 font-bold">₹149.00</span>
                </div>
              </div>
            )
          }
        ].map(s => (
          <div key={s.step} className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between min-h-[340px]">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">Step {s.step}</span>
                <span className="text-3xl font-black text-slate-800">{s.step}</span>
              </div>
              <h4 className="text-base font-black text-white mb-2">{s.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">{s.desc}</p>
            </div>
            <div className="mt-auto pt-4 border-t border-slate-900">
              {s.element}
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden relative p-8 md:p-10 bg-gradient-to-r from-indigo-900 to-pink-900 border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black text-white leading-tight">
              Ready to launch your elite membership club?
            </h3>
            <p className="text-xs text-indigo-200 mt-2">Setup takes less than 2 minutes. No coding required.</p>
          </div>
          <button onClick={onStart}
            className="flex items-center gap-2 text-xs font-black bg-white hover:bg-slate-100 text-indigo-950 px-6 py-3 rounded-xl transition-all shadow-lg cursor-pointer">
            Get Started Now <ArrowRightIcon className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMBERSHIP PLAN EDITOR (WITH LIVE CARD PREVIEW!)
// ─────────────────────────────────────────────────────────────────────────────
function PlanEditor({ plan, onChange, onDelete }) {
  const [open, setOpen] = useState(true);
  const gradient = METALLIC_GRADIENTS[plan.tier] || METALLIC_GRADIENTS.Gold;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300">
      <div 
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-850 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{ background: gradient, color: '#fff' }}>
            {plan.icon || '⭐'}
          </div>
          <div>
            <p className="text-sm font-black text-white">{plan.name}</p>
            <p className="text-xs text-slate-400">₹{plan.price.toLocaleString('en-IN')} · {plan.duration} Months Duration</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full text-white bg-slate-800 border border-slate-700">
            {plan.members} Active Members
          </span>
          <ArrowRightIcon className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {open && (
        <div className="px-5 pb-6 pt-2 border-t border-slate-800 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Fields */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Plan Name</label>
                  <input 
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    value={plan.name} 
                    onChange={e => onChange({ ...plan, name: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Tier Style</label>
                  <select 
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    value={plan.tier}
                    onChange={e => {
                      const icons = { Silver: '🥈', Gold: '🥇', Platinum: '💠', Diamond: '💎' };
                      onChange({ ...plan, tier: e.target.value, icon: icons[e.target.value] || '⭐' });
                    }}
                  >
                    <option value="Silver">Silver (Metallic Silver)</option>
                    <option value="Gold">Gold (Premium Gold)</option>
                    <option value="Platinum">Platinum (Royal Indigo-Pink)</option>
                    <option value="Diamond">Diamond (Neon Cyan)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    value={plan.price} 
                    onChange={e => onChange({ ...plan, price: parseInt(e.target.value) || 0 })} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Duration (Months)</label>
                  <input 
                    type="number" 
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    value={plan.duration} 
                    onChange={e => onChange({ ...plan, duration: parseInt(e.target.value) || 1 })} 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Benefits (one per line)</label>
                <textarea 
                  rows={3} 
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none"
                  value={plan.benefits.join('\n')} 
                  onChange={e => onChange({ ...plan, benefits: e.target.value.split('\n').filter(Boolean) })}
                  placeholder="Get one free item every month&#10;20% off on entire purchase&#10;₹100 off on dine-in" 
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button 
                  onClick={() => onDelete(plan.id)} 
                  className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-400 font-black transition-colors"
                >
                  <TrashIcon className="w-4 h-4" /> Remove Plan
                </button>
              </div>
            </div>

            {/* Right Live Card Preview */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 text-center">Live Pass Preview</p>
              <div className="max-w-[280px] mx-auto w-full">
                <PremiumMemberCard 
                  tier={plan.tier}
                  brandName="Your Retail Brand"
                  price={plan.price}
                  benefits={plan.benefits}
                  duration={plan.duration}
                  name={plan.name}
                />
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT TIERED PLANS
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_PLANS = [
  { id: 'p1', tier: 'Silver', icon: '🥈', name: 'Silver Member Pass', price: 499, duration: 12, welcomePoints: 100, benefits: ['Birthday bonus 100 pts', '2% cashback on all purchases'], members: 1248 },
  { id: 'p2', tier: 'Gold', icon: '🥇', name: 'Gold Club Membership', price: 999, duration: 12, welcomePoints: 500, benefits: ['Free delivery on all orders', '4% cashback on bills', 'Exclusive member events'], members: 421 },
  { id: 'p3', tier: 'Platinum', icon: '💠', name: 'Platinum Elite Pass', price: 2499, duration: 12, welcomePoints: 1500, benefits: ['Priority table booking', '8% cashback on bills', 'Dedicated concierge agent', 'VIP product drops'], members: 82 },
  { id: 'p4', tier: 'Diamond', icon: '💎', name: 'Diamond VIP Club', price: 4999, duration: 12, welcomePoints: 5000, benefits: ['Free personal shopping', '12% cashback on bills', 'Unlimited free home delivery', 'Quarterly luxury gift boxes'], members: 16 },
];

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE MEMBERSHIP DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function ActiveDashboard({ plans, setPlans }) {
  const totalRevenue = plans.reduce((s, p) => s + p.price * p.members, 0);
  const totalMembers = plans.reduce((s, p) => s + p.members, 0);

  return (
    <div className="space-y-6">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total active members', value: totalMembers.toLocaleString('en-IN'), color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: <UserGroupIcon className="w-5 h-5" /> },
          { label: 'Active membership plans', value: plans.length, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', icon: <CreditCardIcon className="w-5 h-5" /> },
          { label: 'Cumulative Revenue', value: `₹${(totalRevenue).toLocaleString('en-IN')}`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <ArrowTrendingUpIcon className="w-5 h-5" /> },
          { label: 'Avg membership value', value: `₹${Math.round(totalRevenue / Math.max(totalMembers, 1)).toLocaleString('en-IN')}`, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: <GiftIcon className="w-5 h-5" /> },
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

      {/* Plans Section */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-black text-white">Manage Membership Plans</h3>
            <p className="text-xs text-slate-400 mt-0.5">Add or modify tiers and customize card aesthetics</p>
          </div>
          <button 
            onClick={() => setPlans(prev => [...prev, {
              id: `p${Date.now()}`, tier: 'Silver', icon: '🥈', name: 'New Elite Pass',
              price: 999, duration: 12, welcomePoints: 200, benefits: ['Exclusive benefit 1'], members: 0,
            }])} 
            className="flex items-center gap-1.5 text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg cursor-pointer"
          >
            <PlusIcon className="w-4 h-4" /> Add New Plan
          </button>
        </div>
        
        <div className="space-y-4">
          {plans.map(plan => (
            <PlanEditor 
              key={plan.id} 
              plan={plan}
              onChange={updated => setPlans(prev => prev.map(p => p.id === updated.id ? updated : p))}
              onDelete={id => setPlans(prev => prev.filter(p => p.id !== id))} 
            />
          ))}
        </div>
      </div>

      {/* High-Fidelity CRM table */}
      <div className="bg-slate-900/30 border border-slate-900 rounded-3xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-900 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-white">Recent Member Signups</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time purchase and status logger</p>
          </div>
          <button 
            onClick={() => toast.success('Exporting members...')} 
            className="text-xs font-black text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            Export CSV
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-900/60 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Member Name</th>
                <th className="px-6 py-4">Elite Plan</th>
                <th className="px-6 py-4">Activation Date</th>
                <th className="px-6 py-4">Expiration Date</th>
                <th className="px-6 py-4">Amount Paid</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300 font-medium">
              {[
                { name: 'Siddharth Sharma', plan: 'Diamond VIP Club', joined: '2026-01-15', expires: '2027-01-15', paid: 4999, status: 'Active' },
                { name: 'Priya Patel', plan: 'Platinum Elite Pass', joined: '2026-02-01', expires: '2027-02-01', paid: 2499, status: 'Active' },
                { name: 'Rahul Gupta', plan: 'Gold Club Membership', joined: '2026-03-10', expires: '2027-03-10', paid: 999, status: 'Active' },
                { name: 'Anjali Singh', plan: 'Silver Member Pass', joined: '2026-04-05', expires: '2027-04-05', paid: 499, status: 'Active' },
                { name: 'Vikram Mehta', plan: 'Gold Club Membership', joined: '2025-06-01', expires: '2026-06-01', paid: 999, status: 'Expiring' },
              ].map((m, i) => (
                <tr key={i} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-xs font-black text-white">
                        {m.name.charAt(0)}
                      </div>
                      <span>{m.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-indigo-300">
                      {m.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">{m.joined}</td>
                  <td className="px-6 py-4 text-xs text-slate-400">{m.expires}</td>
                  <td className="px-6 py-4 text-sm font-black text-emerald-400">₹{m.paid}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                      m.status === 'Active' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                      {m.status}
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

// ─────────────────────────────────────────────────────────────────────────────
// MAIN MEMBERSHIP PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function MembershipPage() {
  const [view, setView] = useState('landing');  // landing | active
  const [plans, setPlans] = useState(DEFAULT_PLANS);

  const handleStart = () => {
    setView('active');
    toast.success('Membership engine initialized! 🚀');
  };

  if (view === 'active') {
    return (
      <div className="pb-12 animate-slide-up space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider">Active Loyalty Hub</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Paid Membership Club</h1>
            <p className="text-xs text-slate-400">Launch premium club tiers, collect prepaid earnings, and boost repeat visits.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setView('landing')}
              className="flex-1 sm:flex-none text-xs font-black text-slate-300 border border-slate-800 bg-slate-950 hover:bg-slate-900 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              View Landing Page
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText('https://cubenretailer.io/membership/baked-by-ninis');
                toast.success('Membership URL copied! 📋');
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-black bg-gradient-to-r from-indigo-600 to-pink-600 hover:opacity-95 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg cursor-pointer"
            >
              Share Club Link
            </button>
          </div>
        </div>

        {/* Dashboard Area */}
        <ActiveDashboard plans={plans} setPlans={setPlans} />
      </div>
    );
  }

  // Landing / marketing page
  return (
    <div className="-mx-6 -mt-6 pb-16 animate-slide-up bg-slate-950 min-h-screen text-white">

      {/* Hero Section */}
      <section className="px-6 pt-16 pb-12 text-center relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-5">
            <SparklesIcon className="w-4 h-4" /> Next-Gen Paid Memberships
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none mb-6">
            Secure <span className="bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">Prepaid Revenue</span> &<br />
            Create Elite Customers Who Keep Returning
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Launch your own digital pass brand like Zomato Gold or Starbucks Card. Secure immediate cash flow and boost visit frequencies in less than 2 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <button 
              onClick={handleStart}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-black bg-gradient-to-r from-indigo-600 to-pink-600 hover:opacity-95 text-white px-6 py-3.5 rounded-xl transition-all shadow-xl shadow-indigo-600/25 cursor-pointer"
            >
              Configure Membership Now <ArrowRightIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto text-xs font-black text-slate-300 border border-slate-800 bg-slate-900/50 hover:bg-slate-900 px-6 py-3.5 rounded-xl transition-colors cursor-pointer"
            >
              See How It Works
            </button>
          </div>
        </div>

        {/* Live Visual Demonstration */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-12 px-4">
          <div className="md:col-span-5 text-left space-y-4">
            <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-5 shadow-2xl relative">
              <span className="absolute -top-3 -right-3 bg-pink-500 text-[9px] font-black px-2.5 py-1 rounded-full">LIVE LOG</span>
              <p className="text-xs font-bold text-white mb-3">Live Member Log</p>
              <div className="space-y-3">
                {[
                  { name: 'Vikram Sharma bought Gold Pass', time: 'Just now', saved: '₹999 paid' },
                  { name: 'Ananya Sen redeemed cake slice reward', time: '3m ago', saved: 'Gold Member perk' }
                ].map((l, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px] border-b border-slate-800/40 pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-bold text-slate-200">{l.name}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{l.time}</p>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-400">{l.saved}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-7 flex justify-center gap-4 relative">
            <div className="scale-95 origin-bottom">
              <PhoneMockup tier="Gold" brandName="Baked by Nini's" price={999} benefits={['Free delivery on all orders', '4% cashback on bills']} />
            </div>
            <div className="scale-95 origin-bottom translate-y-4">
              <PhoneMockup tier="Diamond" brandName="Gourmet Bakery" price={4999} showSuccess={true} benefits={['Free personal shopping', '12% cashback on bills', 'Unlimited free home delivery']} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Revenue Calculator ── */}
      <RevenueCalculator onStart={handleStart} />

      {/* ── Benefits Section ── */}
      <BenefitsSection />

      {/* ── How It Works ── */}
      <div id="how-it-works">
        <HowItWorks onStart={handleStart} />
      </div>

    </div>
  );
}
