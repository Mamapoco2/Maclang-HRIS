import { MoreVertical, Pencil, PinOff, Pin, Copy, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CURRENT_USER } from "../constants";

export function CardMenu({ ann, onPin, onArchive, onEdit, onCopyLink }) {
  const isOwn = ann.author.id === CURRENT_USER.id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400"
        >
          <MoreVertical size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {isOwn && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil size={14} className="text-slate-400" />
            Edit announcement
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onPin}>
          {ann.pinned ? (
            <PinOff size={14} className="text-slate-400" />
          ) : (
            <Pin size={14} className="text-slate-400" />
          )}
          {ann.pinned ? "Unpin" : "Pin to top"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCopyLink}>
          <Copy size={14} className="text-slate-400" />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onArchive} className="text-red-600 focus:text-red-600">
          <Archive size={14} />
          {ann.archived ? "Unarchive" : "Archive"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
