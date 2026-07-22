import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import { ArrowTopRightOnSquareIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// ─── Setup Steps ─────────────────────────────────────────────────────────────
const SETUP_STEPS = [
  { label: 'Integrate POS', desc: 'Integrating a POS will help you to capture and reach every customer.' },
  { label: 'Try sending a campaign', desc: 'Sending a campaign helps you to reach to your target customer easily!' },
  { label: 'Activate Feedback', desc: "See your customer's compliments and suggestion easily." },
  { label: 'Activate loyalty program', desc: 'Make them comeback with points & awesome rewards.' },
  { label: 'Import customers', desc: 'Import your all existing customer to Cuben Retailer for better experience.' },
  { label: 'Activate Auto-Campaign', desc: 'Set campaigns and forget about it, we will do the rest of thing for you.' },
];

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString('en-IN') : p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Business Highlights tab chart ───────────────────────────────────────────
const CHART_TABS = ['Total Sales', 'Total Orders', 'Total Customers', 'Rewards Redeemed'];

// ─── Visit Journey dots ───────────────────────────────────────────────────────
const VisitJourney = ({ rates }) => (
  <div className="flex items-center gap-0 mt-4">
    {rates.map((r, i) => (
      <React.Fragment key={i}>
        <div className="flex flex-col items-center">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${i === 0 ? 'border-pink-400 bg-pink-50 text-pink-600' : 'border-slate-300 bg-white text-slate-500'}`}>
            {r}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1 whitespace-nowrap">{i + 1}{i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} visit</p>
        </div>
        {i < rates.length - 1 && (
          <div className="flex-1 h-px bg-slate-200 mb-4 mx-0.5" />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── Program Performance Card ─────────────────────────────────────────────────
const ProgramCard = ({ icon, title, link, linkLabel = 'View More', stats, bg = 'bg-white' }) => (
  <div className={`${bg} border border-slate-200 rounded-2xl p-5`}>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-bold text-slate-800">{title}</span>
      </div>
      <Link to={link} className="text-xs font-semibold text-amber-700 hover:underline flex items-center gap-0.5">
        {linkLabel}
      </Link>
    </div>
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s, i) => (
        <div key={i} className="bg-white border border-slate-100 rounded-xl p-3">
          <p className="text-lg font-bold text-slate-900">{s.value}</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-tight">{s.label}</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function BrandOwnerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showSetup, setShowSetup] = useState(true);
  const [dateTab, setDateTab] = useState('yesterday');
  const [chartTab, setChartTab] = useState('Total Sales');
  const [chartRange, setChartRange] = useState('Last 12 Weeks');

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(r => setData(r.data))
      .catch(() => setData(getMockData()))
      .finally(() => setLoading(false));
  }, []);

  const toggleStep = (i) => {
    setCompletedSteps(prev =>
      prev.includes(i) ? prev.filter(s => s !== i) : [...prev, i]
    );
  };

  const d = data || getMockData();

  // Build chart data per tab
  const chartData = d.weekly_chart[chartTab] || [];

  return (
    <div className="space-y-6 pb-8">

      {/* ── Section 1: Setup banner (keep as-is per user request) ── */}
      {showSetup && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #d5f7f3 0%, #a8ede6 100%)' }}>
          <div className="flex flex-col xl:flex-row gap-0">
            {/* Left */}
            <div className="p-7 xl:w-80 flex-shrink-0">
              <p className="text-base font-semibold text-slate-600 mb-1">👋 Welcome {user?.full_name || 'there'}</p>
              <p className="text-2xl font-bold text-slate-900 leading-tight">
                Let's get you set up<br />for success!
              </p>
              {/* Illustration placeholder */}
              <div className="mt-4 flex items-center justify-center h-28 opacity-70">
                <svg viewBox="0 0 120 100" className="w-36 h-28" fill="none">
                  <ellipse cx="60" cy="90" rx="40" ry="6" fill="#a8ede6" opacity="0.5" />
                  <circle cx="60" cy="45" r="28" fill="#d5f7f3" opacity="0.40" />
                  <path d="M50 70 Q45 50 55 35 Q60 25 68 30 Q78 38 72 55 Q68 65 60 70 Z" fill="#1aafa4" opacity="0.6" />
                  <circle cx="62" cy="28" r="7" fill="#1aafa4" opacity="0.8" />
                  <path d="M55 55 Q40 48 42 38" stroke="#1aafa4" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
                  <path d="M68 52 Q82 44 80 35" stroke="#1aafa4" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
                  <path d="M46 38 Q36 28 44 20" stroke="#6dddd4" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                  <path d="M74 35 Q84 25 78 16" stroke="#6dddd4" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                </svg>
              </div>
              <div className="mt-3">
                <p className="text-sm font-semibold text-slate-500 mb-2">{completedSteps.length}/{SETUP_STEPS.length} Completed</p>
                <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${(completedSteps.length / SETUP_STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="flex-1 p-5 space-y-1.5">
              {SETUP_STEPS.map((step, i) => {
                const done = completedSteps.includes(i);
                const isCurrent = !done && completedSteps.length === i;
                return (
                  <div
                    key={i}
                    onClick={() => toggleStep(i)}
                    className={`flex items-start gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all
                      ${done ? 'opacity-50' : isCurrent ? 'bg-white shadow-sm border border-slate-200' : 'hover:bg-white/60'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
                      ${done ? 'bg-cyan-500 border-yellow-600' : 'border-slate-400 bg-white'}`}>
                      {done && <span className="text-white text-[10px] font-black">✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${done ? 'line-through text-slate-400' : 'text-slate-800'}`}>{step.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                    {isCurrent && (
                      <button
                        onClick={e => { e.stopPropagation(); toggleStep(i); }}
                        className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-700 px-4 py-2 rounded-xl transition-colors"
                      >
                        Start <span>→</span>
                      </button>
                    )}
                  </div>
                );
              })}
              <button onClick={() => setShowSetup(false)} className="ml-4 mt-1 text-xs text-slate-400 hover:text-slate-600 underline">
                Dismiss setup guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Section 2: "your business at a glance" header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">your business at a glance ✨</h2>
        <button className="flex items-center gap-2 text-sm font-semibold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors shadow-sm">
          <svg className="w-4 h-4 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Get email report
        </button>
      </div>

      {/* Yesterday / Today tabs + Highlights cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-bold text-slate-800">Yesterday's Highlights</p>
          <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl">
            {['yesterday', 'today'].map(t => (
              <button
                key={t}
                onClick={() => setDateTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${dateTab === t ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* 4 stat tiles */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Sales', value: `₹${(d.metrics.total_revenue / 1e5).toFixed(0)}K`, icon: '🪙', bg: 'bg-orange-50', labelColor: 'text-orange-500' },
            { label: 'Orders', value: d.metrics.total_orders.toLocaleString('en-IN'), icon: '🛍️', bg: 'bg-pink-50', labelColor: 'text-pink-500' },
            { label: 'Customers', value: d.metrics.new_customers.toLocaleString('en-IN'), icon: '👤', bg: 'bg-blue-50', labelColor: 'text-blue-500' },
            { label: 'Rewards Redeemed', value: d.metrics.rewards_redeemed.toLocaleString('en-IN'), icon: '🎁', bg: 'bg-purple-50', labelColor: 'text-purple-500' },
          ].map(card => (
            <div key={card.label} className={`${card.bg} rounded-2xl p-4 flex items-center justify-between border border-transparent`}>
              <div>
                <p className={`text-sm font-bold ${card.labelColor}`}>{card.label}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{card.value}</p>
              </div>
              <span className="text-4xl opacity-80">{card.icon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Business Highlights chart ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-1 px-5 pt-5 pb-0 border-b border-slate-100">
          <span className="text-slate-500 mr-1">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </span>
          <span className="text-sm font-bold text-slate-800">Business Highlights</span>
        </div>

        {/* Metric tabs + range */}
        <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex gap-6">
            {CHART_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setChartTab(tab)}
                className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${chartTab === tab ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                <span className={`block text-xl font-black ${chartTab === tab ? 'text-slate-900' : 'text-slate-400'}`}>
                  {tab === 'Total Sales' ? `₹${(d.metrics.total_revenue / 1e5).toFixed(0)}K` : tab === 'Total Orders' ? d.metrics.total_orders : tab === 'Total Customers' ? d.metrics.new_customers : d.metrics.rewards_redeemed}
                </span>
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={chartRange}
              onChange={e => setChartRange(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
            >
              <option>Last 12 Weeks</option>
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
            <button className="w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors">
              <ArrowTopRightOnSquareIcon className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Chart area */}
        <div className="px-5 pb-5 h-52">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9b96e" stopOpacity={0.20} />
                    <stop offset="95%" stopColor="#d5f7f3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={50}
                  tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="value" name={chartTab} stroke="#c9b96e" strokeWidth={2.5}
                  fill="url(#chartGrad)" dot={false} activeDot={{ r: 5, fill: '#c9b96e' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-2">
              <div className="relative">
                {/* Bar skeletons */}
                <div className="flex items-end gap-2 opacity-20">
                  {[40, 60, 45, 80, 55, 70, 50, 90, 65, 75, 55, 85].map((h, i) => (
                    <div key={i} className="w-5 rounded-t" style={{ height: h, background: '#c7d2fe' }} />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white rounded-2xl px-5 py-3 shadow-md border border-slate-100 text-center">
                    <div className="w-9 h-9 bg-cyan-200 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-700">No Data Available</p>
                    <p className="text-xs text-slate-400 mt-0.5">Start collecting data to see your<br />data visualised here</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 3: 3 insight cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1 – Mobile capture */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-3xl font-black text-slate-900">{d.insights.mobile_capture_pct}%</p>
              <p className="text-sm text-slate-600 mt-1 leading-snug">
                <span className="font-semibold">{d.insights.mobile_capture_count} valid mobile numbers captured</span>
                <br />in the last 30 days
              </p>
            </div>
            <button className="w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 flex-shrink-0">
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
          {d.insights.mobile_capture_pct < 80 && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-500 text-xs font-black">!</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Below Industry Average</p>
                <p className="text-xs text-red-700 font-medium">Industry average is over 80%</p>
              </div>
            </div>
          )}
        </div>

        {/* Card 2 – 5th visit retention */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-3xl font-black text-slate-900">{d.insights.fifth_visit_pct}%</p>
              <p className="text-sm text-slate-600 mt-1 leading-snug">
                customers make it till the 5th visit<br />in last 6 months
              </p>
            </div>
            <button className="w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 flex-shrink-0">
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
          <VisitJourney rates={d.insights.visit_rates} />
        </div>

        {/* Card 3 – AOV */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-3xl font-black text-slate-900">₹{d.insights.aov.toLocaleString('en-IN')}</p>
              <p className="text-sm text-slate-600 mt-1 leading-snug">
                Average Order Value of last 12 months.
              </p>
            </div>
            <button className="w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 flex-shrink-0">
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
          {/* Mini AOV bar chart */}
          <div className="h-16 flex items-end gap-0.5 overflow-hidden rounded-xl">
            {d.insights.aov_trend.map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${(v / Math.max(...d.insights.aov_trend)) * 100}%`,
                  background: `linear-gradient(to top, #06b6d4, #c4b5fd)`,
                  minHeight: 4,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 4: Credits balance ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h3 className="text-base font-bold text-slate-800">Your Credits Balance</h3>
            <button className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
              <span className="text-[9px] text-slate-500 font-bold">i</span>
            </button>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-colors">
              <ArrowPathIcon className="w-3.5 h-3.5" />
              Auto Refill Credits
            </button>
            <button className="flex items-center gap-1.5 text-xs font-bold text-slate-900 px-3.5 py-2 rounded-xl transition-colors"
              style={{ background: 'linear-gradient(135deg, #e6dbae 0%, #c9b96e 100%)' }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Refill Credits
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'SMS', value: d.credits.sms, icon: '💬', iconColor: 'text-blue-500' },
            { label: 'Email', value: d.credits.email, icon: '✉️', iconColor: 'text-orange-500' },
            { label: 'Whatsapp Utility', value: d.credits.wa_utility, icon: '💚', iconColor: 'text-cyan-500' },
            { label: 'Whatsapp Marketing', value: d.credits.wa_marketing, icon: '💗', iconColor: 'text-pink-500' },
          ].map(c => (
            <div key={c.label} className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-2xl font-black text-slate-900">{c.value}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-base">{c.icon}</span>
                <span className="text-xs font-semibold text-slate-600">{c.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 5: "How is Cuben Retailer working for my business?" banner ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #a89442 0%, #7d6d2f 100%)' }}>
        <div className="flex flex-col xl:flex-row items-start xl:items-center gap-6 p-6">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-white leading-tight max-w-[220px]">
              How is <span className="font-black">Cuben Retailer</span> working<br />for my <span className="font-black">business</span> ?
            </h3>
          </div>
          <div className="flex flex-1 gap-4">
            {[
              { label: 'Total Sales', value: `₹${(d.cuben_retailer_impact.total_sales / 1e5).toFixed(0)}K` },
              { label: 'Additional Purchases', value: d.cuben_retailer_impact.additional_purchases.toLocaleString('en-IN') },
              { label: 'New Customers', value: d.cuben_retailer_impact.new_customers.toLocaleString('en-IN') },
            ].map(s => (
              <div key={s.label} className="flex-1 bg-white/15 backdrop-blur rounded-2xl px-4 py-4">
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-sm text-white/80 font-medium mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex-shrink-0 opacity-40">
            <svg viewBox="0 0 80 60" className="w-24 h-16" fill="none">
              <path d="M5 50 Q20 20 40 30 Q60 40 75 10" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <path d="M65 5 L75 10 L70 20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── Section 6: Upcoming Celebrations + Profile Completion ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Upcoming Celebrations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Upcoming Celebrations</h3>
            <button className="text-xs font-semibold text-amber-700 hover:underline">See all</button>
          </div>
          {/* Tip banner */}
          <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl px-3 py-2.5 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎂</span>
              <p className="text-xs text-slate-700 font-medium">People spend 25% more on their birthdays and<br />anniversaries</p>
            </div>
            <Link to="/auto-campaigns" className="flex-shrink-0 text-xs font-bold text-white bg-cyan-500 hover:bg-cyan-600 px-3 py-2 rounded-xl transition-colors ml-3">
              Activate Offer
            </Link>
          </div>
          {/* Empty state or list */}
          {d.celebrations.length === 0 ? (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400 mb-3">You will see upcoming celebrations here</p>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 bg-slate-100 rounded-full animate-pulse w-3/4" />
                    <div className="h-2 bg-slate-100 rounded-full animate-pulse w-1/2" />
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full animate-pulse w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {d.celebrations.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-cyan-200 text-amber-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {c.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.event} · {c.date}</p>
                  </div>
                  <button className="text-xs font-semibold text-amber-700 hover:underline flex-shrink-0">Send</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Profile Completion */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Customer Profile Completion</h3>
            <button className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center">
              <span className="text-[9px] text-slate-500 font-bold">i</span>
            </button>
          </div>

          {/* Profile completeness fields */}
          <div className="space-y-3 mb-4">
            {[
              { label: 'Name', icon: '👤', pct: d.profile_completion.name },
              { label: 'Mobile', icon: '📱', pct: d.profile_completion.mobile },
              { label: 'Email', icon: '✉️', pct: d.profile_completion.email },
              { label: 'Birthday', icon: '🎂', pct: d.profile_completion.birthday },
              { label: 'Anniversary', icon: '💍', pct: d.profile_completion.anniversary },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-3">
                <span className="text-sm w-5">{f.icon}</span>
                <span className="text-xs font-medium text-slate-600 w-16">{f.label}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-700"
                    style={{ width: `${f.pct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-500 w-8 text-right">{f.pct}%</span>
              </div>
            ))}
          </div>

          {/* Summary pill */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5">
            <p className="text-sm text-slate-700 font-medium">
              <span className="font-black text-purple-600">{d.profile_completion.overall}%</span> of customers have completed their profile.
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 7: Programs Performance ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-base font-bold text-slate-800">See how your programs are performing</h3>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ProgramCard
            icon="🏆"
            title="Loyalty"
            link="/loyalty"
            bg="bg-amber-50"
            stats={[
              { label: 'No. of Redemptions', value: d.programs.loyalty.redemptions.toLocaleString('en-IN') },
              { label: 'Redemption Rate', value: `${d.programs.loyalty.rate}%` },
              { label: 'Est. Revenue Gain', value: `₹${(d.programs.loyalty.revenue / 1000).toFixed(0)}K` },
            ]}
          />
          <ProgramCard
            icon="📢"
            title="Campaign"
            link="/campaigns"
            bg="bg-blue-50"
            stats={[
              { label: 'Total Sent', value: d.programs.campaign.sent.toLocaleString('en-IN') },
              { label: "Customer's Visited", value: d.programs.campaign.visited.toLocaleString('en-IN') },
              { label: 'Approx. Revenue Gain', value: `₹${(d.programs.campaign.revenue / 1000).toFixed(0)}K` },
            ]}
          />
          <ProgramCard
            icon="😊"
            title="Feedback"
            link="/feedback"
            bg="bg-cyan-50"
            stats={[
              { label: 'Total Feedbacks', value: d.programs.feedback.total.toLocaleString('en-IN') },
              { label: 'Average Rating', value: `${d.programs.feedback.avg_rating}/10` },
              { label: 'Negative Feedback', value: `${d.programs.feedback.negative_pct}%` },
            ]}
          />
          <ProgramCard
            icon="⚡"
            title="Auto-campaign"
            link="/auto-campaigns"
            bg="bg-purple-50"
            stats={[
              { label: 'Currently Active', value: `${d.programs.auto_campaign.active} / 5` },
              { label: 'Customers Visited', value: d.programs.auto_campaign.visited.toLocaleString('en-IN') },
              { label: 'Approx. Revenue Gain', value: `₹${(d.programs.auto_campaign.revenue / 1000).toFixed(0)}K` },
            ]}
          />
          <ProgramCard
            icon="⬛"
            title="QR Codes"
            link="/qr-code"
            linkLabel="Create your first QR"
            bg="bg-slate-50"
            stats={[
              { label: 'Active QR codes', value: d.programs.qr.active.toLocaleString('en-IN') },
              { label: 'Customers Captured', value: d.programs.qr.customers.toLocaleString('en-IN') },
              { label: 'Approx. Revenue', value: `₹${(d.programs.qr.revenue / 1000).toFixed(0)}K` },
            ]}
          />
          <ProgramCard
            icon="🤝"
            title="Referral"
            link="/referrals"
            bg="bg-pink-50"
            stats={[
              { label: 'Potential Customers', value: d.programs.referral.potential.toLocaleString('en-IN') },
              { label: 'New Customers', value: d.programs.referral.new_customers.toLocaleString('en-IN') },
              { label: 'Approx. Revenue', value: `₹${(d.programs.referral.revenue / 1000).toFixed(0)}K` },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────
function getMockData() {
  const weeklyChartData = (base, variance) =>
    Array.from({ length: 12 }, (_, i) => ({
      label: `W${i + 1}`,
      value: Math.max(0, base + Math.floor((Math.random() - 0.3) * variance)),
    }));

  return {
    metrics: {
      total_revenue: 842884,
      total_orders: 1248,
      new_customers: 342,
      rewards_redeemed: 184,
    },
    weekly_chart: {
      'Total Sales': weeklyChartData(70000, 30000),
      'Total Orders': weeklyChartData(100, 60),
      'Total Customers': weeklyChartData(30, 20),
      'Rewards Redeemed': weeklyChartData(15, 12),
    },
    insights: {
      mobile_capture_pct: 64,
      mobile_capture_count: 182,
      fifth_visit_pct: 42,
      visit_rates: [100, 72, 58, 48, 42],
      aov: 2401,
      aov_trend: [2100, 2300, 2150, 2450, 2200, 2800, 2400, 2600, 2350, 2700, 2500, 2401],
    },
    credits: {
      sms: 100,
      email: 100,
      wa_utility: 100,
      wa_marketing: 100,
    },
    cuben_retailer_impact: {
      total_sales: 842884,
      additional_purchases: 284,
      new_customers: 342,
    },
    celebrations: [],
    profile_completion: {
      name: 88,
      mobile: 100,
      email: 42,
      birthday: 28,
      anniversary: 12,
      overall: 0,
    },
    programs: {
      loyalty: { redemptions: 0, rate: 0, revenue: 0 },
      campaign: { sent: 0, visited: 0, revenue: 0 },
      feedback: { total: 0, avg_rating: 0, negative_pct: 0 },
      auto_campaign: { active: 0, visited: 0, revenue: 0 },
      qr: { active: 0, customers: 0, revenue: 0 },
      referral: { potential: 0, new_customers: 0, revenue: 0 },
    },
  };
}


