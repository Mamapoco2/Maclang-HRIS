// src/pages/profile/components/AvatarUpload.jsx
import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";

/**
 * Props:
 *   onFileSelected – (file) => void  called when user picks a valid file
 */
export function AvatarUpload({ onFileSelected }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be smaller than 10MB.");
      return;
    }

    setError("");
    setPreview(URL.createObjectURL(file));
    onFileSelected?.(file); // pass raw File up to the modal
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative group h-24 w-24 rounded-full border-2 border-dashed border-muted-foreground/40 overflow-hidden bg-muted hover:border-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
            <Camera className="h-6 w-6" />
            <span className="text-[10px] mt-1">Upload photo</span>
          </div>
        )}

        {preview && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="h-5 w-5 text-white" />
          </div>
        )}
      </button>

      <p className="text-xs text-muted-foreground">
        Click to upload (max 10MB)
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
