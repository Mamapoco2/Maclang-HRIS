import { useState } from "react";
import { UserCheck, Users, ShieldCheck } from "lucide-react";
import AccountApprovalPage from "./accountApprovalPage";
import UserManagementPage from "./userManagementPage";
import RoleManagementPage from "./roleManagementPage";

const TABS = [
  {
    key: "approval",
    label: "Account Approval",
    description: "Review and activate pending user registrations.",
    icon: UserCheck,
    Component: AccountApprovalPage,
  },
  {
    key: "users",
    label: "User Management",
    description: "Assign a role to each employee.",
    icon: Users,
    Component: UserManagementPage,
  },
  {
    key: "roles",
    label: "Role Management",
    description: "Define what each role can access and govern.",
    icon: ShieldCheck,
    Component: RoleManagementPage,
  },
];

export default function AccountsPage() {
  const [active, setActive] = useState("approval");
  const activeTab = TABS.find((t) => t.key === active);
  const ActiveComponent = activeTab.Component;

  return (
    <div className="bg-gray-50">
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-screen flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2">
              <activeTab.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-gray-900">{activeTab.label}</h1>
              <p className="text-xs leading-tight text-gray-500">{activeTab.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                aria-current={active === tab.key ? "page" : undefined}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  active === tab.key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ActiveComponent />
    </div>
  );
}
