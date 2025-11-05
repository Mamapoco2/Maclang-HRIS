import React, { useState, useEffect, useRef } from "react";
import { IconPin } from "@tabler/icons-react";
import AnnHeader from "../annHeader";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CURRENT_USER = "IT Dept User";

const Sent = () => {
  const navigate = useNavigate();
  const [sentMessages, setSentMessages] = useState(
    JSON.parse(localStorage.getItem("sentMessages") || "[]")
  );
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [draggingId, setDraggingId] = useState(null);
  const [dragX, setDragX] = useState(0);
  const startXRef = useRef(0);

  // Update local state whenever localStorage changes (real-time)
  useEffect(() => {
    const handleStorageChange = () => {
      setSentMessages(JSON.parse(localStorage.getItem("sentMessages") || "[]"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Persist changes to localStorage when messages are updated
  useEffect(() => {
    localStorage.setItem("sentMessages", JSON.stringify(sentMessages));
  }, [sentMessages]);

  const handleViewMessage = (msg) =>
    navigate(`/view/${msg.id}`, { state: { email: msg } });

  const handleDelete = (id) => {
    const deleted = sentMessages.find((m) => m.id === id);
    const updated = sentMessages.filter((m) => m.id !== id);
    setSentMessages(updated);

    toast(
      (t) => (
        <div className="flex items-center gap-4">
          <span>Message deleted</span>
          <button
            onClick={() => {
              setSentMessages([deleted, ...updated]);
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

  const filtered = sentMessages
    .filter((msg) => msg.sender === CURRENT_USER)
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

      <div className="flex-1 overflow-y-auto">
        {filtered.length ? (
          filtered.map((item) => {
            const isDragging = draggingId === item.id;
            return (
              <div
                key={item.id}
                className="relative"
                onMouseDown={(e) => startDrag(e, item.id)}
                onTouchStart={(e) => startDrag(e, item.id)}
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
                  onClick={() => handleViewMessage(item)}
                  className={`relative flex justify-between items-start py-2 px-4 border-b cursor-pointer transition-transform bg-white hover:bg-gray-50`}
                  style={{
                    transform: isDragging
                      ? `translateX(${dragX}px)`
                      : "translateX(0)",
                    transition: isDragging ? "none" : "transform 0.3s",
                  }}
                >
                  <div className="flex flex-col gap-0.5 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800">
                        {item.sender}
                      </span>
                      <IconPin
                        size={20}
                        strokeWidth={1.8}
                        className="text-gray-400 hover:text-blue-500 cursor-pointer"
                      />
                    </div>
                    <span className="text-gray-700 text-sm truncate font-medium">
                      {item.subject}
                    </span>
                    <span className="text-gray-500 text-xs truncate max-w-[260px]">
                      {item.snippet}
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs whitespace-nowrap ml-3">
                     {new Date(item.time).toLocaleDateString()} {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-center p-4">
            No sent messages available.
          </div>
        )}
      </div>
    </div>
  );
};

export default Sent;
