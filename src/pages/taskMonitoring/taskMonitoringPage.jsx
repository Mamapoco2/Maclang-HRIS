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
  Low: { color: "#3B6D11", bg: "#EAF3DE", border: "#C0DD97" },
  Medium: { color: "#854F0B", bg: "#FAEEDA", border: "#FAC775" },
  High: { color: "#185FA5", bg: "#E6F1FB", border: "#B5D4F4" },
  Critical: { color: "#A32D2D", bg: "#FCEBEB", border: "#F7C1C1" },
};

const STATUS_META = {
  Pending: { color: "#5F5E5A", bg: "#F1EFE8", border: "#D3D1C7" },
  "In Progress": { color: "#185FA5", bg: "#E6F1FB", border: "#85B7EB" },
  Completed: { color: "#3B6D11", bg: "#EAF3DE", border: "#97C459" },
  Cancelled: { color: "#5F5E5A", bg: "#F1EFE8", border: "#B4B2A9" },
  Overdue: { color: "#A32D2D", bg: "#FCEBEB", border: "#F09595" },
};

const KANBAN_COLS = ["Pending", "In Progress", "Review", "Completed"];

const ACTIVITY_FEED = [
  { type: "created", text: "Task created", date: "Jun 1, 09:00", icon: "plus" },
  {
    type: "assigned",
    text: "Assigned to Brandon Kim",
    date: "Jun 1, 09:05",
    icon: "user",
  },
  {
    type: "updated",
    text: "Priority set to High",
    date: "Jun 3, 14:22",
    icon: "pencil",
  },
  {
    type: "comment",
    text: "Comment added",
    date: "Jun 10, 11:15",
    icon: "message",
  },
  {
    type: "status",
    text: "Status changed to In Progress",
    date: "Jun 10, 11:30",
    icon: "refresh",
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
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const isOverdue = (dueDate) => new Date(dueDate) < new Date();

// ─── Sub-components ─────────────────────────────────────────────────────────

function Avatar({ initials, size = 32 }) {
  const colors = ["#E6F1FB", "#EAF3DE", "#FAEEDA", "#EEEDFE", "#FAECE7"];
  const textColors = ["#185FA5", "#3B6D11", "#854F0B", "#534AB7", "#993C1D"];

  const safeInitials = String(initials || "?");
  const idx = safeInitials.charCodeAt(0) % colors.length;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: colors[idx],
        color: textColors[idx],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      {safeInitials}
    </div>
  );
}

function Badge({ label, meta }) {
  const m = meta || { color: "#5F5E5A", bg: "#F1EFE8", border: "#D3D1C7" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.02em",
        background: m.bg,
        color: m.color,
        border: `0.5px solid ${m.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function ProgressBar({ value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          flex: 1,
          height: 6,
          background: "#E8E6E0",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: progressColor(value),
            borderRadius: 3,
            transition: "width 0.3s",
          }}
        />
      </div>
      <span style={{ fontSize: 11, color: "#888780", minWidth: 28 }}>
        {value}%
      </span>
    </div>
  );
}

function SummaryCard({ label, value, trend, iconPath, accentColor }) {
  return (
    <div
      style={{
        background: "var(--color-background-primary,#fff)",
        border: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
        borderRadius: 12,
        padding: "1rem 1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <span
          style={{
            fontSize: 13,
            color: "var(--color-text-secondary,#888780)",
            fontWeight: 400,
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: accentColor + "22",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
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
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: "var(--color-text-primary,#2C2C2A)",
          }}
        >
          {value}
        </span>
        <span
          style={{ fontSize: 12, color: trend >= 0 ? "#3B6D11" : "#A32D2D" }}
        >
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% this month
        </span>
      </div>
    </div>
  );
}

// ─── Notifications Panel ─────────────────────────────────────────────────────
function NotificationsPanel({ tasks, onClose }) {
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
  const typeColor = {
    overdue: "#A32D2D",
    warning: "#854F0B",
    info: "#185FA5",
    success: "#3B6D11",
  };
  const typeBg = {
    overdue: "#FCEBEB",
    warning: "#FAEEDA",
    info: "#E6F1FB",
    success: "#EAF3DE",
  };
  return (
    <div
      style={{
        position: "absolute",
        top: 48,
        right: 0,
        width: 320,
        background: "var(--color-background-primary,#fff)",
        border: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
        borderRadius: 12,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        zIndex: 100,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 500, fontSize: 14 }}>Notifications</span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
            color: "#888780",
          }}
        >
          ×
        </button>
      </div>
      {notifs.map((n) => (
        <div
          key={n.id}
          style={{
            padding: "12px 16px",
            borderBottom: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
            display: "flex",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: typeColor[n.type],
              marginTop: 5,
              flexShrink: 0,
            }}
          />
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "var(--color-text-primary,#2C2C2A)",
              }}
            >
              {n.title}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#888780" }}>
              {n.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Create Task Modal ────────────────────────────────────────────────────────
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
    const emp = getEmployee(parseInt(form.assignedTo));
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

  const field = (key, label, required) => (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 500,
          color: "#5F5E5A",
          marginBottom: 4,
        }}
      >
        {label}
        {required && " *"}
      </label>
      {errors[key] && (
        <p style={{ fontSize: 11, color: "#A32D2D", margin: "0 0 4px" }}>
          {errors[key]}
        </p>
      )}
    </div>
  );

  const inputStyle = (key) => ({
    width: "100%",
    padding: "8px 10px",
    borderRadius: 6,
    fontSize: 13,
    border: `0.5px solid ${errors[key] ? "#F09595" : "var(--color-border-tertiary,#e0ddd6)"}`,
    background: "var(--color-background-primary,#fff)",
    color: "var(--color-text-primary,#2C2C2A)",
    boxSizing: "border-box",
    outline: "none",
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "var(--color-background-primary,#fff)",
          borderRadius: 12,
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            background: "var(--color-background-primary,#fff)",
            zIndex: 1,
          }}
        >
          <span style={{ fontWeight: 500, fontSize: 16 }}>Create New Task</span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              color: "#888780",
            }}
          >
            ×
          </button>
        </div>
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div>
            {field("title", "Task Title", true)}
            <input
              style={inputStyle("title")}
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Enter task title"
              maxLength={100}
            />
            <span style={{ fontSize: 11, color: "#B4B2A9" }}>
              {form.title.length}/100
            </span>
          </div>
          <div>
            {field("description", "Description")}
            <textarea
              style={{
                ...inputStyle("description"),
                height: 80,
                resize: "vertical",
              }}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Describe the task..."
              maxLength={500}
            />
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              {field("dept", "Department", true)}
              <select
                style={inputStyle("dept")}
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
              {field("assignedTo", "Assigned To", true)}
              <select
                style={inputStyle("assignedTo")}
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
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              {field("priority", "Priority")}
              <select
                style={inputStyle("priority")}
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
              {field("status", "Status")}
              <select
                style={inputStyle("status")}
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
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              {field("startDate", "Start Date")}
              <input
                type="date"
                style={inputStyle("startDate")}
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
              />
            </div>
            <div>
              {field("dueDate", "Due Date", true)}
              <input
                type="date"
                style={inputStyle("dueDate")}
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            {field("estimatedHours", "Estimated Hours")}
            <input
              type="number"
              style={inputStyle("estimatedHours")}
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
        <div
          style={{
            padding: "16px 24px",
            borderTop: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            position: "sticky",
            bottom: 0,
            background: "var(--color-background-primary,#fff)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
              background: "none",
              cursor: "pointer",
              fontSize: 13,
              color: "var(--color-text-secondary,#5F5E5A)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: "#185FA5",
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Task Details Drawer ──────────────────────────────────────────────────────
function TaskDetailsDrawer({ task, onClose, onUpdate }) {
  const [newComment, setNewComment] = useState("");
  const [progress, setProgress] = useState(task.progress);
  const emp = getEmployee(task.assignedTo);

  const addComment = () => {
    if (!newComment.trim()) return;
    const updated = {
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
    };
    onUpdate(updated);
    setNewComment("");
  };

  const updateProgress = (v) => {
    setProgress(v);
    onUpdate({ ...task, progress: v });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 150, display: "flex" }}>
      <div
        style={{ flex: 1, background: "rgba(0,0,0,0.3)" }}
        onClick={onClose}
      />
      <div
        style={{
          width: 420,
          maxWidth: "90vw",
          background: "var(--color-background-primary,#fff)",
          height: "100vh",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          borderLeft: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
        }}
      >
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                color: "#888780",
                fontWeight: 500,
              }}
            >
              {task.id}
            </p>
            <h3 style={{ margin: "4px 0 8px", fontSize: 15, fontWeight: 500 }}>
              {task.title}
            </h3>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Badge
                label={task.priority}
                meta={PRIORITY_META[task.priority]}
              />
              <Badge label={task.status} meta={STATUS_META[task.status]} />
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              color: "#888780",
              padding: 0,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            flex: 1,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Assignee */}
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#888780",
                margin: "0 0 8px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Assignee
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar initials={emp.avatar} size={32} />
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
                  {emp.name}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "#888780" }}>
                  {emp.dept}
                </p>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
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
              <div
                key={k}
                style={{
                  padding: "10px 12px",
                  background: "var(--color-background-secondary,#F8F7F4)",
                  borderRadius: 8,
                }}
              >
                <p style={{ margin: 0, fontSize: 11, color: "#888780" }}>{k}</p>
                <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 500 }}>
                  {v}
                </p>
              </div>
            ))}
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#888780",
                  margin: "0 0 6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Description
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-primary,#2C2C2A)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {task.description}
              </p>
            </div>
          )}

          {/* Progress */}
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#888780",
                margin: "0 0 8px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Progress — {progress}%
            </p>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => updateProgress(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: progressColor(progress) }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "#B4B2A9",
                marginTop: 2,
              }}
            >
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Activity */}
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#888780",
                margin: "0 0 10px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Activity
            </p>
            <div style={{ position: "relative", paddingLeft: 20 }}>
              <div
                style={{
                  position: "absolute",
                  left: 7,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: "var(--color-border-tertiary,#e0ddd6)",
                }}
              />
              {ACTIVITY_FEED.map((a, i) => (
                <div key={i} style={{ position: "relative", marginBottom: 12 }}>
                  <div
                    style={{
                      position: "absolute",
                      left: -17,
                      top: 3,
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#B4B2A9",
                      border: "2px solid var(--color-background-primary,#fff)",
                    }}
                  />
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: "var(--color-text-primary,#2C2C2A)",
                    }}
                  >
                    {a.text}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "#888780" }}>
                    {a.date}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#888780",
                margin: "0 0 10px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Comments ({task.comments.length})
            </p>
            {task.comments.map((c) => (
              <div
                key={c.id}
                style={{ display: "flex", gap: 8, marginBottom: 12 }}
              >
                <Avatar initials={c.avatar} size={28} />
                <div
                  style={{
                    flex: 1,
                    background: "var(--color-background-secondary,#F8F7F4)",
                    borderRadius: 8,
                    padding: "8px 12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 500 }}>
                      {c.author}
                    </span>
                    <span style={{ fontSize: 11, color: "#888780" }}>
                      {c.date}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5 }}>
                    {c.text}
                  </p>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addComment()}
                placeholder="Add a comment..."
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
                  fontSize: 12,
                  background: "var(--color-background-primary,#fff)",
                  color: "var(--color-text-primary,#2C2C2A)",
                  outline: "none",
                }}
              />
              <button
                onClick={addComment}
                style={{
                  padding: "8px 12px",
                  background: "#185FA5",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                }}
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

// ─── Kanban Board ─────────────────────────────────────────────────────────────
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

  const colColors = {
    Pending: "#888780",
    "In Progress": "#185FA5",
    Review: "#854F0B",
    Completed: "#3B6D11",
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 12,
        padding: "4px 0",
      }}
    >
      {cols.map((col) => (
        <div
          key={col.title}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (draggedId && col.title !== "Review")
              onStatusChange(draggedId, col.title);
            setDraggedId(null);
          }}
          style={{
            background: "var(--color-background-secondary,#F8F7F4)",
            borderRadius: 10,
            padding: 12,
            minHeight: 300,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: colColors[col.title],
              }}
            >
              {col.title}
            </span>
            <span
              style={{
                fontSize: 11,
                background: "var(--color-background-primary,#fff)",
                padding: "1px 7px",
                borderRadius: 10,
                color: "#888780",
                border: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
              }}
            >
              {col.tasks.length}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {col.tasks.map((task) => {
              const emp = getEmployee(task.assignedTo);
              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDraggedId(task.id)}
                  onClick={() => onTaskClick(task)}
                  style={{
                    background: "var(--color-background-primary,#fff)",
                    border: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
                    borderRadius: 8,
                    padding: 10,
                    cursor: "grab",
                    transition: "box-shadow 0.15s",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 6px",
                      fontSize: 12,
                      fontWeight: 500,
                      lineHeight: 1.4,
                    }}
                  >
                    {task.title}
                  </p>
                  <div style={{ marginBottom: 6 }}>
                    <ProgressBar value={task.progress} />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Badge
                      label={task.priority}
                      meta={PRIORITY_META[task.priority]}
                    />
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Avatar initials={emp.avatar} size={20} />
                      <span style={{ fontSize: 10, color: "#888780" }}>
                        {formatDate(task.dueDate).split(",")[0]}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {col.tasks.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px 0",
                  color: "#B4B2A9",
                  fontSize: 12,
                  border: "1px dashed var(--color-border-tertiary,#e0ddd6)",
                  borderRadius: 8,
                }}
              >
                Drop tasks here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Analytics View ───────────────────────────────────────────────────────────
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
        }}
      >
        {[
          ["Completion Rate", `${completionRate}%`, "#3B6D11"],
          ["Avg. Progress", `${avgProgress}%`, "#185FA5"],
          [
            "Overdue Rate",
            `${Math.round((tasks.filter((t) => t.status === "Overdue").length / tasks.length) * 100)}%`,
            "#A32D2D",
          ],
          [
            "Active Tasks",
            tasks.filter((t) => t.status === "In Progress").length,
            "#854F0B",
          ],
        ].map(([label, value, color]) => (
          <div
            key={label}
            style={{
              background: "var(--color-background-primary,#fff)",
              border: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
              borderRadius: 10,
              padding: "12px 14px",
            }}
          >
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "#888780" }}>
              {label}
            </p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 500, color }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Tasks by Department */}
        <div
          style={{
            background: "var(--color-background-primary,#fff)",
            border: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
            borderRadius: 10,
            padding: "14px 16px",
          }}
        >
          <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 500 }}>
            Tasks by department
          </p>
          {byDept.slice(0, 6).map(([dept, count]) => (
            <div key={dept} style={{ marginBottom: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-secondary,#5F5E5A)",
                  }}
                >
                  {dept}
                </span>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{count}</span>
              </div>
              <div
                style={{
                  height: 5,
                  background: "#E8E6E0",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(count / maxDept) * 100}%`,
                    height: "100%",
                    background: "#185FA5",
                    borderRadius: 3,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Status breakdown */}
        <div
          style={{
            background: "var(--color-background-primary,#fff)",
            border: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
            borderRadius: 10,
            padding: "14px 16px",
          }}
        >
          <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 500 }}>
            Status breakdown
          </p>
          {/* Simple donut via SVG */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
                fill="var(--color-text-primary,#2C2C2A)"
              >
                {total}
              </text>
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {byStatus.map(([status, count]) => (
                <div
                  key={status}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: statusColors[status] || "#888780",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 11, color: "#5F5E5A" }}>
                    {status}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      marginLeft: "auto",
                    }}
                  >
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly trend placeholder */}
      <div
        style={{
          background: "var(--color-background-primary,#fff)",
          border: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
          borderRadius: 10,
          padding: "14px 16px",
        }}
      >
        <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 500 }}>
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
              stroke="var(--color-border-tertiary,#e0ddd6)"
              strokeWidth="0.5"
            />
          ))}
          {[
            [0, 65],
            [87, 50],
            [174, 75],
            [261, 40],
            [348, 80],
            [435, 60],
            [520, 85],
          ].reduce((acc, [x, y], i, arr) => {
            if (i === 0) return `M${x},${100 - y}`;
            return acc + ` L${x},${100 - y}`;
          }, "")}
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
              fill="var(--color-text-secondary,#888780)"
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

// ─── Main Task Monitoring Module ──────────────────────────────────────────────
export default function TaskMonitoringModule() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [view, setView] = useState("table"); // table | kanban | analytics
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

  // Stats
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

  // Filtered + sorted tasks
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

  const updateTask = useCallback(
    (updated) => {
      setTasks((ts) => ts.map((t) => (t.id === updated.id ? updated : t)));
      if (selectedTask?.id === updated.id) setSelectedTask(updated);
    },
    [selectedTask],
  );

  const createTask = (task) => {
    setTasks((ts) => [task, ...ts]);
    setShowCreate(false);
  };

  const changeStatus = (id, status) => {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const toggleRow = (id) =>
    setSelectedRows((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  const allSelected =
    pageData.length > 0 && pageData.every((t) => selectedRows.includes(t.id));
  const toggleAll = () =>
    setSelectedRows(allSelected ? [] : pageData.map((t) => t.id));

  const thStyle = (field) => ({
    padding: "10px 12px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 500,
    color: "#888780",
    borderBottom: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    background:
      sortField === field
        ? "var(--color-background-secondary,#F8F7F4)"
        : "transparent",
  });

  const tdStyle = {
    padding: "10px 12px",
    fontSize: 12,
    color: "var(--color-text-primary,#2C2C2A)",
    borderBottom: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
    verticalAlign: "middle",
  };

  const SortIndicator = ({ field }) =>
    sortField === field ? (
      <span style={{ marginLeft: 3 }}>{sortDir === "asc" ? "↑" : "↓"}</span>
    ) : (
      <span style={{ marginLeft: 3, opacity: 0.3 }}>↕</span>
    );

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "var(--color-background-tertiary,#f4f4f4)",
        minHeight: "100vh",
        color: "var(--color-text-primary,#2C2C2A)",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "var(--color-background-primary,#fff)",
          borderBottom: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
          padding: "0 24px",
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 12,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginRight: 8,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              background: "#185FA5",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
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
          <span style={{ fontWeight: 500, fontSize: 14, whiteSpace: "nowrap" }}>
            Task Monitoring
          </span>
        </div>

        <div style={{ flex: 1, position: "relative", maxWidth: 360 }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#B4B2A9"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
            }}
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
            style={{
              width: "100%",
              paddingLeft: 32,
              paddingRight: 10,
              height: 34,
              borderRadius: 6,
              border: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
              fontSize: 13,
              background: "var(--color-background-secondary,#F8F7F4)",
              color: "var(--color-text-primary,#2C2C2A)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginLeft: "auto",
          }}
        >
          <button
            onClick={() => setShowCreate(true)}
            style={{
              padding: "7px 14px",
              background: "#185FA5",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
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
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotifs((s) => !s)}
              style={{
                width: 34,
                height: 34,
                border: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
                background: "none",
                borderRadius: 6,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 6,
                  height: 6,
                  background: "#A32D2D",
                  borderRadius: "50%",
                }}
              />
            </button>
            {showNotifs && (
              <NotificationsPanel
                tasks={tasks}
                onClose={() => setShowNotifs(false)}
              />
            )}
          </div>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 6,
              background: "#E6F1FB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 500, color: "#185FA5" }}>
              HR
            </span>
          </div>
        </div>
      </header>

      <main style={{ padding: "20px 24px", maxWidth: 1400, margin: "0 auto" }}>
        {/* Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
            marginBottom: 20,
          }}
        >
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

        {/* View Switcher + Filters */}
        <div
          style={{
            background: "var(--color-background-primary,#fff)",
            border: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 16,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 2,
              background: "var(--color-background-secondary,#F8F7F4)",
              borderRadius: 6,
              padding: 2,
            }}
          >
            {[
              ["table", "Table"],
              ["kanban", "Kanban"],
              ["analytics", "Analytics"],
            ].map(([v, label]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 5,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: view === v ? 500 : 400,
                  background:
                    view === v
                      ? "var(--color-background-primary,#fff)"
                      : "transparent",
                  color:
                    view === v
                      ? "var(--color-text-primary,#2C2C2A)"
                      : "#888780",
                  boxShadow:
                    view === v ? "0 0.5px 2px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginLeft: "auto",
            }}
          >
            {[
              [
                "filterPriority",
                filterPriority,
                setFilterPriority,
                ["Low", "Medium", "High", "Critical"],
                "Priority",
              ],
              [
                "filterStatus",
                filterStatus,
                setFilterStatus,
                ["Pending", "In Progress", "Completed", "Overdue", "Cancelled"],
                "Status",
              ],
              [
                "filterDept",
                filterDept,
                setFilterDept,
                DEPARTMENTS,
                "Department",
              ],
            ].map(([key, val, setter, opts, placeholder]) => (
              <select
                key={key}
                value={val}
                onChange={(e) => {
                  setter(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: "5px 8px",
                  borderRadius: 6,
                  border: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
                  fontSize: 12,
                  background: val
                    ? "#E6F1FB"
                    : "var(--color-background-primary,#fff)",
                  color: val ? "#185FA5" : "#888780",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="">{placeholder}: All</option>
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
                style={{
                  padding: "5px 10px",
                  borderRadius: 6,
                  border: "0.5px solid #F09595",
                  background: "#FCEBEB",
                  color: "#A32D2D",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedRows.length > 0 && (
          <div
            style={{
              background: "#E6F1FB",
              border: "0.5px solid #B5D4F4",
              borderRadius: 8,
              padding: "8px 14px",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 12,
              color: "#185FA5",
            }}
          >
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
              style={{
                padding: "4px 10px",
                borderRadius: 5,
                border: "none",
                background: "#185FA5",
                color: "#fff",
                cursor: "pointer",
                fontSize: 11,
              }}
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
              style={{
                padding: "4px 10px",
                borderRadius: 5,
                border: "none",
                background: "#FCEBEB",
                color: "#A32D2D",
                cursor: "pointer",
                fontSize: 11,
              }}
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedRows([])}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "#185FA5",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Table View */}
        {view === "table" && (
          <div
            style={{
              background: "var(--color-background-primary,#fff)",
              border: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 900,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "var(--color-background-secondary,#F8F7F4)",
                    }}
                  >
                    <th style={{ ...thStyle(), width: 36, cursor: "default" }}>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        style={{ cursor: "pointer" }}
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
                        style={thStyle(field)}
                        onClick={() => handleSort(field)}
                      >
                        {label}
                        <SortIndicator field={field} />
                      </th>
                    ))}
                    <th style={{ ...thStyle(), cursor: "default" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.length === 0 && (
                    <tr>
                      <td
                        colSpan={10}
                        style={{
                          textAlign: "center",
                          padding: "32px",
                          color: "#888780",
                          fontSize: 13,
                        }}
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
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedTask(task)}
                      >
                        <td
                          style={tdStyle}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(task.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(task.id)}
                            onChange={() => toggleRow(task.id)}
                            style={{ cursor: "pointer" }}
                          />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            fontSize: 11,
                            color: "#888780",
                            fontFamily: "monospace",
                          }}
                        >
                          {task.id}
                        </td>
                        <td style={{ ...tdStyle, maxWidth: 200 }}>
                          <span style={{ fontWeight: 500, fontSize: 12 }}>
                            {task.title}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Avatar initials={emp.avatar} size={24} />
                            <span
                              style={{ fontSize: 12, whiteSpace: "nowrap" }}
                            >
                              {emp.name}
                            </span>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontSize: 12, color: "#5F5E5A" }}>
                            {task.dept}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <Badge
                            label={task.priority}
                            meta={PRIORITY_META[task.priority]}
                          />
                        </td>
                        <td style={tdStyle}>
                          <Badge
                            label={task.status}
                            meta={STATUS_META[task.status]}
                          />
                        </td>
                        <td style={{ ...tdStyle, minWidth: 120 }}>
                          <ProgressBar value={task.progress} />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            whiteSpace: "nowrap",
                            fontSize: 12,
                            color:
                              task.status === "Overdue"
                                ? "#A32D2D"
                                : "var(--color-text-primary,#2C2C2A)",
                          }}
                        >
                          {formatDate(task.dueDate)}
                        </td>
                        <td
                          style={tdStyle}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              onClick={() => setSelectedTask(task)}
                              title="View details"
                              style={{
                                padding: "4px 8px",
                                border:
                                  "0.5px solid var(--color-border-tertiary,#e0ddd6)",
                                background: "none",
                                borderRadius: 5,
                                cursor: "pointer",
                                fontSize: 11,
                                color: "#185FA5",
                              }}
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
                              title="Toggle complete"
                              style={{
                                padding: "4px 8px",
                                border:
                                  "0.5px solid var(--color-border-tertiary,#e0ddd6)",
                                background: "none",
                                borderRadius: 5,
                                cursor: "pointer",
                                fontSize: 11,
                                color: "#3B6D11",
                              }}
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
            <div
              style={{
                padding: "12px 16px",
                borderTop: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 12, color: "#888780" }}>
                Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
                –{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length} tasks
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 5,
                    border: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
                    background: "none",
                    cursor: page === 1 ? "default" : "pointer",
                    fontSize: 12,
                    opacity: page === 1 ? 0.4 : 1,
                  }}
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 5,
                        border:
                          "0.5px solid var(--color-border-tertiary,#e0ddd6)",
                        background: page === p ? "#185FA5" : "none",
                        color:
                          page === p
                            ? "#fff"
                            : "var(--color-text-primary,#2C2C2A)",
                        cursor: "pointer",
                        fontSize: 12,
                        minWidth: 32,
                      }}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 5,
                    border: "0.5px solid var(--color-border-tertiary,#e0ddd6)",
                    background: "none",
                    cursor: page === totalPages ? "default" : "pointer",
                    fontSize: 12,
                    opacity: page === totalPages ? 0.4 : 1,
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Kanban View */}
        {view === "kanban" && (
          <KanbanBoard
            tasks={filtered}
            onTaskClick={setSelectedTask}
            onStatusChange={changeStatus}
          />
        )}

        {/* Analytics View */}
        {view === "analytics" && (
          <AnalyticsView tasks={filtered.length ? filtered : tasks} />
        )}
      </main>

      {/* Modals / Drawers */}
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
