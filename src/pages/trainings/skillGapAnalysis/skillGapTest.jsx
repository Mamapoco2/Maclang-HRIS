import { useState, useEffect, useRef } from "react";
import NavTabs from "./components/navTabs";
import Header from "./components/header";
import Questionnaire from "./components/questionnaire";
import GapAnalysis from "./components/gapAnalysis";
import ManagerGuide from "./components/managerGuide";
import { SKILLS } from "../../../lib/skillData";
import { CheckCircle, Download, Send, Lock } from "lucide-react";
import { skillAssessmentService } from "@/services/skillsAssesmentService";
import { getUser } from "@/lib/tokenStorage";

function skillGapTest() {
  const [activeTab, setActiveTab] = useState("questionnaire");
  const [scores, setScores] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [existingAssessment, setExistingAssessment] = useState(null);
  const [error, setError] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);

  const headerRef = useRef(null);

  // ─── Check on mount if employee already submitted ─────────────────────
  useEffect(() => {
    const checkExistingAssessment = async () => {
      const user = getUser();
      if (!user?.employee_id) {
        setCheckingStatus(false);
        return;
      }

      try {
        const response = await skillAssessmentService.getAssessmentsByEmployee(
          user.employee_id,
        );

        // Find any done assessment
        const assessments = response?.data ?? response ?? [];
        const items = Array.isArray(assessments)
          ? assessments
          : (assessments?.data ?? []);

        const done = items.find((a) => a.status === "done");

        if (done) {
          setAlreadyCompleted(true);
          setExistingAssessment(done);
          setSubmissionId(done.id);
          setSubmitted(true);
          setActiveTab("analysis");
        }
      } catch (err) {
        console.error("Error checking assessment status:", err);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkExistingAssessment();
  }, []);

  const handleScoreChange = (skillId, value) => {
    if (alreadyCompleted) return; // extra safety guard
    setScores((prev) => ({
      ...prev,
      [skillId]: value,
    }));
  };

  const completedCount = Object.keys(scores).filter(
    (key) => scores[key] > 0,
  ).length;
  const totalCount = SKILLS.length;

  const handleSubmit = async () => {
    if (alreadyCompleted) return;

    const user = getUser();

    if (!user?.employee_id) {
      alert(
        "Your account is not linked to an employee record. Please contact your administrator.",
      );
      return;
    }

    const department = localStorage.getItem("department") || "";

    if (!department) {
      alert("Please select a department in the header");
      return;
    }

    if (completedCount < totalCount) {
      alert(
        `Please complete all ${totalCount} skills before submitting. You have ${completedCount}/${totalCount} completed.`,
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await skillAssessmentService.submitAssessment({
        employee_id: user.employee_id,
        scores,
      });

      if (result.success) {
        setSubmitted(true);
        setAlreadyCompleted(true);
        setSubmissionId(result.id);
        setActiveTab("analysis");
        localStorage.removeItem("department");
        localStorage.removeItem("department_id");
      }
    } catch (err) {
      console.error("Failed to submit assessment:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit assessment. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    const user = getUser();
    const report = {
      submissionId,
      employeeName: user
        ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
        : "Employee",
      employeeId: user?.employee_id,
      submittedDate: existingAssessment?.submitted_at
        ? new Date(existingAssessment.submitted_at).toLocaleDateString()
        : new Date().toLocaleDateString(),
      scores,
      totalSkills: totalCount,
      completedSkills: completedCount,
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `skill-gap-analysis-${(report.employeeName || "employee").replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ─── Loading state while checking ─────────────────────────────────────
  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Checking assessment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header ref={headerRef} />

      <NavTabs
        active={activeTab}
        onChange={setActiveTab}
        completedCount={completedCount}
        totalCount={totalCount}
      />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === "questionnaire" && (
          <>
            {/* Already submitted banner */}
            {alreadyCompleted && (
              <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-lg flex items-start gap-3">
                <Lock className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sky-900">
                    Assessment Already Submitted
                  </p>
                  <p className="text-sky-800 text-sm mt-1">
                    You have already completed your skill assessment. Your
                    answers have been locked and cannot be changed.
                    {existingAssessment?.submitted_at && (
                      <span className="block mt-1 text-sky-700">
                        Submitted on:{" "}
                        {new Date(
                          existingAssessment.submitted_at,
                        ).toLocaleString()}
                      </span>
                    )}
                  </p>
                  <button
                    onClick={() => setActiveTab("analysis")}
                    className="mt-3 px-4 py-1.5 bg-sky-600 text-white text-sm rounded-lg hover:bg-sky-700 transition-all"
                  >
                    View My Results →
                  </button>
                </div>
              </div>
            )}

            {/* Questionnaire — disabled if already completed */}
            <div
              className={
                alreadyCompleted
                  ? "opacity-50 pointer-events-none select-none"
                  : ""
              }
            >
              <Questionnaire scores={scores} onChange={handleScoreChange} />
            </div>

            {/* Submit button — hidden if already completed */}
            {!alreadyCompleted && (
              <>
                <div className="mt-8 flex gap-3 justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={completedCount < totalCount || loading}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      completedCount < totalCount || loading
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-sky-600 text-white hover:bg-sky-700 shadow-md hover:shadow-lg active:scale-95"
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    {loading ? "Submitting..." : "Submit Assessment"}
                  </button>
                </div>

                {completedCount < totalCount && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                    Complete all {totalCount} skills to submit. Progress:{" "}
                    {completedCount}/{totalCount}
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                    {error}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === "analysis" && (
          <>
            {submitted ? (
              <>
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-900">
                      {alreadyCompleted && !submissionId
                        ? "Assessment Previously Submitted"
                        : "Assessment Submitted Successfully"}
                    </p>
                    <p className="text-emerald-800 text-sm mt-1">
                      Your skill gap analysis has been recorded in the system.
                      {submissionId && (
                        <span className="block mt-1">
                          Reference ID:{" "}
                          <span className="font-mono font-semibold">
                            {submissionId}
                          </span>
                        </span>
                      )}
                      {existingAssessment?.submitted_at && (
                        <span className="block mt-1 text-emerald-700">
                          Submitted on:{" "}
                          {new Date(
                            existingAssessment.submitted_at,
                          ).toLocaleString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <GapAnalysis scores={scores} />

                <div className="mt-8 flex gap-3 justify-end">
                  <button
                    onClick={handleDownloadReport}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md hover:shadow-lg active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    Download Report
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg p-8 shadow-sm text-center">
                <p className="text-gray-600 mb-4">
                  Please complete and submit the self-assessment questionnaire
                  first.
                </p>
                <button
                  onClick={() => setActiveTab("questionnaire")}
                  className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-all"
                >
                  Back to Assessment
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === "manager" && <ManagerGuide />}
      </main>
    </div>
  );
}

export default skillGapTest;
