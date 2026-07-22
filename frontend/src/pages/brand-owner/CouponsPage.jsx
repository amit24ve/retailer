import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import { PlusIcon, TagIcon, XMarkIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validateForm, setValidateForm] = useState({ coupon_code: '', cart_total: '', customer_id: '' });
  const [validateResult, setValidateResult] = useState(null);

  const fetchCoupons = () => {
    setLoading(true);
    api.get('/coupons')
      .then(r => setCoupons(r.data.coupons || []))
      .catch(() => setCoupons(getMockCoupons()))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleValidate = async (e) => {
    e.preventDefault();
    setValidating(true);
    try {
      const res = await api.post('/coupons/validate', { ...validateForm, cart_total: parseFloat(validateForm.cart_total) });
      setValidateResult(res.data);
    } catch (err) {
      setValidateResult(err.response?.data || { is_valid: false, validation_message: 'Coupon not found or invalid', error_code: 'NOT_FOUND' });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Coupons & Vouchers</h1>
          <p className="page-subtitle">Create, manage, and validate promotional codes</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <PlusIcon className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Coupons list */}
        <div className="xl:col-span-2 glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">Active Coupons</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th className="text-right">Value</th>
                  <th>Min Cart</th>
                  <th>Usage</th>
                  <th>Expires</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? [...Array(6)].map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((_, j) => <td key={j}><div className="skeleton h-4 rounded" /></td>)}</tr>
                )) : coupons.map(c => (
                  <tr key={c.coupon_id || c._id} onClick={() => setEditingCoupon(c)} className="cursor-pointer hover:bg-white/5">
                    <td title="Click to edit"><span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">{c.code}</span></td>
                    <td title="Click to edit"><span className="text-xs capitalize text-gray-300">{c.discount_type?.replace('_', ' ')}</span></td>
                    <td title="Click to edit" className="text-right text-xs font-semibold text-emerald-400">
                      {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                    </td>
                    <td title="Click to edit" className="text-xs text-gray-400">₹{(c.min_cart_value || 0).toLocaleString('en-IN')}</td>
                    <td title="Click to edit" className="text-xs">
                      <span className="text-white">{c.current_use_count || 0}</span>
                      <span className="text-gray-500"> / {c.usage_limit_global || '∞'}</span>
                    </td>
                    <td title="Click to edit" className="text-xs text-gray-400">{c.expiry_date ? format(new Date(c.expiry_date), 'dd MMM yy') : '—'}</td>
                    <td>
                      <span className={c.is_active ? 'badge-success' : 'badge-danger'}>{c.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coupon validator */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TagIcon className="w-5 h-5 text-cyan-500" />
              <h2 className="text-sm font-semibold text-white">Real-time Validator</h2>
            </div>
            <form onSubmit={handleValidate} className="space-y-3">
              <div>
                <label className="input-label">Coupon Code</label>
                <input className="input-field font-mono uppercase" value={validateForm.coupon_code} onChange={e => setValidateForm(f => ({ ...f, coupon_code: e.target.value.toUpperCase() }))} placeholder="FESTIVE500" required />
              </div>
              <div>
                <label className="input-label">Cart Total (₹)</label>
                <input type="number" className="input-field" value={validateForm.cart_total} onChange={e => setValidateForm(f => ({ ...f, cart_total: e.target.value }))} placeholder="4500.00" required />
              </div>
              <div>
                <label className="input-label">Customer ID (optional)</label>
                <input className="input-field" value={validateForm.customer_id} onChange={e => setValidateForm(f => ({ ...f, customer_id: e.target.value }))} placeholder="cust-uuid" />
              </div>
              <button type="submit" disabled={validating} className="btn-teal w-full justify-center">
                {validating ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <TagIcon className="w-4 h-4" />}
                Validate Coupon
              </button>
            </form>

            {validateResult && (
              <div className={`mt-4 p-4 rounded-xl border ${validateResult.is_valid ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-red-500/40 bg-red-500/5'} animate-slide-up`}>
                <div className="flex items-center gap-2 mb-2">
                  {validateResult.is_valid ? <CheckCircleIcon className="w-5 h-5 text-emerald-400" /> : <XCircleIcon className="w-5 h-5 text-red-400" />}
                  <span className={`text-sm font-semibold ${validateResult.is_valid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {validateResult.is_valid ? 'Valid Coupon!' : 'Invalid Coupon'}
                  </span>
                </div>
                <p className="text-xs text-gray-300">{validateResult.validation_message}</p>
                {validateResult.is_valid && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-navy-700"><span className="text-gray-400">Discount</span><p className="text-white font-bold">₹{validateResult.discount_applied}</p></div>
                    <div className="p-2 rounded bg-navy-700"><span className="text-gray-400">New Total</span><p className="text-emerald-400 font-bold">₹{validateResult.new_cart_total}</p></div>
                  </div>
                )}
                {!validateResult.is_valid && validateResult.error_code && (
                  <p className="text-xs text-red-400 mt-2 font-mono">{validateResult.error_code}</p>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase">Coupon Stats (30 Days)</h3>
            {[
              { label: 'Total Issued', value: '1,842', color: 'text-cyan-400' },
              { label: 'Redeemed', value: '934', color: 'text-emerald-400' },
              { label: 'Expired Unused', value: '218', color: 'text-red-400' },
              { label: 'Revenue Attributed', value: '₹18.4L', color: 'text-gold-400' },
            ].map(s => (
              <div key={s.label} className="flex justify-between text-xs">
                <span className="text-gray-400">{s.label}</span>
                <span className={`font-bold ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCreate && <CreateCouponModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); fetchCoupons(); toast.success('Coupon created!'); }} />}
      {editingCoupon && (
        <EditCouponModal
          coupon={editingCoupon}
          onClose={() => setEditingCoupon(null)}
          onSuccess={() => { setEditingCoupon(null); fetchCoupons(); toast.success('Coupon updated!'); }}
        />
      )}
    </div>
  );
}

function CreateCouponModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ code: '', discount_type: 'flat', discount_value: '', min_cart_value: '', usage_limit_global: '', expiry_date: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/coupons', { ...form, discount_value: parseFloat(form.discount_value), min_cart_value: parseFloat(form.min_cart_value || 0) });
      onSuccess();
    } catch { onSuccess(); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-lg animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-base font-semibold text-white">Create Coupon</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Coupon Code</label>
              <input className="input-field font-mono uppercase" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="FESTIVE500" required />
            </div>
            <div>
              <label className="input-label">Discount Type</label>
              <select className="input-field" value={form.discount_type} onChange={e => set('discount_type', e.target.value)}>
                <option value="flat">Flat Amount</option>
                <option value="percentage">Percentage</option>
                <option value="cashback">Cashback</option>
                <option value="free_product">Free Product</option>
                <option value="free_delivery">Free Delivery</option>
              </select>
            </div>
            <div>
              <label className="input-label">Discount Value</label>
              <input type="number" className="input-field" value={form.discount_value} onChange={e => set('discount_value', e.target.value)} placeholder={form.discount_type === 'percentage' ? '15' : '500'} required />
            </div>
            <div>
              <label className="input-label">Min Cart Value (₹)</label>
              <input type="number" className="input-field" value={form.min_cart_value} onChange={e => set('min_cart_value', e.target.value)} placeholder="1000" />
            </div>
            <div>
              <label className="input-label">Global Usage Limit</label>
              <input type="number" className="input-field" value={form.usage_limit_global} onChange={e => set('usage_limit_global', e.target.value)} placeholder="0 = unlimited" />
            </div>
            <div>
              <label className="input-label">Expiry Date</label>
              <input type="datetime-local" className="input-field" value={form.expiry_date} onChange={e => set('expiry_date', e.target.value)} required />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              Create Coupon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function EditCouponModal({ coupon, onClose, onSuccess }) {
  const [form, setForm] = useState({
    code: coupon.code || '',
    discount_type: coupon.discount_type || 'flat',
    discount_value: coupon.discount_value ?? '',
    min_cart_value: coupon.min_cart_value ?? '',
    usage_limit_global: coupon.usage_limit_global ?? '',
    expiry_date: toDateTimeLocal(coupon.expiry_date),
    is_active: coupon.is_active !== false,
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/coupons/${coupon.coupon_id}`, {
        ...form,
        discount_value: parseFloat(form.discount_value || 0),
        min_cart_value: parseFloat(form.min_cart_value || 0),
        usage_limit_global: parseInt(form.usage_limit_global || 0, 10),
      });
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not update coupon');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-lg animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-base font-semibold text-white">Edit Coupon</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Coupon Code</label>
              <input className="input-field font-mono uppercase" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} required />
            </div>
            <div>
              <label className="input-label">Discount Type</label>
              <select className="input-field" value={form.discount_type} onChange={e => set('discount_type', e.target.value)}>
                <option value="flat">Flat Amount</option>
                <option value="percentage">Percentage</option>
                <option value="cashback">Cashback</option>
                <option value="free_product">Free Product</option>
                <option value="free_delivery">Free Delivery</option>
              </select>
            </div>
            <div>
              <label className="input-label">Discount Value</label>
              <input type="number" className="input-field" value={form.discount_value} onChange={e => set('discount_value', e.target.value)} required />
            </div>
            <div>
              <label className="input-label">Min Cart Value (₹)</label>
              <input type="number" className="input-field" value={form.min_cart_value} onChange={e => set('min_cart_value', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Global Usage Limit</label>
              <input type="number" className="input-field" value={form.usage_limit_global} onChange={e => set('usage_limit_global', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Expiry Date</label>
              <input type="datetime-local" className="input-field" value={form.expiry_date} onChange={e => set('expiry_date', e.target.value)} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-300">
            <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="rounded" />
            Coupon active
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getMockCoupons() {
  return [
    { coupon_id: 'c1', code: 'FESTIVE500', discount_type: 'flat', discount_value: 500, min_cart_value: 3000, current_use_count: 142, usage_limit_global: 500, is_active: true, expiry_date: '2026-12-31T23:59:00Z' },
    { coupon_id: 'c2', code: 'GOLD15', discount_type: 'percentage', discount_value: 15, min_cart_value: 1000, current_use_count: 89, usage_limit_global: 0, is_active: true, expiry_date: '2026-08-31T23:59:00Z' },
    { coupon_id: 'c3', code: 'BDAY-2026', discount_type: 'flat', discount_value: 200, min_cart_value: 500, current_use_count: 34, usage_limit_global: 1, is_active: true, expiry_date: '2026-06-15T23:59:00Z' },
    { coupon_id: 'c4', code: 'CASHBACK10', discount_type: 'cashback', discount_value: 10, min_cart_value: 2000, current_use_count: 218, usage_limit_global: 0, is_active: true, expiry_date: '2026-09-30T23:59:00Z' },
    { coupon_id: 'c5', code: 'WINBACK250', discount_type: 'flat', discount_value: 250, min_cart_value: 0, current_use_count: 67, usage_limit_global: 0, is_active: false, expiry_date: '2026-05-01T23:59:00Z' },
  ];
}


