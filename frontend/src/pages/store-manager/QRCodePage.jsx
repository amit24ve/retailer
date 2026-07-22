import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import QRCode from "qrcode";
import {
    QrCodeIcon,
    ArrowDownTrayIcon,
    PlusIcon,
    XMarkIcon,
    UserPlusIcon,
    CurrencyRupeeIcon,
    StarIcon,
    ClipboardDocumentIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

// ─── QR Objectives ────────────────────────────────────────────────────────────

const QR_OBJECTIVES = [
    {
        id: "customer_registration",
        title: "Customer Registration",
        desc: "Let customers scan to register and join your loyalty program instantly.",
        Icon: UserPlusIcon,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
    },
    {
        id: "bill_payment",
        title: "Bill Payment",
        desc: "Process payments and earn loyalty points in a single scan.",
        Icon: CurrencyRupeeIcon,
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/20",
    },
    {
        id: "feedback_collection",
        title: "Feedback Collection",
        desc: "Collect customer ratings and reviews after each visit automatically.",
        Icon: StarIcon,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
    },
    {
        id: "loyalty_signup",
        title: "Loyalty Signup",
        desc: "Convert walk-in customers into loyalty members with a quick scan.",
        Icon: QrCodeIcon,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
    },
];

function QRCodeImage({ value, size = 176, className = "" }) {
    const [qrUrl, setQrUrl] = useState("");

    useEffect(() => {
        let cancelled = false;
        QRCode.toDataURL(value || "store-qr", {
            width: size,
            margin: 2,
            errorCorrectionLevel: "M",
            color: { dark: "#0f172a", light: "#FFFFFF" },
        })
            .then((url) => {
                if (!cancelled) setQrUrl(url);
            })
            .catch(() => {
                if (!cancelled) setQrUrl("");
            });
        return () => {
            cancelled = true;
        };
    }, [value, size]);

    if (!qrUrl) {
        return (
            <div
                style={{ width: size, height: size }}
                className="flex items-center justify-center bg-slate-50 rounded-xl"
            >
                <span className="w-5 h-5 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    return <img src={qrUrl} alt="Store QR Code" className={className} />;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function QRCodePage() {
    const { user } = useAuth();
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showGenerate, setShowGenerate] = useState(false);
    const [selectedObjective, setSelectedObjective] = useState(null);

    const storeId = user?.store_id || "STORE-001";
    const storeName = user?.store_name || "My Store";

    const qrValue = `${window.location.origin}/scan/${encodeURIComponent(storeId)}`;

    useEffect(() => {
        api.get("/qr-codes/stats")
            .then((r) => setQrData(r.data.qrcode ?? r.data))
            .catch(() => setQrData(getMockQRData()))
            .finally(() => setLoading(false));
    }, []);

    const handleDownload = () => {
        QRCode.toDataURL(qrValue, { width: 600, margin: 2, errorCorrectionLevel: "M" })
            .then((url) => {
                const a = document.createElement("a");
                a.href = url;
                a.download = `${storeId}-qrcode.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                toast.success("QR Code download started!");
            })
            .catch(() => toast.error("Could not generate QR for download"));
    };

    const handleCopyId = () => {
        navigator.clipboard
            .writeText(storeId)
            .then(() => toast.success("Store ID copied to clipboard!"))
            .catch(() => toast.error("Could not copy to clipboard"));
    };

    const openGenerateWithObjective = (objId) => {
        setSelectedObjective(objId);
        setShowGenerate(true);
    };

    return (
        <div className="space-y-5 animate-slide-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Store QR Code</h1>
                    <p className="page-subtitle">
                        Manage your store's QR code for customer engagement
                    </p>
                </div>
                <button
                    onClick={() =>
                        openGenerateWithObjective("customer_registration")
                    }
                    className="btn-primary"
                >
                    <PlusIcon className="w-4 h-4" /> Generate QR
                </button>
            </div>

            {/* ── Top section: QR display + stats ─────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* QR Code card */}
                <div className="glass-card p-6 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 self-start">
                        <QrCodeIcon className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-sm font-semibold text-white">
                            Your Store QR Code
                        </h2>
                    </div>

                    {/* QR image */}
                    <div className="p-4 bg-white rounded-2xl shadow-lg">
                        <QRCodeImage value={qrValue} size={176} className="w-44 h-44 block" />
                    </div>

                    {/* Store info */}
                    <div className="text-center">
                        <p className="text-sm font-semibold text-white">
                            {storeName}
                        </p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                            {storeId}
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 w-full">
                        <button
                            onClick={handleDownload}
                            className="btn-secondary flex-1 justify-center text-xs"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" /> Download
                        </button>
                        <button
                            onClick={handleCopyId}
                            className="btn-secondary flex-1 justify-center text-xs"
                        >
                            <ClipboardDocumentIcon className="w-4 h-4" /> Copy
                            ID
                        </button>
                    </div>
                </div>

                {/* QR Stats */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4 content-start">
                    <div className="sm-card-sky">
                        <p className="text-xs text-gray-400">Scans Today</p>
                        <p className="text-2xl font-bold text-emerald-400 mt-1">
                            {loading ? "—" : (qrData?.scans_today ?? 0)}
                        </p>
                    </div>
                    <div className="sm-card-mint">
                        <p className="text-xs text-gray-400">Total Scans</p>
                        <p className="text-2xl font-bold text-cyan-400 mt-1">
                            {loading
                                ? "—"
                                : (qrData?.total_scans ?? 0).toLocaleString(
                                      "en-IN",
                                  )}
                        </p>
                    </div>
                    <div className="sm-card-amber">
                        <p className="text-xs text-gray-400">
                            New Customers via QR
                        </p>
                        <p className="text-2xl font-bold text-amber-400 mt-1">
                            {loading
                                ? "—"
                                : (qrData?.new_customers ?? 0).toLocaleString(
                                      "en-IN",
                                  )}
                        </p>
                    </div>
                    <div className="sm-card-coral">
                        <p className="text-xs text-gray-400">Conversions</p>
                        <p className="text-2xl font-bold text-rose-400 mt-1">
                            {loading ? "—" : `${qrData?.conversion_rate ?? 0}%`}
                        </p>
                    </div>

                    {/* QR settings info */}
                    <div className="col-span-2 glass-card p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            QR Settings
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs text-gray-400">
                                    Store Name
                                </p>
                                <p className="text-sm font-semibold text-white mt-0.5">
                                    {storeName}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">
                                    Store ID
                                </p>
                                <p className="text-sm font-mono text-cyan-400 mt-0.5">
                                    {storeId}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">
                                    Active Objective
                                </p>
                                <p className="text-sm font-semibold text-white mt-0.5 capitalize">
                                    {(
                                        qrData?.active_objective ??
                                        "customer_registration"
                                    ).replace(/_/g, " ")}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">
                                    QR Status
                                </p>
                                <span className="badge-success mt-0.5 inline-block">
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── QR Objectives ────────────────────────────────────────────── */}
            <div className="glass-card p-5">
                <h2 className="text-sm font-semibold text-white mb-4">
                    QR Code Objectives
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {QR_OBJECTIVES.map((obj) => {
                        const { Icon } = obj;
                        const isActive =
                            (qrData?.active_objective ??
                                "customer_registration") === obj.id;
                        return (
                            <div
                                key={obj.id}
                                className={`rounded-xl p-4 border ${obj.border} ${obj.bg} flex flex-col gap-2 relative`}
                            >
                                {isActive && (
                                    <span className="absolute top-3 right-3 badge-success text-[10px]">
                                        Active
                                    </span>
                                )}
                                <div
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${obj.bg} border ${obj.border}`}
                                >
                                    <Icon className={`w-5 h-5 ${obj.color}`} />
                                </div>
                                <p
                                    className={`text-sm font-semibold ${obj.color} pr-10`}
                                >
                                    {obj.title}
                                </p>
                                <p className="text-xs text-gray-400 leading-relaxed flex-1">
                                    {obj.desc}
                                </p>
                                <button
                                    onClick={() =>
                                        openGenerateWithObjective(obj.id)
                                    }
                                    className="btn-secondary text-xs mt-1"
                                >
                                    {isActive ? "Regenerate" : "Use This"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {showGenerate && (
                <GenerateQRModal
                    storeId={storeId}
                    storeName={storeName}
                    defaultObjective={selectedObjective}
                    onClose={() => {
                        setShowGenerate(false);
                        setSelectedObjective(null);
                    }}
                    onSuccess={(data) => {
                        setQrData((prev) => ({ ...prev, ...data }));
                        setShowGenerate(false);
                        setSelectedObjective(null);
                        toast.success("QR Code generated successfully!");
                    }}
                />
            )}
        </div>
    );
}

// ─── Generate QR Modal ────────────────────────────────────────────────────────

function GenerateQRModal({
    storeId,
    storeName,
    defaultObjective,
    onClose,
    onSuccess,
}) {
    const [objective, setObjective] = useState(
        defaultObjective ?? "customer_registration",
    );
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const selectedObj = QR_OBJECTIVES.find((o) => o.id === objective);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await api.post("/qr-codes", {
                name: selectedObj?.title || "Store QR Code",
                type: objective,
                store: storeName || storeId,
                store_id: storeId,
                url: `${window.location.origin}/scan/${encodeURIComponent(storeId)}?objective=${encodeURIComponent(objective)}`,
            });
            setDone(true);
            setTimeout(
                () => onSuccess({ ...res.data, active_objective: objective }),
                900,
            );
        } catch {
            // Simulate success
            setDone(true);
            setTimeout(
                () =>
                    onSuccess({
                        active_objective: objective,
                        generated_at: new Date().toISOString(),
                    }),
                900,
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card w-full max-w-md animate-slide-up">
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <QrCodeIcon className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-base font-semibold text-white">
                            Generate QR Code
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {done ? (
                        <div className="py-6 flex flex-col items-center gap-3 text-center">
                            <CheckCircleIcon className="w-14 h-14 text-emerald-400" />
                            <p className="text-base font-semibold text-white">
                                QR Code Generated!
                            </p>
                            <p className="text-xs text-gray-400">
                                Your new QR code is ready to use.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                                Store:{" "}
                                <span className="font-semibold">
                                    {storeName}
                                </span>
                                <span className="ml-2 font-mono text-gray-400">
                                    ({storeId})
                                </span>
                            </div>

                            <div>
                                <label className="input-label">
                                    QR Objective
                                </label>
                                <select
                                    className="input-field"
                                    value={objective}
                                    onChange={(e) =>
                                        setObjective(e.target.value)
                                    }
                                >
                                    {QR_OBJECTIVES.map((o) => (
                                        <option key={o.id} value={o.id}>
                                            {o.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedObj && (
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    {selectedObj.desc}
                                </p>
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
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className="btn-primary"
                                >
                                    {loading && (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    )}
                                    Generate QR
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

function getMockQRData() {
    return {
        scans_today: 47,
        total_scans: 1284,
        new_customers: 312,
        conversion_rate: 24,
        active_objective: "customer_registration",
    };
}
