import AccountsTable from "./accountsTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AccountsPage() {
  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Accounts</h1>
        <p className="text-gray-600 mt-2">Manage all your accounts below.</p>
      </header>

      <Card>
        <CardContent>
          <AccountsTable />
        </CardContent>
      </Card>
    </div>
  );
}
