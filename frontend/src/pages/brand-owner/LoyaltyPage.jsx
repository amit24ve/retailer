import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  PencilIcon, TrashIcon, PlusIcon, CheckIcon, ArrowLeftIcon,
  LockClosedIcon, AdjustmentsHorizontalIcon, SparklesIcon,
  ChevronRightIcon, ArrowTrendingUpIcon, EyeIcon, PlayIcon, PauseIcon,
} from '@heroicons/react/24/outline';

// ─────────────────────────────────────────────────────────────────────────────
// LOYALTY CARD PREVIEWS — exactly matching the screenshot style
// Each loyalty type shows a different realistic card design
// ─────────────────────────────────────────────────────────────────────────────

/** CASHBACK card preview — teal/dark bg, circular logo, big brand name, coins */
function CashbackCardPreview({ subType, brandName, cashbackPct, coinLabel }) {
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-xl select-none" style={{ background: '#0d6e6e' }}>
      {/* Photo area with overlay */}
      <div className="relative h-36 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&q=75"
          alt="store"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,110,110,0.3), rgba(13,110,110,0.9))' }} />
        {/* Circular logo */}
        <div className="absolute bottom-3 left-4">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur border-2 border-white/40 flex items-center justify-center">
            <span className="text-xs font-black text-white text-center leading-tight px-1">
              {brandName.split(' ')[0].slice(0,6).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 py-3" style={{ background: '#0d6e6e' }}>
        <p className="text-lg font-black text-white leading-tight">{brandName}</p>
        <p className="text-xs text-white/60 mt-0.5">Get rewarded on every purchase</p>

        {subType === 'basic' ? (
          <div className="mt-3 bg-white/10 rounded-xl px-3 py-2">
            <p className="text-sm font-black text-white">₹100 Spent = {coinLabel || '1 Saving Coin'}</p>
          </div>
        ) : (
          <div className="mt-3 bg-white/10 rounded-xl px-3 py-2">
            <p className="text-sm font-black text-white">Lifetime: {cashbackPct}% Cashback</p>
            <p className="text-xs text-white/60 mt-0.5">Based on total spend</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
          <div>
            <p className="text-xl font-black text-white">250</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wider">Saving Coins</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60">Sugar Only in ₹28</p>
            <p className="text-xs text-white/60">Upto 5 Kg</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** AMOUNT SPENT card preview — dark navy bg, circular brand logo, points rate */
function AmountSpentCardPreview({ brandName, pointsRate }) {
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-xl select-none" style={{ background: '#1a237e' }}>
      {/* Header area */}
      <div className="relative h-36 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=75"
          alt="grocery"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(26,35,126,0.3), rgba(26,35,126,0.95))' }} />
        {/* Circular logo */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-orange-500">
            <div className="text-center">
              <p className="text-[9px] font-black text-orange-600 leading-none">
                {brandName.split(' ').slice(0, 2).map(w => w[0]).join('')}
              </p>
              <p className="text-[7px] text-slate-500 mt-0.5 font-semibold">REWARDS</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 pb-4 pt-2" style={{ background: '#1a237e' }}>
        <p className="text-base font-black text-white text-center leading-tight">{brandName}<br />Rewards</p>
        <p className="text-xs text-white/50 text-center mt-0.5">Get rewarded on every purchase</p>

        <div className="mt-3 bg-white/10 rounded-xl px-3 py-2 text-center">
          <p className="text-sm font-black text-white">₹{pointsRate || 10} Spent = 1 Saving Coin</p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
          <div>
            <p className="text-xl font-black text-white">250</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wider">Saving Coins</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60">Sugar Only in ₹28</p>
            <p className="text-xs text-white/60">Upto 5 Kg</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** VISIT MADE card preview — dark/brown bg, points milestones, perks grid */
function VisitMadeCardPreview({ brandName }) {
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-xl select-none" style={{ background: '#1a1a1a' }}>
      {/* Header */}
      <div className="relative h-28 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=75"
          alt="store front"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(26,26,26,0.95))' }} />
        {/* Store logo circle */}
        <div className="absolute top-3 right-3">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
            <span className="text-xs font-black text-white">{brandName.charAt(0).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3" style={{ background: '#1a1a1a' }}>
        <p className="text-base font-black text-white leading-tight">{brandName}<br />Test Rewards</p>
        <p className="text-xs text-white/40 mt-0.5">Get rewarded on every visit</p>
        <p className="text-xs font-bold text-white/70 mt-2">1 Visit = 2 Points</p>

        {/* Milestones */}
        <div className="mt-3 space-y-1.5">
          {[
            { pts: 6, perk: '15% off on entire purchase' },
            { pts: 10, perk: '699₹ off on entire purchase' },
            { pts: 16, perk: '35% off on entire purchase' },
          ].map((m, i) => (
            <div key={i} className={`flex items-center justify-between px-2 py-1.5 rounded-lg ${i === 0 ? '' : 'border-t border-dashed border-white/10'}`}>
              <div>
                <p className="text-sm font-black text-white leading-none">{m.pts}</p>
                <p className="text-[9px] text-white/40 uppercase tracking-wider">PTS</p>
              </div>
              <p className="text-xs text-white/60 text-right flex-1 ml-3">{m.perk}</p>
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
    iconBg: '#e6f7f5',
    iconBorder: '#a89442',
    name: 'Cashback',
    desc: 'Customers receive a percentage of their purchase amount as cashback.',
    accentColor: '#a89442',
    cardBg: '#f0fdf9',
    cardBorder: '#99f6e4',
  },
  {
    id: 'amount_spent',
    icon: '🛒',
    iconBg: '#fff3e0',
    iconBorder: '#f97316',
    name: 'Amount Spent',
    desc: 'Customers earn points with each purchase, as defined by the brand.',
    accentColor: '#f97316',
    cardBg: '#fff8f1',
    cardBorder: '#fed7aa',
  },
  {
    id: 'visit_made',
    icon: '👣',
    iconBg: '#f3e8ff',
    iconBorder: '#c9b96e',
    name: 'Visit Made',
    desc: 'Customers earn points on every visit, as defined by the brand.',
    accentColor: '#c9b96e',
    cardBg: '#faf5ff',
    cardBorder: '#ddd6fe',
  },
];

function ChooseLoyaltyType({ existing, onSelect }) {
  // Per-card subtype state
  const [subTypes, setSubTypes] = useState({ cashback: 'basic', amount_spent: 'basic', visit_made: 'basic' });

  return (
    <div className="animate-slide-up">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Activate Loyalty</h1>
      </div>

      <div className="mb-5">
        <h2 className="text-lg font-black text-slate-900">Choose Loyalty Type</h2>
        <p className="text-sm text-slate-500 mt-1">Find your ideal loyalty program and customize it to match your brand!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {LOYALTY_TYPES.map(lt => {
          const subType = subTypes[lt.id];
          const isActive = existing?.id === lt.id;

          return (
            <div
              key={lt.id}
              className="rounded-3xl overflow-hidden border transition-all duration-200 hover:shadow-lg relative"
              style={{ background: lt.cardBg, borderColor: isActive ? lt.accentColor : lt.cardBorder }}
            >
              {/* Active badge */}
              {isActive && (
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 text-white text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: lt.accentColor }}>
                  <CheckIcon className="w-3 h-3" /> Active
                </div>
              )}

              {/* Header */}
              <div className="px-5 pt-5 pb-4">
                {/* Icon row */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border"
                    style={{ background: lt.iconBg, borderColor: lt.iconBorder + '40' }}>
                    {lt.icon}
                  </div>
                  <span className="text-base font-black text-slate-900">{lt.name}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{lt.desc}</p>
                <button className="mt-2.5 flex items-center gap-1 text-xs font-bold" style={{ color: lt.accentColor }}>
                  Here's an example
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </button>

                {/* Basic / Lifetime Spent tabs — inside card */}
                {lt.id !== 'visit_made' && (
                  <div className="flex items-center gap-1 mt-3">
                    <button
                      onClick={() => setSubTypes(s => ({ ...s, [lt.id]: 'basic' }))}
                      className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                      style={subType === 'basic'
                        ? { background: lt.accentColor, color: 'white' }
                        : { background: 'white', color: '#64748b', border: '1px solid #e2e8f0' }}
                    >
                      Basic
                    </button>
                    <button
                      onClick={() => setSubTypes(s => ({ ...s, [lt.id]: 'lifetime' }))}
                      className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                      style={subType === 'lifetime'
                        ? { background: lt.accentColor, color: 'white' }
                        : { background: 'white', color: '#64748b', border: '1px solid #e2e8f0' }}
                    >
                      Lifetime Spent
                    </button>
                  </div>
                )}
              </div>

              {/* Card preview inside a scrollable mini-window */}
              <div className="mx-4 mb-4 rounded-2xl overflow-hidden border border-white/60 shadow-sm"
                style={{ maxHeight: 320, overflowY: 'auto' }}>
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
              <div className="px-4 pb-5">
                <button
                  onClick={() => onSelect(lt, subType)}
                  className="w-full py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 active:scale-95 shadow-md"
                  style={{ background: lt.accentColor }}
                >
                  {isActive ? 'Edit Program →' : 'Activate & Configure →'}
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
  { id: 't1', name: 'Bronze', icon: '🥉', minSpend: 0,      cashback: 2,  pointsRate: 10, visitPoints: 5,  color: '#cd7f32', bg: '#fef3c7' },
  { id: 't2', name: 'Silver', icon: '🥈', minSpend: 5000,   cashback: 4,  pointsRate: 8,  visitPoints: 10, color: '#94a3b8', bg: '#f1f5f9' },
  { id: 't3', name: 'Gold',   icon: '🥇', minSpend: 15000,  cashback: 6,  pointsRate: 5,  visitPoints: 20, color: '#f59e0b', bg: '#fffbeb' },
  { id: 't4', name: 'Platinum',icon: '💠',minSpend: 40000,  cashback: 8,  pointsRate: 3,  visitPoints: 35, color: '#0ea5e9', bg: '#eff6ff' },
  { id: 't5', name: 'Diamond',icon: '💎', minSpend: 100000, cashback: 10, pointsRate: 2,  visitPoints: 50, color: '#06b6d4', bg: '#faf5ff' },
];

function TierRow({ tier, loyaltyType, onChange, onDelete, isFirst }) {
  const [open, setOpen] = useState(isFirst);
  return (
    <div className="bg-white border rounded-2xl overflow-hidden transition-all"
      style={{ borderColor: open ? tier.color + '80' : '#e2e8f0' }}>
      <div onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors select-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg" style={{ background: tier.bg }}>
            {tier.icon}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{tier.name}</p>
            <p className="text-xs text-slate-400">
              {tier.minSpend === 0 ? 'Entry — all customers' : `₹${tier.minSpend.toLocaleString('en-IN')}+ lifetime`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: tier.color }}>
            {loyaltyType === 'cashback' ? `${tier.cashback}%` :
             loyaltyType === 'amount_spent' ? `₹${tier.pointsRate}/pt` :
             `${tier.visitPoints}pts`}
          </span>
          <ChevronRightIcon className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Name</label>
              <input className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                value={tier.name} onChange={e => onChange({ ...tier, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Min Spend (₹)</label>
              <input type="number" disabled={isFirst}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:bg-slate-50 disabled:text-slate-400"
                value={tier.minSpend} onChange={e => onChange({ ...tier, minSpend: parseInt(e.target.value) || 0 })} />
            </div>
          </div>

          {loyaltyType === 'cashback' && (
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Cashback %</label>
                <span className="text-xs font-black text-amber-700">{tier.cashback}%</span>
              </div>
              <input type="range" min={1} max={25} value={tier.cashback}
                onChange={e => onChange({ ...tier, cashback: parseInt(e.target.value) })}
                className="w-full accent-yellow-600" />
            </div>
          )}
          {loyaltyType === 'amount_spent' && (
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">₹ per Point</label>
                <span className="text-xs font-black text-orange-600">₹{tier.pointsRate} = 1 pt</span>
              </div>
              <input type="range" min={1} max={50} value={tier.pointsRate}
                onChange={e => onChange({ ...tier, pointsRate: parseInt(e.target.value) })}
                className="w-full accent-orange-500" />
            </div>
          )}
          {loyaltyType === 'visit_made' && (
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Points / Visit</label>
                <span className="text-xs font-black text-amber-600">{tier.visitPoints} pts</span>
              </div>
              <input type="range" min={1} max={100} value={tier.visitPoints}
                onChange={e => onChange({ ...tier, visitPoints: parseInt(e.target.value) })}
                className="w-full accent-cyan-500" />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Perks</label>
            <input className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              placeholder="e.g. Free delivery, Birthday bonus" defaultValue={tier.perks || ''} />
          </div>

          {!isFirst && (
            <button onClick={() => onDelete(tier.id)}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-semibold">
              <TrashIcon className="w-3.5 h-3.5" /> Remove tier
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ConfigureLoyalty({ loyaltyType, initialSubType, editingRule, onBack, onSave }) {
  const isEdit = !!editingRule;
  const [subType, setSubType] = useState(editingRule?.conditions?.sub_type || initialSubType || 'basic');
  const [brandName, setBrandName] = useState(editingRule?.name || 'Your Brand Rewards');
  const [tiers, setTiers] = useState(
    editingRule?.conditions?.tiers?.length ? editingRule.conditions.tiers : DEFAULT_TIERS
  );
  const [pointsValue, setPointsValue] = useState(editingRule?.actions?.points_value ?? 0.10);
  const [expiryMonths, setExpiryMonths] = useState(editingRule?.actions?.expiry_months ?? 12);
  const [maxRedemptionPct, setMaxRedemptionPct] = useState(editingRule?.actions?.max_redemption_pct ?? 50);
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
      color: '#c9b96e', bg: '#eef2ff', perks: '',
    }]);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: brandName, rule_type: loyaltyType.id,
      conditions: { sub_type: subType, tiers },
      actions: { points_value: pointsValue, expiry_months: expiryMonths, max_redemption_pct: maxRedemptionPct },
      is_active: editingRule ? (editingRule.is_active !== false) : true,
    };
    try {
      if (isEdit) {
        await api.put(`/loyalty/rules/${editingRule.rule_id}`, payload);
      } else {
        await api.post('/loyalty/rules', payload);
      }
    } catch { /* proceed */ }
    toast.success(isEdit ? 'Loyalty program updated! ✅' : 'Loyalty program saved! 🎉');
    setSaving(false);
    onSave({
      name: brandName,
      type: loyaltyType,
      subType: subType,
      tiers: tiers,
      isEdit,
    });
  };

  return (
    <div className="animate-slide-up">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeftIcon className="w-4 h-4" /> Back
        </button>
        <div className="flex gap-2">
          <button onClick={onBack} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 text-sm font-bold text-white rounded-xl flex items-center gap-2 disabled:opacity-60 transition-all"
            style={{ background: loyaltyType.accentColor }}>
            {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isEdit ? 'Save Changes' : 'Save & Activate'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* ── LEFT: live preview ── */}
        <div className="xl:col-span-2">
          <div className="sticky top-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <SparklesIcon className="w-3.5 h-3.5" /> Live Preview
            </p>
            {/* Reelo-style card container */}
            <div className="rounded-3xl border-4 border-slate-200 bg-slate-100 p-3 shadow-xl max-w-[270px] mx-auto">
              {/* Subtype toggle inside frame */}
              {loyaltyType.id !== 'visit_made' && (
                <div className="flex items-center justify-center gap-1 mb-3">
                  {['Basic', 'Lifetime Spent'].map(s => {
                    const v = s === 'Basic' ? 'basic' : 'lifetime';
                    return (
                      <button key={s} onClick={() => setSubType(v)}
                        className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                        style={subType === v
                          ? { background: loyaltyType.accentColor, color: 'white' }
                          : { background: 'white', color: '#64748b', border: '1px solid #e2e8f0' }}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              )}
              {/* The actual card */}
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

            {/* Brand name */}
            <div className="mt-4 max-w-[270px] mx-auto">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Program Name</label>
              <input className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-300 bg-white"
                value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Your Brand Rewards" />
            </div>
          </div>
        </div>

        {/* ── RIGHT: config ── */}
        <div className="xl:col-span-3 space-y-5">
          {/* Subtype selection */}
          {loyaltyType.id !== 'visit_made' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-sm font-black text-slate-900 mb-4">
                Choose {loyaltyType.name} type
              </p>
              <div className="space-y-2.5">
                {(loyaltyType.id === 'cashback' ? [
                  { v: 'basic', badge: '🔥 Most used loyalty type', badgeColor: '#f97316', title: '🪣 Simple Cashback', desc: 'Customers earn a fixed percentage of their order value back as a reward on every purchase.' },
                  { v: 'lifetime', badge: '📈 This can help increase the lifetime spend', badgeColor: '#a89442', title: '😊 Advanced Cashback — Lifetime spent', desc: 'Customers earn rewards based on their total lifetime spending with your business.' },
                ] : [
                  { v: 'basic', badge: '🛒 Per Transaction', badgeColor: '#f97316', title: '🛒 Per Transaction Points', desc: 'Award points for each transaction based on amount spent.' },
                  { v: 'lifetime', badge: '📊 Lifetime Spend Tiers', badgeColor: '#a89442', title: '📊 Lifetime Spend Tiers', desc: 'Reward customers based on their total lifetime spending.' },
                ]).map(opt => (
                  <label key={opt.v} className="block rounded-2xl border-2 p-3.5 cursor-pointer transition-all"
                    style={{ borderColor: subType === opt.v ? loyaltyType.accentColor : '#e2e8f0',
                             background: subType === opt.v ? loyaltyType.accentColor + '08' : 'white' }}>
                    <p className="text-[10px] font-bold mb-1" style={{ color: opt.badgeColor }}>{opt.badge}</p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">{opt.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                      </div>
                      <input type="radio" name="subtype" value={opt.v} checked={subType === opt.v}
                        onChange={() => setSubType(opt.v)} className="w-4 h-4 flex-shrink-0"
                        style={{ accentColor: loyaltyType.accentColor }} />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tiers */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-black text-slate-900">Loyalty Tiers</p>
                <p className="text-xs text-slate-400 mt-0.5">Configure rewards per spending level</p>
              </div>
              <button onClick={addTier} className="flex items-center gap-1.5 text-xs font-bold border px-3 py-1.5 rounded-xl transition-colors"
                style={{ color: loyaltyType.accentColor, borderColor: loyaltyType.accentColor + '40', background: loyaltyType.accentColor + '08' }}>
                <PlusIcon className="w-3.5 h-3.5" /> Add Tier
              </button>
            </div>

            {/* Tier progression dots */}
            <div className="flex items-center gap-0 mb-4 overflow-x-auto pb-1">
              {tiers.map((t, i) => (
                <React.Fragment key={t.id}>
                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm border-2"
                      style={{ background: t.bg, borderColor: t.color }}>{t.icon}</div>
                    <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap">{t.name}</span>
                  </div>
                  {i < tiers.length - 1 && (
                    <div className="flex-1 h-0.5 min-w-[12px] mx-1 mb-4"
                      style={{ background: `linear-gradient(to right, ${t.color}, ${tiers[i + 1]?.color})` }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="space-y-2.5">
              {tiers.map((tier, i) => (
                <TierRow key={tier.id} tier={tier} loyaltyType={loyaltyType.id}
                  onChange={updateTier} onDelete={deleteTier} isFirst={i === 0} />
              ))}
            </div>
          </div>

          {/* Global settings */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="w-4 h-4 text-slate-400" /> Global Settings
            </p>
            <div className="space-y-4">
              {[
                { label: 'Points Value', value: `1 pt = ₹${pointsValue.toFixed(2)}`, min: 0.01, max: 1, step: 0.01, val: pointsValue, set: setPointsValue },
                { label: 'Max Redemption per Bill', value: `${maxRedemptionPct}% of bill`, min: 10, max: 100, step: 5, val: maxRedemptionPct, set: setMaxRedemptionPct },
                { label: 'Points Expiry', value: `${expiryMonths} months`, min: 1, max: 36, step: 1, val: expiryMonths, set: setExpiryMonths },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{s.label}</label>
                    <span className="text-xs font-black" style={{ color: loyaltyType.accentColor }}>{s.value}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                    onChange={e => s.set(parseFloat(e.target.value))}
                    className="w-full" style={{ accentColor: loyaltyType.accentColor }} />
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
// MOCK DATA & HELPERS FOR SHARING HISTORY
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_HISTORY = [
  {
    id: 'act_1',
    programName: 'DECORKART Rewards',
    type: 'Cashback',
    subType: 'basic',
    activatedAt: '2026-06-25T10:30:00Z',
    channels: ['whatsapp', 'email'],
    recipients: 124820,
    status: 'completed',
    messages: {
      whatsapp: "Hey customer! 🎉 We have launched DECORKART Rewards. Get 5% cashback on your next purchase!",
      email: "Subject: Introducing DECORKART Rewards!\n\nDear Customer,\nWe are thrilled to invite you to our new loyalty program. Join now and start earning saving coins on every purchase!"
    }
  },
  {
    id: 'act_2',
    programName: 'Paliwal Mart MB GROCBUY',
    type: 'Amount Spent',
    subType: 'lifetime',
    activatedAt: '2026-05-12T15:45:00Z',
    channels: ['sms'],
    recipients: 45200,
    status: 'completed',
    messages: {
      sms: "Hi! Paliwal Mart MB GROCBUY is now live. Earn points on every spend and redeem for free coffee! Join: https://sbux.in/rewards"
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVATION WIZARD MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ActivationWizardModal({ isOpen, onClose, data, onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedChannels, setSelectedChannels] = useState(['whatsapp']);
  const [whatsappMsg, setWhatsappMsg] = useState('');
  const [smsMsg, setSmsMsg] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  React.useEffect(() => {
    if (data) {
      setWhatsappMsg(`Hey {customer_name}! 🌟 Great news! We have launched our new loyalty program: *${data.name}*. Earn rewards on every purchase! Click here to join: {link}`);
      setSmsMsg(`Hi {customer_name}, we just launched ${data.name}! Get cashback & points on every order. Join now: {link}`);
      setEmailSubject(`Welcome to ${data.name} - Earn Rewards on Every Purchase! 🎁`);
      setEmailBody(`Hi {customer_name},\n\nWe are excited to introduce our brand new loyalty program: ${data.name}!\n\nStarting today, you will earn points and exclusive cashback rewards every time you shop with us.\n\nHere is what you can look forward to:\n- Exclusive tier benefits\n- Special birthday rewards\n- Cashback on every transaction\n\nClick the link below to view your digital loyalty card and start earning!\n{link}\n\nBest regards,\nThe ${data.name} Team`);
      setStep(1);
    }
  }, [data]);

  if (!isOpen || !data) return null;

  const handleToggleChannel = (channel) => {
    setSelectedChannels(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleFinish = () => {
    const newRecord = {
      id: `act_${Date.now()}`,
      programName: data.name,
      type: data.type.name,
      subType: data.subType,
      activatedAt: new Date().toISOString(),
      channels: selectedChannels,
      recipients: 124820,
      status: 'completed',
      messages: {
        ...(selectedChannels.includes('whatsapp') && { whatsapp: whatsappMsg }),
        ...(selectedChannels.includes('sms') && { sms: smsMsg }),
        ...(selectedChannels.includes('email') && { email: `${emailSubject}\n\n${emailBody}` }),
      }
    };
    onComplete(newRecord);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-black text-slate-900">Program Activation Wizard</h3>
            <p className="text-xs text-slate-400 font-semibold">Set up sharing and notify your customers</p>
          </div>
          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? 'w-6 bg-cyan-600' : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === 1 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto text-4xl animate-bounce">
                🎉
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black text-slate-900">Loyalty Program Activated!</h4>
                <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">
                  Excellent! <strong>{data.name}</strong> is now live. All new transactions will earn rewards based on your rules.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 max-w-sm mx-auto border border-slate-100 text-left space-y-2.5">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Program Summary</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Type:</span>
                  <span className="font-bold text-slate-800">{data.type.name} ({data.subType === 'basic' ? 'Basic' : 'Lifetime Spent'})</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Tiers:</span>
                  <span className="font-bold text-slate-800">{data.tiers.length} Active Tiers</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Status:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Live & Active
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 max-w-xs mx-auto font-semibold">
                Next, let's configure how you want to broadcast this program launch to your existing customer base.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-black text-slate-900">Select Campaign Channels</h4>
                <p className="text-xs text-slate-400 font-semibold">Choose where to send the launch notification and customize the message.</p>
              </div>

              <div className="space-y-4">
                {/* WhatsApp */}
                <div className={`border rounded-2xl overflow-hidden transition-all ${selectedChannels.includes('whatsapp') ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200'}`}>
                  <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50" onClick={() => handleToggleChannel('whatsapp')}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl">
                        💬
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">WhatsApp Broadcast</p>
                        <p className="text-xs text-slate-400 font-semibold">Send rich text & link directly to WhatsApp</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes('whatsapp')}
                      onChange={() => {}}
                      className="w-5 h-5 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                    />
                  </div>
                  {selectedChannels.includes('whatsapp') && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-2 bg-white">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Message Template</label>
                      <textarea
                        value={whatsappMsg}
                        onChange={e => setWhatsappMsg(e.target.value)}
                        rows={3}
                        className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 bg-slate-50"
                      />
                      <div className="flex gap-1.5 flex-wrap">
                        {['{customer_name}', '{brand_name}', '{link}'].map(tag => (
                          <button
                            key={tag}
                            onClick={() => setWhatsappMsg(p => p + ' ' + tag)}
                            className="text-[10px] bg-slate-100 text-slate-600 hover:bg-slate-200 px-2 py-0.5 rounded font-bold"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* SMS */}
                <div className={`border rounded-2xl overflow-hidden transition-all ${selectedChannels.includes('sms') ? 'border-orange-500 bg-orange-50/10' : 'border-slate-200'}`}>
                  <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50" onClick={() => handleToggleChannel('sms')}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl">
                        📱
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">SMS Campaign</p>
                        <p className="text-xs text-slate-400 font-semibold">Send standard text messages to mobile phones</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes('sms')}
                      onChange={() => {}}
                      className="w-5 h-5 rounded text-orange-600 accent-orange-600 cursor-pointer"
                    />
                  </div>
                  {selectedChannels.includes('sms') && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-2 bg-white">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">SMS Text</label>
                      <textarea
                        value={smsMsg}
                        onChange={e => setSmsMsg(e.target.value)}
                        rows={2}
                        maxLength={160}
                        className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-700 bg-slate-50"
                      />
                      <div className="flex justify-between items-center">
                        <div className="flex gap-1.5">
                          {['{customer_name}', '{brand_name}', '{link}'].map(tag => (
                            <button
                              key={tag}
                              onClick={() => setSmsMsg(p => p + ' ' + tag)}
                              className="text-[10px] bg-slate-100 text-slate-600 hover:bg-slate-200 px-2 py-0.5 rounded font-bold"
                            >
                              + {tag}
                            </button>
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">{smsMsg.length}/160 chars</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className={`border rounded-2xl overflow-hidden transition-all ${selectedChannels.includes('email') ? 'border-purple-500 bg-purple-50/10' : 'border-slate-200'}`}>
                  <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50" onClick={() => handleToggleChannel('email')}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">
                        ✉️
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Email Newsletter</p>
                        <p className="text-xs text-slate-400 font-semibold">Send high-converting rich emails to customer inboxes</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes('email')}
                      onChange={() => {}}
                      className="w-5 h-5 rounded text-purple-600 accent-purple-600 cursor-pointer"
                    />
                  </div>
                  {selectedChannels.includes('email') && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3 bg-white">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Subject Line</label>
                        <input
                          type="text"
                          value={emailSubject}
                          onChange={e => setEmailSubject(e.target.value)}
                          className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-700 bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Email Body</label>
                        <textarea
                          value={emailBody}
                          onChange={e => setEmailBody(e.target.value)}
                          rows={4}
                          className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-700 bg-slate-50"
                        />
                      </div>
                      <div className="flex gap-1.5">
                        {['{customer_name}', '{brand_name}', '{link}'].map(tag => (
                          <button
                            key={tag}
                            onClick={() => setEmailBody(p => p + ' ' + tag)}
                            className="text-[10px] bg-slate-100 text-slate-600 hover:bg-slate-200 px-2 py-0.5 rounded font-bold"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-20 h-20 bg-cyan-50 border border-cyan-100 rounded-full flex items-center justify-center mx-auto text-4xl animate-pulse">
                🚀
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black text-slate-900">Campaign Initiated!</h4>
                <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">
                  Awesome! We are now broadcasting the program launch to your customers. You can monitor delivery stats from the history tab.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 max-w-md mx-auto border border-slate-100 text-left space-y-3">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Broadcast Details</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Recipients:</span>
                  <span className="font-bold text-slate-800">1,24,820 customers</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Channels:</span>
                  <div className="flex gap-1.5">
                    {selectedChannels.map(ch => (
                      <span key={ch} className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        ch === 'whatsapp' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' :
                        ch === 'sms' ? 'text-orange-700 bg-orange-50 border border-orange-100' :
                        'text-purple-700 bg-purple-50 border border-purple-100'
                      }`}>
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Progress Status:</span>
                  <span className="font-bold text-cyan-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping" /> Sending...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
          {step === 2 ? (
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 bg-white rounded-xl hover:bg-slate-50"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step === 1 && (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 text-sm font-bold text-white bg-cyan-600 rounded-xl hover:bg-cyan-700 shadow-md flex items-center gap-1.5 ml-auto"
            >
              Configure Share Channels →
            </button>
          )}

          {step === 2 && (
            <button
              onClick={handleNext}
              disabled={selectedChannels.length === 0}
              className="px-5 py-2.5 text-sm font-bold text-white bg-cyan-600 rounded-xl hover:bg-cyan-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
            >
              Activate & Share Now 🚀
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleFinish}
              className="px-5 py-2.5 text-sm font-bold text-white bg-cyan-600 rounded-xl hover:bg-cyan-700 shadow-md ml-auto"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HISTORY DETAIL MODAL
// ─────────────────────────────────────────────────────────────────────────────
function HistoryDetailModal({ isOpen, onClose, record }) {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-black text-slate-900">Campaign Messages</h3>
            <p className="text-xs text-slate-400 font-semibold">{record.programName} · {new Date(record.activatedAt).toLocaleString('en-IN')}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-xs font-bold border px-2.5 py-1 rounded-lg bg-white border-slate-200 shadow-sm">
            Close
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {Object.entries(record.messages || {}).map(([channel, content]) => (
            <div key={channel} className="space-y-2">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  channel === 'whatsapp' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' :
                  channel === 'sms' ? 'text-orange-700 bg-orange-50 border border-orange-100' :
                  'text-purple-700 bg-purple-50 border border-purple-100'
                }`}>
                  {channel} Message
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
                {content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE STATS VIEW (WITH HISTORY TAB)
// ─────────────────────────────────────────────────────────────────────────────
function ActiveView({ loyaltyType, onEdit, onChangeType, history, onViewDetails }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="animate-slide-up space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Loyalty Active</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Loyalty Program</h1>
          <p className="text-sm text-slate-500">{loyaltyType.name} · {loyaltyType.tagline || 'Get rewarded on every purchase'}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onChangeType}
            className="px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Change Type
          </button>
          <button onClick={onEdit}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white rounded-xl transition-colors"
            style={{ background: loyaltyType.accentColor }}>
            <PencilIcon className="w-4 h-4" /> Edit Program
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6 -mb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-black transition-all border-b-2 ${
              activeTab === 'overview'
                ? 'border-cyan-600 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            📊 Overview & Stats
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-black transition-all border-b-2 ${
              activeTab === 'history'
                ? 'border-cyan-600 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            🗓️ Activation & Share History
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: 'Active Members', value: '1,24,820', trend: '+8.2%', icon: '👥', color: '#a89442', bg: '#f0fdfa' },
              { label: 'Points Issued (30d)', value: '48.4L', trend: '+12.4%', icon: '⭐', color: '#f59e0b', bg: '#fffbeb' },
              { label: 'Redemption Rate', value: '72.8%', trend: '+1.4%', icon: '🔄', color: '#c9b96e', bg: '#faf5ff' },
              { label: 'Revenue Impact', value: '₹12.4L', trend: '+18.6%', icon: '💰', color: '#16a34a', bg: '#f0fdf4' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-4 border border-white/80" style={{ background: s.bg }}>
                <span className="text-2xl">{s.icon}</span>
                <p className="text-2xl font-black mt-2" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-slate-600 font-medium mt-0.5">{s.label}</p>
                <p className="text-xs font-bold text-amber-600 mt-0.5">↑ {s.trend}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="text-base font-black text-slate-900 mb-4">Tier Breakdown</h2>
            <div className="space-y-3">
              {DEFAULT_TIERS.map((tier, i) => {
                const members = [1248, 840, 320, 82, 16][i];
                const pct = [50, 33, 13, 3, 1][i];
                return (
                  <div key={tier.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: tier.bg }}>
                      {tier.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-slate-800">{tier.name}</span>
                        <span className="text-slate-500">{members.toLocaleString('en-IN')} members</span>
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
        </>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-slide-up">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-black text-slate-800">Recent Activations & Launch Campaigns</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-semibold">Track how and when your loyalty programs were activated and shared</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Program & Type</th>
                  <th className="px-6 py-3">Activated Date</th>
                  <th className="px-6 py-3">Share Channels</th>
                  <th className="px-6 py-3">Recipients</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {history && history.length > 0 ? (
                  history.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{item.programName}</p>
                        <p className="text-xs text-slate-400 mt-0.5 font-semibold">{item.type} ({item.subType === 'basic' ? 'Basic' : 'Lifetime Spent'})</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">
                        {new Date(item.activatedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5">
                          {item.channels && item.channels.length > 0 ? (
                            item.channels.map(ch => (
                              <span key={ch} className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                ch === 'whatsapp' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' :
                                ch === 'sms' ? 'text-orange-700 bg-orange-50 border border-orange-100' :
                                'text-purple-700 bg-purple-50 border border-purple-100'
                              }`}>
                                {ch}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic font-semibold">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {item.recipients ? item.recipients.toLocaleString('en-IN') : '0'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                          item.status === 'completed' ? 'text-emerald-700 bg-emerald-50' : 'text-cyan-700 bg-cyan-50'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'completed' ? 'bg-emerald-500' : 'bg-cyan-500 animate-pulse'
                          }`} />
                          {item.status === 'completed' ? 'Completed' : 'Sending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.messages && Object.keys(item.messages).length > 0 ? (
                          <button
                            onClick={() => onViewDetails(item)}
                            className="text-xs font-bold text-cyan-600 hover:text-cyan-800 border border-cyan-100 hover:border-cyan-200 px-3 py-1.5 rounded-xl bg-white transition-colors shadow-sm"
                          >
                            View Messages
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400 font-semibold">
                      No activations recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRAMS LIST VIEW — hub showing all created loyalty programs
// ─────────────────────────────────────────────────────────────────────────────
function ProgramsListView({ programs, loading, onCreateNew, onView, onEdit, onDelete, onToggle }) {
  const [tab, setTab] = useState('all');   // all | active | inactive

  const filtered = programs.filter(p => {
    if (tab === 'all') return true;
    if (tab === 'active') return p.is_active !== false;
    return p.is_active === false;
  });

  const activeCount = programs.filter(p => p.is_active !== false).length;
  const inactiveCount = programs.length - activeCount;

  return (
    <div className="animate-slide-up space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Loyalty Programs</h1>
          <p className="text-sm text-slate-500 mt-1">Create, activate and manage your reward programs.</p>
        </div>
        <button onClick={onCreateNew}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
          <PlusIcon className="w-4 h-4" /> Create New Program
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full w-fit">
        {[
          { id: 'all', label: `All (${programs.length})` },
          { id: 'active', label: `Active (${activeCount})` },
          { id: 'inactive', label: `Inactive (${inactiveCount})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
            style={tab === t.id ? { background: '#0d9488', color: 'white' } : { color: '#64748b' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 h-44 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-200 rounded-2xl">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-4 border border-teal-100">
            <SparklesIcon className="w-8 h-8 text-teal-500" />
          </div>
          <p className="text-base font-bold text-slate-700">
            {programs.length === 0 ? 'No loyalty programs yet' : `No ${tab} programs`}
          </p>
          <p className="text-sm text-slate-400 mt-1 max-w-sm">
            {programs.length === 0
              ? 'Create your first loyalty program to start rewarding your customers and driving repeat visits.'
              : 'Try switching tabs or create a new program.'}
          </p>
          {programs.length === 0 && (
            <button onClick={onCreateNew}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
              <PlusIcon className="w-4 h-4" /> Create New Program
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => {
            const lt = LOYALTY_TYPES.find(t => t.id === p.rule_type) || LOYALTY_TYPES[0];
            const isActive = p.is_active !== false;
            const tierCount = p.conditions?.tiers?.length || 0;
            const subType = p.conditions?.sub_type === 'lifetime' ? 'Lifetime Spent' : 'Basic';
            return (
              <div key={p.rule_id}
                className="bg-white border rounded-2xl p-5 transition-all hover:shadow-md"
                style={{ borderColor: isActive ? lt.accentColor + '40' : '#e2e8f0' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: lt.iconBg }}>
                      {lt.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900 truncate">{p.name}</p>
                      <p className="text-xs text-slate-400">{lt.name} · {subType}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${isActive ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-slate-100 text-slate-500'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="rounded-xl border border-slate-100 px-3 py-2">
                    <p className="text-[10px] text-slate-400 font-medium">Tiers</p>
                    <p className="text-sm font-bold text-slate-800">{tierCount}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 px-3 py-2">
                    <p className="text-[10px] text-slate-400 font-medium">Point Value</p>
                    <p className="text-sm font-bold text-slate-800">₹{(p.actions?.points_value ?? 0).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onToggle(p)}
                    title={isActive ? 'Pause program' : 'Activate program'}
                    className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-colors ${isActive ? 'border-amber-200 text-amber-600 hover:bg-amber-50' : 'border-teal-200 text-teal-600 hover:bg-teal-50'}`}>
                    {isActive ? <PauseIcon className="w-3.5 h-3.5" /> : <PlayIcon className="w-3.5 h-3.5" />}
                    {isActive ? 'Pause' : 'Activate'}
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => onView(p)} title="View program"
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 transition-colors">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => onEdit(p)} title="Edit program"
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-colors">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(p)} title="Delete program"
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Program Detail (View) Modal ──────────────────────────────────────────────
function ProgramDetailModal({ program, onClose, onEdit }) {
  if (!program) return null;
  const lt = LOYALTY_TYPES.find(t => t.id === program.rule_type) || LOYALTY_TYPES[0];
  const isActive = program.is_active !== false;
  const tiers = program.conditions?.tiers || [];
  const subType = program.conditions?.sub_type === 'lifetime' ? 'Lifetime Spent' : 'Basic';
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: lt.iconBg }}>{lt.icon}</div>
            <div>
              <p className="text-sm font-black text-slate-900">{program.name}</p>
              <p className="text-xs text-slate-400">{lt.name} · {subType}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors text-xl">×</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Status', value: isActive ? 'Active' : 'Inactive' },
              { label: 'Type', value: `${lt.name} (${subType})` },
              { label: 'Point Value', value: `1 pt = ₹${(program.actions?.points_value ?? 0).toFixed(2)}` },
              { label: 'Max Redemption', value: `${program.actions?.max_redemption_pct ?? 0}% of bill` },
              { label: 'Points Expiry', value: `${program.actions?.expiry_months ?? 0} months` },
              { label: 'Created', value: program.created_at ? new Date(program.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
            ].map(r => (
              <div key={r.label} className="rounded-xl border border-slate-100 px-3 py-2.5">
                <p className="text-[11px] text-slate-400 font-medium">{r.label}</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{r.value}</p>
              </div>
            ))}
          </div>

          {tiers.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Tiers ({tiers.length})</p>
              <div className="space-y-2">
                {tiers.map((t, i) => (
                  <div key={t.id || i} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-base" style={{ background: t.bg || '#f1f5f9' }}>{t.icon || '⭐'}</span>
                      <span className="text-sm font-bold text-slate-800">{t.name}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Min ₹{(t.minSpend ?? 0).toLocaleString('en-IN')}
                      {program.rule_type === 'cashback' ? ` · ${t.cashback ?? 0}% cashback` :
                       program.rule_type === 'visit_made' ? ` · ${t.visitPoints ?? 0} pts/visit` :
                       ` · ₹${t.pointsRate ?? 0}=1pt`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Close</button>
          <button onClick={onEdit} className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white rounded-xl transition-colors" style={{ background: lt.accentColor }}>
            <PencilIcon className="w-4 h-4" /> Edit Program
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Program Confirmation ──────────────────────────────────────────────
function DeleteProgramModal({ program, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <TrashIcon className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Delete Loyalty Program?</h3>
          <p className="text-sm text-slate-500 mt-1.5">
            <span className="font-semibold text-slate-700">"{program?.name || 'This program'}"</span> will be permanently removed. Customers will stop earning these rewards.
          </p>
          <div className="flex items-center gap-2 mt-6">
            <button onClick={onCancel} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={onConfirm} className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function LoyaltyPage() {
  const [view, setView] = useState('programs');        // programs | choose | configure | active
  const [activeLoyaltyType, setActiveLoyaltyType] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [editingSubType, setEditingSubType] = useState('basic');
  const [editingRule, setEditingRule] = useState(null);    // rule being edited (PUT) or null (create)

  // Programs list (real data from backend)
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [viewingProgram, setViewingProgram] = useState(null);
  const [deletingProgram, setDeletingProgram] = useState(null);

  // Activation / share wizard states
  const [showWizard, setShowWizard] = useState(false);
  const [wizardData, setWizardData] = useState(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('loyalty_activation_history');
    return saved ? JSON.parse(saved) : MOCK_HISTORY;
  });

  const fetchPrograms = () => {
    setLoadingPrograms(true);
    api.get('/loyalty/rules')
      .then(r => setPrograms(r.data.rules || []))
      .catch(() => setPrograms([]))
      .finally(() => setLoadingPrograms(false));
  };

  useEffect(() => { fetchPrograms(); }, []);

  // Create new → choose type
  const handleCreateNew = () => {
    setEditingRule(null);
    setActiveLoyaltyType(null);
    setView('choose');
  };

  const handleSelect = (lt, sub) => {
    setEditingType(lt);
    setEditingSubType(sub);
    setEditingRule(null);
    setView('configure');
  };

  // Edit an existing program
  const handleEditProgram = (rule) => {
    const lt = LOYALTY_TYPES.find(t => t.id === rule.rule_type) || LOYALTY_TYPES[0];
    setEditingType(lt);
    setEditingSubType(rule.conditions?.sub_type || 'basic');
    setEditingRule(rule);
    setView('configure');
  };

  // Toggle active / inactive
  const handleToggleProgram = async (rule) => {
    const nextActive = !(rule.is_active !== false);
    setPrograms(prev => prev.map(p => p.rule_id === rule.rule_id ? { ...p, is_active: nextActive } : p));
    try {
      await api.put(`/loyalty/rules/${rule.rule_id}`, { is_active: nextActive });
      toast.success(nextActive ? 'Program activated' : 'Program paused');
    } catch {
      toast.error('Failed to update status');
      fetchPrograms();
    }
  };

  const handleDeleteProgram = async () => {
    if (!deletingProgram) return;
    try {
      await api.delete(`/loyalty/rules/${deletingProgram.rule_id}`);
      setPrograms(prev => prev.filter(p => p.rule_id !== deletingProgram.rule_id));
      toast.success('Loyalty program deleted');
    } catch {
      toast.error('Failed to delete program');
    } finally {
      setDeletingProgram(null);
    }
  };

  const handleSaved = (data) => {
    fetchPrograms();
    if (data?.isEdit) {
      // Editing — no re-share wizard, just return to the list
      setEditingRule(null);
      setView('programs');
    } else {
      setWizardData(data);
      setShowWizard(true);
    }
  };

  const handleWizardComplete = (newRecord) => {
    const updatedHistory = [newRecord, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('loyalty_activation_history', JSON.stringify(updatedHistory));
    setActiveLoyaltyType(wizardData.type);
    setShowWizard(false);
    fetchPrograms();
    setView('programs');
  };

  return (
    <div className="pb-10">
      {view === 'programs' && (
        <ProgramsListView
          programs={programs}
          loading={loadingPrograms}
          onCreateNew={handleCreateNew}
          onView={(p) => setViewingProgram(p)}
          onEdit={handleEditProgram}
          onDelete={(p) => setDeletingProgram(p)}
          onToggle={handleToggleProgram}
        />
      )}
      {view === 'choose' && (
        <div className="space-y-4 animate-slide-up">
          <button onClick={() => setView('programs')}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeftIcon className="w-4 h-4" /> Back to Programs
          </button>
          <ChooseLoyaltyType existing={activeLoyaltyType} onSelect={handleSelect} />
        </div>
      )}
      {view === 'configure' && editingType && (
        <ConfigureLoyalty
          loyaltyType={editingType}
          initialSubType={editingSubType}
          editingRule={editingRule}
          onBack={() => setView(editingRule ? 'programs' : 'choose')}
          onSave={handleSaved}
        />
      )}
      {view === 'active' && activeLoyaltyType && (
        <ActiveView
          loyaltyType={activeLoyaltyType}
          onEdit={() => { setEditingType(activeLoyaltyType); setView('configure'); }}
          onChangeType={() => setView('programs')}
          history={history}
          onViewDetails={(item) => setSelectedHistoryItem(item)}
        />
      )}

      {/* MODALS */}
      {viewingProgram && (
        <ProgramDetailModal
          program={viewingProgram}
          onClose={() => setViewingProgram(null)}
          onEdit={() => { const p = viewingProgram; setViewingProgram(null); handleEditProgram(p); }}
        />
      )}

      {deletingProgram && (
        <DeleteProgramModal
          program={deletingProgram}
          onCancel={() => setDeletingProgram(null)}
          onConfirm={handleDeleteProgram}
        />
      )}

      <ActivationWizardModal
        isOpen={showWizard}
        onClose={() => { setShowWizard(false); setView('programs'); }}
        data={wizardData}
        onComplete={handleWizardComplete}
      />

      <HistoryDetailModal
        isOpen={!!selectedHistoryItem}
        onClose={() => setSelectedHistoryItem(null)}
        record={selectedHistoryItem}
      />
    </div>
  );
}


