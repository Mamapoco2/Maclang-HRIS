import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import EmployeeHeader from "./components/EmployeeHeader";
import EmployeeFooter from "./components/EmployeeFooter";

/** Employee shell. Mounted at /portal/* inside <ProtectedRoute> (see AppRoutes). */
export default function EmployeeLayout() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return (
    <div className="flex min-h-screen min-w-full flex-col bg-[#f3f6fb] text-slate-800">
      <EmployeeHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <EmployeeFooter />
    </div>
  );
}
