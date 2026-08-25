import { useState } from "react";
import { CheckCircle, ChevronDown, ChevronRight } from "lucide-react";
import { CONTENT_TOPICS } from "../utils/contentTopics";

export default function ContentSection({ completed, onUpdate, dark }) {
  const [open, setOpen] = useState(null);

  const toggle = (id) => setOpen((p) => (p === id ? null : id));

  const markDone = (id) => {
    const next = new Set(completed);
    next.add(id);
    onUpdate(next);
  };

  const pct = Math.round((completed.size / CONTENT_TOPICS.length) * 100);

  return (
    <div>
      <div
        className={`rounded-2xl border p-5 mb-6 ${dark ? "bg-slate-800/50 border-white/10" : "bg-white border-slate-200"} shadow-lg`}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-sm font-semibold ${dark ? "text-slate-300" : "text-slate-600"}`}
          >
            Reading Progress
          </span>
          <span
            className={`text-sm font-black ${dark ? "text-white" : "text-slate-800"}`}
          >
            {completed.size}/{CONTENT_TOPICS.length} topics
          </span>
        </div>
        <div
          className={`w-full h-2 rounded-full ${dark ? "bg-white/10" : "bg-slate-100"} overflow-hidden`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="space-y-3">
        {CONTENT_TOPICS.map((topic) => {
          const Icon = topic.icon;
          const isOpen = open === topic.id;
          const done = completed.has(topic.id);
          return (
            <div
              key={topic.id}
              className={`rounded-2xl border bg-gradient-to-br overflow-hidden transition-all duration-300 shadow-md ${topic.color} ${dark ? "" : "!bg-none border-slate-200"}`}
            >
              <button
                className="w-full flex items-center gap-4 p-5 text-left"
                onClick={() => toggle(topic.id)}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${dark ? "bg-white/10" : "bg-white"} shadow-sm`}
                >
                  <Icon size={18} className={topic.iconColor} />
                </div>
                <span
                  className={`flex-1 font-bold text-sm ${dark ? "text-white" : "text-slate-800"}`}
                >
                  {topic.label}
                </span>
                {done && (
                  <CheckCircle
                    size={16}
                    className="text-emerald-400 flex-shrink-0"
                  />
                )}
                {isOpen ? (
                  <ChevronDown size={16} className="text-slate-400" />
                ) : (
                  <ChevronRight size={16} className="text-slate-400" />
                )}
              </button>
              {isOpen && (
                <div
                  className={`px-5 pb-5 border-t ${dark ? "border-white/5" : "border-slate-100"}`}
                >
                  <p
                    className={`text-sm leading-relaxed mt-4 ${dark ? "text-slate-300" : "text-slate-600"}`}
                  >
                    {topic.content}
                  </p>
                  {!done && (
                    <button
                      onClick={() => markDone(topic.id)}
                      className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
                    >
                      <CheckCircle size={12} /> Mark as Completed
                    </button>
                  )}
                  {done && (
                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      <CheckCircle size={12} /> Completed
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
