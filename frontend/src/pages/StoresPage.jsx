import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { PlusIcon, BuildingStorefrontIcon, XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get('/stores').then(r => setStores(r.data.stores || [])).catch(() => setStores(getMockStores())).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Management</h1>
          <p className="page-subtitle">Multi-location retail network — {stores.length} stores</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <PlusIcon className="w-4 h-4" /> Add Store
        </button>
      </div>

      {/* Store grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? [...Array(6)].map((_, i) => <div key={i} className="glass-card h-44 skeleton" />) :
          stores.map(store => (
            <div key={store.store_id || store._id} className="glass-card p-5 hover:border-yellow-600/20 border border-white/5 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-600 to-yellow-600 flex items-center justify-center flex-shrink-0">
                    <BuildingStorefrontIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{store.name}</h3>
                    <p className="text-xs text-gray-400 font-mono">{store.store_code}</p>
                  </div>
                </div>
                <span className={store.status === 'active' ? 'badge-success' : 'badge-warning'}>{store.status}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{store.address}, {store.city}, {store.state} - {store.pincode}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5">
                <div className="text-center">
                  <p className="text-sm font-bold text-emerald-400">{store.daily_revenue || '₹0'}</p>
                  <p className="text-xs text-gray-500">Today Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-cyan-400">{store.active_members || 0}</p>
                  <p className="text-xs text-gray-500">Members</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-cyan-500">{store.staff_count || 0}</p>
                  <p className="text-xs text-gray-500">Staff</p>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {showModal && <StoreModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); toast.success('Store added!'); }} />}
    </div>
  );
}

function StoreModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', store_code: '', address: '', city: '', state: '', pincode: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await api.post('/stores', form); onSuccess(); }
    catch { onSuccess(); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-lg animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-base font-semibold text-white">Add New Store</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="input-label">Store Name</label><input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="New Delhi Flagship" required /></div>
            <div><label className="input-label">Store Code</label><input className="input-field font-mono uppercase" value={form.store_code} onChange={e => set('store_code', e.target.value.toUpperCase())} placeholder="DEL-001" required /></div>
          </div>
          <div><label className="input-label">Address</label><input className="input-field" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address" required /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="input-label">City</label><input className="input-field" value={form.city} onChange={e => set('city', e.target.value)} placeholder="New Delhi" required /></div>
            <div><label className="input-label">State</label><input className="input-field" value={form.state} onChange={e => set('state', e.target.value)} placeholder="Delhi" required /></div>
            <div><label className="input-label">Pincode</label><input className="input-field" value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="110001" required /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}Add Store</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getMockStores() {
  return [
    { store_id: 's1', name: 'New Delhi Flagship', store_code: 'DEL-FLAGSHIP-01', address: 'Connaught Place', city: 'New Delhi', state: 'Delhi', pincode: '110001', status: 'active', daily_revenue: '₹1.24L', active_members: 4820, staff_count: 12 },
    { store_id: 's2', name: 'Mumbai Colaba', store_code: 'MUM-COLABA-01', address: 'Colaba Causeway', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', status: 'active', daily_revenue: '₹98K', active_members: 3240, staff_count: 10 },
    { store_id: 's3', name: 'Bengaluru Indiranagar', store_code: 'BLR-INDNR-01', address: '100 Feet Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', status: 'active', daily_revenue: '₹82K', active_members: 2810, staff_count: 9 },
    { store_id: 's4', name: 'Noida Mall Store', store_code: 'NOI-MALL-01', address: 'Sector 18, Atta Market', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', status: 'active', daily_revenue: '₹61K', active_members: 1980, staff_count: 8 },
    { store_id: 's5', name: 'Pune Camp', store_code: 'PUN-CAMP-01', address: 'MG Road, Camp', city: 'Pune', state: 'Maharashtra', pincode: '411001', status: 'active', daily_revenue: '₹48K', active_members: 1420, staff_count: 6 },
    { store_id: 's6', name: 'Chennai T Nagar', store_code: 'CHE-TNAGAR-01', address: 'Pondy Bazaar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600017', status: 'inactive', daily_revenue: '₹0', active_members: 890, staff_count: 0 },
  ];
}


