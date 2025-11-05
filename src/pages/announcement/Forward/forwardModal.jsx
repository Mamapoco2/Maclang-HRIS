// ForwardModal.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CURRENT_USER = "IT Dept User"; // Update dynamically if needed

const ForwardModal = ({ open, onOpenChange, email }) => {
  const [forwardRecipient, setForwardRecipient] = useState("");
  const [forwardMessage, setForwardMessage] = useState("");

  const departments = [
    "All Departments",
    "Human Resources",
    "Finance",
    "IT",
    "Marketing",
    "Operations",
  ];

  const handleForward = () => {
    if (!forwardRecipient) {
      toast.error("Please select a department.");
      return;
    }

    // Prepare forwarded message object
    const forwardedMsg = {
      id: Date.now(), // simple unique ID
      sender: CURRENT_USER,
      recipient: forwardRecipient,
      subject: `Fwd: ${email.subject}`,
      snippet: forwardMessage || email.content.slice(0, 50),
      content: `${forwardMessage ? forwardMessage + "\n\n" : ""}${email.content}`,
      time: new Date().toISOString(),
      originalEmailId: email.id,
    };

    // Save to localStorage
    const stored = JSON.parse(localStorage.getItem("forwardedMessages") || "[]");
    stored.unshift(forwardedMsg); // latest on top
    localStorage.setItem("forwardedMessages", JSON.stringify(stored));

    toast.success(`Email forwarded to ${forwardRecipient}`);
    setForwardRecipient("");
    setForwardMessage("");
    onOpenChange(false);

    // Trigger storage event for Forward.jsx to update
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Forward Email</DialogTitle>
          <DialogDescription>
            Select the department and add an optional message to forward this email.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 mt-2">
          {/* To Dropdown */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">To:</label>
            <Select value={forwardRecipient} onValueChange={setForwardRecipient}>
              <SelectTrigger>
                <SelectValue placeholder="Select department..." />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Optional Message */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Message (optional):</label>
            <Textarea
              placeholder="Add a message..."
              value={forwardMessage}
              onChange={(e) => setForwardMessage(e.target.value)}
              rows={4}
            />
          </div>

          {/* Original Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Original Email:</label>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-sm whitespace-pre-line max-h-48 overflow-y-auto">
              {email.content}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleForward}>Forward</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ForwardModal;
