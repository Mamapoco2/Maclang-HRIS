import { useEffect, useState } from "react";
import { Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "./Avatar";
import { CommentItem } from "../CommentItem";
import { authorColor } from "../utils";
import { MAX_COMMENT_LENGTH } from "../constants";
import { AnnouncementsApi } from "@/services/announcements";
import { mapComment } from "@/lib/announcementMapper";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "./Toast";

export function CommentSection({ announcementId, onCountChange }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [draft, setDraft] = useState("");
  const [submittingDraft, setSubmittingDraft] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    AnnouncementsApi.getComments(announcementId)
      .then((data) => {
        if (cancelled) return;
        const mapped = data.map(mapComment);
        setComments(mapped);
        onCountChange?.(countAll(mapped));
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(true);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [announcementId]);

  function countAll(list) {
    return list.reduce((sum, c) => sum + 1 + c.replies.length, 0);
  }

  function errorMessage(e, fallback) {
    return e?.response?.data?.message ?? fallback;
  }

  const remaining = MAX_COMMENT_LENGTH - draft.length;

  async function submit() {
    if (!draft.trim() || draft.length > MAX_COMMENT_LENGTH || submittingDraft)
      return;
    setSubmittingDraft(true);
    try {
      const created = await AnnouncementsApi.addComment(
        announcementId,
        draft.trim(),
      );
      const mapped = mapComment(created);
      setComments((prev) => {
        const next = [...prev, mapped];
        onCountChange?.(countAll(next));
        return next;
      });
      setDraft("");
    } catch (e) {
      toast(errorMessage(e, "Couldn't post comment"), "⚠️");
    } finally {
      setSubmittingDraft(false);
    }
  }
  async function submitReply(parentId, text) {
    try {
      const created = await AnnouncementsApi.addComment(
        announcementId,
        text,
        parentId,
      );
      setComments((prev) => {
        const next = prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...c.replies, mapComment(created)] }
            : c,
        );
        onCountChange?.(countAll(next));
        return next;
      });
    } catch (e) {
      toast(errorMessage(e, "Couldn't post reply"), "⚠️");
      throw e;
    }
  }

  async function saveEdit(id) {
    if (!editText.trim() || savingEdit) return;
    setSavingEdit(true);
    try {
      const updated = await AnnouncementsApi.updateComment(id, editText.trim());
      setComments((prev) =>
        prev.map((c) => (c.id === id ? mapComment(updated) : c)),
      );
      setEditingId(null);
    } catch (e) {
      toast(errorMessage(e, "Couldn't save changes"), "⚠️");
    } finally {
      setSavingEdit(false);
    }
  }

  async function deleteComment(id) {
    try {
      await AnnouncementsApi.deleteComment(id);
      setComments((prev) => {
        const next = prev.filter((c) => c.id !== id);
        onCountChange?.(countAll(next));
        return next;
      });
    } catch (e) {
      toast(errorMessage(e, "Couldn't delete comment"), "⚠️");
    }
  }

  function startEdit(c) {
    setEditingId(c.id);
    setEditText(c.text);
  }

  if (loading) {
    return (
      <div className="border-t border-slate-100 pt-4 text-xs text-slate-400">
        Loading comments…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="border-t border-slate-100 pt-4 text-xs text-red-500">
        Couldn't load comments.{" "}
        <button
          className="underline"
          onClick={() => {
            setLoading(true);
            setLoadError(false);
            AnnouncementsApi.getComments(announcementId)
              .then((data) => {
                const mapped = data.map(mapComment);
                setComments(mapped);
                onCountChange?.(countAll(mapped));
              })
              .catch(() => setLoadError(true))
              .finally(() => setLoading(false));
          }}
        >
          Retry
        </button>
      </div>
    );
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
              src={c.authorAvatarUrl}
            />
            <div className="flex-1 space-y-2">
              <Textarea
                rows={2}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                autoFocus
                disabled={savingEdit}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => saveEdit(c.id)}
                  disabled={savingEdit}
                >
                  <Check size={12} /> {savingEdit ? "Saving…" : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs"
                  onClick={() => setEditingId(null)}
                  disabled={savingEdit}
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
            currentUserId={user.id}
            canModerate={user.hasPermission?.("announcements.manage")}
            onEdit={startEdit}
            onDelete={deleteComment}
            onReply={submitReply}
          />
        ),
      )}

      <div className="flex gap-3">
        <Avatar
          initials={user.initials}
          size="sm"
          colorClass={authorColor(user.id)}
          src={user.avatarUrl}
        />
        <div className="flex-1">
          <div className="flex gap-2">
            <Input
              className="flex-1 bg-slate-50"
              placeholder="Add a comment…"
              value={draft}
              onChange={(e) =>
                e.target.value.length <= MAX_COMMENT_LENGTH &&
                setDraft(e.target.value)
              }
              onKeyDown={(e) => e.key === "Enter" && submit()}
              maxLength={MAX_COMMENT_LENGTH}
              disabled={submittingDraft}
            />
            <Button
              size="icon"
              disabled={!draft.trim() || submittingDraft}
              onClick={submit}
            >
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
