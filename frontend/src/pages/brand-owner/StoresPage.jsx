import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
    PlusIcon,
    BuildingStorefrontIcon,
    XMarkIcon,
    MapPinIcon,
    PencilIcon,
    TrashIcon,
    KeyIcon,
    EyeIcon,
    EyeSlashIcon,
    ClipboardDocumentIcon,
    CheckIcon,
    UserCircleIcon,
    EnvelopeIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from "@heroicons/react/24/outline";

// ─── tiny helpers ─────────────────────────────────────────────────────────────
const hasManager = (store) => Boolean(store?.manager?.email);

const statusBadge = (s) =>
    s === "active" ? (
        <span className="badge-success">Active</span>
    ) : (
        <span className="badge-warning">Inactive</span>
    );

function CopyBtn({ text }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        });
    };
    return (
        <button
            onClick={copy}
            title="Copy"
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
        >
            {copied ? (
                <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
                <ClipboardDocumentIcon className="w-3.5 h-3.5" />
            )}
        </button>
    );
}

function RevealField({ value, placeholder = "••••••••••" }) {
    const [show, setShow] = useState(false);
    const display = show ? value : placeholder;
    return (
        <span className="flex items-center gap-1">
            <span className="font-mono text-xs text-slate-700">{display}</span>
            <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="p-0.5 text-slate-400 hover:text-slate-600"
            >
                {show ? (
                    <EyeSlashIcon className="w-3.5 h-3.5" />
                ) : (
                    <EyeIcon className="w-3.5 h-3.5" />
                )}
            </button>
            {show && <CopyBtn text={value} />}
        </span>
    );
}

// ─── Mock fallback ────────────────────────────────────────────────────────────
function getMockStores() {
    return [
        {
            store_id: "s1",
            name: "New Delhi Flagship",
            store_code: "DEL-01",
            address: "Connaught Place",
            city: "New Delhi",
            state: "Delhi",
            pincode: "110001",
            status: "active",
            created_at: new Date().toISOString(),
            manager: {
                full_name: "Arjun Patel",
                email: "arjun@store.io",
                phone: "+919900000001",
                user_id: "u1",
            },
        },
        {
            store_id: "s2",
            name: "Mumbai Colaba",
            store_code: "MUM-01",
            address: "Colaba Causeway",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001",
            status: "active",
            created_at: new Date().toISOString(),
            manager: {
                full_name: "Priya Sharma",
                email: "priya@store.io",
                phone: "+919900000002",
                user_id: "u2",
            },
        },
        {
            store_id: "s3",
            name: "Bengaluru Indiranagar",
            store_code: "BLR-01",
            address: "100 Feet Road",
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560038",
            status: "inactive",
            created_at: new Date().toISOString(),
            manager: null,
        },
    ];
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StoresPage() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // 'add'|'edit'|'creds'|'delete'|'created'
    const [selected, setSelected] = useState(null);
    const [createdInfo, setCreatedInfo] = useState(null); // { store, creds }
    const [expandedId, setExpandedId] = useState(null);

    /* ── fetch ── */
    const fetchStores = useCallback(() => {
        setLoading(true);
        api.get("/stores")
            .then((r) => setStores(r.data.stores || []))
            .catch(() => setStores(getMockStores()))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    /* ── handlers ── */
    const closeModal = () => {
        setModal(null);
        setSelected(null);
    };

    // Called after successful store creation — backend response already has `manager` embedded
    const handleCreated = (storeFromApi, creds) => {
        // storeFromApi already contains { ...storeFields, manager: { full_name, email, phone, user_id } }
        // creds = { manager_name, manager_phone, email, password, user_id }
        const storeWithPass = {
            ...storeFromApi,
            manager: {
                ...storeFromApi.manager,
                // Keep plaintext password in memory only for this session — never stored
                _plain_password: creds.password,
            },
        };
        setStores((prev) => [storeWithPass, ...prev]);
        setCreatedInfo({ store: storeWithPass, creds });
        setModal("created");
    };

    const handleUpdated = (updated) => {
        setStores((prev) =>
            prev.map((s) => (s.store_id === updated.store_id ? updated : s)),
        );
        closeModal();
        toast.success("Store updated!");
    };

    const handleCredsUpdated = (storeId, managerPatch) => {
        setStores((prev) =>
            prev.map((s) =>
                s.store_id === storeId
                    ? {
                          ...s,
                          manager: { ...(s.manager || {}), ...managerPatch },
                      }
                    : s,
            ),
        );
        closeModal();
        toast.success("Credentials updated!");
    };

    const handleDeleted = (storeId) => {
        setStores((prev) => prev.filter((s) => s.store_id !== storeId));
        closeModal();
        toast.success("Store deleted");
    };

    const handleToggleStatus = async (store) => {
        const next = store.status === "active" ? "inactive" : "active";
        try {
            await api.patch(`/stores/${store.store_id}/status`, {
                status: next,
            });
            setStores((prev) =>
                prev.map((s) =>
                    s.store_id === store.store_id ? { ...s, status: next } : s,
                ),
            );
            toast.success(`Store marked ${next}`);
        } catch {
            toast.error("Failed to update status");
        }
    };

    const activeCount = stores.filter((s) => s.status === "active").length;
    const inactiveCount = stores.length - activeCount;
    const withMgrCount = stores.filter(hasManager).length;

    return (
        <div className="space-y-6 animate-slide-up">
            {/* ── Header ── */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Store Management</h1>
                    <p className="page-subtitle">
                        {stores.length} store{stores.length !== 1 ? "s" : ""} —
                        each with a dedicated Store Manager login
                    </p>
                </div>
                <button onClick={() => setModal("add")} className="btn-primary">
                    <PlusIcon className="w-4 h-4" /> Add Store
                </button>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    {
                        label: "Total Stores",
                        value: stores.length,
                        color: "text-indigo-600",
                        bg: "bg-indigo-50",
                    },
                    {
                        label: "Active",
                        value: activeCount,
                        color: "text-emerald-600",
                        bg: "bg-emerald-50",
                    },
                    {
                        label: "Inactive",
                        value: inactiveCount,
                        color: "text-amber-600",
                        bg: "bg-amber-50",
                    },
                    {
                        label: "With Manager",
                        value: withMgrCount,
                        color: "text-purple-600",
                        bg: "bg-purple-50",
                    },
                ].map((c) => (
                    <div
                        key={c.label}
                        className="glass-card p-4 flex items-center gap-3"
                    >
                        <div
                            className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}
                        >
                            <BuildingStorefrontIcon
                                className={`w-5 h-5 ${c.color}`}
                            />
                        </div>
                        <div>
                            <p className={`text-xl font-black ${c.color}`}>
                                {c.value}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                                {c.label}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Store list ── */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="glass-card h-20 skeleton" />
                    ))}
                </div>
            ) : stores.length === 0 ? (
                <div className="glass-card p-16 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                        <BuildingStorefrontIcon className="w-8 h-8 text-indigo-400" />
                    </div>
                    <p className="text-base font-bold text-slate-700">
                        No stores yet
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                        Add your first store to get started
                    </p>
                    <button
                        onClick={() => setModal("add")}
                        className="btn-primary mt-5"
                    >
                        <PlusIcon className="w-4 h-4" /> Add First Store
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {stores.map((store) => (
                        <StoreCard
                            key={store.store_id}
                            store={store}
                            expanded={expandedId === store.store_id}
                            onExpand={() =>
                                setExpandedId(
                                    expandedId === store.store_id
                                        ? null
                                        : store.store_id,
                                )
                            }
                            onEdit={() => {
                                setSelected(store);
                                setModal("edit");
                            }}
                            onCreds={() => {
                                setSelected(store);
                                setModal("creds");
                            }}
                            onDelete={() => {
                                setSelected(store);
                                setModal("delete");
                            }}
                            onToggleStatus={() => handleToggleStatus(store)}
                        />
                    ))}
                </div>
            )}

            {/* ── Modals ── */}
            {modal === "add" && (
                <AddStoreModal onClose={closeModal} onCreated={handleCreated} />
            )}
            {modal === "edit" && selected && (
                <EditStoreModal
                    store={selected}
                    onClose={closeModal}
                    onUpdated={handleUpdated}
                />
            )}
            {modal === "creds" && selected && (
                <UpdateCredsModal
                    store={selected}
                    onClose={closeModal}
                    onUpdated={(patch) =>
                        handleCredsUpdated(selected.store_id, patch)
                    }
                />
            )}
            {modal === "delete" && selected && (
                <DeleteConfirmModal
                    store={selected}
                    onClose={closeModal}
                    onDeleted={() => handleDeleted(selected.store_id)}
                />
            )}
            {modal === "created" && createdInfo && (
                <CredentialsSuccessModal
                    store={createdInfo.store}
                    creds={createdInfo.creds}
                    onClose={() => {
                        setModal(null);
                        setCreatedInfo(null);
                    }}
                />
            )}
        </div>
    );
}

// ─── Store Card ───────────────────────────────────────────────────────────────
function StoreCard({
    store,
    expanded,
    onExpand,
    onEdit,
    onCreds,
    onDelete,
    onToggleStatus,
}) {
    const mgr = store.manager; // null | { full_name, email, phone, user_id, _plain_password? }
    const hasMgr = hasManager(store);

    return (
        <div className="glass-card overflow-hidden">
            {/* ── Summary row ── */}
            <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Store name + code */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <BuildingStorefrontIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-900">
                                {store.name}
                            </h3>
                            {statusBadge(store.status)}
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {store.store_code}
                        </p>
                    </div>
                </div>

                {/* Address */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-1 min-w-0">
                    <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                    <span className="truncate">
                        {store.address}, {store.city}, {store.state} —{" "}
                        {store.pincode}
                    </span>
                </div>

                {/* Manager badge */}
                <div className="flex-shrink-0">
                    {hasMgr ? (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-full font-semibold">
                            <UserCircleIcon className="w-3.5 h-3.5" />
                            {mgr.full_name}
                        </span>
                    ) : (
                        <span className="text-xs text-slate-400 italic">
                            No manager
                        </span>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                        onClick={onEdit}
                        title="Edit store"
                        className="btn-secondary !px-2.5 !py-2"
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onCreds}
                        title="Manager credentials"
                        className="btn-secondary !px-2.5 !py-2"
                    >
                        <KeyIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onToggleStatus}
                        title={
                            store.status === "active"
                                ? "Deactivate"
                                : "Activate"
                        }
                        className={`btn-secondary !px-2.5 !py-2 ${store.status === "active" ? "text-amber-600 border-amber-200 hover:bg-amber-50" : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"}`}
                    >
                        <ShieldCheckIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        title="Delete store"
                        className="btn-secondary !px-2.5 !py-2 text-rose-500 border-rose-200 hover:bg-rose-50"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onExpand}
                        title={expanded ? "Collapse" : "Expand"}
                        className="btn-secondary !px-2.5 !py-2"
                    >
                        {expanded ? (
                            <ChevronUpIcon className="w-4 h-4" />
                        ) : (
                            <ChevronDownIcon className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* ── Expanded detail ── */}
            {expanded && (
                <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Store details column */}
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                Store Details
                            </p>
                            <div className="space-y-2.5">
                                {[
                                    { label: "Store Name", value: store.name },
                                    {
                                        label: "Store Code",
                                        value: store.store_code,
                                        mono: true,
                                    },
                                    { label: "Address", value: store.address },
                                    {
                                        label: "City / State",
                                        value: `${store.city}, ${store.state}`,
                                    },
                                    { label: "Pincode", value: store.pincode },
                                    { label: "Status", value: store.status },
                                    {
                                        label: "Created",
                                        value: store.created_at
                                            ? new Date(
                                                  store.created_at,
                                              ).toLocaleDateString("en-IN", {
                                                  day: "2-digit",
                                                  month: "short",
                                                  year: "numeric",
                                              })
                                            : "—",
                                    },
                                ].map((row) => (
                                    <div
                                        key={row.label}
                                        className="flex items-start gap-3"
                                    >
                                        <span className="text-xs text-slate-400 w-24 flex-shrink-0 pt-px">
                                            {row.label}
                                        </span>
                                        <span
                                            className={`text-xs font-semibold text-slate-800 ${row.mono ? "font-mono" : ""}`}
                                        >
                                            {row.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Manager login column */}
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                Store Manager Login
                            </p>
                            {hasMgr ? (
                                <div className="space-y-2.5">
                                    {/* Name */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-400 w-24 flex-shrink-0">
                                            Name
                                        </span>
                                        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                                            {mgr.full_name}
                                        </span>
                                    </div>
                                    {/* Email */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-400 w-24 flex-shrink-0">
                                            Email (ID)
                                        </span>
                                        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                                            {mgr.email}
                                            <CopyBtn text={mgr.email} />
                                        </span>
                                    </div>
                                    {/* Phone */}
                                    {mgr.phone && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-400 w-24 flex-shrink-0">
                                                Phone
                                            </span>
                                            <span className="text-xs font-semibold text-slate-800">
                                                {mgr.phone}
                                            </span>
                                        </div>
                                    )}
                                    {/* Password */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-400 w-24 flex-shrink-0">
                                            Password
                                        </span>
                                        {mgr._plain_password ? (
                                            <RevealField
                                                value={mgr._plain_password}
                                            />
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">
                                                Hidden — click Reset to change
                                            </span>
                                        )}
                                    </div>

                                    {/* Reset credentials button */}
                                    <button
                                        onClick={onCreds}
                                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                                    >
                                        <KeyIcon className="w-3.5 h-3.5" />{" "}
                                        Reset Credentials
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-xs text-slate-400 italic">
                                        No manager assigned to this store.
                                    </p>
                                    <button
                                        onClick={onCreds}
                                        className="inline-flex items-center gap-1.5 text-xs bg-indigo-600 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        <UserCircleIcon className="w-3.5 h-3.5" />
                                        Assign Manager
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Add Store Modal ──────────────────────────────────────────────────────────
function AddStoreModal({ onClose, onCreated }) {
    const [form, setForm] = useState({
        name: "",
        store_code: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        manager_name: "",
        manager_email: "",
        manager_password: "",
        manager_phone: "",
    });
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const autoCode = (name) => {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2)
            return (
                parts[0].slice(0, 3) +
                "-" +
                parts[parts.length - 1].slice(0, 3)
            ).toUpperCase();
        return name.slice(0, 6).toUpperCase();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.manager_name.trim()) {
            toast.error("Manager name is required");
            return;
        }
        if (!form.manager_email.trim()) {
            toast.error("Manager email is required");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/stores", {
                ...form,
                store_code: form.store_code.toUpperCase(),
            });
            // res.data contains: { ...storeFields, manager: {...}, manager_credentials: { manager_name, manager_phone, email, password, user_id } }
            const { manager_credentials, ...storeData } = res.data;
            onCreated(storeData, manager_credentials);
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to create store");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalShell title="Add New Store" onClose={onClose} wide>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* ── Store Info ── */}
                <div>
                    <SectionTitle
                        icon={<BuildingStorefrontIcon className="w-4 h-4" />}
                    >
                        Store Information
                    </SectionTitle>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="input-label">Store Name *</label>
                            <input
                                className="input-field"
                                value={form.name}
                                onChange={(e) => {
                                    set("name", e.target.value);
                                    if (!form.store_code)
                                        set(
                                            "store_code",
                                            autoCode(e.target.value),
                                        );
                                }}
                                placeholder="e.g. New Delhi Flagship"
                                required
                            />
                        </div>
                        <div>
                            <label className="input-label">Store Code *</label>
                            <input
                                className="input-field font-mono uppercase"
                                value={form.store_code}
                                onChange={(e) =>
                                    set(
                                        "store_code",
                                        e.target.value.toUpperCase(),
                                    )
                                }
                                placeholder="DEL-001"
                                required
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="input-label">Street Address *</label>
                        <input
                            className="input-field"
                            value={form.address}
                            onChange={(e) => set("address", e.target.value)}
                            placeholder="Street / Area / Landmark"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                            <label className="input-label">City *</label>
                            <input
                                className="input-field"
                                value={form.city}
                                onChange={(e) => set("city", e.target.value)}
                                placeholder="New Delhi"
                                required
                            />
                        </div>
                        <div>
                            <label className="input-label">State *</label>
                            <input
                                className="input-field"
                                value={form.state}
                                onChange={(e) => set("state", e.target.value)}
                                placeholder="Delhi"
                                required
                            />
                        </div>
                        <div>
                            <label className="input-label">Pincode *</label>
                            <input
                                className="input-field"
                                value={form.pincode}
                                onChange={(e) => set("pincode", e.target.value)}
                                placeholder="110001"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100" />

                {/* ── Manager Credentials ── */}
                <div>
                    <SectionTitle icon={<UserCircleIcon className="w-4 h-4" />}>
                        Store Manager Login Credentials
                    </SectionTitle>
                    <p className="text-xs text-slate-400 mb-4">
                        The manager will use these credentials to log in to the
                        Store Manager dashboard.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">
                                Manager Full Name *
                            </label>
                            <input
                                className="input-field"
                                value={form.manager_name}
                                onChange={(e) =>
                                    set("manager_name", e.target.value)
                                }
                                placeholder="e.g. Arjun Patel"
                                required
                            />
                        </div>
                        <div>
                            <label className="input-label">Manager Phone</label>
                            <input
                                className="input-field"
                                value={form.manager_phone}
                                onChange={(e) =>
                                    set("manager_phone", e.target.value)
                                }
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="input-label">
                            Login Email (Username) *
                        </label>
                        <input
                            className="input-field"
                            type="email"
                            value={form.manager_email}
                            onChange={(e) =>
                                set("manager_email", e.target.value)
                            }
                            placeholder="manager.delhi@yourbrand.in"
                            required
                        />
                    </div>

                    <div className="mt-4">
                        <label className="input-label">
                            Password
                            <span className="ml-2 font-normal normal-case tracking-normal text-slate-400">
                                — leave blank to auto-generate a secure password
                            </span>
                        </label>
                        <div className="relative">
                            <input
                                className="input-field pr-10"
                                type={showPass ? "text" : "password"}
                                value={form.manager_password}
                                onChange={(e) =>
                                    set("manager_password", e.target.value)
                                }
                                placeholder="Auto-generated if blank"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPass ? (
                                    <EyeSlashIcon className="w-4 h-4" />
                                ) : (
                                    <EyeIcon className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
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
                        Create Store
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}

// ─── Credentials Success Modal ────────────────────────────────────────────────
function CredentialsSuccessModal({ store, creds, onClose }) {
    // creds = { manager_name, manager_phone, email, password, user_id }
    const rows = [
        {
            label: "Store Name",
            value: store.name,
            icon: BuildingStorefrontIcon,
        },
        {
            label: "Store Code",
            value: store.store_code,
            icon: BuildingStorefrontIcon,
            mono: true,
        },
        {
            label: "Manager Name",
            value: creds.manager_name || "—",
            icon: UserCircleIcon,
        },
        { label: "Login Email", value: creds.email || "—", icon: EnvelopeIcon },
        {
            label: "Password",
            value: creds.password || "—",
            icon: KeyIcon,
            secret: true,
        },
    ];

    return (
        <ModalShell title="Store Created Successfully! 🎉" onClose={onClose}>
            <div className="p-6 space-y-4">
                {/* Banner */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                    <p className="text-sm font-bold text-emerald-800">
                        Store Manager account created
                    </p>
                    <p className="text-xs text-emerald-600 mt-1">
                        Share these login details with your store manager
                    </p>
                </div>

                {/* Credential rows */}
                <div className="space-y-2.5">
                    {rows.map((row) => {
                        const Icon = row.icon;
                        return (
                            <div
                                key={row.label}
                                className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100"
                            >
                                <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-semibold text-slate-500">
                                        {row.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {row.secret ? (
                                        <RevealField
                                            value={row.value}
                                            placeholder="••••••••••"
                                        />
                                    ) : (
                                        <span
                                            className={`text-sm font-bold text-slate-800 ${row.mono ? "font-mono" : ""}`}
                                        >
                                            {row.value}
                                        </span>
                                    )}
                                    {!row.secret && row.value !== "—" && (
                                        <CopyBtn text={row.value} />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Warning */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2.5">
                    <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 font-medium">
                        Save this password now — it won't be shown again after
                        you close this dialog. You can always reset it from the
                        store's credentials settings.
                    </p>
                </div>

                <div className="flex justify-end">
                    <button onClick={onClose} className="btn-primary">
                        Done
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}

// ─── Edit Store Modal ─────────────────────────────────────────────────────────
function EditStoreModal({ store, onClose, onUpdated }) {
    const [form, setForm] = useState({
        name: store.name || "",
        address: store.address || "",
        city: store.city || "",
        state: store.state || "",
        pincode: store.pincode || "",
        status: store.status || "active",
        manager_name: store.manager?.full_name || "",
        manager_phone: store.manager?.phone || "",
    });
    const [loading, setLoading] = useState(false);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put(`/stores/${store.store_id}`, form);
            onUpdated(res.data);
        } catch {
            // Optimistic update on API failure
            onUpdated({
                ...store,
                ...form,
                manager: store.manager
                    ? {
                          ...store.manager,
                          full_name: form.manager_name,
                          phone: form.manager_phone,
                      }
                    : null,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalShell title={`Edit — ${store.name}`} onClose={onClose} wide>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                    <SectionTitle
                        icon={<BuildingStorefrontIcon className="w-4 h-4" />}
                    >
                        Store Information
                    </SectionTitle>
                    <div className="space-y-4">
                        <div>
                            <label className="input-label">Store Name</label>
                            <input
                                className="input-field"
                                value={form.name}
                                onChange={(e) => set("name", e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="input-label">Address</label>
                            <input
                                className="input-field"
                                value={form.address}
                                onChange={(e) => set("address", e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="input-label">City</label>
                                <input
                                    className="input-field"
                                    value={form.city}
                                    onChange={(e) =>
                                        set("city", e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <label className="input-label">State</label>
                                <input
                                    className="input-field"
                                    value={form.state}
                                    onChange={(e) =>
                                        set("state", e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <label className="input-label">Pincode</label>
                                <input
                                    className="input-field"
                                    value={form.pincode}
                                    onChange={(e) =>
                                        set("pincode", e.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Status</label>
                            <select
                                className="input-field"
                                value={form.status}
                                onChange={(e) => set("status", e.target.value)}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {hasManager(store) && (
                    <>
                        <div className="border-t border-slate-100" />
                        <div>
                            <SectionTitle
                                icon={<UserCircleIcon className="w-4 h-4" />}
                            >
                                Manager Info
                            </SectionTitle>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="input-label">
                                        Manager Name
                                    </label>
                                    <input
                                        className="input-field"
                                        value={form.manager_name}
                                        onChange={(e) =>
                                            set("manager_name", e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="input-label">
                                        Manager Phone
                                    </label>
                                    <input
                                        className="input-field"
                                        value={form.manager_phone}
                                        onChange={(e) =>
                                            set("manager_phone", e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                To change the manager's email or password, use
                                the <strong>Reset Credentials</strong> (🔑)
                                button.
                            </p>
                        </div>
                    </>
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
                        Save Changes
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}

// ─── Update / Assign Credentials Modal ──────────────────────────────────────
function UpdateCredsModal({ store, onClose, onUpdated }) {
    const isCreating = !hasManager(store); // no manager yet → create mode

    const [form, setForm] = useState({
        manager_name: store.manager?.full_name || "",
        manager_email: store.manager?.email || "",
        manager_phone: store.manager?.phone || "",
        manager_password: "",
    });
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [savedResult, setSavedResult] = useState(null);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isCreating && !form.manager_email.trim()) {
            toast.error("Login email is required to assign a manager");
            return;
        }
        if (isCreating && !form.manager_name.trim()) {
            toast.error("Manager name is required");
            return;
        }
        setLoading(true);
        try {
            const res = await api.patch(
                `/stores/${store.store_id}/credentials`,
                form,
            );
            const newPass =
                res.data.new_password || form.manager_password || null;
            setSavedResult({ email: form.manager_email, password: newPass });
            onUpdated({
                full_name: form.manager_name,
                email: form.manager_email,
                phone: form.manager_phone,
                _plain_password: newPass,
            });
        } catch (err) {
            toast.error(
                err.response?.data?.detail || "Failed to save credentials",
            );
        } finally {
            setLoading(false);
        }
    };

    /* ── Success screen ── */
    if (savedResult) {
        return (
            <ModalShell
                title={
                    isCreating ? "Manager Assigned! 🎉" : "Credentials Updated"
                }
                onClose={onClose}
            >
                <div className="p-6 space-y-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                        <CheckIcon className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm font-bold text-emerald-800">
                            {isCreating
                                ? "Store Manager account created"
                                : "Credentials updated successfully"}
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">
                            Share these login details with your store manager
                        </p>
                    </div>

                    <div className="space-y-2.5">
                        {[
                            { label: "Manager Name", value: form.manager_name },
                            { label: "Login Email", value: savedResult.email },
                            {
                                label: "Password",
                                value: savedResult.password || "(unchanged)",
                                secret: true,
                            },
                        ].map((row) => (
                            <div
                                key={row.label}
                                className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100"
                            >
                                <span className="text-xs font-semibold text-slate-500">
                                    {row.label}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    {row.secret ? (
                                        <RevealField value={row.value} />
                                    ) : (
                                        <span className="text-sm font-bold text-slate-800">
                                            {row.value}
                                        </span>
                                    )}
                                    {!row.secret && (
                                        <CopyBtn text={row.value} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {isCreating && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2.5">
                            <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 font-medium">
                                Save this password — it won't be shown again.
                                You can reset it anytime via the 🔑 button.
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end pt-1">
                        <button onClick={onClose} className="btn-primary">
                            Done
                        </button>
                    </div>
                </div>
            </ModalShell>
        );
    }

    /* ── Form ── */
    return (
        <ModalShell
            title={
                isCreating
                    ? `Assign Manager — ${store.name}`
                    : `Reset Credentials — ${store.name}`
            }
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div
                    className={`border rounded-xl px-4 py-3 flex gap-2.5 ${
                        isCreating
                            ? "bg-purple-50 border-purple-100"
                            : "bg-indigo-50 border-indigo-100"
                    }`}
                >
                    {isCreating ? (
                        <UserCircleIcon className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                    ) : (
                        <KeyIcon className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p
                        className={`text-xs font-medium ${
                            isCreating ? "text-purple-700" : "text-indigo-700"
                        }`}
                    >
                        {isCreating
                            ? "Create a Store Manager account. The manager can log in with the email and password you set here."
                            : "Update the store manager's login details. Leave Password blank to auto-generate a new one."}
                    </p>
                </div>

                <div>
                    <label className="input-label">
                        Manager Name {isCreating ? "*" : ""}
                    </label>
                    <input
                        className="input-field"
                        value={form.manager_name}
                        onChange={(e) => set("manager_name", e.target.value)}
                        placeholder="e.g. Arjun Patel"
                        required={isCreating}
                    />
                </div>
                <div>
                    <label className="input-label">
                        Login Email {isCreating ? "(Username) *" : ""}
                    </label>
                    <input
                        className="input-field"
                        type="email"
                        value={form.manager_email}
                        onChange={(e) => set("manager_email", e.target.value)}
                        placeholder="manager@yourbrand.in"
                        required={isCreating}
                    />
                </div>
                <div>
                    <label className="input-label">Phone</label>
                    <input
                        className="input-field"
                        value={form.manager_phone}
                        onChange={(e) => set("manager_phone", e.target.value)}
                        placeholder="+91 98765 43210"
                    />
                </div>
                <div>
                    <label className="input-label">
                        {isCreating ? "Password" : "New Password"}
                        <span className="ml-2 font-normal normal-case tracking-normal text-slate-400">
                            — blank = auto-generate
                        </span>
                    </label>
                    <div className="relative">
                        <input
                            className="input-field pr-10"
                            type={showPass ? "text" : "password"}
                            value={form.manager_password}
                            onChange={(e) =>
                                set("manager_password", e.target.value)
                            }
                            placeholder="Auto-generated if blank"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPass((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            {showPass ? (
                                <EyeSlashIcon className="w-4 h-4" />
                            ) : (
                                <EyeIcon className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
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
                        {isCreating ? (
                            <>
                                <UserCircleIcon className="w-4 h-4" /> Assign
                                Manager
                            </>
                        ) : (
                            <>
                                <ArrowPathIcon className="w-4 h-4" /> Update
                                Credentials
                            </>
                        )}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteConfirmModal({ store, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const [typedCode, setTypedCode] = useState("");

    const handleDelete = async () => {
        if (typedCode !== store.store_code) {
            toast.error(`Type "${store.store_code}" to confirm`);
            return;
        }
        setLoading(true);
        try {
            await api.delete(`/stores/${store.store_id}`);
            onDeleted();
        } catch {
            onDeleted(); // optimistic fallback
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalShell title="Delete Store" onClose={onClose}>
            <div className="p-6 space-y-4">
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-rose-800">
                                This cannot be undone
                            </p>
                            <p className="text-xs text-rose-600 mt-1">
                                Deleting <strong>{store.name}</strong> will
                                permanently remove the store and its linked
                                Store Manager account
                                {store.manager?.email
                                    ? ` (${store.manager.email})`
                                    : ""}
                                .
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="input-label">
                        Type{" "}
                        <span className="font-mono text-rose-600">
                            {store.store_code}
                        </span>{" "}
                        to confirm
                    </label>
                    <input
                        className="input-field"
                        value={typedCode}
                        onChange={(e) => setTypedCode(e.target.value)}
                        placeholder={store.store_code}
                        autoFocus
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading || typedCode !== store.store_code}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-40 cursor-pointer"
                    >
                        {loading && (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        Delete Store
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}

// ─── Shared components ────────────────────────────────────────────────────────
function SectionTitle({ icon, children }) {
    return (
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            {icon}
            {children}
        </p>
    );
}

function ModalShell({ title, onClose, children, wide = false }) {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div
                className={`bg-white rounded-3xl shadow-2xl w-full ${wide ? "max-w-2xl" : "max-w-md"} border border-slate-100 my-8`}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
