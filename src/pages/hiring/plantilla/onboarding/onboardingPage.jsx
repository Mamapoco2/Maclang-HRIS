import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  IconUserPlus,
  IconClipboardList,
  IconCheck,
  IconClock,
  IconLoader2,
  IconTrash,
  IconPlus,
  IconPencil,
  IconX,
} from "@tabler/icons-react";
import {
  getOnboardingSummary,
  getOnboardings,
  updateOnboarding,
  deleteOnboarding,
  toggleTask,
  addTask,
  updateTask,
  deleteTask,
} from "@/services/plantillaOnboardingService";
import { getEcho } from "@/lib/echo";
import { toast } from "sonner";

const STATUS_VARIANT = {
  Completed: "default",
  "In Progress": "secondary",
  Pending: "outline",
};

const TYPE_STYLE = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  PROMOTION: "bg-amber-50 text-amber-700 border-amber-200",
};

const getErrorMessage = (err, fallback) =>
  (
    err?.response?.data?.errors?.status?.[0] ??
    err?.response?.data?.message ??
    fallback
  ).toUpperCase();

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date)) return value;
  return date
    .toLocaleString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
};

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const EMPTY_CONFIRM = {
  open: false,
  title: "",
  description: "",
  variant: "default",
  onConfirm: null,
};

export default function OnboardingPage() {
  const [search, setSearch] = useState("");
  const [onboardings, setOnboardings] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showTasks, setShowTasks] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [addingTask, setAddingTask] = useState(false);

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [savingTaskId, setSavingTaskId] = useState(null);

  const [editingRowId, setEditingRowId] = useState(null);
  const [editingRow, setEditingRow] = useState({});
  const [savingRowId, setSavingRowId] = useState(null);

  const [confirm, setConfirm] = useState(EMPTY_CONFIRM);

  const selectedRef = useRef(null);
  selectedRef.current = selected;

  const openConfirm = ({
    title,
    description,
    variant = "default",
    onConfirm,
  }) => {
    setConfirm({ open: true, title, description, variant, onConfirm });
  };

  const closeConfirm = () => setConfirm(EMPTY_CONFIRM);

  useEffect(() => {
    loadAll();

    const echo = getEcho();
    const channel = echo.private("plantilla-onboardings");

    channel.listen(".onboarding.updated", (e) => {
      const updated = e.onboarding;

      setOnboardings((prev) => {
        const exists = prev.some((o) => o.id === updated.id);
        if (exists) {
          return prev.map((o) => (o.id === updated.id ? updated : o));
        }
        return [updated, ...prev];
      });

      if (selectedRef.current?.id === updated.id) {
        setSelected(updated);
      }

      getOnboardingSummary().then(setSummary);
    });

    channel.listen(".onboarding.deleted", (e) => {
      setOnboardings((prev) => prev.filter((o) => o.id !== e.id));

      if (selectedRef.current?.id === e.id) {
        setShowTasks(false);
        setSelected(null);
        toast.info("THIS ONBOARDING RECORD WAS DELETED BY ANOTHER USER.");
      }

      getOnboardingSummary().then(setSummary);
    });

    return () => {
      echo.leave("plantilla-onboardings");
    };
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [listRes, summaryRes] = await Promise.all([
      getOnboardings({ per_page: 500 }),
      getOnboardingSummary(),
    ]);
    setOnboardings(listRes.data ?? []);
    setSummary(summaryRes);
    setLoading(false);
  };

  const filtered = onboardings.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Onboarding CRUD ──────────────────────────────────────────────────────

  const handleDelete = (emp) => {
    openConfirm({
      title: "DELETE ONBOARDING RECORD?",
      description: `This will permanently delete the onboarding record of ${emp.name.toUpperCase()}. This action cannot be undone.`,
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteOnboarding(emp.id);
          toast.success("ONBOARDING RECORD DELETED.");
          await loadAll();
        } catch {
          toast.error("FAILED TO DELETE.");
        }
      },
    });
  };

  const handleStatusChange = (emp, status) => {
    const labels = {
      "In Progress": {
        title: "START ONBOARDING?",
        description: `Mark ${emp.name.toUpperCase()}'s onboarding as In Progress?`,
      },
      Completed: {
        title: "MARK AS COMPLETED?",
        description: `Mark ${emp.name.toUpperCase()}'s onboarding as completed? This will update the employee record in Employee Management.`,
      },
    };

    const { title, description } = labels[status];

    openConfirm({
      title,
      description,
      onConfirm: async () => {
        try {
          const updated = await updateOnboarding(emp.id, { status });
          setOnboardings((prev) =>
            prev.map((o) => (o.id === emp.id ? updated : o)),
          );
          toast.success(`STATUS UPDATED TO ${status.toUpperCase()}.`);
        } catch (err) {
          toast.error(getErrorMessage(err, "FAILED TO UPDATE STATUS."));
        }
      },
    });
  };

  // ── Row inline edit ──────────────────────────────────────────────────────

  const handleStartEditRow = (emp) => {
    setEditingRowId(emp.id);
    setEditingRow({
      name: emp.name ?? "",
      position: emp.position ?? "",
      department: emp.department ?? "",
      start_date: toDateTimeLocal(emp.start_date),
    });
  };

  const handleCancelEditRow = () => {
    setEditingRowId(null);
    setEditingRow({});
  };

  const handleSaveEditRow = async (id) => {
    setSavingRowId(id);
    try {
      const payload = {
        name: editingRow.name.trim().toUpperCase(),
        position: editingRow.position.trim().toUpperCase() || null,
        department: editingRow.department.trim().toUpperCase() || null,
        start_date: editingRow.start_date
          ? new Date(editingRow.start_date).toISOString()
          : null,
      };
      const updated = await updateOnboarding(id, payload);
      setOnboardings((prev) => prev.map((o) => (o.id === id ? updated : o)));
      setEditingRowId(null);
      setEditingRow({});
      toast.success("RECORD UPDATED.");
    } catch {
      toast.error("FAILED TO UPDATE.");
    } finally {
      setSavingRowId(null);
    }
  };

  // ── Task handlers ────────────────────────────────────────────────────────

  const handleToggleTask = (task) => {
    const isCompleting = !task.completed;

    if (!isCompleting) {
      openConfirm({
        title: "UNCHECK THIS TASK?",
        description: `Mark "${task.title.toUpperCase()}" as incomplete?${
          selected.status === "Completed"
            ? " This will also reset the onboarding status and clear the completion date."
            : ""
        }`,
        variant: "destructive",
        onConfirm: async () => {
          try {
            const updated = await toggleTask(selected.id, task.id);
            setSelected(updated);
            setOnboardings((prev) =>
              prev.map((o) => (o.id === updated.id ? updated : o)),
            );
          } catch (err) {
            toast.error(getErrorMessage(err, "FAILED TO UPDATE TASK."));
          }
        },
      });
    } else {
      (async () => {
        try {
          const updated = await toggleTask(selected.id, task.id);
          setSelected(updated);
          setOnboardings((prev) =>
            prev.map((o) => (o.id === updated.id ? updated : o)),
          );
          if (updated.provisioned_at) {
            toast.success(
              "ALL REQUIREMENTS COMPLETE. EMPLOYEE RECORD HAS BEEN UPDATED.",
            );
          }
        } catch (err) {
          toast.error(getErrorMessage(err, "FAILED TO UPDATE TASK."));
        }
      })();
    }
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    setAddingTask(true);
    try {
      const updated = await addTask(selected.id, newTask.trim().toUpperCase());
      setSelected(updated);
      setOnboardings((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o)),
      );
      setNewTask("");
      toast.success("TASK ADDED.");
    } catch (err) {
      toast.error(getErrorMessage(err, "FAILED TO ADD TASK."));
    } finally {
      setAddingTask(false);
    }
  };

  const handleStartEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const handleCancelEditTask = () => {
    setEditingTaskId(null);
    setEditingTitle("");
  };

  const handleSaveEditTask = (taskId) => {
    if (!editingTitle.trim()) return;

    openConfirm({
      title: "UPDATE TASK?",
      description: `Rename this task to "${editingTitle.trim().toUpperCase()}"?`,
      onConfirm: async () => {
        setSavingTaskId(taskId);
        try {
          const updated = await updateTask(
            selected.id,
            taskId,
            editingTitle.trim().toUpperCase(),
          );
          setSelected(updated);
          setOnboardings((prev) =>
            prev.map((o) => (o.id === updated.id ? updated : o)),
          );
          setEditingTaskId(null);
          setEditingTitle("");
          toast.success("TASK UPDATED.");
        } catch (err) {
          toast.error(getErrorMessage(err, "FAILED TO UPDATE TASK."));
        } finally {
          setSavingTaskId(null);
        }
      },
    });
  };

  const handleDeleteTask = (task) => {
    openConfirm({
      title: "DELETE TASK?",
      description: `Delete "${task.title.toUpperCase()}" from the onboarding checklist? This cannot be undone.`,
      variant: "destructive",
      onConfirm: async () => {
        try {
          const updated = await deleteTask(selected.id, task.id);
          setSelected(updated);
          setOnboardings((prev) =>
            prev.map((o) => (o.id === updated.id ? updated : o)),
          );
          toast.success("TASK DELETED.");
        } catch (err) {
          toast.error(getErrorMessage(err, "FAILED TO DELETE TASK."));
        }
      },
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          PSB ONBOARDING
        </h1>
        <p className="text-muted-foreground">
          TRACK THE ONBOARDING REQUIREMENTS OF COMPLETED PSB APPLICATIONS.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mt-4">
        {[
          {
            title: "TOTAL",
            value: summary.new_hires ?? 0,
            icon: <IconUserPlus size={18} />,
            desc: "TOTAL ONBOARDING RECORDS",
          },
          {
            title: "IN PROGRESS",
            value: summary.in_progress ?? 0,
            icon: <IconClipboardList size={18} />,
            desc: "ONBOARDING CURRENTLY ONGOING",
          },
          {
            title: "COMPLETED",
            value: summary.completed ?? 0,
            icon: <IconCheck size={18} />,
            desc: "EMPLOYEE RECORDS UPDATED",
          },
          {
            title: "PENDING TASKS",
            value: summary.pending_tasks ?? 0,
            icon: <IconClock size={18} />,
            desc: "TASKS AWAITING COMPLETION",
          },
        ].map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6">
        <Input
          placeholder="SEARCH EMPLOYEE..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>ONBOARDING LIST</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <IconLoader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>EMPLOYEE</TableHead>
                  <TableHead>POSITION</TableHead>
                  <TableHead>DEPARTMENT</TableHead>
                  <TableHead>START DATE & TIME</TableHead>
                  <TableHead>TYPE</TableHead>
                  <TableHead>PROGRESS</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead className="text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-14 text-center text-sm text-gray-400"
                    >
                      NO ONBOARDING RECORDS FOUND.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((emp) =>
                    editingRowId === emp.id ? (
                      <TableRow key={emp.id} className="bg-blue-50">
                        <TableCell>
                          <Input
                            autoFocus
                            value={editingRow.name}
                            onChange={(e) =>
                              setEditingRow({
                                ...editingRow,
                                name: e.target.value.toUpperCase(),
                              })
                            }
                            className="h-7 text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editingRow.position}
                            onChange={(e) =>
                              setEditingRow({
                                ...editingRow,
                                position: e.target.value.toUpperCase(),
                              })
                            }
                            className="h-7 text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editingRow.department}
                            onChange={(e) =>
                              setEditingRow({
                                ...editingRow,
                                department: e.target.value.toUpperCase(),
                              })
                            }
                            className="h-7 text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="datetime-local"
                            value={editingRow.start_date}
                            onChange={(e) =>
                              setEditingRow({
                                ...editingRow,
                                start_date: e.target.value,
                              })
                            }
                            className="h-7 text-xs"
                          />
                        </TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell />
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEditRow(emp.id)}
                              disabled={savingRowId === emp.id}
                              className="h-7 px-2"
                            >
                              {savingRowId === emp.id ? (
                                <IconLoader2
                                  size={12}
                                  className="animate-spin"
                                />
                              ) : (
                                <IconCheck size={12} />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEditRow}
                              className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                            >
                              <IconX size={12} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">
                          {(emp.name ?? "").toUpperCase()}
                        </TableCell>
                        <TableCell>
                          {(emp.position ?? "").toUpperCase()}
                        </TableCell>
                        <TableCell>
                          {(emp.department ?? "").toUpperCase()}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {emp.status === "Completed" ? (
                            <div className="text-emerald-600 font-medium flex items-center gap-1">
                              <IconCheck size={10} />
                              {formatDateTime(emp.start_date)}
                            </div>
                          ) : (
                            <div>{formatDateTime(emp.start_date)}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium border ${TYPE_STYLE[emp.type] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}
                          >
                            {emp.type ?? "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${emp.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {emp.progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={STATUS_VARIANT[emp.status] ?? "outline"}
                          >
                            {(emp.status ?? "").toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelected(emp);
                              setShowTasks(true);
                              setEditingTaskId(null);
                            }}
                          >
                            VIEW
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(emp, "Completed")}
                            disabled={
                              emp.status === "Completed" || emp.progress < 100
                            }
                          >
                            COMPLETE
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEditRow(emp)}
                            className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <IconPencil size={13} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(emp)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 w-7 h-7 p-0"
                          >
                            <IconTrash size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ),
                  )
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Tasks Dialog ────────────────────────────────────────────────── */}
      <Dialog
        open={showTasks}
        onOpenChange={(open) => {
          setShowTasks(open);
          if (!open) {
            setEditingTaskId(null);
            setEditingTitle("");
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {(selected?.name ?? "").toUpperCase()} — ONBOARDING TASKS
            </DialogTitle>
            {selected?.type && (
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {selected.type} {"\u2022"}{" "}
                {selected.provisioned_at
                  ? "EMPLOYEE RECORD UPDATED"
                  : "EMPLOYEE RECORD UPDATES WHEN ALL REQUIREMENTS ARE CHECKED"}
              </p>
            )}
          </DialogHeader>

          <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
            {selected?.tasks?.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                NO TASKS YET.
              </p>
            ) : (
              selected?.tasks?.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {editingTaskId === task.id ? (
                    <div className="flex items-center gap-2 px-3 py-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        disabled
                        className="w-4 h-4 accent-blue-600 opacity-40 cursor-not-allowed shrink-0"
                      />
                      <Input
                        autoFocus
                        value={editingTitle}
                        onChange={(e) =>
                          setEditingTitle(e.target.value.toUpperCase())
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEditTask(task.id);
                          if (e.key === "Escape") handleCancelEditTask();
                        }}
                        className="h-7 text-sm flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveEditTask(task.id)}
                        disabled={
                          savingTaskId === task.id || !editingTitle.trim()
                        }
                        className="h-7 px-2"
                      >
                        {savingTaskId === task.id ? (
                          <IconLoader2 size={12} className="animate-spin" />
                        ) : (
                          <IconCheck size={12} />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEditTask}
                        className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                      >
                        <IconX size={12} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 px-3 py-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        disabled={!!selected.provisioned_at}
                        onChange={() => handleToggleTask(task)}
                        className="w-4 h-4 accent-blue-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-sm uppercase block ${task.completed ? "line-through text-gray-400" : "text-gray-700"}`}
                        >
                          {task.title}
                        </span>
                        {task.completed && task.completed_at && (
                          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                            <IconCheck size={10} />
                            COMPLETED {formatDateTime(task.completed_at)}
                          </span>
                        )}
                      </div>
                      <div
                        className={`flex items-center gap-1 shrink-0 ${selected.provisioned_at ? "hidden" : ""}`}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEditTask(task)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <IconPencil size={11} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTask(task)}
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <IconTrash size={11} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div
            className={`flex gap-2 pt-2 border-t ${selected?.provisioned_at ? "hidden" : ""}`}
          >
            <Input
              placeholder="ADD A TASK..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              className="h-8 text-sm"
            />
            <Button
              size="sm"
              onClick={handleAddTask}
              disabled={addingTask || !newTask.trim()}
              className="h-8 px-3"
            >
              {addingTask ? (
                <IconLoader2 size={13} className="animate-spin" />
              ) : (
                <IconPlus size={13} />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Shared Confirmation AlertDialog ─────────────────────────────── */}
      <AlertDialog
        open={confirm.open}
        onOpenChange={(open) => !open && closeConfirm()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeConfirm}>CANCEL</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                confirm.onConfirm?.();
                closeConfirm();
              }}
              className={
                confirm.variant === "destructive"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : ""
              }
            >
              CONFIRM
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
