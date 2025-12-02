import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TeamTableHeader({
  searchQuery,
  setSearchQuery,
  onAddMember,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <h2 className="text-2xl font-semibold">HR Team</h2>

      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search team member..."
          className="border rounded-xl px-4 py-2 w-64"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Button className="flex items-center gap-2" onClick={onAddMember}>
          <Plus className="w-4 h-4" />
          Add Member
        </Button>
      </div>
    </div>
  );
}
