// app-sidebar.jsx
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
  IconAward,
  IconWallet,
  IconSettings2,
  IconCompass,
  IconBug,
  IconRocket,
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
    title: "Recruitment, Selection, Placement",
    icon: IconBriefcase,
    permission: "hiring.view",
    items: [
      {
        title: "Hiring",
        permission: "hiring.view",
        items: [
          {
            title: "Plantilla (PSB)",
            permission: "hiring.view",
            items: [
              {
                title: "Plantilla Postings",
                url: "/hiring/plantilla/positions",
                permission: "hiring.view",
              },
              {
                title: "Applications",
                url: "/hiring/plantilla/applications",
                permission: "hiring.view",
              },
              {
                title: "Calendar",
                url: "/hiring/plantilla/calendar",
                permission: "hiring.view",
              },
              {
                title: "Onboarding",
                url: "/hiring/plantilla/onboarding",
                permission: "hiring.view",
              },
              {
                title: "My Applications",
                url: "/hiring/plantilla/my-applications",
                permission: "hiring.view",
              },
            ],
          },
          {
            title: "Non-Plantilla",
            permission: "hiring.view",
            items: [
              {
                title: "Applicants",
                url: "/hiring/non-plantilla/applicants",
                permission: "hiring.view",
              },
              {
                title: "Applications",
                url: "/hiring/non-plantilla/applications",
                permission: "hiring.view",
              },
              {
                title: "Onboarding",
                url: "/hiring/non-plantilla/onboarding",
                permission: "hiring.view",
              },
            ],
          },
        ],
      },
      {
        title: "Leave",
        permission: "leave.view",
        items: [
          {
            title: "Dashboard",
            url: "/leaveDashboard",
            permission: "leave.view",
          },
          {
            title: "Approval",
            url: "/leaveApproval",
            permission: "leave.view",
          },
          { title: "Balance", url: "/leaveBalance", permission: "leave.view" },
          {
            title: "Calendar",
            url: "/leaveCalendar",
            permission: "leave.view",
          },
          {
            title: "Leave Request",
            url: "/leaveRequest",
            permission: "leave.view",
          },
          {
            title: "New Leave Request",
            url: "/newLeaveRequest",
            permission: "leave.view",
          },
        ],
      },
      {
        title: "Employee Management",
        url: "/employees",
        icon: IconUsers,
        permission: "employees.view",
      },
      {
        title: "Renewal Management",
        url: "/renewals",
        icon: IconUsers,
        permission: "employees.view",
      },
      {
        title: "Team",
        url: "/team",
        permission: "team.view",
      },
      {
        title: "Orientation Compliance Monitoring",
        url: "/orientationMonitoring",
        permission: "orientation.view",
      },
    ],
  },
  {
    title: "Learning & Development",
    icon: IconSchool,
    permission: "trainings.view",
    items: [
      {
        title: "Training",
        permission: "trainings.view",
        items: [
          {
            title: "Trainings",
            url: "/trainings",
            permission: "trainings.view",
          },
          {
            title: "Skill Gap Analysis",
            url: "/skillGapAnalysis",
            permission: "trainings.skill_gap",
          },
          {
            title: "Training Effectiveness Analysis",
            url: "/trainingEffectiveness",
            permission: "trainings.effectiveness",
          },
          {
            title: "Coaching & Mentoring",
            permission: "trainings.coaching",
          },
        ],
      },
    ],
  },
  {
    title: "SPMS",
    icon: IconTarget,
    permission: "spms.view",
    items: [
      {
        title: "Plantilla",
        permission: "spms.view",
        items: [
          { title: "MFO", permission: "spms.view" },
          { title: "KPI", permission: "spms.view" },
          { title: "QET", permission: "spms.view" },
        ],
      },
      { title: "IPCR", url: "/IPCR", permission: "spms.view" },
      { title: "DPCR", url: "/DPCR", permission: "spms.view" },
      { title: "OPCR", url: "/OPCR", permission: "spms.view" },
      {
        title: "Non-Plantilla",
        permission: "spms.view",
        items: [
          {
            title: "Appraisal Form",
            url: "/appraisalForm",
            permission: "spms.view",
          },
        ],
      },
      {
        title: "SPMS Management",
        permission: "spms.view",
        items: [
          {
            title: "Performance Period",
            url: "/PerformancePeriod",
            permission: "spms.view",
          },
        ],
      },
    ],
  },
  {
    title: "Compensation & Benefits",
    icon: IconWallet,
    permission: "compensation.view",
    items: [
      {
        title: "Compensation",
        permission: "compensation.view",
        items: [
          {
            title: "Regular",
            permission: "compensation.view",
            items: [
              {
                title: "Salary",
                permission: "compensation.view",
                items: [
                  {
                    title: "Attendance & Report Generation",
                    permission: "compensation.view",
                  },
                  { title: "Certification", permission: "compensation.view" },
                  { title: "Transmittal", permission: "compensation.view" },
                ],
              },
              { title: "Hazard", permission: "compensation.view" },
            ],
          },
        ],
      },
      {
        title: "Special",
        permission: "compensation.view",
        items: [
          {
            title: "Salary",
            permission: "compensation.view",
            items: [
              {
                title: "Attendance & Report Generation",
                permission: "compensation.view",
              },
              { title: "Certification", permission: "compensation.view" },
              { title: "Transmittal", permission: "compensation.view" },
            ],
          },
          {
            title: "Hazard",
            permission: "compensation.view",
            items: [
              {
                title: "Attendance & Report Generation",
                permission: "compensation.view",
              },
              { title: "Certification", permission: "compensation.view" },
              { title: "Transmittal", permission: "compensation.view" },
            ],
          },
          { title: "Night Diff", permission: "compensation.view" },
          {
            title: "Salary Diff",
            permission: "compensation.view",
            items: [
              {
                title: "Same as Spec & Rec Sal",
                permission: "compensation.view",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "System Management",
    icon: IconSettings2,
    permission: "accounts.manage",
    items: [
      {
        title: "Accounts Management",
        url: "/accounts",
        permission: "accounts.view",
      },
      {
        title: "Departments",
        url: "/departments",
        permission: "departments.view",
      },
      {
        title: "Positions",
        permission: "positions.view",
        items: [
          {
            title: "Plantilla",
            url: "/plantillaItems",
            permission: "plantilla_items.view",
          },
          {
            title: "Non-Plantilla",
            permission: "positions.view",
            items: [
              { title: "COS", url: "/COSList", permission: "positions.view" },
              {
                title: "CONS",
                url: "/ConsultantList",
                permission: "positions.view",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Rewards & Recognition",
    icon: IconAward,
    permission: "rewards.view",
    items: [
      {
        title: "Top Performer",
        permission: "rewards.view",
        items: [
          {
            title: "Hospital",
            url: "/TopHospital",
            permission: "rewards.view",
          },
          {
            title: "Department",
            url: "/TopDepartment",
            permission: "rewards.view",
          },
        ],
      },
    ],
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: IconChartBar,
    permission: "analytics.view",
  },

  {
    title: "Manpower Mapping",
    url: "/manpower",
    icon: IconUsersGroup,
    permission: "manpower.view",
  },
  {
    title: "Task Monitoring",
    url: "/task-monitoring",
    icon: IconUsersGroup,
    permission: "task_monitoring.view",
  },
  {
    title: "Bug Reports",
    url: "/bug-reports",
    icon: IconBug,
    permission: "bug-reports.view",
  },
  {
    title: "Release Manager",
    url: "/release-manager",
    icon: IconRocket,
    permission: "accounts.manage",
  },
  {
    title: "Audit Logs",
    url: "/audit-logs",
    icon: IconFileText,
    permission: "team.view",
  },
];

const NAV_SECONDARY = [];
const NAV_DOCUMENTS = [{ name: "Reports", url: "#", icon: IconReport }];

function canSee(item, userPermissions, isSuperUser) {
  if (isSuperUser) return true;
  if (!item.permission) return true;
  return userPermissions.includes(item.permission);
}

function filterNav(navItems, userPermissions, isSuperUser) {
  return navItems.reduce((acc, item) => {
    if (!canSee(item, userPermissions, isSuperUser)) {
      return acc;
    }

    if (!item.items) {
      acc.push(item);
      return acc;
    }

    const visibleChildren = filterNav(item.items, userPermissions, isSuperUser);

    if (visibleChildren.length > 0) {
      acc.push({ ...item, items: visibleChildren });
    }

    return acc;
  }, []);
}

export function AppSidebar({ ...props }) {
  const { user } = useContext(AuthContext);

  const userPermissions = Array.isArray(user?.permissions)
    ? user.permissions.map(String)
    : [];

  const userRoles = (user?.roles ?? []).map((r) => String(r).toLowerCase());

  const isSuperUser = userRoles.some((r) =>
    ["superadmin", "super-admin"].includes(r),
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
