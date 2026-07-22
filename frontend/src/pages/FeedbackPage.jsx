import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  QuestionMarkCircleIcon, ChevronDownIcon, ArrowTopRightOnSquareIcon,
  FunnelIcon, ArrowPathIcon, SparklesIcon, ChartBarIcon,
  UserGroupIcon, InboxIcon, CheckIcon, StarIcon
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA & CONFIGURATIONS
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_FEEDBACK = [
  { id: 'f1', customer: 'Siddharth Sharma', mobile: '+919876543210', rating: 5, comment: 'Excellent service! The loyalty program is amazing and easy to redeem.', store: 'New Delhi Flagship', date: '2026-06-07', type: 'promoter', spent: 3400 },
  { id: 'f2', customer: 'Priya Patel', mobile: '+919876543211', rating: 3, comment: 'Good experience overall. Could improve billing checkout speed.', store: 'Mumbai Colaba', date: '2026-06-06', type: 'passive', spent: 1800 },
  { id: 'f3', customer: 'Rahul Gupta', mobile: '+919876543212', rating: 2, comment: 'Long wait times at the counter. Staff seemed a bit unhelpful.', store: 'Bengaluru Indiranagar', date: '2026-06-06', type: 'detractor', spent: 900 },
  { id: 'f4', customer: 'Anjali Singh', mobile: '+919876543213', rating: 5, comment: 'Absolutely love the birthday surprise reward! Great touch.', store: 'New Delhi Flagship', date: '2026-06-05', type: 'promoter', spent: 5200 },
  { id: 'f5', customer: 'Vikram Mehta', mobile: '+919876543214', rating: 4, comment: 'Happy with the new Platinum tier benefits! App is smooth.', store: 'Noida Mall Store', date: '2026-06-05', type: 'promoter', spent: 2100 },
  { id: 'f6', customer: 'Neha Joshi', mobile: '+919876543215', rating: 1, comment: 'Points redemption process is very confusing and took too long.', store: 'Pune Camp', date: '2026-06-04', type: 'detractor', spent: 640 },
  { id: 'f7', customer: 'Arjun Kumar', mobile: '+919876543216', rating: 5, comment: 'Great product quality and excellent loyalty perks!', store: 'Mumbai Colaba', date: '2026-06-04', type: 'promoter', spent: 4100 },
];

const SCORE_DIST = [
  { score: '😡 1', count: 8, color: '#f43f5e' },
  { score: '😕 2', count: 18, color: '#f97316' },
  { score: '😐 3', count: 38, color: '#eab308' },
  { score: '😄 4', count: 142, color: '#10b981' },
  { score: '🤩 5', count: 248, color: '#06b6d4' },
];

const NPS_DATA = [
  { name: 'Promoters', value: 54, color: '#06b6d4' },
  { name: 'Passives', value: 31, color: '#eab308' },
  { name: 'Detractors', value: 15, color: '#f43f5e' },
];

const EMOJI_RATINGS = [
  { val: 1, emoji: '😢', label: 'Very Bad',  color: '#f43f5e' },
  { val: 2, emoji: '🙁', label: 'Bad',       color: '#f97316' },
  { val: 3, emoji: '😐', label: 'Okay',      color: '#eab308' },
  { val: 4, emoji: '😄', label: 'Good',      color: '#10b981' },
  { val: 5, emoji: '🤩', label: 'Excellent', color: '#06b6d4' },
];

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 shadow-xl text-xs text-white">
      <p className="font-bold text-slate-300">{label}</p>
      <p className="text-slate-400 mt-0.5">Count: <span className="font-black text-white">{payload[0]?.value}</span></p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FEEDBACK CARD PREVIEW (Realistic Phone Mockup style)
// ─────────────────────────────────────────────────────────────────────────────
function FeedbackCardPreview({ brandName, question, ratingStyle, bonusPts, selectedRating, onRatingSelect }) {
  return (
    <div className="w-[230px] mx-auto select-none">
      <div className="rounded-[2.2rem] overflow-hidden border-[6px] border-slate-800 bg-slate-950 shadow-2xl relative" style={{ minHeight: 410 }}>
        {/* Notch */}
        <div className="h-5 bg-slate-900 flex items-center justify-center relative z-20">
          <div className="w-20 h-3 bg-black rounded-full" />
        </div>

        {/* Pink/Rose header */}
        <div className="px-4 py-4 relative z-10" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}>
          {/* Brand logo circle + greeting */}
          <div className="flex items-start gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-black text-white uppercase tracking-wider text-center leading-tight">
                {brandName.slice(0, 4).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-black text-white leading-tight">
                Hi John, your feedback is crucial!
              </p>
              <p className="text-[8px] text-white/70 mt-0.5 font-bold">Help us serve you better</p>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-3 gap-1 mb-3.5 border-t border-white/10 pt-2.5">
            {[
              { label: 'Spent', value: '₹3,400' },
              { label: 'Date', value: '15 Jun' },
              { label: 'Time', value: '07:30 PM' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-[7px] text-white/50 uppercase tracking-widest font-black">{s.label}</p>
                <p className="text-[9px] font-black text-white mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Bonus Points Banner */}
          <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl px-2.5 py-2 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-slate-950 text-[8px] font-black flex-shrink-0">✦</div>
            <p className="text-[9px] text-white leading-none font-bold">
              Earn <span className="text-yellow-300 font-black">{bonusPts} Bonus Pts</span> on submit
            </p>
          </div>
        </div>

        {/* Smartphone Body */}
        <div className="bg-slate-900 p-4 min-h-[220px] text-white">
          <p className="text-xs font-black text-white mb-3 text-center leading-relaxed">{question}</p>

          {/* Emoji Style */}
          {ratingStyle === 'emoji' && (
            <div className="flex items-center justify-between px-1">
              {EMOJI_RATINGS.map(r => (
                <button
                  key={r.val}
                  onClick={() => onRatingSelect(r.val)}
                  className="flex flex-col items-center gap-1 transition-all duration-200"
                >
                  <span
                    className={`text-2xl transition-all ${selectedRating === r.val ? 'scale-125 opacity-100' : 'opacity-50 hover:opacity-150'}`}
                    style={{ filter: selectedRating === r.val ? `drop-shadow(0 0 6px ${r.color})` : 'none' }}
                  >
                    {r.emoji}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Number Style */}
          {ratingStyle === 'number' && (
            <div className="flex items-center justify-between px-1">
              {EMOJI_RATINGS.map(r => (
                <button
                  key={r.val}
                  onClick={() => onRatingSelect(r.val)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all border border-slate-800"
                  style={{
                    background: selectedRating === r.val ? r.color : 'rgba(255,255,255,0.05)',
                    color: selectedRating === r.val ? 'white' : '#94a3b8',
                    transform: selectedRating === r.val ? 'scale(1.15)' : 'scale(1)',
                    borderColor: selectedRating === r.val ? r.color : 'rgba(255,255,255,0.1)'
                  }}
                >
                  {r.val}
                </button>
              ))}
            </div>
          )}

          {/* Star Style */}
          {ratingStyle === 'star' && (
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => onRatingSelect(s)} className="text-2xl transition-all hover:scale-110">
                  <span style={{ color: s <= (selectedRating || 0) ? '#f59e0b' : '#334155' }}>★</span>
                </button>
              ))}
            </div>
          )}

          {/* Follow-up text if rated */}
          {selectedRating !== null && (
            <div className="mt-4 border-t border-slate-800 pt-3 animate-slide-up space-y-2">
              <p className="text-[10px] text-slate-400 text-center leading-snug font-semibold">
                {selectedRating >= 4
                  ? '😊 Awesome! Tell us what you liked the most?'
                  : '😟 Sorry to hear that. How can we make it better?'}
              </p>
              <textarea
                rows={2}
                className="w-full text-[10px] bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none placeholder-slate-600"
                placeholder="Write your feedback..."
              />
              <button 
                onClick={() => { toast.success('Mock feedback submitted! 🚀'); onRatingSelect(null); }}
                className="w-full py-2 rounded-xl text-[10px] font-black text-white tracking-wider uppercase transition-colors"
                style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}
              >
                Submit Feedback
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION PANEL
// ─────────────────────────────────────────────────────────────────────────────
function FeedbackConfigPanel({ config, onChange }) {
  return (
    <div className="space-y-4 text-left">
      <div>
        <h3 className="text-lg font-black text-white">Design Feedback Flow</h3>
        <p className="text-xs text-slate-400 mt-0.5">Customize the survey experience and reward structures</p>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Feedback Question</label>
        <input
          className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
          value={config.question}
          onChange={e => onChange({ ...config, question: e.target.value })}
        />
      </div>

      {/* Rating style selector */}
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rating Controls Style</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'emoji', label: 'Emoji Scale', icon: '🤩' },
            { id: 'number', label: '1-5 Numbers', icon: '❺' },
            { id: 'star', label: 'Star Rating', icon: '⭐' }
          ].map(opt => (
            <label 
              key={opt.id} 
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                config.ratingStyle === opt.id ? "border-indigo-500 bg-indigo-500/5 text-white" : "border-slate-800 bg-slate-900/40 text-slate-450 hover:bg-slate-900"
              }`}
            >
              <input type="radio" className="hidden" value={opt.id} checked={config.ratingStyle === opt.id} onChange={() => onChange({ ...config, ratingStyle: opt.id })} />
              <span className="text-sm">{opt.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-wider">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rewards Configuration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Loyalty Points Reward</label>
          <input
            type="number"
            className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            value={config.bonusPts}
            onChange={e => onChange({ ...config, bonusPts: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Brand Label Name</label>
          <input
            className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            value={config.brandName}
            onChange={e => onChange({ ...config, brandName: e.target.value })}
          />
        </div>
      </div>

      {/* Follow ups */}
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Positive Follow-Up Prompt</label>
        <input
          className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
          value={config.positiveFollowUp}
          onChange={e => onChange({ ...config, positiveFollowUp: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Negative Follow-Up Prompt</label>
        <input
          className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
          value={config.negativeFollowUp}
          onChange={e => onChange({ ...config, negativeFollowUp: e.target.value })}
        />
      </div>

      <button
        onClick={() => { api.post('/feedback', {}).catch(() => {}); toast.success('Feedback flow saved! 🎉'); }}
        className="w-full py-3 text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg cursor-pointer mt-2"
      >
        Save Survey Configuration
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS VIEW
// ─────────────────────────────────────────────────────────────────────────────
function FeedbackAnalytics() {
  const [filter, setFilter] = useState('all');
  const npsScore = 39;
  const filtered = filter === 'all' ? MOCK_FEEDBACK : MOCK_FEEDBACK.filter(f => f.type === filter);

  return (
    <div className="space-y-6 text-left">
      
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* NPS Circular indicator */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center backdrop-blur-sm">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">Net Promoter Score (NPS)</p>
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#1e293b" strokeWidth="6" />
              <circle cx="40" cy="40" r="32" fill="none" stroke="#4f46e5" strokeWidth="6"
                strokeDasharray={`${npsScore * 2.01} 201`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-white">{npsScore}</span>
          </div>
          <p className="text-[9px] text-emerald-400 font-extrabold uppercase mt-2.5">↑ +4.2% Month over Month</p>
        </div>

        {[
          { label: 'Total responses logged', value: '460', sub: 'Last 30 days', color: 'text-indigo-450', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: <InboxIcon className="w-5 h-5" /> },
          { label: 'Active Promoter members', value: '54%', sub: '248 happy promoters', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: <CheckIcon className="w-5 h-5" /> },
          { label: 'Active Detractors risk', value: '15%', sub: '69 require action nudge', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', icon: <QuestionMarkCircleIcon className="w-5 h-5" /> }
        ].map((s, idx) => (
          <div key={idx} className={`rounded-2xl p-5 border ${s.bg} ${s.border} backdrop-blur-sm transition-all duration-300 hover:scale-[1.01]`}>
            <div className="flex justify-between items-start">
              <span className={`p-2 rounded-xl bg-black/20 ${s.color}`}>{s.icon}</span>
            </div>
            <p className={`text-2xl font-black mt-4 ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-450 font-extrabold uppercase tracking-wider mt-1 leading-tight">{s.label}</p>
            <p className="text-[9px] text-slate-500 font-extrabold uppercase mt-0.5 tracking-wider">{s.sub}</p>
          </div>
        ))}

      </div>

      {/* Recharts distribution graphics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Rating distribution bar */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-900 rounded-3xl p-6">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">Rating Score Distribution</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SCORE_DIST}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="score" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                  {SCORE_DIST.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* NPS Pie Breakdown */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">NPS Ring Split</h3>
            <div className="h-32 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={NPS_DATA} cx="50%" cy="50%" innerRadius={36} outerRadius={50} paddingAngle={4} dataKey="value">
                    {NPS_DATA.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                  </Pie>
                  <Tooltip formatter={v => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {NPS_DATA.map(n => (
              <div key={n.name} className="flex items-center justify-between text-xs border-b border-slate-900/60 pb-2 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: n.color }} />
                  <span className="text-slate-400 font-medium">{n.name}</span>
                </div>
                <span className="font-black text-white">{n.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CRM Feedback table logs */}
      <div className="bg-slate-900/30 border border-slate-900 rounded-3xl overflow-hidden">
        
        <div className="px-6 py-5 border-b border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/45">
          <div>
            <h3 className="text-base font-black text-white">Survey Response Logs</h3>
            <p className="text-xs text-slate-400 mt-0.5">Filter feedback lists by NPS categories</p>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['all', 'promoter', 'passive', 'detractor'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`text-[10px] font-black px-3 py-1.5 rounded-xl border capitalize cursor-pointer transition-all ${
                  filter === f ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-900 text-slate-300 font-medium">
          {filtered.map(fb => {
            const ratingInfo = EMOJI_RATINGS[fb.rating - 1];
            return (
              <div key={fb.id} className="px-6 py-5 hover:bg-slate-900/30 transition-colors">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  
                  <div className="flex items-start gap-4">
                    {/* Avatar circle */}
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-black flex-shrink-0 text-white shadow-lg ${
                      fb.type === 'promoter' ? 'bg-emerald-600' : fb.type === 'passive' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}>
                      {fb.customer.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-black text-white">{fb.customer}</p>
                        <span className="text-slate-700 text-xs">·</span>
                        <p className="text-xs text-slate-400">{fb.store}</p>
                        <span className="text-slate-700 text-xs">·</span>
                        <p className="text-xs text-emerald-400 font-black">₹{fb.spent.toLocaleString('en-IN')} spent</p>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold">{fb.mobile} · Logged {fb.date}</p>
                      <p className="text-xs text-slate-300 leading-relaxed italic mt-2">"{fb.comment}"</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 w-full sm:w-auto border-t border-slate-900 sm:border-0 pt-3 sm:pt-0">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl leading-none">{ratingInfo?.emoji}</span>
                      <span className="text-xs font-black text-white">{fb.rating}/5 Score</span>
                    </div>
                    <div className="flex gap-2">
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase ${
                        fb.type === 'promoter' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : fb.type === 'passive' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>
                        {fb.type}
                      </span>
                      {fb.type === 'detractor' && (
                        <button 
                          onClick={() => toast.success(`Initiated recovery callback for ${fb.customer}`)}
                          className="text-[9px] font-black text-indigo-400 hover:underline"
                        >
                          Resolve Nudge
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SURROUNDING CONTAINER
// ─────────────────────────────────────────────────────────────────────────────
export default function FeedbackPage() {
  const [activeTab, setActiveTab] = useState('setup'); // setup | analytics
  const [selectedRating, setSelectedRating] = useState(null);
  const [config, setConfig] = useState({
    brandName: 'BAKERY',
    question: 'How was your dining/checkout experience today?',
    ratingStyle: 'emoji',    // emoji | number | star
    bonusPts: 100,
    positiveFollowUp: 'Awesome! What did you love most about our service?',
    negativeFollowUp: 'Sorry to hear that. Tell us what we can improve?',
  });

  return (
    <div className="space-y-6 pb-12 animate-slide-up">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <div className="flex items-center gap-1.5 mb-1 text-indigo-400">
            <StarIcon className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">NPS & Experience Tracker</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Customer Feedback</h1>
          <p className="text-xs text-slate-400">Design customer satisfaction survey flows, award loyalty points, and track NPS scores.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-900 pb-4 flex-wrap">
        {[
          { id: 'setup', label: 'Survey Setup & Live Preview' },
          { id: 'analytics', label: 'NPS Analytics Dashboard' },
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                : 'bg-slate-900 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Tab Content */}
      <div className="mt-4">
        {activeTab === 'setup' && (
          <div className="rounded-3xl border border-slate-900 p-6 md:p-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left — Live Smartphone preview */}
              <div className="lg:col-span-5 flex justify-center py-6">
                <FeedbackCardPreview
                  brandName={config.brandName}
                  question={config.question}
                  ratingStyle={config.ratingStyle}
                  bonusPts={config.bonusPts}
                  selectedRating={selectedRating}
                  onRatingSelect={setSelectedRating}
                />
              </div>

              {/* Right — Config Form */}
              <div className="lg:col-span-7 bg-slate-900/50 border border-slate-850/50 backdrop-blur rounded-3xl p-6 md:p-8 shadow-2xl">
                <FeedbackConfigPanel config={config} onChange={setConfig} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <FeedbackAnalytics />
        )}
      </div>

    </div>
  );
}
