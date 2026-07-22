import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import {
    MagnifyingGlassIcon,
    PlusIcon,
    UsersIcon,
    ArrowsUpDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    UserGroupIcon,
    SparklesIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_CUSTOMERS = [
    {
        customer_id: "c001",
        name: "Siddharth Sharma",
        mobile: "+91 98765 43210",
        email: "siddharth@email.com",
        loyalty_tier: "Gold",
        current_points_balance: 4210,
        last_purchase_date: "2026-06-20T10:30:00Z",
        total_orders: 12,
        status: "active",
        city: "New Delhi",
        visits_to_store: 9,
    },
    {
        customer_id: "c002",
        name: "Priya Patel",
        mobile: "+91 97654 32109",
        email: "priya@email.com",
        loyalty_tier: "Silver",
        current_points_balance: 1540,
        last_purchase_date: "2026-06-22T15:45:00Z",
        total_orders: 5,
        status: "active",
        city: "Mumbai",
        visits_to_store: 5,
    },
    {
        customer_id: "c003",
        name: "Rahul Gupta",
        mobile: "+91 96543 21098",
        email: "rahul@email.com",
        loyalty_tier: "Platinum",
        current_points_balance: 9820,
        last_purchase_date: "2026-06-18T11:20:00Z",
        total_orders: 28,
        status: "active",
        city: "Bangalore",
        visits_to_store: 21,
    },
    {
        customer_id: "c004",
        name: "Anjali Singh",
        mobile: "+91 95432 10987",
        email: "anjali@email.com",
        loyalty_tier: "Diamond",
        current_points_balance: 18400,
        last_purchase_date: "2026-06-25T09:15:00Z",
        total_orders: 47,
        status: "active",
        city: "Pune",
        visits_to_store: 38,
    },
    {
        customer_id: "c005",
        name: "Vikram Mehta",
        mobile: "+91 94321 09876",
        email: "vikram@email.com",
        loyalty_tier: "Silver",
        current_points_balance: 780,
        last_purchase_date: "2026-05-10T14:00:00Z",
        total_orders: 3,
        status: "inactive",
        city: "Hyderabad",
        visits_to_store: 3,
    },
    {
        customer_id: "c006",
        name: "Neha Joshi",
        mobile: "+91 93210 98765",
        email: "neha@email.com",
        loyalty_tier: "Gold",
        current_points_balance: 3310,
        last_purchase_date: "2026-06-15T17:30:00Z",
        total_orders: 15,
        status: "active",
        city: "New Delhi",
        visits_to_store: 12,
    },
    {
        customer_id: "c007",
        name: "Arjun Kumar",
        mobile: "+91 92109 87654",
        email: "arjun@email.com",
        loyalty_tier: "Silver",
        current_points_balance: 1120,
        last_purchase_date: "2026-06-10T12:00:00Z",
        total_orders: 6,
        status: "active",
        city: "Chennai",
        visits_to_store: 6,
    },
    {
        customer_id: "c008",
        name: "Deepa Nair",
        mobile: "+91 91098 76543",
        email: "deepa@email.com",
        loyalty_tier: "Platinum",
        current_points_balance: 7640,
        last_purchase_date: "2026-06-23T16:00:00Z",
        total_orders: 32,
        status: "active",
        city: "Kochi",
        visits_to_store: 25,
    },
    {
        customer_id: "c009",
        name: "Rohan Kapoor",
        mobile: "+91 90987 65432",
        email: "rohan@email.com",
        loyalty_tier: "Gold",
        current_points_balance: 2950,
        last_purchase_date: "2026-06-05T10:45:00Z",
        total_orders: 18,
        status: "active",
        city: "Mumbai",
        visits_to_store: 14,
    },
    {
        customer_id: "c010",
        name: "Sneha Reddy",
        mobile: "+91 89876 54321",
        email: "sneha@email.com",
        loyalty_tier: "Silver",
        current_points_balance: 620,
        last_purchase_date: "2026-04-28T13:20:00Z",
        total_orders: 2,
        status: "inactive",
        city: "Hyderabad",
        visits_to_store: 2,
    },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const TIER_BADGE = {
    Silver: "badge-silver",
    Gold: "badge-gold",
    Platinum: "badge-platinum",
    Diamond: "badge-diamond",
};

const STATUS_CLS = {
    active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    inactive: "bg-amber-50 text-amber-700 border border-amber-200",
};

function fmtDate(iso) {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return "—";
    }
}

// ─── Sort button ──────────────────────────────────────────────────────────────
function SortBtn({ col, onSort }) {
    return (
        <button
            onClick={() => onSort(col)}
            className="ml-1 opacity-40 hover:opacity-100 transition-opacity"
        >
            <ArrowsUpDownIcon className="w-3 h-3" />
        </button>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CustomersPage() {
    const navigate = useNavigate();

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [tierFilter, setTierFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortDir, setSortDir] = useState("asc");
    const [page, setPage] = useState(1);
    const limit = 10;

    // ── Fetch ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        setLoading(true);
        api.get("/customers", {
            params: {
                page,
                limit,
                search,
                tier: tierFilter,
                status: statusFilter,
            },
        })
            .then((r) => setCustomers(r.data?.customers || r.data || []))
            .catch(() => setCustomers(MOCK_CUSTOMERS))
            .finally(() => setLoading(false));
    }, [page, search, tierFilter, statusFilter]);

    // ── Sort handler ───────────────────────────────────────────────────────────
    const handleSort = (col) => {
        if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSortBy(col);
            setSortDir("asc");
        }
    };

    // ── Client-side filter + sort (applied on top of API results) ─────────────
    const filtered = customers.filter((c) => {
        const q = search.toLowerCase();
        const matchSearch =
            !search ||
            c.name?.toLowerCase().includes(q) ||
            c.mobile?.includes(search);
        const matchTier = !tierFilter || c.loyalty_tier === tierFilter;
        const matchStatus = !statusFilter || c.status === statusFilter;
        return matchSearch && matchTier && matchStatus;
    });

    const sorted = [...filtered].sort((a, b) => {
        const va = a[sortBy] ?? "";
        const vb = b[sortBy] ?? "";
        return sortDir === "asc" ? (va > vb ? 1 : -1) : va < vb ? 1 : -1;
    });

    const totalPages = Math.max(1, Math.ceil(sorted.length / limit));
    const paged = sorted.slice((page - 1) * limit, page * limit);

    // ── Quick stats (derived from mock baseline) ───────────────────────────────
    const allCusts = MOCK_CUSTOMERS;
    const totalCount = allCusts.length;
    const newCount = allCusts.filter((c) => c.total_orders <= 2).length;
    const repeatCount = allCusts.filter((c) => c.total_orders > 3).length;
    const activeCount = allCusts.filter((c) => c.status === "active").length;

    const STATS = [
        {
            label: "Total Customers",
            value: totalCount,
            cardCls: "sm-card-sky",
            iconCls: "text-sky-500",
            iconBg: "bg-sky-100",
            Icon: UsersIcon,
        },
        {
            label: "New This Month",
            value: newCount,
            cardCls: "sm-card-mint",
            iconCls: "text-emerald-500",
            iconBg: "bg-emerald-100",
            Icon: SparklesIcon,
        },
        {
            label: "Repeat Customers",
            value: repeatCount,
            cardCls: "sm-card-amber",
            iconCls: "text-amber-500",
            iconBg: "bg-amber-100",
            Icon: ArrowPathIcon,
        },
        {
            label: "Active Members",
            value: activeCount,
            cardCls: "sm-card-coral",
            iconCls: "text-rose-500",
            iconBg: "bg-rose-100",
            Icon: UserGroupIcon,
        },
    ];

    return (
        <div className="space-y-6 pb-10 animate-slide-up">
            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="page-title">My Store Customers</h1>
                    <p className="page-subtitle">
                        Loyalty-program members who visited your store location.
                    </p>
                </div>
                <Link
                    to="/customers/add"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
                    style={{ background: "#10b981" }}
                >
                    <PlusIcon className="w-4 h-4" /> Add Customer
                </Link>
            </div>

            {/* ── Quick stats ─────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map(
                    ({ label, value, cardCls, iconCls, iconBg, Icon }) => (
                        <div
                            key={label}
                            className={`${cardCls} border rounded-2xl p-5`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p
                                        className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${iconCls}`}
                                    >
                                        {label}
                                    </p>
                                    <p className="text-2xl font-black text-slate-900">
                                        {value}
                                    </p>
                                </div>
                                <div
                                    className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}
                                >
                                    <Icon className={`w-5 h-5 ${iconCls}`} />
                                </div>
                            </div>
                        </div>
                    ),
                )}
            </div>

            {/* ── Search + Filters ────────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5">
                    <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <input
                        className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
                        placeholder="Search by name or mobile…"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                <select
                    value={tierFilter}
                    onChange={(e) => {
                        setTierFilter(e.target.value);
                        setPage(1);
                    }}
                    className="text-sm border border-slate-200 bg-white rounded-xl px-3.5 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer"
                >
                    <option value="">All Tiers</option>
                    {["Silver", "Gold", "Platinum", "Diamond"].map((t) => (
                        <option key={t}>{t}</option>
                    ))}
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                    }}
                    className="text-sm border border-slate-200 bg-white rounded-xl px-3.5 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer"
                >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* ── Table ───────────────────────────────────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full data-table">
                        <thead>
                            <tr>
                                {[
                                    { label: "Customer", col: "name" },
                                    { label: "Mobile", col: "mobile" },
                                    { label: "Tier", col: "loyalty_tier" },
                                    {
                                        label: "Points",
                                        col: "current_points_balance",
                                        right: true,
                                    },
                                    {
                                        label: "Last Visit",
                                        col: "last_purchase_date",
                                    },
                                    {
                                        label: "Orders",
                                        col: "total_orders",
                                        right: true,
                                    },
                                    { label: "Status", col: "status" },
                                ].map((h) => (
                                    <th
                                        key={h.col}
                                        className={h.right ? "text-right" : ""}
                                    >
                                        {h.label}
                                        <SortBtn
                                            col={h.col}
                                            onSort={handleSort}
                                        />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(8)].map((_, i) => (
                                    <tr key={i} className="pointer-events-none">
                                        {[...Array(7)].map((_, j) => (
                                            <td key={j}>
                                                <div className="h-4 bg-slate-100 rounded animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : paged.length === 0 ? (
                                <tr className="pointer-events-none">
                                    <td
                                        colSpan={7}
                                        className="text-center py-14 text-sm text-slate-400"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <UsersIcon className="w-8 h-8 text-slate-200" />
                                            <p>
                                                No customers match your filters.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paged.map((c) => (
                                    <tr
                                        key={c.customer_id}
                                        onClick={() =>
                                            navigate(
                                                `/customers/${c.customer_id}`,
                                            )
                                        }
                                        className="group"
                                    >
                                        {/* Customer */}
                                        <td>
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #10b981, #0d9488)",
                                                    }}
                                                >
                                                    {c.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                                        {c.name}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {c.city}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Mobile */}
                                        <td className="font-mono text-xs text-slate-600">
                                            {c.mobile}
                                        </td>
                                        {/* Tier */}
                                        <td>
                                            <span
                                                className={
                                                    TIER_BADGE[
                                                        c.loyalty_tier
                                                    ] || "badge-silver"
                                                }
                                            >
                                                {c.loyalty_tier}
                                            </span>
                                        </td>
                                        {/* Points */}
                                        <td className="text-right font-mono font-semibold text-emerald-600">
                                            {(
                                                c.current_points_balance || 0
                                            ).toLocaleString("en-IN")}
                                        </td>
                                        {/* Last Visit */}
                                        <td className="text-xs text-slate-500">
                                            {fmtDate(c.last_purchase_date)}
                                        </td>
                                        {/* Orders */}
                                        <td className="text-right font-semibold text-slate-700">
                                            {c.total_orders}
                                        </td>
                                        {/* Status */}
                                        <td>
                                            <span
                                                className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_CLS[c.status] || STATUS_CLS.inactive}`}
                                            >
                                                {c.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ──────────────────────────────────────────────────── */}
                {!loading && sorted.length > 0 && (
                    <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/60">
                        <p className="text-xs text-slate-500">
                            Showing{" "}
                            <span className="font-bold text-slate-700">
                                {Math.min(
                                    (page - 1) * limit + 1,
                                    sorted.length,
                                )}
                                –{Math.min(page * limit, sorted.length)}
                            </span>{" "}
                            of{" "}
                            <span className="font-bold text-slate-700">
                                {sorted.length}
                            </span>{" "}
                            customers
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                                disabled={page === 1}
                                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeftIcon className="w-3.5 h-3.5" />
                            </button>
                            {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className="w-7 h-7 rounded-lg text-xs font-bold transition-colors border border-slate-200 text-slate-600 hover:bg-white"
                                    style={
                                        page === i + 1
                                            ? {
                                                  background: "#10b981",
                                                  color: "white",
                                                  borderColor: "#10b981",
                                              }
                                            : {}
                                    }
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() =>
                                    setPage((p) => Math.min(totalPages, p + 1))
                                }
                                disabled={page >= totalPages}
                                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white disabled:opacity-30 transition-colors"
                            >
                                <ChevronRightIcon className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
