import OrgChart from "../manpower/components/OrgChart";
import React, { useState, useEffect } from "react";

export default function OrgChartTab() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  }, [darkMode]);

  return (
    <div style={{ height: "calc(100vh - 150px)" }} className="overflow-hidden">
      <OrgChart darkMode={darkMode} setDarkMode={setDarkMode} />
    </div>
  );
}
