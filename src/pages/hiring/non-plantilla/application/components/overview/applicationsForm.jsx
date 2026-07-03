import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconCalendar, IconLoader2 } from "@tabler/icons-react";
import { format } from "date-fns";

export function ApplicantForm({ form, setForm, onSubmit, saving = false }) {
  const up = (val) => val.toUpperCase();

  const handleDocumentsChange = (e) => {
    let value = e.target.value.toUpperCase();
    if (value.endsWith("  ") && !value.endsWith(", ")) {
      value = value.trimEnd() + ", ";
    }
    setForm({ ...form, documents: value });
  };

  const handleDateSelect = (key, date) => {
    setForm({ ...form, [key]: date ? format(date, "yyyy-MM-dd") : "" });
  };

  const parsedBirthdate = form.birthdate ? new Date(form.birthdate) : undefined;
  const parsedDateApplied = form.date_applied
    ? new Date(form.date_applied)
    : undefined;

  return (
    <form onSubmit={onSubmit} className="grid gap-4 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>
            FIRST NAME <span className="text-red-500">*</span>
          </Label>
          <Input
            value={form.first_name ?? ""}
            onChange={(e) =>
              setForm({ ...form, first_name: up(e.target.value) })
            }
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>
            LAST NAME <span className="text-red-500">*</span>
          </Label>
          <Input
            value={form.last_name ?? ""}
            onChange={(e) =>
              setForm({ ...form, last_name: up(e.target.value) })
            }
            required
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>EMAIL</Label>
        <Input
          type="email"
          value={form.email ?? ""}
          onChange={(e) => setForm({ ...form, email: up(e.target.value) })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>AGE</Label>
          <Input
            type="number"
            value={form.age ?? ""}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>PHONE NUMBER</Label>
          <Input
            value={form.phone ?? ""}
            onChange={(e) => setForm({ ...form, phone: up(e.target.value) })}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>ADDRESS</Label>
        <Input
          value={form.address ?? ""}
          onChange={(e) => setForm({ ...form, address: up(e.target.value) })}
        />
      </div>

      <div className="grid gap-2">
        <Label>BIRTHDATE</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal h-10"
            >
              <IconCalendar
                size={16}
                stroke={1.5}
                className="mr-2 text-gray-400"
              />
              {form.birthdate ? (
                format(new Date(form.birthdate), "MMMM d, yyyy").toUpperCase()
              ) : (
                <span className="text-gray-400">PICK A DATE</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={parsedBirthdate}
              onSelect={(date) => handleDateSelect("birthdate", date)}
              captionLayout="dropdown"
              fromYear={1950}
              toYear={new Date().getFullYear()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>POSITION</Label>
          <Input
            value={form.position ?? ""}
            onChange={(e) => setForm({ ...form, position: up(e.target.value) })}
          />
        </div>
        <div className="grid gap-2">
          <Label>DEPARTMENT</Label>
          <Input
            value={form.department ?? ""}
            onChange={(e) =>
              setForm({ ...form, department: up(e.target.value) })
            }
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>DATE APPLIED</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal h-10"
            >
              <IconCalendar
                size={16}
                stroke={1.5}
                className="mr-2 text-gray-400"
              />
              {form.date_applied ? (
                format(
                  new Date(form.date_applied),
                  "MMMM d, yyyy",
                ).toUpperCase()
              ) : (
                <span className="text-gray-400">PICK A DATE</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={parsedDateApplied}
              onSelect={(date) => handleDateSelect("date_applied", date)}
              captionLayout="dropdown"
              fromYear={2000}
              toYear={new Date().getFullYear() + 1}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-2">
        <Label>HOW DID THEY LEARN ABOUT THE APPLICATION?</Label>
        <Select
          value={form.source ?? ""}
          onValueChange={(value) => setForm({ ...form, source: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="SELECT SOURCE" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="facebook">FACEBOOK</SelectItem>
            <SelectItem value="referral">REFERRAL</SelectItem>
            <SelectItem value="other">OTHER</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>SUBMISSION TYPE</Label>
        <Select
          value={form.submission ?? ""}
          onValueChange={(value) => setForm({ ...form, submission: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="SELECT SUBMISSION TYPE" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Walk-in">WALK-IN</SelectItem>
            <SelectItem value="Online">ONLINE</SelectItem>
            <SelectItem value="Email">EMAIL</SelectItem>
            <SelectItem value="Referral">REFERRAL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>REMARKS</Label>
        <Textarea
          value={form.remarks ?? ""}
          onChange={(e) => setForm({ ...form, remarks: up(e.target.value) })}
          className="min-h-[60px]"
        />
      </div>

      <div className="grid gap-2">
        <Label>
          DOCUMENTS PASSED{" "}
          <span className="text-xs text-gray-400 font-normal ml-1">
            (SEPARATE WITH COMMA)
          </span>
        </Label>
        <Input
          value={form.documents ?? ""}
          onChange={handleDocumentsChange}
          placeholder="E.G., NBI, PDS, BIRTH CERTIFICATE"
        />
      </div>

      <Button type="submit" disabled={saving} className="mt-2">
        {saving && <IconLoader2 size={14} className="animate-spin mr-2" />}
        {saving ? "SAVING..." : "SUBMIT APPLICATION"}
      </Button>
    </form>
  );
}
