// src/pages/profile/components/PdsUploadButton.jsx
import { useRef, useState, useCallback } from "react";
import { Loader2, X, FileCheck, FileSpreadsheet } from "lucide-react";
import { usePdsExtract } from "../../../hooks/Usepdsextract";

export function PdsUploadButton({ onExtracted, onError }) {
  const inputRef = useRef(null);
  const { extract, isExtracting, extractError, setExtractError } =
    usePdsExtract();

  const [isDragging, setIsDragging] = useState(false);
  const [droppedFileName, setDroppedFileName] = useState(null);

  const ACCEPTED_TYPES = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  const ACCEPTED_EXTS = /\.(xlsx|xls)$/i;

  const isValidFile = (file) =>
    ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTS.test(file.name);

  const processFile = useCallback(
    async (file) => {
      if (!file) return;
      if (!isValidFile(file)) {
        const msg =
          "Invalid file type. Please upload the official CSC PDS Excel file (.xlsx or .xls).";
        setExtractError(msg);
        onError?.(msg);
        return;
      }
      setDroppedFileName(file.name);
      try {
        const values = await extract(file);
        onExtracted?.(values);
      } catch (err) {
        setDroppedFileName(null);
        onError?.(err?.message ?? "Failed to extract PDS data.");
      }
    },
    [extract, onExtracted, onError, setExtractError],
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setExtractError(null);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  // ── FIXED: file must be assigned FIRST before any async call ─────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]; // ← FIRST
    e.target.value = ""; // reset input so same file can be re-selected
    if (!file) return;
    setExtractError(null);

    processFile(file);
  };

  return (
    <div className="w-full">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (isExtracting) return;
          setExtractError(null);
          inputRef.current?.click();
        }}
        className={[
          "relative flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-5 text-center transition-all duration-200 cursor-pointer select-none",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : isExtracting
              ? "border-muted-foreground/20 bg-muted/20 cursor-default"
              : droppedFileName && !extractError
                ? "border-green-400 bg-green-50 dark:bg-green-950/20"
                : "border-muted-foreground/25 bg-muted/30 hover:border-primary/50 hover:bg-muted/50",
        ].join(" ")}
      >
        <div
          className={[
            "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
            isDragging
              ? "bg-primary/10 text-primary"
              : droppedFileName && !isExtracting && !extractError
                ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                : "bg-muted text-muted-foreground",
          ].join(" ")}
        >
          {isExtracting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : droppedFileName && !extractError ? (
            <FileCheck className="h-4 w-4" />
          ) : (
            <FileSpreadsheet className="h-4 w-4" />
          )}
        </div>

        <div className="space-y-0.5">
          {isExtracting ? (
            <>
              <p className="text-xs font-medium text-muted-foreground animate-pulse">
                Reading your PDS file — please wait…
              </p>
              {droppedFileName && (
                <p className="text-[10px] text-muted-foreground/70 truncate max-w-[220px]">
                  {droppedFileName}
                </p>
              )}
            </>
          ) : isDragging ? (
            <p className="text-xs font-semibold text-primary">
              Drop your PDS Excel file here
            </p>
          ) : droppedFileName && !extractError ? (
            <>
              <p className="text-xs font-medium text-green-700 dark:text-green-400">
                {droppedFileName}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Click to replace
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-medium text-muted-foreground">
                <span className="text-foreground font-semibold">
                  Click to upload
                </span>{" "}
                or drag &amp; drop your PDS file
              </p>
              <p className="text-[10px] text-muted-foreground/70">
                Excel only · CSC Form 212 (Revised 2025)
              </p>
            </>
          )}
        </div>

        {isDragging && (
          <span className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-primary ring-offset-1 ring-offset-background" />
        )}
      </div>

      {/* Error display */}
      {extractError && (
        <div className="mt-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2.5 text-xs text-destructive space-y-1.5">
          <div className="flex items-start gap-2">
            <div className="flex-1 space-y-2">
              {extractError.split("\n\n").map((para, i) => (
                <p key={i} className="leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setExtractError(null);
                setDroppedFileName(null);
              }}
              className="shrink-0 opacity-70 hover:opacity-100 mt-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          {extractError.toLowerCase().includes("2025") && (
            <p className="text-[10px] text-muted-foreground border-t border-destructive/20 pt-1.5">
              💡 I-download ang pinakabagong template sa{" "}
              <a
                href="https://csc.gov.ph/2017/10/05/pds/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                csc.gov.ph
              </a>
              , punan ito, at i-upload ulit.
            </p>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
