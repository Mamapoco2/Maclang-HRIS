import { useRef, useState } from "react";

/**
 * Avatar preview/upload state — independent of the rest of the form, so it
 * lives in its own hook. Exposes the same handlers EmployeeHeader wired
 * directly before (click-to-upload, drag & drop, remove).
 */
export function useAvatarUpload() {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const removeAvatar = (e) => {
    e.stopPropagation();
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return {
    avatarPreview,
    avatarFile,
    isDragging,
    setIsDragging,
    fileInputRef,
    handleAvatarFile,
    removeAvatar,
  };
}
