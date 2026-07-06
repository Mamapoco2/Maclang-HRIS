import { useState } from "react";
import { FilePlus, X, Upload, Megaphone } from "lucide-react";
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
import { PRIORITY_CONFIG, FILE_CONFIG, CURRENT_USER } from "../constants";

export function CreateModal({ onClose, onCreate }) {
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
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
              placeholder="What is this announcement about?"
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
              placeholder="Write the full announcement here…"
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
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1 gap-2" onClick={publish}>
            <Megaphone size={15} /> Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
