import React, { useState } from "react";
import AnnHeader from "../annHeader";
import SentMessages from "./SentMessages";
import SentPinned from "./SentPinned";

const CURRENT_USER = "IT Dept User";

const Sent = () => {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activeTab, setActiveTab] = useState("sent"); // 'sent' or 'pinned'

  return (
    <div className="flex flex-col bg-white h-full">
      <AnnHeader
        search={search}
        setSearch={setSearch}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
      />

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-2 text-center ${
            activeTab === "sent" ? "border-b-2 border-blue-500 font-medium" : ""
          }`}
          onClick={() => setActiveTab("sent")}
        >
          Sent
        </button>
        <button
          className={`flex-1 py-2 text-center ${
            activeTab === "pinned" ? "border-b-2 border-blue-500 font-medium" : ""
          }`}
          onClick={() => setActiveTab("pinned")}
        >
          Pinned
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "sent" ? (
          <SentMessages
            currentUser={CURRENT_USER}
            search={search}
            fromDate={fromDate}
            toDate={toDate}
          />
        ) : (
          <SentPinned
            currentUser={CURRENT_USER}
            search={search}
            fromDate={fromDate}
            toDate={toDate}
          />
        )}
      </div>
    </div>
  );
};

export default Sent;
