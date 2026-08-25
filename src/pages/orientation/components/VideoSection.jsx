import { useState, useEffect, useRef } from "react";
import { Play, Pause, CheckCircle, Video } from "lucide-react";

export default function VideoSection({ onComplete, completed, dark }) {
  const [playing, setPlaying] = useState(false);
  const [watched, setWatched] = useState(completed ? 100 : 0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (playing && watched < 100) {
      intervalRef.current = setInterval(() => {
        setWatched((p) => {
          const next = Math.min(p + 0.5, 100);
          if (next >= 100) {
            setPlaying(false);
            onComplete();
          }
          return next;
        });
      }, 200);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, watched]);

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-xl ${dark ? "bg-slate-800/50 border-white/10" : "bg-white border-slate-200"}`}>
      <div className="relative bg-slate-900 aspect-video flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-slate-900 to-blue-900/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-8 grid-rows-5 w-full h-full opacity-10">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="border border-white/20" />
            ))}
          </div>
        </div>
        {watched >= 100 ? (
          <div className="relative flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <p className="text-white font-bold">Video Completed</p>
          </div>
        ) : (
          <div className="relative flex flex-col items-center gap-4">
            <div
              className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all shadow-2xl"
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? <Pause size={28} className="text-white" /> : <Play size={28} className="text-white ml-1" />}
            </div>
            <p className="text-white/60 text-sm font-medium">{playing ? "Simulating playback..." : "Click to play"}</p>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div className="h-full bg-gradient-to-r from-violet-400 to-blue-400 transition-all duration-300" style={{ width: `${watched}%` }} />
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className={`font-black text-lg tracking-tight ${dark ? "text-white" : "text-slate-800"}`}>
              RMBGH Orientation — Welcome Video
            </h3>
            <p className={`text-sm mt-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>
              A message from hospital leadership covering the mission, vision, and RMBGH CARES values.
            </p>
          </div>
          <span
            className={`flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full ${
              watched >= 100
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : dark
                  ? "bg-white/5 text-slate-400 border border-white/10"
                  : "bg-slate-100 text-slate-500 border border-slate-200"
            }`}
          >
            {watched >= 100 ? "Completed" : `${Math.round(watched)}%`}
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${dark ? "text-slate-400" : "text-slate-500"}`}>Watch progress</span>
          <span className={`text-xs font-semibold ${dark ? "text-slate-300" : "text-slate-600"}`}>{Math.round(watched)}% watched</span>
        </div>
        <div className={`w-full h-2 rounded-full ${dark ? "bg-white/10" : "bg-slate-100"} overflow-hidden`}>
          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-300" style={{ width: `${watched}%` }} />
        </div>
        {watched < 100 && (
          <p className={`text-xs mt-3 flex items-center gap-1.5 ${dark ? "text-amber-400/80" : "text-amber-600"}`}>
            <Video size={12} /> You must complete the video to unlock the Post-Test.
          </p>
        )}
      </div>
    </div>
  );
}
