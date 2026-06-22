export const MAX_SIGNATURE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export function validateSignatureFile(file) {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  const isPng =
    file.type === "image/png" ||
    file.name.toLowerCase().endsWith(".png");

  if (!isPng) {
    return {
      valid: false,
      error: "Only PNG files are accepted. Please upload a transparent-background PNG signature.",
    };
  }

  if (file.size > MAX_SIGNATURE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds ${formatFileSize(MAX_SIGNATURE_SIZE_BYTES)}. Please upload a smaller PNG file.`,
    };
  }

  return { valid: true, error: null };
}

export function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatTimestamp(date) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
