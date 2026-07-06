import { useState } from "react";
import { Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "./Avatar";
import { CommentItem } from "../CommentItem";
import { authorColor } from "../utils";
import { CURRENT_USER, MAX_COMMENT_LENGTH } from "../constants";

export function CommentSection({
  announcementId,
  comments: initial,
  onUpdate,
}) {
  const [comments, setComments] = useState(initial);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const remaining = MAX_COMMENT_LENGTH - draft.length;

  function submit() {
    if (!draft.trim() || draft.length > MAX_COMMENT_LENGTH) return;
    const c = {
      id: `c_${Date.now()}`,
      authorId: CURRENT_USER.id,
      author: CURRENT_USER.name,
      initials: CURRENT_USER.initials,
      text: draft.trim(),
      postedAt: new Date(),
      replies: [],
    };
    const updated = [...comments, c];
    setComments(updated);
    onUpdate(announcementId, updated);
    setDraft("");
  }

  function saveEdit(id) {
    if (!editText.trim()) return;
    const updated = comments.map((c) =>
      c.id === id ? { ...c, text: editText.trim() } : c,
    );
    setComments(updated);
    onUpdate(announcementId, updated);
    setEditingId(null);
  }

  function deleteComment(id) {
    const updated = comments.filter((c) => c.id !== id);
    setComments(updated);
    onUpdate(announcementId, updated);
  }

  function startEdit(c) {
    setEditingId(c.id);
    setEditText(c.text);
  }

  return (
    <div className="border-t border-slate-100 pt-4 space-y-4">
      {comments.map((c) =>
        editingId === c.id ? (
          <div key={c.id} className="flex gap-3">
            <Avatar
              initials={c.initials}
              size="sm"
              colorClass={authorColor(c.authorId)}
            />
            <div className="flex-1 space-y-2">
              <Textarea
                rows={2}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => saveEdit(c.id)}
                >
                  <Check size={12} /> Save
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <CommentItem
            key={c.id}
            c={c}
            onEdit={startEdit}
            onDelete={deleteComment}
          />
        ),
      )}

      {/* New comment */}
      <div className="flex gap-3">
        <Avatar
          initials={CURRENT_USER.initials}
          size="sm"
          colorClass={authorColor(CURRENT_USER.id)}
        />
        <div className="flex-1">
          <div className="flex gap-2">
            <Input
              className="flex-1 bg-slate-50"
              placeholder="Add a comment…"
              value={draft}
              onChange={(e) => {
                if (e.target.value.length <= MAX_COMMENT_LENGTH)
                  setDraft(e.target.value);
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              maxLength={MAX_COMMENT_LENGTH}
            />
            <Button size="icon" disabled={!draft.trim()} onClick={submit}>
              <Send size={14} />
            </Button>
          </div>
          {draft.length > 0 && (
            <p
              className={`text-xs mt-1 text-right ${remaining < 50 ? "text-amber-500" : "text-slate-400"}`}
            >
              {remaining} left
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
