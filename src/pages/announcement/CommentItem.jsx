import { useState } from "react";
import { Reply, CornerDownRight, Pencil, Trash2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "./components/Avatar";
import { authorColor, formatRelativeTime } from "./utils";

export function CommentItem({
  c,
  currentUserId,
  canModerate,
  onEdit,
  onDelete,
  onReply,
}) {
  const [showReplies, setShowReplies] = useState(true);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const canEditOrDelete = c.authorId === currentUserId || canModerate;

  async function submitReply() {
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onReply(c.id, replyText.trim());
      setReplyText("");
      setReplying(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex gap-3 group">
      <Avatar
        initials={c.initials}
        size="sm"
        colorClass={authorColor(c.authorId)}
        src={c.authorAvatarUrl}
      />
      <div className="flex-1 min-w-0">
        <div className="bg-slate-50 rounded-xl px-4 py-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-700">
              {c.author}
            </span>
            <span className="text-xs text-slate-400">
              {formatRelativeTime(c.postedAt)}
              {c.editedAt && " · edited"}
            </span>
          </div>
          <p className="text-sm text-slate-600">{c.text}</p>
        </div>

        <div className="flex items-center gap-3 mt-1 px-1">
          <button
            onClick={() => setReplying((r) => !r)}
            className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1"
          >
            <Reply size={11} /> Reply
          </button>
          {c.replies.length > 0 && (
            <button
              onClick={() => setShowReplies((s) => !s)}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              <CornerDownRight size={11} />
              {showReplies ? "Hide" : c.replies.length}{" "}
              {c.replies.length === 1 ? "reply" : "replies"}
            </button>
          )}
          {canEditOrDelete && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
              <button
                onClick={() => onEdit(c)}
                className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1"
              >
                <Pencil size={11} /> Edit
              </button>
              <button
                onClick={() => onDelete(c.id)}
                className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1"
              >
                <Trash2 size={11} /> Delete
              </button>
            </div>
          )}
        </div>

        {showReplies && c.replies.length > 0 && (
          <div className="mt-2 ml-4 space-y-2 border-l-2 border-slate-100 pl-3">
            {c.replies.map((r) => (
              <div key={r.id} className="flex gap-2">
                <Avatar
                  initials={r.initials}
                  size="sm"
                  colorClass={authorColor(r.authorId)}
                  src={r.authorAvatarUrl}
                />
                <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-slate-700">
                      {r.author}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatRelativeTime(r.postedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {replying && (
          <div className="mt-2 ml-4 flex gap-2">
            <Input
              className="flex-1 bg-slate-50"
              placeholder={`Reply to ${c.author}…`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitReply()}
              autoFocus
              disabled={submitting}
            />
            <Button
              size="icon"
              disabled={!replyText.trim() || submitting}
              onClick={submitReply}
            >
              <Send size={13} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setReplying(false)}
            >
              <X size={13} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
