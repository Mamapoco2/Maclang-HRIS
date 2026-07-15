import { useState, useEffect } from "react";
import { Bug, Lightbulb, Loader2, AlertTriangle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { createReport } from "@/services/bugService";
import authService from "@/services/authService";

// ─── Constants ────────────────────────────────────────────────────────────────

const BUG_KEYWORDS = [
  "bug",
  "error",
  "crash",
  "broken",
  "issue",
  "failed",
  "failure",
  "exception",
  "not working",
  "stuck",
  "loading",
  "incorrect",
];

const IMPROVEMENT_KEYWORDS = [
  "feature",
  "improve",
  "improvement",
  "enhancement",
  "suggestion",
  "request",
  "better",
  "add",
  "upgrade",
  "optimize",
  "optimization",
];

const SEVERITY_OPTIONS = [
  { value: "critical", label: "Critical", color: "text-red-600" },
  { value: "high", label: "High", color: "text-orange-500" },
  { value: "medium", label: "Medium", color: "text-yellow-500" },
  { value: "low", label: "Low", color: "text-blue-500" },
];

const CATEGORY_OPTIONS = [
  "UI / UX",
  "Authentication",
  "Performance",
  "Dashboard",
  "API",
  "Mobile",
  "Notifications",
  "Billing",
  "Other",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countKeywordMatches(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0);
}

function classifyText(text) {
  if (!text.trim()) return { type: null, confidence: 0 };
  const bugCount = countKeywordMatches(text, BUG_KEYWORDS);
  const impCount = countKeywordMatches(text, IMPROVEMENT_KEYWORDS);
  const total = bugCount + impCount;
  if (total === 0) return { type: null, confidence: 0 };
  if (bugCount >= impCount) {
    return {
      type: "bug",
      confidence: Math.min(
        100,
        Math.round((bugCount / total) * 100 + bugCount * 4),
      ),
    };
  }
  return {
    type: "improvement",
    confidence: Math.min(
      100,
      Math.round((impCount / total) * 100 + impCount * 4),
    ),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ClassificationBadge({ type }) {
  if (!type) return null;
  if (type === "bug") {
    return (
      <Badge
        variant="destructive"
        className="flex items-center gap-1 text-xs font-medium"
      >
        <Bug className="w-3 h-3" />
        Bug Report
      </Badge>
    );
  }
  return (
    <Badge className="flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
      <Lightbulb className="w-3 h-3" />
      Improvement Request
    </Badge>
  );
}

function ConfidenceBar({ type, confidence }) {
  if (!type || confidence === 0) return null;
  const color = type === "bug" ? "bg-red-500" : "bg-blue-500";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Classification confidence</span>
        <span className="font-semibold text-foreground">{confidence}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  );
}

function GuidanceCard({ type }) {
  if (!type) return null;
  const isBug = type === "bug";
  return (
    <div
      className={`rounded-lg border p-3 text-sm ${isBug ? "border-red-200 bg-red-50/60" : "border-blue-200 bg-blue-50/60"}`}
    >
      <div
        className={`flex items-center gap-2 font-medium mb-1.5 ${isBug ? "text-red-700" : "text-blue-700"}`}
      >
        {isBug ? (
          <Bug className="w-4 h-4" />
        ) : (
          <Lightbulb className="w-4 h-4" />
        )}
        {isBug ? "Bug Report Tips" : "Improvement Suggestion Tips"}
      </div>
      <ul
        className={`space-y-0.5 list-disc list-inside ${isBug ? "text-red-600" : "text-blue-600"}`}
      >
        {isBug ? (
          <>
            <li>Include steps to reproduce the issue</li>
            <li>Explain the expected vs. actual behavior</li>
            <li>Attach screenshots if available</li>
          </>
        ) : (
          <>
            <li>Describe the problem this improvement solves</li>
            <li>Explain the expected benefits</li>
            <li>Include examples or references if possible</li>
          </>
        )}
      </ul>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReportIssueModal({ open, onOpenChange }) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [overrideMode, setOverrideMode] = useState("auto");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  const autoClassification = classifyText(`${subject} ${description}`);
  const effectiveType =
    overrideMode === "auto"
      ? autoClassification.type
      : overrideMode === "bug"
        ? "bug"
        : overrideMode === "improvement"
          ? "improvement"
          : null;

  const errors = {
    subject: !subject.trim() ? "Subject is required." : null,
    description: !description.trim()
      ? "Description is required."
      : description.trim().length < 20
        ? "Description must be at least 20 characters."
        : null,
    category: !category ? "Category is required." : null,
  };
  const isFormValid =
    !errors.subject && !errors.description && !errors.category;

  useEffect(() => {
    if (!open) {
      setSubject("");
      setDescription("");
      setCategory("");
      setSeverity("");
      setOverrideMode("auto");
      setTouched({});
    }
  }, [open]);

  const handleSubmit = async () => {
    setTouched({ subject: true, description: true, category: true });
    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      const currentUser = authService.getCurrentUser();
      const submitted_by = currentUser?.given_name
        ? `${currentUser.given_name} ${currentUser.last_name}`.trim()
        : (currentUser?.username ?? "Unknown");

      await createReport({
        subject,
        description,
        category,
        type: effectiveType ?? "bug",
        severity: effectiveType === "bug" && severity ? severity : null,
      });

      // Notify ReportsModule (or any other listener) to refetch
      window.dispatchEvent(new CustomEvent("report:created"));

      toast.success("Report submitted successfully.", {
        description: "Thank you for helping improve the platform.",
      });
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = (name) => ({
    onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
              <Bug className="w-4 h-4 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Report an Issue
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Help us improve by reporting bugs or suggesting enhancements.
          </DialogDescription>
        </DialogHeader>

        <fieldset disabled={isSubmitting} className="px-6 py-5 space-y-5">
          {/* ── Auto-classification panel ── */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm font-medium">Report Type</span>
              <ClassificationBadge type={effectiveType} />
            </div>

            {overrideMode === "auto" && (
              <ConfidenceBar
                type={autoClassification.type}
                confidence={autoClassification.confidence}
              />
            )}

            <RadioGroup
              value={overrideMode}
              onValueChange={setOverrideMode}
              className="flex flex-wrap gap-4"
            >
              {[
                { value: "auto", label: "Auto Detect" },
                { value: "bug", label: "Bug Report" },
                { value: "improvement", label: "Improvement Request" },
              ].map(({ value, label }) => (
                <div key={value} className="flex items-center gap-1.5">
                  <RadioGroupItem value={value} id={`mode-${value}`} />
                  <Label
                    htmlFor={`mode-${value}`}
                    className="text-sm cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* ── Subject ── */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="subject" className="text-sm font-medium">
                Subject <span className="text-red-500">*</span>
              </Label>
              <span className="text-xs text-muted-foreground">
                {subject.length}/150
              </span>
            </div>
            <Input
              id="subject"
              maxLength={150}
              placeholder="Brief summary of the issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              aria-invalid={touched.subject && !!errors.subject}
              aria-describedby={
                touched.subject && errors.subject ? "subject-error" : undefined
              }
              {...field("subject")}
            />
            {touched.subject && errors.subject && (
              <p id="subject-error" className="text-xs text-red-500">
                {errors.subject}
              </p>
            )}
          </div>

          {/* ── Description ── */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </Label>
              <span
                className={`text-xs ${description.length < 20 && description.length > 0 ? "text-red-400" : "text-muted-foreground"}`}
              >
                {description.length} chars{" "}
                {description.length < 20
                  ? `(${20 - description.length} more needed)`
                  : ""}
              </span>
            </div>
            <Textarea
              id="description"
              rows={4}
              placeholder="Describe the issue, expected behavior, reproduction steps, or your improvement suggestion."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-invalid={touched.description && !!errors.description}
              aria-describedby={
                touched.description && errors.description
                  ? "desc-error"
                  : undefined
              }
              className="resize-none"
              {...field("description")}
            />
            {touched.description && errors.description && (
              <p id="desc-error" className="text-xs text-red-500">
                {errors.description}
              </p>
            )}
          </div>

          {/* ── Guidance card ── */}
          <GuidanceCard type={effectiveType} />

          {/* ── Category + Severity row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-sm font-medium">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={setCategory}
                onOpenChange={() =>
                  setTouched((t) => ({ ...t, category: true }))
                }
              >
                <SelectTrigger
                  id="category"
                  aria-invalid={touched.category && !!errors.category}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {touched.category && errors.category && (
                <p className="text-xs text-red-500">{errors.category}</p>
              )}
            </div>

            {effectiveType === "bug" && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="severity"
                  className="flex items-center gap-1 text-sm font-medium"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                  Severity
                </Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger id="severity">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_OPTIONS.map(({ value, label, color }) => (
                      <SelectItem key={value} value={value}>
                        <span className={color}>{label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </fieldset>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t px-6 py-4 gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
