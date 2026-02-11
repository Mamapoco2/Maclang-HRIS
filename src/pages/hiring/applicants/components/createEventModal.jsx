import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IconCalendar } from "@tabler/icons-react";
import { format } from "date-fns";

const colors = [
  { name: "Cyan", value: "bg-cyan-500", hex: "#06b6d4" },
  { name: "Yellow", value: "bg-yellow-400", hex: "#facc15" },
  { name: "Purple", value: "bg-purple-500", hex: "#a855f7" },
  { name: "Pink", value: "bg-pink-500", hex: "#ec4899" },
  { name: "Green", value: "bg-emerald-500", hex: "#10b981" },
  { name: "Orange", value: "bg-orange-500", hex: "#f97316" },
];

// Sample data
const interviewers = [
  { id: "1", name: "John Smith" },
  { id: "2", name: "Sarah Johnson" },
  { id: "3", name: "Michael Brown" },
  { id: "4", name: "Emily Davis" },
];

const interviewees = [
  { id: "1", name: "Alice Wilson" },
  { id: "2", name: "Bob Martinez" },
  { id: "3", name: "Carol Anderson" },
  { id: "4", name: "David Taylor" },
  { id: "5", name: "Eve Thomas" },
];

export default function CreateEventDialog({
  isOpen,
  onOpenChange,
  newEvent,
  setNewEvent,
  onSave,
}) {
  const [openInterviewees, setOpenInterviewees] = React.useState(false);

  const toggleInterviewee = (intervieweeId) => {
    const current = newEvent.interviewees || [];
    const updated = current.includes(intervieweeId)
      ? current.filter((id) => id !== intervieweeId)
      : [...current, intervieweeId];

    setNewEvent({ ...newEvent, interviewees: updated });
  };

  const getSelectedIntervieweesText = () => {
    const selected = newEvent.interviewees || [];
    if (selected.length === 0) return "Select interviewees";
    if (selected.length === 1) {
      return interviewees.find((i) => i.id === selected[0])?.name;
    }
    return `${selected.length} selected`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Create Event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={newEvent.description}
              onChange={(e) =>
                setNewEvent({ ...newEvent, description: e.target.value })
              }
              className="min-h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Interviewer</Label>
              <Select
                value={newEvent.interviewer}
                onValueChange={(val) =>
                  setNewEvent({ ...newEvent, interviewer: val })
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select interviewer" />
                </SelectTrigger>
                <SelectContent>
                  {interviewers.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Interviewees</Label>
              <Popover
                open={openInterviewees}
                onOpenChange={setOpenInterviewees}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="h-12 w-full justify-between font-normal"
                  >
                    {getSelectedIntervieweesText()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <div className="max-h-64 overflow-auto p-1">
                    {interviewees.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent cursor-pointer"
                        onClick={() => toggleInterviewee(p.id)}
                      >
                        <Checkbox
                          checked={(newEvent.interviewees || []).includes(p.id)}
                        />
                        <span className="text-sm">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Dates */}
          {[
            { label: "Start Date", key: "startDate" },
            { label: "End Date", key: "endDate" },
          ].map(({ label, key }) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 w-full justify-start text-left font-normal"
                  >
                    <IconCalendar size={16} stroke={1.5} className="mr-2" />
                    {newEvent[key]
                      ? format(new Date(newEvent[key]), "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      newEvent[key] ? new Date(newEvent[key]) : undefined
                    }
                    onSelect={(date) =>
                      setNewEvent({
                        ...newEvent,
                        [key]: date ? format(date, "yyyy-MM-dd") : "",
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          ))}

          <div className="flex items-center gap-2">
            <Checkbox
              checked={newEvent.allDay}
              onCheckedChange={(val) =>
                setNewEvent({ ...newEvent, allDay: val })
              }
            />
            <Label>All day</Label>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={newEvent.location}
              onChange={(e) =>
                setNewEvent({ ...newEvent, location: e.target.value })
              }
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setNewEvent({ ...newEvent, color: c.value })}
                  className={`w-8 h-8 rounded-full ${
                    newEvent.color === c.value ? "ring-2 ring-black" : ""
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="bg-black text-white" onClick={onSave}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
