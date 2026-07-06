import { useState } from "react";
import { Pencil, Check } from "lucide-react";
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
import { PRIORITY_CONFIG } from "../constants";

export function EditModal({ ann, onClose, onSave }) {
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
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
        </div>

        <DialogFooter className="gap-3 sm:gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1 gap-2" onClick={save}>
            <Check size={15} /> Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
