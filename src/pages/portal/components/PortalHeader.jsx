import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronDown,
  Lock,
  MessagesSquare,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "./Logo";
import { NAV, STAFF_SYSTEMS } from "../data";

const ICONS = { users: Users, messages: MessagesSquare };

function StaffAccess() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-[#0a3d91]/30 text-xs text-[#0a3d91]"
        >
          <Lock className="size-3.5" /> Staff Access{" "}
          <ChevronDown className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <DropdownMenuLabel className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
          RMBGH employees only
        </DropdownMenuLabel>
        {STAFF_SYSTEMS.map((s) => {
          const Icon = ICONS[s.icon];
          const external = /^https?:/.test(s.to);
          const body = (
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-[#0a4bb8]">
                <Icon className="size-5" strokeWidth={1.6} />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                  {s.short} <ArrowUpRight className="size-3.5 text-slate-400" />
                </div>
                <div className="text-xs font-medium text-slate-700">
                  {s.name}
                </div>
                <div className="mt-0.5 text-[11px] leading-snug text-slate-500">
                  {s.desc}
                </div>
              </div>
            </div>
          );
          return (
            <DropdownMenuItem
              key={s.key}
              asChild
              className="cursor-pointer rounded-lg p-2.5"
            >
              {external ? (
                <a href={s.to} target="_blank" rel="noopener noreferrer">
                  {body}
                </a>
              ) : (
                <Link to={s.to}>{body}</Link>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Brand() {
  return (
    <Link to="/portal" className="flex items-center gap-3">
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

export default function PortalHeader() {
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
          <StaffAccess />
          <Button
            asChild
            className="bg-[#0a3d91] px-5 text-xs hover:bg-[#0a4bb8]"
          >
            <Link to="/portal/services">Book Appointment</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
