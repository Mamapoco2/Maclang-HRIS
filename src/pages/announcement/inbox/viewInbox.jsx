import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  IconArrowLeft,
  IconTrash,
  IconShare,
  IconPin,
  IconPrinter,
  IconMailForward,
} from "@tabler/icons-react";
import SeenUsers from "./SeenUsers"; // updated SeenUsers component

const ViewInbox = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};

  if (!email)
    return <div className="text-center text-gray-500 mt-20">Loading...</div>;

  // Placeholder action handlers
  const handlePin = () => console.log("Pin email:", email.id);
  const handleForward = () => console.log("Forward email:", email.id);
  const handlePrint = () => window.print();
  const handleDelete = () => console.log("Delete email:", email.id);
  const handleShare = () => console.log("Share email:", email.id);

  // Example seen users for this email
  const seenUsersList = email.seenUsers || [
    { id: 1, name: "Alice Johnson", avatar: "https://i.pravatar.cc/150?img=1" },
    { id: 2, name: "Bob Smith", avatar: "https://i.pravatar.cc/150?img=2" },
    { id: 3, name: "Charlie Brown", avatar: "https://i.pravatar.cc/150?img=3" },
    { id: 4, name: "David Lee", avatar: "https://i.pravatar.cc/150?img=4" },
    { id: 5, name: "Eve Kim", avatar: "https://i.pravatar.cc/150?img=5" },
    { id: 6, name: "Frank Wright", avatar: "https://i.pravatar.cc/150?img=6" },
    { id: 7, name: "Grace Park", avatar: "https://i.pravatar.cc/150?img=7" },
    { id: 8, name: "Hannah Scott", avatar: "https://i.pravatar.cc/150?img=8" },
    { id: 9, name: "Ian Clark", avatar: "https://i.pravatar.cc/150?img=9" },
    { id: 10, name: "Jane Doe", avatar: "https://i.pravatar.cc/150?img=10" },
    { id: 11, name: "Kyle Brown", avatar: "https://i.pravatar.cc/150?img=11" },
    { id: 12, name: "Laura White", avatar: "https://i.pravatar.cc/150?img=12" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f3f4f6]">
      {/* Header / Toolbar */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-blue-600 font-medium hover:underline"
          >
            <IconArrowLeft size={18} />
            <span>Back</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={handlePin} className="p-2 rounded hover:bg-gray-100" title="Pin">
            <IconPin size={20} className="text-gray-700" />
          </button>
          <button onClick={handleForward} className="p-2 rounded hover:bg-gray-100" title="Forward">
            <IconMailForward size={20} className="text-gray-700" />
          </button>
          <button onClick={handlePrint} className="p-2 rounded hover:bg-gray-100" title="Print">
            <IconPrinter size={20} className="text-gray-700" />
          </button>
          <button onClick={handleShare} className="p-2 rounded hover:bg-gray-100" title="Share">
            <IconShare size={20} className="text-gray-700" />
          </button>
          <button onClick={handleDelete} className="p-2 rounded hover:bg-red-100" title="Delete">
            <IconTrash size={20} className="text-red-600" />
          </button>
        </div>
      </header>

      {/* Main Email Content */}
      <main className="flex-1 overflow-y-auto bg-gray-100 p-8 sm:p-12 shadow-sm">
        {/* Subject and Sender Info */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
          <h1 className="text-3xl font-semibold text-gray-900">{email.subject}</h1>
          <div className="text-sm text-gray-500 mt-2 sm:mt-0 text-right">
            From: <span className="font-medium text-gray-800">{email.sender}</span> •{" "}
            {new Date(email.time).toLocaleString()}
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-200 mb-6" />

        {/* Content */}
        <div className="text-gray-800 leading-relaxed text-[15px] whitespace-pre-line mb-6">
          {email.content}
        </div>

        {/* Seen Users */}
        <div className="mt-6">
          <SeenUsers users={seenUsersList} />
        </div>
      </main>
    </div>
  );
};

export default ViewInbox;
