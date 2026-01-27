import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Users,
  User,
} from "lucide-react";

export default function EmployeeViewDialog({ open, onClose, employee }) {
  if (!employee) return null;

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="mt-0.5 text-gray-500">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className="text-sm font-medium text-gray-900 wrap-break-words">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4 pb-4 border-b">
          <DialogTitle className="text-xl">Employee Profile</DialogTitle>

          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 ring-2 ring-gray-100">
              <AvatarImage src={employee.avatar} alt={employee.firstName} />
              <AvatarFallback className="text-lg bg-linear-to-br from-blue-500 to-purple-600 text-white">
                {employee.firstName?.[0]}
                {employee.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {employee.firstName} {employee.middleName} {employee.lastName}{" "}
                {employee.suffix}
              </h2>
              <p className="text-base text-gray-600 mt-1">
                {employee.position}
              </p>
              <div className="mt-2">
                <Badge
                  variant={
                    employee.status === "Active" ? "default" : "destructive"
                  }
                  className={
                    employee.status === "Active"
                      ? "bg-green-600 hover:bg-green-700"
                      : ""
                  }
                >
                  {employee.status || "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
          <InfoItem icon={Mail} label="Email Address" value={employee.email} />

          <InfoItem
            icon={Phone}
            label="Contact Number"
            value={employee.contact}
          />

          <InfoItem
            icon={Users}
            label="Assigned Department"
            value={employee.department}
          />

          <InfoItem
            icon={Users}
            label="Original Department"
            value={employee.designation}
          />

          <InfoItem icon={User} label="Gender" value={employee.gender} />

          <InfoItem icon={MapPin} label="Address" value={employee.address} />

          <InfoItem
            icon={Calendar}
            label="Date of Birth"
            value={
              employee.birthdate
                ? new Date(employee.birthdate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : null
            }
          />

          <InfoItem
            icon={DollarSign}
            label="Annual Salary"
            value={
              employee.annualSalary
                ? `₱${employee.annualSalary.toLocaleString("en-PH")}`
                : null
            }
          />

          <InfoItem
            icon={DollarSign}
            label="Monthly Salary"
            value={
              employee.monthlySalary
                ? `₱${employee.monthlySalary.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : null
            }
          />

          <InfoItem
            icon={Briefcase}
            label="Salary Grade Level"
            value={employee.sgLevel ? `SG ${employee.sgLevel}` : null}
          />

          <InfoItem
            icon={Briefcase}
            label="Employee Type"
            value={employee.employeeType}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
