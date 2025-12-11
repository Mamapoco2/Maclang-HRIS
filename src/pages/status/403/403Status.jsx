import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function PendingApprovalPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full shadow-lg border">
        <CardHeader>
          <CardTitle className="text-3xl text-red-600">
            403 - Access Denied
          </CardTitle>
          <CardDescription className="mt-2 text-gray-700">
            Your account is pending HR approval and cannot access this page yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-4 flex flex-col gap-4">
          <Button
            variant="default"
            onClick={() => navigate("/")}
            className="w-full"
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
