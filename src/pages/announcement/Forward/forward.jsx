import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Megaphone,
  Search,
  Filter,
  Plus,
  Bell,
  AlertTriangle,
  Eye,
  Download,
  MessageSquare,
  Send,
  Pencil,
  Trash2,
  FileText,
  FileSpreadsheet,
  FileImage,
  Paperclip,
  Upload,
  FilePlus,
  X,
  ChevronDown,
  Calendar,
  Building2,
  Check,
  MoreVertical,
  BookOpen,
  SmilePlus,
  Pin,
  PinOff,
  Archive,
  ArrowUpDown,
  Reply,
  CornerDownRight,
  Bookmark,
  CheckCheck,
  ChevronUp,
  Copy,
  Share2,
  BellOff,
} from "lucide-react";

// ─── Seed Data ────────────────────────────────────────────────────────────────

const CURRENT_USER = {
  id: "u0",
  name: "Alex Rivera",
  initials: "AR",
  dept: "HR",
};

const VIEWER_POOL = [
  { id: "v1", initials: "JL", name: "James Lim" },
  { id: "v2", initials: "SR", name: "Sofia Reyes" },
  { id: "v3", initials: "DC", name: "David Chen" },
  { id: "v4", initials: "TK", name: "Tina Kim" },
  { id: "v5", initials: "NB", name: "Noel Bautista" },
  { id: "v6", initials: "PW", name: "Paula Wu" },
  { id: "v7", initials: "EM", name: "Ethan Marsh" },
  { id: "v8", initials: "RO", name: "Rosa Ocampo" },
];

const INITIAL_ANNOUNCEMENTS = [
  {
    id: "a1",
    title: "Q3 Performance Review Schedule – Action Required",
    description:
      "All managers are required to complete performance reviews for their direct reports between July 14–28. Please ensure all goal-setting templates are submitted prior to scheduling review meetings. HR will send calendar invites once templates are confirmed. For guidance, refer to the attached review handbook and scoring rubric.\n\nKey deadlines:\n• July 14 – Template submission opens\n• July 21 – Mid-cycle check-in reminders sent\n• July 28 – All reviews must be completed\n\nContact your HR Business Partner with any questions.",
    priority: "urgent",
    author: {
      id: "u1",
      name: "Maria Santos",
      initials: "MS",
      dept: "Human Resources",
    },
    postedAt: new Date("2025-07-08T09:15:00"),
    views: 312,
    downloads: 47,
    pinned: true,
    archived: false,
    unread: true,
    viewers: VIEWER_POOL.slice(0, 8),
    reactions: { like: 14, love: 6, insightful: 9, celebrate: 2 },
    attachments: [
      { id: "f1", name: "Q3_Review_Handbook.pdf", type: "pdf", size: "2.4 MB" },
      {
        id: "f2",
        name: "Scoring_Rubric_2025.xlsx",
        type: "xlsx",
        size: "840 KB",
      },
    ],
    comments: [
      {
        id: "c1",
        authorId: "u2",
        author: "James Lim",
        initials: "JL",
        text: "Will the system allow backdated submissions if a manager was on leave?",
        postedAt: new Date("2025-07-08T10:30:00"),
        replies: [
          {
            id: "r1",
            authorId: "u1",
            author: "Maria Santos",
            initials: "MS",
            text: "Yes — email hrbp@company.com to request a backdated window with the dates of leave.",
            postedAt: new Date("2025-07-08T11:00:00"),
          },
        ],
      },
      {
        id: "c2",
        authorId: "u0",
        author: "Alex Rivera",
        initials: "AR",
        text: "Thanks for the heads-up, Maria. Sharing with the team now.",
        postedAt: new Date("2025-07-08T11:05:00"),
        replies: [],
      },
    ],
  },
  {
    id: "a2",
    title: "New Hybrid Work Policy Effective August 1",
    description:
      "Following the company-wide survey conducted in June, we are formalizing our hybrid work arrangement. Beginning August 1, all employees are expected to be on-site a minimum of three days per week (Tuesday, Wednesday, and one self-selected day).\n\nDepartment heads may define additional requirements based on operational needs. Remote day scheduling must be coordinated with your direct manager and logged in the HRM system by the preceding Friday.",
    priority: "important",
    author: {
      id: "u3",
      name: "David Chen",
      initials: "DC",
      dept: "People Operations",
    },
    postedAt: new Date("2025-07-06T14:00:00"),
    views: 541,
    downloads: 88,
    pinned: false,
    archived: false,
    unread: true,
    viewers: VIEWER_POOL.slice(0, 5),
    reactions: { like: 31, love: 8, insightful: 5, celebrate: 0 },
    attachments: [
      {
        id: "f3",
        name: "Hybrid_Policy_Aug2025.pdf",
        type: "pdf",
        size: "1.1 MB",
      },
      {
        id: "f4",
        name: "Schedule_Template.docx",
        type: "docx",
        size: "210 KB",
      },
    ],
    comments: [
      {
        id: "c3",
        authorId: "u4",
        author: "Sofia Reyes",
        initials: "SR",
        text: "Does this apply to contractors on long-term engagements as well?",
        postedAt: new Date("2025-07-06T15:20:00"),
        replies: [],
      },
    ],
  },
  {
    id: "a3",
    title: "Open Enrollment for Benefits – Closes July 15",
    description:
      "Annual open enrollment for health, dental, and vision benefits is now open. All elections must be submitted through the BenefitsHub portal before July 15 at 11:59 PM. Changes made during this window will take effect September 1.\n\nA benefits overview presentation is attached for reference. The HR team will also be hosting a live Q&A session on July 10 at 2:00 PM via Zoom.",
    priority: "normal",
    author: {
      id: "u1",
      name: "Maria Santos",
      initials: "MS",
      dept: "Human Resources",
    },
    postedAt: new Date("2025-07-03T08:45:00"),
    views: 198,
    downloads: 34,
    pinned: false,
    archived: false,
    unread: false,
    viewers: VIEWER_POOL.slice(0, 3),
    reactions: { like: 7, love: 3, insightful: 2, celebrate: 11 },
    attachments: [
      {
        id: "f5",
        name: "Benefits_Overview_2025.pptx",
        type: "pptx",
        size: "3.7 MB",
      },
      { id: "f6", name: "Enrollment_Guide.pdf", type: "pdf", size: "950 KB" },
      {
        id: "f7",
        name: "Wellness_Plan_Comparison.xlsx",
        type: "xlsx",
        size: "420 KB",
      },
    ],
    comments: [],
  },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatRelativeTime(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatFullDate(date) {
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PRIORITY_CONFIG = {
  normal: {
    label: "Normal",
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
    icon: Bell,
  },
  important: {
    label: "Important",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: AlertTriangle,
  },
  urgent: {
    label: "Urgent",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: AlertTriangle,
  },
};

const FILE_CONFIG = {
  pdf: { icon: FileText, color: "text-red-500", bg: "bg-red-50", label: "PDF" },
  docx: {
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-50",
    label: "DOCX",
  },
  xlsx: {
    icon: FileSpreadsheet,
    color: "text-green-600",
    bg: "bg-green-50",
    label: "XLSX",
  },
  pptx: {
    icon: BookOpen,
    color: "text-orange-500",
    bg: "bg-orange-50",
    label: "PPTX",
  },
  jpg: {
    icon: FileImage,
    color: "text-purple-500",
    bg: "bg-purple-50",
    label: "JPG",
  },
  png: {
    icon: FileImage,
    color: "text-purple-500",
    bg: "bg-purple-50",
    label: "PNG",
  },
};

const REACTION_TYPES = [
  { key: "like", label: "Like", icon: "👍" },
  { key: "love", label: "Love", icon: "❤️" },
  { key: "insightful", label: "Insightful", icon: "💡" },
  { key: "celebrate", label: "Celebrate", icon: "🎉" },
];

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-violet-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
];
function authorColor(id) {
  return AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];
}

// ─── Toast System ─────────────────────────────────────────────────────────────

function ToastContainer({ toasts }) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white text-sm rounded-xl shadow-lg animate-fade-in-up pointer-events-auto"
        >
          {t.icon && <span className="text-base leading-none">{t.icon}</span>}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((message, icon = null) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, icon }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }, []);
  return { toasts, toast };
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ initials, size = "md", colorClass = "" }) {
  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base",
  };
  return (
    <div
      className={`${sizes[size]} ${colorClass || "bg-blue-600"} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

// ─── Priority Badge ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

// ─── Viewer List Modal ────────────────────────────────────────────────────────

function ViewerListModal({ viewers, total, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Viewed by</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {total.toLocaleString()} total views
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto max-h-72 divide-y divide-slate-50">
          {viewers.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${authorColor(v.id)}`}
              >
                {v.initials}
              </div>
              <span className="text-sm font-medium text-slate-700">
                {v.name}
              </span>
            </div>
          ))}
          {total > viewers.length && (
            <div className="px-5 py-3 text-xs text-slate-400 text-center">
              +{total - viewers.length} more people viewed this
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Viewer Avatar Stack ──────────────────────────────────────────────────────

function ViewerAvatarStack({ viewers, total }) {
  const [showModal, setShowModal] = useState(false);
  const shown = viewers.slice(0, 4);
  const overflow = total - shown.length;
  return (
    <>
      <button
        onClick={() => viewers.length > 0 && setShowModal(true)}
        className="flex items-center gap-2 group"
        title="See who viewed this"
      >
        <div className="flex items-center">
          {shown.map((v, i) => (
            <div
              key={v.id}
              className="relative"
              style={{
                marginLeft: i === 0 ? 0 : "-8px",
                zIndex: shown.length - i,
              }}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold ring-2 ring-white transition-transform group-hover:scale-110 ${authorColor(v.id)}`}
              >
                {v.initials}
              </div>
            </div>
          ))}
          {overflow > 0 && (
            <div
              className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500 ring-2 ring-white"
              style={{ marginLeft: "-8px", zIndex: 0 }}
            >
              +{overflow}
            </div>
          )}
        </div>
        <span className="text-xs text-slate-400 tabular-nums group-hover:text-slate-600 transition-colors">
          {total.toLocaleString()} views
        </span>
      </button>
      {showModal && (
        <ViewerListModal
          viewers={viewers}
          total={total}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

// ─── Attachment Card ──────────────────────────────────────────────────────────

function AttachmentCard({ file, onPreview, onDownload, downloadCount }) {
  const cfg = FILE_CONFIG[file.type] || FILE_CONFIG.pdf;
  const Icon = cfg.icon;
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm transition-all group">
      <div
        className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}
      >
        <Icon size={20} className={cfg.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">
          {file.name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {cfg.label} · {file.size}
        </p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onPreview(file)}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
          title="Preview"
        >
          <Eye size={14} />
        </button>
        <button
          onClick={() => onDownload(file)}
          className="p-1.5 rounded-lg hover:bg-blue-100 text-slate-500 hover:text-blue-600 transition-colors"
          title="Download"
        >
          <Download size={14} />
        </button>
      </div>
      {downloadCount > 0 && (
        <span className="text-xs text-slate-400 tabular-nums flex-shrink-0">
          {downloadCount}
        </span>
      )}
    </div>
  );
}

// ─── Preview Modal ────────────────────────────────────────────────────────────

function PreviewModal({ file, onClose }) {
  if (!file) return null;
  const isImage = ["jpg", "png", "gif", "webp"].includes(file.type);
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Paperclip size={16} className="text-slate-400" />
            <span className="font-semibold text-slate-800 text-sm">
              {file.name}
            </span>
            <span className="text-xs text-slate-400">{file.size}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          {isImage ? (
            <p className="text-slate-500 text-sm">
              Image preview would render here.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                <Eye size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">Preview unavailable</p>
              <p className="text-slate-400 text-sm">
                Download the file to view it on your device.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Reactions Bar ────────────────────────────────────────────────────────────

function ReactionsBar({ annId, initialReactions, onReact }) {
  const [reactions, setReactions] = useState(initialReactions);
  const [myReaction, setMyReaction] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target))
        setPickerOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleReact(key) {
    setReactions((prev) => {
      const next = { ...prev };
      if (myReaction === key) {
        next[key] = Math.max(0, (next[key] || 0) - 1);
        setMyReaction(null);
      } else {
        if (myReaction)
          next[myReaction] = Math.max(0, (next[myReaction] || 0) - 1);
        next[key] = (next[key] || 0) + 1;
        setMyReaction(key);
        onReact && onReact(REACTION_TYPES.find((r) => r.key === key));
      }
      return next;
    });
    setPickerOpen(false);
  }

  const activeTypes = REACTION_TYPES.filter((r) => reactions[r.key] > 0);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {activeTypes.map((r) => (
        <button
          key={r.key}
          onClick={() => handleReact(r.key)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
            myReaction === r.key
              ? "bg-blue-50 border-blue-300 text-blue-700 shadow-sm"
              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
          }`}
          title={r.label}
        >
          <span className="text-sm leading-none">{r.icon}</span>
          <span className="tabular-nums">{reactions[r.key]}</span>
        </button>
      ))}
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setPickerOpen((o) => !o)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all ${pickerOpen ? "bg-slate-100 border-slate-300 text-slate-700" : "border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600"}`}
        >
          <SmilePlus size={13} />
          {activeTypes.length === 0 && <span>React</span>}
        </button>
        {pickerOpen && (
          <div className="absolute bottom-full mb-2 left-0 bg-white rounded-2xl shadow-xl border border-slate-200 flex gap-1 p-2 z-20">
            {REACTION_TYPES.map((r) => (
              <button
                key={r.key}
                onClick={() => handleReact(r.key)}
                title={r.label}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all hover:scale-125 hover:bg-slate-50 ${myReaction === r.key ? "bg-blue-50 ring-2 ring-blue-300" : ""}`}
              >
                {r.icon}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Comment Section ──────────────────────────────────────────────────────────

const MAX_COMMENT_LENGTH = 500;

function CommentItem({ c, onEdit, onDelete, onReply }) {
  const [showReplies, setShowReplies] = useState(true);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState(c.replies || []);

  function submitReply() {
    if (!replyText.trim()) return;
    const r = {
      id: `r_${Date.now()}`,
      authorId: CURRENT_USER.id,
      author: CURRENT_USER.name,
      initials: CURRENT_USER.initials,
      text: replyText.trim(),
      postedAt: new Date(),
    };
    setReplies((prev) => [...prev, r]);
    onReply && onReply(c.id, [...replies, r]);
    setReplyText("");
    setReplying(false);
  }

  return (
    <div className="flex gap-3 group">
      <Avatar
        initials={c.initials}
        size="sm"
        colorClass={authorColor(c.authorId)}
      />
      <div className="flex-1 min-w-0">
        <div className="bg-slate-50 rounded-xl px-4 py-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-700">
              {c.author}
            </span>
            <span className="text-xs text-slate-400">
              {formatRelativeTime(c.postedAt)}
            </span>
          </div>
          <p className="text-sm text-slate-600">{c.text}</p>
        </div>

        <div className="flex items-center gap-3 mt-1 px-1">
          <button
            onClick={() => setReplying((r) => !r)}
            className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <Reply size={11} /> Reply
          </button>
          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies((s) => !s)}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
            >
              <CornerDownRight size={11} />
              {showReplies ? "Hide" : `${replies.length}`}{" "}
              {replies.length === 1 ? "reply" : "replies"}
            </button>
          )}
          {c.authorId === CURRENT_USER.id && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
              <button
                onClick={() => onEdit(c)}
                className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
              >
                <Pencil size={11} /> Edit
              </button>
              <button
                onClick={() => onDelete(c.id)}
                className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <Trash2 size={11} /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Replies */}
        {showReplies && replies.length > 0 && (
          <div className="mt-2 ml-4 space-y-2 border-l-2 border-slate-100 pl-3">
            {replies.map((r) => (
              <div key={r.id} className="flex gap-2">
                <Avatar
                  initials={r.initials}
                  size="sm"
                  colorClass={authorColor(r.authorId)}
                />
                <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-slate-700">
                      {r.author}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatRelativeTime(r.postedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reply input */}
        {replying && (
          <div className="mt-2 ml-4 flex gap-2">
            <Avatar
              initials={CURRENT_USER.initials}
              size="sm"
              colorClass={authorColor(CURRENT_USER.id)}
            />
            <div className="flex-1 flex gap-2">
              <input
                className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 placeholder:text-slate-400"
                placeholder={`Reply to ${c.author}…`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitReply()}
                autoFocus
              />
              <button
                onClick={submitReply}
                disabled={!replyText.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                <Send size={13} />
              </button>
              <button
                onClick={() => setReplying(false)}
                className="px-3 py-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CommentSection({ announcementId, comments: initial, onUpdate }) {
  const [comments, setComments] = useState(initial);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const remaining = MAX_COMMENT_LENGTH - draft.length;

  function submit() {
    if (!draft.trim() || draft.length > MAX_COMMENT_LENGTH) return;
    const c = {
      id: `c_${Date.now()}`,
      authorId: CURRENT_USER.id,
      author: CURRENT_USER.name,
      initials: CURRENT_USER.initials,
      text: draft.trim(),
      postedAt: new Date(),
      replies: [],
    };
    const updated = [...comments, c];
    setComments(updated);
    onUpdate(announcementId, updated);
    setDraft("");
  }

  function saveEdit(id) {
    if (!editText.trim()) return;
    const updated = comments.map((c) =>
      c.id === id ? { ...c, text: editText.trim() } : c,
    );
    setComments(updated);
    onUpdate(announcementId, updated);
    setEditingId(null);
  }

  function deleteComment(id) {
    const updated = comments.filter((c) => c.id !== id);
    setComments(updated);
    onUpdate(announcementId, updated);
  }

  function startEdit(c) {
    setEditingId(c.id);
    setEditText(c.text);
  }

  return (
    <div className="border-t border-slate-100 pt-4 space-y-4">
      {comments.map((c) =>
        editingId === c.id ? (
          <div key={c.id} className="flex gap-3">
            <Avatar
              initials={c.initials}
              size="sm"
              colorClass={authorColor(c.authorId)}
            />
            <div className="flex-1 space-y-2">
              <textarea
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => saveEdit(c.id)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <Check size={12} /> Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-600 text-xs rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <CommentItem
            key={c.id}
            c={c}
            onEdit={startEdit}
            onDelete={deleteComment}
          />
        ),
      )}

      {/* New comment */}
      <div className="flex gap-3">
        <Avatar
          initials={CURRENT_USER.initials}
          size="sm"
          colorClass={authorColor(CURRENT_USER.id)}
        />
        <div className="flex-1">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 placeholder:text-slate-400"
                placeholder="Add a comment…"
                value={draft}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_COMMENT_LENGTH)
                    setDraft(e.target.value);
                }}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                maxLength={MAX_COMMENT_LENGTH}
              />
            </div>
            <button
              onClick={submit}
              disabled={!draft.trim()}
              className="px-3 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center"
            >
              <Send size={14} />
            </button>
          </div>
          {draft.length > 0 && (
            <p
              className={`text-xs mt-1 text-right ${remaining < 50 ? "text-amber-500" : "text-slate-400"}`}
            >
              {remaining} left
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Card Overflow Menu ───────────────────────────────────────────────────────

function CardMenu({ ann, onPin, onArchive, onEdit, onCopyLink, toast }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isOwn = ann.author.id === CURRENT_USER.id;

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function action(fn) {
    fn();
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-xl z-30 overflow-hidden py-1">
          {isOwn && (
            <button
              onClick={() => action(onEdit)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Pencil size={14} className="text-slate-400" /> Edit announcement
            </button>
          )}
          <button
            onClick={() => action(onPin)}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {ann.pinned ? (
              <PinOff size={14} className="text-slate-400" />
            ) : (
              <Pin size={14} className="text-slate-400" />
            )}
            {ann.pinned ? "Unpin" : "Pin to top"}
          </button>
          <button
            onClick={() => action(onCopyLink)}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Copy size={14} className="text-slate-400" /> Copy link
          </button>
          <div className="h-px bg-slate-100 my-1" />
          <button
            onClick={() => action(onArchive)}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Archive size={14} /> {ann.archived ? "Unarchive" : "Archive"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Edit Announcement Modal ──────────────────────────────────────────────────

function EditModal({ ann, onClose, onSave }) {
  const [title, setTitle] = useState(ann.title);
  const [description, setDescription] = useState(ann.description);
  const [priority, setPriority] = useState(ann.priority);
  const [errors, setErrors] = useState({});

  function save() {
    const e = {};
    if (!title.trim()) e.title = "Title is required.";
    if (!description.trim()) e.description = "Description is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSave({
      ...ann,
      title: title.trim(),
      description: description.trim(),
      priority,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Pencil size={15} className="text-amber-600" />
            </div>
            <h2 className="font-bold text-slate-900">Edit Announcement</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? "border-red-400 bg-red-50" : "border-slate-200"}`}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((p) => ({ ...p, title: "" }));
              }}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.description ? "border-red-400 bg-red-50" : "border-slate-200"}`}
              rows={5}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((p) => ({ ...p, description: "" }));
              }}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Priority
            </label>
            <div className="flex gap-2">
              {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setPriority(key)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${priority === key ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm` : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Check size={15} /> Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-slate-200 rounded-full w-40" />
            <div className="h-3 bg-slate-100 rounded-full w-24" />
          </div>
        </div>
      </div>
      <div className="px-6 pb-4 space-y-2">
        <div className="h-4 bg-slate-200 rounded-full w-3/4" />
        <div className="h-3 bg-slate-100 rounded-full w-full" />
        <div className="h-3 bg-slate-100 rounded-full w-5/6" />
      </div>
      <div className="px-6 pb-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="px-6 py-3 border-t border-slate-100 flex gap-5">
        <div className="h-3 bg-slate-100 rounded-full w-20" />
        <div className="h-3 bg-slate-100 rounded-full w-12" />
        <div className="h-3 bg-slate-100 rounded-full w-16" />
      </div>
    </div>
  );
}

// ─── Announcement Card ────────────────────────────────────────────────────────

function AnnouncementCard({
  ann,
  onUpdateComments,
  onPin,
  onArchive,
  onEdit,
  onUpdateAnn,
  toast,
}) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [downloadCounts, setDownloadCounts] = useState({});
  const [totalDownloads, setTotalDownloads] = useState(ann.downloads);
  const [isRead, setIsRead] = useState(!ann.unread);
  const [editOpen, setEditOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(ann.comments.length);

  const isLong = ann.description.length > 300;
  const displayText =
    isLong && !expanded ? ann.description.slice(0, 280) + "…" : ann.description;

  function handleExpand() {
    setExpanded((e) => !e);
    if (!isRead) setIsRead(true);
  }

  function handleDownload(file) {
    setDownloadCounts((prev) => ({
      ...prev,
      [file.id]: (prev[file.id] || 0) + 1,
    }));
    setTotalDownloads((prev) => prev + 1);
    toast(`Downloading ${file.name}`, "⬇️");
  }

  function handleUpdateComments(annId, comments) {
    setCommentCount(comments.length);
    onUpdateComments(annId, comments);
  }

  return (
    <>
      <div
        className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${ann.pinned ? "border-blue-200 ring-1 ring-blue-100" : "border-slate-200"}`}
      >
        {/* Pinned banner */}
        {ann.pinned && (
          <div className="flex items-center gap-2 px-5 py-2 bg-blue-50 border-b border-blue-100">
            <Pin size={11} className="text-blue-500" />
            <span className="text-xs font-semibold text-blue-600">
              Pinned announcement
            </span>
          </div>
        )}

        {/* Unread dot + header */}
        <div className="px-6 pt-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <Avatar
                  initials={ann.author.initials}
                  colorClass={authorColor(ann.author.id)}
                />
                {!isRead && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-800 text-sm">
                    {ann.author.name}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Building2 size={11} />
                    {ann.author.dept}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span
                    className="text-xs text-slate-400 flex items-center gap-1"
                    title={formatFullDate(ann.postedAt)}
                  >
                    <Calendar size={11} />
                    {formatRelativeTime(ann.postedAt)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                  <PriorityBadge priority={ann.priority} />
                  {!isRead && (
                    <span className="text-xs font-semibold text-blue-500 flex items-center gap-1">
                      <Bell size={10} /> New
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!isRead && (
                <button
                  onClick={() => setIsRead(true)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Mark as read"
                >
                  <CheckCheck size={15} />
                </button>
              )}
              <CardMenu
                ann={ann}
                onPin={() => {
                  onPin(ann.id);
                  toast(
                    ann.pinned ? "Unpinned" : "Pinned to top",
                    ann.pinned ? "📌" : "📌",
                  );
                }}
                onArchive={() => {
                  onArchive(ann.id);
                  toast(ann.archived ? "Unarchived" : "Archived", "🗂️");
                }}
                onEdit={() => setEditOpen(true)}
                onCopyLink={() => {
                  navigator.clipboard?.writeText(
                    `${window.location.href}#${ann.id}`,
                  );
                  toast("Link copied", "🔗");
                }}
                toast={toast}
              />
            </div>
          </div>
        </div>

        {/* Priority accent */}
        {ann.priority !== "normal" && (
          <div
            className={`h-0.5 mx-6 rounded-full mb-4 ${ann.priority === "urgent" ? "bg-red-400" : "bg-amber-400"}`}
          />
        )}

        {/* Content */}
        <div className="px-6 pb-4">
          <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
            {ann.title}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {displayText}
          </p>
          {isLong && (
            <button
              onClick={handleExpand}
              className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
            >
              {expanded ? (
                <>
                  <ChevronUp size={12} /> Show less
                </>
              ) : (
                <>Read more</>
              )}
            </button>
          )}
        </div>

        {/* Attachments */}
        {ann.attachments.length > 0 && (
          <div className="px-6 pb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Paperclip size={11} /> Attachments ({ann.attachments.length})
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {ann.attachments.map((file) => (
                <AttachmentCard
                  key={file.id}
                  file={file}
                  onPreview={setPreviewFile}
                  onDownload={handleDownload}
                  downloadCount={downloadCounts[file.id] || 0}
                />
              ))}
            </div>
          </div>
        )}

        {/* Reactions */}
        <div className="px-6 pb-3">
          <ReactionsBar
            annId={ann.id}
            initialReactions={ann.reactions || {}}
            onReact={(r) => toast(`Reacted with ${r.label}`, r.icon)}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center gap-4 flex-wrap">
          <ViewerAvatarStack viewers={ann.viewers || []} total={ann.views} />
          <span className="text-slate-200">·</span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Download size={13} />
            {totalDownloads.toLocaleString()}
          </span>
          <button
            onClick={() => {
              setShowComments((s) => !s);
              if (!isRead) setIsRead(true);
            }}
            className={`flex items-center gap-1.5 text-xs transition-colors ml-auto ${showComments ? "text-blue-600 font-semibold" : "text-slate-500 hover:text-slate-700"}`}
          >
            <MessageSquare size={13} />
            {commentCount} {commentCount === 1 ? "comment" : "comments"}
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="px-6 pb-5">
            <CommentSection
              announcementId={ann.id}
              comments={ann.comments}
              onUpdate={handleUpdateComments}
            />
          </div>
        )}
      </div>

      <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      {editOpen && (
        <EditModal
          ann={ann}
          onClose={() => setEditOpen(false)}
          onSave={(updated) => {
            onUpdateAnn(updated);
            toast("Announcement updated", "✏️");
          }}
        />
      )}
    </>
  );
}

// ─── Create Modal ─────────────────────────────────────────────────────────────

function CreateModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!title.trim()) e.title = "Title is required.";
    if (!description.trim()) e.description = "Description is required.";
    return e;
  }

  function addFiles(raw) {
    const picked = Array.from(raw).map((f) => ({
      id: `nf_${Date.now()}_${Math.random()}`,
      name: f.name,
      type: f.name.split(".").pop().toLowerCase(),
      size:
        f.size < 1048576
          ? `${(f.size / 1024).toFixed(0)} KB`
          : `${(f.size / 1048576).toFixed(1)} MB`,
    }));
    setFiles((prev) => [...prev, ...picked]);
  }

  function publish() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onCreate({
      id: `a_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      priority,
      author: {
        id: CURRENT_USER.id,
        name: CURRENT_USER.name,
        initials: CURRENT_USER.initials,
        dept: CURRENT_USER.dept,
      },
      postedAt: new Date(),
      views: 0,
      downloads: 0,
      pinned: false,
      archived: false,
      unread: false,
      viewers: [],
      reactions: { like: 0, love: 0, insightful: 0, celebrate: 0 },
      attachments: files,
      comments: [],
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FilePlus size={16} className="text-blue-600" />
            </div>
            <h2 className="font-bold text-slate-900">New Announcement</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? "border-red-400 bg-red-50" : "border-slate-200"}`}
              placeholder="What is this announcement about?"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((p) => ({ ...p, title: "" }));
              }}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.description ? "border-red-400 bg-red-50" : "border-slate-200"}`}
              rows={5}
              placeholder="Write the full announcement here…"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((p) => ({ ...p, description: "" }));
              }}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Priority
            </label>
            <div className="flex gap-2">
              {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setPriority(key)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${priority === key ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm` : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Attachments
            </label>
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                addFiles(e.dataTransfer.files);
              }}
              className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${dragging ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"}`}
            >
              <Upload
                size={22}
                className={dragging ? "text-blue-500" : "text-slate-400"}
              />
              <p className="text-sm text-slate-500">
                <span className="font-medium text-blue-600">
                  Click to upload
                </span>{" "}
                or drag files here
              </p>
              <p className="text-xs text-slate-400">
                PDF, DOCX, XLSX, PPTX, JPG, PNG
              </p>
              <input
                type="file"
                className="hidden"
                multiple
                onChange={(e) => addFiles(e.target.files)}
                accept=".pdf,.docx,.xlsx,.pptx,.jpg,.jpeg,.png"
              />
            </label>
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((f) => {
                  const cfg = FILE_CONFIG[f.type] || FILE_CONFIG.pdf;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={f.id}
                      className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div
                        className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon size={14} className={cfg.color} />
                      </div>
                      <span className="text-sm text-slate-700 truncate flex-1">
                        {f.name}
                      </span>
                      <span className="text-xs text-slate-400">{f.size}</span>
                      <button
                        onClick={() =>
                          setFiles((p) => p.filter((x) => x.id !== f.id))
                        }
                        className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={publish}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Megaphone size={15} /> Publish
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Filter Popover ───────────────────────────────────────────────────────────

function FilterPopover({ filters, onChange, onClear }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = Object.values(filters).some(
    (v) => v && (Array.isArray(v) ? v.length > 0 : true),
  );

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${active ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
      >
        <Filter size={15} />
        Filters
        {active && <span className="w-2 h-2 rounded-full bg-blue-500" />}
        <ChevronDown
          size={13}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl z-30 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Filter</span>
            <button
              onClick={() => {
                onClear();
                setOpen(false);
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Priority
              </p>
              {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                <label
                  key={key}
                  className="flex items-center gap-2.5 cursor-pointer mb-1.5"
                >
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600"
                    checked={filters.priorities?.includes(key) || false}
                    onChange={(e) => {
                      const p = filters.priorities || [];
                      onChange({
                        ...filters,
                        priorities: e.target.checked
                          ? [...p, key]
                          : p.filter((x) => x !== key),
                      });
                    }}
                  />
                  <span className={`text-sm ${cfg.text}`}>{cfg.label}</span>
                </label>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Department
              </p>
              {[
                "Human Resources",
                "People Operations",
                "Finance",
                "Engineering",
              ].map((dept) => (
                <label
                  key={dept}
                  className="flex items-center gap-2.5 cursor-pointer mb-1.5"
                >
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600"
                    checked={filters.departments?.includes(dept) || false}
                    onChange={(e) => {
                      const p = filters.departments || [];
                      onChange({
                        ...filters,
                        departments: e.target.checked
                          ? [...p, dept]
                          : p.filter((x) => x !== dept),
                      });
                    }}
                  />
                  <span className="text-sm text-slate-600">{dept}</span>
                </label>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Status
              </p>
              {[
                ["pinned", "Pinned only"],
                ["unread", "Unread only"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2.5 cursor-pointer mb-1.5"
                >
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600"
                    checked={filters[key] || false}
                    onChange={(e) =>
                      onChange({ ...filters, [key]: e.target.checked })
                    }
                  />
                  <span className="text-sm text-slate-600">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="px-4 py-3 border-t border-slate-100">
            <button
              onClick={() => setOpen(false)}
              className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sort Control ─────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { key: "newest", label: "Newest first" },
  { key: "oldest", label: "Oldest first" },
  { key: "reactions", label: "Most reactions" },
  { key: "views", label: "Most viewed" },
];

function SortControl({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = SORT_OPTIONS.find((o) => o.key === value);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <ArrowUpDown size={13} />
        {current.label}
        <ChevronDown
          size={11}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl border border-slate-200 shadow-xl z-30 overflow-hidden py-1">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => {
                onChange(o.key);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${value === o.key ? "text-blue-600 bg-blue-50 font-medium" : "text-slate-700 hover:bg-slate-50"}`}
            >
              {o.label}
              {value === o.key && <Check size={13} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HRISAnnouncementPage() {
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [loading] = useState(false);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState("newest");
  const [showCreate, setShowCreate] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const { toasts, toast } = useToast();

  const unreadCount = announcements.filter(
    (a) => a.unread && !a.archived,
  ).length;

  const processed = useMemo(() => {
    let list = announcements.filter((a) =>
      showArchived ? a.archived : !a.archived,
    );
    const q = query.toLowerCase();
    if (q)
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.author.dept.toLowerCase().includes(q) ||
          a.author.name.toLowerCase().includes(q),
      );
    if (filters.priorities?.length)
      list = list.filter((a) => filters.priorities.includes(a.priority));
    if (filters.departments?.length)
      list = list.filter((a) => filters.departments.includes(a.author.dept));
    if (filters.pinned) list = list.filter((a) => a.pinned);
    if (filters.unread) list = list.filter((a) => a.unread);

    list = [...list].sort((a, b) => {
      if (sort === "oldest") return a.postedAt - b.postedAt;
      if (sort === "reactions") {
        const ra = Object.values(a.reactions || {}).reduce((s, v) => s + v, 0);
        const rb = Object.values(b.reactions || {}).reduce((s, v) => s + v, 0);
        return rb - ra;
      }
      if (sort === "views") return b.views - a.views;
      return b.postedAt - a.postedAt;
    });

    // Pinned always float on top (unless in archive view)
    if (!showArchived) {
      const pinned = list.filter((a) => a.pinned);
      const rest = list.filter((a) => !a.pinned);
      list = [...pinned, ...rest];
    }

    return list;
  }, [announcements, query, filters, sort, showArchived]);

  function update(fn) {
    setAnnouncements((prev) => prev.map(fn));
  }

  function handleCreate(ann) {
    setAnnouncements((prev) => [ann, ...prev]);
    toast("Announcement published", "📣");
  }
  function handleUpdateComments(annId, comments) {
    update((a) => (a.id === annId ? { ...a, comments } : a));
  }
  function handlePin(id) {
    update((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a));
  }
  function handleArchive(id) {
    update((a) => (a.id === id ? { ...a, archived: !a.archived } : a));
  }
  function handleUpdateAnn(updated) {
    update((a) => (a.id === updated.id ? updated : a));
  }

  return (
    <div className="h-full flex flex-col" style={{ background: "#F8FAFC" }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-200">
                <Megaphone size={18} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-slate-900 text-lg leading-tight">
                    Company Announcements
                  </h1>
                  {unreadCount > 0 && !showArchived && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-tight">
                  {announcements.filter((a) => !a.archived).length} active
                  announcements
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 sm:flex-none sm:w-52">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 placeholder:text-slate-400 transition-all"
                  placeholder="Search…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <FilterPopover
                filters={filters}
                onChange={setFilters}
                onClear={() => setFilters({})}
              />
              <SortControl value={sort} onChange={setSort} />
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 flex-shrink-0"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">New</span>
              </button>
            </div>
          </div>

          {/* Archive toggle */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setShowArchived(false)}
              className={`text-xs font-semibold pb-0.5 border-b-2 transition-colors ${!showArchived ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
            >
              Active
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`text-xs font-semibold pb-0.5 border-b-2 transition-colors flex items-center gap-1 ${showArchived ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
            >
              <Archive size={11} /> Archived (
              {announcements.filter((a) => a.archived).length})
            </button>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w- mx-auto space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          ) : processed.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
                {showArchived ? (
                  <Archive size={36} className="text-slate-300" />
                ) : (
                  <Megaphone size={36} className="text-slate-300" />
                )}
              </div>
              <h3 className="font-bold text-slate-700 text-lg mb-2">
                {query || Object.values(filters).some(Boolean)
                  ? "No results found"
                  : showArchived
                    ? "No archived announcements"
                    : "No announcements yet"}
              </h3>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">
                {query || Object.values(filters).some(Boolean)
                  ? "Try adjusting your search or filters."
                  : showArchived
                    ? "Archived announcements will appear here."
                    : "Check back soon."}
              </p>
              {(query || Object.values(filters).some(Boolean)) && (
                <button
                  onClick={() => {
                    setQuery("");
                    setFilters({});
                  }}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            processed.map((ann) => (
              <AnnouncementCard
                key={ann.id}
                ann={ann}
                onUpdateComments={handleUpdateComments}
                onPin={handlePin}
                onArchive={handleArchive}
                onUpdateAnn={handleUpdateAnn}
                toast={toast}
              />
            ))
          )}
        </div>
      </div>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
