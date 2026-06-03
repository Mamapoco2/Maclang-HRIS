import { useContext } from "react";
import { AuthContext } from "@/context/authContext";
import { clearAuth } from "@/lib/tokenStorage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MonitorX } from "lucide-react";

export default function SessionDisplacedModal() {
  const { sessionDisplaced, dismissDisplaced } = useContext(AuthContext);

  const handleAcknowledge = () => {
    clearAuth();
    dismissDisplaced();
    window.location.href = "/login";
  };

  return (
    <Dialog open={sessionDisplaced} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-sm text-center"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <MonitorX className="h-7 w-7 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-lg font-semibold">
            Signed in elsewhere
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Your account was signed in from another device or browser. You have
            been logged out of this session for security.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2">
          <Button className="w-full" onClick={handleAcknowledge}>
            Back to login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
