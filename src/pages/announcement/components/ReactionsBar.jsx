import { useState } from "react";
import { SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { REACTION_TYPES } from "../constants";
import { AnnouncementsApi } from "@/services/announcements";

export function ReactionsBar({
  annId,
  initialReactions,
  initialMyReaction,
  onReact,
}) {
  const [reactions, setReactions] = useState(initialReactions);
  const [myReaction, setMyReaction] = useState(initialMyReaction);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleReact(key) {
    if (pending) return;
    const prevReactions = reactions;
    const prevMy = myReaction;

    // Optimistic update
    setReactions((prev) => {
      const next = { ...prev };
      if (myReaction === key) {
        next[key] = Math.max(0, (next[key] || 0) - 1);
      } else {
        if (myReaction)
          next[myReaction] = Math.max(0, (next[myReaction] || 0) - 1);
        next[key] = (next[key] || 0) + 1;
      }
      return next;
    });
    setMyReaction(myReaction === key ? null : key);
    setPickerOpen(false);
    setPending(true);

    try {
      const res = await AnnouncementsApi.react(annId, key);
      setReactions(res.reactions_summary);
      setMyReaction(res.my_reaction);
      if (res.my_reaction) {
        onReact?.(REACTION_TYPES.find((r) => r.key === res.my_reaction));
      }
    } catch {
      setReactions(prevReactions); // rollback
      setMyReaction(prevMy);
    } finally {
      setPending(false);
    }
  }

  const activeTypes = REACTION_TYPES.filter((r) => reactions[r.key] > 0);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {activeTypes.map((r) => (
        <Button
          key={r.key}
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => handleReact(r.key)}
          title={r.label}
          className={`h-7 gap-1.5 rounded-full px-2.5 text-xs font-medium ${
            myReaction === r.key
              ? "bg-blue-50 border-blue-300 text-blue-700 shadow-sm hover:bg-blue-50"
              : "bg-slate-50 text-slate-600"
          }`}
        >
          <span className="text-sm leading-none">{r.icon}</span>
          <span className="tabular-nums">{reactions[r.key]}</span>
        </Button>
      ))}
      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`h-7 gap-1 rounded-full px-2.5 text-xs ${pickerOpen ? "bg-slate-100" : "text-slate-400"}`}
          >
            <SmilePlus size={13} />
            {activeTypes.length === 0 && <span>React</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 flex gap-1" align="start">
          {REACTION_TYPES.map((r) => (
            <button
              key={r.key}
              disabled={pending}
              onClick={() => handleReact(r.key)}
              title={r.label}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all hover:scale-125 hover:bg-slate-50 ${myReaction === r.key ? "bg-blue-50 ring-2 ring-blue-300" : ""}`}
            >
              {r.icon}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
