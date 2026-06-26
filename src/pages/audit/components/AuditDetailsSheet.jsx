import {
  X,
  Tag,
  Hash,
  FileText,
  Globe,
  Monitor,
  Cpu,
  Clock,
} from "lucide-react";
import { Avatar, StatusBadge, SeverityBadge, InfoRow } from "./Badges";
import { fmtFull, parseBrowser, parseOS } from "@/utils/formatters";

export const AuditDetailsSheet = ({ log, onClose }) => {
  if (!log) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Log Details
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">#{log.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-6 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={log.status} />
            <SeverityBadge severity={log.severity} />
            <span className="text-xs text-slate-500 ml-auto whitespace-nowrap">
              {fmtFull(log.timestamp)}
            </span>
          </div>
          <section>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              Event
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              <span className="font-mono text-sm font-bold text-violet-700 dark:text-violet-400">
                {log.action}
              </span>
              <div className="text-xs text-slate-500 mt-1">
                Module: <span className="font-semibold">{log.module}</span> ·
                Event: <span className="font-semibold">{log.event}</span>
              </div>
            </div>
          </section>
          <section>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              User
            </h3>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              <Avatar name={log.username} size="md" />
              <div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {log.username}
                </div>
                <div className="text-xs text-slate-500">
                  user_id: #{log.userId}
                </div>
              </div>
            </div>
          </section>
          <section>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              Subject
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow
                icon={Tag}
                label="subject_type"
                value={log.subjectType}
              />
              <InfoRow
                icon={Hash}
                label="subject_id"
                value={log.subjectId ? `#${log.subjectId}` : null}
              />
              <InfoRow
                icon={FileText}
                label="subject_label"
                value={log.subjectLabel}
              />
            </div>
          </section>
          <section>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              Technical
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow icon={Globe} label="ip_address" value={log.ipAddress} />
              <InfoRow
                icon={Monitor}
                label="Browser"
                value={parseBrowser(log.userAgent)}
              />
              <InfoRow icon={Cpu} label="OS" value={parseOS(log.userAgent)} />
              <InfoRow
                icon={Clock}
                label="performed_at"
                value={fmtFull(log.timestamp)}
              />
            </div>
          </section>
          <section>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              user_agent
            </h3>
            <p className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg p-3 break-all leading-relaxed">
              {log.userAgent || "—"}
            </p>
          </section>
          {log.payload && (
            <section>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                payload
              </h3>
              <pre className="bg-slate-950 text-emerald-400 text-xs rounded-lg p-4 overflow-x-auto font-mono leading-relaxed">
                {JSON.stringify(log.payload, null, 2)}
              </pre>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
