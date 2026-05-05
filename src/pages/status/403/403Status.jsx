import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
// For Next.js, replace with: import { useRouter } from "next/navigation";

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <p className="text-[120px] font-medium leading-none tracking-tight text-foreground">
          403
        </p>

        <h1 className="mt-4 text-2xl font-medium text-foreground">
          Access forbidden
        </h1>

        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          You don't have permission to access this page. If you think this is a
          mistake, contact your administrator.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Button variant="default" onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
