import { Link, NavLink } from "react-router-dom";
import { ArrowUpRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "../../shared/components/Logo";
import { NAV, STAFF_SYSTEMS } from "../data";

const linkCls = ({ isActive }) =>
  `relative inline-flex items-center py-6 text-[13px] font-medium transition-colors ${
    isActive
      ? "text-[#0a4bb8] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#0a4bb8]"
      : "text-slate-700 hover:text-[#0a4bb8]"
  }`;

export default function EmployeeHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-screen items-center justify-between gap-6 px-8">
        <Link to="/portal" className="flex items-center gap-3">
          <Logo />
          <div className="leading-tight">
            <div className="text-[15px] font-semibold text-[#0b2a5b]">RMBGH Employee Portal</div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Lock className="size-3" /> Employees only
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-7" aria-label="Main">
          {NAV.map((n) =>
            n.to.includes("#") ? (
              <Link key={n.label} to={n.to} className={linkCls({ isActive: false })}>
                {n.label}
              </Link>
            ) : (
              <NavLink key={n.label} to={n.to} end={n.end} className={linkCls}>
                {n.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          {STAFF_SYSTEMS.map((s) => {
            const external = /^https?:/.test(s.to);
            return (
              <Button key={s.key} asChild variant={s.key === "hris" ? "default" : "outline"}
                className={s.key === "hris" ? "bg-[#0a3d91] px-5 text-xs hover:bg-[#0a4bb8]" : "gap-1 border-[#0a3d91]/30 text-xs text-[#0a3d91]"}>
                {external ? (
                  <a href={s.to} target="_blank" rel="noopener noreferrer">{s.short} <ArrowUpRight className="size-3.5" /></a>
                ) : (
                  <Link to={s.to}>{s.short}</Link>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
