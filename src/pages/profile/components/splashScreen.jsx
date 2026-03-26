// src/components/SplashScreen.jsx
import { useEffect, useState } from "react";
import logo from "@/assets/rmbghlogo.png";

export function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState("entering"); // entering → visible → leaving

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("visible"), 50);
    const t2 = setTimeout(() => setPhase("leaving"), 2200);
    const t3 = setTimeout(() => onDone?.(), 2900);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onDone]);

  return (
    <>
      <style>{`
        @keyframes splashLogoIn {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1);   }
        }
        @keyframes splashTextIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes splashPulse {
          0%, 100% { transform: scale(1);    opacity: 0.6; }
          50%       { transform: scale(1.15); opacity: 0;   }
        }
        @keyframes splashPulse2 {
          0%, 100% { transform: scale(1);    opacity: 0.3; }
          50%       { transform: scale(1.2);  opacity: 0;   }
        }
        @keyframes splashProgress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .splash-logo-in   { animation: splashLogoIn   600ms cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .splash-text-in-1 { animation: splashTextIn   600ms 200ms cubic-bezier(0.34,1.2,0.64,1) both; }
        .splash-text-in-2 { animation: splashTextIn   600ms 320ms cubic-bezier(0.34,1.2,0.64,1) both; }
        .splash-text-in-3 { animation: splashTextIn   500ms 460ms cubic-bezier(0.34,1.2,0.64,1) both; }
        .splash-ring-1    { animation: splashPulse    2s ease-in-out infinite; }
        .splash-ring-2    { animation: splashPulse2   2s ease-in-out infinite 0.5s; }
        .splash-progress  { animation: splashProgress 1.8s 500ms cubic-bezier(0.4,0,0.2,1) forwards; transform-origin: left; transform: scaleX(0); }
      `}</style>

      <div
        className={`
          fixed inset-0 z-[9999] flex flex-col items-center justify-center
          bg-slate-50 transition-opacity duration-700 ease-in-out
          ${phase === "leaving" ? "opacity-0 pointer-events-none" : "opacity-100"}
        `}
      >
        {/* grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,80,160,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,80,160,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* radial glow */}
        <div
          className="absolute w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(0,80,160,0.07) 0%, transparent 70%)",
          }}
        />

        {/* logo + rings */}
        <div className="relative flex items-center justify-center mb-10 splash-logo-in">
          {/* ring 1 */}
          <div className="absolute w-36 h-36 rounded-full border-2 border-blue-700/20 splash-ring-1" />
          {/* ring 2 */}
          <div className="absolute w-48 h-48 rounded-full border border-blue-700/10 splash-ring-2" />

          <img
            src={logo}
            alt="RMBGH Logo"
            className="relative z-10 w-24 h-24 object-contain drop-shadow-xl"
          />
        </div>

        {/* hospital name */}
        <div className="text-center mb-1 splash-text-in-1">
          <p
            className="text-[11px] font-semibold tracking-[0.22em] uppercase text-blue-800"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Rosario Maclang Bautista
          </p>
          <p
            className="text-[11px] font-semibold tracking-[0.22em] uppercase text-blue-800 mt-1"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            General Hospital
          </p>
        </div>

        {/* system label */}
        <p className="text-[11px] tracking-widest text-slate-400 uppercase mb-12 splash-text-in-2">
          Human Resource Information System
        </p>

        {/* progress bar */}
        <div className="w-48 h-0.5 rounded-full bg-blue-100 overflow-hidden splash-text-in-3">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-700 to-blue-400 splash-progress" />
        </div>
      </div>
    </>
  );
}
