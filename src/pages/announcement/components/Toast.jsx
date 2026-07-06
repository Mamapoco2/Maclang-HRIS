import { toast as sonnerToast, Toaster } from "sonner";

// Re-export shadcn's Toaster so the page only needs one import.
export { Toaster };

// Thin wrapper so call sites can keep doing toast("message", "emoji")
// instead of learning sonner's richer API.
export function useToast() {
  function toast(message, icon = null) {
    sonnerToast(message, {
      icon: icon ? <span className="text-base leading-none">{icon}</span> : undefined,
    });
  }
  return { toast };
}
