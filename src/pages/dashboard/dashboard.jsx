import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChartBarMultiple } from "@/components/chart-bar-multiple";

import Teams from "../../components/teams";
import LeaveOverview from "./components/leaveOverview";
export default function Page() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <div className="flex flex-1 flex-col bg-gray-50">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />

            {/* Charts row */}
            <div className="w-full flex flex-col gap-4 px-4 lg:px-6 md:flex-row md:items-stretch">
              <div className="w-full md:w-2/3 flex flex-col">
                <ChartAreaInteractive className="h-full" />
              </div>
              <div className="w-full md:w-1/3 flex flex-col">
                <ChartBarMultiple className="h-full" />
              </div>
            </div>

            {/* Teams / Leave row */}
            <div className="flex flex-col gap-4 px-4 lg:px-6 md:flex-row md:items-stretch">
              <div className="w-full md:w-1/2 flex flex-col">
                <Teams />
              </div>
              <div className="w-full md:w-1/2 flex flex-col">
                <LeaveOverview />
              </div>
            </div>
            <div>
              <DataTable />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
