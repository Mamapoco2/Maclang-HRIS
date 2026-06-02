import { useState } from "react";
import {
  SKILLS,
  RECOMMENDATIONS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from "../../../../lib/skillData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { cn } from "@/lib/utils";
import RatingScale, { RatingLegend } from "./ratingScale";
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Users,
  Clock,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

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

const SCORE_COLORS = [
  "",
  "bg-red-400",
  "bg-orange-400",
  "bg-amber-400",
  "bg-lime-500",
  "bg-emerald-500",
];

function getProgressColor(score) {
  if (score <= 1) return "bg-red-400";
  if (score <= 2) return "bg-orange-400";
  if (score <= 3) return "bg-amber-400";
  if (score <= 4) return "bg-lime-500";
  return "bg-emerald-500";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

/** Inline gap panel shown directly under a skill row when score ≤ 3 */
function GapPanel({ skill, score }) {
  const rec = RECOMMENDATIONS.find((r) => r.skillId === skill.id);
  if (!rec) return null;

  return (
    <div className="mt-3 border border-amber-200 rounded-xl p-4 bg-amber-50/60">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
            Gap identified — priority development area
          </span>
        </div>
        <span
          className={cn(
            "shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs",
            SCORE_COLORS[score],
          )}
        >
          {score}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <RecColumn
          icon={<BookOpen className="w-3.5 h-3.5" />}
          title="L&D actions"
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
          title="Manager support"
          items={rec.managerSupport}
          color="text-teal-600"
        />
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
        <Clock className="w-3.5 h-3.5" />
        <span>
          Suggested timeline:{" "}
          <strong className="text-gray-700">{rec.timeline}</strong>
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Questionnaire({
  scores,
  onChange,
  employeeName,
  department,
}) {
  const [submitted, setSubmitted] = useState(false);

  const rated = SKILLS.filter((s) => scores[s.id]);
  const total = SKILLS.length;

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
      {/* ── Summary header ── */}
      <div className="bg-gradient-to-br from-sky-700 to-teal-600 rounded-2xl p-6 text-white">
        <p className="text-sky-200 text-sm mb-1">Self-assessment for</p>
        <h2 className="font-display text-2xl font-bold">
          {employeeName || "Employee"}
        </h2>
        {department && (
          <p className="text-sky-200 text-sm mt-0.5">{department}</p>
        )}
        <div
          className={cn(
            "grid gap-4 mt-5",
            submitted ? "grid-cols-3" : "grid-cols-2",
          )}
        >
          <StatBox
            label="Skills rated"
            value={`${rated.length}`}
            sub={`of ${total}`}
          />
          <StatBox
            label="Completed"
            value={
              rated.length === total
                ? "✓"
                : `${Math.round((rated.length / total) * 100)}%`
            }
            sub="of assessment"
          />
          {submitted && (
            <StatBox
              label="Avg score"
              value={avgScore.toFixed(1)}
              sub="out of 5"
            />
          )}
        </div>
      </div>

      {/* ── Progress counter + legend ── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-display text-xl font-semibold text-gray-900">
            Competency questionnaire
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            {submitted
              ? "Your gap analysis is shown below each skill."
              : "Rate yourself honestly for each skill, then submit to see your gap analysis."}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2 shadow-sm">
          <span className="text-sky-600 font-bold text-xl">{rated.length}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 font-medium">{total}</span>
          <span className="text-gray-400 text-sm ml-1">rated</span>
        </div>
      </div>

      <Card className="p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Rating scale
        </p>
        <RatingLegend />
      </Card>

      {/* ── Category sections with inline gap panels ── */}
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
              {catSkills.map((skill, idx) => {
                const score = scores[skill.id] ?? 0;
                const isGap = submitted && score > 0 && score <= 3;

                return (
                  <div key={skill.id}>
                    {idx > 0 && (
                      <div className="border-t border-gray-50 mb-6" />
                    )}

                    {/* Skill row */}
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
                      <div
                        className={cn(
                          "shrink-0",
                          submitted && "pointer-events-none opacity-75",
                        )}
                      >
                        <RatingScale
                          value={score}
                          onChange={(v) => onChange(skill.id, v)}
                        />
                      </div>
                    </div>

                    {/* Inline gap panel — only shown after submit */}
                    {isGap && <GapPanel skill={skill} score={score} />}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {/* ── Submit / Edit button ── */}
      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={rated.length === 0}
          className={cn(
            "w-full py-3 rounded-2xl font-semibold text-sm transition-all",
            rated.length === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-sky-600 hover:bg-sky-700 text-white shadow-sm active:scale-[0.99]",
          )}
        >
          {rated.length === 0
            ? "Rate at least one skill to submit"
            : `Submit assessment (${rated.length} of ${total} rated)`}
        </button>
      ) : (
        <button
          onClick={() => setSubmitted(false)}
          className="w-full py-3 rounded-2xl font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
        >
          ← Edit responses
        </button>
      )}

      {/* ── Post-submit analysis ── */}
      {submitted && (
        <>
          {/* Category averages */}
          <Card>
            <CardHeader>
              <CardTitle>Performance by category</CardTitle>
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

          {/* Strengths strip */}
          {strongSkills.length > 0 && (
            <Card className="border-emerald-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <CardTitle>
                    Strengths to leverage ({strongSkills.length})
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

          {/* Next steps tip */}
          <Card className="bg-sky-50 border-sky-200">
            <CardContent className="py-4">
              <p className="text-sky-800 text-sm">
                <strong>Next steps:</strong> Share this assessment with your
                supervisor during your next performance review or Individual
                Development Plan (IDP) session. Prioritise closing gaps marked{" "}
                <strong>Critical</strong> first.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
