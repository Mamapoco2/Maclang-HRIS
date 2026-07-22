import { useRef, useState } from "react";

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
