import {
  MoreVertical,
  Pencil,
  PinOff,
  Pin,
  Copy,
  Archive,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CardMenu({
  ann,
  canManage,
  onPin,
  onArchive,
  onEdit,
  onDelete,
  onCopyLink,
}) {
  if (!canManage) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-400"
        onClick={onCopyLink}
        title="Copy link"
      >
        <Copy size={16} />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
          <MoreVertical size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil size={14} className="text-slate-400" /> Edit announcement
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onPin}>
          {ann.pinned ? (
            <PinOff size={14} className="text-slate-400" />
          ) : (
            <Pin size={14} className="text-slate-400" />
          )}
          {ann.pinned ? "Unpin" : "Pin to top"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCopyLink}>
          <Copy size={14} className="text-slate-400" /> Copy link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onArchive}>
          <Archive size={14} className="text-slate-400" />{" "}
          {ann.archived ? "Unarchive" : "Archive"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 size={14} /> Delete permanently
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
