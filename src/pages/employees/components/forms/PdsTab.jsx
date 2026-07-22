import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

export function PdsTab({ values, setField }) {
  const [pdsStepIdx, setPdsStepIdx] = useState(0);
  const pdsStep = STEPS[pdsStepIdx];
  const PdsStepComponent = PDS_STEP_COMPONENTS[pdsStep?.id];

  return (
    <div className="space-y-5">
      {/* Step pills */}
      <div className="flex gap-1.5 flex-wrap">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setPdsStepIdx(i)}
            className={cn(
              "text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider transition-all duration-150 border",
              i === pdsStepIdx
                ? "bg-gray-900 text-white border-gray-900"
                : i < pdsStepIdx
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-white text-gray-400 border-gray-200 hover:border-gray-400",
            )}
          >
            {i + 1}. {s.short}
          </button>
        ))}
      </div>

      {/* Step heading */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
          {pdsStepIdx + 1}
        </div>
        <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          {pdsStep?.label}
        </p>
      </div>

      {/* Step content */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
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
          className="flex-1 h-9 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-30 disabled:cursor-default transition-all duration-150"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
