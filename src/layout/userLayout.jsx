// src/layout/userLayout.jsx
import { Outlet } from "react-router-dom";
import { UserSidebar } from "@/components/user-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { IdleWarningDialog } from "@/components/IdleWarningDialog";

export default function UserLayout() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 84)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <UserSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
      </SidebarInset>
      <IdleWarningDialog />
    </SidebarProvider>
  );
}
