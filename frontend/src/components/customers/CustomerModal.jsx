import React, { useState } from 'react';
import api from '../../services/api';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CustomerModal({ onClose, onSuccess, initialData }) {
  const [form, setForm] = useState(initialData || {
    name: '', mobile: '', email: '', gender: '', dob: '', anniversary: '',
    address: '', city: '', state: '', pincode: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await api.put(`/customers/${initialData.customer_id}`, form);
        toast.success('Customer updated!');
      } else {
        await api.post('/customers', form);
        toast.success('Customer created!');
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-base font-semibold text-white">{initialData ? 'Edit Customer' : 'Add New Customer'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"><XMarkIcon className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Full Name *</label>
              <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Siddharth Sharma" required />
            </div>
            <div>
              <label className="input-label">Mobile Number *</label>
              <input className="input-field" value={form.mobile} onChange={e => set('mobile', e.target.value)} placeholder="+91 98765 43210" required />
            </div>
            <div>
              <label className="input-label">Email Address</label>
              <input type="email" className="input-field" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
            </div>
            <div>
              <label className="input-label">Gender</label>
              <select className="input-field" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">Select gender</option>
                <option>Male</option><option>Female</option><option>Other</option><option>Undisclosed</option>
              </select>
            </div>
            <div>
              <label className="input-label">Date of Birth</label>
              <input type="date" className="input-field" value={form.dob} onChange={e => set('dob', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Anniversary Date</label>
              <input type="date" className="input-field" value={form.anniversary} onChange={e => set('anniversary', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="input-label">Address</label>
            <input className="input-field" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="input-label">City</label>
              <input className="input-field" value={form.city} onChange={e => set('city', e.target.value)} placeholder="New Delhi" />
            </div>
            <div>
              <label className="input-label">State</label>
              <input className="input-field" value={form.state} onChange={e => set('state', e.target.value)} placeholder="Delhi" />
            </div>
            <div>
              <label className="input-label">Pincode</label>
              <input className="input-field" value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="110001" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {initialData ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
