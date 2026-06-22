import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { LogOut, Shield, History, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AuthContext } from "@/context/authContext";
import LogoutConfirmDialog from "@/components/logoutConfirmModal";
import { formatTimestamp } from "@/utils/signatureValidation";

export function AccountActionsCard({ auditLog = [] }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    setShowLogout(false);
    navigate("/login");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Account Actions
          </CardTitle>
          <CardDescription>
            Security settings and session management for your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Your signatures are private
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-200/80 mt-0.5">
                Only you can view and manage your e-signatures. Upload and
                update activities are logged for auditing purposes.
              </p>
            </div>
          </div>

          <div>
            <Button
              variant="destructive"
              className="gap-2 w-full sm:w-auto"
              onClick={() => setShowLogout(true)}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium">Signature Activity Log</p>
            </div>
            {auditLog.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No signature activity recorded yet.
              </p>
            ) : (
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {auditLog.map((entry, i) => (
                  <li
                    key={`${entry.timestamp}-${i}`}
                    className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-muted/40 text-xs"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {entry.type} — {entry.action}
                      </p>
                      <p className="text-muted-foreground mt-0.5">
                        {entry.fileName}
                      </p>
                    </div>
                    <span className="text-muted-foreground shrink-0">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <LogoutConfirmDialog
        open={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogout}
        loading={loggingOut}
        title="Are you sure you want to log out?"
        description="You will need to sign in again to access the system."
        confirmLabel="Logout"
      />
    </>
  );
}
