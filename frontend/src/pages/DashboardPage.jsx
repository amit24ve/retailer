import React from "react";
import { useAuth } from "../contexts/AuthContext";
import SuperAdminDashboard from "./super-admin/Dashboard";
import BrandOwnerDashboard from "./brand-owner/Dashboard";
import StoreManagerDashboard from "./store-manager/Dashboard";

export default function DashboardPage() {
    const { user } = useAuth();
    const role = user?.role || "";

    if (role === "Super Admin" || role === "super_admin") {
        return <SuperAdminDashboard />;
    }
    if (
        role === "Store Manager" ||
        role === "store_manager" ||
        role === "Cashier" ||
        role === "cashier"
    ) {
        return <StoreManagerDashboard />;
    }
    // Brand Owner, Marketing Manager, and default
    return <BrandOwnerDashboard />;
}
