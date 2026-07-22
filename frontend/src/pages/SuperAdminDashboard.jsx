import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  UserPlusIcon, ShieldCheckIcon, ChatBubbleOvalLeftIcon,
  DevicePhoneMobileIcon, ExclamationCircleIcon,
  ArrowPathIcon, EyeIcon, EyeSlashIcon, XMarkIcon,
  PencilSquareIcon, BuildingOffice2Icon,
} from '@heroicons/react/24/outline';

// ─── Credit Pill ─────────────────────────────────────────────────────────────
const CreditPill = ({ icon, label, value, bg, textColor }) => (
  <div className={`${bg} rounded-xl px-4 py-3 flex items-center gap-3`}>
    <span className="text-2xl">{icon}</span>
    <div>
      <p className={`text-xl font-black ${textColor}`}>{value.toLocaleString('en-IN')}</p>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
    </div>
  </div>
);

// ─── Credit Bar ──────────────────────────────────────────────────────────────
const CreditBar = ({ label, used, total, color }) => {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="text-xs font-bold text-slate-800">{used.toLocaleString('en-IN')} / {total.toLocaleString('en-IN')}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
    status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-red-400'}`} />
    {status === 'active' ? 'Active' : 'Inactive'}
  </span>
);

// ─── Edit Credits Modal ───────────────────────────────────────────────────────
function EditCreditsModal({ brandOwner, onClose, onSaved }) {
  const [sms, setSms] = useState(brandOwner.credits?.sms ?? 100);
  const [waUtility, setWaUtility] = useState(brandOwner.credits?.wa_utility ?? 100);
  const [waMarketing, setWaMarketing] = useState(brandOwner.credits?.wa_marketing ?? 100);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/credits/${brandOwner.brand_id}`, {
        sms: Number(sms),
        wa_utility: Number(waUtility),
        wa_marketing: Number(waMarketing),
      });
      toast.success('Credits updated!');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update credits');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
          <div>
            <p className="text-sm font-black text-white">Edit Credits</p>
            <p className="text-xs text-indigo-300 mt-0.5">{brandOwner.brand_name} · {brandOwner.email}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <XMarkIcon className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {[
            { label: '📱 SMS Credits', value: sms, setter: setSms },
            { label: '💚 WhatsApp Utility Credits', value: waUtility, setter: setWaUtility },
            { label: '💗 WhatsApp Marketing Credits', value: waMarketing, setter: setWaMarketing },
          ].map(field => (
            <div key={field.label}>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{field.label}</label>
              <input
                type="number" min="0"
                value={field.value}
                onChange={e => field.setter(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
              />
            </div>
          ))}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)' }}>
            {saving ? 'Saving...' : 'Save Credits'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Brand Owner Modal ─────────────────────────────────────────────────
function CreateBrandOwnerModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', brand_name: '',
    phone: '', sms_credits: 500, wa_utility_credits: 200, wa_marketing_credits: 200,
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Name required';
    if (!form.email.trim()) e.email = 'Email required';
    if (!form.password || form.password.length < 6) e.password = 'Minimum 6 characters';
    if (!form.brand_name.trim()) e.brand_name = 'Brand name required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post('/admin/create-brand-owner', {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        brand_name: form.brand_name,
        phone: form.phone || undefined,
        sms_credits: Number(form.sms_credits),
        wa_utility_credits: Number(form.wa_utility_credits),
        wa_marketing_credits: Number(form.wa_marketing_credits),
      });
      toast.success(`Brand Owner "${form.full_name}" created successfully!`);
      onCreated(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create brand owner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">

        {/* Modal Header */}
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)', borderRadius: '16px 16px 0 0' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <UserPlusIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-base font-black text-white">Create Brand Owner</p>
              <p className="text-xs text-indigo-300 mt-0.5">New brand + owner account will be created</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <XMarkIcon className="w-4 h-4 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Account section */}
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Full Name *</label>
              <input type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)}
                placeholder="Rajesh Kumar"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 ${errors.full_name ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-400'}`} />
              {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Phone</label>
              <input type="text" value={form.phone} onChange={e => update('phone', e.target.value)}
                placeholder="+91 98000 00000"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email Address *</label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
              placeholder="owner@brand.com"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-400'}`} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Password *</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)}
                placeholder="Minimum 6 characters"
                className={`w-full border rounded-xl px-4 py-2.5 pr-11 text-sm text-slate-800 focus:outline-none focus:ring-2 ${errors.password ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-400'}`} />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* Brand section */}
          <div className="pt-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Brand Details</p>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Brand Name *</label>
              <input type="text" value={form.brand_name} onChange={e => update('brand_name', e.target.value)}
                placeholder="Fashion Brand India"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 ${errors.brand_name ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-400'}`} />
              {errors.brand_name && <p className="text-xs text-red-500 mt-1">{errors.brand_name}</p>}
            </div>
          </div>

          {/* Credits section */}
          <div className="pt-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Initial Credits</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '📱 SMS', key: 'sms_credits' },
                { label: '💚 WA Utility', key: 'wa_utility_credits' },
                { label: '💗 WA Marketing', key: 'wa_marketing_credits' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{f.label}</label>
                  <input type="number" min="0" value={form[f.key]} onChange={e => update(f.key, e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)' }}>
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
              ) : (
                <><UserPlusIcon className="w-4 h-4" /> Create Brand Owner</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [brandOwners, setBrandOwners] = useState([]);
  const [platformCredits, setPlatformCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/admin/brand-owners').catch(() => ({ data: { brand_owners: [], total: 0 } })),
      api.get('/admin/platform-credits').catch(() => ({
        data: { platform_totals: { sms: 0, wa_utility: 0, wa_marketing: 0 }, per_brand: [], total_brands: 0 },
      })),
    ]).then(([boRes, crRes]) => {
      const bos = boRes.data.brand_owners || [];
      setBrandOwners(
        bos.length > 0 ? bos : [{
          user_id: 'demo-u1', full_name: 'Rajesh Kumar', email: 'brandowner@fashionbrand.io',
          phone: '+91 9800000001', status: 'active', brand_id: 'brand-fashion-india-001',
          brand_name: 'Fashion Brand India', last_login: new Date().toISOString(),
          credits: { sms: 340, email: 100, wa_utility: 180, wa_marketing: 90 },
          stats: { total_customers: 48, total_orders: 120, total_revenue: 842884 },
        }]
      );
      const cr = crRes.data;
      setPlatformCredits(
        cr.total_brands > 0 ? cr : {
          platform_totals: { sms: 340, wa_utility: 180, wa_marketing: 90 },
          per_brand: [{ brand_id: 'b1', brand_name: 'Fashion Brand India', credits: { sms: 340, wa_utility: 180, wa_marketing: 90 } }],
          total_brands: 1,
        }
      );
    }).finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent border-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const totals = platformCredits?.platform_totals || { sms: 0, wa_utility: 0, wa_marketing: 0 };

  return (
    <div className="space-y-6 pb-10">

      {/* ── Header Banner ── */}
      <div className="rounded-2xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
        </div>
        <div className="relative px-7 py-6 flex flex-col xl:flex-row items-start xl:items-center gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheckIcon className="w-5 h-5 text-purple-300" />
              <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">Super Admin Console</span>
            </div>
            <h1 className="text-2xl font-black text-white mb-1">
              Welcome, {user?.full_name || 'Administrator'} 👋
            </h1>
            <p className="text-indigo-200 text-sm">
              Create Brand Owners · Monitor SMS & WhatsApp Credits
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={refresh}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <ArrowPathIcon className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #e6dbae 0%, #c9b96e 100%)', color: '#5a3e00' }}>
              <UserPlusIcon className="w-4 h-4" />
              Create Brand Owner
            </button>
          </div>
        </div>
      </div>

      {/* ── Platform Credit Summary ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <DevicePhoneMobileIcon className="w-4 h-4 text-slate-500" />
          <h2 className="text-base font-bold text-slate-800">Platform Credit Overview</h2>
          <span className="text-xs text-slate-400 ml-1">· All brands combined</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CreditPill icon="📱" label="Total SMS Credits" value={totals.sms} bg="bg-blue-50" textColor="text-blue-700" />
          <CreditPill icon="💚" label="WA Utility Credits" value={totals.wa_utility} bg="bg-green-50" textColor="text-green-700" />
          <CreditPill icon="💗" label="WA Marketing Credits" value={totals.wa_marketing} bg="bg-pink-50" textColor="text-pink-700" />
        </div>
      </div>

      {/* ── Brand Owners List ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BuildingOffice2Icon className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-800">Brand Owners</h2>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full ml-1">
              {brandOwners.length}
            </span>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-white px-3.5 py-2 rounded-xl hover:opacity-90 transition-all"
            style={{ background: 'linear-gradient(135deg, #4338ca, #6366f1)' }}>
            <UserPlusIcon className="w-3.5 h-3.5" />
            Add New
          </button>
        </div>

        {brandOwners.length === 0 ? (
          <div className="py-16 text-center">
            <BuildingOffice2Icon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No brand owners yet</p>
            <p className="text-slate-400 text-sm mt-1">Click "Create Brand Owner" to add one</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {brandOwners.map(bo => (
              <div key={bo.user_id} className="p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col xl:flex-row gap-5">

                  {/* Owner Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-black text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
                      {bo.full_name?.charAt(0) || 'B'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-bold text-slate-900">{bo.full_name}</p>
                        <StatusBadge status={bo.status} />
                      </div>
                      <p className="text-xs text-slate-500">{bo.email}</p>
                      {bo.phone && <p className="text-xs text-slate-400 mt-0.5">{bo.phone}</p>}
                      <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                          🏢 {bo.brand_name}
                        </span>
                        <span className="text-xs text-slate-400">👥 {(bo.stats?.total_customers || 0).toLocaleString('en-IN')} customers</span>
                        <span className="text-xs text-slate-400">🛍️ {(bo.stats?.total_orders || 0).toLocaleString('en-IN')} orders</span>
                        <span className="text-xs text-slate-400">
                          💰 ₹{((bo.stats?.total_revenue || 0) / 1000).toFixed(0)}K revenue
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Credits */}
                  <div className="xl:w-72 flex-shrink-0">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">SMS & WA Credits</p>
                        <button onClick={() => setEditingOwner(bo)}
                          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                          <PencilSquareIcon className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {[
                          { label: 'SMS', value: bo.credits?.sms ?? 0, icon: '📱', color: 'text-blue-700', bg: 'bg-blue-50' },
                          { label: 'WA Utility', value: bo.credits?.wa_utility ?? 0, icon: '💚', color: 'text-green-700', bg: 'bg-green-50' },
                          { label: 'WA Mktg', value: bo.credits?.wa_marketing ?? 0, icon: '💗', color: 'text-pink-700', bg: 'bg-pink-50' },
                        ].map(c => (
                          <div key={c.label} className={`${c.bg} rounded-lg px-2 py-2 text-center`}>
                            <p className="text-sm">{c.icon}</p>
                            <p className={`text-sm font-black ${c.color}`}>{c.value.toLocaleString('en-IN')}</p>
                            <p className="text-[10px] text-slate-500 leading-tight">{c.label}</p>
                          </div>
                        ))}
                      </div>
                      {(bo.credits?.sms < 50 || bo.credits?.wa_utility < 50 || bo.credits?.wa_marketing < 50) && (
                        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mt-1">
                          <ExclamationCircleIcon className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          <p className="text-xs text-amber-700 font-medium">Low credits — top up needed</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Per-Brand Credit Bars ── */}
      {(platformCredits?.per_brand?.length > 0) && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ChatBubbleOvalLeftIcon className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-bold text-slate-800">Credit Usage — Per Brand</h2>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {platformCredits.per_brand.map(b => (
              <div key={b.brand_id} className="px-6 py-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                    {b.brand_name?.charAt(0) || 'B'}
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{b.brand_name}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <CreditBar label="📱 SMS" used={b.credits.sms} total={1000} color="bg-blue-500" />
                  <CreditBar label="💚 WA Utility" used={b.credits.wa_utility} total={500} color="bg-green-500" />
                  <CreditBar label="💗 WA Marketing" used={b.credits.wa_marketing} total={500} color="bg-pink-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {showCreate && (
        <CreateBrandOwnerModal onClose={() => setShowCreate(false)} onCreated={refresh} />
      )}
      {editingOwner && (
        <EditCreditsModal brandOwner={editingOwner} onClose={() => setEditingOwner(null)} onSaved={refresh} />
      )}
    </div>
  );
}
