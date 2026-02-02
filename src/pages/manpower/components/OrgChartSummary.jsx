import React from "react";

const colorMap = {
  total: "bg-blue-600 text-white",
  plantilla: "bg-emerald-600 text-white",
  cos: "bg-pink-500 text-white",
  consultant: "bg-violet-600 text-white",
  vacant: "bg-amber-500 text-black",
  vices: "bg-yellow-500 text-black",
};

const OrgChartSummary = ({ totals }) => {
  return (
    <div className="flex gap-1 justify-start mb-2 mt-1 px-5">
      {Object.entries(totals).map(([key, value]) => (
        <div
          key={key}
          className={`flex items-center gap-0.5 px-2.5 py-0.5 rounded text-[15px] font-medium shadow ${colorMap[key]}`}
        >
          <span className="capitalize">{key.replace(/_/g, " ")}:</span>
          <span>{value}</span>
        </div>
      ))}
    </div>
  );
};

export default OrgChartSummary;
