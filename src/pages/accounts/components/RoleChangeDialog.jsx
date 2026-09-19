import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatUserName, getCurrentRoleName } from "@/utils/userManagement";

export default function RoleChangeDialog({ change, onConfirm, onCancel }) {
  const user = change?.user;
  const displayName = user ? (formatUserName(user) ?? user.username) : "";

  return (
    <AlertDialog
      open={!!change}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change role?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-gray-900">{displayName}</span>{" "}
            will change from{" "}
            <span className="font-medium text-gray-900">
              {(user && getCurrentRoleName(user)) ?? "No role"}
            </span>{" "}
            to{" "}
            <span className="font-medium text-gray-900">
              {change?.roleName}
            </span>
            . The new role replaces the current one and its access applies
            immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Change role</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
