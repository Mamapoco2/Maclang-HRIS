import { HOSPITAL as M } from "../data";

export default function EmployeeFooter() {
  return (
    <footer className="bg-[#0d2a52] text-slate-300">
      <div className="mx-auto flex max-w-7xl justify-between gap-4 px-8 py-5 text-[12px]">
        <span>© 2026 {M.name}. For authorized employees only.</span>
        <span>Need help? Contact the IT / HR office · {M.phone}</span>
      </div>
    </footer>
  );
}
