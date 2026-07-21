import { Loader2 } from "lucide-react";

export function FormLoader({ label = "Loading employee data..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin" />
      <p className="text-xs font-semibold uppercase tracking-widest">{label}</p>
    </div>
  );
}
