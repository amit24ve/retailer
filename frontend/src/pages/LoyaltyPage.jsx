import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  PencilIcon, TrashIcon, PlusIcon, CheckIcon, ArrowLeftIcon,
  LockClosedIcon, AdjustmentsHorizontalIcon, SparklesIcon,
  ChevronRightIcon, ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

// ─────────────────────────────────────────────────────────────────────────────
// LOYALTY CARD PREVIEWS — Reelo high-fidelity styling
// Each loyalty type shows a different realistic card design
// ─────────────────────────────────────────────────────────────────────────────

/** CASHBACK card preview — Slate-indigo gradient, circular logo, big brand name, coins */
function CashbackCardPreview({ subType, brandName, cashbackPct, coinLabel }) {
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-xl select-none relative border border-white/10" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/10 rounded-full blur-xl" />
      
      {/* Photo area with overlay */}
      <div className="relative h-32 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&q=75"
          alt="store"
          className="w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 to-indigo-950/90" />
        {/* Circular logo */}
        <div className="absolute bottom-3 left-4">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-lg">
            <span className="text-[10px] font-black text-white text-center leading-tight px-1">
              {brandName.split(' ')[0].slice(0,6).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 py-3.5 relative z-10">
        <p className="text-sm font-extrabold text-white leading-tight truncate">{brandName}</p>
        <p className="text-[10px] text-indigo-200 mt-0.5 font-medium">Get rewarded on every purchase</p>

        {subType === 'basic' ? (
          <div className="mt-3 bg-white/5 border border-white/5 rounded-xl px-3 py-2">
            <p className="text-xs font-bold text-white">₹100 Spent = {coinLabel || '1 Saving Coin'}</p>
          </div>
        ) : (
          <div className="mt-3 bg-white/5 border border-white/5 rounded-xl px-3 py-2">
            <p className="text-xs font-bold text-white">Lifetime: {cashbackPct}% Cashback</p>
            <p className="text-[9px] text-indigo-200/60 mt-0.5 font-medium">Based on total spend</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-white/5">
          <div>
            <p className="text-lg font-black text-white leading-none">250</p>
            <p className="text-[8px] font-bold text-indigo-300 uppercase tracking-wider mt-1">Saving Coins</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/70 font-semibold">Sugar Only in ₹28</p>
            <p className="text-[9px] text-white/50">Upto 5 Kg</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** AMOUNT SPENT card preview — Dark violet gradient, circular brand logo, points rate */
function AmountSpentCardPreview({ brandName, pointsRate }) {
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-xl select-none relative border border-white/10" style={{ background: 'linear-gradient(135deg, #4c0519 0%, #881337 100%)' }}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl" />
      
      {/* Header area */}
      <div className="relative h-32 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=75"
          alt="grocery"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-rose-950/20 to-rose-950/90" />
        {/* Circular logo */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-pink-500">
            <div className="text-center">
              <p className="text-[9px] font-black text-pink-600 leading-none">
                {brandName.split(' ').slice(0, 2).map(w => w[0]).join('')}
              </p>
              <p className="text-[7px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">REWARDS</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 pb-4 pt-2 relative z-10">
        <p className="text-sm font-extrabold text-white text-center leading-tight truncate">{brandName}<br />Rewards</p>
        <p className="text-[10px] text-rose-200 text-center mt-0.5 font-medium">Get rewarded on every purchase</p>

        <div className="mt-3 bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-center">
          <p className="text-xs font-bold text-white">₹{pointsRate || 10} Spent = 1 Saving Coin</p>
        </div>

        <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-white/5">
          <div>
            <p className="text-lg font-black text-white leading-none">250</p>
            <p className="text-[8px] font-bold text-pink-300 uppercase tracking-wider mt-1">Saving Coins</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/70 font-semibold">Sugar Only in ₹28</p>
            <p className="text-[9px] text-white/50">Upto 5 Kg</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** VISIT MADE card preview — Deep charcoal/rose-pink elements, points milestones */
function VisitMadeCardPreview({ brandName }) {
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-xl select-none relative border border-white/10" style={{ background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)' }}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
      
      {/* Header */}
      <div className="relative h-28 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=75"
          alt="store front"
          className="w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 to-zinc-950/90" />
        {/* Store logo circle */}
        <div className="absolute top-3 right-3">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-lg">
            <span className="text-xs font-black text-white">{brandName.charAt(0).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3.5 relative z-10">
        <p className="text-sm font-extrabold text-white leading-tight truncate">{brandName}<br />Test Rewards</p>
        <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">Get rewarded on every visit</p>
        <p className="text-xs font-bold text-amber-500 mt-2">1 Visit = 2 Points</p>

        {/* Milestones */}
        <div className="mt-3 space-y-1.5">
          {[
            { pts: 6, perk: '15% off on entire purchase' },
            { pts: 10, perk: '699₹ off on entire purchase' },
            { pts: 16, perk: '35% off on entire purchase' },
          ].map((m, i) => (
            <div key={i} className={`flex items-center justify-between px-2 py-1.5 rounded-lg ${i === 0 ? '' : 'border-t border-dashed border-white/5'}`}>
              <div>
                <p className="text-xs font-black text-white leading-none">{m.pts}</p>
                <p className="text-[7px] text-zinc-400 uppercase tracking-wider mt-0.5 font-bold">PTS</p>
              </div>
              <p className="text-xs text-zinc-300 font-medium text-right flex-1 ml-3 truncate">{m.perk}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHOOSE LOYALTY TYPE — 3 column cards with inner preview
// ─────────────────────────────────────────────────────────────────────────────

const LOYALTY_TYPES = [
  {
    id: 'cashback',
    icon: '💰',
    iconBg: '#eef2ff',
    iconBorder: '#6366f1',
    name: 'Cashback',
    desc: 'Customers receive a percentage of their purchase amount as cashback.',
    accentColor: '#6366f1',
    cardBg: 'bg-white',
    cardBorder: 'border-slate-200',
  },
  {
    id: 'amount_spent',
    icon: '🛒',
    iconBg: '#fdf2f8',
    iconBorder: '#ec4899',
    name: 'Amount Spent',
    desc: 'Customers earn points with each purchase, as defined by the brand.',
    accentColor: '#ec4899',
    cardBg: 'bg-white',
    cardBorder: 'border-slate-200',
  },
  {
    id: 'visit_made',
    icon: '👣',
    iconBg: '#fffbeb',
    iconBorder: '#f59e0b',
    name: 'Visit Made',
    desc: 'Customers earn points on every visit, as defined by the brand.',
    accentColor: '#f59e0b',
    cardBg: 'bg-white',
    cardBorder: 'border-slate-200',
  },
];

function ChooseLoyaltyType({ existing, onSelect }) {
  // Per-card subtype state
  const [subTypes, setSubTypes] = useState({ cashback: 'basic', amount_spent: 'basic', visit_made: 'basic' });

  return (
    <div className="animate-slide-up space-y-6">
      {/* Page header */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Activate Loyalty</h1>
        <p className="text-sm font-semibold text-slate-400 mt-1">Find your ideal loyalty program and customize it to match your brand!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {LOYALTY_TYPES.map(lt => {
          const subType = subTypes[lt.id];
          const isActive = existing?.id === lt.id;

          return (
            <div
              key={lt.id}
              className={`rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-lg relative bg-white ${isActive ? 'ring-2' : ''}`}
              style={{ 
                borderColor: isActive ? lt.accentColor : '#f1f5f9',
                boxShadow: isActive ? `0 10px 25px -5px ${lt.accentColor}20` : '0 4px 20px -2px rgba(15, 23, 42, 0.03)'
              }}
            >
              {/* Active badge */}
              {isActive && (
                <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full"
                  style={{ background: lt.accentColor }}>
                  <CheckIcon className="w-3 h-3 stroke-[3]" /> Active
                </div>
              )}

              {/* Header */}
              <div className="px-5 pt-5 pb-4">
                {/* Icon row */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border"
                    style={{ background: lt.iconBg, borderColor: lt.iconBorder + '20' }}>
                    {lt.icon}
                  </div>
                  <span className="text-base font-black text-slate-900">{lt.name}</span>
                </div>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed min-h-[36px]">{lt.desc}</p>
                <button className="mt-3 flex items-center gap-1 text-xs font-bold hover:underline cursor-pointer" style={{ color: lt.accentColor }}>
                  Here's an example
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </button>

                {/* Basic / Lifetime Spent tabs — inside card */}
                {lt.id !== 'visit_made' && (
                  <div className="flex items-center gap-1 mt-4 bg-slate-50 border border-slate-100 p-0.5 rounded-xl">
                    <button
                      onClick={() => setSubTypes(s => ({ ...s, [lt.id]: 'basic' }))}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${subType === 'basic' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      style={subType === 'basic' ? { color: lt.accentColor } : {}}
                    >
                      Basic
                    </button>
                    <button
                      onClick={() => setSubTypes(s => ({ ...s, [lt.id]: 'lifetime' }))}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${subType === 'lifetime' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      style={subType === 'lifetime' ? { color: lt.accentColor } : {}}
                    >
                      Lifetime Spent
                    </button>
                  </div>
                )}
              </div>

              {/* Card preview inside a scrollable mini-window */}
              <div className="mx-5 mb-5 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                {lt.id === 'cashback' && (
                  <CashbackCardPreview
                    subType={subType}
                    brandName="DECORKART Rewards"
                    cashbackPct={4}
                    coinLabel="1 Saving Coin"
                  />
                )}
                {lt.id === 'amount_spent' && (
                  <AmountSpentCardPreview brandName="Paliwal Mart MB GROCBUY" pointsRate={10} />
                )}
                {lt.id === 'visit_made' && (
                  <VisitMadeCardPreview brandName="Buddy bites" />
                )}
              </div>

              {/* CTA button */}
              <div className="px-5 pb-5">
                <button
                  onClick={() => onSelect(lt, subType)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-md cursor-pointer flex items-center justify-center gap-1"
                  style={{ background: lt.accentColor, boxShadow: `0 4px 14px 0 ${lt.accentColor}25` }}
                >
                  {isActive ? 'Edit Program' : 'Activate & Configure'} <span>→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURE PAGE — left: live preview, right: settings
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_TIERS = [
  { id: 't1', name: 'Bronze', icon: '🥉', minSpend: 0,      cashback: 2,  pointsRate: 10, visitPoints: 5,  color: '#94a3b8', bg: '#f8fafc' },
  { id: 't2', name: 'Silver', icon: '🥈', minSpend: 5000,   cashback: 4,  pointsRate: 8,  visitPoints: 10, color: '#64748b', bg: '#f1f5f9' },
  { id: 't3', name: 'Gold',   icon: '🥇', minSpend: 15000,  cashback: 6,  pointsRate: 5,  visitPoints: 20, color: '#f59e0b', bg: '#fffbeb' },
  { id: 't4', name: 'Platinum',icon: '💠',minSpend: 40000,  cashback: 8,  pointsRate: 3,  visitPoints: 35, color: '#6366f1', bg: '#e0e7ff' },
  { id: 't5', name: 'Diamond',icon: '💎', minSpend: 100000, cashback: 10, pointsRate: 2,  visitPoints: 50, color: '#ec4899', bg: '#fdf2f8' },
];

function TierRow({ tier, loyaltyType, onChange, onDelete, isFirst }) {
  const [open, setOpen] = useState(isFirst);
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all shadow-sm"
      style={{ borderColor: open ? tier.color + '60' : '#f1f5f9' }}>
      <div onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-50/50 transition-colors select-none">
        <div className="flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-base border border-slate-100 shadow-sm" style={{ background: tier.bg }}>
            {tier.icon}
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-900">{tier.name}</p>
            <p className="text-[10px] font-bold text-slate-400">
              {tier.minSpend === 0 ? 'Entry — all customers' : `₹${tier.minSpend.toLocaleString('en-IN')}+ lifetime`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full text-white shadow-sm" style={{ background: tier.color }}>
            {loyaltyType === 'cashback' ? `${tier.cashback}%` :
             loyaltyType === 'amount_spent' ? `₹${tier.pointsRate}/pt` :
             `${tier.visitPoints} pts`}
          </span>
          <ChevronRightIcon className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-50 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Name</label>
              <input className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                value={tier.name} onChange={e => onChange({ ...tier, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Min Spend (₹)</label>
              <input type="number" disabled={isFirst}
                className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100"
                value={tier.minSpend} onChange={e => onChange({ ...tier, minSpend: parseInt(e.target.value) || 0 })} />
            </div>
          </div>

          {loyaltyType === 'cashback' && (
            <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
              <div className="flex justify-between mb-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Cashback %</label>
                <span className="text-xs font-extrabold text-indigo-600">{tier.cashback}%</span>
              </div>
              <input type="range" min={1} max={25} value={tier.cashback}
                onChange={e => onChange({ ...tier, cashback: parseInt(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer" />
            </div>
          )}
          {loyaltyType === 'amount_spent' && (
            <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
              <div className="flex justify-between mb-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">₹ per Point</label>
                <span className="text-xs font-extrabold text-pink-600">₹{tier.pointsRate} = 1 pt</span>
              </div>
              <input type="range" min={1} max={50} value={tier.pointsRate}
                onChange={e => onChange({ ...tier, pointsRate: parseInt(e.target.value) })}
                className="w-full accent-pink-600 cursor-pointer" />
            </div>
          )}
          {loyaltyType === 'visit_made' && (
            <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
              <div className="flex justify-between mb-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Points / Visit</label>
                <span className="text-xs font-extrabold text-amber-600">{tier.visitPoints} pts</span>
              </div>
              <input type="range" min={1} max={100} value={tier.visitPoints}
                onChange={e => onChange({ ...tier, visitPoints: parseInt(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer" />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Perks</label>
            <input className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="e.g. Free delivery, Birthday bonus" defaultValue={tier.perks || ''} />
          </div>

          {!isFirst && (
            <button onClick={() => onDelete(tier.id)}
              className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold cursor-pointer transition-colors pt-1">
              <TrashIcon className="w-3.5 h-3.5" /> Remove tier
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ConfigureLoyalty({ loyaltyType, initialSubType, onBack, onSave }) {
  const [subType, setSubType] = useState(initialSubType || 'basic');
  const [brandName, setBrandName] = useState('Your Brand Rewards');
  const [tiers, setTiers] = useState(DEFAULT_TIERS);
  const [pointsValue, setPointsValue] = useState(0.10);
  const [expiryMonths, setExpiryMonths] = useState(12);
  const [maxRedemptionPct, setMaxRedemptionPct] = useState(50);
  const [saving, setSaving] = useState(false);

  const updateTier = (updated) => setTiers(ts => ts.map(t => t.id === updated.id ? updated : t));
  const deleteTier = (id) => setTiers(ts => ts.filter(t => t.id !== id));
  const addTier = () => {
    const last = tiers[tiers.length - 1];
    setTiers(ts => [...ts, {
      id: `t${Date.now()}`, name: 'New Tier', icon: '⭐',
      minSpend: (last?.minSpend || 0) + 20000,
      cashback: Math.min(25, (last?.cashback || 2) + 2),
      pointsRate: Math.max(1, (last?.pointsRate || 10) - 1),
      visitPoints: (last?.visitPoints || 5) + 10,
      color: '#6366f1', bg: '#eef2ff', perks: '',
    }]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/loyalty/rules', {
        name: brandName, rule_type: loyaltyType.id,
        conditions: { sub_type: subType, tiers },
        actions: { points_value: pointsValue, expiry_months: expiryMonths, max_redemption_pct: maxRedemptionPct },
        is_active: true,
      });
    } catch { /* proceed */ }
    toast.success('Loyalty program activated! 🎉');
    setSaving(false);
    onSave();
  };

  return (
    <div className="animate-slide-up space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
          <ArrowLeftIcon className="w-4 h-4 stroke-[2.5]" /> Back
        </button>
        <div className="flex gap-2">
          <button onClick={onBack} className="px-4 py-2 text-xs font-bold text-slate-500 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 text-xs font-bold text-white rounded-xl flex items-center gap-2 disabled:opacity-60 transition-all shadow-md cursor-pointer"
            style={{ background: loyaltyType.accentColor }}>
            {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Save & Activate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* ── LEFT: live preview ── */}
        <div className="xl:col-span-2 space-y-4">
          <div className="sticky top-20 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <SparklesIcon className="w-4 h-4" /> Live Preview
            </p>
            {/* Reelo-style card container */}
            <div className="rounded-3xl border-8 border-slate-100 bg-slate-50 p-4 shadow-inner max-w-[290px] mx-auto">
              {/* Subtype toggle inside frame */}
              {loyaltyType.id !== 'visit_made' && (
                <div className="flex items-center justify-center gap-1 mb-4 bg-white border border-slate-100 p-0.5 rounded-xl shadow-sm">
                  {['Basic', 'Lifetime Spent'].map(s => {
                    const v = s === 'Basic' ? 'basic' : 'lifetime';
                    return (
                      <button key={s} onClick={() => setSubType(v)}
                        className={`flex-1 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${subType === v ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              )}
              {/* The actual card */}
              <div className="transform scale-[1.02] origin-top transition-all duration-300">
                {loyaltyType.id === 'cashback' && (
                  <CashbackCardPreview subType={subType} brandName={brandName} cashbackPct={tiers[0]?.cashback || 2} coinLabel="1 Saving Coin" />
                )}
                {loyaltyType.id === 'amount_spent' && (
                  <AmountSpentCardPreview brandName={brandName} pointsRate={tiers[0]?.pointsRate || 10} />
                )}
                {loyaltyType.id === 'visit_made' && (
                  <VisitMadeCardPreview brandName={brandName} />
                )}
              </div>
            </div>

            {/* Brand name */}
            <div className="mt-5 max-w-[290px] mx-auto">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Program Name</label>
              <input className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
                value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Your Brand Rewards" />
            </div>
          </div>
        </div>

        {/* ── RIGHT: config ── */}
        <div className="xl:col-span-3 space-y-5">
          {/* Subtype selection */}
          {loyaltyType.id !== 'visit_made' && (
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                Choose {loyaltyType.name} type
              </p>
              <div className="space-y-3">
                {(loyaltyType.id === 'cashback' ? [
                  { optId: 'basic', badge: '🔥 Most popular choice', badgeColor: 'text-indigo-600 bg-indigo-50 border border-indigo-100', title: '🪣 Simple Cashback', desc: 'Customers earn a fixed percentage of their order value back as rewards on every single purchase.' },
                  { optId: 'lifetime', badge: '📈 Promotes customer lifetime retention', badgeColor: 'text-pink-600 bg-pink-50 border border-pink-100', title: '👑 Advanced Tiered Cashback', desc: 'Customers earn higher cashback percentage tiers based on their cumulative spending history.' },
                ] : [
                  { optId: 'basic', badge: '🛒 Flat Rate', badgeColor: 'text-indigo-600 bg-indigo-50 border border-indigo-100', title: '🛒 Flat Transaction Points', desc: 'Award a fixed points rate per transaction based on the amount spent.' },
                  { optId: 'lifetime', badge: '📊 Spending Milestones', badgeColor: 'text-pink-600 bg-pink-50 border border-pink-100', title: '📊 Cumulative Spend Tiers', desc: 'Unlock higher points rates as customers achieve lifetime spending milestones.' },
                ]).map(opt => (
                  <label key={opt.optId} className="block rounded-2xl border p-4 cursor-pointer transition-all hover:border-slate-300"
                    style={{ 
                      borderColor: subType === opt.optId ? loyaltyType.accentColor : '#f1f5f9',
                      background: subType === opt.optId ? `${loyaltyType.accentColor}04` : 'white' 
                    }}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 ${opt.badgeColor}`}>{opt.badge}</span>
                        <p className="text-sm font-extrabold text-slate-900">{opt.title}</p>
                        <p className="text-xs text-slate-500 font-semibold mt-1 leading-relaxed">{opt.desc}</p>
                      </div>
                      <input type="radio" name="subtype" value={opt.optId} checked={subType === opt.optId}
                        onChange={() => setSubType(opt.optId)} className="w-4.5 h-4.5 flex-shrink-0 cursor-pointer"
                        style={{ accentColor: loyaltyType.accentColor }} />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tiers */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-slate-800 uppercase tracking-wider">Loyalty Tiers</p>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Configure reward rates per spending level</p>
              </div>
              <button onClick={addTier} className="flex items-center gap-1.5 text-xs font-bold border px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer hover:bg-slate-50"
                style={{ color: loyaltyType.accentColor, borderColor: loyaltyType.accentColor + '40' }}>
                <PlusIcon className="w-4 h-4 stroke-[2.5]" /> Add Tier
              </button>
            </div>

            {/* Tier progression dots */}
            <div className="flex items-center gap-0 mb-5 overflow-x-auto pb-2 scrollbar-hidden">
              {tiers.map((t, i) => (
                <React.Fragment key={t.id}>
                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-base border-2 shadow-sm"
                      style={{ background: t.bg, borderColor: t.color }}>{t.icon}</div>
                    <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap mt-1">{t.name}</span>
                  </div>
                  {i < tiers.length - 1 && (
                    <div className="flex-1 h-0.5 min-w-[20px] mx-1 mb-4 shadow-sm"
                      style={{ background: `linear-gradient(to right, ${t.color}, ${tiers[i + 1]?.color})` }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="space-y-3">
              {tiers.map((tier, i) => (
                <TierRow key={tier.id} tier={tier} loyaltyType={loyaltyType.id}
                  onChange={updateTier} onDelete={deleteTier} isFirst={i === 0} />
              ))}
            </div>
          </div>

          {/* Global settings */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="w-4 h-4 text-slate-400" /> Global Rules Configuration
            </p>
            <div className="space-y-4">
              {[
                { label: 'Points Valuation', value: `1 pt = ₹${pointsValue.toFixed(2)}`, min: 0.01, max: 1, step: 0.01, val: pointsValue, set: setPointsValue },
                { label: 'Max Redemption per Invoice', value: `${maxRedemptionPct}% of bill`, min: 10, max: 100, step: 5, val: maxRedemptionPct, set: setMaxRedemptionPct },
                { label: 'Points Expiration Period', value: `${expiryMonths} months`, min: 1, max: 36, step: 1, val: expiryMonths, set: setExpiryMonths },
              ].map(s => (
                <div key={s.label} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <div className="flex justify-between mb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{s.label}</label>
                    <span className="text-xs font-black text-slate-900" style={{ color: loyaltyType.accentColor }}>{s.value}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                    onChange={e => s.set(parseFloat(e.target.value))}
                    className="w-full cursor-pointer" style={{ accentColor: loyaltyType.accentColor }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE STATS VIEW
// ─────────────────────────────────────────────────────────────────────────────
function ActiveView({ loyaltyType, onEdit, onChangeType }) {
  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Loyalty Active</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Loyalty Program Dashboard</h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">{loyaltyType.name} Program · active for your brand</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onChangeType}
            className="px-4 py-2 text-xs font-bold text-slate-500 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
            Change Program Type
          </button>
          <button onClick={onEdit}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-xl transition-all shadow-md cursor-pointer hover:opacity-90 active:scale-95"
            style={{ background: loyaltyType.accentColor, boxShadow: `0 4px 14px 0 ${loyaltyType.accentColor}25` }}>
            <PencilIcon className="w-4 h-4 stroke-[2.5]" /> Edit Configuration
          </button>
        </div>
      </div>

      {/* 4 Stats tiles */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Active Members', value: '1,24,820', trend: '+8.2%', icon: '👥', color: '#6366f1', bg: 'bg-indigo-50/40 border-indigo-100/50' },
          { label: 'Points Issued (30d)', value: '48.4L', trend: '+12.4%', icon: '⭐', color: '#ec4899', bg: 'bg-pink-50/40 border-pink-100/50' },
          { label: 'Redemption Rate', value: '72.8%', trend: '+1.4%', icon: '🔄', color: '#f59e0b', bg: 'bg-amber-50/40 border-amber-100/50' },
          { label: 'Revenue Impact', value: '₹12.4L', trend: '+18.6%', icon: '💰', color: '#10b981', bg: 'bg-emerald-50/40 border-emerald-100/50' },
        ].map(s => (
          <div key={s.label} className={`rounded-3xl p-5 border shadow-sm ${s.bg}`}>
            <div className="flex items-center justify-between">
              <span className="text-base bg-white w-9 h-9 rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">{s.icon}</span>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">↑ {s.trend}</span>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-4 leading-none" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-2">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tier breakdown */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5">Member Tier Breakdown</h2>
        <div className="space-y-4">
          {DEFAULT_TIERS.map((tier, i) => {
            const members = [1248, 840, 320, 82, 16][i];
            const pct = [50, 33, 13, 3, 1][i];
            return (
              <div key={tier.id} className="flex items-center gap-3">
                <div className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-base border border-slate-100 shadow-sm" style={{ background: tier.bg }}>
                  {tier.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-extrabold text-slate-800">{tier.name}</span>
                    <span className="text-slate-400 font-bold">{members.toLocaleString('en-IN')} members</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: tier.color }} />
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-500 w-7 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function LoyaltyPage() {
  const [view, setView] = useState('choose');          // choose | configure | active
  const [activeLoyaltyType, setActiveLoyaltyType] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [editingSubType, setEditingSubType] = useState('basic');

  const handleSelect = (lt, sub) => {
    setEditingType(lt);
    setEditingSubType(sub);
    setView('configure');
  };

  const handleSaved = () => {
    setActiveLoyaltyType(editingType);
    setView('active');
  };

  return (
    <div className="pb-10">
      {view === 'choose' && (
        <ChooseLoyaltyType existing={activeLoyaltyType} onSelect={handleSelect} />
      )}
      {view === 'configure' && editingType && (
        <ConfigureLoyalty
          loyaltyType={editingType}
          initialSubType={editingSubType}
          onBack={() => setView(activeLoyaltyType ? 'active' : 'choose')}
          onSave={handleSaved}
        />
      )}
      {view === 'active' && activeLoyaltyType && (
        <ActiveView
          loyaltyType={activeLoyaltyType}
          onEdit={() => { setEditingType(activeLoyaltyType); setView('configure'); }}
          onChangeType={() => setView('choose')}
        />
      )}
    </div>
  );
}


