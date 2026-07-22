import { Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const hasAvatar = avatarPreview ?? employee?.avatar_url;

  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
      {/* Avatar */}
      <div
        className="relative group flex-shrink-0"
        style={{ width: 52, height: 52 }}
      >
        <div
          className="w-full h-full rounded-full overflow-hidden cursor-pointer border border-gray-200 hover:border-gray-400 transition-all duration-150"
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
          style={{
            boxShadow: isDragging ? "0 0 0 3px rgba(0,0,0,0.15)" : undefined,
          }}
        >
          {hasAvatar ? (
            <img
              src={avatarPreview ?? employee.avatar_url}
              className="w-full h-full object-cover"
              alt="avatar"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-100 text-sm font-medium text-gray-500 select-none uppercase">
              {initials}
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center pointer-events-none">
            <Camera className="w-4 h-4 text-white" />
          </div>
        </div>
        {hasAvatar && (
          <button
            type="button"
            onClick={removeAvatar}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow"
          >
            <X className="w-3 h-3" />
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

      {/* Name / role */}
      <div className="flex-1 min-w-0">
        <h2 className="text-base font-semibold text-gray-900 uppercase tracking-wide truncate leading-tight">
          {displayName}
        </h2>
        <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5 truncate">
          {roleDisplay}
          {departmentName ? ` · ${departmentName}` : ""}
        </p>
        {activePositionLabel && (
          <p className="text-[11px] text-gray-400 uppercase tracking-widest mt-0.5 truncate font-medium">
            {activePositionLabel}
          </p>
        )}
      </div>

      {/* Employee number + status badge */}
      <div className="flex-shrink-0 text-right space-y-1.5">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
            Employee No.
          </p>
          <p className="text-sm font-semibold text-gray-900 tracking-wide">
            {formData.employeeNumber || "—"}
          </p>
        </div>
        {formData.status && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full",
              formData.status === "ACTIVE"
                ? "bg-emerald-50 text-emerald-700"
                : formData.status === "INACTIVE"
                  ? "bg-gray-100 text-gray-500"
                  : "bg-red-50 text-red-600",
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                formData.status === "ACTIVE"
                  ? "bg-emerald-500"
                  : formData.status === "INACTIVE"
                    ? "bg-gray-400"
                    : "bg-red-500",
              )}
            />
            {formData.status}
          </span>
        )}
      </div>
    </div>
  );
}
