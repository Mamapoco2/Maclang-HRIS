import React, { useState, useRef } from "react";
import { IconPin } from "@tabler/icons-react";
import AnnHeader from "../annHeader";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Department = () => {
  const navigate = useNavigate();
  const currentUserDepartment = "IT Department";

  const defaultAnnouncements = [
    {
      id: 1,
      sender: "IT Head",
      subject: "Internal IT Update",
      snippet: "System patch will be deployed this week.",
      time: new Date(),
      content:
        "Attention IT Team — we’ll deploy a security patch this week. Please check your system access on Friday.",
      target: currentUserDepartment,
      unread: true,
      pinned: false,
    },
    {
      id: 2,
      sender: "IT Supervisor",
      subject: "Weekly Stand-up Reminder",
      snippet: "Meeting every Monday, 9:00 AM at the IT Lab.",
      time: new Date(),
      content:
        "Reminder: Our IT team weekly stand-up will be held at 9:00 AM in the IT Lab. Please be on time.",
      target: currentUserDepartment,
      unread: true,
      pinned: false,
    },
  ];

  const [announcements, setAnnouncements] = useState(defaultAnnouncements);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [draggingId, setDraggingId] = useState(null);
  const [dragX, setDragX] = useState(0);
  const startXRef = useRef(0);

  const togglePin = (id, e) => {
    e.stopPropagation();
    const updated = announcements.map((a) =>
      a.id === id ? { ...a, pinned: !a.pinned } : a
    );
    setAnnouncements(updated);
    toast.success(
      updated.find((a) => a.id === id).pinned
        ? "📌 Message pinned!"
        : "Message unpinned."
    );
  };

  const selectAnnouncement = (ann) =>
    navigate(`/view/${ann.id}`, { state: { email: ann } });

  const handleDelete = (id) => {
    const deleted = announcements.find((a) => a.id === id);
    const updated = announcements.filter((a) => a.id !== id);
    setAnnouncements(updated);

    toast(
      (t) => (
        <div className="flex items-center gap-4">
          <span>Announcement deleted</span>
          <button
            onClick={() => {
              setAnnouncements([deleted, ...updated]);
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

  const onDrag = (e) => {
    if (draggingId !== null) {
      const currentX = e.type.includes("touch")
        ? e.touches[0].clientX
        : e.clientX;
      setDragX(currentX - startXRef.current);
    }
  };

  const endDrag = () => {
    if (draggingId && Math.abs(dragX) > 100) handleDelete(draggingId);
    setDraggingId(null);
    setDragX(0);
  };

  const filtered = announcements
    .filter((a) => a.target === currentUserDepartment)
    .filter((a) =>
      [a.sender, a.subject, a.snippet, a.content].some((f) =>
        f.toLowerCase().includes(search.toLowerCase())
      )
    )
    .filter((a) => {
      const annDate = new Date(a.time).setHours(0, 0, 0, 0);
      const from = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
      const to = toDate ? new Date(toDate).setHours(0, 0, 0, 0) : null;
      return (!from || annDate >= from) && (!to || annDate <= to);
    })
    .sort((a, b) => new Date(b.time) - new Date(a.time));

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
                <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-4">
                  <span className="text-white font-semibold text-sm">
                    Delete
                  </span>
                </div>

                <div
                  onClick={() => selectAnnouncement(item)}
                  className={`relative flex flex-col justify-between py-2 px-4 border-b cursor-pointer transition-transform ${
                    item.unread ? "bg-gray-100" : "bg-white"
                  } hover:bg-gray-50`}
                  style={{
                    transform: isDragging
                      ? `translateX(${dragX}px)`
                      : "translateX(0)",
                    transition: isDragging ? "none" : "transform 0.3s",
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-semibold text-gray-800">
                      {item.sender}
                    </span>

                    <div className="flex items-center gap-3">
                      <IconPin
                        size={20}
                        strokeWidth={1.8}
                        className={`cursor-pointer transition ${
                          item.pinned
                            ? "text-blue-500"
                            : "text-gray-400 hover:text-blue-500"
                        }`}
                        onClick={(e) => togglePin(item.id, e)}
                      />
                      <span className="text-gray-400 text-xs whitespace-nowrap">
                        {new Date(item.time).toLocaleDateString()}{" "}
                        {new Date(item.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <span className="text-gray-700 text-sm truncate font-medium">
                    {item.subject}
                  </span>
                  <span className="text-gray-500 text-xs truncate max-w-[260px]">
                    {item.snippet}
                  </span>

                  {item.file && (
                    <div className="text-xs text-gray-500 mt-1">
                      📎{" "}
                      <a
                        href={URL.createObjectURL(item.file)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.file.name}
                      </a>
                    </div>
                  )}

                  {item.links?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 text-xs underline"
                        >
                          🔗 Link {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-center p-4">
            No announcements for your department yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Department;
