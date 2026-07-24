// src/pages/login/components/LoginHeader.jsx
// Not used by the new split-screen LoginPage (identity now lives in the
// left panel), but restyled to match the token set in case it's reused
// elsewhere — e.g. a compact header on a password-reset screen.
export default function LoginHeader({ logo }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <img
        src={logo}
        alt="RMBGH Logo"
        className="h-16 w-16 rounded-full object-cover ring-2 ring-[#6FA3D8]/40"
      />
      <p className="font-['Petrona',serif] text-lg font-semibold text-[#16324A]">
        RMBGH Portal
      </p>
    </div>
  );
}
