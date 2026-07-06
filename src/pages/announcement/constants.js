import {
  Bell,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  FileImage,
  BookOpen,
} from "lucide-react";

// ─── Current User & Viewer Pool ────────────────────────────────────────────

export const CURRENT_USER = {
  id: "u0",
  name: "Alex Rivera",
  initials: "AR",
  dept: "HR",
};

export const VIEWER_POOL = [
  { id: "v1", initials: "JL", name: "James Lim" },
  { id: "v2", initials: "SR", name: "Sofia Reyes" },
  { id: "v3", initials: "DC", name: "David Chen" },
  { id: "v4", initials: "TK", name: "Tina Kim" },
  { id: "v5", initials: "NB", name: "Noel Bautista" },
  { id: "v6", initials: "PW", name: "Paula Wu" },
  { id: "v7", initials: "EM", name: "Ethan Marsh" },
  { id: "v8", initials: "RO", name: "Rosa Ocampo" },
];

// ─── Seed Announcements ─────────────────────────────────────────────────────

export const INITIAL_ANNOUNCEMENTS = [
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

// ─── Config Maps ────────────────────────────────────────────────────────────

export const PRIORITY_CONFIG = {
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

export const FILE_CONFIG = {
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

export const REACTION_TYPES = [
  { key: "like", label: "Like", icon: "👍" },
  { key: "love", label: "Love", icon: "❤️" },
  { key: "insightful", label: "Insightful", icon: "💡" },
  { key: "celebrate", label: "Celebrate", icon: "🎉" },
];

export const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-violet-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
];

export const MAX_COMMENT_LENGTH = 500;

export const SORT_OPTIONS = [
  { key: "newest", label: "Newest first" },
  { key: "oldest", label: "Oldest first" },
  { key: "reactions", label: "Most reactions" },
  { key: "views", label: "Most viewed" },
];

export const FILTER_DEPARTMENTS = [
  "Human Resources",
  "People Operations",
  "Finance",
  "Engineering",
];
