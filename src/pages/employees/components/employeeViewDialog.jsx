import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function EmployeeViewDialog({ open, onClose, employee }) {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Employee Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-gray-800">
          <div>
            <Label className="font-semibold text-base">Last Name</Label>
            <p className="text-sm">{employee.lastName}</p>
          </div>

          <div>
            <Label className="font-semibold text-base">First Name</Label>
            <p className="text-sm">{employee.firstName}</p>
          </div>

          <div>
            <Label className="font-semibold text-base">Middle Name</Label>
            <p className="text-sm">{employee.middleName}</p>
          </div>

          <div>
            <Label className="font-semibold text-base">Suffix</Label>
            <p className="text-sm">{employee.suffixName}</p>
          </div>

          <div>
            <Label className="font-semibold text-base">Email</Label>
            <p className="text-sm">{employee.email || "N/A"}</p>
          </div>

          <div>
            <Label className="font-semibold text-base">Position</Label>
            <p className="text-sm">{employee.position}</p>
          </div>

          <div>
            <Label className="font-semibold text-base">Department</Label>
            <p className="text-sm">{employee.department || "N/A"}</p>
          </div>

          <div>
            <Label className="font-semibold text-base">Status</Label>
            <p
              className={`text-sm font-medium ${
                employee.status === "Active" ? "text-green-600" : "text-red-500"
              }`}
            >
              {employee.status || "Inactive"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
