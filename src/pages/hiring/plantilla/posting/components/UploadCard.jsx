import React, { useRef, useState } from "react";
import { Paperclip, Upload, X } from "lucide-react";

export function UploadCard({ label, file, onFile, onRemove, error }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const handleFiles = (files) => {
    const f = files?.[0];
    if (!f) return;
    onFile(f, /\.(pdf|doc|docx)$/i.test(f.name), f.size <= 10 * 1024 * 1024);
  };
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`relative rounded-lg border-2 border-dashed p-3 transition-colors ${dragOver ? "border-indigo-500 bg-indigo-50" : error ? "border-rose-300 bg-rose-50/50" : "border-slate-200 bg-slate-50"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-slate-500 ring-1 ring-slate-200">
            <Paperclip className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-700">{label}</p>
            <p className="truncate text-xs text-slate-400">
              {file ? file.name : "PDF, DOC, DOCX up to 10MB"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {file ? (
            <>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-rose-600"
                aria-label={`Remove ${label}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1 rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
