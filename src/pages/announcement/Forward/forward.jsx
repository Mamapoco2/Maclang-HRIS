import React, { useState, useEffect, useRef } from "react";
import { IconPin } from "@tabler/icons-react";
import AnnHeader from "../annHeader";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CURRENT_USER = "IT Dept User";

const Forward = () => {
  const navigate = useNavigate();
  const [forwardedMessages, setForwardedMessages] = useState(
    JSON.parse(localStorage.getItem("forwardedMessages") || "[]")
  );
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [draggingId, setDraggingId] = useState(null);
  const [dragX, setDragX] = useState(0);
  const startXRef = useRef(0);

  useEffect(() => {
    const handleStorage = () => {
      setForwardedMessages(JSON.parse(localStorage.getItem("forwardedMessages") || "[]"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleViewMessage = (msg) => {
    navigate(`/view/${msg.id}`, { state: { email: msg } });
  };

  const handleDelete = (id) => {
    const deletedMsg = forwardedMessages.find((msg) => msg.id === id);
    const updated = forwardedMessages.filter((msg) => msg.id !== id);
    setForwardedMessages(updated);

    toast(
      (t) => (
        <div className="flex items-center gap-4">
          <span>Message deleted</span>
          <button
            onClick={() => {
              const restored = [deletedMsg, ...updated];
              setForwardedMessages(restored);
              localStorage.setItem("forwardedMessages", JSON.stringify(restored));
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

    setTimeout(() => {
      localStorage.setItem("forwardedMessages", JSON.stringify(updated));
    }, 5000);
  };

  const startDrag = (e, id) => {
    setDraggingId(id);
    startXRef.current = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
  };

  const onDrag = (e) => {
    if (draggingId === null) return;
    const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    setDragX(clientX - startXRef.current);
  };

  const endDrag = () => {
    if (draggingId === null) return;
    if (Math.abs(dragX) > 100) {
      handleDelete(draggingId);
    }
    setDraggingId(null);
    setDragX(0);
  };

  const filtered = forwardedMessages
    .filter((msg) => msg.sender === CURRENT_USER)
    .filter((msg) => {
      const term = search.toLowerCase();
      return (
        msg.subject?.toLowerCase().includes(term) ||
        msg.snippet?.toLowerCase().includes(term) ||
        msg.content?.toLowerCase().includes(term)
      );
    })
    .filter((msg) => {
      if (!fromDate && !toDate) return true;
      const msgDate = new Date(msg.time).setHours(0, 0, 0, 0);
      const from = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
      const to = toDate ? new Date(toDate).setHours(0, 0, 0, 0) : null;
      if (from && to) return msgDate >= from && msgDate <= to;
      if (from) return msgDate >= from;
      if (to) return msgDate <= to;
      return true;
    });

  return (
    <div className="h-full flex flex-col bg-white">
      <AnnHeader
        search={search}
        setSearch={setSearch}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
      />

      <div className="flex-1 overflow-y-auto">
        {filtered.length > 0 ? (
          filtered
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .map((msg) => {
              const isDragging = draggingId === msg.id;
              const snippet = msg.snippet || msg.content.slice(0, 50);
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
                  {/* Red "Delete" overlay */}
                  <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-4">
                    <span className="text-white font-semibold text-sm">Delete</span>
                  </div>

                  {/* Message row */}
                  <div
                    onClick={() => handleViewMessage(msg)}
                    className={`relative flex justify-between items-start py-2 px-4 border-b cursor-pointer bg-white hover:bg-gray-50 transition-transform`}
                    style={{
                      transform: isDragging ? `translateX(${dragX}px)` : "translateX(0)",
                      transition: isDragging ? "none" : "transform 0.3s",
                    }}
                  >
                    <div className="flex flex-col gap-0.5 w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">{msg.sender}</span>
                        <IconPin size={20} strokeWidth={1.8} className="text-gray-400 hover:text-blue-500 cursor-pointer" />
                      </div>
                      <span className="text-gray-700 text-sm truncate font-medium">{msg.subject}</span>
                      <span className="text-gray-500 text-xs truncate max-w-[260px]">{snippet}</span>
                    </div>
                    <span className="text-gray-400 text-xs whitespace-nowrap ml-3">
                      {msg.time ? new Date(msg.time).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>
              );
            })
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-center p-4">
            No forwarded messages yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Forward;
