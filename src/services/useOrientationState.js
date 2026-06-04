import { useState, useEffect } from "react";
import { LS_KEY, CONTENT_TOPICS } from "../constants";

const loadState = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || {};
  } catch {
    return {};
  }
};

const saveState = (s) => localStorage.setItem(LS_KEY, JSON.stringify(s));

export function useOrientationState() {
  const saved = loadState();

  const [section, setSection] = useState("intro");
  const [name, setName] = useState("");
  const [preScore, setPreScore] = useState(saved.preScore ?? null);
  const [postScore, setPostScore] = useState(saved.postScore ?? null);
  const [videoComplete, setVideoComplete] = useState(saved.videoComplete ?? false);
  const [completedTopics, setCompletedTopics] = useState(
    new Set(saved.completedTopics ?? [])
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
    ].filter(Boolean)
  );

  const canAccessPostTest = videoComplete;
  const canAccessCert = videoComplete && postScore !== null && postScore >= 80;

  const go = (s) => setSection(s);

  return {
    section,
    name,
    setName,
    preScore,
    setPreScore,
    postScore,
    setPostScore,
    videoComplete,
    setVideoComplete,
    completedTopics,
    setCompletedTopics,
    completedSections,
    canAccessPostTest,
    canAccessCert,
    go,
  };
}
