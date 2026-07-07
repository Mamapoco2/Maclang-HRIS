import { useState } from "react";
import {
  Building2,
  Calendar,
  Bell,
  CheckCheck,
  Paperclip,
  MessageSquare,
  Pin,
  ChevronUp,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar } from "./Avatar";
import { PriorityBadge } from "./PriorityBadge";
import { ViewerAvatarStack } from "./ViewerAvatarStack";
import { AttachmentCard, PreviewModal } from "./Attachments";
import { LinkedPostingsList } from "./LinkedPostingsList";
import { ReactionsBar } from "./ReactionsBar";
import { CommentSection } from "./CommentSection";
import { CardMenu } from "./CardMenu";
import { EditModal } from "./EditModal";
import { authorColor, formatRelativeTime, formatFullDate } from "../utils";
import { AnnouncementsApi } from "@/services/announcements";
import { useAuth } from "@/hooks/useAuth";

export function AnnouncementCard({
  ann,
  canManage,
  onPin,
  onArchive,
  onUpdateAnn,
  onDelete,
  onMarkedRead,
  toast,
}) {
  const { user: currentUser } = useAuth();
  const isOwnPost = currentUser?.id === ann.author.id;
  const isSuperAdmin = !!currentUser?.roles?.includes?.("SuperAdmin");

  const canManageThis = canManage && (isOwnPost || isSuperAdmin);

  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [attachments, setAttachments] = useState(ann.attachments);
  const [isRead, setIsRead] = useState(isOwnPost || !ann.unread);
  const [editOpen, setEditOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(ann.commentCount);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isLong = ann.description.length > 300;
  const displayText =
    isLong && !expanded ? ann.description.slice(0, 280) + "…" : ann.description;

  async function markRead() {
    if (isRead || isOwnPost) return;
    setIsRead(true);
    onMarkedRead(ann.id);
    try {
      await AnnouncementsApi.markViewed(ann.id);
    } catch {}
  }

  function handleExpand() {
    setExpanded((e) => !e);
    markRead();
  }

  return (
    <>
      <Card
        className={`overflow-hidden transition-all hover:shadow-md ${ann.pinned ? "border-blue-200 ring-1 ring-blue-100" : ""}`}
      >
        {ann.pinned && (
          <div className="flex items-center gap-2 px-5 py-2 bg-blue-50 border-b border-blue-100">
            <Pin size={11} className="text-blue-500" />
            <span className="text-xs font-semibold text-blue-600">
              Pinned announcement
            </span>
          </div>
        )}

        <CardHeader className="px-6 pt-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <Avatar
                  initials={ann.author.initials}
                  colorClass={authorColor(ann.author.id)}
                  src={ann.author.avatarUrl}
                />
                {!isRead && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-800 text-sm">
                    {ann.author.name}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Building2 size={11} />
                    {ann.author.dept}
                  </span>
                  <span className="text-slate-300">·</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-slate-400 flex items-center gap-1 cursor-default">
                        <Calendar size={11} />
                        {formatRelativeTime(ann.postedAt)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {formatFullDate(ann.postedAt)}
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                  <PriorityBadge priority={ann.priority} />
                  {!isRead && (
                    <span className="text-xs font-semibold text-blue-500 flex items-center gap-1">
                      <Bell size={10} /> New
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!isRead && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-slate-600"
                  title="Mark as read"
                  onClick={markRead}
                >
                  <CheckCheck size={15} />
                </Button>
              )}
              <CardMenu
                ann={ann}
                canManage={canManageThis}
                onPin={() => onPin(ann.id)}
                onArchive={() => onArchive(ann.id)}
                onEdit={() => setEditOpen(true)}
                onDelete={() => setConfirmDelete(true)}
                onCopyLink={() => {
                  navigator.clipboard?.writeText(
                    `${window.location.href}#${ann.id}`,
                  );
                  toast("Link copied", "🔗");
                }}
              />
            </div>
          </div>
        </CardHeader>

        {ann.priority !== "normal" && (
          <div
            className={`h-0.5 mx-6 rounded-full mb-4 ${ann.priority === "urgent" ? "bg-red-400" : "bg-amber-400"}`}
          />
        )}

        <CardContent className="px-6 pb-4 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
              {ann.title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {displayText}
            </p>
            {isLong && (
              <button
                onClick={handleExpand}
                className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {expanded ? (
                  <>
                    <ChevronUp size={12} /> Show less
                  </>
                ) : (
                  <>Read more</>
                )}
              </button>
            )}
          </div>

          {(() => {
            const postingIds =
              ann.plantillaPostingIds ??
              ann.plantilla_posting_ids ??
              ((ann.plantillaPostingId ?? ann.plantilla_posting_id)
                ? [ann.plantillaPostingId ?? ann.plantilla_posting_id]
                : []);
            return <LinkedPostingsList postingIds={postingIds} />;
          })()}

          {attachments.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Paperclip size={11} /> Attachments ({attachments.length})
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {attachments.map((file) => (
                  <AttachmentCard
                    key={file.id}
                    file={file}
                    canManage={canManageThis}
                    onPreview={setPreviewFile}
                    onDeleted={(id) =>
                      setAttachments((prev) => prev.filter((f) => f.id !== id))
                    }
                    toast={toast}
                  />
                ))}
              </div>
            </div>
          )}

          <ReactionsBar
            annId={ann.id}
            initialReactions={ann.reactions}
            initialMyReaction={ann.myReaction}
            onReact={(r) => toast(`Reacted with ${r.label}`, r.icon)}
          />
        </CardContent>

        <CardFooter className="px-6 py-3 border-t border-slate-100 flex items-center gap-4 flex-wrap">
          <ViewerAvatarStack announcementId={ann.id} total={ann.views} />
          <button
            onClick={() => {
              setShowComments((s) => !s);
              markRead();
            }}
            className={`flex items-center gap-1.5 text-xs transition-colors ml-auto ${showComments ? "text-blue-600 font-semibold" : "text-slate-500 hover:text-slate-700"}`}
          >
            <MessageSquare size={13} />
            {commentCount} {commentCount === 1 ? "comment" : "comments"}
          </button>
        </CardFooter>

        {showComments && (
          <div className="px-6 pb-5">
            <CommentSection
              announcementId={ann.id}
              onCountChange={setCommentCount}
            />
          </div>
        )}
      </Card>

      <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      {editOpen && (
        <EditModal
          ann={ann}
          onClose={() => setEditOpen(false)}
          onSave={(formData) => {
            onUpdateAnn(ann.id, formData);
            setEditOpen(false);
          }}
        />
      )}
      {confirmDelete && (
        <ConfirmDeleteDialog
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            onDelete(ann.id);
            setConfirmDelete(false);
          }}
        />
      )}
    </>
  );
}

function ConfirmDeleteDialog({ onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl p-5 w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-semibold text-slate-800 mb-1">
          Delete this announcement?
        </p>
        <p className="text-xs text-slate-500 mb-4">This cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
