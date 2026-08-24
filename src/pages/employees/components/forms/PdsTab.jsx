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
    <div className="space-y-5 min-w-0">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Step {pdsStepIdx + 1} of {STEPS.length}
          </p>
          <p className="text-[11px] font-semibold text-gray-400">
            {progressPct}% complete
          </p>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gray-900 transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Step pills */}
      <div className="flex gap-1.5 flex-wrap">
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
              className={cn(
                "flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-full font-semibold uppercase tracking-wider transition-all duration-150 border",
                isActive
                  ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                  : isDone
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300"
                    : "bg-white text-gray-400 border-gray-200 hover:border-gray-400 hover:text-gray-600",
              )}
            >
              {isDone ? (
                <Check className="w-3 h-3" />
              ) : Icon ? (
                <Icon className="w-3 h-3" />
              ) : null}
              {s.short}
            </button>
          );
        })}
      </div>

      {/* Step heading */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
          {StepIcon ? (
            <StepIcon className="w-4 h-4" />
          ) : (
            <span className="text-xs font-bold">{pdsStepIdx + 1}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide truncate">
            {pdsStep?.label}
          </p>
          <p className="text-[11px] text-gray-400">
            Part of the Personal Data Sheet (CS Form No. 212)
          </p>
        </div>
      </div>

      {/* Step content */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 min-w-0 overflow-x-hidden">
        {PdsStepComponent && (
          <PdsStepComponent v={values} set={setField} fe={{}} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-2 pt-1 border-t border-gray-100">
        <button
          type="button"
          onClick={() => setPdsStepIdx((i) => Math.max(0, i - 1))}
          disabled={pdsStepIdx === 0}
          className="flex-1 h-9 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-30 disabled:cursor-default transition-all duration-150"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </button>
        <button
          type="button"
          onClick={() =>
            setPdsStepIdx((i) => Math.min(STEPS.length - 1, i + 1))
          }
          disabled={pdsStepIdx === STEPS.length - 1}
          className={cn(
            "flex-1 h-9 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-150",
            pdsStepIdx === STEPS.length - 1
              ? "border border-gray-200 text-gray-300 cursor-default"
              : "bg-gray-900 text-white hover:bg-gray-700",
          )}
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
