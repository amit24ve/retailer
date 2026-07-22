import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import {
  MagnifyingGlassIcon, PaperAirplaneIcon, Cog6ToothIcon,
  ChevronDownIcon, ArrowLeftIcon, CheckIcon,
  EllipsisHorizontalIcon, XMarkIcon,
} from '@heroicons/react/24/outline';

// ─── WA SVG ───────────────────────────────────────────────────────────────────
const WaIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// ─── Mock conversations ───────────────────────────────────────────────────────
const MOCK_CONVS = [
  {
    id: 'c1', name: 'Customer 1', mobile: '9xxxxxxx99', unread: 2, online: true, time: '2m ago',
    lastMsg: 'Thank you for the quick response!',
    messages: [
      { id: 1, from: 'customer', text: 'Hi, I wanted to ask about my loyalty points balance.', time: '10:30 AM' },
      { id: 2, from: 'agent', text: 'Hello! Your current balance is 4,820 points worth ₹482. How can I help further?', time: '10:31 AM' },
      { id: 3, from: 'customer', text: 'Can I redeem them at any store?', time: '10:33 AM' },
      { id: 4, from: 'agent', text: 'Yes! Redeem at any of our 24 stores across India or online.', time: '10:34 AM' },
      { id: 5, from: 'customer', text: 'Thank you for the quick response!', time: '10:35 AM' },
    ],
  },
  { id: 'c2', name: 'Customer 2', mobile: '9xxxxxxx99', unread: 1, online: false, time: '15m ago', lastMsg: 'When will my coupon expire?', messages: [{ id: 1, from: 'customer', text: 'When will my coupon expire?', time: '9:50 AM' }] },
  { id: 'c3', name: 'Customer 3', mobile: '9xxxxxxx99', unread: 0, online: false, time: '1h ago', lastMsg: 'I want to upgrade my membership.', messages: [{ id: 1, from: 'customer', text: 'I want to upgrade my membership.', time: 'Yesterday' }] },
  { id: 'c4', name: 'Customer 4', mobile: '9xxxxxxx99', unread: 0, online: true, time: '2h ago', lastMsg: 'Birthday offer received!', messages: [{ id: 1, from: 'agent', text: 'Happy Birthday! 🎂', time: '8:00 AM' }] },
  { id: 'c5', name: 'Customer 5', mobile: '9xxxxxxx99', unread: 0, online: false, time: '3h ago', lastMsg: 'Order delivered?', messages: [{ id: 1, from: 'customer', text: 'Has my order been delivered?', time: '7:00 AM' }] },
  { id: 'c6', name: 'Customer 6', mobile: '9xxxxxxx99', unread: 0, online: false, time: '5h ago', lastMsg: 'Points not credited.', messages: [{ id: 1, from: 'customer', text: 'My points were not credited.', time: 'Yesterday' }] },
  { id: 'c7', name: 'Customer 7', mobile: '9xxxxxxx99', unread: 0, online: false, time: 'Yesterday', lastMsg: 'Got the coupon thanks!', messages: [{ id: 1, from: 'customer', text: 'Got the coupon, thanks!', time: 'Yesterday' }] },
  { id: 'c8', name: 'Customer 8', mobile: '9xxxxxxx99', unread: 0, online: false, time: 'Yesterday', lastMsg: 'How do I refer a friend?', messages: [{ id: 1, from: 'customer', text: 'How do I refer a friend?', time: 'Yesterday' }] },
];

const QUICK_REPLIES = [
  'Your points balance is {points} pts worth ₹{value}.',
  'Your coupon {code} is valid until {date}.',
  'Thank you for contacting us! How can I help?',
  'Your order has been processed successfully.',
];

// ─── Avatar placeholder ───────────────────────────────────────────────────────
function Avatar({ name, size = 'md', online }) {
  const s = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-10 h-10' : 'w-9 h-9';
  return (
    <div className={`relative flex-shrink-0`}>
      <div className={`${s} rounded-full bg-slate-200 flex items-center justify-center`}>
        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
      {online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-cyan-500 rounded-full border-2 border-white" />}
    </div>
  );
}

// ─── Channel Settings panel (right panel — sidebar stays) ─────────────────────
function ChannelSettingsPanel({ onClose }) {
  const [tab, setTab] = useState('sms');
  const [smsHeader, setSmsHeader] = useState('mcuben');
  const [waHeader, setWaHeader] = useState('default');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setSaving(false);
    toast.success('Settings saved!');
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Header — same height as chat header for visual consistency */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors flex-shrink-0"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div>
          <p className="text-sm font-black text-slate-900">Channel Settings</p>
          <p className="text-xs text-slate-400">Configure SMS, WhatsApp & OTP</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Channel tab pills */}
        <div className="flex items-center gap-2 mb-5">
          {['sms', 'whatsapp', 'otp'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-5 py-2 rounded-full text-sm font-semibold border-2 capitalize transition-all"
              style={tab === t
                ? { background: '#a89442', color: 'white', borderColor: '#a89442' }
                : { background: 'white', color: '#475569', borderColor: '#e2e8f0' }}
            >
              {t === 'sms' ? 'SMS' : t === 'whatsapp' ? 'WhatsApp' : 'OTP'}
            </button>
          ))}
        </div>

        <div className="border-t-2 border-dashed border-slate-100 mb-5" />

        {/* SMS */}
        {tab === 'sms' && (
          <div className="max-w-xl space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h3 className="text-sm font-black text-slate-900 mb-1">Current Header (Sender ID)</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Customers will receive SMS Communication from default mCUBEN header or you can add your own
              </p>
              <div className="space-y-2.5">
                {[
                  { v: 'mcuben', label: 'mCuben', desc: 'Default — no setup needed' },
                  { v: 'custom', label: 'Add your own', desc: 'Use your brand as sender ID' },
                ].map(opt => (
                  <label
                    key={opt.v}
                    onClick={() => setSmsHeader(opt.v)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all"
                    style={{
                      borderColor: smsHeader === opt.v ? '#a89442' : '#e2e8f0',
                      background: smsHeader === opt.v ? '#f0fdfa' : 'white',
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: smsHeader === opt.v ? '#a89442' : '#cbd5e1', background: smsHeader === opt.v ? '#a89442' : 'white' }}
                    >
                      {smsHeader === opt.v && <CheckIcon className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{opt.label}</p>
                      <p className="text-xs text-slate-400">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              {smsHeader === 'custom' && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Custom Sender ID</label>
                  <input className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
                    placeholder="e.g. MYBRAND" maxLength={11} />
                  <p className="text-xs text-slate-400 mt-1">Max 11 characters, no spaces</p>
                </div>
              )}
            </div>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-all"
              style={{ background: '#a89442' }}>
              {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Save SMS Settings
            </button>
          </div>
        )}

        {/* WhatsApp */}
        {tab === 'whatsapp' && (
          <div className="max-w-xl space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-cyan-500 flex items-center justify-center text-white shadow-md">
                  <WaIcon size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">WhatsApp Business</p>
                  <p className="text-xs text-slate-400">Configure your number</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { v: 'default', label: 'Use Cuben Retailer default', desc: 'Send via Cuben Retailer\'s shared number' },
                  { v: 'custom', label: 'Connect own number', desc: 'Use your WhatsApp Business API number' },
                ].map(opt => (
                  <label
                    key={opt.v}
                    onClick={() => setWaHeader(opt.v)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all"
                    style={{
                      borderColor: waHeader === opt.v ? '#a89442' : '#e2e8f0',
                      background: waHeader === opt.v ? '#f0fdfa' : 'white',
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: waHeader === opt.v ? '#a89442' : '#cbd5e1', background: waHeader === opt.v ? '#a89442' : 'white' }}
                    >
                      {waHeader === opt.v && <CheckIcon className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{opt.label}</p>
                      <p className="text-xs text-slate-400">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              {waHeader === 'custom' && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Business Phone Number</label>
                    <input className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
                      placeholder="+91 98765 43210" />
                  </div>
                  <div className="bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-2.5">
                    <p className="text-xs text-amber-700 font-semibold">✓ A verification code will be sent after saving</p>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-cyan-50 border border-cyan-300 rounded-2xl p-4">
              <p className="text-xs font-bold text-amber-700 mb-1">💡 Credit usage</p>
              <p className="text-xs text-amber-800 leading-relaxed">
                1 WhatsApp Utility credit per 24-hour message thread. Marketing messages use separate credits.
              </p>
            </div>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-all"
              style={{ background: '#a89442' }}>
              {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Save WhatsApp Settings
            </button>
          </div>
        )}

        {/* OTP */}
        {tab === 'otp' && (
          <div className="max-w-xl space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h3 className="text-sm font-black text-slate-900 mb-1">OTP Delivery Channel</h3>
              <p className="text-xs text-slate-500 mb-4">How should OTPs be delivered to customers?</p>
              <div className="space-y-2.5">
                {[
                  { v: 'sms', label: 'SMS', desc: 'Send OTP via text message' },
                  { v: 'whatsapp', label: 'WhatsApp', desc: 'Send OTP via WhatsApp message' },
                  { v: 'both', label: 'Both (SMS + WhatsApp)', desc: 'Send on both channels for reliability' },
                ].map((opt, i) => (
                  <label key={opt.v}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-cyan-400 transition-colors">
                    <input type="radio" name="otp" defaultChecked={i === 0} className="w-4 h-4" style={{ accentColor: '#a89442' }} />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{opt.label}</p>
                      <p className="text-xs text-slate-400">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-all"
              style={{ background: '#a89442' }}>
              {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Save OTP Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Promo panel (no chat selected, not in settings) ──────────────────────────
function ChatPromo({ onApply }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500 flex items-center justify-center text-white mb-6 shadow-lg">
        <WaIcon size={34} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-5 leading-snug">
        Now, chat with your<br />customers on Whatsapp
      </h2>
      <div className="space-y-4 mb-8 text-left w-full max-w-sm">
        {[
          { icon: '💬', title: 'Centralized Messaging:', desc: 'View and manage all your customer messages in one place.' },
          { icon: '⚡', title: 'Instant Replies:', desc: 'Respond to customer queries and maintain real-time two-way conversations.' },
          { icon: '💸', title: 'Simple pricing:', desc: '1 WhatsApp Utility credit charged every 24 hours per message to a customer\'s reply.' },
        ].map(f => (
          <div key={f.title} className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">{f.icon}</span>
            <p className="text-sm text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-900">{f.title}</span> {f.desc}
            </p>
          </div>
        ))}
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-slate-50 flex items-center gap-4 p-4 text-left">
        <div className="flex-1">
          <p className="text-sm font-black text-slate-900 mb-1">Want to chat 💬 with your customer?</p>
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">Get your Brand's custom header and start chatting today.</p>
          <button onClick={onApply}
            className="text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-all hover:opacity-90 shadow-md"
            style={{ background: '#a89442' }}>
            Apply for custom header
          </button>
        </div>
        {/* Mini phone mockup */}
        <div className="flex-shrink-0 w-16 h-24 bg-slate-900 rounded-xl overflow-hidden shadow-lg">
          <div className="h-2.5 bg-black flex items-center justify-center">
            <div className="w-8 h-1 bg-slate-700 rounded-full" />
          </div>
          <div className="p-1.5 bg-white h-full">
            <div className="bg-cyan-100 rounded px-1 py-0.5 mb-1 flex items-center gap-0.5">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 flex-shrink-0" />
              <p className="text-[5px] font-bold text-amber-800">JK Burgers ✓</p>
            </div>
            <div className="w-full h-8 rounded bg-gradient-to-br from-orange-300 to-red-300 mb-1 flex items-center justify-center text-sm">🍕</div>
            <div className="bg-slate-100 rounded px-1 py-0.5">
              <p className="text-[5px] text-slate-600">Special offer!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function WhatsappChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState(MOCK_CONVS);
  const [selected, setSelected] = useState(null);
  // rightView: 'promo' | 'chat'
  const [rightView, setRightView] = useState('promo');
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (rightView === 'chat') messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [rightView, selected]);

  const selectConv = (conv) => {
    setSelected(conv);
    setRightView('chat');
  };

  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || !selected || sending) return;
    const text = input.trim();
    const msg = { id: Date.now(), from: 'agent', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'sending' };

    // Optimistically add message to UI
    setConversations(prev => prev.map(c =>
      c.id === selected.id ? { ...c, messages: [...c.messages, msg], lastMsg: text, time: 'Just now' } : c
    ));
    setSelected(prev => ({ ...prev, messages: [...prev.messages, msg] }));
    setInput('');
    setSending(true);

    try {
      // Build phone: use conv mobile, ensure 91 prefix
      const rawPhone = selected.mobile?.replace(/\D/g, '') || '';
      const phone = rawPhone.startsWith('91') ? rawPhone : `91${rawPhone}`;

      await api.post('/whatsapp/send', {
        to: phone,
        message: text,
      });

      // Mark message as delivered
      setConversations(prev => prev.map(c => c.id === selected.id
        ? { ...c, messages: c.messages.map(m => m.id === msg.id ? { ...m, status: 'delivered' } : m) }
        : c
      ));
      setSelected(prev => ({
        ...prev,
        messages: prev.messages.map(m => m.id === msg.id ? { ...m, status: 'delivered' } : m),
      }));
    } catch (err) {
      const errMsg = err?.response?.data?.detail || 'Failed to send message';
      toast.error(errMsg);
      // Mark as failed
      setSelected(prev => ({
        ...prev,
        messages: prev.messages.map(m => m.id === msg.id ? { ...m, status: 'failed' } : m),
      }));
    } finally {
      setSending(false);
    }
  };

  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search)
  );

  return (
    <div className="-m-6 flex overflow-hidden animate-slide-up bg-white" style={{ height: 'calc(100% + 48px)' }}>

      {/* ══ LEFT SIDEBAR — always visible ══ */}
      <div className="w-72 flex-shrink-0 flex flex-col bg-white border-r border-slate-200">

        {/* Brand header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-900 truncate">{user?.brand_name || 'finance'}</p>
            <p className="text-xs text-slate-400 font-mono">{user?.mobile || '9807429743'}</p>
          </div>
          {/* Settings gear — navigates to Settings page */}
          <button
            onClick={() => navigate('/settings', { state: { activeTab: 'channels', setup: 'whatsapp' } })}
            className="w-8 h-8 rounded-xl hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all flex-shrink-0"
          >
            <Cog6ToothIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Chats label + date filter */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0">
          <p className="text-base font-black text-slate-900">Chats</p>
          <button className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors">
            Last 30 Days <ChevronDownIcon className="w-3 h-3" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <MagnifyingGlassIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input
              className="bg-transparent text-xs placeholder-slate-400 text-slate-700 outline-none w-full"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(conv => (
            <div
              key={conv.id}
              onClick={() => selectConv(conv)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-slate-50 ${
                selected?.id === conv.id && rightView === 'chat'
                  ? 'bg-cyan-50 border-l-2 border-l-yellow-600'
                  : 'hover:bg-slate-50'
              }`}
            >
              <Avatar name={conv.name} online={conv.online} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 truncate">{conv.name}</p>
                  <p className="text-[10px] text-slate-400 flex-shrink-0 ml-1">{conv.time}</p>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">{conv.mobile}</p>
              </div>
              {conv.unread > 0 && (
                <span className="w-4 h-4 rounded-full bg-cyan-500 text-white text-[9px] font-black flex items-center justify-center flex-shrink-0">
                  {conv.unread}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Connected status */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-2 flex-shrink-0">
          <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
          <span className="text-xs text-slate-500 font-medium">WhatsApp Connected</span>
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}

      {/* Channel Settings — removed, now handled by /settings route */}

      {/* Chat view */}
      {rightView === 'chat' && selected && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Avatar name={selected.name} size="sm" online={selected.online} />
              <div>
                <p className="text-sm font-bold text-slate-900">{selected.name}</p>
                <p className="text-xs text-slate-400">{selected.mobile}</p>
              </div>
            </div>
            <button className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ background: '#f0f2f5' }}>
            {selected.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.from === 'agent' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.from === 'agent' ? 'bg-cyan-500 text-white rounded-tr-sm' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
                }`}>
                  {msg.text}
                  <div className={`flex items-center justify-end gap-1 mt-1`}>
                    <p className={`text-[10px] ${msg.from === 'agent' ? 'text-cyan-200' : 'text-slate-400'}`}>{msg.time}</p>
                    {msg.from === 'agent' && (
                      <span className="text-[10px]">
                        {msg.status === 'sending' ? '🕐' : msg.status === 'failed' ? '❌' : '✓✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          <div className="px-4 py-2 bg-white border-t border-slate-100 flex-shrink-0">
            <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-0.5">
              {QUICK_REPLIES.map((r, i) => (
                <button key={i} onClick={() => setInput(r)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 bg-slate-100 hover:bg-cyan-50 hover:text-amber-800 hover:border-cyan-300 text-slate-600 rounded-full border border-transparent transition-all whitespace-nowrap">
                  {r.slice(0, 30)}...
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="px-4 py-3 bg-white border-t border-slate-200 flex items-center gap-2 flex-shrink-0">
            <input
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              disabled={sending}
            />
            <button onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="w-10 h-10 bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors shadow-md disabled:opacity-50"
            >
              {sending
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <PaperAirplaneIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Promo (no selection) */}
      {rightView === 'promo' && (
        <div className="flex-1 bg-white">
          <ChatPromo onApply={() => navigate('/settings', { state: { activeTab: 'channels', setup: 'whatsapp' } })} />
        </div>
      )}
    </div>
  );
}


