import ApplicationsTable from "./applicationsTable";

export default function ApplicationsPage({ applications, onUpdate }) {
  return <ApplicationsTable applications={applications} onUpdate={onUpdate} />;
}
