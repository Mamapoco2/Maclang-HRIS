// src/pages/profile/components/ProfileCompletionModal.jsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { ProfileFormFields } from "./ProfileFormFields";
import { AvatarUpload } from "./avatarUpload";
import { useCompleteProfile } from "@/hooks/useCompleteProfile";

// ── Human-readable labels for the confirm screen ──────────────────────────────
const FIELD_LABELS = {
  surname: "Surname",
  first_name: "First Name",
  middle_name: "Middle Name",
  name_extension: "Name Extension",
  date_of_birth: "Date of Birth",
  place_of_birth: "Place of Birth",
  sex_at_birth: "Sex at Birth",
  civil_status: "Civil Status",
  height: "Height (m)",
  weight: "Weight (kg)",
  blood_type: "Blood Type",
  citizenship: "Citizenship",
  umid_id: "UMID ID No.",
  pagibig_id: "Pag-IBIG ID No.",
  philhealth_no: "PhilHealth No.",
  philsys_number: "PhilSys Number",
  tin_no: "TIN No.",
  agency_employee_no: "Agency Employee No.",
  residential_city: "Residential City",
  residential_province: "Residential Province",
  permanent_city: "Permanent City",
  permanent_province: "Permanent Province",
  telephone_no: "Telephone No.",
  mobile_no: "Mobile No.",
  email_address: "E-mail Address",
  spouse_surname: "Spouse's Surname",
  father_surname: "Father's Surname",
  mother_maiden_surname: "Mother's Maiden Surname",
  govt_id_type: "Government ID Type",
  govt_id_type_other: "Government ID Type (Specified)",
  govt_id_no: "Government ID No.",
  govt_id_date_place: "Date & Place of Issuance",
  license_number: "License No.",
  license_date_issued: "License Date Issued",
  license_expiry_date: "License Expiry Date",
  license_place_issued: "License Place Issued",
  related_3rd_degree: "Related (3rd degree)?",
  found_guilty_admin: "Found guilty (admin offense)?",
  criminally_charged: "Criminally charged?",
  convicted_crime: "Convicted of crime?",
  separated_from_service: "Separated from service?",
  candidate_in_election: "Candidate in election?",
  immigrant_status: "Immigrant/permanent resident abroad?",
  is_indigenous: "Member of indigenous group?",
  is_pwd: "Person with disability?",
  is_solo_parent: "Solo parent?",
};

const SUMMARY_FIELDS = [
  "surname",
  "first_name",
  "middle_name",
  "name_extension",
  "date_of_birth",
  "place_of_birth",
  "sex_at_birth",
  "civil_status",
  "height",
  "weight",
  "blood_type",
  "citizenship",
  "umid_id",
  "pagibig_id",
  "philhealth_no",
  "philsys_number",
  "tin_no",
  "agency_employee_no",
  "residential_city",
  "residential_province",
  "permanent_city",
  "permanent_province",
  "telephone_no",
  "mobile_no",
  "email_address",
  "spouse_surname",
  "father_surname",
  "mother_maiden_surname",
  "govt_id_type",
  "govt_id_type_other",
  "govt_id_no",
  "govt_id_date_place",
  "license_number",
  "license_date_issued",
  "license_expiry_date",
  "license_place_issued",
  "related_3rd_degree",
  "found_guilty_admin",
  "criminally_charged",
  "convicted_crime",
  "separated_from_service",
  "candidate_in_election",
  "immigrant_status",
  "is_indigenous",
  "is_pwd",
  "is_solo_parent",
];

const TABLE_FIELDS = [
  { key: "children", label: "Children" },
  { key: "edu_elementary", label: "Elementary Education" },
  { key: "edu_secondary", label: "Secondary Education" },
  { key: "edu_vocational", label: "Vocational Education" },
  { key: "edu_college", label: "College Education" },
  { key: "edu_graduate", label: "Graduate Studies" },
  { key: "eligibilities", label: "Civil Service Eligibilities" },
  { key: "work_experiences", label: "Work Experience entries" },
  { key: "voluntary_works", label: "Voluntary Work entries" },
  { key: "trainings", label: "Training Programs" },
  { key: "special_skills", label: "Special Skills/Hobbies" },
  { key: "non_academic_distinctions", label: "Non-Academic Distinctions" },
  { key: "organization_memberships", label: "Organization Memberships" },
  { key: "references", label: "References" },
];

// ─── Step 1: Fill ─────────────────────────────────────────────────────────────
function FillStep({
  values,
  avatarFile,
  onAvatarSelected,
  onChange,
  fieldErrors,
  serverError,
  onNext,
}) {
  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <DialogTitle className="text-lg">Complete Your Profile</DialogTitle>
        </div>
        <DialogDescription className="text-sm text-muted-foreground">
          Please accomplish your{" "}
          <strong>
            Personal Data Sheet (CS Form No. 212, Revised 2017 or 2025)
          </strong>
          . You will only need to do this once.
        </DialogDescription>
      </DialogHeader>

      {serverError && (
        <div className="rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="mt-2 space-y-4">
        {/* ── Photo upload ───────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-1 py-1">
          <AvatarUpload onFileSelected={onAvatarSelected} />
          {avatarFile && (
            <p className="text-xs text-green-600">✓ Photo selected</p>
          )}
        </div>

        {/* ── Multi-step PDS form ────────────────────────────────────────── */}
        <ProfileFormFields
          values={values}
          onChange={onChange}
          fieldErrors={fieldErrors}
          onNext={onNext}
        />
      </div>
    </>
  );
}

// ─── Step 2: Confirm ──────────────────────────────────────────────────────────
function ConfirmStep({ values, avatarFile, onBack, onConfirm, isSubmitting }) {
  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <DialogTitle className="text-lg">
            Confirm Your Information
          </DialogTitle>
        </div>
        <DialogDescription className="text-sm text-muted-foreground">
          Please review your details carefully before saving.
        </DialogDescription>
      </DialogHeader>

      <div className="rounded-md border divide-y text-sm mt-2 max-h-[50vh] overflow-y-auto">
        {/* Avatar */}
        <div className="flex justify-between px-4 py-2.5 gap-4">
          <span className="text-muted-foreground font-medium">Photo</span>
          <span className="font-medium">
            {avatarFile ? (
              <span className="text-green-600">✓ Photo selected</span>
            ) : (
              <span className="text-muted-foreground italic">Skipped</span>
            )}
          </span>
        </div>

        {/* Scalar fields — skip govt_id_type_other if govt_id_type is not OTHER */}
        {SUMMARY_FIELDS.map((key) => {
          if (key === "govt_id_type_other" && values.govt_id_type !== "OTHER")
            return null;
          const val = values[key];
          if (!val) return null;
          return (
            <div key={key} className="flex justify-between px-4 py-2 gap-4">
              <span className="text-muted-foreground font-medium whitespace-nowrap text-xs">
                {FIELD_LABELS[key] ?? key}
              </span>
              <span className="text-right font-medium text-xs break-all">
                {val}
              </span>
            </div>
          );
        })}

        {/* Table fields — show row count */}
        {TABLE_FIELDS.map(({ key, label }) => {
          const arr = values[key];
          if (!Array.isArray(arr) || arr.length === 0) return null;
          return (
            <div key={key} className="flex justify-between px-4 py-2 gap-4">
              <span className="text-muted-foreground font-medium whitespace-nowrap text-xs">
                {label}
              </span>
              <span className="text-right font-medium text-xs">
                {arr.length} {arr.length === 1 ? "entry" : "entries"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-800 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300 mt-1">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        <p>
          Are you sure the information above is correct and up to date? If
          anything is wrong, please proceed to the{" "}
          <strong>HR Department</strong> to have it updated.
        </p>
      </div>

      <div className="flex gap-3 mt-1">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Go Back
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Yes, Save & Continue"
          )}
        </Button>
      </div>
    </>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export function ProfileCompletionModal({ isOpen, onCompleted }) {
  const [values, setValues] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [step, setStep] = useState("fill"); // "fill" | "confirm"

  const handleChange = (key, val) =>
    setValues((prev) => ({ ...prev, [key]: val }));

  const { submit, isSubmitting, fieldErrors, serverError } = useCompleteProfile(
    () => {
      setStep("fill");
      setAvatarFile(null);
      onCompleted?.();
    },
  );

  const handleConfirm = () => {
    const formData = new FormData();

    Object.entries(values).forEach(([key, val]) => {
      if (val !== null && val !== undefined && !Array.isArray(val)) {
        formData.append(key, val);
      }
    });

    const tableKeys = TABLE_FIELDS.map((t) => t.key);
    tableKeys.forEach((key) => {
      if (Array.isArray(values[key])) {
        formData.append(key, JSON.stringify(values[key]));
      }
    });

    if (avatarFile) formData.append("avatar", avatarFile);
    submit(formData);
  };

  return (
    <>
      {isOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 backdrop-blur-sm bg-background/50"
        />
      )}

      <Dialog open={isOpen}>
        <DialogContent
          className="w-[60vw] !max-w-none max-h-[92vh] overflow-y-auto z-50"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {step === "fill" ? (
            <FillStep
              values={values}
              avatarFile={avatarFile}
              onAvatarSelected={setAvatarFile}
              onChange={handleChange}
              fieldErrors={fieldErrors}
              serverError={serverError}
              onNext={() => setStep("confirm")}
            />
          ) : (
            <ConfirmStep
              values={values}
              avatarFile={avatarFile}
              onBack={() => setStep("fill")}
              onConfirm={handleConfirm}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
