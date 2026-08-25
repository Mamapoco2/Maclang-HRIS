import { useState } from "react";
import {
  ClipboardList,
  BadgeCheck,
  XCircle,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { PASS_SCORE } from "../utils/orientationQuestions";

export default function QuizSection({
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
    questions.forEach((item) => {
      if (answers[item.id] === item.answer) correct++;
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
    const pass = score >= PASS_SCORE;
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
            : `You need ${PASS_SCORE}% or higher to pass.`}
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
        {q.part && (
          <p
            className={`text-[11px] font-bold uppercase tracking-widest mb-3 ${dark ? "text-violet-400" : "text-violet-600"}`}
          >
            {q.part}
          </p>
        )}
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
