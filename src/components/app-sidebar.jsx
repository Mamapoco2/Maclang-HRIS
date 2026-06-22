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
    title: "Recruitment, Selection, Placement",
    icon: IconBriefcase,
    permission: "hiring.view",
    items: [
      {
        title: "Hiring",
        items: [
          {
            title: "Plantilla (PSB)",
            items: [
              {
                title: "Applicants",
                url: "/hiring/plantilla/applicants",
              },
              {
                title: "Applications",
                url: "/hiring/plantilla/applications",
              },
              {
                title: "Onboarding",
                url: "/hiring/plantilla/onboarding",
              },
            ],
          },

          {
            title: "Non-Plantilla",
            items: [
              {
                title: "Applicants",
                url: "/hiring/non-plantilla/applicants",
              },
              {
                title: "Applications",
                url: "/hiring/non-plantilla/applications",
              },
              {
                title: "Onboarding",
                url: "/hiring/non-plantilla/onboarding",
              },
            ],
          },
        ],
      },
      {
        title: "Leave",
        permission: "leave.view",
        items: [
          { title: "Dashboard", url: "/leaveDashboard" },
          { title: "Approval", url: "/leaveApproval" },
          { title: "Balance", url: "/leaveBalance" },
          { title: "Calendar", url: "/leaveCalendar" },
          { title: "Leave Request", url: "/leaveRequest" },
          { title: "New Leave Request", url: "/newLeaveRequest" },
        ],
      },
      {
        title: "Employees",
        url: "/employees",
        icon: IconUsers,
        permission: "employees.view",
      },
      {
        title: "Team",
        url: "/team",
      },
      {
        title: "Orientation Compliance Monitoring",
        url: "/orientationMonitoring",
      },
    ],
  },
  {
    title: "Learning & Development ",
    icon: IconSchool,
    permission: "hiring.view",
    items: [
      {
        title: "Training",
        items: [
          {
            title: "Trainings",
            url: "/trainings",
          },
          {
            title: "Skill Gap Analysis",
            url: "/skillGapAnalysis",
          },
          {
            title: "Training Effectiveness Analysis",
            url: "/trainingEffectiveness",
          },
          {
            title: "Coaching & Mentoring",
          },
        ],
      },
    ],
  },
  {
    title: "SPMS",
    icon: IconTarget,
    permission: "hiring.view",
    items: [
      {
        title: "Plantilla",
        items: [
          {
            title: "MFO",
          },
          {
            title: "KPI",
          },
          {
            title: "QET",
          },
        ],
      },
      {
        title: "IPCR",
        url: "/IPCR",
      },
      {
        title: "DPCR",
        url: "/DPCR",
      },
      {
        title: "OPCR",
        url: "/OPCR",
      },
      {
        title: "Non-Plantilla",
        items: [
          {
            title: "Appraisal Form",
            url: "/appraisalForm",
          },
        ],
      },
      {
        title: "SPMS Management",
        items: [
          {
            title: "Performance Period",
            url: "/PerformancePeriod",
          },
        ],
      },
    ],
  },
  {
    title: "Compensation & Benefits",
    icon: IconWallet,
    permission: "hiring.view",
    items: [
      {
        title: "Compensation",
        items: [
          {
            title: "Regular",
            items: [
              {
                title: "Salary",
                items: [
                  {
                    title: "Attendance & Report Generation",
                  },
                  {
                    title: "Certification",
                  },
                  {
                    title: "Transmittal",
                  },
                ],
              },
              {
                title: "Hazard",
              },
            ],
          },
        ],
      },
      {
        title: "Special",
        items: [
          {
            title: "Salary",
            items: [
              {
                title: "Attendance & Report Generation",
              },
              {
                title: "Certification",
              },
              {
                title: "Transmittal",
              },
            ],
          },
          {
            title: "Hazard",
            items: [
              {
                title: "Attendance & Report Generation",
              },
              {
                title: "Certification",
              },
              {
                title: "Transmittal",
              },
            ],
          },
          {
            title: "Night Diff",
          },
          {
            title: "Salary Diff",
            items: [
              {
                title: "Same as Spec & Rec Sal",
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
    permission: "hiring.view",
    items: [
      {
        title: "Role Management",
      },
      {
        title: "Accounts Management",
        url: "/accounts",
      },
      {
        title: "Departments",
        url: "/departments",
      },
      {
        title: "Positions",
        items: [
          {
            title: "Plantilla",
            url: "/plantillaItems",
          },
          {
            title: "Non-Plantilla",
            items: [
              {
                title: "COS",
                url: "/COSList",
              },
              {
                title: "CONS",
                url: "/ConsultantList",
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
    permission: "hiring.view",
    items: [
      {
        title: "Top Performer",
        items: [
          {
            title: "Hospital",
            url: "/TopHospital",
          },
          {
            title: "Department",
            url: "/TopDepartment",
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
    title: "Team",
    url: "/team",
    icon: IconUsersGroup,
    permission: "team.view",
  },

  // {
  //   title: "Orientation",
  //   url: "/Orientation",
  //   icon: IconCompass,
  // },

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
    title: "Task Monitoring",
    url: "/task-monitoring",
    icon: IconUsersGroup,
    permission: "manpower.view",
  },
  {
    title: "Bug Reports",
    url: "/bug-reports",
    icon: IconBug,
    permission: "team.view",
  },
];

const NAV_SECONDARY = [
  // { title: "Settings", url: "/settings", icon: IconSettings },
];

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
