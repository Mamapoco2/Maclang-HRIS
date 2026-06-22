import { FormField, Input, Textarea, Select } from "../FormField";
import { FileUpload, MultiFileUpload } from "./FileUpload";
import { InformationAlertCard } from "./InformationAlertCard";
import { LEAVE_INFO_NOTICES, LEAVE_TYPE_MAP } from "../leavePolicy";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert } from "lucide-react";

export function LeaveTypeFields({
  leaveType,
  register,
  uploads,
  setUpload,
  setMultiUpload,
  vawcFiles,
}) {
  if (!leaveType) return null;

  const notice = LEAVE_INFO_NOTICES[leaveType];
  const typeConfig = LEAVE_TYPE_MAP[leaveType];

  return (
    <div className="space-y-4">
      {typeConfig?.confidential && (
        <div className="flex items-center gap-2 p-3 rounded-xl border-2 border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800">
          <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
          <Badge variant="destructive" className="uppercase tracking-wide">
            Confidential Leave
          </Badge>
          <span className="text-xs text-red-700 dark:text-red-300">
            Handled with strict privacy and confidentiality
          </span>
        </div>
      )}

      {notice && (
        <InformationAlertCard
          title={notice.title}
          message={notice.message}
          variant={notice.variant}
          badge={notice.variant === "confidential" ? "Confidential" : undefined}
        />
      )}

      {leaveType === "vacation" && (
        <>
          <FormField label="Destination" required>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  value="within_ph"
                  {...register("destination")}
                  className="accent-[var(--primary)]"
                />
                Within Philippines
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  value="abroad"
                  {...register("destination")}
                  className="accent-[var(--primary)]"
                />
                Abroad
              </label>
            </div>
          </FormField>
          <FormField label="Purpose of Travel" required>
            <Textarea
              rows={2}
              placeholder="State the purpose of travel..."
              {...register("purposeOfTravel")}
            />
          </FormField>
        </>
      )}

      {leaveType === "sick" && (
        <>
          <FileUpload
            label="Medical Certificate"
            file={uploads.medical_certificate}
            onChange={(f) => setUpload("medical_certificate", f)}
          />
          <FormField label="Hospital / Clinic Name">
            <Input
              placeholder="Name of hospital or clinic"
              {...register("hospitalName")}
            />
          </FormField>
          <FormField label="Physician Name">
            <Input
              placeholder="Attending physician"
              {...register("physicianName")}
            />
          </FormField>
        </>
      )}

      {leaveType === "maternity" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Expected Delivery Date" required>
              <Input type="date" {...register("expectedDeliveryDate")} />
            </FormField>
            <FormField label="Number of Children" required>
              <Input
                type="number"
                min={1}
                placeholder="1"
                {...register("numberOfChildren")}
              />
            </FormField>
          </div>
          <FileUpload
            label="Ultrasound"
            file={uploads.ultrasound}
            onChange={(f) => setUpload("ultrasound", f)}
          />
          <FileUpload
            label="Doctor Certificate"
            file={uploads.doctor_certificate}
            onChange={(f) => setUpload("doctor_certificate", f)}
          />
        </>
      )}

      {leaveType === "paternity" && (
        <>
          <FileUpload
            label="Birth Certificate"
            file={uploads.birth_certificate}
            onChange={(f) => setUpload("birth_certificate", f)}
          />
          <FileUpload
            label="Marriage Certificate"
            file={uploads.marriage_certificate}
            onChange={(f) => setUpload("marriage_certificate", f)}
          />
          <FileUpload
            label="Medical Certificate"
            file={uploads.medical_certificate}
            onChange={(f) => setUpload("medical_certificate", f)}
          />
        </>
      )}

      {leaveType === "special_privilege" && (
        <>
          <FormField label="Purpose" required>
            <Textarea
              rows={2}
              placeholder="Purpose of special privilege leave..."
              {...register("specialPurpose")}
            />
          </FormField>
          <FormField label="Location" required>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  value="within_ph"
                  {...register("locationType")}
                  className="accent-[var(--primary)]"
                />
                Within Philippines
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  value="abroad"
                  {...register("locationType")}
                  className="accent-[var(--primary)]"
                />
                Abroad
              </label>
            </div>
            <Input placeholder="Specific location" {...register("location")} />
          </FormField>
        </>
      )}

      {leaveType === "solo_parent" && (
        <FileUpload
          label="Solo Parent ID"
          file={uploads.solo_parent_id}
          onChange={(f) => setUpload("solo_parent_id", f)}
        />
      )}

      {leaveType === "study" && (
        <>
          <FormField label="School Name" required>
            <Input placeholder="Name of school or institution" {...register("schoolName")} />
          </FormField>
          <FormField label="Course / Program" required>
            <Input placeholder="Course or program name" {...register("courseProgram")} />
          </FormField>
          <FormField label="Duration" required>
            <Input placeholder="e.g. 6 months" {...register("studyDuration")} />
          </FormField>
          <FileUpload
            label="Study Leave Contract"
            file={uploads.study_contract}
            onChange={(f) => setUpload("study_contract", f)}
          />
        </>
      )}

      {leaveType === "vawc" && (
        <>
          <FormField label="Case Description" required>
            <Textarea
              rows={3}
              placeholder="Brief description (handled confidentially)..."
              {...register("caseDescription")}
              className="border-red-200 dark:border-red-900 focus:border-red-400"
            />
          </FormField>
          <div className="p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
            <p className="text-xs font-medium text-red-800 dark:text-red-300 mb-2">
              Accepted Documents (upload at least one)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Barangay Protection Order",
                "Temporary Protection Order",
                "Permanent Protection Order",
                "Police Report",
                "Medical Certificate",
              ].map((doc) => (
                <span
                  key={doc}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                >
                  {doc}
                </span>
              ))}
            </div>
          </div>
          <MultiFileUpload
            label="Document Upload"
            files={vawcFiles}
            onChange={setMultiUpload}
          />
        </>
      )}

      {leaveType === "rehabilitation" && (
        <>
          <FormField label="Nature of Injury" required>
            <Textarea
              rows={2}
              placeholder="Describe the nature of injuries..."
              {...register("natureOfInjury")}
            />
          </FormField>
          <FormField label="Rehabilitation Duration" required>
            <Input placeholder="e.g. 3 months" {...register("rehabDuration")} />
          </FormField>
          <FileUpload
            label="Accident Report"
            file={uploads.accident_report}
            onChange={(f) => setUpload("accident_report", f)}
          />
          <FileUpload
            label="Medical Certificate"
            file={uploads.medical_certificate}
            onChange={(f) => setUpload("medical_certificate", f)}
          />
        </>
      )}

      {leaveType === "special_women" && (
        <>
          <FormField label="Gynecological Condition" required>
            <Input
              placeholder="Condition requiring surgery"
              {...register("gynecologicalCondition")}
            />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Surgery Date" required>
              <Input type="date" {...register("surgeryDate")} />
            </FormField>
            <FormField label="Recovery Period" required>
              <Input placeholder="e.g. 4 weeks" {...register("recoveryPeriod")} />
            </FormField>
          </div>
          <FileUpload
            label="Medical Certificate"
            file={uploads.medical_certificate}
            onChange={(f) => setUpload("medical_certificate", f)}
          />
          <FileUpload
            label="Clinical Summary"
            file={uploads.clinical_summary}
            onChange={(f) => setUpload("clinical_summary", f)}
          />
          <FileUpload
            label="Histopathological Report"
            file={uploads.histopathological_report}
            onChange={(f) => setUpload("histopathological_report", f)}
          />
          <FileUpload
            label="Operative Report"
            file={uploads.operative_report}
            onChange={(f) => setUpload("operative_report", f)}
          />
        </>
      )}

      {leaveType === "calamity" && (
        <>
          <FormField label="Type of Calamity" required>
            <Input
              placeholder="e.g. Typhoon, Earthquake, Flood"
              {...register("calamityType")}
            />
          </FormField>
          <FormField label="Affected Location" required>
            <Input placeholder="City/Municipality, Province" {...register("affectedLocation")} />
          </FormField>
          <FormField label="Date of Calamity" required>
            <Input type="date" {...register("calamityDate")} />
          </FormField>
          <FileUpload
            label="Proof of Residency"
            file={uploads.proof_residency}
            onChange={(f) => setUpload("proof_residency", f)}
          />
          <FileUpload
            label="Government Verification Document"
            file={uploads.gov_verification}
            onChange={(f) => setUpload("gov_verification", f)}
          />
        </>
      )}

      {leaveType === "monetization" && (
        <>
          <FormField label="Leave Credits to Monetize" required>
            <Input
              type="number"
              min={1}
              placeholder="Number of leave credits"
              {...register("creditsToMonetize")}
            />
          </FormField>
          <FormField label="Justification" required>
            <Textarea
              rows={4}
              placeholder="State valid and justifiable reasons for monetization..."
              {...register("monetizationJustification")}
            />
          </FormField>
        </>
      )}

      {leaveType === "terminal" && (
        <>
          <FormField label="Separation Type" required>
            <Select {...register("separationType")}>
              <option value="">Select separation type</option>
              <option value="resignation">Resignation</option>
              <option value="retirement">Retirement</option>
              <option value="separation">Separation</option>
            </Select>
          </FormField>
          <FileUpload
            label="Separation Documents"
            file={uploads.separation_documents}
            onChange={(f) => setUpload("separation_documents", f)}
          />
        </>
      )}

      {leaveType === "adoption" && (
        <>
          <FormField label="Child Name" required>
            <Input placeholder="Full name of child" {...register("childName")} />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Placement Date" required>
              <Input type="date" {...register("placementDate")} />
            </FormField>
            <FormField label="Adoption Agency" required>
              <Input placeholder="DSWD or accredited agency" {...register("adoptionAgency")} />
            </FormField>
          </div>
          <FileUpload
            label="Pre-Adoptive Placement Authority"
            file={uploads.pre_adoptive_placement}
            onChange={(f) => setUpload("pre_adoptive_placement", f)}
          />
        </>
      )}
    </div>
  );
}
