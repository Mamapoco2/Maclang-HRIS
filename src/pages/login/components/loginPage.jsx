// src/pages/login/components/LoginPage.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import logo from "../../../assets/rmbghlogo.png";
import LoginForm from "./loginForm";
import LoginFooter from "./loginFooter";
import EcgTrace from "../../register/components/EcgTrace";
import { useCurrentTime } from "./useLogin";

export default function LoginPage() {
  const { formattedDate, formattedTime } = useCurrentTime();

  return (
    <div className="relative flex min-h-screen w-full font-['Inter',sans-serif] text-[#16324A]">
      {/*
        Fonts loaded here for convenience — for production, move this
        @import (or equivalent <link> tags) into index.html instead.
      */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Petrona:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

         @keyframes ecg-draw {
          to { stroke-dashoffset: -1000; }
        }
        @keyframes ecg-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes ecg-dot-pulse {
          0%, 100% { opacity: 0.5; r: 2.2px; }
          50% { opacity: 1; r: 3px; }
        }
        .ecg-path {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: ecg-draw 1.66s linear infinite;
        }
        .ecg-pulse {
          animation: ecg-glow 2.4s ease-in-out infinite;
        }
        .ecg-dot {
          animation: ecg-dot-pulse 0.83s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .ecg-path, .ecg-pulse, .ecg-dot { animation: none !important; }
        }
      `}</style>

      {/* LEFT — identity panel */}
      <aside className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-[#16324A] px-12 py-12 text-[#F1F4F7] lg:flex">
        {/* faint chart-paper grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#F1F4F7 1px, transparent 1px), linear-gradient(90deg, #F1F4F7 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center gap-3"
        >
          <img
            src={logo}
            alt="RMBGH"
            className="h-11 w-11 rounded-full object-cover ring-2 ring-[#6FA3D8]/40"
          />
          <span className="font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-[0.2em] text-[#7C93A8]">
            Staff Portal Access
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10 max-w-sm"
        >
          <h1 className="font-['Petrona',serif] text-[2.35rem] font-semibold leading-[1.1] tracking-tight">
            Rosario Maclang Bautista
            <span className="block text-[#6FA3D8]">General Hospital</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[#B9C7D6]">
            Continuity of care starts here. Sign in to reach records, schedules,
            and the tools your shift depends on.
          </p>
        </motion.div>

        {/* signature element */}
        <div className="relative z-10">
          <EcgTrace />
          <div className="mt-6 flex items-center justify-between font-['IBM_Plex_Mono',monospace] text-xs text-[#7C93A8]">
            <span>{formattedDate}</span>
            <span className="ecg-pulse text-[#6FA3D8]">{formattedTime}</span>
          </div>
        </div>
      </aside>

      {/* RIGHT — form panel */}
      <main className="flex flex-1 items-center justify-center bg-[#F1F4F7] px-6 py-12 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* compact identity, mobile only */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img
              src={logo}
              alt="RMBGH"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-[#6FA3D8]/40"
            />
            <div>
              <p className="font-['Petrona',serif] text-base font-semibold text-[#16324A]">
                RMBGH Portal
              </p>
              <p className="font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-[0.2em] text-[#7C93A8]">
                Staff Portal Access
              </p>
            </div>
          </div>

          <p className="font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-[0.2em] text-[#6FA3D8]">
            Sign in
          </p>
          <h2 className="mt-2 font-['Petrona',serif] text-3xl font-semibold text-[#16324A]">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-[#5A7188]">
            Enter your credentials to continue to your dashboard.
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-sm text-[#5A7188]">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-[#16324A] underline decoration-[#6FA3D8] decoration-2 underline-offset-4 transition-colors hover:text-[#6FA3D8]"
            >
              Create one
            </Link>
          </p>

          <LoginFooter />
        </motion.div>
      </main>
    </div>
  );
}
