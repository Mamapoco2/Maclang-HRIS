import React from "react";

const colorMap = {
  total: "bg-blue-600 text-white",
  plantilla: "bg-emerald-600 text-white",
  cos: "bg-pink-500 text-white",
  consultant: "bg-violet-600 text-white",
  vacant: "bg-amber-500 text-black",
  vices: "bg-yellow-500 text-black",
};

const defaultTotals = {
  total: 0,
  plantilla: 0,
  cos: 0,
  consultant: 0,
  vacant: 0,
};

const OrgChartSummary = ({ totals = defaultTotals }) => {
  if (!totals || typeof totals !== "object") {
    return null;
  }

  return (
    <div className="w-full flex justify-center">
      <div className="flex gap-2 flex-wrap justify-center mb-3 mt-2">
        {Object.entries(totals).map(([key, value]) => (
          <div
            key={key}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium shadow ${
              colorMap[key] || "bg-gray-400 text-white"
            }`}
          >
            <span className="capitalize">{key.replace(/_/g, " ")}:</span>
            <span>{value ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrgChartSummary;
