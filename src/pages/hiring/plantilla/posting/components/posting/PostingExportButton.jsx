import React from "react";
import { Download } from "lucide-react";
import { Button } from "../ui";
import { exportPostingsToCsv } from "./postingExport";

export function PostingExportButton({ postings }) {
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => exportPostingsToCsv(postings)}
    >
      <Download className="h-4 w-4" />
      Export List
    </Button>
  );
}
