import React, { useState } from "react";
import All from "./All";
import Department from "./Department";
import Pinned from "./Pinned";

const Inbox = () => {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tabs */}
<div className="flex border-b border-gray-200">
  <button
    className={`flex-1 py-2 text-center ${
      activeTab === "All" ? "border-b-2 border-blue-500 font-medium" : ""
    }`}
    onClick={() => setActiveTab("All")}
  >
    All
  </button>

  <button
    className={`flex-1 py-2 text-center ${
      activeTab === "Department" ? "border-b-2 border-blue-500 font-medium" : ""
    }`}
    onClick={() => setActiveTab("Department")}
  >
    Department
  </button>

  <button
    className={`flex-1 py-2 text-center ${
      activeTab === "Pinned" ? "border-b-2 border-blue-500 font-medium" : ""
    }`}
    onClick={() => setActiveTab("Pinned")}
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
