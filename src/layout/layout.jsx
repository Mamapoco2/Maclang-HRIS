// src/layout/layout.jsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { IdleWarningDialog } from "@/components/IdleWarningDialog";
import OrientationModal from "@/components/Orientation-modal";
import { WhatsNewModal } from "@/components/update";
import ChatModal from "../pages/aiChatbot/aiChatBot";

const WHATS_NEW_KEY = "whats_new_seen_4.3.0";

export default function MainLayout() {
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(WHATS_NEW_KEY);
    if (!hasSeen) {
      setShowWhatsNew(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(WHATS_NEW_KEY, "true");
    setShowWhatsNew(false);
  };

  return (
    <>
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 84)",
          "--header-height": "calc(var(--spacing) * 12)",
        }}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <Outlet />
          </div>
        </SidebarInset>
        <IdleWarningDialog />
        <OrientationModal />
        <WhatsNewModal open={showWhatsNew} onClose={handleClose} />
      </SidebarProvider>

      <ChatModal />
    </>
  );
}
