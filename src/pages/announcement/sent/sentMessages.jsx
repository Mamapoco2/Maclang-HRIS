import React, { useState, useEffect, useRef } from "react";
import { IconPin } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SentMessages = ({ currentUser, search, fromDate, toDate }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem("sentMessages") || "[]")
  );

  const [draggingId, setDraggingId] = useState(null);
  const [dragX, setDragX] = useState(0);
  const startXRef = useRef(0);

  useEffect(() => {
    const handleStorageChange = () => {
      setMessages(JSON.parse(localStorage.getItem("sentMessages") || "[]"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem("sentMessages", JSON.stringify(messages));
  }, [messages]);

// Toggle pinned state
const togglePin = (id) => {
  const updated = messages.map((msg) =>
    msg.id === id ? { ...msg, pinned: !msg.pinned } : msg
  );
  setMessages(updated);

  // Sonner toast feedback
  toast.success(
    updated.find((msg) => msg.id === id).pinned
      ? "Message pinned"
      : "Message unpinned"
  );
};


  const handleDelete = (id) => {
    const deleted = messages.find((m) => m.id === id);
    const updated = messages.filter((m) => m.id !== id);
    setMessages(updated);

    toast(
      (t) => (
        <div className="flex items-center gap-4">
          <span>Message deleted</span>
          <button
            onClick={() => {
              setMessages([deleted, ...updated]);
              toast.dismiss(t.id);
            }}
            className="underline text-blue-500 hover:text-blue-700"
          >
            Undo
          </button>
        </div>
      ),
      { duration: 5000 }
    );
  };

  const startDrag = (e, id) => {
    setDraggingId(id);
    startXRef.current = e.type.includes("touch")
      ? e.touches[0].clientX
      : e.clientX;
  };
  const onDrag = (e) =>
    draggingId !== null &&
    setDragX(
      (e.type.includes("touch") ? e.touches[0].clientX : e.clientX) -
        startXRef.current
    );
  const endDrag = () => {
    if (draggingId && Math.abs(dragX) > 100) handleDelete(draggingId);
    setDraggingId(null);
    setDragX(0);
  };

  const filtered = messages
    .filter((msg) => msg.sender === currentUser)
    .filter((msg) =>
      [msg.subject, msg.snippet, msg.content].some((f) =>
        f.toLowerCase().includes(search.toLowerCase())
      )
    )
    .filter((msg) => {
      const msgDate = new Date(msg.time).setHours(0, 0, 0, 0);
      const from = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
      const to = toDate ? new Date(toDate).setHours(0, 0, 0, 0) : null;
      return (!from || msgDate >= from) && (!to || msgDate <= to);
    })
    .sort((a, b) => new Date(b.time) - new Date(a.time));

  return filtered.length ? (
    filtered.map((msg) => {
      const isDragging = draggingId === msg.id;
      return (
        <div
          key={msg.id}
          className="relative"
          onMouseDown={(e) => startDrag(e, msg.id)}
          onTouchStart={(e) => startDrag(e, msg.id)}
          onMouseMove={onDrag}
          onTouchMove={onDrag}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchEnd={endDrag}
        >
          {/* Delete overlay */}
          <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-4">
            <span className="text-white font-semibold text-sm">Delete</span>
          </div>

          {/* Message row */}
          <div
            onClick={() =>
              navigate(`/view/${msg.id}`, { state: { email: msg } })
            }
            className="relative flex justify-between items-start py-2 px-4 border-b cursor-pointer transition-transform bg-white hover:bg-gray-50"
            style={{
              transform: isDragging ? `translateX(${dragX}px)` : "translateX(0)",
              transition: isDragging ? "none" : "transform 0.3s",
            }}
          >
            <div className="flex flex-col gap-0.5 w-full">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">
                  {msg.sender}
                </span>
                <IconPin
                  size={20}
                  strokeWidth={1.8}
                  className={`${
                    msg.pinned ? "text-blue-500" : "text-gray-400"
                  } hover:text-blue-500 cursor-pointer`}
                  onClick={(e) => {
                    e.stopPropagation(); // prevent row click
                    togglePin(msg.id);
                  }}
                />
              </div>
              <span className="text-gray-700 text-sm truncate font-medium">
                {msg.subject}
              </span>
              <span className="text-gray-500 text-xs truncate max-w-[260px]">
                {msg.snippet}
              </span>
            </div>
            <span className="text-gray-400 text-xs whitespace-nowrap ml-3">
              {new Date(msg.time).toLocaleDateString()}{" "}
              {new Date(msg.time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      );
    })
  ) : (
    <div className="flex items-center justify-center h-full text-gray-400 text-center p-4">
      No sent messages available.
    </div>
  );
};

export default SentMessages;
