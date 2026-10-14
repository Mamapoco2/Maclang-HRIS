import { Button } from "@/components/ui/button";

const STEPS = [
  { title: "Requirements", body: ["Valid ID (1 photocopy)", "Hospital number or admission details", "Filled-up request form", "Authorization letter (if requested by a representative)"] },
  { title: "Processing Time", body: ["1 - 2 working days"] },
  { title: "Fees", body: ["₱ 50.00"] },
];

export default function ServiceDetailsPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="text-2xl font-bold text-[#0b2a5b]">Request Medical Records</h1>
      <p className="mt-1 text-sm text-slate-500">Request online or in person at the Medical Records section. Follow the requirements below.</p>
      <ol className="mt-8 space-y-6">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-4">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#0a4bb8] text-xs font-semibold text-white">{i + 1}</span>
            <div>
              <h2 className="text-sm font-semibold">{s.title}</h2>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-600">{s.body.map((b) => <li key={b}>{b}</li>)}</ul>
            </div>
          </li>
        ))}
      </ol>
      <Button className="mt-10 w-full bg-[#0a3d91] hover:bg-[#0a4bb8]">Submit Request</Button>
    </section>
  );
}
