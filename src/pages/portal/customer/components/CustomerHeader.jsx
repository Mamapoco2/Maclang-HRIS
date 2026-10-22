import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "../../shared/components/Logo";
import { NAV } from "../data";

function Brand() {
  return (
    <Link to="/patients" className="flex items-center gap-3">
      <Logo />
      <div className="leading-tight">
        <div className="text-[15px] font-semibold text-[#0b2a5b]">
          Rosario Maclang Bautista
          <br />
          General Hospital
        </div>
      </div>
    </Link>
  );
}

const linkCls = ({ isActive }) =>
  `relative inline-flex items-center gap-1 py-6 text-[13px] font-medium transition-colors ${
    isActive
      ? "text-[#0a4bb8] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#0a4bb8]"
      : "text-slate-700 hover:text-[#0a4bb8]"
  }`;

export default function CustomerHeader() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-screen items-center justify-between gap-6 px-8">
        <Brand />

        <nav className="flex items-center gap-7" aria-label="Main">
          {NAV.map((item) =>
            item.children ? (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger
                  className={`relative inline-flex items-center gap-1 py-6 text-[13px] font-medium outline-none ${pathname.startsWith(item.to) ? "text-[#0a4bb8] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#0a4bb8]" : "text-slate-700 hover:text-[#0a4bb8]"}`}
                >
                  {item.label}
                  <ChevronDown className="size-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {item.children.map((c) => (
                    <DropdownMenuItem key={c} asChild>
                      <Link to={item.to}>{c}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                className={linkCls}
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label="Search"
          >
            <Search className="size-4" />
          </Button>
          <Button
            asChild
            className="bg-[#0a3d91] px-5 text-xs hover:bg-[#0a4bb8]"
          >
            <Link to="/patients/services">Book Appointment</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
