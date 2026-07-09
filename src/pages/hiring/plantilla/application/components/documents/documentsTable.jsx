import React, { useMemo, useEffect, useRef, useState } from "react";
import {
  IconChevronDown,
  IconFileText,
  IconFileTypePdf,
  IconPhoto,
  IconDownload,
  IconX,
  IconAlertTriangle,
  IconLoader2,
  IconFolderOpen,
  IconEye,
} from "@tabler/icons-react";
import { toast } from "sonner";
import api from "@/api/api";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import { candidateName } from "../psbUtils";

function formatDocKey(key) {
  return key
    .replace(/_/g, " ")
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getExt(filename = "") {
  const clean = filename.split("?")[0].split("#")[0];
  const parts = clean.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase().trim() : "";
}

const IMAGE_EXTS = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"];
const DOCX_EXTS = ["docx", "doc"];
const SHEET_EXTS = ["xlsx", "xls", "csv"];
const SLIDE_EXTS = ["pptx", "ppt"];

function getFileIcon(filename) {
  const ext = getExt(filename);
  if (ext === "pdf") {
    return {
      Icon: IconFileTypePdf,
      className: "text-rose-500",
      bg: "bg-rose-50",
    };
  }
  if (IMAGE_EXTS.includes(ext)) {
    return { Icon: IconPhoto, className: "text-sky-500", bg: "bg-sky-50" };
  }
  if (DOCX_EXTS.includes(ext)) {
    return { Icon: IconFileText, className: "text-blue-600", bg: "bg-blue-50" };
  }
  if (SHEET_EXTS.includes(ext)) {
    return {
      Icon: IconFileText,
      className: "text-emerald-600",
      bg: "bg-emerald-50",
    };
  }
  if (SLIDE_EXTS.includes(ext)) {
    return {
      Icon: IconFileText,
      className: "text-orange-500",
      bg: "bg-orange-50",
    };
  }
  return {
    Icon: IconFileText,
    className: "text-violet-500",
    bg: "bg-violet-50",
  };
}

// ── status language, defined once and reused everywhere ────────────────────
const STATUS = {
  empty: {
    dot: "bg-rose-500",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    badgeBorder: "border-rose-200",
    sectionTitle: "No documents submitted",
    sectionHint: "Nothing has been uploaded yet.",
  },
  partial: {
    dot: "bg-amber-500",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-200",
    sectionTitle: "Incomplete",
    sectionHint: "Some required documents are still missing.",
  },
  complete: {
    dot: "bg-emerald-500",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200",
    sectionTitle: "Complete",
    sectionHint: "All required documents were received.",
  },
};

function getCompletionInfo(application) {
  const required = application.posting?.required_documents ?? {};
  const requiredKeys = Object.entries(required)
    .filter(([, isRequired]) => isRequired)
    .map(([key]) => key);
  const documents = application.documents ?? [];
  const submittedKeys = documents.map((d) => d.document_key);
  const missing = requiredKeys.filter((key) => !submittedKeys.includes(key));
  const totalRequired = requiredKeys.length;
  const fulfilled = totalRequired - missing.length;

  let status = "complete";
  if (documents.length === 0) status = "empty";
  else if (missing.length > 0) status = "partial";

  return { totalRequired, fulfilled, missing, documents, status };
}

// ── one candidate's row ──────────────────────────────────────────────────
function CandidateRow({ application, isExpanded, onToggle, onOpenDoc }) {
  const { totalRequired, fulfilled, missing, documents, status } =
    getCompletionInfo(application);
  const styles = STATUS[status];

  const countLabel =
    totalRequired > 0
      ? `${fulfilled} of ${totalRequired} documents received`
      : documents.length > 0
        ? `${documents.length} document${documents.length > 1 ? "s" : ""} submitted`
        : "No documents received";

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white transition-colors ${
        isExpanded ? "border-gray-300" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <button
        onClick={onToggle}
        disabled={documents.length === 0}
        className="flex w-full items-center gap-3 p-4 text-left disabled:cursor-default"
      >
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${styles.dot}`} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-800">
            {candidateName(application.employee)}
          </p>
          <p className="truncate text-xs text-gray-500">
            {application.posting?.title ?? "—"}
            {application.posting?.base_item_number
              ? ` · ${application.posting.base_item_number}`
              : ""}
          </p>
        </div>

        <span
          className={`hidden shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium sm:inline-flex ${styles.badgeBg} ${styles.badgeText} ${styles.badgeBorder}`}
        >
          {countLabel}
        </span>

        {documents.length > 0 && (
          <IconChevronDown
            size={16}
            className={`shrink-0 text-gray-400 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {/* count label repeated on small screens, where the badge above is hidden */}
      <p
        className={`-mt-2 px-4 pb-2 text-xs font-medium sm:hidden ${styles.badgeText}`}
      >
        {countLabel}
      </p>

      {isExpanded && documents.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50/60">
          <ul className="divide-y divide-gray-100">
            {documents.map((doc) => {
              const { Icon, className, bg } = getFileIcon(
                doc.original_filename,
              );
              return (
                <li
                  key={doc.id}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${bg}`}
                  >
                    <Icon size={16} className={className} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-gray-800">
                      {doc.original_filename}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {formatDocKey(doc.document_key)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDoc(doc);
                    }}
                    className="flex shrink-0 items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  >
                    <IconEye size={13} />
                    View
                  </button>
                </li>
              );
            })}
          </ul>

          {missing.length > 0 && (
            <div className="flex items-start gap-2 border-t border-amber-200 bg-amber-50/60 px-4 py-2.5">
              <IconAlertTriangle
                size={14}
                className="mt-0.5 shrink-0 text-amber-600"
              />
              <p className="text-xs text-amber-800">
                <span className="font-medium">Still needed:</span>{" "}
                {missing.map(formatDocKey).join(", ")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Google Classroom-style attachment viewer, unchanged from the original —
// this part was already clear and didn't need reworking.
function DocumentViewerModal({
  doc,
  blobUrl,
  blob,
  mimeType,
  loading,
  onClose,
}) {
  const [docxHtml, setDocxHtml] = useState(null);
  const [docxError, setDocxError] = useState(false);
  const [docxLoading, setDocxLoading] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const ext = getExt(doc.original_filename);
  const isPdf = ext === "pdf" || mimeType === "application/pdf";
  const isImage = IMAGE_EXTS.includes(ext) || mimeType?.startsWith("image/");
  const isDocx =
    DOCX_EXTS.includes(ext) ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  useEffect(() => {
    if (!isDocx || !blob) return;
    let cancelled = false;
    setDocxLoading(true);
    setDocxError(false);
    (async () => {
      try {
        const mammoth = await import("mammoth");
        const arrayBuffer = await blob.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        if (!cancelled) setDocxHtml(result.value);
      } catch (e) {
        if (!cancelled) setDocxError(true);
      } finally {
        if (!cancelled) setDocxLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isDocx, blob]);

  const { Icon, className: iconClassName } = getFileIcon(doc.original_filename);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = doc.original_filename;
    a.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={doc.original_filename}
        className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
          <Icon size={20} className={`shrink-0 ${iconClassName}`} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-800">
              {doc.original_filename}
            </p>
            <p className="text-xs text-gray-400">
              {formatDocKey(doc.document_key)}
            </p>
          </div>
          <button
            onClick={handleDownload}
            disabled={!blobUrl}
            title="Download"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
          >
            <IconDownload size={18} />
          </button>
          <button
            onClick={onClose}
            title="Close"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center overflow-auto bg-gray-100">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <IconLoader2 size={28} className="animate-spin" />
              <span className="text-xs">Loading preview…</span>
            </div>
          ) : isPdf ? (
            <iframe
              src={blobUrl}
              title={doc.original_filename}
              className="h-full w-full border-0"
            />
          ) : isImage ? (
            <img
              src={blobUrl}
              alt={doc.original_filename}
              className="max-h-full max-w-full object-contain"
            />
          ) : isDocx ? (
            docxLoading ? (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <IconLoader2 size={28} className="animate-spin" />
                <span className="text-xs">Converting document…</span>
              </div>
            ) : docxError ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center text-gray-500">
                <IconFileText size={40} className="text-gray-300" />
                <p className="text-sm">
                  Couldn't render a preview for this file.
                </p>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
                >
                  <IconDownload size={14} />
                  Download to view
                </button>
              </div>
            ) : (
              <div className="h-full w-full overflow-auto bg-gray-100 p-6">
                <div
                  className="mx-auto max-w-3xl rounded bg-white p-10 shadow prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: docxHtml }}
                />
              </div>
            )
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-center text-gray-500">
              <IconFileText size={40} className="text-gray-300" />
              <p className="text-sm">
                No preview available for this file type.
              </p>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
              >
                <IconDownload size={14} />
                Download to view
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DocumentsTable({ applications }) {
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [viewerDoc, setViewerDoc] = useState(null);
  const [viewerBlob, setViewerBlob] = useState(null);
  const [viewerBlobUrl, setViewerBlobUrl] = useState(null);
  const [viewerMimeType, setViewerMimeType] = useState(null);
  const [viewerLoading, setViewerLoading] = useState(false);

  // Group into the three sections instead of a single sorted list —
  // each section is a plain-language answer to "who needs my attention?"
  const groups = useMemo(() => {
    const empty = [];
    const partial = [];
    const complete = [];
    for (const app of applications) {
      const { status } = getCompletionInfo(app);
      if (status === "empty") empty.push(app);
      else if (status === "partial") partial.push(app);
      else complete.push(app);
    }
    return [
      { key: "empty", applications: empty },
      { key: "partial", applications: partial },
      { key: "complete", applications: complete },
    ].filter((g) => g.applications.length > 0);
  }, [applications]);

  const toggleRow = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOpen = async (doc) => {
    setViewerDoc(doc);
    setViewerBlob(null);
    setViewerBlobUrl(null);
    setViewerMimeType(null);
    setViewerLoading(true);
    try {
      const res = await api.get(
        plantillaPostingService.documentDownloadUrl(doc.id),
        {
          responseType: "blob",
        },
      );
      const blob = new Blob([res.data], { type: res.data.type });
      setViewerBlob(blob);
      setViewerBlobUrl(URL.createObjectURL(blob));
      setViewerMimeType(res.data.type);
    } catch (err) {
      toast.error(
        err?.response?.status === 403
          ? "Not authorized to view this file."
          : "Failed to open file.",
      );
      setViewerDoc(null);
    } finally {
      setViewerLoading(false);
    }
  };

  const closeViewer = () => {
    if (viewerBlobUrl) URL.revokeObjectURL(viewerBlobUrl);
    setViewerDoc(null);
    setViewerBlob(null);
    setViewerBlobUrl(null);
    setViewerMimeType(null);
  };

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
        <IconFolderOpen size={32} className="text-gray-300" />
        <p className="text-sm text-gray-400">No applications found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const styles = STATUS[group.key];
        return (
          <div key={group.key}>
            <div className="mb-2 flex items-baseline gap-2">
              <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
              <h3 className="text-sm font-semibold text-gray-800">
                {styles.sectionTitle}
              </h3>
              <span className="text-xs text-gray-400">
                {group.applications.length}
              </span>
            </div>
            <p className="mb-3 text-xs text-gray-400">{styles.sectionHint}</p>

            <div className="space-y-2">
              {group.applications.map((application) => (
                <CandidateRow
                  key={application.id}
                  application={application}
                  isExpanded={expandedIds.has(application.id)}
                  onToggle={() => toggleRow(application.id)}
                  onOpenDoc={handleOpen}
                />
              ))}
            </div>
          </div>
        );
      })}

      {viewerDoc && (
        <DocumentViewerModal
          doc={viewerDoc}
          blob={viewerBlob}
          blobUrl={viewerBlobUrl}
          mimeType={viewerMimeType}
          loading={viewerLoading}
          onClose={closeViewer}
        />
      )}
    </div>
  );
}
