import { useState } from "react";
import {
  User,
  Mail,
  Building2,
  Briefcase,
  Phone,
  BadgeCheck,
  Loader2,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ReadOnlyField({ icon: Icon, label, value }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </Label>
      <p className="text-sm font-medium px-3 py-2 rounded-lg bg-muted/50 border border-border">
        {value || "—"}
      </p>
    </div>
  );
}

export function ProfileInformationCard({ user, onSave }) {
  const [editing, setEditing] = useState(false);
  const [contactNumber, setContactNumber] = useState(user?.contactNumber ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!user) return null;

  const validateContact = () => {
    if (!contactNumber.trim()) {
      return "Contact number is required.";
    }
    if (!/^[0-9+\-\s()]{7,20}$/.test(contactNumber.trim())) {
      return "Enter a valid contact number.";
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validateContact();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setEditing(false);
    onSave?.({ contactNumber: contactNumber.trim() });
    toast.success("Profile updated", {
      description: "Your contact information has been saved.",
    });
  };

  const handleCancel = () => {
    setContactNumber(user.contactNumber ?? "");
    setError(null);
    setEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your official employee profile details. Some fields are managed by HR.
            </CardDescription>
          </div>
          {!editing && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
              onClick={() => setEditing(true)}
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            {user.avatarUrl && (
              <AvatarImage src={user.avatarUrl} alt={user.fullName} />
            )}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-lg">{user.fullName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ReadOnlyField icon={User} label="Full Name" value={user.fullName} />
          <ReadOnlyField
            icon={BadgeCheck}
            label="Employee ID"
            value={user.employeeId ?? "Not assigned"}
          />
          <ReadOnlyField icon={Mail} label="Email Address" value={user.email} />
          <ReadOnlyField
            icon={Building2}
            label="Department"
            value={user.department}
          />
          <ReadOnlyField icon={Briefcase} label="Role" value={user.role} />

          {editing ? (
            <div className="space-y-1.5">
              <Label
                htmlFor="contactNumber"
                className="text-xs text-muted-foreground flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                Contact Number
              </Label>
              <Input
                id="contactNumber"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="e.g. +63 912 345 6789"
                className={error ? "border-destructive" : ""}
              />
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </div>
          ) : (
            <ReadOnlyField
              icon={Phone}
              label="Contact Number"
              value={contactNumber}
            />
          )}
        </div>

        {editing && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={handleSave} disabled={loading} className="gap-2">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Save changes
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Name, email, department, and role are synced from your employee record.
          You may update your contact number here.
        </p>
      </CardContent>
    </Card>
  );
}
