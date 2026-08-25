import { Layers, BookOpen, GraduationCap, Clock, ArrowRight } from "lucide-react";

const OVERVIEW_CARDS = [
  {
    icon: BookOpen,
    label: "Learning Objectives",
    desc: "Understand RMBGH's mission, vision, core values, and policies",
    color: "from-violet-500/20 to-violet-600/10 border-violet-500/30",
    iconColor: "text-violet-400",
  },
  {
    icon: GraduationCap,
    label: "Assessments",
    desc: "The same Pre-Test and Post-Test measures your progress",
    color: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
    iconColor: "text-blue-400",
  },
  {
    icon: Clock,
    label: "Est. Duration",
    desc: "Approximately 45–60 minutes to complete",
    color: "from-teal-500/20 to-teal-600/10 border-teal-500/30",
    iconColor: "text-teal-400",
  },
];

export default function IntroSection({ name, setName, dark, card, onStart }) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase bg-violet-500/10 border border-violet-500/20 text-violet-400 mb-6">
          <Layers size={12} /> Employee Onboarding
        </div>
        <h1 className={`text-5xl font-black tracking-tight leading-none mb-4 ${dark ? "text-white" : "text-slate-900"}`}>
          RMBGH New Employee
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">Orientation</span>
        </h1>
        <p className={`text-lg max-w-xl mx-auto leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
          Welcome to Rosario Maclang Bautista General Hospital. This module will guide you through everything you need to know to start your journey with us.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {OVERVIEW_CARDS.map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl border p-5 bg-gradient-to-br ${item.color} ${dark ? "" : "!bg-none border-slate-200 bg-white"} shadow-md`}
          >
            <item.icon size={22} className={`mb-3 ${item.iconColor}`} />
            <h3 className={`font-black text-sm mb-1 ${dark ? "text-white" : "text-slate-800"}`}>{item.label}</h3>
            <p className={`text-xs leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>{item.desc}</p>
          </div>
        ))}
      </div>

      <div className={`rounded-2xl border p-6 mb-8 ${card} shadow-lg`}>
        <label className={`block text-sm font-bold mb-2 ${dark ? "text-slate-300" : "text-slate-700"}`}>
          Your Full Name (for Certificate)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Maria Santos"
          className={`w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all ${dark ? "bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:bg-white/10" : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:bg-white"}`}
        />
      </div>

      <div className="text-center">
        <button
          onClick={onStart}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-black bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] transition-all duration-200"
        >
          Start Module <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
