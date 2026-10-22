import { useState } from "react";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import { employeeService } from "@/services/employeeService";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

    if (
      formData.contractPeriodFrom &&
      formData.contractPeriodTo &&
      formData.contractPeriodTo < formData.contractPeriodFrom
    ) {
      toast.error("Contract period 'To' date can't be before the 'From' date.");
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
      className="relative flex max-h-[92dvh] w-full min-w-0 flex-col bg-background"
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

      {/* Tabs */}
      <div className="border-b px-4 py-3 sm:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Scrollable body */}
      <div className="min-h-0 min-w-0 flex-1 space-y-8 overflow-y-auto px-4 py-6 sm:px-6">
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

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-4 py-4 sm:px-6">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || initializing}>
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="size-4" />
              {employee ? "Update employee" : "Add employee"}
            </>
          )}
        </Button>
      </div>

      {submitting && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <p className="text-sm font-medium">Saving employee...</p>
          </div>
        </div>
      )}

      {/* Kept for the Personal Data Sheet steps, which are shared with the
          profile page and style their inputs with ".field-input". Colors are
          derived from the current text color so it follows light/dark themes
          without depending on a particular shadcn token format. */}
      <style>{`
        .field-input {
          display: flex;
          align-items: center;
          width: 100%;
          height: 36px;
          padding: 0 10px;
          border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          color: inherit;
          background: transparent;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .field-input:focus {
          border-color: color-mix(in srgb, currentColor 55%, transparent);
          box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 12%, transparent);
        }
        .field-input::placeholder {
          color: color-mix(in srgb, currentColor 40%, transparent);
        }
        input[type="date"].field-input::-webkit-calendar-picker-indicator {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          opacity: 0;
          cursor: pointer;
        }
      `}</style>
    </form>
  );
}
