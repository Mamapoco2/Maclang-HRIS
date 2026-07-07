// CreateModal.jsx
import { useEffect, useMemo, useState } from "react";
import {
  FilePlus,
  X,
  Upload,
  Megaphone,
  AlertCircle,
  Briefcase,
  Search,
  Check,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PRIORITY_CONFIG, FILE_CONFIG } from "../constants";
import { plantillaPostingService } from "@/services/plantillaPostingService";

const CATEGORIES = ["General", "Job Posting"];
const ACCEPTED = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png";
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export function CreateModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [category, setCategory] = useState("General");
  const [plantillaPostingIds, setPlantillaPostingIds] = useState([]);
  const [postings, setPostings] = useState([]);
  const [postingsError, setPostingsError] = useState(false);
  const [postingsLoading, setPostingsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (category !== "Job Posting") return;

    let cancelled = false;
    setPostingsLoading(true);
    setPostingsError(false);

    plantillaPostingService
      .getPostings({ status: "open" })
      .then((res) => {
        if (cancelled) return;
        setPostings(res.data ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setPostings([]);
        setPostingsError(true);
      })
      .finally(() => {
        if (!cancelled) setPostingsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category]);

  function validate() {
    const e = {};
    if (!title.trim()) e.title = "Title is required.";
    if (!description.trim()) e.description = "Description is required.";
    const oversized = files.find((f) => f.file.size > MAX_FILE_BYTES);
    if (oversized) e.files = `${oversized.name} exceeds the 10 MB limit.`;
    return e;
  }

  function addFiles(raw) {
    const picked = Array.from(raw).map((f) => ({
      id: `nf_${Date.now()}_${Math.random()}`,
      file: f,
      name: f.name,
      type: f.name.split(".").pop().toLowerCase(),
      size:
        f.size < 1048576
          ? `${(f.size / 1024).toFixed(0)} KB`
          : `${(f.size / 1048576).toFixed(1)} MB`,
    }));
    setFiles((prev) => [...prev, ...picked]);
  }

  async function publish() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("priority", priority);
    formData.append("category", category);
    if (category === "Job Posting" && plantillaPostingIds.length) {
      plantillaPostingIds.forEach((id) => {
        formData.append("plantilla_posting_ids[]", id);
      });
    }
    files.forEach((f) => formData.append("attachments[]", f.file));

    setSubmitting(true);
    try {
      await onCreate(formData);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !submitting && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FilePlus size={16} className="text-blue-600" />
            </div>
            New Announcement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="create-title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="create-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((p) => ({ ...p, title: "" }));
              }}
              className={errors.title ? "border-red-400 bg-red-50" : ""}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="create-description">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="create-description"
              rows={5}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((p) => ({ ...p, description: "" }));
              }}
              className={errors.description ? "border-red-400 bg-red-50" : ""}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {category === "Job Posting" && (
              <div className="space-y-1.5">
                <Label>Linked Postings</Label>
                <PostingMultiSelect
                  postings={postings}
                  selectedIds={plantillaPostingIds}
                  onChange={setPlantillaPostingIds}
                  loading={postingsLoading}
                />
                {postingsError && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle size={11} /> Couldn't load postings — you can
                    still publish without linking one.
                  </p>
                )}
                {!postingsLoading &&
                  !postingsError &&
                  postings.length === 0 && (
                    <p className="text-xs text-slate-400">
                      No open postings right now.
                    </p>
                  )}
              </div>
            )}
          </div>

          {category === "Job Posting" && plantillaPostingIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {plantillaPostingIds.map((id) => {
                const p = postings.find((x) => String(x.id) === String(id));
                const label = p?.title ?? p?.position_title ?? id;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700"
                  >
                    <Briefcase size={11} />
                    {label}
                    <button
                      type="button"
                      onClick={() =>
                        setPlantillaPostingIds((prev) =>
                          prev.filter((x) => x !== id),
                        )
                      }
                      className="h-4 w-4 rounded-full hover:bg-blue-200 flex items-center justify-center"
                    >
                      <X size={10} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Priority</Label>
            <div className="flex gap-2">
              {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                <Button
                  key={key}
                  type="button"
                  variant="outline"
                  onClick={() => setPriority(key)}
                  className={`flex-1 text-xs font-medium ${priority === key ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm` : "text-slate-500"}`}
                >
                  {cfg.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Attachments</Label>
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
                PDF, DOC(X), XLS(X), PPT(X), JPG, PNG — max 10 MB each
              </p>
              <input
                type="file"
                className="hidden"
                multiple
                onChange={(e) => addFiles(e.target.files)}
                accept={ACCEPTED}
              />
            </label>
            {errors.files && (
              <p className="text-xs text-red-500">{errors.files}</p>
            )}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400"
                        onClick={() =>
                          setFiles((p) => p.filter((x) => x.id !== f.id))
                        }
                      >
                        <X size={13} />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={publish}
            disabled={submitting}
          >
            <Megaphone size={15} /> {submitting ? "Publishing…" : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Searchable checkbox multi-select for linking one announcement to several
// open plantilla postings at once. Built with Popover + Checkbox (already
// used elsewhere in this app) rather than a combobox lib, to avoid a new
// dependency.
function PostingMultiSelect({ postings, selectedIds, onChange, loading }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return postings;
    return postings.filter((p) =>
      (p.title ?? p.position_title ?? "").toLowerCase().includes(q),
    );
  }, [postings, search]);

  function toggle(id) {
    const key = String(id);
    onChange((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key],
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between font-normal"
          disabled={loading}
        >
          <span className="truncate text-left">
            {loading
              ? "Loading…"
              : selectedIds.length === 0
                ? "Select postings"
                : `${selectedIds.length} posting${selectedIds.length === 1 ? "" : "s"} selected`}
          </span>
          <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
        <div className="p-2 border-b border-slate-100 relative">
          <Search
            size={13}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="Search postings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-2 space-y-0.5">
          {filtered.length === 0 ? (
            <p className="text-xs text-slate-400 px-2 py-3 text-center">
              No postings match.
            </p>
          ) : (
            filtered.map((p) => {
              const id = String(p.id);
              const checked = selectedIds.includes(id);
              return (
                <label
                  key={id}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggle(id)}
                  />
                  <span className="text-sm text-slate-700 truncate flex-1">
                    {p.title ?? p.position_title}
                  </span>
                  {checked && (
                    <Check size={13} className="text-blue-600 flex-shrink-0" />
                  )}
                </label>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
