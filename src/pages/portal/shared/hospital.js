import { Bed, Building2, Smile, Stethoscope } from "lucide-react";

export const HOSPITAL = {
  name: "Rosario Maclang Bautista General Hospital",
  short: "RMBGH",
  tagline: "Quality • Compassionate • Accessible",
  email: "rmbgh@quezoncity.gov.ph", // TODO: replace with real contact details
  phone: "8835-2560",
  emergency: "(000) 000-0000",
  address: "IBP Road Batasan Hills, Quezon City, Philippines",
  hours: "OPD: Mon - Fri, 8:00 AM - 5:00 PM  |  Emergency: 24/7",
};

export const STATS = [
  { icon: Bed, value: "200", label: "Bed Capacity" },
  { icon: Stethoscope, value: "150+", label: "Doctors & Specialists" },
  { icon: Building2, value: "25", label: "Departments" },
  { icon: Smile, value: "98%", label: "Patient Satisfaction" },
];

// Sample figures (patients per month) — connect to real census data later.
export const CENSUS = [
  { m: "Jan", actual: 5200, planned: 5000 },
  { m: "Feb", actual: 4800, planned: 5000 },
  { m: "Mar", actual: 5600, planned: 5200 },
  { m: "Apr", actual: 5100, planned: 5200 },
  { m: "May", actual: 5900, planned: 5400 },
  { m: "Jun", actual: 5300, planned: 5400 },
  { m: "Jul", actual: 6200, planned: 5600 },
  { m: "Aug", actual: 5800, planned: 5600 },
  { m: "Sep", actual: 6000, planned: 5800 },
  { m: "Oct", actual: 5700, planned: 5800 },
  { m: "Nov", actual: 6500, planned: 6000 },
  { m: "Dec", actual: 6300, planned: 6000 },
];
