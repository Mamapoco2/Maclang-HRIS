import * as React from "react";
import { useContext } from "react";
import {
  IconChartBar,
  IconDashboard,
  IconReport,
  IconSettings,
  IconUsers,
  IconBriefcase,
  IconPlane,
  IconUsersGroup,
  IconSchool,
  IconSpeakerphone,
  IconUserCheck,
  IconTarget,
  IconBuildingStore,
  IconFileText,
  IconInnerShadowTop,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { AuthContext } from "@/context/authContext";

const NAV_MAIN = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
    permission: "dashboard.view",
  },
  {
    title: "Employees",
    url: "/employees",
    icon: IconUsers,
    permission: "employees.view",
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: IconChartBar,
    permission: "analytics.view",
  },
  {
    title: "Trainings",
    url: "/trainings",
    icon: IconSchool,
    permission: "trainings.view",
  },
  {
    title: "Team",
    url: "/team",
    icon: IconUsersGroup,
    permission: "team.view",
  },
  {
    title: "Leave",
    url: "/leave",
    icon: IconPlane,
    permission: "leave.view",
  },
  {
    title: "Accounts",
    url: "/accounts",
    icon: IconUserCheck,
    permission: "accounts.view",
  },
  {
    title: "Departments",
    url: "/departments",
    icon: IconBuildingStore,
    permission: "departments.view",
  },
  {
    title: "Plantilla Items",
    url: "/plantillaItems",
    icon: IconFileText,
    permission: "plantilla_items.view",
  },
  {
    title: "Hiring",
    icon: IconBriefcase,
    permission: "hiring.view",
    items: [
      { title: "Applications", url: "/applications" },
      { title: "Applicants", url: "/applicants" },
      { title: "Onboarding", url: "/onboarding" },
    ],
  },
  {
    title: "Announcement",
    icon: IconSpeakerphone,
    permission: "announcements.view",
    items: [
      { title: "Inbox", url: "/inbox" },
      { title: "Forwarded", url: "/forward" },
      { title: "Sent", url: "/sent" },
    ],
  },
  {
    title: "Manpower Mapping",
    url: "/manpower",
    icon: IconUsersGroup,
    permission: "manpower.view",
  },
  {
    title: "SPMS",
    icon: IconTarget,
    permission: "spms.view",
    items: [
      { title: "IPCR", url: "/IPCR" },
      { title: "OPCR", url: "/OPCR" },
      { title: "MFO", url: "/MFO" },
      { title: "Performance Period", url: "/PerformancePeriod" },
    ],
  },
];

const NAV_SECONDARY = [{ title: "Settings", url: "#", icon: IconSettings }];

const NAV_DOCUMENTS = [{ name: "Reports", url: "#", icon: IconReport }];

// ── Permission filter ─────────────────────────────────────────────────────────

function canSee(item, userPermissions, isSuperUser) {
  if (isSuperUser) return true;
  if (!item.permission) return true;
  return userPermissions.includes(item.permission);
}

function filterNav(navItems, userPermissions, isSuperUser) {
  return navItems.reduce((acc, item) => {
    if (!item.items) {
      if (canSee(item, userPermissions, isSuperUser)) {
        acc.push(item);
      }
      return acc;
    }

    if (!canSee(item, userPermissions, isSuperUser)) {
      return acc;
    }

    const visibleChildren = item.items.filter((child) =>
      canSee(child, userPermissions, isSuperUser),
    );

    if (visibleChildren.length > 0) {
      acc.push({ ...item, items: visibleChildren });
    }

    return acc;
  }, []);
}

// ── Sidebar component ─────────────────────────────────────────────────────────

export function AppSidebar({ ...props }) {
  const { user } = useContext(AuthContext);

  const userPermissions = Array.isArray(user?.permissions)
    ? user.permissions.map(String)
    : [];

  const userRoles = (user?.roles ?? []).map((r) => String(r).toLowerCase());

  const isSuperUser = userRoles.some((r) =>
    [
      "superadmin",
      "super-admin",
      "admin",
      "director",
      "hr",
      "head",
      "supervisor",
    ].includes(r),
  );

  const filteredNav = filterNav(NAV_MAIN, userPermissions, isSuperUser);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <IconInnerShadowTop className="size-5!" />
                    <span className="text-base font-semibold">
                      RMBGH Portal
                    </span>
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={filteredNav} />
        <NavDocuments items={NAV_DOCUMENTS} />
        <NavSecondary items={NAV_SECONDARY} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
