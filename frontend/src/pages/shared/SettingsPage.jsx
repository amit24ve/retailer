import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { CheckIcon, PlusIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// ─── Inner sidebar nav icons (thin-line, matching screenshot) ─────────────────
const NavIcons = {
  dashboard: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </svg>
  ),
  account: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  store: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18l-2 9H5L3 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12v7a1 1 0 001 1h12a1 1 0 001-1v-7" />
    </svg>
  ),
  team: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="9" cy="7" r="3" />
      <circle cx="15" cy="7" r="3" />
      <path strokeLinecap="round" d="M2 20c0-3.3 3.1-6 7-6M22 20c0-3.3-3.1-6-7-6" />
    </svg>
  ),
  channels: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  plan: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path strokeLinecap="round" d="M2 10h20" />
    </svg>
  ),
};

const SETTINGS_NAV = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'account', label: 'Your Account' },
  { id: 'store', label: 'Store Details' },
  { id: 'team', label: 'Invite team' },
  { id: 'channels', label: 'Channels' },
  { id: 'plan', label: 'My Plan' },
];

const PAGE_TITLES = {
  account: 'Account Details',
  store: 'My Store',
  team: 'Team',
  channels: 'Channels',
  plan: 'My Plan',
};

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT DETAILS — matches screenshot 1
// ─────────────────────────────────────────────────────────────────────────────
function AccountTab({ user }) {
  const [form, setForm] = useState({
    name: user?.full_name || 'Amit Kumar',
    email: user?.email || 'rajamit22ve@gmail.com',
    mobile: user?.mobile || '9807429743',
  });
  const [editField, setEditField] = useState(null);
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const saveField = async (label) => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false); setEditField(null);
    toast.success(`${label} updated!`);
  };
  const changePw = async () => {
    if (!pwForm.new || pwForm.new !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setSaving(false);
    setPwForm({ current: '', new: '', confirm: '' });
    setShowPw(false);
    toast.success('Password changed!');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 max-w-4xl">
      {/* Left — greeting card */}
      <div className="rounded-2xl p-6 border border-slate-200 relative overflow-hidden" style={{ background: '#f4f6f8' }}>
        <div className="relative z-10">
          <p className="text-sm text-slate-500 mb-0.5">Hello,</p>
          <h2 className="text-2xl font-black text-slate-900 mb-3">{form.name}</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-5">
            This is your Cuben Retailer account and It has been exactly{' '}
            <span className="font-bold text-slate-900">4 Days 20 hrs &amp; 29 minutes</span> since you joined us!
          </p>
          <div>
            <p className="text-sm text-slate-600 mb-0.5">Your last login</p>
            <p className="text-sm text-slate-600">Looks auspicious?</p>
            <button className="text-sm font-semibold text-slate-800 underline">Report this</button>
          </div>
        </div>
        {/* SVG illustration — person with login card (matching screenshot) */}
        <div className="absolute right-4 bottom-2">
          <svg viewBox="0 0 140 140" className="w-36 h-36" fill="none">
            {/* Login card */}
            <rect x="48" y="18" width="72" height="88" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
            {/* Person icon on card */}
            <circle cx="84" cy="44" r="12" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
            <circle cx="84" cy="40" r="5" fill="#94a3b8" opacity="0.5" />
            <path d="M72 58 Q84 52 96 58" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Input fields */}
            <rect x="56" y="72" width="56" height="8" rx="3" fill="#e2e8f0" />
            <rect x="56" y="86" width="56" height="8" rx="3" fill="#e2e8f0" />
            {/* Password dots */}
            {[0, 1, 2, 3, 4].map(i => (
              <circle key={i} cx={60 + i * 10} cy={102} r={2.5} fill="#94a3b8" opacity="0.6" />
            ))}
            {/* Person body */}
            <circle cx="28" cy="50" r="11" stroke="#a89442" strokeWidth="1.5" fill="#f0fdfa" />
            <path d="M18 65 Q28 60 38 65 L40 96 Q28 102 16 96 Z" stroke="#a89442" strokeWidth="1.5" fill="#f0fdfa" />
            {/* Arms reaching to card */}
            <path d="M38 72 Q46 76 52 80" stroke="#a89442" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M16 70 Q8 74 6 82" stroke="#a89442" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Bow-tie */}
            <path d="M24 64 L28 68 L32 64 Z" fill="#a89442" opacity="0.8" />
            <path d="M24 72 L28 68 L32 72 Z" fill="#a89442" opacity="0.8" />
          </svg>
        </div>
      </div>

      {/* Right — form */}
      <div className="space-y-4">
        {[
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'email', label: 'Email', type: 'email' },
          { key: 'mobile', label: 'Mobile Number', type: 'tel' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{f.label}</label>
            <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden">
              <input
                type={f.type}
                readOnly={editField !== f.key}
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="flex-1 px-4 py-3 text-sm bg-transparent text-slate-800 focus:outline-none"
              />
              {editField === f.key ? (
                <div className="flex items-center flex-shrink-0 border-l border-slate-100">
                  <button onClick={() => saveField(f.label)} disabled={saving}
                    className="px-4 py-3 text-xs font-bold text-amber-700 hover:bg-cyan-50 transition-colors">
                    {saving ? '…' : 'Save'}
                  </button>
                  <button onClick={() => setEditField(null)}
                    className="px-3 py-3 text-xs text-slate-400 hover:text-slate-600 border-l border-slate-100 transition-colors">
                    ✕
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditField(f.key)}
                  className="px-4 py-3 text-xs font-bold text-amber-700 border-l border-slate-100 hover:bg-cyan-50 transition-colors flex-shrink-0">
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="pt-1">
          <button
            onClick={() => setShowPw(v => !v)}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-colors"
          >
            Change Password
          </button>
        </div>

        {showPw && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 animate-slide-up">
            <p className="text-sm font-bold text-slate-900">Update Password</p>
            {[
              { key: 'current', label: 'Current Password' },
              { key: 'new', label: 'New Password' },
              { key: 'confirm', label: 'Confirm New Password' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{f.label}</label>
                <input type="password"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 bg-white"
                  value={pwForm[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder="••••••••" />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button onClick={changePw} disabled={saving}
                className="px-5 py-2.5 text-sm font-bold text-white rounded-xl flex items-center gap-2 transition-all"
                style={{ background: '#a89442' }}>
                {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Update Password
              </button>
              <button onClick={() => setShowPw(false)}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
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
// MY STORE — matches screenshot 2
// ─────────────────────────────────────────────────────────────────────────────
function StoreTab({ user }) {
  const [showAddStore, setShowAddStore] = useState(false);
  const [stores] = useState([
    {
      id: 's1', name: user?.brand_name || 'finance',
      industry: 'Retail', category: 'Grocery / Convenience Store',
      city: 'noida', state: 'Uttar Pradesh', pos: 'Not integrated',
    },
  ]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">My Store</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            You have <span className="font-bold text-slate-700">{stores.length} Active</span> {stores.length === 1 ? 'store' : 'stores'}
          </p>
        </div>
        <button
          onClick={() => setShowAddStore(true)}
          className="flex items-center gap-1.5 text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-all shadow-md"
          style={{ background: '#a89442' }}
        >
          <PlusIcon className="w-4 h-4" /> Add new store
        </button>
      </div>

      {/* Store cards */}
      {stores.map(store => (
        <div key={store.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {/* Store name header row */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {/* Square logo */}
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-black uppercase leading-tight text-center px-0.5">
                  {store.name.slice(0, 3).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-bold text-slate-900">{store.name}</span>
            </div>
            <button className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-amber-700 transition-colors">
              View More Details <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Profile section */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-bold text-slate-800">Profile</span>
            </div>

            {/* 5 column info grid — matching screenshot */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-y-4 gap-x-4">
              {[
                { label: 'Industry', value: store.industry },
                { label: 'Category', value: store.category },
                { label: 'City', value: store.city },
                { label: 'State', value: store.state },
                { label: 'POS Name', value: store.pos },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-xs text-slate-400 mb-0.5">{f.label}</p>
                  <p className="text-sm font-bold text-slate-900">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Add store modal */}
      {showAddStore && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Add New Store</h3>
              <button onClick={() => setShowAddStore(false)} className="text-slate-400 hover:text-slate-700 text-xl">×</button>
            </div>
            {[
              { label: 'Store Name', placeholder: 'e.g. Mumbai Flagship' },
              { label: 'City', placeholder: 'e.g. Mumbai' },
              { label: 'State', placeholder: 'e.g. Maharashtra' },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{f.label}</label>
                <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
                  placeholder={f.placeholder} />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button onClick={() => { toast.success('Store added!'); setShowAddStore(false); }}
                className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl" style={{ background: '#a89442' }}>
                Add Store
              </button>
              <button onClick={() => setShowAddStore(false)}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">
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
// INVITE TEAM — matches screenshot 3
// ─────────────────────────────────────────────────────────────────────────────
function TeamTab({ user }) {
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('marketing');

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Hero banner — matching screenshot */}
      <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-black text-white bg-cyan-500 px-2.5 py-1 rounded-full">NEW</span>
              <span className="text-xs font-black text-white bg-orange-400 px-2.5 py-1 rounded-full flex items-center gap-1">
                🚀 INCLUDED IN GROWTH PLAN
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">
              Invite your team 👩‍💼 👨‍💼 and<br />enhance collaboration
            </h2>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Add your team to Cuben Retailer, assign permissions,<br />and manage their activity- all in one place.
            </p>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 border border-slate-300 bg-white px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] flex items-center justify-center font-black">▶</span>
                Learn more
              </button>
              <button onClick={() => setShowInvite(true)}
                className="flex items-center gap-1.5 text-sm font-bold text-white px-4 py-2 rounded-xl transition-all"
                style={{ background: '#a89442' }}>
                Invite team member <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Team role bubbles — matching screenshot */}
          <div className="flex-shrink-0 flex flex-col items-end gap-3 mr-4">
            <div className="text-sm font-bold text-slate-700 text-right mb-1">Teams</div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-2 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-amber-200 flex items-center justify-center text-sm flex-shrink-0">👩</div>
              <span className="text-xs font-semibold text-slate-700 leading-tight">Marketing<br />Manager</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-2 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center text-sm flex-shrink-0">👨</div>
              <span className="text-xs font-semibold text-slate-700 leading-tight">Operation<br />Manager</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current user — Amit Kumar row */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {/* Name header */}
        <div className="px-5 py-4 border-b border-dashed border-slate-200">
          <h3 className="text-base font-bold text-slate-900">{user?.full_name || 'Amit Kumar'}</h3>
        </div>
        {/* Details grid — matching screenshot exactly */}
        <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-4">
          {[
            { label: 'Role', value: 'Owner' },
            { label: 'Mobile', value: user?.mobile || '9807429743' },
            { label: 'Email', value: user?.email || 'rajamit22ve@gmail.com' },
            { label: 'Created On', value: '9th Jun 2026, Tuesday' },
          ].map(f => (
            <div key={f.label}>
              <p className="text-xs text-slate-400 mb-0.5">{f.label}</p>
              <p className="text-sm font-bold text-slate-900">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Invite Team Member</h3>
              <button onClick={() => setShowInvite(false)} className="text-slate-400 hover:text-slate-700 text-xl">×</button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
              <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
                value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@email.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Role</label>
              <div className="grid grid-cols-2 gap-2">
                {['Marketing Manager', 'Store Manager', 'Cashier', 'Customer Support', 'Operation Manager', 'Analyst'].map(r => (
                  <label key={r} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all text-xs font-semibold ${role === r ? 'border-yellow-600 bg-cyan-50 text-amber-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="w-3.5 h-3.5" style={{ accentColor: '#a89442' }} />
                    {r}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => { toast.success(`Invite sent to ${email}!`); setShowInvite(false); setEmail(''); }}
                className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl" style={{ background: '#a89442' }}>
                Send Invite
              </button>
              <button onClick={() => setShowInvite(false)}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">
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
// CHANNELS — matches screenshot 4
// ─────────────────────────────────────────────────────────────────────────────
function ChannelsTab() {
  const [activeChannel, setActiveChannel] = useState(null);

  const CHANNELS = [
    {
      id: 'sms', label: 'SMS', color: '#0ea5e9', bg: '#eff6ff', icon: () => (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      id: 'email', label: 'Email', color: '#f97316', bg: '#fff7ed', icon: () => (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'wa-util', label: 'Whatsapp Utility', color: '#06b6d4', bg: '#f0fdf4', icon: () => (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      )
    },
    {
      id: 'wa-mkt', label: 'Whatsapp Marketing', color: '#ec4899', bg: '#fdf4ff', icon: () => (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      )
    },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header row with 3 buttons — matching screenshot */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Channels</h2>
          <p className="text-sm text-slate-500 mt-0.5">Click on the channel to see their details and reports</p>
        </div>
        <div className="flex gap-2">
          {[
            { label: 'Refill history', icon: '🕐' },
            { label: 'Channel Settings', icon: '⚙️' },
            { label: 'Refill Credits', icon: '💳' },
          ].map(b => (
            <button key={b.label} onClick={() => toast.success(`${b.label} clicked`)}
              className="flex items-center gap-1.5 text-xs font-bold text-white px-3.5 py-2 rounded-xl transition-all"
              style={{ background: '#a89442' }}>
              <span>{b.icon}</span> {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 channel tiles — matching screenshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CHANNELS.map(ch => {
          const Icon = ch.icon;
          return (
            <button key={ch.id}
              onClick={() => setActiveChannel(activeChannel === ch.id ? null : ch.id)}
              className="flex items-center justify-between px-4 py-5 rounded-2xl border-2 transition-all hover:shadow-md text-left"
              style={{
                background: ch.bg,
                borderColor: activeChannel === ch.id ? ch.color : 'transparent',
              }}>
              <div className="flex items-center gap-2.5">
                <span style={{ color: ch.color }}><Icon /></span>
                <span className="text-sm font-bold text-slate-800">{ch.label}</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-400" />
            </button>
          );
        })}
      </div>

      {/* Custom header setup card — matching screenshot */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-6 p-6">
          <div className="flex-1">
            <h3 className="text-base font-black text-slate-900 mb-1.5">
              Setup your Custom Header for communication channels
            </h3>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              Reach your customers through your custom header for SMS and Business Account for WhatsApp.
            </p>
            <div className="flex gap-2">
              <button onClick={() => toast.success('WhatsApp setup opening...')}
                className="flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl"
                style={{ background: '#25d366' }}>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </button>
              <button onClick={() => toast.success('SMS setup opening...')}
                className="flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl"
                style={{ background: '#0ea5e9' }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                SMS
              </button>
            </div>
          </div>
          {/* Phone mockup preview */}
          <div className="flex-shrink-0 w-32 h-28 relative">
            <div className="w-24 h-full bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl mx-auto">
              <div className="h-3 bg-black flex items-center justify-center">
                <div className="w-10 h-1.5 bg-slate-700 rounded-full" />
              </div>
              <div className="p-2 space-y-1.5">
                <div className="bg-white rounded-lg p-1.5">
                  <p className="text-[7px] font-bold text-slate-800">Lucky Store ✓</p>
                  <div className="w-full h-8 bg-gradient-to-br from-orange-200 to-red-200 rounded mt-1 flex items-center justify-center text-base">👗</div>
                </div>
                <div className="bg-cyan-500 rounded-lg p-1.5">
                  <p className="text-[6px] text-white font-semibold">Limited edition 50% Discount Coupon!</p>
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-2 w-16 h-20 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5">
              <div className="bg-slate-50 rounded-lg p-1 h-full">
                <p className="text-[6px] text-slate-500 font-semibold mb-1">We know what your closet</p>
                <div className="w-full h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded flex items-center justify-center text-xs">🛍️</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MY PLAN — matches screenshot 5
// ─────────────────────────────────────────────────────────────────────────────
function PlanTab() {
  const [planTab, setPlanTab] = useState('subscription');
  const [billing, setBilling] = useState('yearly');

  const GROWTH_FEATURES = [
    'Branded Loyalty Program', 'Customer Feedback', 'Increase Online Reviews',
    'Auto-Campaigns', 'WhatsApp Campaigns', 'Referral Program',
    'Membership', 'QR Codes', 'Smart Insights', 'Priority Support',
  ];
  const FREE_FEATURES = [
    'Campaigns via SMS and Email',
    'Customer Insights',
    'Business Insights',
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Underline tabs — Subscription, Invoices, Billing Details */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0">
          {['subscription', 'invoices', 'billing'].map(t => (
            <button key={t} onClick={() => setPlanTab(t)}
              className={`px-1 pb-3 mr-8 text-sm font-semibold capitalize border-b-2 -mb-px transition-all ${planTab === t ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}>
              {t === 'billing' ? 'Billing Details' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {planTab === 'subscription' && (
        <div className="space-y-5">
          {/* Current plan bar — teal progress bar style matching screenshot */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {/* Teal progress bar at top */}
            <div className="h-2 w-full" style={{ background: '#a89442' }} />
            <div className="px-6 py-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-black text-slate-900">Free Trial</h3>
                  <span className="text-xs font-bold text-white px-2.5 py-1 rounded-full" style={{ background: '#a89442' }}>
                    Current Plan
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Plan Ends on</p>
                <p className="text-sm font-bold text-slate-900">19-Jun-26</p>
              </div>
            </div>
          </div>

          {/* Billing toggle */}
          <div className="flex justify-center">
            <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200">
              <button onClick={() => setBilling('half')}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
                style={billing === 'half' ? { background: 'white', color: '#0f172a', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } : { color: '#64748b' }}>
                Half Yearly
              </button>
              <button onClick={() => setBilling('yearly')}
                className="px-5 py-2 rounded-full text-sm font-bold transition-all"
                style={billing === 'yearly' ? { background: '#a89442', color: 'white', boxShadow: '0 1px 6px rgba(13,148,136,0.35)' } : { color: '#64748b' }}>
                Yearly (Save 29%)
              </button>
            </div>
          </div>

          {/* Plan cards — Forever Free + Growth Yearly */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Forever Free */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
              <p className="text-base font-black text-slate-700 mb-0.5">Forever Free 🎉</p>
              <p className="text-4xl font-black text-slate-900 mb-1">Free</p>
              <p className="text-sm text-slate-400 mb-5 flex items-center gap-1">Our promise for forever free 💛</p>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">What's included</p>
              <div className="space-y-2.5">
                {FREE_FEATURES.map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                      <CheckIcon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-slate-700">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Yearly — highlighted with border */}
            <div className="border-2 rounded-2xl p-6 relative" style={{ borderColor: '#a89442', background: '#f0fdf9' }}>
              <p className="text-base font-black text-slate-900 mb-0.5">Growth yearly 🚀</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black text-slate-900">₹3250</span>
                <span className="text-sm text-slate-400">/month per store</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">Billed every 12 months</p>
              <button className="w-full py-3 text-sm font-black text-white rounded-xl mb-4 transition-all hover:opacity-90"
                style={{ background: '#a89442' }}>
                Upgrade
              </button>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wide mb-3">Everything in Forever Free, plus</p>
              <div className="space-y-2.5">
                {GROWTH_FEATURES.map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                      <CheckIcon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-slate-700">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {planTab === 'invoices' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">🧾</div>
          <p className="text-base font-bold text-slate-800">No invoices yet</p>
          <p className="text-sm text-slate-400">Your invoices will appear here after upgrading</p>
        </div>
      )}

      {planTab === 'billing' && (
        <div className="max-w-md space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Billing Information</h3>
          {[
            { label: 'Full Name', placeholder: 'Amit Kumar' },
            { label: 'Email', placeholder: 'rajamit22ve@gmail.com' },
            { label: 'Company Name', placeholder: 'Finance Ltd.' },
            { label: 'GSTIN (optional)', placeholder: '22AAAAA0000A1Z5' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{f.label}</label>
              <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 bg-white"
                placeholder={f.placeholder} />
            </div>
          ))}
          <button onClick={() => toast.success('Billing details saved!')}
            className="px-5 py-2.5 text-sm font-bold text-white rounded-xl" style={{ background: '#a89442' }}>
            Save Billing Details
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SETTINGS PAGE — inner sidebar layout matching all screenshots
// ─────────────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');

  return (
    <div className="flex h-full overflow-hidden bg-white animate-slide-up">

      {/* ── Inner sidebar ── */}
      <div className="w-48 flex-shrink-0 flex flex-col border-r" style={{ background: '#d5f7f3', borderColor: '#a8ede6' }}>
        {/* Cuben Retailer logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b" style={{ borderColor: '#a8ede6' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #e6dbae 0%, #c9b96e 100%)' }}>
            <span className="font-black text-sm" style={{ color: '#5a3e00' }}>C</span>
          </div>
          <span className="text-lg font-black tracking-tight" style={{ color: '#1a4a45' }}>Cuben Retailer</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {SETTINGS_NAV.map(item => {
            const Icon = NavIcons[item.id];
            const isActive = activeTab === item.id;
            if (item.id === 'dashboard') {
              return (
                <button key={item.id} onClick={() => navigate('/dashboard')}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left"
                  style={{ color: '#4a7a74' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.55)'; e.currentTarget.style.color = '#1a4a45'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#4a7a74'; }}
                >
                  <span className="flex-shrink-0" style={{ color: '#4a7a74' }}><Icon /></span>
                  Dashboard
                </button>
              );
            }
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left"
                style={isActive
                  ? { background: 'linear-gradient(90deg, #e6dbae 0%, #c9b96e 100%)', color: '#5a3e00', boxShadow: '0 2px 8px rgba(201,185,110,0.30)' }
                  : { color: '#4a7a74' }
                }
              >
                <span className="flex-shrink-0"><Icon /></span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Content area ── */}
      <div className="flex-1 overflow-y-auto px-8 py-7">
        {/* Page title */}
        {activeTab !== 'store' && activeTab !== 'team' && activeTab !== 'channels' && activeTab !== 'plan' && (
          <h1 className="text-2xl font-black text-slate-900 mb-6">{PAGE_TITLES[activeTab]}</h1>
        )}

        {activeTab === 'account' && <AccountTab user={user} />}
        {activeTab === 'store' && <StoreTab user={user} />}
        {activeTab === 'team' && <TeamTab user={user} />}
        {activeTab === 'channels' && <ChannelsTab />}
        {activeTab === 'plan' && <PlanTab />}
      </div>
    </div>
  );
}


