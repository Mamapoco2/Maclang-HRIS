import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TrainingAssignPeople({ training, onAssign }) {
  const [name, setName] = useState("");

  const addPerson = () => {
    if (!name) return;
    const updated = [...(training.participants || []), name];
    onAssign(training.id, updated);
    setName("");
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold">Assign People</h4>

      <div className="flex gap-2">
        <Input
          placeholder="Employee Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button onClick={addPerson}>Add</Button>
      </div>

      <ul className="text-sm list-disc pl-5">
        {training.participants?.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
}
