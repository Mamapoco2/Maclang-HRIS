import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function EmployeeViewDialog({ open, onClose, employee }) {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Employee Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-gray-800">
          {/* Profile Image */}
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={employee.image ? URL.createObjectURL(employee.image) : ""}
                alt={employee.firstName}
              />
              <AvatarFallback>
                {employee.firstName?.[0]}
                {employee.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">
                {employee.firstName} {employee.middleName} {employee.lastName}{" "}
                {employee.suffix}
              </h2>
              <p className="text-sm text-gray-500">{employee.position}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Email */}
            <div>
              <Label className="font-semibold text-base">Email</Label>
              <p className="text-sm">{employee.email || "N/A"}</p>
            </div>

            {/* Contact */}
            <div>
              <Label className="font-semibold text-base">Contact</Label>
              <p className="text-sm">{employee.contact || "N/A"}</p>
            </div>

            {/* Department */}
            <div>
              <Label className="font-semibold text-base">Department</Label>
              <p className="text-sm">{employee.department || "N/A"}</p>
            </div>

            {/* Gender */}
            <div>
              <Label className="font-semibold text-base">Gender</Label>
              <p className="text-sm">{employee.gender || "N/A"}</p>
            </div>

            {/* Address */}
            <div>
              <Label className="font-semibold text-base">Address</Label>
              <p className="text-sm">{employee.address || "N/A"}</p>
            </div>

            {/* Birthdate */}
            <div>
              <Label className="font-semibold text-base">Birthdate</Label>
              <p className="text-sm">
                {employee.birthdate
                  ? new Date(employee.birthdate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

            {/* Salary */}
            <div>
              <Label className="font-semibold text-base">Salary</Label>
              <p className="text-sm">
                ₱
                {employee.salary
                  ? employee.salary.toLocaleString("en-PH")
                  : "0.00"}
              </p>
            </div>

            <div>
              <Label className="font-semibold text-base">Employee Type</Label>
              <p className="text-sm">{employee.employeeType || "N/A"}</p>
            </div>

            <div>
              <Label className="font-semibold text-base">Status</Label>
              <p
                className={`text-sm font-medium ${
                  employee.status === "Active"
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {employee.status || "Inactive"}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
