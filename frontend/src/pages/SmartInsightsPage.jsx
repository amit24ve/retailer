import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generates sparse random sparkline data (no axis, just shape) */
const makeSparkline = (points, base, range, up = true) =>
  Array.from({ length: points }, (_, i) => ({
    i,
    v: Math.max(0, base + (up ? 1 : -1) * (i / points) * range * 0.6 + (Math.random() - 0.5) * range * 0.4),
  }));

/** Date labels for x-axis */
const WEEK_LABELS = ['10 May', '17 May', '24 May', '31 May', '7 Jun'];
const MONTH_LABELS = ['Jun \'25', 'Sep \'25', 'Dec \'25', 'Mar \'26', 'Jun \'26'];

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-lg px-2.5 py-1.5 shadow-lg text-xs font-semibold text-slate-800">
      {payload[0]?.value?.toLocaleString('en-IN') ?? 0}
    </div>
  );
};

// ─── Empty / dashed chart placeholder ────────────────────────────────────────
function DashedPlaceholder({ labels = WEEK_LABELS, color = '#d1d5db' }) {
  return (
    <div className="flex flex-col justify-end h-full gap-3 pt-2">
      <div className="flex-1 flex items-center">
        <div className="w-full border-t-2 border-dashed" style={{ borderColor: color }} />
      </div>
      <div className="flex justify-between">
        {labels.map(l => (
          <span key={l} className="text-[10px] text-slate-400 font-medium">{l}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Visit Journey visualization ─────────────────────────────────────────────
function VisitJourneyChart({ rates, accentColor }) {
  return (
    <div className="flex items-center mt-2">
      {rates.map((r, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black border-2 bg-white shadow-sm"
              style={{ borderColor: i === 0 ? accentColor : '#e2e8f0', color: accentColor }}
            >
              {r}%
            </div>
            <span className="text-[9px] text-slate-400 whitespace-nowrap">
              {i + 1}{['st', 'nd', 'rd', 'th', 'th'][i]} visit
            </span>
          </div>
          {i < rates.length - 1 && (
            <div className="flex-1 h-px mx-0.5" style={{ background: `linear-gradient(to right, ${accentColor}40, #e2e8f0)` }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Insight Card ─────────────────────────────────────────────────────────────
/**
 * Each card: full-width, split left/right
 * Left: category tag, headline with colored keyword, "View Details →"
 * Right: metric value, subtitle, visualization
 */
function InsightCard({ card }) {
  const {
    category, headline, keywordColor, metric, metricLabel,
    chartType, chartData, chartColor, chartLabels,
    bg, visitRates, isGoingWell, status, statusColor,
    actionLink, isEmpty,
  } = card;

  const renderChart = () => {
    if (isEmpty) {
      return (
        <div className="relative h-36">
          <div className="flex items-end gap-1 h-full opacity-20">
            {[55, 80, 45, 95, 60, 75, 50, 85, 65, 90, 55, 80].map((h, i) => (
              <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: '#c7d2fe' }} />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-2xl px-4 py-3 shadow border border-slate-100 text-center">
              <div className="w-8 h-8 bg-cyan-200 rounded-full flex items-center justify-center mx-auto mb-1.5">
                <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
                </svg>
              </div>
              <p className="text-xs font-bold text-slate-700">No Data Available</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Start collecting data to see<br />your data visualised here</p>
            </div>
          </div>
        </div>
      );
    }

    if (chartType === 'dashed') {
      return <div className="h-36"><DashedPlaceholder labels={chartLabels} color={chartColor} /></div>;
    }

    if (chartType === 'area') {
      return (
        <div className="h-36">
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`grad-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="v" stroke={chartColor} strokeWidth={2.5} fill={`url(#grad-${card.id})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-between mt-1">
            {(chartLabels || []).map(l => (
              <span key={l} className="text-[10px] text-slate-400">{l}</span>
            ))}
          </div>
        </div>
      );
    }

    if (chartType === 'bar') {
      return (
        <div className="h-36">
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barCategoryGap="25%">
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={chartColor} fillOpacity={0.6 + (i / chartData.length) * 0.4} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-between mt-1">
            {(chartLabels || []).map(l => (
              <span key={l} className="text-[10px] text-slate-400">{l}</span>
            ))}
          </div>
        </div>
      );
    }

    if (chartType === 'gradient-bar') {
      return (
        <div className="h-36 flex flex-col justify-end gap-2">
          <div className="h-10 rounded-xl" style={{ background: `linear-gradient(to right, ${chartColor}60, ${chartColor})` }} />
          <div className="flex justify-between">
            {(chartLabels || []).map(l => (
              <span key={l} className="text-[10px] text-slate-400">{l}</span>
            ))}
          </div>
        </div>
      );
    }

    if (chartType === 'visit-journey') {
      return (
        <div className="h-36 flex flex-col justify-center">
          <VisitJourneyChart rates={visitRates} accentColor={chartColor} />
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className="rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      style={{ background: bg }}
    >
      <div className="flex flex-col xl:flex-row min-h-[200px]">
        {/* ── Left panel ── */}
        <div className="xl:w-5/12 p-7 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Category tag */}
            <span className="inline-block text-xs font-semibold text-slate-700 bg-white/80 backdrop-blur border border-white/60 px-3 py-1 rounded-full shadow-sm">
              {category}
            </span>
            {/* Headline with colored keyword */}
            <h2 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
              {headline.map((part, i) =>
                part.highlight
                  ? <span key={i} style={{ color: keywordColor }}>{part.text}</span>
                  : <span key={i}>{part.text}</span>
              )}
            </h2>
          </div>
          {/* View Details button */}
          <div className="mt-6">
            <Link
              to={actionLink}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 border border-slate-300 bg-white/80 hover:bg-white px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-sm"
            >
              View Details <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="xl:flex-1 relative">
          {/* Going well / status badge */}
          {isGoingWell && (
            <div
              className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-md"
              style={{ background: statusColor || '#a89442' }}
            >
              <span className="flex gap-0.5">
                <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-white/80" />
              </span>
              {status || 'Going well'}
            </div>
          )}

          {/* White chart card */}
          <div className="h-full bg-white/80 backdrop-blur m-4 ml-0 xl:ml-2 rounded-2xl p-5 shadow-sm border border-white/80">
            <p className="text-3xl font-black text-slate-900 leading-none">{metric}</p>
            <p className="text-xs text-slate-500 font-medium mt-1 mb-3">{metricLabel}</p>
            {renderChart()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Insight definitions ──────────────────────────────────────────────────────
const buildInsights = () => [
  {
    id: 'mobile-capture',
    category: 'Business Overview',
    headline: [
      { text: 'How many purchases had a ' },
      { text: 'valid mobile number', highlight: true },
      { text: '?' },
    ],
    keywordColor: '#e91e8c',
    metric: '64%',
    metricLabel: 'Valid mobile numbers captured in last 30 days',
    chartType: 'area',
    chartData: makeSparkline(20, 60, 30, true),
    chartColor: '#e91e8c',
    chartLabels: WEEK_LABELS,
    bg: 'linear-gradient(135deg, #fdf0f7 0%, #fce4f0 100%)',
    isGoingWell: false,
    actionLink: '/customers',
    isEmpty: false,
  },
  {
    id: 'return-time',
    category: 'Time Between Visits',
    headline: [
      { text: 'Is my ' },
      { text: 'customer return time', highlight: true },
      { text: ' improving?' },
    ],
    keywordColor: '#a89442',
    metric: '24 Days',
    metricLabel: 'Average days for a customer to visit again',
    chartType: 'area',
    chartData: makeSparkline(20, 28, 12, false),
    chartColor: '#a89442',
    chartLabels: MONTH_LABELS,
    bg: 'linear-gradient(135deg, #f0fdf9 0%, #d1fae5 60%, #ccfbf1 100%)',
    isGoingWell: true,
    status: 'Going well',
    statusColor: '#a89442',
    actionLink: '/customers',
    isEmpty: false,
  },
  {
    id: 'aov',
    category: 'Average Order Value',
    headline: [
      { text: 'Is my ' },
      { text: 'average order value', highlight: true },
      { text: ' growing over time?' },
    ],
    keywordColor: '#c9b96e',
    metric: '₹2,401',
    metricLabel: 'AOV in last 30 days',
    chartType: 'gradient-bar',
    chartColor: '#06b6d4',
    chartLabels: WEEK_LABELS,
    bg: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)',
    isGoingWell: false,
    actionLink: '/orders',
    isEmpty: false,
  },
  {
    id: 'sales-trend',
    category: 'Business Overview',
    headline: [
      { text: 'What is the ' },
      { text: 'Sales trend', highlight: true },
      { text: ' of my business?' },
    ],
    keywordColor: '#a89442',
    metric: '₹8.4L',
    metricLabel: 'Sales in last 30 days',
    chartType: 'area',
    chartData: makeSparkline(20, 70000, 40000, true),
    chartColor: '#a89442',
    chartLabels: WEEK_LABELS,
    bg: 'linear-gradient(135deg, #f0fdf9 0%, #ccfbf1 100%)',
    isGoingWell: true,
    status: 'Going well',
    statusColor: '#a89442',
    actionLink: '/orders',
    isEmpty: false,
  },
  {
    id: 'customers-visiting',
    category: 'Business Overview',
    headline: [
      { text: 'How many ' },
      { text: 'Customers', highlight: true },
      { text: ' are visiting my brand?' },
    ],
    keywordColor: '#c9b96e',
    metric: '1,248',
    metricLabel: 'Customers visited in last 30 days',
    chartType: 'bar',
    chartData: makeSparkline(12, 100, 60, true),
    chartColor: '#06b6d4',
    chartLabels: WEEK_LABELS,
    bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    isGoingWell: false,
    actionLink: '/customers',
    isEmpty: false,
  },
  {
    id: 'fifth-visit',
    category: 'Customer Drop-off',
    headline: [
      { text: 'What percentage of my ' },
      { text: 'customers make it to their 5th visit', highlight: true },
      { text: '?' },
    ],
    keywordColor: '#e91e8c',
    metric: '42%',
    metricLabel: 'Customers make it till the 5th visit in last 12 months',
    chartType: 'visit-journey',
    chartColor: '#e91e8c',
    visitRates: [100, 72, 58, 48, 42],
    bg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
    isGoingWell: false,
    actionLink: '/loyalty',
    isEmpty: false,
  },
  {
    id: 'item-mix',
    category: 'Item Mix',
    headline: [
      { text: 'Which items are driving ' },
      { text: 'repeat visits', highlight: true },
      { text: '?' },
    ],
    keywordColor: '#2563eb',
    metric: '—',
    metricLabel: 'No item data available yet',
    chartType: 'bar',
    chartColor: '#3b82f6',
    chartLabels: WEEK_LABELS,
    bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    isGoingWell: false,
    actionLink: '/orders',
    isEmpty: true,
  },
  {
    id: 'lost-customers',
    category: 'Customer Health',
    headline: [
      { text: 'How many customers did I ' },
      { text: 'lose this month', highlight: true },
      { text: '?' },
    ],
    keywordColor: '#dc2626',
    metric: '184',
    metricLabel: 'Churned customers in last 30 days',
    chartType: 'area',
    chartData: makeSparkline(20, 180, 80, false),
    chartColor: '#ef4444',
    chartLabels: WEEK_LABELS,
    bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
    isGoingWell: false,
    actionLink: '/smart-insights',
    isEmpty: false,
  },
  {
    id: 'new-customers',
    category: 'Growth',
    headline: [
      { text: 'How fast am I ' },
      { text: 'acquiring new customers', highlight: true },
      { text: '?' },
    ],
    keywordColor: '#a89442',
    metric: '342',
    metricLabel: 'New customers in last 30 days',
    chartType: 'bar',
    chartData: makeSparkline(12, 28, 18, true),
    chartColor: '#c9b96e',
    chartLabels: WEEK_LABELS,
    bg: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
    isGoingWell: true,
    status: 'Going well',
    statusColor: '#a89442',
    actionLink: '/customers',
    isEmpty: false,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SmartInsightsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const insights = useMemo(() => buildInsights(), []);
  const goingWellCount = insights.filter(c => c.isGoingWell).length;
  const filtered = activeTab === 'going-well' ? insights.filter(c => c.isGoingWell) : insights;

  return (
    <div className="space-y-5 pb-10 animate-slide-up">

      {/* ── Header ── */}
      <div className="flex items-center gap-2">
        <SparklesIcon className="w-5 h-5 text-slate-800" />
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Smart Insights</h1>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('going-well')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === 'going-well'
              ? 'bg-cyan-500 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:border-cyan-500'
          }`}
        >
          Going Well
          <span
            className={`w-5 h-5 rounded-full text-xs font-black flex items-center justify-center ${
              activeTab === 'going-well' ? 'bg-white text-amber-800' : 'bg-cyan-500 text-white'
            }`}
          >
            {goingWellCount}
          </span>
        </button>
      </div>

      {/* ── Insight cards ── */}
      <div className="space-y-4">
        {filtered.map(card => (
          <InsightCard key={card.id} card={card} />
        ))}
      </div>

      {/* ── Empty state (no going well) ── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mb-4">
            <SparklesIcon className="w-8 h-8 text-cyan-500" />
          </div>
          <p className="text-base font-bold text-slate-700">No insights available yet</p>
          <p className="text-sm text-slate-400 mt-1">Start collecting customer data to see actionable insights here.</p>
        </div>
      )}
    </div>
  );
}


