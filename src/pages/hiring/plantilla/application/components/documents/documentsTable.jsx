import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  IconChevronDown,
  IconChevronRight,
  IconFileText,
  IconFileTypePdf,
  IconPhoto,
  IconDownload,
  IconX,
  IconAlertTriangle,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";
import api from "@/api/api";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import { candidateName } from "../psbUtils";

function formatDocKey(key) {
  return key.replace(/_/g, " ").toUpperCase();
}

function getExt(filename = "") {
  // Strip any query string / hash and grab the last dot-segment.
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
      iconClassName: "text-rose-500",
      bgClassName: "bg-rose-50",
      accentClassName: "bg-rose-400",
    };
  }
  if (IMAGE_EXTS.includes(ext)) {
    return {
      Icon: IconPhoto,
      iconClassName: "text-sky-500",
      bgClassName: "bg-sky-50",
      accentClassName: "bg-sky-400",
    };
  }
  if (DOCX_EXTS.includes(ext)) {
    return {
      Icon: IconFileText,
      iconClassName: "text-blue-600",
      bgClassName: "bg-blue-50",
      accentClassName: "bg-blue-500",
    };
  }
  if (SHEET_EXTS.includes(ext)) {
    return {
      Icon: IconFileText,
      iconClassName: "text-emerald-600",
      bgClassName: "bg-emerald-50",
      accentClassName: "bg-emerald-500",
    };
  }
  if (SLIDE_EXTS.includes(ext)) {
    return {
      Icon: IconFileText,
      iconClassName: "text-orange-500",
      bgClassName: "bg-orange-50",
      accentClassName: "bg-orange-400",
    };
  }
  return {
    Icon: IconFileText,
    iconClassName: "text-violet-500",
    bgClassName: "bg-violet-50",
    accentClassName: "bg-violet-400",
  };
}

// Google Classroom-style attachment viewer: an in-app overlay showing the
// document itself. PDFs and images preview natively; .docx is converted to
// HTML client-side (mammoth) for a real inline preview; anything else falls
// back to a "no preview available" state with a download option.
function DocumentViewerModal({
  doc,
  blobUrl,
  blob,
  mimeType,
  loading,
  onClose,
}) {
  const dialogRef = useRef(null);
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
  // Trust the extension first since server mime types are sometimes generic
  // (e.g. application/octet-stream); fall back to the reported mime type.
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
        // mammoth converts .docx -> HTML so it can render as a real inline
        // preview. Requires the `mammoth` package to be installed.
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

  const { Icon, iconClassName } = getFileIcon(doc.original_filename);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={doc.original_filename}
        className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
      >
        {/* Header bar, Classroom-style */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
          <Icon size={20} className={`shrink-0 ${iconClassName}`} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-800">
              {doc.original_filename}
            </p>
            <p className="text-xs uppercase text-gray-400">
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

        {/* Body */}
        <div className="flex flex-1 items-center justify-center overflow-auto bg-gray-100">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <IconLoader2 size={28} className="animate-spin" />
              <span className="text-xs">LOADING PREVIEW…</span>
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
                <span className="text-xs">CONVERTING DOCUMENT…</span>
              </div>
            ) : docxError ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center text-gray-500">
                <IconFileText size={40} className="text-gray-300" />
                <p className="text-sm">
                  COULDN'T RENDER A PREVIEW FOR THIS FILE.
                </p>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
                >
                  <IconDownload size={14} />
                  DOWNLOAD TO VIEW
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
                NO PREVIEW AVAILABLE FOR THIS FILE TYPE.
              </p>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
              >
                <IconDownload size={14} />
                DOWNLOAD TO VIEW
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getMissingRequiredDocs(application) {
  const required = application.posting?.required_documents ?? {};
  const requiredKeys = Object.entries(required)
    .filter(([, isRequired]) => isRequired)
    .map(([key]) => key);

  const submittedKeys = (application.documents ?? []).map(
    (d) => d.document_key,
  );

  return requiredKeys.filter((key) => !submittedKeys.includes(key));
}

function completenessRank(application) {
  const documents = application.documents ?? [];
  if (documents.length === 0) return 0;
  if (getMissingRequiredDocs(application).length > 0) return 1;
  return 2;
}

export default function DocumentsTable({ applications }) {
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [viewerDoc, setViewerDoc] = useState(null); // the doc object being viewed
  const [viewerBlob, setViewerBlob] = useState(null);
  const [viewerBlobUrl, setViewerBlobUrl] = useState(null);
  const [viewerMimeType, setViewerMimeType] = useState(null);
  const [viewerLoading, setViewerLoading] = useState(false);

  const sortedApplications = useMemo(() => {
    return [...applications].sort(
      (a, b) => completenessRank(a) - completenessRank(b),
    );
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
        { responseType: "blob" },
      );
      const blob = new Blob([res.data], { type: res.data.type });
      setViewerBlob(blob);
      setViewerBlobUrl(URL.createObjectURL(blob));
      setViewerMimeType(res.data.type);
    } catch (err) {
      toast.error(
        err?.response?.status === 403
          ? "NOT AUTHORIZED TO VIEW THIS FILE."
          : "FAILED TO OPEN FILE.",
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

  return (
    <Card>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-10" />
              <TableHead>CANDIDATE</TableHead>
              <TableHead>ITEM NO.</TableHead>
              <TableHead>POSITION</TableHead>
              <TableHead>DOCUMENTS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedApplications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-14 text-center text-sm text-gray-400"
                >
                  NO APPLICATIONS FOUND.
                </TableCell>
              </TableRow>
            ) : (
              sortedApplications.map((application) => {
                const documents = application.documents ?? [];
                const missingDocs = getMissingRequiredDocs(application);
                const hasNoDocsAtAll = documents.length === 0;
                const isIncomplete = missingDocs.length > 0;
                const isExpanded = expandedIds.has(application.id);

                const rowBg = hasNoDocsAtAll
                  ? "bg-red-50 hover:bg-red-100"
                  : isIncomplete
                    ? "bg-amber-50 hover:bg-amber-100"
                    : "hover:bg-gray-50";

                return (
                  <React.Fragment key={application.id}>
                    <TableRow
                      className={`cursor-pointer ${rowBg}`}
                      onClick={() =>
                        documents.length > 0 && toggleRow(application.id)
                      }
                    >
                      <TableCell>
                        {documents.length > 0 &&
                          (isExpanded ? (
                            <IconChevronDown
                              size={16}
                              className="text-gray-400"
                            />
                          ) : (
                            <IconChevronRight
                              size={16}
                              className="text-gray-400"
                            />
                          ))}
                      </TableCell>
                      <TableCell className="font-medium uppercase">
                        {candidateName(application.employee)}
                      </TableCell>
                      <TableCell className="uppercase">
                        {application.posting?.base_item_number ?? "—"}
                      </TableCell>
                      <TableCell className="uppercase">
                        {application.posting?.title ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {documents.length > 0 ? (
                            <span className="text-xs text-gray-600">
                              {documents.length} DOC
                              {documents.length > 1 ? "S" : ""}
                            </span>
                          ) : (
                            <span className="text-xs italic text-gray-400">
                              NONE
                            </span>
                          )}
                          {(hasNoDocsAtAll || isIncomplete) && (
                            <span
                              className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                                hasNoDocsAtAll
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              <IconAlertTriangle size={11} />
                              {hasNoDocsAtAll
                                ? "NO DOCUMENTS"
                                : `MISSING ${missingDocs.length}`}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {isExpanded && documents.length > 0 && (
                      <TableRow className={rowBg}>
                        <TableCell />
                        <TableCell colSpan={4} className="py-3">
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {documents.map((doc) => {
                              const {
                                Icon,
                                iconClassName,
                                bgClassName,
                                accentClassName,
                              } = getFileIcon(doc.original_filename);
                              return (
                                <button
                                  key={doc.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpen(doc);
                                  }}
                                  className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-lg"
                                >
                                  {/* Colored accent bar */}
                                  <div
                                    className={`h-1.5 w-full ${accentClassName}`}
                                  />
                                  {/* Square thumbnail area */}
                                  <div
                                    className={`relative flex aspect-square w-full items-center justify-center ${bgClassName}`}
                                  >
                                    <Icon
                                      size={40}
                                      strokeWidth={1.75}
                                      className={`${iconClassName} transition-transform duration-200 group-hover:scale-110`}
                                    />
                                  </div>
                                  {/* Label footer */}
                                  <div className="border-t border-gray-100 bg-white px-2 py-1.5">
                                    <p className="truncate text-[11px] font-medium text-gray-700">
                                      {doc.original_filename}
                                    </p>
                                    <p className="truncate text-[10px] uppercase text-gray-400">
                                      {formatDocKey(doc.document_key)}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                          {missingDocs.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-amber-200 pt-2">
                              <span className="text-[10px] font-medium uppercase text-amber-700">
                                Missing:
                              </span>
                              {missingDocs.map((key) => (
                                <span
                                  key={key}
                                  className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700"
                                >
                                  {formatDocKey(key)}
                                </span>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>

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
    </Card>
  );
}
