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

const FIELD_META = {
  first_name: "First Name",
  last_name: "Last Name",
  gender: "Sex",
  phone: "Phone Number",
  date_of_birth: "Date of Birth",
  address: "Address",
};

// ─── Step 1: Fill form ───────────────────────────────────────────────────────
function FillStep({
  missingFields,
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
          To continue using the system, please fill in the required information
          below. You will only need to do this once.
        </DialogDescription>
      </DialogHeader>

      {serverError && (
        <div className="rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
        className="mt-2 space-y-5"
      >
        {missingFields.avatar !== undefined && (
          <div className="flex flex-col items-center gap-1 py-1">
            <AvatarUpload onFileSelected={onAvatarSelected} />
            {avatarFile && (
              <p className="text-xs text-green-600">✓ Photo selected</p>
            )}
          </div>
        )}

        <ProfileFormFields
          missingFields={missingFields}
          values={values}
          onChange={onChange}
          fieldErrors={fieldErrors}
        />

        <Button type="submit" className="w-full">
          Review & Confirm
        </Button>
      </form>
    </>
  );
}

// ─── Step 2: Confirm data ────────────────────────────────────────────────────
function ConfirmStep({
  missingFields,
  values,
  avatarFile,
  onBack,
  onConfirm,
  isSubmitting,
}) {
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

      <div className="rounded-md border divide-y text-sm mt-2">
        {missingFields.avatar !== undefined && (
          <div className="flex justify-between px-4 py-2.5 gap-4">
            <span className="text-muted-foreground font-medium">Photo</span>
            <span className="text-right font-medium">
              {avatarFile ? (
                <span className="text-green-600">✓ Photo selected</span>
              ) : (
                <span className="text-muted-foreground italic">Skipped</span>
              )}
            </span>
          </div>
        )}

        {Object.keys(missingFields)
          .filter((key) => key !== "avatar")
          .map((key) => (
            <div key={key} className="flex justify-between px-4 py-2.5 gap-4">
              <span className="text-muted-foreground font-medium whitespace-nowrap">
                {FIELD_META[key] ?? missingFields[key]}
              </span>
              <span className="text-right font-medium break-all">
                {values[key] || (
                  <span className="text-destructive italic">Not provided</span>
                )}
              </span>
            </div>
          ))}
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

// ─── Main modal ──────────────────────────────────────────────────────────────
export function ProfileCompletionModal({ isOpen, missingFields, onCompleted }) {
  const [values, setValues] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [step, setStep] = useState("fill");

  const handleChange = (key, value) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const { submit, isSubmitting, fieldErrors, serverError } = useCompleteProfile(
    () => {
      setStep("fill");
      setAvatarFile(null);
      onCompleted?.();
    },
  );

  const handleNext = () => {
    const allFilled = Object.keys(missingFields)
      .filter((key) => key !== "avatar")
      .every((key) => values[key]?.toString().trim());
    if (allFilled) setStep("confirm");
  };

  const handleConfirm = () => {
    // Build FormData so avatar File is included
    const formData = new FormData();
    Object.entries(values).forEach(([key, val]) => {
      if (val) formData.append(key, val);
    });
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
    submit(formData);
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {step === "fill" ? (
          <FillStep
            missingFields={missingFields}
            values={values}
            avatarFile={avatarFile}
            onAvatarSelected={setAvatarFile}
            onChange={handleChange}
            fieldErrors={fieldErrors}
            serverError={serverError}
            onNext={handleNext}
          />
        ) : (
          <ConfirmStep
            missingFields={missingFields}
            values={values}
            avatarFile={avatarFile}
            onBack={() => setStep("fill")}
            onConfirm={handleConfirm}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
