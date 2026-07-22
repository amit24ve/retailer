import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  CheckIcon, PlusIcon, ChevronRightIcon,
  UserIcon, BuildingStorefrontIcon, UserGroupIcon, 
  ShareIcon, CalendarIcon,
  CreditCardIcon, DocumentTextIcon, KeyIcon
} from '@heroicons/react/24/outline';

// ─── Inner sidebar nav icons (thin-line) ──────────────────────────────────────
const NavIcons = {
  dashboard: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </svg>
  ),
  account: () => <UserIcon className="w-4 h-4" />,
  store: () => <BuildingStorefrontIcon className="w-4 h-4" />,
  team: () => <UserGroupIcon className="w-4 h-4" />,
  channels: () => <ShareIcon className="w-4 h-4" />,
  faq: () => <DocumentTextIcon className="w-4 h-4" />,
  plan: () => <CreditCardIcon className="w-4 h-4" />,
};

const SETTINGS_NAV = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'account',   label: 'Your Account' },
  { id: 'store',     label: 'Store Details' },
  { id: 'team',      label: 'Invite Team' },
  { id: 'channels',  label: 'Channels' },
  { id: 'faq',       label: 'FAQ' },
  { id: 'plan',      label: 'My Plan' },
];

const PAGE_TITLES = {
  account:  'Account Details',
  store:    'My Store',
  team:     'Team',
  channels: 'Channels',
  faq:      'FAQ',
  plan:     'My Plan',
};

const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN');

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const formatDate = (value) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const daysBetween = (start, end) => Math.max(0, Math.ceil((end - start) / 86400000));

const getPlanProgress = (subscription) => {
  const end = new Date(subscription?.current_period_end || subscription?.trial_expires_at || '');
  if (Number.isNaN(end.getTime())) return { pct: 0, daysLeft: 0 };
  const start = new Date(subscription?.started_at || Date.now());
  const now = new Date();
  const total = Math.max(1, end - (Number.isNaN(start.getTime()) ? now : start));
  const elapsed = Math.min(total, Math.max(0, now - (Number.isNaN(start.getTime()) ? now : start)));
  return {
    pct: Math.max(4, Math.min(100, Math.round((elapsed / total) * 100))),
    daysLeft: daysBetween(now, end),
  };
};

const DEFAULT_FREE_FEATURES = [
  'Basic Campaigns (SMS & Email)',
  'Simple Customer Registry',
  'General Sales Overview',
];

const DEFAULT_GROWTH_FEATURES = [
  'Branded Loyalty Program',
  'Automated Feedback & NPS',
  'Google Reviews Integration',
  'Set-and-Forget Auto-Campaigns',
  'WhatsApp Blast Campaigns',
  'Dual-Incentive Referrals',
  'Paid Membership Tiers',
  'Dynamic Smart QR Coupons',
  'Retention Analytics & Funnels',
  '24/7 Priority VIP Support',
];

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT DETAILS
// ─────────────────────────────────────────────────────────────────────────────
function AccountTab({ user }) {
  const [form, setForm] = useState({
    name:   user?.full_name || 'Amit Kumar',
    email:  user?.email    || 'rajamit22ve@gmail.com',
    mobile: user?.mobile   || '9807429743',
  });
  const [editField, setEditField] = useState(null);
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [saving, setSaving]  = useState(false);
  const [showPw, setShowPw]  = useState(false);

  const saveField = async (label) => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false); setEditField(null);
    toast.success(`${label} updated successfully!`);
  };

  const changePw = async () => {
    if (!pwForm.new || pwForm.new !== pwForm.confirm) { 
      toast.error('New passwords do not match'); 
      return; 
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setSaving(false);
    setPwForm({ current: '', new: '', confirm: '' });
    setShowPw(false);
    toast.success('Password updated successfully!');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-5xl">
      {/* Left — greeting card (5 cols) */}
      <div className="xl:col-span-5 rounded-3xl p-6 border border-indigo-100 relative overflow-hidden bg-gradient-to-br from-indigo-50/70 via-indigo-50/20 to-white flex flex-col justify-between min-h-[280px]">
        {/* Decorative background blur */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-200/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <span className="text-[10px] font-extrabold text-indigo-600 tracking-wider uppercase bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
            Security Overview
          </span>
          <p className="text-xs text-slate-450 font-bold mt-4">Welcome back,</p>
          <h2 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{form.name}</h2>
          <p className="text-xs text-slate-500 leading-relaxed mt-2.5 max-w-xs">
            This is your Cuben Retailer owner account. You have been building customer engagement here for{' '}
            <span className="font-bold text-indigo-650">4 Days and 20 hours</span>.
          </p>
        </div>

        <div className="relative z-10 border-t border-slate-100 pt-4 mt-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Security Pulse</p>
          <p className="text-xs text-slate-650 mt-1">Last sign-in location: Noida, India</p>
          <button className="text-xs font-bold text-indigo-600 hover:underline mt-1 block">Report anomalous activity</button>
        </div>
        
        {/* Illustration graphic */}
        <div className="absolute right-3 top-4 opacity-15">
          <svg viewBox="0 0 140 140" className="w-28 h-28" fill="none">
            <rect x="48" y="18" width="72" height="88" rx="8" fill="white" stroke="#6366f1" strokeWidth="2" />
            <circle cx="84" cy="44" r="12" stroke="#6366f1" strokeWidth="2" />
            <rect x="56" y="72" width="56" height="8" rx="3" fill="#6366f1" />
            <rect x="56" y="86" width="56" height="8" rx="3" fill="#e2e8f0" />
            <circle cx="28" cy="50" r="11" stroke="#ec4899" strokeWidth="2" />
            <path d="M18 65 Q28 60 38 65 L40 96 Q28 102 16 96 Z" stroke="#ec4899" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>

      {/* Right — form (7 cols) */}
      <div className="xl:col-span-7 space-y-4 bg-white border border-slate-150 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-850 pb-3 border-b border-slate-100">Personal Information</h3>
        {[
          { key: 'name',   label: 'Owner Full Name',   type: 'text' },
          { key: 'email',  label: 'Primary Email',     type: 'email' },
          { key: 'mobile', label: 'Mobile Number',     type: 'tel' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{f.label}</label>
            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/30 overflow-hidden focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all duration-200">
              <input
                type={f.type}
                readOnly={editField !== f.key}
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="flex-1 px-4 py-2.5 text-sm bg-transparent text-slate-800 font-semibold focus:outline-none"
              />
              {editField === f.key ? (
                <div className="flex items-center flex-shrink-0 border-l border-slate-100 bg-white">
                  <button onClick={() => saveField(f.label)} disabled={saving}
                    className="px-4 py-2.5 text-xs font-black text-indigo-600 hover:bg-indigo-50 transition-colors">
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditField(null)}
                    className="px-3 py-2.5 text-xs text-slate-400 hover:text-slate-650 border-l border-slate-100 transition-colors">
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditField(f.key)}
                  className="px-4 py-2.5 text-xs font-black text-indigo-600 border-l border-slate-100 hover:bg-indigo-50/50 transition-colors bg-white/60">
                  Modify
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="pt-2">
          <button
            onClick={() => setShowPw(v => !v)}
            className="btn-secondary w-full py-2.5 justify-center font-bold text-xs uppercase tracking-wider gap-2 border border-slate-250"
          >
            <KeyIcon className="w-4 h-4 text-slate-500" />
            {showPw ? 'Hide Password Form' : 'Update Credentials'}
          </button>
        </div>

        {showPw && (
          <div className="bg-slate-50/60 border border-slate-150 rounded-2xl p-5 space-y-3 animate-slide-up">
            <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Change Account Password</p>
            {[
              { key: 'current', label: 'Current Password' },
              { key: 'new',     label: 'New Password' },
              { key: 'confirm', label: 'Verify New Password' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-bold text-slate-500 mb-1">{f.label}</label>
                <input type="password"
                  className="input-field py-2 text-xs font-mono"
                  value={pwForm[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder="••••••••" />
              </div>
            ))}
            <div className="flex gap-2.5 pt-2">
              <button onClick={changePw} disabled={saving}
                className="btn-primary py-2 text-xs font-bold shadow-md">
                {saving && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Confirm Password Update
              </button>
              <button onClick={() => setShowPw(false)}
                className="btn-secondary py-2 text-xs font-semibold">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MY STORE
// ─────────────────────────────────────────────────────────────────────────────
function StoreTab({ user }) {
  const [showAddStore, setShowAddStore] = useState(false);
  const [stores, setStores] = useState([
    {
      id: 's1', name: user?.brand_name || 'finance',
      industry: 'Retail', category: 'Grocery / Convenience Store',
      city: 'Noida', state: 'Uttar Pradesh', pos: 'Not Integrated',
    },
  ]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">My Outlet Stores</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            You are managing <span className="font-bold text-slate-650">{stores.length} registered</span> brand outlets
          </p>
        </div>
        <button
          onClick={() => setShowAddStore(true)}
          className="btn-primary shadow-lg"
        >
          <PlusIcon className="w-4 h-4" /> Add Outlet Store
        </button>
      </div>

      {/* Store cards */}
      {stores.map(store => (
        <div key={store.id} className="glass-card overflow-hidden border-2 border-slate-100 bg-white">
          {/* Store name header row */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-3">
              {/* Square logo */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white text-[10px] font-black uppercase leading-tight text-center px-0.5">
                  {store.name.slice(0, 3).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-black text-slate-850 capitalize">{store.name}</span>
            </div>
            <button className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
              Manage Settings <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Profile section */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 mb-4 text-slate-500">
              <BuildingStorefrontIcon className="w-4.5 h-4.5 text-indigo-500" />
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Outlet Profile</span>
            </div>

            {/* 5 column info grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-y-4 gap-x-4">
              {[
                { label: 'Industry Vertical',  value: store.industry },
                { label: 'Sub-Category',  value: store.category },
                { label: 'Operating City',      value: store.city },
                { label: 'State Region',     value: store.state },
                { label: 'POS Terminal Link',  value: store.pos },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{f.label}</p>
                  <p className="text-xs font-extrabold text-slate-700">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Add store modal */}
      {showAddStore && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-850">Register New Store</h3>
              <button onClick={() => setShowAddStore(false)} className="w-7 h-7 rounded-lg bg-slate-105 hover:bg-slate-200 flex items-center justify-center text-slate-450 transition-all">✕</button>
            </div>
            {[
              { label: 'Outlet Store Name', placeholder: 'e.g. Mumbai Hub Flagship', key: 'name' },
              { label: 'Operating City',       placeholder: 'e.g. Mumbai', key: 'city' },
              { label: 'State Region',      placeholder: 'e.g. Maharashtra', key: 'state' },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">{f.label}</label>
                <input className="input-field py-2 text-xs"
                  placeholder={f.placeholder} id={`new-store-${f.key}`} />
              </div>
            ))}
            <div className="flex gap-2.5 pt-3 border-t border-slate-100">
              <button onClick={() => { 
                const nameVal = document.getElementById('new-store-name')?.value || 'New Outlet';
                const cityVal = document.getElementById('new-store-city')?.value || 'Noida';
                const stateVal = document.getElementById('new-store-state')?.value || 'UP';
                setStores(s => [...s, {
                  id: `s-${Date.now()}`,
                  name: nameVal,
                  industry: 'Retail',
                  category: 'General Apparel Store',
                  city: cityVal,
                  state: stateVal,
                  pos: 'Pending Integration'
                }]);
                toast.success('Outlet registered successfully!'); 
                setShowAddStore(false); 
              }}
                className="btn-primary flex-1 py-2.5 font-bold shadow-md">
                Register Store
              </button>
              <button onClick={() => setShowAddStore(false)}
                className="btn-secondary flex-1 py-2.5 font-semibold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INVITE TEAM
// ─────────────────────────────────────────────────────────────────────────────
function TeamTab({ user }) {
  const [showInvite, setShowInvite] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole]   = useState('Marketing Manager');
  const accessRows = [
    { role: 'Marketing Manager', access: ['Campaigns', 'Coupons', 'Auto Campaigns'], blocked: ['Billing', 'Team Invites'] },
    { role: 'Store Manager', access: ['Orders', 'Customers', 'Store QR', 'Feedback'], blocked: ['Plan', 'Brand Settings'] },
    { role: 'Store Cashier', access: ['POS Orders', 'Coupon Validation', 'Customer Lookup'], blocked: ['Campaigns', 'Settings'] },
    { role: 'Customer Support', access: ['WhatsApp Chat', 'Feedback', 'Customer Timeline'], blocked: ['Billing', 'Credits'] },
    { role: 'Operations Manager', access: ['Stores', 'POS Imports', 'Team Invites'], blocked: ['Plan Upgrade'] },
    { role: 'Business Analyst', access: ['Analytics', 'Smart Insights', 'Reports'], blocked: ['Write Actions'] },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Hero banner */}
      <div className="rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-pink-50/20 to-indigo-50/20 border border-indigo-100">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
          <div className="flex-1">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[9px] font-extrabold text-white bg-pink-500 px-2.5 py-1 rounded-full tracking-wider uppercase">
                Collaboration
              </span>
              <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                👑 Active Growth Package
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2 leading-snug">
              Invite your managers &amp; staff<br />to streamline store operations
            </h2>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed max-w-md">
              Delegate campaign management, loyalty setups, feedback responses, and billing access to store assistants and cashiers while maintaining full security logs.
            </p>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowInvite(true)}
                className="btn-primary shadow-lg">
                Invite Team Member <PlusIcon className="w-4 h-4 ml-1" />
              </button>
              <button onClick={() => setShowMatrix(true)} className="btn-secondary py-2 text-xs">
                View Access Matrix
              </button>
            </div>
          </div>

          {/* Team role bubbles */}
          <div className="flex-shrink-0 flex flex-col gap-3 min-w-[200px]">
            <div className="text-[10px] font-black text-slate-450 uppercase tracking-widest border-b border-slate-200 pb-1">Role Groups</div>
            <div className="flex items-center gap-2 bg-white/70 border border-slate-150 rounded-2xl px-3.5 py-2 shadow-sm backdrop-blur-md">
              <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center text-sm font-black flex-shrink-0">📢</div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold text-slate-800 block">Marketing Manager</span>
                <span className="text-[8px] text-slate-400 block font-medium">Campaigns, Coupons</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/70 border border-slate-150 rounded-2xl px-3.5 py-2 shadow-sm backdrop-blur-md">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-black flex-shrink-0">🏪</div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold text-slate-800 block">Store Manager</span>
                <span className="text-[8px] text-slate-400 block font-medium">Outlet level configurations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current user */}
      <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-sm">
        {/* Name header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full" />
            <h3 className="text-sm font-black text-slate-850">Primary Brand Owner</h3>
          </div>
        </div>
        {/* Details grid */}
        <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-4">
          {[
            { label: 'Assigned Role',    value: 'Brand Owner (Administrator)' },
            { label: 'Contact Mobile',   value: user?.mobile || '9807429743' },
            { label: 'Primary Email',    value: user?.email  || 'rajamit22ve@gmail.com' },
            { label: 'Registered On',    value: '09 Jun 2026, Tuesday' },
          ].map(f => (
            <div key={f.label}>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{f.label}</p>
              <p className="text-xs font-extrabold text-slate-750">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-850">Invite Team Collaborator</h3>
              <button onClick={() => setShowInvite(false)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-450 transition-all">✕</button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Colleague Email Address</label>
              <input className="input-field py-2.5 text-xs font-medium"
                value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@yourbrand.com" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-650 mb-2">Select Access Role</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { r: 'Marketing Manager', desc: 'Campaigns & Loyalty' },
                  { r: 'Store Manager', desc: 'Outlet Configs' },
                  { r: 'Store Cashier', desc: 'Billings & Points' },
                  { r: 'Customer Support', desc: 'Feedback & NPS' },
                  { r: 'Operations Manager', desc: 'Teams & Invites' },
                  { r: 'Business Analyst', desc: 'View Analytics' }
                ].map(item => (
                  <label key={item.r} 
                    onClick={() => setRole(item.r)}
                    className="flex flex-col justify-between p-2.5 rounded-xl border-2 cursor-pointer transition-all h-16 text-left"
                    style={{
                      borderColor: role === item.r ? '#6366f1' : '#f1f5f9',
                      background: role === item.r ? '#f5f3ff' : '#fafafa'
                    }}>
                    <div className="flex items-center gap-1.5">
                      <input type="radio" name="role" value={item.r} checked={role === item.r} readOnly className="w-3.5 h-3.5 accent-indigo-655" />
                      <span className={`text-[10px] font-black ${role === item.r ? 'text-indigo-700' : 'text-slate-700'}`}>{item.r.split(' ')[0]} {item.r.split(' ')[1]}</span>
                    </div>
                    <span className="text-[8px] text-slate-400 mt-1 block font-medium leading-none">{item.desc}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2.5 pt-3 border-t border-slate-100">
              <button onClick={() => { 
                if (!email) { toast.error('Enter email'); return; }
                toast.success(`Invite sent to ${email} as ${role}!`); 
                setShowInvite(false); 
                setEmail(''); 
              }}
                className="btn-primary flex-1 py-2.5 font-bold shadow-md">
                Send Staff Invite
              </button>
              <button onClick={() => setShowInvite(false)}
                className="btn-secondary flex-1 py-2.5 font-semibold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showMatrix && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-100 animate-scale-up overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-850">Access Matrix</h3>
                <p className="text-xs text-slate-400 mt-0.5">Role-wise permissions used when sending team invites</p>
              </div>
              <button onClick={() => setShowMatrix(false)} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500">✕</button>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Allowed Access</th>
                    <th>Restricted</th>
                  </tr>
                </thead>
                <tbody>
                  {accessRows.map(row => (
                    <tr key={row.role}>
                      <td className="text-xs font-black text-slate-800">{row.role}</td>
                      <td className="text-xs text-slate-600">{row.access.join(', ')}</td>
                      <td className="text-xs text-rose-500">{row.blocked.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => setShowMatrix(false)} className="btn-primary py-2.5">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHANNELS
// ─────────────────────────────────────────────────────────────────────────────
function ChannelsTab({ setupIntent, settingsSummary, creditBalances, loadingCredits }) {
  const [activeChannel, setActiveChannel] = useState(null);
  const [setupModal, setSetupModal] = useState(null);
  const [channelForm, setChannelForm] = useState({
    custom_sender_id: '',
    whatsapp_number: '',
    whatsapp_business_name: '',
  });
  const [savingSetup, setSavingSetup] = useState(false);

  useEffect(() => {
    if (setupIntent === 'whatsapp' || setupIntent === 'sms') {
      Promise.resolve().then(() => setSetupModal(setupIntent));
    }
  }, [setupIntent]);

  useEffect(() => {
    api.get('/sms/settings')
      .then((r) => setChannelForm((f) => ({ ...f, custom_sender_id: r.data?.custom_sender_id || '' })))
      .catch(() => {});
  }, []);

  const saveChannelSetup = async () => {
    setSavingSetup(true);
    try {
      if (setupModal === 'sms') {
        await api.post('/sms/settings', {
          sms_header_mode: 'custom',
          custom_sender_id: channelForm.custom_sender_id,
          otp_channel: 'sms',
        });
        toast.success('Branded SMS sender saved');
      } else {
        await api.post('/whatsapp/send', {
          to: channelForm.whatsapp_number || '919999999999',
          message: `Demo WhatsApp setup check for ${channelForm.whatsapp_business_name || 'your brand'}.`,
        });
        toast.success('WhatsApp setup demo message queued');
      }
      setSetupModal(null);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (setupModal === 'whatsapp' && detail) {
        toast.success('WhatsApp setup saved in demo mode');
        setSetupModal(null);
      } else {
        toast.error(detail || 'Could not save channel setup');
      }
    } finally {
      setSavingSetup(false);
    }
  };

  const credits = creditBalances || settingsSummary?.credits || {};
  const channelSettings = settingsSummary?.channels || {};
  const smsSenderId = channelSettings.sms?.sender_id || channelForm.custom_sender_id || 'Default Header';
  const emailSender = channelSettings.email?.sender || channelSettings.email?.from_email || 'Not configured';
  const waUtilityId = channelSettings.whatsapp_utility?.phone_number_id || channelSettings.whatsapp_utility?.business_name || 'Not configured';
  const waMarketingId = channelSettings.whatsapp_marketing?.phone_number_id || channelSettings.whatsapp_marketing?.business_name || 'Not configured';

  const CHANNELS = [
    { id: 'sms',      label: 'SMS Channel',          color: '#3b82f6', bg: 'from-blue-50/50 to-blue-50/10', icon: () => (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ), limit: loadingCredits ? 'Loading credits...' : `${formatNumber(credits.sms)} credits left`, code: smsSenderId },
    { id: 'email',    label: 'Email Dispatch',        color: '#f97316', bg: 'from-orange-50/50 to-orange-50/10', icon: () => (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ), limit: loadingCredits ? 'Loading credits...' : `${formatNumber(credits.email)} email credits left`, code: emailSender },
    { id: 'wa-util',  label: 'WhatsApp Utility',     color: '#10b981', bg: 'from-emerald-50/50 to-emerald-50/10', icon: () => (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ), limit: loadingCredits ? 'Loading credits...' : `${formatNumber(credits.wa_utility)} utility credits`, code: waUtilityId },
    { id: 'wa-mkt',   label: 'WhatsApp Promo',       color: '#ec4899', bg: 'from-pink-50/50 to-pink-50/10', icon: () => (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ), limit: loadingCredits ? 'Loading credits...' : `${formatNumber(credits.wa_marketing)} promotional credits`, code: waMarketingId },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header row with 3 buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Communication Channels</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Configure, refill, and monitor messaging gateways</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {[
            { label: 'Refill History', icon: <CalendarIcon className="w-3.5 h-3.5" /> },
            { label: 'Gateway Settings', icon: <KeyIcon className="w-3.5 h-3.5" /> },
            { label: 'Purchase Credits', icon: <CreditCardIcon className="w-3.5 h-3.5 text-pink-200" /> },
          ].map(b => (
            <button key={b.label} onClick={() => toast.success(`${b.label} portal opening...`)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95">
              <span>{b.icon}</span>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 channel tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CHANNELS.map(ch => {
          const Icon = ch.icon;
          const isSelected = activeChannel === ch.id;
          return (
            <button key={ch.id}
              onClick={() => setActiveChannel(isSelected ? null : ch.id)}
              className={`flex flex-col justify-between p-4 rounded-3xl border-2 transition-all hover:shadow-md hover:border-slate-300 text-left bg-gradient-to-br ${ch.bg} min-h-[120px]`}
              style={{
                borderColor: isSelected ? ch.color : '#f1f5f9',
              }}>
              <div className="flex items-center justify-between w-full">
                <span className="p-2 bg-white rounded-xl shadow-sm" style={{ color: ch.color }}><Icon /></span>
                <ChevronRightIcon className="w-4 h-4 text-slate-450" />
              </div>
              <div className="mt-4">
                <span className="text-xs font-black text-slate-800 block leading-none">{ch.label}</span>
                <span className="text-[10px] font-bold text-slate-450 block mt-1.5">{ch.limit}</span>
                <span className="font-mono text-[8px] text-slate-400 font-bold uppercase tracking-wider block mt-1">ID: {ch.code}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom header setup card */}
      <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6 p-6">
          <div className="flex-1">
            <h3 className="text-sm font-black text-slate-850 mb-1.5">
              Setup Custom Sender IDs &amp; Branded Handles
            </h3>
            <p className="text-xs text-slate-550 mb-5 leading-relaxed">
              Verify your business profile to send SMS communications under a custom 6-letter alphabetic Sender ID, or register your WhatsApp Business profile for verified tick branding.
            </p>
            <div className="flex items-center gap-2.5">
              <button onClick={() => setSetupModal('whatsapp')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2.5 rounded-xl shadow-md"
                style={{ background: 'linear-gradient(135deg, #22c35e 0%, #15803d 100%)' }}>
                Setup Branded WhatsApp
              </button>
              <button onClick={() => setSetupModal('sms')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2.5 rounded-xl shadow-md"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
                Setup Branded SMS
              </button>
            </div>
          </div>
          
          {/* Mock Phone Preview */}
          <div className="flex-shrink-0 w-36 h-32 relative">
            <div className="w-24 h-full bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-850 shadow-lg mx-auto relative">
              <div className="h-3 bg-black flex items-center justify-center">
                <div className="w-8 h-1 bg-slate-800 rounded-full" />
              </div>
              <div className="p-2 space-y-1.5">
                <div className="bg-white rounded-lg p-1.5 shadow-sm">
                  <p className="text-[6px] font-extrabold text-slate-800">Verify Brand ✓</p>
                  <div className="w-full h-8 bg-gradient-to-br from-indigo-100 to-pink-100 rounded mt-1 flex items-center justify-center text-xs">👔</div>
                </div>
                <div className="bg-pink-500 rounded-lg p-1 text-center text-white">
                  <p className="text-[5px] font-bold">50% Coupon Live!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {setupModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-850">
                {setupModal === 'sms' ? 'Setup Branded SMS' : 'Setup Branded WhatsApp'}
              </h3>
              <button onClick={() => setSetupModal(null)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-450">✕</button>
            </div>
            {setupModal === 'sms' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Sender ID</label>
                  <input
                    className="input-field py-2.5 text-xs font-mono uppercase"
                    maxLength={11}
                    value={channelForm.custom_sender_id}
                    onChange={e => setChannelForm(f => ({ ...f, custom_sender_id: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                    placeholder="MYBRAND"
                  />
                </div>
                <p className="text-xs text-slate-400">Demo mode saves this sender ID locally in brand messaging settings. API credentials can be added later.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Business Display Name</label>
                  <input
                    className="input-field py-2.5 text-xs"
                    value={channelForm.whatsapp_business_name}
                    onChange={e => setChannelForm(f => ({ ...f, whatsapp_business_name: e.target.value }))}
                    placeholder="Your Brand"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Test WhatsApp Number</label>
                  <input
                    className="input-field py-2.5 text-xs"
                    value={channelForm.whatsapp_number}
                    onChange={e => setChannelForm(f => ({ ...f, whatsapp_number: e.target.value.replace(/\D/g, '') }))}
                    placeholder="919876543210"
                  />
                </div>
                <p className="text-xs text-slate-400">For now this sends one demo check through the configured WhatsApp API/test mode.</p>
              </div>
            )}
            <div className="flex gap-2.5 pt-3 border-t border-slate-100">
              <button onClick={saveChannelSetup} disabled={savingSetup} className="btn-primary flex-1 py-2.5 font-bold shadow-md">
                {savingSetup && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Save Setup
              </button>
              <button onClick={() => setSetupModal(null)} className="btn-secondary flex-1 py-2.5 font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────────────────────
function FAQTab() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ question: '', answer: '', category: 'General', is_active: true });

  const loadFaqs = () => {
    setLoading(true);
    api.get('/faqs')
      .then(r => setFaqs(r.data.faqs || []))
      .catch(() => {
        const saved = localStorage.getItem('retailer_faqs');
        setFaqs(saved ? JSON.parse(saved) : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/faqs')
      .then(r => setFaqs(r.data.faqs || []))
      .catch(() => {
        const saved = localStorage.getItem('retailer_faqs');
        setFaqs(saved ? JSON.parse(saved) : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ question: '', answer: '', category: 'General', is_active: true });
  };

  const saveLocal = (next) => {
    setFaqs(next);
    localStorage.setItem('retailer_faqs', JSON.stringify(next));
  };

  const saveFaq = async (e) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }
    try {
      if (editing) {
        await api.put(`/faqs/${editing.faq_id}`, form);
        toast.success('FAQ updated');
      } else {
        await api.post('/faqs', form);
        toast.success('FAQ added');
      }
      resetForm();
      loadFaqs();
    } catch {
      const next = editing
        ? faqs.map(f => f.faq_id === editing.faq_id ? { ...f, ...form } : f)
        : [{ ...form, faq_id: `faq-${Date.now()}`, created_at: new Date().toISOString() }, ...faqs];
      saveLocal(next);
      resetForm();
      toast.success(editing ? 'FAQ updated locally' : 'FAQ added locally');
    }
  };

  const editFaq = (faq) => {
    setEditing(faq);
    setForm({
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || 'General',
      is_active: faq.is_active !== false,
    });
  };

  const deleteFaq = async (faq) => {
    try {
      await api.delete(`/faqs/${faq.faq_id}`);
      toast.success('FAQ deleted');
      loadFaqs();
    } catch {
      saveLocal(faqs.filter(f => f.faq_id !== faq.faq_id));
      toast.success('FAQ removed locally');
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 max-w-5xl">
      <form onSubmit={saveFaq} className="xl:col-span-1 bg-white border border-slate-150 rounded-3xl p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-black text-slate-850">{editing ? 'Edit FAQ' : 'Add FAQ'}</h2>
          <p className="text-xs text-slate-400 mt-1">Create customer-facing help answers for common questions.</p>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Category</label>
          <input className="input-field py-2.5 text-xs" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Loyalty" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Question</label>
          <input className="input-field py-2.5 text-xs" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="How do customers redeem points?" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Answer</label>
          <textarea className="input-field py-2.5 text-xs min-h-28 resize-none" value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} placeholder="Write the answer customers should see..." />
        </div>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
          Active
        </label>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1 py-2.5">{editing ? 'Save FAQ' : 'Add FAQ'}</button>
          {editing && <button type="button" onClick={resetForm} className="btn-secondary py-2.5">Cancel</button>}
        </div>
      </form>
      <div className="xl:col-span-2 bg-white border border-slate-150 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-850">Saved FAQs</h2>
            <p className="text-xs text-slate-400 mt-0.5">{faqs.length} questions configured</p>
          </div>
        </div>
        {loading ? (
          <div className="p-6 text-xs text-slate-400">Loading FAQs...</div>
        ) : faqs.length === 0 ? (
          <div className="p-10 text-center">
            <DocumentTextIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-black text-slate-700">No FAQs yet</p>
            <p className="text-xs text-slate-400 mt-1">Add your first FAQ from the form.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {faqs.map(faq => (
              <div key={faq.faq_id} className="p-5 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">{faq.category || 'General'}</span>
                    <h3 className="text-sm font-black text-slate-850 mt-2">{faq.question}</h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{faq.answer}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => editFaq(faq)} className="btn-secondary py-2 text-xs">Edit</button>
                    <button onClick={() => deleteFaq(faq)} className="px-3 py-2 text-xs font-bold text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-50">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MY PLAN
// ─────────────────────────────────────────────────────────────────────────────
function PlanTab({ settingsSummary, loadingSettings }) {
  const [planTab, setPlanTab] = useState('subscription');
  const [billing, setBilling] = useState('yearly');

  const subscription = settingsSummary?.subscription || {};
  const currentPlanId = subscription.plan_id || 'free_trial';
  const isFreeCurrent = currentPlanId === 'forever_free' || currentPlanId === 'free_trial';
  const isGrowthCurrent = currentPlanId === 'growth_premium';
  const planProgress = getPlanProgress(subscription);
  const currentPlanName = loadingSettings ? 'Loading current plan...' : (subscription.name || 'Free Business Trial');
  const currentBadge = subscription.badge || subscription.status || 'Active';
  const currentExpiryLabel = currentPlanId === 'free_trial' ? 'Trial expiration date' : 'Current period ends';
  const currentExpiryDate = formatDate(subscription.current_period_end || subscription.trial_expires_at);
  const freeFeatures = isFreeCurrent && subscription.features?.length ? subscription.features : DEFAULT_FREE_FEATURES;
  const growthFeatures = isGrowthCurrent && subscription.features?.length ? subscription.features : DEFAULT_GROWTH_FEATURES;
  const growthMonthlyPrice = isGrowthCurrent ? subscription.price_monthly : 3250;
  const growthYearlyPrice = isGrowthCurrent ? subscription.price_yearly : 39000;
  const growthHalfYearlyPrice = isGrowthCurrent ? subscription.price_half_yearly : 22500;
  const growthBillingText = billing === 'half'
    ? `Billed half yearly (${formatCurrency(growthHalfYearlyPrice)} per store)`
    : `Billed annually (${formatCurrency(growthYearlyPrice)} per store)`;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Underline tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0">
          {['subscription', 'invoices', 'billing'].map(t => (
            <button key={t} onClick={() => setPlanTab(t)}
              className={`px-1 pb-3.5 mr-8 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition-all ${
                planTab === t 
                  ? 'border-indigo-600 text-indigo-650 font-black' 
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}>
              {t === 'billing' ? 'Billing Details' : t}
            </button>
          ))}
        </div>
      </div>

      {planTab === 'subscription' && (
        <div className="space-y-6">
          {/* Current plan progress bar card */}
          <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-sm relative">
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-pink-500" />
            
            <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <h3 className="text-base font-black text-slate-900">{currentPlanName}</h3>
                  <span className="text-[9px] font-extrabold text-white bg-pink-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {currentBadge}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{currentExpiryLabel}</p>
                <p className="text-xs font-black text-slate-700 mt-0.5">{currentExpiryDate}</p>
                {planProgress.daysLeft > 0 && (
                  <p className="text-[10px] text-indigo-600 font-bold mt-1">{planProgress.daysLeft} days left</p>
                )}
              </div>
              <div className="w-full sm:w-48 bg-slate-100 h-2 rounded-full overflow-hidden relative shadow-inner flex-shrink-0">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${planProgress.pct}%` }} />
              </div>
            </div>
          </div>

          {/* Billing toggle */}
          <div className="flex justify-center">
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
              <button onClick={() => setBilling('half')}
                className="px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                style={billing === 'half' ? { background: 'white', color: '#4f46e5', boxWidth: '0 2px 6px rgba(0,0,0,0.05)' } : { color: '#64748b' }}>
                Half Yearly Plan
              </button>
              <button onClick={() => setBilling('yearly')}
                className="px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                style={billing === 'yearly' ? { background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)' } : { color: '#64748b' }}>
                Yearly Plan (Save 29%)
              </button>
            </div>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Forever Free */}
            <div className="bg-white border-2 border-slate-150 rounded-3xl p-6 flex flex-col justify-between min-h-[400px]">
              <div>
                <p className="text-xs font-bold text-slate-450 uppercase tracking-widest">Base Entry</p>
                <p className="text-base font-black text-slate-800 mt-1">Forever Free tier</p>
                <div className="flex items-baseline gap-1 mt-3 mb-4 border-b border-slate-100 pb-4">
                  <span className="text-3xl font-black text-slate-900">₹0</span>
                  <span className="text-xs text-slate-400">/ forever free</span>
                </div>
                <p className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wide mb-3">Included features</p>
                <div className="space-y-3">
                  {freeFeatures.map(f => (
                    <div key={f} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                        <CheckIcon className="w-3 h-3 text-slate-555 stroke-[3px]" />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="btn-secondary w-full py-2.5 justify-center mt-6 disabled:opacity-50 text-xs font-bold" disabled={isFreeCurrent}>
                {isFreeCurrent ? 'Current Plan' : 'Available Plan'}
              </button>
            </div>

            {/* Growth Yearly */}
            <div className="border-2 rounded-3xl p-6 relative flex flex-col justify-between min-h-[400px] bg-gradient-to-br from-indigo-50/40 via-indigo-50/10 to-white overflow-hidden" 
              style={{ borderColor: '#6366f1' }}>
              <div className="absolute -right-10 -top-10 w-28 h-28 bg-indigo-500/5 rounded-full blur-xl" />
              
              <div>
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-indigo-605 uppercase tracking-widest">Complete Pack</p>
                  <span className="text-[8px] font-extrabold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Highly Recommended
                  </span>
                </div>
                <p className="text-base font-black text-slate-800 mt-1">Growth Premium package</p>
                <div className="flex items-baseline gap-1 mt-3 mb-1">
                  <span className="text-3xl font-black text-slate-900">{formatCurrency(growthMonthlyPrice)}</span>
                  <span className="text-xs text-slate-450 font-bold">/{subscription.billing_label || 'month per store'}</span>
                </div>
                <p className="text-[10px] text-slate-450 font-semibold border-b border-slate-100 pb-4 mb-4">{growthBillingText}</p>
                
                <p className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wide mb-3">All Free features, plus</p>
                <div className="space-y-3">
                  {growthFeatures.map(f => (
                    <div key={f} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 border border-indigo-200">
                        <CheckIcon className="w-3 h-3 text-indigo-700 stroke-[3px]" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => toast.success('Upgrade checkout initiated')}
                disabled={isGrowthCurrent}
                className="btn-primary w-full py-2.5 mt-6 shadow-lg shadow-indigo-200"
              >
                {isGrowthCurrent ? 'Current Plan' : 'Upgrade Store Platform'}
              </button>
            </div>
          </div>
        </div>
      )}

      {planTab === 'invoices' && (
        <div className="bg-white border border-slate-150 rounded-3xl p-10 flex flex-col items-center gap-3 text-center shadow-sm">
          <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🧾</div>
          <p className="text-sm font-black text-slate-850">No invoice records found</p>
          <p className="text-xs text-slate-400 font-semibold max-w-xs">Invoice summaries will generate automatically here after your first premium billing checkout cycle.</p>
        </div>
      )}

      {planTab === 'billing' && (
        <div className="max-w-md space-y-4 bg-white border border-slate-150 p-6 rounded-3xl shadow-sm">
          <h3 className="text-sm font-black text-slate-850 pb-2 border-b border-slate-100">Billing Information</h3>
          {[
            { label: 'Company Full Name', placeholder: 'e.g. Finance Enterprises Ltd.' },
            { label: 'Primary Billing Email', placeholder: 'rajamit22ve@gmail.com' },
            { label: 'Registered Business Name', placeholder: 'e.g. Finance Inc.' },
            { label: 'GSTIN Registration (Optional)', placeholder: '22AAAAA0000A1Z5' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">{f.label}</label>
              <input className="input-field py-2.5 text-xs font-semibold" placeholder={f.placeholder} />
            </div>
          ))}
          <button onClick={() => toast.success('Billing details saved successfully!')}
            className="btn-primary w-full py-2.5 font-bold shadow-md">
            Save Billing Parameters
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SETTINGS PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.activeTab || 'account';
  });
  const [settingsSummary, setSettingsSummary] = useState(null);
  const [creditBalances, setCreditBalances] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingCredits, setLoadingCredits] = useState(true);

  useEffect(() => {
    if (location.state?.activeTab) {
      Promise.resolve().then(() => setActiveTab(location.state.activeTab));
    }
  }, [location.state]);

  useEffect(() => {
    api.get('/brand-owner/settings-summary')
      .then(r => setSettingsSummary(r.data || null))
      .catch(() => setSettingsSummary(null))
      .finally(() => setLoadingSettings(false));
  }, []);

  useEffect(() => {
    api.get('/brand-owner/credits')
      .then(r => setCreditBalances(r.data || null))
      .catch(() => setCreditBalances(null))
      .finally(() => setLoadingCredits(false));
  }, []);

  const subscription = settingsSummary?.subscription || {};
  const planProgress = getPlanProgress(subscription);
  const brandName = settingsSummary?.brand?.name || user?.brand_name || 'Cuben Retailer';
  const planName = subscription.name || 'Free Trial';

  return (
    <div className="flex h-full overflow-hidden bg-white animate-slide-up rounded-3xl border border-slate-150">

      {/* ── Inner sidebar ── */}
      <div className="w-52 flex-shrink-0 flex flex-col border-r border-slate-150 bg-slate-50/80">
        
        {/* Brand logo container */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-150 bg-slate-100/30">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-tr from-indigo-500 to-pink-500 shadow-sm">
            <span className="font-black text-sm text-white">{brandName.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <span className="text-xs font-black tracking-tight text-slate-800 block leading-none">{brandName}</span>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mt-1.5">Settings console</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {SETTINGS_NAV.map(item => {
            const Icon = NavIcons[item.id];
            const isActive = activeTab === item.id;
            
            if (item.id === 'dashboard') {
              return (
                <button key={item.id} onClick={() => navigate('/dashboard')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-extrabold text-slate-500 hover:text-indigo-650 hover:bg-indigo-50/50 transition-all duration-150 text-left"
                >
                  <span className="flex-shrink-0"><Icon /></span>
                  Dashboard Return
                </button>
              );
            }
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 text-left"
                style={isActive
                  ? { 
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                      color: 'white', 
                      boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)' 
                    }
                  : { color: '#64748b' }
                }
              >
                <span className="flex-shrink-0"><Icon /></span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Trial banner + Upgrade card */}
        <div className="px-4 pb-5 space-y-3 pt-4 border-t border-slate-150 bg-slate-100/20">
          <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-3">
            <span className="text-[8px] font-extrabold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {loadingSettings ? 'Loading Plan' : planName}
            </span>
            <p className="text-[10px] text-slate-550 leading-relaxed mt-2 font-semibold">
              {planProgress.daysLeft > 0 ? (
                <>You have <span className="font-extrabold text-indigo-600">{planProgress.daysLeft} days left</span> in your current plan.</>
              ) : (
                <>Your current plan status is <span className="font-extrabold text-indigo-600">{subscription.status || 'active'}</span>.</>
              )}
            </p>
          </div>
          <button
            className="w-full py-2.5 text-xs font-black text-white rounded-xl shadow-md transition-all duration-200 active:scale-95 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
            onClick={() => setActiveTab('plan')}
          >
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* ── Content area ── */}
      <div className="flex-1 overflow-y-auto px-8 py-7 bg-slate-50/30">
        {/* Page title row */}
        {activeTab !== 'store' && activeTab !== 'team' && activeTab !== 'channels' && activeTab !== 'faq' && activeTab !== 'plan' && (
          <h1 className="text-xl font-black text-slate-900 mb-6 tracking-tight">{PAGE_TITLES[activeTab]}</h1>
        )}

        <div className="animate-slide-up">
          {activeTab === 'account'  && <AccountTab user={user} />}
          {activeTab === 'store'    && <StoreTab user={user} />}
          {activeTab === 'team'     && <TeamTab user={user} />}
          {activeTab === 'channels' && (
            <ChannelsTab
              setupIntent={location.state?.setup}
              settingsSummary={settingsSummary}
              creditBalances={creditBalances}
              loadingCredits={loadingCredits}
            />
          )}
          {activeTab === 'faq'      && <FAQTab />}
          {activeTab === 'plan'     && <PlanTab settingsSummary={settingsSummary} loadingSettings={loadingSettings} />}
        </div>
      </div>
    </div>
  );
}
