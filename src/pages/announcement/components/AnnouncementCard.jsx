import { useState } from "react";
import {
  Building2,
  Calendar,
  Bell,
  CheckCheck,
  Paperclip,
  Download,
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
import { ReactionsBar } from "./ReactionsBar";
import { CommentSection } from "./CommentSection";
import { CardMenu } from "./CardMenu";
import { EditModal } from "./EditModal";
import { authorColor, formatRelativeTime, formatFullDate } from "../utils";

export function AnnouncementCard({
  ann,
  onUpdateComments,
  onPin,
  onArchive,
  onUpdateAnn,
  toast,
}) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [downloadCounts, setDownloadCounts] = useState({});
  const [totalDownloads, setTotalDownloads] = useState(ann.downloads);
  const [isRead, setIsRead] = useState(!ann.unread);
  const [editOpen, setEditOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(ann.comments.length);

  const isLong = ann.description.length > 300;
  const displayText =
    isLong && !expanded ? ann.description.slice(0, 280) + "…" : ann.description;

  function handleExpand() {
    setExpanded((e) => !e);
    if (!isRead) setIsRead(true);
  }

  function handleDownload(file) {
    setDownloadCounts((prev) => ({
      ...prev,
      [file.id]: (prev[file.id] || 0) + 1,
    }));
    setTotalDownloads((prev) => prev + 1);
    toast(`Downloading ${file.name}`, "⬇️");
  }

  function handleUpdateComments(annId, comments) {
    setCommentCount(comments.length);
    onUpdateComments(annId, comments);
  }

  return (
    <>
      <Card
        className={`overflow-hidden transition-all hover:shadow-md ${ann.pinned ? "border-blue-200 ring-1 ring-blue-100" : ""}`}
      >
        {/* Pinned banner */}
        {ann.pinned && (
          <div className="flex items-center gap-2 px-5 py-2 bg-blue-50 border-b border-blue-100">
            <Pin size={11} className="text-blue-500" />
            <span className="text-xs font-semibold text-blue-600">
              Pinned announcement
            </span>
          </div>
        )}

        {/* Header */}
        <CardHeader className="px-6 pt-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <Avatar
                  initials={ann.author.initials}
                  colorClass={authorColor(ann.author.id)}
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
                  onClick={() => setIsRead(true)}
                >
                  <CheckCheck size={15} />
                </Button>
              )}
              <CardMenu
                ann={ann}
                onPin={() => {
                  onPin(ann.id);
                  toast(
                    ann.pinned ? "Unpinned" : "Pinned to top",
                    ann.pinned ? "📌" : "📌",
                  );
                }}
                onArchive={() => {
                  onArchive(ann.id);
                  toast(ann.archived ? "Unarchived" : "Archived", "🗂️");
                }}
                onEdit={() => setEditOpen(true)}
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

        {/* Priority accent */}
        {ann.priority !== "normal" && (
          <div
            className={`h-0.5 mx-6 rounded-full mb-4 ${ann.priority === "urgent" ? "bg-red-400" : "bg-amber-400"}`}
          />
        )}

        <CardContent className="px-6 pb-4 space-y-4">
          {/* Content */}
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
                className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
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

          {/* Attachments */}
          {ann.attachments.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Paperclip size={11} /> Attachments ({ann.attachments.length})
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {ann.attachments.map((file) => (
                  <AttachmentCard
                    key={file.id}
                    file={file}
                    onPreview={setPreviewFile}
                    onDownload={handleDownload}
                    downloadCount={downloadCounts[file.id] || 0}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Reactions */}
          <ReactionsBar
            annId={ann.id}
            initialReactions={ann.reactions || {}}
            onReact={(r) => toast(`Reacted with ${r.label}`, r.icon)}
          />
        </CardContent>

        {/* Footer */}
        <CardFooter className="px-6 py-3 border-t border-slate-100 flex items-center gap-4 flex-wrap">
          <ViewerAvatarStack viewers={ann.viewers || []} total={ann.views} />
          <span className="text-slate-200">·</span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Download size={13} />
            {totalDownloads.toLocaleString()}
          </span>
          <button
            onClick={() => {
              setShowComments((s) => !s);
              if (!isRead) setIsRead(true);
            }}
            className={`flex items-center gap-1.5 text-xs transition-colors ml-auto ${showComments ? "text-blue-600 font-semibold" : "text-slate-500 hover:text-slate-700"}`}
          >
            <MessageSquare size={13} />
            {commentCount} {commentCount === 1 ? "comment" : "comments"}
          </button>
        </CardFooter>

        {/* Comments */}
        {showComments && (
          <div className="px-6 pb-5">
            <CommentSection
              announcementId={ann.id}
              comments={ann.comments}
              onUpdate={handleUpdateComments}
            />
          </div>
        )}
      </Card>

      <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      {editOpen && (
        <EditModal
          ann={ann}
          onClose={() => setEditOpen(false)}
          onSave={(updated) => {
            onUpdateAnn(updated);
            toast("Announcement updated", "✏️");
          }}
        />
      )}
    </>
  );
}
