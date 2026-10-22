import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import CustomerHeader from "./components/CustomerHeader";
import CustomerFooter from "./components/CustomerFooter";

/** Public shell for the customer (patient & visitor) site. Mounted at /patients/* (no login). */
export default function CustomerLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="flex min-h-screen min-w-full flex-col bg-[#f3f6fb] text-slate-800">
      <CustomerHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <CustomerFooter />
    </div>
  );
}
