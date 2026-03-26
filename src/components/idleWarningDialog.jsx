// src/components/IdleWarningDialog.jsx
import { useEffect, useRef, useCallback, useState } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/authContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARN_BEFORE = 1 * 60 * 1000; //  1 minute warning
const WARN_AT = IDLE_TIMEOUT - WARN_BEFORE;

const IDLE_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "click",
];

export function IdleWarningDialog() {
  const { logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const idleTimer = useRef(null);
  const warnTimer = useRef(null);
  const countdownRef = useRef(null);

  const clearAllTimers = () => {
    clearTimeout(idleTimer.current);
    clearTimeout(warnTimer.current);
    clearInterval(countdownRef.current);
  };

  const handleLogout = useCallback(async () => {
    clearAllTimers();
    setShowWarning(false);
    await logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  const startTimers = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);

    // Show warning 1 minute before logout
    warnTimer.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(60);

      // Count down every second
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) clearInterval(countdownRef.current);
          return prev - 1;
        });
      }, 1000);
    }, WARN_AT);

    // Auto logout after full timeout
    idleTimer.current = setTimeout(() => {
      handleLogout();
    }, IDLE_TIMEOUT);
  }, [handleLogout]);

  const handleStayLoggedIn = useCallback(() => {
    setShowWarning(false);
    startTimers();
  }, [startTimers]);

  useEffect(() => {
    if (!isAuthenticated) return;

    startTimers();

    const reset = () => startTimers();
    IDLE_EVENTS.forEach((e) =>
      window.addEventListener(e, reset, { passive: true }),
    );

    return () => {
      clearAllTimers();
      IDLE_EVENTS.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [isAuthenticated, startTimers]);

  if (!isAuthenticated) return null;

  return (
    <Dialog open={showWarning}>
      <DialogContent
        className="sm:max-w-sm"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-5 w-5 text-orange-500" />
            <DialogTitle>Session Expiring Soon</DialogTitle>
          </div>
          <DialogDescription>
            You have been inactive. Your session will automatically end in:
          </DialogDescription>
        </DialogHeader>

        {/* Countdown */}
        <div className="flex flex-col items-center py-4 gap-1">
          <p className="text-5xl font-bold tabular-nums text-orange-500">
            {String(Math.max(countdown, 0)).padStart(2, "0")}
          </p>
          <p className="text-sm text-muted-foreground">seconds remaining</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleLogout}>
            Log Out Now
          </Button>
          <Button className="flex-1" onClick={handleStayLoggedIn}>
            Stay Logged In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
