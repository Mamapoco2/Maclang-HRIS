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
import { Toaster, toast } from "sonner";

export default function EmployeeForm({ employee, refresh, onClose }) {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    contact: "",
    position: "",
    department: "",
    gender: "",
    status: "Active",
    address: "",
    birthdate: "",
    salary: "",
    employeeType: "",
    image: null,
  });

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else {
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        contact: "",
        position: "",
        department: "",
        gender: "",
        status: "Active",
        address: "",
        birthdate: "",
        salary: "",
        employeeType: "",
        image: "",
      });
    }
  }, [employee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = [
      "firstName",
      "lastName",
      "email",
      "position",
      "department",
      "image",
    ];
    const missing = required.find((key) => !formData[key]);
    if (missing) return toast.error("Please fill out all required fields.");

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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[80vh] overflow-y-auto p-2"
    >
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label>First Name</Label>
          <Input
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
          />
        </div>
        <div>
          <Label>Middle Name</Label>
          <Input
            value={formData.middleName}
            onChange={(e) => handleChange("middleName", e.target.value)}
          />
        </div>
        <div>
          <Label>Last Name</Label>
          <Input
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
      </div>

      <div>
        <Label>Contact</Label>
        <Input
          value={formData.contact}
          onChange={(e) => handleChange("contact", e.target.value)}
        />
      </div>

      <div>
        <Label>Position</Label>
        <Input
          value={formData.position}
          onChange={(e) => handleChange("position", e.target.value)}
        />
      </div>

      <div>
        <Label>Department</Label>
        <Input
          value={formData.department}
          onChange={(e) => handleChange("department", e.target.value)}
        />
      </div>

      <div>
        <Label>Gender</Label>
        <Select
          value={formData.gender}
          onValueChange={(val) => handleChange("gender", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Address</Label>
        <Input
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
        />
      </div>

      <div>
        <Label>Birthdate</Label>
        <Input
          type="date"
          value={formData.birthdate}
          onChange={(e) => handleChange("birthdate", e.target.value)}
        />
      </div>

      <div>
        <Label>Salary</Label>
        <Input
          type="number"
          value={formData.salary}
          onChange={(e) => handleChange("salary", e.target.value)}
        />
      </div>

      <div>
        <Label>Employee Type</Label>
        <Select
          value={formData.employeeType}
          onValueChange={(val) => handleChange("employeeType", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Full-time">Full-time</SelectItem>
            <SelectItem value="Part-time">Part-time</SelectItem>
            <SelectItem value="Contractual">Contractual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Status</Label>
        <Select
          value={formData.status}
          onValueChange={(val) => handleChange("status", val)}
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

      <div>
        <Label>Profile Image</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) =>
            handleChange("image", e.target.files ? e.target.files[0] : null)
          }
        />
      </div>

      <Button type="submit" className="w-full">
        {employee ? "Update Employee" : "Add Employee"}
      </Button>
    </form>
  );
}
