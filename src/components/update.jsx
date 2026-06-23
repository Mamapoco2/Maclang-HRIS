import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Zap,
  Shield,
  Bug,
  X,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { fetchReleases } from "@/services/releaseService";

// ─── Constants ────────────────────────────────────────────────────────────────

const PER_PAGE = 15;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatReleaseDate(isoDate) {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Derive the tag list from the report types actually present in a release.
 * Tags are only shown for non-empty sections so a "Bug Fixes" tag never
 * appears when a release contains zero bug reports.
 */
function deriveTagsFromReports(reports = []) {
  const hasBugs = reports.some((r) => r.type === "bug");
  const hasImprovements = reports.some((r) => r.type === "improvement");

  const tags = [];
  if (hasImprovements) tags.push({ label: "Improvements", color: "blue" });
  if (hasBugs) tags.push({ label: "Bug Fixes", color: "red" });
  return tags;
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const TAG_STYLES = {
  purple:
    "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300",
  blue: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300",
  green:
    "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900 text-green-700 dark:text-green-300",
  red: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300",
};

function getTagStyle(color) {
  return TAG_STYLES[color] ?? TAG_STYLES.blue;
}

function getTagIcon(label) {
  switch (label) {
    case "New Features":
      return <Sparkles className="w-4 h-4" />;
    case "Improvements":
      return <Zap className="w-4 h-4" />;
    case "Security":
      return <Shield className="w-4 h-4" />;
    case "Bug Fixes":
      return <Bug className="w-4 h-4" />;
    default:
      return null;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="font-semibold text-black dark:text-white">{label}</h3>
    </div>
  );
}

function ReportList({ items }) {
  return (
    <ul className="space-y-2 ml-6">
      {items.map((r) => (
        <li
          key={r.id}
          className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
        >
          <span className="text-gray-400 dark:text-gray-600 mr-2">•</span>
          {r.subject}
        </li>
      ))}
    </ul>
  );
}

function VersionEntry({ version, isExpanded, onToggle }) {
  const bugs = version.reports.filter((r) => r.type === "bug");
  const improvements = version.reports.filter((r) => r.type === "improvement");
  const tags = deriveTagsFromReports(version.reports);

  return (
    <div className="relative">
      {/* Timeline dot */}
      <div className="absolute left-12 top-3 w-16 flex justify-center">
        {isExpanded ? (
          <div className="w-4 h-4 rounded-full bg-black dark:bg-white ring-4 ring-white dark:ring-black" />
        ) : (
          <div className="w-3 h-3 rounded-full bg-white dark:bg-black ring-2 ring-gray-300 dark:ring-gray-700" />
        )}
      </div>

      {/* Content */}
      <div className="ml-40">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {formatReleaseDate(version.date)}
        </p>

        <button onClick={onToggle} className="text-left mb-3">
          <h2 className="text-lg font-bold text-black dark:text-white hover:opacity-70 transition">
            {version.title}
          </h2>
        </button>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, idx) => (
              <div
                key={idx}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${getTagStyle(tag.color)}`}
              >
                {getTagIcon(tag.label)}
                <span className="text-sm font-medium">{tag.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Expandable content */}
        {isExpanded && (
          <div className="space-y-6 mt-6">
            {improvements.length > 0 && (
              <div>
                <SectionHeading
                  icon={
                    <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  }
                  label="Improvements"
                />
                <ReportList items={improvements} />
              </div>
            )}

            {bugs.length > 0 && (
              <div>
                <SectionHeading
                  icon={
                    <Bug className="w-4 h-4 text-red-600 dark:text-red-400" />
                  }
                  label="Bug Fixes"
                />
                <ReportList items={bugs} />
              </div>
            )}

            {version.reports.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                No details available for this release.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function VersionSkeleton() {
  return (
    <div className="relative animate-pulse">
      <div className="absolute left-12 top-3 w-16 flex justify-center">
        <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="ml-40 space-y-2">
        <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-900" />
        <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="flex gap-2 mt-2">
          <div className="h-7 w-24 rounded-full bg-gray-100 dark:bg-gray-900" />
          <div className="h-7 w-20 rounded-full bg-gray-100 dark:bg-gray-900" />
        </div>
      </div>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }) {
  return (
    <div className="text-center py-16 space-y-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Try again
      </button>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="text-center py-16">
      <p className="text-sm text-gray-400 dark:text-gray-500">
        No releases published yet. Check back soon.
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WhatsNew() {
  const [versions, setVersions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPage = useCallback(async (page, { append = false } = {}) => {
    if (page === 1) setStatus("loading");
    else setLoadingMore(true);

    try {
      const res = await fetchReleases({ page, perPage: PER_PAGE });
      const incoming = res.data ?? [];

      setVersions((prev) => (append ? [...prev, ...incoming] : incoming));
      setCurrentPage(res.meta?.current_page ?? page);
      setLastPage(res.meta?.last_page ?? 1);
      setStatus("ready");

      // Auto-expand the latest release on first load
      if (!append && incoming.length > 0) {
        setExpandedId((prev) => prev ?? incoming[0].id);
      }
    } catch (err) {
      console.error("[WhatsNew] Failed to fetch releases:", err);
      setErrorMessage(
        err?.response?.data?.message ??
          "Could not load release notes. Check your connection and try again.",
      );
      setStatus("error");
    } finally {
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  const handleToggle = useCallback((id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleLoadMore = useCallback(() => {
    loadPage(currentPage + 1, { append: true });
  }, [currentPage, loadPage]);

  const hasMore = currentPage < lastPage;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-20">
        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-800">
          <div className="w-2 h-2 rounded-full bg-gray-800 dark:bg-gray-200" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Always up to date
          </span>
        </div>
        <h1 className="text-6xl font-bold text-black dark:text-white mb-4 tracking-tight">
          What's new?
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          The latest features, improvements, and fixes — shipped regularly.
        </p>
      </div>

      {/* Divider */}
      <div className="w-full mb-12 border-t border-gray-200 dark:border-gray-800" />

      {/* Timeline */}
      <div className="max-w-4xl mx-auto">
        {/* Error */}
        {status === "error" && (
          <ErrorState message={errorMessage} onRetry={() => loadPage(1)} />
        )}

        {/* Loading skeletons */}
        {status === "loading" && (
          <div className="relative space-y-12">
            <div className="absolute left-20 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800" />
            {[0, 1, 2].map((i) => (
              <VersionSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Ready */}
        {status === "ready" && versions.length === 0 && <EmptyState />}

        {status === "ready" && versions.length > 0 && (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-20 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800" />

            <div className="space-y-12">
              {versions.map((version) => (
                <VersionEntry
                  key={version.id}
                  version={version}
                  isExpanded={expandedId === version.id}
                  onToggle={() => handleToggle(version.id)}
                />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="mt-12 ml-40 flex">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition disabled:opacity-50"
                >
                  {loadingMore ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  {loadingMore ? "Loading…" : "Load older releases"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────

export function WhatsNewModal({ open, onClose }) {
  // Trap focus and allow Escape to close
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        // Close when clicking the backdrop, not the modal itself
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="What's New"
    >
      <div className="relative bg-white dark:bg-black rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-10">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <WhatsNew />
      </div>
    </div>
  );
}
