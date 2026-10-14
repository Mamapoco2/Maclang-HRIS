import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import PortalHeader from "./components/PortalHeader";
import PortalFooter from "./components/PortalFooter";

/** Public shell for the RMBGH hospital website. Mounted at /portal/* (no auth required). */
export default function PortalLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="flex min-h-screen min-w-full flex-col bg-[#f3f6fb] text-slate-800">
      <PortalHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PortalFooter />
    </div>
  );
}
