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

// ── Replace this with your actual leave-request endpoint ────────────────────
async function fetchLeaveRequest(id) {
  const res = await api.get(`/leave-requests/${id}`);
  return res?.data?.data ?? res?.data;
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

      <LeaveRequestDocument leaveRequest={leaveRequest} />
    </div>
  );
}
