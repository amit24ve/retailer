import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import NoSidebarLayout from "./components/layout/NoSidebarLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import QRScanPage from "./pages/QRScanPage";
import { Toaster } from "react-hot-toast";

// ── Super Admin pages ──────────────────────────────────────────────────────────
import SABrandOwners from "./pages/super-admin/BrandOwners";
import SABrandOwnerDetail from "./pages/super-admin/BrandOwnerDetail";
import SACreditsPage from "./pages/super-admin/CreditsPage";
import SACreditRequests from "./pages/super-admin/CreditRequests";
import SAPlatformStock from "./pages/super-admin/PlatformStock";

// ── Brand Owner pages ──────────────────────────────────────────────────────────
import BOSmartInsightsPage from "./pages/brand-owner/SmartInsightsPage";
import BOCampaignsPage from "./pages/brand-owner/CampaignsPage";
import BOCustomersPage from "./pages/brand-owner/CustomersPage";
import BOCustomerProfilePage from "./pages/brand-owner/CustomerProfilePage";
import BOAddCustomersPage from "./pages/brand-owner/AddCustomersPage";
import BOLoyaltyPage from "./pages/brand-owner/LoyaltyPage";
import BOAutoCampaignsPage from "./pages/brand-owner/AutoCampaignsPage";
import BOFeedbackPage from "./pages/brand-owner/FeedbackPage";
import BOQRCodePage from "./pages/brand-owner/QRCodePage";
import BOReferralsPage from "./pages/brand-owner/ReferralsPage";
import BOMembershipPage from "./pages/brand-owner/MembershipPage";
import BOOrdersPage from "./pages/brand-owner/OrdersPage";
import BOCouponsPage from "./pages/brand-owner/CouponsPage";
import BOStoresPage from "./pages/brand-owner/StoresPage";
import BOWhatsappChatPage from "./pages/brand-owner/WhatsappChatPage";
import BOCreditRequestPage from "./pages/brand-owner/CreditRequestPage";

// ── Store Manager pages ────────────────────────────────────────────────────────
import SMSmartInsightsPage from "./pages/store-manager/SmartInsightsPage";
import SMCampaignsPage from "./pages/store-manager/CampaignsPage";
import SMCustomersPage from "./pages/store-manager/CustomersPage";
import SMCustomerProfilePage from "./pages/store-manager/CustomerProfilePage";
import SMAddCustomersPage from "./pages/store-manager/AddCustomersPage";
import SMLoyaltyPage from "./pages/store-manager/LoyaltyPage";
import SMFeedbackPage from "./pages/store-manager/FeedbackPage";
import SMQRCodePage from "./pages/store-manager/QRCodePage";
import SMReferralsPage from "./pages/store-manager/ReferralsPage";
import SMMembershipPage from "./pages/store-manager/MembershipPage";
import SMOrdersPage from "./pages/store-manager/OrdersPage";
import SMCouponsPage from "./pages/store-manager/CouponsPage";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STORE_MANAGER_ROLES = new Set([
    "Store Manager",
    "store_manager",
    "Cashier",
    "cashier",
]);

/**
 * Renders a different page component based on the user's role.
 * storeMgrPage  → shown to Store Manager / Cashier
 * brandOwnerPage → shown to everyone else (Brand Owner, Marketing Manager, etc.)
 */
function RolePage({ storeMgrPage: SM, brandOwnerPage: BO }) {
    const { user } = useAuth();
    const isStoreMgr = STORE_MANAGER_ROLES.has(user?.role || "");
    const Page = isStoreMgr ? SM : BO;
    return <Page />;
}

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading)
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div
                        className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                        style={{
                            borderColor: "#6366f1",
                            borderTopColor: "transparent",
                        }}
                    />
                    <p className="text-slate-500 text-sm font-semibold">
                        Loading...
                    </p>
                </div>
            </div>
        );
    return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: "#ffffff",
                        color: "#0f172a",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        fontSize: "13px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    },
                    success: {
                        iconTheme: { primary: "#10b981", secondary: "#ffffff" },
                    },
                    error: {
                        iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
                    },
                }}
            />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/scan/:qrId" element={<QRScanPage />} />

                {/* ── Pages WITH sidebar ── */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route
                        index
                        element={<Navigate to="/dashboard" replace />}
                    />

                    {/* Dashboard — role-aware internally */}
                    <Route path="dashboard" element={<DashboardPage />} />

                    {/* Smart Insights */}
                    <Route
                        path="smart-insights"
                        element={
                            <RolePage
                                storeMgrPage={SMSmartInsightsPage}
                                brandOwnerPage={BOSmartInsightsPage}
                            />
                        }
                    />

                    {/* Campaigns */}
                    <Route
                        path="campaigns"
                        element={
                            <RolePage
                                storeMgrPage={SMCampaignsPage}
                                brandOwnerPage={BOCampaignsPage}
                            />
                        }
                    />

                    {/* Customers */}
                    <Route
                        path="customers"
                        element={
                            <RolePage
                                storeMgrPage={SMCustomersPage}
                                brandOwnerPage={BOCustomersPage}
                            />
                        }
                    />
                    <Route
                        path="customers/add"
                        element={
                            <RolePage
                                storeMgrPage={SMAddCustomersPage}
                                brandOwnerPage={BOAddCustomersPage}
                            />
                        }
                    />
                    <Route
                        path="customers/:id"
                        element={
                            <RolePage
                                storeMgrPage={SMCustomerProfilePage}
                                brandOwnerPage={BOCustomerProfilePage}
                            />
                        }
                    />

                    {/* Loyalty */}
                    <Route
                        path="loyalty"
                        element={
                            <RolePage
                                storeMgrPage={SMLoyaltyPage}
                                brandOwnerPage={BOLoyaltyPage}
                            />
                        }
                    />

                    {/* Auto Campaigns — Brand Owner only */}
                    <Route
                        path="auto-campaigns"
                        element={<BOAutoCampaignsPage />}
                    />

                    {/* Feedback */}
                    <Route
                        path="feedback"
                        element={
                            <RolePage
                                storeMgrPage={SMFeedbackPage}
                                brandOwnerPage={BOFeedbackPage}
                            />
                        }
                    />

                    {/* QR Code */}
                    <Route
                        path="qr-code"
                        element={
                            <RolePage
                                storeMgrPage={SMQRCodePage}
                                brandOwnerPage={BOQRCodePage}
                            />
                        }
                    />

                    {/* Referrals */}
                    <Route
                        path="referrals"
                        element={
                            <RolePage
                                storeMgrPage={SMReferralsPage}
                                brandOwnerPage={BOReferralsPage}
                            />
                        }
                    />

                    {/* Membership */}
                    <Route
                        path="membership"
                        element={
                            <RolePage
                                storeMgrPage={SMMembershipPage}
                                brandOwnerPage={BOMembershipPage}
                            />
                        }
                    />

                    {/* Orders */}
                    <Route
                        path="orders"
                        element={
                            <RolePage
                                storeMgrPage={SMOrdersPage}
                                brandOwnerPage={BOOrdersPage}
                            />
                        }
                    />

                    {/* Coupons */}
                    <Route
                        path="coupons"
                        element={
                            <RolePage
                                storeMgrPage={SMCouponsPage}
                                brandOwnerPage={BOCouponsPage}
                            />
                        }
                    />

                    {/* Stores — Brand Owner only */}
                    <Route path="stores" element={<BOStoresPage />} />

                    {/* WhatsApp Chat — Brand Owner only */}
                    <Route
                        path="whatsapp-chat"
                        element={<BOWhatsappChatPage />}
                    />

                    {/* Credit Request — Brand Owner only */}
                    <Route
                        path="credit-request"
                        element={<BOCreditRequestPage />}
                    />

                    {/* Super Admin routes */}
                    <Route
                        path="admin/brand-owners"
                        element={<SABrandOwners />}
                    />
                    <Route
                        path="admin/brand-owner/:userId"
                        element={<SABrandOwnerDetail />}
                    />
                    <Route path="admin/credits" element={<SACreditsPage />} />
                    <Route
                        path="admin/credit-requests"
                        element={<SACreditRequests />}
                    />
                    <Route
                        path="admin/platform-stock"
                        element={<SAPlatformStock />}
                    />
                </Route>

                {/* ── Pages WITHOUT sidebar ── */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <NoSidebarLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="settings" element={<SettingsPage />} />
                </Route>

                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />
            </Routes>
        </>
    );
}
