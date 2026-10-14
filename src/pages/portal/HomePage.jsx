import { Link } from "react-router-dom";
import { ArrowRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhotoBlock from "./components/PhotoBlock";
import HeroArt from "./components/HeroArt";
import heroImg from "@/assets/hero.jpg";
import { ANNOUNCEMENTS, NEWS, QUICK_SERVICES, STATS } from "./data";

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-sky-100 to-[#f3f6fb]">
      {/* Drop public/portal/hero.jpg to replace the illustrated backdrop */}
      <div className="absolute inset-y-0 right-0 w-[68%] [mask-image:linear-gradient(to_right,transparent,black_35%)]">
        <PhotoBlock
          src={heroImg}
          tone="from-sky-200 via-sky-100 to-emerald-100"
          className="size-full"
        >
          <HeroArt />
        </PhotoBlock>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f3f6fb] to-transparent" />

      <div className="relative mx-auto max-w-screen px-15 pb-36 pt-20">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-600">
          Quality &nbsp;•&nbsp; Compassionate &nbsp;•&nbsp; Accessible
        </p>
        <h1 className="mt-4 text-5xl font-bold leading-tight text-[#0b2a5b]">
          Caring for You,
          <br /> Every Step
          <br /> Toward <span className="text-[#0a4bb8]">Better Health</span>
        </h1>
        <p className="mt-4 max-w-md text-sm text-slate-600">
          Rosario Maclang Bautista General Hospital provides trusted,
          compassionate, and accessible healthcare for every patient and family.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="bg-[#0a3d91] hover:bg-[#0a4bb8]">
            <Link to="/portal/services">
              Our Services <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="bg-white/70">
            <Link to="/portal/about">About the Hospital</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function QuickServices() {
  return (
    <section className="relative z-10 mx-auto -mt-24 max-w-6xl px-8">
      <div className="grid grid-cols-5 divide-x divide-slate-100 rounded-2xl bg-white p-4 shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
        {QUICK_SERVICES.map(({ icon: Icon, title, desc, to }) => (
          <Link
            key={title}
            to={to}
            className="group flex flex-col items-center gap-2 px-4 py-4 text-center transition hover:bg-slate-50"
          >
            <Icon className="size-8 text-[#0a4bb8]" strokeWidth={1.5} />
            <span className="text-[13px] font-semibold text-slate-800">
              {title}
            </span>
            <span className="text-[11px] leading-snug text-slate-500">
              {desc}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

const SectionHead = ({ title, to = "/portal/news" }) => (
  <div className="mb-4 flex items-end justify-between">
    <h2 className="text-lg font-semibold text-[#0b2a5b]">{title}</h2>
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-xs font-medium text-[#0a4bb8] hover:underline"
    >
      View All <ArrowRight className="size-3" />
    </Link>
  </div>
);

function NewsAndAnnouncements() {
  return (
    <section className="mx-auto mt-12 grid max-w-screen grid-cols-[2fr_1fr] gap-8 px-15">
      <div>
        <SectionHead title="Latest News and Updates" />
        <div className="grid grid-cols-3 gap-4">
          {NEWS.map((n, i) => (
            <article
              key={n.title}
              className={`overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100`}
            >
              <PhotoBlock
                src={`/portal/news-${i + 1}.jpg`}
                tone={n.tone}
                className="h-32"
              />
              <div className="p-4">
                <div className="flex items-center gap-2 text-[10px]">
                  <span
                    className={`rounded px-1.5 py-0.5 font-semibold uppercase text-white ${n.color}`}
                  >
                    {n.tag}
                  </span>
                  <span className="text-slate-500">{n.date}</span>
                </div>
                <h3 className="mt-2 text-sm font-semibold leading-snug text-slate-900">
                  {n.title}
                </h3>
                <Link
                  to="/portal/news"
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#0a4bb8]"
                >
                  Read More <ArrowRight className="size-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside>
        <SectionHead title="Announcements" />
        <ul className="divide-y divide-slate-100 rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-100">
          {ANNOUNCEMENTS.map(({ icon: Icon, tint, title, date }) => (
            <li key={title} className="flex items-center gap-3 px-3 py-3">
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-full ${tint}`}
              >
                <Icon className="size-4" />
              </span>
              <div>
                <div className="text-[13px] font-medium text-slate-800">
                  {title}
                </div>
                <div className="text-[11px] text-slate-500">{date}</div>
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}

function DirectorMessage() {
  return (
    <section className="mx-auto mt-10 max-w-screen px-15">
      <div className="grid overflow-hidden rounded-2xl bg-gradient-to-r from-sky-50 to-slate-50 ring-1 ring-slate-100 grid-cols-[260px_1fr]">
        {/* Drop public/portal/director.jpg for the portrait */}
        <PhotoBlock
          src="/portal/director.jpg"
          tone="from-blue-700 via-slate-200 to-red-600"
          className="h-full"
        />
        <div className="relative p-8">
          <Quote className="absolute -left-1 top-4 size-8 fill-[#0a4bb8]/80 text-[#0a4bb8]/80" />
          <div className="pl-8">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Message from the Medical Center Chief
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Our commitment is simple: to give every patient timely,
              compassionate, and quality care. Together with our doctors,
              nurses, and staff, we continue to improve our services so that
              every family can trust RMBGH with their health.
            </p>
            <p className="mt-4 text-sm font-semibold text-[#0b2a5b]">
              DAVE ANTHONY A. VERGARA, MD, MBAH
            </p>
            <p className="text-xs text-slate-500">
              Medical Center Chief / Hospital Director
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Glance() {
  return (
    <section className="mx-auto mt-10 max-w-6xl px-8 pb-14">
      <h2 className="mb-4 inline-block border-t-2 border-[#0a4bb8] pt-3 text-lg font-semibold text-[#0b2a5b]">
        Our Hospital at a Glance
      </h2>
      <div className="grid grid-cols-4 gap-3">
        {STATS.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-blue-50 text-[#0a4bb8]">
              <Icon className="size-6" strokeWidth={1.5} />
            </span>
            <div>
              <div className="text-xl font-bold text-slate-900">{value}</div>
              <div className="text-[11px] text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <QuickServices />
      <NewsAndAnnouncements />
      <DirectorMessage />
      <Glance />
    </>
  );
}
