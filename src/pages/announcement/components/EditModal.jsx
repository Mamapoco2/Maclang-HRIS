import { useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Check,
  Briefcase,
  AlertCircle,
  Search,
  X,
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
import { PRIORITY_CONFIG } from "../constants";
import { plantillaPostingService } from "@/services/plantillaPostingService";

const CATEGORIES = ["General", "Job Posting"];

function getInitialPostingIds(ann) {
  return (ann.plantillaPostings ?? []).map((p) => String(p.id));
}

export function EditModal({ ann, onClose, onSave }) {
  const [title, setTitle] = useState(ann.title);
  const [description, setDescription] = useState(ann.description);
  const [priority, setPriority] = useState(ann.priority);
  const [category, setCategory] = useState(ann.category ?? "General");
  const [plantillaPostingIds, setPlantillaPostingIds] = useState(
    getInitialPostingIds(ann),
  );
  const [postings, setPostings] = useState([]);
  const [postingsError, setPostingsError] = useState(false);
  const [postingsLoading, setPostingsLoading] = useState(false);
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
    if (category === "Job Posting" && plantillaPostingIds.length === 0) {
      e.postings = "Select at least one posting to link.";
    }
    return e;
  }

  async function save() {
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
    if (category === "Job Posting") {
      plantillaPostingIds.forEach((id) => {
        formData.append("plantilla_posting_ids[]", id);
      });
    }

    setSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !submitting && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Pencil size={15} className="text-amber-600" />
            </div>
            Edit Announcement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((p) => ({ ...p, title: "" }));
              }}
              className={errors.title ? "border-red-400 bg-red-50" : ""}
              disabled={submitting}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-description">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="edit-description"
              rows={5}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((p) => ({ ...p, description: "" }));
              }}
              className={errors.description ? "border-red-400 bg-red-50" : ""}
              disabled={submitting}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={submitting}
              >
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
                  onChange={(updater) => {
                    setPlantillaPostingIds(updater);
                    setErrors((p) => ({ ...p, postings: "" }));
                  }}
                  loading={postingsLoading}
                  disabled={submitting}
                />
                {postingsError && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle size={11} /> Couldn't load postings.
                  </p>
                )}
                {errors.postings && (
                  <p className="text-xs text-red-500">{errors.postings}</p>
                )}
              </div>
            )}
          </div>

          {category === "Job Posting" && plantillaPostingIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {plantillaPostingIds.map((id) => {
                const fromFetched = postings.find(
                  (x) => String(x.id) === String(id),
                );
                const fromAnn = (ann.plantillaPostings ?? []).find(
                  (x) => String(x.id) === String(id),
                );
                const label =
                  fromFetched?.title ??
                  fromFetched?.position_title ??
                  fromAnn?.title ??
                  id;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700"
                  >
                    <Briefcase size={11} />
                    {label}
                    <button
                      type="button"
                      disabled={submitting}
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
                  disabled={submitting}
                  onClick={() => setPriority(key)}
                  className={`flex-1 text-xs font-medium ${priority === key ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm` : "text-slate-500"}`}
                >
                  {cfg.label}
                </Button>
              ))}
            </div>
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
          <Button className="flex-1 gap-2" onClick={save} disabled={submitting}>
            <Check size={15} /> {submitting ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PostingMultiSelect({
  postings,
  selectedIds,
  onChange,
  loading,
  disabled,
}) {
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
          disabled={loading || disabled}
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
