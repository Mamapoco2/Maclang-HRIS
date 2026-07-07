import {
  Avatar as ShadAvatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

const SIZES = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
};

export function Avatar({ initials, size = "md", colorClass = "", src = null }) {
  return (
    <ShadAvatar className={`${SIZES[size]} flex-shrink-0`}>
      {src && <AvatarImage src={src} alt={initials || "avatar"} />}
      <AvatarFallback
        className={`${colorClass || "bg-blue-600"} text-white font-semibold`}
      >
        {initials}
      </AvatarFallback>
    </ShadAvatar>
  );
}
