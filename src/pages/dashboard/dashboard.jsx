import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChartBarMultiple } from "@/components/chart-bar-multiple";

import Teams from "../../components/teams";
import LeaveOverview from "./components/leaveOverview";

import data from "./components/data.json";

export default function Page() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />

            {/* Charts section */}
            <div className="w-full flex flex-col gap-4 px-4 lg:px-6 md:flex-row">
              {/* Left chart */}
              <div className="w-full md:w-2/3">
                <ChartAreaInteractive />
              </div>

              {/* Right chart */}
              <div className="w-full md:w-1/3">
                <ChartBarMultiple />
              </div>
            </div>

            {/* Teams and Leave section */}
            <div className="w-full flex flex-col gap-2 px-4 lg:px-6 md:flex-row">
              <div className="w-full md:w-1/2">
                <Teams />
              </div>

              <div className="w-full md:w-1/2">
                <LeaveOverview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
