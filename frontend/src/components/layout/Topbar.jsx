import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  BellIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  UserGroupIcon,
  TvIcon,
  MegaphoneIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

export default function Topbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Dropdown states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notiDropdownOpen, setNotiDropdownOpen] = useState(false);

  // Modal states
  const [lifecycleModalOpen, setLifecycleModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [academyModalOpen, setAcademyModalOpen] = useState(false);

  // Demo form states
  const [demoForm, setDemoForm] = useState({
    name: user?.full_name || '',
    business_name: user?.brand_name || '',
    email: user?.email || '',
    phone: '',
    preferred_date: '',
    preferred_time: '',
    topic: 'Loyalty Programs'
  });
  const [demoLoading, setDemoLoading] = useState(false);

  // Video player state
  const [activeVideo, setActiveVideo] = useState(null);

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New customer Siddharth Sharma registered from Noida Store", time: "10m ago", read: false, type: 'info' },
    { id: 2, text: "Credit Request of 5,000 credits approved by Super Admin", time: "2h ago", read: false, type: 'success' },
    { id: 3, text: "Auto-campaign 'Loyalty Welcoming' triggered for 12 customers", time: "1d ago", read: true, type: 'campaign' },
    { id: 4, text: "Store Manager requested 10,000 SMS credits", time: "3d ago", read: true, type: 'request' }
  ]);

  const dropdownRef = useRef(null);
  const notiDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notiDropdownRef.current && !notiDropdownRef.current.contains(e.target)) {
        setNotiDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const handleTabNavigation = (tabName) => {
    setDropdownOpen(false);
    navigate('/settings', { state: { activeTab: tabName } });
  };

  // Submit Demo Booking
  const handleBookDemo = async (e) => {
    e.preventDefault();
    if (!demoForm.phone || !demoForm.preferred_date || !demoForm.preferred_time) {
      toast.error("Please fill in all required fields");
      return;
    }
    setDemoLoading(true);
    try {
      await api.post('/analytics/book-demo', demoForm);
      toast.success("Demo Booked! We will contact you soon.");
      setDemoModalOpen(false);
      // Reset form
      setDemoForm({
        name: user?.full_name || '',
        business_name: user?.brand_name || '',
        email: user?.email || '',
        phone: '',
        preferred_date: '',
        preferred_time: '',
        topic: 'Loyalty Programs'
      });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to book demo. Please try again.");
    } finally {
      setDemoLoading(false);
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const toggleNotiRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const academyVideos = [
    { id: 'v1', title: 'Welcome to Cuben Retailer & POS Setup', desc: 'A step-by-step walkthrough to integrate your retail stores, import customers and sync sales records.', duration: '5:40', category: 'Onboarding' },
    { id: 'v2', title: 'Configuring Loyalty Programs & Rewards Tiers', desc: 'Best practices for setting custom points-to-currency values, reward redemption rules, and tier rewards.', duration: '8:15', category: 'Loyalty Retention' },
    { id: 'v3', title: 'Creating High-Converting WhatsApp Campaigns', desc: 'Learn how to create template designs, build target segments, and run WhatsApp blast campaigns.', duration: '6:30', category: 'Campaign Marketing' },
    { id: 'v4', title: 'Collecting Feedback & Google Reviews Automatically', desc: 'Discover how to setup auto-feedback surveys that collect compliments and trigger review link requests.', duration: '4:45', category: 'Automation' }
  ];

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center px-5 gap-4 sticky top-0 z-30">

      {/* Sidebar Toggle Button for Mobiles */}
      <button
        onClick={onMenuToggle}
        className="md:hidden p-1.5 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Spacer */}
      <div className="flex-1" />


      {/* Notifications */}
      <div className="relative" ref={notiDropdownRef}>
        <button
          onClick={() => setNotiDropdownOpen(!notiDropdownOpen)}
          className={`relative p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${notiDropdownOpen ? 'bg-indigo-50/60 text-indigo-600' : 'text-slate-500'}`}
        >
          <BellIcon className="w-5 h-5" />
          {/* Notification dot */}
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-white animate-pulse"
              style={{ background: '#ec4899' }}
            />
          )}
        </button>

        {/* Notifications Dropdown Panel */}
        {notiDropdownOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-slide-up"
            style={{ boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)' }}
          >
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm">Notifications ({unreadCount} unread)</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs font-bold text-indigo-600 hover:text-[#3730a3] hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No notifications</div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => toggleNotiRead(n.id)}
                    className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 flex items-start gap-2.5 transition-colors ${!n.read ? 'bg-indigo-50/20' : ''}`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <span className={`w-2 h-2 rounded-full inline-block ${!n.read ? 'bg-[#ec4899]' : 'bg-transparent'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs leading-relaxed ${!n.read ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                        {n.text}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Profile dropdown ── */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(v => !v)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-150 hover:bg-slate-50 cursor-pointer"
        >
          {/* Avatar circle */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-sm flex-shrink-0 text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          >
            {initials}
          </div>

          {/* Name + role */}
          <div className="hidden md:block text-left leading-tight">
            <p className="text-sm font-bold text-slate-800 leading-none">
              {user?.full_name || 'Account'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
              {user?.email || 'owner'}
            </p>
          </div>

          <ChevronDownIcon
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* ── Dropdown menu ── */}
        {dropdownOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-slide-up"
            style={{ boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)' }}
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {user?.full_name || 'Account Owner'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email || ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              {/* Your Account */}
              <button
                onClick={() => handleTabNavigation('account')}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <Cog6ToothIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="font-semibold text-slate-700">Your Account</span>
              </button>

              {/* Store Details */}
              <button
                onClick={() => handleTabNavigation('store')}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <BuildingStorefrontIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="font-semibold text-slate-700">Store Details</span>
              </button>

              {/* My Plans */}
              <button
                onClick={() => handleTabNavigation('plan')}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <CreditCardIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="font-semibold text-slate-700">My Plans</span>
              </button>

              {/* Invite Team */}
              <button
                onClick={() => handleTabNavigation('team')}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <UserGroupIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="font-semibold text-slate-700">Invite Team</span>
              </button>

              {/* Channels */}
              <button
                onClick={() => handleTabNavigation('channels')}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <MegaphoneIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="font-semibold text-slate-700">Channels</span>
              </button>

              {/* Video Academy */}
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setAcademyModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <TvIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="font-semibold text-slate-700">Video Academy</span>
              </button>

              {/* Divider */}
              <div className="mx-4 my-1 border-t border-slate-100" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left hover:bg-rose-50"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <ArrowRightOnRectangleIcon className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <p className="font-bold text-rose-600">Logout</p>
                  <p className="text-[10px] text-slate-400">Sign out of your account</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODALS ─── */}

      {/* 1. Customer Life Cycle Modal */}
      {lifecycleModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative animate-slide-up">
            <button
              onClick={() => setLifecycleModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2">
              <span className="text-2xl">🔄</span> Customer Life Cycle Segments
            </h2>
            <p className="text-sm text-slate-500 mb-6 font-medium">
              Track how your customer base moves through stages and trigger personalized automation to drive repeat visits.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {[
                { stage: 'Acquisition', code: 'NEW', count: 342, pct: '100%', desc: 'Registered customers who signed up recently.', bg: 'bg-emerald-50/40 border-emerald-100', text: 'text-emerald-800', bar: 'bg-emerald-500' },
                { stage: 'Engagement', code: 'ACTIVE', count: 724, pct: '72%', desc: 'Customers making 2 to 4 repeat visits in 30 days.', bg: 'bg-indigo-50/40 border-indigo-100', text: 'text-indigo-800', bar: 'bg-indigo-500' },
                { stage: 'Retention', code: 'LOYAL', count: 184, pct: '42%', desc: 'Highly engaged tier with 5+ lifetime store orders.', bg: 'bg-pink-50/40 border-pink-100', text: 'text-pink-800', bar: 'bg-pink-500' },
                { stage: 'At Risk', code: 'SLIPPING', count: 92, pct: '18%', desc: 'No transaction record for over 60-90 days.', bg: 'bg-orange-50/40 border-orange-100', text: 'text-orange-800', bar: 'bg-orange-500' },
                { stage: 'Churned', code: 'LOST', count: 48, pct: '8%', desc: 'Dormant users with 120+ days since last checkin.', bg: 'bg-rose-50/40 border-rose-100', text: 'text-rose-800', bar: 'bg-rose-500' }
              ].map(s => (
                <div key={s.stage} className={`border rounded-2xl p-4 flex flex-col justify-between ${s.bg}`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-full">{s.code}</span>
                      <span className={`text-xs font-bold ${s.text}`}>{s.pct}</span>
                    </div>
                    <h3 className="text-sm font-black text-slate-800 mb-1">{s.stage}</h3>
                    <p className="text-[11px] text-slate-600 leading-snug font-medium">{s.desc}</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-lg font-black text-slate-900 mb-1.5">{s.count.toLocaleString()}</p>
                    <div className="h-1.5 bg-white rounded-full overflow-hidden">
                      <div className={`h-full ${s.bar}`} style={{ width: s.pct }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm font-bold text-slate-800">🚀 Set up Auto-Campaign for Slipping Customers</p>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Send automatically triggered WhatsApp coupons when a customer falls into "At Risk" segment.</p>
              </div>
              <button
                onClick={() => { setLifecycleModalOpen(false); navigate('/auto-campaigns'); }}
                className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-700 px-5 py-2.5 rounded-xl transition-all flex-shrink-0 cursor-pointer"
              >
                Configure Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Book a Demo Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-slide-up">
            <button
              onClick={() => setDemoModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl mx-auto mb-2 text-indigo-600">
                📅
              </div>
              <h3 className="text-lg font-black text-slate-900">Book a Demo Walkthrough</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Select a comfortable slot for a 1-on-1 walkthrough with our success specialists.</p>
            </div>

            <form onSubmit={handleBookDemo} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={demoForm.name}
                    onChange={e => setDemoForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="Amit Kumar"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Business Name</label>
                  <input
                    type="text"
                    required
                    value={demoForm.business_name}
                    onChange={e => setDemoForm(p => ({ ...p, business_name: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="Finance Ltd."
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={demoForm.email}
                  onChange={e => setDemoForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="amit@finance.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={demoForm.phone}
                  onChange={e => setDemoForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={demoForm.preferred_date}
                    onChange={e => setDemoForm(p => ({ ...p, preferred_date: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Time Slot *</label>
                  <select
                    required
                    value={demoForm.preferred_time}
                    onChange={e => setDemoForm(p => ({ ...p, preferred_time: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Select slot</option>
                    <option>10:00 AM - 10:30 AM</option>
                    <option>11:30 AM - 12:00 PM</option>
                    <option>02:00 PM - 02:30 PM</option>
                    <option>04:00 PM - 04:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Topic Focus</label>
                <select
                  value={demoForm.topic}
                  onChange={e => setDemoForm(p => ({ ...p, topic: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option>Loyalty Programs</option>
                  <option>Auto Campaigns</option>
                  <option>WhatsApp Marketing</option>
                  <option>POS Integration</option>
                  <option>General Walkthrough</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDemoModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={demoLoading}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
                >
                  {demoLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Video Academy Modal */}
      {academyModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative animate-slide-up">
            <button
              onClick={() => { setAcademyModalOpen(false); setActiveVideo(null); }}
              className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2">
              <span className="text-2xl">🎓</span> Cuben Retailer Video Academy
            </h2>
            <p className="text-sm text-slate-500 mb-6 font-medium">Learn how to configure your loyalty programs, launch target templates, and analyze customer feedback like a pro.</p>

            {activeVideo ? (
              <div className="bg-slate-950 rounded-2xl overflow-hidden p-4 mb-6 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400">Playing: {activeVideo.title}</span>
                  <button
                    onClick={() => setActiveVideo(null)}
                    className="text-xs font-bold text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Back to List
                  </button>
                </div>

                {/* Simulated Video Player Graphic */}
                <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col justify-between p-6 relative border border-white/5 overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)] animate-pulse" />

                  <div className="flex justify-between items-start z-10">
                    <span className="text-[10px] font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/5">
                      {activeVideo.category}
                    </span>
                    <span className="text-[10px] text-white bg-indigo-600 px-2.5 py-0.5 rounded-full font-bold">
                      LIVE STREAM
                    </span>
                  </div>

                  {/* Play Center icon */}
                  <div className="flex flex-col items-center justify-center z-10 flex-1 gap-2.5">
                    <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-400/40 flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-all">
                      <PlayIcon className="w-8 h-8 text-indigo-400 ml-1 fill-indigo-400" />
                    </div>
                    <p className="text-xs text-slate-400 font-semibold">Click to start tutorial video</p>
                  </div>

                  {/* Video Control Bar Skeletons */}
                  <div className="space-y-3 z-10">
                    <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full animate-[pulse_2s_infinite]" style={{ width: '45%' }} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                      <div className="flex items-center gap-4">
                        <span>▶ Play</span>
                        <span>🔊 Mute</span>
                      </div>
                      <span>02:32 / {activeVideo.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {academyVideos.map(video => (
                <div
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className={`border border-slate-200 hover:border-indigo-300 hover:shadow-md rounded-2xl p-4.5 cursor-pointer transition-all flex flex-col justify-between text-left ${activeVideo?.id === video.id ? 'bg-indigo-50/20 border-indigo-100' : 'bg-white'}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {video.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{video.duration} min</span>
                    </div>
                    <h3 className="text-sm font-black text-slate-800 mb-1.5 leading-tight">{video.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold line-clamp-2">{video.desc}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group">
                      <PlayIcon className="w-3.5 h-3.5 fill-indigo-600" /> Watch Tutorial
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Click to load</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
