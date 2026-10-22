import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  Users,
  GraduationCap,
  Award,
  Briefcase,
  HeartHandshake,
  Info,
  HelpCircle,
  IdCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { STEPS } from "@/constants/constants";
import { StepPersonalInfo } from "@/pages/profile/components/stepPersonalInfo";
import { StepFamilyBackground } from "@/pages/profile/components/stepFamilyBackground";
import {
  StepEducational,
  StepEligibility,
  StepWorkExperience,
} from "@/pages/profile/components/stepEducationAndWork";
import {
  StepVoluntaryAndLnd,
  StepOtherInfo,
  StepQuestions,
  StepReferencesAndId,
} from "@/pages/profile/components/stepMiscellaneous";

const PDS_STEP_COMPONENTS = {
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

const STEP_ICONS = {
  personal: User,
  family: Users,
  education: GraduationCap,
  eligibility: Award,
  work: Briefcase,
  voluntary: HeartHandshake,
  other: Info,
  questions: HelpCircle,
  references: IdCard,
};

export function PdsTab({ values, setField }) {
  const [pdsStepIdx, setPdsStepIdx] = useState(0);
  const pdsStep = STEPS[pdsStepIdx];
  const PdsStepComponent = PDS_STEP_COMPONENTS[pdsStep?.id];
  const StepIcon = STEP_ICONS[pdsStep?.id];
  const progressPct = Math.round(((pdsStepIdx + 1) / STEPS.length) * 100);

  return (
    <div className="min-w-0 space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <p className="font-medium">
            Step {pdsStepIdx + 1} of {STEPS.length}
          </p>
          <p className="text-muted-foreground">{progressPct}% complete</p>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Step picker */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:flex-wrap">
        {STEPS.map((s, i) => {
          const Icon = STEP_ICONS[s.id];
          const isDone = i < pdsStepIdx;
          const isActive = i === pdsStepIdx;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setPdsStepIdx(i)}
              title={s.label}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : isDone
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {isDone ? (
                <Check className="size-3.5" />
              ) : Icon ? (
                <Icon className="size-3.5" />
              ) : null}
              {s.short}
            </button>
          );
        })}
      </div>

      {/* Step heading */}
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          {StepIcon ? (
            <StepIcon className="size-4" />
          ) : (
            <span className="text-sm font-semibold">{pdsStepIdx + 1}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold leading-tight">
            {pdsStep?.label}
          </p>
          <p className="text-sm text-muted-foreground">
            Part of the Personal Data Sheet (CS Form No. 212)
          </p>
        </div>
      </div>

      {/* Step content */}
      <div className="min-w-0 overflow-x-hidden rounded-lg border bg-muted/30 p-5">
        {PdsStepComponent && (
          <PdsStepComponent v={values} set={setField} fe={{}} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-2 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => setPdsStepIdx((i) => Math.max(0, i - 1))}
          disabled={pdsStepIdx === 0}
        >
          <ChevronLeft className="size-4" /> Back
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={() =>
            setPdsStepIdx((i) => Math.min(STEPS.length - 1, i + 1))
          }
          disabled={pdsStepIdx === STEPS.length - 1}
        >
          Next <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
