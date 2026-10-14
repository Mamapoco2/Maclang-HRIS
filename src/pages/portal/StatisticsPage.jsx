import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CENSUS } from "./data";

const Placeholder = ({ name }) => (
  <div className="rounded-xl bg-white p-8 text-center text-sm text-slate-500 ring-1 ring-slate-100">{name} information will be listed here.</div>
);

export default function StatisticsPage() {
  return (
    <section className="mx-auto max-w-4xl px-8 py-14">
      <h1 className="text-3xl font-bold text-[#0b2a5b]">Hospital Statistics and Patient Information</h1>
      <p className="mt-2 text-sm text-slate-500">Public information on our services, prices, and performance.</p>

      <Tabs defaultValue="statistics" className="mt-8">
        <TabsList className="bg-transparent p-0">
          {["statistics", "price list", "philhealth", "reports"].map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-none border-b-2 border-transparent capitalize data-[state=active]:border-[#0a4bb8] data-[state=active]:bg-transparent data-[state=active]:text-[#0a4bb8] data-[state=active]:shadow-none">{t}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="statistics">
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">Patient Census (Outpatient + Inpatient)</h2><span className="rounded border px-2 py-1 text-xs text-slate-500">2026</span></div>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={CENSUS}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="m" tickLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11}  />
                  <Tooltip /><Legend iconType="square" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="actual" name="Actual Patients" fill="#1d6ff2" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="planned" name="Target" fill="#a9c8fb" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">Sample figures. Connect to your census data to show real numbers.</p>
          </div>
        </TabsContent>
        {["price list", "philhealth", "reports"].map((t) => (<TabsContent key={t} value={t}><Placeholder name={t[0].toUpperCase() + t.slice(1)} /></TabsContent>))}
      </Tabs>
    </section>
  );
}
