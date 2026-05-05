// src/pages/profile/components/AvatarUpload.jsx
import { useRef, useState } from "react";
import { Camera } from "lucide-react";

/**
 * Props:
 *   onFileSelected – (file) => void  called when user picks a valid file
 */
export function AvatarUpload({ onFileSelected }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const validate = (file) => {
    if (!file) return null;
    if (!file.type.startsWith("image/")) return "Please select an image file.";
    if (file.size > 10 * 1024 * 1024) return "Image must be smaller than 10MB.";
    return null;
  };

  const processFile = (file) => {
    if (!file) return;
    const err = validate(file);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setPreview(URL.createObjectURL(file));
    onFileSelected?.(file);
  };

  const handleFileChange = (e) => {
    processFile(e.target.files?.[0]);
    e.target.value = "";
  };

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
    processFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          "relative group h-24 w-24 rounded-full border-2 border-dashed overflow-hidden bg-muted transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          isDragging
            ? "border-primary scale-105 bg-primary/10 shadow-md shadow-primary/20"
            : "border-muted-foreground/40 hover:border-primary",
        ].join(" ")}
        title="Upload profile photo"
      >
        {preview ? (
          <img
            src={preview}
            alt="Avatar preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full text-muted-foreground">
            <Camera
              className={[
                "h-6 w-6 transition-transform",
                isDragging ? "scale-110 text-primary" : "",
              ].join(" ")}
            />
            <span className="text-[10px] mt-1">
              {isDragging ? "Drop here" : "Upload photo"}
            </span>
          </div>
        )}

        {/* Hover overlay (only when preview exists and not dragging) */}
        {preview && !isDragging && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="h-5 w-5 text-white" />
          </div>
        )}

        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <Camera className="h-6 w-6 text-primary" />
          </div>
        )}
      </button>

      <p className="text-xs text-muted-foreground">
        {isDragging ? "Release to upload" : "Click or drag & drop (max 10MB)"}
      </p>

      {error && (
        <p className="text-xs text-destructive text-center max-w-[200px]">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
