import { useContext } from "react";
import { AuthContext } from "@/context/authContext";
import OrientationModule from "@/pages/orientation/orientationPage";
import { X } from "lucide-react";

export default function OrientationModal() {
  const { showOrientation, dismissOrientation } = useContext(AuthContext);

  if (!showOrientation) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        // Close if clicking the backdrop itself, not the modal content
        if (e.target === e.currentTarget) dismissOrientation();
      }}
    >
      {/* Modal container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 overflow-y-auto rounded-2xl shadow-2xl bg-slate-50">
        {/* Skip button */}
        <button
          onClick={dismissOrientation}
          className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 transition-all shadow-sm"
          title="Skip orientation"
        >
          <X size={12} />
          Skip for now
        </button>

        {/* The full orientation module rendered inside the modal */}
        <OrientationModule onComplete={dismissOrientation} />
      </div>
    </div>
  );
}
