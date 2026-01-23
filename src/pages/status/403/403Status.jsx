import Picture from "./working.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ForbiddenPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md border border-gray-200 shadow-sm">
        <CardContent className="p-6 text-center space-y-4">
          <img
            src={Picture}
            alt="Access restricted"
            className="mx-auto max-h-108 w-auto object-contain"
          />

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">403 – Forbidden</h1>
            <p className="text-muted-foreground">
              This page is under development or restricted.
            </p>
          </div>

          <Button
            className="w-full"
            onClick={() => (window.location.href = "/dashboard")}
          >
            Go back home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
