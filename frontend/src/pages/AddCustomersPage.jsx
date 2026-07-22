import React, { useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import {
    MagnifyingGlassIcon,
    ArrowRightIcon,
    ChevronDownIcon,
    PlayIcon,
} from "@heroicons/react/24/outline";

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
    { id: "pos", label: "POS Integrations" },
    { id: "import", label: "Import Customers" },
    { id: "manual", label: "Add manually" },
    { id: "ecommerce", label: "E-Commerce Integration" },
    { id: "transactions", label: "Import Transactions" },
];

// ─── POS partner list ─────────────────────────────────────────────────────────
const POS_PARTNERS = [
    { name: "POSist", color: "#0066cc", textColor: "#0066cc", hasLogo: true },
    { name: "eZee", color: "#f97316", textColor: "#ea580c", hasLogo: true },
    { name: "PetPooja", color: "#e91e8c", textColor: "#e91e8c", hasLogo: true },
    { name: "RanceLab", color: "#1a1a1a", textColor: "#1a1a1a", hasLogo: true },
    { name: "GoFrugal", color: "#e55a1b", textColor: "#e55a1b", hasLogo: true },
    { name: "Vasyerp", color: "#0ea5e9", textColor: "#0ea5e9", hasLogo: true },
    { name: "WebSys", color: "#16a34a", textColor: "#16a34a", hasLogo: true },
    {
        name: "Centramation",
        color: "#6b7280",
        textColor: "#6b7280",
        hasLogo: true,
    },
    {
        name: "Ciferon",
        color: "#16a34a",
        bg: "#16a34a",
        hasLogo: true,
        light: true,
    },
    {
        name: "Sparrow Softtech",
        color: "#ec4899",
        textColor: "#ec4899",
        hasLogo: true,
    },
    { name: "Posify", color: "#f59e0b", textColor: "#f59e0b", hasLogo: true },
    { name: "TMBill", color: "#a89442", textColor: "#a89442", hasLogo: true },
    { name: "Binix", color: "#0ea5e9", textColor: "#0ea5e9", hasLogo: true },
    {
        name: "Sanguine POS",
        color: "#374151",
        textColor: "#374151",
        hasLogo: true,
    },
    {
        name: "HRC FOX",
        color: "#ec4899",
        bg: "#1a1a1a",
        hasLogo: true,
        light: true,
    },
    { name: "ALLPOS", color: "#f97316", textColor: "#f97316", hasLogo: true },
    { name: "Digitory", color: "#c9b96e", textColor: "#c9b96e", hasLogo: true },
    {
        name: "QuickBill",
        color: "#0ea5e9",
        textColor: "#0ea5e9",
        hasLogo: true,
    },
    { name: "DotPe", color: "#1a1a1a", textColor: "#1a1a1a", hasLogo: true },
    { name: "ZipBooks", color: "#16a34a", textColor: "#16a34a", hasLogo: true },
    {
        name: "Lucid POS",
        color: "#0ea5e9",
        textColor: "#0ea5e9",
        hasLogo: true,
    },
    { name: "QPOS", color: "#f97316", textColor: "#f97316", hasLogo: true },
    { name: "RoyalPOS", color: "#16a34a", textColor: "#16a34a", hasLogo: true },
    { name: "HappyOn", color: "#f59e0b", textColor: "#f59e0b", hasLogo: true },
    { name: "CSAT", color: "#1a1a1a", bg: "#f0f4ff", hasLogo: true },
    { name: "Treez", color: "#1a1a1a", textColor: "#374151", hasLogo: true },
    { name: "Pabbly", color: "#16a34a", textColor: "#16a34a", hasLogo: true },
    { name: "Romio", color: "#a89442", textColor: "#a89442", hasLogo: true },
    { name: "dataman", color: "#f97316", textColor: "#f97316", hasLogo: true },
    { name: "ABITZU", color: "#1a1a1a", textColor: "#1a1a1a", hasLogo: true },
    {
        name: "Param Infotech",
        color: "#0ea5e9",
        textColor: "#0ea5e9",
        hasLogo: true,
    },
    {
        name: "Inrkey PMS",
        color: "#e91e8c",
        textColor: "#e91e8c",
        hasLogo: true,
    },
    { name: "zOrder", color: "#0ea5e9", textColor: "#0ea5e9", hasLogo: true },
    {
        name: "IVANA",
        color: "#1e4040",
        bg: "#1e4040",
        hasLogo: true,
        light: true,
    },
    {
        name: "Sparktech",
        color: "#0ea5e9",
        textColor: "#0ea5e9",
        hasLogo: true,
    },
    {
        name: "Prism POS",
        color: "#6b7280",
        textColor: "#6b7280",
        hasLogo: true,
    },
    { name: "ChefDesk", color: "#e91e8c", textColor: "#e91e8c", hasLogo: true },
    {
        name: "Choko La",
        color: "#f97316",
        bg: "#f97316",
        hasLogo: true,
        light: true,
    },
    { name: "Stuffer", color: "#0ea5e9", textColor: "#0ea5e9", hasLogo: true },
    {
        name: "7th Heaven",
        color: "#f97316",
        textColor: "#f97316",
        hasLogo: true,
    },
    {
        name: "Billing Fast",
        color: "#1a1a1a",
        bg: "#1a1a1a",
        hasLogo: true,
        light: true,
    },
    {
        name: "Ordez",
        color: "#1a1a1a",
        bg: "#1e3a5f",
        hasLogo: true,
        light: true,
    },
    {
        name: "FoodJunki",
        color: "#f97316",
        textColor: "#f97316",
        hasLogo: true,
    },
    { name: "Cypheron", color: "#1a1a1a", textColor: "#1a1a1a", hasLogo: true },
    {
        name: "CaptainPad",
        color: "#0ea5e9",
        textColor: "#0ea5e9",
        hasLogo: true,
    },
    {
        name: "Health World",
        color: "#0ea5e9",
        textColor: "#0ea5e9",
        hasLogo: true,
    },
    { name: "MARG ERP", color: "#0ea5e9", textColor: "#0ea5e9", hasLogo: true },
    {
        name: "Chokar Dhani",
        color: "#f59e0b",
        textColor: "#f59e0b",
        hasLogo: true,
    },
    { name: "TOSSKEY", color: "#e91e8c", textColor: "#e91e8c", hasLogo: true },
    {
        name: "LithosPOS",
        color: "#c9b96e",
        textColor: "#c9b96e",
        hasLogo: true,
    },
    { name: "CW Suite", color: "#16a34a", textColor: "#16a34a", hasLogo: true },
];

const ECOMMERCE_PARTNERS = [
    { name: "Shopify", isEcommerce: true },
    { name: "WooCommerce", isEcommerce: true },
    { name: "Magento", isEcommerce: true },
    { name: "Wix", isEcommerce: true },
    { name: "Squarespace", isEcommerce: true },
    { name: "BigCommerce", isEcommerce: true },
];

// ─── E-Commerce Logo Renderer ───────────────────────────────────────────────
function ECommerceLogo({ name }) {
    if (name === "Shopify") {
        return (
            <svg viewBox="0 0 200 60" className="h-8 w-auto" fill="none">
                <path
                    d="M37.2 3.3C35.8 1.4 33.5 0.2 30.9 0.2c-5.7 0-9.8 5.1-9.8 10.7 0 1.3 0.2 2.7 0.7 3.9c-3.1 1-5.4 3.8-5.7 7.1l-10 34.4c-.2.8.3 1.6 1.2 1.8.2 0 .3.1.5.1h53.7c.8 0 1.5-.6 1.6-1.4.1-.1.1-.2.1-.3L42.5 22.1c-.4-3.5-3-6.2-6.4-7 .7-1.3 1.1-2.9 1.1-4.5 0-2.8-1.2-5.4-3.2-7.3"
                    fill="#95BF47"
                />
                <path
                    d="M37.2 3.3C35.8 1.4 33.5 0.2 30.9 0.2c-5.7 0-9.8 5.1-9.8 10.7 0 1.3 0.2 2.7 0.7 3.9L30.9 3.5l6.3-.2z"
                    fill="#5E8E3E"
                />
                <text
                    x="64"
                    y="42"
                    fontFamily="'Inter', sans-serif"
                    fontWeight="800"
                    fontSize="28"
                    fill="#1A1A1A"
                >
                    shopify
                </text>
            </svg>
        );
    }
    if (name === "WooCommerce") {
        return (
            <svg viewBox="0 0 200 60" className="h-8 w-auto" fill="none">
                <path
                    d="M28.4 14.6c-1.3-1.6-3.3-2.6-5.5-2.6-4 0-7.2 3.2-7.2 7.2 0 4 3.2 7.2 7.2 7.2 2.2 0 4.2-1 5.5-2.6l6.8 4.1c-2.4 3.9-6.8 6.5-11.8 6.5-7.7 0-14-6.3-14-14 0-7.7 6.3-14 14-14 5 0 9.4 2.6 11.8 6.5l-6.8 4.1z"
                    fill="#7F54B3"
                />
                <path
                    d="M37.8 25.6h-5.2v-12c0-1.8-1.5-3.3-3.3-3.3h-12c-1.8 0-3.3 1.5-3.3 3.3v12H8.8V6.8c0-1.8 1.5-3.3 3.3-3.3h22.4c1.8 0 3.3 1.5 3.3 3.3v18.8z"
                    fill="#7F54B3"
                />
                <text
                    x="52"
                    y="42"
                    fontFamily="'Inter', sans-serif"
                    fontWeight="900"
                    fontSize="22"
                    fill="#3c3c3c"
                >
                    WOO
                </text>
                <text
                    x="106"
                    y="42"
                    fontFamily="'Inter', sans-serif"
                    fontWeight="400"
                    fontSize="22"
                    fill="#7F54B3"
                >
                    COMMERCE
                </text>
            </svg>
        );
    }
    if (name === "Magento") {
        return (
            <svg viewBox="0 0 200 60" className="h-8 w-auto" fill="none">
                <path d="M24 4l20 10v24l-20 10L4 38V14L24 4z" fill="#EE672F" />
                <path d="M24 4v44L4 38V14l20-10z" fill="#F27F22" />
                <path
                    d="M12 36V20l12-6 12 6v16h-6V24l-6-3-6 3v12h-6z"
                    fill="white"
                />
                <text
                    x="56"
                    y="42"
                    fontFamily="'Inter', sans-serif"
                    fontWeight="900"
                    fontSize="26"
                    fill="#EE672F"
                >
                    Magento
                </text>
            </svg>
        );
    }
    if (name === "Wix") {
        return (
            <svg viewBox="0 0 200 60" className="h-8 w-auto" fill="none">
                <text
                    x="20"
                    y="45"
                    fontFamily="'Inter', sans-serif"
                    fontWeight="900"
                    fontSize="48"
                    fill="#1A1A1A"
                    letterSpacing="-3"
                >
                    Wix
                </text>
                <path
                    d="M96 22l6-12 6 12"
                    stroke="#1A1A1A"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }
    if (name === "Squarespace") {
        return (
            <svg viewBox="0 0 200 60" className="h-8 w-auto" fill="none">
                <path
                    d="M12 28c0-8 8-16 16-16 4 0 8 3 8 8s-4 8-8 8-8-4-8-8M20 28c0 4 4 8 8 8 8 0 16-8 16-16"
                    stroke="#000"
                    strokeWidth="5"
                    strokeLinecap="round"
                />
                <text
                    x="56"
                    y="42"
                    fontFamily="'Inter', sans-serif"
                    fontWeight="800"
                    fontSize="20"
                    fill="#000"
                    letterSpacing="0.5"
                >
                    SQUARESPACE
                </text>
            </svg>
        );
    }
    if (name === "BigCommerce") {
        return (
            <svg viewBox="0 0 200 60" className="h-8 w-auto" fill="none">
                <path d="M10 12h28L28 36H10V12z" fill="#1976D2" />
                <path d="M22 12h22L34 36H12V12z" fill="#0D47A1" opacity="0.8" />
                <text
                    x="54"
                    y="42"
                    fontFamily="'Inter', sans-serif"
                    fontWeight="900"
                    fontSize="24"
                    fill="#0D47A1"
                >
                    BIG
                </text>
                <text
                    x="100"
                    y="42"
                    fontFamily="'Inter', sans-serif"
                    fontWeight="500"
                    fontSize="24"
                    fill="#333"
                >
                    Commerce
                </text>
            </svg>
        );
    }
    return <span className="text-base font-bold text-slate-800">{name}</span>;
}

// ─── Logo Card ────────────────────────────────────────────────────────────
function PartnerCard({ partner, onClick }) {
    return (
        <button
            onClick={() => onClick(partner)}
            className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-center hover:border-[#c9b96e] hover:shadow-md transition-all duration-200 group min-h-[100px] cursor-pointer"
        >
            <div
                className={`w-full flex items-center justify-center rounded-xl px-3 py-2 min-h-[56px] ${partner.bg ? "" : "bg-white"}`}
                style={partner.bg ? { background: partner.bg } : {}}
            >
                {partner.isEcommerce ? (
                    <ECommerceLogo name={partner.name} />
                ) : (
                    <span
                        className={`text-base font-black leading-tight text-center ${partner.light ? "text-white" : ""}`}
                        style={
                            !partner.light
                                ? { color: partner.textColor || partner.color }
                                : {}
                        }
                    >
                        {partner.name}
                    </span>
                )}
            </div>
        </button>
    );
}

// ─── POS Integrations Tab ─────────────────────────────────────────────────────
function POSTab() {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);

    const filtered = POS_PARTNERS.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
    );

    const handleConnect = (partner) => {
        toast.success(`Connecting to ${partner.name}...`);
        setSelected(partner);
    };

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-xl font-black text-slate-900 mb-1">
                    Integrate POS
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                    Integrate your POS and automatically add every customer that
                    visits your business to successfully run your loyalty
                    program, send campaigns and unique insights about your
                    customers.
                </p>
            </div>

            {/* Search */}
            <div className="relative w-64">
                <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white transition-all"
                    placeholder="Search POS"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filtered.map((p) => (
                    <PartnerCard
                        key={p.name}
                        partner={p}
                        onClick={handleConnect}
                    />
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-4 py-10 text-center text-sm text-slate-400">
                        No POS found for "{search}"
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Import modal (shared for Customers + Transactions) ───────────────────────
function ImportSection({ type = "customers" }) {
    const fileRef = useRef(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [importFilter, setImportFilter] = useState("all");
    const [dateRange, setDateRange] = useState("Last 30 Days");

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file first");
            return;
        }
        setUploading(true);
        await new Promise((r) => setTimeout(r, 1200));
        setUploading(false);
        setFile(null);
        toast.success(
            `${type === "customers" ? "Customers" : "Transactions"} imported successfully!`,
        );
    };

    return (
        <div className="space-y-5">
            {/* ATTENTION banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-xs font-black text-amber-600 uppercase tracking-wide mb-2">
                    ATTENTION
                </p>
                <div className="space-y-2">
                    {type === "customers" ? (
                        <>
                            <div className="flex items-start gap-2">
                                <span className="w-5 h-5 bg-amber-400 text-white rounded flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                                    ➡
                                </span>
                                <p className="text-xs text-amber-800 leading-relaxed">
                                    WhatsApp campaign from Cuben Retailer header
                                    will not be sent to imported customers.
                                    You'll be able to send a campaign to
                                    imported customers from your own brand's
                                    header.
                                </p>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="w-5 h-5 bg-amber-400 text-white rounded flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                                    ➡
                                </span>
                                <p className="text-xs text-amber-800 leading-relaxed">
                                    Once you initiate the customer import, it's
                                    permanent and cannot be altered or reversed.
                                    Please double-check everything before
                                    proceeding.
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-start gap-2">
                            <span className="w-5 h-5 bg-amber-400 text-white rounded flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                                ➡
                            </span>
                            <p className="text-xs text-amber-800 leading-relaxed">
                                Once you initiate the transaction import, it's
                                permanent and cannot be reversed. Please
                                double-check everything before proceeding.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Section heading */}
            <h3 className="text-base font-black text-slate-900">
                Import old {type === "customers" ? "customers" : "transactions"}{" "}
                in Cuben Retailer
            </h3>

            {/* 3-col import options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Auto Import */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-md"
                        style={{ backgroundColor: "#1a4a45" }}
                    >
                        <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                        </svg>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base font-black text-slate-900">
                            Auto Import
                        </h4>
                        <span
                            className="text-[10px] font-black text-white px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: "#1a4a45" }}
                        >
                            NEW
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                        Import data directly with one click in just a few
                        minutes.
                    </p>
                    <button
                        onClick={() =>
                            toast.success("Opening direct imports...")
                        }
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 border border-slate-300 bg-white px-3.5 py-2 rounded-xl hover:border-[#c9b96e] hover:text-amber-800 transition-colors cursor-pointer"
                    >
                        Direct Imports{" "}
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* OR divider */}
                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="text-sm font-bold text-slate-400">OR</div>
                </div>

                {/* Upload CSV */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-blue-200">
                        <div className="text-center">
                            <p className="text-[8px] font-black text-blue-600 leading-none">
                                CSV.
                            </p>
                            <svg
                                className="w-4 h-4 text-blue-600 mx-auto"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                            </svg>
                        </div>
                    </div>
                    <h4 className="text-base font-black text-slate-900 mb-1">
                        Upload CSV
                    </h4>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                        Import data by uploading a CSV file.
                    </p>
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".csv,.xlsx"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    {file ? (
                        <div className="space-y-2">
                            <p className="text-xs text-amber-800 font-semibold truncate">
                                📄 {file.name}
                            </p>
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                                style={{
                                    background:
                                        "linear-gradient(90deg, #e6dbae 0%, #c9b96e 100%)",
                                    color: "#5a3e00",
                                }}
                            >
                                {uploading && (
                                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                )}
                                {uploading ? "Uploading…" : "Upload File"}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => fileRef.current?.click()}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 border border-slate-300 bg-white px-3.5 py-2 rounded-xl hover:border-[#c9b96e] hover:text-amber-800 transition-colors cursor-pointer"
                        >
                            Upload File{" "}
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Transaction Import Guide (Rendered only for transactions) */}
            {type === "transactions" && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-6">
                    {/* Guide steps */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b pb-2">
                            CSV Formatting Guidelines
                        </h4>
                        <div className="space-y-3">
                            {[
                                {
                                    step: "1",
                                    title: "Prepare headers",
                                    desc: 'Ensure the first row of your CSV contains exactly these columns: "Phone", "Name", "Amount", "Date", "InvoiceNumber".',
                                },
                                {
                                    step: "2",
                                    title: "Format Dates correctly",
                                    desc: "Dates must be formatted as YYYY-MM-DD (e.g. 2026-06-22) to ensure precise analytics.",
                                },
                                {
                                    step: "3",
                                    title: "Clean data values",
                                    desc: "Ensure Amount consists of positive numbers only, with no currency symbols (₹, $) or commas.",
                                },
                            ].map((g) => (
                                <div
                                    key={g.step}
                                    className="flex gap-3 items-start"
                                >
                                    <span
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-[#5a3e00] flex-shrink-0 mt-0.5"
                                        style={{ backgroundColor: "#e6dbae" }}
                                    >
                                        {g.step}
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">
                                            {g.title}
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            {g.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-2">
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    toast.success("Sample CSV downloaded!");
                                }}
                                className="text-xs font-bold hover:underline flex items-center gap-1"
                                style={{ color: "#1a4a45" }}
                            >
                                📥 Download Sample Transaction CSV
                            </a>
                        </div>
                    </div>

                    {/* Educational Video */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">
                                Watch Formatting Tutorial
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed mb-4">
                                Learn how to format your transaction history
                                files correctly in under 2 minutes to prevent
                                import errors.
                            </p>
                        </div>
                        <div
                            className="relative rounded-xl overflow-hidden border border-slate-100"
                            style={{ paddingBottom: "50%" }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1a4a45] to-[#c9b96e] flex flex-col items-center justify-center gap-2">
                                <button
                                    onClick={() =>
                                        toast.success(
                                            "Playing formatting guide tutorial...",
                                        )
                                    }
                                    className="w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center text-white transition-all shadow-lg hover:scale-105 cursor-pointer animate-pulse"
                                >
                                    <PlayIcon className="w-6 h-6 ml-0.5 text-white" />
                                </button>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/35 px-2 py-0.5 rounded-full">
                                    Format Guide · 1:45
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Why Import */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <p className="text-xs font-black text-slate-500 uppercase tracking-wide mb-3">
                    WHY IMPORT
                </p>
                <div className="space-y-2.5">
                    {(type === "customers"
                        ? [
                              {
                                  icon: "📋",
                                  text: "Target old customer via campaigns",
                              },
                              {
                                  icon: "💝",
                                  text: "Give them bonus points and promote loyalty",
                              },
                          ]
                        : [
                              {
                                  icon: "📊",
                                  text: "Get full revenue & order history in Reelo.",
                              },
                              {
                                  icon: "📣",
                                  text: "Target old customers via campaigns.",
                              },
                              {
                                  icon: "💝",
                                  text: "Give them bonus points and promote loyalty.",
                              },
                          ]
                    ).map((w) => (
                        <div key={w.text} className="flex items-start gap-2.5">
                            <span className="text-base flex-shrink-0">
                                {w.icon}
                            </span>
                            <p className="text-sm text-slate-600">{w.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Import History */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-black text-slate-900">
                        Import History
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                value={importFilter}
                                onChange={(e) =>
                                    setImportFilter(e.target.value)
                                }
                                className="appearance-none text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 pr-7 text-slate-700 bg-white focus:outline-none"
                            >
                                <option value="all">All Imports</option>
                                <option value="success">Successful</option>
                                <option value="failed">Failed</option>
                            </select>
                            <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="appearance-none text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 pr-7 text-slate-700 bg-white focus:outline-none"
                            >
                                <option>
                                    Last 30 Days 11,May 26 - 09,Jun 26
                                </option>
                                <option>Last 90 Days</option>
                                <option>Last 12 Months</option>
                            </select>
                            <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center gap-2 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">
                        📂
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                        No imports yet
                    </p>
                    <p className="text-xs text-slate-400">
                        Your import history will appear here
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─── Add Manually Tab ─────────────────────────────────────────────────────────
function ManualTab() {
    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-xl font-black text-slate-900 mb-1">
                    Add Manually
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                    If you can't find your POS to integrate, use Cashier Portal
                    to add customers manually to successfully run your loyalty
                    program, send campaigns and get unique insights about your
                    customers.{" "}
                    <button className="text-amber-700 font-semibold hover:underline">
                        Learn more
                    </button>
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {/* Left: info points */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
                    {[
                        {
                            text: (
                                <>
                                    Use it to{" "}
                                    <span className="font-bold">
                                        add every customer
                                    </span>
                                    , their loyalty pts and redeem rewards.
                                    (After you activate loyalty program)
                                </>
                            ),
                        },
                        {
                            text: (
                                <>
                                    If you have a cashier managing your billing,{" "}
                                    <span className="font-bold text-amber-800 cursor-pointer underline">
                                        create cashier account
                                    </span>{" "}
                                    to give separate access to them.
                                </>
                            ),
                        },
                        {
                            text: (
                                <>
                                    After you add customer, see their analytics
                                    in customer insights.
                                </>
                            ),
                        },
                        {
                            text: (
                                <>
                                    Click on{" "}
                                    <span className="font-bold">
                                        Open Cashier Portal
                                    </span>{" "}
                                    to get started.
                                </>
                            ),
                        },
                    ].map((item, i) => (
                        <p
                            key={i}
                            className="text-sm text-slate-700 leading-relaxed pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                        >
                            {item.text}
                        </p>
                    ))}
                </div>

                {/* Right: YouTube video + buttons */}
                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-bold text-slate-900 mb-3">
                            What is cashier account and how to add customer
                            manually <span className="text-amber-700">↗</span>
                        </p>
                        {/* YouTube video embed placeholder */}
                        <div
                            className="rounded-2xl overflow-hidden border border-slate-200 relative"
                            style={{ paddingBottom: "56.25%" }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-green-900 flex flex-col items-center justify-center gap-3">
                                {/* Channel info */}
                                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 mb-1">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-black text-xs">
                                            r
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">
                                            Cashier portal
                                        </p>
                                        <p className="text-[10px] text-slate-500">
                                            Cuben Retailer
                                        </p>
                                    </div>
                                </div>
                                <p className="text-white font-black text-xl text-center leading-tight px-4">
                                    Getting started
                                    <br />
                                    with Cashier Portal
                                </p>
                                <a
                                    href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors shadow-xl"
                                >
                                    <PlayIcon className="w-7 h-7 text-white ml-1" />
                                </a>
                                <p className="text-white/60 text-xs">
                                    Watch on YouTube
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() =>
                                toast.success("Creating cashier account...")
                            }
                            className="px-5 py-2.5 text-sm font-bold text-slate-700 border-2 border-slate-300 rounded-xl hover:border-[#c9b96e] hover:text-amber-800 transition-colors bg-white cursor-pointer"
                        >
                            Create Cashier Account
                        </button>
                        <button
                            onClick={() =>
                                toast.success("Opening Cashier Portal...")
                            }
                            className="px-5 py-2.5 text-sm font-bold text-slate-700 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
                            style={{
                                background:
                                    "linear-gradient(90deg, #e6dbae 0%, #c9b96e 100%)",
                                color: "#5a3e00",
                            }}
                        >
                            Open Cashier portal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── E-Commerce Integration Tab ───────────────────────────────────────────────
function ECommerceTab() {
    const [search, setSearch] = useState("");
    const filtered = ECOMMERCE_PARTNERS.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
    );
    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-xl font-black text-slate-900 mb-1">
                    Integrate E-Commerce Platforms
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                    Integrate your E- Commerce platform and automatically add
                    every customer that visits your business to successfully run
                    your loyalty program, send campaigns and unique insights
                    about your customers.
                </p>
            </div>
            <div className="relative w-64">
                <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white transition-all"
                    placeholder="Search platform"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filtered.map((p) => (
                    <PartnerCard
                        key={p.name}
                        partner={p}
                        onClick={() =>
                            toast.success(`Connecting to ${p.name}...`)
                        }
                    />
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-4 py-10 text-center text-sm text-slate-400">
                        No platform found for "{search}"
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AddCustomersPage() {
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(
        searchParams.get("tab") || "pos",
    );

    return (
        <div className="space-y-5 pb-10 animate-slide-up">
            {/* Page heading */}
            <div>
                <h1 className="text-2xl font-black text-slate-900">
                    Add Customers
                </h1>
            </div>

            {/* Tab pills ── */}
            <div className="flex items-center gap-2 flex-wrap">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200 cursor-pointer"
                        style={
                            activeTab === tab.id
                                ? {
                                      background:
                                          "linear-gradient(90deg, #e6dbae 0%, #c9b96e 100%)",
                                      color: "#5a3e00",
                                      borderColor: "#c9b96e",
                                  }
                                : {
                                      background: "white",
                                      color: "#374151",
                                      borderColor: "#e2e8f0",
                                  }
                        }
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Thin dashed separator */}
            <div className="border-t border-dashed border-slate-200" />

            {/* Tab content */}
            {activeTab === "pos" && <POSTab />}
            {activeTab === "import" && <ImportSection type="customers" />}
            {activeTab === "manual" && <ManualTab />}
            {activeTab === "ecommerce" && <ECommerceTab />}
            {activeTab === "transactions" && (
                <ImportSection type="transactions" />
            )}
        </div>
    );
}
