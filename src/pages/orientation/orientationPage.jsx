import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  GraduationCap,
  Clock,
  ClipboardList,
  CircleHelp,
  Building2,
  Target,
  Users,
  ShieldCheck,
  FileText,
  Video,
  Play,
  Pause,
  CheckCircle,
  Award,
  BadgeCheck,
  XCircle,
  Printer,
  Download,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Star,
  Layers,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────
const LS_KEY = "orient_module_v1";
const loadState = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || {};
  } catch {
    return {};
  }
};
const saveState = (s) => localStorage.setItem(LS_KEY, JSON.stringify(s));

const PRE_QUESTIONS = [
  {
    id: 1,
    text: "What is the primary purpose of an employee orientation?",
    options: [
      "Evaluate technical skills",
      "Familiarize employees with company culture and policies",
      "Assign work tasks",
      "Review salary structure",
    ],
    answer: 1,
  },
  {
    id: 2,
    text: "Which document outlines acceptable employee behavior?",
    options: [
      "Job description",
      "Code of Conduct",
      "Org chart",
      "Benefits manual",
    ],
    answer: 1,
  },
  {
    id: 3,
    text: "Who should employees report workplace safety hazards to?",
    options: [
      "HR only",
      "Their direct manager or Safety Officer",
      "Colleagues",
      "No one",
    ],
    answer: 1,
  },
  {
    id: 4,
    text: "How often are performance reviews typically conducted?",
    options: ["Daily", "Monthly", "Annually or semi-annually", "Never"],
    answer: 2,
  },
  {
    id: 5,
    text: "What does the company's mission statement represent?",
    options: [
      "Financial targets",
      "Core purpose and reason for existence",
      "Employee benefits",
      "Work schedule",
    ],
    answer: 1,
  },
];

const POST_QUESTIONS = [
  {
    id: 1,
    text: "Which value best describes our company culture?",
    options: [
      "Competition over collaboration",
      "Integrity, Innovation, and Inclusion",
      "Profit above all else",
      "Individual achievement only",
    ],
    answer: 1,
  },
  {
    id: 2,
    text: "What is the correct process for requesting time off?",
    options: [
      "Inform colleagues verbally",
      "Submit a leave request through HR system with manager approval",
      "Leave without notice",
      "Send a text message",
    ],
    answer: 1,
  },
  {
    id: 3,
    text: "Under the workplace safety policy, employees must:",
    options: [
      "Ignore minor hazards",
      "Report all incidents and near-misses immediately",
      "Handle emergencies alone",
      "Avoid safety training",
    ],
    answer: 1,
  },
  {
    id: 4,
    text: "Company data and intellectual property must be:",
    options: [
      "Shared openly online",
      "Kept confidential and protected per policy",
      "Discussed with family",
      "Posted on social media",
    ],
    answer: 1,
  },
  {
    id: 5,
    text: "What is the escalation path for unresolved workplace concerns?",
    options: [
      "Leave the company",
      "Manager → HR → Leadership as applicable",
      "Ignore the issue",
      "Post publicly",
    ],
    answer: 1,
  },
];

const CONTENT_TOPICS = [
  {
    id: "company",
    icon: Building2,
    label: "Company Overview",
    color: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
    iconColor: "text-blue-400",
    content:
      "Founded in 2005, our company has grown from a small startup to a global leader in technology solutions. We operate across 40 countries, serving over 5,000 enterprise clients. Our commitment to innovation drives everything we do — from product development to customer service excellence.",
  },
  {
    id: "mission",
    icon: Target,
    label: "Mission & Vision",
    color: "from-violet-500/20 to-violet-600/10 border-violet-500/30",
    iconColor: "text-violet-400",
    content:
      "Our Mission: To empower organizations through transformative technology. Our Vision: A world where every business operates at its full potential through intelligent solutions. We believe in responsible innovation, ethical leadership, and creating lasting value for all stakeholders.",
  },
  {
    id: "org",
    icon: Users,
    label: "Organizational Structure",
    color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
    iconColor: "text-emerald-400",
    content:
      "Our flat organizational structure promotes agility and open communication. Teams are organized by function and product line, each led by a Director reporting to the C-suite. Cross-functional pods tackle strategic initiatives. You'll work closely with your team lead and have access to senior leadership through monthly town halls.",
  },
  {
    id: "policies",
    icon: FileText,
    label: "Workplace Policies",
    color: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
    iconColor: "text-amber-400",
    content:
      "Key policies include: Flexible work hours (core hours 10AM–3PM), Remote work up to 3 days/week with manager approval, 20 PTO days annually plus 12 public holidays, Professional development budget of $2,000/year, and a zero-tolerance policy for harassment and discrimination.",
  },
  {
    id: "conduct",
    icon: ShieldCheck,
    label: "Code of Conduct",
    color: "from-rose-500/20 to-rose-600/10 border-rose-500/30",
    iconColor: "text-rose-400",
    content:
      "Every employee must uphold our standards: Act with integrity in all business dealings, protect confidential information, avoid conflicts of interest, treat all colleagues with respect, and report unethical behavior through our anonymous ethics hotline. Violations may result in disciplinary action up to termination.",
  },
  {
    id: "safety",
    icon: ShieldCheck,
    label: "Health & Safety",
    color: "from-teal-500/20 to-teal-600/10 border-teal-500/30",
    iconColor: "text-teal-400",
    content:
      "Your safety is our top priority. All employees must complete annual safety training, know emergency exit routes, report hazards immediately, and follow ergonomic guidelines for workstations. Mental health resources are available 24/7 through our Employee Assistance Program. First aid kits and defibrillators are located on every floor.",
  },
];

const SECTIONS = [
  "intro",
  "pretest",
  "content",
  "video",
  "posttest",
  "certificate",
];
const SECTION_LABELS = [
  "Introduction",
  "Pre-Test",
  "Content",
  "Video",
  "Post-Test",
  "Certificate",
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProgressHeader({
  section,
  completedSections,
  preScore,
  videoComplete,
  postScore,
  dark,
}) {
  const total = 5;
  const done = completedSections.size;
  const pct = Math.round((done / total) * 100);

  return (
    <div
      className={`sticky top-0 z-30 backdrop-blur-xl border-b ${dark ? "bg-slate-900/90 border-white/10" : "bg-white/90 border-slate-200"} px-6 py-3`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-xs font-semibold tracking-widest uppercase ${dark ? "text-slate-400" : "text-slate-500"}`}
          >
            Overall Progress
          </span>
          <span
            className={`text-xs font-bold tabular-nums ${dark ? "text-slate-300" : "text-slate-600"}`}
          >
            {pct}%
          </span>
        </div>
        <div
          className={`w-full h-1.5 rounded-full ${dark ? "bg-white/10" : "bg-slate-200"} overflow-hidden`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          {[
            {
              label: "Pre-Test",
              ok: preScore !== null,
              val: preScore !== null ? `${preScore}%` : "—",
            },
            {
              label: "Video",
              ok: videoComplete,
              val: videoComplete ? "Done" : "Pending",
            },
            {
              label: "Post-Test",
              ok: postScore !== null && postScore >= 80,
              val: postScore !== null ? `${postScore}%` : "—",
            },
          ].map((s) => (
            <span
              key={s.label}
              className={`text-[11px] flex items-center gap-1 font-medium ${s.ok ? "text-emerald-400" : dark ? "text-slate-500" : "text-slate-400"}`}
            >
              {s.ok ? (
                <CheckCircle size={10} />
              ) : (
                <div
                  className={`w-2 h-2 rounded-full ${dark ? "bg-slate-600" : "bg-slate-300"}`}
                />
              )}
              {s.label}: {s.val}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepNav({ section, dark }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {SECTIONS.filter((s) => s !== "intro").map((s, i) => {
        const active = s === section;
        const past = SECTIONS.indexOf(s) < SECTIONS.indexOf(section);
        return (
          <div key={s} className="flex items-center gap-1 mt-5">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                active
                  ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/30"
                  : past
                    ? dark
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : dark
                      ? "bg-white/5 text-slate-500 border border-white/10"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
              }`}
            >
              {past && <CheckCircle size={10} />}
              {SECTION_LABELS[SECTIONS.indexOf(s)]}
            </div>
            {i < SECTIONS.filter((s) => s !== "intro").length - 1 && (
              <div
                className={`w-4 h-px ${dark ? "bg-white/10" : "bg-slate-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function QuizSection({
  questions,
  title,
  subtitle,
  icon: Icon,
  onComplete,
  dark,
  storedScore,
}) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(storedScore !== null);
  const [score, setScore] = useState(storedScore);

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) correct++;
    });
    const pct = Math.round((correct / questions.length) * 100);
    setScore(pct);
    setSubmitted(true);
    onComplete(pct);
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrent(0);
    setSubmitted(false);
    setScore(null);
    onComplete(null);
  };

  if (submitted && score !== null) {
    const pass = score >= 80;
    return (
      <div
        className={`rounded-2xl border p-8 text-center ${dark ? "bg-slate-800/50 border-white/10" : "bg-white border-slate-200"} shadow-xl`}
      >
        <div
          className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-black ${
            pass
              ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
              : "bg-gradient-to-br from-red-400 to-rose-500 text-white shadow-lg shadow-red-500/30"
          }`}
        >
          {score}%
        </div>
        <div
          className={`flex items-center justify-center gap-2 mb-2 text-2xl font-black tracking-tight ${dark ? "text-white" : "text-slate-800"}`}
        >
          {pass ? (
            <BadgeCheck className="text-emerald-400" size={28} />
          ) : (
            <XCircle className="text-red-400" size={28} />
          )}
          {pass ? "Excellent Work!" : "Keep Practicing"}
        </div>
        <p
          className={`text-sm mb-6 ${dark ? "text-slate-400" : "text-slate-500"}`}
        >
          {pass
            ? "You passed this assessment."
            : "You need 80% or higher to pass."}
        </p>
        {!pass && (
          <button
            onClick={handleRetake}
            className="flex items-center gap-2 mx-auto px-6 py-2.5 rounded-xl bg-slate-500/20 hover:bg-slate-500/30 text-sm font-semibold transition-all"
          >
            <RotateCcw size={14} /> Retake
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border ${dark ? "bg-slate-800/50 border-white/10" : "bg-white border-slate-200"} shadow-xl overflow-hidden`}
    >
      <div
        className={`px-8 pt-8 pb-6 border-b ${dark ? "border-white/5" : "border-slate-100"}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Icon size={18} className="text-white" />
          </div>
          <div>
            <h3
              className={`font-black text-lg tracking-tight ${dark ? "text-white" : "text-slate-800"}`}
            >
              {title}
            </h3>
            <p
              className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}
            >
              {subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-xs font-medium ${dark ? "text-slate-400" : "text-slate-500"}`}
          >
            Question {current + 1} of {questions.length}
          </span>
          <span
            className={`text-xs font-semibold ${dark ? "text-slate-300" : "text-slate-600"}`}
          >
            {Math.round(progress)}%
          </span>
        </div>
        <div
          className={`w-full h-1.5 rounded-full ${dark ? "bg-white/10" : "bg-slate-100"} overflow-hidden`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="px-8 py-6">
        <p
          className={`font-semibold text-base mb-5 leading-relaxed ${dark ? "text-white" : "text-slate-800"}`}
        >
          {q.text}
        </p>
        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <label
              key={i}
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                answers[q.id] === i
                  ? "bg-gradient-to-r from-violet-500/20 to-blue-500/10 border-violet-400/50 shadow-md"
                  : dark
                    ? "border-white/10 hover:border-white/20 hover:bg-white/5"
                    : "border-slate-200 hover:border-violet-300 hover:bg-violet-50/50"
              }`}
            >
              <input
                type="radio"
                name={`q${q.id}`}
                className="sr-only"
                checked={answers[q.id] === i}
                onChange={() => setAnswers((p) => ({ ...p, [q.id]: i }))}
              />
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  answers[q.id] === i
                    ? "border-violet-400 bg-violet-400"
                    : dark
                      ? "border-white/20"
                      : "border-slate-300"
                }`}
              >
                {answers[q.id] === i && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <span
                className={`text-sm font-medium ${dark ? "text-slate-200" : "text-slate-700"}`}
              >
                {opt}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div className="px-8 pb-8 flex items-center justify-between">
        <button
          onClick={() => setCurrent((p) => p - 1)}
          disabled={current === 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all disabled:opacity-30 ${dark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-50 text-slate-600"}`}
        >
          <ArrowLeft size={14} /> Previous
        </button>
        {current < questions.length - 1 ? (
          <button
            onClick={() => setCurrent((p) => p + 1)}
            disabled={answers[q.id] === undefined}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all disabled:opacity-40"
          >
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < questions.length}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-40"
          >
            <ClipboardList size={14} /> Submit
          </button>
        )}
      </div>
    </div>
  );
}

function VideoSection({ onComplete, completed, dark }) {
  const [playing, setPlaying] = useState(false);
  const [watched, setWatched] = useState(completed ? 100 : 0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (playing && watched < 100) {
      intervalRef.current = setInterval(() => {
        setWatched((p) => {
          const next = Math.min(p + 0.5, 100);
          if (next >= 100) {
            setPlaying(false);
            onComplete();
          }
          return next;
        });
      }, 200);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, watched]);

  return (
    <div
      className={`rounded-2xl border overflow-hidden shadow-xl ${dark ? "bg-slate-800/50 border-white/10" : "bg-white border-slate-200"}`}
    >
      <div className="relative bg-slate-900 aspect-video flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-slate-900 to-blue-900/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-8 grid-rows-5 w-full h-full opacity-10">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="border border-white/20" />
            ))}
          </div>
        </div>
        {watched >= 100 ? (
          <div className="relative flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <p className="text-white font-bold">Video Completed</p>
          </div>
        ) : (
          <div className="relative flex flex-col items-center gap-4">
            <div
              className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all shadow-2xl"
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? (
                <Pause size={28} className="text-white" />
              ) : (
                <Play size={28} className="text-white ml-1" />
              )}
            </div>
            <p className="text-white/60 text-sm font-medium">
              {playing ? "Simulating playback..." : "Click to play"}
            </p>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-violet-400 to-blue-400 transition-all duration-300"
            style={{ width: `${watched}%` }}
          />
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3
              className={`font-black text-lg tracking-tight ${dark ? "text-white" : "text-slate-800"}`}
            >
              Company Orientation — Welcome Video
            </h3>
            <p
              className={`text-sm mt-1 ${dark ? "text-slate-400" : "text-slate-500"}`}
            >
              A message from our CEO and leadership team covering values,
              culture, and your first 30 days.
            </p>
          </div>
          <span
            className={`flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full ${
              watched >= 100
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : dark
                  ? "bg-white/5 text-slate-400 border border-white/10"
                  : "bg-slate-100 text-slate-500 border border-slate-200"
            }`}
          >
            {watched >= 100 ? "Completed" : `${Math.round(watched)}%`}
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-xs font-medium ${dark ? "text-slate-400" : "text-slate-500"}`}
          >
            Watch progress
          </span>
          <span
            className={`text-xs font-semibold ${dark ? "text-slate-300" : "text-slate-600"}`}
          >
            {Math.round(watched)}% watched
          </span>
        </div>
        <div
          className={`w-full h-2 rounded-full ${dark ? "bg-white/10" : "bg-slate-100"} overflow-hidden`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-300"
            style={{ width: `${watched}%` }}
          />
        </div>
        {watched < 100 && (
          <p
            className={`text-xs mt-3 flex items-center gap-1.5 ${dark ? "text-amber-400/80" : "text-amber-600"}`}
          >
            <Video size={12} /> You must complete the video to unlock the
            Post-Test.
          </p>
        )}
      </div>
    </div>
  );
}

function ContentSection({ completed, onUpdate, dark }) {
  const [open, setOpen] = useState(null);

  const toggle = (id) => setOpen((p) => (p === id ? null : id));

  const markDone = (id) => {
    const next = new Set(completed);
    next.add(id);
    onUpdate(next);
  };

  const pct = Math.round((completed.size / CONTENT_TOPICS.length) * 100);

  return (
    <div>
      <div
        className={`rounded-2xl border p-5 mb-6 ${dark ? "bg-slate-800/50 border-white/10" : "bg-white border-slate-200"} shadow-lg`}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-sm font-semibold ${dark ? "text-slate-300" : "text-slate-600"}`}
          >
            Reading Progress
          </span>
          <span
            className={`text-sm font-black ${dark ? "text-white" : "text-slate-800"}`}
          >
            {completed.size}/{CONTENT_TOPICS.length} topics
          </span>
        </div>
        <div
          className={`w-full h-2 rounded-full ${dark ? "bg-white/10" : "bg-slate-100"} overflow-hidden`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="space-y-3">
        {CONTENT_TOPICS.map((topic) => {
          const Icon = topic.icon;
          const isOpen = open === topic.id;
          const done = completed.has(topic.id);
          return (
            <div
              key={topic.id}
              className={`rounded-2xl border bg-gradient-to-br overflow-hidden transition-all duration-300 shadow-md ${topic.color} ${dark ? "" : "!bg-none border-slate-200"}`}
            >
              <button
                className="w-full flex items-center gap-4 p-5 text-left"
                onClick={() => toggle(topic.id)}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${dark ? "bg-white/10" : "bg-white"} shadow-sm`}
                >
                  <Icon size={18} className={topic.iconColor} />
                </div>
                <span
                  className={`flex-1 font-bold text-sm ${dark ? "text-white" : "text-slate-800"}`}
                >
                  {topic.label}
                </span>
                {done && (
                  <CheckCircle
                    size={16}
                    className="text-emerald-400 flex-shrink-0"
                  />
                )}
                {isOpen ? (
                  <ChevronDown size={16} className="text-slate-400" />
                ) : (
                  <ChevronRight size={16} className="text-slate-400" />
                )}
              </button>
              {isOpen && (
                <div
                  className={`px-5 pb-5 border-t ${dark ? "border-white/5" : "border-slate-100"}`}
                >
                  <p
                    className={`text-sm leading-relaxed mt-4 ${dark ? "text-slate-300" : "text-slate-600"}`}
                  >
                    {topic.content}
                  </p>
                  {!done && (
                    <button
                      onClick={() => markDone(topic.id)}
                      className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
                    >
                      <CheckCircle size={12} /> Mark as Completed
                    </button>
                  )}
                  {done && (
                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      <CheckCircle size={12} /> Completed
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Certificate({ name, postScore, dark, onFinish }) {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const certNum = `CERT-${Date.now().toString(36).toUpperCase().slice(-8)}`;

  return (
    <div className="space-y-6">
      <div
        id="certificate"
        className={`relative rounded-3xl border-2 p-10 text-center overflow-hidden shadow-2xl ${dark ? "bg-slate-800 border-violet-500/30" : "bg-gradient-to-br from-slate-50 to-white border-violet-200"}`}
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-violet-500 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-blue-500 translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-violet-400/50" />
            <Award size={36} className="text-amber-400" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-violet-400/50" />
          </div>
          <p
            className={`text-xs font-bold tracking-widest uppercase mb-3 ${dark ? "text-violet-400" : "text-violet-600"}`}
          >
            Certificate of Completion
          </p>
          <p
            className={`text-sm mb-4 ${dark ? "text-slate-400" : "text-slate-500"}`}
          >
            This certifies that
          </p>
          <h2 className="text-4xl font-black tracking-tight mb-4 bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            {name || "Participant"}
          </h2>
          <p
            className={`text-sm mb-1 ${dark ? "text-slate-400" : "text-slate-500"}`}
          >
            has successfully completed
          </p>
          <h3
            className={`text-xl font-black mb-6 ${dark ? "text-white" : "text-slate-800"}`}
          >
            Employee Orientation Program
          </h3>
          <div className="flex items-center justify-center gap-8 mb-8">
            {[
              { label: "Completion Date", value: date },
              {
                label: "Final Score",
                value: postScore + "%",
                accent: true,
              },
              { label: "Certificate No.", value: certNum, mono: true },
            ].map((item) => (
              <div
                key={item.label}
                className={`text-center p-4 rounded-2xl ${dark ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-200"}`}
              >
                <p
                  className={`text-xs font-semibold mb-1 ${dark ? "text-slate-400" : "text-slate-500"}`}
                >
                  {item.label}
                </p>
                <p
                  className={`${item.accent ? "text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent" : `text-sm font-black ${item.mono ? "font-mono" : ""} ${dark ? "text-white" : "text-slate-800"}`}`}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-violet-400/30" />
            <Star size={14} className="text-amber-400" />
            <Star size={14} className="text-amber-400" />
            <Star size={14} className="text-amber-400" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-violet-400/30" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-center flex-wrap">
        <button
          onClick={() => window.print()}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${dark ? "border-white/10 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-50 text-slate-700"}`}
        >
          <Printer size={14} /> Print Certificate
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all">
          <Download size={14} /> Download PDF
        </button>
        {/* ← This is the key button that closes the modal */}
        {onFinish && (
          <button
            onClick={onFinish}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
          >
            <CheckCircle size={14} /> Done — Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
// onComplete is called when the user finishes (or skips from the modal)
export default function OrientationModule({ onComplete }) {
  const dark = false;
  const [section, setSection] = useState("intro");
  const [name, setName] = useState("");

  const saved = loadState();
  const [preScore, setPreScore] = useState(saved.preScore ?? null);
  const [postScore, setPostScore] = useState(saved.postScore ?? null);
  const [videoComplete, setVideoComplete] = useState(
    saved.videoComplete ?? false,
  );
  const [completedTopics, setCompletedTopics] = useState(
    new Set(saved.completedTopics ?? []),
  );

  useEffect(() => {
    saveState({
      preScore,
      postScore,
      videoComplete,
      completedTopics: [...completedTopics],
    });
  }, [preScore, postScore, videoComplete, completedTopics]);

  const completedSections = new Set(
    [
      preScore !== null && "pretest",
      completedTopics.size === CONTENT_TOPICS.length && "content",
      videoComplete && "video",
      postScore !== null && postScore >= 80 && "posttest",
      videoComplete && postScore !== null && postScore >= 80 && "certificate",
    ].filter(Boolean),
  );

  const canAccessPostTest = videoComplete;
  const canAccessCert = videoComplete && postScore !== null && postScore >= 80;

  const go = (s) => setSection(s);

  const bg = dark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900";
  const card = dark
    ? "bg-slate-800/50 border-white/10"
    : "bg-white border-slate-200";

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${bg}`}
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      {section !== "intro" && (
        <ProgressHeader
          section={section}
          completedSections={completedSections}
          preScore={preScore}
          videoComplete={videoComplete}
          postScore={postScore}
          dark={dark}
        />
      )}

      <div className="max-w-3xl mx-auto px-4">
        {/* ── INTRO ── */}
        {section === "intro" && (
          <div className="min-h-screen flex flex-col justify-center py-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase bg-violet-500/10 border border-violet-500/20 text-violet-400 mb-6">
                <Layers size={12} /> Employee Onboarding
              </div>
              <h1
                className={`text-5xl font-black tracking-tight leading-none mb-4 ${dark ? "text-white" : "text-slate-900"}`}
              >
                New Employee
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
                  Orientation
                </span>
              </h1>
              <p
                className={`text-lg max-w-xl mx-auto leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}
              >
                Welcome to the team. This module will guide you through
                everything you need to know to start your journey with us.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                {
                  icon: BookOpen,
                  label: "Learning Objectives",
                  desc: "Understand company values, policies, and your role",
                  color:
                    "from-violet-500/20 to-violet-600/10 border-violet-500/30",
                  iconColor: "text-violet-400",
                },
                {
                  icon: GraduationCap,
                  label: "Assessments",
                  desc: "Pre-test and post-test to measure your progress",
                  color: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
                  iconColor: "text-blue-400",
                },
                {
                  icon: Clock,
                  label: "Est. Duration",
                  desc: "Approximately 45–60 minutes to complete",
                  color: "from-teal-500/20 to-teal-600/10 border-teal-500/30",
                  iconColor: "text-teal-400",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border p-5 bg-gradient-to-br ${item.color} ${dark ? "" : "!bg-none border-slate-200 bg-white"} shadow-md`}
                >
                  <item.icon size={22} className={`mb-3 ${item.iconColor}`} />
                  <h3
                    className={`font-black text-sm mb-1 ${dark ? "text-white" : "text-slate-800"}`}
                  >
                    {item.label}
                  </h3>
                  <p
                    className={`text-xs leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className={`rounded-2xl border p-6 mb-8 ${card} shadow-lg`}>
              <label
                className={`block text-sm font-bold mb-2 ${dark ? "text-slate-300" : "text-slate-700"}`}
              >
                Your Full Name (for Certificate)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maria Santos"
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all ${dark ? "bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:bg-white/10" : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:bg-white"}`}
              />
            </div>

            <div className="text-center">
              <button
                onClick={() => go("pretest")}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-black bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] transition-all duration-200"
              >
                Start Module <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── PRE-TEST ── */}
        {section === "pretest" && (
          <div>
            <StepNav section={section} dark={dark} />
            <div className="mb-6">
              <h2
                className={`text-3xl font-black tracking-tight mb-1 ${dark ? "text-white" : "text-slate-900"}`}
              >
                Pre-Test
              </h2>
              <p
                className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}
              >
                Let's assess your existing knowledge before we begin.
              </p>
            </div>
            <QuizSection
              questions={PRE_QUESTIONS}
              title="Knowledge Check"
              subtitle="5 questions — Before Orientation"
              icon={ClipboardList}
              onComplete={(s) => {
                setPreScore(s);
                if (s !== null) setTimeout(() => go("content"), 800);
              }}
              dark={dark}
              storedScore={preScore}
            />
            {preScore !== null && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => go("content")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all"
                >
                  Continue to Content <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── CONTENT ── */}
        {section === "content" && (
          <div>
            <StepNav section={section} dark={dark} />
            <div className="mb-6">
              <h2
                className={`text-3xl font-black tracking-tight mb-1 ${dark ? "text-white" : "text-slate-900"}`}
              >
                Orientation Content
              </h2>
              <p
                className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}
              >
                Read through all topics and mark each as completed.
              </p>
            </div>
            <ContentSection
              completed={completedTopics}
              onUpdate={setCompletedTopics}
              dark={dark}
            />
            <div className="mt-8 text-center">
              <button
                onClick={() => go("video")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all"
              >
                Continue to Video <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── VIDEO ── */}
        {section === "video" && (
          <div>
            <StepNav section={section} dark={dark} />
            <div className="mb-6">
              <h2
                className={`text-3xl font-black tracking-tight mb-1 ${dark ? "text-white" : "text-slate-900"}`}
              >
                Video Presentation
              </h2>
              <p
                className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}
              >
                Watch the full video to unlock the post-test assessment.
              </p>
            </div>
            <VideoSection
              onComplete={() => setVideoComplete(true)}
              completed={videoComplete}
              dark={dark}
            />
            <div className="mt-8 text-center">
              <button
                onClick={() => go("posttest")}
                disabled={!videoComplete}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Continue to Post-Test <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── POST-TEST ── */}
        {section === "posttest" && (
          <div>
            <StepNav section={section} dark={dark} />
            <div className="mb-6">
              <h2
                className={`text-3xl font-black tracking-tight mb-1 ${dark ? "text-white" : "text-slate-900"}`}
              >
                Post-Test
              </h2>
              <p
                className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}
              >
                Score 80% or higher to earn your certificate.
              </p>
            </div>
            {!canAccessPostTest ? (
              <div
                className={`rounded-2xl border p-8 text-center ${card} shadow-xl`}
              >
                <Video size={36} className="mx-auto mb-3 text-amber-400" />
                <p
                  className={`font-bold mb-1 ${dark ? "text-white" : "text-slate-800"}`}
                >
                  Video Required
                </p>
                <p
                  className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}
                >
                  Please complete the video presentation first.
                </p>
                <button
                  onClick={() => go("video")}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/30 transition-all"
                >
                  Go to Video <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <>
                <QuizSection
                  questions={POST_QUESTIONS}
                  title="Final Assessment"
                  subtitle="5 questions — Passing score: 80%"
                  icon={CircleHelp}
                  onComplete={(s) => setPostScore(s)}
                  dark={dark}
                  storedScore={postScore}
                />
                {postScore !== null && postScore >= 80 && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => go("certificate")}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
                    >
                      <Award size={14} /> View Certificate
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── CERTIFICATE ── */}
        {section === "certificate" && (
          <div className="pb-12">
            <StepNav section={section} dark={dark} />
            <div className="mb-6">
              <h2
                className={`text-3xl font-black tracking-tight mb-1 ${dark ? "text-white" : "text-slate-900"}`}
              >
                Completion Certificate
              </h2>
              <p
                className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}
              >
                Congratulations on completing the orientation program.
              </p>
            </div>
            {!canAccessCert ? (
              <div
                className={`rounded-2xl border p-8 text-center ${card} shadow-xl`}
              >
                <XCircle size={36} className="mx-auto mb-3 text-red-400" />
                <p
                  className={`font-bold mb-1 ${dark ? "text-white" : "text-slate-800"}`}
                >
                  Certificate Unavailable
                </p>
                <p
                  className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}
                >
                  Complete the video and pass the post-test with 80% or higher.
                </p>
              </div>
            ) : (
              // Pass onFinish so the "Done" button can close the modal
              <Certificate
                name={name}
                postScore={postScore}
                dark={dark}
                onFinish={onComplete}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
