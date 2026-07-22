import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon, PlusIcon, FunnelIcon, ChevronDownIcon,
  ArrowUpIcon, ArrowDownIcon, ArrowsUpDownIcon, QuestionMarkCircleIcon,
  UserGroupIcon, SparklesIcon, ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon,
  BellIcon, AdjustmentsHorizontalIcon, ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie
} from 'recharts';
import CustomerModal from '../components/customers/CustomerModal';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA & CUSTOM HARMONIOUS COLOR SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_CUSTOMERS = (() => {
  const tiers = ['Silver', 'Gold', 'Platinum', 'Diamond'];
  const names = [
    'Siddharth Sharma', 'Priya Patel', 'Rahul Gupta', 'Anjali Singh',
    'Vikram Mehta', 'Neha Joshi', 'Arjun Kumar', 'Deepa Nair',
    'Rohan Kapoor', 'Sneha Reddy', 'Kiran Bose', 'Manish Tiwari',
    'Pooja Verma', 'Suresh Nair', 'Divya Menon', 'Amit Sharma',
  ];
  return names.map((name, i) => ({
    customer_id: `cust-${i}`,
    name,
    email: `${name.split(' ')[0].toLowerCase()}@email.com`,
    mobile: `+9198765${String(43210 + i).padStart(5, '0')}`,
    loyalty_tier: tiers[i % 4],
    lifetime_value: Math.floor(Math.random() * 180000) + 5000,
    current_points_balance: Math.floor(Math.random() * 5000),
    churn_probability: Math.random() * 0.92,
    status: i % 8 === 0 ? 'churned' : i % 5 === 0 ? 'inactive' : 'active',
    created_at: new Date(Date.now() - Math.random() * 1.2e10).toISOString(),
    last_purchase_date: new Date(Date.now() - Math.random() * 6e9).toISOString(),
    city: ['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad'][i % 5],
    total_orders: Math.floor(Math.random() * 40) + 1,
    segment: ['Champions', 'Loyal', 'Potential', 'At Risk', 'Lost'][i % 5],
  }));
})();

const OVERVIEW_CHART_DATA = [
  { month: 'Jul', new: 320, repeat: 840 },
  { month: 'Aug', new: 410, repeat: 920 },
  { month: 'Sep', new: 380, repeat: 1010 },
  { month: 'Oct', new: 520, repeat: 1140 },
  { month: 'Nov', new: 680, repeat: 1320 },
  { month: 'Dec', new: 890, repeat: 1480 },
  { month: 'Jan', new: 720, repeat: 1280 },
  { month: 'Feb', new: 640, repeat: 1190 },
  { month: 'Mar', new: 810, repeat: 1420 },
  { month: 'Apr', new: 760, repeat: 1560 },
  { month: 'May', new: 930, repeat: 1740 },
  { month: 'Jun', new: 342, repeat: 906 },
];

const WEEKDAY_DATA = [
  { day: 'Mon', customers: 820 },
  { day: 'Tue', customers: 740 },
  { day: 'Wed', customers: 910 },
  { day: 'Thu', customers: 860 },
  { day: 'Fri', customers: 1240 },
  { day: 'Sat', customers: 1820 },
  { day: 'Sun', customers: 1640 },
];

const TIER_PIE = [
  { name: 'Silver', value: 840, color: '#94a3b8' },
  { name: 'Gold', value: 310, color: '#f59e0b' },
  { name: 'Platinum', value: 82, color: '#818cf8' },
  { name: 'Diamond', value: 16, color: '#a855f7' },
];

const SEGMENT_DATA = [
  { name: 'Champions', value: 2840, color: '#4f46e5', desc: 'High frequency, high spend advocates' },
  { name: 'Loyal', value: 5120, color: '#6366f1', desc: 'Regular, steady store visitors' },
  { name: 'Potential', value: 8400, color: '#06b6d4', desc: 'Showing growing engagement signs' },
  { name: 'At Risk', value: 3200, color: '#f59e0b', desc: 'Declining visit frequency' },
  { name: 'Lost', value: 1840, color: '#ec4899', desc: 'No recent store purchase' },
];

const CITY_DATA = [
  { city: 'Delhi', customers: 4280, pct: 34 },
  { city: 'Mumbai', customers: 3120, pct: 25 },
  { city: 'Bangalore', customers: 2840, pct: 23 },
  { city: 'Pune', customers: 1240, pct: 10 },
  { city: 'Hyderabad', customers: 920, pct: 7 },
];

const ACTIVITY_LOG = [
  { id: 'a1', name: 'Siddharth Sharma', action: 'Made a purchase', amount: '₹4,280', store: 'Delhi Flagship', time: '2 min ago', type: 'purchase', tier: 'Diamond' },
  { id: 'a2', name: 'Priya Patel', action: 'Redeemed 500 points', amount: '₹50 off', store: 'Mumbai Colaba', time: '8 min ago', type: 'redeem', tier: 'Gold' },
  { id: 'a3', name: 'Rahul Gupta', action: 'Tier upgraded to Platinum', amount: '', store: '', time: '22 min ago', type: 'upgrade', tier: 'Platinum' },
  { id: 'a4', name: 'Anjali Singh', action: 'New signup', amount: '', store: 'Online', time: '35 min ago', type: 'signup', tier: 'Silver' },
  { id: 'a5', name: 'Vikram Mehta', action: 'Coupon NEW15 redeemed', amount: '15% off', store: 'Pune Camp', time: '1 hr ago', type: 'coupon', tier: 'Gold' },
  { id: 'a6', name: 'Neha Joshi', action: 'WhatsApp message delivered', amount: '', store: '', time: '1 hr ago', type: 'whatsapp', tier: 'Silver' },
  { id: 'a7', name: 'Arjun Kumar', action: 'Made a purchase', amount: '₹2,100', store: 'Bangalore Indiranagar', time: '2 hrs ago', type: 'purchase', tier: 'Silver' },
  { id: 'a8', name: 'Deepa Nair', action: 'Birthday offer claimed', amount: '₹200 off', store: 'Online', time: '3 hrs ago', type: 'coupon', tier: 'Platinum' },
];

// ─────────────────────────────────────────────────────────────────────────────
// COLOR CONFIGS & LABELS — High-contrast light theme tags
// ─────────────────────────────────────────────────────────────────────────────
const TIER_STYLE = {
  Silver:   { cls: 'bg-slate-100 text-slate-700 border-slate-200', dot: '#94a3b8' },
  Gold:     { cls: 'bg-amber-50 text-amber-855 border-amber-200', dot: '#f59e0b' },
  Platinum: { cls: 'bg-indigo-50 text-indigo-850 border-indigo-200', dot: '#818cf8' },
  Diamond:  { cls: 'bg-purple-50 text-purple-850 border-purple-200', dot: '#a855f7' },
};

const STATUS_STYLE = {
  active:   'bg-emerald-50 text-emerald-700 border border-emerald-255/40',
  inactive: 'bg-amber-50 text-amber-700 border border-amber-255/40',
  churned:  'bg-rose-50 text-rose-700 border border-rose-255/40',
};

const ACT_STYLE = {
  purchase: { bg: 'bg-emerald-50 border border-emerald-100 text-emerald-700', icon: '🛍️' },
  redeem:   { bg: 'bg-indigo-50 border border-indigo-100 text-indigo-700', icon: '⭐' },
  upgrade:  { bg: 'bg-purple-50 border border-purple-100 text-purple-700', icon: '⬆️' },
  signup:   { bg: 'bg-blue-50 border border-blue-100 text-blue-750', icon: '👋' },
  coupon:   { bg: 'bg-pink-50 border border-pink-100 text-pink-700', icon: '🎟️' },
  whatsapp: { bg: 'bg-emerald-50 border border-emerald-100 text-emerald-700', icon: '💬' },
};

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 shadow-2xl text-xs text-white">
      <p className="font-bold text-slate-300 mb-1.5">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-1.5 mb-1 last:mb-0">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-extrabold text-white">
            {typeof p.value === 'number' && p.name.includes('Spend') ? '₹' : ''}
            {Number(p.value).toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DATE RANGE SELECTOR — Clean light-themed dropdown
// ─────────────────────────────────────────────────────────────────────────────
function DateRangeSelect({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none text-xs font-black text-slate-600 bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm transition-all"
      >
        {options.map(o => <option key={o.value} value={o.value} className="bg-white text-slate-850">{o.label}</option>)}
      </select>
      <ChevronDownIcon className="w-3.5 h-3.5 text-slate-450 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW TAB — Modern Light Layout
// ─────────────────────────────────────────────────────────────────────────────
function OverviewTab() {
  const [snapshotRange, setSnapshotRange] = useState('12m');
  const [newRepeatRange, setNewRepeatRange] = useState('30d');

  const totalCustomers = MOCK_CUSTOMERS.length;
  const newCustomers = MOCK_CUSTOMERS.filter(c => new Date(c.created_at) > new Date(Date.now() - 30 * 86400000)).length;
  const repeatCustomers = MOCK_CUSTOMERS.filter(c => c.total_orders > 1).length;

  return (
    <div className="space-y-6">
      
      {/* Snapshot Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Customer Snapshot</h3>
            <p className="text-xs text-slate-400 mt-0.5">Overview of registered and active loyalty customers</p>
          </div>
          <DateRangeSelect
            value={snapshotRange}
            onChange={setSnapshotRange}
            options={[
              { value: '12m', label: 'Last 12 Months' },
              { value: '6m', label: 'Last 6 Months' },
              { value: '30d', label: 'Last 30 Days' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Registered Club', value: totalCustomers.toLocaleString('en-IN'), sub: 'All-time loyalty profiles', icon: <UserGroupIcon className="w-5 h-5" />, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', cardBg: 'metric-card-mint' },
            { label: 'New Members Acquired', value: newCustomers.toLocaleString('en-IN'), sub: `+${Math.round(newCustomers/totalCustomers*100)}% increase this month`, icon: <SparklesIcon className="w-5 h-5" />, color: 'text-pink-650', bg: 'bg-pink-50 border-pink-100', cardBg: 'metric-card-cyan' },
            { label: 'Repeat Purchase Members', value: repeatCustomers.toLocaleString('en-IN'), sub: `${Math.round(repeatCustomers/totalCustomers*100)}% repeat visit rate`, icon: <ArrowTrendingUpIcon className="w-5 h-5" />, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100', cardBg: 'metric-card-green' },
          ].map(card => (
            <div key={card.label} className={`glass-card p-5 relative overflow-hidden group hover:scale-[1.01] transition-all bg-white border border-slate-100`}>
              <div className="flex justify-between items-center mb-4">
                <span className={`p-2 rounded-xl border ${card.bg}`}>{card.icon}</span>
              </div>
              <p className={`text-3xl font-black ${card.color} tracking-tight leading-none`}>{card.value}</p>
              <p className="text-xs text-slate-800 font-bold mt-3 leading-tight">{card.label}</p>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-1.5 tracking-wider">{card.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* New vs Repeat AreaChart */}
      <section className="glass-card p-6 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Acquisition vs Retention</h3>
            <p className="text-xs text-slate-400 mt-0.5">Compare new signup runs to repeat visitor loyalty logs</p>
          </div>
          <DateRangeSelect 
            value={newRepeatRange} 
            onChange={setNewRepeatRange}
            options={[
              { value: '30d', label: 'Last 30 Days' },
              { value: '90d', label: 'Last 90 Days' },
              { value: '12m', label: 'Last 12 Months' },
            ]}
          />
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={OVERVIEW_CHART_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gRepeat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} fontWeight={650} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} fontWeight={650} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="repeat" name="Repeat Customers" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#gRepeat)" />
              <Area type="monotone" dataKey="new" name="New Signups" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#gNew)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Customer Insights Grid */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Customers By Day */}
        <div className="glass-card p-6 bg-white">
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Weekly Peak Visits</h4>
            <p className="text-xs text-slate-400 mt-0.5">Understand customer traffic distribution patterns</p>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-650">
              {Math.round((WEEKDAY_DATA[5].customers + WEEKDAY_DATA[6].customers) / WEEKDAY_DATA.reduce((s, d) => s + d.customers, 0) * 100)}%
            </span>
            <span className="text-xs text-slate-500 font-semibold">of visits happen on <strong className="text-indigo-600">weekends</strong></span>
          </div>

          <div className="h-32 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKDAY_DATA}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} fontWeight={650} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="customers" radius={[6, 6, 0, 0]} barSize={24}>
                  {WEEKDAY_DATA.map((d, i) => (
                    <Cell key={i} fill={i >= 5 ? '#ec4899' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average spend comparison */}
        <div className="glass-card p-6 bg-white">
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Average Basket Value</h4>
            <p className="text-xs text-slate-400 mt-0.5">Average spend value of new versus returning regulars</p>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-pink-600">+18%</span>
            <span className="text-xs text-slate-500 font-semibold">higher basket value from <strong className="text-pink-650">repeat customers</strong></span>
          </div>

          <div className="mt-6 space-y-4">
            {[
              { label: 'New Signups Average Basket', value: 2100, max: 4200, color: 'from-slate-300 to-slate-400' },
              { label: 'Repeat Regulars Average Basket', value: 3680, max: 4200, color: 'from-indigo-500 to-pink-500' },
            ].map(bar => (
              <div key={bar.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-slate-500">{bar.label}</span>
                  <span className="font-black text-slate-800">₹{bar.value.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                  <div className={`h-full rounded-full bg-gradient-to-r ${bar.color} transition-all duration-700`}
                    style={{ width: `${(bar.value / bar.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Top Cities Distribution */}
      <section className="glass-card p-6 bg-white">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Top Geographical Markets</h3>
        </div>
        <div className="space-y-4">
          {CITY_DATA.map((c, i) => (
            <div key={c.city} className="flex items-center gap-4">
              <span className="w-6 h-6 rounded-lg bg-slate-50 text-slate-500 text-xs flex items-center justify-center font-black border border-slate-200/60">{i + 1}</span>
              <span className="text-xs font-black text-slate-700 w-24">{c.city}</span>
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-700"
                  style={{ width: `${c.pct}%` }} />
              </div>
              <span className="text-xs font-black text-slate-800 w-28 text-right">{c.customers.toLocaleString('en-IN')} members</span>
              <span className="text-xs text-slate-400 w-10 text-right font-bold">{c.pct}%</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SEGMENTATION TAB
// ─────────────────────────────────────────────────────────────────────────────
function SegmentationTab() {
  const [selected, setSelected] = useState('Champions');
  const selectedSeg = SEGMENT_DATA.find(s => s.name === selected);
  const selectedCustomers = MOCK_CUSTOMERS.filter(c => c.segment === selected);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Pie Chart Selection */}
        <div className="glass-card p-6 bg-white">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">RFM Engagement Rings</h3>
          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={SEGMENT_DATA} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={48} 
                  outerRadius={65} 
                  paddingAngle={4} 
                  dataKey="value"
                  onClick={d => setSelected(d.name)}
                  cursor="pointer"
                >
                  {SEGMENT_DATA.map((s, i) => (
                    <Cell 
                      key={i} 
                      fill={s.color} 
                      opacity={selected === s.name ? 1 : 0.4} 
                      stroke={selected === s.name ? "#6366f1" : "none"} 
                      strokeWidth={1.5} 
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => v.toLocaleString('en-IN')} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4">
            {SEGMENT_DATA.map(s => (
              <button 
                key={s.name} 
                onClick={() => setSelected(s.name)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
                  selected === s.name 
                    ? 'bg-indigo-50 border-indigo-150 text-slate-850 shadow-sm' 
                    : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-xs font-bold">{s.name}</span>
                </div>
                <span className="text-xs font-black text-slate-800">{s.value.toLocaleString('en-IN')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Segment Strategies & Sample table */}
        <div className="xl:col-span-2 glass-card p-6 bg-white flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full animate-pulse" style={{ background: selectedSeg?.color }} />
                  <h3 className="text-base font-black text-slate-800">{selected} Club</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">{selectedSeg?.desc}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-800 leading-none">{selectedSeg?.value.toLocaleString('en-IN')}</p>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase mt-1 tracking-wider">Active profiles</p>
              </div>
            </div>

            {/* Campaign card hook */}
            <div className="rounded-2xl p-4 border border-indigo-100 bg-indigo-50/30 mb-6">
              <p className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest mb-1">Recommended Engagement Play</p>
              <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                {selected === 'Champions' && 'Honor their status. They are your core advocates. Push exclusive Diamond perks and invite-only launches.'}
                {selected === 'Loyal' && 'Upsell premium subscriptions. Offer tier-climbing point multipliers and early shopping previews.'}
                {selected === 'Potential' && 'Nudge them into membership loops. Offer prepaid discount passes to capture recurring basket spend.'}
                {selected === 'At Risk' && 'Deliver high-value win-back vouchers via WhatsApp automations immediately before churn probabilities spike.'}
                {selected === 'Lost' && 'Deploy custom reactivation campaigns featuring deep percentage discounts. Reactivate their core interest.'}
              </p>
              <button 
                onClick={() => toast.success(`Launching campaign planner for ${selected} segment`)}
                className="mt-3.5 inline-flex items-center gap-1.5 text-[10px] font-black text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-650/10"
              >
                Trigger Campaign Blast →
              </button>
            </div>
          </div>

          {/* Mini Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Customer Member</th>
                  <th className="pb-3">Loyalty Level</th>
                  <th className="pb-3 text-right">Lifetime Spent</th>
                  <th className="pb-3 text-right">Total Bills</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-650 font-medium">
                {selectedCustomers.slice(0, 4).map(c => (
                  <tr key={c.customer_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-black">
                          {c.name.charAt(0)}
                        </div>
                        <span>{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${TIER_STYLE[c.loyalty_tier]?.cls}`}>
                        {c.loyalty_tier}
                      </span>
                    </td>
                    <td className="py-3 text-right font-black text-emerald-700">₹{c.lifetime_value.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right font-bold text-slate-800">{c.total_orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tier distribution card grid */}
      <div className="glass-card p-6 bg-white">
        <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider mb-5">Loyalty Level Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TIER_PIE.map(t => (
            <div key={t.name} className="rounded-2xl p-4 border border-slate-150 bg-slate-50/45 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                <span className="text-xs font-bold text-slate-500">{t.name}</span>
              </div>
              <p className="text-2xl font-black text-slate-850">{t.value.toLocaleString('en-IN')}</p>
              <div className="mt-3.5 h-1.5 bg-slate-200/60 rounded-full overflow-hidden border border-slate-200/30">
                <div className="h-full rounded-full" style={{ width: `${(t.value / TIER_PIE.reduce((s, x) => s + x.value, 0)) * 105}%`, background: t.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER LIST TAB — Completely light themed with high-contrast elements
// ─────────────────────────────────────────────────────────────────────────────
function CustomerListTab({ onAddCustomer }) {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    setLoading(true);
    api.get('/customers', { params: { page, limit, search, tier } })
      .then(r => { setCustomers(r.data.customers); setTotal(r.data.total); })
      .catch(() => { setCustomers(MOCK_CUSTOMERS); setTotal(MOCK_CUSTOMERS.length); })
      .finally(() => setLoading(false));
  }, [page, search, tier]);

  const handleSort = col => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const sorted = useMemo(() => {
    return [...customers].sort((a, b) => {
      const va = a[sortBy], vb = b[sortBy];
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }, [customers, sortBy, sortDir]);

  const totalPages = Math.ceil(total / limit);

  const SortBtn = ({ col }) => (
    <button onClick={() => handleSort(col)} className="ml-1 opacity-55 hover:opacity-100 transition-opacity cursor-pointer">
      <ArrowsUpDownIcon className="w-3 h-3 text-slate-400" />
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar Filters — Clean Light Card */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-150 rounded-3xl p-5 shadow-sm">
        <div className="flex-1 min-w-[220px] flex items-center gap-2.5 bg-slate-50 border border-slate-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 rounded-xl px-3.5 py-2.5 transition-all">
          <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input 
            className="bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none w-full font-semibold"
            placeholder="Search by name, phone number, email..."
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
          />
        </div>

        <select 
          value={tier} 
          onChange={e => { setTier(e.target.value); setPage(1); }}
          className="text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 cursor-pointer transition-all"
        >
          <option value="" className="bg-white">All Loyalty Levels</option>
          {['Silver', 'Gold', 'Platinum', 'Diamond'].map(t => <option key={t} value={t} className="bg-white">{t} Tier</option>)}
        </select>

        <select 
          value={status} 
          onChange={e => setStatus(e.target.value)}
          className="text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 cursor-pointer transition-all"
        >
          <option value="" className="bg-white">All Statuses</option>
          <option value="active" className="bg-white">Active</option>
          <option value="inactive" className="bg-white">Inactive</option>
          <option value="churned" className="bg-white">Churned</option>
        </select>

        <button 
          onClick={onAddCustomer}
          className="btn-primary flex items-center gap-1.5 px-5 py-2.5 text-xs cursor-pointer ml-auto"
        >
          <PlusIcon className="w-4.5 h-4.5" /> Add Customer Member
        </button>
      </div>

      {/* CRM Table — Glass Card */}
      <div className="glass-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer profile</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Loyalty Level</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Lifetime Spend</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Points Bal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total Bills</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Market City</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Churn Probability</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
              {loading
                ? [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(9)].map((_, j) => (
                        <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                : sorted.map(c => {
                    const churn = c.churn_probability || 0;
                    const churnColor = churn > 0.7 ? 'from-rose-600 to-rose-400' : churn > 0.4 ? 'from-amber-550 to-amber-400' : 'from-emerald-600 to-emerald-400';
                    const churnTextColor = churn > 0.7 ? 'text-rose-600 font-bold' : churn > 0.4 ? 'text-amber-600 font-bold' : 'text-emerald-700 font-bold';
                    return (
                      <tr 
                        key={c.customer_id}
                        onClick={() => navigate(`/customers/${c.customer_id}`)}
                        className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4 font-bold text-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-xs font-black text-white">
                              {c.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-850 group-hover:text-indigo-650 transition-colors">{c.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-650 font-semibold">{c.mobile}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${TIER_STYLE[c.loyalty_tier]?.cls}`}>
                            {c.loyalty_tier}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-xs font-black text-emerald-700">
                          ₹{c.lifetime_value?.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-right text-xs font-mono font-black text-indigo-650">
                          {c.current_points_balance?.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-right text-xs font-black text-slate-850">{c.total_orders}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-semibold">{c.city}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden min-w-[50px]">
                              <div className={`h-full rounded-full bg-gradient-to-r ${churnColor}`} style={{ width: `${churn * 100}%` }} />
                            </div>
                            <span className={`text-[10px] w-8 text-right ${churnTextColor}`}>
                              {(churn * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wide ${STATUS_STYLE[c.status]}`}>{c.status}</span>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>

        {/* Pagination Bar — Light styled */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of <span className="text-slate-800 font-black">{total}</span> members
          </p>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-850 disabled:opacity-30 transition-all cursor-pointer"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => (
              <button 
                key={i} 
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                  page === i + 1 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-650/10' 
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-850'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages}
              className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-850 disabled:opacity-30 transition-all cursor-pointer"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY LOG TAB — Light styled timeline
// ─────────────────────────────────────────────────────────────────────────────
function ActivityTab() {
  const [filter, setFilter] = useState('all');
  const filters = ['all', 'purchase', 'redeem', 'upgrade', 'signup', 'coupon'];
  const filtered = filter === 'all' ? ACTIVITY_LOG : ACTIVITY_LOG.filter(a => a.type === filter);

  return (
    <div className="space-y-6">
      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
              filter === f 
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-650/10' 
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {f === 'all' ? 'All Activity Feed' : f}
          </button>
        ))}
      </div>

      {/* Live logger */}
      <div className="glass-card overflow-hidden bg-white">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/50 to-transparent">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse" />
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Live Activity Logs</h3>
          </div>
          <button 
            onClick={() => toast.success('Syncing logs...')}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-850 transition-colors cursor-pointer"
          >
            <ArrowPathIcon className="w-4 h-4" /> Sync Logger
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-slate-600">
          {filtered.map(act => {
            const st = ACT_STYLE[act.type] || ACT_STYLE.purchase;
            return (
              <div key={act.id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 border ${st.bg}`}>
                  {st.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-850">{act.name}</span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${TIER_STYLE[act.tier]?.cls}`}>
                      {act.tier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">
                    {act.action}
                    {act.amount && <span className="font-extrabold text-slate-700"> · {act.amount}</span>}
                    {act.store && <span className="text-slate-400 font-medium"> · {act.store}</span>}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 flex-shrink-0 mt-1">{act.time}</span>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">No activity logs found for this filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CONTAINER PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);

  const TABS = [
    { id: 'overview',     label: 'Overview Metrics' },
    { id: 'segmentation', label: 'Loyalty Segments' },
    { id: 'list',         label: 'Customer Database' },
    { id: 'activity',     label: 'Activity Feed' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-slide-up">
      
      {/* Top Header — Clean Light Border */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5 text-indigo-600">
            <UserGroupIcon className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">CRM intelligence center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Database</h1>
          <p className="text-xs text-slate-450 font-medium">Deep customer behavior insights, RFM loyalty segments, and real-time activities.</p>
        </div>
      </div>

      {/* Tabs list pill styles — Modern light pills */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider border transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10'
                : 'bg-slate-100/80 border-slate-200/60 text-slate-500 hover:bg-slate-200/50 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Tab Contents */}
      <div className="mt-4">
        {activeTab === 'overview'     && <OverviewTab />}
        {activeTab === 'segmentation' && <SegmentationTab />}
        {activeTab === 'list'         && <CustomerListTab onAddCustomer={() => setShowModal(true)} />}
        {activeTab === 'activity'     && <ActivityTab />}
      </div>

      {/* Add Customer modal */}
      {showModal && (
        <CustomerModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); toast.success('Customer profile saved! 🎉'); }}
        />
      )}

    </div>
  );
}
