import { Link } from "react-router-dom";
import { Clock, Facebook, Mail, MapPin, Phone, Youtube } from "lucide-react";
import Logo from "../../shared/components/Logo";
import { FOOTER_LINKS, HOSPITAL as M } from "../data";

const Col = ({ title, links }) => (
  <div>
    <h4 className="mb-3 text-sm font-semibold">{title}</h4>
    <ul className="space-y-2 text-[13px] text-slate-300">
      {links.map(([label, to]) => (
        <li key={label}>
          <Link to={to} className="hover:text-white">
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default function CustomerFooter() {
  return (
    <footer className="bg-[#0d2a52] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-[1.4fr_1fr_1fr_1.4fr] gap-10 px-8 py-12">
        <div>
          <div className="flex items-center gap-3">
            <Logo className="size-12" />
            <div className="leading-tight">
              <div className="font-semibold">{M.name}</div>
              <div className="text-xs text-slate-300">{M.tagline}</div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-[13px] text-slate-300">
            A people-centered hospital delivering quality, compassionate, and
            accessible healthcare to every patient and family.
          </p>
          <div className="mt-4 flex gap-2">
            {[Facebook, Youtube].map((I, i) => (
              <a
                key={i}
                href="#"
                aria-label="social"
                className="grid size-8 place-items-center rounded-md bg-white/10 hover:bg-white/20"
              >
                <I className="size-4" />
              </a>
            ))}
          </div>
        </div>
        <Col title="Quick Links" links={FOOTER_LINKS.quick} />
        <Col title="Patient Information" links={FOOTER_LINKS.gov} />
        <div>
          <h4 className="mb-3 text-sm font-semibold">Contact Information</h4>
          <ul className="space-y-3 text-[13px] text-slate-300">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {M.address}
            </li>
            <li className="flex gap-3">
              <Phone className="size-4 shrink-0" />
              {M.phone} · ER: {M.emergency}
            </li>
            <li className="flex gap-3">
              <Mail className="size-4 shrink-0" />
              {M.email}
            </li>
            <li className="flex gap-3">
              <Clock className="size-4 shrink-0" />
              {M.hours}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl justify-between gap-2 px-8 py-4 text-[11px] text-slate-400">
          <span>
            © 2026 Rosario Maclang Bautista General Hospital. All rights
            reserved.
          </span>
          <span className="flex gap-4">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Accessibility</a>
            <Link to="/portal">Employee Portal</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
