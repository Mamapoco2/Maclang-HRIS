// src/lib/announcementMapper.js
import { FILE_CONFIG } from ".././pages/announcement/constants";

function initialsFrom(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extFromFilename(name = "") {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

export function mapAttachment(a) {
  return {
    id: a.id,
    name: a.original_filename,
    type: extFromFilename(a.original_filename),
    size: formatBytes(a.size),
    downloadCount: a.downloads_count ?? 0,
  };
}

export function mapComment(c) {
  return {
    id: c.id,
    authorId: c.user_id,
    author: c.user?.name ?? "Unknown",
    authorAvatarUrl: c.user?.avatar_url ?? null,
    initials: initialsFrom(c.user?.name),
    text: c.body,
    postedAt: new Date(c.created_at),
    editedAt: c.edited_at ? new Date(c.edited_at) : null,
    replies: (c.replies ?? []).map(mapComment),
  };
}

export function mapAnnouncement(a) {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    priority: a.priority,
    category: a.category,
    plantillaPostingId: a.plantilla_posting_id,
    author: {
      id: a.creator?.id,
      name: a.creator?.name ?? "Unknown",
      avatarUrl: a.creator?.avatar_url ?? null,
      initials: initialsFrom(a.creator?.name),
      dept: a.creator?.department?.name ?? "—",
    },
    postedAt: new Date(a.created_at),
    views: a.views_count ?? 0,
    pinned: !!a.is_pinned,
    archived: !!a.is_archived,
    unread: !!a.unread,
    reactions: a.reactions_summary ?? {},
    myReaction: a.my_reaction ?? null,
    attachments: (a.attachments ?? []).map(mapAttachment),
    commentCount: a.comments_count ?? 0,
  };
}
