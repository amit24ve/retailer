import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
    HomeIcon,
    UsersIcon,
    MegaphoneIcon,
    StarIcon,
    BoltIcon,
    ChatBubbleLeftRightIcon,
    QrCodeIcon,
    ShareIcon,
    IdentificationIcon,
    UserPlusIcon,
    LightBulbIcon,
    BuildingStorefrontIcon,
    Cog6ToothIcon,
    ShieldCheckIcon,
    ShoppingBagIcon,
    DocumentChartBarIcon,
    CurrencyRupeeIcon,
    GlobeAltIcon,
    BuildingOffice2Icon,
    CreditCardIcon,
    InboxIcon,
    ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

// ─── Nav items per role ───────────────────────────────────────────────────────
const SUPER_ADMIN_NAV = [
    { label: "Dashboard", icon: HomeIcon, to: "/dashboard" },
    {
        label: "Brand Owners",
        icon: BuildingOffice2Icon,
        to: "/admin/brand-owners",
    },
    { label: "Credits", icon: CreditCardIcon, to: "/admin/credits" },
    { label: "Credit Requests", icon: InboxIcon, to: "/admin/credit-requests" },
    {
        label: "Platform Stock",
        icon: ArchiveBoxIcon,
        to: "/admin/platform-stock",
    },
];

const BRAND_OWNER_NAV = [
    { label: "Dashboard", icon: HomeIcon, to: "/dashboard" },
    { label: "Smart Insights", icon: LightBulbIcon, to: "/smart-insights" },
    { label: "Campaigns", icon: MegaphoneIcon, to: "/campaigns" },
    { label: "Customer Insights", icon: UsersIcon, to: "/customers" },
    { label: "Loyalty", icon: StarIcon, to: "/loyalty" },
    { label: "Auto Campaigns", icon: BoltIcon, to: "/auto-campaigns" },
    { label: "Feedback", icon: ChatBubbleLeftRightIcon, to: "/feedback" },
    { label: "QR Code", icon: QrCodeIcon, to: "/qr-code" },
    { label: "Referrals", icon: ShareIcon, to: "/referrals" },
    {
        label: "Membership",
        icon: IdentificationIcon,
        to: "/membership",
        badge: "NEW",
    },
    {
        label: "Whatsapp Chat",
        icon: ChatBubbleLeftRightIcon,
        to: "/whatsapp-chat",
    },
    { label: "Orders", icon: ShoppingBagIcon, to: "/orders" },
    { label: "Coupons", icon: CurrencyRupeeIcon, to: "/coupons" },
    { label: "Stores", icon: BuildingStorefrontIcon, to: "/stores" },
    { label: "Request Credits", icon: CreditCardIcon, to: "/credit-request" },
];

const STORE_MANAGER_NAV = [
    { label: "Dashboard", icon: HomeIcon, to: "/dashboard" },
    { label: "Customers", icon: UsersIcon, to: "/customers" },
    { label: "Orders", icon: ShoppingBagIcon, to: "/orders" },
    { label: "Loyalty", icon: StarIcon, to: "/loyalty" },
    { label: "QR Code", icon: QrCodeIcon, to: "/qr-code" },
    { label: "Feedback", icon: ChatBubbleLeftRightIcon, to: "/feedback" },
    { label: "Campaigns", icon: MegaphoneIcon, to: "/campaigns" },
    { label: "Referrals", icon: ShareIcon, to: "/referrals" },
    { label: "Membership", icon: IdentificationIcon, to: "/membership" },
    { label: "Coupons", icon: CurrencyRupeeIcon, to: "/coupons" },
];

const SHOW_ADD_CUSTOMER_ROLES = [
    "Brand Owner",
    "Store Manager",
    "Cashier",
    "Marketing Manager",
];
const SHOW_TRIAL_ROLES = ["Brand Owner", "Marketing Manager"];
const SHOW_PLATFORM_BADGE_ROLES = ["Super Admin"];

// ─── Sidebar theme per role ───────────────────────────────────────────────────
const THEMES = {
    "Super Admin": {
        bg: "#0f172a",
        border: "#1e293b",
        gold: "#8b5cf6",
        goldLight: "#e0e7ff",
        textMain: "#f8fafc",
        textMuted: "#94a3b8",
        activeGrad: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
        activeShadow: "0 4px 12px rgba(139, 92, 246, 0.30)",
        activeColor: "#ffffff",
        logoText: "SA",
        logoGrad: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
        logoColor: "white",
        subtitle: "Admin Console",
    },
    "Store Manager": {
        bg: "#0f172a",
        border: "#1e293b",
        gold: "#10b981",
        goldLight: "#d1fae5",
        textMain: "#f8fafc",
        textMuted: "#94a3b8",
        activeGrad: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        activeShadow: "0 4px 12px rgba(16, 185, 129, 0.30)",
        activeColor: "#ffffff",
        logoText: "SM",
        logoGrad: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
        logoColor: "white",
        subtitle: "Store Console",
    },
    default: {
        bg: "#0f172a",
        border: "#1e293b",
        gold: "#c9b96e",
        goldLight: "#fef9ec",
        textMain: "#f8fafc",
        textMuted: "#94a3b8",
        activeGrad: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
        activeShadow: "0 4px 12px rgba(13, 148, 136, 0.35)",
        activeColor: "#ffffff",
        logoText: "CR",
        logoGrad: "linear-gradient(135deg, #c9b96e 0%, #a89442 100%)",
        logoColor: "#ffffff",
        subtitle: "Brand Owner",
    },
};

function getNavItems(role) {
    if (role === "Super Admin" || role === "super_admin")
        return SUPER_ADMIN_NAV;
    if (
        role === "Store Manager" ||
        role === "store_manager" ||
        role === "Cashier"
    )
        return STORE_MANAGER_NAV;
    return BRAND_OWNER_NAV;
}

function getTheme(role) {
    if (role === "Super Admin" || role === "super_admin")
        return THEMES["Super Admin"];
    if (
        role === "Store Manager" ||
        role === "store_manager" ||
        role === "Cashier"
    )
        return THEMES["Store Manager"];
    return THEMES.default;
}

export default function Sidebar({ open }) {
    const { user } = useAuth();
    const role = user?.role || "";
    const navItems = getNavItems(role);
    const theme = getTheme(role);

    const showAddCustomer = SHOW_ADD_CUSTOMER_ROLES.includes(role);
    const showTrial = SHOW_TRIAL_ROLES.includes(role);
    const showPlatformBadge = SHOW_PLATFORM_BADGE_ROLES.includes(role);

    return (
        <aside
            className={`${open ? "w-56" : "w-16"} flex flex-col transition-all duration-300 ease-in-out relative z-20`}
            style={{
                minHeight: "100vh",
                background: theme.bg,
                borderRight: `1px solid ${theme.border}`,
            }}
        >
            {/* ── Logo ── */}
            <div
                className={`flex items-center gap-2.5 px-4 py-4 ${!open ? "justify-center" : ""}`}
                style={{ borderBottom: `1px solid ${theme.border}` }}
            >
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                    style={{ background: theme.logoGrad }}
                >
                    <span
                        className="font-black text-sm"
                        style={{ color: theme.logoColor }}
                    >
                        {theme.logoText}
                    </span>
                </div>
                {open && (
                    <div className="leading-tight ml-0.5">
                        <p
                            className="font-black text-sm tracking-tight"
                            style={{ color: theme.textMain }}
                        >
                            Cuben Retailer
                        </p>
                        <p
                            className="text-xs font-semibold tracking-widest uppercase"
                            style={{ color: theme.gold }}
                        >
                            {theme.subtitle}
                        </p>
                    </div>
                )}
            </div>

            {/* ── Role Badge ── */}
            {/* {open && (
                <div className="mx-3 mt-3 mb-1">
                    <div
                        className="px-3 py-2 rounded-xl text-center"
                        style={{
                            background: `${theme.border}80`,
                            border: `1px solid ${theme.border}`,
                        }}
                    >
                        <p
                            className="text-xs font-bold"
                            style={{ color: theme.gold }}
                        >
                            {role || "User"}
                        </p>
                        {user?.full_name && (
                            <p
                                className="text-[10px] font-medium truncate mt-0.5"
                                style={{ color: theme.textMuted }}
                            >
                                {user.full_name}
                            </p>
                        )}
                    </div>
                </div>
            )} */}

            {/* ── Navigation ── */}
            <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-hidden">
                {navItems.map(({ label, icon: Icon, to, badge }) => (
                    <NavLink
                        key={to}
                        to={to}
                        title={!open ? label : undefined}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
                                !open ? "justify-center" : ""
                            } ${isActive ? "font-semibold" : "font-medium"}`
                        }
                        style={({ isActive }) =>
                            isActive
                                ? {
                                      background: theme.activeGrad,
                                      color: theme.activeColor,
                                      boxShadow: theme.activeShadow,
                                  }
                                : { color: theme.textMuted }
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon
                                    className="w-[18px] h-[18px] flex-shrink-0"
                                    style={{
                                        color: isActive
                                            ? theme.activeColor
                                            : theme.textMuted,
                                    }}
                                />
                                {open && (
                                    <span className="flex-1 leading-tight">
                                        {label}
                                    </span>
                                )}
                                {open && badge && (
                                    <span
                                        className="text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none"
                                        style={{
                                            background: "#0891b2",
                                            color: "white",
                                        }}
                                    >
                                        {badge}
                                    </span>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}

                {/* Add Customers — only for applicable roles */}
                {showAddCustomer && (
                    <NavLink
                        to="/customers/add"
                        title={!open ? "Add Customers" : undefined}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                                !open ? "justify-center" : ""
                            }`
                        }
                        style={({ isActive }) =>
                            isActive
                                ? {
                                      background: theme.activeGrad,
                                      color: theme.activeColor,
                                      boxShadow: theme.activeShadow,
                                  }
                                : { color: theme.textMuted }
                        }
                    >
                        <UserPlusIcon
                            className="w-[18px] h-[18px] flex-shrink-0"
                            style={{ color: theme.textMuted }}
                        />
                        {open && (
                            <span className="flex-1 leading-tight">
                                Add Customers
                            </span>
                        )}
                    </NavLink>
                )}
            </nav>

        </aside>
    );
}
