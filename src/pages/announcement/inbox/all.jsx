import React, { useState, useEffect, useRef } from "react";
import { IconPin } from "@tabler/icons-react";
import AnnHeader from "../annHeader";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Compose from "../compose";

const All = () => {
  const navigate = useNavigate();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [draggingId, setDraggingId] = useState(null);
  const [dragX, setDragX] = useState(0);
  const startXRef = useRef(0);

 const [announcements, setAnnouncements] = useState(() => {
  const stored = localStorage.getItem("announcements");
  const defaults = [
    {
      id: 1,
      sender: "AdminUser",
      subject: "System Upgrade Notice",
      snippet: "We’ll be performing system maintenance tonight.",
      content:
        "Dear all, we’ll be upgrading our internal systems tonight from 10:00 PM to 2:00 AM. Please save your work and log out before the upgrade begins.",
      target: "All",
      unread: true,
      pinned: true,
      time: new Date(),
    },
    {
      id: 2,
      sender: "HRUser",
      subject: "Renewal",
      snippet: "Renewal of kineme kineme kinemberlu echosera",
      content:
        "Renewal of kineme kineme kinemberlu ng mga echosera ng taon sa RMBGH ",
      target: "All",
      unread: true,
      pinned: true,
      time: new Date(),
    },
  ];

  if (!stored) return defaults;

  const parsed = JSON.parse(stored);

  // Merge defaults that are missing
  defaults.forEach((d) => {
    if (!parsed.find((a) => a.id === d.id)) parsed.push(d);
  });

  return parsed;
});



  useEffect(
    () => localStorage.setItem("announcements", JSON.stringify(announcements)),
    [announcements]
  );

  const updateAnnouncements = (updated) => {
    setAnnouncements(updated);
    localStorage.setItem("announcements", JSON.stringify(updated));
  };

  const togglePin = (id, e) => {
    e.stopPropagation();
    const updated = announcements.map((a) =>
      a.id === id ? { ...a, pinned: !a.pinned } : a
    );
    updateAnnouncements(updated);
    toast.success(
      updated.find((a) => a.id === id).pinned ? "📌 Message pinned!" : "Message unpinned."
    );
  };

  const selectAnnouncement = (ann) =>
    navigate(`/view/${ann.id}`, { state: { email: ann } });

  const handleDelete = (id) => {
    const deleted = announcements.find((a) => a.id === id);
    const updated = announcements.filter((a) => a.id !== id);
    updateAnnouncements(updated);
    toast((t) => (
      <div className="flex items-center gap-4">
        <span>Announcement deleted</span>
        <button
          onClick={() => {
            updateAnnouncements([deleted, ...updated]);
            toast.dismiss(t.id);
          }}
          className="underline text-blue-500 hover:text-blue-700"
        >
          Undo
        </button>
      </div>
    ), { duration: 5000 });
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

  const filtered = announcements
    .filter((a) => a.target === "All")
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
    <div className="flex flex-col bg-white h-full">
      <AnnHeader
        search={search}
        setSearch={setSearch}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        onComposeClick={() => setIsComposeOpen(true)}
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
                  <span className="text-white font-semibold text-sm">Delete</span>
                </div>

<div
  onClick={() => selectAnnouncement(item)}
  className={`relative flex flex-col justify-between py-2 px-4 border-b cursor-pointer transition-transform ${
    item.unread ? "bg-gray-100" : "bg-white"
  } hover:bg-gray-50`}
  style={{
    transform: isDragging ? `translateX(${dragX}px)` : "translateX(0)",
    transition: isDragging ? "none" : "transform 0.3s",
  }}
>
  {/* Top row: sender, pin, and date at far right */}
  <div className="flex items-center justify-between w-full">
    <span className="text-sm font-semibold text-gray-800">{item.sender}</span>

    <div className="flex items-center gap-3">
      <IconPin
        size={20}
        strokeWidth={1.8}
        className={`cursor-pointer transition ${
          item.pinned ? "text-blue-500" : "text-gray-400 hover:text-blue-500"
        }`}
        onClick={(e) => togglePin(item.id, e)}
      />
      <span className="text-gray-400 text-xs whitespace-nowrap">
        {new Date(item.time).toLocaleDateString()} {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

      </span>
    </div>
  </div>

  {/* Subject */}
  <span className="text-gray-700 text-sm truncate font-medium">{item.subject}</span>

  {/* Snippet */}
  <span className="text-gray-500 text-xs truncate max-w-[260px]">{item.snippet}</span>

  {/* Optional file */}
  {item.file && (
    <div className="text-xs text-gray-500 mt-1">
      📎{" "}
      <a href={URL.createObjectURL(item.file)} target="_blank" rel="noreferrer">
        {item.file.name}
      </a>
    </div>
  )}

  {/* Optional links */}
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



                 {/* <span className="text-gray-400 text-xs whitespace-nowrap ml-3">
                    {new Date(item.time).toLocaleDateString()}
                  </span> */}
         
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-center p-4">
            No general announcements available.
          </div>
        )}
      </div>

      {isComposeOpen && (
        <Compose
          isOpen={isComposeOpen}
          onClose={() => setIsComposeOpen(false)}
          onSend={(data) => {
            const newAnn = {
              id: Date.now(),
              sender: "AdminUser",
              subject: data.subject,
              snippet: data.message.slice(0, 50),
              content: data.content,
              target: data.department,
              file: data.file || null,
              links: data.links || [],
              unread: true,
              pinned: false,
              time: new Date(),
            };
            setAnnouncements((prev) => [newAnn, ...prev]);
            toast.success("Announcement sent!");
          }}
        />
      )}
    </div>
  );
};

export default All;
