import { useRef, useState } from "react";
import {
  Upload,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  validateSignatureFile,
  formatFileSize,
  formatTimestamp,
} from "@/utils/signatureValidation";
import { toast } from "sonner";

const STATUS_LABELS = {
  idle: "Not uploaded",
  uploading: "Uploading…",
  success: "Uploaded",
  error: "Upload failed",
};

export function SignatureUploadCard({
  title,
  description,
  label,
  signature,
  previewUrl,
  busy,
  onUpload,
  onDelete,
}) {
  const fileRef = useRef(null);
  const [error, setError] = useState(null);

  const uploadedAt = signature?.uploadedAt ?? null;
  const fileSize = signature?.fileSize ?? null;
  const fileName = signature?.fileName ?? null;
  const isUploading = busy === "uploading";
  const isDeleting = busy === "deleting";

  const handleFileSelect = async (file) => {
    if (!file) return;

    const validation = validateSignatureFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError(null);

    try {
      await onUpload?.(file);
      toast.success(`${label} saved`, { description: file.name });
    } catch (err) {
      const message =
        err?.response?.data?.errors?.signature?.[0] ??
        err?.response?.data?.message ??
        "Something went wrong while uploading. Please try again.";
      setError(message);
      toast.error("Upload failed", { description: message });
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
    e.target.value = "";
  };

  const handleDelete = async () => {
    setError(null);
    try {
      await onDelete?.();
      toast.success(`${label} removed`);
    } catch (err) {
      const message =
        err?.response?.data?.message ?? "Unable to delete this signature.";
      setError(message);
      toast.error("Delete failed", { description: message });
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const displayStatus = error
    ? "error"
    : signature
      ? "success"
      : isUploading
        ? "uploading"
        : "idle";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="w-4 h-4 text-primary" />
              {title}
            </CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <Badge
            variant={
              displayStatus === "success"
                ? "default"
                : displayStatus === "error"
                  ? "destructive"
                  : "secondary"
            }
            className="text-[10px] shrink-0"
          >
            {STATUS_LABELS[displayStatus]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="rounded-xl border border-border overflow-hidden"
          aria-label={`${label} preview`}
        >
          <div
            className="relative h-64 sm:h-72 flex items-center justify-center p-6"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
              backgroundColor: "#f8fafc",
            }}
          >
            {isUploading ? (
              <div className="text-center text-muted-foreground">
                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p className="text-sm">Uploading…</p>
              </div>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt={`${label} preview`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No signature uploaded</p>
                <p className="text-xs mt-0.5">
                  PNG with transparent background
                </p>
              </div>
            )}
          </div>
          <div className="px-4 py-2.5 bg-muted/50 border-t border-border flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{label}</span>
            {fileName && <span>{fileName}</span>}
            {fileSize != null && <span>{formatFileSize(fileSize)}</span>}
            {uploadedAt && <span>Updated {formatTimestamp(uploadedAt)}</span>}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {signature && !error && !isUploading && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            Signature saved successfully
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isUploading || isDeleting}
            onClick={() => fileRef.current?.click()}
          >
            {signature ? (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                Replace
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                Upload PNG
              </>
            )}
          </Button>
          {signature && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive"
              disabled={isUploading || isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Delete
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Accepted format: PNG only · Max {formatFileSize(2 * 1024 * 1024)} ·
          Transparent background recommended
        </p>

        <input
          ref={fileRef}
          type="file"
          accept=".png,image/png"
          className="hidden"
          onChange={handleInputChange}
          aria-label={`Upload ${label}`}
        />
      </CardContent>
    </Card>
  );
}
