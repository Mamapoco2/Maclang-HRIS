import InterviewTable from "./interviewTable";

export default function InterviewPage({ applications, onUpdate }) {
  return <InterviewTable applications={applications} onUpdate={onUpdate} />;
}
