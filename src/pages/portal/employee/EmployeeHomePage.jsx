import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhotoBlock from "../shared/components/PhotoBlock";
import { QUICK_LINKS, STAFF_ANNOUNCEMENTS, STAFF_NEWS, STAFF_SYSTEMS } from "./data";

const SmartLink = ({ to, className, children }) =>
  /^https?:/.test(to) ? (
    <a href={to} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
  ) : (
    <Link to={to} className={className}>{children}</Link>
  );

function Hero() {
  return (
    <section className="bg-gradient-to-b from-sky-100 to-[#f3f6fb]">
      <div className="mx-auto max-w-screen px-15 pb-24 pt-14">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-600">
          Rosario Maclang Bautista General Hospital
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-[#0b2a5b]">
          Welcome to the <span className="text-[#0a4bb8]">Employee Portal</span>
        </h1>
        <p className="mt-3 max-w-lg text-sm text-slate-600">
          Your hub for HR services, memos, and hospital updates. Sign in to the system you need below.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {STAFF_SYSTEMS.map((s) => (
            <Button key={s.key} asChild variant={s.key === "hris" ? "default" : "outline"}
              className={s.key === "hris" ? "bg-[#0a3d91] hover:bg-[#0a4bb8]" : "bg-white/70"}>
              <SmartLink to={s.to}>
                Open {s.short} <ArrowRight className="size-4" />
              </SmartLink>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickLinks() {
  return (
    <section className="relative z-10 mx-auto -mt-14 max-w-6xl px-8">
      <div className="grid grid-cols-6 divide-x divide-slate-100 rounded-2xl bg-white p-4 shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
        {QUICK_LINKS.map(({ icon: Icon, title, desc, to }) => (
          <SmartLink key={title} to={to} className="flex flex-col items-center gap-2 px-3 py-4 text-center transition hover:bg-slate-50">
            <Icon className="size-8 text-[#0a4bb8]" strokeWidth={1.5} />
            <span className="text-[13px] font-semibold text-slate-800">{title}</span>
            <span className="text-[11px] leading-snug text-slate-500">{desc}</span>
          </SmartLink>
        ))}
      </div>
    </section>
  );
}

function NewsAndAnnouncements() {
  return (
    <section id="announcements" className="mx-auto mt-12 grid max-w-screen grid-cols-[2fr_1fr] gap-8 px-15 pb-14">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-[#0b2a5b]">Staff News and Updates</h2>
        <div className="grid grid-cols-3 gap-4">
          {STAFF_NEWS.map((n) => (
            <article key={n.title} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
              <PhotoBlock tone={n.tone} className="h-28" />
              <div className="p-4">
                <div className="flex items-center gap-2 text-[10px]">
                  <span className={`rounded px-1.5 py-0.5 font-semibold uppercase text-white ${n.color}`}>{n.tag}</span>
                  <span className="text-slate-500">{n.date}</span>
                </div>
                <h3 className="mt-2 text-sm font-semibold leading-snug text-slate-900">{n.title}</h3>
                <a href="https://ics.rmbgh.gov.ph" target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#0a4bb8]">
                  Read in ICS <ArrowUpRight className="size-3" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside>
        <h2 className="mb-4 text-lg font-semibold text-[#0b2a5b]">Announcements</h2>
        <ul className="divide-y divide-slate-100 rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-100">
          {STAFF_ANNOUNCEMENTS.map(({ icon: Icon, tint, title, date }) => (
            <li key={title} className="flex items-center gap-3 px-3 py-3">
              <span className={`grid size-9 shrink-0 place-items-center rounded-full ${tint}`}><Icon className="size-4" /></span>
              <div>
                <div className="text-[13px] font-medium text-slate-800">{title}</div>
                <div className="text-[11px] text-slate-500">{date}</div>
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}

export default function EmployeeHomePage() {
  return (
    <>
      <Hero />
      <QuickLinks />
      <NewsAndAnnouncements />
    </>
  );
}
