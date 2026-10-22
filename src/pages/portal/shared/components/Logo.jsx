import logo from "@/assets/rmbghlogo.png";

export default function Logo({ className = "size-11" }) {
  return <img src={logo} alt="RMBGH logo" className={`${className} object-contain`} />;
}
