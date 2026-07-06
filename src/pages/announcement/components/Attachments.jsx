import { Eye, Download, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FILE_CONFIG } from "../constants";

export function AttachmentCard({ file, onPreview, onDownload, downloadCount }) {
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
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-500 hover:text-slate-700"
          title="Preview"
          onClick={() => onPreview(file)}
        >
          <Eye size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-500 hover:text-blue-600 hover:bg-blue-100"
          title="Download"
          onClick={() => onDownload(file)}
        >
          <Download size={14} />
        </Button>
      </div>
      {downloadCount > 0 && (
        <span className="text-xs text-slate-400 tabular-nums flex-shrink-0">
          {downloadCount}
        </span>
      )}
    </div>
  );
}

export function PreviewModal({ file, onClose }) {
  const isImage = file ? ["jpg", "png", "gif", "webp"].includes(file.type) : false;
  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
        {file && (
          <>
            <DialogHeader className="px-5 py-4 border-b border-slate-100">
              <DialogTitle className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                <Paperclip size={16} className="text-slate-400" />
                {file.name}
                <span className="text-xs font-normal text-slate-400">
                  {file.size}
                </span>
              </DialogTitle>
            </DialogHeader>
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
                  <p className="text-slate-600 font-medium">
                    Preview unavailable
                  </p>
                  <p className="text-slate-400 text-sm">
                    Download the file to view it on your device.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
