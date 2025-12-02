import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function ViewMemberModal({ member, open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center">
            <img
              src={member.avatar}
              alt={`${member.firstName} ${member.lastName}`}
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>
          <div className="grid gap-2">
            <Label>First Name</Label>
            <p className="text-sm">{member.firstName}</p>
          </div>
          <div className="grid gap-2">
            <Label>Last Name</Label>
            <p className="text-sm">{member.lastName}</p>
          </div>
          <div className="grid gap-2">
            <Label>Role</Label>
            <p className="text-sm">{member.role}</p>
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <p className="text-sm">{member.email}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
