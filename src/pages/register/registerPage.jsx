// src/pages/register/components/registerPage.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "../../assets/rmbghlogo.png";
import RegisterForm from "./components/registerForm";
import EcgTrace from "./components/EcgTrace";

export default function RegisterPage() {
  return (
    <div className="relative flex w-full font-['Inter',sans-serif] text-[#16324A]">
      {/*
        Fonts loaded here for convenience — for production, move this
        @import (or equivalent <link> tags) into index.html instead, and
        drop it from LoginPage.jsx too so it only loads once.
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
        }
      `}</style>

      {/* LEFT — identity panel, stays in view while the form scrolls */}
      <aside className="relative hidden w-[38%] flex-col justify-between overflow-hidden bg-[#16324A] px-12 py-12 text-[#F1F4F7] lg:sticky lg:top-0 lg:flex lg:h-screen">
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
            Personnel Registration
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10 max-w-sm"
        >
          <h1 className="font-['Petrona',serif] text-[2.35rem] font-semibold leading-[1.1] tracking-tight">
            Join the
            <span className="block text-[#6FA3D8]">hospital record</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[#B9C7D6]">
            Every account starts as a request. Human Resources reviews and
            activates new personnel accounts before first sign-in.
          </p>
        </motion.div>

        <div className="relative z-10">
          <EcgTrace />
          <p className="mt-6 font-['IBM_Plex_Mono',monospace] text-xs text-[#7C93A8]">
            Human Resource Information System
          </p>
        </div>
      </aside>

      {/* RIGHT — form panel */}
      <main className="flex min-h-screen flex-1 justify-center bg-[#F1F4F7] px-6 py-12 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl"
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
                Personnel Registration
              </p>
            </div>
          </div>

          <p className="font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-[0.2em] text-[#6FA3D8]">
            Create account
          </p>
          <h2 className="mt-2 font-['Petrona',serif] text-3xl font-semibold text-[#16324A]">
            Join the team
          </h2>
          <p className="mt-2 text-sm text-[#5A7188]">
            Fill in your details below. HR will review and activate your account
            before you can sign in.
          </p>

          <div className="mt-8">
            <RegisterForm />
          </div>

          <p className="mt-6 text-center text-sm text-[#5A7188]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-[#16324A] underline decoration-[#6FA3D8] decoration-2 underline-offset-4 transition-colors hover:text-[#6FA3D8]"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-8 text-center font-['IBM_Plex_Mono',monospace] text-[11px] tracking-wide text-[#9BAAB8]">
            © {new Date().getFullYear()} Rosario Maclang Bautista General
            Hospital
          </p>
        </motion.div>
      </main>
    </div>
  );
}
