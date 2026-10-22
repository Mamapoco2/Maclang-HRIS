// Illustrated fallback for the hero (hills + hospital building). Hidden once /portal/hero.jpg loads.
export default function HeroArt() {
  return (
    <svg viewBox="0 0 800 400" preserveAspectRatio="xMaxYMax slice" className="absolute inset-0 size-full" aria-hidden="true">
      <path d="M0 260 L150 120 L260 210 L380 90 L520 220 L650 130 L800 250 V400 H0Z" fill="#7fa9c9" opacity=".55" />
      <path d="M0 300 L120 200 L240 280 L400 170 L560 290 L700 210 L800 290 V400 H0Z" fill="#4f8a62" opacity=".8" />
      <rect y="320" width="800" height="80" fill="#2f7a46" />
      <g transform="translate(330 190)">
        <polygon points="0,40 120,0 240,40" fill="#e9edf2" stroke="#b9c3cf" />
        <rect x="10" y="40" width="220" height="14" fill="#f8fafc" stroke="#cfd7e0" />
        <rect x="10" y="54" width="220" height="80" fill="#fff" stroke="#cfd7e0" />
        {[24, 52, 80, 108, 136, 164, 192].map((x) => <rect key={x} x={x} y="54" width="8" height="80" fill="#e5e9ef" />)}
        <rect x="104" y="92" width="32" height="42" fill="#3b5b8a" />
        <rect x="112" y="10" width="16" height="4" fill="#d62839" /><rect x="118" y="4" width="4" height="16" fill="#d62839" />
        <rect x="0" y="134" width="240" height="8" fill="#d5dbe3" />
      </g>
      {[[250, 300], [610, 290], [690, 310]].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y})`}><rect x="-3" y="0" width="6" height="40" fill="#6b4a2b" /><circle cy="-6" r="22" fill="#2d8a4a" /></g>
      ))}
    </svg>
  );
}
