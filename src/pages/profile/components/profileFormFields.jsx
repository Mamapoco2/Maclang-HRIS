// src/pages/profile/components/ProfileFormFields.jsx
// CS Form No. 212 (Revised 2025) — orchestrator only

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STEPS } from "../../.../../../constants/constants";
import { StepPersonalInfo } from "./stepPersonalInfo";
import { StepFamilyBackground } from "./stepFamilyBackground";
import {
  StepEducational,
  StepEligibility,
  StepWorkExperience,
} from "./stepEducationAndWork";
import {
  StepVoluntaryAndLnd,
  StepOtherInfo,
  StepQuestions,
  StepReferencesAndId,
} from "./stepMiscellaneous";

const STEP_COMPONENTS = {
  personal: StepPersonalInfo,
  family: StepFamilyBackground,
  education: StepEducational,
  eligibility: StepEligibility,
  work: StepWorkExperience,
  voluntary: StepVoluntaryAndLnd,
  other: StepOtherInfo,
  questions: StepQuestions,
  references: StepReferencesAndId,
};

export function ProfileFormFields({
  values,
  onChange,
  fieldErrors,
  onNext: parentOnNext,
}) {
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx];
  const set = (key, val) => onChange(key, val);

  const goNext = () =>
    stepIdx < STEPS.length - 1 ? setStepIdx((i) => i + 1) : parentOnNext?.();
  const goPrev = () => setStepIdx((i) => Math.max(0, i - 1));

  const StepComponent = STEP_COMPONENTS[step.id];

  return (
    <div className="space-y-4">
      {/* Step pills */}
      <div className="flex gap-1 flex-wrap">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStepIdx(i)}
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors border",
              i === stepIdx
                ? "bg-primary text-primary-foreground border-primary"
                : i < stepIdx
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-muted text-muted-foreground border-transparent",
            )}
          >
            {i + 1}. {s.short}
          </button>
        ))}
      </div>

      <p className="text-sm font-semibold text-foreground">{step.label}</p>

      <StepComponent v={values} set={set} fe={fieldErrors} />

      <div className="flex gap-3 pt-2 border-t">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={goPrev}
          disabled={stepIdx === 0}
        >
          ← Back
        </Button>
        <Button type="button" className="flex-1" onClick={goNext}>
          {stepIdx < STEPS.length - 1 ? "Next →" : "Review & Confirm"}
        </Button>
      </div>
    </div>
  );
}
