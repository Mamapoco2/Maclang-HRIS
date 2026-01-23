import OrgChart from "../manpower/components/OrgChart";
import React, { useState, useEffect } from "react";

export default function OrgChartTab() {
  const [darkMode, setDarkMode] = useState(false);

  // Add or remove the "dark" class on the body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);
  return (
    <div className="w-screen h-screen flex flex-col">
      <main className="flex-1 overflow-hidden">
        <OrgChart darkMode={darkMode} setDarkMode={setDarkMode} />
      </main>
    </div>
  );
}
