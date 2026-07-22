import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon, PlusIcon, FunnelIcon, ChevronDownIcon,
  ArrowUpIcon, ArrowDownIcon, ArrowsUpDownIcon, QuestionMarkCircleIcon,
  UserGroupIcon, SparklesIcon, ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie, Legend,
} from 'recharts';
import CustomerModal from '../../components/customers/CustomerModal';

// ─── Mock data ────────────────────────────────────────────────────────────────
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
  { name: 'Platinum', value: 82, color: '#c9b96e' },
  { name: 'Diamond', value: 16, color: '#06b6d4' },
];

const SEGMENT_DATA = [
  { name: 'Champions', value: 2840, color: '#c9b96e', desc: 'High frequency, high spend' },
  { name: 'Loyal', value: 5120, color: '#c9b96e', desc: 'Regular visitors' },
  { name: 'Potential', value: 8400, color: '#f59e0b', desc: 'Growing engagement' },
  { name: 'At Risk', value: 3200, color: '#f97316', desc: 'Declining activity' },
  { name: 'Lost', value: 1840, color: '#ef4444', desc: 'No recent purchase' },
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
  { id: 'a5', name: 'Vikram Mehta', action: 'Coupon GOLD15 redeemed', amount: '15% off', store: 'Pune Camp', time: '1 hr ago', type: 'coupon', tier: 'Gold' },
  { id: 'a6', name: 'Neha Joshi', action: 'WhatsApp message delivered', amount: '', store: '', time: '1 hr ago', type: 'whatsapp', tier: 'Silver' },
  { id: 'a7', name: 'Arjun Kumar', action: 'Made a purchase', amount: '₹2,100', store: 'Bangalore Indiranagar', time: '2 hrs ago', type: 'purchase', tier: 'Silver' },
  { id: 'a8', name: 'Deepa Nair', action: 'Birthday offer claimed', amount: '₹200 off', store: 'Online', time: '3 hrs ago', type: 'coupon', tier: 'Platinum' },
];

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-1.5 mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-800">{Number(p.value).toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  );
};

const TIER_STYLE = {
  Silver:   { cls: 'badge-silver',   dot: '#94a3b8' },
  Gold:     { cls: 'badge-gold',     dot: '#f59e0b' },
  Platinum: { cls: 'badge-platinum', dot: '#c9b96e' },
  Diamond:  { cls: 'badge-diamond',  dot: '#06b6d4' },
};

const STATUS_STYLE = {
  active:   'bg-cyan-50 text-amber-700 border border-cyan-200',
  inactive: 'bg-amber-50 text-amber-700 border border-amber-200',
  churned:  'bg-red-50 text-red-600 border border-red-200',
};

const ACT_STYLE = {
  purchase: { bg: 'bg-cyan-200',   icon: '🛍️', color: 'text-amber-800' },
  redeem:   { bg: 'bg-cyan-100', icon: '⭐', color: 'text-amber-700' },
  upgrade:  { bg: 'bg-amber-100',  icon: '⬆️', color: 'text-amber-700' },
  signup:   { bg: 'bg-blue-100',   icon: '👋', color: 'text-blue-700' },
  coupon:   { bg: 'bg-pink-100',   icon: '🎟️', color: 'text-pink-700' },
  whatsapp: { bg: 'bg-cyan-100',  icon: '💬', color: 'text-amber-700' },
};

// ─── "Surfing" empty-state illustration ──────────────────────────────────────
function SurfingIllustration() {
  return (
    <div className="flex flex-col items-center py-8 gap-3">
      <svg viewBox="0 0 200 160" className="w-36 h-28" fill="none">
        {/* Pink bars */}
        {[28, 44, 60, 80, 100].map((h, i) => (
          <rect key={i} x={30 + i * 20} y={110 - h} width="14" height={h} rx="4"
            fill={i < 3 ? '#fca5a5' : '#f87171'} opacity={0.7 + i * 0.06} />
        ))}
        {/* Person body */}
        <ellipse cx="130" cy="128" rx="22" ry="24" fill="#e0e7ff" />
        <circle cx="130" cy="90" r="14" fill="#1e3a5f" />
        {/* Hair */}
        <path d="M118 88 Q122 78 130 80 Q138 78 142 88" fill="#1e1e2e" />
        {/* Arms */}
        <path d="M108 110 Q115 105 122 110" stroke="#1e3a5f" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M152 105 Q145 108 138 110" stroke="#1e3a5f" strokeWidth="3" strokeLinecap="round" fill="none"/>
        {/* Hand at forehead */}
        <path d="M108 110 Q104 102 112 100" stroke="#1e3a5f" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      </svg>
      <p className="text-sm font-bold text-slate-700">We are surfing through your data.</p>
      <p className="text-xs text-slate-400">You will see the graphs once you start capturing</p>
    </div>
  );
}

// ─── Date range selector ──────────────────────────────────────────────────────
function DateRangeSelect({ value, onChange, options, startDate, endDate, onStartDateChange, onEndDateChange }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="appearance-none text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-300 cursor-pointer"
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {value === 'custom' && (
        <div className="flex items-center gap-1.5 animate-slide-up">
          <input
            type="date"
            value={startDate}
            onChange={e => onStartDateChange(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-300"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={e => onEndDateChange(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-300"
          />
        </div>
      )}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ customers = [], total = 0, loading = false }) {
  const [snapshotRange, setSnapshotRange] = useState('month');
  const [newRepeatRange, setNewRepeatRange] = useState('month');

  const [snapStartDate, setSnapStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [snapEndDate, setSnapEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [newRepeatStartDate, setNewRepeatStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [newRepeatEndDate, setNewRepeatEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const hasData = total > 0;

  const formatDateRangeLabel = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const options = { day: '2-digit', month: 'short', year: '2-digit' };
    return `${start.toLocaleDateString('en-IN', options)} – ${end.toLocaleDateString('en-IN', options)}`;
  };

  // Filter customers by selected range dynamically
  const filterByRange = (list, range, customStart, customEnd) => {
    const now = Date.now();
    let days = 30;
    if (range === 'week') days = 7;
    else if (range === 'month') days = 30;
    else if (range === 'year') days = 365;
    else if (range === 'custom') {
      const startMs = customStart ? new Date(customStart).getTime() : 0;
      const endMs = customEnd ? new Date(customEnd + 'T23:59:59').getTime() : Date.now();
      return list.filter(c => {
        if (!c.created_at) return false;
        const t = new Date(c.created_at).getTime();
        return t >= startMs && t <= endMs;
      });
    }
    
    const cutoff = now - (days * 24 * 60 * 60 * 1000);
    return list.filter(c => c.created_at && new Date(c.created_at).getTime() >= cutoff);
  };

  const filteredSnapshotCustomers = filterByRange(customers, snapshotRange, snapStartDate, snapEndDate);
  const filteredNewRepeatCustomers = filterByRange(customers, newRepeatRange, newRepeatStartDate, newRepeatEndDate);

  const totalCustomers = total;
  const newCustomers = filteredSnapshotCustomers.length;
  const repeatCustomers = filteredSnapshotCustomers.filter(c => (c.total_orders || 0) > 1).length;

  const getDynamicChartData = (filteredList) => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const chartData = months.map(m => ({ month: m, new: 0, repeat: 0 }));
    filteredList.forEach(c => {
      if (!c.created_at) return;
      const date = new Date(c.created_at);
      const mLabel = date.toLocaleDateString('en-US', { month: 'short' });
      const idx = months.indexOf(mLabel);
      if (idx !== -1) {
        if ((c.total_orders || 0) > 1) {
          chartData[idx].repeat += 1;
        } else {
          chartData[idx].new += 1;
        }
      }
    });
    return chartData;
  };
  const overviewChartData = getDynamicChartData(filteredNewRepeatCustomers);

  const getDynamicWeekdayData = (filteredList) => {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = weekdays.map(day => ({ day, customers: 0 }));
    filteredList.forEach(c => {
      if (c.created_at) {
        let dayIdx = new Date(c.created_at).getDay();
        dayIdx = dayIdx === 0 ? 6 : dayIdx - 1;
        counts[dayIdx].customers += 1;
      }
    });
    return counts;
  };
  const weekdayData = getDynamicWeekdayData(filteredSnapshotCustomers);

  const getDynamicTierPie = (filteredList) => {
    const tiers = {
      'Silver': { value: 0, color: '#94a3b8' },
      'Gold': { value: 0, color: '#f59e0b' },
      'Platinum': { value: 0, color: '#c9b96e' },
      'Diamond': { value: 0, color: '#06b6d4' },
    };
    filteredList.forEach(c => {
      const t = c.loyalty_tier || 'Silver';
      if (tiers[t]) {
        tiers[t].value += 1;
      } else {
        tiers['Silver'].value += 1;
      }
    });
    return Object.keys(tiers).map(name => ({
      name,
      value: tiers[name].value,
      color: tiers[name].color
    }));
  };
  const tierPie = getDynamicTierPie(filteredSnapshotCustomers);

  const getDynamicCityData = (filteredList) => {
    const citiesMap = {};
    filteredList.forEach(c => {
      const city = c.city || 'Unknown';
      citiesMap[city] = (citiesMap[city] || 0) + 1;
    });
    const sorted = Object.keys(citiesMap).map(city => ({
      city,
      customers: citiesMap[city],
    })).sort((a, b) => b.customers - a.customers);
    const totalFiltered = filteredList.length;
    return sorted.map(item => ({
      ...item,
      pct: totalFiltered > 0 ? Math.round(item.customers / totalFiltered * 100) : 0
    })).slice(0, 5);
  };
  const cityData = getDynamicCityData(filteredSnapshotCustomers);

  return (
    <div className="space-y-6">

      {/* ── Customer Snapshot ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">Customer Snapshot</h2>
          <DateRangeSelect
            value={snapshotRange}
            onChange={setSnapshotRange}
            startDate={snapStartDate}
            endDate={snapEndDate}
            onStartDateChange={setSnapStartDate}
            onEndDateChange={setSnapEndDate}
            options={[
              { value: 'week', label: `Week  ${formatDateRangeLabel(7)}` },
              { value: 'month', label: `Month  ${formatDateRangeLabel(30)}` },
              { value: 'year', label: `Year  ${formatDateRangeLabel(365)}` },
              { value: 'custom', label: 'Custom Range' },
            ]}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Customers', value: totalCustomers.toLocaleString('en-IN'), sub: 'All time registered', icon: '👥', accent: '#f59e0b', bg: 'bg-amber-50' },
            { label: 'New customers in selected period', value: newCustomers.toLocaleString('en-IN'), sub: totalCustomers > 0 ? `+${Math.round(newCustomers/totalCustomers*100)}% of total` : '0% of total', icon: '✨', accent: '#a89442', bg: 'bg-cyan-50' },
            { label: 'Repeat customers in selected period', value: repeatCustomers.toLocaleString('en-IN'), sub: totalCustomers > 0 ? `${Math.round(repeatCustomers/totalCustomers*100)}% repeat rate` : '0% repeat rate', icon: '🔁', accent: '#c9b96e', bg: 'bg-cyan-50' },
          ].map(card => (
            <div key={card.label} className={`${card.bg} rounded-2xl p-5 border border-white/80 relative overflow-hidden group hover:shadow-md transition-all duration-200`}>
              <div className="flex items-start justify-between mb-4">
                <div className="text-2xl">{card.icon}</div>
                <button className="w-5 h-5 rounded-full border border-slate-300/60 flex items-center justify-center opacity-60 hover:opacity-100">
                  <span className="text-[9px] text-slate-500 font-bold">i</span>
                </button>
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1">{card.value}</p>
              <p className="text-xs text-slate-600 font-medium leading-tight">{card.label}</p>
              <p className="text-xs mt-1.5 font-semibold" style={{ color: card.accent }}>{card.sub}</p>
              {/* Subtle accent glow */}
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-20 blur-xl" style={{ background: card.accent }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── New vs Repeat ── */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">New vs Repeat</h2>
            <button className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center">
              <span className="text-[9px] text-slate-400 font-bold">i</span>
            </button>
          </div>
          <DateRangeSelect 
            value={newRepeatRange} 
            onChange={setNewRepeatRange}
            startDate={newRepeatStartDate}
            endDate={newRepeatEndDate}
            onStartDateChange={setNewRepeatStartDate}
            onEndDateChange={setNewRepeatEndDate}
            options={[
              { value: 'week', label: `Week  ${formatDateRangeLabel(7)}` },
              { value: 'month', label: `Month  ${formatDateRangeLabel(30)}` },
              { value: 'year', label: `Year  ${formatDateRangeLabel(365)}` },
              { value: 'custom', label: 'Custom Range' },
            ]}
          />
        </div>

        {hasData ? (
          <div className="px-5 py-4">
            <div className="flex items-center gap-4 mb-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <span className="w-3 h-3 rounded-sm bg-cyan-500 inline-block" />New Customers
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <span className="w-3 h-3 rounded-sm bg-cyan-500 inline-block" />Repeat Customers
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={overviewChartData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="gNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c9b96e" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#c9b96e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRepeat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c9b96e" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#c9b96e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="repeat" name="Repeat" stroke="#c9b96e" strokeWidth={2.5} fill="url(#gRepeat)" dot={false} />
                <Area type="monotone" dataKey="new" name="New" stroke="#c9b96e" strokeWidth={2.5} fill="url(#gNew)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <SurfingIllustration />
        )}
      </section>

      {/* ── "Know your customers" section ── */}
      <section>
        <h2 className="text-xl font-black text-slate-900 mb-4">Know your customers like never before!</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* Customers By Day */}
          <div className="rounded-2xl p-5 border border-slate-200" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' }}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-bold text-slate-700">Customers By Day</p>
            </div>
            <p className="text-3xl font-black text-amber-600 mb-1">
              {weekdayData.reduce((s, d) => s + d.customers, 0) > 0 
                ? `${Math.round((weekdayData[5].customers + weekdayData[6].customers) / weekdayData.reduce((s, d) => s + d.customers, 0) * 100)}%`
                : '0%'}
            </p>
            <p className="text-sm text-slate-600 mb-4">Customers visit more on <span className="font-bold text-amber-700">weekends</span></p>

            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={WEEKDAY_DATA} barCategoryGap="20%">
                <XAxis dataKey="day" tick={{ fill: '#c9b96e', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="customers" name="Customers" radius={[4, 4, 0, 0]}>
                  {WEEKDAY_DATA.map((d, i) => (
                    <Cell key={i} fill={i >= 5 ? '#c9b96e' : '#c4b5fd'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              Once you start adding customers, you'll see whether your customers prefer visiting on weekends, weekdays or both.
            </p>
          </div>

          {/* Average spend by repeat customers */}
          <div className="rounded-2xl p-5 border border-slate-200" style={{ background: 'linear-gradient(135deg, #f0fdf9 0%, #ccfbf1 100%)' }}>
            <p className="text-sm font-bold text-slate-700 mb-2">Average spend by repeat customers</p>
            <p className="text-3xl font-black text-amber-700 mb-1">+18%</p>
            <p className="text-sm text-slate-600 mb-4">More spend on every order by <span className="font-bold text-amber-800">repeat customers</span></p>

            {/* Comparison bar */}
            <div className="space-y-3">
              {[
                { label: 'New Customers', value: 2100, max: 4200, color: '#94a3b8' },
                { label: 'Repeat Customers', value: 3680, max: 4200, color: '#a89442' },
              ].map(bar => (
                <div key={bar.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-600">{bar.label}</span>
                    <span className="font-bold text-slate-900">₹{bar.value.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-2.5 bg-white/60 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(bar.value / bar.max) * 100}%`, background: bar.color }} />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 mt-4 leading-relaxed">
              Once you start adding customers, you'll see how much your repeat customers spend on average vs your new customers.
            </p>
          </div>
        </div>
      </section>

      {/* ── City distribution ── */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-base font-bold text-slate-900 mb-4">Top Cities</h2>
        <div className="space-y-3">
          {cityData.map((c, i) => (
            <div key={c.city} className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-lg bg-slate-100 text-slate-600 text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
              <span className="text-sm font-semibold text-slate-700 w-24">{c.city}</span>
              <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${c.pct}%`, background: ['#c9b96e', '#c9b96e', '#f59e0b', '#f97316', '#ec4899'][i % 5] }} />
              </div>
              <span className="text-xs font-bold text-slate-700 w-14 text-right">{c.customers.toLocaleString('en-IN')}</span>
              <span className="text-xs text-slate-400 w-8 text-right">{c.pct}%</span>
            </div>
          ))}
          {cityData.length === 0 && (
            <p className="text-center text-xs text-slate-400 py-4">No city distribution data yet</p>
          )}
        </div>
      </section>

      {/* ── Feedback banner ── */}
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex items-center gap-5">
        <div className="w-14 h-14 flex-shrink-0">
          <svg viewBox="0 0 80 80" className="w-14 h-14" fill="none">
            <circle cx="40" cy="40" r="38" fill="#e0f2fe" />
            <circle cx="40" cy="28" r="10" fill="#0284c7" opacity="0.8" />
            <path d="M20 60 Q40 46 60 60" fill="#0284c7" opacity="0.6" />
            <circle cx="25" cy="50" r="5" fill="#c9b96e" opacity="0.7" />
            <circle cx="55" cy="48" r="5" fill="#f59e0b" opacity="0.7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700">We want to make Cuben Retailer better for you. What data about your customers would you like to see?</p>
          <button className="text-sm font-bold text-amber-700 hover:underline mt-1">Give feedback</button>
        </div>
      </div>
    </div>
  );
}

// ─── Segmentation Tab ─────────────────────────────────────────────────────────
function SegmentationTab({ customers = [], total = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState('Champions');

  const getDynamicSegmentData = () => {
    const segments = {
      'Champions': { value: 0, color: '#c9b96e', desc: 'High frequency, high spend' },
      'Loyal': { value: 0, color: '#c9b96e', desc: 'Regular visitors' },
      'Potential': { value: 0, color: '#f59e0b', desc: 'Growing engagement' },
      'At Risk': { value: 0, color: '#f97316', desc: 'Declining activity' },
      'Lost': { value: 0, color: '#ef4444', desc: 'No recent purchase' },
    };
    
    customers.forEach(c => {
      let seg = c.segment || 'Potential';
      if (seg === 'champions') seg = 'Champions';
      else if (seg === 'loyal') seg = 'Loyal';
      else if (seg === 'potential') seg = 'Potential';
      else if (seg === 'at-risk' || seg === 'At Risk') seg = 'At Risk';
      else if (seg === 'lost') seg = 'Lost';
      
      if (segments[seg]) {
        segments[seg].value += 1;
      } else {
        segments['Potential'].value += 1;
      }
    });
    
    return Object.keys(segments).map(name => ({
      name,
      value: segments[name].value,
      color: segments[name].color,
      desc: segments[name].desc
    }));
  };

  const segmentData = getDynamicSegmentData();
  const selectedSeg = segmentData.find(s => s.name === selected);
  
  const selectedCustomers = customers.filter(c => {
    let seg = c.segment || 'Potential';
    if (seg === 'champions') seg = 'Champions';
    else if (seg === 'loyal') seg = 'Loyal';
    else if (seg === 'potential') seg = 'Potential';
    else if (seg === 'at-risk' || seg === 'At Risk') seg = 'At Risk';
    else if (seg === 'lost') seg = 'Lost';
    return seg === selected;
  });

  const getDynamicTierPie = () => {
    const tiers = {
      'Silver': { value: 0, color: '#94a3b8' },
      'Gold': { value: 0, color: '#f59e0b' },
      'Platinum': { value: 0, color: '#c9b96e' },
      'Diamond': { value: 0, color: '#06b6d4' },
    };
    customers.forEach(c => {
      const t = c.loyalty_tier || 'Silver';
      if (tiers[t]) {
        tiers[t].value += 1;
      } else {
        tiers['Silver'].value += 1;
      }
    });
    return Object.keys(tiers).map(name => ({
      name,
      value: tiers[name].value,
      color: tiers[name].color
    }));
  };
  const tierPie = getDynamicTierPie();

  return (
    <div className="space-y-5">
      {/* RFM segment overview */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Pie chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">RFM Segment Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={segmentData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value"
                onClick={d => setSelected(d.name)}>
                {segmentData.map((s, i) => (
                  <Cell key={i} fill={s.color} opacity={selected === s.name ? 1 : 0.5} stroke={selected === s.name ? s.color : 'none'} strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => v.toLocaleString('en-IN')} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {segmentData.map(s => (
              <button key={s.name} onClick={() => setSelected(s.name)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors ${selected === s.name ? 'bg-slate-100' : 'hover:bg-slate-50'}`}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className={`text-xs font-semibold ${selected === s.name ? 'text-slate-900' : 'text-slate-500'}`}>{s.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-700">{s.value.toLocaleString('en-IN')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Segment detail */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: selectedSeg?.color }} />
                <h3 className="text-base font-bold text-slate-900">{selected} Customers</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{selectedSeg?.desc}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-slate-900">{selectedSeg?.value.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-400">customers</p>
            </div>
          </div>

          {/* Segment strategy */}
          <div className="rounded-xl p-3.5 mb-4 border" style={{ background: selectedSeg?.color + '10', borderColor: selectedSeg?.color + '30' }}>
            <p className="text-xs font-bold text-slate-700 mb-1">Recommended Action</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {selected === 'Champions' && 'Reward them. They are your biggest advocates. Offer exclusive VIP benefits and early access.'}
              {selected === 'Loyal' && 'Upsell higher-value products. Offer them loyalty tier upgrades and double-point events.'}
              {selected === 'Potential' && 'Offer them a membership or loyalty program. They can become loyal customers with the right nudge.'}
              {selected === 'At Risk' && 'Send win-back campaigns with special discounts. Act fast before they churn completely.'}
              {selected === 'Lost' && 'Send aggressive win-back campaigns with your best offer. Make it feel personal and exclusive.'}
            </p>
            <button 
              onClick={() => navigate('/campaigns', { state: { segment: selected, openBuilder: true, from: location.state?.from } })}
              className="mt-2 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-colors hover:opacity-90"
              style={{ background: selectedSeg?.color }}
            >
              Create Campaign for {selected} →
            </button>
          </div>

          {/* Mini table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-slate-400 font-semibold pb-2 uppercase tracking-wide">Customer</th>
                  <th className="text-left text-slate-400 font-semibold pb-2 uppercase tracking-wide">Tier</th>
                  <th className="text-right text-slate-400 font-semibold pb-2 uppercase tracking-wide">LTV</th>
                  <th className="text-right text-slate-400 font-semibold pb-2 uppercase tracking-wide">Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {selectedCustomers.slice(0, 4).map(c => (
                  <tr key={c.customer_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-yellow-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <span className={TIER_STYLE[c.loyalty_tier]?.cls || 'badge-silver'}>{c.loyalty_tier}</span>
                    </td>
                    <td className="py-2.5 text-right font-bold text-amber-600">₹{c.lifetime_value.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 text-right font-semibold text-slate-700">{c.total_orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {selectedCustomers.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-6">No customers in this segment yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Tier distribution */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Loyalty Tier Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tierPie.map(t => (
            <div key={t.name} className="rounded-2xl p-4 border" style={{ background: t.color + '10', borderColor: t.color + '30' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                <span className="text-xs font-bold text-slate-700">{t.name}</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{t.value.toLocaleString('en-IN')}</p>
              <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${tierPie.reduce((s, x) => s + x.value, 0) > 0 ? (t.value / tierPie.reduce((s, x) => s + x.value, 0)) * 100 : 0}%`, background: t.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Customer List Tab ────────────────────────────────────────────────────────
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
  const limit = 12;

  useEffect(() => {
    setLoading(true);
    api.get('/customers', { params: { page, limit, search, tier } })
      .then(r => { setCustomers(r.data.customers || []); setTotal(r.data.total || 0); })
      .catch(() => { setCustomers([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [page, search, tier]);

  const handleSort = col => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const sorted = [...customers].sort((a, b) => {
    const va = a[sortBy], vb = b[sortBy];
    return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  });

  const totalPages = Math.ceil(total / limit);

  const SortBtn = ({ col }) => (
    <button onClick={() => handleSort(col)} className="ml-1 opacity-40 hover:opacity-100 transition-opacity">
      <ArrowsUpDownIcon className="w-3 h-3" />
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5">
          <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
            placeholder="Search by name, mobile, email…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select value={tier} onChange={e => { setTier(e.target.value); setPage(1); }}
          className="text-sm border border-slate-200 bg-white rounded-xl px-3.5 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-300">
          <option value="">All Tiers</option>
          {['Silver', 'Gold', 'Platinum', 'Diamond'].map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="text-sm border border-slate-200 bg-white rounded-xl px-3.5 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-300">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="churned">Churned</option>
        </select>
        <button onClick={onAddCustomer}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-bold rounded-xl transition-colors ml-auto">
          <PlusIcon className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {[
                  { label: 'Customer', col: 'name' },
                  { label: 'Mobile', col: 'mobile' },
                  { label: 'Tier', col: 'loyalty_tier' },
                  { label: 'LTV', col: 'lifetime_value', right: true },
                  { label: 'Points', col: 'current_points_balance', right: true },
                  { label: 'Orders', col: 'total_orders', right: true },
                  { label: 'City', col: 'city' },
                  { label: 'Churn Risk', col: 'churn_probability' },
                  { label: 'Status', col: 'status' },
                ].map(h => (
                  <th key={h.col} className={`px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${h.right ? 'text-right' : 'text-left'}`}>
                    {h.label}<SortBtn col={h.col} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading
                ? [...Array(8)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(9)].map((_, j) => (
                        <td key={j} className="px-4 py-3.5"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                : sorted.map(c => {
                    const churn = c.churn_probability || 0;
                    const churnColor = churn > 0.7 ? '#ef4444' : churn > 0.4 ? '#f59e0b' : '#06b6d4';
                    return (
                      <tr key={c.customer_id}
                        onClick={() => navigate(`/customers/${c.customer_id}`)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors group">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-yellow-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ring-2 ring-white">
                              {c.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 group-hover:text-amber-800 transition-colors">{c.name}</p>
                              <p className="text-xs text-slate-400">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs font-mono text-slate-600">{c.mobile}</td>
                        <td className="px-4 py-3.5">
                          <span className={TIER_STYLE[c.loyalty_tier]?.cls || 'badge-silver'}>{c.loyalty_tier}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right text-sm font-bold text-amber-600">
                          ₹{c.lifetime_value?.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs font-mono font-semibold text-amber-600">
                          {c.current_points_balance?.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3.5 text-right text-sm font-semibold text-slate-700">{c.total_orders}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">{c.city}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[48px]">
                              <div className="h-full rounded-full" style={{ width: `${churn * 100}%`, background: churnColor }} />
                            </div>
                            <span className="text-xs font-bold w-10 text-right" style={{ color: churnColor }}>
                              {(churn * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[c.status]}`}>{c.status}</span>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-500">
            Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of <span className="font-bold text-slate-700">{total}</span> customers
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white disabled:opacity-30 transition-colors">
              <ChevronLeftIcon className="w-3.5 h-3.5" />
            </button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${page === i + 1 ? 'bg-cyan-500 text-white' : 'border border-slate-200 text-slate-600 hover:bg-white'}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white disabled:opacity-30 transition-colors">
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Activity Tab ─────────────────────────────────────────────────────────────
function ActivityTab({ customers = [] }) {
  const [filter, setFilter] = useState('all');
  const filters = ['all', 'signup'];

  const getDynamicActivityLog = () => {
    const logs = [];
    customers.forEach(c => {
      if (c.created_at) {
        logs.push({
          id: `signup-${c.customer_id}`,
          name: c.name || 'Customer',
          action: 'Joined the loyalty program',
          amount: '',
          store: c.store_name || '',
          time: new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          type: 'signup',
          tier: c.loyalty_tier || 'Silver'
        });
      }
    });
    return logs;
  };

  const activityLog = getDynamicActivityLog();
  const filtered = filter === 'all' ? activityLog : activityLog.filter(a => a.type === filter);

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${filter === f ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}>
            {f === 'all' ? 'All Activity' : f}
          </button>
        ))}
      </div>

      {/* Live feed */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900">Live Activity Feed</h3>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowPathIcon className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <div className="divide-y divide-slate-50">
          {filtered.map(act => {
            const st = ACT_STYLE[act.type] || ACT_STYLE.purchase;
            return (
              <div key={act.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-base flex-shrink-0 ${st.bg}`}>
                  {st.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">{act.name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TIER_STYLE[act.tier]?.cls || 'badge-silver'}`}>{act.tier}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {act.action}
                    {act.amount && <span className="font-semibold text-slate-700"> · {act.amount}</span>}
                    {act.store && <span className="text-slate-400"> · {act.store}</span>}
                  </p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">{act.time}</span>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-slate-400">No activity found for this filter</p>
            </div>
          )}
        </div>
      </div>

      {/* Activity summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Purchases Today', value: '0', icon: '🛍️', color: 'text-amber-700', bg: 'bg-cyan-50' },
          { label: 'Points Redeemed', value: '0', icon: '⭐', color: 'text-amber-600', bg: 'bg-cyan-50' },
          { label: 'Tier Upgrades', value: String(customers.filter(c => c.loyalty_tier && c.loyalty_tier !== 'Silver').length), icon: '⬆️', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'New Signups', value: String(customers.length), icon: '👋', color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white/80`}>
            <span className="text-2xl">{s.icon}</span>
            <p className={`text-2xl font-black ${s.color} mt-2`}>{s.value}</p>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/customers', { params: { limit: 1000 } })
      .then(r => {
        setCustomers(r.data.customers || []);
        setTotal(r.data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const TABS = [
    { id: 'overview',     label: 'Overview' },
    { id: 'segmentation', label: 'Segmentation' },
    { id: 'list',         label: 'Customer List' },
    { id: 'activity',     label: 'Activity' },
  ];

  return (
    <div className="space-y-0 pb-10 animate-slide-up">

      {/* ── Header ── */}
      <div className="mb-5">
        <h1 className="text-2xl font-black text-slate-900">Customer Insights</h1>
        <p className="text-sm text-slate-500 mt-1">
          All your customer behavior data, segmentation details, and activity, easily accessible in one place.
        </p>
      </div>

      {/* ── Tabs — pill style matching screenshot ── */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-white border-yellow-700 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-cyan-500 hover:text-amber-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {activeTab === 'overview'     && <OverviewTab customers={customers} total={total} loading={loading} />}
      {activeTab === 'segmentation' && <SegmentationTab customers={customers} total={total} />}
      {activeTab === 'list'         && <CustomerListTab onAddCustomer={() => setShowModal(true)} />}
      {activeTab === 'activity'     && <ActivityTab customers={customers} />}

      {/* ── Add customer modal ── */}
      {showModal && (
        <CustomerModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); toast.success('Customer added!'); }}
        />
      )}
    </div>
  );
}


