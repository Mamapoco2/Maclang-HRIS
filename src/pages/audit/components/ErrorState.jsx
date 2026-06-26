import { AlertTriangle, RefreshCw } from "lucide-react";

export const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-full mb-4">
      <AlertTriangle className="w-8 h-8 text-red-500" />
    </div>
    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
      Failed to load audit logs
    </h3>
    {message && (
      <p className="text-xs text-slate-400 mb-1 font-mono">{message}</p>
    )}
    <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
      Something went wrong fetching the data.
    </p>
    <div className="flex gap-2">
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Retry
      </button>
      <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
        Contact Support
      </button>
    </div>
  </div>
);
