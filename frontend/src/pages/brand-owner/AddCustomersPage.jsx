import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
    MagnifyingGlassIcon,
    UserPlusIcon,
    ArrowUpTrayIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowDownTrayIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    BuildingStorefrontIcon,
    MapPinIcon,
    SparklesIcon,
    QrCodeIcon,
    LinkIcon,
    ArrowPathIcon,
    XMarkIcon,
    CheckIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";

// ─── Indian States ────────────────────────────────────────────────────────────
const STATES = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Jammu & Kashmir",
    "Ladakh",
    "Chandigarh",
    "Puducherry",
];

// ─── CSV Parser (no external library) ─────────────────────────────────────────
function parseCSVLine(line) {
    const result = [];
    let cur = "",
        inQ = false;
    for (const ch of line) {
        if (ch === '"') {
            inQ = !inQ;
        } else if (ch === "," && !inQ) {
            result.push(cur.trim());
            cur = "";
        } else {
            cur += ch;
        }
    }
    result.push(cur.trim());
    return result;
}
function parseCSV(text) {
    const rows = text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split("\n")
        .filter((r) => r.trim());
    if (rows.length < 2) return { headers: [], data: [] };
    const headers = parseCSVLine(rows[0]).map((h) =>
        h.replace(/"/g, "").trim(),
    );
    const data = rows.slice(1).map((row, idx) => {
        const vals = parseCSVLine(row);
        return headers.reduce(
            (o, h, i) => ({
                ...o,
                [h]: (vals[i] || "").replace(/"/g, "").trim(),
            }),
            { _row: idx + 2 },
        );
    });
    return { headers, data };
}

// ─── Download a CSV string as a file ─────────────────────────────────────────
function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ─── Tab list ─────────────────────────────────────────────────────────────────
const TABS = [
    { id: "manual", label: "Add Manually", icon: UserPlusIcon },
    { id: "import", label: "Import Customers", icon: ArrowUpTrayIcon },
    {
        id: "transactions",
        label: "Import Transactions",
        icon: DocumentTextIcon,
    },
    { id: "pos", label: "POS Integrations", icon: BuildingStorefrontIcon },
    { id: "ecommerce", label: "E-Commerce Integration", icon: LinkIcon },
];

// ─── POS Partner data ─────────────────────────────────────────────────────────
const POS_PARTNERS = [
    { name: "POSist", color: "#0066cc", cat: "Restaurant" },
    { name: "eZee", color: "#f97316", cat: "Restaurant" },
    { name: "PetPooja", color: "#e91e8c", cat: "Restaurant" },
    { name: "RanceLab", color: "#1a1a1a", cat: "Retail" },
    { name: "GoFrugal", color: "#e55a1b", cat: "Retail" },
    { name: "Vasyerp", color: "#0ea5e9", cat: "Retail" },
    { name: "Posify", color: "#f59e0b", cat: "Restaurant" },
    { name: "TMBill", color: "#a89442", cat: "Retail" },
    { name: "Binix", color: "#0ea5e9", cat: "Retail" },
    { name: "QuickBill", color: "#0ea5e9", cat: "Retail" },
    { name: "DotPe", color: "#1a1a1a", cat: "Restaurant" },
    { name: "LithosPOS", color: "#c9b96e", cat: "Retail" },
    { name: "MARG ERP", color: "#0ea5e9", cat: "Retail" },
    { name: "ALLPOS", color: "#f97316", cat: "Retail" },
    { name: "Digitory", color: "#c9b96e", cat: "Retail" },
    { name: "Lucid POS", color: "#0ea5e9", cat: "Retail" },
    { name: "QPOS", color: "#f97316", cat: "Restaurant" },
    { name: "RoyalPOS", color: "#16a34a", cat: "Retail" },
    { name: "Sanguine POS", color: "#374151", cat: "Retail" },
    { name: "WebSys", color: "#16a34a", cat: "Retail" },
    { name: "Centramation", color: "#6b7280", cat: "Retail" },
    {
        name: "Ciferon",
        color: "#16a34a",
        cat: "Restaurant",
        light: true,
        bg: "#16a34a",
    },
    { name: "IVANA", color: "#fff", cat: "Retail", light: true, bg: "#1e4040" },
    { name: "ChefDesk", color: "#e91e8c", cat: "Restaurant" },
    { name: "Cypheron", color: "#1a1a1a", cat: "Retail" },
    { name: "CaptainPad", color: "#0ea5e9", cat: "Restaurant" },
    { name: "TOSSKEY", color: "#e91e8c", cat: "Retail" },
    { name: "Param Infotech", color: "#0ea5e9", cat: "Retail" },
    { name: "Inrkey PMS", color: "#e91e8c", cat: "Hotel" },
    { name: "zOrder", color: "#0ea5e9", cat: "Restaurant" },
    { name: "Pabbly", color: "#16a34a", cat: "Retail" },
    { name: "dataman", color: "#f97316", cat: "Retail" },
    { name: "ZipBooks", color: "#16a34a", cat: "Retail" },
    { name: "HappyOn", color: "#f59e0b", cat: "Restaurant" },
    { name: "CW Suite", color: "#16a34a", cat: "Retail" },
];

const ECOMMERCE_PARTNERS = [
    { name: "Shopify", color: "#96bf48", cat: "E-Commerce" },
    { name: "WooCommerce", color: "#7f54b3", cat: "E-Commerce" },
    { name: "Meesho", color: "#9c27b0", cat: "Social Commerce" },
    { name: "Flipkart", color: "#2874f0", cat: "Marketplace" },
    { name: "Amazon India", color: "#ff9900", cat: "Marketplace" },
    { name: "Magento", color: "#f26322", cat: "E-Commerce" },
    { name: "OpenCart", color: "#23aae1", cat: "E-Commerce" },
    {
        name: "BigCommerce",
        color: "#121118",
        cat: "E-Commerce",
        light: true,
        bg: "#121118",
    },
    { name: "Instamojo", color: "#e03d2e", cat: "Payment+Commerce" },
    { name: "Razorpay Magic", color: "#3395ff", cat: "Payment+Commerce" },
    { name: "Wix Stores", color: "#0c6efc", cat: "E-Commerce" },
    { name: "Squarespace", color: "#1a1a1a", cat: "E-Commerce" },
];

// ─── Partner Card ─────────────────────────────────────────────────────────────
function PartnerCard({ partner, onConnect, connected }) {
    return (
        <button
            onClick={() => onConnect(partner)}
            className={`relative bg-white border-2 rounded-2xl p-4 flex flex-col items-center justify-center hover:shadow-md transition-all duration-200 min-h-[90px] gap-2 ${
                connected
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-slate-200 hover:border-indigo-400"
            }`}
        >
            {connected && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-2.5 h-2.5 text-white" />
                </span>
            )}
            <div
                className="w-full flex items-center justify-center rounded-xl px-2 py-1.5 min-h-[44px]"
                style={partner.bg ? { background: partner.bg } : {}}
            >
                <span
                    className={`text-sm font-black leading-tight text-center ${partner.light ? "text-white" : ""}`}
                    style={!partner.light ? { color: partner.color } : {}}
                >
                    {partner.name}
                </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">
                {partner.cat}
            </span>
        </button>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: ADD MANUALLY
// ═══════════════════════════════════════════════════════════════════════════════
const EMPTY_FORM = {
    name: "",
    mobile: "",
    email: "",
    gender: "",
    dob: "",
    anniversary: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    store_id: "",
    notes: "",
};

function ManualTab() {
    const navigate = useNavigate();
    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [created, setCreated] = useState(null);
    const [stores, setStores] = useState([]);
    const [sendingWA, setSendingWA] = useState(false);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    useEffect(() => {
        api.get("/stores")
            .then((r) => setStores(r.data.stores || []))
            .catch(() => {});
    }, []);

    const validate = () => {
        if (!form.name.trim()) {
            toast.error("Full name is required");
            return false;
        }
        if (!form.mobile.trim()) {
            toast.error("Mobile number is required");
            return false;
        }
        if (!/^[6-9]\d{9}$/.test(form.mobile.replace(/\D/g, ""))) {
            toast.error("Enter a valid 10-digit Indian mobile number");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await api.post("/customers", {
                ...form,
                mobile: form.mobile.replace(/\D/g, "").replace(/^91/, ""),
            });
            setCreated(res.data);
            if (res.data?.duplicate) {
                toast.success("Customer already exists and is linked to the selected store.");
            } else {
                toast.success("Customer added successfully!");
            }
        } catch (err) {
            const detail = err.response?.data?.detail || "";
            if (detail === "DUPLICATE_CUSTOMER") {
                toast.error("This mobile number is already registered");
            } else {
                toast.error(detail || "Failed to add customer");
            }
        } finally {
            setLoading(false);
        }
    };

    const sendWelcome = async () => {
        if (!created) return;
        setSendingWA(true);
        try {
            await api.post(`/customers/${created.customer_id}/send-whatsapp`, {
                message: `Welcome to our loyalty program, ${created.name}! 🎉\n\nYour account is now active.\nLoyalty Tier: Silver ⭐\nReferral Code: ${created.referral_code}\n\nVisit us and start earning rewards on every purchase!`,
            });
            toast.success("Welcome message sent!");
        } catch {
            toast.error("Could not send WhatsApp message");
        } finally {
            setSendingWA(false);
        }
    };

    // ── Success State ────────────────────────────────────────────────────────────
    if (created) {
        return (
            <div className="max-w-2xl mx-auto space-y-5 animate-slide-up">
                {/* Success banner */}
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-6 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-black text-emerald-900">
                        {created.duplicate
                            ? "Customer Already Exists"
                            : "Customer Added!"}
                    </h2>
                    <p className="text-sm text-emerald-600 mt-1">
                        {created.duplicate
                            ? "Linked to the selected store"
                            : "Successfully enrolled in your loyalty program"}
                    </p>
                </div>

                {/* Customer card */}
                <div className="glass-card p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                            <span className="text-white font-black text-lg">
                                {created.name?.charAt(0)?.toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-black text-slate-900">
                                {created.name}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {created.mobile}{" "}
                                {created.email && `· ${created.email}`}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className="badge-silver">
                                    Silver Tier
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full font-semibold">
                                    <QrCodeIcon className="w-3 h-3" />{" "}
                                    {created.referral_code}
                                </span>
                                {created.city && (
                                    <span className="text-xs text-slate-400">
                                        {created.city}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
                        {[
                            {
                                label: "Points Balance",
                                value: "0",
                                color: "text-indigo-600",
                            },
                            {
                                label: "Loyalty Tier",
                                value: "Silver",
                                color: "text-slate-700",
                            },
                            {
                                label: "Total Orders",
                                value: "0",
                                color: "text-emerald-600",
                            },
                        ].map((s) => (
                            <div key={s.label} className="text-center">
                                <p className={`text-xl font-black ${s.color}`}>
                                    {s.value}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {s.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={sendWelcome}
                        disabled={sendingWA}
                        className="btn-primary flex-1 sm:flex-none"
                    >
                        {sendingWA ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                                Sending...
                            </>
                        ) : (
                            <>💬 Send Welcome WhatsApp</>
                        )}
                    </button>
                    <button
                        onClick={() =>
                            navigate(`/customers/${created.customer_id}`)
                        }
                        className="btn-secondary flex-1 sm:flex-none"
                    >
                        View Profile
                    </button>
                    <button
                        onClick={() => {
                            setCreated(null);
                            setForm(EMPTY_FORM);
                        }}
                        className="btn-secondary flex-1 sm:flex-none"
                    >
                        <UserPlusIcon className="w-4 h-4" /> Add Another
                    </button>
                </div>
            </div>
        );
    }

    // ── Form ─────────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <h2 className="text-xl font-black text-slate-900">
                    Add Customer Manually
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Add a new customer to your loyalty program. They'll start at{" "}
                    <strong>Silver tier</strong> and earn points from their
                    first purchase.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* ── Personal Info ── */}
                <div className="glass-card p-6 space-y-4">
                    <SectionHeader
                        icon={<UserPlusIcon className="w-4 h-4" />}
                        title="Personal Information"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Full Name *</label>
                            <input
                                className="input-field"
                                value={form.name}
                                onChange={(e) => set("name", e.target.value)}
                                placeholder="e.g. Priya Sharma"
                                required
                            />
                        </div>
                        <div>
                            <label className="input-label">
                                Mobile Number *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">
                                    +91
                                </span>
                                <input
                                    className="input-field pl-11"
                                    value={form.mobile}
                                    onChange={(e) =>
                                        set(
                                            "mobile",
                                            e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 10),
                                        )
                                    }
                                    placeholder="98765 43210"
                                    inputMode="numeric"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Email Address</label>
                            <input
                                className="input-field"
                                type="email"
                                value={form.email}
                                onChange={(e) => set("email", e.target.value)}
                                placeholder="priya@email.com"
                            />
                        </div>
                        <div>
                            <label className="input-label">Gender</label>
                            <select
                                className="input-field"
                                value={form.gender}
                                onChange={(e) => set("gender", e.target.value)}
                            >
                                <option value="">Select gender</option>
                                <option value="Female">Female</option>
                                <option value="Male">Male</option>
                                <option value="Other">
                                    Other / Prefer not to say
                                </option>
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Date of Birth</label>
                            <input
                                className="input-field"
                                type="date"
                                value={form.dob}
                                onChange={(e) => set("dob", e.target.value)}
                                max={new Date().toISOString().split("T")[0]}
                            />
                            <p className="text-xs text-slate-400 mt-1">
                                Used for birthday loyalty rewards
                            </p>
                        </div>
                        <div>
                            <label className="input-label">Anniversary</label>
                            <input
                                className="input-field"
                                type="date"
                                value={form.anniversary}
                                onChange={(e) =>
                                    set("anniversary", e.target.value)
                                }
                            />
                            <p className="text-xs text-slate-400 mt-1">
                                Used for anniversary special offers
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Address ── */}
                <div className="glass-card p-6 space-y-4">
                    <SectionHeader
                        icon={<MapPinIcon className="w-4 h-4" />}
                        title="Address"
                        subtitle="Optional — helps with location-based insights"
                    />
                    <div>
                        <label className="input-label">Street Address</label>
                        <input
                            className="input-field"
                            value={form.address}
                            onChange={(e) => set("address", e.target.value)}
                            placeholder="House / Flat, Street, Area"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="input-label">City</label>
                            <input
                                className="input-field"
                                value={form.city}
                                onChange={(e) => set("city", e.target.value)}
                                placeholder="New Delhi"
                            />
                        </div>
                        <div>
                            <label className="input-label">State</label>
                            <select
                                className="input-field"
                                value={form.state}
                                onChange={(e) => set("state", e.target.value)}
                            >
                                <option value="">Select state</option>
                                {STATES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Pincode</label>
                            <input
                                className="input-field"
                                value={form.pincode}
                                onChange={(e) =>
                                    set(
                                        "pincode",
                                        e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 6),
                                    )
                                }
                                placeholder="110001"
                                inputMode="numeric"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Store & Notes ── */}
                <div className="glass-card p-6 space-y-4">
                    <SectionHeader
                        icon={<BuildingStorefrontIcon className="w-4 h-4" />}
                        title="Store & Notes"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">
                                Enrolled At Store
                            </label>
                            <select
                                className="input-field"
                                value={form.store_id}
                                onChange={(e) =>
                                    set("store_id", e.target.value)
                                }
                            >
                                <option value="">
                                    Select store (optional)
                                </option>
                                {stores.map((s) => (
                                    <option key={s.store_id} value={s.store_id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Notes</label>
                            <input
                                className="input-field"
                                value={form.notes}
                                onChange={(e) => set("notes", e.target.value)}
                                placeholder="Any special note about this customer"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Info tip ── */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 flex gap-3">
                    <SparklesIcon className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-indigo-700 leading-relaxed">
                        The customer will start at <strong>Silver tier</strong>{" "}
                        with 0 points. Their loyalty points will accumulate with
                        every purchase. You can adjust points manually from the
                        customer profile.
                    </p>
                </div>

                {/* ── Submit ── */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => setForm(EMPTY_FORM)}
                        className="btn-secondary"
                    >
                        <ArrowPathIcon className="w-4 h-4" /> Reset
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                                Adding...
                            </>
                        ) : (
                            <>
                                <UserPlusIcon className="w-4 h-4" /> Add
                                Customer
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: IMPORT CUSTOMERS (CSV)
// ═══════════════════════════════════════════════════════════════════════════════
const CUSTOMER_CSV_TEMPLATE = `Name,Mobile,Email,Gender,Date of Birth (DD/MM/YYYY),Anniversary (DD/MM/YYYY),City,State,Pincode,Address
Priya Sharma,9876543210,priya@email.com,Female,15/06/1995,10/02/2018,New Delhi,Delhi,110001,"Block A, Sector 12"
Rahul Gupta,9812345678,rahul@email.com,Male,22/11/1988,,Mumbai,Maharashtra,400001,"Flat 5B Colaba"
Anjali Singh,9765432109,,Female,01/03/2000,,,,,
`;

function ImportCustomersTab() {
    const fileRef = useRef(null);
    const [file, setFile] = useState(null);
    const [parsed, setParsed] = useState(null); // { headers, data }
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null);
    const [drag, setDrag] = useState(false);

    const readFile = (f) => {
        if (!f) return;
        setFile(f);
        setParsed(null);
        setResult(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const parsed = parseCSV(text);
            setParsed(parsed);
        };
        reader.readAsText(f);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f && (f.name.endsWith(".csv") || f.name.endsWith(".txt")))
            readFile(f);
        else toast.error("Please upload a .csv file");
    };

    const handleImport = async () => {
        if (!parsed?.data?.length) {
            toast.error("No data to import");
            return;
        }
        setImporting(true);
        try {
            // Map CSV headers to our field names
            const customers = parsed.data.map((row) => ({
                name: row["Name"] || row["name"] || row["Full Name"] || "",
                mobile: (
                    row["Mobile"] ||
                    row["mobile"] ||
                    row["Phone"] ||
                    row["phone"] ||
                    ""
                )
                    .replace(/\D/g, "")
                    .replace(/^91/, "")
                    .slice(-10),
                email: row["Email"] || row["email"] || "",
                gender: row["Gender"] || row["gender"] || "",
                dob:
                    row["Date of Birth (DD/MM/YYYY)"] ||
                    row["DOB"] ||
                    row["dob"] ||
                    "",
                anniversary:
                    row["Anniversary (DD/MM/YYYY)"] || row["anniversary"] || "",
                city: row["City"] || row["city"] || "",
                state: row["State"] || row["state"] || "",
                pincode: row["Pincode"] || row["pincode"] || "",
                address: row["Address"] || row["address"] || "",
            }));
            const res = await api.post("/customers/bulk-import", { customers });
            setResult(res.data);
            toast.success(
                `Import complete: ${res.data.created} customers added`,
            );
        } catch (err) {
            toast.error(err.response?.data?.detail || "Import failed");
        } finally {
            setImporting(false);
        }
    };

    const reset = () => {
        setFile(null);
        setParsed(null);
        setResult(null);
    };

    // ── Result View ──
    if (result) {
        return (
            <div className="max-w-2xl mx-auto space-y-5 animate-slide-up">
                <div className="glass-card p-6">
                    <h3 className="text-lg font-black text-slate-900 mb-4">
                        Import Results
                    </h3>
                    <div className="grid grid-cols-3 gap-4 mb-5">
                        {[
                            {
                                label: "Created",
                                value: result.created,
                                color: "text-emerald-600",
                                bg: "bg-emerald-50",
                            },
                            {
                                label: "Duplicates",
                                value: result.duplicates,
                                color: "text-amber-600",
                                bg: "bg-amber-50",
                            },
                            {
                                label: "Errors",
                                value: result.errors,
                                color: "text-rose-600",
                                bg: "bg-rose-50",
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className={`${s.bg} rounded-2xl p-4 text-center`}
                            >
                                <p className={`text-3xl font-black ${s.color}`}>
                                    {s.value}
                                </p>
                                <p className="text-xs font-semibold text-slate-500 mt-1">
                                    {s.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    {result.error_list?.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">
                                Rows with errors
                            </p>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                {result.error_list.map((e, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2.5 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2"
                                    >
                                        <XCircleIcon className="w-4 h-4 text-rose-500 flex-shrink-0" />
                                        <span className="text-xs text-rose-700 font-medium">
                                            Row {e.row}:{" "}
                                            {e.name || e.mobile || "—"} —{" "}
                                            {e.reason}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {result.duplicate_list?.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
                                Skipped duplicates
                            </p>
                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                {result.duplicate_list.map((d, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2"
                                    >
                                        <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                        <span className="text-xs text-amber-700 font-medium">
                                            {d.name || "—"} ({d.mobile}) —
                                            already exists
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={reset} className="btn-secondary w-full">
                    <ArrowUpTrayIcon className="w-4 h-4" /> Import Another File
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-5">
            <div>
                <h2 className="text-xl font-black text-slate-900 mb-1">
                    Import Customers via CSV
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                    Upload a CSV file with your existing customer data. We'll
                    add new customers and skip existing ones.
                </p>
            </div>

            {/* Attention */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-700">
                        Before you import
                    </p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                        • Customer imports are permanent and cannot be reversed.
                        Double-check your data before proceeding.
                    </p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                        • Customers with existing mobile numbers will be skipped
                        to avoid duplicates.
                    </p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                        • Imported customers start at Silver tier with 0 points.
                    </p>
                </div>
            </div>

            {/* Template download */}
            <div className="glass-card p-5 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-bold text-slate-900">
                        Download CSV Template
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Use our template to ensure correct column formatting
                    </p>
                </div>
                <button
                    onClick={() =>
                        downloadCSV(
                            CUSTOMER_CSV_TEMPLATE,
                            "customer_import_template.csv",
                        )
                    }
                    className="btn-secondary flex-shrink-0"
                >
                    <ArrowDownTrayIcon className="w-4 h-4" /> Download Template
                </button>
            </div>

            {/* Required columns */}
            <div className="glass-card p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    CSV Column Reference
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                        { col: "Name", req: false, desc: "Customer full name" },
                        {
                            col: "Mobile",
                            req: true,
                            desc: "10-digit Indian mobile (required)",
                        },
                        { col: "Email", req: false, desc: "Email address" },
                        {
                            col: "Gender",
                            req: false,
                            desc: "Male / Female / Other",
                        },
                        {
                            col: "Date of Birth (DD/MM/YYYY)",
                            req: false,
                            desc: "e.g. 15/06/1995",
                        },
                        {
                            col: "Anniversary (DD/MM/YYYY)",
                            req: false,
                            desc: "e.g. 10/02/2018",
                        },
                        { col: "City", req: false, desc: "City name" },
                        { col: "State", req: false, desc: "State name" },
                        { col: "Pincode", req: false, desc: "6-digit pincode" },
                        { col: "Address", req: false, desc: "Full address" },
                    ].map((c) => (
                        <div key={c.col} className="flex items-start gap-2">
                            <span
                                className={`text-xs font-mono px-1.5 py-0.5 rounded font-semibold flex-shrink-0 ${c.req ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}
                            >
                                {c.col}
                            </span>
                            <span className="text-xs text-slate-500">
                                {c.desc}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upload zone */}
            {!file ? (
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDrag(true);
                    }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                        drag
                            ? "border-indigo-400 bg-indigo-50"
                            : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
                    }`}
                >
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <ArrowUpTrayIcon className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-slate-700">
                            Drop your CSV file here
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            or click to browse — .csv files only
                        </p>
                    </div>
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".csv,.txt"
                        className="hidden"
                        onChange={(e) => readFile(e.target.files?.[0])}
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    {/* File info bar */}
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <DocumentTextIcon className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">
                                    {file.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {parsed?.data?.length || 0} rows detected
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={reset}
                            className="text-slate-400 hover:text-rose-500 transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Preview table */}
                    {parsed?.data?.length > 0 && (
                        <div className="glass-card overflow-hidden">
                            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                                <p className="text-sm font-bold text-slate-700">
                                    Preview (first 5 rows)
                                </p>
                                <span
                                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                        parsed.data.length > 0
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-rose-50 text-rose-700"
                                    }`}
                                >
                                    {parsed.data.length} total rows
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            {parsed.headers
                                                .slice(0, 6)
                                                .map((h) => (
                                                    <th key={h}>{h}</th>
                                                ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsed.data
                                            .slice(0, 5)
                                            .map((row, i) => (
                                                <tr key={i}>
                                                    {parsed.headers
                                                        .slice(0, 6)
                                                        .map((h) => (
                                                            <td
                                                                key={h}
                                                                className="text-slate-700 text-xs"
                                                            >
                                                                {row[h] || "—"}
                                                            </td>
                                                        ))}
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button onClick={reset} className="btn-secondary">
                            Change File
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={importing || !parsed?.data?.length}
                            className="btn-primary flex-1"
                        >
                            {importing ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                                    Importing {parsed?.data?.length}{" "}
                                    customers...
                                </>
                            ) : (
                                <>
                                    <ArrowUpTrayIcon className="w-4 h-4" />{" "}
                                    Import {parsed?.data?.length} Customers
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: IMPORT TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════════════════
const TXN_CSV_TEMPLATE = `Customer Mobile,Bill Amount (₹),Date (DD/MM/YYYY),Invoice Number
9876543210,1500,15/06/2026,INV-2026-001
9812345678,2800,14/06/2026,INV-2026-002
9765432109,950,13/06/2026,INV-2026-003
`;

function ImportTransactionsTab() {
    const fileRef = useRef(null);
    const [file, setFile] = useState(null);
    const [parsed, setParsed] = useState(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null);
    const [drag, setDrag] = useState(false);

    const readFile = (f) => {
        if (!f) return;
        setFile(f);
        setParsed(null);
        setResult(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            setParsed(parseCSV(e.target.result));
        };
        reader.readAsText(f);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f?.name.endsWith(".csv")) readFile(f);
        else toast.error("Please upload a .csv file");
    };

    const handleImport = async () => {
        if (!parsed?.data?.length) {
            toast.error("No data to import");
            return;
        }
        setImporting(true);
        try {
            const transactions = parsed.data.map((row) => ({
                mobile: (
                    row["Customer Mobile"] ||
                    row["Mobile"] ||
                    row["mobile"] ||
                    ""
                )
                    .replace(/\D/g, "")
                    .replace(/^91/, "")
                    .slice(-10),
                amount:
                    parseFloat(
                        row["Bill Amount (₹)"] ||
                            row["Amount"] ||
                            row["amount"] ||
                            0,
                    ) || 0,
                date:
                    row["Date (DD/MM/YYYY)"] ||
                    row["Date"] ||
                    row["date"] ||
                    "",
                invoice:
                    row["Invoice Number"] ||
                    row["invoice"] ||
                    row["Invoice"] ||
                    "",
            }));
            const res = await api.post("/customers/import-transactions", {
                transactions,
            });
            setResult(res.data);
            toast.success(
                `Transactions imported! ${res.data.total_points_awarded?.toLocaleString("en-IN") || 0} points awarded`,
            );
        } catch (err) {
            toast.error(err.response?.data?.detail || "Import failed");
        } finally {
            setImporting(false);
        }
    };

    const reset = () => {
        setFile(null);
        setParsed(null);
        setResult(null);
    };

    if (result) {
        return (
            <div className="max-w-2xl mx-auto space-y-5 animate-slide-up">
                <div className="glass-card p-6">
                    <h3 className="text-lg font-black text-slate-900 mb-4">
                        Transaction Import Results
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                        {[
                            {
                                label: "Total Rows",
                                value: result.total,
                                color: "text-slate-700",
                                bg: "bg-slate-50",
                            },
                            {
                                label: "Processed",
                                value: result.processed,
                                color: "text-emerald-600",
                                bg: "bg-emerald-50",
                            },
                            {
                                label: "Errors",
                                value: result.errors,
                                color: "text-rose-600",
                                bg: "bg-rose-50",
                            },
                            {
                                label: "Points Awarded",
                                value: (
                                    result.total_points_awarded || 0
                                ).toLocaleString("en-IN"),
                                color: "text-indigo-600",
                                bg: "bg-indigo-50",
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className={`${s.bg} rounded-2xl p-4 text-center`}
                            >
                                <p className={`text-2xl font-black ${s.color}`}>
                                    {s.value}
                                </p>
                                <p className="text-xs font-semibold text-slate-500 mt-1">
                                    {s.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    {result.error_list?.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">
                                Failed Rows
                            </p>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                {result.error_list.map((e, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2.5 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2"
                                    >
                                        <XCircleIcon className="w-4 h-4 text-rose-500 flex-shrink-0" />
                                        <span className="text-xs text-rose-700 font-medium">
                                            Row {e.row}: {e.mobile || "—"} —{" "}
                                            {e.reason}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <button onClick={reset} className="btn-secondary w-full">
                    <ArrowUpTrayIcon className="w-4 h-4" /> Import Another File
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-5">
            <div>
                <h2 className="text-xl font-black text-slate-900 mb-1">
                    Import Past Transactions
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                    Upload historical billing data. We'll credit loyalty points
                    and update customer lifetime value automatically.
                </p>
            </div>

            {/* Info banner */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3">
                <InformationCircleIcon className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-xs font-bold text-indigo-700">
                        How points are calculated
                    </p>
                    <p className="text-xs text-indigo-600 leading-relaxed">
                        Every ₹10 in bill amount = 1 loyalty point. A ₹1,500
                        bill earns 150 points.
                    </p>
                    <p className="text-xs text-indigo-600 leading-relaxed">
                        Customers must already exist in your system. Add new
                        customers first using Import Customers tab.
                    </p>
                </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                    Transaction imports are <strong>permanent</strong>. Points
                    once awarded cannot be reversed in bulk. Please verify your
                    data before importing.
                </p>
            </div>

            {/* Template */}
            <div className="glass-card p-5 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-bold text-slate-900">
                        Download CSV Template
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Required columns: Customer Mobile, Bill Amount, Date,
                        Invoice Number
                    </p>
                </div>
                <button
                    onClick={() =>
                        downloadCSV(
                            TXN_CSV_TEMPLATE,
                            "transaction_import_template.csv",
                        )
                    }
                    className="btn-secondary flex-shrink-0"
                >
                    <ArrowDownTrayIcon className="w-4 h-4" /> Download
                </button>
            </div>

            {/* Upload */}
            {!file ? (
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDrag(true);
                    }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center gap-3 cursor-pointer transition-all ${
                        drag
                            ? "border-indigo-400 bg-indigo-50"
                            : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
                    }`}
                >
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <ArrowUpTrayIcon className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-slate-700">
                            Drop your transaction CSV here
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            or click to browse
                        </p>
                    </div>
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => readFile(e.target.files?.[0])}
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <DocumentTextIcon className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">
                                    {file.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {parsed?.data?.length || 0} transactions
                                    detected
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={reset}
                            className="text-slate-400 hover:text-rose-500"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {parsed?.data?.length > 0 && (
                        <div className="glass-card overflow-hidden">
                            <div className="px-5 py-3 border-b border-slate-100">
                                <p className="text-sm font-bold text-slate-700">
                                    Preview (first 5 rows)
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            {parsed.headers.map((h) => (
                                                <th key={h}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsed.data
                                            .slice(0, 5)
                                            .map((row, i) => (
                                                <tr key={i}>
                                                    {parsed.headers.map((h) => (
                                                        <td
                                                            key={h}
                                                            className="text-xs"
                                                        >
                                                            {row[h] || "—"}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button onClick={reset} className="btn-secondary">
                            Change File
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={importing || !parsed?.data?.length}
                            className="btn-primary flex-1"
                        >
                            {importing ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <ArrowUpTrayIcon className="w-4 h-4" />{" "}
                                    Import {parsed?.data?.length} Transactions
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4: POS INTEGRATIONS
// ═══════════════════════════════════════════════════════════════════════════════
function POSTab() {
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("All");
    const [connected, setConnected] = useState({});
    const [reqModal, setReqModal] = useState(null); // partner name
    const [apiKey, setApiKey] = useState("");

    const cats = ["All", ...new Set(POS_PARTNERS.map((p) => p.cat))];
    const filtered = POS_PARTNERS.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) &&
            (catFilter === "All" || p.cat === catFilter),
    );

    const handleConnect = (partner) => {
        if (connected[partner.name]) {
            toast.success(`${partner.name} is already connected`);
            return;
        }
        setReqModal(partner.name);
    };

    const handleSendRequest = () => {
        if (!apiKey.trim()) {
            toast.error("Please enter your API Key / Merchant ID");
            return;
        }
        setConnected((prev) => ({ ...prev, [reqModal]: true }));
        toast.success(
            `Integration request sent for ${reqModal}! Our team will configure it within 24 hours.`,
        );
        setReqModal(null);
        setApiKey("");
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-900 mb-1">
                    POS Integrations
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                    Connect your existing POS system to automatically sync
                    customers and transactions with your loyalty program. New
                    customers added at POS will be enrolled instantly.
                </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    {
                        icon: "⚡",
                        title: "Auto Sync",
                        desc: "Customers & bills synced in real-time",
                    },
                    {
                        icon: "🎯",
                        title: "Zero Manual Work",
                        desc: "No staff training needed at billing counter",
                    },
                    {
                        icon: "📊",
                        title: "Full Analytics",
                        desc: "See revenue, visits and trends automatically",
                    },
                ].map((b) => (
                    <div
                        key={b.title}
                        className="glass-card p-4 flex items-start gap-3"
                    >
                        <span className="text-2xl">{b.icon}</span>
                        <div>
                            <p className="text-sm font-bold text-slate-900">
                                {b.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {b.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-xs">
                    <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        className="input-field pl-9"
                        placeholder="Search POS systems..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {cats.map((c) => (
                        <button
                            key={c}
                            onClick={() => setCatFilter(c)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                                catFilter === c
                                    ? "bg-indigo-600 text-white border-indigo-600"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-400"
                            }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Partner grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {filtered.map((p) => (
                    <PartnerCard
                        key={p.name}
                        partner={p}
                        onConnect={handleConnect}
                        connected={!!connected[p.name]}
                    />
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-5 py-10 text-center text-sm text-slate-400">
                        No POS found for "{search}"
                    </div>
                )}
            </div>

            <p className="text-xs text-slate-400 text-center">
                Don't see your POS?{" "}
                <button
                    className="text-indigo-600 font-semibold hover:underline"
                    onClick={() =>
                        toast.success(
                            "Our team will reach out to set up a custom integration!",
                        )
                    }
                >
                    Request custom integration →
                </button>
            </p>

            {/* Request modal */}
            {reqModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm border border-slate-100 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900">
                                Connect {reqModal}
                            </h3>
                            <button
                                onClick={() => {
                                    setReqModal(null);
                                    setApiKey("");
                                }}
                                className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm text-slate-500">
                            Enter your {reqModal} API Key or Merchant ID to
                            initiate the integration. Our team will complete the
                            setup within 24 hours.
                        </p>
                        <div>
                            <label className="input-label">
                                API Key / Merchant ID *
                            </label>
                            <input
                                className="input-field"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter your API key..."
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setReqModal(null);
                                    setApiKey("");
                                }}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendRequest}
                                className="btn-primary flex-1"
                            >
                                Send Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 5: E-COMMERCE INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════
function ECommerceTab() {
    const [search, setSearch] = useState("");
    const [connected, setConnected] = useState({});
    const [reqModal, setReqModal] = useState(null);
    const [storeURL, setStoreURL] = useState("");

    const filtered = ECOMMERCE_PARTNERS.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
    );

    const handleConnect = (partner) => {
        if (connected[partner.name]) {
            toast.success(`${partner.name} is already connected`);
            return;
        }
        setReqModal(partner.name);
    };

    const handleSave = () => {
        if (!storeURL.trim()) {
            toast.error("Please enter your store URL");
            return;
        }
        setConnected((prev) => ({ ...prev, [reqModal]: true }));
        toast.success(
            `${reqModal} integration request submitted! We'll configure it within 24 hours.`,
        );
        setReqModal(null);
        setStoreURL("");
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-900 mb-1">
                    E-Commerce Integration
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                    Connect your online store to sync customers, orders and
                    loyalty points between online and offline channels.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    {
                        icon: "🛒",
                        title: "Omnichannel Loyalty",
                        desc: "Points earned online work in-store and vice versa",
                    },
                    {
                        icon: "📦",
                        title: "Order Sync",
                        desc: "All online orders update customer lifetime value",
                    },
                    {
                        icon: "💌",
                        title: "Unified Campaigns",
                        desc: "Send campaigns to both online & offline customers",
                    },
                ].map((b) => (
                    <div
                        key={b.title}
                        className="glass-card p-4 flex items-start gap-3"
                    >
                        <span className="text-2xl">{b.icon}</span>
                        <div>
                            <p className="text-sm font-bold text-slate-900">
                                {b.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {b.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="relative max-w-xs">
                <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    className="input-field pl-9"
                    placeholder="Search platforms..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filtered.map((p) => (
                    <PartnerCard
                        key={p.name}
                        partner={p}
                        onConnect={handleConnect}
                        connected={!!connected[p.name]}
                    />
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-4 py-10 text-center text-sm text-slate-400">
                        No platform found for "{search}"
                    </div>
                )}
            </div>

            <p className="text-xs text-slate-400 text-center">
                Don't see your platform?{" "}
                <button
                    className="text-indigo-600 font-semibold hover:underline"
                    onClick={() => toast.success("Our team will reach out!")}
                >
                    Request custom integration →
                </button>
            </p>

            {reqModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm border border-slate-100 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900">
                                Connect {reqModal}
                            </h3>
                            <button
                                onClick={() => {
                                    setReqModal(null);
                                    setStoreURL("");
                                }}
                                className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm text-slate-500">
                            Enter your {reqModal} store URL. Our team will
                            install the loyalty integration plugin within 24
                            hours.
                        </p>
                        <div>
                            <label className="input-label">Store URL *</label>
                            <input
                                className="input-field"
                                value={storeURL}
                                onChange={(e) => setStoreURL(e.target.value)}
                                placeholder="https://yourstore.com"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setReqModal(null);
                                    setStoreURL("");
                                }}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn-primary flex-1"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
function SectionHeader({ icon, title, subtitle }) {
    return (
        <div className="flex items-center gap-2 mb-1">
            <span className="text-slate-400">{icon}</span>
            <div>
                <p className="text-sm font-bold text-slate-700">{title}</p>
                {subtitle && (
                    <p className="text-xs text-slate-400">{subtitle}</p>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AddCustomersPage() {
    const [activeTab, setActiveTab] = useState("manual");

    return (
        <div className="space-y-6 pb-12 animate-slide-up">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Add Customers</h1>
                    <p className="page-subtitle">
                        Grow your loyalty program — add customers manually,
                        import from CSV, or connect your POS/e-commerce
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 flex-wrap border-b border-slate-100 pb-0">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all duration-200 ${
                                active
                                    ? "border-indigo-600 text-indigo-700"
                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab content */}
            <div className="pt-1">
                {activeTab === "manual" && <ManualTab />}
                {activeTab === "import" && <ImportCustomersTab />}
                {activeTab === "transactions" && <ImportTransactionsTab />}
                {activeTab === "pos" && <POSTab />}
                {activeTab === "ecommerce" && <ECommerceTab />}
            </div>
        </div>
    );
}
