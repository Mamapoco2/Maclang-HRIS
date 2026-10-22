import { Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "../shared/StatusBadge";
import { getAvatarUrl, toTitleCase } from "../../utils/employeeDisplay";

export function EmployeeHeader({
  employee,
  formData,
  displayName,
  initials,
  departmentName,
  roleDisplay,
  activePositionLabel,
  avatarPreview,
  isDragging,
  setIsDragging,
  fileInputRef,
  handleAvatarFile,
  removeAvatar,
}) {
  const avatarSrc = avatarPreview ?? getAvatarUrl(employee?.avatar_url);
  const hasAvatar = !!avatarSrc;

  return (
    <div className="flex flex-wrap items-center gap-4 border-b py-4 pl-4 pr-14 sm:flex-nowrap sm:pl-6">
      {/* Avatar: click to choose a photo, or drop an image on it */}
      <div className="group relative shrink-0">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleAvatarFile(e.dataTransfer.files[0]);
          }}
          aria-label="Change photo"
          title="Click or drop an image to change the photo"
          className={cn(
            "relative block rounded-full outline-none transition-shadow focus-visible:ring-[3px] focus-visible:ring-ring/50",
            isDragging && "ring-[3px] ring-ring/50",
          )}
        >
          <Avatar className="size-14 border">
            {hasAvatar && (
              <AvatarImage src={avatarSrc} alt="" className="object-cover" />
            )}
            <AvatarFallback className="bg-muted text-base font-medium text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="size-4 text-white" />
          </span>
        </button>

        {hasAvatar && (
          <button
            type="button"
            onClick={removeAvatar}
            aria-label="Remove photo"
            className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-white shadow transition-colors hover:bg-destructive/90"
          >
            <X className="size-3" />
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleAvatarFile(e.target.files[0])}
        />
      </div>

      {/* Name and role */}
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-lg font-semibold leading-tight tracking-tight">
          {toTitleCase(displayName)}
        </h2>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {toTitleCase(roleDisplay)}
          {departmentName ? ` · ${departmentName}` : ""}
        </p>
        {activePositionLabel && (
          <p className="truncate text-xs text-muted-foreground">
            {activePositionLabel}
          </p>
        )}
      </div>

      {/* Employee number and status */}
      <div className="ml-auto flex shrink-0 flex-col items-end gap-1.5">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Employee no.</p>
          <p className="font-mono text-sm font-semibold">
            {formData.employeeNumber || "Not set"}
          </p>
        </div>
        {formData.status && <StatusBadge status={formData.status} />}
      </div>
    </div>
  );
}
