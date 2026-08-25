import { CheckCircle } from "lucide-react";
import { SECTIONS, SECTION_LABELS } from "../utils/sections";

export default function StepNav({ section, dark }) {
  const steps = SECTIONS.filter((s) => s !== "intro");

  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {steps.map((s, i) => {
        const active = s === section;
        const past = SECTIONS.indexOf(s) < SECTIONS.indexOf(section);
        return (
          <div key={s} className="flex items-center gap-1 mt-5">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                active
                  ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/30"
                  : past
                    ? dark
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : dark
                      ? "bg-white/5 text-slate-500 border border-white/10"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
              }`}
            >
              {past && <CheckCircle size={10} />}
              {SECTION_LABELS[SECTIONS.indexOf(s)]}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-4 h-px ${dark ? "bg-white/10" : "bg-slate-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
