import { useState } from "react";
import { UserCheck, ShieldCheck } from "lucide-react";
import AccountApprovalPage from "./AccountApprovalPage";
import RoleManagementPage from "./RoleManagementPage";

const TABS = [
  { id: "approval", label: "Account Approval", icon: UserCheck },
  { id: "roles",    label: "Role Management",  icon: ShieldCheck },
];

export default function AccountsPage() {
  const [active, setActive] = useState("approval");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-screen mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              {active === "approval"
                ? <UserCheck className="w-5 h-5 text-white" />
                : <ShieldCheck className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                {active === "approval" ? "Account Approval" : "Role Management"}
              </h1>
              <p className="text-xs text-gray-500 leading-tight">
                {active === "approval"
                  ? "Review and activate pending user registrations."
                  : "Assign roles and configure permissions for active accounts."}
              </p>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  active === id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-screen mx-auto px-4 sm:px-6 py-6">
        {active === "approval" && <AccountApprovalPage />}
        {active === "roles"    && <RoleManagementPage />}
      </div>
    </div>
  );
}
