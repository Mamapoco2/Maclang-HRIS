import React from "react";
import { BriefcaseBusiness, Plus } from "lucide-react";
import { Button } from "../ui";
import { PostingExportButton } from "./PostingExportButton";

export function PostingHeader({ isAdmin, postings, onCreate }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
          <BriefcaseBusiness style={{ height: 22, width: 22 }} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {isAdmin ? "Plantilla Postings" : "Available Plantilla Items"}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {isAdmin
              ? "Post vacant plantilla items and review applicants."
              : "View and apply for available plantilla positions."}
          </p>
        </div>
      </div>
      {isAdmin && (
        <div className="flex flex-wrap items-center gap-2">
          <PostingExportButton postings={postings} />
          <Button size="sm" onClick={onCreate}>
            <Plus className="h-4 w-4" />
            New Posting
          </Button>
        </div>
      )}
    </div>
  );
}
