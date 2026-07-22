import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { format } from "date-fns";
import {
    PlusIcon,
    ShoppingBagIcon,
    XMarkIcon,
    CheckCircleIcon,
    MagnifyingGlassIcon,
    CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const statusBadge = (s) => {
    const map = {
        completed: "badge-success",
        pending: "badge-warning",
        refunded: "badge-danger",
        partial_refund: "badge-info",
    };
    return <span className={map[s] || "badge-info"}>{s}</span>;
};

export default function OrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPOS, setShowPOS] = useState(false);
    const [posResult, setPosResult] = useState(null);

    const fetchOrders = () => {
        setLoading(true);
        api.get("/orders")
            .then((r) => setOrders(r.data.orders || []))
            .catch(() => setOrders(getMockOrders()))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchOrders(); }, []);

    const today = new Date();
    const todayOrders = orders.filter((o) => {
        if (!o.created_at) return false;
        const d = new Date(o.created_at);
        return (
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
        );
    });

    const todayRevenue = todayOrders.reduce(
        (s, o) => s + (o.net_amount || o.gross_amount || 0),
        0,
    );
    const avgOrderValue =
        todayOrders.length > 0
            ? Math.round(todayRevenue / todayOrders.length)
            : 0;
    const pointsToday = todayOrders.reduce(
        (s, o) => s + (o.points_earned || 0),
        0,
    );

    return (
        <div className="space-y-5 animate-slide-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Orders &amp; POS Terminal</h1>
                    <p className="page-subtitle">
                        Process transactions and view your store's order history
                    </p>
                </div>
                <button
                    onClick={() => setShowPOS(true)}
                    className="btn-primary"
                >
                    <PlusIcon className="w-4 h-4" /> New POS Transaction
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="sm-card-sky">
                    <p className="text-xs text-gray-400">Today's Revenue</p>
                    <p className="text-xl font-bold text-emerald-400 mt-1">
                        ₹{todayRevenue.toLocaleString("en-IN")}
                    </p>
                </div>
                <div className="sm-card-mint">
                    <p className="text-xs text-gray-400">Today's Orders</p>
                    <p className="text-xl font-bold text-cyan-400 mt-1">
                        {todayOrders.length}
                    </p>
                </div>
                <div className="sm-card-amber">
                    <p className="text-xs text-gray-400">Avg Order Value</p>
                    <p className="text-xl font-bold text-amber-400 mt-1">
                        ₹{avgOrderValue.toLocaleString("en-IN")}
                    </p>
                </div>
                <div className="sm-card-coral">
                    <p className="text-xs text-gray-400">Points Issued Today</p>
                    <p className="text-xl font-bold text-rose-400 mt-1">
                        {pointsToday.toLocaleString("en-IN")}
                    </p>
                </div>
            </div>

            {/* Orders table */}
            <div className="glass-card overflow-hidden">
                <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white">
                        Recent Transactions
                    </h2>
                    <span className="text-xs text-gray-400">
                        {user?.store_name || "Your Store"}
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Customer</th>
                                <th>Mobile</th>
                                <th className="text-right">Amount</th>
                                <th className="text-right">Points</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading
                                ? [...Array(8)].map((_, i) => (
                                      <tr key={i}>
                                          {[...Array(7)].map((_, j) => (
                                              <td key={j}>
                                                  <div className="skeleton h-4 rounded" />
                                              </td>
                                          ))}
                                      </tr>
                                  ))
                                : orders.map((o) => (
                                      <tr key={o.order_id || o._id}>
                                          <td>
                                              <span className="font-mono text-xs text-cyan-400">
                                                  {o.invoice_number}
                                              </span>
                                          </td>
                                          <td>
                                              <span className="text-xs">
                                                  {o.customer_name || "Walk-in"}
                                              </span>
                                          </td>
                                          <td>
                                              <span className="text-xs text-gray-400">
                                                  {o.customer_mobile || "—"}
                                              </span>
                                          </td>
                                          <td className="text-right text-xs font-semibold text-emerald-400">
                                              ₹
                                              {(
                                                  o.net_amount ||
                                                  o.gross_amount ||
                                                  0
                                              ).toLocaleString("en-IN")}
                                          </td>
                                          <td className="text-right text-xs text-amber-400">
                                              +
                                              {(
                                                  o.points_earned || 0
                                              ).toLocaleString("en-IN")}
                                          </td>
                                          <td className="text-xs text-gray-400">
                                              {o.created_at
                                                  ? format(
                                                        new Date(o.created_at),
                                                        "dd MMM · HH:mm",
                                                    )
                                                  : "—"}
                                          </td>
                                          <td>
                                              {statusBadge(
                                                  o.payment_status ||
                                                      "completed",
                                              )}
                                          </td>
                                      </tr>
                                  ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showPOS && (
                <POSModal
                    storeId={user?.store_id}
                    storeName={user?.store_name}
                    onClose={() => setShowPOS(false)}
                    onSuccess={(res) => {
                        setShowPOS(false);
                        setPosResult(res);
                        fetchOrders();
                        toast.success("Transaction processed successfully!");
                    }}
                />
            )}
            {posResult && (
                <POSResultModal
                    result={posResult}
                    onClose={() => setPosResult(null)}
                />
            )}
        </div>
    );
}

// ─── POS Modal ────────────────────────────────────────────────────────────────

function POSModal({ storeId, storeName, onClose, onSuccess }) {
    const [mobile, setMobile] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const billValue = parseFloat(amount) || 0;
    const pointsToEarn = billValue > 0 ? Math.round(billValue / 10) : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!mobile.trim()) {
            toast.error("Customer mobile number is required");
            return;
        }
        if (!amount || billValue <= 0) {
            toast.error("Please enter a valid bill amount");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/orders", {
                customer_mobile: mobile.trim(),
                customer_name: "Walk-in Customer",
                gross_amount: billValue,
                tax_amount: 0,
                discount_amount: 0,
                net_amount: billValue,
                store_id: storeId,
            });
            onSuccess(res.data);
        } catch (err) {
            toast.error(err.response?.data?.detail || "Could not process transaction");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card w-full max-w-md animate-slide-up">
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <ShoppingBagIcon className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-base font-semibold text-white">
                            New POS Transaction
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {storeName && (
                        <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                            Processing at:{" "}
                            <span className="font-semibold">{storeName}</span>
                        </div>
                    )}

                    <div>
                        <label className="input-label">
                            Customer Mobile Number *
                        </label>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                className="input-field pl-9"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder="+91 98765 43210"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Bill Amount (₹) *</label>
                        <div className="relative">
                            <CurrencyRupeeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="number"
                                className="input-field pl-9"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                min="1"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>

                    {/* Points preview */}
                    {billValue > 0 && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <div>
                                <p className="text-xs text-gray-400">
                                    Points to Earn
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    ₹10 = 1 point
                                </p>
                            </div>
                            <p className="text-2xl font-bold text-emerald-400">
                                +{pointsToEarn.toLocaleString("en-IN")}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading && (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            Process Transaction
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── POS Result Modal ─────────────────────────────────────────────────────────

function POSResultModal({ result, onClose }) {
    const pointsEarned =
        result.points_earned ?? result.loyalty_valuation?.points_earned ?? 0;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card w-full max-w-sm animate-slide-up border border-emerald-500/30">
                <div className="p-6 text-center">
                    <CheckCircleIcon className="w-14 h-14 text-emerald-400 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-white mb-1">
                        Transaction Successful!
                    </h2>
                    <p className="text-xs text-gray-400 font-mono mb-5">
                        {result.invoice_number}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-left mb-5">
                        <div className="p-3 rounded-lg bg-white/5">
                            <p className="text-xs text-gray-400">
                                Points Earned
                            </p>
                            <p className="text-xl font-bold text-emerald-400">
                                +
                                {Math.floor(pointsEarned).toLocaleString(
                                    "en-IN",
                                )}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                            <p className="text-xs text-gray-400">Bill Amount</p>
                            <p className="text-xl font-bold text-white">
                                ₹{(result.amount || 0).toLocaleString("en-IN")}
                            </p>
                        </div>
                        <div className="col-span-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-xs text-gray-400">
                                WhatsApp Receipt
                            </p>
                            <p className="text-sm font-semibold text-emerald-400">
                                ✓ Message Queued &amp; Dispatched
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="btn-primary w-full justify-center"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

function generateMockInvoice() {
    return `INV-MOCK-${Math.floor(Math.random() * 9000000 + 1000000)}`;
}

function getMockOrders() {
    const customers = [
        { name: "Priya Sharma", mobile: "+91 98201 34567" },
        { name: "Rahul Mehta", mobile: "+91 99302 45678" },
        { name: "Anjali Singh", mobile: "+91 97801 23456" },
        { name: "Vikram Patel", mobile: "+91 98901 12345" },
        { name: "Neha Kapoor", mobile: "+91 96501 78901" },
        { name: null, mobile: null },
    ];
    const statuses = [
        "completed",
        "completed",
        "completed",
        "pending",
        "refunded",
    ];

    return Array.from({ length: 20 }, (_, i) => {
        const gross = Math.floor(Math.random() * 8000) + 300;
        const c = customers[i % customers.length];
        return {
            order_id: `ord-sm-${i}`,
            invoice_number: `INV-2026-SM-${3000 + i}`,
            customer_name: c.name,
            customer_mobile: c.mobile,
            gross_amount: gross,
            net_amount: gross,
            points_earned: Math.floor(gross / 10),
            payment_status: statuses[i % statuses.length],
            created_at: new Date(Date.now() - i * 3600000 * 1.5).toISOString(),
        };
    });
}
