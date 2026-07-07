import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { LinkedPostingCard } from "./LinkedPostingCard";

const COLLAPSED_LIMIT = 3;

// Renders one LinkedPostingCard per linked posting id. Collapses to the
// first few when an announcement links to a lot of postings, with a
// "Show N more" toggle.
export function LinkedPostingsList({ postingIds }) {
  const [expanded, setExpanded] = useState(false);

  if (!postingIds || postingIds.length === 0) return null;

  const visible = expanded ? postingIds : postingIds.slice(0, COLLAPSED_LIMIT);
  const hiddenCount = postingIds.length - visible.length;

  return (
    <div className="space-y-2">
      {postingIds.length > 1 && (
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Linked job openings ({postingIds.length})
        </p>
      )}
      {visible.map((id) => (
        <LinkedPostingCard key={id} postingId={id} />
      ))}
      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <ChevronDown size={12} /> Show {hiddenCount} more{" "}
          {hiddenCount === 1 ? "opening" : "openings"}
        </button>
      )}
      {expanded && postingIds.length > COLLAPSED_LIMIT && (
        <button
          onClick={() => setExpanded(false)}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <ChevronUp size={12} /> Show less
        </button>
      )}
    </div>
  );
}
