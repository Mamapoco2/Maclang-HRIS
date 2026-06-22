import { useState } from "react";
import { Upload, X, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileUpload({
  id,
  label,
  accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  file,
  onChange,
  className,
  compact = false,
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputId = id || `file-${label?.replace(/\s+/g, "-").toLowerCase()}`;

  const handleFile = (selected) => {
    if (selected) onChange?.(selected);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--foreground)]"
        >
          {label}
        </label>
      )}
      <div
        role="button"
        tabIndex={0}
        aria-label={label ? `Upload ${label}` : "Upload file"}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            document.getElementById(inputId)?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => document.getElementById(inputId)?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl text-center transition-colors cursor-pointer",
          compact ? "p-4" : "p-6",
          dragOver
            ? "border-[var(--primary)] bg-[var(--accent)]"
            : "border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)]/30",
          file && "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20",
        )}
      >
        <input
          id={inputId}
          type="file"
          className="hidden"
          accept={accept}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div className="text-left min-w-0">
              <p className="text-sm font-medium text-[var(--foreground)] truncate">
                {file.name}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.(null);
              }}
              className="p-1 rounded-md hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-red-600 transition-colors"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-6 h-6 text-[var(--muted-foreground)] mx-auto mb-2" />
            <p className="text-sm font-medium text-[var(--foreground)]">
              Drop file or click to upload
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              PDF, JPG, PNG, DOC up to 10MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export function MultiFileUpload({ label, files = [], onChange, className }) {
  const addFiles = (incoming) => {
    if (!incoming?.length) return;
    onChange?.([...files, ...Array.from(incoming)]);
  };

  const removeFile = (index) => {
    onChange?.(files.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
      )}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => document.getElementById("multi-file-input")?.click()}
        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)]/30 transition-colors"
      >
        <input
          id="multi-file-input"
          type="file"
          className="hidden"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={(e) => addFiles(e.target.files)}
        />
        <Upload className="w-6 h-6 text-[var(--muted-foreground)] mx-auto mb-2" />
        <p className="text-sm font-medium text-[var(--foreground)]">
          Upload supporting documents
        </p>
      </div>
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-2 p-2 rounded-lg bg-[var(--muted)]/50 text-sm"
            >
              <FileText className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
              <span className="flex-1 truncate">{f.name}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-[var(--muted-foreground)] hover:text-red-600"
                aria-label={`Remove ${f.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
