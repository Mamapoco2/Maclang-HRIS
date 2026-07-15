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
import { fetchReleases } from "@/services/releaseService";

const WHATS_NEW_KEY = "whats_new_last_seen_id";

export default function MainLayout() {
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [latestId, setLatestId] = useState(null);

  useEffect(() => {
    async function checkForUpdates() {
      try {
        const res = await fetchReleases({ page: 1, perPage: 1 });
        const latest = res.data?.[0];
        if (!latest) return;

        const seenId = localStorage.getItem(WHATS_NEW_KEY);
        setLatestId(latest.id);

        if (String(seenId) !== String(latest.id)) {
          setShowWhatsNew(true);
        }
      } catch (err) {
        console.error("Failed to check for new releases:", err);
      }
    }
    checkForUpdates();
  }, []);

  const handleClose = () => {
    if (latestId != null) {
      localStorage.setItem(WHATS_NEW_KEY, String(latestId));
    }
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
