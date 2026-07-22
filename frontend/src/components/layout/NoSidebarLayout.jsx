import React from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';

/**
 * Layout WITHOUT the outer Cuben Retailer sidebar.
 * Used for pages that have their own inner navigation:
 *  - /settings  (inner sidebar: Dashboard, Your Account, Store Details…)
 *  - /whatsapp-chat  (inner sidebar: customer list)
 *
 * Clicking "Dashboard" inside the inner sidebar navigates to /dashboard
 * which uses MainLayout and shows the full outer Cuben Retailer sidebar again.
 */
export default function NoSidebarLayout() {
  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Top bar stays — same as MainLayout */}
      <Topbar onMenuToggle={() => {}} />
      {/* Full remaining height given to the page */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
