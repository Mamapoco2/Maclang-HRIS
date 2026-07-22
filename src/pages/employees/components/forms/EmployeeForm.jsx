import { useState } from "react";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import { employeeService } from "@/services/employeeService";
import { cn } from "@/lib/utils";

import { useEmployeeFormState } from "../../hooks/useEmployeeFormState";
import { useDivisions } from "../../hooks/useDivisions";
import { usePositionSteps } from "../../hooks/usePositionSteps";
import { useEmployeeCompensation } from "../../hooks/useEmployeeCompensation";
import { useAvatarUpload } from "../../hooks/useAvatarUpload";

import { buildEmployeeFormData } from "../../utils/buildEmployeeFormData";
import {
  getDisplayName,
  getInitials,
  getRoleDisplay,
  employeeNumberHasDigits,
} from "../../utils/employeeFormatters";
import { TABS } from "../../utils/employeeConstants";

import { FormLoader } from "../shared/FormLoader";
import { EmployeeHeader } from "./EmployeeHeader";
import { PersonalInformationSection } from "./PersonalInformationSection";
import { EmploymentInformationSection } from "./EmploymentInformationSection";
import { PdsTab } from "./PdsTab";

export default function EmployeeForm({ employee, refresh, onClose }) {
  const [activeTab, setActiveTab] = useState("employment");
  const [submitting, setSubmitting] = useState(false);

  const {
    formData,
    setFormData,
    handleChange,
    departments,
    positions,
    pendingProvision,
    initializing,
    selectedPositionLabel,
    setSelectedPositionLabel,
    selectedStepLabel,
    setSelectedStepLabel,
    pdsValues,
    setPdsField,
    hasHydratedRef,
    prevEmployeeTypeRef,
  } = useEmployeeFormState(employee);

  const { allDivisions } = useDivisions();

  const { cosPositions, consultantPositions, handlePositionChange } =
    usePositionSteps({
      formData,
      setFormData,
      positions,
      setSelectedPositionLabel,
      setSelectedStepLabel,
      hasHydratedRef,
      prevEmployeeTypeRef,
    });

  const {
    salaryInputSource,
    handleAnnualSalaryChange,
    handleMonthlySalaryChange,
  } = useEmployeeCompensation(setFormData);

  const {
    avatarPreview,
    avatarFile,
    isDragging,
    setIsDragging,
    fileInputRef,
    handleAvatarFile,
    removeAvatar,
  } = useAvatarUpload();

  // ─── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!employeeNumberHasDigits(formData.employeeNumber)) {
      toast.error("Please enter an Employee No. before saving.");
      return;
    }

    setSubmitting(true);

    const form = buildEmployeeFormData({
      formData,
      pdsValues,
      avatarFile,
      salaryInputSource,
    });

    try {
      if (employee) {
        await employeeService.updateEmployee(employee.id, form);
        toast.success("Employee updated");
      } else {
        const response = await employeeService.addEmployee(form);
        const newEmployeeId = response.id || response.data?.id;
        if (newEmployeeId && formData.department?.[0]) {
          try {
            await employeeService.createDepartmentAssignment(newEmployeeId, {
              department_id: formData.department[0],
              is_primary: true,
              start_date: new Date().toISOString().split("T")[0],
            });
          } catch (err) {
            console.error("Failed to create department assignment:", err);
          }
        }
        toast.success("Employee added");
      }
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      console.error("Validation errors:", err.response?.data?.errors);
      const firstError = err.response?.data?.errors
        ? Object.values(err.response.data.errors)[0]?.[0]
        : null;
      toast.error(firstError ?? err.response?.data?.message ?? "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Derived ─────────────────────────────────────────────────────────────
  const selectedDepartment = departments.find(
    (d) =>
      Array.isArray(formData.department) &&
      formData.department.includes(String(d.id)),
  );

  const selectedPosition =
    Array.isArray(positions) && positions.length > 0
      ? positions.find(
          (p) => String(p.id) === String(formData.plantillaPositionId),
        )
      : null;
  const positionTitle =
    selectedPosition?.position_title ?? selectedPosition?.title ?? "";

  const selectedCosPosition =
    Array.isArray(cosPositions) && cosPositions.length > 0
      ? cosPositions.find(
          (p) => String(p.id) === String(formData.cosPositionId),
        )
      : null;

  const selectedConsultantPosition =
    Array.isArray(consultantPositions) && consultantPositions.length > 0
      ? consultantPositions.find(
          (p) => String(p.id) === String(formData.consultantPositionId),
        )
      : null;

  const activePositionLabel =
    formData.employeeType === "Plantilla"
      ? positionTitle
      : formData.employeeType === "Contract of Service"
        ? (selectedCosPosition?.title ?? "")
        : formData.employeeType === "Consultant"
          ? (selectedConsultantPosition?.title ?? "")
          : "";

  const displayName = getDisplayName(formData);
  const initials = getInitials(formData);
  const departmentName = selectedDepartment?.name ?? "";
  const roleDisplay = getRoleDisplay(formData);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col bg-white w-full relative"
      style={{ maxHeight: "90vh", fontFamily: "inherit" }}
    >
      <EmployeeHeader
        employee={employee}
        formData={formData}
        displayName={displayName}
        initials={initials}
        departmentName={departmentName}
        roleDisplay={roleDisplay}
        activePositionLabel={activePositionLabel}
        avatarPreview={avatarPreview}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        fileInputRef={fileInputRef}
        handleAvatarFile={handleAvatarFile}
        removeAvatar={removeAvatar}
      />

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-100 px-6 bg-white">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "py-3 mr-6 text-xs font-semibold uppercase tracking-widest border-b-2 -mb-px transition-colors duration-150",
              activeTab === tab.id
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Scrollable body ──────────────────────────────────────────────── */}
      <div className="overflow-y-auto flex-1 px-6 py-6 space-y-8">
        {initializing ? (
          <FormLoader
            label={employee ? "Loading employee data..." : "Preparing form..."}
          />
        ) : (
          <>
            {activeTab === "employment" && (
              <>
                <PersonalInformationSection
                  formData={formData}
                  handleChange={handleChange}
                />
                <EmploymentInformationSection
                  formData={formData}
                  setFormData={setFormData}
                  handleChange={handleChange}
                  allDivisions={allDivisions}
                  departments={departments}
                  pendingProvision={pendingProvision}
                  positions={positions}
                  selectedPositionLabel={selectedPositionLabel}
                  selectedStepLabel={selectedStepLabel}
                  handlePositionChange={handlePositionChange}
                  cosPositions={cosPositions}
                  consultantPositions={consultantPositions}
                  handleMonthlySalaryChange={handleMonthlySalaryChange}
                  handleAnnualSalaryChange={handleAnnualSalaryChange}
                />
              </>
            )}

            {activeTab === "pds" && (
              <PdsTab values={pdsValues} setField={setPdsField} />
            )}
          </>
        )}
      </div>

      {/* ── Footer / Submit ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-white">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-700 transition-colors px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || initializing}
          className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-gray-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-gray-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              {employee ? "Update employee" : "Add employee"}
            </>
          )}
        </button>
      </div>

      {submitting && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-xs font-semibold uppercase tracking-widest">
              Saving employee...
            </p>
          </div>
        </div>
      )}

      <style>{`
        .field-input {
          display: flex;
          align-items: center;
          width: 100%;
          height: 36px;
          padding: 0 10px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 12px;
          font-family: inherit;
          text-transform: uppercase;
          color: #111827;
          background: white;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          letter-spacing: 0.02em;
        }
        .field-input:focus {
          border-color: #9ca3af;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
        }
        .field-input::placeholder {
          color: #d1d5db;
          text-transform: none;
        }
      `}</style>
    </form>
  );
}
