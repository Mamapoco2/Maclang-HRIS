import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SERVICE_CATEGORIES } from "./data";

export default function ServicesPage() {
  const [q, setQ] = useState("");
  const items = useMemo(() => SERVICE_CATEGORIES.filter((s) => (s.title + s.desc).toLowerCase().includes(q.toLowerCase())), [q]);
  return (
    <section className="mx-auto max-w-4xl px-8 py-14">
      <h1 className="text-3xl font-bold text-[#0b2a5b]">Hospital Services<br />Made Easier</h1>
      <p className="mt-2 text-sm text-slate-500">Find our departments, requirements, and patient guidelines anytime.</p>
      <div className="relative mt-6 max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for a service or department..." className="bg-white pl-9" />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4">
        {items.map(({ icon: Icon, title, desc, to }) => (
          <Link key={title} to={to} className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md">
            <span className="grid size-12 place-items-center rounded-lg bg-blue-50 text-[#0a4bb8]"><Icon className="size-6" strokeWidth={1.5} /></span>
            <div><div className="text-sm font-semibold">{title}</div><div className="text-xs text-slate-500">{desc}</div></div>
          </Link>
        ))}
        {!items.length && <p className="text-sm text-slate-500">No services match “{q}”.</p>}
      </div>
    </section>
  );
}
