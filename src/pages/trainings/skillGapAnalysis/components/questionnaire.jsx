import {
  SKILLS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from "../../../../lib/skillData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import RatingScale, { RatingLegend } from "./ratingScale";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "clinical",
  "administrative",
  "technical",
  "soft",
  "compliance",
];

const WEIGHT_BADGE = {
  1: "bg-gray-100 text-gray-500",
  2: "bg-sky-100 text-sky-700",
  3: "bg-rose-100 text-rose-700",
};

const WEIGHT_LABEL = { 1: "Low", 2: "Medium", 3: "Critical" };

function Questionnaire({ scores, onChange }) {
  const completed = Object.keys(scores).length;
  const total = SKILLS.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-display text-2xl font-semibold text-gray-900">
            Self-Assessment Questionnaire
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Rate yourself honestly for each competency. This supports your
            development plan.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2 shadow-sm">
          <span className="text-sky-600 font-bold text-xl">{completed}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 font-medium">{total}</span>
          <span className="text-gray-400 text-sm ml-1">rated</span>
        </div>
      </div>

      <Card className="p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Rating Scale
        </p>
        <RatingLegend />
      </Card>

      {CATEGORIES.map((cat) => {
        const catSkills = SKILLS.filter((s) => s.category === cat);
        return (
          <Card key={cat}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "text-xs font-semibold px-3 py-1 rounded-full border",
                    CATEGORY_COLORS[cat],
                  )}
                >
                  {CATEGORY_LABELS[cat]}
                </span>
                <span className="text-gray-400 text-sm">
                  {catSkills.length} skills
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-6">
              {catSkills.map((skill, idx) => (
                <div key={skill.id}>
                  {idx > 0 && <div className="border-t border-gray-50 mb-6" />}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-gray-900">
                          {skill.name}
                        </p>
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-semibold",
                            WEIGHT_BADGE[skill.weight],
                          )}
                        >
                          {WEIGHT_LABEL[skill.weight]}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm">
                        {skill.description}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <RatingScale
                        value={scores[skill.id] ?? 0}
                        onChange={(v) => onChange(skill.id, v)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default Questionnaire;
