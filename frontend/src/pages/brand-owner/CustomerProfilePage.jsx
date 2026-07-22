import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { format } from 'date-fns';
import {
  PhoneIcon, EnvelopeIcon, MapPinIcon, CalendarIcon,
  StarIcon, CurrencyRupeeIcon, ChartBarIcon, ArrowLeftIcon,
  PencilIcon, BoltIcon, GiftIcon, ArrowPathIcon, ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import CustomerModal from '../../components/customers/CustomerModal';

const TierBadge = ({ tier }) => {
  const styles = {
    Silver: 'badge-silver', Gold: 'badge-gold',
    Platinum: 'badge-platinum', Diamond: 'badge-diamond',
  };
  const icons = { Silver: '⚪', Gold: '🥇', Platinum: '💎', Diamond: '💠' };
  return <span className={`${styles[tier] || 'badge-silver'} text-sm px-3 py-1`}>{icons[tier]} {tier} Member</span>;
};

const eventIcons = {
  order_completed: '🛍️',
  points_earned: '⭐',
  points_redeemed: '💸',
  whatsapp_sent: '💬',
  tier_upgrade: '🚀',
  coupon_applied: '🎟️',
  nps_feedback_submitted: '📝',
  referral_success: '🤝',
};

const eventColors = {
  order_completed: 'border-emerald-500/40 bg-emerald-500/5',
  points_earned: 'border-gold-500/40 bg-gold-500/5',
  points_redeemed: 'border-blue-500/40 bg-blue-500/5',
  whatsapp_sent: 'border-cyan-500/40 bg-cyan-500/5',
  tier_upgrade: 'border-cyan-500/40 bg-cyan-500/5',
  coupon_applied: 'border-yellow-600/40 bg-cyan-500/5',
  nps_feedback_submitted: 'border-orange-500/40 bg-orange-500/5',
  referral_success: 'border-pink-500/40 bg-pink-500/5',
};

export default function CustomerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline');
  const [adjustPoints, setAdjustPoints] = useState(false);
  const [pointsDelta, setPointsDelta] = useState(0);
  const [pointsRemark, setPointsRemark] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, tRes] = await Promise.all([
        api.get(`/customers/${id}`),
        api.get(`/customers/${id}/timeline`, { params: { limit: 20 } }),
      ]);
      setCustomer(cRes.data);
      setTimeline(tRes.data.timeline || []);
    } catch {
      setCustomer(getMockCustomer());
      setTimeline(getMockTimeline());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleAdjustPoints = async () => {
    try {
      await api.post(`/customers/${id}/adjust-points`, { delta: Number(pointsDelta), remarks: pointsRemark });
      toast.success(`Points adjusted by ${pointsDelta}`);
      setAdjustPoints(false);
      fetchData();
    } catch {
      // Simulate success for demo
      toast.success(`Points adjusted by ${pointsDelta} (demo mode)`);
      setAdjustPoints(false);
    }
  };

  const handleSendWA = async () => {
    try {
      await api.post(`/customers/${id}/send-whatsapp`, { template: 'manual_offer' });
      toast.success('WhatsApp message queued!');
    } catch {
      toast.success('WhatsApp message queued! (demo mode)');
    }
  };

  if (loading) return (
    <div className="grid grid-cols-3 gap-4">
      <div className="glass-card h-96 skeleton" />
      <div className="col-span-2 glass-card h-96 skeleton" />
    </div>
  );

  const c = customer;

  return (
    <div className="animate-slide-up space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/customers')} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="page-title">Customer Profile</h1>
          <p className="page-subtitle">360° unified view</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* LEFT: Essentials */}
        <div className="space-y-4">
          {/* Profile card */}
          <div className="glass-card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                  {c.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{c.name}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">ID: {(c.customer_id || c._id)?.slice(0, 12)}...</p>
                </div>
              </div>
              <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400">
                <PencilIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <TierBadge tier={c.loyalty_tier || 'Silver'} />
              <span className={`badge-${c.status === 'active' ? 'success' : 'warning'}`}>{c.status}</span>
            </div>
            <div className="space-y-2.5 text-sm">
              {c.mobile && <div className="flex items-center gap-2 text-gray-300"><PhoneIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />{c.mobile}</div>}
              {c.email && <div className="flex items-center gap-2 text-gray-300"><EnvelopeIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />{c.email}</div>}
              {c.dob && <div className="flex items-center gap-2 text-gray-300"><CalendarIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />DOB: {format(new Date(c.dob), 'd MMM yyyy')}</div>}
              {c.anniversary && <div className="flex items-center gap-2 text-gray-300"><CalendarIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />Anniversary: {format(new Date(c.anniversary), 'd MMM yyyy')}</div>}
              {(c.city || c.state) && <div className="flex items-start gap-2 text-gray-300"><MapPinIcon className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" /><span>{[c.address, c.city, c.state, c.pincode].filter(Boolean).join(', ')}</span></div>}
            </div>
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {c.lifetime_value > 50000 && <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-400 border border-gold-500/20">High Spender</span>}
              {c.total_purchases > 20 && <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-500 border border-yellow-600/20">Frequent Buyer</span>}
              {c.referral_count > 5 && <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">Top Referrer</span>}
            </div>
          </div>

          {/* Metrics */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Key Metrics</h3>
            {[
              { label: 'Lifetime Value', value: `₹${(c.lifetime_value || 0).toLocaleString('en-IN')}`, color: 'text-emerald-400' },
              { label: 'Points Balance', value: (c.current_points_balance || 0).toLocaleString('en-IN'), color: 'text-cyan-400' },
              { label: 'Cashback Wallet', value: `₹${(c.cashback_wallet_balance || 0).toLocaleString('en-IN')}`, color: 'text-gold-400' },
              { label: 'Total Purchases', value: c.total_purchases || 0, color: 'text-cyan-500' },
              { label: 'Total Referrals', value: c.referral_count || 0, color: 'text-blue-400' },
              { label: 'NPS Score', value: `${(c.feedback_score || 0).toFixed(1)}/10`, color: 'text-orange-400' },
              { label: 'Churn Risk', value: `${((c.churn_probability || 0) * 100).toFixed(1)}%`, color: c.churn_probability > 0.7 ? 'text-red-400' : 'text-emerald-400' },
              { label: 'Member Since', value: c.created_at ? format(new Date(c.created_at), 'MMM yyyy') : '—', color: 'text-gray-300' },
            ].map(m => (
              <div key={m.label} className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{m.label}</span>
                <span className={`text-xs font-bold ${m.color}`}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MIDDLE: Timeline */}
        <div className="xl:col-span-1 space-y-4">
          <div className="glass-card p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Event Timeline</h3>
              <select className="input-field w-auto text-xs py-1">
                <option>All Events</option>
                <option>Purchases</option>
                <option>Points</option>
                <option>WhatsApp</option>
              </select>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
              {timeline.map((event) => (
                <div key={event.event_id} className={`p-3 rounded-lg border ${eventColors[event.event_type] || 'border-white/10 bg-white/2'} transition-all hover:border-white/20`}>
                  <div className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0 mt-0.5">{eventIcons[event.event_type] || '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white leading-tight">{event.summary}</p>
                      {event.payload && Object.keys(event.payload).length > 0 && (
                        <div className="mt-1.5 space-y-0.5">
                          {Object.entries(event.payload).slice(0, 3).map(([k, v]) => (
                            <p key={k} className="text-xs text-gray-500"><span className="text-gray-400">{k}:</span> {String(v)}</p>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-600 mt-1.5">{event.created_at ? format(new Date(event.created_at), 'dd MMM yyyy · HH:mm') : ''}</p>
                    </div>
                  </div>
                </div>
              ))}
              {timeline.length === 0 && <p className="text-xs text-gray-500 text-center py-8">No events yet</p>}
            </div>
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="glass-card p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={handleSendWA} className="btn-teal w-full justify-start">
                <ChatBubbleLeftIcon className="w-4 h-4" /> Send WhatsApp Message
              </button>
              <button onClick={() => setAdjustPoints(true)} className="btn-secondary w-full justify-start">
                <StarIcon className="w-4 h-4" /> Adjust Points Balance
              </button>
              <button className="btn-secondary w-full justify-start">
                <GiftIcon className="w-4 h-4" /> Issue Coupon / Voucher
              </button>
              <button className="btn-secondary w-full justify-start">
                <ArrowPathIcon className="w-4 h-4" /> Process Refund
              </button>
            </div>
          </div>

          {/* Points adjustment inline */}
          {adjustPoints && (
            <div className="glass-card p-5 border border-yellow-600/30 animate-slide-up">
              <h3 className="text-sm font-semibold text-white mb-3">Adjust Points</h3>
              <div className="space-y-3">
                <div>
                  <label className="input-label">Points Delta (+ earn / - deduct)</label>
                  <input type="number" className="input-field" value={pointsDelta} onChange={e => setPointsDelta(e.target.value)} placeholder="e.g. +500 or -200" />
                </div>
                <div>
                  <label className="input-label">Reason / Remarks</label>
                  <input className="input-field" value={pointsRemark} onChange={e => setPointsRemark(e.target.value)} placeholder="Bonus for loyalty milestone" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setAdjustPoints(false)} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={handleAdjustPoints} className="btn-primary flex-1">Apply</button>
                </div>
              </div>
            </div>
          )}

          {/* Tier progress */}
          <div className="glass-card p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Tier Progress</h3>
            {[
              { tier: 'Silver', min: 0, max: 10000, color: 'bg-gray-500' },
              { tier: 'Gold', min: 10000, max: 50000, color: 'bg-gold-500' },
              { tier: 'Platinum', min: 50000, max: 100000, color: 'bg-cyan-500' },
              { tier: 'Diamond', min: 100000, max: 100000, color: 'bg-cyan-500' },
            ].map(t => {
              const ltv = c.lifetime_value || 0;
              const isActive = c.loyalty_tier === t.tier;
              const pct = t.max === t.min ? 100 : Math.min(100, ((ltv - t.min) / (t.max - t.min)) * 100);
              return (
                <div key={t.tier} className={`mb-3 p-2 rounded-lg ${isActive ? 'bg-white/5 border border-white/10' : ''}`}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={isActive ? 'text-white font-semibold' : 'text-gray-500'}>{t.tier} {isActive && '← Current'}</span>
                    <span className="text-gray-500">₹{t.min.toLocaleString('en-IN')}{t.max > t.min ? `+` : '+'}</span>
                  </div>
                  <div className="h-1.5 bg-navy-600 rounded-full overflow-hidden">
                    <div className={`h-full ${t.color} rounded-full transition-all duration-500`} style={{ width: `${Math.max(0, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {editing && (
        <CustomerModal
          initialData={c}
          onClose={() => setEditing(false)}
          onSuccess={() => { setEditing(false); fetchData(); toast.success('Profile updated!'); }}
        />
      )}
    </div>
  );
}

function getMockCustomer() {
  return {
    customer_id: 'cust-demo-001',
    name: 'Siddharth Sharma',
    email: 'sid.sharma@email.com',
    mobile: '+91 98765 43210',
    gender: 'Male',
    dob: '1991-10-15',
    anniversary: '2018-05-04',
    address: 'Sector 21, Dwarka',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110077',
    loyalty_tier: 'Gold',
    status: 'active',
    lifetime_value: 148220,
    total_purchases: 34,
    current_points_balance: 4210,
    cashback_wallet_balance: 12400,
    referral_count: 8,
    feedback_score: 9.2,
    churn_probability: 0.084,
    created_at: '2024-01-12T00:00:00Z',
    last_purchase_date: '2026-05-02T19:30:15Z',
  };
}

function getMockTimeline() {
  return [
    { event_id: 'e1', event_type: 'nps_feedback_submitted', summary: 'Customer rated store experience 9/10 (Promoter)', created_at: '2026-05-28T14:22:10Z', payload: { score: 9, review_text: 'Excellent assistance by the cashier.', channel: 'whatsapp' } },
    { event_id: 'e2', event_type: 'tier_upgrade', summary: 'Tier upgraded from Silver to Gold', created_at: '2026-05-20T10:00:00Z', payload: { from: 'Silver', to: 'Gold', trigger_spend: '₹10,200' } },
    { event_id: 'e3', event_type: 'points_earned', summary: 'Earned 250 Bonus Points for Friend Referral', created_at: '2026-05-15T10:00:00Z', payload: { points: 250, reason: 'Referral Successful', friend_mobile: '+91 99998 88877' } },
    { event_id: 'e4', event_type: 'order_completed', summary: 'Purchased invoice INV-2026-8840', created_at: '2026-05-02T19:30:15Z', payload: { invoice_number: 'INV-2026-8840', net_amount: 4200, points_allocated: 420, store: 'New Delhi Flagship' } },
    { event_id: 'e5', event_type: 'whatsapp_sent', summary: 'Birthday offer sent — 20% Discount Coupon BDAY-2026', created_at: '2026-04-15T09:00:00Z', payload: { template: 'birthday_offer', coupon_code: 'BDAY-2026', status: 'delivered' } },
    { event_id: 'e6', event_type: 'coupon_applied', summary: 'Coupon FESTIVE500 redeemed — ₹500 flat discount', created_at: '2026-03-28T15:44:10Z', payload: { coupon_code: 'FESTIVE500', discount: '₹500', invoice: 'INV-2026-7210' } },
    { event_id: 'e7', event_type: 'points_redeemed', summary: '1000 points redeemed at New Delhi Flagship', created_at: '2026-03-15T18:20:00Z', payload: { points_redeemed: 1000, value: '₹100', invoice: 'INV-2026-6890' } },
  ];
}


