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
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    email: "",
    contact: "",
    position: "",
    department: "",
    designation: "",
    gender: "",
    status: "Active",
    address: "",
    birthdate: "",
    annualSalary: "",
    monthlySalary: "",
    sgLevel: "",
    employeeType: "",
    avatar: "",
  });

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else {
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        email: "",
        contact: "",
        position: "",
        department: "",
        designation: "",
        gender: "",
        status: "Active",
        address: "",
        birthdate: "",
        annualSalary: "",
        monthlySalary: "",
        sgLevel: "",
        employeeType: "",
        avatar: "",
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
      "designation",
      "annualSalary",
      "sgLevel",
    ];
    const missing = required.find((key) => !formData[key]);
    if (missing) return toast.error("Please fill out all required fields.");

    const dataToSubmit = {
      ...formData,
      monthlySalary: formData.annualSalary / 12,
    };

    if (employee) {
      await employeeService.updateEmployee(employee.id, dataToSubmit);
      toast.success("Employee updated successfully");
    } else {
      await employeeService.addEmployee(dataToSubmit);
      toast.success("Employee added successfully");
    }

    refresh();
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8 max-h-[80vh] overflow-y-auto p-8 bg-white w-full min-w-[1200px]">
      {/* Header Section */}
      <div className="border-b-2 border-black pb-4">
        <h2 className="text-2xl font-bold text-black uppercase tracking-wide">
          {employee ? "Edit Employee" : "New Employee"}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Fields marked with <span className="text-black font-bold">*</span> are
          required
        </p>
      </div>

      {/* Name Fields */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-black uppercase tracking-wider border-b border-gray-300 pb-1">
          Personal Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-xs font-bold text-black uppercase">
              First Name <span className="text-black">*</span>
            </Label>
            <Input
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              placeholder="Juan"
              className="border-2 border-black focus:border-black focus:ring-black bg-white text-black placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="text-xs font-bold text-black uppercase">
              Middle Name
            </Label>
            <Input
              value={formData.middleName}
              onChange={(e) => handleChange("middleName", e.target.value)}
              placeholder="Dela"
              className="border-2 border-gray-300 focus:border-black focus:ring-black bg-white text-black placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="text-xs font-bold text-black uppercase">
              Last Name <span className="text-black">*</span>
            </Label>
            <Input
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              placeholder="Cruz"
              className="border-2 border-black focus:border-black focus:ring-black bg-white text-black placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="text-xs font-bold text-black uppercase">
              Suffix
            </Label>
            <Input
              value={formData.suffix}
              onChange={(e) => handleChange("suffix", e.target.value)}
              placeholder="Jr., Sr., III"
              className="border-2 border-gray-300 focus:border-black focus:ring-black bg-white text-black placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-black uppercase tracking-wider border-b border-gray-300 pb-1">
          Contact Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-bold text-black uppercase">
              Email <span className="text-black">*</span>
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="email@company.com"
              className="border-2 border-black focus:border-black focus:ring-black bg-white text-black placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="text-xs font-bold text-black uppercase">
              Contact Number
            </Label>
            <Input
              value={formData.contact}
              onChange={(e) => handleChange("contact", e.target.value)}
              placeholder="09XX XXX XXXX"
              className="border-2 border-gray-300 focus:border-black focus:ring-black bg-white text-black placeholder:text-gray-400"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-bold text-black uppercase">
              Address
            </Label>
            <Input
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="City, Province"
              className="border-2 border-gray-300 focus:border-black focus:ring-black bg-white text-black placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="text-xs font-bold text-black uppercase">
              Birthdate
            </Label>
            <Input
              type="date"
              value={formData.birthdate}
              onChange={(e) => handleChange("birthdate", e.target.value)}
              className="border-2 border-gray-300 focus:border-black focus:ring-black bg-white text-black"
            />
          </div>
        </div>
      </div>

      {/* Employment Details */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-black uppercase tracking-wider border-b border-gray-300 pb-1">
          Employment Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-bold text-black uppercase">
              Position <span className="text-black">*</span>
            </Label>
            <Input
              value={formData.position}
              onChange={(e) => handleChange("position", e.target.value)}
              placeholder="e.g., Administrative Aide III"
              className="border-2 border-black focus:border-black focus:ring-black bg-white text-black placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="text-xs font-bold text-black uppercase">
              Gender
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(val) => handleChange("gender", val)}
            >
              <SelectTrigger className="border-2 border-gray-300 focus:border-black focus:ring-black bg-white text-black">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-black">
                <SelectItem value="Male" className="hover:bg-gray-100">
                  Male
                </SelectItem>
                <SelectItem value="Female" className="hover:bg-gray-100">
                  Female
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Department Information */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-black uppercase tracking-wider border-b border-gray-300 pb-1">
          Department Assignment
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-bold text-black uppercase">
              Assigned Department <span className="text-black">*</span>
            </Label>
            <Input
              value={formData.department}
              onChange={(e) => handleChange("department", e.target.value)}
              placeholder="Current department"
              className="border-2 border-black focus:border-black focus:ring-black bg-white text-black placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="text-xs font-bold text-black uppercase">
              Original Department <span className="text-black">*</span>
            </Label>
            <Input
              value={formData.designation}
              onChange={(e) => handleChange("designation", e.target.value)}
              placeholder="Home department"
              className="border-2 border-black focus:border-black focus:ring-black bg-white text-black placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Salary and Employment Details */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-black uppercase tracking-wider border-b border-gray-300 pb-1">
          Compensation & Type
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-xs font-bold text-black uppercase">
              Annual Salary (₱) <span className="text-black">*</span>
            </Label>
            <Input
              type="number"
              value={formData.annualSalary}
              onChange={(e) => handleChange("annualSalary", e.target.value)}
              placeholder="222000"
              className="border-2 border-black focus:border-black focus:ring-black bg-white text-black placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="text-xs font-bold text-black uppercase">
              Salary Grade <span className="text-black">*</span>
            </Label>
            <Input
              type="number"
              value={formData.sgLevel}
              onChange={(e) => handleChange("sgLevel", e.target.value)}
              placeholder="9"
              className="border-2 border-black focus:border-black focus:ring-black bg-white text-black placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="text-xs font-bold text-black uppercase">
              Employee Type
            </Label>
            <Select
              value={formData.employeeType}
              onValueChange={(val) => handleChange("employeeType", val)}
            >
              <SelectTrigger className="border-2 border-gray-300 focus:border-black focus:ring-black bg-white text-black">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-black">
                <SelectItem value="Plantilla" className="hover:bg-gray-100">
                  Plantilla
                </SelectItem>
                <SelectItem value="Job Order" className="hover:bg-gray-100">
                  Consultant
                </SelectItem>
                <SelectItem value="Contractual" className="hover:bg-gray-100">
                  Contract of Service
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Status and Avatar */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-black uppercase tracking-wider border-b border-gray-300 pb-1">
          Additional Settings
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-bold text-black uppercase">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(val) => handleChange("status", val)}
            >
              <SelectTrigger className="border-2 border-gray-300 focus:border-black focus:ring-black bg-white text-black">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-black">
                <SelectItem value="Active" className="hover:bg-gray-100">
                  Active
                </SelectItem>
                <SelectItem value="Inactive" className="hover:bg-gray-100">
                  Inactive
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-bold text-black uppercase">
              Avatar URL
            </Label>
            <Input
              value={formData.avatar}
              onChange={(e) => handleChange("avatar", e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="border-2 border-gray-300 focus:border-black focus:ring-black bg-white text-black placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full mt-6 bg-black text-white hover:bg-gray-800 border-2 border-black font-bold uppercase tracking-wider py-6 text-base transition-all"
      >
        {employee ? "Update Employee" : "Add Employee"}
      </Button>
    </div>
  );
}
