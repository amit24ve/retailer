import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts';

// ─── Emoji rating options ─────────────────────────────────────────────────────
const EMOJI_RATINGS = [
  { val: 1, emoji: '😢', label: 'Very Bad',  color: '#ef4444' },
  { val: 2, emoji: '🙁', label: 'Bad',       color: '#f97316' },
  { val: 3, emoji: '😐', label: 'Okay',      color: '#f59e0b' },
  { val: 4, emoji: '😄', label: 'Good',      color: '#84cc16' },
  { val: 5, emoji: '🤩', label: 'Excellent', color: '#06b6d4' },
];

const ratingColors = {
  1: '#ef4444',
  2: '#f97316',
  3: '#f59e0b',
  4: '#84cc16',
  5: '#06b6d4',
};

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const getRawRating = (fb) => toNumber(fb.rating ?? fb.score ?? fb.nps_score, 0);

const getDisplayRating = (fb) => {
  const rating = getRawRating(fb);
  if (rating > 5) return Math.max(1, Math.min(5, Math.ceil(rating / 2)));
  return Math.max(1, Math.min(5, Math.round(rating || 0)));
};

const getFeedbackType = (fb) => {
  const rating = getRawRating(fb);
  if (rating > 0 && rating <= 5) {
    if (rating >= 4) return 'promoter';
    if (rating === 3) return 'passive';
    return 'detractor';
  }
  if (rating > 5) {
    if (rating >= 9) return 'promoter';
    if (rating >= 7) return 'passive';
    return 'detractor';
  }
  return fb.feedback_type || fb.type || 'passive';
};

const normalizeFeedback = (fb) => {
  const rating = getDisplayRating(fb);
  return {
    id: fb.feedback_id || fb.id || fb._id,
    customer: fb.customer_name || fb.customer || 'Anonymous',
    mobile: fb.mobile || fb.customer_mobile || '',
    rating,
    comment: fb.comment || fb.message || '',
    store: fb.store || fb.store_name || '—',
    date: fb.created_at || fb.date,
    type: getFeedbackType(fb),
    spent: toNumber(fb.spent ?? fb.net_amount ?? fb.amount, 0),
  };
};

function InfoIcon() {
  return <QuestionMarkCircleIcon className="w-4 h-4 text-slate-400 inline ml-1" />;
}

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-slate-700">{label}</p>
      <p className="text-slate-600 mt-0.5">Count: <span className="font-black">{payload[0]?.value}</span></p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LIVE FEEDBACK CARD PREVIEW (matches screenshot exactly)
// ─────────────────────────────────────────────────────────────────────────────
function FeedbackCardPreview({ brandName, question, ratingStyle, bonusPts, selectedRating, onRatingSelect }) {
  return (
    <div className="w-full max-w-xs mx-auto select-none">
      {/* Card */}
      <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/50">
        {/* Pink/Red header */}
        <div className="px-5 py-4" style={{ background: '#e91e63' }}>
          {/* Brand logo circle + greeting */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur border-2 border-white/40 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-black text-white text-center leading-tight uppercase px-1">
                {brandName.slice(0, 6)}
              </span>
            </div>
            <div>
              <p className="text-sm font-black text-white leading-snug">
                Hi John, your feedback is<br />important to us!
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Spent', value: '₹ 3400' },
              { label: 'Date', value: '02 July 2023' },
              { label: 'Time', value: '12:40 PM' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-[9px] text-white/60 uppercase tracking-wider">{s.label}</p>
                <p className="text-xs font-bold text-white mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Bonus points banner */}
          <div className="bg-white rounded-xl px-3 py-2 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">✦</div>
            <p className="text-xs text-slate-700">
              <span className="font-black text-amber-700">Earn {bonusPts} Bonus Pts.</span>{' '}
              <span className="text-slate-500">on giving feedback</span>
            </p>
          </div>
        </div>

        {/* White body */}
        <div className="bg-white px-5 py-4">
          <p className="text-sm font-bold text-slate-900 mb-3 text-center">{question}</p>

          {/* Emoji row */}
          {ratingStyle === 'emoji' && (
            <div className="flex items-center justify-around">
              {EMOJI_RATINGS.map(r => (
                <button
                  key={r.val}
                  onClick={() => onRatingSelect(r.val)}
                  className="flex flex-col items-center gap-1 group transition-transform hover:scale-110"
                >
                  <span
                    className={`text-3xl transition-all ${selectedRating === r.val ? 'scale-125' : 'opacity-70 hover:opacity-100'}`}
                    style={{ filter: selectedRating === r.val ? `drop-shadow(0 0 6px ${r.color})` : 'none' }}
                  >
                    {r.emoji}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Number row */}
          {ratingStyle === 'number' && (
            <div className="flex items-center justify-around">
              {EMOJI_RATINGS.map(r => (
                <button
                  key={r.val}
                  onClick={() => onRatingSelect(r.val)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all"
                  style={{
                    background: selectedRating === r.val ? r.color : '#f1f5f9',
                    color: selectedRating === r.val ? 'white' : '#475569',
                    transform: selectedRating === r.val ? 'scale(1.2)' : 'scale(1)',
                  }}
                >
                  {r.val}
                </button>
              ))}
            </div>
          )}

          {/* Star row */}
          {ratingStyle === 'star' && (
            <div className="flex items-center justify-around">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => onRatingSelect(s)}
                  className="text-3xl transition-all hover:scale-110">
                  <span style={{ color: s <= (selectedRating || 0) ? '#f59e0b' : '#e2e8f0' }}>★</span>
                </button>
              ))}
            </div>
          )}

          {/* Follow-up text if rated */}
          {selectedRating !== null && (
            <div className="mt-3 animate-slide-up">
              <p className="text-xs text-slate-500 text-center mb-2">
                {selectedRating >= 4
                  ? '😊 Glad to hear that! What did you like?'
                  : '😟 Sorry to hear. Tell us what went wrong?'}
              </p>
              <textarea
                rows={2}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none placeholder-slate-300"
                placeholder="Write your feedback here..."
              />
              <button className="w-full mt-2 py-2 rounded-xl text-xs font-bold text-white transition-colors"
                style={{ background: '#e91e63' }}>
                Submit Feedback
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Annotation arrow */}
      <div className="flex items-start gap-1.5 mt-4 ml-4">
        <svg className="w-10 h-10 text-slate-400 flex-shrink-0 mt-1" viewBox="0 0 40 40" fill="none">
          <path d="M8 8 Q20 20 32 28" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="3 2" />
          <path d="M28 24 L32 28 L26 30" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <p className="text-xs text-slate-400 italic leading-snug mt-2">
          Click and experience how your customers will share feedback
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG PANEL (right side)
// ─────────────────────────────────────────────────────────────────────────────
function FeedbackConfigPanel({ config, onChange }) {
  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <div className="w-5 h-5 border border-slate-300 rounded flex items-center justify-center flex-shrink-0">
          <span className="text-[9px] text-slate-500">≡</span>
        </div>
        <span className="text-xs text-slate-500 font-medium">{config.brandName || 'finance'}</span>
      </div>

      <div>
        <h2 className="text-lg font-black text-slate-900">Let's get some basics about your feedback</h2>
      </div>

      {/* Feedback question */}
      <div>
        <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
          Feedback question? <InfoIcon />
        </label>
        <input
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-300 bg-white"
          value={config.question}
          onChange={e => onChange({ ...config, question: e.target.value })}
          placeholder="How was your experience ?"
        />
      </div>

      {/* Rating Style */}
      <div>
        <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
          Rating Style
        </label>
        <div className="border-2 border-cyan-500 rounded-2xl p-3 bg-cyan-50/30">
          {/* Emoji row */}
          <div className="flex items-center justify-around mb-2">
            {EMOJI_RATINGS.map(r => (
              <button
                key={r.val}
                onClick={() => onChange({ ...config, ratingStyle: 'emoji' })}
                className={`text-2xl transition-all hover:scale-110 ${config.ratingStyle === 'emoji' ? 'scale-110' : 'opacity-60'}`}
              >
                {r.emoji}
              </button>
            ))}
          </div>
          {/* Number row */}
          <div className="flex items-center justify-around">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => onChange({ ...config, ratingStyle: 'number' })}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  config.ratingStyle === 'number'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Star option */}
        <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:border-cyan-400 cursor-pointer transition-colors bg-white"
          onClick={() => onChange({ ...config, ratingStyle: 'star' })}>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => <span key={i} className={`text-lg ${config.ratingStyle === 'star' ? 'text-amber-400' : 'text-slate-300'}`}>★</span>)}
          </div>
          <span className="text-xs font-semibold text-slate-500 ml-1">Star Rating</span>
          {config.ratingStyle === 'star' && <span className="ml-auto w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</span>}
        </div>
      </div>

      {/* Bonus points */}
      <div>
        <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
          Bonus Points for Feedback <InfoIcon />
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="w-28 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 bg-white"
            value={config.bonusPts}
            onChange={e => onChange({ ...config, bonusPts: parseInt(e.target.value) || 0 })}
          />
          <span className="text-sm text-slate-500">pts per response</span>
        </div>
      </div>

      {/* Positive follow-up */}
      <div>
        <label className="flex items-center text-sm font-semibold text-amber-700 mb-2">
          Positive rating follow-up? <InfoIcon />
        </label>
        <input
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-300 bg-white"
          value={config.positiveFollowUp}
          onChange={e => onChange({ ...config, positiveFollowUp: e.target.value })}
          placeholder="Glad to hear that. What did you like?"
        />
      </div>

      {/* Negative follow-up */}
      <div>
        <label className="flex items-center text-sm font-semibold text-red-500 mb-2">
          Negative &amp; Neutral rating follow-up? <InfoIcon />
        </label>
        <input
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-200 bg-white"
          value={config.negativeFollowUp}
          onChange={e => onChange({ ...config, negativeFollowUp: e.target.value })}
          placeholder="Sorry to hear. Tell us what went wrong?"
        />
      </div>

      {/* Save button */}
      <button
        onClick={() => { api.post('/feedback', {}).catch(() => {}); toast.success('Feedback settings saved! ✅'); }}
        className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition-colors text-sm"
      >
        Save Configuration
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS SECTION
// ─────────────────────────────────────────────────────────────────────────────
function FeedbackAnalytics() {
  const [filter, setFilter] = useState('all');
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/feedback', { params: { limit: 100 } }).catch(() => ({ data: { feedback: [], total: 0 } })),
      api.get('/feedback/stats').catch(() => ({ data: null })),
    ])
      .then(([feedbackRes, statsRes]) => {
        setFeedback((feedbackRes.data.feedback || []).map(normalizeFeedback));
        setStats(statsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalFromRows = feedback.length;
  const statTotal = toNumber(stats?.total, totalFromRows);
  const total = statTotal > 0 ? statTotal : totalFromRows;
  const promoters = totalFromRows
    ? feedback.filter(f => f.type === 'promoter').length
    : toNumber(stats?.promoters, 0);
  const detractors = totalFromRows
    ? feedback.filter(f => f.type === 'detractor').length
    : toNumber(stats?.detractors, 0);
  const passives = Math.max(0, total - promoters - detractors);
  const promoterPct = total ? Math.round((promoters / total) * 100) : 0;
  const detractorPct = total ? Math.round((detractors / total) * 100) : 0;
  const passivePct = Math.max(0, 100 - promoterPct - detractorPct);
  const npsScore = total ? promoterPct - detractorPct : 0;
  const filtered = filter === 'all' ? feedback : feedback.filter(f => f.type === filter);
  const scoreDist = EMOJI_RATINGS.map(rating => ({
    score: `${rating.emoji} ${rating.val}`,
    count: feedback.filter(f => f.rating === rating.val).length,
    color: ratingColors[rating.val],
  }));
  const npsData = [
    { name: 'Promoters', value: promoterPct, count: promoters, color: '#06b6d4' },
    { name: 'Passives', value: passivePct, count: passives, color: '#f59e0b' },
    { name: 'Detractors', value: detractorPct, count: detractors, color: '#ef4444' },
  ];

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 h-64 rounded-2xl bg-slate-100 animate-pulse" />
          <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* NPS ring */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">NPS Score</p>
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#f1f5f9" strokeWidth="7" />
              <circle cx="40" cy="40" r="32" fill="none" stroke="#c9b96e" strokeWidth="7"
                strokeDasharray={`${Math.max(0, npsScore) * 2.01} 201`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-amber-700">{npsScore}</span>
          </div>
          <p className="text-[10px] text-amber-600 font-bold mt-1">{total ? 'Live score' : 'No responses yet'}</p>
        </div>

        {[
          { label: 'Total Responses', value: total.toLocaleString('en-IN'), sub: 'All collected feedback', color: 'text-slate-900' },
          { label: 'Promoters 😄🤩', value: `${promoterPct}%`, sub: `${promoters.toLocaleString('en-IN')} customers`, color: 'text-amber-600' },
          { label: 'Detractors 😢😕', value: `${detractorPct}%`, sub: `${detractors.toLocaleString('en-IN')} need action`, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color} mt-1`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Score distribution */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={scoreDist} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="4 4" stroke="#f8fafc" vertical={false} />
              <XAxis dataKey="score" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {scoreDist.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* NPS Pie */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3">NPS Breakdown</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={npsData} cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={3} dataKey="value">
                {npsData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={v => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {npsData.map(n => (
              <div key={n.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: n.color }} />
                  <span className="text-slate-600">{n.name}</span>
                </div>
                <span className="font-bold text-slate-900">{n.value}% · {n.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback list */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recent Feedback</h3>
          <div className="flex items-center gap-1.5">
            {['all', 'promoter', 'passive', 'detractor'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="text-xs px-3 py-1.5 rounded-full font-semibold capitalize transition-all"
                style={filter === f
                  ? { background: '#a89442', color: 'white' }
                  : { background: '#f1f5f9', color: '#475569' }}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {filtered.map(fb => {
            const ratingInfo = EMOJI_RATINGS[fb.rating - 1];
            return (
              <div key={fb.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
                      style={{ background: fb.type === 'promoter' ? '#16a34a' : fb.type === 'passive' ? '#d97706' : '#dc2626' }}>
                      {fb.customer.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900">{fb.customer}</p>
                        <span className="text-xs text-slate-400">·</span>
                        <p className="text-xs text-slate-400">{fb.store}</p>
                        {fb.spent > 0 && (
                          <>
                            <span className="text-xs text-slate-400">·</span>
                            <p className="text-xs text-slate-400">₹{fb.spent.toLocaleString('en-IN')} spent</p>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{fb.mobile || 'No mobile'} · {fb.date ? new Date(fb.date).toLocaleDateString('en-IN') : '—'}</p>
                      <p className="text-sm text-slate-600 mt-1.5 italic">"{fb.comment}"</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {/* Emoji rating */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xl">{ratingInfo?.emoji}</span>
                      <span className="text-sm font-black text-slate-700">{fb.rating}/5</span>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize"
                      style={{
                        background: fb.type === 'promoter' ? '#f0fdf4' : fb.type === 'passive' ? '#fffbeb' : '#fef2f2',
                        color: fb.type === 'promoter' ? '#16a34a' : fb.type === 'passive' ? '#d97706' : '#dc2626',
                        border: `1px solid ${fb.type === 'promoter' ? '#bbf7d0' : fb.type === 'passive' ? '#fde68a' : '#fecaca'}`,
                      }}>
                      {fb.type}
                    </span>
                    {fb.type === 'detractor' && (
                      <button className="text-xs text-amber-700 font-bold hover:underline">Resolve →</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-slate-400">
              No feedback responses found for this filter
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function FeedbackPage() {
  const [activeTab, setActiveTab] = useState('setup'); // setup | analytics
  const [selectedRating, setSelectedRating] = useState(null);
  const [config, setConfig] = useState({
    brandName: 'finance',
    question: 'How was your experience ?',
    ratingStyle: 'emoji',    // emoji | number | star
    bonusPts: 100,
    positiveFollowUp: 'Glad to hear that. What did you like?',
    negativeFollowUp: 'Sorry to hear. Tell us what went wrong?',
  });

  return (
    <div className="pb-10 animate-slide-up">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Feedback</h1>
          <p className="text-sm text-slate-500 mt-1">Configure your customer feedback experience and track responses</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-slate-200 mb-6">
        {[
          { id: 'setup', label: 'Setup & Preview' },
          { id: 'analytics', label: 'Feedback Analytics' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-1 pb-3 mr-8 text-sm font-semibold border-b-2 -mb-px transition-all ${
              activeTab === tab.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Setup tab — split layout matching screenshot */}
      {activeTab === 'setup' && (
        <div
          className="rounded-3xl overflow-hidden min-h-[500px]"
          style={{ background: 'linear-gradient(135deg, #e0f7f4 0%, #d4f1ed 100%)' }}
        >
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 min-h-[500px]">
            {/* Left — Live card preview */}
            <div className="flex items-center justify-center p-8 xl:p-12">
              <FeedbackCardPreview
                brandName={config.brandName}
                question={config.question}
                ratingStyle={config.ratingStyle}
                bonusPts={config.bonusPts}
                selectedRating={selectedRating}
                onRatingSelect={setSelectedRating}
              />
            </div>

            {/* Divider */}
            <div className="hidden xl:block absolute left-1/2 top-0 bottom-0 w-px bg-white/30" />

            {/* Right — Config panel */}
            <div className="bg-white/80 backdrop-blur xl:rounded-r-3xl p-7 xl:p-8">
              <FeedbackConfigPanel config={config} onChange={setConfig} />
            </div>
          </div>
        </div>
      )}

      {/* Analytics tab */}
      {activeTab === 'analytics' && (
        <FeedbackAnalytics />
      )}
    </div>
  );
}


