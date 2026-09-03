// src/pages/leave/LeaveRequestView.jsx
//
// Full-page route view for a single leave request. Handles
// fetching/loading/error state and page chrome (Back, Print);
// the actual CS Form 6 rendering lives in LeaveRequestDocument.
//
// USAGE
//   <Route path="/leaveRequest/:id" element={<LeaveRequestView />} />
// or, if the record is already loaded by a parent:
//   <LeaveRequestView leaveRequest={record} />

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/api";
import { Button } from "@/components/ui/button";
import { IconLoader2, IconPrinter, IconArrowLeft } from "@tabler/icons-react";
import LeaveRequestDocument from "./LeaveRequestDocument";
import LeaveRequestDocumentCOS from "./LeaveRequestDocumentCOS";

// ── Replace this with your actual leave-request endpoint ────────────────────
async function fetchLeaveRequest(id) {
  const res = await api.get(`/leave-requests/${id}`);
  return res?.data?.data ?? res?.data;
}

// COS / Job Order / Consultant / Contractual staff use the simplified
// "Application for Leave (for Consultant and Contractual)" form instead
// of CS Form 6, which is reserved for regular (plantilla) employees.
const COS_KEYWORDS = [
  "contract of service",
  "cos",
  "job order",
  "consultant",
  "contractual",
];

// Every key name we've seen used for this concept across different
// PH-gov HR schemas. Add more here if your backend uses something else.
const EMPLOYMENT_TYPE_KEYS = [
  "employment_type",
  "employmentType",
  "appointment_type",
  "appointmentType",
  "appointment_status",
  "appointmentStatus",
  "nature_of_appointment",
  "natureOfAppointment",
  "personnel_type",
  "personnelType",
  "employee_type",
  "employeeType",
  "staff_type",
  "staffType",
  "contract_type",
  "contractType",
  "type_of_employment",
  "typeOfEmployment",
];

function readEmploymentTypeField(obj) {
  if (!obj || typeof obj !== "object") return undefined;
  for (const key of EMPLOYMENT_TYPE_KEYS) {
    if (obj[key]) return obj[key];
  }
  return undefined;
}

function isCosOrConsultant(leaveRequest) {
  // 1) Try known key names on the request itself, its `employee`
  //    sub-object, and a couple of other common nesting spots.
  const candidates = [
    readEmploymentTypeField(leaveRequest),
    readEmploymentTypeField(leaveRequest?.employee),
    readEmploymentTypeField(leaveRequest?.personnel),
    readEmploymentTypeField(leaveRequest?.staff),
  ].filter(Boolean);

  // 2) Fallback: scan every string value one level deep inside
  //    `employee`/`personnel`/`staff` (not the leave request's own
  //    free-text fields, to avoid false positives from remarks/reason).
  const nested =
    leaveRequest?.employee ?? leaveRequest?.personnel ?? leaveRequest?.staff;
  if (nested && typeof nested === "object") {
    Object.values(nested).forEach((v) => {
      if (typeof v === "string") candidates.push(v);
      if (Array.isArray(v))
        v.forEach((x) => typeof x === "string" && candidates.push(x));
    });
  }

  const match = candidates.find((raw) => {
    const value = String(raw).toLowerCase().trim();
    return value && COS_KEYWORDS.some((k) => value.includes(k));
  });

  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.debug(
      "[LeaveRequestView] employment type candidates:",
      candidates,
      "-> matched:",
      match ?? "(none — showing CS Form 6)",
    );
  }

  return Boolean(match);
}

export default function LeaveRequestView({ leaveRequest: leaveRequestProp }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [leaveRequest, setLeaveRequest] = useState(leaveRequestProp ?? null);
  const [loading, setLoading] = useState(!leaveRequestProp);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (leaveRequestProp) return;
    if (!id) {
      setError("No leave request specified.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await fetchLeaveRequest(id);
      if (!data) throw new Error("not found");
      setLeaveRequest(data);
    } catch (err) {
      console.error("Failed to load leave request:", err);
      setError("Unable to load this leave request.");
    } finally {
      setLoading(false);
    }
  }, [id, leaveRequestProp]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-[#5A7188]">
        <IconLoader2 size={20} className="mr-2 animate-spin" />
        Loading leave request…
      </div>
    );
  }

  if (error || !leaveRequest) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-[#5A7188]">
        <p>{error || "Leave request not found."}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <IconArrowLeft size={16} className="mr-1.5" /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-4 bg-[#F4F6F8] px-4 py-6 print:bg-white print:p-0">
      <div className="flex w-full max-w-[850px] items-center justify-between print:hidden">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <IconArrowLeft size={16} className="mr-1.5" /> Back
        </Button>
        <Button
          onClick={handlePrint}
          className="bg-[#16324A] text-white hover:bg-[#16324A]/90"
        >
          <IconPrinter size={16} className="mr-1.5" /> Print
        </Button>
      </div>

      {isCosOrConsultant(leaveRequest) ? (
        <LeaveRequestDocumentCOS leaveRequest={leaveRequest} />
      ) : (
        <LeaveRequestDocument leaveRequest={leaveRequest} />
      )}
    </div>
  );
}
