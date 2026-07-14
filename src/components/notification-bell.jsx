// src/components/NotificationBell.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IconBell } from "@tabler/icons-react";
import {
  Bell,
  CheckCheck,
  MapPin,
  Monitor,
  Calendar,
  Clock,
  Tag,
  Building2,
  BookOpen,
} from "lucide-react";
import notificationService from "@/services/notificationService";
import getEcho from "@/lib/echo";
import notificationSound from "@/assets/ringtone.mp3";
import { useAuth } from "@/hooks/useAuth";

const TYPE_DOT = {
  leave: "bg-orange-400",
  account_pending: "bg-blue-500",
  announcement: "bg-purple-400",
  training: "bg-cyan-400",
};

const ADMIN_ROLES = ["SuperAdmin", "HR", "Admin"];

// ─── shared audio context unlocked on first user gesture ─────────────────────
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx)
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") ctx.resume();
}

async function playAccountSound() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") await ctx.resume();

    const response = await fetch(notificationSound);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.6;

    source.buffer = audioBuffer;
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);
  } catch (err) {
    console.error("Audio play failed:", err);
  }
}

// ─── format ISO → "Mar 24, 2026, 9:00 AM" ───────────────────────────────────
function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ─── training detail card ─────────────────────────────────────────────────────
function TrainingDetails({ data }) {
  if (!data) return null;

  const rows = [
    { icon: BookOpen, label: "Program", value: data.program },
    { icon: Building2, label: "Department", value: data.department },
    { icon: Tag, label: "Category", value: data.category },
    { icon: MapPin, label: "Location", value: data.location },
    {
      icon: Monitor,
      label: "Mode",
      value: data.mode?.replace("-", " "),
      capitalize: true,
    },
    { icon: Calendar, label: "Start", value: formatDate(data.start_date) },
    { icon: Calendar, label: "End", value: formatDate(data.end_date) },
    { icon: Clock, label: "Duration", value: data.duration },
  ].filter((r) => r.value);

  if (rows.length === 0) return null;

  return (
    <div className="mt-2 rounded-lg border border-cyan-200 bg-cyan-50/60 dark:border-cyan-800 dark:bg-cyan-950/20 p-2.5 space-y-1.5">
      {rows.map(({ icon: Icon, label, value, capitalize }) => (
        <div key={label} className="flex items-start gap-2">
          <Icon className="h-3 w-3 mt-0.5 shrink-0 text-cyan-600 dark:text-cyan-400" />
          <span className="text-[11px] text-muted-foreground shrink-0 w-16">
            {label}:
          </span>
          <span
            className={`text-[11px] font-medium text-foreground leading-tight ${capitalize ? "capitalize" : ""}`}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── component ────────────────────────────────────────────────────────────────
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = !!user?.roles?.some?.((r) => ADMIN_ROLES.includes(r));

  // ── unlock AudioContext on any user interaction ────────────────────────────
  useEffect(() => {
    const unlock = () => {
      unlockAudio();
      document.removeEventListener("click", unlock);
      document.removeEventListener("keydown", unlock);
    };
    document.addEventListener("click", unlock);
    document.addEventListener("keydown", unlock);
    return () => {
      document.removeEventListener("click", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      const incoming = data.notifications ?? [];
      setNotifications(incoming);
      setUnreadCount(data.unread_count ?? 0);
    } catch (err) {
      console.error("fetchNotifications error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);

    const echo = getEcho();
    let channelNames = [];

    if (echo) {
      const handleIncoming = (payload) => {
        const currentUserId = parseInt(localStorage.getItem("user_id") ?? "0");
        if (
          payload.posted_by_user_id &&
          payload.posted_by_user_id === currentUserId
        )
          return;

        // ✅ Play sound immediately from the WebSocket event — no fetch latency
        if (payload.type === "account_pending") {
          playAccountSound();
        }

        fetchNotifications();
      };

      echo
        .private("notifications")
        .listen(".notification.created", handleIncoming);
      channelNames.push("notifications");

      if (isAdmin) {
        echo
          .private("admin.notifications")
          .listen(".notification.created", handleIncoming);
        channelNames.push("admin.notifications");
      }
    }

    return () => {
      clearInterval(interval);
      if (echo) {
        channelNames.forEach((name) => echo.leave(name));
      }
    };
  }, [fetchNotifications, isAdmin]);

  // ── close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open) fetchNotifications();
  };

  const handleMarkRead = async (id) => {
    await notificationService.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // ── navigate to the relevant page when a notification is clicked ───────────
  const handleNotificationClick = (n) => {
    if (!n.read) handleMarkRead(n.id);

    const type = n.type?.toLowerCase();

    if (type === "training") {
      setOpen(false);
      const trainingId = n.data?.training_id;
      if (trainingId) {
        navigate(`/trainings?training=${trainingId}`);
      } else {
        navigate("/trainings");
      }
    } else if (type === "announcement") {
      setOpen(false);
      navigate("/Announcement");
    }
  };

  return (
    <div className="relative" ref={ref}>
      {/* ── bell button ── */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={handleOpen}
      >
        <IconBell size={20} stroke={1.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {/* ── dropdown ── */}
      {open && (
        <div className="absolute right-0 top-10 z-50 w-[26rem] rounded-xl border border-border bg-popover shadow-xl overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 dark:bg-red-950 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* list */}
          <div className="max-h-[32rem] overflow-y-auto divide-y divide-border">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <Bell className="h-8 w-8 opacity-30" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map((n) => {
                const normalizedType = n.type?.toLowerCase();
                return (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-muted/50 transition-colors ${
                      !n.read ? "bg-blue-50/60 dark:bg-blue-950/20" : ""
                    } ${normalizedType === "training" || normalizedType === "announcement" ? "cursor-pointer" : ""}`}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TYPE_DOT[normalizedType] ?? "bg-gray-400"}`}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm truncate ${!n.read ? "font-semibold" : "font-medium"}`}
                        >
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-0.5">
                        {n.message}
                      </p>

                      {normalizedType === "training" && n.data && (
                        <TrainingDetails data={n.data} />
                      )}

                      <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                        {n.time}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
