import { useState, useEffect } from "react";
import {
  ClipboardList,
  CircleHelp,
  Video,
  Award,
  XCircle,
  ArrowRight,
} from "lucide-react";

import authService from "@/services/authService";

import {
  PRE_QUESTIONS,
  POST_QUESTIONS,
  PASS_SCORE,
} from "./utils/orientationQuestions";
import { CONTENT_TOPICS } from "./utils/contentTopics";
import { loadState, saveState } from "./utils/storage";

import IntroSection from "./components/IntroSection";
import ProgressHeader from "./components/ProgressHeader";
import StepNav from "./components/StepNav";
import QuizSection from "./components/QuizSection";
import VideoSection from "./components/VideoSection";
import ContentSection from "./components/ContentSection";
import Certificate from "./components/Certificate";

// onComplete is called when the user finishes (or skips from the modal)
export default function OrientationModule({ onComplete }) {
  const dark = false;
  const [section, setSection] = useState("intro");
  const storedUser = authService.getCurrentUser();
  const derivedName = [storedUser?.first_name, storedUser?.last_name]
    .filter(Boolean)
    .join(" ");
  const [name, setName] = useState(derivedName);

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
      postScore !== null && postScore >= PASS_SCORE && "posttest",
      videoComplete &&
        postScore !== null &&
        postScore >= PASS_SCORE &&
        "certificate",
    ].filter(Boolean),
  );

  const canAccessPostTest = videoComplete;
  const canAccessCert =
    videoComplete && postScore !== null && postScore >= PASS_SCORE;

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
          completedSections={completedSections}
          preScore={preScore}
          videoComplete={videoComplete}
          postScore={postScore}
          dark={dark}
        />
      )}

      <div className="max-w-3xl mx-auto px-4">
        {section === "intro" && (
          <IntroSection
            name={name}
            setName={setName}
            dark={dark}
            card={card}
            onStart={() => go("pretest")}
          />
        )}

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
              subtitle={`${PRE_QUESTIONS.length} questions — Before Orientation`}
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
                Score {PASS_SCORE}% or higher to earn your certificate.
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
                  subtitle={`${POST_QUESTIONS.length} questions — Passing score: ${PASS_SCORE}%`}
                  icon={CircleHelp}
                  onComplete={(s) => setPostScore(s)}
                  dark={dark}
                  storedScore={postScore}
                />
                {postScore !== null && postScore >= PASS_SCORE && (
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
                  Complete the video and pass the post-test with {PASS_SCORE}%
                  or higher.
                </p>
              </div>
            ) : (
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
