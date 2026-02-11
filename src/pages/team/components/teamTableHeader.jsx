import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";

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
          <IconPlus size={16} stroke={2} />
          Add Member
        </Button>
      </div>
    </div>
  );
}
