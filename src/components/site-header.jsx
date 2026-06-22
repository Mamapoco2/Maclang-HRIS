import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { IconSun, IconMoon, IconBug } from "@tabler/icons-react";
import { useTheme } from "@/components/theme-provider";
import { NotificationBell } from "@/components/Notification-bell";
import ReportIssueModal from "@/components/ReportIssueModal";

export function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <>
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />

          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />

          <h1 className="text-base font-medium"></h1>

          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setReportOpen(true)}
            >
              <IconBug size={20} stroke={1.5} />
              <span className="sr-only">Report bug</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative"
            >
              <IconSun
                size={20}
                stroke={1.5}
                className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
              />
              <IconMoon
                size={20}
                stroke={1.5}
                className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
              />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <NotificationBell />
          </div>
        </div>
      </header>

      <ReportIssueModal open={reportOpen} onOpenChange={setReportOpen} />
    </>
  );
}
