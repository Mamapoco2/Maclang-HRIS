import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  IconArrowLeft,
  IconTrash,
  IconShare,
  IconPin,
  IconPrinter,
  IconMailForward,
} from "@tabler/icons-react";
import SeenUsers from "./SeenUsers";
import { toast } from "sonner";
import PrintLayout from "../printLayout";
import ForwardModal from "../Forward/forwardModal";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ViewInbox = () => {
  const navigate = useNavigate();
  const { email } = useLocation().state || {};
  const [isPinned, setIsPinned] = useState(email?.pinned || false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);

  useEffect(() => {
    if (email) {
      const stored = JSON.parse(localStorage.getItem("announcements") || "[]");
      setIsPinned(stored.find((a) => a.id === email.id)?.pinned || false);
    }
  }, [email]);

  if (!email)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading message...
      </div>
    );

  // ✅ Utility: Update announcements in localStorage
  const updateAnnouncements = (updater) => {
    const stored = JSON.parse(localStorage.getItem("announcements") || "[]");
    const updated = updater(stored);
    localStorage.setItem("announcements", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    return updated;
  };

  // ✅ Handle pin toggle
  const handlePin = () => {
    updateAnnouncements((stored) =>
      stored.map((a) => (a.id === email.id ? { ...a, pinned: !isPinned } : a))
    );
    setIsPinned((prev) => !prev);
    toast.success(!isPinned ? "📌 Message pinned!" : "Message unpinned.");
  };

  // ✅ Universal delete function that works across localStorage keys
  const deleteEmailFromLocalStorage = (email) => {
    let removed = false;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (!Array.isArray(data)) continue;

        const updated = data.filter((a) => {
          if (email.id && a.id) return a.id !== email.id;
          if (email.time && a.time) return a.time !== email.time;
          if (email.subject && a.subject && email.time && a.time)
            return !(a.subject === email.subject && a.time === email.time);
          return true;
        });

        if (updated.length !== data.length) {
          localStorage.setItem(key, JSON.stringify(updated));
          console.log(`🗑️ Deleted from localStorage key: ${key}`);
          removed = true;
        }
      } catch (err) {
        // skip non-JSON or unrelated keys
      }
    }

    window.dispatchEvent(new Event("storage"));
    return removed;
  };

  // ✅ Handle delete
  const handleDelete = () => {
    if (!email) {
      toast.error("No email selected.");
      setShowDeleteModal(false);
      return;
    }

    const removed = deleteEmailFromLocalStorage(email);

    if (removed) {
      toast.success("🗑️ Email deleted!");
    } else {
      toast.error("Email not found in storage.");
    }

    setShowDeleteModal(false);

    // Navigate back to inbox safely
    try {
      navigate("/inbox");
    } catch {
      navigate(-1);
    }
  };

  // ✅ Seen users list
  const seenUsersList =
    email.seenUsers || [
      { id: 1, name: "Alice Johnson", avatar: "https://i.pravatar.cc/150?img=1" },
      { id: 2, name: "Bob Smith", avatar: "https://i.pravatar.cc/150?img=2" },
      { id: 3, name: "Charlie Brown", avatar: "https://i.pravatar.cc/150?img=3" },
    ];

  // ✅ Recipient fallback
  const recipient =
    email.recipient && email.recipient !== ""
      ? email.recipient
      : "All Departments";

  // ✅ Toolbar buttons setup
  const toolbarButtons = [
    {
      icon: <IconPin />,
      label: isPinned ? "Unpin" : "Pin",
      onClick: handlePin,
    },
    {
      icon: <IconMailForward />,
      label: "Forward",
      onClick: () => setShowForwardModal(true),
    },
    {
      icon: <IconPrinter />,
      label: "Print",
      onClick: async () => {
        try {
          const { pdf } = await import("@react-pdf/renderer");
          const blob = await pdf(<PrintLayout email={email} />).toBlob();
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, "_blank");
        } catch (err) {
          console.error("Print failed:", err);
          toast.error("Failed to generate print preview.");
        }
      },
    },
    {
      icon: <IconShare />,
      label: "Share",
      onClick: () => {
        navigator.clipboard.writeText(email.content);
        toast.success("Email content copied!");
      },
    },
    {
      icon: <IconTrash />,
      label: "Delete",
      onClick: () => setShowDeleteModal(true),
      danger: true,
    },
  ];

  return (
    <div className="flex flex-col bg-[#f8fafc]">
      {/* ===== HEADER TOOLBAR ===== */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
        >
          <IconArrowLeft size={18} />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-2">
          {toolbarButtons.map((btn, i) => (
            <ToolbarButton key={i} {...btn} />
          ))}
        </div>
      </header>

      {/* ===== EMAIL CONTENT ===== */}
      <main className="flex-1 overflow-y-auto py-8 px-4 sm:px-10">
        <div className="max-w-6xl mx-auto bg-white shadow-md rounded-2xl border border-gray-100 p-8 sm:p-10">
          {/* Subject and meta info */}
          <div className="mb-6 border-b border-gray-200 pb-4">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
              {email.subject}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
              <div className="flex flex-col space-y-0.5">
                <p>
                  <span className="font-medium text-gray-800">From:</span>{" "}
                  {email.sender}
                </p>
                <p>
                  <span className="font-medium text-gray-800">To:</span>{" "}
                  {recipient}
                </p>
              </div>
              <div className="text-right text-gray-500 mt-1 sm:mt-0 text-xs">
                {new Date(email.time).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Message body */}
          <div
            className="text-[16px] text-gray-800 leading-relaxed whitespace-pre-line mb-8 bg-gray-50 rounded-xl border border-gray-100 p-6 shadow-sm"
            dangerouslySetInnerHTML={{ __html: email.content }}
          />

          {/* Seen users section */}
          <div className="pt-5 border-t border-gray-200">
            <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              Seen by
            </h2>
            <SeenUsers users={seenUsersList} />
          </div>
        </div>
      </main>

      {/* ===== DELETE MODAL ===== */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Email?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this email? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              No
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== FORWARD MODAL ===== */}
      {showForwardModal && (
        <ForwardModal
          email={email}
          open={showForwardModal}
          onOpenChange={setShowForwardModal}
        />
      )}
    </div>
  );
};

// ✅ Toolbar Button Component
const ToolbarButton = ({ icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    title={label}
    className={`p-2 sm:p-2.5 rounded-md transition duration-150 ${
      danger ? "hover:bg-red-50" : "hover:bg-gray-100"
    } focus:ring-2 focus:ring-offset-1 focus:ring-blue-300`}
  >
    {React.cloneElement(icon, {
      size: 20,
      className: danger
        ? "text-red-600"
        : "text-gray-700 hover:text-blue-600 transition",
    })}
  </button>
);

export default ViewInbox;
