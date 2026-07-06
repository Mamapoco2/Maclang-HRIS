import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIPCRForm } from "@/hooks/useIPCRForm";
import {
  EmployeeInfoSection,
  SignatureBlock,
  ReviewApprovalSection,
  DiscussionAssessmentSection,
  LegendSection,
} from "../ipcr/components/formSection/formSections";
import { FunctionsSection } from "../ipcr/components/tableComponents/functionsSection";
import { printStyles } from "../../../utils/printStyles";

export default function IPCRForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const {
    employeeInfo,
    coreFunctions,
    supportFunctions,
    setEmployeeInfo,
    updateRow,
    updateRowWithComputation,
    addRow,
    removeRow,
    part1,
    part2,
    totalRating,
    getSubmitPayload,
  } = useIPCRForm(id);

  const handleSubmit = () => {
    const payload = getSubmitPayload();

    if (isEdit) {
      // console.log("Updating IPCR", payload);
    } else {
      // console.log("Creating IPCR", payload);
    }

    navigate("/spms/ipcr");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{printStyles}</style>

      <div className="min-h-screen bg-gray-100 py-8 px-4 font-serif text-black selection:bg-blue-200 selection:text-black">
        <div className="bg-white p-8 md:p-12 print-container">
          {/* TITLE */}
          <div className="text-center font-bold mb-6">
            <h1 className="text-xl tracking-wide">
              INDIVIDUAL PERFORMANCE COMMITMENT AND REVIEW (IPCR)
            </h1>
          </div>

          {/* EMPLOYEE INFO SECTION */}
          <EmployeeInfoSection
            employeeInfo={employeeInfo}
            onInfoChange={setEmployeeInfo}
          />

          {/* SIGNATURE BLOCK */}
          <SignatureBlock />

          {/* REVIEW/APPROVAL SECTION */}
          <ReviewApprovalSection />

          {/* FUNCTIONS TABLE (Core + Support + Ratings) */}
          <FunctionsSection
            coreFunctions={coreFunctions}
            supportFunctions={supportFunctions}
            onUpdateRow={updateRow}
            onUpdateWithComputation={updateRowWithComputation}
            onAddRow={addRow}
            onRemoveRow={removeRow}
            part1={part1}
            part2={part2}
            totalRating={totalRating}
          />

          {/* DISCUSSION/ASSESSMENT SECTION */}
          <DiscussionAssessmentSection />

          {/* LEGEND */}
          <LegendSection />

          {/* ACTION BUTTONS */}
          <div className="flex justify-center gap-3 print:hidden mt-8">
            <Button onClick={handleSubmit}>
              {isEdit ? "Update IPCR" : "Save IPCR"}
            </Button>

            <Button variant="outline" onClick={() => navigate("/spms/ipcr")}>
              Back
            </Button>

            <Button onClick={handlePrint}>Print / Save as PDF</Button>
          </div>
        </div>
      </div>
    </>
  );
}
