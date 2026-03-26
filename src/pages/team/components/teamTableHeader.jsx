function formatTeamName(name = "") {
  return (
    name
      .replace(/\b(department|dept\.?|office|unit|division)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim() + " Team"
  );
}

export default function TeamTableHeader({ departmentName = "" }) {
  const teamTitle = departmentName ? formatTeamName(departmentName) : "Team";

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold uppercase">{teamTitle}</h2>
      </div>
    </div>
  );
}
