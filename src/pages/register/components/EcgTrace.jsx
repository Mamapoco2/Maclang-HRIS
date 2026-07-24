// src/pages/login/components/EcgTrace.jsx
export default function EcgTrace() {
  return (
    <svg
      viewBox="0 0 400 60"
      className="h-14 w-full overflow-visible"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ecgFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6FA3D8" stopOpacity="0" />
          <stop offset="15%" stopColor="#6FA3D8" stopOpacity="0.35" />
          <stop offset="85%" stopColor="#6FA3D8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#BFE1FF" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* faint baseline trace, always visible */}
      <path
        d="M0,30 L14,30 Q24,18 34,30 L48,30 L52,34 L56,4 L60,46 L64,30 L78,30 Q95,16 112,30 L200,30
           L214,30 Q224,18 234,30 L248,30 L252,34 L256,4 L260,46 L264,30 L278,30 Q295,16 312,30 L400,30"
        stroke="#6FA3D8"
        strokeOpacity="0.18"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* animated sweep trace */}
      <path
        d="M0,30 L14,30 Q24,18 34,30 L48,30 L52,34 L56,4 L60,46 L64,30 L78,30 Q95,16 112,30 L200,30
           L214,30 Q224,18 234,30 L248,30 L252,34 L256,4 L260,46 L264,30 L278,30 Q295,16 312,30 L400,30"
        stroke="url(#ecgFade)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1000"
        className="ecg-path"
      />

      {/* glowing head of the trace */}
      <circle r="2.6" fill="#BFE1FF" className="ecg-dot">
        <animateMotion
          dur="1.66s"
          repeatCount="indefinite"
          path="M0,30 L14,30 Q24,18 34,30 L48,30 L52,34 L56,4 L60,46 L64,30 L78,30 Q95,16 112,30 L200,30
                L214,30 Q224,18 234,30 L248,30 L252,34 L256,4 L260,46 L264,30 L278,30 Q295,16 312,30 L400,30"
          rotate="auto"
        />
      </circle>
    </svg>
  );
}
