import { CheckCircle } from "lucide-react";
import { PASS_SCORE } from "../utils/orientationQuestions";

export default function ProgressHeader({
  completedSections,
  preScore,
  videoComplete,
  postScore,
  dark,
}) {
  const total = 5;
  const done = completedSections.size;
  const pct = Math.round((done / total) * 100);

  const items = [
    {
      label: "Pre-Test",
      ok: preScore !== null,
      val: preScore !== null ? `${preScore}%` : "—",
    },
    {
      label: "Video",
      ok: videoComplete,
      val: videoComplete ? "Done" : "Pending",
    },
    {
      label: "Post-Test",
      ok: postScore !== null && postScore >= PASS_SCORE,
      val: postScore !== null ? `${postScore}%` : "—",
    },
  ];

  return (
    <div
      className={`sticky top-0 z-30 backdrop-blur-xl border-b ${dark ? "bg-slate-900/90 border-white/10" : "bg-white/90 border-slate-200"} px-6 py-3`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-xs font-semibold tracking-widest uppercase ${dark ? "text-slate-400" : "text-slate-500"}`}
          >
            Overall Progress
          </span>
          <span
            className={`text-xs font-bold tabular-nums ${dark ? "text-slate-300" : "text-slate-600"}`}
          >
            {pct}%
          </span>
        </div>
        <div
          className={`w-full h-1.5 rounded-full ${dark ? "bg-white/10" : "bg-slate-200"} overflow-hidden`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          {items.map((s) => (
            <span
              key={s.label}
              className={`text-[11px] flex items-center gap-1 font-medium ${s.ok ? "text-emerald-400" : dark ? "text-slate-500" : "text-slate-400"}`}
            >
              {s.ok ? (
                <CheckCircle size={10} />
              ) : (
                <div
                  className={`w-2 h-2 rounded-full ${dark ? "bg-slate-600" : "bg-slate-300"}`}
                />
              )}
              {s.label}: {s.val}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
