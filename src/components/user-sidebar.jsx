// components/user-sidebar.jsx
import * as React from "react";
import { useContext } from "react";
import {
  IconDashboard,
  IconSpeakerphone,
  IconCalendarEvent,
  IconSchool,
  IconInnerShadowTop,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
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

const NAV_USER = [
  {
    title: "Announcement",
    url: "/Announcement",
    icon: IconSpeakerphone,
    permission: "announcements.view",
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
    permission: "dashboard.view",
  },
  {
    title: "Leave",
    icon: IconCalendarEvent,
    permission: "leave.view",
    items: [
      { title: "My Requests", url: "/leaveRequest", permission: "leave.view" },
      {
        title: "New Request",
        url: "/newLeaveRequest",
        permission: "leave.view",
      },
      { title: "Calendar", url: "/leaveCalendar", permission: "leave.view" },
      { title: "Balance", url: "/leaveBalance", permission: "leave.view" },
    ],
  },
  {
    title: "Trainings",
    url: "/trainings",
    icon: IconSchool,
    permission: "trainings.view",
  },
];

function canSee(item, userPermissions, isSuperUser) {
  if (isSuperUser) return true;
  if (!item.permission) return true;
  return userPermissions.includes(item.permission);
}

function filterNav(navItems, userPermissions, isSuperUser) {
  return navItems.reduce((acc, item) => {
    if (!canSee(item, userPermissions, isSuperUser)) return acc;

    if (!item.items) {
      acc.push(item);
      return acc;
    }

    const visibleChildren = filterNav(item.items, userPermissions, isSuperUser);
    if (visibleChildren.length > 0)
      acc.push({ ...item, items: visibleChildren });

    return acc;
  }, []);
}

export function UserSidebar({ ...props }) {
  const { user } = useContext(AuthContext);

  const userPermissions = Array.isArray(user?.permissions)
    ? user.permissions.map(String)
    : [];
  const userRoles = (user?.roles ?? []).map((r) => String(r).toLowerCase());
  const isSuperUser = userRoles.some((r) =>
    ["superadmin", "super-admin"].includes(r),
  );

  const filteredNav = filterNav(NAV_USER, userPermissions, isSuperUser);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <IconInnerShadowTop className="size-5!" />
              <span className="text-base font-semibold">RMBGH Portal</span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={filteredNav} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
