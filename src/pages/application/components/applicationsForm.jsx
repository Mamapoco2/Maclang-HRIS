import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ApplicantForm({ form, setForm, onSubmit }) {
  const handleDocumentsChange = (e) => {
    let value = e.target.value;

    // If space is pressed, replace it with comma and space
    if (value.endsWith("  ") && !value.endsWith(", ")) {
      value = value.trimEnd() + ", ";
    }

    setForm({ ...form, documents: value });
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4 p-4">
      <div className="grid gap-2">
        <Label>First Name</Label>
        <Input
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label>Last Name</Label>
        <Input
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label>Email</Label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label>Age</Label>
        <Input
          type="number"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label>Phone Number</Label>
        <Input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label>Address</Label>
        <Input
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label>Birthdate</Label>
        <Input
          type="date"
          value={form.birthdate}
          onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label>How did they learn about the application?</Label>
        <Select
          value={form.source}
          onValueChange={(value) => setForm({ ...form, source: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Documents Passed (press double space to separate)</Label>
        <Input
          value={form.documents}
          onChange={handleDocumentsChange}
          placeholder="e.g., NBI PDS Birth Certificate"
        />
      </div>
      <Button type="submit">Save</Button>
    </form>
  );
}
