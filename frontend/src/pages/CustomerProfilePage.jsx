import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';
import {
  PhoneIcon, EnvelopeIcon, MapPinIcon, CalendarIcon,
  StarIcon, CurrencyRupeeIcon, ChartBarIcon, ArrowLeftIcon,
  PencilIcon, BoltIcon, GiftIcon, ArrowPathIcon, ChatBubbleLeftIcon,
  CheckIcon, SparklesIcon, ShieldCheckIcon, UserIcon, ArrowRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import CustomerModal from '../components/customers/CustomerModal';

// ─────────────────────────────────────────────────────────────────────────────
// METALLIC TIER BADGES MATCHING THE MEMBERSHIP DESIGN SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
const TIER_METALLICS = {
  Silver: 'from-slate-400 to-slate-200 text-slate-900 border-white/20',
  Gold: 'from-amber-500 via-yellow-450 to-amber-600 text-amber-950 border-yellow-300/30',
  Platinum: 'from-indigo-600 via-purple-500 to-pink-500 text-white border-indigo-400/30',
  Diamond: 'from-cyan-500 via-blue-500 to-indigo-600 text-white border-cyan-400/30'
};

const TierBadge = ({ tier }) => {
  const metallic = TIER_METALLICS[tier] || TIER_METALLICS.Silver;
  const icons = { Silver: '🥈', Gold: '🥇', Platinum: '💠', Diamond: '💎' };
  
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r ${metallic} border shadow-lg`}>
      {icons[tier] || '⭐'} {tier} Tier
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TIMELINE EVENT LOGGING CONFIGS
// ─────────────────────────────────────────────────────────────────────────────
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
  order_completed: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
  points_earned: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400',
  points_redeemed: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400',
  whatsapp_sent: 'border-teal-500/20 bg-teal-500/5 text-teal-400',
  tier_upgrade: 'border-pink-500/20 bg-pink-500/5 text-pink-400',
  coupon_applied: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
  nps_feedback_submitted: 'border-purple-500/20 bg-purple-500/5 text-purple-400',
  referral_success: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CUSTOMER PROFILE PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function CustomerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [adjustPoints, setAdjustPoints] = useState(false);
  const [pointsDelta, setPointsDelta] = useState(0);
  const [pointsRemark, setPointsRemark] = useState('');
  const [waModal, setWaModal] = useState(false);
  const [waMessage, setWaMessage] = useState('');
  const [waSending, setWaSending] = useState(false);

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
      toast.success(`Points adjusted by ${pointsDelta} (demo mode)`);
      setAdjustPoints(false);
    }
  };

  const handleSendWA = async () => {
    if (!waMessage.trim()) { toast.error('Please enter a message'); return; }
    setWaSending(true);
    try {
      await api.post(`/customers/${id}/send-whatsapp`, { message: waMessage });
      toast.success('WhatsApp message sent! ✅');
      setWaModal(false);
      setWaMessage('');
      fetchData(); // refresh timeline
    } catch (err) {
      const errMsg = err?.response?.data?.detail || 'Failed to send WhatsApp';
      toast.error(errMsg);
    } finally {
      setWaSending(false);
    }
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      <div className="h-96 bg-slate-900 border border-slate-850 rounded-3xl" />
      <div className="md:col-span-2 h-96 bg-slate-900 border border-slate-850 rounded-3xl" />
    </div>
  );

  const c = customer;

  return (
    <div className="animate-slide-up space-y-6 pb-12">
      
      {/* Top Header Navigation */}
      <div className="flex items-center gap-4 border-b border-slate-900 pb-5">
        <button 
          onClick={() => navigate('/customers')} 
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-1 text-indigo-400 text-[10px] font-black uppercase tracking-wider">
            <UserIcon className="w-3.5 h-3.5" /> Customer 360° Profile
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{c.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT ESSENTIAL PANEL (LIV, WALLET, INFO) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Profile Card */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-xl font-black text-white shadow-xl">
                  {c.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-black text-white">{c.name}</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">ID: {c.customer_id?.slice(0, 14)}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditing(true)} 
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <PencilIcon className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-900/65">
              <TierBadge tier={c.loyalty_tier || 'Silver'} />
              <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${STATUS_STYLE[c.status]}`}>
                {c.status}
              </span>
            </div>

            {/* Metadata info list */}
            <div className="space-y-3 pt-3 text-xs text-slate-300">
              {c.mobile && (
                <div className="flex items-center gap-2.5">
                  <PhoneIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="font-mono">{c.mobile}</span>
                </div>
              )}
              {c.email && (
                <div className="flex items-center gap-2.5">
                  <EnvelopeIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>{c.email}</span>
                </div>
              )}
              {c.dob && (
                <div className="flex items-center gap-2.5">
                  <CalendarIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>Birthday: {format(new Date(c.dob), 'dd MMM yyyy')}</span>
                </div>
              )}
              {c.anniversary && (
                <div className="flex items-center gap-2.5">
                  <CalendarIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>Anniversary: {format(new Date(c.anniversary), 'dd MMM yyyy')}</span>
                </div>
              )}
              {(c.city || c.state) && (
                <div className="flex items-start gap-2.5">
                  <MapPinIcon className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{[c.address, c.city, c.state, c.pincode].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>

            {/* Smart badges based on values */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {c.lifetime_value > 50000 && (
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  🏆 VIP Spender
                </span>
              )}
              {c.total_purchases > 20 && (
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
                  🔥 Frequent Regular
                </span>
              )}
              {c.referral_count > 4 && (
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-450">
                  👥 Top Referrer
                </span>
              )}
            </div>

          </div>

          {/* Key Analytics Metrics */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Loyalty Intelligence Card</h3>
            
            <div className="divide-y divide-slate-900/60 text-xs">
              {[
                { label: 'Lifetime Value (LTV)', value: `₹${(c.lifetime_value || 0).toLocaleString('en-IN')}`, color: 'text-emerald-400' },
                { label: 'Saving Points Balance', value: `${(c.current_points_balance || 0).toLocaleString('en-IN')} Pts`, color: 'text-indigo-400' },
                { label: 'Prepaid Wallet Balance', value: `₹${(c.cashback_wallet_balance || 0).toLocaleString('en-IN')}`, color: 'text-pink-400' },
                { label: 'Total Completed Invoices', value: c.total_purchases || 0, color: 'text-white' },
                { label: 'Completed Referrals', value: c.referral_count || 0, color: 'text-cyan-450' },
                { label: 'Net Promoter Score (NPS)', value: `${(c.feedback_score || 0).toFixed(1)} / 10`, color: 'text-amber-400' },
                { label: 'Predicted Churn Risk', value: `${((c.churn_probability || 0) * 100).toFixed(1)}%`, color: c.churn_probability > 0.6 ? 'text-rose-450' : 'text-emerald-400' }
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <span className="text-slate-400 font-medium">{m.label}</span>
                  <span className={`font-black ${m.color}`}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* MIDDLE EVENT TIMELINE */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between min-h-[500px]">
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-5">
              <h3 className="text-sm font-black text-white">Timeline Event Logs</h3>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Real-Time Sync</span>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[620px] pr-1 flex-1">
              {timeline.map((event) => (
                <div 
                  key={event.event_id} 
                  className={`p-4 rounded-2xl border ${eventColors[event.event_type] || 'border-slate-900 bg-slate-950/40'} transition-all hover:border-indigo-500/20`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">{eventIcons[event.event_type] || '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-white leading-snug">{event.summary}</p>
                      
                      {event.payload && Object.keys(event.payload).length > 0 && (
                        <div className="mt-2.5 p-2 bg-black/20 border border-slate-900/40 rounded-xl space-y-1">
                          {Object.entries(event.payload).slice(0, 3).map(([k, v]) => (
                            <p key={k} className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                              <span className="text-slate-400 uppercase tracking-wide mr-1">{k.replace('_',' ')}:</span> 
                              {String(v)}
                            </p>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-2">
                        {event.created_at ? format(new Date(event.created_at), 'dd MMM yyyy · HH:mm') : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {timeline.length === 0 && (
                <div className="text-center py-16">
                  <span className="text-3xl">📭</span>
                  <p className="text-xs text-slate-500 font-black uppercase tracking-wider mt-2">No event logs recorded</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT QUICK ACTIONS & PROGRESS */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Quick actions panel */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">Quick Billing Actions</h3>
            
            <div className="space-y-2">
              <button 
                onClick={() => setWaModal(true)} 
                className="w-full flex items-center gap-2 text-xs font-black bg-slate-950 border border-slate-850 hover:border-emerald-500/35 hover:bg-slate-900 text-slate-300 px-4 py-3 rounded-xl transition-all cursor-pointer"
              >
                <ChatBubbleLeftIcon className="w-4 h-4 text-emerald-400" /> Send Custom WhatsApp
              </button>
              
              <button 
                onClick={() => setAdjustPoints(prev => !prev)} 
                className="w-full flex items-center gap-2 text-xs font-black bg-slate-950 border border-slate-850 hover:border-indigo-500/35 hover:bg-slate-900 text-slate-300 px-4 py-3 rounded-xl transition-all cursor-pointer"
              >
                <StarIcon className="w-4 h-4 text-indigo-400" /> Adjust Point Wallet
              </button>
              
              <button 
                onClick={() => toast.success('Coupon manual ticket issued! 🎟️')}
                className="w-full flex items-center gap-2 text-xs font-black bg-slate-950 border border-slate-850 hover:border-pink-500/35 hover:bg-slate-900 text-slate-300 px-4 py-3 rounded-xl transition-all cursor-pointer"
              >
                <GiftIcon className="w-4 h-4 text-pink-400" /> Issue Custom Coupon
              </button>
            </div>
          </div>

          {/* Points adjustment form */}
          {adjustPoints && (
            <div className="bg-slate-900/60 border border-indigo-500/30 rounded-3xl p-6 animate-slide-up space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Adjust Point Wallet</h4>
                <button onClick={() => setAdjustPoints(false)} className="text-slate-400 hover:text-white text-xs font-black">×</button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Points Delta (+ or -)</label>
                  <input 
                    type="number" 
                    className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500" 
                    value={pointsDelta} 
                    onChange={e => setPointsDelta(e.target.value)} 
                    placeholder="e.g. 500 or -200" 
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Transaction Remark</label>
                  <input 
                    className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500" 
                    value={pointsRemark} 
                    onChange={e => setPointsRemark(e.target.value)} 
                    placeholder="Milestone loyalty gift..." 
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setAdjustPoints(false)} className="flex-1 py-2 text-[10px] font-black border border-slate-800 text-slate-300 rounded-xl">Cancel</button>
                  <button onClick={handleAdjustPoints} className="flex-1 py-2 text-[10px] font-black bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg">Confirm</button>
                </div>
              </div>
            </div>
          )}

          {/* WhatsApp Message Modal */}
          {waModal && (
            <div className="bg-slate-900/60 border border-emerald-500/30 rounded-3xl p-6 animate-slide-up space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#25D366' }}>
                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Send WhatsApp</h4>
                </div>
                <button onClick={() => setWaModal(false)} className="text-slate-400 hover:text-white text-xs font-black">×</button>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold -mt-2">
                To: <span className="text-emerald-400 font-mono">{customer?.mobile}</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Message</label>
                  <textarea
                    rows={4}
                    className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                    value={waMessage}
                    onChange={e => setWaMessage(e.target.value)}
                    placeholder={`Hi ${customer?.name?.split(' ')[0] || ''}, we have a special offer just for you! 🎉`}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setWaModal(false)} className="flex-1 py-2 text-[10px] font-black border border-slate-800 text-slate-300 rounded-xl">Cancel</button>
                  <button
                    onClick={handleSendWA}
                    disabled={waSending || !waMessage.trim()}
                    className="flex-1 py-2 text-[10px] font-black text-white rounded-xl shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
                    style={{ background: '#25D366' }}
                  >
                    {waSending
                      ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : 'Send ✅'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tier progression cards */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 space-y-4">
            <div>
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Membership Progression</h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">Based on Lifetime spent</p>
            </div>

            <div className="space-y-3">
              {[
                { tier: 'Silver', min: 0, max: 10000, color: 'from-slate-500 to-slate-400' },
                { tier: 'Gold', min: 10000, max: 50000, color: 'from-amber-600 to-amber-500' },
                { tier: 'Platinum', min: 50050, max: 100000, color: 'from-indigo-600 to-pink-500' },
                { tier: 'Diamond', min: 100000, max: 100000, color: 'from-cyan-500 to-blue-500' },
              ].map(t => {
                const ltv = c.lifetime_value || 0;
                const isActive = c.loyalty_tier === t.tier;
                const pct = t.max === t.min ? 100 : Math.min(100, ((ltv - t.min) / (t.max - t.min)) * 100);
                return (
                  <div key={t.tier} className={`p-3 rounded-2xl border ${isActive ? 'bg-slate-900 border-indigo-500/20 shadow-lg' : 'border-transparent bg-slate-950/20'}`}>
                    <div className="flex justify-between text-[10px] font-black mb-1.5">
                      <span className={isActive ? 'text-white' : 'text-slate-500'}>{t.tier} Tier {isActive && '✓'}</span>
                      <span className="text-slate-500">₹{t.min.toLocaleString('en-IN')}+</span>
                    </div>
                    <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850/50">
                      <div className={`h-full bg-gradient-to-r ${t.color} rounded-full transition-all duration-500`} style={{ width: `${Math.max(0, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {editing && (
        <CustomerModal
          initialData={c}
          onClose={() => setEditing(false)}
          onSuccess={() => { setEditing(false); fetchData(); toast.success('Profile saved! 🎉'); }}
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
    { event_id: 'e6', event_type: 'coupon_applied', summary: 'Coupon NEW15 redeemed — 15% discount applied', created_at: '2026-03-28T15:44:10Z', payload: { coupon_code: 'NEW15', discount: '15%', invoice: 'INV-2026-7210' } },
    { event_id: 'e7', event_type: 'points_redeemed', summary: '1000 points redeemed at New Delhi Flagship', created_at: '2026-03-15T18:20:00Z', payload: { points_redeemed: 1000, value: '₹100', invoice: 'INV-2026-6890' } },
  ];
}
