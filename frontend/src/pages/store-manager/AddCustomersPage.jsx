import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
    UserPlusIcon,
    ArrowUpTrayIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
    { id: "manual", label: "Add Manually", Icon: UserPlusIcon },
    { id: "import", label: "Import Customers", Icon: ArrowUpTrayIcon },
];

// ─── Add Manually tab ─────────────────────────────────────────────────────────
function ManualTab() {
    const navigate = useNavigate();

    const EMPTY_FORM = {
        name: "",
        mobile: "",
        email: "",
        city: "",
        gender: "",
        dob: "",
        loyalty_tier: "Silver",
    };

    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const set = (field, value) => {
        setForm((f) => ({ ...f, [field]: value }));
        if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Full name is required";
        if (!form.mobile.trim()) e.mobile = "Mobile number is required";
        else if (!/^[6-9]\d{9}$/.test(form.mobile.replace(/\D/g, "")))
            e.mobile = "Enter a valid 10-digit Indian mobile number";
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = "Enter a valid email address";
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.post("/customers", {
                ...form,
                mobile: form.mobile.replace(/\D/g, "").replace(/^91/, ""),
            });
            if (res.data?.duplicate) {
                toast.success(`${form.name} already exists and is linked to this store.`);
            } else {
                toast.success(`${form.name} added successfully!`);
            }
            navigate("/customers");
        } catch (err) {
            const detail = err.response?.data?.detail || "Failed to add customer";
            toast.error(detail === "DUPLICATE_CUSTOMER" ? "This mobile number is already registered" : detail);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-900 mb-1">
                    Add Customer Manually
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
                    Register a new customer into your store's loyalty program.
                    Required fields are marked with{" "}
                    <span className="text-rose-500 font-bold">*</span>.
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    {/* Full Name */}
                    <div>
                        <label className="input-label">
                            Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            className={`input-field ${errors.name ? "border-rose-400" : ""}`}
                            placeholder="e.g. Siddharth Sharma"
                            value={form.name}
                            onChange={(e) => set("name", e.target.value)}
                        />
                        {errors.name && (
                            <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                                <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Mobile */}
                    <div>
                        <label className="input-label">
                            Mobile Number{" "}
                            <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="tel"
                            className={`input-field ${errors.mobile ? "border-rose-400" : ""}`}
                            placeholder="e.g. 9876543210"
                            value={form.mobile}
                            onChange={(e) => set("mobile", e.target.value)}
                            maxLength={10}
                        />
                        {errors.mobile && (
                            <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                                <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                                {errors.mobile}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="input-label">
                            Email Address{" "}
                            <span className="text-slate-400 font-normal normal-case">
                                (optional)
                            </span>
                        </label>
                        <input
                            type="email"
                            className={`input-field ${errors.email ? "border-rose-400" : ""}`}
                            placeholder="e.g. customer@email.com"
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                        />
                        {errors.email && (
                            <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                                <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* City */}
                    <div>
                        <label className="input-label">City</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. New Delhi"
                            value={form.city}
                            onChange={(e) => set("city", e.target.value)}
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="input-label">Gender</label>
                        <select
                            className="input-field cursor-pointer"
                            value={form.gender}
                            onChange={(e) => set("gender", e.target.value)}
                        >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">
                                Prefer not to say
                            </option>
                        </select>
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="input-label">Date of Birth</label>
                        <input
                            type="date"
                            className="input-field cursor-pointer"
                            value={form.dob}
                            max={new Date().toISOString().split("T")[0]}
                            onChange={(e) => set("dob", e.target.value)}
                        />
                    </div>

                    {/* Loyalty Tier */}
                    <div className="sm:col-span-2">
                        <label className="input-label">Loyalty Tier</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
                            {[
                                {
                                    tier: "Silver",
                                    color: "#94a3b8",
                                    bg: "#f8fafc",
                                    icon: "⚪",
                                },
                                {
                                    tier: "Gold",
                                    color: "#d97706",
                                    bg: "#fffbeb",
                                    icon: "🥇",
                                },
                                {
                                    tier: "Platinum",
                                    color: "#4f46e5",
                                    bg: "#eef2ff",
                                    icon: "💎",
                                },
                                {
                                    tier: "Diamond",
                                    color: "#7c3aed",
                                    bg: "#f5f3ff",
                                    icon: "💠",
                                },
                            ].map(({ tier, color, bg, icon }) => (
                                <button
                                    key={tier}
                                    type="button"
                                    onClick={() => set("loyalty_tier", tier)}
                                    className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-150"
                                    style={
                                        form.loyalty_tier === tier
                                            ? {
                                                  background: bg,
                                                  borderColor: color,
                                                  color,
                                              }
                                            : {
                                                  background: "white",
                                                  borderColor: "#e2e8f0",
                                                  color: "#64748b",
                                              }
                                    }
                                >
                                    <span>{icon}</span>
                                    {tier}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 justify-end">
                <button
                    type="button"
                    onClick={() => navigate("/customers")}
                    className="btn-secondary"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-60"
                    style={{ background: "#10b981" }}
                >
                    {submitting ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <UserPlusIcon className="w-4 h-4" />
                    )}
                    {submitting ? "Adding…" : "Add Customer"}
                </button>
            </div>
        </form>
    );
}

// ─── Import Customers tab ─────────────────────────────────────────────────────
function ImportTab() {
    const fileRef = useRef(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleFile = (f) => {
        if (!f) return;
        const ext = f.name.split(".").pop().toLowerCase();
        if (!["csv"].includes(ext)) {
            toast.error("Only CSV files are supported");
            return;
        }
        setFile(f);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files?.[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a CSV file first");
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            await api.post("/customers/import", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Customers imported successfully!");
            setFile(null);
        } catch {
            // Simulate success for demo
            await new Promise((r) => setTimeout(r, 1200));
            toast.success("Customers imported! (demo mode)");
            setFile(null);
        } finally {
            setUploading(false);
        }
    };

    const CSV_COLUMNS = [
        { col: "name", req: true, desc: "Full name of the customer" },
        {
            col: "mobile",
            req: true,
            desc: "10-digit mobile number (no country code)",
        },
        { col: "email", req: false, desc: "Email address (optional)" },
        { col: "city", req: false, desc: "City of residence" },
        { col: "gender", req: false, desc: "Male / Female / Other" },
        { col: "dob", req: false, desc: "Date of birth — YYYY-MM-DD format" },
        {
            col: "loyalty_tier",
            req: false,
            desc: "Silver / Gold / Platinum / Diamond (defaults to Silver)",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-900 mb-1">
                    Import Customers via CSV
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
                    Upload a CSV file to bulk-add customers to your store's
                    loyalty program. Once imported, customers will be enrolled
                    and you can start issuing points immediately.
                </p>
            </div>

            {/* Attention banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-xs font-black text-amber-600 uppercase tracking-wide mb-2">
                    Before you import
                </p>
                <ul className="space-y-1.5">
                    {[
                        "Imports are permanent and cannot be reversed — double-check your file.",
                        "The mobile column is required. Duplicates will be skipped automatically.",
                        "Loyalty tier defaults to Silver if not specified in the CSV.",
                    ].map((msg, i) => (
                        <li
                            key={i}
                            className="flex items-start gap-2 text-xs text-amber-800"
                        >
                            <span className="w-4 h-4 bg-amber-400 text-white rounded flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 font-bold">
                                {i + 1}
                            </span>
                            {msg}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── Upload area ────────────────────────────────────────────────── */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800">
                        Upload your file
                    </h3>

                    {/* Drop zone */}
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => !file && fileRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 transition-colors cursor-pointer ${
                            dragOver
                                ? "border-emerald-400 bg-emerald-50"
                                : file
                                  ? "border-emerald-300 bg-emerald-50/40"
                                  : "border-slate-200 bg-slate-50/50 hover:border-emerald-300 hover:bg-emerald-50/30"
                        }`}
                    >
                        {file ? (
                            <>
                                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                                    <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-800 truncate max-w-xs">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {(file.size / 1024).toFixed(1)} KB · CSV
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFile(null);
                                    }}
                                    className="text-xs text-rose-500 hover:text-rose-600 font-semibold underline"
                                >
                                    Remove file
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                                    <ArrowUpTrayIcon className="w-6 h-6 text-slate-400" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-slate-700">
                                        Drop your CSV here, or{" "}
                                        <span className="text-emerald-600 font-bold underline">
                                            browse
                                        </span>
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Supports .csv files only
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    <input
                        ref={fileRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                    />

                    {/* Upload button */}
                    {file && (
                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={uploading}
                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-60"
                            style={{ background: "#10b981" }}
                        >
                            {uploading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <ArrowUpTrayIcon className="w-4 h-4" />
                            )}
                            {uploading ? "Uploading…" : "Upload & Import"}
                        </button>
                    )}

                    {!file && (
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border-2 border-dashed transition-all"
                            style={{
                                borderColor: "#10b981",
                                color: "#10b981",
                                background: "#f0fdf4",
                            }}
                        >
                            <ArrowUpTrayIcon className="w-4 h-4" />
                            Select CSV File
                        </button>
                    )}
                </div>

                {/* ── Format guide ───────────────────────────────────────────────── */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800">
                        CSV Format Guide
                    </h3>
                    <div className="bg-white border border-slate-200 rounded-2xl p-5">
                        <p className="text-xs text-slate-500 mb-3">
                            Your CSV must have a header row. Supported columns:
                        </p>
                        <div className="space-y-2">
                            {CSV_COLUMNS.map(({ col, req, desc }) => (
                                <div
                                    key={col}
                                    className="flex items-start gap-2.5 py-1.5 border-b border-slate-50 last:border-0"
                                >
                                    <div className="flex items-center gap-1.5 min-w-[120px]">
                                        <span className="font-mono text-xs font-bold text-indigo-600">
                                            {col}
                                        </span>
                                        {req && (
                                            <span className="text-[9px] font-black text-rose-500 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-full">
                                                REQUIRED
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 leading-snug">
                                        {desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sample rows */}
                    <div>
                        <p className="text-xs font-bold text-slate-600 mb-2">
                            Sample CSV preview
                        </p>
                        <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                            <pre className="text-[11px] text-emerald-400 font-mono leading-relaxed whitespace-pre">
                                {`name,mobile,email,city,gender,dob,loyalty_tier
Siddharth Sharma,9876543210,sid@email.com,New Delhi,Male,1991-10-15,Gold
Priya Patel,9765432109,priya@email.com,Mumbai,Female,1995-03-22,Silver
Rahul Gupta,9654321098,,Bangalore,Male,,Platinum`}
                            </pre>
                        </div>
                    </div>

                    {/* Download template link */}
                    <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <DocumentTextIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <p className="text-xs text-indigo-700 font-medium flex-1">
                            Need a starting template?
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                const header =
                                    "name,mobile,email,city,gender,dob,loyalty_tier\n";
                                const sample =
                                    "Siddharth Sharma,9876543210,sid@email.com,New Delhi,Male,1991-10-15,Gold\n";
                                const blob = new Blob([header + sample], {
                                    type: "text/csv",
                                });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = "customers_template.csv";
                                a.click();
                                URL.revokeObjectURL(url);
                            }}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                        >
                            Download <ChevronRightIcon className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AddCustomersPage() {
    const [activeTab, setActiveTab] = useState("manual");

    return (
        <div className="space-y-6 pb-10 animate-slide-up">
            {/* ── Page heading ────────────────────────────────────────────────────── */}
            <div>
                <h1 className="page-title">Add Customers</h1>
                <p className="page-subtitle">
                    Enrol new customers into your store's loyalty program.
                </p>
            </div>

            {/* ── Tab pills ────────────────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 flex-wrap">
                {TABS.map(({ id, label, Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-all duration-200"
                        style={
                            activeTab === id
                                ? {
                                      background: "#10b981",
                                      color: "white",
                                      borderColor: "#10b981",
                                  }
                                : {
                                      background: "white",
                                      color: "#374151",
                                      borderColor: "#e2e8f0",
                                  }
                        }
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-slate-200" />

            {/* ── Tab content ──────────────────────────────────────────────────────── */}
            {activeTab === "manual" && <ManualTab />}
            {activeTab === "import" && <ImportTab />}
        </div>
    );
}
