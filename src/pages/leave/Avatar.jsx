import { cn, getInitials } from "./utils";

const AVATAR_COLORS = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-orange-500",
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function Avatar({ name, src, size = "md", className }) {
  const sizeMap = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base",
    xl: "w-14 h-14 text-lg",
    "2xl": "w-20 h-20 text-2xl",
  };
  const color = getAvatarColor(name || "U");
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 select-none",
        sizeMap[size] || sizeMap.md,
        color,
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        getInitials(name || "?")
      )}
    </div>
  );
}
