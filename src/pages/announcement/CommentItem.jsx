import { useState } from "react";
import { Reply, CornerDownRight, Pencil, Trash2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "./components/Avatar";
import { authorColor, formatRelativeTime } from "./utils";
import { CURRENT_USER } from "./constants";

export function CommentItem({ c, onEdit, onDelete, onReply }) {
  const [showReplies, setShowReplies] = useState(true);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState(c.replies || []);

  function submitReply() {
    if (!replyText.trim()) return;
    const r = {
      id: `r_${Date.now()}`,
      authorId: CURRENT_USER.id,
      author: CURRENT_USER.name,
      initials: CURRENT_USER.initials,
      text: replyText.trim(),
      postedAt: new Date(),
    };
    setReplies((prev) => [...prev, r]);
    onReply && onReply(c.id, [...replies, r]);
    setReplyText("");
    setReplying(false);
  }

  return (
    <div className="flex gap-3 group">
      <Avatar
        initials={c.initials}
        size="sm"
        colorClass={authorColor(c.authorId)}
      />
      <div className="flex-1 min-w-0">
        <div className="bg-slate-50 rounded-xl px-4 py-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-700">
              {c.author}
            </span>
            <span className="text-xs text-slate-400">
              {formatRelativeTime(c.postedAt)}
            </span>
          </div>
          <p className="text-sm text-slate-600">{c.text}</p>
        </div>

        <div className="flex items-center gap-3 mt-1 px-1">
          <button
            onClick={() => setReplying((r) => !r)}
            className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <Reply size={11} /> Reply
          </button>
          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies((s) => !s)}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
            >
              <CornerDownRight size={11} />
              {showReplies ? "Hide" : `${replies.length}`}{" "}
              {replies.length === 1 ? "reply" : "replies"}
            </button>
          )}
          {c.authorId === CURRENT_USER.id && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
              <button
                onClick={() => onEdit(c)}
                className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
              >
                <Pencil size={11} /> Edit
              </button>
              <button
                onClick={() => onDelete(c.id)}
                className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <Trash2 size={11} /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Replies */}
        {showReplies && replies.length > 0 && (
          <div className="mt-2 ml-4 space-y-2 border-l-2 border-slate-100 pl-3">
            {replies.map((r) => (
              <div key={r.id} className="flex gap-2">
                <Avatar
                  initials={r.initials}
                  size="sm"
                  colorClass={authorColor(r.authorId)}
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

        {/* Reply input */}
        {replying && (
          <div className="mt-2 ml-4 flex gap-2">
            <Avatar
              initials={CURRENT_USER.initials}
              size="sm"
              colorClass={authorColor(CURRENT_USER.id)}
            />
            <div className="flex-1 flex gap-2">
              <Input
                className="flex-1 bg-slate-50"
                placeholder={`Reply to ${c.author}…`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitReply()}
                autoFocus
              />
              <Button
                size="icon"
                disabled={!replyText.trim()}
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
          </div>
        )}
      </div>
    </div>
  );
}
