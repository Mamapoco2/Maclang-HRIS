import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar } from "./Avatar";
import { authorColor } from "../utils";
import { AnnouncementsApi } from "@/services/announcements";

export function ViewerAvatarStack({ announcementId, total }) {
  const [showModal, setShowModal] = useState(false);
  const [viewers, setViewers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    AnnouncementsApi.viewers(announcementId)
      .then((data) => {
        if (!cancelled) setViewers(data.viewers);
      })
      .catch(() => {
        if (!cancelled) {
          setViewers([]);
          setLoadError(true);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [announcementId]);

  function open() {
    setShowModal(true);
  }

  const shown = (viewers ?? []).slice(0, 4);

  return (
    <>
      <button
        onClick={open}
        className="flex items-center gap-2 group"
        title="See who viewed this"
      >
        <div className="flex items-center">
          {shown.map((v, i) => (
            <div
              key={v.id}
              className="relative"
              style={{
                marginLeft: i === 0 ? 0 : "-8px",
                zIndex: shown.length - i,
              }}
            >
              <div className="ring-2 ring-white rounded-full transition-transform group-hover:scale-110">
                <Avatar
                  initials={v.initials}
                  size="sm"
                  colorClass={authorColor(v.id)}
                  src={v.avatar_url}
                />
              </div>
            </div>
          ))}
        </div>
        <span className="text-xs text-slate-400 tabular-nums group-hover:text-slate-600 transition-colors">
          {total.toLocaleString()} views
        </span>
      </button>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm p-0 overflow-hidden">
          <DialogHeader className="px-5 py-4 border-b border-slate-100">
            <DialogTitle className="text-sm font-bold text-slate-800">
              Viewed by
            </DialogTitle>
            <p className="text-xs text-slate-400">
              {total.toLocaleString()} total views
            </p>
          </DialogHeader>
          <div className="overflow-y-auto max-h-72 divide-y divide-slate-50">
            {loading && (
              <div className="px-5 py-4 text-xs text-slate-400">Loading…</div>
            )}
            {!loading && loadError && (viewers ?? []).length === 0 && (
              <div className="px-5 py-4 text-xs text-red-500">
                Couldn't load viewers.
              </div>
            )}
            {!loading && !loadError && (viewers ?? []).length === 0 && (
              <div className="px-5 py-4 text-xs text-slate-400">
                No views yet.
              </div>
            )}
            {!loading &&
              (viewers ?? []).map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50"
                >
                  <Avatar
                    initials={v.initials}
                    size="md"
                    colorClass={authorColor(v.id)}
                    src={v.avatar_url}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {v.name}
                  </span>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
