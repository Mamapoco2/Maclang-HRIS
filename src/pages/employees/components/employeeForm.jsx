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
    if (employee) setFormData(employee);
  }, [employee]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

  return (
    <form className="max-h-[80vh] overflow-y-auto p-8 bg-white w-full min-w-[1000px] space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold uppercase">
          {employee ? "Edit Employee" : "New Employee"}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          <span className="font-bold">*</span> Required fields
        </p>
      </div>

      {/* Personal Info */}
      <section className="p-4 rounded-md space-y-4">
        <h3 className="text-sm font-semibold uppercase border-b border-gray-300 pb-2">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InputField
            label="First Name"
            required
            value={formData.firstName}
            onChange={(v) => handleChange("firstName", v)}
            placeholder="Juan"
          />
          <InputField
            label="Middle Name"
            value={formData.middleName}
            onChange={(v) => handleChange("middleName", v)}
            placeholder="Dela"
          />
          <InputField
            label="Last Name"
            required
            value={formData.lastName}
            onChange={(v) => handleChange("lastName", v)}
            placeholder="Cruz"
          />
          <InputField
            label="Suffix"
            value={formData.suffix}
            onChange={(v) => handleChange("suffix", v)}
            placeholder="Jr., Sr., III"
          />
        </div>
      </section>

      {/* Contact Info */}
      <section className="p-4 rounded-md space-y-4">
        <h3 className="text-sm font-semibold uppercase border-b border-gray-300 pb-2">
          Contact Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Email"
            required
            type="email"
            value={formData.email}
            onChange={(v) => handleChange("email", v)}
            placeholder="email@company.com"
          />
          <InputField
            label="Contact Number"
            value={formData.contact}
            onChange={(v) => handleChange("contact", v)}
            placeholder="09XX XXX XXXX"
          />
          <InputField
            label="Address"
            value={formData.address}
            onChange={(v) => handleChange("address", v)}
            placeholder="City, Province"
          />
          <InputField
            label="Birthdate"
            type="date"
            value={formData.birthdate}
            onChange={(v) => handleChange("birthdate", v)}
          />
        </div>
      </section>

      {/* Employment Info */}
      <section className="p-4 rounded-md space-y-4">
        <h3 className="text-sm font-semibold uppercase border-b border-gray-300 pb-2">
          Employment Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Position"
            required
            value={formData.position}
            onChange={(v) => handleChange("position", v)}
            placeholder="e.g., Administrative Aide III"
          />
          <SelectField
            label="Gender"
            options={["Male", "Female"]}
            value={formData.gender}
            onChange={(v) => handleChange("gender", v)}
          />
          <InputField
            label="Department"
            required
            value={formData.department}
            onChange={(v) => handleChange("department", v)}
            placeholder="Current department"
          />
          <InputField
            label="Designation"
            required
            value={formData.designation}
            onChange={(v) => handleChange("designation", v)}
            placeholder="Home department"
          />
          <InputField
            label="Annual Salary (₱)"
            required
            type="number"
            value={formData.annualSalary}
            onChange={(v) => handleChange("annualSalary", v)}
            placeholder="222000"
          />
          <InputField
            label="Salary Grade"
            required
            type="number"
            value={formData.sgLevel}
            onChange={(v) => handleChange("sgLevel", v)}
            placeholder="9"
          />
          <SelectField
            label="Employee Type"
            options={["Plantilla", "Job Order", "Contractual"]}
            value={formData.employeeType}
            onChange={(v) => handleChange("employeeType", v)}
          />
          <SelectField
            label="Status"
            options={["Active", "Inactive"]}
            value={formData.status}
            onChange={(v) => handleChange("status", v)}
          />
          <InputField
            label="Avatar URL"
            value={formData.avatar}
            onChange={(v) => handleChange("avatar", v)}
            placeholder="https://example.com/avatar.jpg"
          />
        </div>
      </section>

      <Button
        type="submit"
        onClick={handleSubmit}
        className="w-full bg-black text-white hover:bg-gray-800 py-4 font-bold uppercase"
      >
        {employee ? "Update Employee" : "Add Employee"}
      </Button>
    </form>
  );
}

// Reusable input component
function InputField({
  label,
  required,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className="flex flex-col">
      <Label className="text-xs font-semibold uppercase flex items-center gap-1">
        {label} {required && <span className="text-red-600">*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-2 border-gray-300 focus:border-black focus:ring-black bg-white text-black placeholder:text-gray-400"
      />
    </div>
  );
}

// Reusable select component
function SelectField({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col">
      <Label className="text-xs font-semibold uppercase">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="border-2 border-gray-300 focus:border-black focus:ring-black bg-white text-black">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent className="bg-white border-2 border-black">
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
