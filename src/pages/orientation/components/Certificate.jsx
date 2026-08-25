import { Award, Star, Printer, Download, CheckCircle } from "lucide-react";

export default function Certificate({ name, postScore, dark, onFinish }) {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const certNum = `CERT-${Date.now().toString(36).toUpperCase().slice(-8)}`;

  return (
    <div className="space-y-6">
      <div
        id="certificate"
        className={`relative rounded-3xl border-2 p-10 text-center overflow-hidden shadow-2xl ${dark ? "bg-slate-800 border-violet-500/30" : "bg-gradient-to-br from-slate-50 to-white border-violet-200"}`}
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-violet-500 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-blue-500 translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-violet-400/50" />
            <Award size={36} className="text-amber-400" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-violet-400/50" />
          </div>
          <p className={`text-xs font-bold tracking-widest uppercase mb-3 ${dark ? "text-violet-400" : "text-violet-600"}`}>
            Certificate of Completion
          </p>
          <p className={`text-sm mb-4 ${dark ? "text-slate-400" : "text-slate-500"}`}>This certifies that</p>
          <h2 className="text-4xl font-black tracking-tight mb-4 bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            {name || "Participant"}
          </h2>
          <p className={`text-sm mb-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>has successfully completed</p>
          <h3 className={`text-xl font-black mb-6 ${dark ? "text-white" : "text-slate-800"}`}>RMBGH Employee Orientation Program</h3>
          <div className="flex items-center justify-center gap-8 mb-8">
            {[
              { label: "Completion Date", value: date },
              { label: "Final Score", value: postScore + "%", accent: true },
              { label: "Certificate No.", value: certNum, mono: true },
            ].map((item) => (
              <div key={item.label} className={`text-center p-4 rounded-2xl ${dark ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-200"}`}>
                <p className={`text-xs font-semibold mb-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>{item.label}</p>
                <p
                  className={`${item.accent ? "text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent" : `text-sm font-black ${item.mono ? "font-mono" : ""} ${dark ? "text-white" : "text-slate-800"}`}`}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-violet-400/30" />
            <Star size={14} className="text-amber-400" />
            <Star size={14} className="text-amber-400" />
            <Star size={14} className="text-amber-400" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-violet-400/30" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-center flex-wrap">
        <button
          onClick={() => window.print()}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${dark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-50 text-slate-700"}`}
        >
          <Printer size={14} /> Print Certificate
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all">
          <Download size={14} /> Download PDF
        </button>
        {onFinish && (
          <button
            onClick={onFinish}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
          >
            <CheckCircle size={14} /> Done — Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
