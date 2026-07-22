import { useState } from "react";

const toNumber = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

export function useEmployeeCompensation(setFormData) {
  const [salaryInputSource, setSalaryInputSource] = useState(null);

  const handleAnnualSalaryChange = (raw) => {
    setSalaryInputSource("annual");
    const n = toNumber(raw);
    setFormData((prev) => ({
      ...prev,
      annualSalary: raw,
      monthlySalary: n !== null ? (n / 12).toFixed(2) : prev.monthlySalary,
    }));
  };

  const handleMonthlySalaryChange = (raw) => {
    setSalaryInputSource("monthly");
    const n = toNumber(raw);
    setFormData((prev) => ({
      ...prev,
      monthlySalary: raw,
      annualSalary: n !== null ? (n * 12).toFixed(2) : prev.annualSalary,
    }));
  };

  return {
    salaryInputSource,
    handleAnnualSalaryChange,
    handleMonthlySalaryChange,
  };
}
