import React from "react";
import { Plus, Minus, RefreshCcw, Search, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ReportGeneration from "./ReportGeneration";

export default function OrgChartControls({
  department,
  setDepartment,
  departmentList,
  zoomIn,
  zoomOut,
  resetTransform,
  scale = 1,
  reportData,
  darkMode,
  setDarkMode,
}) {
  return (
    <div className="relative z-10 p-3">
      <div
        className="flex flex-wrap items-center justify-center gap-3 p-3 mx-auto max-w-fit
        bg-white/90 dark:bg-gray-800/90 backdrop-blur-md
        border border-gray-200 dark:border-gray-700
        shadow-lg rounded-xl"
      >
        {/* 🔍 Department */}
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500 dark:text-gray-300" />
          <Label className="text-xs font-bold uppercase whitespace-nowrap">
            Department
          </Label>

          <select
            className="px-3 py-2 border rounded-md text-sm
              bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="All">All Departments</option>
            {departmentList.map((dept, i) => (
              <option key={i} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* ➖➕ Zoom */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1 gap-1">
          <Button onClick={zoomOut} size="icon" variant="ghost">
            <Minus className="w-4 h-4" />
          </Button>

          <span className="px-3 text-sm font-semibold min-w-14 text-center">
            {Math.round(scale * 100)}%
          </span>

          <Button onClick={zoomIn} size="icon" variant="ghost">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* 🔄 RESET */}
        <Button onClick={resetTransform} variant="outline" size="icon">
          <RefreshCcw className="w-4 h-4" />
        </Button>

        {/* 🌙 Dark mode */}
        <Button
          onClick={() => setDarkMode(!darkMode)}
          variant="outline"
          size="icon"
        >
          {darkMode ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>

        {/* 📄 Report */}
        <ReportGeneration data={reportData} />
      </div>
    </div>
  );
}
