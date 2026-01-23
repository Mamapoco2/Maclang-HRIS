// src/components/org-chart/StaffCard.jsx
const StaffCard = ({ name, role, employmentType, aligned, image }) => {
  const isVacant = name?.toLowerCase() === "vacant";

  const style = {
    border: `1px solid ${isVacant ? "#9ca3af" : "#000"}`,
    minWidth: "220px",
    padding: "0.75rem",
  };

  const leftBorder = isVacant
    ? { borderLeft: "5px solid #9ca3af" }
    : employmentType === "plantilla"
    ? { borderLeft: `5px solid ${aligned ? "green" : "orange"}` }
    : employmentType === "cos"
    ? { border: "2px solid #9e9e9e" }
    : {};

  return (
    <div
      className="rounded-md bg-white shadow-sm flex items-center gap-2"
      style={{ ...style, ...leftBorder }}
    >
      {image && (
        <img
          src={image}
          alt={name}
          className="w-14 h-14 rounded-full object-cover"
        />
      )}

     <div className="text-left leading-tight max-w-[150px] break-words">

        <div className={`font-semibold text-sm ${isVacant ? "text-gray-400" : ""}`}>
          {name}
        </div>
        <div className={`text-xs ${isVacant ? "text-gray-400" : "text-gray-500"}`}>
          {role}
        </div>
      </div>
    </div>
  );
};

export default StaffCard;
