import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AnnHeader from "../annHeader";
import { IconPin } from "@tabler/icons-react";

const Inbox = () => {
  const navigate = useNavigate();
  const currentUserDept = "IT Dept";

  const [emails] = useState([
    { id: 1, sender: "AdminUser", subject: "New Announcement", snippet: "Check out the latest update.", time: new Date(), content: "Full content of the announcement.", unread: true, target: "All", pinned: false },
    { id: 2, sender: "HRUser", subject: "Holiday Schedule", snippet: "Next week is a holiday.", time: new Date(new Date().setDate(new Date().getDate() - 1)), content: "The office will be closed on Monday.", unread: false, target: "All", pinned: false },
    { id: 3, sender: "ITUser", subject: "System Maintenance", snippet: "Scheduled maintenance this weekend.", time: new Date(new Date().setDate(new Date().getDate() - 2)), content: "System down 10PM–2AM Saturday.", unread: true, target: "IT Dept", pinned: true },
    { id: 4, sender: "NursingUser", subject: "Staff Meeting", snippet: "Meeting scheduled for Friday.", time: new Date(new Date().setDate(new Date().getDate() - 3)), content: "All nursing staff to attend.", unread: true, target: "Nursing", pinned: false },
  ]);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredEmails = emails
    .filter(email =>
      email.sender.toLowerCase().includes(search.toLowerCase()) ||
      email.subject.toLowerCase().includes(search.toLowerCase())
    )
    .filter(email => {
      if (fromDate && new Date(email.time) < new Date(fromDate)) return false;
      if (toDate && new Date(email.time) > new Date(toDate)) return false;
      return true;
    })
    .filter(email => {
      if (filter === "All") return email.target === "All";
      if (filter === "Department") return email.target === currentUserDept;
      return true;
    })
    .sort((a, b) => b.pinned - a.pinned || b.time - a.time);

  const handleSelectEmail = (email) => {
    navigate(`/view/${email.id}`, { state: { email } });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Header */}
      <div className="flex-none">
        <AnnHeader
          search={search}
          setSearch={setSearch}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          filter={filter}
          setFilter={setFilter}
        />
      </div>

      {/* Email list: fills remaining space, scroll only here if needed */}
      <div className="flex-1 overflow-y-auto px-2">
        {filteredEmails.length > 0 ? (
          filteredEmails.map((email) => (
            <div
              key={email.id}
              onClick={() => handleSelectEmail(email)}
              className={`flex justify-between items-center py-1 px-2 cursor-pointer transition-colors border-b
                ${email.unread ? "bg-gray-100" : "bg-white"} hover:bg-gray-200`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-1 text-gray-800 text-sm font-medium">
                  {email.unread && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />}
                  {email.sender}
                  {email.pinned && <IconPin className="text-blue-500" size={16} />}
                </span>
                <span className="text-gray-600 text-sm truncate">{email.subject}</span>
                <span className="text-gray-500 text-xs truncate max-w-[150px]">{email.snippet}</span>
              </div>
              <span className="text-gray-400 text-xs">{email.time.toLocaleDateString()}</span>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-center p-4">
            No announcements found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
