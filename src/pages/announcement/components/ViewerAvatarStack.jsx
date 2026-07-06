import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authorColor } from "../utils";

function ViewerListModal({ viewers, total, open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b border-slate-100">
          <DialogTitle className="text-sm font-bold text-slate-800">
            Viewed by
          </DialogTitle>
          <p className="text-xs text-slate-400">
            {total.toLocaleString()} total views
          </p>
        </DialogHeader>
        <div className="overflow-y-auto max-h-72 divide-y divide-slate-50">
          {viewers.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${authorColor(v.id)}`}
              >
                {v.initials}
              </div>
              <span className="text-sm font-medium text-slate-700">
                {v.name}
              </span>
            </div>
          ))}
          {total > viewers.length && (
            <div className="px-5 py-3 text-xs text-slate-400 text-center">
              +{total - viewers.length} more people viewed this
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ViewerAvatarStack({ viewers, total }) {
  const [showModal, setShowModal] = useState(false);
  const shown = viewers.slice(0, 4);
  const overflow = total - shown.length;
  return (
    <>
      <button
        onClick={() => viewers.length > 0 && setShowModal(true)}
        className="flex items-center gap-2 group"
        title="See who viewed this"
      >
        <div className="flex items-center">
          {shown.map((v, i) => (
            <div
              key={v.id}
              className="relative"
              style={{
                marginLeft: i === 0 ? 0 : "-8px",
                zIndex: shown.length - i,
              }}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold ring-2 ring-white transition-transform group-hover:scale-110 ${authorColor(v.id)}`}
              >
                {v.initials}
              </div>
            </div>
          ))}
          {overflow > 0 && (
            <div
              className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500 ring-2 ring-white"
              style={{ marginLeft: "-8px", zIndex: 0 }}
            >
              +{overflow}
            </div>
          )}
        </div>
        <span className="text-xs text-slate-400 tabular-nums group-hover:text-slate-600 transition-colors">
          {total.toLocaleString()} views
        </span>
      </button>
      <ViewerListModal
        viewers={viewers}
        total={total}
        open={showModal}
        onOpenChange={setShowModal}
      />
    </>
  );
}
