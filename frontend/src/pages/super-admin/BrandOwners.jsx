import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
    UserPlusIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    EyeIcon,
    EyeSlashIcon,
    XMarkIcon,
    PencilSquareIcon,
    BuildingOffice2Icon,
    ChevronRightIcon,
    CheckCircleIcon,
    NoSymbolIcon,
    ClipboardDocumentIcon,
    KeyIcon,
    EnvelopeIcon,
    TrashIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const StatusBadge = ({ status }) => (
    <span
        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
            status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
        }`}
    >
        <span
            className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-green-500" : "bg-red-400"}`}
        />
        {status === "active" ? "Active" : "Inactive"}
    </span>
);

function CredentialsModal({ creds, onClose }) {
    const copy = (text) => {
        navigator.clipboard
            .writeText(text)
            .then(() => toast.success("Copied!"));
    };
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
                background: "rgba(15,23,42,0.7)",
                backdropFilter: "blur(6px)",
            }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div
                    className="px-6 py-5"
                    style={{
                        background: "linear-gradient(135deg,#065f46,#059669)",
                        borderRadius: "16px 16px 0 0",
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <CheckCircleIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-base font-black text-white">
                                Brand Owner Created!
                            </p>
                            <p className="text-xs text-green-200 mt-0.5">
                                Save these login credentials
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-amber-700">
                            &#9888;&#65039; Share credentials with the brand
                            owner. Password will not be shown again.
                        </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Brand Name
                        </p>
                        <p className="text-sm font-black text-slate-900">
                            &#127970; {creds.brand_name}
                        </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Login Email
                            </p>
                            <div className="flex items-center gap-2">
                                <EnvelopeIcon className="w-4 h-4 text-indigo-600" />
                                <p className="text-sm font-semibold text-slate-900">
                                    {creds.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => copy(creds.email)}
                            className="w-8 h-8 rounded-lg bg-indigo-100/60 hover:bg-indigo-200/50 flex items-center justify-center transition-colors"
                        >
                            <ClipboardDocumentIcon className="w-4 h-4 text-indigo-600" />
                        </button>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Password
                            </p>
                            <div className="flex items-center gap-2">
                                <KeyIcon className="w-4 h-4 text-purple-500" />
                                <p className="text-sm font-semibold text-slate-900 font-mono">
                                    {creds.password}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => copy(creds.password)}
                            className="w-8 h-8 rounded-lg bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-colors"
                        >
                            <ClipboardDocumentIcon className="w-4 h-4 text-purple-600" />
                        </button>
                    </div>
                    <button
                        onClick={() =>
                            copy(
                                `Brand: ${creds.brand_name}\nEmail: ${creds.email}\nPassword: ${creds.password}\nLogin: ${window.location.origin}/login`,
                            )
                        }
                        className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
                    >
                        <ClipboardDocumentIcon className="w-4 h-4" />
                        Copy All Credentials
                    </button>
                </div>
                <div className="px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
                        style={{
                            background:
                                "linear-gradient(135deg,#0d9488,#0f766e)",
                        }}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

function CreateModal({ onClose, onCreated }) {
    const BUSINESS_TYPES = [
        "Retail",
        "Restaurant",
        "FMCG",
        "Fashion",
        "Electronics",
        "Pharmacy",
        "Grocery",
        "Services",
        "Other",
    ];
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        password: "",
        brand_name: "",
        phone: "",
        sms_credits: 500,
        wa_utility_credits: 200,
        wa_marketing_credits: 200,
        company_name: "",
        gst_number: "",
        business_type: "",
        city: "",
        state: "",
        pincode: "",
        website: "",
    });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [createdCreds, setCreatedCreds] = useState(null);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const validate = () => {
        const e = {};
        if (!form.full_name.trim()) e.full_name = "Required";
        if (!form.email.trim()) e.email = "Required";
        if (!form.password || form.password.length < 6)
            e.password = "Min 6 chars";
        if (!form.brand_name.trim()) e.brand_name = "Required";
        setErrors(e);
        return !Object.keys(e).length;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await api.post("/admin/create-brand-owner", {
                ...form,
                sms_credits: Number(form.sms_credits),
                wa_utility_credits: Number(form.wa_utility_credits),
                wa_marketing_credits: Number(form.wa_marketing_credits),
            });
            toast.success(`Brand Owner "${form.full_name}" created!`);
            onCreated();
            setCreatedCreds({
                brand_name: form.brand_name,
                email: form.email,
                password: form.password,
            });
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to create");
        } finally {
            setLoading(false);
        }
    };

    if (createdCreds)
        return <CredentialsModal creds={createdCreds} onClose={onClose} />;

    const inp = (extra = "") =>
        `w-full border rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-indigo-400 ${extra}`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            style={{
                background: "rgba(15,23,42,0.6)",
                backdropFilter: "blur(4px)",
            }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
                <div
                    className="px-6 py-5 flex items-center justify-between"
                    style={{
                        background:
                            "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
                        borderRadius: "16px 16px 0 0",
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100/60 flex items-center justify-center">
                            <UserPlusIcon className="w-5 h-5 text-indigo-700" />
                        </div>
                        <div>
                            <p className="text-base font-black text-slate-900">
                                Create Brand Owner
                            </p>
                            <p className="text-xs text-indigo-700 mt-0.5">
                                New brand + owner account with login access
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
                    >
                        <XMarkIcon className="w-4 h-4 text-white" />
                    </button>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-5 max-h-[80vh] overflow-y-auto"
                >
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                            Account Info
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                                    Full Name *
                                </label>
                                <input
                                    value={form.full_name}
                                    onChange={(e) =>
                                        set("full_name", e.target.value)
                                    }
                                    placeholder="Rajesh Kumar"
                                    className={inp(
                                        errors.full_name
                                            ? "border-red-300 focus:ring-red-200"
                                            : "border-slate-200 focus:ring-indigo-100",
                                    )}
                                />
                                {errors.full_name && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.full_name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                                    Phone
                                </label>
                                <input
                                    value={form.phone}
                                    onChange={(e) =>
                                        set("phone", e.target.value)
                                    }
                                    placeholder="+91 98000 00000"
                                    className={inp(
                                        "border-slate-200 focus:ring-indigo-100",
                                    )}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) =>
                                        set("email", e.target.value)
                                    }
                                    placeholder="owner@brand.com"
                                    className={inp(
                                        errors.email
                                            ? "border-red-300 focus:ring-red-200"
                                            : "border-slate-200 focus:ring-indigo-100",
                                    )}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                                    Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPass ? "text" : "password"}
                                        value={form.password}
                                        onChange={(e) =>
                                            set("password", e.target.value)
                                        }
                                        placeholder="Min 6 characters"
                                        className={inp(
                                            `pr-11 ${errors.password ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-100"}`,
                                        )}
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
                                {errors.password && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-slate-100 pt-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                            Brand & Company Info
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                                    Brand Name *
                                </label>
                                <input
                                    value={form.brand_name}
                                    onChange={(e) =>
                                        set("brand_name", e.target.value)
                                    }
                                    placeholder="Fashion Brand India"
                                    className={inp(
                                        errors.brand_name
                                            ? "border-red-300 focus:ring-red-200"
                                            : "border-slate-200 focus:ring-indigo-100",
                                    )}
                                />
                                {errors.brand_name && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.brand_name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                                    Legal Company Name
                                </label>
                                <input
                                    value={form.company_name}
                                    onChange={(e) =>
                                        set("company_name", e.target.value)
                                    }
                                    placeholder="Fashion Pvt. Ltd."
                                    className={inp(
                                        "border-slate-200 focus:ring-indigo-100",
                                    )}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                                    Business Type
                                </label>
                                <select
                                    value={form.business_type}
                                    onChange={(e) =>
                                        set("business_type", e.target.value)
                                    }
                                    className={inp(
                                        "border-slate-200 focus:ring-indigo-100",
                                    )}
                                >
                                    <option value="">Select type...</option>
                                    {BUSINESS_TYPES.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                                    GST Number
                                </label>
                                <input
                                    value={form.gst_number}
                                    onChange={(e) =>
                                        set("gst_number", e.target.value)
                                    }
                                    placeholder="27AAAAA0000A1Z5"
                                    className={inp(
                                        "border-slate-200 focus:ring-indigo-100",
                                    )}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                                    City
                                </label>
                                <input
                                    value={form.city}
                                    onChange={(e) =>
                                        set("city", e.target.value)
                                    }
                                    placeholder="Mumbai"
                                    className={inp(
                                        "border-slate-200 focus:ring-indigo-100",
                                    )}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                                    State
                                </label>
                                <input
                                    value={form.state}
                                    onChange={(e) =>
                                        set("state", e.target.value)
                                    }
                                    placeholder="Maharashtra"
                                    className={inp(
                                        "border-slate-200 focus:ring-indigo-100",
                                    )}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                                    Pincode
                                </label>
                                <input
                                    value={form.pincode}
                                    onChange={(e) =>
                                        set("pincode", e.target.value)
                                    }
                                    placeholder="400001"
                                    className={inp(
                                        "border-slate-200 focus:ring-indigo-100",
                                    )}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                                    Website
                                </label>
                                <input
                                    value={form.website}
                                    onChange={(e) =>
                                        set("website", e.target.value)
                                    }
                                    placeholder="https://brand.com"
                                    className={inp(
                                        "border-slate-200 focus:ring-indigo-100",
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-slate-100 pt-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                            Initial Credits
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: "SMS Credits", key: "sms_credits" },
                                {
                                    label: "WA Utility",
                                    key: "wa_utility_credits",
                                },
                                {
                                    label: "WA Marketing",
                                    key: "wa_marketing_credits",
                                },
                            ].map((f) => (
                                <div key={f.key}>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                        {f.label}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form[f.key]}
                                        onChange={(e) =>
                                            set(f.key, e.target.value)
                                        }
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 flex items-center justify-center gap-2"
                            style={{
                                background:
                                    "linear-gradient(135deg,#0d9488,#0f766e)",
                            }}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <UserPlusIcon className="w-4 h-4" />
                                    Create and Get Credentials
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function QuickCreditsModal({ bo, onClose, onSaved }) {
    const [mode, setMode] = useState("set");
    const [sms, setSms] = useState(bo.credits?.sms ?? 100);
    const [waU, setWaU] = useState(bo.credits?.wa_utility ?? 100);
    const [waM, setWaM] = useState(bo.credits?.wa_marketing ?? 100);
    const [saving, setSaving] = useState(false);

    const switchMode = (m) => {
        setMode(m);
        setSms(m === "set" ? (bo.credits?.sms ?? 100) : 0);
        setWaU(m === "set" ? (bo.credits?.wa_utility ?? 100) : 0);
        setWaM(m === "set" ? (bo.credits?.wa_marketing ?? 100) : 0);
    };

    const save = async () => {
        setSaving(true);
        try {
            if (mode === "set") {
                await api.put(`/admin/credits/${bo.brand_id}`, {
                    sms: Number(sms),
                    wa_utility: Number(waU),
                    wa_marketing: Number(waM),
                });
                toast.success("Credits updated!");
            } else {
                await api.post(`/admin/credits/${bo.brand_id}/topup`, {
                    sms: Number(sms),
                    wa_utility: Number(waU),
                    wa_marketing: Number(waM),
                });
                toast.success("Credits added successfully!");
            }
            onSaved();
            onClose();
        } catch {
            toast.error("Failed to update credits");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
                background: "rgba(15,23,42,0.55)",
                backdropFilter: "blur(4px)",
            }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div
                    className="px-5 py-4 flex items-center justify-between"
                    style={{
                        background:
                            "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
                    }}
                >
                    <div>
                        <p className="text-sm font-black text-slate-900">
                            Manage Credits
                        </p>
                        <p className="text-xs text-indigo-700 mt-0.5">
                            {bo.brand_name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg bg-indigo-100/60 hover:bg-indigo-200/50 flex items-center justify-center"
                    >
                        <XMarkIcon className="w-4 h-4 text-indigo-700" />
                    </button>
                </div>
                <div className="px-5 pt-4">
                    <div className="flex bg-slate-100 p-0.5 rounded-xl">
                        {[
                            ["set", "Set Credits"],
                            ["add", "Add Credits"],
                        ].map(([m, label]) => (
                            <button
                                key={m}
                                onClick={() => switchMode(m)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                {m === "add" ? "+ " : ""}
                                {label}
                            </button>
                        ))}
                    </div>
                    <p
                        className={`text-xs mt-2 ${mode === "add" ? "text-green-600" : "text-slate-400"}`}
                    >
                        {mode === "add"
                            ? "Added on top of existing balance"
                            : "Replace current credits with new values"}
                    </p>
                </div>
                {mode === "add" && (
                    <div className="mx-5 mt-3 bg-slate-50 rounded-xl p-3">
                        <p className="text-xs font-bold text-slate-500 mb-2">
                            Current Balance
                        </p>
                        <div className="flex gap-4 text-xs font-bold text-slate-700">
                            <span>SMS: {bo.credits?.sms ?? 0}</span>
                            <span>WA-U: {bo.credits?.wa_utility ?? 0}</span>
                            <span>WA-M: {bo.credits?.wa_marketing ?? 0}</span>
                        </div>
                    </div>
                )}
                <div className="p-5 space-y-4">
                    {[
                        {
                            label: `SMS ${mode === "add" ? "to Add" : "Credits"}`,
                            val: sms,
                            set: setSms,
                        },
                        {
                            label: `WA Utility ${mode === "add" ? "to Add" : "Credits"}`,
                            val: waU,
                            set: setWaU,
                        },
                        {
                            label: `WA Marketing ${mode === "add" ? "to Add" : "Credits"}`,
                            val: waM,
                            set: setWaM,
                        },
                    ].map((f) => (
                        <div key={f.label}>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                {f.label}
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={f.val}
                                onChange={(e) => f.set(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                    ))}
                </div>
                <div className="px-5 pb-5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={save}
                        disabled={saving}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                        style={{
                            background:
                                mode === "add"
                                    ? "linear-gradient(135deg,#059669,#10b981)"
                                    : "linear-gradient(135deg,#0d9488,#0f766e)",
                        }}
                    >
                        {saving
                            ? "Saving..."
                            : mode === "add"
                              ? "Add Credits"
                              : "Set Credits"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DeleteModal({ bo, onClose, onDeleted }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/admin/brand-owner/${bo.user_id}`);
            toast.success(`${bo.brand_name} deleted successfully`);
            onDeleted();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to delete");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
                background: "rgba(15,23,42,0.6)",
                backdropFilter: "blur(4px)",
            }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div
                    className="px-6 py-5 flex items-center gap-3"
                    style={{
                        background:
                            "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                        borderRadius: "16px 16px 0 0",
                    }}
                >
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <p className="text-base font-black text-red-700">
                            Delete Brand Owner?
                        </p>
                        <p className="text-xs text-red-600 mt-0.5">
                            This action cannot be undone
                        </p>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-sm font-bold text-red-700 mb-2">
                            ⚠️ Warning
                        </p>
                        <ul className="text-xs text-red-600 space-y-1">
                            <li>
                                ✗ Brand owner account will be permanently
                                deleted
                            </li>
                            <li>✗ All associated brand data will be removed</li>
                            <li>
                                ✗ {bo.brand_name} and all its stores will be
                                deleted
                            </li>
                        </ul>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs font-bold text-slate-600 mb-1">
                            Brand Owner
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                            {bo.full_name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {bo.email}
                        </p>
                        <p className="text-xs font-bold text-slate-600 mt-3 mb-1">
                            Brand
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                            {bo.brand_name}
                        </p>
                    </div>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={deleting}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                        {deleting ? (
                            <>
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <TrashIcon className="w-4 h-4" />
                                Delete Permanently
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function BrandOwners() {
    const [brandOwners, setBrandOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [showCreate, setShowCreate] = useState(false);
    const [editCredits, setEditCredits] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [seeding, setSeeding] = useState(false);
    const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

    const handleSeedMolecule = async () => {
        setSeeding(true);
        try {
            const res = await api.post("/admin/seed-molecule");
            toast.success("Molecule brand created! Refreshing...");
            refresh();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Seed failed");
        } finally {
            setSeeding(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        api.get("/admin/brand-owners")
            .then((r) => setBrandOwners(r.data.brand_owners || []))
            .catch((err) => {
                toast.error(
                    err.response?.data?.detail || "Failed to load brand owners",
                );
                setBrandOwners([]);
            })
            .finally(() => setLoading(false));
    }, [refreshKey]);

    const toggleStatus = async (bo) => {
        try {
            const res = await api.patch(
                `/admin/brand-owner/${bo.user_id}/toggle-status`,
            );
            toast.success(`Account set to ${res.data.status}`);
            refresh();
        } catch (err) {
            toast.error(
                err.response?.data?.detail || "Failed to update status",
            );
        }
    };

    const filtered = brandOwners.filter((bo) => {
        const q = search.toLowerCase();
        const matchSearch =
            !search ||
            bo.full_name?.toLowerCase().includes(q) ||
            bo.email?.toLowerCase().includes(q) ||
            bo.brand_name?.toLowerCase().includes(q) ||
            bo.city?.toLowerCase().includes(q);
        const matchStatus =
            filterStatus === "all" || bo.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const totalSMS = brandOwners.reduce((s, b) => s + (b.credits?.sms || 0), 0);
    const totalWAU = brandOwners.reduce(
        (s, b) => s + (b.credits?.wa_utility || 0),
        0,
    );
    const totalWAM = brandOwners.reduce(
        (s, b) => s + (b.credits?.wa_marketing || 0),
        0,
    );

    return (
        <div className="space-y-5 pb-8">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">
                        Brand Owners
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Manage all brand owner accounts · {brandOwners.length}{" "}
                        total
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={refresh}
                        className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-colors"
                    >
                        <ArrowPathIcon className="w-4 h-4 text-slate-500" />
                    </button>
                    {!brandOwners.find((b) => b.brand_name === "Molecule") && (
                        <button
                            onClick={handleSeedMolecule}
                            disabled={seeding}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-60"
                            style={{
                                background:
                                    "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
                            }}
                        >
                            {seeding ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                "🏪"
                            )}
                            Setup Molecule Brand
                        </button>
                    )}
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
                        style={{
                            background:
                                "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                        }}
                    >
                        <UserPlusIcon className="w-4 h-4" />
                        Create Brand Owner
                    </button>
                </div>
            </div>

            {/* Platform Credits Summary */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{
                    background:
                        "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
                }}
            >
                <div className="px-6 py-5">
                    <p className="text-indigo-700 text-xs font-bold uppercase tracking-widest mb-4">
                        Platform Total Credits — All Brands Combined
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            {
                                label: "Total SMS Credits",
                                val: totalSMS.toLocaleString("en-IN"),
                                icon: "📱",
                                warn: totalSMS < 200,
                                bg: "bg-blue-100/70",
                                color: "text-blue-700",
                            },
                            {
                                label: "WA Utility Credits",
                                val: totalWAU.toLocaleString("en-IN"),
                                icon: "💚",
                                warn: totalWAU < 100,
                                bg: "bg-green-100/70",
                                color: "text-green-700",
                            },
                            {
                                label: "WA Marketing Credits",
                                val: totalWAM.toLocaleString("en-IN"),
                                icon: "💗",
                                warn: totalWAM < 100,
                                bg: "bg-pink-100/70",
                                color: "text-pink-700",
                            },
                        ].map((c) => (
                            <div
                                key={c.label}
                                className={`rounded-xl px-4 py-3 text-center border border-white/80 ${c.warn ? "bg-red-100/80" : c.bg}`}
                            >
                                <p className="text-xl mb-1">{c.icon}</p>
                                <p
                                    className={`text-2xl font-black ${c.warn ? "text-red-600" : c.color}`}
                                >
                                    {c.val}
                                </p>
                                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                                    {c.label}
                                </p>
                                {c.warn && (
                                    <p className="text-[10px] text-red-500 font-bold mt-1">
                                        Low Credits!
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-48">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, brand or city..."
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                </div>
                <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl">
                    {["all", "active", "inactive"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filterStatus === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                    {
                        label: "Total Brand Owners",
                        value: brandOwners.length,
                        icon: "👤",
                        bg: "bg-indigo-50/50",
                        color: "text-indigo-700",
                    },
                    {
                        label: "Active Accounts",
                        value: brandOwners.filter((b) => b.status === "active")
                            .length,
                        icon: "✅",
                        bg: "bg-green-50",
                        color: "text-green-700",
                    },
                    {
                        label: "Total Customers",
                        value: brandOwners
                            .reduce(
                                (s, b) => s + (b.stats?.total_customers || 0),
                                0,
                            )
                            .toLocaleString("en-IN"),
                        icon: "👥",
                        bg: "bg-blue-50",
                        color: "text-blue-700",
                    },
                    {
                        label: "Total Revenue",
                        value: `Rs.${(brandOwners.reduce((s, b) => s + (b.stats?.total_revenue || 0), 0) / 100000).toFixed(1)}L`,
                        icon: "💰",
                        bg: "bg-amber-50",
                        color: "text-amber-700",
                    },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className={`${stat.bg} rounded-2xl p-4`}
                    >
                        <p className="text-2xl mb-1">{stat.icon}</p>
                        <p className={`text-2xl font-black ${stat.color}`}>
                            {stat.value}
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="py-16 flex items-center justify-center">
                        <div className="w-7 h-7 border-2 border-t-transparent border-indigo-600 rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <BuildingOffice2Icon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">
                            {search
                                ? "No results found"
                                : "No brand owners yet"}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">
                                        Owner / Brand
                                    </th>
                                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">
                                        Business Info
                                    </th>
                                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">
                                        Contact
                                    </th>
                                    <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">
                                        Credits
                                    </th>
                                    <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">
                                        Stats
                                    </th>
                                    <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">
                                        Status
                                    </th>
                                    <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((bo) => (
                                    <tr
                                        key={bo.user_id}
                                        className="hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                                                    }}
                                                >
                                                    {bo.full_name?.charAt(0) ||
                                                        "B"}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        {bo.full_name}
                                                    </p>
                                                    <p className="text-xs text-indigo-600 font-medium mt-0.5">
                                                        {bo.brand_name}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {bo.business_type && (
                                                <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 mb-1">
                                                    {bo.business_type}
                                                </span>
                                            )}
                                            {(bo.city || bo.state) && (
                                                <p className="text-xs text-slate-400">
                                                    {[bo.city, bo.state]
                                                        .filter(Boolean)
                                                        .join(", ")}
                                                </p>
                                            )}
                                            {bo.company_name && (
                                                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[140px]">
                                                    {bo.company_name}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-sm text-slate-700">
                                                {bo.email}
                                            </p>
                                            {bo.phone && (
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {bo.phone}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1 justify-center flex-wrap">
                                                {[
                                                    {
                                                        val:
                                                            bo.credits?.sms ??
                                                            0,
                                                        label: "SMS",
                                                        low: 50,
                                                    },
                                                    {
                                                        val:
                                                            bo.credits
                                                                ?.wa_utility ??
                                                            0,
                                                        label: "WA-U",
                                                        low: 50,
                                                    },
                                                    {
                                                        val:
                                                            bo.credits
                                                                ?.wa_marketing ??
                                                            0,
                                                        label: "WA-M",
                                                        low: 50,
                                                    },
                                                ].map((c, i) => (
                                                    <div
                                                        key={i}
                                                        className={`text-center px-2 py-1 rounded-lg ${c.val < c.low ? "bg-red-50" : "bg-slate-100"}`}
                                                    >
                                                        <p
                                                            className={`text-xs font-black ${c.val < c.low ? "text-red-600" : "text-slate-700"}`}
                                                        >
                                                            {c.val}
                                                        </p>
                                                        <p className="text-[9px] text-slate-400">
                                                            {c.label}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <p className="text-xs text-slate-500">
                                                {(
                                                    bo.stats?.total_customers ||
                                                    0
                                                ).toLocaleString("en-IN")}{" "}
                                                customers
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Rs.
                                                {(
                                                    (bo.stats?.total_revenue ||
                                                        0) / 1000
                                                ).toFixed(0)}
                                                K revenue
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <StatusBadge status={bo.status} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        setEditCredits(bo)
                                                    }
                                                    title="Manage Credits"
                                                    className="w-8 h-8 rounded-lg bg-indigo-50/50 hover:bg-indigo-100/60 flex items-center justify-center transition-colors"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4 text-indigo-600" />
                                                </button>
                                                <Link
                                                    to={`/admin/brand-owner/${bo.user_id}`}
                                                    title="View Details"
                                                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                                >
                                                    <ChevronRightIcon className="w-4 h-4 text-slate-600" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        toggleStatus(bo)
                                                    }
                                                    title={
                                                        bo.status === "active"
                                                            ? "Deactivate"
                                                            : "Activate"
                                                    }
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                                        bo.status === "active"
                                                            ? "bg-red-50 hover:bg-red-100 text-red-500"
                                                            : "bg-green-50 hover:bg-green-100 text-green-600"
                                                    }`}
                                                >
                                                    {bo.status === "active" ? (
                                                        <NoSymbolIcon className="w-4 h-4" />
                                                    ) : (
                                                        <CheckCircleIcon className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setDeleteTarget(bo)
                                                    }
                                                    title="Delete"
                                                    className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors text-red-500"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showCreate && (
                <CreateModal
                    onClose={() => setShowCreate(false)}
                    onCreated={refresh}
                />
            )}
            {editCredits && (
                <QuickCreditsModal
                    bo={editCredits}
                    onClose={() => setEditCredits(null)}
                    onSaved={refresh}
                />
            )}
            {deleteTarget && (
                <DeleteModal
                    bo={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onDeleted={refresh}
                />
            )}
        </div>
    );
}
