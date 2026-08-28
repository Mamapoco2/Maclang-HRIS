import { useState } from "react";
import { UserCheck, ShieldCheck } from "lucide-react";
import AccountApprovalPage from "./accountApprovalPage";
import RoleManagementPage from "./roleManagementPage";

export default function AccountsPage() {
  const [active, setActive] = useState("approval");

  return (
    <div className="bg-gray-50">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-screen mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              {active === "approval" ? (
                <UserCheck className="w-5 h-5 text-white" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-white" />
              )}
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
        </div>
      </div>

      {/* ── Content ── */}
    </div>
  );
}
