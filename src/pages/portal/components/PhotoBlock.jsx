import { useState } from "react";

/**
 * Gradient/illustration placeholder with an optional real photo layered on top.
 * Drop photos into public/portal/ (hero.jpg, news-1.jpg ... news-3.jpg, director.jpg);
 * if a file is missing the placeholder (and any children) stay visible.
 */
export default function PhotoBlock({ src, tone = "from-sky-200 to-emerald-200", className = "", alt = "", children }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${tone} ${className}`}>
      {children}
      {src && !broken && (
        <img src={src} alt={alt} onError={() => setBroken(true)} className="absolute inset-0 size-full object-cover" />
      )}
    </div>
  );
}
