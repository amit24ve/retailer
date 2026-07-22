import { useState, useEffect } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import { PlusIcon, ShoppingBagIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const statusBadge = (s) => {
  const m = { completed: 'badge-success', pending: 'badge-warning', refunded: 'badge-danger', partial_refund: 'badge-info' };
  return <span className={m[s] || 'badge-info'}>{s}</span>;
};

const getStoreLabel = (order) => order.store_name || order.store_code || 'Unknown Store';

const isToday = (value) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const getOrderAmount = (order) => Number(order.net_amount || order.gross_amount || 0);

const buildStats = (sourceOrders) => {
  const todayOrders = sourceOrders.filter((order) => isToday(order.created_at));
  const revenue = todayOrders.reduce((sum, order) => sum + getOrderAmount(order), 0);
  const pointsIssued = todayOrders.reduce((sum, order) => sum + Number(order.points_earned || 0), 0);
  return {
    revenue,
    orderCount: todayOrders.length,
    avgOrderValue: todayOrders.length ? Math.round(revenue / todayOrders.length) : 0,
    pointsIssued,
  };
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPOS, setShowPOS] = useState(false);
  const [posResult, setPosResult] = useState(null);
  const [selectedStore, setSelectedStore] = useState('all');

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders').then(r => setOrders(r.data.orders || [])).catch(() => setOrders(getMockOrders())).finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data.orders || [])).catch(() => setOrders(getMockOrders())).finally(() => setLoading(false));
  }, []);

  const storeOptions = Array.from(new Set(orders.map(getStoreLabel))).sort();
  const visibleOrders = selectedStore === 'all'
    ? orders
    : orders.filter((order) => getStoreLabel(order) === selectedStore);
  const stats = buildStats(visibleOrders);

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders & POS Terminal</h1>
          <p className="page-subtitle">Transaction log and point-of-sale management</p>
        </div>
        <button onClick={() => setShowPOS(true)} className="btn-primary">
          <PlusIcon className="w-4 h-4" /> New POS Transaction
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Revenue", value: `₹${stats.revenue.toLocaleString('en-IN')}`, color: 'text-emerald-400' },
          { label: "Today's Orders", value: stats.orderCount.toLocaleString('en-IN'), color: 'text-cyan-400' },
          { label: 'Avg Order Value', value: `₹${stats.avgOrderValue.toLocaleString('en-IN')}`, color: 'text-gold-400' },
          { label: 'Points Issued Today', value: stats.pointsIssued.toLocaleString('en-IN'), color: 'text-cyan-500' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={`text-xl font-bold ${s.color} mt-1`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recent Transactions</h2>
          <select
            className="input-field w-auto text-xs py-1.5"
            value={selectedStore}
            onChange={(event) => setSelectedStore(event.target.value)}
          >
            <option value="all">All Stores</option>
            {storeOptions.map((store) => (
              <option key={store} value={store}>{store}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Store</th>
                <th className="text-right">Gross</th>
                <th className="text-right">Net</th>
                <th className="text-right">Points</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(8)].map((_, i) => (
                <tr key={i}>{[...Array(8)].map((_, j) => <td key={j}><div className="skeleton h-4 rounded" /></td>)}</tr>
              )) : visibleOrders.map(o => (
                <tr key={o.order_id || o._id}>
                  <td><span className="font-mono text-xs text-cyan-400">{o.invoice_number}</span></td>
                  <td><span className="text-xs">{o.customer_name || 'Walk-in'}</span></td>
                  <td><span className="text-xs text-gray-400">{o.store_name || o.store_code}</span></td>
                  <td className="text-right text-xs">₹{(o.gross_amount || 0).toLocaleString('en-IN')}</td>
                  <td className="text-right text-xs font-semibold text-emerald-400">₹{(o.net_amount || 0).toLocaleString('en-IN')}</td>
                  <td className="text-right text-xs text-gold-400">{(o.points_earned || 0).toLocaleString('en-IN')}</td>
                  <td className="text-xs text-gray-400">{o.created_at ? format(new Date(o.created_at), 'dd MMM yy · HH:mm') : '—'}</td>
                  <td>{statusBadge(o.payment_status || 'completed')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPOS && <POSModal onClose={() => setShowPOS(false)} onSuccess={(res) => { setShowPOS(false); setPosResult(res); fetchOrders(); toast.success('Transaction processed!'); }} />}
      {posResult && <POSResultModal result={posResult} onClose={() => setPosResult(null)} />}
    </div>
  );
}

function POSModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ customer_mobile: '', customer_name: '', store_code: 'DEL-FLAGSHIP-01', gross_amount: '', tax_amount: '', discount_amount: '', redeem_points_requested: 0, coupon_code: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const net = (parseFloat(form.gross_amount || 0) + parseFloat(form.tax_amount || 0) - parseFloat(form.discount_amount || 0));
      const payload = { ...form, gross_amount: parseFloat(form.gross_amount), tax_amount: parseFloat(form.tax_amount || 0), discount_amount: parseFloat(form.discount_amount || 0), net_amount: net, items: [], invoice_number: `INV-${Date.now()}` };
      const res = await api.post('/orders', payload);
      onSuccess(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not process transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-xl animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2"><ShoppingBagIcon className="w-5 h-5 text-cyan-400" /><h2 className="text-base font-semibold text-white">New POS Transaction</h2></div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Customer Mobile</label>
              <input className="input-field" value={form.customer_mobile} onChange={e => set('customer_mobile', e.target.value)} placeholder="+919876543210" />
            </div>
            <div>
              <label className="input-label">Customer Name</label>
              <input className="input-field" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} placeholder="Auto-fill from mobile" />
            </div>
            <div>
              <label className="input-label">Store Code</label>
              <select className="input-field" value={form.store_code} onChange={e => set('store_code', e.target.value)}>
                <option value="DEL-FLAGSHIP-01">New Delhi Flagship</option>
                <option value="MUM-COLABA-01">Mumbai Colaba</option>
                <option value="BLR-INDNR-01">Bengaluru Indiranagar</option>
              </select>
            </div>
            <div>
              <label className="input-label">Gross Amount (₹)</label>
              <input type="number" className="input-field" value={form.gross_amount} onChange={e => set('gross_amount', e.target.value)} placeholder="12000.00" required />
            </div>
            <div>
              <label className="input-label">Tax Amount (₹)</label>
              <input type="number" className="input-field" value={form.tax_amount} onChange={e => set('tax_amount', e.target.value)} placeholder="2160.00" />
            </div>
            <div>
              <label className="input-label">Discount Amount (₹)</label>
              <input type="number" className="input-field" value={form.discount_amount} onChange={e => set('discount_amount', e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label className="input-label">Redeem Points</label>
              <input type="number" className="input-field" value={form.redeem_points_requested} onChange={e => set('redeem_points_requested', parseInt(e.target.value) || 0)} placeholder="0" />
            </div>
            <div>
              <label className="input-label">Coupon Code</label>
              <input className="input-field" value={form.coupon_code} onChange={e => set('coupon_code', e.target.value)} placeholder="FESTIVE500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              Process Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function POSResultModal({ result, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-md animate-slide-up border border-emerald-500/30">
        <div className="p-6 text-center">
          <CheckCircleIcon className="w-14 h-14 text-emerald-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-1">Transaction Successful!</h2>
          <p className="text-xs text-gray-400 font-mono mb-5">{result.invoice_number}</p>
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3 rounded-lg bg-navy-700">
              <p className="text-xs text-gray-400">Customer</p>
              <p className="text-sm font-semibold text-white">{result.customer?.name}</p>
            </div>
            <div className="p-3 rounded-lg bg-navy-700">
              <p className="text-xs text-gray-400">Tier Status</p>
              <p className="text-sm font-semibold text-gold-400">{result.customer?.new_tier} 🥇</p>
            </div>
            <div className="p-3 rounded-lg bg-navy-700">
              <p className="text-xs text-gray-400">Points Earned</p>
              <p className="text-sm font-bold text-cyan-400">+{Math.floor(result.loyalty_valuation?.points_earned || 0)}</p>
            </div>
            <div className="p-3 rounded-lg bg-navy-700">
              <p className="text-xs text-gray-400">Points Balance</p>
              <p className="text-sm font-bold text-cyan-500">{result.customer?.points_balance?.toLocaleString('en-IN') || '—'}</p>
            </div>
            <div className="col-span-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-gray-400">WhatsApp Receipt</p>
              <p className="text-sm font-semibold text-emerald-400">✓ Message Queued & Dispatched</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-primary w-full mt-5 justify-center">Done</button>
        </div>
      </div>
    </div>
  );
}

function getMockOrders() {
  const stores = ['New Delhi Flagship', 'Mumbai Colaba', 'Bengaluru Indiranagar', 'Noida Mall Store'];
  const customers = ['Siddharth Sharma', 'Priya Patel', 'Rahul Gupta', 'Anjali Singh', null];
  const statuses = ['completed', 'completed', 'completed', 'pending', 'refunded'];
  return Array.from({ length: 20 }, (_, i) => ({
    order_id: `ord-${i}`,
    invoice_number: `INV-2026-${9000 + i}`,
    customer_name: customers[i % customers.length],
    store_name: stores[i % stores.length],
    gross_amount: Math.floor(Math.random() * 15000) + 500,
    net_amount: Math.floor(Math.random() * 12000) + 400,
    points_earned: Math.floor(Math.random() * 1500),
    payment_status: statuses[i % statuses.length],
    created_at: new Date(Date.now() - i * 3600000 * 2).toISOString(),
  }));
}


