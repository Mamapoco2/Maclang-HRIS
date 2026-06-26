import { useState } from "react";
import { X, Download } from "lucide-react";

export const ExportModal = ({ onClose }) => {
  const [fmt2, setFmt] = useState("csv");
  const [opts, setOpts] = useState({ payload: true, compress: false });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Export Logs
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Format
            </p>
            <div className="grid grid-cols-4 gap-2">
              {["csv", "excel", "pdf", "json"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFmt(f)}
                  className={`py-2 rounded-lg text-xs font-semibold uppercase border transition-colors ${fmt2 === f ? "border-violet-600 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400" : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {[
              { k: "payload", l: "Include Payload" },
              { k: "compress", l: "Compress File" },
            ].map((o) => (
              <label
                key={o.k}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div
                  onClick={() => setOpts((p) => ({ ...p, [o.k]: !p[o.k] }))}
                  className={`w-9 h-5 rounded-full relative transition-colors ${opts[o.k] ? "bg-violet-600" : "bg-slate-300 dark:bg-slate-600"}`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${opts[o.k] ? "translate-x-4" : ""}`}
                  />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {o.l}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-2 px-6 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export {fmt2.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};
