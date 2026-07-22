import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import {
  ShoppingCartIcon, UsersIcon, CurrencyRupeeIcon, StarIcon,
  ArrowTrendingUpIcon, ArrowTrendingDownIcon, QrCodeIcon,
  CheckBadgeIcon, ClockIcon, BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';

// ─── Tooltip ────────────────────────────────────────────────────────────────
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

// ─── Today Stat Card ─────────────────────────────────────────────────────────
const TodayCard = ({ icon: Icon, label, value, change, changeLabel, color, bg }) => (
  <div className={`${bg} rounded-2xl p-5`}>
    <div className="flex items-start justify-between">
      <div>
        <p className={`text-xs font-bold uppercase tracking-wider ${color} mb-1`}>{label}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        {change !== undefined && (
          <div className={`flex items-center gap-1 mt-1.5 text-xs font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {change >= 0
              ? <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
              : <ArrowTrendingDownIcon className="w-3.5 h-3.5" />}
            <span>{Math.abs(change)}% {changeLabel}</span>
          </div>
        )}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color.replace('text', 'bg').replace('-600', '-100').replace('-500', '-100')}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </div>
);

// ─── Order Status Badge ───────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    refunded: 'bg-red-100 text-red-600',
  };
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
};

// ─── Mock fallback data ──────────────────────────────────────────────────────
const getMockData = () => ({
  store_info: {
    store_id: 's1',
    store_name: 'New Delhi Flagship',
    city: 'New Delhi',
    state: 'Delhi',
    store_code: 'DEL-FLAGSHIP-01',
    status: 'active',
  },
  today_metrics: {
    revenue: 42440,
    orders: 18,
    new_customers: 3,
    points_issued: 1840,
    loyalty_txns: 14,
    yesterday_revenue: 38200,
    revenue_growth_pct: 11.1,
  },
  month_metrics: {
    revenue: 842884,
    orders: 284,
    total_customers: 48,
  },
  weekly_chart: {
    Revenue: [
      { label: 'Mon', value: 38200 },
      { label: 'Tue', value: 44800 },
      { label: 'Wed', value: 32100 },
      { label: 'Thu', value: 51200 },
      { label: 'Fri', value: 62400 },
      { label: 'Sat', value: 78900 },
      { label: 'Sun', value: 42440 },
    ],
    Orders: [
      { label: 'Mon', value: 14 },
      { label: 'Tue', value: 18 },
      { label: 'Wed', value: 12 },
      { label: 'Thu', value: 20 },
      { label: 'Fri', value: 26 },
      { label: 'Sat', value: 32 },
      { label: 'Sun', value: 18 },
    ],
  },
  recent_orders: [
    { order_id: '1', customer_name: 'Siddharth Sharma', amount: 3240, status: 'completed', invoice: 'INV-2026-9001', points: 324, time: '10:30 AM' },
    { order_id: '2', customer_name: 'Priya Patel', amount: 1850, status: 'completed', invoice: 'INV-2026-9002', points: 185, time: '11:15 AM' },
    { order_id: '3', customer_name: 'Rahul Gupta', amount: 5600, status: 'completed', invoice: 'INV-2026-9003', points: 560, time: '12:05 PM' },
    { order_id: '4', customer_name: 'Anjali Singh', amount: 920, status: 'pending', invoice: 'INV-2026-9004', points: 0, time: '01:20 PM' },
    { order_id: '5', customer_name: 'Vikram Mehta', amount: 7200, status: 'completed', invoice: 'INV-2026-9005', points: 720, time: '02:45 PM' },
    { order_id: '6', customer_name: 'Neha Joshi', amount: 2100, status: 'completed', invoice: 'INV-2026-9006', points: 210, time: '03:10 PM' },
    { order_id: '7', customer_name: 'Arjun Kumar', amount: 4350, status: 'completed', invoice: 'INV-2026-9007', points: 435, time: '04:00 PM' },
    { order_id: '8', customer_name: 'Deepa Nair', amount: 1200, status: 'refunded', invoice: 'INV-2026-9008', points: 0, time: '04:45 PM' },
  ],
});

const CHART_TABS = ['Revenue', 'Orders'];

// ─── Main component ──────────────────────────────────────────────────────────
export default function StoreManagerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartTab, setChartTab] = useState('Revenue');

  useEffect(() => {
    api.get('/analytics/store-dashboard')
      .then(r => setData(r.data))
      .catch(() => setData(getMockData()))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent border-teal-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading store data...</p>
        </div>
      </div>
    );
  }

  const d = data || getMockData();
  const tm = d.today_metrics;
  const mm = d.month_metrics;
  const si = d.store_info;
  const chartData = d.weekly_chart[chartTab] || [];

  const now = new Date();
  const timeString = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateString = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 pb-8">

      {/* ── Header Banner ── */}
      <div className="rounded-2xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full"
            style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full"
            style={{ background: 'radial-gradient(circle, #6ee7b7 0%, transparent 70%)', transform: 'translate(-20%, 20%)' }} />
        </div>
        <div className="relative px-7 py-6">
          <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <BuildingStorefrontIcon className="w-5 h-5 text-emerald-300" />
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Store Manager Console</span>
              </div>
              <h1 className="text-2xl font-black text-white mb-1">
                Good {now.getHours() < 12 ? 'Morning' : now.getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.full_name?.split(' ')[0] || 'Manager'} 👋
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-emerald-200 text-sm font-medium">{si.store_name}</p>
                <span className="w-1 h-1 bg-emerald-400 rounded-full" />
                <p className="text-emerald-300 text-xs">{si.city}, {si.state}</p>
                <span className="w-1 h-1 bg-emerald-400 rounded-full" />
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${si.status === 'active' ? 'bg-green-400/30 text-green-200' : 'bg-red-400/30 text-red-200'}`}>
                  {si.status === 'active' ? '● Open' : '● Closed'}
                </span>
              </div>
              <p className="text-emerald-300/70 text-xs mt-1">{dateString}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { label: "Today's Revenue", value: `₹${(tm.revenue / 1000).toFixed(1)}K`, emoji: '💰' },
                { label: "Today's Orders", value: tm.orders, emoji: '🛍️' },
                { label: 'Points Issued', value: tm.points_issued.toLocaleString('en-IN'), emoji: '⭐' },
              ].map(stat => (
                <div key={stat.label}
                  className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-3 text-center min-w-[90px]">
                  <p className="text-lg font-black text-white">{stat.emoji} {stat.value}</p>
                  <p className="text-xs text-emerald-200 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Today's KPIs ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <TodayCard
          icon={CurrencyRupeeIcon}
          label="Today's Sales"
          value={`₹${tm.revenue.toLocaleString('en-IN')}`}
          change={tm.revenue_growth_pct}
          changeLabel="vs yesterday"
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <TodayCard
          icon={ShoppingCartIcon}
          label="Today's Orders"
          value={tm.orders}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <TodayCard
          icon={UsersIcon}
          label="New Customers"
          value={tm.new_customers}
          color="text-purple-600"
          bg="bg-purple-50"
        />
        <TodayCard
          icon={StarIcon}
          label="Loyalty Txns"
          value={tm.loyalty_txns}
          changeLabel={`${tm.points_issued.toLocaleString('en-IN')} pts issued`}
          color="text-amber-600"
          bg="bg-amber-50"
        />
      </div>

      {/* ── Weekly Chart + Month Summary ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Weekly Performance Chart */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">This Week's Performance</h3>
                <p className="text-xs text-slate-400 mt-0.5">{si.store_name} · Last 7 days</p>
              </div>
              <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl">
                {CHART_TABS.map(t => (
                  <button key={t} onClick={() => setChartTab(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${chartTab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="px-5 pb-5 h-52 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={55}
                  tickFormatter={v => chartTab === 'Revenue' ? (v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`) : v} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" name={chartTab} fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Month Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Month Summary</h3>
          <div className="space-y-4">
            {[
              { label: 'Monthly Revenue', value: `₹${(mm.revenue / 100000).toFixed(1)}L`, icon: '💰', bg: 'bg-emerald-50', color: 'text-emerald-700' },
              { label: 'Monthly Orders', value: mm.orders.toLocaleString('en-IN'), icon: '🛍️', bg: 'bg-blue-50', color: 'text-blue-700' },
              { label: 'Total Customers', value: mm.total_customers.toLocaleString('en-IN'), icon: '👥', bg: 'bg-purple-50', color: 'text-purple-700' },
              { label: 'Avg. Daily Revenue', value: `₹${(mm.revenue / 30).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: '📊', bg: 'bg-amber-50', color: 'text-amber-700' },
            ].map(item => (
              <div key={item.label} className={`${item.bg} rounded-xl px-4 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-xs font-medium text-slate-600">{item.label}</span>
                </div>
                <span className={`text-sm font-black ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Add Customer', to: '/customers/add', emoji: '➕' },
                { label: 'View Orders', to: '/orders', emoji: '📋' },
                { label: 'QR Code', to: '/qr-code', emoji: '📲' },
                { label: 'Feedback', to: '/feedback', emoji: '⭐' },
              ].map(action => (
                <Link key={action.label} to={action.to}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition-all text-center">
                  <span className="text-lg">{action.emoji}</span>
                  <span className="text-[10px] font-semibold text-slate-600">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Store Highlights Banner ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {[
          {
            title: 'Loyalty Program',
            desc: 'Customers earning & redeeming points at your store',
            icon: '🏆',
            stat: `${tm.points_issued.toLocaleString('en-IN')} pts`,
            statLabel: 'issued today',
            link: '/loyalty',
            bg: 'bg-gradient-to-br from-amber-500 to-amber-700',
          },
          {
            title: 'Customer Feedback',
            desc: 'See what customers say about your store',
            icon: '💬',
            stat: 'View',
            statLabel: 'all reviews',
            link: '/feedback',
            bg: 'bg-gradient-to-br from-blue-500 to-blue-700',
          },
          {
            title: 'QR Check-ins',
            desc: 'Capture walk-in customers with QR code',
            icon: '📲',
            stat: 'Scan Now',
            statLabel: 'or generate code',
            link: '/qr-code',
            bg: 'bg-gradient-to-br from-purple-500 to-purple-700',
          },
        ].map(card => (
          <Link key={card.title} to={card.link}
            className={`${card.bg} rounded-2xl p-5 hover:opacity-90 transition-opacity block`}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-2xl">{card.icon}</span>
                <p className="text-sm font-bold text-white mt-2">{card.title}</p>
                <p className="text-xs text-white/70 mt-0.5 leading-relaxed">{card.desc}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-white">{card.stat}</p>
                <p className="text-xs text-white/70">{card.statLabel}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Recent Transactions ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-slate-500" />
            Recent Transactions — {si.store_name}
          </h3>
          <Link to="/orders" className="text-xs font-semibold text-emerald-600 hover:underline">View All Orders</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Customer</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Invoice</th>
                <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Amount</th>
                <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Points</th>
                <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(d.recent_orders || []).map(order => (
                <tr key={order.order_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-200 to-emerald-300 flex items-center justify-center text-xs font-bold text-emerald-800 flex-shrink-0">
                        {order.customer_name.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-800">{order.customer_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-500 text-xs font-mono">{order.invoice}</td>
                  <td className="px-6 py-3 text-right font-bold text-slate-800">₹{order.amount.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-3 text-right">
                    {order.points > 0 ? (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">+{order.points}</span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-3 text-right text-xs text-slate-400 font-medium">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Shift Summary ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <CheckBadgeIcon className="w-5 h-5 text-emerald-500" />
          <h3 className="text-base font-bold text-slate-800">Today's Shift Summary</h3>
          <span className="ml-auto text-xs font-medium text-slate-400">{dateString}</span>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
          {[
            { label: 'Total Revenue', value: `₹${tm.revenue.toLocaleString('en-IN')}`, icon: '💰', highlight: true },
            { label: 'Total Orders', value: tm.orders, icon: '🛍️', highlight: false },
            { label: 'New Customers', value: tm.new_customers, icon: '👤', highlight: false },
            { label: 'Loyalty Points', value: tm.points_issued.toLocaleString('en-IN'), icon: '⭐', highlight: false },
            { label: 'Avg. Order Value', value: `₹${tm.orders > 0 ? (tm.revenue / tm.orders).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : 0}`, icon: '📊', highlight: false },
          ].map(item => (
            <div key={item.label}
              className={`rounded-xl p-4 text-center ${item.highlight ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-slate-50 border border-slate-100'}`}>
              <span className="text-2xl">{item.icon}</span>
              <p className={`text-xl font-black mt-1 ${item.highlight ? 'text-white' : 'text-slate-900'}`}>{item.value}</p>
              <p className={`text-xs mt-0.5 ${item.highlight ? 'text-white/80' : 'text-slate-500'} font-medium`}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
