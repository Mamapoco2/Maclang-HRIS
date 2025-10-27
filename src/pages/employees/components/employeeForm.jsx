import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { employeeService } from "@/services/employeeService";
import { toast } from "sonner";

export default function EmployeeForm({ employee, refresh, onClose }) {
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    middleName: "",
    suffixName: "",
    email: "",
    position: "",
    department: "",
    status: "Active",
  });

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else {
      setFormData({
        lastName: "",
        firstName: "",
        middleName: "",
        suffixName: "",
        email: "",
        position: "",
        department: "",
        status: "Active",
      });
    }
  }, [employee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.lastName ||
      !formData.firstName ||
      !formData.middleName ||
      !formData.suffixName ||
      !formData.email ||
      !formData.position ||
      !formData.department
    )
      return toast.error("Please fill out all fields.");

    if (employee) {
      await employeeService.updateEmployee(employee.id, formData);
      toast.success("Employee updated successfully");
    } else {
      await employeeService.addEmployee(formData);
      toast.success("Employee added successfully");
    }

    refresh();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name*/}
      <div className="grid gap-2">
        <Label>Last Name</Label>
        <Input
          placeholder="Juan Dela Cruz"
          value={formData.lastName}
          onChange={(e) =>
            setFormData({ ...formData, lastName: e.target.value })
          }
        />
        <Label>First Name</Label>
        <Input
          placeholder="Juan Dela Cruz"
          value={formData.firstName}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
        />
        <Label>Middle Name</Label>
        <Input
          placeholder="Juan Dela Cruz"
          value={formData.middleName}
          onChange={(e) =>
            setFormData({ ...formData, middleName: e.target.value })
          }
        />
         <Label>Suffix</Label>
        <Input
          placeholder="Juan Dela Cruz"
          value={formData.suffixName}
          onChange={(e) =>
            setFormData({ ...formData, suffixName: e.target.value })
          }
        />
      </div>

      {/* Email */}
      <div className="grid gap-2">
        <Label>Email</Label>
        <Input
          type="email"
          placeholder="juan@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      {/* Position */}
      <div className="grid gap-2">
        <Label>Position</Label>
        <Input
          placeholder="HR Manager"
          value={formData.position}
          onChange={(e) =>
            setFormData({ ...formData, position: e.target.value })
          }
        />
      </div>

      {/* Department */}
      <div className="grid gap-2">
        <Label>Department</Label>
        <Input
          placeholder="Human Resources"
          value={formData.department}
          onChange={(e) =>
            setFormData({ ...formData, department: e.target.value })
          }
        />
      </div>

      {/* Status */}
      <div className="grid gap-2">
        <Label>Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        {employee ? "Update" : "Add"}
      </Button>
    </form>
  );
}
