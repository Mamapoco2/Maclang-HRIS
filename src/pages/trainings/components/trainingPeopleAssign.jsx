import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TrainingProgress from "../components/trainingProgress"; // Import the TrainingProgress component

export default function TrainingAssignPeople({
  training,
  onAssign,
  open,
  onClose,
}) {
  const [name, setName] = useState(""); // State to track the name input

  // Function to add a person to the training
  const addPerson = () => {
    if (!name) return; // Don't add if the name is empty
    const updatedParticipants = [...(training.participants || []), name]; // Update participants list
    onAssign(training.id, updatedParticipants); // Call the onAssign method passed from the parent
    setName(""); // Clear the input after adding
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-semibold">Assign People</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Optional description */}
          <DialogDescription>
            View and assign participants to this training.
          </DialogDescription>

          {/* Display the progress of the training */}
          <div className="space-y-2">
            <h4 className="font-semibold">Training Progress</h4>
            <TrainingProgress value={training.progress || 0} />{" "}
            {/* Training Progress component */}
          </div>

          {/* Input field to add participants */}
          <div className="flex gap-2">
            <Input
              placeholder="Employee Name"
              value={name}
              onChange={(e) => setName(e.target.value)} // Update name as user types
            />
            <Button onClick={addPerson}>Add</Button>
          </div>

          {/* Display the list of participants */}
          <div className="max-h-40 overflow-y-auto mt-4">
            <ul className="text-sm list-disc pl-5 space-y-1">
              {training.participants?.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer with close button */}
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
