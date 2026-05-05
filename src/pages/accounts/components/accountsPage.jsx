import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import UsersTable from "./UsersTable";
import ApprovedAccountsTab from "./approvedAccountsTab";

export default function AccountsPage() {
  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Accounts</h1>
        <p className="text-gray-600 mt-2">Manage all your accounts below.</p>
      </header>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="approved">Approved Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardContent className="pt-4">
              <UsersTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <ApprovedAccountsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
