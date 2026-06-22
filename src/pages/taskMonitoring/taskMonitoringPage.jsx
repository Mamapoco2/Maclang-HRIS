import { useState, useMemo, useCallback } from "react";

// ─── Mock Data ──────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  "Engineering",
  "Human Resources",
  "Finance",
  "Marketing",
  "Operations",
  "Legal",
  "Design",
  "Sales",
];

const EMPLOYEES = [
  { id: 1, name: "Alicia Reyes", dept: "Engineering", avatar: "AR" },
  { id: 2, name: "Brandon Kim", dept: "Human Resources", avatar: "BK" },
  { id: 3, name: "Carmen Voss", dept: "Finance", avatar: "CV" },
  { id: 4, name: "David Osei", dept: "Marketing", avatar: "DO" },
  { id: 5, name: "Elena Marsh", dept: "Operations", avatar: "EM" },
  { id: 6, name: "Felix Chan", dept: "Engineering", avatar: "FC" },
  { id: 7, name: "Grace Lim", dept: "Design", avatar: "GL" },
  { id: 8, name: "Hugo Ferreira", dept: "Sales", avatar: "HF" },
  { id: 9, name: "Isabel Nguyen", dept: "Legal", avatar: "IN" },
  { id: 10, name: "James Patel", dept: "Finance", avatar: "JP" },
];

const INITIAL_TASKS = [
  {
    id: "TSK-001",
    title: "Q3 Performance Review Setup",
    assignedTo: 2,
    dept: "Human Resources",
    priority: "High",
    status: "In Progress",
    progress: 65,
    dueDate: "2026-07-15",
    createdBy: "Admin",
    createdDate: "2026-06-01",
    description:
      "Set up and configure the Q3 performance review cycle for all departments.",
    estimatedHours: 16,
    comments: [
      {
        id: 1,
        author: "Brandon Kim",
        text: "Templates are ready for Engineering dept.",
        date: "2026-06-10",
        avatar: "BK",
      },
    ],
  },
  {
    id: "TSK-002",
    title: "Annual Compliance Training",
    assignedTo: 9,
    dept: "Legal",
    priority: "Critical",
    status: "Pending",
    progress: 0,
    dueDate: "2026-06-30",
    createdBy: "HR Admin",
    createdDate: "2026-06-05",
    description: "Coordinate mandatory compliance training for all staff.",
    estimatedHours: 8,
    comments: [],
  },
  {
    id: "TSK-003",
    title: "Payroll System Migration",
    assignedTo: 3,
    dept: "Finance",
    priority: "Critical",
    status: "In Progress",
    progress: 42,
    dueDate: "2026-07-01",
    createdBy: "Director",
    createdDate: "2026-05-20",
    description: "Migrate payroll data to the new ERP system before end of Q2.",
    estimatedHours: 40,
    comments: [],
  },
  {
    id: "TSK-004",
    title: "Onboarding Deck Refresh",
    assignedTo: 7,
    dept: "Design",
    priority: "Medium",
    status: "Completed",
    progress: 100,
    dueDate: "2026-06-20",
    createdBy: "HR Admin",
    createdDate: "2026-06-02",
    description:
      "Update new hire onboarding materials to reflect current brand guidelines.",
    estimatedHours: 12,
    comments: [],
  },
  {
    id: "TSK-005",
    title: "Benefits Portal Integration",
    assignedTo: 1,
    dept: "Engineering",
    priority: "High",
    status: "In Progress",
    progress: 78,
    dueDate: "2026-07-10",
    createdBy: "CTO",
    createdDate: "2026-05-28",
    description: "Integrate third-party benefits portal with the HRIS API.",
    estimatedHours: 32,
    comments: [],
  },
  {
    id: "TSK-006",
    title: "Department Headcount Forecast",
    assignedTo: 10,
    dept: "Finance",
    priority: "Medium",
    status: "Pending",
    progress: 0,
    dueDate: "2026-07-20",
    createdBy: "CFO",
    createdDate: "2026-06-08",
    description: "Prepare headcount projections for FY2027 budget planning.",
    estimatedHours: 20,
    comments: [],
  },
  {
    id: "TSK-007",
    title: "Social Media Recruitment Campaign",
    assignedTo: 4,
    dept: "Marketing",
    priority: "Medium",
    status: "In Progress",
    progress: 55,
    dueDate: "2026-07-05",
    createdBy: "HR Manager",
    createdDate: "2026-06-03",
    description:
      "Launch targeted recruitment campaign across LinkedIn and industry channels.",
    estimatedHours: 24,
    comments: [],
  },
  {
    id: "TSK-008",
    title: "Office Safety Audit",
    assignedTo: 5,
    dept: "Operations",
    priority: "High",
    status: "Overdue",
    progress: 20,
    dueDate: "2026-06-10",
    createdBy: "Facilities Mgr",
    createdDate: "2026-05-15",
    description:
      "Conduct bi-annual safety inspection and update emergency procedures.",
    estimatedHours: 10,
    comments: [],
  },
  {
    id: "TSK-009",
    title: "Sales Commission Structure Review",
    assignedTo: 8,
    dept: "Sales",
    priority: "Low",
    status: "Pending",
    progress: 0,
    dueDate: "2026-07-25",
    createdBy: "VP Sales",
    createdDate: "2026-06-10",
    description: "Review and revise the commission tiers for Q3.",
    estimatedHours: 6,
    comments: [],
  },
  {
    id: "TSK-010",
    title: "Dev Environment Standardization",
    assignedTo: 6,
    dept: "Engineering",
    priority: "Low",
    status: "Cancelled",
    progress: 15,
    dueDate: "2026-06-28",
    createdBy: "Tech Lead",
    createdDate: "2026-05-25",
    description:
      "Standardize development toolchain across all engineering pods.",
    estimatedHours: 18,
    comments: [],
  },
  {
    id: "TSK-011",
    title: "Exit Interview Process Update",
    assignedTo: 2,
    dept: "Human Resources",
    priority: "Medium",
    status: "Completed",
    progress: 100,
    dueDate: "2026-06-18",
    createdBy: "HR Admin",
    createdDate: "2026-06-01",
    description: "Redesign exit interview form and automate data collection.",
    estimatedHours: 8,
    comments: [],
  },
  {
    id: "TSK-012",
    title: "Contract Renewal — Vendor NDA",
    assignedTo: 9,
    dept: "Legal",
    priority: "Critical",
    status: "In Progress",
    progress: 88,
    dueDate: "2026-06-25",
    createdBy: "CLO",
    createdDate: "2026-06-04",
    description: "Renew NDAs for all active technology vendors before expiry.",
    estimatedHours: 5,
    comments: [],
  },
];

const PRIORITY_META = {
  Low: { badge: "bg-[#EAF3DE] text-[#3B6D11] border-[#C0DD97]" },
  Medium: { badge: "bg-[#FAEEDA] text-[#854F0B] border-[#FAC775]" },
  High: { badge: "bg-[#E6F1FB] text-[#185FA5] border-[#B5D4F4]" },
  Critical: { badge: "bg-[#FCEBEB] text-[#A32D2D] border-[#F7C1C1]" },
};

const STATUS_META = {
  Pending: { badge: "bg-[#F1EFE8] text-[#5F5E5A] border-[#D3D1C7]" },
  "In Progress": { badge: "bg-[#E6F1FB] text-[#185FA5] border-[#85B7EB]" },
  Completed: { badge: "bg-[#EAF3DE] text-[#3B6D11] border-[#97C459]" },
  Cancelled: { badge: "bg-[#F1EFE8] text-[#5F5E5A] border-[#B4B2A9]" },
  Overdue: { badge: "bg-[#FCEBEB] text-[#A32D2D] border-[#F09595]" },
};

const KANBAN_COLS = ["Pending", "In Progress", "Review", "Completed"];

const ACTIVITY_FEED = [
  { type: "created", text: "Task created", date: "Jun 1, 09:00" },
  { type: "assigned", text: "Assigned to Brandon Kim", date: "Jun 1, 09:05" },
  { type: "updated", text: "Priority set to High", date: "Jun 3, 14:22" },
  { type: "comment", text: "Comment added", date: "Jun 10, 11:15" },
  {
    type: "status",
    text: "Status changed to In Progress",
    date: "Jun 10, 11:30",
  },
];

// ─── Utilities ──────────────────────────────────────────────────────────────
const getEmployee = (id) =>
  EMPLOYEES.find((e) => e.id === id) || {
    name: "Unassigned",
    avatar: "?",
    dept: "N/A",
  };

const progressColor = (p) => {
  if (p <= 30) return "#E24B4A";
  if (p <= 70) return "#EF9F27";
  return "#639922";
};

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ─── Avatar ──────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: "bg-[#E6F1FB]", text: "text-[#185FA5]" },
  { bg: "bg-[#EAF3DE]", text: "text-[#3B6D11]" },
  { bg: "bg-[#FAEEDA]", text: "text-[#854F0B]" },
  { bg: "bg-[#EEEDFE]", text: "text-[#534AB7]" },
  { bg: "bg-[#FAECE7]", text: "text-[#993C1D]" },
];

function Avatar({ initials, size = "md" }) {
  const safeInitials = String(initials || "?");
  const idx = safeInitials.charCodeAt(0) % AVATAR_COLORS.length;
  const { bg, text } = AVATAR_COLORS[idx];

  const sizeClass =
    {
      sm: "w-5 h-5 text-[9px]",
      md: "w-6 h-6 text-[10px]",
      lg: "w-8 h-8 text-[11px]",
      xl: "w-9 h-9 text-xs",
    }[size] ?? "w-8 h-8 text-[11px]";

  return (
    <div
      className={`${sizeClass} ${bg} ${text} rounded-full flex items-center justify-center font-medium shrink-0`}
    >
      {safeInitials}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
function Badge({ label, meta }) {
  const cls = meta?.badge ?? "bg-[#F1EFE8] text-[#5F5E5A] border-[#D3D1C7]";
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium tracking-wide border border-solid whitespace-nowrap ${cls}`}
    >
      {label}
    </span>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────
function ProgressBar({ value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#E8E6E0] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${value}%`, background: progressColor(value) }}
        />
      </div>
      <span className="text-[11px] text-[#888780] min-w-[28px]">{value}%</span>
    </div>
  );
}

// ─── SummaryCard ─────────────────────────────────────────────────────────────
function SummaryCard({ label, value, trend, iconPath, accentColor }) {
  return (
    <div className="bg-white border border-[#e0ddd6] rounded-xl p-4 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <span className="text-[13px] text-[#888780] font-normal">{label}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: accentColor + "22" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={accentColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={iconPath} />
          </svg>
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[28px] font-medium text-[#2C2C2A]">{value}</span>
        <span
          className={`text-xs ${trend >= 0 ? "text-[#3B6D11]" : "text-[#A32D2D]"}`}
        >
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% this month
        </span>
      </div>
    </div>
  );
}

// ─── NotificationsPanel ───────────────────────────────────────────────────────
function NotificationsPanel({ onClose }) {
  const notifs = [
    {
      id: 1,
      title: "Office Safety Audit is overdue",
      time: "2 hours ago",
      type: "overdue",
    },
    {
      id: 2,
      title: "Annual Compliance Training due in 3 days",
      time: "Today",
      type: "warning",
    },
    {
      id: 3,
      title: "Contract Renewal 88% complete",
      time: "Yesterday",
      type: "info",
    },
    {
      id: 4,
      title: "Onboarding Deck Refresh completed",
      time: "Jun 15",
      type: "success",
    },
  ];
  const dotColor = {
    overdue: "bg-[#A32D2D]",
    warning: "bg-[#854F0B]",
    info: "bg-[#185FA5]",
    success: "bg-[#3B6D11]",
  };

  return (
    <div className="absolute top-12 right-0 w-80 bg-white border border-[#e0ddd6] rounded-xl shadow-lg z-[100] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e0ddd6] flex justify-between items-center">
        <span className="font-medium text-sm">Notifications</span>
        <button
          onClick={onClose}
          className="text-[#888780] text-lg leading-none bg-transparent border-none cursor-pointer"
        >
          ×
        </button>
      </div>
      {notifs.map((n) => (
        <div
          key={n.id}
          className="px-4 py-3 border-b border-[#e0ddd6] flex gap-2.5"
        >
          <div
            className={`w-2 h-2 rounded-full mt-1 shrink-0 ${dotColor[n.type]}`}
          />
          <div>
            <p className="m-0 text-[13px] text-[#2C2C2A]">{n.title}</p>
            <p className="m-0 mt-0.5 text-[11px] text-[#888780]">{n.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── CreateTaskModal ──────────────────────────────────────────────────────────
function CreateTaskModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    dept: "",
    assignedTo: "",
    priority: "Medium",
    startDate: "",
    dueDate: "",
    estimatedHours: "",
    status: "Pending",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.dept) e.dept = "Department is required";
    if (!form.assignedTo) e.assignedTo = "Assignee is required";
    if (!form.dueDate) e.dueDate = "Due date is required";
    if (form.startDate && form.dueDate && form.startDate > form.dueDate)
      e.dueDate = "Due date must be after start date";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSave({
      id: `TSK-${String(Math.floor(Math.random() * 900 + 100))}`,
      ...form,
      assignedTo: parseInt(form.assignedTo),
      progress: 0,
      createdBy: "Current User",
      createdDate: new Date().toISOString().slice(0, 10),
      comments: [],
      estimatedHours: parseInt(form.estimatedHours) || 0,
    });
  };

  const inputCls = (key) =>
    `w-full px-2.5 py-2 rounded-md text-[13px] border outline-none bg-white text-[#2C2C2A] box-border
    ${errors[key] ? "border-[#F09595]" : "border-[#e0ddd6]"}`;

  const Label = ({ htmlFor, children, required }) => (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-medium text-[#5F5E5A] mb-1"
    >
      {children}
      {required && " *"}
    </label>
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-[560px] max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e0ddd6] flex justify-between items-center sticky top-0 bg-white z-[1]">
          <span className="font-medium text-base">Create New Task</span>
          <button
            onClick={onClose}
            className="text-[#888780] text-xl bg-transparent border-none cursor-pointer leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-3.5">
          {/* Title */}
          <div>
            <Label required>Task Title</Label>
            {errors.title && (
              <p className="text-[11px] text-[#A32D2D] mt-0 mb-1">
                {errors.title}
              </p>
            )}
            <input
              className={inputCls("title")}
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Enter task title"
              maxLength={100}
            />
            <span className="text-[11px] text-[#B4B2A9]">
              {form.title.length}/100
            </span>
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <textarea
              className={`${inputCls("description")} h-20 resize-y`}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Describe the task..."
              maxLength={500}
            />
          </div>

          {/* Dept + Assignee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label required>Department</Label>
              {errors.dept && (
                <p className="text-[11px] text-[#A32D2D] mt-0 mb-1">
                  {errors.dept}
                </p>
              )}
              <select
                className={inputCls("dept")}
                value={form.dept}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    dept: e.target.value,
                    assignedTo: "",
                  }))
                }
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label required>Assigned To</Label>
              {errors.assignedTo && (
                <p className="text-[11px] text-[#A32D2D] mt-0 mb-1">
                  {errors.assignedTo}
                </p>
              )}
              <select
                className={inputCls("assignedTo")}
                value={form.assignedTo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, assignedTo: e.target.value }))
                }
              >
                <option value="">Select employee</option>
                {EMPLOYEES.filter(
                  (e) => !form.dept || e.dept === form.dept,
                ).map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Priority</Label>
              <select
                className={inputCls("priority")}
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priority: e.target.value }))
                }
              >
                {["Low", "Medium", "High", "Critical"].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Status</Label>
              <select
                className={inputCls("status")}
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
              >
                {["Pending", "In Progress", "Completed"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Date</Label>
              <input
                type="date"
                className={inputCls("startDate")}
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
              />
            </div>
            <div>
              <Label required>Due Date</Label>
              {errors.dueDate && (
                <p className="text-[11px] text-[#A32D2D] mt-0 mb-1">
                  {errors.dueDate}
                </p>
              )}
              <input
                type="date"
                className={inputCls("dueDate")}
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Hours */}
          <div>
            <Label>Estimated Hours</Label>
            <input
              type="number"
              className={inputCls("estimatedHours")}
              value={form.estimatedHours}
              onChange={(e) =>
                setForm((f) => ({ ...f, estimatedHours: e.target.value }))
              }
              placeholder="e.g. 8"
              min="0"
              max="999"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e0ddd6] flex justify-end gap-2 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-[#e0ddd6] bg-transparent cursor-pointer text-[13px] text-[#5F5E5A] hover:bg-[#F8F7F4] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md border-none bg-[#185FA5] text-white cursor-pointer text-[13px] font-medium hover:bg-[#1451891] transition-colors"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TaskDetailsDrawer ────────────────────────────────────────────────────────
function TaskDetailsDrawer({ task, onClose, onUpdate }) {
  const [newComment, setNewComment] = useState("");
  const [progress, setProgress] = useState(task.progress);
  const emp = getEmployee(task.assignedTo);

  const addComment = () => {
    if (!newComment.trim()) return;
    onUpdate({
      ...task,
      comments: [
        ...task.comments,
        {
          id: Date.now(),
          author: "Current User",
          text: newComment,
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          avatar: "CU",
        },
      ],
    });
    setNewComment("");
  };

  const updateProgress = (v) => {
    setProgress(v);
    onUpdate({ ...task, progress: v });
  };

  return (
    <div className="fixed inset-0 z-[150] flex">
      {/* backdrop */}
      <div className="flex-1 bg-black/30" onClick={onClose} />
      {/* panel */}
      <div className="w-[420px] max-w-[90vw] bg-white h-screen overflow-auto flex flex-col border-l border-[#e0ddd6]">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-[#e0ddd6] flex justify-between items-start">
          <div>
            <p className="m-0 text-[11px] text-[#888780] font-medium">
              {task.id}
            </p>
            <h3 className="mt-1 mb-2 text-[15px] font-medium">{task.title}</h3>
            <div className="flex gap-1.5 flex-wrap">
              <Badge
                label={task.priority}
                meta={PRIORITY_META[task.priority]}
              />
              <Badge label={task.status} meta={STATUS_META[task.status]} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#888780] text-xl bg-transparent border-none cursor-pointer p-0 shrink-0 leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 flex flex-col gap-5">
          {/* Assignee */}
          <div>
            <p className="text-[11px] font-medium text-[#888780] mb-2 uppercase tracking-widest">
              Assignee
            </p>
            <div className="flex items-center gap-2">
              <Avatar initials={emp.avatar} size="lg" />
              <div>
                <p className="m-0 text-[13px] font-medium">{emp.name}</p>
                <p className="m-0 text-[11px] text-[#888780]">{emp.dept}</p>
              </div>
            </div>
          </div>

          {/* Detail grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Department", task.dept],
              ["Created By", task.createdBy],
              ["Due Date", formatDate(task.dueDate)],
              ["Created Date", formatDate(task.createdDate)],
              [
                "Est. Hours",
                task.estimatedHours ? `${task.estimatedHours}h` : "—",
              ],
            ].map(([k, v]) => (
              <div key={k} className="px-3 py-2.5 bg-[#F8F7F4] rounded-lg">
                <p className="m-0 text-[11px] text-[#888780]">{k}</p>
                <p className="m-0 mt-0.5 text-[13px] font-medium">{v}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <p className="text-[11px] font-medium text-[#888780] mb-1.5 uppercase tracking-widest">
                Description
              </p>
              <p className="text-[13px] text-[#2C2C2A] leading-relaxed m-0">
                {task.description}
              </p>
            </div>
          )}

          {/* Progress */}
          <div>
            <p className="text-[11px] font-medium text-[#888780] mb-2 uppercase tracking-widest">
              Progress — {progress}%
            </p>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => updateProgress(parseInt(e.target.value))}
              className="w-full"
              style={{ accentColor: progressColor(progress) }}
            />
            <div className="flex justify-between text-[11px] text-[#B4B2A9] mt-0.5">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Activity */}
          <div>
            <p className="text-[11px] font-medium text-[#888780] mb-2.5 uppercase tracking-widest">
              Activity
            </p>
            <div className="relative pl-5">
              <div className="absolute left-[7px] top-0 bottom-0 w-px bg-[#e0ddd6]" />
              {ACTIVITY_FEED.map((a, i) => (
                <div key={i} className="relative mb-3">
                  <div className="absolute -left-[17px] top-[3px] w-[7px] h-[7px] rounded-full bg-[#B4B2A9] border-2 border-white" />
                  <p className="m-0 text-xs text-[#2C2C2A]">{a.text}</p>
                  <p className="m-0 text-[11px] text-[#888780]">{a.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <p className="text-[11px] font-medium text-[#888780] mb-2.5 uppercase tracking-widest">
              Comments ({task.comments.length})
            </p>
            {task.comments.map((c) => (
              <div key={c.id} className="flex gap-2 mb-3">
                <Avatar initials={c.avatar} size="md" />
                <div className="flex-1 bg-[#F8F7F4] rounded-lg px-3 py-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium">{c.author}</span>
                    <span className="text-[11px] text-[#888780]">{c.date}</span>
                  </div>
                  <p className="m-0 text-xs leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addComment()}
                placeholder="Add a comment..."
                className="flex-1 px-2.5 py-2 rounded-md border border-[#e0ddd6] text-xs bg-white text-[#2C2C2A] outline-none"
              />
              <button
                onClick={addComment}
                className="px-3 py-2 bg-[#185FA5] text-white border-none rounded-md cursor-pointer text-xs hover:bg-[#145191] transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── KanbanBoard ──────────────────────────────────────────────────────────────
function KanbanBoard({ tasks, onTaskClick, onStatusChange }) {
  const [draggedId, setDraggedId] = useState(null);

  const cols = KANBAN_COLS.map((col) => ({
    title: col,
    tasks: tasks.filter((t) => {
      if (col === "Review")
        return t.progress >= 80 && t.status === "In Progress";
      return t.status === col;
    }),
  }));

  const colTextColor = {
    Pending: "text-[#888780]",
    "In Progress": "text-[#185FA5]",
    Review: "text-[#854F0B]",
    Completed: "text-[#3B6D11]",
  };

  return (
    <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(200px,1fr))] py-1">
      {cols.map((col) => (
        <div
          key={col.title}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (draggedId && col.title !== "Review")
              onStatusChange(draggedId, col.title);
            setDraggedId(null);
          }}
          className="bg-[#F8F7F4] rounded-[10px] p-3 min-h-[300px]"
        >
          <div className="flex justify-between items-center mb-3">
            <span className={`text-xs font-medium ${colTextColor[col.title]}`}>
              {col.title}
            </span>
            <span className="text-[11px] bg-white px-1.5 py-px rounded-full text-[#888780] border border-[#e0ddd6]">
              {col.tasks.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {col.tasks.map((task) => {
              const emp = getEmployee(task.assignedTo);
              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDraggedId(task.id)}
                  onClick={() => onTaskClick(task)}
                  className="bg-white border border-[#e0ddd6] rounded-lg p-2.5 cursor-grab hover:shadow-sm transition-shadow"
                >
                  <p className="m-0 mb-1.5 text-xs font-medium leading-snug">
                    {task.title}
                  </p>
                  <div className="mb-1.5">
                    <ProgressBar value={task.progress} />
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge
                      label={task.priority}
                      meta={PRIORITY_META[task.priority]}
                    />
                    <div className="flex items-center gap-1">
                      <Avatar initials={emp.avatar} size="sm" />
                      <span className="text-[10px] text-[#888780]">
                        {formatDate(task.dueDate).split(",")[0]}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {col.tasks.length === 0 && (
              <div className="text-center py-5 text-[#B4B2A9] text-xs border border-dashed border-[#e0ddd6] rounded-lg">
                Drop tasks here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── AnalyticsView ────────────────────────────────────────────────────────────
function AnalyticsView({ tasks }) {
  const byDept = useMemo(() => {
    const m = {};
    tasks.forEach((t) => {
      m[t.dept] = (m[t.dept] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [tasks]);

  const byStatus = useMemo(() => {
    const m = {};
    tasks.forEach((t) => {
      m[t.status] = (m[t.status] || 0) + 1;
    });
    return Object.entries(m);
  }, [tasks]);

  const completionRate = tasks.length
    ? Math.round(
        (tasks.filter((t) => t.status === "Completed").length / tasks.length) *
          100,
      )
    : 0;
  const avgProgress = tasks.length
    ? Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length)
    : 0;

  const maxDept = byDept[0]?.[1] || 1;
  const statusColors = {
    Pending: "#888780",
    "In Progress": "#185FA5",
    Completed: "#3B6D11",
    Cancelled: "#B4B2A9",
    Overdue: "#A32D2D",
  };
  const total = byStatus.reduce((s, [, v]) => s + v, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* KPI row */}
      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
        {[
          ["Completion Rate", `${completionRate}%`, "text-[#3B6D11]"],
          ["Avg. Progress", `${avgProgress}%`, "text-[#185FA5]"],
          [
            "Overdue Rate",
            `${Math.round((tasks.filter((t) => t.status === "Overdue").length / tasks.length) * 100)}%`,
            "text-[#A32D2D]",
          ],
          [
            "Active Tasks",
            tasks.filter((t) => t.status === "In Progress").length,
            "text-[#854F0B]",
          ],
        ].map(([label, value, color]) => (
          <div
            key={label}
            className="bg-white border border-[#e0ddd6] rounded-[10px] px-3.5 py-3"
          >
            <p className="m-0 mb-1 text-[11px] text-[#888780]">{label}</p>
            <p className={`m-0 text-[22px] font-medium ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        {/* By department */}
        <div className="bg-white border border-[#e0ddd6] rounded-[10px] px-4 py-3.5">
          <p className="m-0 mb-3.5 text-[13px] font-medium">
            Tasks by department
          </p>
          {byDept.slice(0, 6).map(([dept, count]) => (
            <div key={dept} className="mb-2.5">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-[#5F5E5A]">{dept}</span>
                <span className="text-xs font-medium">{count}</span>
              </div>
              <div className="h-[5px] bg-[#E8E6E0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#185FA5] rounded-full"
                  style={{ width: `${(count / maxDept) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Status donut */}
        <div className="bg-white border border-[#e0ddd6] rounded-[10px] px-4 py-3.5">
          <p className="m-0 mb-3.5 text-[13px] font-medium">Status breakdown</p>
          <div className="flex items-center gap-4">
            <svg width="80" height="80" viewBox="0 0 80 80">
              {(() => {
                let offset = 0;
                const r = 28,
                  cx = 40,
                  cy = 40,
                  circ = 2 * Math.PI * r;
                return byStatus.map(([status, count]) => {
                  const pct = count / total;
                  const el = (
                    <circle
                      key={status}
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill="none"
                      stroke={statusColors[status] || "#888780"}
                      strokeWidth="14"
                      strokeDasharray={`${circ * pct} ${circ * (1 - pct)}`}
                      strokeDashoffset={-circ * offset}
                      style={{
                        transform: "rotate(-90deg)",
                        transformOrigin: "40px 40px",
                      }}
                    />
                  );
                  offset += pct;
                  return el;
                });
              })()}
              <text
                x="40"
                y="44"
                textAnchor="middle"
                fontSize="14"
                fontWeight="500"
                fill="#2C2C2A"
              >
                {total}
              </text>
            </svg>
            <div className="flex flex-col gap-1.5">
              {byStatus.map(([status, count]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-sm shrink-0"
                    style={{ background: statusColors[status] || "#888780" }}
                  />
                  <span className="text-[11px] text-[#5F5E5A]">{status}</span>
                  <span className="text-[11px] font-medium ml-auto">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trend chart */}
      <div className="bg-white border border-[#e0ddd6] rounded-[10px] px-4 py-3.5">
        <p className="m-0 mb-3.5 text-[13px] font-medium">
          Monthly completion trend
        </p>
        <svg
          width="100%"
          height="100"
          viewBox="0 0 520 100"
          preserveAspectRatio="none"
        >
          {[0, 50, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="520"
              y2={y}
              stroke="#e0ddd6"
              strokeWidth="0.5"
            />
          ))}
          <polyline
            points="0,35 87,50 174,25 261,60 348,20 435,40 520,15"
            fill="none"
            stroke="#185FA5"
            strokeWidth="2"
          />
          {[
            [0, 35],
            [87, 50],
            [174, 25],
            [261, 60],
            [348, 20],
            [435, 40],
            [520, 15],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3.5" fill="#185FA5" />
          ))}
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m, i) => (
            <text
              key={m}
              x={i * 87}
              y="98"
              fontSize="10"
              fill="#888780"
              textAnchor="middle"
            >
              {m}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TaskMonitoringModule() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const PAGE_SIZE = 8;

  const stats = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "Pending").length,
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
      completed: tasks.filter((t) => t.status === "Completed").length,
      overdue: tasks.filter((t) => t.status === "Overdue").length,
    }),
    [tasks],
  );

  const filtered = useMemo(() => {
    let out = tasks.filter((t) => {
      const q = search.toLowerCase();
      const emp = getEmployee(t.assignedTo);
      if (
        q &&
        !t.title.toLowerCase().includes(q) &&
        !t.id.toLowerCase().includes(q) &&
        !emp.name.toLowerCase().includes(q)
      )
        return false;
      if (filterPriority && t.priority !== filterPriority) return false;
      if (filterStatus && t.status !== filterStatus) return false;
      if (filterDept && t.dept !== filterDept) return false;
      return true;
    });
    out.sort((a, b) => {
      let va = a[sortField],
        vb = b[sortField];
      if (sortField === "assignedTo") {
        va = getEmployee(a.assignedTo).name;
        vb = getEmployee(b.assignedTo).name;
      }
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      return sortDir === "asc" ? (va < vb ? -1 : 1) : va > vb ? -1 : 1;
    });
    return out;
  }, [
    tasks,
    search,
    filterPriority,
    filterStatus,
    filterDept,
    sortField,
    sortDir,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const updateTask = useCallback((updated) => {
    setTasks((ts) => ts.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTask((prev) => (prev?.id === updated.id ? updated : prev));
  }, []);

  const createTask = (task) => {
    setTasks((ts) => [task, ...ts]);
    setShowCreate(false);
  };
  const changeStatus = (id, status) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)));
  const toggleRow = (id) =>
    setSelectedRows((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  const allSelected =
    pageData.length > 0 && pageData.every((t) => selectedRows.includes(t.id));
  const toggleAll = () =>
    setSelectedRows(allSelected ? [] : pageData.map((t) => t.id));

  const thCls = (field) =>
    `px-3 py-2.5 text-left text-[11px] font-medium text-[#888780] border-b border-[#e0ddd6] cursor-pointer select-none whitespace-nowrap
    ${sortField === field ? "bg-[#F8F7F4]" : "bg-transparent"}`;

  const tdCls =
    "px-3 py-2.5 text-xs text-[#2C2C2A] border-b border-[#e0ddd6] align-middle";

  const SortIndicator = ({ field }) =>
    sortField === field ? (
      <span className="ml-0.5">{sortDir === "asc" ? "↑" : "↓"}</span>
    ) : (
      <span className="ml-0.5 opacity-30">↕</span>
    );

  return (
    <div className="font-sans h-screen text-[#2C2C2A]">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#e0ddd6] px-6 h-14 flex items-center gap-3 sticky top-0 z-50">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mr-2">
          <div className="w-7 h-7 bg-[#185FA5] rounded-md flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="font-medium text-sm whitespace-nowrap">
            Task Monitoring
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 relative max-w-[360px]">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#B4B2A9"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search tasks..."
            className="w-full pl-8 pr-2.5 h-[34px] rounded-md border border-[#e0ddd6] text-[13px] bg-[#F8F7F4] text-[#2C2C2A] outline-none box-border"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setShowCreate(true)}
            className="px-3.5 py-1.5 bg-[#185FA5] text-white border-none rounded-md cursor-pointer text-xs font-medium flex items-center gap-1.5 hover:bg-[#145191] transition-colors"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Task
          </button>

          {/* Avatar */}
        </div>
      </header>

      <main className="px-6 py-5 max-w-screen mx-auto">
        {/* ── Summary Cards ──────────────────────────────────────────────── */}
        <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(160px,1fr))] mb-5">
          <SummaryCard
            label="Total Tasks"
            value={stats.total}
            trend={8}
            accentColor="#185FA5"
            iconPath="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
          <SummaryCard
            label="Pending"
            value={stats.pending}
            trend={-3}
            accentColor="#888780"
            iconPath="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-6v-4m0-4h.01"
          />
          <SummaryCard
            label="In Progress"
            value={stats.inProgress}
            trend={12}
            accentColor="#854F0B"
            iconPath="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2"
          />
          <SummaryCard
            label="Completed"
            value={stats.completed}
            trend={5}
            accentColor="#3B6D11"
            iconPath="M22 11.08V12a10 10 0 11-5.93-9.14M22 4 12 14.01l-3-3"
          />
          <SummaryCard
            label="Overdue"
            value={stats.overdue}
            trend={-2}
            accentColor="#A32D2D"
            iconPath="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01"
          />
        </div>

        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="bg-white border border-[#e0ddd6] rounded-[10px] px-4 py-3 mb-4 flex flex-wrap gap-2.5 items-center">
          {/* View switcher */}
          <div className="flex gap-0.5 bg-[#F8F7F4] rounded-md p-0.5">
            {[
              ["table", "Table"],
              ["kanban", "Kanban"],
              ["analytics", "Analytics"],
            ].map(([v, label]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded text-xs cursor-pointer border-none transition-all
                  ${
                    view === v
                      ? "bg-white text-[#2C2C2A] font-medium shadow-sm"
                      : "bg-transparent text-[#888780] font-normal"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap ml-auto">
            {[
              [
                filterPriority,
                setFilterPriority,
                ["Low", "Medium", "High", "Critical"],
                "Priority",
              ],
              [
                filterStatus,
                setFilterStatus,
                ["Pending", "In Progress", "Completed", "Overdue", "Cancelled"],
                "Status",
              ],
              [filterDept, setFilterDept, DEPARTMENTS, "Department"],
            ].map(([val, setter, opts, label], i) => (
              <select
                key={i}
                value={val}
                onChange={(e) => {
                  setter(e.target.value);
                  setPage(1);
                }}
                className={`px-2 py-1 rounded-md border text-xs outline-none cursor-pointer transition-colors
                  ${val ? "border-[#B5D4F4] bg-[#E6F1FB] text-[#185FA5]" : "border-[#e0ddd6] bg-white text-[#888780]"}`}
              >
                <option value="">{label}: All</option>
                {opts.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ))}
            {(filterPriority || filterStatus || filterDept) && (
              <button
                onClick={() => {
                  setFilterPriority("");
                  setFilterStatus("");
                  setFilterDept("");
                }}
                className="px-2.5 py-1 rounded-md border border-[#F09595] bg-[#FCEBEB] text-[#A32D2D] text-xs cursor-pointer hover:bg-[#f7d5d5] transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ── Bulk Actions ────────────────────────────────────────────────── */}
        {selectedRows.length > 0 && (
          <div className="bg-[#E6F1FB] border border-[#B5D4F4] rounded-lg px-3.5 py-2 mb-3 flex items-center gap-2.5 text-xs text-[#185FA5]">
            <span>
              {selectedRows.length} task{selectedRows.length > 1 ? "s" : ""}{" "}
              selected
            </span>
            <button
              onClick={() => {
                setTasks((ts) =>
                  ts.map((t) =>
                    selectedRows.includes(t.id)
                      ? { ...t, status: "Completed", progress: 100 }
                      : t,
                  ),
                );
                setSelectedRows([]);
              }}
              className="px-2.5 py-1 rounded bg-[#185FA5] text-white border-none cursor-pointer text-[11px] hover:bg-[#145191] transition-colors"
            >
              Mark completed
            </button>
            <button
              onClick={() => {
                setTasks((ts) =>
                  ts.filter((t) => !selectedRows.includes(t.id)),
                );
                setSelectedRows([]);
              }}
              className="px-2.5 py-1 rounded bg-[#FCEBEB] text-[#A32D2D] border-none cursor-pointer text-[11px] hover:bg-[#f7d5d5] transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedRows([])}
              className="ml-auto bg-transparent border-none text-[#185FA5] cursor-pointer text-xs"
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── Table View ──────────────────────────────────────────────────── */}
        {view === "table" && (
          <div className="bg-white border border-[#e0ddd6] rounded-[10px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[#F8F7F4]">
                    <th className="px-3 py-2.5 w-9 border-b border-[#e0ddd6]">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="cursor-pointer"
                      />
                    </th>
                    {[
                      ["id", "Task ID"],
                      ["title", "Title"],
                      ["assignedTo", "Assigned To"],
                      ["dept", "Department"],
                      ["priority", "Priority"],
                      ["status", "Status"],
                      ["progress", "Progress"],
                      ["dueDate", "Due Date"],
                    ].map(([field, label]) => (
                      <th
                        key={field}
                        className={thCls(field)}
                        onClick={() => handleSort(field)}
                      >
                        {label}
                        <SortIndicator field={field} />
                      </th>
                    ))}
                    <th className="px-3 py-2.5 text-left text-[11px] font-medium text-[#888780] border-b border-[#e0ddd6]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.length === 0 && (
                    <tr>
                      <td
                        colSpan={10}
                        className="text-center py-8 text-[#888780] text-[13px]"
                      >
                        No tasks match your filters
                      </td>
                    </tr>
                  )}
                  {pageData.map((task) => {
                    const emp = getEmployee(task.assignedTo);
                    return (
                      <tr
                        key={task.id}
                        className="cursor-pointer hover:bg-[#fafaf9] transition-colors"
                        onClick={() => setSelectedTask(task)}
                      >
                        <td
                          className={tdCls}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(task.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(task.id)}
                            onChange={() => toggleRow(task.id)}
                            className="cursor-pointer"
                          />
                        </td>
                        <td
                          className={`${tdCls} font-mono text-[11px] text-[#888780]`}
                        >
                          {task.id}
                        </td>
                        <td className={`${tdCls} max-w-[200px]`}>
                          <span className="font-medium text-xs">
                            {task.title}
                          </span>
                        </td>
                        <td className={tdCls}>
                          <div className="flex items-center gap-1.5">
                            <Avatar initials={emp.avatar} size="md" />
                            <span className="text-xs whitespace-nowrap">
                              {emp.name}
                            </span>
                          </div>
                        </td>
                        <td className={tdCls}>
                          <span className="text-xs text-[#5F5E5A]">
                            {task.dept}
                          </span>
                        </td>
                        <td className={tdCls}>
                          <Badge
                            label={task.priority}
                            meta={PRIORITY_META[task.priority]}
                          />
                        </td>
                        <td className={tdCls}>
                          <Badge
                            label={task.status}
                            meta={STATUS_META[task.status]}
                          />
                        </td>
                        <td className={`${tdCls} min-w-[120px]`}>
                          <ProgressBar value={task.progress} />
                        </td>
                        <td
                          className={`${tdCls} whitespace-nowrap text-xs ${task.status === "Overdue" ? "text-[#A32D2D]" : "text-[#2C2C2A]"}`}
                        >
                          {formatDate(task.dueDate)}
                        </td>
                        <td
                          className={tdCls}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex gap-1">
                            <button
                              onClick={() => setSelectedTask(task)}
                              className="px-2 py-1 border border-[#e0ddd6] bg-transparent rounded text-[11px] text-[#185FA5] cursor-pointer hover:bg-[#E6F1FB] transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() =>
                                changeStatus(
                                  task.id,
                                  task.status === "Completed"
                                    ? "In Progress"
                                    : "Completed",
                                )
                              }
                              className="px-2 py-1 border border-[#e0ddd6] bg-transparent rounded text-[11px] text-[#3B6D11] cursor-pointer hover:bg-[#EAF3DE] transition-colors"
                            >
                              {task.status === "Completed"
                                ? "Reopen"
                                : "Complete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-[#e0ddd6] flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-[#888780]">
                Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
                –{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length} tasks
              </span>
              <div className="flex gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-2.5 py-1 rounded border border-[#e0ddd6] bg-transparent text-xs cursor-pointer disabled:opacity-40"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-2.5 py-1 rounded border border-[#e0ddd6] text-xs cursor-pointer min-w-[32px] transition-colors
                      ${page === p ? "bg-[#185FA5] text-white border-[#185FA5]" : "bg-transparent text-[#2C2C2A] hover:bg-[#F8F7F4]"}`}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-2.5 py-1 rounded border border-[#e0ddd6] bg-transparent text-xs cursor-pointer disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Kanban View ─────────────────────────────────────────────────── */}
        {view === "kanban" && (
          <KanbanBoard
            tasks={filtered}
            onTaskClick={setSelectedTask}
            onStatusChange={changeStatus}
          />
        )}

        {/* ── Analytics View ───────────────────────────────────────────────── */}
        {view === "analytics" && (
          <AnalyticsView tasks={filtered.length ? filtered : tasks} />
        )}
      </main>

      {/* ── Modals / Drawers ─────────────────────────────────────────────── */}
      {showCreate && (
        <CreateTaskModal
          onClose={() => setShowCreate(false)}
          onSave={createTask}
        />
      )}
      {selectedTask && (
        <TaskDetailsDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
        />
      )}
    </div>
  );
}
