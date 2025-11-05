import React, { useState } from "react";
import All from "./All";
import Department from "./Department";
import Pinned from "./Pinned";

const Inbox = () => {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tabs */}
      <div className="flex border-b bg-gray-50 mb-2">
        <button
          onClick={() => setActiveTab("All")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === "All"
              ? "border-b-2 border-blue-500 text-blue-600 bg-white"
              : "text-gray-600 hover:text-blue-500"
          }`}
        >
          All
        </button>

        <button
          onClick={() => setActiveTab("Department")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === "Department"
              ? "border-b-2 border-blue-500 text-blue-600 bg-white"
              : "text-gray-600 hover:text-blue-500"
          }`}
        >
          Department
        </button>

        <button
          onClick={() => setActiveTab("Pinned")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === "Pinned"
              ? "border-b-2 border-blue-500 text-blue-600 bg-white"
              : "text-gray-600 hover:text-blue-500"
          }`}
        >
          Pinned
        </button>
      </div>

      {/* Render selected tab with spacing */}
      <div className="flex-1 overflow-hidden px-3">
        {activeTab === "All" && <All />}
        {activeTab === "Department" && <Department />}
        {activeTab === "Pinned" && <Pinned />}
      </div>
    </div>
  );
};

export default Inbox;
