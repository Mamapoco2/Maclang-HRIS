import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AccountApprovalPage from "./AccountApprovalPage";
import RoleManagementPage from "./RoleManagementPage";

export default function AccountsPage() {
  return (
    <div>
      <Tabs defaultValue="approval">
        <div className="px-6 pt-6 border-b border-gray-200 bg-white">
          <TabsList className="p-0 gap-1 h-auto rounded-none">
            <TabsTrigger
              value="approval"
              className="text-sm px-3 py-2 rounded-none  "
            >
              Account Approval
            </TabsTrigger>
            <TabsTrigger
              value="roles"
              className="text-sm px-3 py-2 rounded-none "
            >
              Role Management
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="approval" className="mt-0">
          <AccountApprovalPage />
        </TabsContent>

        <TabsContent value="roles" className="mt-0">
          <RoleManagementPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
