import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ContractGenerationTab() {
  const [form, setForm] = useState({
    employee: "",
    position: "",
    salary: "",
    startDate: "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGenerate = () => {
    console.log("Generate contract for:", form);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contract Generation</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Input
          placeholder="Employee Name"
          value={form.employee}
          onChange={(e) => handleChange("employee", e.target.value)}
        />

        <Input
          placeholder="Position"
          value={form.position}
          onChange={(e) => handleChange("position", e.target.value)}
        />

        <Input
          placeholder="Salary"
          value={form.salary}
          onChange={(e) => handleChange("salary", e.target.value)}
        />

        <Input
          type="date"
          value={form.startDate}
          onChange={(e) => handleChange("startDate", e.target.value)}
        />

        <div className="flex gap-2">
          <Button onClick={handleGenerate}>Generate Contract</Button>

          <Button variant="outline">Preview</Button>
        </div>
      </CardContent>
    </Card>
  );
}
