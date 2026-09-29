import {
  SKILLS,
  RECOMMENDATIONS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from "../../../../lib/skillData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Users,
  Clock,
} from "lucide-react";

const SCORE_COLORS = [
  "",
  "bg-red-400",
  "bg-orange-400",
  "bg-amber-400",
  "bg-lime-500",
  "bg-emerald-500",
];
const SCORE_LABELS = ["", "Very Poor", "Poor", "Fair", "Good", "Excellent"];

function getProgressColor(score) {
  if (score <= 1) return "bg-red-400";
  if (score <= 2) return "bg-orange-400";
  if (score <= 3) return "bg-amber-400";
  if (score <= 4) return "bg-lime-500";
  return "bg-emerald-500";
}

export default function GapAnalysis({ scores, employeeName, department }) {
  const rated = SKILLS.filter((s) => scores[s.id]);
  const avgScore = rated.length
    ? rated.reduce((a, s) => a + scores[s.id], 0) / rated.length
    : 0;
  const gapSkills = SKILLS.filter((s) => scores[s.id] && scores[s.id] <= 3);
  const strongSkills = SKILLS.filter((s) => scores[s.id] && scores[s.id] >= 4);

  const categories = Array.from(new Set(SKILLS.map((s) => s.category)));
  const catAverages = categories.map((cat) => {
    const catSkills = SKILLS.filter((s) => s.category === cat && scores[s.id]);
    const avg = catSkills.length
      ? catSkills.reduce((a, s) => a + scores[s.id], 0) / catSkills.length
      : 0;
    return { cat, avg, count: catSkills.length };
  });

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-br from-sky-700 to-teal-600 rounded-2xl p-6 text-white">
        <p className="text-sky-200 text-sm mb-1">Analysis for</p>
        <h2 className="font-display text-2xl font-bold">
          {employeeName || "Employee"}
        </h2>
        {department && (
          <p className="text-sky-200 text-sm mt-0.5">{department}</p>
        )}
        <div className="grid grid-cols-3 gap-4 mt-5">
          <StatBox
            label="Avg Score"
            value={avgScore.toFixed(1)}
            sub={SCORE_LABELS[Math.round(avgScore)] || "out of 5"}
          />
          <StatBox
            label="Items Rated"
            value={`${rated.length}`}
            sub={`of ${SKILLS.length}`}
          />
          <StatBox
            label="Gaps Found"
            value={`${gapSkills.length}`}
            sub="need attention"
          />
        </div>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {catAverages
            .filter((c) => c.count > 0)
            .map(({ cat, avg }) => (
              <div key={cat}>
                <div className="flex justify-between items-center mb-1.5">
                  <span
                    className={cn(
                      "text-xs font-semibold px-2.5 py-0.5 rounded-full border",
                      CATEGORY_COLORS[cat],
                    )}
                  >
                    {CATEGORY_LABELS[cat]}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    {avg.toFixed(1)} / 5
                  </span>
                </div>
                <Progress
                  value={avg}
                  max={5}
                  barClassName={getProgressColor(avg)}
                />
              </div>
            ))}
        </CardContent>
      </Card>

      {/* Skill Gaps */}
      {gapSkills.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <CardTitle>Identified Skill Gaps ({gapSkills.length})</CardTitle>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Rated 3 (Fair) or below — priority development areas, lowest
              scores first
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...gapSkills]
              .sort((a, b) => scores[a.id] - scores[b.id])
              .map((skill) => {
                const rec = RECOMMENDATIONS[skill.category];
                const score = scores[skill.id];
                return (
                  <div
                    key={skill.id}
                    className="border border-amber-100 rounded-xl p-4 bg-amber-50/50"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">
                            <span className="text-gray-400 font-normal">
                              Q{skill.no}
                            </span>{" "}
                            {skill.name}
                          </p>
                          <span
                            className={cn(
                              "text-xs font-semibold px-2 py-0.5 rounded-full border",
                              CATEGORY_COLORS[skill.category],
                            )}
                          >
                            {CATEGORY_LABELS[skill.category]}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">
                          {skill.description}
                        </p>
                      </div>
                      <div className="shrink-0 text-center">
                        <span
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                            SCORE_COLORS[score],
                          )}
                        >
                          {score}
                        </span>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {SCORE_LABELS[score]}
                        </p>
                      </div>
                    </div>
                    {rec && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-sm">
                          <RecColumn
                            icon={<BookOpen className="w-3.5 h-3.5" />}
                            title="L&D Actions"
                            items={rec.actions}
                            color="text-sky-600"
                          />
                          <RecColumn
                            icon={<TrendingUp className="w-3.5 h-3.5" />}
                            title="Resources"
                            items={rec.resources}
                            color="text-violet-600"
                          />
                          <RecColumn
                            icon={<Users className="w-3.5 h-3.5" />}
                            title="Manager Support"
                            items={rec.managerSupport}
                            color="text-teal-600"
                          />
                        </div>
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            Suggested timeline:{" "}
                            <strong className="text-gray-700">
                              {rec.timeline}
                            </strong>
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
          </CardContent>
        </Card>
      )}

      {/* Strengths */}
      {strongSkills.length > 0 && (
        <Card className="border-emerald-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <CardTitle>
                Strengths to Leverage ({strongSkills.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {strongSkills.map((skill) => (
                <span
                  key={skill.id}
                  className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-3 py-1.5 rounded-full font-medium"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {skill.name}
                  <span className="bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {scores[skill.id]}
                  </span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dev Plan Tip */}
      <Card className="bg-sky-50 border-sky-200">
        <CardContent className="py-4">
          <p className="text-sky-800 text-sm">
            <strong>Next Steps:</strong> Focus on the 3–5 areas with your lowest
            scores and share this assessment with your supervisor during your
            next performance review or Individual Development Plan (IDP)
            session.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatBox({ label, value, sub }) {
  return (
    <div className="bg-white/15 rounded-xl p-3 text-center">
      <p className="text-sky-200 text-xs">{label}</p>
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="text-sky-300 text-xs">{sub}</p>
    </div>
  );
}

function RecColumn({ icon, title, items, color }) {
  return (
    <div>
      <p
        className={cn(
          "flex items-center gap-1 font-semibold text-xs uppercase tracking-wide mb-1.5",
          color,
        )}
      >
        {icon}
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-gray-600 text-xs flex gap-1.5">
            <span className="text-gray-300 shrink-0">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
